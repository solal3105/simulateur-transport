// Copie de lib/budgets/lyon.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { BudgetVille, Source } from '../budget.ts'

const SYTRAL = 'https://sytral-mobilites.fr/img_base/documents'

const CHAMBRE_REGIONALE: Source = {
  titre: 'Chambre régionale des comptes Auvergne-Rhône-Alpes, rapport sur Sytral Mobilités, juin 2025',
  url: 'https://www.ccomptes.fr/sites/default/files/2025-06/ARA202518.pdf',
  pages: 'p. 61, 66, 67 et 70',
}

const ORIENTATIONS_2026: Source = {
  titre: 'Sytral Mobilités, débat d’orientation budgétaire 2026, délibération 25-068',
  url: `${SYTRAL}/346/25-068-dob-2026-signe-pref.pdf`,
  pages: 'p. 8, 9 et 11',
}

/**
 * Le budget de Lyon est de 1 940 M€ par mandat, dont 400 M€ pour les bus : ce que Sytral Mobilités a investi
 * de 2021 à 2025, retenu comme l'investissement disponible pour le réseau à chaque mandat. Sytral a programmé
 * davantage pour 2026-2031, en empruntant ; l'explication le dit.
 */
export const lyon: BudgetVille = {
  payeur: 'Sytral Mobilités',
  total: {
    montants: { 1: 1940, 2: 1940 },
    simple: '',
    explication: '',
    sources: [],
  },
  decides: {
    montants: { 1: 0, 2: 0 },
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
    montants: { 1: 0, 2: 0 },
    simple: '',
    explication: '',
    sources: [],
  },
  // Les montants des leviers de Lyon sont ceux du jeu depuis sa première version. L'explication les met en
  // regard des comptes de Sytral, écarts compris.
  leviers: {
    tarifs: { abonnement: 75.9, ticket: 2.1 },
    rendement: { abonnements: 12, tickets: 8, versementMobilite: 28 },
    tauxVersement: 2,
    fixes: {
      gratuiteTotale: -1925,
      gratuiteMoins25: -240,
      gratuiteJeunesAbonnes: -48,
      suppressionTarifSocial: 240,
      metroNuit: -24,
      tva: 96,
    },
    simple: '',
    explication: '',
    sources: [],
  },
  limites: [],
  releve: 'septembre 2026',
}
