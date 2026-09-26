import { nommerArrets, type Lieux } from './lieux'
import type { ModeLigne } from './types'

/**
 * Le réseau actuel, ligne par ligne, tel que scripts/lignes-osm.mjs le tire d'OpenStreetMap, avec les lignes en
 * chantier que la carte dessine déjà : de quoi montrer chaque ligne et ses stations, accrocher une nouvelle
 * station sur une correspondance, et prolonger une ligne depuis son terminus. Il ne sert pas au calcul des
 * voyageurs, qui garde ses propres données.
 */

/** Une station sur une ligne existante. */
export interface StationLigne {
  nom: string
  pos: [number, number]
  /** Pour une ligne en chantier que la carte montre déjà : quand elle ouvrira ici, « fin 2028 ». */
  ouverture?: string
}

/** Le mode d'une ligne existante : ceux du joueur, plus le RER et les trains Transilien d'Île-de-France. */
export type ModeExistant = ModeLigne | 'rer' | 'train'

export interface LigneExistante {
  /** « metro-A », « tram-T1 », « rer-B ». */
  id: string
  mode: ModeExistant
  /** Le nom court de la ligne : « A », « T1 », « 14 ». */
  ref: string
  /** « Métro A », « Tram T1 ». */
  nom: string
  /** La couleur de la ligne sur le plan du réseau, quand OpenStreetMap la connaît. */
  couleur: string | null
  /** Ses parcours, stations dans l'ordre : un seul le plus souvent, plusieurs quand la ligne a des branches. */
  branches: StationLigne[][]
  /** Ses terminus, quand le script les établit lui-même : les RER, dont OpenStreetMap coupe parfois les parcours. */
  terminus?: string[]
  /**
   * Le tracé de ses voies, pour dessiner la ligne dans sa couleur et écrire son nom le long. Les lignes en chantier
   * n'en ont pas : OpenStreetMap ne les compte pas encore comme des lignes, et le fond de carte les dessine en gris.
   */
  trace?: [number, number][][]
}

export interface ReseauActuel {
  lignes: LigneExistante[]
  /** Les gares et haltes ferroviaires du territoire, pour qu'on les repère et qu'on s'y accroche. */
  gares?: { nom: string; pos: [number, number] }[]
}

/** Seuls le métro et le tram se prolongent : le joueur ne construit ni RER ni train. */
export const prolongeable = (l: LigneExistante): l is LigneExistante & { mode: 'metro' | 'tram' } => l.mode === 'metro' || l.mode === 'tram'

/** Une station du réseau actuel, et les lignes qui s'y arrêtent. */
export interface StationExistante {
  nom: string
  pos: [number, number]
  lignes: { id: string; mode: ModeExistant; ref: string; ouverture?: string }[]
  /** Les lignes dont elle est un terminus : on peut les prolonger d'ici. */
  terminus: string[]
  /** Une gare ferroviaire, qu'elle soit desservie ou non par les lignes affichées. */
  gare?: boolean
}

const MY = 111320
const metres = (mx: number, a: [number, number], b: [number, number]) => Math.hypot((a[0] - b[0]) * mx, (a[1] - b[1]) * MY)

/** Le nom d'une station sans accents, tirets ni espaces : « Gare Part-Dieu - Villette » et « Gare Part-Dieu Villette » se retrouvent. */
const cleNom = (nom: string) =>
  nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

/** Au-delà, deux arrêts de même nom sont deux stations différentes (deux quais d'une même ville, par exemple). */
const MEME_STATION = 400
/** En deçà, deux arrêts sont la même station, même quand leurs noms s'écrivent autrement. */
const MEME_LIEU = 60

/**
 * Les terminus d'une ligne : les bouts de ses branches, sauf ceux où une autre branche passe sans s'arrêter, comme
 * le terminus d'un service partiel, et sauf la station où une ligne en boucle se referme.
 */
export function terminusDe(ligne: LigneExistante): StationLigne[] {
  if (ligne.terminus) {
    const noms = new Set(ligne.terminus.map(cleNom))
    const trouves = new Map<string, StationLigne>()
    for (const s of ligne.branches.flat()) if (noms.has(cleNom(s.nom)) && !trouves.has(cleNom(s.nom))) trouves.set(cleNom(s.nom), s)
    return [...trouves.values()]
  }
  const traversees = new Set(ligne.branches.flatMap((b) => b.slice(1, -1).map((s) => cleNom(s.nom))))
  const bouts = new Map<string, StationLigne>()
  for (const b of ligne.branches) {
    for (const s of [b[0], b.at(-1)]) {
      if (!s || (s.nom && traversees.has(cleNom(s.nom)))) continue
      bouts.set(cleNom(s.nom) || s.pos.join(','), s)
    }
  }
  return [...bouts.values()]
}

/**
 * Les stations du réseau, une par lieu : un pôle comme Bellecour, desservi par deux métros, n'apparaît
 * qu'une fois, avec ses deux lignes.
 */
export function stationsExistantes(reseau: ReseauActuel | null, mx: number): StationExistante[] {
  if (!reseau) return []
  const stations: StationExistante[] = []
  const retrouver = (s: StationLigne) =>
    stations.find((x) => {
      const d = metres(mx, x.pos, s.pos)
      return d < MEME_LIEU || (s.nom !== '' && cleNom(x.nom) === cleNom(s.nom) && d < MEME_STATION)
    })
  const cle = (s: StationLigne) => cleNom(s.nom) || s.pos.join(',')
  for (const l of reseau.lignes) {
    const bouts = new Set(terminusDe(l).map(cle))
    for (const s of l.branches.flat()) {
      let station = retrouver(s)
      if (!station) {
        station = { nom: s.nom, pos: s.pos, lignes: [], terminus: [] }
        stations.push(station)
      }
      const deja = station.lignes.find((x) => x.id === l.id)
      // Une ligne qui dessert déjà la station n'y ouvre pas plus tard.
      if (!deja) station.lignes.push({ id: l.id, mode: l.mode, ref: l.ref, ...(s.ouverture ? { ouverture: s.ouverture } : {}) })
      else if (!s.ouverture) delete deja.ouverture
      if (bouts.has(cle(s)) && !station.terminus.includes(l.id)) station.terminus.push(l.id)
      if (!station.nom && s.nom) station.nom = s.nom
    }
  }
  // Les gares : une station du même nom tout près en devient une, sinon la gare s'ajoute seule.
  for (const g of reseau.gares ?? []) {
    const station = retrouver(g)
    if (station) station.gare = true
    else stations.push({ nom: g.nom, pos: g.pos, lignes: [], terminus: [], gare: true })
  }
  return stations
}

/** « Métro C, ouverture fin 2028 » : les lignes en chantier d'une station, une par ligne de texte. */
export function direOuvertures(lignes: StationExistante['lignes']) {
  return lignes
    .filter((l) => l.ouverture)
    .map((l) => `${MOTS[l.mode].replace(/^./, (c) => c.toUpperCase())} ${l.ref}, ouverture ${l.ouverture}`)
    .join('\n')
}

/** Distance, en mètres, jusqu'à laquelle une station du joueur est en correspondance avec une station existante. */
export const ECART_CORRESPONDANCE = 150

/** La station existante la plus proche d'un point, si elle est assez proche pour une correspondance. */
export function stationProche(stations: StationExistante[], p: [number, number], mx: number, ecart = ECART_CORRESPONDANCE) {
  let meilleure: StationExistante | null = null
  let distance = ecart
  for (const s of stations) {
    const d = metres(mx, s.pos, p)
    if (d <= distance) [meilleure, distance] = [s, d]
  }
  return meilleure
}

const MOTS: Record<ModeExistant, string> = { metro: 'métro', rer: 'RER', tram: 'tram', train: 'train', cable: 'téléphérique', bus: 'bus' }

/** « métro A et D », « RER B », « tram T1 » : les lignes d'une station, dites dans une phrase. */
export function direLignes(lignes: { mode: ModeExistant; ref: string }[]) {
  const parMode = (['metro', 'rer', 'tram', 'train', 'cable'] as ModeExistant[])
    .map((mode) => ({ mode, refs: lignes.filter((l) => l.mode === mode).map((l) => l.ref) }))
    .filter((g) => g.refs.length)
  return enumerer(parMode.map((g) => `${MOTS[g.mode]} ${enumerer(g.refs)}`))
}

const enumerer = (mots: string[]) => (mots.length <= 1 ? (mots[0] ?? '') : `${mots.slice(0, -1).join(', ')} et ${mots.at(-1)}`)

/** Les correspondances d'une ligne tracée : à chacune de ses stations, les lignes existantes toutes proches. */
export function correspondances(arrets: [number, number][], estStation: boolean[], stations: StationExistante[], mx: number) {
  return arrets.flatMap((p, i) => {
    if (!estStation[i]) return []
    const s = stationProche(stations, p, mx)
    return s ? [{ rang: i, station: s }] : []
  })
}

/** La phrase des correspondances : « métro A et D à Bellecour, tram T1 à Perrache. » */
export function direCorrespondances(liste: ReturnType<typeof correspondances>) {
  if (!liste.length) return null
  return `${enumerer(liste.map((c) => `${direLignes(c.station.lignes)} à ${c.station.nom}`))}.`
}

/**
 * Les noms des points d'un tracé : une station posée sur une station existante en prend le nom, les autres
 * prennent celui de leur quartier ; un point de passage n'a pas de nom.
 */
export function nommerTrace(
  arrets: [number, number][],
  estStation: boolean[],
  lieux: Lieux,
  stations: StationExistante[],
  mx: number,
): (string | null)[] {
  const rangs = arrets.map((_, i) => i).filter((i) => estStation[i])
  const noms = nommerArrets(
    rangs.map((i) => arrets[i]!),
    lieux,
  )
  const resultat: (string | null)[] = arrets.map(() => null)
  rangs.forEach((i, k) => {
    const existante = stationProche(stations, arrets[i]!, mx, 60)
    resultat[i] = existante?.nom || noms[k]!
  })
  return resultat
}
