'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS } from '@/lib/data'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { useState } from 'react'
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
  Rocket,
  Map,
  ChevronDown
} from 'lucide-react'
import { GameFinancingPanel } from '@/components/game/FinancingPanel'
import { BusOfferPanel } from '@/components/game/BusOfferPanel'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Bus } from 'lucide-react'

interface MapStyle {
  name: string
  url: string
  attribution: string
}

interface MapDashboardProps {
  onOpenFinancing: () => void
  showFinancing: boolean
  onCloseFinancing: () => void
  onOpenBusOffer: () => void
  showBusOffer: boolean
  onCloseBusOffer: () => void
  mapStyle: string
  onMapStyleChange: (style: any) => void
  mapStyles: Record<string, MapStyle>
}

function getValidationMessage(totalProjects: number, totalImpact: number, financingLevers: any, budget: any): { title: string; subtitle: string; emoji: string } {
  const hasGratuite = financingLevers?.gratuiteTotale
  const hasHighImpact = totalImpact > 200000
  const hasManyProjects = totalProjects >= 10
  const isBalanced = budget.m1 >= 0 && budget.m2 >= 0
  const hasSmallDeficit = (budget.m1 < 0 && budget.m1 >= -100) || (budget.m2 < 0 && budget.m2 >= -100)
  
  if (hasGratuite && hasManyProjects) {
    return {
      title: "Vision ambitieuse et sociale !",
      subtitle: isBalanced ? "Budget équilibré" : "Ajuster le financement",
      emoji: "🌟"
    }
  }
  
  if (hasHighImpact && hasManyProjects) {
    return {
      title: "Programme très ambitieux !",
      subtitle: isBalanced ? "Budget maîtrisé" : hasSmallDeficit ? "Léger déficit" : "Financement à ajuster",
      emoji: "🚀"
    }
  }
  
  if (totalProjects < 5) {
    return {
      title: "Programme ciblé",
      subtitle: isBalanced ? "Budget excédentaire" : "Quelques projets stratégiques",
      emoji: "🎯"
    }
  }
  
  return {
    title: `${totalProjects} projets sélectionnés`,
    subtitle: isBalanced ? "Budget équilibré" : hasSmallDeficit ? "Déficit acceptable" : "Financement insuffisant",
    emoji: "✅"
  }
}

export function MapDashboard({ onOpenFinancing, showFinancing, onCloseFinancing, onOpenBusOffer, showBusOffer, onCloseBusOffer, mapStyle, onMapStyleChange, mapStyles }: MapDashboardProps) {
  const [showMapStyleMenu, setShowMapStyleMenu] = useState(false)
  const { 
    getBudgetState, 
    projectSelections, 
    financingLevers,
    busOfferConfirmed,
    setPhase
  } = useGameStore()
  
  const budget = getBudgetState()
  const totalProjects = projectSelections.length
  const budgetValid = budget.m1 >= -100 && budget.m2 >= -100
  const isValid = budgetValid && busOfferConfirmed
  const hasExcessiveDebt = budget.m1 < -100 || budget.m2 < -100
  const hasProjects = totalProjects > 0

  const totalInvestment = projectSelections.reduce((acc, sel) => {
    const project = PROJECTS.find(p => p.id === sel.projectId)
    return acc + (project?.cost || 0)
  }, 0)

  const validationMsg = getValidationMessage(totalProjects, budget.totalImpact, financingLevers, budget)

  return (
    <>
      {/* Theme Toggle & Map Style - Top Right */}
      <div className="absolute top-4 right-4 z-30 pointer-events-auto flex items-center gap-2">
        {/* Map Style Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative"
        >
          <button
            onClick={() => setShowMapStyleMenu(!showMapStyleMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Map className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mapStyles[mapStyle]?.name || 'Carte'}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", showMapStyleMenu && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {showMapStyleMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-w-[140px]"
              >
                {Object.entries(mapStyles).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onMapStyleChange(key)
                      setShowMapStyleMenu(false)
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm font-medium transition-all flex items-center gap-2",
                      mapStyle === key
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    {mapStyle === key && <span className="text-blue-500">✓</span>}
                    {style.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ThemeToggle />
        </motion.div>
      </div>

      {/* Top Dashboard Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="p-4">
          <div className="pointer-events-auto">
            <div className="flex items-stretch gap-3 flex-wrap">
              {/* Logo/Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-3 flex items-center gap-3 shadow-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-xl">🚇</span>
                </div>
                <div>
                  <h1 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">TCL 2040</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Simulateur Transport</p>
                </div>
              </motion.div>

              {/* Budget M1 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-2xl border px-5 py-3 min-w-[160px] shadow-xl",
                  budget.m1 < 0 ? "border-red-500 dark:border-red-600" : "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium">Mandat 1</span>
                </div>
                <p className={cn(
                  "text-xl font-bold",
                  budget.m1 >= 0 ? "text-green-500 dark:text-green-400" : budget.m1 >= -500 ? "text-yellow-500 dark:text-yellow-400" : "text-red-500 dark:text-red-400"
                )}>
                  {formatCurrency(budget.m1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">2026-2032</p>
              </motion.div>

              {/* Budget M2 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-2xl border px-5 py-3 min-w-[160px] shadow-xl",
                  budget.m2 < 0 ? "border-red-500 dark:border-red-600" : "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium">Mandat 2</span>
                </div>
                <p className={cn(
                  "text-xl font-bold",
                  budget.m2 >= 0 ? "text-green-500 dark:text-green-400" : budget.m2 >= -500 ? "text-yellow-500 dark:text-yellow-400" : "text-red-500 dark:text-red-400"
                )}>
                  {formatCurrency(budget.m2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">2032-2038</p>
              </motion.div>

              {/* Total Impact */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-3 min-w-[180px] shadow-xl"
              >
                <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Impact Total</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  +{formatNumber(budget.totalImpact)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">voyageurs/jour</p>
              </motion.div>

              {/* Projects Count */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-3 shadow-xl"
              >
                <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-medium">Projets</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalProjects}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{formatCurrency(totalInvestment)} inv.</p>
              </motion.div>
            </div>

            {/* Warning Bar - Compact */}
            {hasExcessiveDebt && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-500 flex items-center gap-2 w-fit shadow-lg"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 font-medium text-sm">Déficit maximum : 100 Millions €/mandat</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Cards - Financing (yellow) + Validation (green) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="p-4">
          <div className="pointer-events-auto flex gap-3 justify-center items-end">
            {/* Bus Offer Card - Orange */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onOpenBusOffer}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "rounded-2xl border-2 px-6 py-4 flex items-center gap-4 transition-all shadow-xl hover:shadow-2xl",
                busOfferConfirmed
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 border-green-400 dark:border-green-500"
                  : "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40 border-orange-400 dark:border-orange-500"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                busOfferConfirmed
                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                  : "bg-gradient-to-br from-orange-500 to-amber-600"
              )}>
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className={cn(
                  "font-bold text-lg",
                  busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
                )}>Offre Bus</h3>
                <p className={cn(
                  "text-sm",
                  busOfferConfirmed ? "text-green-600 dark:text-green-300" : "text-orange-600 dark:text-orange-300"
                )}>
                  {busOfferConfirmed ? "✓ Choix confirmés" : "À confirmer"}
                </p>
              </div>
              <ChevronRight className={cn(
                "w-5 h-5",
                busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
              )} />
            </motion.button>

            {/* Financing Card - Yellow */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onOpenFinancing}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40 rounded-2xl border-2 border-yellow-400 dark:border-yellow-500 px-6 py-4 flex items-center gap-4 hover:border-yellow-500 dark:hover:border-yellow-400 transition-all shadow-xl hover:shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-yellow-700 dark:text-yellow-400 font-bold text-lg">Financement</h3>
                <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                  {financingLevers?.gratuiteTotale ? "Gratuité activée" : "Ajuster les leviers"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            </motion.button>

            {/* Validation Card - Green (only if has projects) */}
            <AnimatePresence>
              {hasProjects && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={cn(
                    "rounded-2xl border-2 px-6 py-4 flex items-center gap-4 transition-all shadow-xl",
                    isValid 
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 border-green-400 dark:border-green-500" 
                      : "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-red-400 dark:border-red-500"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{validationMsg.emoji}</span>
                    <div className="text-left">
                      <p className={cn(
                        "font-bold text-lg",
                        isValid ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                      )}>{validationMsg.title}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{validationMsg.subtitle}</p>
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
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
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
            className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financement</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Ajustez vos leviers pour équilibrer le budget</p>
                  </div>
                </div>
                <button
                  onClick={onCloseFinancing}
                  className="p-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Budget Summary Bar */}
            <div className="bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
              <div className="container mx-auto max-w-4xl px-4 py-4">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Mandat 1</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      budget.m1 >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                    )}>{formatCurrency(budget.m1)}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-300 dark:bg-gray-700" />
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Mandat 2</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      budget.m2 >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                    )}>{formatCurrency(budget.m2)}</p>
                  </div>
                  <div className="w-px h-12 bg-gray-300 dark:bg-gray-700" />
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Leviers</p>
                    <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">+{formatCurrency(budget.leverImpact)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-4xl px-4 py-8">
              <GameFinancingPanel />
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isValid ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Budget équilibré</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                      <span className="text-red-600 dark:text-red-400 font-medium">Budget déséquilibré</span>
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

      {/* Bus Offer Panel - Full Page */}
      <AnimatePresence>
        {showBusOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offre Bus</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Définissez votre stratégie pour la flotte de bus</p>
                  </div>
                </div>
                <button
                  onClick={onCloseBusOffer}
                  className="p-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-4xl px-4 py-8">
              <BusOfferPanel />
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="container mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {busOfferConfirmed ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Choix confirmés</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-orange-500" />
                      <span className="text-orange-600 dark:text-orange-400 font-medium">Confirmez vos choix</span>
                    </>
                  )}
                </div>
                <button
                  onClick={onCloseBusOffer}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold hover:opacity-90 transition-all flex items-center gap-2"
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
