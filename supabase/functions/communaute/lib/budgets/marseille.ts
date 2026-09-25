// Copie de lib/budgets/marseille.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { BudgetVille, Source } from '../budget.ts'

const DELIBERATIONS = 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations'

const ROB_2026: Source = {
  titre: 'Métropole d’Aix-Marseille-Provence, rapport d’orientation budgétaire 2026',
  url: `${DELIBERATIONS}/2026/04/16/ANNEXE/160507_165637_160507%20Annexe%20ROB%202026%20vDEF%20v2.pdf`,
  pages: 'p. 33, 81, 128 et 129',
}

const CA_2024: Source = {
  titre: 'Métropole d’Aix-Marseille-Provence, compte administratif 2024 du budget des transports',
  url: `${DELIBERATIONS}/2025/06/26/ANNEXE/122152_137877_Rapport%20de%20presentation%20CA%202024%20-%20buget%20annexe%20transports%20V7.pdf`,
  pages: 'p. 9 et 15',
}

export const marseille: BudgetVille = {
  payeur: 'la Métropole d’Aix-Marseille-Provence',
  total: {
    montants: { 1: 1800, 2: 1800 },
    simple: '',
    explication: '',
    sources: [],
  },
  decides: {
    montants: { 1: 50, 2: 0 },
    simple: '',
    explication: '',
    sources: [],
  },
  bus: {
    montants: { 1: 400, 2: 400 },
    simple: '',
    explication: '',
    sources: [],
  },
  lignes: {
    montants: { 1: 650, 2: 650 },
    simple: '',
    explication: '',
    sources: [],
  },
  leviers: {
    tarifs: { abonnement: 49.5, ticket: 1.7 },
    rendement: { abonnements: 4.5, tickets: 3.8, versementMobilite: 26 },
    tauxVersement: 2,
    fixes: { gratuiteTotale: -892, gratuiteMoins25: -108, suppressionTarifSocial: 9, metroNuit: -18, tva: 37 },
    simple: '',
    explication: '',
    sources: [],
  },
  limites: [],
  releve: 'septembre 2026',
}
