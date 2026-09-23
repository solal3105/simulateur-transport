/**
 * Vérifie le budget de chaque ville (lib/budgets) avant de l'afficher : chaque poste qui porte un montant a
 * une explication et au moins une source, chaque source a un titre et une adresse https, les textes n'ont
 * pas de tiret long, et il reste au joueur un montant positif à chaque mandat. Avec --liens, ouvre aussi
 * chaque adresse et signale celles qui ne répondent pas.
 *
 *   npm run budgets [-- --liens]
 *
 * La méthode commune et la liste des étapes pour une nouvelle ville sont dans docs/budgets.md.
 */
import { estSource, libre, POSTES, type Source } from '../lib/budget'
import { VILLES } from '../lib/villes'

const erreurs: string[] = []
const avertissements: string[] = []
const adresses = new Map<string, string>()
const TIRETS = /[–—]/

for (const ville of Object.values(VILLES)) {
  const b = ville.budget
  if (!estSource(b)) {
    avertissements.push(`${ville.nom} : budget sans source, l’écran détaillé du budget ne s’affiche pas.`)
    continue
  }
  const textes = [b.payeur, ...b.limites]
  for (const p of POSTES) {
    const poste = b[p]
    const porte = poste.montants[1] !== 0 || poste.montants[2] !== 0
    if (porte && !poste.explication.trim()) erreurs.push(`${ville.nom}, ${p} : un montant sans explication.`)
    if (porte && !poste.sources.length) erreurs.push(`${ville.nom}, ${p} : un montant sans source.`)
    textes.push(poste.explication)
    poste.sources.forEach((s: Source) => {
      textes.push(s.titre, s.pages ?? '')
      if (!s.titre.trim()) erreurs.push(`${ville.nom}, ${p} : une source sans titre.`)
      if (!/^https:\/\/\S+$/.test(s.url)) erreurs.push(`${ville.nom}, ${p} : une adresse qui n’est pas en https, ${s.url}`)
      adresses.set(s.url, `${ville.nom}, ${s.titre}`)
    })
  }
  for (const m of [1, 2] as const) {
    if (libre(b, m) < 0) erreurs.push(`${ville.nom}, mandat ${m} : la part réservée dépasse l’enveloppe.`)
  }
  if (textes.some((t) => TIRETS.test(t))) erreurs.push(`${ville.nom} : un tiret long ou demi-long dans les textes.`)
  if (!b.releve) erreurs.push(`${ville.nom} : il manque le mois du relevé.`)
  if (!b.limites.length) avertissements.push(`${ville.nom} : aucune limite indiquée, ce qui est rarement vrai.`)
}

async function essayer(url: string) {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'Mozilla/5.0' } })
    return r.status
  } catch (e) {
    return e instanceof Error ? e.name : 'erreur'
  }
}

async function main() {
  if (process.argv.includes('--liens')) {
    const resultats = await Promise.all([...adresses].map(async ([url, qui]) => ({ url, qui, etat: await essayer(url) })))
    for (const r of resultats) {
      if (r.etat !== 200) avertissements.push(`${r.qui} : l’adresse répond ${r.etat}, à vérifier à la main (${r.url}).`)
    }
    console.log(`${adresses.size} adresses ouvertes.`)
  }
  for (const a of avertissements) console.log(`Attention : ${a}`)
  for (const e of erreurs) console.log(`Erreur : ${e}`)
  if (erreurs.length) process.exit(1)
  console.log(`Budgets vérifiés pour ${Object.keys(VILLES).length} villes.`)
}

void main()
