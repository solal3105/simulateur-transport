/**
 * Recale la constante de chaque ville sur ce que le jeu calcule vraiment.
 *
 * Le moteur (scripts/modele/moteur.py) cale sa formule sur une grille nationale d'habitants et d'emplois.
 * Le jeu, lui, calcule avec les carreaux de chaque ville (public/data), faits à des dates et parfois par
 * des chaînes différentes : à Lyon, ils comptent un peu plus de monde près des arrêts de tram. Ce script
 * fait estimer par le code même du jeu (lib/modele.ts) les lignes réelles de chaque ville, compare avec la
 * prédiction du moteur, et ajoute à la constante de la ville l'écart médian, pour que le jeu retrouve la
 * même estimation que le moteur sur les lignes qui ont servi à le caler.
 *
 *   node_modules/.bin/jiti scripts/modele/recaler-jeu.ts
 *
 * À lancer après le moteur. Entrée : data/modele/controle-jeu.json, écrit par le moteur. Sortie : les
 * lignes « constantes » et « recalage » de lib/formule.ts. Le script repart toujours des constantes du
 * moteur : le relancer ne change rien.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { FORMULE } from '../../lib/formule'
import { estimer, metresParDegre, preparerCarreaux } from '../../lib/modele'
import type { ModeLigne } from '../../lib/types'
import { VILLES, type IdVille } from '../../lib/villes'

const racine = join(__dirname, '..', '..')
const lignes = JSON.parse(readFileSync(join(racine, 'data', 'modele', 'controle-jeu.json'), 'utf8')) as {
  ville: IdVille
  ligne: string
  mode: ModeLigne
  reel: number
  moteur: number
  arrets: [number, number][]
}[]

const donnees = new Map<IdVille, { carreaux: number[][]; arrets: number[][] }>()
const lire = (ville: IdVille, nom: string) => {
  const dossier = VILLES[ville].dossier
  return JSON.parse(readFileSync(join(racine, 'public', 'data', ...(dossier ? [dossier] : []), `${nom}.json`), 'utf8'))
}

const ecarts = new Map<IdVille, number[]>()
for (const l of lignes) {
  if (!donnees.has(l.ville)) donnees.set(l.ville, { carreaux: lire(l.ville, 'carreaux'), arrets: lire(l.ville, 'arrets') })
  const { carreaux, arrets } = donnees.get(l.ville)!
  const mx = metresParDegre(VILLES[l.ville].latitude)
  // Sans les arrêts de la ligne elle-même : une ligne existante ne se fait pas concurrence.
  const autres = arrets.filter((a) => !l.arrets.some((s) => Math.hypot((a[0]! - s[0]) * mx, (a[1]! - s[1]) * 111320) < 80))
  const c = preparerCarreaux(carreaux, autres, VILLES[l.ville])
  c.constante = FORMULE.constantesMoteur[l.ville]
  const e = estimer(l.mode, l.arrets, c)
  // L'ajustement du métro parisien n'est pas dans la prédiction du moteur : on le retire pour comparer.
  const jeu = Math.log(Math.max(1, e.voyageurs)) - (FORMULE.ajustements[l.ville]?.[l.mode] ?? 0)
  ecarts.set(l.ville, [...(ecarts.get(l.ville) ?? []), l.moteur - jeu])
  console.log(
    `${l.ville.padEnd(10)} ${l.ligne.padEnd(6)} ${l.mode.padEnd(6)} moteur ${String(Math.round(Math.exp(l.moteur))).padStart(8)}  jeu ${String(
      Math.round(Math.exp(jeu)),
    ).padStart(8)}  écart ${((Math.exp(jeu - l.moteur) - 1) * 100).toFixed(0).padStart(4)} %`,
  )
}

const mediane = (x: number[]) => {
  const t = [...x].sort((a, b) => a - b)
  const m = Math.floor(t.length / 2)
  return t.length % 2 ? t[m]! : (t[m - 1]! + t[m]!) / 2
}
const recalage = Object.fromEntries(
  (Object.keys(FORMULE.constantesMoteur) as IdVille[]).map((v) => [v, ecarts.has(v) ? Math.round(mediane(ecarts.get(v)!) * 10000) / 10000 : 0]),
) as Record<IdVille, number>
const constantes = Object.fromEntries(
  (Object.keys(FORMULE.constantesMoteur) as IdVille[]).map((v) => [v, Math.round((FORMULE.constantesMoteur[v] + recalage[v]) * 10000) / 10000]),
) as Record<IdVille, number>

const chemin = join(racine, 'lib', 'formule.ts')
const texte = readFileSync(chemin, 'utf8')
const ecrire = (valeurs: Record<string, number>) => `{ ${Object.entries(valeurs).map(([v, x]) => `${v}: ${x}`).join(', ')} }`
const nouveau = texte
  .replace(/^  constantes: \{[^}]*\},$/m, `  constantes: ${ecrire(constantes)},`)
  .replace(/^  recalage: \{[^}]*\},$/m, `  recalage: ${ecrire(recalage)},`)
if (nouveau === texte && JSON.stringify(recalage) !== JSON.stringify(FORMULE.recalage)) throw new Error('lib/formule.ts : lignes introuvables')
writeFileSync(chemin, nouveau)
console.log('\nRecalage par ville (en logarithme) :', recalage)
console.log('Constantes du jeu :', constantes)
