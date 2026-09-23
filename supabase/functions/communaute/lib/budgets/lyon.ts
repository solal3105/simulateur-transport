// Copie de lib/budgets/lyon.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { BudgetVille } from '../budget.ts'

/**
 * Lyon garde la règle d'origine du jeu, que nous n'avons pas encore rapprochée des comptes de Sytral
 * Mobilités. Tant que ses postes n'ont pas de source, l'écran « Comment nous calculons votre budget » ne
 * s'affiche pas pour Lyon.
 */
export const lyon: BudgetVille = {
  payeur: 'Sytral Mobilités',
  total: {
    montants: { 1: 2000, 2: 2000 },
    simple: 'Chaque mandat dispose de 2 000 millions d’euros.',
    explication: 'Chaque mandat dispose de 2 000 M€.',
    sources: [],
  },
  decides: { montants: { 1: 0, 2: 0 }, simple: '', explication: '', sources: [] },
  bus: {
    montants: { 1: 400, 2: 400 },
    simple: 'Sur cette somme, 400 millions sont réservés d’office à l’entretien des bus.',
    explication: 'Sur ces 2 000 M€, 400 M€ sont réservés d’office à l’entretien des bus.',
    sources: [],
  },
  lignes: { montants: { 1: 0, 2: 0 }, simple: '', explication: '', sources: [] },
  // Les leviers de Lyon sont ceux du jeu depuis sa première version.
  leviers: {
    tarifs: { abonnement: 74.1, ticket: 2.1 },
    rendement: { abonnements: 12, tickets: 8, versementMobilite: 28 },
    fixes: {
      gratuiteTotale: -1925,
      gratuiteMoins25: -240,
      gratuiteJeunesAbonnes: -48,
      suppressionTarifSocial: 240,
      metroNuit: -24,
      tva: 96,
    },
    textes: { metroNuit: { titre: 'Métro toute la nuit le week-end', detail: 'Les vendredis et samedis, sur les quatre lignes.' } },
    simple:
      'Chaque point de hausse des abonnements rapporte 12 millions d’euros par mandat, et chaque point de hausse des tickets 8 millions.',
    explication:
      'Ces montants sont ceux du jeu depuis sa première version. Ils correspondent à des recettes d’environ 330 M€ par an en abonnements et en tickets, sans baisse de fréquentation quand les prix montent. La gratuité totale retire ces recettes, et la TVA à 5,5 % au lieu de 10 % laisse au réseau une part plus grande de ce que paient les voyageurs.',
    sources: [],
  },
  limites: [],
  releve: '',
}
