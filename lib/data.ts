import { Project, PublicPolicy } from './types'

export const PROJECTS: Project[] = [
  {
    id: 'ext-b-nord',
    name: 'Extension Ligne B Nord',
    cost: 3300,
    impact: 71500,
    description: "Prolongement de la ligne B vers le nord jusqu'à Rillieux-la-Pape, desservant les quartiers de Caluire et les zones denses du nord lyonnais.",
  },
  {
    id: 'metro-e-part-dieu',
    name: 'Extension Métro E Part-Dieu',
    cost: 600,
    impact: 102000,
    description: "Nouvelle ligne E reliant Alaï à Part-Dieu via Point du Jour et Bellecour. Tracé Est-Ouest structurant pour la métropole.",
  },
  {
    id: 'ext-a-est',
    name: 'Extension Ligne A Est',
    cost: 2000,
    impact: 48500,
    description: "Prolongement de la ligne A vers l'est au-delà de Vaulx-en-Velin, pour desservir de nouveaux quartiers en développement.",
  },
  {
    id: 'metro-e-bellecour',
    name: 'Métro E Bellecour',
    cost: 1800,
    impact: 64000,
    description: "Section centrale de la ligne E passant par Bellecour, créant un nouveau hub de correspondances au cœur de Lyon.",
  },
  {
    id: 'ext-d',
    name: 'Extension Ligne D',
    cost: 1400,
    impact: 40000,
    description: "Prolongement de la ligne D au-delà de son terminus actuel pour améliorer la desserte du sud de l'agglomération.",
  },
  {
    id: 't13-souterrain',
    name: 'Tram du Nord',
    cost: 1200,
    impact: 60000,
    description: "Tracé: Grange Blanche → Part-Dieu → Charpennes → Campus. Passage en souterrain pour un temps de parcours réduit et une meilleure régularité.",
  },
  {
    id: 'teol-enterre',
    name: 'TEOL Enterré',
    cost: 1100,
    impact: 55000,
    description: "Tramway Express de l'Ouest Lyonnais en version enterrée. Tracé: Alaï → Gorge de Loup → Part-Dieu. Dessert l'ouest lyonnais avec des performances métro.",
  },
  {
    id: 'teol-semi-enterre',
    name: 'TEOL Semi-enterré',
    cost: 800,
    impact: 55000,
    description: "Tramway Express de l'Ouest Lyonnais en version semi-enterrée. Tracé: Alaï → Gorge de Loup → Part-Dieu. Compromis entre coût et performance.",
  },
  {
    id: 'entretien-bus',
    name: 'Entretiens flotte bus',
    cost: 800,
    mandatOnly: 'M1+M2',
    description: "Maintenance et renouvellement de la flotte de bus TCL. Indispensable pour maintenir la qualité de service sur l'ensemble du réseau.",
  },
  {
    id: 'modern-a',
    name: 'Modernisation Ligne A',
    cost: 686,
    impact: 312000,
    description: "Automatisation complète de la ligne A (comme la ligne D). Augmentation de la fréquence et de la capacité sur l'axe Est-Ouest historique.",
  },
  {
    id: 't10-c6',
    name: 'Tram de l\'Ouest',
    cost: 600,
    impact: 25000,
    description: "Tramway sur le tracé du C6. Tracé: Vénissieux → Saint-Fons → Feyzin → Solaize. Nouvelle ligne de tramway desservant le sud-est de la métropole.",
  },
  {
    id: 't12-c3',
    name: 'Tram du Centre',
    cost: 540,
    impact: 75000,
    description: "Tracé: Part-Dieu → Villeurbanne → Vaulx-en-Velin → Décines. Conversion de la ligne C3 en tramway pour plus de capacité.",
  },
  {
    id: 'modern-d',
    name: 'Modernisation Ligne D',
    cost: 338,
    impact: 220500,
    description: "Amélioration des équipements et augmentation de la capacité de la ligne D automatique. Optimisation des temps d'attente.",
  },
  {
    id: 't8',
    name: 'T8 Tram T8',
    cost: 245,
    impact: 30000,
    description: "Tracé: Bellecour → Confluence → Gerland → États-Unis. Nouvelle ligne reliant le centre-ville aux quartiers sud en développement.",
  },
  {
    id: 'c6-bhns',
    name: 'C6 BHNS',
    cost: 240,
    impact: 20000,
    description: "Bus à Haut Niveau de Service sur le tracé du C6. Fréquence élevée et voies dédiées sans investissement lourd.",
  },
  {
    id: 'c2-bhns',
    name: 'C2 BHNS',
    cost: 240,
    impact: 25000,
    description: "Bus à Haut Niveau de Service sur le tracé du C2. Alternative moins coûteuse au tramway avec un bon niveau de service.",
  },
  {
    id: 'modern-c',
    name: 'Modernisation Ligne C',
    cost: 239,
    impact: 28000,
    description: "Rénovation de la ligne C (crémaillère). Nouveaux équipements et amélioration de la fréquence vers Croix-Rousse et Cuire.",
  },
  {
    id: 't3-renf',
    name: 'T3 Renforcement',
    cost: 35,
    impact: 12000,
    description: "Tracé actuel: Gare Part-Dieu → Villeurbanne → Meyzieu. Renforcement des fréquences et ajout de rames sur la ligne T3 existante.",
  },
  {
    id: 't11',
    name: 'Tram du Rhône',
    cost: 120,
    impact: 25000,
    description: "Tracé: Décines Grand Large → Meyzieu. Extension du réseau tramway vers l'est de la métropole.",
  },
  {
    id: 't9-final',
    name: 'T9 Finalisation',
    cost: 50,
    description: "Achèvement des travaux et connexions de la ligne T9. Mise en cohérence du réseau tramway sud.",
  },
  {
    id: 't10-final',
    name: 'T10 Finalisation',
    cost: 50,
    description: "Achèvement des travaux et connexions de la ligne T10. Mise en cohérence du réseau tramway sud.",
  },
  {
    id: 'bhns-parilly',
    name: 'BHNS Parilly',
    cost: 80,
    impact: 25000,
    description: "Tracé: Parilly → Vénissieux → Saint-Priest. Liaison rapide en bus à haut niveau de service pour le sud-est.",
  },
  {
    id: 'navette-fluv',
    name: 'Navette Fluviale',
    cost: 40,
    impact: 1500,
    description: "Service de navettes sur le Rhône et la Saône. Mode de transport alternatif et touristique au cœur de Lyon.",
  },
  {
    id: 'bhns-rive-droite',
    name: 'BHNS Rive Droite',
    cost: 36,
    impact: 20000,
    description: "Tracé: Perrache → Confluence → Oullins → Pierre-Bénite. Desserte de la rive droite du Rhône en BHNS.",
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
    id: 'metro-24h-weekend',
    name: 'Métro 24h/24 les weekends',
    description: 'Ouverture du métro toute la nuit les vendredis et samedis soir.',
    costPerMandat: 24,
  },
]

export const BASE_BUDGET = 2000

export const FINANCING_IMPACTS = {
  gratuiteTotale: -1925,
  gratuiteConditionnee: -300, // Proposition Aulas: Lyonnais + revenus < 2500€
  gratuiteJeunesAbonnes: -48, // 48M€/mandat
  metro24hWeekend: -24, // 24M€/mandat
  tarifAbonnementsPerPercent: 12,
  tarifTicketsPerPercent: 8,
  versementMobilite: {
    '-25': -700,
    '0': 0,
    '25': 700,
    '50': 1400,
  },
  tva55: 96,
  electrificationBus: -460, // Coût de conversion de la flotte
}

// Prix de base pour affichage
export const BASE_PRICES = {
  ticket: 2.10,
  abonnement: 74.10,
}
