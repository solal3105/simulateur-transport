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
 * Le budget de Lyon est de 1 940 M€ par mandat, dont 400 M€ pour les bus : ce que Sytral Mobilités a investi
 * de 2021 à 2025, retenu comme l'investissement disponible pour le réseau à chaque mandat. Sytral a programmé
 * davantage pour 2026-2031, en empruntant ; l'explication le dit.
 */
export const lyon: BudgetVille = {
  payeur: 'Sytral Mobilités',
  total: {
    montants: { 1: 1940, 2: 1940 },
    simple:
      'De 2021 à 2025, Sytral Mobilités a investi 1,94 milliard d’euros. Nous retenons ce montant comme l’investissement disponible pour le réseau à chaque mandat.',
    explication:
      'Sytral Mobilités a investi 1,94 milliard de 2021 à 2025 : 299 M€ en 2021, 187 M€ en 2022, 283 M€ en 2023, 567 M€ en 2024 et 607 M€ en 2025. Nous retenons ce montant comme l’investissement disponible pour le réseau à chaque mandat. C’est aussi à peu près ce que Sytral peut investir sans s’endetter davantage : son épargne tourne autour de 300 M€ par an (316 M€ en 2025), ce qui fait, avec les subventions, 1,5 à 2,1 milliards par mandat. Sytral a programmé davantage pour 2026-2031, 3,7 milliards, en empruntant : sa dette, 1,3 milliard fin 2025, représenterait alors 12,7 années d’épargne en 2032, selon ses propres prévisions.',
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
    textes: {
      suppressionTarifSocial: {
        titre: 'Ramener les réductions solidaires à 50 %',
        detail:
          'La loi impose au moins 50 % de réduction aux plus modestes : l’abonnement solidaire, gratuit ou à 11 €, passerait à la moitié du plein tarif.',
      },
      metroNuit: {
        titre: 'Métro toute la nuit le week-end',
        detail: 'Les vendredis et samedis, sur les quatre lignes, qui roulent déjà jusqu’à 2 h.',
      },
    },
    simple:
      'Les billets et les abonnements rapportent environ 300 millions d’euros par an à Sytral Mobilités, et le versement mobilité des entreprises 520 millions.',
    explication:
      'Sytral a vendu 299,3 M€ hors taxes de billets et d’abonnements en 2025, sur tous ses réseaux, et son budget 2026 en prévoit 313,9 M€. Sans Rhônexpress, le réseau TCL en représente environ 282 M€, dont 60 % d’abonnements et 40 % de tickets. Les montants du jeu supposent environ 330 M€ par an : un point de hausse y rapporte 12 M€ par mandat sur les abonnements et 8 M€ sur les tickets, quand les recettes de 2025 donneraient 10 et 7. Les hausses de prix supposent que la fréquentation ne baisse pas.\n\nLe versement mobilité a rapporté 523,4 M€ en 2025, à 2 % de la masse salariale, le taux maximal dans la Métropole.\n\nLa gratuité totale retire toute la billetterie : 1 925 M€ par mandat dans le jeu, environ 1 700 M€ avec les recettes de 2025. Les 11 à 25 ans paient 26 € par mois : nous estimons ce qu’ils rapportent à environ 50 M€ par an, soit 300 M€ par mandat, quand le jeu retire 240 M€ pour leur gratuité. Celle des 11-18 ans enfants d’abonnés vient d’une proposition de campagne chiffrée à 8 M€, sans dire sur quelle durée : le jeu la compte par an.\n\nEnviron 170 000 personnes ont un tarif solidaire, gratuit ou à 11 € : les faire payer la moitié du plein tarif rapporterait au plus 53 M€ par an si aucune ne renonçait à son abonnement, soit 320 M€ par mandat ; le jeu en compte 240.\n\nNous n’avons trouvé aucun chiffrage d’un métro toute la nuit : en 2019, Sytral consacrait 1,5 M€ par an à ses mesures pour la nuit, dont le métro jusqu’à 2 h, et le jeu compte 4 M€ par an. Une TVA à 5,5 % au lieu de 10 % laisserait au réseau 4,27 % de recettes en plus à prix inchangés, environ 12 M€ par an ; le jeu en compte 16.',
    sources: [
      {
        titre: 'Sytral Mobilités, compte financier 2025, délibération 26-028',
        url: `${SYTRAL}/371/26-028-delib-compte-financier-unique-pref.pdf`,
        pages: 'p. 5, 7 et 16',
      },
      { ...ORIENTATIONS_2026, pages: 'p. 5 et 9' },
      {
        titre: 'Sytral Mobilités, budget primitif 2026, délibération 25-081',
        url: `${SYTRAL}/353/25-081-delib-bp-2026-transport-m43-signe-pref.pdf`,
        pages: 'p. 2',
      },
      {
        titre: 'Sytral Mobilités, document d’information du programme EMTN, décembre 2025, page Budget et finances',
        url: 'https://sytral-mobilites.fr/fr/budget-et-finances.html',
        pages: 'p. 17, 18, 113 et 114',
      },
      {
        titre: 'TCL, guide tarifaire au 1er septembre 2026',
        url: 'https://www.tcl.fr/sites/default/files/2026-07/Guide_Tarifaire_TCL_Mai_2026.pdf',
        pages: 'p. 12, 14 et 18',
      },
      {
        titre: 'Sytral Mobilités, évolution des tarifs 2025-2026, délibération 24-083',
        url: `${SYTRAL}/11/ya-24-083-delib-rap-evolu-tarif-2025-2026-ar-pref-v2.pdf`,
        pages: 'p. 7, 24, 25, 46 et 47',
      },
      {
        titre: 'Sytral Mobilités, tarification solidaire, délibération 24-118',
        url: `${SYTRAL}/12/24-118-delib-tarif-asso-gratuit-ar-pref.pdf`,
        pages: 'p. 2',
      },
      { ...CHAMBRE_REGIONALE, pages: 'p. 60, 62, 63 et 64' },
      {
        titre: 'Sytral, le réseau TCL la nuit, 2019, copie de l’Internet Archive',
        url: 'https://web.archive.org/web/20191219085255/http://www.sytral.fr/TPL_CODE/TPL_ACTUALITE/PAR_TPL_IDENTIFIANT/5100/87-reseau-tcl.htm',
      },
      {
        titre: 'Code des transports, article L1113-1, réduction solidaire d’au moins 50 %',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042005921',
      },
      {
        titre: 'Rue89Lyon, la gratuité pour les enfants d’abonnés TCL, 6 janvier 2026',
        url: 'https://www.rue89lyon.fr/2026/01/06/bruno-bernard-propose-la-gratuite-aux-enfants-dabonnes-tcl/',
      },
    ],
  },
  limites: [
    'Le débat d’orientation budgétaire 2026 a été voté par l’ancienne majorité. La nouvelle présidence de Sytral prépare un plan de mandat 2026-2031, pas encore voté ; elle a annoncé l’abandon du TEOL au profit du métro E, ce que seule la presse rapporte.',
    'Le jeu ne réserve rien à l’entretien du réseau existant, alors que Sytral y consacre 70 à 80 M€ par an.',
    'Les coûts du catalogue datent d’avant décembre 2025, sauf celui de la modernisation de la ligne D, que Sytral a porté de 339 à 522 M€ : d’autres projets ont pu être réévalués depuis.',
    'Le projet d’électrification des bus du catalogue recoupe en partie la réserve des bus, qui comprend déjà les bus électriques.',
    'Les montants des leviers sont ceux de la première version du jeu, un peu plus forts que ce que donnent les comptes de 2025 : l’explication des leviers détaille chaque écart.',
    'Sytral n’a jamais étudié la gratuité des 11-18 ans enfants d’abonnés : son coût vient d’une proposition de campagne rapportée par la presse.',
  ],
  releve: 'septembre 2026',
}
