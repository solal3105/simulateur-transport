// Copie de lib/budgets/idf.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { BudgetVille, Source } from '../budget.ts'

const CONTRAT_DE_PLAN: Source = {
  titre: 'Région Île-de-France, délibération CR 2024-038, avenant mobilités du contrat de plan 2023-2027',
  url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
  pages: 'p. 10, 12, 28 et 29',
}

const IDFM_2026: Source = {
  titre: 'Île-de-France Mobilités, second supplément au prospectus, budget 2026, juillet 2026',
  // Le site d'Île-de-France Mobilités refuse les liens directs vers ses PDF ; sa plateforme de contenu sert le même fichier.
  url: 'https://portail-idfm.cdn.prismic.io/portail-idfm/DLXhLILE_v7mwnIc_IDFM-2%C3%A8mesuppl%C3%A9mentauPB2025-versionfinaleavecnum%C3%A9rod%27approbation-41381514.1--41397812.1-.pdf',
  pages: 'p. 22, 24 et 25',
}

const CHAMBRE_REGIONALE: Source = {
  titre: 'Chambre régionale des comptes d’Île-de-France, rapport sur Île-de-France Mobilités, décembre 2025',
  url: 'https://www.ccomptes.fr/sites/default/files/2025-12/IDR2025-60.pdf',
  pages: 'p. 23, 96, 109, 110 et 114',
}

const RATP_2025: Source = {
  titre: 'RATP, rapport financier et de durabilité 2025',
  url: 'https://ratpgroup.com/api/media/rapport-financier-et-de-durabilite-annuel-2025---groupe-ratp.pdf',
  pages: 'p. 23',
}

const SENAT: Source = {
  titre: 'Sénat, rapport n° 139 sur le projet de loi de finances pour 2026, transports',
  url: 'https://www.senat.fr/rap/l25-139-310-2/l25-139-310-21.pdf',
  pages: 'p. 45 et 55',
}

export const idf: BudgetVille = {
  payeur: 'Île-de-France Mobilités, la RATP, l’État et la Région',
  total: {
    montants: { 1: 46100, 2: 28100 },
    simple: '',
    explication: '',
    sources: [],
  },
  decides: {
    montants: { 1: 17900, 2: 950 },
    simple: '',
    explication: '',
    sources: [],
  },
  bus: {
    montants: { 1: 3000, 2: 3000 },
    simple: '',
    explication: '',
    sources: [],
  },
  lignes: {
    montants: { 1: 21200, 2: 20150 },
    simple: '',
    explication: '',
    sources: [],
  },
  leviers: {
    tarifs: { abonnement: 90.8, ticket: 2.55 },
    rendement: { abonnements: 173, tickets: 85, versementMobilite: 390 },
    fixes: { gratuiteTotale: -26200, gratuiteMoins25: -3900, suppressionTarifSocial: 1300, metroNuit: -400, tva: 1100 },
    simple: '',
    explication: '',
    sources: [],
  },
  limites: [],
  releve: 'septembre 2026',
}
