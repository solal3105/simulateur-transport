import { distance, metresParDegre } from './modele'

export interface Lieux {
  communes: { nom: string; anneaux: [number, number][][] }[]
  quartiers: [number, number, string][]
  arrondissements: [number, number, string][]
}

/** Au-delà de cette distance, un quartier est trop loin pour donner son nom à l'arrêt. */
const PORTEE_QUARTIER = 550

function dansAnneau(p: [number, number], anneau: [number, number][]) {
  let dedans = false
  for (let i = 0, j = anneau.length - 1; i < anneau.length; j = i, i += 1) {
    const [xi, yi] = anneau[i]!
    const [xj, yj] = anneau[j]!
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) dedans = !dedans
  }
  return dedans
}

function plusProche(p: [number, number], liste: [number, number, string][]) {
  // Les longitudes sont comptées à la latitude du point : cela vaut pour toutes les villes.
  const metres = distance(metresParDegre(p[1]))
  let meilleur: { nom: string; d: number } | null = null
  for (const [lon, lat, nom] of liste) {
    const d = metres(p, [lon, lat])
    if (!meilleur || d < meilleur.d) meilleur = { nom, d }
  }
  return meilleur
}

/** Le nom d'un arrêt : le quartier le plus proche, sinon la commune, sinon l'arrondissement de Lyon. */
export function nommerArret(p: [number, number], lieux: Lieux): string {
  const quartier = plusProche(p, lieux.quartiers)
  if (quartier && quartier.d <= PORTEE_QUARTIER) return quartier.nom
  const commune = lieux.communes.find((c) => c.anneaux.some((a) => dansAnneau(p, a)))
  if (commune?.nom === 'Lyon') return plusProche(p, lieux.arrondissements)?.nom ?? 'Lyon'
  return commune?.nom ?? quartier?.nom ?? 'Arrêt'
}

/** Les communes où se trouvent des points, dans l'ordre du tracé, chacune une fois : « Villeurbanne, Bron et Vénissieux ». */
export function communesDes(points: [number, number][], lieux: Lieux): string[] {
  const noms: string[] = []
  for (const p of points) {
    const nom = lieux.communes.find((c) => c.anneaux.some((a) => dansAnneau(p, a)))?.nom
    if (nom && !noms.includes(nom)) noms.push(nom)
  }
  return noms
}

/** Situe un point par rapport à un autre : « Est », « Nord »… */
function direction(de: [number, number], vers: [number, number]) {
  const dx = (vers[0] - de[0]) * Math.cos((de[1] * Math.PI) / 180)
  const dy = vers[1] - de[1]
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'Est' : 'Ouest'
  return dy > 0 ? 'Nord' : 'Sud'
}

/**
 * Noms de tous les arrêts d'une ligne, sans doublon. Quand deux arrêts tombent dans le même lieu,
 * le second prend un point cardinal (« Bron Est »), puis un numéro si cela ne suffit pas.
 */
export function nommerArrets(arrets: [number, number][], lieux: Lieux): string[] {
  const premiers = new Map<string, [number, number]>()
  const pris = new Set<string>()
  return arrets.map((a) => {
    const nom = nommerArret(a, lieux)
    const premier = premiers.get(nom)
    if (!premier) {
      premiers.set(nom, a)
      pris.add(nom)
      return nom
    }
    let candidat = `${nom} ${direction(premier, a)}`
    for (let i = 2; pris.has(candidat); i += 1) candidat = `${nom} ${i}`
    pris.add(candidat)
    return candidat
  })
}
