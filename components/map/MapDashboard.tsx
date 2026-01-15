'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS } from '@/lib/data'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { 
  Coins, 
  Users, 
  ChevronRight,
  Target,
  Wallet,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Rocket
} from 'lucide-react'
import { GameFinancingPanel } from '@/components/game/FinancingPanel'

interface MapDashboardProps {
  onOpenFinancing: () => void
  showFinancing: boolean
  onCloseFinancing: () => void
}

function getValidationMessage(totalProjects: number, totalImpact: number, financingLevers: any): { title: string; subtitle: string; emoji: string } {
  const hasGratuite = financingLevers?.gratuiteTotale
  const hasHighImpact = totalImpact > 200000
  const hasManyProjects = totalProjects >= 10
  
  if (hasGratuite && hasManyProjects) {
    return {
      title: "Vision ambitieuse et sociale !",
      subtitle: "Gratuité + investissements massifs",
      emoji: "🌟"
    }
  }
  
  if (hasHighImpact && hasManyProjects) {
    return {
      title: "Programme très ambitieux !",
      subtitle: `${totalProjects} projets majeurs`,
      emoji: "🚀"
    }
  }
  
  if (totalProjects < 5) {
    return {
      title: "Programme ciblé",
      subtitle: "Quelques projets stratégiques",
      emoji: "🎯"
    }
  }
  
  return {
    title: "Programme équilibré",
    subtitle: `${totalProjects} projets sélectionnés`,
    emoji: "✅"
  }
}

export function MapDashboard({ onOpenFinancing, showFinancing, onCloseFinancing }: MapDashboardProps) {
  const { 
    getBudgetState, 
    projectSelections, 
    financingLevers,
    setPhase
  } = useGameStore()
  
  const budget = getBudgetState()
  const totalProjects = projectSelections.length
  const isValid = budget.m1 >= -1000 && budget.m2 >= -1000
  const hasExcessiveDebt = budget.m1 < -1000 || budget.m2 < -1000
  const hasProjects = totalProjects > 0

  const totalInvestment = projectSelections.reduce((acc, sel) => {
    const project = PROJECTS.find(p => p.id === sel.projectId)
    return acc + (project?.cost || 0)
  }, 0)

  const validationMsg = getValidationMessage(totalProjects, budget.totalImpact, financingLevers)

  return (
    <>
      {/* Top Dashboard Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="p-4">
          <div className="pointer-events-auto">
            <div className="flex items-stretch gap-3 flex-wrap">
              {/* Logo/Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 px-5 py-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-xl">🚇</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight">TCL 2040</h1>
                  <p className="text-gray-400 text-xs">Simulateur Transport</p>
                </div>
              </motion.div>

              {/* Budget M1 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "bg-gray-900/90 backdrop-blur-xl rounded-2xl border px-5 py-3 min-w-[160px]",
                  budget.m1 < 0 ? "border-red-500/50" : "border-gray-700/50"
                )}
              >
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium">Budget M1</span>
                </div>
                <p className={cn(
                  "text-xl font-bold",
                  budget.m1 >= 0 ? "text-green-400" : budget.m1 >= -500 ? "text-yellow-400" : "text-red-400"
                )}>
                  {formatCurrency(budget.m1)}
                </p>
                <p className="text-xs text-gray-500">2026-2032</p>
              </motion.div>

              {/* Budget M2 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={cn(
                  "bg-gray-900/90 backdrop-blur-xl rounded-2xl border px-5 py-3 min-w-[160px]",
                  budget.m2 < 0 ? "border-red-500/50" : "border-gray-700/50"
                )}
              >
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium">Budget M2</span>
                </div>
                <p className={cn(
                  "text-xl font-bold",
                  budget.m2 >= 0 ? "text-green-400" : budget.m2 >= -500 ? "text-yellow-400" : "text-red-400"
                )}>
                  {formatCurrency(budget.m2)}
                </p>
                <p className="text-xs text-gray-500">2032-2038</p>
              </motion.div>

              {/* Total Impact */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 px-5 py-3 min-w-[180px]"
              >
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Impact Total</span>
                </div>
                <p className="text-xl font-bold text-white">
                  +{formatNumber(budget.totalImpact)}
                </p>
                <p className="text-xs text-gray-500">voyageurs/jour</p>
              </motion.div>

              {/* Projects Count */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 px-5 py-3"
              >
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-medium">Projets</span>
                </div>
                <p className="text-xl font-bold text-white">{totalProjects}</p>
                <p className="text-xs text-gray-500">{formatCurrency(totalInvestment)} inv.</p>
              </motion.div>
            </div>

            {/* Warning Bar - Compact */}
            {hasExcessiveDebt && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 w-fit"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-400 font-medium text-sm">Dette excessive ! Max 1 Md€/mandat</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Cards - Financing (yellow) + Validation (green) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="p-4">
          <div className="pointer-events-auto flex gap-3 justify-center items-end">
            {/* Financing Card - Yellow */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onOpenFinancing}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 backdrop-blur-xl rounded-2xl border border-yellow-500/40 px-6 py-4 flex items-center gap-4 hover:border-yellow-400/60 transition-all shadow-lg hover:shadow-yellow-500/20"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-yellow-400 font-bold text-lg">Financement</h3>
                <p className="text-yellow-300/60 text-sm">
                  {financingLevers?.gratuiteTotale ? "Gratuité activée" : "Ajuster les leviers"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-yellow-400" />
            </motion.button>

            {/* Validation Card - Green (only if has projects) */}
            <AnimatePresence>
              {hasProjects && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={cn(
                    "backdrop-blur-xl rounded-2xl border px-6 py-4 flex items-center gap-4 transition-all shadow-lg",
                    isValid 
                      ? "bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/40" 
                      : "bg-gradient-to-br from-red-500/10 to-orange-600/10 border-red-500/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{validationMsg.emoji}</span>
                    <div className="text-left">
                      <p className={cn(
                        "font-bold text-lg",
                        isValid ? "text-green-400" : "text-red-400"
                      )}>{validationMsg.title}</p>
                      <p className="text-gray-400 text-sm">{validationMsg.subtitle}</p>
                    </div>
                  </div>
                  
                  <motion.button
                    disabled={!isValid}
                    onClick={() => setPhase('results')}
                    whileHover={isValid ? { scale: 1.05 } : {}}
                    whileTap={isValid ? { scale: 0.95 } : {}}
                    className={cn(
                      "ml-4 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                      isValid 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-green-500/30" 
                        : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    {isValid ? (
                      <>
                        <Rocket className="w-5 h-5" />
                        Voir les résultats
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5" />
                        Budget invalide
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Financing Panel - Full Page */}
      <AnimatePresence>
        {showFinancing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-950 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
              <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Financement</h1>
                    <p className="text-gray-400 text-sm">Ajustez vos leviers pour équilibrer le budget</p>
                  </div>
                </div>
                <button
                  onClick={onCloseFinancing}
                  className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Budget Summary Bar */}
            <div className="bg-gray-900/50 border-b border-gray-800">
              <div className="container mx-auto max-w-4xl px-4 py-4">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Budget M1</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      budget.m1 >= 0 ? "text-green-400" : "text-red-400"
                    )}>{formatCurrency(budget.m1)}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-700" />
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Budget M2</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      budget.m2 >= 0 ? "text-green-400" : "text-red-400"
                    )}>{formatCurrency(budget.m2)}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-700" />
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Leviers</p>
                    <p className="text-2xl font-bold text-yellow-400">+{formatCurrency(budget.leverImpact)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-4xl px-4 py-8">
              <GameFinancingPanel />
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800">
              <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isValid ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-green-400 font-medium">Budget équilibré</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <span className="text-red-400 font-medium">Budget déséquilibré</span>
                    </>
                  )}
                </div>
                <button
                  onClick={onCloseFinancing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  Retour à la carte
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
