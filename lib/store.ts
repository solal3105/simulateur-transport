import { create } from 'zustand'
import { ProjectSelection, FinancingLevers, BudgetState, MandatPeriod } from './types'
import { PROJECTS, BASE_BUDGET, FINANCING_IMPACTS } from './data'

interface SimulatorState {
  projectSelections: ProjectSelection[]
  financingLevers: FinancingLevers
  setProjectPeriod: (projectId: string, period: MandatPeriod) => void
  setFinancingLever: <K extends keyof FinancingLevers>(
    lever: K,
    value: FinancingLevers[K]
  ) => void
  getBudgetState: () => BudgetState
  reset: () => void
}

const initialFinancingLevers: FinancingLevers = {
  gratuiteTotale: false,
  gratuiteConditionnee: false,
  gratuiteMoins25ans: false,
  gratuiteJeunesAbonnes: false,
  suppressionTarifSocial: false,
  metro24hWeekend: false,
  tarifAbonnements: 0,
  tarifTickets: 0,
  versementMobilite: 0,
  tva55: false,
  electrificationBus: null,
  entretienBus: null,
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  projectSelections: [],
  financingLevers: initialFinancingLevers,

  setProjectPeriod: (projectId: string, period: MandatPeriod) => {
    set((state) => {
      const existing = state.projectSelections.find((s) => s.projectId === projectId)
      
      if (period === null) {
        return {
          projectSelections: state.projectSelections.filter((s) => s.projectId !== projectId),
        }
      }

      if (existing) {
        return {
          projectSelections: state.projectSelections.map((s) =>
            s.projectId === projectId ? { ...s, period } : s
          ),
        }
      }

      return {
        projectSelections: [...state.projectSelections, { projectId, period }],
      }
    })
  },

  setFinancingLever: (lever, value) => {
    set((state) => ({
      financingLevers: {
        ...state.financingLevers,
        [lever]: value,
      },
    }))
  },

  getBudgetState: (): BudgetState => {
    const { projectSelections, financingLevers } = get()

    let m1Cost = 0
    let m2Cost = 0
    let totalImpact = 0

    projectSelections.forEach((selection) => {
      const project = PROJECTS.find((p) => p.id === selection.projectId)
      if (!project) return

      if (selection.period === 'M1') {
        m1Cost += project.cost
      } else if (selection.period === 'M2') {
        m2Cost += project.cost
      } else if (selection.period === 'M1+M2') {
        m1Cost += project.cost / 2
        m2Cost += project.cost / 2
      }

      if (project.impact) {
        totalImpact += project.impact
      }
    })

    const leverImpact = calculateLeverImpact(financingLevers)
    const totalCost = m1Cost + m2Cost
    const efficiency = totalCost > 0 ? totalImpact / totalCost : 0
    const m1Budget = BASE_BUDGET + leverImpact - m1Cost
    const m2Budget = BASE_BUDGET + leverImpact - m2Cost

    return {
      m1: m1Budget,
      m2: m2Budget,
      totalImpact,
      efficiency,
      isValid: m1Budget >= -1000 && m2Budget >= -1000,
      hasExcessiveDebt: m1Budget < -1000 || m2Budget < -1000,
    }
  },

  reset: () => {
    set({
      projectSelections: [],
      financingLevers: initialFinancingLevers,
    })
  },
}))

function calculateLeverImpact(levers: FinancingLevers): number {
  let impact = 0

  if (levers.gratuiteTotale) {
    impact += FINANCING_IMPACTS.gratuiteTotale
  }

  if (levers.gratuiteConditionnee) {
    impact += FINANCING_IMPACTS.gratuiteConditionnee
  }

  impact += levers.tarifAbonnements * FINANCING_IMPACTS.tarifAbonnementsPerPercent
  impact += levers.tarifTickets * FINANCING_IMPACTS.tarifTicketsPerPercent

  impact += FINANCING_IMPACTS.versementMobilite[levers.versementMobilite.toString() as keyof typeof FINANCING_IMPACTS.versementMobilite]

  if (levers.tva55) {
    impact += FINANCING_IMPACTS.tva55
  }

  return impact
}
