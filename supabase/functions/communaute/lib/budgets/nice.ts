// Copie de lib/budgets/nice.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { BudgetVille, Source } from '../budget.ts'

const NCA = 'https://www.nicecotedazur.org/wp-content/uploads'
/** Les délibérations de la Métropole n'ont pas d'adresse directe : on choisit la séance dans le menu de ce site. */
const WEBDELIB = 'https://webdelib.nicecotedazur.org/WebDelib/'

/** Les comptes de 2020 à 2025, d'où viennent les investissements réalisés. */
const COMPTES: Source[] = [
  {
    titre: 'Métropole Nice Côte d’Azur, compte administratif 2020',
    url: `${NCA}/2023/10/Rapport-de-presentation-CA-2020.pdf`,
    pages: 'p. 35 et 36',
  },
  {
    titre: 'Métropole Nice Côte d’Azur, compte administratif 2021',
    url: `${NCA}/2023/10/Rapport-presenataion-CA-2021.pdf`,
    pages: 'p. 34',
  },
  { titre: 'Métropole Nice Côte d’Azur, compte financier 2022', url: `${NCA}/2023/10/Rapport-presentation-CFU-2022.pdf`, pages: 'p. 33' },
  {
    titre: 'Métropole Nice Côte d’Azur, compte financier 2023',
    url: `${NCA}/2024/07/mnca-compte-financier-unique-11-07-24.pdf`,
    pages: 'p. 35',
  },
  {
    titre: 'Métropole Nice Côte d’Azur, compte financier 2024',
    url: `${NCA}/2025/06/Rapport-Compte-Financier-Unique-2024.pdf`,
    pages: 'p. 38',
  },
  { titre: 'Métropole Nice Côte d’Azur, compte financier 2025', url: `${NCA}/2026/06/MNCA-Rapport-CFU-2025-vf.pdf`, pages: 'p. 25 et 33' },
]

const ENVELOPPES_2026: Source = {
  titre: 'Métropole Nice Côte d’Azur, séance du 22 juin 2026, délibération n° 21.5, annexe 2 des autorisations de programme',
  url: WEBDELIB,
  pages: 'p. 1',
}

export const nice: BudgetVille = {
  payeur: 'la Métropole Nice Côte d’Azur',
  total: {
    montants: { 1: 725, 2: 290 },
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
    montants: { 1: 160, 2: 160 },
    simple: '',
    explication: '',
    sources: [],
  },
  lignes: {
    montants: { 1: 35, 2: 35 },
    simple: '',
    explication: '',
    sources: [],
  },
  leviers: {
    tarifs: { abonnement: 45, ticket: 1.7 },
    rendement: { abonnements: 1.3, tickets: 2.8, versementMobilite: 6.1 },
    tauxVersement: 2,
    fixes: { gratuiteTotale: -424, gratuiteMoins25: -51, metroNuit: -6, tva: 18 },
    simple: '',
    explication: '',
    sources: [],
  },
  limites: [],
  releve: 'septembre 2026',
}
