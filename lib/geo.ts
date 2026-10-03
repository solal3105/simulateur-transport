import type { Feature, MultiLineString, Polygon } from 'geojson'

import { estBoucle, metresParDegre, traceFerme } from './modele'

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

/**
 * Des points répartis le long de la plus longue partie d'un tracé, aux fractions de sa longueur demandées : les places
 * possibles de son étiquette, quand le milieu est déjà pris par celle d'un autre projet.
 */
export function pointsLeLong(geometry: MultiLineString, fractions: number[]): [number, number][] {
  const longueur = (l: number[][]) => {
    let t = 0
    for (let i = 1; i < l.length; i += 1) t += Math.hypot((l[i]![0]! - l[i - 1]![0]!) * MX, (l[i]![1]! - l[i - 1]![1]!) * MY)
    return t
  }
  const partie = geometry.coordinates.reduce<number[][]>((a, b) => (longueur(b) > longueur(a) ? b : a), geometry.coordinates[0] ?? [])
  const total = longueur(partie)
  if (!partie.length || total === 0) return [milieu(geometry)]
  return fractions.map((f) => {
    let parcouru = 0
    for (let i = 1; i < partie.length; i += 1) {
      const a = partie[i - 1]!
      const b = partie[i]!
      const pas = Math.hypot((b[0]! - a[0]!) * MX, (b[1]! - a[1]!) * MY)
      if (parcouru + pas >= total * f) {
        const r = pas === 0 ? 0 : (total * f - parcouru) / pas
        return [a[0]! + (b[0]! - a[0]!) * r, a[1]! + (b[1]! - a[1]!) * r]
      }
      parcouru += pas
    }
    const fin = partie.at(-1)!
    return [fin[0]!, fin[1]!]
  })
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

/** L'écart visé entre deux points d'une courbe dessinée, en mètres : assez fin pour qu'on ne voie aucun angle. */
const PAS_COURBE = 20

/**
 * Une courbe lisse qui passe par chacun des points d'un tracé, au lieu d'une ligne brisée. En chaque point, la ligne
 * prend la direction qui partage l'angle entre le segment d'avant et celui d'après, puis s'arrondit jusqu'au point
 * suivant (courbe d'Hermite, dont l'élan vaut la longueur du segment). Entre deux stations à 800 m l'une de l'autre, un
 * angle droit devient un virage d'environ 250 m de rayon, un angle de 45° un virage de 500 m. Les stations restent sur
 * la ligne, et avec elles les correspondances.
 */
export function lisser(points: [number, number][], latitude: number, boucle = false): [number, number][] {
  const mx = metresParDegre(latitude)
  // Deux points confondus ne donnent aucune direction : on n'en garde qu'un.
  const p = points
    .map(([lon, lat]) => [lon * mx, lat * MY] as const)
    .filter((q, i, l) => i === 0 || Math.hypot(q[0] - l[i - 1]![0], q[1] - l[i - 1]![1]) > 0.5)
  const n = p.length
  if (n < 3) return traceFerme(points, boucle)
  const rang = (i: number) => ((i % n) + n) % n
  const unite = (x: number, y: number): [number, number] => {
    const l = Math.hypot(x, y)
    return l > 1e-9 ? [x / l, y / l] : [0, 0]
  }
  const vers = (i: number, j: number) => unite(p[j]![0] - p[i]![0], p[j]![1] - p[i]![1])
  const directions = p.map((_, i): [number, number] => {
    // Une ligne ouverte part et finit dans la direction de son premier et de son dernier segment.
    if (!boucle && i === 0) return vers(0, 1)
    if (!boucle && i === n - 1) return vers(n - 2, n - 1)
    const avant = vers(rang(i - 1), i)
    const apres = vers(i, rang(i + 1))
    const milieu = unite(avant[0] + apres[0], avant[1] + apres[1])
    // Un demi-tour n'a pas de direction moyenne : la ligne garde celle d'où elle vient.
    return milieu[0] === 0 && milieu[1] === 0 ? avant : milieu
  })
  const sortie: [number, number][] = []
  const segments = boucle ? n : n - 1
  for (let i = 0; i < segments; i += 1) {
    const [a, b] = [p[i]!, p[rang(i + 1)]!]
    const [da, db] = [directions[i]!, directions[rang(i + 1)]!]
    const longueur = Math.hypot(b[0] - a[0], b[1] - a[1])
    const pas = Math.min(60, Math.max(2, Math.ceil(longueur / PAS_COURBE)))
    for (let k = 0; k < pas; k += 1) {
      const t = k / pas
      const [h00, h10, h01, h11] = [2 * t ** 3 - 3 * t ** 2 + 1, t ** 3 - 2 * t ** 2 + t, -2 * t ** 3 + 3 * t ** 2, t ** 3 - t ** 2]
      const x = h00 * a[0] + h10 * da[0] * longueur + h01 * b[0] + h11 * db[0] * longueur
      const y = h00 * a[1] + h10 * da[1] * longueur + h01 * b[1] + h11 * db[1] * longueur
      sortie.push([x / mx, y / MY])
    }
  }
  const fin = boucle ? p[0]! : p[n - 1]!
  sortie.push([fin[0] / mx, fin[1] / MY])
  return sortie
}

/**
 * Le dessin d'une ligne tracée : un métro s'arrondit comme une voie réelle, les autres modes suivent les rues en
 * segments droits. Ce n'est qu'un dessin : la longueur et le prix d'une ligne se calculent toujours sur ses points.
 */
export const dessinLigne = (mode: string, arrets: [number, number][], latitude: number, boucle?: boolean) =>
  mode === 'metro' ? lisser(arrets, latitude, estBoucle(boucle, arrets)) : traceFerme(arrets, boucle)
