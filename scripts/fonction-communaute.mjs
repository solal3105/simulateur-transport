// Copie dans la fonction serveur « communaute » les modules du jeu dont elle a besoin pour
// recalculer un réseau publié : les villes et leurs budgets, les catalogues, les règles, la formule et le
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

// Le budget et le catalogue de chaque ville ont leur propre fichier, dans lib/budgets et lib/catalogues : on les copie tous.
const parVille = (dossier) =>
  readdirSync(join(racine, 'lib', dossier))
    .filter((f) => f.endsWith('.ts'))
    .map((f) => `${dossier}/${f.slice(0, -3)}`)

/**
 * Le serveur ne recalcule que les chiffres d'un réseau : dans sa copie des catalogues, on retire les textes, les tracés et
 * les sources des projets, qui pèsent plus que tout le reste. Les fichiers sont mis en forme par Prettier : chaque champ
 * d'un projet commence à quatre espaces, et un tableau se ferme par « ], » à la même marge.
 */
const ALLEGES = /^ {4}(description|statut|parcours|precisions|sources):/
function alleger(source) {
  const lignes = source.split('\n')
  const gardees = []
  for (let i = 0; i < lignes.length; i += 1) {
    const champ = ALLEGES.exec(lignes[i])?.[1]
    if (!champ) {
      gardees.push(lignes[i])
      continue
    }
    if (lignes[i].endsWith('[')) while (lignes[i] !== '    ],') i += 1
    else if (lignes[i].endsWith(':')) i += 1
    // La description est obligatoire dans le type d'un projet.
    if (champ === 'description') gardees.push("    description: '',")
  }
  return gardees.join('\n')
}

for (const nom of [
  'types',
  'villes',
  'catalogue',
  'regles',
  'formule',
  'modele',
  'partie',
  'budget',
  'leviers',
  'terrain',
  'couts',
  ...parVille('budgets'),
  ...parVille('catalogues'),
]) {
  const lu = readFileSync(join(racine, 'lib', `${nom}.ts`), 'utf8')
  const source = nom.startsWith('catalogues/') ? alleger(lu) : lu
  const copie = source.replace(/from '(\.\.?\/[a-z/-]+)'/g, "from '$1.ts'")
  mkdirSync(dirname(join(cible, `${nom}.ts`)), { recursive: true })
  writeFileSync(
    join(cible, `${nom}.ts`),
    `// Copie de lib/${nom}.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.\n${copie}`,
  )
}
console.log('Modules copiés dans', cible)
