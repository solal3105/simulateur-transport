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
  stops:
    '(node["railway"="tram_stop"](45.62,4.70,45.88,5.12);node["railway"="station"]["station"="subway"](45.62,4.70,45.88,5.12);node["public_transport"="stop_position"]["subway"="yes"](45.62,4.70,45.88,5.12););out;',
}

for (const [name, body] of Object.entries(QUERIES)) {
  // Le serveur public refuse souvent les requêtes aux heures chargées : on réessaie.
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'User-Agent': 'simulateur-transport-tcl', Accept: 'application/json' },
      body: new URLSearchParams({ data: `[out:json][timeout:60];${body}` }),
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
