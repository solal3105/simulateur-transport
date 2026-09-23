/**
 * Prépare les données servies au navigateur, dans public/data.
 *
 *   npm run data
 *
 * Entrées :
 *   data/osm/*.json      extractions OpenStreetMap (voir scripts/fetch-osm.mjs)
 *   data/insee/*.csv     population et emplois par carreau de 200 m (voir data/insee/SOURCES.md)
 *   data/projets/*.geojson  tracés des projets du catalogue
 *
 * Sorties :
 *   public/data/fond.json      fleuves, métro et tram actuels
 *   public/data/projets.json   tracés des projets, un par identifiant
 *   public/data/arrets.json    arrêts de tram et stations de métro actuels
 *   public/data/carreaux.json  habitants et emplois par carreau de 200 m
 *   public/data/decor.json     parcs, eau, grands axes, voies ferrées et limites de communes
 *   public/data/lieux.json     quartiers et communes, pour nommer les arrêts des lignes tracées
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = (...p) => join(root, 'data', ...p)
const out = join(root, 'public', 'data')
mkdirSync(out, { recursive: true })

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const round = (v, d = 5) => Math.round(v * 10 ** d) / 10 ** d

/** Simplification de Douglas-Peucker, tolérance en degrés. */
function simplify(points, tolerance) {
  if (points.length < 3) return points
  const [ax, ay] = points[0]
  const [bx, by] = points[points.length - 1]
  const dx = bx - ax
  const dy = by - ay
  const length = Math.hypot(dx, dy) || 1e-12
  let index = 0
  let max = 0
  for (let i = 1; i < points.length - 1; i += 1) {
    const [px, py] = points[i]
    const d = Math.abs(dy * (px - ax) - dx * (py - ay)) / length
    if (d > max) {
      max = d
      index = i
    }
  }
  if (max <= tolerance) return [points[0], points[points.length - 1]]
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)]
}

const line = (geometry, tolerance = 0.00006, decimales = 5) =>
  simplify(
    geometry.map((g) => [g.lon, g.lat]),
    tolerance,
  ).map(([lon, lat]) => [round(lon, decimales), round(lat, decimales)])

const feature = (properties, coordinates) => ({
  type: 'Feature',
  properties,
  geometry: { type: 'MultiLineString', coordinates },
})

// Fond de carte : fleuves, métro par ligne, tram.
const rivers = readJson(src('osm', 'rivers.json')).elements
const fleuves = rivers
  .filter((e) => /Rhône|Saône/.test(e.tags?.name ?? '') && !/Canal/.test(e.tags?.name ?? ''))
  .map((e) => ({ name: /Saône/.test(e.tags.name) ? 'saone' : 'rhone', coords: line(e.geometry, 0.00012) }))

const metroWays = readJson(src('osm', 'metro.json')).elements.filter(
  (e) => !e.tags?.service && /^Ligne [ABCD]$/.test(e.tags?.name ?? ''),
)
const tramWays = readJson(src('osm', 'tram.json')).elements.filter((e) => e.geometry && !e.tags?.service)

const fond = {
  type: 'FeatureCollection',
  features: [
    feature({ kind: 'fleuve', name: 'rhone' }, fleuves.filter((f) => f.name === 'rhone').map((f) => f.coords)),
    feature({ kind: 'fleuve', name: 'saone' }, fleuves.filter((f) => f.name === 'saone').map((f) => f.coords)),
    feature({ kind: 'tram' }, tramWays.map((e) => line(e.geometry))),
    ...['A', 'B', 'C', 'D'].map((letter) =>
      feature(
        { kind: 'metro', line: letter },
        metroWays.filter((e) => e.tags.name === `Ligne ${letter}`).map((e) => line(e.geometry)),
      ),
    ),
  ],
}
writeFileSync(join(out, 'fond.json'), JSON.stringify(fond))

// Décor : parcs, eau, routes, rail, communes.
const lire = (nom) => {
  try {
    return readJson(src('osm', `${nom}.json`)).elements
  } catch {
    console.log(`${nom}.json absent : couche ignorée`)
    return []
  }
}

/** Assemble les morceaux d'un contour (membres « outer » d'une relation) en anneaux fermés. */
function anneaux(morceaux) {
  const restants = morceaux.map((m) => [...m])
  const fermes = []
  while (restants.length) {
    let anneau = restants.shift()
    let progres = true
    while (progres && (anneau[0][0] !== anneau.at(-1)[0] || anneau[0][1] !== anneau.at(-1)[1])) {
      progres = false
      for (let i = 0; i < restants.length; i += 1) {
        const m = restants[i]
        const fin = anneau.at(-1)
        if (m[0][0] === fin[0] && m[0][1] === fin[1]) anneau = anneau.concat(m.slice(1))
        else if (m.at(-1)[0] === fin[0] && m.at(-1)[1] === fin[1]) anneau = anneau.concat([...m].reverse().slice(1))
        else continue
        restants.splice(i, 1)
        progres = true
        break
      }
    }
    if (anneau.length >= 4) fermes.push(anneau)
  }
  return fermes
}

/** Un anneau commence et finit au même point : on le simplifie en deux moitiés. */
const simplifierAnneau = (anneau, tolerance) => {
  const milieu = Math.floor(anneau.length / 2)
  return [...simplify(anneau.slice(0, milieu + 1), tolerance).slice(0, -1), ...simplify(anneau.slice(milieu), tolerance)]
}

const aire = (anneau) => {
  let a = 0
  for (let i = 1; i < anneau.length; i += 1) a += anneau[i - 1][0] * anneau[i][1] - anneau[i][0] * anneau[i - 1][1]
  return Math.abs(a / 2) * 111320 * 111320 * Math.cos((45.76 * Math.PI) / 180)
}

function polygones(elements, aireMin, tolerance) {
  const liste = []
  for (const e of elements) {
    let bruts = []
    if (e.type === 'way' && e.geometry) bruts = [e.geometry.map((g) => [g.lon, g.lat])]
    if (e.type === 'relation') {
      bruts = anneaux(e.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry.map((g) => [g.lon, g.lat])))
    }
    for (const b of bruts) {
      if (b.length < 4 || aire(b) < aireMin) continue
      const s = simplifierAnneau(b, tolerance).map(([lon, lat]) => [round(lon, 4), round(lat, 4)])
      if (s.length >= 4) liste.push(s)
    }
  }
  return liste
}

const polygone = (properties, rings) => ({
  type: 'Feature',
  properties,
  geometry: { type: 'MultiPolygon', coordinates: rings.map((r) => [r]) },
})

const lignesDe = (elements, tolerance) => elements.filter((e) => e.geometry).map((e) => line(e.geometry, tolerance, 4)).filter((l) => l.length > 1)
const routes = lire('routes')
const communesOsm = lire('communes').filter((e) => e.tags?.name)
const decor = {
  type: 'FeatureCollection',
  features: [
    polygone({ kind: 'parc' }, polygones(lire('parcs'), 25000, 0.00014)),
    polygone({ kind: 'eau' }, polygones(lire('eau'), 10000, 0.0001)),
    feature({ kind: 'route', rang: 1 }, lignesDe(routes.filter((e) => /motorway|trunk/.test(e.tags?.highway ?? '')), 0.00012)),
    feature({ kind: 'route', rang: 2 }, lignesDe(routes.filter((e) => e.tags?.highway === 'primary'), 0.00012)),
    feature({ kind: 'route', rang: 3 }, lignesDe(routes.filter((e) => e.tags?.highway === 'secondary'), 0.00018)),
    feature({ kind: 'rail' }, lignesDe(lire('rail'), 0.00012)),
    feature(
      { kind: 'limite' },
      communesOsm.flatMap((e) => e.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => line(m.geometry, 0.0003, 4))),
    ),
  ],
}
writeFileSync(join(out, 'decor.json'), JSON.stringify(decor))

// Noms de lieux : quartiers d'abord, communes pour le reste.
const communes = communesOsm
  .map((e) => ({
    nom: e.tags.name,
    anneaux: anneaux(e.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry.map((g) => [g.lon, g.lat]))).map((r) =>
      simplifierAnneau(r, 0.0006).map(([lon, lat]) => [round(lon, 4), round(lat, 4)]),
    ),
  }))
  .filter((c) => c.anneaux.length)
const quartiers = lire('lieux')
  .filter((e) => /suburb|quarter|neighbourhood/.test(e.tags?.place ?? '') && e.tags?.name && !/Arrondissement/i.test(e.tags.name))
  .map((e) => [round(e.lon, 4), round(e.lat, 4), e.tags.name])
const arrondissements = lire('lieux')
  .filter((e) => /^(\d+)(er|e) Arrondissement$/i.test(e.tags?.name ?? ''))
  .map((e) => [round(e.lon, 4), round(e.lat, 4), `Lyon ${e.tags.name.replace(/ Arrondissement/i, '')}`])
writeFileSync(join(out, 'lieux.json'), JSON.stringify({ communes, quartiers, arrondissements }))

// Arrêts existants, pour savoir qui est déjà desservi.
const stops = readJson(src('osm', 'stops.json')).elements.map((e) => [
  round(e.lon),
  round(e.lat),
  e.tags?.subway === 'yes' || e.tags?.station === 'subway' ? 1 : 0,
])
writeFileSync(join(out, 'arrets.json'), JSON.stringify(stops))

// Tracés des projets du catalogue.
const projets = { type: 'FeatureCollection', features: [] }
for (const file of readdirSync(src('projets')).filter((f) => f.endsWith('.geojson'))) {
  const raw = readJson(src('projets', file))
  const features = raw.type === 'FeatureCollection' ? raw.features : [raw]
  const coords = []
  for (const f of features) {
    const g = f.geometry
    if (!g) continue
    const parts = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []
    for (const part of parts) {
      coords.push(simplify(part, 0.00003).map(([lon, lat]) => [round(lon), round(lat)]))
    }
  }
  projets.features.push(feature({ id: file.replace('.geojson', '') }, coords))
}
writeFileSync(join(out, 'projets.json'), JSON.stringify(projets))

// Carreaux INSEE : habitants recalés sur le recensement, emplois plafonnés.
/** Filosofi ignore foyers, résidences et hébergements collectifs : on recale sur le recensement 2022. */
const POP_FACTOR = 1433613 / 1297490
/** Les sièges des grandes administrations créent des pics artificiels dans la répartition Sirene. */
const JOBS_CAP = 4000

const cells = new Map()
const csv = (file) =>
  readFileSync(src('insee', file), 'utf8')
    .trim()
    .split('\n')
    .slice(1)
    .map((row) => row.split(',').map(Number))
for (const [lon, lat, pop] of csv('pop_200m.csv')) {
  cells.set(`${lon},${lat}`, [lon, lat, pop * POP_FACTOR, 0])
}
for (const [lon, lat, jobs] of csv('jobs.csv')) {
  const key = `${lon},${lat}`
  const cell = cells.get(key) ?? [lon, lat, 0, 0]
  cell[3] = Math.min(jobs, JOBS_CAP)
  cells.set(key, cell)
}
const carreaux = [...cells.values()]
  .filter(([, , pop, jobs]) => pop + jobs >= 1)
  .map(([lon, lat, pop, jobs]) => [lon, lat, Math.round(pop), Math.round(jobs)])
writeFileSync(join(out, 'carreaux.json'), JSON.stringify(carreaux))

const total = carreaux.reduce((acc, c) => [acc[0] + c[2], acc[1] + c[3]], [0, 0])
console.log(
  `décor ${decor.features.map((f) => f.geometry.coordinates.length).join('/')} éléments, ${quartiers.length} quartiers, ${communes.length} communes, ` +
  `fond ${fond.features.length} couches, ${stops.length} arrêts, ${projets.features.length} tracés, ` +
    `${carreaux.length} carreaux (${Math.round(total[0])} habitants, ${Math.round(total[1])} emplois)`,
)
