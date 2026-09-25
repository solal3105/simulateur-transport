// Copie de lib/budgets/toulouse.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { BudgetVille, Source } from '../budget.ts'

const TISSEO = 'https://tisseo-collectivites.fr/sites/default/files/media'

const BUDGET_2026: Source = {
  titre: 'Tisséo Collectivités, budget primitif 2026',
  url: `${TISSEO}/pdfs/deliberations/2026/CS%2011.02.2026/D.2026.02.11.7.1-PJ.pdf`,
  pages: 'p. 4, 19 et 20',
}

export const toulouse: BudgetVille = {
  payeur: 'Tisséo Collectivités',
  total: {
    montants: { 1: 2600, 2: 1300 },
    simple: '',
    explication: '',
    sources: [],
  },
  decides: {
    montants: { 1: 1800, 2: 0 },
    simple: '',
    explication: '',
    sources: [],
  },
  bus: {
    montants: { 1: 150, 2: 200 },
    simple: '',
    explication: '',
    sources: [],
  },
  lignes: {
    montants: { 1: 450, 2: 450 },
    simple: '',
    explication: '',
    sources: [],
  },
  leviers: {
    tarifs: { abonnement: 59, ticket: 1.9 },
    rendement: { abonnements: 3, tickets: 3.3, versementMobilite: 21 },
    tauxVersement: 2,
    fixes: { gratuiteTotale: -694, gratuiteMoins25: -150, suppressionTarifSocial: 78, metroNuit: -11, tva: 30 },
    simple: '',
    explication: '',
    sources: [],
  },
  limites: [],
  releve: 'septembre 2026',
}
