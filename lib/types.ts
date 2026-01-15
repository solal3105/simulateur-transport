export type MandatPeriod = 'M1' | 'M2' | 'M1+M2' | null

export interface Project {
  id: string
  name: string
  cost: number
  impact?: number
  mandatOnly?: 'M1+M2'
  description?: string
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
}

export interface FinancingLevers {
  gratuiteTotale: boolean
  gratuiteConditionnee: boolean // Proposition Aulas: Lyonnais uniquement + revenus < 2500€
  gratuiteJeunesAbonnes: boolean // Gratuité 11-18 ans enfants d'abonnés TCL
  metro24hWeekend: boolean // Métro 24h/24 les weekends
  tarifAbonnements: number
  tarifTickets: number
  versementMobilite: -25 | 0 | 25 | 50
  tva55: boolean
}

export interface BudgetState {
  m1: number
  m2: number
  totalImpact: number
  efficiency: number
  isValid: boolean
  hasExcessiveDebt: boolean
}
