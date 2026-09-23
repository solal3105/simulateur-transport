import type { BudgetVille } from '../budget'

/**
 * Lyon garde la règle d'origine du jeu, que nous n'avons pas encore rapprochée des comptes de Sytral
 * Mobilités. Tant que ses postes n'ont pas de source, l'écran « Comment nous calculons votre budget » ne
 * s'affiche pas pour Lyon.
 */
export const lyon: BudgetVille = {
  payeur: 'Sytral Mobilités',
  total: {
    montants: { 1: 2000, 2: 2000 },
    explication: 'Chaque mandat dispose de 2 000 M€.',
    sources: [],
  },
  decides: { montants: { 1: 0, 2: 0 }, explication: '', sources: [] },
  bus: {
    montants: { 1: 400, 2: 400 },
    explication: 'Sur ces 2 000 M€, 400 M€ sont réservés d’office à l’entretien des bus.',
    sources: [],
  },
  lignes: { montants: { 1: 0, 2: 0 }, explication: '', sources: [] },
  limites: [],
  releve: '',
}
