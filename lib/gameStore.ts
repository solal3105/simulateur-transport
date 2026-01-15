import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjectSelection, FinancingLevers, MandatPeriod } from './types'
import { PROJECTS, BASE_BUDGET, FINANCING_IMPACTS } from './data'

export type GamePhase = 'intro' | 'onboarding' | 'playing' | 'results'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  condition: () => boolean
}

export interface Objective {
  id: string
  name: string
  description: string
  target: number
  current: number
  completed: boolean
  reward: number
}

interface GameState {
  phase: GamePhase
  onboardingStep: number
  totalOnboardingSteps: number
  score: number
  projectSelections: ProjectSelection[]
  financingLevers: FinancingLevers
  showTutorial: boolean
  selectedCategory: string | null
  animatingBudget: boolean
  lastAction: string | null
  
  // Actions
  setPhase: (phase: GamePhase) => void
  nextOnboardingStep: () => void
  skipOnboarding: () => void
  setProjectPeriod: (projectId: string, period: MandatPeriod) => void
  setFinancingLever: <K extends keyof FinancingLevers>(lever: K, value: FinancingLevers[K]) => void
  getBudgetState: () => { m1: number; m2: number; totalImpact: number; efficiency: number; leverImpact: number }
  getScore: () => number
  getObjectives: () => Objective[]
  getAchievements: () => Achievement[]
  reset: () => void
  setSelectedCategory: (cat: string | null) => void
  setAnimatingBudget: (val: boolean) => void
  setLastAction: (action: string | null) => void
}

const initialFinancingLevers: FinancingLevers = {
  gratuiteTotale: false,
  gratuiteConditionnee: false,
  gratuiteJeunesAbonnes: false,
  metro24hWeekend: false,
  tarifAbonnements: 0,
  tarifTickets: 0,
  versementMobilite: 0,
  tva55: false,
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'intro',
      onboardingStep: 0,
      totalOnboardingSteps: 5,
      score: 0,
      projectSelections: [],
      financingLevers: initialFinancingLevers,
      showTutorial: true,
      selectedCategory: null,
      animatingBudget: false,
      lastAction: null,

      setPhase: (phase) => set({ phase }),
      
      nextOnboardingStep: () => {
        const { onboardingStep, totalOnboardingSteps } = get()
        if (onboardingStep < totalOnboardingSteps - 1) {
          set({ onboardingStep: onboardingStep + 1 })
        } else {
          set({ phase: 'playing', onboardingStep: 0 })
        }
      },

      skipOnboarding: () => set({ phase: 'playing' }),

      setProjectPeriod: (projectId, period) => {
        set((state) => {
          const project = PROJECTS.find(p => p.id === projectId)
          let newSelections: ProjectSelection[]
          
          if (period === null) {
            newSelections = state.projectSelections.filter((s) => s.projectId !== projectId)
            set({ lastAction: project ? `❌ ${project.name} retiré` : null })
          } else {
            const existing = state.projectSelections.find((s) => s.projectId === projectId)
            if (existing) {
              newSelections = state.projectSelections.map((s) =>
                s.projectId === projectId ? { ...s, period } : s
              )
            } else {
              newSelections = [...state.projectSelections, { projectId, period }]
            }
            set({ lastAction: project ? `✅ ${project.name} ajouté en ${period}` : null })
          }
          
          return { projectSelections: newSelections, animatingBudget: true }
        })
        
        setTimeout(() => set({ animatingBudget: false }), 600)
      },

      setFinancingLever: (lever, value) => {
        set((state) => ({
          financingLevers: { ...state.financingLevers, [lever]: value },
          animatingBudget: true,
        }))
        setTimeout(() => set({ animatingBudget: false }), 600)
      },

      getBudgetState: () => {
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

        return {
          m1: BASE_BUDGET + leverImpact - m1Cost,
          m2: BASE_BUDGET + leverImpact - m2Cost,
          totalImpact,
          efficiency,
          leverImpact,
        }
      },

      getScore: () => {
        const { projectSelections, financingLevers } = get()
        const budget = get().getBudgetState()
        
        let score = 0
        
        // Points pour l'impact voyageurs (1 point par 1000 voyageurs)
        score += Math.floor(budget.totalImpact / 1000)
        
        // Bonus pour équilibre budgétaire
        if (budget.m1 >= 0 && budget.m2 >= 0) {
          score += 500
        }
        
        // Bonus pour efficacité (voyageurs/M€)
        score += Math.floor(budget.efficiency * 10)
        
        // Malus pour gratuité totale (choix politique controversé)
        if (financingLevers.gratuiteTotale) {
          score -= 200
        }
        
        // Bonus pour diversité de projets
        const categories = new Set(projectSelections.map(s => {
          const p = PROJECTS.find(pr => pr.id === s.projectId)
          return p?.name.includes('Métro') ? 'metro' : 
                 p?.name.includes('Tram') || p?.name.includes('T') ? 'tram' : 
                 p?.name.includes('BHNS') || p?.name.includes('Bus') ? 'bus' : 'other'
        }))
        score += categories.size * 100
        
        return Math.max(0, score)
      },

      getObjectives: () => {
        const budget = get().getBudgetState()
        const { projectSelections, financingLevers } = get()
        
        const metroProjects = projectSelections.filter(s => {
          const p = PROJECTS.find(pr => pr.id === s.projectId)
          return p?.name.includes('Métro') || p?.name.includes('Ligne') || p?.name.includes('Extension')
        }).length
        
        const tramProjects = projectSelections.filter(s => {
          const p = PROJECTS.find(pr => pr.id === s.projectId)
          return p?.name.includes('T') && p?.name.includes('Tram')
        }).length
        
        return [
          {
            id: 'impact-200k',
            name: 'Mobilité de masse',
            description: '+200 000 voyageurs/jour',
            target: 200000,
            current: budget.totalImpact,
            completed: budget.totalImpact >= 200000,
            reward: 200,
          },
          {
            id: 'impact-600k',
            name: 'Révolution transport',
            description: '+600 000 voyageurs/jour',
            target: 600000,
            current: budget.totalImpact,
            completed: budget.totalImpact >= 600000,
            reward: 500,
          },
          {
            id: 'budget-equilibre',
            name: 'Gestionnaire prudent',
            description: 'Budget positif sur les deux mandats',
            target: 1,
            current: (budget.m1 >= 0 && budget.m2 >= 0) ? 1 : 0,
            completed: budget.m1 >= 0 && budget.m2 >= 0,
            reward: 300,
          },
          {
            id: 'projects-15',
            name: 'Grand bâtisseur',
            description: 'Sélectionner 15 projets',
            target: 15,
            current: projectSelections.length,
            completed: projectSelections.length >= 15,
            reward: 150,
          },
          {
            id: 'metro-network',
            name: 'Réseau métro étendu',
            description: 'Financer 4 projets métro/extensions',
            target: 4,
            current: metroProjects,
            completed: metroProjects >= 4,
            reward: 200,
          },
          {
            id: 'social-policy',
            name: 'Politique sociale',
            description: 'Activer la gratuité totale ou conditionnée',
            target: 1,
            current: (financingLevers.gratuiteTotale || financingLevers.gratuiteConditionnee) ? 1 : 0,
            completed: financingLevers.gratuiteTotale || financingLevers.gratuiteConditionnee,
            reward: 250,
          },
        ]
      },

      getAchievements: () => {
        const budget = get().getBudgetState()
        const { projectSelections, financingLevers } = get()
        
        return [
          {
            id: 'first-project',
            name: 'Premier pas',
            description: 'Sélectionner votre premier projet',
            icon: '🎯',
            unlocked: projectSelections.length > 0,
            condition: () => projectSelections.length > 0,
          },
          {
            id: 'eco-friendly',
            name: 'Écolo',
            description: 'Financer l\'électrification des bus',
            icon: '🌱',
            unlocked: projectSelections.some(s => s.projectId === 'electrif-bus'),
            condition: () => projectSelections.some(s => s.projectId === 'electrif-bus'),
          },
          {
            id: 'big-spender',
            name: 'Mégalomane',
            description: 'Dépenser plus de 5 Md€',
            icon: '💰',
            unlocked: budget.totalImpact > 0 && (4000 - budget.m1 - budget.m2) > 5000,
            condition: () => (4000 - budget.m1 - budget.m2) > 5000,
          },
          {
            id: 'efficiency-master',
            name: 'Efficacité maximale',
            description: 'Obtenir un ratio > 100 voyageurs/M€',
            icon: '⚡',
            unlocked: budget.efficiency > 100,
            condition: () => budget.efficiency > 100,
          },
          {
            id: 'balanced',
            name: 'Équilibriste',
            description: 'Terminer avec les deux budgets positifs',
            icon: '⚖️',
            unlocked: budget.m1 >= 0 && budget.m2 >= 0 && projectSelections.length > 5,
            condition: () => budget.m1 >= 0 && budget.m2 >= 0 && projectSelections.length > 5,
          },
          {
            id: 'fluvial',
            name: 'Capitaine',
            description: 'Financer la navette fluviale',
            icon: '🚢',
            unlocked: projectSelections.some(s => s.projectId === 'navette-fluv'),
            condition: () => projectSelections.some(s => s.projectId === 'navette-fluv'),
          },
        ]
      },

      reset: () => set({
        phase: 'intro',
        onboardingStep: 0,
        projectSelections: [],
        financingLevers: initialFinancingLevers,
        selectedCategory: null,
        lastAction: null,
      }),

      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setAnimatingBudget: (val) => set({ animatingBudget: val }),
      setLastAction: (action) => set({ lastAction: action }),
    }),
    {
      name: 'tcl-game-storage',
      partialize: (state) => ({
        projectSelections: state.projectSelections,
        financingLevers: state.financingLevers,
      }),
    }
  )
)

function calculateLeverImpact(levers: FinancingLevers): number {
  let impact = 0

  if (levers.gratuiteTotale) {
    impact += FINANCING_IMPACTS.gratuiteTotale
  }

  if (levers.gratuiteConditionnee) {
    impact += FINANCING_IMPACTS.gratuiteConditionnee
  }

  if (levers.gratuiteJeunesAbonnes) {
    impact += FINANCING_IMPACTS.gratuiteJeunesAbonnes
  }

  if (levers.metro24hWeekend) {
    impact += FINANCING_IMPACTS.metro24hWeekend
  }

  // Les tarifs ne s'appliquent pas si gratuité totale
  if (!levers.gratuiteTotale) {
    impact += levers.tarifAbonnements * FINANCING_IMPACTS.tarifAbonnementsPerPercent
    impact += levers.tarifTickets * FINANCING_IMPACTS.tarifTicketsPerPercent
  }

  impact += FINANCING_IMPACTS.versementMobilite[levers.versementMobilite.toString() as keyof typeof FINANCING_IMPACTS.versementMobilite]

  if (levers.tva55) {
    impact += FINANCING_IMPACTS.tva55
  }

  return impact
}
