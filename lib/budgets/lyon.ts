import type { BudgetVille, Source } from '../budget'

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
 * Le budget de Lyon est celui du jeu depuis sa première version, 2 000 M€ par mandat dont 400 M€ pour les
 * bus. Il correspond à peu près à ce que Sytral Mobilités a investi de 2021 à 2025, et à ce qu'il peut
 * investir sans s'endetter davantage ; Sytral a programmé davantage pour 2026-2031, en empruntant.
 */
export const lyon: BudgetVille = {
  payeur: 'Sytral Mobilités',
  total: {
    montants: { 1: 2000, 2: 2000 },
    simple:
      'Sytral Mobilités peut investir environ 2 milliards d’euros par mandat sans s’endetter davantage : c’est à peu près ce qu’il a investi de 2021 à 2025.',
    explication:
      'Sytral Mobilités a investi 1,94 milliard de 2021 à 2025 : 299 M€ en 2021, 187 M€ en 2022, 283 M€ en 2023, 567 M€ en 2024 et 607 M€ en 2025. C’est aussi, à peu près, ce qu’il peut investir sans s’endetter davantage : son épargne tourne autour de 300 M€ par an (316 M€ en 2025), ce qui fait, avec les subventions, 1,5 à 2,1 milliards par mandat. Nous retenons 2 000 M€ par mandat. Sytral a programmé davantage pour 2026-2031, 3,7 milliards, en empruntant : sa dette, 1,3 milliard fin 2025, représenterait alors 12,7 années d’épargne en 2032, selon ses propres prévisions.',
    sources: [
      CHAMBRE_REGIONALE,
      {
        titre: 'Sytral Mobilités, compte financier 2025, délibération 26-028',
        url: `${SYTRAL}/371/26-028-delib-compte-financier-unique-pref.pdf`,
        pages: 'p. 9, 10 et 17',
      },
      ORIENTATIONS_2026,
    ],
  },
  decides: {
    montants: { 1: 0, 2: 0 },
    simple: '',
    explication:
      'Les chantiers en cours, comme les trams T9 et T10, sont dans le catalogue du jeu : c’est vous qui décidez de les terminer. Nous ne retirons donc rien.',
    sources: [
      {
        titre: 'Sytral Mobilités, autorisations de programme 2026, délibération 25-079',
        url: `${SYTRAL}/353/25-079-delib-ap-2026-signe-pref.pdf`,
        pages: 'p. 4 à 7',
      },
    ],
  },
  bus: {
    montants: { 1: 400, 2: 400 },
    simple: '400 millions par mandat sont réservés au renouvellement des bus et de leurs dépôts.',
    explication:
      'Sytral a programmé 498 M€ pour les bus de 2026 à 2031, puis 237 M€ jusqu’en 2035, soit environ 450 M€ par mandat, pour les bus électriques, les trolleybus, les bus au gaz et les dépôts. Le jeu en réserve 400. Le dernier achat connu, 47 bus articulés au gaz, a coûté 25 M€ hors taxes fin 2024. L’entretien courant des bus est payé par l’exploitant du réseau, en dehors de l’investissement.',
    sources: [
      ORIENTATIONS_2026,
      { ...CHAMBRE_REGIONALE, pages: 'p. 70' },
      {
        titre: 'Sytral Mobilités, achat de 47 bus articulés, délibération 24-113',
        url: `${SYTRAL}/12/24-113-delib-ugap-achat-47-bus-ar-pref.pdf`,
        pages: 'p. 2',
      },
    ],
  },
  lignes: {
    montants: { 1: 0, 2: 0 },
    simple: '',
    explication:
      'Le jeu ne réserve rien à l’entretien du réseau existant, pour lequel Sytral prévoit 486 M€ de 2026 à 2031 : les grandes modernisations du métro sont dans le catalogue, au choix du joueur.',
    sources: [ORIENTATIONS_2026],
  },
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
  limites: [
    'Le débat d’orientation budgétaire 2026 a été voté par l’ancienne majorité. La nouvelle présidence de Sytral prépare un plan de mandat 2026-2031, pas encore voté ; elle a annoncé l’abandon du TEOL au profit du métro E, ce que seule la presse rapporte.',
    'Le jeu ne réserve rien à l’entretien du réseau existant, alors que Sytral y consacre 70 à 80 M€ par an.',
    'Les coûts du catalogue datent d’avant décembre 2025 : Sytral a depuis réévalué plusieurs projets, par exemple la modernisation de la ligne D, passée de 339 à 522 M€.',
    'Le projet d’électrification des bus du catalogue recoupe en partie la réserve des bus, qui comprend déjà les bus électriques.',
  ],
  releve: 'septembre 2026',
}
