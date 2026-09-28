/**
 * Les bouts de ligne d'où le joueur peut prolonger, que le modèle ne connaît pas par ailleurs : lib/terminus.ts.
 *
 *   - Les terminus des bus à haut niveau de service et des téléphériques du réseau actuel, tirés des lignes de
 *     public/data/<réseau>/lignes.json. Ceux du métro et du tram sont déjà dans les arrêts du modèle ; ceux des bus et
 *     du câble n'y sont pas, car ils ne comptent pas comme une desserte.
 *   - Les deux bouts des projets du catalogue qui prolongent une ligne existante (champ `prolonge`) : le terminus d'où
 *     ils partent, et leur dernière station, d'où le joueur peut les continuer au mandat suivant.
 *
 * La fonction serveur « communaute » reçoit ce fichier avec le modèle, sans les parcours des projets qu'elle ne garde
 * pas : elle reconnaît ainsi un prolongement comme le jeu.
 *
 *   node_modules/.bin/jiti scripts/terminus.ts
 *
 * À relancer après scripts/lignes-osm.mjs ou un changement de parcours, puis node scripts/fonction-communaute.mjs et
 * redéployer la fonction.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { CATALOGUES } from '../lib/catalogue'
import { terminusDe, type ReseauActuel } from '../lib/reseau'
import { VILLES, type IdVille } from '../lib/villes'

const racine = join(__dirname, '..')
const arrondi = (p: [number, number]) => [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]

const parReseau = (Object.keys(VILLES) as IdVille[]).map((ville) => {
  const dossier = VILLES[ville].dossier
  const reseau = JSON.parse(
    readFileSync(join(racine, 'public', 'data', ...(dossier ? [dossier] : []), 'lignes.json'), 'utf8'),
  ) as ReseauActuel
  const terminus = (mode: 'bus' | 'cable') =>
    reseau.lignes.filter((l) => l.mode === mode).flatMap((l) => terminusDe(l).map((s) => arrondi(s.pos)))
  return `  ${ville}: { bus: ${JSON.stringify(terminus('bus'))}, cable: ${JSON.stringify(terminus('cable'))} },`
})

const projets = Object.values(CATALOGUES)
  .flatMap((c) => c.projets)
  .filter((p) => p.prolonge && p.parcours?.length && (p.mode === 'metro' || p.mode === 'tram'))
  .map((p) => {
    const branches = p.parcours!
    const bouts = branches.map((b) => ({ nom: b.at(-1)!.nom ?? p.nom, pos: arrondi(b.at(-1)!.pos) }))
    return `  ${JSON.stringify(p.id)}: { ligne: ${JSON.stringify(p.prolonge)}, mode: '${p.mode}', depuis: ${JSON.stringify(arrondi(branches[0]![0]!.pos))}, bouts: ${JSON.stringify(bouts)} },`
  })

writeFileSync(
  join(racine, 'lib', 'terminus.ts'),
  `// Écrit par scripts/terminus.ts à partir des lignes du réseau actuel et des catalogues : ne pas modifier à la main.
import type { ModeLigne } from './types'
import type { IdVille } from './villes'

/** Les terminus des bus à haut niveau de service et des téléphériques de chaque réseau, [lon, lat]. */
export const TERMINUS: Record<IdVille, { bus: [number, number][]; cable: [number, number][] }> = {
${parReseau.join('\n')}
}

/**
 * Les projets du catalogue qui prolongent une ligne existante : la ligne, son mode, le terminus d'où ils partent, et
 * la dernière station de chaque branche, d'où l'on peut les continuer.
 */
export const BOUTS_PROJETS: Record<
  string,
  { ligne: string; mode: ModeLigne; depuis: [number, number]; bouts: { nom: string; pos: [number, number] }[] }
> = {
${projets.join('\n')}
}
`,
)
console.log('lib/terminus.ts écrit')
