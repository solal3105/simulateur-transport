import { Project, PublicPolicy } from './types'

export const PROJECTS: Project[] = [
  {
    id: 'ligne-du-nord',
    name: 'Ligne du Nord',
    cost: 350,
    impact: 60000,
    description: "Nouvelle desserte du nord lyonnais vers Rillieux-la-Pape. Choisissez le mode de transport adapté à vos ambitions.",
    upgradeOptions: [
      {
        id: 'tram-surface',
        name: 'Tram en surface',
        description: 'Tramway classique en surface. Solution économique avec bonne capacité.',
        cost: 350,
        impact: 40000,
      },
      {
        id: 'tram-enterre',
        name: 'Tram enterré',
        description: 'Tramway en souterrain. Bien plus coûteux mais plus performant.',
        cost: 900,
        impact: 55000,
      },
      {
        id: 'metro',
        name: 'Métro',
        description: 'Extension de la ligne B depuis Charpennes.',
        cost: 3300,
        impact: 71500,
      },
    ],
  },
  {
    id: 'metro-e-part-dieu',
    name: 'Extension Métro E Part-Dieu',
    cost: 600,
    impact: 38000,
    description: "Extension de la ligne E reliant Alaï à Part-Dieu depuis Bellecour.",
    requires: 'metro-e-bellecour',
  },
  {
    id: 'ext-a-est',
    name: 'Extension Ligne A Est',
    cost: 2000,
    impact: 48500,
    description: "Prolongement de la ligne A vers l'est au-delà de Vaulx-en-Velin, pour desservir Décines et le stade.",
  },
  {
    id: 'metro-e-bellecour',
    name: 'Métro E Bellecour',
    cost: 1800,
    impact: 64000,
    description: "Section principale de la ligne E avec terminus à Bellecour.",
  },
  {
    id: 'grande-dorsale',
    name: 'Grande Dorsale - Ouest Est',
    cost: 6000,
    impact: 182000,
    description: "S’ils sont élus, Jean‑Michel Aulas et Véronique Sarselli souhaitent engager un débat sur la création d’une dorsale de métro Est-Ouest, qui serait portée lors des Assises métropolitaines de la mobilité en septembre 2026.",
  },
  {
    id: 'ext-d',
    name: 'Extension Ligne D',
    cost: 1400,
    impact: 40000,
    description: "Prolongement de la ligne D au-delà de son terminus actuel pour améliorer la desserte de la duchère.",
  },

  {
    id: 'teol',
    name: 'TEOL Semi-enterré',
    cost: 800,
    impact: 55000,
    description: "Tramway Express de l'Ouest Lyonnais en version semi-enterrée.",
    upgrade: {
      name: 'TEOL Complètement Enterré',
      description: "Passage en version complètement enterrée, pas seulement sous les pentes de l'ouest. Améliore la régularité mais renonce à la requalification urbaine du tracé en surface.",
      additionalCost: 300,
      additionalImpact: 0,
    },
  },
  {
    id: 'modern-a',
    name: 'Modernisation Ligne A',
    cost: 686,
    impact: 312000,
    description: "Automatisation complète de la ligne A et ajout de porte pallière. Augmentatio de la longueur des rames",
  },
  {
    id: 'ligne-ouest',
    name: 'Ligne de l\'Ouest',
    cost: 600,
    impact: 25000,
    description: "Nouvelle desserte de l'ouest lyonnais. Choisissez entre un tramway ou un bus à haut niveau de service.",
    upgradeOptions: [
      {
        id: 'bhns',
        name: 'BHNS',
        description: 'Bus à Haut Niveau de Service. Solution économique avec voies dédiées.',
        cost: 240,
        impact: 20000,
      },
      {
        id: 'tram',
        name: 'Tram',
        description: 'Tramway classique. Capacité plus élevée mais coût plus élevé.',
        cost: 600,
        impact: 25000,
      }
    ],
  },
  {
    id: 't12-c3',
    name: 'Tram du Centre',
    cost: 540,
    impact: 75000,
    description: "Conversion de la ligne C3 en tramway pour plus de capacité.",
  },
  {
    id: 'modern-d',
    name: 'Modernisation Ligne D',
    cost: 338,
    impact: 220500,
    description: "Renouvellement des équipements et du matériel pour fiabiliser l'exploitation et augmenter la capacité.",
  },
  {
    id: 't8',
    name: 'T8 Tram T8',
    cost: 245,
    impact: 30000,
    description: "Ligne reliant Vaulx-en-Velin La Soie à la Gare de Vénissieux, pour renforcer le maillage de l’est lyonnais.",
  },
  {
    id: 'modern-c',
    name: 'Modernisation Ligne C',
    cost: 239,
    impact: 28000,
    description: "Rénovation des systèmes et des rames pour maintenir la sécurité et la fiabilité de la ligne à crémaillère.",
  },
  {
    id: 't3-renf',
    name: 'T3 en Express',
    cost: 35,
    impact: 12000,
    description: "Modification du terminus, renforcement des fréquences et ajout de rames sur la ligne T3 existante.",
  },
  {
    id: 't9-final',
    name: 'T9 Finalisation',
    cost: 75,
    impact: 38000,
    description: "Achèvement des travaux et connexions de la ligne T9.",
  },
  {
    id: 't10-final',
    name: 'T10 Finalisation',
    cost: 75,
    impact: 42000,
    description: "Achèvement des travaux et connexions de la ligne T10.",
  },
  {
    id: 'bhns-parilly',
    name: 'BHNS Parilly',
    cost: 80,
    impact: 25000,
    description: "Liaison rapide en bus à haut niveau de service pour le sud-est.",
  },
  {
    id: 'bhns-kimmerling',
    name: 'Finalisation BHNS Part-Dieu',
    cost: 30,
    impact: 8000,
    description: "Finalisation du tronçon Kimmerling - Sept Chemins du BHNS Part-Dieu, en retard comme les tramways T9 et T10.",
  },
  {
    id: 'navette-fluv',
    name: 'Navette Fluviale',
    cost: 40,
    impact: 1500,
    description: "Service de navettes sur le Rhône. Mode de transport alternatif et touristique au cœur de Lyon.",
  },
  {
    id: 'bhns-rive-droite',
    name: 'Ligne du Rhône Rive Droite',
    cost: 50,
    impact: 20000,
    description: "Desserte de la rive droite du Rhône. Choisissez entre BHNS ou tramway.",
    upgradeOptions: [
      {
        id: 'bhns',
        name: 'BHNS Rive Droite',
        description: 'Bus à Haut Niveau de Service. Solution économique avec voies dédiées.',
        cost: 50,
        impact: 20000,
      },
      {
        id: 'tram',
        name: 'Tram Rive Droite',
        description: 'Tramway moderne. Meilleure capacité et attractivité que le BHNS.',
        cost: 165,
        impact: 25000,
      },
    ],
  },
  {
    id: 'telepherique-ouest',
    name: 'Téléphérique de l\'Ouest',
    cost: 200,
    impact: 18000,
    description: "Téléphérique urbain desservant l'ouest lyonnais.",
  },
  {
    id: 'teol-craponne',
    name: 'Extension TEOL Craponne',
    cost: 300,
    impact: 25000,
    description: "Extension du Tramway Express de l'Ouest Lyonnais jusqu'à Craponne.",
    requires: 'teol',
  },
]

export const PUBLIC_POLICIES: PublicPolicy[] = [
  {
    id: 'gratuite-jeunes-abonnes',
    name: 'Gratuité 11-18 ans enfants d\'abonnés',
    description: 'Gratuité des transports pour les jeunes de 11 à 18 ans dont les parents sont abonnés TCL.',
    costPerMandat: 48,
  },
  {
    id: 'gratuite-moins-25ans',
    name: 'Gratuité -25 ans',
    description: 'Gratuité des transports pour tous les moins de 25 ans.',
    costPerMandat: 240,
  },
  {
    id: 'metro-24h-weekend',
    name: 'Métro 24h/24 les weekends',
    description: 'Ouverture du métro toute la nuit les vendredis et samedis soir.',
    costPerMandat: 24,
  },
]

export const BASE_BUDGET = 2000

export const FINANCING_IMPACTS = {
  gratuiteTotale: -1925,
  gratuiteMoins25ans: -240, // 240M€/mandat
  gratuiteJeunesAbonnes: -48, // 48M€/mandat
  suppressionTarifSocial: 240, // Suppression tarification sociale = +240M€/mandat
  metro24hWeekend: -24, // 24M€/mandat
  tarifAbonnementsPerPercent: 12,
  tarifTicketsPerPercent: 8,
  versementMobilitePerPercent: 28, // 28M€ per 1% change
  tva55: 96,
  electrificationBus: -460, // Coût de conversion de la flotte
}

// Prix de base pour affichage
export const BASE_PRICES = {
  ticket: 2.10,
  abonnement: 74.10,
}

// Durée de réalisation des projets en années
export const PROJECT_DURATIONS: Record<string, number | Record<string, number>> = {
  'modern-a': 9,
  'modern-c': 9,
  'modern-d': 4,
  't9-final': 1,
  't10-final': 1,
  't8': 4,
  't3-renf': 2,
  'grande-dorsale': 30,
  'ext-a-est': 8,
  'ext-d': 7,
  'ligne-du-nord': {
    'metro': 15,
    'tram-enterre': 14,
    'tram-surface': 8,
  },
  't12-c3': 6,
  'ligne-ouest': {
    'bhns': 6,
    'tram': 8,
  },
  'bhns-parilly': 3,
  'bhns-kimmerling': 1,
  'navette-fluv': 4,
  'bhns-rive-droite': 3,
  'teol': 6, // Semi-enterré de base
  'teol-enterre': 8, // Upgrade complètement enterré
  'metro-e-bellecour': 14,
  'metro-e-part-dieu': 4,
  'telepherique-ouest': 5,
  'teol-craponne': 5,
}
