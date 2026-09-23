import type { BudgetVille, Source } from '../budget'

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
    simple:
      'Île-de-France Mobilités, la RATP, l’État et la Région investiront environ 46 milliards d’euros de 2026 à 2032, Grand Paris Express compris, puis 28 milliards de 2032 à 2038.',
    explication:
      'Nous additionnons ce que prévoient les grands financeurs. Île-de-France Mobilités investit environ 3 milliards par an, sans compter sa dette ni ses rachats de matériel, puis environ 2,3 milliards après 2030, quand ses remboursements d’emprunt culmineront. La RATP ajoute environ 800 millions par an sur ses propres fonds. Le contrat de plan entre l’État et la Région prévoit 7,4 milliards pour les transports en commun de 2023 à 2027, et nous supposons que les suivants gardent ce rythme. La Société des grands projets dépensera encore environ 15 milliards pour le Grand Paris Express au premier mandat. Ce qui vous reste correspond à ce que le contrat de plan consacre aujourd’hui aux trams, aux métros, aux bus en site propre et aux pôles d’échanges, environ 3,6 milliards par mandat, plus leurs rames.',
    sources: [
      IDFM_2026,
      {
        titre: 'Île-de-France Mobilités, budget 2026, 10 décembre 2025',
        url: 'https://presse.iledefrance-mobilites.fr/ile-de-france-mobilites-vote-un-budget-ambitieux-pour-continuer-la-modernisation-du-reseau/',
      },
      CHAMBRE_REGIONALE,
      RATP_2025,
      CONTRAT_DE_PLAN,
      SENAT,
    ],
  },
  decides: {
    montants: { 1: 17900, 2: 950 },
    simple:
      'Le Grand Paris Express, Eole et quelques chantiers déjà lancés en prennent 17,9 milliards au premier mandat, et moins d’un milliard au second.',
    explication:
      'Les lignes 15 à 18 du Grand Paris Express sont dessinées sur notre carte : nous retirons ce qui reste à payer pour leur construction (15 milliards puis 500 millions), leurs rames (1,1 milliard puis 200 millions) et quatre opérations liées à leurs gares (390 millions puis 50 millions). Nous retirons aussi les chantiers de RER et de trains, que vous ne pouvez pas construire vous-même : Eole (800 millions) et le nouveau système d’exploitation des RER B et D (500 millions puis 200 millions), ainsi que les dernières factures des lignes déjà ouvertes (140 millions). Les projets de tram, de métro et de bus décidés mais pas dessinés, comme le T1 prolongé à Val de Fontenay ou le T8 sud, restent dans votre budget : vous pouvez les tracer.',
    sources: [
      CONTRAT_DE_PLAN,
      {
        titre: 'Cour des comptes, la Société du Grand Paris, avril 2024',
        url: 'https://www.ccomptes.fr/sites/default/files/2024-04/20240425-S2024-0234-Societe-Grand-Paris_0.pdf',
        pages: 'p. 6 et 14',
      },
      SENAT,
      CHAMBRE_REGIONALE,
      {
        titre: 'Île-de-France Mobilités, le RER E avance vers l’ouest, 16 septembre 2025',
        url: 'https://presse.iledefrance-mobilites.fr/le-rer-e-avance-vers-louest-avec-linauguration-de-la-gare-depone-mezieres-et-du-nouvel-acces-sud-des-mureaux/',
      },
    ],
  },
  bus: {
    montants: { 1: 3000, 2: 3000 },
    simple: 'Renouveler les 10 500 bus franciliens et leurs dépôts coûte environ 3 milliards par mandat.',
    explication:
      'Île-de-France Mobilités prévoit 3,6 milliards d’achats de bus de 2025 à 2034, plus environ 150 millions par an pour les centres bus (176, 129 et 137 millions en 2024, 2025 et 2026). Cela fait environ 500 millions par an, soit 3 milliards par mandat. Les achats récents étaient plus faibles : 1,3 milliard de bus de 2019 à 2024.',
    sources: [
      CHAMBRE_REGIONALE,
      IDFM_2026,
      {
        titre: 'Île-de-France Mobilités, nouveau plan bus, 9 juin 2026',
        url: 'https://presse.iledefrance-mobilites.fr/valerie-pecresse-lance-un-nouveau-plan-pour-developper-encore-le-bus-sur-toute-la-region/',
      },
    ],
  },
  lignes: {
    montants: { 1: 21200, 2: 20150 },
    simple: 'Entretenir et moderniser le métro, le RER, les trains et les trams existants coûte environ 21 milliards par mandat.',
    explication:
      'C’est ce qui reste une fois le reste retiré : les nouvelles rames de métro, de RER et de train, la modernisation des lignes, les ateliers et la qualité de service, payés par Île-de-France Mobilités, la RATP et le contrat de plan. Nous y rangeons aussi la part des futurs contrats de plan consacrée au RER et aux trains, puisque vous ne pouvez pas en construire. Cela fait environ 3,5 milliards par an, cohérent avec le contrat de la RATP, 2,1 milliards par an, et avec les 1,1 milliard de modernisation des RER et des trains du contrat de plan.',
    sources: [
      {
        titre: 'Île-de-France Mobilités, nouveau contrat avec la RATP, 9 juillet 2025',
        url: 'https://presse.iledefrance-mobilites.fr/plus-de-qualite-de-service-pour-les-voyageurs-au-coeur-du-nouveau-contrat-entre-ile-de-france-mobilites-et-la-ratp/',
      },
      RATP_2025,
      IDFM_2026,
      CONTRAT_DE_PLAN,
    ],
  },
  leviers: {
    tarifs: { abonnement: 90.8, ticket: 2.55 },
    rendement: { abonnements: 173, tickets: 85, versementMobilite: 390 },
    fixes: { gratuiteTotale: -26200, gratuiteMoins25: -3900, suppressionTarifSocial: 1300, metroNuit: -400, tva: 1100 },
    textes: {
      suppressionTarifSocial: {
        titre: 'Ramener les réductions solidaires à 50 %',
        detail:
          'La loi impose au moins 50 % de réduction aux plus modestes : on ne peut que reprendre les réductions de 75 % et la gratuité.',
      },
      metroNuit: {
        titre: 'Métro toute la nuit le week-end',
        detail: 'Les vendredis et samedis, sur six grandes lignes, comme lors des essais de 2019.',
      },
    },
    simple:
      'Les billets et les abonnements rapportent 4,3 milliards d’euros par an, dont les deux tiers en abonnements, et le versement mobilité des entreprises 6,5 milliards.',
    explication:
      'Les recettes tarifaires ont atteint 4 308 M€ hors taxes en 2025, dont environ 67 % d’abonnements, part des employeurs comprise, et 33 % de tickets et de titres occasionnels. Le versement mobilité a rapporté 6 496 M€ ; il est déjà à son taux maximal, 3,2 % de la masse salariale à Paris et en petite couronne, 2,01 % ou 1,6 % ailleurs. La gratuité totale coûterait ces recettes et environ 400 M€ de subventions régionales aux tarifs réduits. Celle des moins de 25 ans coûterait environ 650 M€ par an : 350 M€ de passes Imagine R et environ 300 M€ payés par les jeunes salariés et les acheteurs de tickets, ce dernier chiffre étant notre estimation. Ramener toutes les réductions solidaires à 50 % rapporterait au plus 217 M€ par an. Le métro toute la nuit le week-end, sur six lignes, coûterait 60 à 65 M€ par an. Les hausses de prix supposent que la fréquentation ne baisse pas ; avec la baisse qu’Île-de-France Mobilités attend elle-même, un point d’abonnement rapporterait plutôt 156 M€ par mandat.',
    sources: [
      {
        titre: 'Île-de-France Mobilités, compte administratif 2025',
        // La même pièce que sur iledefrance-mobilites.fr, servie par sa plateforme de contenu.
        url: 'https://portail-idfm.cdn.prismic.io/portail-idfm/ajAZ_41P9HI4UhaP_RapportCA2025.pdf',
        pages: 'p. 7 à 11',
      },
      {
        titre: 'Île-de-France Mobilités, présentation aux investisseurs, septembre 2026',
        url: 'https://portail-idfm.cdn.prismic.io/portail-idfm/qDEQ3jhKWfwuUfVR_Pr%C3%A9sentationpageinvestisseurSeptember2026.pdf',
        pages: 'p. 17',
      },
      {
        titre: 'Île-de-France Mobilités, prospectus du 24 septembre 2025',
        url: 'https://portail-idfm.cdn.prismic.io/portail-idfm/aNuLvZ5xUNkB1QQM_ProgrammeEMTNsign%C3%A9.pdf',
        pages: 'p. 101 et 116 à 118',
      },
      {
        titre: 'Chambre régionale des comptes d’Île-de-France, la mobilité des jeunes, avril 2025',
        url: 'https://www.ccomptes.fr/sites/default/files/2025-04/IDR2024-72.pdf',
        pages: 'p. 19 à 32',
      },
      {
        ...CHAMBRE_REGIONALE,
        pages: 'p. 40 à 52',
      },
      {
        titre: 'Code général des collectivités territoriales, article L2531-4, taux du versement mobilité en Île-de-France',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042003618',
      },
      {
        titre: 'Inspection générale des finances et IGEDD, rapport sur la TVA des transports, mai 2023',
        url: 'https://www.igedd.developpement-durable.gouv.fr/IMG/pdf/rapport_014875-01_cle259de1.pdf',
        pages: 'p. 43 et 44',
      },
      {
        titre: 'France 3 Paris Île-de-France, le métro toute la nuit, 27 juin 2026',
        url: 'https://france3-regions.franceinfo.fr/paris-ile-de-france/paris/ouvrir-le-metro-toute-la-nuit-a-paris-la-solution-est-elle-enfin-a-portee-de-main-3376102.html',
      },
    ],
  },
  limites: [
    'Aucun document ne donne ce qui reste à payer sur le Grand Paris Express, Eole ou le nouveau système des RER B et D : ces montants sont nos estimations.',
    'Le niveau d’investissement d’Île-de-France Mobilités après 2030, celui de la RATP après 2029 et le rythme des prochains contrats de plan ne sont pas encore connus.',
    'Ce que SNCF Réseau paie sur ses propres fonds pour rénover les voies n’est pas compté.',
    'Selon la chambre régionale des comptes, Île-de-France Mobilités ne réalise en moyenne que 69 % des investissements qu’elle prévoit.',
  ],
  releve: 'septembre 2026',
}
