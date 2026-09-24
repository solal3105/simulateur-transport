// Dépose, une fois pour toutes, le terrain d'un réseau (relief et grands cours d'eau) dans la table privée
// « modele », dont la fonction serveur « communaute » a besoin pour recalculer le coût des lignes publiées.
// La fonction n'accepte que les données exactes du jeu, reconnues par leur empreinte (EMPREINTES_TERRAIN
// dans supabase/functions/communaute/index.ts).
//
//   node scripts/deposer-terrain.mjs lyon
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const reglages = Object.fromEntries(
  readFileSync(join(racine, '.env.example'), 'utf8')
    .split('\n')
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => l.split('=')),
)
const ville = process.argv[2]
if (!ville) throw new Error('Précisez le réseau : node scripts/deposer-terrain.mjs lyon')
const dossier = join(racine, 'public', 'data', ...(ville === 'lyon' ? [] : [ville]))
const lire = (nom) => JSON.parse(readFileSync(join(dossier, `${nom}.json`), 'utf8'))
// Les mêmes grands cours d'eau que lib/terrain.ts.
const GRANDS = new Set(['rhone', 'saone', 'garonne', 'seine', 'marne', "l'oise", 'var', 'durance'])
const fleuves = lire('fond')
  .features.filter((f) => f.properties.kind === 'fleuve' && GRANDS.has(f.properties.name ?? ''))
  .flatMap((f) => f.geometry.coordinates)

const reponse = await fetch(`${reglages.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/communaute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: reglages.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
  body: JSON.stringify({ action: 'deposer-terrain', ville, relief: lire('relief'), fleuves }),
})
console.log(ville, reponse.status, await reponse.text())
