// Copie de lib/modele.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import { FORMULE } from './formule.ts'
import type { Estimation, ModeLigne } from './types.ts'
import type { IdVille, Ville } from './villes.ts'

/**
 * Estimation du coût et de la fréquentation d'une ligne tracée par le joueur.
 *
 * Le coût est la longueur multipliée par un prix au kilomètre tiré de chantiers récents :
 * tramway, moyenne des T6 nord, T9 et T10 (32 à 37 M€ HT par km) ; bus à haut niveau de
 * service, ligne TB12 Part-Dieu - Sept Chemins (12 à 17) ; métro, prolongement du B à
 * Saint-Genis-Laval (157 à 163) et ligne C de Toulouse (117 à 127) ; téléphérique, Téléo à
 * Toulouse et Câble C1 à Créteil (27 à 31).
 *
 * La fréquentation suit la formule retenue par le moteur de fréquentation (scripts/modele/moteur.py,
 * docs/modele.md), écrite dans lib/formule.ts : elle a été choisie parmi des milliers d'autres, calées
 * sur plus d'une centaine de lignes de métro, de tram et de bus d'une vingtaine de villes françaises,
 * et jugées sur des lignes et des villes absentes de leur calage. Ce module ne fait que la calculer :
 * les coefficients, les distances et la constante de chaque ville viennent tous de lib/formule.ts.
 */
export const PRIX_KM: Record<ModeLigne, number> = { tram: 34, bus: 15, metro: 150, cable: 30 }
export const DUREE_CHANTIER: Record<ModeLigne, number> = { tram: 5, bus: 3, metro: 8, cable: 4 }
/** Les rues ne sont pas droites : un tracé réel est plus long que la somme des segments. */
const DETOUR: Record<ModeLigne, number> = { tram: 1.12, bus: 1.12, metro: 1.05, cable: 1 }
/** Distance en deçà de laquelle un habitant est considéré comme déjà desservi, et où se mesure la concurrence. */
const DEJA_DESSERVI = 400
/** Poids d'un emploi dans la mesure de la concurrence, comme dans le moteur. */
const POIDS_EMPLOI_CONCURRENCE = 0.3
/** Jusqu'où compte la couronne du bassin, et le bassin large. */
const COURONNE = 1000
const LARGE = 2000
/** Rayon du centre-ville, pour la part des arrêts au centre. */
const CENTRE = 1500

/** Fourchette affichée : le réel se situe dans cet intervalle pour huit lignes sur dix du calage. */
export const FOURCHETTE = FORMULE.fourchette

/** La distance autour d'un arrêt où la formule compte les habitants et les emplois. */
export const rayonBassin = (mode: ModeLigne) => (mode === 'metro' ? FORMULE.rayonMetro : FORMULE.rayonAutres)

const MY = 111320
/** Mètres par degré de longitude à une latitude donnée. */
export const metresParDegre = (latitude: number) => 111320 * Math.cos((latitude * Math.PI) / 180)
/** Distance en mètres, les longitudes comptées à la latitude de la ville. */
export const distance = (mx: number) => (a: [number, number], b: [number, number]) => Math.hypot((a[0] - b[0]) * mx, (a[1] - b[1]) * MY)

export interface Carreaux {
  /** [lon, lat, habitants, emplois, déjà desservi (0 ou 1)] */
  cellules: Float64Array[]
  index: Map<string, number[]>
  /** Mètres par degré de longitude à la latitude de la ville. */
  mx: number
  /** Constante de la formule pour la ville (lib/formule.ts). */
  constante: number
  /** Le centre de la ville, [lon, lat], d'où se mesure la distance au centre. */
  centre: [number, number]
  ville: IdVille
}

const TUILE = 500

export function preparerCarreaux(brut: number[][], arrets: number[][], ville: Pick<Ville, 'id' | 'latitude' | 'centre'>): Carreaux {
  const mx = metresParDegre(ville.latitude)
  const metres = distance(mx)
  const cle = (lon: number, lat: number) => `${Math.floor((lon * mx) / TUILE)}:${Math.floor((lat * MY) / TUILE)}`
  const indexArrets = new Map<string, [number, number][]>()
  for (const [lon, lat] of arrets) {
    const k = cle(lon!, lat!)
    const l = indexArrets.get(k) ?? []
    l.push([lon!, lat!])
    indexArrets.set(k, l)
  }
  const cellules: Float64Array[] = []
  const index = new Map<string, number[]>()
  brut.forEach(([lon, lat, pop, jobs], i) => {
    const p: [number, number] = [lon!, lat!]
    let desservi = 0
    const tx = Math.floor((lon! * mx) / TUILE)
    const ty = Math.floor((lat! * MY) / TUILE)
    for (let dx = -1; dx <= 1 && !desservi; dx += 1) {
      for (let dy = -1; dy <= 1 && !desservi; dy += 1) {
        for (const a of indexArrets.get(`${tx + dx}:${ty + dy}`) ?? []) {
          if (metres(p, a) <= DEJA_DESSERVI) {
            desservi = 1
            break
          }
        }
      }
    }
    cellules.push(Float64Array.of(lon!, lat!, pop!, jobs!, desservi))
    const k = cle(lon!, lat!)
    const l = index.get(k) ?? []
    l.push(i)
    index.set(k, l)
  })
  return { cellules, index, mx, constante: FORMULE.constantes[ville.id], centre: ville.centre, ville: ville.id }
}

export function longueurKm(arrets: [number, number][], mode: ModeLigne, mx: number) {
  const metres = distance(mx)
  let m = 0
  for (let i = 1; i < arrets.length; i += 1) m += metres(arrets[i - 1]!, arrets[i]!)
  return (m / 1000) * DETOUR[mode]
}

export function estimer(mode: ModeLigne, arrets: [number, number][], carreaux: Carreaux): Estimation {
  const { mx } = carreaux
  const metres = distance(mx)
  const km = longueurKm(arrets, mode, mx)
  const cout = Math.round(km * PRIX_KM[mode])
  const c = FORMULE.coefficients
  const r = rayonBassin(mode)
  const w = FORMULE.poidsEmplois
  // Pour chaque carreau à portée de la ligne, la distance à l'arrêt le plus proche.
  const portee = Math.max(r, FORMULE.poidsCouronne ? COURONNE : 0, DEJA_DESSERVI, c.bassinLarge ? LARGE : 0)
  const pas = Math.ceil(portee / TUILE)
  const proches = new Map<number, number>()
  for (const a of arrets) {
    const tx = Math.floor((a[0] * mx) / TUILE)
    const ty = Math.floor((a[1] * MY) / TUILE)
    for (let dx = -pas; dx <= pas; dx += 1) {
      for (let dy = -pas; dy <= pas; dy += 1) {
        for (const i of carreaux.index.get(`${tx + dx}:${ty + dy}`) ?? []) {
          const cel = carreaux.cellules[i]!
          const d = metres([cel[0]!, cel[1]!], a)
          if (d > portee) continue
          const avant = proches.get(i)
          if (avant === undefined || d < avant) proches.set(i, d)
        }
      }
    }
  }
  let habitants = 0
  let emplois = 0
  let habitantsNonDesservis = 0
  let poidsNouveau = 0
  let loin = 0
  let large = 0
  let autour = 0
  let dejaServi = 0
  for (const [i, d] of proches) {
    const cel = carreaux.cellules[i]!
    const hab = cel[2]!
    const emp = cel[3]!
    const deja = cel[4]!
    if (d <= r) {
      habitants += hab
      emplois += emp
      if (!deja) {
        habitantsNonDesservis += hab
        poidsNouveau += hab + w * emp
      }
    }
    if (d <= COURONNE) loin += hab + w * emp
    if (d <= LARGE) large += hab + w * emp
    if (d <= DEJA_DESSERVI) {
      autour += hab + POIDS_EMPLOI_CONCURRENCE * emp
      if (deja) dejaServi += hab + POIDS_EMPLOI_CONCURRENCE * emp
    }
  }
  const poids = habitants + w * emplois
  const auCentre = arrets.map((a) => metres(a, carreaux.centre))
  const variables = {
    bassin: Math.log1p(poids + FORMULE.poidsCouronne * Math.max(0, loin - poids)),
    stations: Math.log(Math.max(1, arrets.length)),
    longueur: Math.log(Math.max(0.5, km / DETOUR[mode])),
    distanceCentre: Math.log1p(Math.min(...auCentre) / 1000),
    partCentre: auCentre.filter((d) => d < CENTRE).length / Math.max(1, arrets.length),
    concurrence: autour > 0 ? dejaServi / autour : 0,
    bassinLarge: Math.log1p(large),
  }
  // À Paris, le métro compte ses voyageurs aux entrées, sans les correspondances : on estime pareil.
  let exposant = carreaux.constante + FORMULE.modes[mode] + (FORMULE.ajustements[carreaux.ville]?.[mode] ?? 0)
  for (const [nom, coefficient] of Object.entries(c) as [keyof typeof variables, number][]) exposant += coefficient * variables[nom]
  const voyageurs = arrets.length >= 2 && poids > 0 ? Math.exp(exposant) : 0
  const nouveaux = poids > 0 ? voyageurs * (poidsNouveau / poids) : 0
  return {
    km,
    cout,
    duree: DUREE_CHANTIER[mode],
    voyageurs: Math.round(voyageurs),
    bas: Math.round(voyageurs * FOURCHETTE.bas),
    haut: Math.round(voyageurs * FOURCHETTE.haut),
    nouveaux: Math.round(nouveaux),
    habitants: Math.round(habitants),
    emplois: Math.round(emplois),
    habitantsNonDesservis: Math.round(habitantsNonDesservis),
  }
}
