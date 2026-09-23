// Copie dans la fonction serveur « communaute » les modules du jeu dont elle a besoin pour
// recalculer un réseau publié : les villes et leurs budgets, le catalogue, les règles, la formule et le
// modèle de fréquentation, et la lecture d'une partie. Deno exige l'extension dans les imports : on l'ajoute au passage.
//
//   node scripts/fonction-communaute.mjs
//
// À relancer après chaque modification de ces modules, puis redéployer la fonction.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const cible = join(racine, 'supabase', 'functions', 'communaute', 'lib')

// Le budget de chaque ville a son propre fichier dans lib/budgets : on les copie tous.
const budgets = readdirSync(join(racine, 'lib', 'budgets'))
  .filter((f) => f.endsWith('.ts'))
  .map((f) => `budgets/${f.slice(0, -3)}`)

for (const nom of ['types', 'villes', 'catalogue', 'regles', 'formule', 'modele', 'partie', 'budget', ...budgets]) {
  const source = readFileSync(join(racine, 'lib', `${nom}.ts`), 'utf8')
  const copie = source.replace(/from '(\.\.?\/[a-z/-]+)'/g, "from '$1.ts'")
  mkdirSync(dirname(join(cible, `${nom}.ts`)), { recursive: true })
  writeFileSync(
    join(cible, `${nom}.ts`),
    `// Copie de lib/${nom}.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.\n${copie}`,
  )
}
console.log('Modules copiés dans', cible)
