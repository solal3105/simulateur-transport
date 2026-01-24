import { ProjectSelection, FinancingLevers, MandatPeriod } from './types'

export interface PoliticalParty {
  id: string
  name: string
  shortName: string
  color: string
  emoji: string
  description: string
  projectSelections: ProjectSelection[]
  financingLevers: Partial<FinancingLevers>
}

export const POLITICAL_PARTIES: PoliticalParty[] = [
  {
    id: 'gauche-ecolo',
    name: 'Union de la Gauche & des Écologistes',
    shortName: 'Gauche & Écolos',
    color: '#22C55E', // green-500
    emoji: '🟢',
    description: 'Programme axé sur les transports en commun, la gratuité jeunes et l\'électrification.',
    projectSelections: [
      // Modernisation AC (2035) D (2030) - A et C en M2, D en M1
      { projectId: 'modern-a', period: 'M2' },
      { projectId: 'modern-c', period: 'M2' },
      { projectId: 'modern-d', period: 'M1' },
      // TEOL (2032) - M2
      { projectId: 'teol', period: 'M2' },
      // Tram Nord (2034) - M2
      { projectId: 'ligne-du-nord', period: 'M2', selectedUpgradeOptionId: 'tram-surface' },
      // BHNS Parilly (2029) - M1
      { projectId: 'bhns-parilly', period: 'M1' },
      // T8 (2030) - M1
      { projectId: 't8', period: 'M1' },
      // T3 Express (2028) - M1
      { projectId: 't3-renf', period: 'M1' },
      // T9 (2027) - M1
      { projectId: 't9-final', period: 'M1' },
      // T10 (2027) - M1
      { projectId: 't10-final', period: 'M1' },
    ],
    financingLevers: {
      // Électrification des bus
      electrificationBus: 'M1+M2',
      // Entretien de la flotte de Bus
      entretienBus: 'M1+M2',
      // Métro 24h/24 (2027)
      metro24hWeekend: true,
      // Gratuité 11-18 ans (2027)
      gratuiteJeunesAbonnes: true,
      // +10% prix abonnement et ticket
      tarifAbonnements: 10,
      tarifTickets: 10,
    },
  },
  {
    id: 'rn',
    name: 'Rassemblement National',
    shortName: 'RN',
    color: '#78716C', // stone-500
    emoji: '🟤',
    description: 'Programme centré sur la modernisation du métro et l\'entretien du réseau bus.',
    projectSelections: [
      // Modernisation AC (2035) D (2030) - A et C en M2, D en M1
      { projectId: 'modern-a', period: 'M2' },
      { projectId: 'modern-c', period: 'M2' },
      { projectId: 'modern-d', period: 'M1' },
      // Metro E Bellecour (2040) - M2
      { projectId: 'metro-e-bellecour', period: 'M2' },
      // Finir T9 - T10 (2027) - M1
      { projectId: 't9-final', period: 'M1' },
      { projectId: 't10-final', period: 'M1' },
    ],
    financingLevers: {
      // Entretien Offre Bus
      entretienBus: 'M1+M2',
      // +10% prix abonnement et ticket
      tarifAbonnements: 10,
      tarifTickets: 10,
    },
  },
  {
    id: 'lfi',
    name: 'La France Insoumise',
    shortName: 'LFI',
    color: '#A855F7', // purple-500
    emoji: '🟣',
    description: 'Programme axé sur la gratuité totale des transports.',
    projectSelections: [
      // TEOL (2032) - M2
      { projectId: 'teol', period: 'M2' },
      // Finir T9 - T10 (2027) - M1
      { projectId: 't9-final', period: 'M1' },
      { projectId: 't10-final', period: 'M1' },
    ],
    financingLevers: {
      // Gratuité Totale (2027)
      gratuiteTotale: true,
    },
  },
  {
    id: 'droite',
    name: 'Union de la Droite',
    shortName: 'Droite',
    color: '#3B82F6', // blue-500
    emoji: '🔵',
    description: 'Programme incluant la Grande Dorsale Est-Ouest et la modernisation du métro.',
    projectSelections: [
      // Grande Dorsale (2056) - M2 (projet très long terme)
      { projectId: 'grande-dorsale', period: 'M2' },
      // T8 (2030) - M1
      { projectId: 't8', period: 'M1' },
      // Finir T9 - T10 (2027) - M1
      { projectId: 't9-final', period: 'M1' },
      { projectId: 't10-final', period: 'M1' },
      // BHNS Parilly (2029) - M1
      { projectId: 'bhns-parilly', period: 'M1' },
      // Modernisation AC (2035) D (2030) - A et C en M2, D en M1
      { projectId: 'modern-a', period: 'M2' },
      { projectId: 'modern-c', period: 'M2' },
      { projectId: 'modern-d', period: 'M1' },
    ],
    financingLevers: {},
  },
]

export function getPartyById(id: string): PoliticalParty | undefined {
  return POLITICAL_PARTIES.find(p => p.id === id)
}
