import type { Estimation, ModeLigne } from './types'

/**
 * Estimation du coût et de la fréquentation d'une ligne tracée par le joueur.
 *
 * Le coût est la longueur multipliée par un prix au kilomètre tiré de chantiers récents :
 * tramway, moyenne des T6 nord, T9 et T10 (32 à 37 M€ HT par km) ; bus à haut niveau de
 * service, ligne TB12 Part-Dieu - Sept Chemins (12 à 17) ; métro, prolongement du B à
 * Saint-Genis-Laval (157 à 163) et ligne C de Toulouse (117 à 127) ; téléphérique, Téléo à
 * Toulouse et Câble C1 à Créteil (27 à 31).
 *
 * La fréquentation suit une formule calée sur les onze lignes de métro et de tram de Lyon
 * (fréquentation 2023, ramenée à un jour de semaine en divisant par 265) :
 *
 *   voyageurs par jour = exp(A) × (habitants + 0,3 × emplois) ^ B
 *
 * où habitants et emplois sont comptés à moins de 400 m d'un arrêt (600 m pour le métro).
 * En validation croisée, l'écart moyen est de 18 % et le pire de 39 %. La formule surestime
 * les lignes de rocade : elle donne environ 109 000 voyageurs pour le T6 complet, là où Sytral
 * Mobilités en prévoit 55 000. Les facteurs du bus et du téléphérique sont des hypothèses,
 * faute de ligne de ce type dans le calage.
 */
const A = -8.03
const B = 1.678
const POIDS_EMPLOI = 0.3

export const PRIX_KM: Record<ModeLigne, number> = { tram: 34, bus: 15, metro: 150, cable: 30 }
export const DUREE_CHANTIER: Record<ModeLigne, number> = { tram: 5, bus: 3, metro: 8, cable: 4 }
const RAYON: Record<ModeLigne, number> = { tram: 400, bus: 400, metro: 600, cable: 400 }
/** Les rues ne sont pas droites : un tracé réel est plus long que la somme des segments. */
const DETOUR: Record<ModeLigne, number> = { tram: 1.12, bus: 1.12, metro: 1.05, cable: 1 }
const FACTEUR: Record<ModeLigne, number> = { tram: 1, metro: 1, bus: 0.7, cable: 0.6 }
/** Distance en deçà de laquelle un habitant est considéré comme déjà desservi. */
const DEJA_DESSERVI = 400

/** Fourchette affichée, d'après les écarts constatés sur les lignes existantes. */
export const FOURCHETTE = { bas: 0.7, haut: 1.4 }

const LAT0 = 45.755
const MX = 111320 * Math.cos((LAT0 * Math.PI) / 180)
const MY = 111320
export const metres = (a: [number, number], b: [number, number]) =>
  Math.hypot((a[0] - b[0]) * MX, (a[1] - b[1]) * MY)

export interface Carreaux {
  /** [lon, lat, habitants, emplois, déjà desservi (0 ou 1)] */
  cellules: Float64Array[]
  index: Map<string, number[]>
}

const TUILE = 500
const cle = (lon: number, lat: number) => `${Math.floor((lon * MX) / TUILE)}:${Math.floor((lat * MY) / TUILE)}`

export function preparerCarreaux(brut: number[][], arrets: number[][]): Carreaux {
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
    const tx = Math.floor((lon! * MX) / TUILE)
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
  return { cellules, index }
}

export function longueurKm(arrets: [number, number][], mode: ModeLigne) {
  let m = 0
  for (let i = 1; i < arrets.length; i += 1) m += metres(arrets[i - 1]!, arrets[i]!)
  return (m / 1000) * DETOUR[mode]
}

export function estimer(mode: ModeLigne, arrets: [number, number][], carreaux: Carreaux): Estimation {
  const km = longueurKm(arrets, mode)
  const cout = Math.round(km * PRIX_KM[mode])
  const r = RAYON[mode]
  const pas = Math.ceil(r / TUILE)
  const vus = new Set<number>()
  let habitants = 0
  let emplois = 0
  let habitantsNonDesservis = 0
  let poidsNouveau = 0
  for (const a of arrets) {
    const tx = Math.floor((a[0] * MX) / TUILE)
    const ty = Math.floor((a[1] * MY) / TUILE)
    for (let dx = -pas; dx <= pas; dx += 1) {
      for (let dy = -pas; dy <= pas; dy += 1) {
        for (const i of carreaux.index.get(`${tx + dx}:${ty + dy}`) ?? []) {
          if (vus.has(i)) continue
          const c = carreaux.cellules[i]!
          if (metres([c[0]!, c[1]!], a) > r) continue
          vus.add(i)
          habitants += c[2]!
          emplois += c[3]!
          if (!c[4]) {
            habitantsNonDesservis += c[2]!
            poidsNouveau += c[2]! + POIDS_EMPLOI * c[3]!
          }
        }
      }
    }
  }
  const poids = habitants + POIDS_EMPLOI * emplois
  const voyageurs = arrets.length >= 2 && poids > 0 ? Math.exp(A) * poids ** B * FACTEUR[mode] : 0
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
