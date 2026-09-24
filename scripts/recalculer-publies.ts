/**
 * Recalcule les réseaux déjà publiés avec les règles et la formule actuelles du jeu, et écrit les requêtes
 * SQL qui mettent à jour leurs chiffres dans la table « reseaux ». La page d'un réseau recalcule tout à
 * partir de sa partie, mais les listes de la communauté affichent les chiffres enregistrés à la publication :
 * après un changement de formule ou de budget, il faut les remettre d'accord.
 *
 *   1. Exporter les réseaux : select id, partie from public.reseaux, dans un fichier JSON (tableau d'objets).
 *   2. node_modules/.bin/jiti scripts/recalculer-publies.ts reseaux.json > recalcul.sql
 *   3. Relire recalcul.sql, puis l'exécuter sur la base.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { preparerCarreaux } from '../lib/modele'
import { normaliserPartie, villeDePartie } from '../lib/partie'
import { resumer } from '../lib/regles'
import { fleuvesDe, preparerTerrain } from '../lib/terrain'
import { VILLES } from '../lib/villes'

const racine = join(__dirname, '..')
const reseaux = JSON.parse(readFileSync(process.argv[2]!, 'utf8')) as { id: string; partie: unknown }[]

for (const r of reseaux) {
  const ville = villeDePartie(r.partie)
  if (!ville) {
    console.log(`-- ${r.id} : partie illisible, laissée telle quelle`)
    continue
  }
  const dossier = VILLES[ville].dossier
  const lire = (nom: string) =>
    JSON.parse(readFileSync(join(racine, 'public', 'data', ...(dossier ? [dossier] : []), `${nom}.json`), 'utf8'))
  // Le coût des lignes tient compte du relief et des fleuves, comme dans le jeu et la fonction serveur.
  const terrain = preparerTerrain(lire('relief'), fleuvesDe(lire('fond')))
  const carreaux = preparerCarreaux(lire('carreaux'), lire('arrets'), VILLES[ville], terrain)
  const partie = normaliserPartie(r.partie, carreaux)
  if (!partie) {
    console.log(`-- ${r.id} : partie illisible avec les données actuelles, laissée telle quelle`)
    continue
  }
  const s = resumer(partie.chantiers, partie.lignes, partie.leviers, VILLES[ville])
  console.log(
    `update public.reseaux set voyageurs = ${s.voyageurs}, investi = ${Math.round(s.investi)}, retenus = ${s.retenus}, libre = ${partie.libre} where id = '${r.id}';`,
  )
}
