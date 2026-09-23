/**
 * Télécharge depuis OpenStreetMap (Overpass) les éléments du fond de carte d'une ville.
 * Les fichiers bruts vont dans data/osm (Lyon) ou data/osm/<ville>, qui ne sont pas versionnés.
 *
 *   node scripts/fetch-osm.mjs && npm run data
 *   node scripts/fetch-osm.mjs toulouse && node scripts/build-data.mjs toulouse
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const VILLES = {
  lyon: {
    rivers: 'way["waterway"="river"]["name"~"Rhône|Saône"](45.64,4.70,45.86,5.12);out geom;',
    metro: 'way["railway"="subway"](45.69,4.78,45.80,4.96);out geom;',
    tram: 'way["railway"="tram"](45.66,4.75,45.82,5.05);out geom;',
    parcs:
      '(way["leisure"="park"](45.66,4.70,45.86,5.12);relation["leisure"="park"](45.66,4.70,45.86,5.12);way["landuse"="forest"](45.66,4.70,45.86,5.12);way["natural"="wood"](45.66,4.70,45.86,5.12););out geom;',
    eau: '(way["natural"="water"](45.66,4.70,45.86,5.12);relation["natural"="water"](45.66,4.70,45.86,5.12););out geom;',
    routes: 'way["highway"~"^(motorway|trunk|primary|secondary)$"](45.66,4.70,45.86,5.12);out geom;',
    rail: 'way["railway"="rail"][!"service"](45.66,4.70,45.86,5.12);out geom;',
    communes: 'relation["boundary"="administrative"]["admin_level"="8"](45.62,4.66,45.90,5.16);out geom;',
    lieux: 'node["place"~"^(city|town|village|suburb|quarter|neighbourhood)$"](45.62,4.66,45.90,5.16);out;',
    stops:
      '(node["railway"="tram_stop"](45.62,4.70,45.88,5.12);node["railway"="station"]["station"="subway"](45.62,4.70,45.88,5.12);node["public_transport"="stop_position"]["subway"="yes"](45.62,4.70,45.88,5.12););out;',
  },
  // Les 114 communes de Tisséo, de Muret à Castelmaurou et de Léguevin à Labège.
  toulouse: {
    rivers: 'way["waterway"="river"]["name"~"Garonne"](43.38,1.15,43.82,1.70);out geom;',
    metro: 'rel["route"="subway"]["ref"~"^[AB]$"](43.50,1.33,43.70,1.56)->.l;.l out tags;way(r.l)["railway"="subway"];out geom;',
    tram: 'way["railway"~"^(tram|light_rail)$"][!"service"](43.52,1.30,43.72,1.56);out geom;',
    cable: 'way["aerialway"~"^(gondola|cable_car)$"](43.52,1.40,43.60,1.50);out geom;',
    // La ligne C, la connexion de la ligne B à Labège et la ligne Aéroport, encore en chantier.
    chantiers: 'way["railway"="construction"]["construction"~"^(subway|tram|light_rail)$"](43.50,1.30,43.72,1.56);out geom;',
    parcs:
      '(way["leisure"="park"](43.42,1.18,43.78,1.68);relation["leisure"="park"](43.42,1.18,43.78,1.68);way["landuse"="forest"](43.42,1.18,43.78,1.68);way["natural"="wood"](43.42,1.18,43.78,1.68););out geom;',
    eau: '(way["natural"="water"](43.42,1.18,43.78,1.68);relation["natural"="water"](43.42,1.18,43.78,1.68););out geom;',
    routes: 'way["highway"~"^(motorway|trunk|primary|secondary)$"](43.42,1.18,43.78,1.68);out geom;',
    rail: 'way["railway"="rail"][!"service"](43.42,1.18,43.78,1.68);out geom;',
    lieux: 'node["place"~"^(city|town|village|suburb|quarter|neighbourhood)$"](43.38,1.12,43.82,1.72);out;',
    stops:
      '(node["railway"="tram_stop"](43.50,1.30,43.72,1.56);node["railway"="station"]["station"="subway"](43.50,1.30,43.72,1.56);node["public_transport"="stop_position"]["subway"="yes"](43.50,1.30,43.72,1.56);node["aerialway"="station"](43.52,1.40,43.60,1.50););out;',
  },
  // Les 92 communes de la Métropole d'Aix-Marseille-Provence, de Martigues à La Ciotat et à Pertuis.
  marseille: {
    rivers: 'way["waterway"="river"]["name"~"Huveaune|Durance|^Arc$|Touloubre"](43.14,4.70,43.80,5.85);out geom;',
    cote: 'way["natural"="coastline"](43.10,4.65,43.82,5.90);out geom;',
    metro: 'way["railway"="subway"](43.24,5.34,43.36,5.46);out geom;',
    tram: 'way["railway"~"^(tram|light_rail)$"][!"service"](43.14,4.70,43.80,5.85);out geom;',
    chantiers: 'way["railway"="construction"]["construction"~"^(subway|tram|light_rail)$"](43.14,4.70,43.80,5.85);out geom;',
    parcs:
      '(way["leisure"="park"](43.14,4.70,43.80,5.85);relation["leisure"="park"](43.14,4.70,43.80,5.85);way["landuse"="forest"](43.14,4.70,43.80,5.85);way["natural"="wood"](43.14,4.70,43.80,5.85););out geom;',
    eau: '(way["natural"="water"](43.14,4.70,43.80,5.85);relation["natural"="water"](43.14,4.70,43.80,5.85););out geom;',
    routes: 'way["highway"~"^(motorway|trunk|primary|secondary)$"](43.14,4.70,43.80,5.85);out geom;',
    rail: 'way["railway"="rail"][!"service"](43.14,4.70,43.80,5.85);out geom;',
    lieux: 'node["place"~"^(city|town|village|suburb|quarter|neighbourhood)$"](43.10,4.65,43.82,5.90);out;',
    stops:
      '(node["railway"="tram_stop"](43.14,4.70,43.80,5.85);node["railway"="station"]["station"="subway"](43.14,4.70,43.80,5.85);node["public_transport"="stop_position"]["subway"="yes"](43.14,4.70,43.80,5.85););out;',
  },
  // Les 51 communes de la Métropole Nice Côte d'Azur, de la mer aux vallées de la Tinée et de la Vésubie.
  nice: {
    rivers: 'way["waterway"="river"]["name"~"^(Var|Le Var|Paillon|Le Paillon|Tinée|La Tinée|Vésubie|La Vésubie)$"](43.63,6.77,44.37,7.45);out geom;',
    cote: 'way["natural"="coastline"](43.55,6.70,43.85,7.55);out geom;',
    tram: 'way["railway"~"^(tram|light_rail)$"][!"service"](43.63,7.10,43.80,7.40);out geom;',
    chantiers: 'way["railway"="construction"]["construction"~"^(tram|light_rail)$"](43.63,7.10,43.80,7.40);out geom;',
    parcs:
      '(way["leisure"="park"](43.63,6.77,44.37,7.45);relation["leisure"="park"](43.63,6.77,44.37,7.45);way["landuse"="forest"](43.63,6.77,44.37,7.45);way["natural"="wood"](43.63,6.77,44.37,7.45););out geom;',
    eau: '(way["natural"="water"](43.63,6.77,44.37,7.45);relation["natural"="water"](43.63,6.77,44.37,7.45););out geom;',
    routes: 'way["highway"~"^(motorway|trunk|primary|secondary)$"](43.63,6.77,44.37,7.45);out geom;',
    rail: 'way["railway"="rail"][!"service"](43.63,6.77,44.37,7.45);out geom;',
    lieux: 'node["place"~"^(city|town|village|suburb|quarter|neighbourhood)$"](43.60,6.74,44.40,7.50);out;',
    stops: '(node["railway"="tram_stop"](43.63,7.10,43.80,7.40););out;',
  },
  // Paris et les 123 communes des Hauts-de-Seine, de la Seine-Saint-Denis et du Val-de-Marne.
  paris: {
    rivers: 'way["waterway"="river"]["name"~"^(La Seine|La Marne|Seine|Marne)$"](48.67,2.12,49.03,2.64);out geom;',
    metro: 'way["railway"="subway"][!"service"](48.67,2.12,49.03,2.64);out geom;',
    tram: 'way["railway"~"^(tram|light_rail)$"][!"service"](48.67,2.12,49.03,2.64);out geom;',
    cable: 'way["aerialway"~"^(gondola|cable_car)$"](48.72,2.42,48.80,2.50);out geom;',
    chantiers: 'way["railway"="construction"]["construction"~"^(subway|tram|light_rail)$"](48.67,2.12,49.03,2.64);out geom;',
    parcs:
      '(way["leisure"="park"](48.67,2.12,49.03,2.64);relation["leisure"="park"](48.67,2.12,49.03,2.64);way["landuse"="forest"](48.67,2.12,49.03,2.64);way["natural"="wood"](48.67,2.12,49.03,2.64););out geom;',
    eau: '(way["natural"="water"](48.67,2.12,49.03,2.64);relation["natural"="water"](48.67,2.12,49.03,2.64););out geom;',
    routes: 'way["highway"~"^(motorway|trunk|primary|secondary)$"](48.67,2.12,49.03,2.64);out geom;',
    rail: 'way["railway"="rail"][!"service"](48.67,2.12,49.03,2.64);out geom;',
    lieux: 'node["place"~"^(city|town|village|suburb|quarter|neighbourhood)$"](48.65,2.10,49.05,2.66);out;',
    stops:
      '(node["railway"="tram_stop"](48.67,2.12,49.03,2.64);node["railway"="station"]["station"="subway"](48.67,2.12,49.03,2.64);node["aerialway"="station"](48.72,2.42,48.80,2.50););out;',
  },
}

// On peut ne télécharger que certaines couches : node scripts/fetch-osm.mjs toulouse parcs routes
// Un autre serveur Overpass peut être choisi avec la variable OVERPASS_URL.
const SERVEUR = process.env.OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter'
const args = process.argv.slice(2)
const ville = args[0] in VILLES ? args.shift() : 'lyon'
const demandees = args
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'osm', ...(ville === 'lyon' ? [] : [ville]))
mkdirSync(dir, { recursive: true })

// Hors de Lyon, les contours des communes viennent de geo.api.gouv.fr, plus sûr que les grosses requêtes Overpass.
if (ville !== 'lyon' && (!demandees.length || demandees.includes('contours'))) {
  const { communes } = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'data', ville, 'communes.json'), 'utf8'))
  // Les communes sont rattachées à une intercommunalité, ou à un département pour Paris et la petite couronne.
  const epcis = [...new Set(communes.map((c) => c.epci).filter(Boolean))]
  const departements = [...new Set(communes.filter((c) => !c.epci).map((c) => c.departement))]
  const features = []
  for (const epci of epcis) {
    const r = await fetch(`https://geo.api.gouv.fr/communes?codeEpci=${epci}&fields=nom,code&format=geojson&geometry=contour`)
    features.push(...(await r.json()).features)
  }
  for (const dep of departements) {
    const r = await fetch(`https://geo.api.gouv.fr/departements/${dep}/communes?fields=nom,code&format=geojson&geometry=contour`)
    features.push(...(await r.json()).features)
  }
  writeFileSync(join(dir, 'contours.json'), JSON.stringify({ type: 'FeatureCollection', features }))
  console.log(`${ville} contours : ${features.length} communes`)
}

for (const [name, body] of Object.entries(VILLES[ville])) {
  if (demandees.length && !demandees.includes(name)) continue
  // Le serveur public refuse souvent les requêtes aux heures chargées, parfois même la connexion : on réessaie.
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(SERVEUR, {
      method: 'POST',
      headers: { 'User-Agent': 'simulateur-transport-tcl', Accept: 'application/json' },
      body: new URLSearchParams({ data: `[out:json][timeout:180];${body}` }),
    }).catch((e) => ({ ok: false, status: e.cause?.code ?? e.message }))
    if (response.ok) {
      writeFileSync(join(dir, `${name}.json`), await response.text())
      console.log(`${ville} ${name} : ok`)
      break
    }
    console.log(`${ville} ${name} : ${response.status}, nouvel essai`)
    await new Promise((r) => setTimeout(r, 15000 * attempt))
  }
}
