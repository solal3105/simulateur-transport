import type { FleetProgramme, Project, ToggleLever } from './types'

/** Enveloppe d'investissement disponible sur une phase, en millions d'euros. */
export const PHASE_BUDGET = 2000

export const PHASES = {
  M1: { label: 'Phase 1', start: 2026, end: 2032 },
  M2: { label: 'Phase 2', start: 2032, end: 2038 },
} as const

/** Tarifs en vigueur, affichés en repère quand on bouge les curseurs. */
export const CURRENT_FARES = {
  ticket: 2.1,
  abonnement: 74.1,
}

export const PROJECTS: Project[] = [
  {
    id: 'grande-dorsale',
    name: 'Grande Dorsale est-ouest',
    description:
      "Une traversée souterraine de bout en bout de la Métropole, de l'ouest lyonnais à l'est. C'est le projet le plus lourd du catalogue, et de loin le plus long à construire : trente ans de chantier, soit bien au-delà des deux mandats que vous arbitrez.",
    mode: 'metro',
    cost: 6000,
    ridership: 182000,
    duration: 30,
    geometryId: 'grande-dorsale',
  },
  {
    id: 'metro-e-bellecour',
    name: 'Métro E jusqu’à Bellecour',
    description:
      "La section principale de la ligne E, d'Alaï à Bellecour. C'est elle qui conditionne tout le reste de la ligne : sans elle, aucune extension n'a de sens.",
    mode: 'metro',
    cost: 1800,
    ridership: 64000,
    duration: 14,
    geometryId: 'metro-e-bellecour',
  },
  {
    id: 'ext-a-est',
    name: 'Extension de la ligne A à l’est',
    description:
      "Prolongement au-delà de Vaulx-en-Velin pour desservir Décines et le stade, aujourd'hui accessibles en tramway seulement.",
    mode: 'metro',
    cost: 2000,
    ridership: 48500,
    duration: 8,
    geometryId: 'ext-a-est',
  },
  {
    id: 'ext-d',
    name: 'Extension de la ligne D',
    description:
      'Prolongement au-delà du terminus actuel pour relier le plateau de la Duchère au métro.',
    mode: 'metro',
    cost: 1400,
    ridership: 40000,
    duration: 7,
    geometryId: 'ext-d',
  },
  {
    id: 'metro-e-part-dieu',
    name: 'Métro E jusqu’à Part-Dieu',
    description:
      "Prolongement de la ligne E de Bellecour à Part-Dieu, qui la raccorde au principal pôle d'échanges de la Métropole.",
    mode: 'metro',
    cost: 600,
    ridership: 38000,
    duration: 4,
    requires: 'metro-e-bellecour',
    geometryId: 'metro-e-part-dieu',
  },
  {
    id: 'ligne-du-nord',
    name: 'Ligne du Nord',
    description:
      "Une nouvelle desserte du nord lyonnais jusqu'à Rillieux-la-Pape. Trois manières de la faire, qui ne coûtent pas du tout la même chose.",
    mode: 'tram',
    cost: 350,
    ridership: 40000,
    duration: 8,
    geometryId: 'ligne-du-nord',
    variants: [
      {
        id: 'tram-surface',
        name: 'Tramway en surface',
        detail: 'Le tracé reste en surface sur tout son linéaire, ce qui raccourcit le chantier.',
        mode: 'tram',
        cost: 350,
        ridership: 40000,
        duration: 8,
      },
      {
        id: 'tram-enterre',
        name: 'Tramway enterré',
        detail: "Le tracé passe en souterrain, gagne en régularité et perd la requalification urbaine de surface.",
        mode: 'tram',
        cost: 900,
        ridership: 55000,
        duration: 14,
      },
      {
        id: 'metro',
        name: 'Métro, extension de la ligne B',
        detail: 'La desserte se fait en prolongeant la ligne B depuis Charpennes.',
        mode: 'metro',
        cost: 3300,
        ridership: 71500,
        duration: 15,
      },
    ],
  },
  {
    id: 'teol',
    name: 'Tramway express de l’ouest lyonnais',
    description:
      "Une liaison rapide vers l'ouest, semi-enterrée sous les pentes. Vous pouvez payer pour l'enterrer complètement.",
    mode: 'tram',
    cost: 800,
    ridership: 55000,
    duration: 6,
    geometryId: 'teol',
    option: {
      name: 'Enterrer la totalité du tracé',
      detail:
        "Le tramway passe en souterrain partout, pas seulement sous les pentes. La régularité s'améliore, mais on renonce à la requalification urbaine du tracé de surface et le chantier s'allonge de deux ans.",
      extraCost: 300,
      extraRidership: 0,
      duration: 8,
    },
  },
  {
    id: 'modern-a',
    name: 'Modernisation de la ligne A',
    description:
      "Automatisation complète, portes palières sur les quais et rames allongées. C'est le meilleur rapport entre l'argent engagé et les voyageurs gagnés de tout le catalogue.",
    mode: 'renovation',
    cost: 686,
    ridership: 312000,
    duration: 9,
    geometryId: 'modern-a',
  },
  {
    id: 'modern-d',
    name: 'Modernisation de la ligne D',
    description:
      "Renouvellement du matériel et des équipements d'exploitation, pour fiabiliser la ligne et augmenter sa capacité.",
    mode: 'renovation',
    cost: 338,
    ridership: 220500,
    duration: 4,
    geometryId: 'modern-d',
  },
  {
    id: 'modern-c',
    name: 'Modernisation de la ligne C',
    description:
      'Rénovation des rames et des systèmes de la ligne à crémaillère, pour maintenir sa sécurité et sa fiabilité.',
    mode: 'renovation',
    cost: 239,
    ridership: 28000,
    duration: 9,
    geometryId: 'modern-c',
  },
  {
    id: 't12-c3',
    name: 'Tram du Centre',
    description:
      'Conversion de la ligne de bus C3 en tramway, sur un des axes les plus chargés du réseau.',
    mode: 'tram',
    cost: 540,
    ridership: 75000,
    duration: 6,
    geometryId: 't12-c3',
  },
  {
    id: 'ligne-ouest',
    name: 'Ligne de l’Ouest',
    description:
      "Une nouvelle desserte de l'ouest lyonnais, en bus à haut niveau de service ou en tramway.",
    mode: 'tram',
    cost: 240,
    ridership: 20000,
    duration: 6,
    geometryId: 'ligne-ouest',
    variants: [
      {
        id: 'bhns',
        name: 'Bus à haut niveau de service',
        detail: 'Des voies réservées et des stations aménagées, sans pose de rails.',
        mode: 'bus',
        cost: 240,
        ridership: 20000,
        duration: 6,
      },
      {
        id: 'tram',
        name: 'Tramway',
        detail: 'Une capacité nettement supérieure, pour un chantier plus long et plus cher.',
        mode: 'tram',
        cost: 600,
        ridership: 25000,
        duration: 8,
      },
    ],
  },
  {
    id: 'teol-craponne',
    name: 'Extension du tramway de l’ouest à Craponne',
    description:
      "Prolongement du tramway express de l'ouest jusqu'à Craponne, au-delà de son terminus.",
    mode: 'tram',
    cost: 300,
    ridership: 25000,
    duration: 5,
    requires: 'teol',
    geometryId: 'teol-craponne',
  },
  {
    id: 't8',
    name: 'Tramway T8',
    description:
      "Liaison de Vaulx-en-Velin La Soie à la gare de Vénissieux, qui maille l'est lyonnais sans passer par le centre.",
    mode: 'tram',
    cost: 245,
    ridership: 30000,
    duration: 4,
    geometryId: 't8',
  },
  {
    id: 'telepherique-ouest',
    name: 'Téléphérique de l’Ouest',
    description:
      "Un téléphérique urbain pour franchir le relief de l'ouest lyonnais, là où le rail coûterait bien davantage.",
    mode: 'cable',
    cost: 200,
    ridership: 18000,
    duration: 5,
    geometryId: 'telepherique-ouest',
  },
  {
    id: 'bhns-rive-droite',
    name: 'Ligne du Rhône rive droite',
    description:
      'Une desserte continue de la rive droite du Rhône, en bus à haut niveau de service ou en tramway.',
    mode: 'bus',
    cost: 50,
    ridership: 20000,
    duration: 3,
    geometryId: 'bhns-rive-droite',
    variants: [
      {
        id: 'bhns',
        name: 'Bus à haut niveau de service',
        detail: 'Des voies réservées sur le linéaire existant, pour un investissement minime.',
        mode: 'bus',
        cost: 50,
        ridership: 20000,
        duration: 3,
      },
      {
        id: 'tram',
        name: 'Tramway',
        detail: 'Un mode plus capacitaire et plus attractif, pour trois fois le prix.',
        mode: 'tram',
        cost: 165,
        ridership: 25000,
        duration: 3,
      },
    ],
  },
  {
    id: 'bhns-parilly',
    name: 'Bus à haut niveau de service de Parilly',
    description: 'Une liaison rapide pour le sud-est, sur voies réservées.',
    mode: 'bus',
    cost: 80,
    ridership: 25000,
    duration: 3,
    geometryId: 'bhns-parilly',
  },
  {
    id: 't9-final',
    name: 'Achèvement du T9',
    description:
      "Finition des travaux et raccordements de la ligne T9, dont le chantier est déjà lancé. Un an de travaux pour un gain immédiat.",
    mode: 'tram',
    cost: 75,
    ridership: 38000,
    duration: 1,
    geometryId: 't9-final',
  },
  {
    id: 't10-final',
    name: 'Achèvement du T10',
    description:
      "Finition des travaux et raccordements de la ligne T10, dans la même situation que le T9.",
    mode: 'tram',
    cost: 75,
    ridership: 42000,
    duration: 1,
    geometryId: 't10-final',
  },
  {
    id: 'navette-fluv',
    name: 'Navette fluviale',
    description:
      "Un service régulier sur le Rhône. Le plus petit gain de fréquentation du catalogue, pour un des plus petits investissements.",
    mode: 'fluvial',
    cost: 40,
    ridership: 1500,
    duration: 4,
    geometryId: 'navette-fluv',
  },
  {
    id: 't3-renf',
    name: 'T3 en express',
    description:
      'Déplacement du terminus, renforcement des fréquences et rames supplémentaires sur la ligne T3 existante.',
    mode: 'tram',
    cost: 35,
    ridership: 12000,
    duration: 2,
    geometryId: 't3-renf',
  },
  {
    id: 'bhns-kimmerling',
    name: 'Achèvement du bus Part-Dieu',
    description:
      'Finition du tronçon Kimmerling – Sept Chemins, resté inachevé comme les tramways T9 et T10.',
    mode: 'bus',
    cost: 30,
    ridership: 8000,
    duration: 1,
    geometryId: 'bhns-kimmerling',
  },
]

export const FLEET_PROGRAMMES: FleetProgramme[] = [
  {
    id: 'maintenance',
    name: 'Entretien et renouvellement du parc de bus',
    description:
      "Remplacer les véhicules en fin de vie et entretenir le reste. Sans cette dépense, l'offre de bus se dégrade d'elle-même au fil des deux mandats.",
    cost: 800,
  },
  {
    id: 'electrification',
    name: 'Électrification du parc de bus',
    description:
      'Conversion des véhicules thermiques et équipement des dépôts en bornes de recharge.',
    cost: 460,
  },
]

export const TOGGLE_LEVERS: ToggleLever[] = [
  {
    id: 'gratuiteTotale',
    name: 'Gratuité totale du réseau',
    detail:
      "Plus personne ne paie pour voyager. Toutes les recettes tarifaires disparaissent, et les autres mesures tarifaires deviennent sans objet.",
    perPhase: -1925,
  },
  {
    id: 'gratuiteMoins25',
    name: 'Gratuité pour les moins de 25 ans',
    detail: 'Tous les moins de 25 ans voyagent sans payer, sans condition de ressources.',
    perPhase: -240,
    voidedByFreeTravel: true,
  },
  {
    id: 'gratuiteJeunesAbonnes',
    name: 'Gratuité des 11-18 ans enfants d’abonnés',
    detail: "Les jeunes de 11 à 18 ans voyagent sans payer dès lors qu'un parent est abonné.",
    perPhase: -48,
    voidedByFreeTravel: true,
  },
  {
    id: 'suppressionTarifSocial',
    name: 'Suppression de la tarification sociale',
    detail:
      "Fin de la gratuité pour les personnes précaires et des abonnements solidaires. La mesure rapporte, au prix de l'accès au réseau des ménages les plus modestes.",
    perPhase: 240,
    voidedByFreeTravel: true,
  },
  {
    id: 'metroNuitWeekend',
    name: 'Métro ouvert toute la nuit le week-end',
    detail: 'Service continu les vendredis et samedis soir sur les quatre lignes de métro.',
    perPhase: -24,
  },
  {
    id: 'tva55',
    name: 'TVA des transports ramenée à 5,5 %',
    detail:
      "Le taux appliqué aux transports du quotidien passe de 10 % à 5,5 %. La Métropole ne peut pas en décider seule : il faut une loi de finances.",
    perPhase: 96,
    requiresLaw: true,
  },
]

/** Effet sur une phase d'un point de hausse, en millions d'euros. */
export const FARE_YIELD = {
  abonnements: 12,
  tickets: 8,
  versementMobilite: 28,
}

export const PROJECTS_BY_ID = new Map(PROJECTS.map((p) => [p.id, p]))

/**
 * Le numéro de planche d'un ouvrage. Il ne bouge jamais, quel que soit le tri
 * du rail, pour que la liste et le plan désignent la même chose.
 */
export const PROJECT_NUMBER = new Map(PROJECTS.map((p, index) => [p.id, index + 1]))
