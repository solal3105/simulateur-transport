/**
 * Estime les projets des catalogues avec la méthode des lignes que le joueur trace : leurs voyageurs par jour et
 * leur coût, d'après leurs stations. Sert à deux choses : chiffrer les projets dont aucune étude n'a publié la
 * fréquentation (marqués `estime.voyageurs` dans lib/catalogues), et comparer notre modèle aux chiffres publiés.
 *
 *   node_modules/.bin/jiti scripts/estimer-projets.ts            tous les réseaux
 *   node_modules/.bin/jiti scripts/estimer-projets.ts marseille  un seul réseau
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { catalogueDe } from '../lib/catalogue'
import { estimer, preparerCarreaux } from '../lib/modele'
import { fleuvesDe, preparerTerrain } from '../lib/terrain'
import type { ModeLigne } from '../lib/types'
import { ID_VILLES, VILLES } from '../lib/villes'

const racine = join(__dirname, '..')
const MODES: ModeLigne[] = ['tram', 'bus', 'metro', 'cable']
const demandees = process.argv.slice(2)

for (const ville of ID_VILLES) {
  if (demandees.length && !demandees.includes(ville)) continue
  const projets = catalogueDe(ville).filter((p) => p.parcours)
  if (!projets.length) continue
  const dossier = VILLES[ville].dossier
  const lire = (nom: string) =>
    JSON.parse(readFileSync(join(racine, 'public', 'data', ...(dossier ? [dossier] : []), `${nom}.json`), 'utf8'))
  const terrain = preparerTerrain(lire('relief'), fleuvesDe(lire('fond')))
  const carreaux = preparerCarreaux(lire('carreaux'), lire('arrets'), VILLES[ville], terrain)
  console.log(`\n${VILLES[ville].nom}`)
  for (const p of projets) {
    const mode = MODES.find((m) => m === p.mode)
    if (!mode) continue
    // Chaque branche est estimée comme une ligne : on additionne leurs voyageurs et leurs coûts. Le terminus d'une
    // ligne prolongée a déjà ses voyageurs : on n'estime que la partie nouvelle.
    const branches = p.parcours!.map((b, k) => {
      const parcours = p.prolonge && k === 0 ? b.slice(1) : b
      const points = parcours.map((s) => s.pos)
      const passages = parcours.flatMap((s, i) => (s.nom ? [] : [i]))
      return estimer(mode, points, carreaux, { passages })
    })
    const voyageurs = branches.reduce((t, e) => t + e.voyageurs, 0)
    const cout = branches.reduce((t, e) => t + e.cout, 0)
    const km = branches.reduce((t, e) => t + e.km, 0)
    const publie = p.estime?.voyageurs
      ? 'aucun chiffre publié'
      : `${p.voyageurs} publiés (${Math.round((voyageurs / p.voyageurs - 1) * 100)} %)`
    console.log(
      `  ${p.id} : ${Math.round(voyageurs / 100) * 100} voyageurs estimés, ${publie} ; ${km.toFixed(1)} km, coût estimé ${cout} M€ pour ${p.cout} publiés`,
    )
  }
}
