/**
 * Télécharge depuis OpenStreetMap (Overpass) les éléments du fond de carte.
 * Les fichiers bruts vont dans data/osm, qui n'est pas versionné.
 *
 *   node scripts/fetch-osm.mjs && npm run data
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'osm')
mkdirSync(dir, { recursive: true })

const QUERIES = {
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
}

// On peut ne télécharger que certaines couches : node scripts/fetch-osm.mjs parcs routes
const demandees = process.argv.slice(2)
for (const [name, body] of Object.entries(QUERIES)) {
  if (demandees.length && !demandees.includes(name)) continue
  // Le serveur public refuse souvent les requêtes aux heures chargées : on réessaie.
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'User-Agent': 'simulateur-transport-tcl', Accept: 'application/json' },
      body: new URLSearchParams({ data: `[out:json][timeout:120];${body}` }),
    })
    if (response.ok) {
      writeFileSync(join(dir, `${name}.json`), await response.text())
      console.log(`${name} : ok`)
      break
    }
    console.log(`${name} : ${response.status}, nouvel essai`)
    await new Promise((r) => setTimeout(r, 5000 * attempt))
  }
}
