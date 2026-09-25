/**
 * Prépare les données servies au navigateur, dans public/data (Lyon) ou public/data/<ville>.
 *
 *   npm run data
 *   node scripts/build-data.mjs toulouse      (ou marseille, nice, idf)
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
 *
 * Pour Toulouse, les lignes en chantier (ligne C, connexion de la ligne B) viennent d'OpenStreetMap et
 * leurs stations de data/toulouse/stations-futures.json. Hors de Lyon, les carreaux d'habitants et
 * d'emplois sont produits à part par scripts/carreaux-ville.py, et il n'y a pas de projets.
 *
 * À Marseille et à Nice, la mer n'existe dans OpenStreetMap que comme trait de côte : elle est
 * reconstruite ici en surface (voir merDepuisCote).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ville = process.argv[2] ?? 'lyon'
if (!['lyon', 'toulouse', 'marseille', 'nice', 'idf'].includes(ville)) throw new Error(`Ville inconnue : ${ville}`)
const src = (...p) => join(root, 'data', ...p)
const osm = (nom) => (ville === 'lyon' ? src('osm', nom) : src('osm', ville, nom))
const out = join(root, 'public', 'data', ...(ville === 'lyon' ? [] : [ville]))
mkdirSync(out, { recursive: true })
/** Latitude de référence, pour les surfaces. */
const LATITUDE = { lyon: 45.76, toulouse: 43.6, marseille: 43.3, nice: 43.7, idf: 48.86 }[ville]

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

const lire = (nom) => {
  try {
    return readJson(osm(`${nom}.json`)).elements
  } catch {
    console.log(`${nom}.json absent : couche ignorée`)
    return []
  }
}

// Fond de carte : fleuves, métro par ligne, tram.
function fondLyon() {
  const rivers = readJson(osm('rivers.json')).elements
  const fleuves = rivers
    .filter((e) => /Rhône|Saône/.test(e.tags?.name ?? '') && !/Canal/.test(e.tags?.name ?? ''))
    .map((e) => ({ name: /Saône/.test(e.tags.name) ? 'saone' : 'rhone', coords: line(e.geometry, 0.00012) }))

  const metroWays = readJson(osm('metro.json')).elements.filter((e) => !e.tags?.service && /^Ligne [ABCD]$/.test(e.tags?.name ?? ''))
  const tramWays = readJson(osm('tram.json')).elements.filter((e) => e.geometry && !e.tags?.service)

  return {
    type: 'FeatureCollection',
    features: [
      feature(
        { kind: 'fleuve', name: 'rhone' },
        fleuves.filter((f) => f.name === 'rhone').map((f) => f.coords),
      ),
      feature(
        { kind: 'fleuve', name: 'saone' },
        fleuves.filter((f) => f.name === 'saone').map((f) => f.coords),
      ),
      feature(
        { kind: 'tram' },
        tramWays.map((e) => line(e.geometry)),
      ),
      ...['A', 'B', 'C', 'D'].map((letter) =>
        feature(
          { kind: 'metro', line: letter },
          metroWays.filter((e) => e.tags.name === `Ligne ${letter}`).map((e) => line(e.geometry)),
        ),
      ),
    ],
  }
}

/**
 * Toulouse : la Garonne, les métros A et B, et comme lignes existantes celles qui ouvrent avant les
 * premières du joueur : la ligne C (fin 2028), la connexion de la ligne B à Labège (2027) et la ligne
 * Aéroport. Téléo est dessiné comme un tram, d'un trait fin.
 */
function fondToulouse() {
  const garonne = readJson(osm('rivers.json')).elements.filter((e) => e.geometry && /Garonne/.test(e.tags?.name ?? ''))
  const metro = readJson(osm('metro.json')).elements.filter((e) => e.type === 'way' && e.geometry)
  const chantiers = lire('chantiers').filter((e) => e.geometry)
  const futures = readJson(src('toulouse', 'stations-futures.json')).lignes
  const stationsC = futures.find((l) => l.ligne === 'C').stations.map((s) => s.pos)
  // Beaucoup de tronçons de la ligne C n'ont pas de nom dans OpenStreetMap : on garde ceux qui passent près de ses stations.
  const presDeC = (e) => {
    const m = e.geometry[Math.floor(e.geometry.length / 2)]
    return stationsC.some(([lon, lat]) => Math.hypot((lon - m.lon) * 80700, (lat - m.lat) * 111320) < 1200)
  }
  const metroEnChantier = chantiers.filter((e) => e.tags?.construction === 'subway')
  const connexionB = metroEnChantier.filter((e) => e.tags?.name === 'Connexion Ligne B').map((e) => line(e.geometry))
  const ligneC = metroEnChantier.filter((e) => e.tags?.name === 'Ligne C' || (!e.tags?.name && presDeC(e))).map((e) => line(e.geometry))
  // Sans tracé en chantier dans OpenStreetMap, la ligne relie ses stations en ligne droite.
  const parStations = (ligne) => [futures.find((l) => l.ligne === ligne).stations.map((s) => s.pos)]
  const trams = [
    ...readJson(osm('tram.json')).elements.filter((e) => e.geometry),
    ...chantiers.filter((e) => /tram|light_rail/.test(e.tags?.construction ?? '')),
    ...lire('cable').filter((e) => e.geometry),
  ]
  return {
    type: 'FeatureCollection',
    features: [
      feature(
        { kind: 'fleuve', name: 'garonne' },
        garonne.map((e) => line(e.geometry, 0.00012)),
      ),
      feature(
        { kind: 'tram' },
        trams.map((e) => line(e.geometry)),
      ),
      feature(
        { kind: 'metro', line: 'A' },
        metro.filter((e) => e.tags?.name === 'Ligne A').map((e) => line(e.geometry)),
      ),
      feature({ kind: 'metro', line: 'B' }, [
        ...metro.filter((e) => e.tags?.name !== 'Ligne A').map((e) => line(e.geometry)),
        ...(connexionB.length ? connexionB : parStations('B')),
      ]),
      feature({ kind: 'metro', line: 'C' }, ligneC.length ? ligneC : parStations('C')),
    ],
  }
}

/**
 * Marseille, Nice et l'Île-de-France : les fleuves, le métro et le tram d'OpenStreetMap, y compris les lignes en
 * chantier, qui ouvrent avant celles du joueur. Au bord de la mer, le trait de côte s'ajoute au fond
 * pour les miniatures, et la mer elle-même au décor.
 */
const FONDS = {
  marseille: { fleuves: /Huveaune|Durance|^Arc$|Touloubre/, cote: [43.1, 4.65, 43.82, 5.9] },
  nice: { fleuves: /^(Le )?(Var|Paillon)$|^(La )?(Tinée|Vésubie)$/, cote: [43.55, 6.7, 43.85, 7.55] },
  // En Île-de-France, seul le Grand Paris Express est déjà payé dans le budget : les trams en chantier (T1 vers Val
  // de Fontenay, T13 vers Achères) restent au joueur, qui les décide dans le catalogue. On ne dessine que le métro.
  idf: { fleuves: /^(La |L'|L’)?(Seine|Marne|Oise)$/, tramsEnChantier: false },
}

/**
 * La mer à partir du trait de côte, découpé à l'emprise [sud, ouest, nord, est]. Dans OpenStreetMap,
 * la terre est à gauche du sens de la côte : chaque morceau qui traverse l'emprise laisse la mer à sa
 * droite, et on referme la surface en suivant le bord de l'emprise dans le sens des aiguilles d'une
 * montre jusqu'au morceau suivant. Les côtes fermées à l'intérieur sont des îles, trouées dans la mer.
 */
function merDepuisCote(elements, [s, o, n, e]) {
  const chemins = elements.filter((w) => w.type === 'way' && w.geometry?.length > 1).map((w) => w.geometry.map((g) => [g.lon, g.lat]))
  const cle = (p) => `${p[0]},${p[1]}`
  const parDebut = new Map(chemins.map((w, i) => [cle(w[0]), i]))
  const finsDeChemin = new Set(chemins.map((w) => cle(w.at(-1))))
  const vus = new Set()
  const suivre = (i) => {
    let chaine = [...chemins[i]]
    vus.add(i)
    for (let j = parDebut.get(cle(chaine.at(-1))); j !== undefined && !vus.has(j); j = parDebut.get(cle(chaine.at(-1)))) {
      chaine = chaine.concat(chemins[j].slice(1))
      vus.add(j)
    }
    return chaine
  }
  const chaines = []
  chemins.forEach((w, i) => !vus.has(i) && !finsDeChemin.has(cle(w[0])) && chaines.push(suivre(i)))
  chemins.forEach((w, i) => !vus.has(i) && chaines.push(suivre(i)))

  // Découpe de chaque chaîne à l'emprise (Liang-Barsky, segment par segment).
  const coupe = (p, q) => {
    let t0 = 0
    let t1 = 1
    const dx = q[0] - p[0]
    const dy = q[1] - p[1]
    for (const [pp, qq] of [[-dx, p[0] - o], [dx, e - p[0]], [-dy, p[1] - s], [dy, n - p[1]]]) {
      if (pp === 0) {
        if (qq < 0) return null
      } else {
        const r = qq / pp
        if (pp < 0) {
          if (r > t1) return null
          if (r > t0) t0 = r
        } else {
          if (r < t0) return null
          if (r < t1) t1 = r
        }
      }
    }
    return [t0, t1]
  }
  const entre = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]
  const morceaux = []
  const iles = []
  for (const c of chaines) {
    const ferme = cle(c[0]) === cle(c.at(-1))
    let courant = null
    let toutDedans = true
    for (let i = 1; i < c.length; i += 1) {
      const t = coupe(c[i - 1], c[i])
      if (!t || t[0] > 0 || t[1] < 1) toutDedans = false
      if (!t) continue
      if (!courant) courant = [entre(c[i - 1], c[i], t[0])]
      courant.push(entre(c[i - 1], c[i], t[1]))
      if (t[1] < 1) {
        morceaux.push(courant)
        courant = null
      }
    }
    if (ferme && toutDedans) iles.push(c)
    else if (courant) morceaux.push(courant)
  }

  // Position d'un point du bord, en tournant dans le sens des aiguilles d'une montre depuis le coin nord-ouest.
  const W = e - o
  const H = n - s
  const P = 2 * (W + H)
  const projeter = ([x, y]) => {
    // Un bout de côte qui s'arrête à l'intérieur (données incomplètes) est prolongé jusqu'au bord le plus proche.
    const d = [n - y, e - x, y - s, x - o]
    const k = d.indexOf(Math.min(...d))
    return [[x, n], [e, y], [x, s], [o, y]][k]
  }
  const eps = 1e-9
  const surLeBord = ([x, y]) => Math.abs(y - n) < eps || Math.abs(x - e) < eps || Math.abs(y - s) < eps || Math.abs(x - o) < eps
  const position = ([x, y]) => {
    if (Math.abs(y - n) < eps) return x - o
    if (Math.abs(x - e) < eps) return W + (n - y)
    if (Math.abs(y - s) < eps) return W + H + (e - x)
    return 2 * W + H + (y - s)
  }
  const coins = [
    [o, n],
    [e, n],
    [e, s],
    [o, s],
  ].map((c) => ({ c, t: position(c) }))
  for (const m of morceaux) {
    if (!surLeBord(m[0])) m.unshift(projeter(m[0]))
    if (!surLeBord(m.at(-1))) m.push(projeter(m.at(-1)))
  }
  const anneauxMer = []
  const restants = new Set(morceaux.keys())
  while (restants.size) {
    const premier = restants.values().next().value
    restants.delete(premier)
    let anneau = [...morceaux[premier]]
    let courant = premier
    for (let garde = 0; garde < morceaux.length + 1; garde += 1) {
      const tSortie = position(morceaux[courant].at(-1))
      let suivant = null
      let ecart = Infinity
      for (const j of [...restants, premier]) {
        const d = (position(morceaux[j][0]) - tSortie + P) % P
        if (d < ecart) {
          ecart = d
          suivant = j
        }
      }
      for (const { c } of coins.map((k) => ({ ...k, d: (k.t - tSortie + P) % P })).filter((k) => k.d > 0 && k.d < ecart).sort((a, b) => a.d - b.d)) {
        anneau.push(c)
      }
      if (suivant === premier) break
      anneau = anneau.concat(morceaux[suivant])
      restants.delete(suivant)
      courant = suivant
    }
    anneau.push(anneau[0])
    anneauxMer.push(anneau)
  }
  // Une côte fermée tournant dans le sens des aiguilles d'une montre entoure de l'eau, pas une île.
  const signe = (r) => {
    let a = 0
    for (let i = 1; i < r.length; i += 1) a += r[i - 1][0] * r[i][1] - r[i][0] * r[i - 1][1]
    return a
  }
  const dansAnneau = ([x, y], r) => {
    let dedans = false
    for (let i = 0, j = r.length - 1; i < r.length; j = i, i += 1) {
      if (r[i][1] > y !== r[j][1] > y && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) dedans = !dedans
    }
    return dedans
  }
  const simplifier = (r) => simplifierAnneau(r, 0.00008).map(([lon, lat]) => [round(lon, 5), round(lat, 5)])
  const polygonesMer = anneauxMer.map((r) => [simplifier(r)])
  for (const ile of iles) {
    if (signe(ile) < 0) {
      polygonesMer.push([simplifier(ile)])
      continue
    }
    const hote = polygonesMer.find((p) => dansAnneau(ile[0], p[0]))
    if (hote && aire(ile) > 2000) hote.push(simplifier(ile))
  }
  return { polygones: polygonesMer, cote: morceaux.concat(iles).map((m) => line(m.map(([lon, lat]) => ({ lon, lat })), 0.0001)) }
}

function fondVille() {
  const reglage = FONDS[ville]
  const fleuves = new Map()
  for (const e of readJson(osm('rivers.json')).elements.filter((e) => e.geometry && reglage.fleuves.test(e.tags?.name ?? ''))) {
    const nom = e.tags.name.replace(/^(Le|La) /, '').toLowerCase()
    fleuves.set(nom, [...(fleuves.get(nom) ?? []), line(e.geometry, 0.00012)])
  }
  const chantiers = lire('chantiers').filter((e) => e.geometry)
  const trams = [
    ...lire('tram').filter((e) => e.geometry),
    ...(reglage.tramsEnChantier === false ? [] : chantiers.filter((e) => /tram|light_rail/.test(e.tags?.construction ?? ''))),
    ...lire('cable').filter((e) => e.geometry),
  ]
  const metros = [...lire('metro').filter((e) => e.geometry), ...chantiers.filter((e) => e.tags?.construction === 'subway')]
  mer = reglage.cote ? merDepuisCote(lire('cote'), reglage.cote) : null
  return {
    type: 'FeatureCollection',
    features: [
      ...[...fleuves].map(([nom, coords]) => feature({ kind: 'fleuve', name: nom }, coords)),
      // La mer et ses îles, en anneaux, pour les miniatures qui la remplissent en pair-impair.
      ...(mer ? [feature({ kind: 'cote' }, mer.polygones.flat())] : []),
      feature(
        { kind: 'tram' },
        trams.map((e) => line(e.geometry)),
      ),
      feature(
        { kind: 'metro' },
        metros.map((e) => line(e.geometry)),
      ),
    ],
  }
}

let mer = null
const fond = ville === 'lyon' ? fondLyon() : ville === 'toulouse' ? fondToulouse() : fondVille()
writeFileSync(join(out, 'fond.json'), JSON.stringify(fond))

// Décor : parcs, eau, routes, rail, communes.

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
function simplifierAnneau(anneau, tolerance) {
  const milieu = Math.floor(anneau.length / 2)
  return [...simplify(anneau.slice(0, milieu + 1), tolerance).slice(0, -1), ...simplify(anneau.slice(milieu), tolerance)]
}

function aire(anneau) {
  let a = 0
  for (let i = 1; i < anneau.length; i += 1) a += anneau[i - 1][0] * anneau[i][1] - anneau[i][0] * anneau[i - 1][1]
  return Math.abs(a / 2) * 111320 * 111320 * Math.cos((LATITUDE * Math.PI) / 180)
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

/**
 * Raccorde les tronçons qui se suivent (OpenStreetMap découpe une route à chaque carrefour ou changement
 * d'attribut) : un point partagé par exactement deux tronçons devient un point de passage.
 */
function raccorder(lignes) {
  const cle = (p) => `${p[0]},${p[1]}`
  const bouts = new Map()
  const ajouter = (k, i) => bouts.set(k, [...(bouts.get(k) ?? []), i])
  lignes.forEach((l, i) => {
    ajouter(cle(l[0]), i)
    ajouter(cle(l.at(-1)), i)
  })
  const vivantes = lignes.map((l) => [...l])
  const morte = new Set()
  for (const [k, indices] of bouts) {
    const [a, b] = indices.filter((i) => !morte.has(i))
    if (indices.filter((i) => !morte.has(i)).length !== 2 || a === b) continue
    let la = vivantes[a]
    let lb = vivantes[b]
    if (cle(la.at(-1)) !== k) la = la.reverse()
    if (cle(lb[0]) !== k) lb = lb.reverse()
    vivantes[a] = la.concat(lb.slice(1))
    morte.add(b)
    // Le bout de b qui reste appartient désormais à a.
    const autre = cle(vivantes[a].at(-1))
    bouts.set(autre, (bouts.get(autre) ?? []).map((i) => (i === b ? a : i)))
  }
  return vivantes.filter((_, i) => !morte.has(i))
}

const lignesDe = (elements, tolerance) => {
  const lignes = elements
    .filter((e) => e.geometry)
    .map((e) => line(e.geometry, tolerance, 4))
    .filter((l) => l.length > 1)
  return ALLEGEMENT.raccorder ? raccorder(lignes) : lignes
}
const routes = lire('routes')
const communesOsm = ville === 'lyon' ? lire('communes').filter((e) => e.tags?.name) : []
// Hors de Lyon, les contours des communes viennent de geo.api.gouv.fr (voir scripts/fetch-osm.mjs).
const contours = ville === 'lyon' ? [] : readJson(osm('contours.json')).features
const anneauxExterieurs = (g) =>
  g.type === 'Polygon' ? [g.coordinates[0]] : g.type === 'MultiPolygon' ? g.coordinates.map((p) => p[0]) : []
// Les grands territoires (Marseille, Nice, Île-de-France) ont des centaines de bois et de routes de campagne : on ne garde
// que les bois assez grands, on simplifie davantage, et on écarte ce qui sort du cadre de la ville.
const ALLEGEMENT = {
  marseille: { parcMin: 200000, parcTol: 0.0003, eauMin: 30000, routeTol: 1.6, cadre: [43.14, 4.7, 43.8, 5.85], raccorder: true },
  nice: { parcMin: 250000, parcTol: 0.0003, eauMin: 20000, routeTol: 1.6, cadre: [43.62, 6.76, 44.38, 7.46], raccorder: true },
  // En Île-de-France, les routes principales ne sont gardées qu'autour de l'agglomération parisienne.
  idf: { parcMin: 200000, parcTol: 0.0005, eauMin: 40000, routeTol: 2.8, cadre: [48.1, 1.43, 49.25, 3.57], coeur: [48.55, 1.85, 49.15, 2.95], raccorder: true },
}[ville] ?? { parcMin: 25000, parcTol: 0.00014, eauMin: 10000, routeTol: 1 }
const dansCadre = (cadre) => (e) => {
  if (!cadre) return true
  const [s, o, n, est] = cadre
  const points = e.geometry ?? e.members?.flatMap((m) => m.geometry ?? []) ?? []
  return points.some((g) => g.lat >= s && g.lat <= n && g.lon >= o && g.lon <= est)
}
const dansLeCadre = dansCadre(ALLEGEMENT.cadre)
const dansLeCoeur = dansCadre(ALLEGEMENT.coeur)
const decor = {
  type: 'FeatureCollection',
  features: [
    ...(mer ? [{ type: 'Feature', properties: { kind: 'mer' }, geometry: { type: 'MultiPolygon', coordinates: mer.polygones } }] : []),
    polygone({ kind: 'parc' }, polygones(lire('parcs').filter(dansLeCadre), ALLEGEMENT.parcMin, ALLEGEMENT.parcTol)),
    polygone({ kind: 'eau' }, polygones(lire('eau').filter(dansLeCadre), ALLEGEMENT.eauMin, 0.0001)),
    feature(
      { kind: 'route', rang: 1 },
      lignesDe(
        routes.filter((e) => /motorway|trunk/.test(e.tags?.highway ?? '') && dansLeCadre(e)),
        0.00012 * ALLEGEMENT.routeTol,
      ),
    ),
    feature(
      { kind: 'route', rang: 2 },
      lignesDe(
        routes.filter((e) => e.tags?.highway === 'primary' && dansLeCadre(e) && dansLeCoeur(e)),
        0.00012 * ALLEGEMENT.routeTol,
      ),
    ),
    feature(
      { kind: 'route', rang: 3 },
      lignesDe(
        routes.filter((e) => e.tags?.highway === 'secondary' && dansLeCadre(e)),
        0.00018 * ALLEGEMENT.routeTol,
      ),
    ),
    feature({ kind: 'rail' }, lignesDe(lire('rail').filter(dansLeCadre), 0.00012 * ALLEGEMENT.routeTol)),
    feature({ kind: 'limite' }, [
      ...communesOsm.flatMap((e) => e.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => line(m.geometry, 0.0003, 4))),
      ...contours.flatMap((f) =>
        anneauxExterieurs(f.geometry).map((r) => simplify(r, 0.0003).map(([lon, lat]) => [round(lon, 4), round(lat, 4)])),
      ),
    ]),
  ],
}
writeFileSync(join(out, 'decor.json'), JSON.stringify(decor))

// Noms de lieux : quartiers d'abord, communes pour le reste.
const communes = [
  ...communesOsm.map((e) => ({
    nom: e.tags.name,
    anneaux: anneaux(e.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry.map((g) => [g.lon, g.lat]))).map((r) =>
      simplifierAnneau(r, 0.0006).map(([lon, lat]) => [round(lon, 4), round(lat, 4)]),
    ),
  })),
  ...contours.map((f) => ({
    nom: f.properties.nom,
    anneaux: anneauxExterieurs(f.geometry).map((r) => simplifierAnneau(r, 0.0006).map(([lon, lat]) => [round(lon, 4), round(lat, 4)])),
  })),
].filter((c) => c.anneaux.length)
const quartiers = lire('lieux')
  .filter((e) => /suburb|quarter|neighbourhood/.test(e.tags?.place ?? '') && e.tags?.name && !/Arrondissement/i.test(e.tags.name))
  .map((e) => [round(e.lon, 4), round(e.lat, 4), e.tags.name])
// Les arrondissements ne servent qu'à Lyon, dont la commune est trop grande pour nommer un arrêt.
const arrondissements =
  ville === 'lyon'
    ? lire('lieux')
        .filter((e) => /^(\d+)(er|e) Arrondissement$/i.test(e.tags?.name ?? ''))
        .map((e) => [round(e.lon, 4), round(e.lat, 4), `Lyon ${e.tags.name.replace(/ Arrondissement/i, '')}`])
    : []
writeFileSync(join(out, 'lieux.json'), JSON.stringify({ communes, quartiers, arrondissements }))

// Arrêts existants, pour savoir qui est déjà desservi. À Toulouse et en Île-de-France, les stations des lignes
// de métro qui ouvrent avant celles du joueur (data/<ville>/stations-futures.json) comptent aussi.
const futures = (() => {
  try {
    return readJson(src(ville, 'stations-futures.json')).lignes
  } catch {
    return []
  }
})()
const stops = [
  ...readJson(osm('stops.json')).elements.map((e) => [
    round(e.lon),
    round(e.lat),
    e.tags?.subway === 'yes' || e.tags?.station === 'subway' ? 1 : 0,
  ]),
  ...(ville === 'lyon' ? [] : futures.flatMap((l) => l.stations.filter((s) => !s.existante).map((s) => [round(s.pos[0]), round(s.pos[1]), 1]))),
]
writeFileSync(join(out, 'arrets.json'), JSON.stringify(stops))

// Tracés des projets du catalogue : seule Lyon en a un.
const projets = { type: 'FeatureCollection', features: [] }
for (const file of ville === 'lyon' ? readdirSync(src('projets')).filter((f) => f.endsWith('.geojson')) : []) {
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

// Carreaux INSEE : habitants recalés sur le recensement, emplois plafonnés. Hors de Lyon, ils viennent
// de scripts/carreaux-ville.py, qui écrit directement public/data/<ville>/carreaux.json.
if (ville !== 'lyon') {
  const carreaux = readJson(join(out, 'carreaux.json'))
  console.log(
    `${ville} : décor ${decor.features.map((f) => f.geometry.coordinates.length).join('/')} éléments, ${quartiers.length} quartiers, ${communes.length} communes, ` +
      `fond ${fond.features.map((f) => f.geometry.coordinates.length).join('/')}, ${stops.length} arrêts, ${carreaux.length} carreaux`,
  )
  process.exit(0)
}

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
