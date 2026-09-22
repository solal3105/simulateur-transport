/**
 * Fusionne les tracés individuels en un seul jeu de données, tagué par ouvrage,
 * et calcule pour chacun une ancre de cartouche et son emprise.
 * Lancer après toute modification des fichiers de public/geojson.
 *
 *   node scripts/build-geo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'public', 'geojson')
const target = join(root, 'public', 'data')

/** Ouvrage → fichier de tracé. Le nom du fichier ne suit pas toujours l'identifiant. */
const FILES = {
  'grande-dorsale': 'grande-dorsale.geojson',
  'metro-e-bellecour': 'metro-e-bellecour.geojson',
  'ext-a-est': 'ext-a-est.geojson',
  'ext-d': 'ext-d.geojson',
  'metro-e-part-dieu': 'metro-e-part-dieu.geojson',
  'ligne-du-nord': 'ext-b-nord.geojson',
  teol: 'teol.geojson',
  'modern-a': 'modern-a.geojson',
  'modern-d': 'modern-d.geojson',
  'modern-c': 'modern-c.geojson',
  't12-c3': 't12-c3.geojson',
  'ligne-ouest': 'ligne-ouest.geojson',
  'teol-craponne': 'teol-craponne.geojson',
  t8: 't8.geojson',
  'telepherique-ouest': 'telepherique-ouest.geojson',
  'bhns-rive-droite': 'bhns-rive-droite.geojson',
  'bhns-parilly': 'bhns-parilly.geojson',
  't9-final': 't9-final.geojson',
  't10-final': 't10-final.geojson',
  'navette-fluv': 'navette-fluv.geojson',
  't3-renf': 't3-renf.geojson',
  'bhns-kimmerling': 'bhns-kimmerling.geojson',
}

const toLineStrings = (geometry) => {
  if (!geometry) return []
  if (geometry.type === 'LineString') return [geometry.coordinates]
  if (geometry.type === 'MultiLineString') return geometry.coordinates
  return []
}

const distance = (a, b) => {
  // Approximation plane suffisante à l'échelle d'une métropole.
  const lat = ((a[1] + b[1]) / 2) * (Math.PI / 180)
  const dx = (b[0] - a[0]) * Math.cos(lat)
  const dy = b[1] - a[1]
  return Math.hypot(dx, dy)
}

const midpoint = (line) => {
  let total = 0
  for (let i = 1; i < line.length; i += 1) total += distance(line[i - 1], line[i])
  let walked = 0
  for (let i = 1; i < line.length; i += 1) {
    const step = distance(line[i - 1], line[i])
    if (walked + step >= total / 2) {
      const ratio = step === 0 ? 0 : (total / 2 - walked) / step
      return [
        line[i - 1][0] + (line[i][0] - line[i - 1][0]) * ratio,
        line[i - 1][1] + (line[i][1] - line[i - 1][1]) * ratio,
      ]
    }
    walked += step
  }
  return line[Math.floor(line.length / 2)]
}

const features = []
const anchors = {}

for (const [id, file] of Object.entries(FILES)) {
  const raw = JSON.parse(readFileSync(join(source, file), 'utf8'))
  const collection = raw.type === 'FeatureCollection' ? raw.features : [raw]

  const lines = collection.flatMap((feature) =>
    toLineStrings(feature.geometry ?? feature),
  )
  if (lines.length === 0) throw new Error(`Aucun tracé exploitable dans ${file}`)

  features.push({
    type: 'Feature',
    id,
    properties: { id },
    geometry:
      lines.length === 1
        ? { type: 'LineString', coordinates: lines[0] }
        : { type: 'MultiLineString', coordinates: lines },
  })

  const longest = lines.reduce((best, line) => (line.length > best.length ? line : best), lines[0])
  const flat = lines.flat()
  anchors[id] = {
    anchor: midpoint(longest),
    ends: [longest[0], longest[longest.length - 1]],
    bounds: [
      Math.min(...flat.map((c) => c[0])),
      Math.min(...flat.map((c) => c[1])),
      Math.max(...flat.map((c) => c[0])),
      Math.max(...flat.map((c) => c[1])),
    ],
  }
}

mkdirSync(target, { recursive: true })
writeFileSync(
  join(target, 'reseau.geojson'),
  JSON.stringify({ type: 'FeatureCollection', features }),
)
writeFileSync(join(target, 'ancres.json'), JSON.stringify(anchors, null, 0))

console.log(`${features.length} tracés fusionnés dans public/data/reseau.geojson`)
