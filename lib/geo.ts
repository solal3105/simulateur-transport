import type { Feature, MultiLineString, Polygon } from 'geojson'

const LAT0 = 45.755
const MX = 111320 * Math.cos((LAT0 * Math.PI) / 180)
const MY = 111320

/** Point au milieu de la plus longue partie d'un tracé, pour y poser son étiquette. */
export function milieu(geometry: MultiLineString): [number, number] {
  let meilleure: number[][] = geometry.coordinates[0] ?? []
  let longueurMax = 0
  const longueur = (l: number[][]) => {
    let t = 0
    for (let i = 1; i < l.length; i += 1) t += Math.hypot((l[i]![0]! - l[i - 1]![0]!) * MX, (l[i]![1]! - l[i - 1]![1]!) * MY)
    return t
  }
  for (const part of geometry.coordinates) {
    const t = longueur(part)
    if (t > longueurMax) {
      longueurMax = t
      meilleure = part
    }
  }
  let parcouru = 0
  for (let i = 1; i < meilleure.length; i += 1) {
    const a = meilleure[i - 1]!
    const b = meilleure[i]!
    const pas = Math.hypot((b[0]! - a[0]!) * MX, (b[1]! - a[1]!) * MY)
    if (parcouru + pas >= longueurMax / 2) {
      const r = pas === 0 ? 0 : (longueurMax / 2 - parcouru) / pas
      return [a[0]! + (b[0]! - a[0]!) * r, a[1]! + (b[1]! - a[1]!) * r]
    }
    parcouru += pas
  }
  const p = meilleure[0] ?? [4.85, 45.76]
  return [p[0]!, p[1]!]
}

/** Cercle de rayon donné en mètres, en polygone. */
export function cercle(centre: [number, number], rayon: number, cotes = 40): Feature<Polygon> {
  const anneau: [number, number][] = []
  for (let i = 0; i <= cotes; i += 1) {
    const t = (i / cotes) * Math.PI * 2
    anneau.push([centre[0] + (Math.cos(t) * rayon) / MX, centre[1] + (Math.sin(t) * rayon) / MY])
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [anneau] } }
}

/** Carré de 200 m centré sur un point, pour la couche de densité. */
export function carreau(lon: number, lat: number): [number, number][] {
  const dx = 100 / MX
  const dy = 100 / MY
  return [
    [lon - dx, lat - dy],
    [lon + dx, lat - dy],
    [lon + dx, lat + dy],
    [lon - dx, lat + dy],
    [lon - dx, lat - dy],
  ]
}

export const LIEUX: { nom: string; pos: [number, number]; grand?: boolean }[] = [
  { nom: 'Lyon', pos: [4.835, 45.76], grand: true },
  { nom: 'Villeurbanne', pos: [4.88, 45.771] },
  { nom: 'Vénissieux', pos: [4.886, 45.697] },
  { nom: 'Bron', pos: [4.912, 45.738] },
  { nom: 'Vaulx-en-Velin', pos: [4.925, 45.78] },
  { nom: 'Décines', pos: [4.96, 45.769] },
  { nom: 'Caluire', pos: [4.846, 45.797] },
  { nom: 'Écully', pos: [4.777, 45.776] },
  { nom: 'Tassin', pos: [4.762, 45.762] },
  { nom: 'Oullins', pos: [4.806, 45.714] },
  { nom: 'Saint-Priest', pos: [4.944, 45.696] },
  { nom: 'Rillieux', pos: [4.899, 45.818] },
  { nom: 'Craponne', pos: [4.724, 45.745] },
  { nom: 'Meyzieu', pos: [5.004, 45.767] },
  { nom: 'Saint-Fons', pos: [4.855, 45.708] },
]
