// Copie de lib/terrain.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
/**
 * Le terrain sous une ligne : son relief, tiré du RGE ALTI de l'IGN (scripts/relief.mjs), et les grands
 * cours d'eau qu'elle franchit. Ce module ne dépend d'aucun navigateur : la fonction serveur de la
 * communauté l'utilise pour recalculer le coût d'une ligne publiée.
 */
import type { ModeLigne } from './types.ts'

/** La grille d'altitudes d'un réseau, telle que scripts/relief.mjs l'écrit. */
export interface ReliefBrut {
  origine: [number, number]
  pas: [number, number]
  taille: [number, number]
  /** Altitudes en mètres, entiers de 16 bits, encodés en base 64. */
  z: string
}

export interface Terrain {
  origine: [number, number]
  pas: [number, number]
  taille: [number, number]
  z: Int16Array
  /** Les grands cours d'eau, en lignes [lon, lat]. */
  fleuves: [number, number][][]
}

// atob existe dans les navigateurs, dans Node et dans Deno, où tourne la fonction serveur.
const decoder64 = (texte: string) => Uint8Array.from(atob(texte), (c) => c.charCodeAt(0))

/**
 * Les cours d'eau assez larges pour demander un vrai pont (plus de 80 m environ). Les petites rivières, comme
 * l'Huveaune ou le Paillon, souvent couvert, se franchissent sans ouvrage notable.
 */
const GRANDS_COURS_D_EAU = new Set(['rhone', 'saone', 'garonne', 'seine', 'marne', "l'oise", 'var', 'durance'])

/** Les grands cours d'eau du fond de carte, en lignes [lon, lat]. */
export function fleuvesDe(fond: { features: { properties: { kind: string; name?: string }; geometry: { coordinates: number[][][] } }[] }) {
  return fond.features
    .filter((f) => f.properties.kind === 'fleuve' && GRANDS_COURS_D_EAU.has(f.properties.name ?? ''))
    .flatMap((f) => f.geometry.coordinates as [number, number][][])
}

export function preparerTerrain(relief: ReliefBrut, fleuves: [number, number][][]): Terrain {
  const octets = decoder64(relief.z)
  const z = new Int16Array(octets.buffer, octets.byteOffset, octets.byteLength / 2)
  return { origine: relief.origine, pas: relief.pas, taille: relief.taille, z, fleuves }
}

/** L'altitude d'un point, interpolée entre les quatre mesures voisines ; hors de la grille, la plus proche. */
export function altitude(t: Terrain, lon: number, lat: number): number {
  const [nx, ny] = t.taille
  const fx = Math.min(nx - 1.001, Math.max(0, (lon - t.origine[0]) / t.pas[0]))
  const fy = Math.min(ny - 1.001, Math.max(0, (lat - t.origine[1]) / t.pas[1]))
  const i = Math.floor(fx)
  const j = Math.floor(fy)
  const a = fx - i
  const b = fy - j
  const g = (x: number, y: number) => t.z[y * nx + x]!
  return (1 - a) * (1 - b) * g(i, j) + a * (1 - b) * g(i + 1, j) + (1 - a) * b * g(i, j + 1) + a * b * g(i + 1, j + 1)
}

/** La pente maximale que chaque mode peut suivre sans ouvrage, en mètres par mètre. */
// Tram : 6 %. Le référentiel du Cerema (2018) admet 8 % par exception, mais les directives des tramways de
// Genève recommandent 3 %, fixent 4 % en site propre et n'admettent 5 à 6 % que sur de courtes rampes : au-delà
// de 6 % sur une longue distance, on passe en tunnel ou en tranchée. Métro : 4 %, la pente courante du métro sur
// fer (5 % seulement par exception sur la ligne 15 du Grand Paris) ; le métro sur pneus monte plus raide (8 % pour
// le VAL), mais les données de coût se calent aussi bien à 4 qu'à 6 %. Bus : aucune limite publiée, 10 % est
// notre estimation. Le téléphérique ne craint pas la pente.
export const PENTE_MAX: Record<ModeLigne, number> = { tram: 0.06, bus: 0.1, metro: 0.04, cable: Infinity }

/** Pas d'échantillonnage du profil en long, en mètres. */
const PAS_PROFIL = 25
/** Écart au terrain au-delà duquel la voie ne suit plus le sol : tranchée couverte, tunnel ou viaduc. */
export const ECART_OUVRAGE = 6
/** Couverture minimale au-dessus d'un tunnel de métro, en mètres. */
const COUVERTURE = 12
/** Au-delà de cette profondeur, un tunnel de métro demande des puits d'accès et de secours plus hauts, en roche. */
export const TUNNEL_PROFOND = 30
/**
 * Réglages du calage (scripts/caler-couts.ts) : la longueur de la rampe d'accès, en mètres, ajoutée à chaque
 * entrée d'un tunnel de tram ou de bus pour descendre sous le sol.
 */
export const REGLAGES = { rampe: 250 }

/** Un point du profil en long : distance depuis le départ, terrain et voie, en mètres. */
export interface PointProfil {
  s: number
  z: number
  voie: number
}

export interface Relief {
  /**
   * Longueur, en km, où un tram ou un bus ne peut pas suivre le terrain, ou où le tunnel d'un métro passe
   * à plus de 30 m sous le sol.
   */
  kmOuvrage: number
  /** Profondeur de chaque station sous le sol, en mètres : un tram ou un bus en tunnel a des stations souterraines. */
  profondeurs: number[]
  /** Plus forte montée ou descente du terrain sur 200 m, en pourcentage. */
  penteTerrain: number
  /** Dénivelé entre le point le plus bas et le plus haut de la ligne, en mètres. */
  denivele: number
  /** Le profil en long, allégé pour être dessiné. */
  profil: PointProfil[]
  /** Le terrain et la voie à chaque station. */
  stations: PointProfil[]
}

/**
 * Le profil en long d'une ligne et ce qu'il demande. On cherche la voie la plus haute qui reste sous le
 * terrain en respectant la pente maximale du mode : pour le tram et le bus, les endroits où elle passe à plus
 * de quelques mètres sous le sol demandent une tranchée ou un tunnel ; pour le métro, la voie passe sous le terrain, et une station sous
 * une colline se retrouve plus profonde.
 */
export function relief(t: Terrain, mode: ModeLigne, arrets: [number, number][], mx: number): Relief {
  const MY = 111320
  const points: { s: number; z: number; station: boolean }[] = []
  let s = 0
  for (let k = 0; k < arrets.length; k += 1) {
    const a = arrets[k]!
    if (k > 0) {
      const p = arrets[k - 1]!
      const d = Math.hypot((a[0] - p[0]) * mx, (a[1] - p[1]) * MY)
      const n = Math.max(1, Math.ceil(d / PAS_PROFIL))
      for (let q = 1; q < n; q += 1) {
        const f = q / n
        points.push({ s: s + d * f, z: altitude(t, p[0] + (a[0] - p[0]) * f, p[1] + (a[1] - p[1]) * f), station: false })
      }
      s += d
    }
    points.push({ s, z: altitude(t, a[0], a[1]), station: true })
  }
  const zs = points.map((p) => p.z)
  const denivele = zs.length ? Math.max(...zs) - Math.min(...zs) : 0
  // La plus forte pente du terrain, mesurée sur 200 m pour ne pas compter un simple talus.
  let penteTerrain = 0
  for (let i = 0, j = 0; i < points.length; i += 1) {
    while (j < points.length - 1 && points[j]!.s - points[i]!.s < 200) j += 1
    const d = points[j]!.s - points[i]!.s
    if (d >= 150) penteTerrain = Math.max(penteTerrain, Math.abs(points[j]!.z - points[i]!.z) / d)
  }
  const g = PENTE_MAX[mode]
  // La voie de pente g la plus haute qui reste sous le terrain.
  const dessous = zs.slice()
  for (let i = 1; i < points.length; i += 1) {
    const d = points[i]!.s - points[i - 1]!.s
    dessous[i] = Math.min(dessous[i]!, dessous[i - 1]! + g * d)
  }
  for (let i = points.length - 2; i >= 0; i -= 1) {
    const d = points[i + 1]!.s - points[i]!.s
    dessous[i] = Math.min(dessous[i]!, dessous[i + 1]! + g * d)
  }
  const enOuvrage: boolean[] = []
  const profondeurs: number[] = []
  const voies: number[] = []
  const stations: PointProfil[] = []
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i]!
    // Le tram et le bus suivent le terrain tant que leur pente le permet, et passent dessous, en tranchée ou en
    // tunnel, quand il monte trop vite : la voie la plus haute qui reste sous le sol. Le tunnel du métro passe
    // au plus près de la surface que sa pente permet ; le câble passe au-dessus.
    const voie = mode === 'metro' ? dessous[i]! - COUVERTURE : mode === 'cable' ? p.z : dessous[i]!
    voies.push(voie)
    if (p.station) profondeurs.push(p.z - voie)
    enOuvrage.push(mode === 'metro' ? p.z - voie > TUNNEL_PROFOND : mode !== 'cable' && p.z - voie > ECART_OUVRAGE)
    if (p.station) stations.push({ s: p.s, z: p.z, voie })
  }
  // Un tunnel de tram ou de bus commence et finit par une rampe, là où la voie descend sous le sol.
  if (mode === 'tram' || mode === 'bus') {
    const coeur = enOuvrage.slice()
    for (let i = 0; i < points.length; i += 1) {
      if (!coeur[i]) continue
      for (let k = i - 1; k >= 0 && points[i]!.s - points[k]!.s <= REGLAGES.rampe; k -= 1) enOuvrage[k] = true
      for (let k = i + 1; k < points.length && points[k]!.s - points[i]!.s <= REGLAGES.rampe; k += 1) enOuvrage[k] = true
    }
  }
  let kmOuvrage = 0
  for (let i = 1; i < points.length; i += 1) if (enOuvrage[i]) kmOuvrage += (points[i]!.s - points[i - 1]!.s) / 1000
  // Un point tous les 50 m environ suffit pour dessiner le profil, en gardant les stations.
  const pas = Math.max(1, Math.round(points.length / 200))
  const profil = points
    .map((p, i) => ({ s: p.s, z: p.z, voie: voies[i]!, garder: p.station || i % pas === 0 }))
    .filter((p) => p.garder)
    .map(({ s, z, voie }) => ({ s, z, voie }))
  return { kmOuvrage, profondeurs, penteTerrain: Math.round(penteTerrain * 1000) / 10, denivele: Math.round(denivele), profil, stations }
}

function secantes(a: [number, number], b: [number, number], c: [number, number], d: [number, number]) {
  const o = (p: [number, number], q: [number, number], r: [number, number]) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0
}

/** Combien de fois la ligne traverse un grand cours d'eau. */
export function franchissements(t: Terrain, arrets: [number, number][]): number {
  let n = 0
  for (let k = 1; k < arrets.length; k += 1) {
    const a = arrets[k - 1]!
    const b = arrets[k]!
    for (const fleuve of t.fleuves) {
      for (let q = 1; q < fleuve.length; q += 1) if (secantes(a, b, fleuve[q - 1]!, fleuve[q]!)) n += 1
    }
  }
  return n
}
