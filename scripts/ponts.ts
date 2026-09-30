/**
 * Les ponts routiers sur les grands cours d'eau de chaque réseau : lib/ponts.ts, là où un pont routier marqué dans
 * OpenStreetMap (data/osm/<réseau>/ponts.json, écrit par node scripts/fetch-osm.mjs <réseau> ponts) croise un des grands
 * cours d'eau que le coût d'une ligne compte (lib/terrain.ts). Un bus à haut niveau de service qui franchit le fleuve
 * près de l'un d'eux emprunte le pont existant, sans en payer un neuf. La fonction serveur « communaute » reçoit ce
 * fichier avec le modèle.
 *
 *   node_modules/.bin/jiti scripts/ponts.ts
 *
 * À relancer après une nouvelle extraction, puis node scripts/fonction-communaute.mjs et redéployer la fonction.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { fleuvesDe } from '../lib/terrain'
import { VILLES, type IdVille } from '../lib/villes'

const racine = join(__dirname, '..')
const arrondi = (v: number) => Math.round(v * 1e5) / 1e5
/** En deçà, en mètres, deux croisements sont le même pont : les deux sens d'une route à chaussées séparées. */
const MEME_PONT = 40

type P = [number, number]
const croisement = (a: P, b: P, c: P, d: P): P | null => {
  const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])
  if (!den) return null
  const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den
  const u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])] : null
}

const parReseau = (Object.keys(VILLES) as IdVille[]).map((ville) => {
  const dossier = VILLES[ville].dossier
  const lire = (nom: string) =>
    JSON.parse(readFileSync(join(racine, 'public', 'data', ...(dossier ? [dossier] : []), `${nom}.json`), 'utf8'))
  const fleuves = fleuvesDe(lire('fond'))
  const osm = JSON.parse(readFileSync(join(racine, 'data', 'osm', ...(ville === 'lyon' ? [] : [ville]), 'ponts.json'), 'utf8'))
  const routes = (osm.elements as { geometry?: { lat: number; lon: number }[] }[]).map((e) =>
    (e.geometry ?? []).map((g): P => [g.lon, g.lat]),
  )
  const mx = 111320 * Math.cos((VILLES[ville].latitude * Math.PI) / 180)
  const ponts: P[] = []
  for (const r of routes)
    for (let i = 1; i < r.length; i += 1)
      for (const fl of fleuves)
        for (let j = 1; j < fl.length; j += 1) {
          const p = croisement(r[i - 1]!, r[i]!, fl[j - 1]!, fl[j]!)
          if (p && ponts.every((q) => Math.hypot((q[0] - p[0]) * mx, (q[1] - p[1]) * 111320) >= MEME_PONT)) ponts.push(p)
        }
  console.log(ville, ponts.length, 'ponts')
  return `  ${ville}: ${JSON.stringify(ponts.map((p) => [arrondi(p[0]), arrondi(p[1])]))},`
})

writeFileSync(
  join(racine, 'lib', 'ponts.ts'),
  `// Écrit par scripts/ponts.ts à partir des routes et des grands cours d'eau du fond de carte : ne pas modifier à la main.
import type { IdVille } from './villes'

/** Les ponts routiers sur les grands cours d'eau de chaque réseau, [lon, lat] : là où une route principale croise le fleuve. */
export const PONTS_ROUTIERS: Record<IdVille, [number, number][]> = {
${parReseau.join('\n')}
}
`,
)
