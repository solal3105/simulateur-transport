/**
 * Le plan de la carte : le style « Liberty » d'OpenFreeMap, qui dessine OpenStreetMap en détail (toutes les rues et
 * leurs noms, les bâtiments, les parcs, l'eau) à partir de tuiles servies sans clé ni limite. On en garde une copie dans
 * lib/plan-osm.json pour ne pas dépendre du style en ligne au démarrage, allégée de ce que le jeu dessine déjà :
 *
 *   - les noms de villes et de quartiers, que la carte pose elle-même ;
 *   - les symboles des gares et des stations, que le réseau actuel montre avec ses lignes ;
 *   - les bâtiments en relief, inutiles sur une carte qu'on ne penche pas ;
 *   - le relief ombré du monde entier, qui ne sert qu'aux vues lointaines.
 *
 *   node scripts/plan-osm.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const reponse = await fetch('https://tiles.openfreemap.org/styles/liberty')
if (!reponse.ok) throw new Error(`Style introuvable : ${reponse.status}`)
const style = await reponse.json()

const retirees = (id) => id.startsWith('label_') || id === 'poi_transit' || id === 'building-3d' || id === 'natural_earth'
const couches = style.layers
  .filter((c) => !retirees(c.id))
  .map((c) => {
    // Le jeu garde ses propres noms de couches : celles du plan prennent un préfixe pour ne jamais les croiser.
    const couche = { ...c, id: `osm-${c.id}` }
    // Sans les bâtiments en relief, les bâtiments à plat restent jusqu'au zoom le plus proche.
    if (c.id === 'building') delete couche.maxzoom
    return couche
  })

const plan = {
  glyphs: style.glyphs,
  sprite: style.sprite,
  sources: { openmaptiles: style.sources.openmaptiles },
  layers: couches,
}
writeFileSync(join(racine, 'lib', 'plan-osm.json'), JSON.stringify(plan, null, 1) + '\n')
console.log(`lib/plan-osm.json écrit : ${couches.length} couches`)
