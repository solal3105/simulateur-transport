// Dépose, une fois pour toutes, les habitants, les emplois et les arrêts d'un réseau dans la table privée
// « modele », dont la fonction serveur « communaute » a besoin pour recalculer les réseaux publiés. La
// fonction n'accepte que les données exactes du jeu, reconnues par leur empreinte (EMPREINTES dans
// supabase/functions/communaute/index.ts) : il faut donc l'avoir redéployée avec la bonne empreinte.
//
//   node scripts/deposer-modele.mjs idf
//
// L'adresse de la base et sa clé publique viennent de .env.example, où elles sont publiques par nature.
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
if (!ville) throw new Error('Précisez le réseau : node scripts/deposer-modele.mjs idf')
const dossier = join(racine, 'public', 'data', ...(ville === 'lyon' ? [] : [ville]))
const lire = (nom) => JSON.parse(readFileSync(join(dossier, `${nom}.json`), 'utf8'))

const reponse = await fetch(`${reglages.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/communaute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: reglages.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
  body: JSON.stringify({ action: 'deposer', ville, carreaux: lire('carreaux'), arrets: lire('arrets') }),
})
console.log(ville, reponse.status, await reponse.text())
