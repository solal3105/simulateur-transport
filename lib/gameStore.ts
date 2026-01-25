import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjectSelection, FinancingLevers, MandatPeriod, FinancingLeverPeriod } from './types'
import { PROJECTS, BASE_BUDGET, FINANCING_IMPACTS } from './data'
import { PoliticalParty, POLITICAL_PARTIES } from './politicalParties'

// Helper to check if a financing lever is active (for any period)
export function isLeverActive(lever: FinancingLeverPeriod): boolean {
  return lever === true || lever === 'M1' || lever === 'M2' || lever === 'M1+M2'
}

// Helper to check if lever applies to a specific mandate
function leverAppliesTo(lever: FinancingLeverPeriod, mandate: 'M1' | 'M2'): boolean {
  if (lever === true || lever === 'M1+M2') return true
  if (lever === mandate) return true
  return false
}

// Calculate lever impact split by mandate
function calculateLeverImpactByMandate(levers: FinancingLevers): { m1: number; m2: number } {
  let m1Impact = 0
  let m2Impact = 0

  const gratuiteTotaleActive = isLeverActive(levers.gratuiteTotale)

  // Gratuité totale
  if (leverAppliesTo(levers.gratuiteTotale, 'M1')) m1Impact += FINANCING_IMPACTS.gratuiteTotale
  if (leverAppliesTo(levers.gratuiteTotale, 'M2')) m2Impact += FINANCING_IMPACTS.gratuiteTotale

  // Gratuité -25 ans (ne s'applique pas si gratuité totale)
  if (!gratuiteTotaleActive) {
    if (leverAppliesTo(levers.gratuiteMoins25ans, 'M1')) m1Impact += FINANCING_IMPACTS.gratuiteMoins25ans
    if (leverAppliesTo(levers.gratuiteMoins25ans, 'M2')) m2Impact += FINANCING_IMPACTS.gratuiteMoins25ans
  }

  // Gratuité jeunes abonnés (ne s'applique pas si gratuité totale)
  if (!gratuiteTotaleActive) {
    if (leverAppliesTo(levers.gratuiteJeunesAbonnes, 'M1')) m1Impact += FINANCING_IMPACTS.gratuiteJeunesAbonnes
    if (leverAppliesTo(levers.gratuiteJeunesAbonnes, 'M2')) m2Impact += FINANCING_IMPACTS.gratuiteJeunesAbonnes
  }

  // Suppression tarification sociale (ne s'applique pas si gratuité totale)
  if (!gratuiteTotaleActive) {
    if (leverAppliesTo(levers.suppressionTarifSocial, 'M1')) m1Impact += FINANCING_IMPACTS.suppressionTarifSocial
    if (leverAppliesTo(levers.suppressionTarifSocial, 'M2')) m2Impact += FINANCING_IMPACTS.suppressionTarifSocial
  }

  // Métro 24h weekend
  if (leverAppliesTo(levers.metro24hWeekend, 'M1')) m1Impact += FINANCING_IMPACTS.metro24hWeekend
  if (leverAppliesTo(levers.metro24hWeekend, 'M2')) m2Impact += FINANCING_IMPACTS.metro24hWeekend

  // Les tarifs ne s'appliquent pas si gratuité totale
  if (!gratuiteTotaleActive) {
    const tarifImpact = levers.tarifAbonnements * FINANCING_IMPACTS.tarifAbonnementsPerPercent +
                        levers.tarifTickets * FINANCING_IMPACTS.tarifTicketsPerPercent
    m1Impact += tarifImpact
    m2Impact += tarifImpact
  }

  // Versement mobilité (applies to both mandates)
  const vmImpact = FINANCING_IMPACTS.versementMobilite[levers.versementMobilite.toString() as keyof typeof FINANCING_IMPACTS.versementMobilite]
  m1Impact += vmImpact
  m2Impact += vmImpact

  // TVA 5.5%
  if (leverAppliesTo(levers.tva55, 'M1')) m1Impact += FINANCING_IMPACTS.tva55
  if (leverAppliesTo(levers.tva55, 'M2')) m2Impact += FINANCING_IMPACTS.tva55

  return { m1: m1Impact, m2: m2Impact }
}

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
  busOfferConfirmed: boolean
  showTutorial: boolean
  tutorialStep: number
  selectedCategory: string | null
  animatingBudget: boolean
  lastAction: string | null
  selectedPartyId: string | null
  
  // Actions
  setPhase: (phase: GamePhase) => void
  nextOnboardingStep: () => void
  skipOnboarding: () => void
  nextTutorialStep: () => void
  skipTutorial: () => void
  setProjectPeriod: (projectId: string, period: MandatPeriod) => void
  setProjectUpgrade: (projectId: string, upgraded: boolean) => void
  setProjectUpgradeOption: (projectId: string, optionId: string | null) => void
  setFinancingLever: <K extends keyof FinancingLevers>(lever: K, value: FinancingLevers[K]) => void
  getBudgetState: () => { m1: number; m2: number; totalImpact: number; efficiency: number; leverImpact: number }
  getScore: () => number
  getObjectives: () => Objective[]
  getAchievements: () => Achievement[]
  reset: () => void
  setSelectedCategory: (cat: string | null) => void
  setAnimatingBudget: (val: boolean) => void
  setLastAction: (action: string | null) => void
  setBusOfferConfirmed: (val: boolean) => void
  applyPartyPreselection: (partyId: string | null) => void
}

const initialFinancingLevers: FinancingLevers = {
  gratuiteTotale: false,
  gratuiteMoins25ans: false,
  gratuiteJeunesAbonnes: false,
  suppressionTarifSocial: false,
  metro24hWeekend: false,
  tarifAbonnements: 0,
  tarifTickets: 0,
  versementMobilite: 0,
  tva55: false,
  electrificationBus: null,
  entretienBus: 'M1+M2',
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
      busOfferConfirmed: false,
      showTutorial: true,
      tutorialStep: 0,
      selectedCategory: null,
      animatingBudget: false,
      lastAction: null,
      selectedPartyId: null,

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
      
      nextTutorialStep: () => {
        const { tutorialStep } = get()
        if (tutorialStep < 4) {
          set({ tutorialStep: tutorialStep + 1 })
        } else {
          set({ showTutorial: false, tutorialStep: 0 })
        }
      },
      
      skipTutorial: () => set({ showTutorial: false, tutorialStep: 0 }),

      setProjectPeriod: (projectId, period) => {
        set((state) => {
          const project = PROJECTS.find(p => p.id === projectId)
          let newSelections: ProjectSelection[]
          
          if (period === null) {
            // Remove project and any projects that depend on it
            newSelections = state.projectSelections.filter((s) => {
              const p = PROJECTS.find(pr => pr.id === s.projectId)
              return s.projectId !== projectId && p?.requires !== projectId
            })
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

      setProjectUpgrade: (projectId, upgraded) => {
        set((state) => ({
          projectSelections: state.projectSelections.map((s) =>
            s.projectId === projectId ? { ...s, upgraded } : s
          ),
          animatingBudget: true,
        }))
        setTimeout(() => set({ animatingBudget: false }), 600)
      },

      setProjectUpgradeOption: (projectId, optionId) => {
        set((state) => ({
          projectSelections: state.projectSelections.map((s) =>
            s.projectId === projectId ? { ...s, selectedUpgradeOptionId: optionId || undefined } : s
          ),
          animatingBudget: true,
        }))
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

          let projectCost = project.cost
          let projectImpact = project.impact || 0

          // Handle upgradeOptions (multiple choice like Ligne du Nord)
          if (project.upgradeOptions && selection.selectedUpgradeOptionId) {
            const selectedOption = project.upgradeOptions.find(o => o.id === selection.selectedUpgradeOptionId)
            if (selectedOption) {
              projectCost = selectedOption.cost
              projectImpact = selectedOption.impact
            }
          }
          // Handle simple upgrade (like TEOL)
          else if (selection.upgraded && project.upgrade) {
            projectCost += project.upgrade.additionalCost
            projectImpact += project.upgrade.additionalImpact || 0
          }

          if (selection.period === 'M1') {
            m1Cost += projectCost
          } else if (selection.period === 'M2') {
            m2Cost += projectCost
          } else if (selection.period === 'M1+M2') {
            m1Cost += projectCost / 2
            m2Cost += projectCost / 2
          }

          totalImpact += projectImpact
        })

        // Add electrification bus cost (460M total)
        if (financingLevers.electrificationBus === 'M1') {
          m1Cost += 460
        } else if (financingLevers.electrificationBus === 'M2') {
          m2Cost += 460
        } else if (financingLevers.electrificationBus === 'M1+M2') {
          m1Cost += 230
          m2Cost += 230
        }

        // Add bus fleet maintenance cost (800M total)
        if (financingLevers.entretienBus === 'M1') {
          m1Cost += 800
        } else if (financingLevers.entretienBus === 'M2') {
          m2Cost += 800
        } else if (financingLevers.entretienBus === 'M1+M2') {
          m1Cost += 400
          m2Cost += 400
        }

        const leverImpact = calculateLeverImpactByMandate(financingLevers)
        const totalCost = m1Cost + m2Cost
        const efficiency = totalCost > 0 ? totalImpact / totalCost : 0

        return {
          m1: BASE_BUDGET + leverImpact.m1 - m1Cost,
          m2: BASE_BUDGET + leverImpact.m2 - m2Cost,
          totalImpact,
          efficiency,
          leverImpact: leverImpact.m1 + leverImpact.m2,
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
        if (isLeverActive(financingLevers.gratuiteTotale)) {
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
            id: 'projects-10',
            name: 'Grand bâtisseur',
            description: 'Sélectionner 10 projets (c\'est déjà énorme !)',
            target: 10,
            current: projectSelections.length,
            completed: projectSelections.length >= 10,
            reward: 150,
          },
          {
            id: 'social-policy',
            name: 'Politique sociale',
            description: 'Activer la gratuité totale ou pour les enfants d\'abonnés',
            target: 1,
            current: (isLeverActive(financingLevers.gratuiteTotale) || isLeverActive(financingLevers.gratuiteJeunesAbonnes)) ? 1 : 0,
            completed: isLeverActive(financingLevers.gratuiteTotale) || isLeverActive(financingLevers.gratuiteJeunesAbonnes),
            reward: 250,
          },
          {
            id: 'no-law-dependency',
            name: 'Indépendant',
            description: 'Ne pas dépendre d\'une loi nationale (pas de versement mobilité ni TVA 5.5%)',
            target: 1,
            current: (financingLevers.versementMobilite <= 0 && !isLeverActive(financingLevers.tva55)) ? 1 : 0,
            completed: financingLevers.versementMobilite <= 0 && !isLeverActive(financingLevers.tva55),
            reward: 200,
          },
          {
            id: 'price-stability',
            name: 'Pouvoir d\'achat préservé',
            description: 'Augmentation des tarifs ≤ 10% (inflation naturelle)',
            target: 1,
            current: (financingLevers.tarifAbonnements <= 10 && financingLevers.tarifTickets <= 10) ? 1 : 0,
            completed: financingLevers.tarifAbonnements <= 10 && financingLevers.tarifTickets <= 10,
            reward: 150,
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
            description: 'Activer l\'électrification des bus',
            icon: '🌱',
            unlocked: financingLevers.electrificationBus !== null,
            condition: () => financingLevers.electrificationBus !== null,
          },
          {
            id: 'big-spender',
            name: 'Mégalomane',
            description: 'Dépenser plus de 5 milliards d\'euros',
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
        phase: 'playing',
        onboardingStep: 0,
        projectSelections: [],
        financingLevers: initialFinancingLevers,
        busOfferConfirmed: false,
        selectedCategory: null,
        lastAction: null,
        animatingBudget: false,
      }),

      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setAnimatingBudget: (val) => set({ animatingBudget: val }),
      setLastAction: (action) => set({ lastAction: action }),
      setBusOfferConfirmed: (val) => set({ busOfferConfirmed: val }),

      applyPartyPreselection: (partyId) => {
        if (partyId === null) {
          // Reset to empty state
          set({
            selectedPartyId: null,
            projectSelections: [],
            financingLevers: initialFinancingLevers,
            busOfferConfirmed: false,
            lastAction: '🔄 Sélection réinitialisée',
            animatingBudget: true,
          })
        } else {
          const party = POLITICAL_PARTIES.find(p => p.id === partyId)
          if (party) {
            set({
              selectedPartyId: partyId,
              projectSelections: [...party.projectSelections],
              financingLevers: { ...initialFinancingLevers, ...party.financingLevers },
              busOfferConfirmed: party.financingLevers.entretienBus !== undefined,
              lastAction: `${party.emoji} Programme ${party.shortName} appliqué`,
              animatingBudget: true,
            })
          }
        }
        setTimeout(() => set({ animatingBudget: false }), 600)
      },
    }),
    {
      name: 'tcl-game-storage',
      partialize: (state) => ({
        projectSelections: state.projectSelections,
        financingLevers: state.financingLevers,
        busOfferConfirmed: state.busOfferConfirmed,
        selectedPartyId: state.selectedPartyId,
      }),
    }
  )
)
