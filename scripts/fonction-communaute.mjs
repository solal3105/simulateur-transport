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
 * Le serveur ne recalcule que les chiffres d'un réseau : dans sa copie des catalogues et des budgets, on vide les textes
 * et on retire les tracés et les sources, qui pèsent plus que tout le reste. Les fichiers sont mis en forme par Prettier :
 * un tableau ou un objet sur plusieurs lignes se ferme par « ], » ou « }, » à la marge du champ qui l'ouvre, et un texte
 * trop long passe seul sur la ligne suivante. Un champ vaut null quand on le retire tout à fait.
 */
function alleger(source, champs) {
  const lignes = source.split('\n')
  const gardees = []
  for (let i = 0; i < lignes.length; i += 1) {
    const champ = /^(\s*)([a-zA-Z]+):(.*)$/.exec(lignes[i])
    const remplacement = champ ? champs[champ[2]] : undefined
    if (remplacement === undefined) {
      gardees.push(lignes[i])
      continue
    }
    const [, marge, nom, reste] = champ
    const ouverture = reste.trim()
    if (ouverture === '[' || ouverture === '{') {
      const fermeture = `${marge}${ouverture === '[' ? ']' : '}'},`
      while (lignes[i] !== fermeture) i += 1
    } else if (ouverture === '') i += 1
    if (remplacement !== null) gardees.push(`${marge}${nom}: ${remplacement},`)
  }
  return gardees.join('\n')
}
const CHAMPS_CATALOGUE = {
  description: "''",
  statut: null,
  parcours: null,
  precisions: null,
  sources: null,
  planReel: null,
  histoire: null,
  avis: null,
  presse: null,
}
const CHAMPS_BUDGET = { simple: "''", explication: "''", sources: '[]', limites: '[]', textes: null }

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
  const source = nom.startsWith('catalogues/')
    ? alleger(lu, CHAMPS_CATALOGUE)
    : nom.startsWith('budgets/')
      ? alleger(lu, CHAMPS_BUDGET)
      : lu
  const copie = source.replace(/from '(\.\.?\/[a-z/-]+)'/g, "from '$1.ts'")
  mkdirSync(dirname(join(cible, `${nom}.ts`)), { recursive: true })
  writeFileSync(
    join(cible, `${nom}.ts`),
    `// Copie de lib/${nom}.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.\n${copie}`,
  )
}
console.log('Modules copiés dans', cible)
