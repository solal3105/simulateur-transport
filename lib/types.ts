export type MandatPeriod = 'M1' | 'M2' | 'M1+M2' | null

export interface UpgradeOption {
  id: string
  name: string
  description: string
  cost: number
  impact: number
}

export interface Project {
  id: string
  name: string
  cost: number
  impact?: number
  mandatOnly?: 'M1+M2'
  description?: string
  upgrade?: {
    name: string
    description: string
    additionalCost: number
    additionalImpact?: number
  }
  upgradeOptions?: UpgradeOption[] // Pour les projets avec choix multiples (ex: Ligne du Nord)
  requires?: string // ID du projet requis
}

export interface PublicPolicy {
  id: string
  name: string
  description: string
  costPerMandat: number
  requiresLaw?: boolean
  lawType?: 'versement_mobilite' | 'tva'
}

export interface ProjectSelection {
  projectId: string
  period: MandatPeriod
  upgraded?: boolean // Pour les projets avec upgrade simple
  selectedUpgradeOptionId?: string // Pour les projets avec choix multiples (upgradeOptions)
}

export interface FinancingLevers {
  gratuiteTotale: boolean
  gratuiteConditionnee: boolean // Proposition Aulas: Lyonnais uniquement + revenus < 2500€
  gratuiteJeunesAbonnes: boolean // Gratuité 11-18 ans enfants d'abonnés TCL
  suppressionTarifSocial: boolean // Supprimer la tarification sociale (fin gratuité précaires, fin abonnements solidaires) +240M
  metro24hWeekend: boolean // Métro 24h/24 les weekends
  tarifAbonnements: number
  tarifTickets: number
  versementMobilite: -25 | 0 | 25 | 50
  tva55: boolean
  electrificationBus: MandatPeriod // Électrification de la flotte de bus - 460M€ total
  entretienBus: MandatPeriod // Entretien et renouvellement de la flotte de bus - 800M€ total
}

export interface BudgetState {
  m1: number
  m2: number
  totalImpact: number
  efficiency: number
  isValid: boolean
  hasExcessiveDebt: boolean
}
