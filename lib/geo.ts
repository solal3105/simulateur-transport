import type { Feature, MultiLineString, Polygon } from 'geojson'

import { metresParDegre } from './modele'

const MY = 111320
// Les longueurs ne servent ici qu'à comparer des morceaux de tracé : la latitude de Lyon suffit.
const MX = metresParDegre(45.755)

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

/** Cercle de rayon donné en mètres, en polygone, à la latitude de la ville. */
export function cercle(centre: [number, number], rayon: number, latitude: number, cotes = 40): Feature<Polygon> {
  const mx = metresParDegre(latitude)
  const anneau: [number, number][] = []
  for (let i = 0; i <= cotes; i += 1) {
    const t = (i / cotes) * Math.PI * 2
    anneau.push([centre[0] + (Math.cos(t) * rayon) / mx, centre[1] + (Math.sin(t) * rayon) / MY])
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [anneau] } }
}

/** Carré de 200 m centré sur un point, pour la couche de densité, à la latitude de la ville. */
export function carreau(lon: number, lat: number, latitude: number): [number, number][] {
  const dx = 100 / metresParDegre(latitude)
  const dy = 100 / MY
  return [
    [lon - dx, lat - dy],
    [lon + dx, lat - dy],
    [lon + dx, lat + dy],
    [lon - dx, lat + dy],
    [lon - dx, lat - dy],
  ]
}
