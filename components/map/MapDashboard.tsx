'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS } from '@/lib/data'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
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
  ChevronDown,
  RotateCcw
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
  colorMode: 'mode' | 'impact' | 'cost'
  onColorModeChange: (mode: 'mode' | 'impact' | 'cost') => void
  onClearHover?: () => void
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

export function MapDashboard({ onOpenFinancing, showFinancing, onCloseFinancing, onOpenBusOffer, showBusOffer, onCloseBusOffer, mapStyle, onMapStyleChange, mapStyles, colorMode, onColorModeChange, onClearHover }: MapDashboardProps) {
  const [showMapStyleMenu, setShowMapStyleMenu] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showBusOfferWarning, setShowBusOfferWarning] = useState(false)
  const [showDeficitWarning, setShowDeficitWarning] = useState(false)
  const prevBudgetRef = useRef({ m1: 0, m2: 0 })
  const { 
    getBudgetState, 
    projectSelections, 
    financingLevers,
    busOfferConfirmed,
    setPhase,
    reset
  } = useGameStore()
  
  const budget = getBudgetState()
  const totalProjects = projectSelections.length
  const budgetValid = budget.m1 >= -100 && budget.m2 >= -100
  const isValid = budgetValid && busOfferConfirmed
  const hasExcessiveDebt = budget.m1 < -100 || budget.m2 < -100
  const hasProjects = totalProjects > 0
  
  // Detect when budget goes negative for the first time
  useEffect(() => {
    const wasPositiveM1 = prevBudgetRef.current.m1 >= 0
    const wasPositiveM2 = prevBudgetRef.current.m2 >= 0
    const isNegativeM1 = budget.m1 < 0
    const isNegativeM2 = budget.m2 < 0
    
    if ((wasPositiveM1 && isNegativeM1) || (wasPositiveM2 && isNegativeM2)) {
      setShowDeficitWarning(true)
    }
    
    prevBudgetRef.current = { m1: budget.m1, m2: budget.m2 }
  }, [budget.m1, budget.m2])

  const totalInvestment = projectSelections.reduce((acc, sel) => {
    const project = PROJECTS.find(p => p.id === sel.projectId)
    return acc + (project?.cost || 0)
  }, 0)

  const validationMsg = getValidationMessage(totalProjects, budget.totalImpact, financingLevers, budget)

  return (
    <>
      {/* Top Dashboard Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="p-2 tablet:p-4">
          <div className="pointer-events-auto">
            {/* Mobile Layout: Compact card with all info */}
            <div className="tablet:hidden">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 shadow-xl"
              >
                {/* Row 1: Logo + Title + Controls */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <span className="text-base">🚇</span>
                    </div>
                    <h1 className="text-gray-900 dark:text-white font-bold text-base">TCL 2040</h1>
                  </div>
                  {/* Mobile Controls */}
                  <div className="flex items-center gap-1">
                    {/* Color Mode Toggle - 3 modes */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                      <button
                        onClick={() => onColorModeChange('cost')}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors",
                          colorMode === 'cost' ? "bg-orange-500 text-white" : "text-gray-500"
                        )}
                      >
                        €
                      </button>
                      <button
                        onClick={() => onColorModeChange('impact')}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors",
                          colorMode === 'impact' ? "bg-green-500 text-white" : "text-gray-500"
                        )}
                      >
                        Eff
                      </button>
                      <button
                        onClick={() => onColorModeChange('mode')}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors",
                          colorMode === 'mode' ? "bg-blue-500 text-white" : "text-gray-500"
                        )}
                      >
                        Type
                      </button>
                    </div>
                    <button
                      onClick={() => setShowResetModal(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowMapStyleMenu(!showMapStyleMenu)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Map className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <AnimatePresence>
                        {showMapStyleMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-w-[120px] z-50"
                          >
                            {Object.entries(mapStyles).map(([key, style]) => (
                              <button
                                key={key}
                                onClick={() => {
                                  onMapStyleChange(key)
                                  setShowMapStyleMenu(false)
                                }}
                                className={cn(
                                  "w-full px-3 py-2 text-left text-xs font-medium transition-all",
                                  mapStyle === key
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                )}
                              >
                                {style.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
                
                {/* Row 2: Budgets side by side */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {/* M1 */}
                  <div className={cn(
                    "rounded-xl p-2 border",
                    budget.m1 < 0 ? "border-red-400 bg-red-50 dark:bg-gray-800 dark:border-red-400" : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  )}>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-0.5">
                      <Wallet className="w-3 h-3" />
                      <span className="text-[10px] font-medium">Mandat 1</span>
                    </div>
                    <p className={cn(
                      "text-sm font-bold",
                      budget.m1 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatCurrency(budget.m1)}
                    </p>
                  </div>
                  {/* M2 */}
                  <div className={cn(
                    "rounded-xl p-2 border",
                    budget.m2 < 0 ? "border-red-400 bg-red-50 dark:bg-gray-800 dark:border-red-400" : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  )}>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-0.5">
                      <Wallet className="w-3 h-3" />
                      <span className="text-[10px] font-medium">Mandat 2</span>
                    </div>
                    <p className={cn(
                      "text-sm font-bold",
                      budget.m2 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatCurrency(budget.m2)}
                    </p>
                  </div>
                </div>
                
                {/* Row 3: Impact with progress bar + Projects */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">+{formatNumber(budget.totalImpact)} voy/j</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Target className="w-3 h-3" />
                      <span className="font-medium">{totalProjects} projet{totalProjects > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {/* Progress bar objectif voyageur */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <span>Objectif voyageurs</span>
                      <span>{Math.round((budget.totalImpact / 899000) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (budget.totalImpact / 899000) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Warning Bar Mobile */}
              {hasExcessiveDebt && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-2 rounded-xl bg-red-50 dark:bg-gray-900 dark:border-red-400 border-2 border-red-400 flex items-center gap-2 shadow-lg"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-400 font-medium text-xs">Déficit max : 100M€/mandat</p>
                </motion.div>
              )}
            </div>

            {/* Tablet Layout (800px to 1500px): Compact single card */}
            <div className="hidden tablet:block desktop:hidden">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-xl"
              >
                {/* Row 1: Logo + Budgets + Controls */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <span className="text-lg">🚇</span>
                    </div>
                    <h1 className="text-gray-900 dark:text-white font-bold text-base">TCL 2040</h1>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3 justify-center">
                    {/* M1 */}
                    <div className={cn(
                      "rounded-lg px-3 py-1.5 border",
                      budget.m1 < 0 ? "border-red-400 bg-red-50 dark:bg-gray-800 dark:border-red-400" : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                    )}>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">Mandat 1</span>
                      <p className={cn(
                        "text-sm font-bold",
                        budget.m1 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {formatCurrency(budget.m1)}
                      </p>
                    </div>
                    {/* M2 */}
                    <div className={cn(
                      "rounded-lg px-3 py-1.5 border",
                      budget.m2 < 0 ? "border-red-400 bg-red-50 dark:bg-gray-800 dark:border-red-400" : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                    )}>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">Mandat 2</span>
                      <p className={cn(
                        "text-sm font-bold",
                        budget.m2 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {formatCurrency(budget.m2)}
                      </p>
                    </div>
                  </div>

                  {/* Tablet Controls */}
                  <div className="flex items-center gap-2">
                    {/* Color Mode Toggle - 3 modes */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                      <button
                        onClick={() => onColorModeChange('cost')}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-bold transition-colors",
                          colorMode === 'cost' ? "bg-orange-500 text-white" : "text-gray-500"
                        )}
                      >
                        Coût
                      </button>
                      <button
                        onClick={() => onColorModeChange('impact')}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-bold transition-colors",
                          colorMode === 'impact' ? "bg-green-500 text-white" : "text-gray-500"
                        )}
                      >
                        Eff.
                      </button>
                      <button
                        onClick={() => onColorModeChange('mode')}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-bold transition-colors",
                          colorMode === 'mode' ? "bg-blue-500 text-white" : "text-gray-500"
                        )}
                      >
                        Type
                      </button>
                    </div>
                    <button
                      onClick={() => setShowResetModal(true)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowMapStyleMenu(!showMapStyleMenu)}
                        className="flex items-center gap-1 px-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Map className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", showMapStyleMenu && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {showMapStyleMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-w-[120px] z-50"
                          >
                            {Object.entries(mapStyles).map(([key, style]) => (
                              <button
                                key={key}
                                onClick={() => {
                                  onMapStyleChange(key)
                                  setShowMapStyleMenu(false)
                                }}
                                className={cn(
                                  "w-full px-3 py-2 text-left text-xs font-medium transition-all",
                                  mapStyle === key
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                )}
                              >
                                {style.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
                
                {/* Row 2: Stats + Progress bar */}
                <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">+{formatNumber(budget.totalImpact)} voyageurs/jour</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Target className="w-3 h-3" />
                      <span className="font-medium">{totalProjects} projet{totalProjects > 1 ? 's' : ''} • {formatCurrency(totalInvestment)}</span>
                    </div>
                  </div>
                  {/* Progress bar objectif voyageur */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (budget.totalImpact / 899000) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{Math.round((budget.totalImpact / 899000) * 100)}%</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Warning Bar Tablet */}
              {hasExcessiveDebt && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-2 rounded-xl bg-red-50 dark:bg-gray-900 dark:border-red-400 border-2 border-red-400 flex items-center gap-2 shadow-lg"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-400 font-medium text-xs">Déficit max : 100M€/mandat</p>
                </motion.div>
              )}
            </div>

            {/* Desktop Layout (1500px+): Horizontal cards */}
            <div className="hidden desktop:block">
              <div className="flex items-stretch gap-3">
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

                {/* Total Impact with Progress Bar */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-3 min-w-[220px] shadow-xl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Impact</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">Max: 899k</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    +{formatNumber(budget.totalImpact)}
                  </p>
                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (budget.totalImpact / 899000) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                    {Math.round((budget.totalImpact / 899000) * 100)}% de l&apos;objectif
                  </p>
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

                {/* Desktop Controls */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 ml-auto"
                >
                  {/* Color Mode Switch - 3 modes */}
                  <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                    <button
                      onClick={() => onColorModeChange('cost')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        colorMode === 'cost'
                          ? "bg-orange-500 text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      Coût
                    </button>
                    <button
                      onClick={() => onColorModeChange('impact')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        colorMode === 'impact'
                          ? "bg-green-500 text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      Efficacité
                    </button>
                    <button
                      onClick={() => onColorModeChange('mode')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        colorMode === 'mode'
                          ? "bg-blue-500 text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      Type
                    </button>
                  </div>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowMapStyleMenu(!showMapStyleMenu)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      <Map className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{mapStyles[mapStyle]?.name}</span>
                      <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showMapStyleMenu && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {showMapStyleMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-w-[140px] z-50"
                        >
                          {Object.entries(mapStyles).map(([key, style]) => (
                            <button
                              key={key}
                              onClick={() => {
                                onMapStyleChange(key)
                                setShowMapStyleMenu(false)
                              }}
                              className={cn(
                                "w-full px-4 py-2.5 text-left text-sm font-medium transition-all",
                                mapStyle === key
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              )}
                            >
                              {style.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <ThemeToggle />
                </motion.div>
              </div>

              {/* Warning Bar Desktop */}
              {hasExcessiveDebt && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-gray-900 dark:border-red-400 border-2 border-red-400 flex items-center gap-2 w-fit shadow-lg"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-400 font-medium text-sm">Déficit maximum : 100 Millions €/mandat</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Cards - Financing (yellow) + Validation (green) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="p-2 tablet:p-4">
          <div className="pointer-events-auto">
            {/* Mobile Layout: Stacked vertical cards */}
            <div className="tablet:hidden space-y-2">
              {/* Row 1: Bus + Financing side by side */}
              <div className="flex gap-2">
                {/* Bus Offer */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onOpenBusOffer}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex-1 rounded-xl border-2 p-3 flex items-center gap-3 transition-all shadow-xl",
                    busOfferConfirmed
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-400"
                      : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-blue-400"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shadow-md",
                    busOfferConfirmed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  )}>
                    <Bus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className={cn(
                      "font-bold text-sm",
                      busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"
                    )}>Offre Bus</h3>
                    <p className={cn(
                      "text-xs",
                      busOfferConfirmed ? "text-green-600" : "text-blue-600"
                    )}>
                      {busOfferConfirmed ? "✓ Confirmée" : "À confirmer"}
                    </p>
                  </div>
                </motion.button>

                {/* Financing */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onOpenFinancing}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 rounded-xl border-2 border-yellow-400 p-3 flex items-center gap-3 transition-all shadow-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-md">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-yellow-700 dark:text-yellow-400 font-bold text-sm">Financement</h3>
                    <p className="text-yellow-600 text-xs">
                      {financingLevers?.gratuiteTotale ? "Gratuité activée" : "Ajuster leviers"}
                    </p>
                  </div>
                </motion.button>
              </div>

              {/* Row 2: Validation button (full width) */}
              {hasProjects && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (!busOfferConfirmed) {
                      setShowBusOfferWarning(true)
                    } else if (budgetValid) {
                      setPhase('results')
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!budgetValid}
                  className={cn(
                    "w-full rounded-xl border-2 p-3 flex items-center justify-center gap-2 shadow-xl font-bold text-sm transition-all",
                    budgetValid
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 hover:from-green-600 hover:to-emerald-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  )}
                >
                  <Rocket className="w-4 h-4" />
                  Valider le projet
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Tablet Layout (800px to 1500px): Compact horizontal */}
            <div className="hidden tablet:flex desktop:hidden gap-2 justify-center items-stretch">
              {/* Bus Offer */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onOpenBusOffer}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex-1 rounded-xl border-2 p-3 flex items-center gap-3 transition-all shadow-xl",
                  busOfferConfirmed
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-400"
                    : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-blue-400"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shadow-md",
                  busOfferConfirmed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                )}>
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={cn(
                    "font-bold text-sm",
                    busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"
                  )}>Offre Bus</h3>
                  <p className={cn(
                    "text-xs",
                    busOfferConfirmed ? "text-green-600" : "text-blue-600"
                  )}>
                    {busOfferConfirmed ? "✓ Confirmée" : "À confirmer"}
                  </p>
                </div>
              </motion.button>

              {/* Financing */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onOpenFinancing}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 rounded-xl border-2 border-yellow-400 p-3 flex items-center gap-3 transition-all shadow-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-md">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-yellow-700 dark:text-yellow-400 font-bold text-sm">Financement</h3>
                  <p className="text-yellow-600 text-xs">
                    {financingLevers?.gratuiteTotale ? "Gratuité" : "Ajuster"}
                  </p>
                </div>
              </motion.button>

              {/* Validation Button */}
              {hasProjects && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (!busOfferConfirmed) {
                      setShowBusOfferWarning(true)
                    } else if (budgetValid) {
                      setPhase('results')
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!budgetValid}
                  className={cn(
                    "rounded-xl border-2 px-5 py-3 flex items-center gap-2 shadow-xl font-bold text-sm transition-all",
                    budgetValid
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 hover:from-green-600 hover:to-emerald-700"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  )}
                >
                  <Rocket className="w-5 h-5" />
                  Valider le projet
                </motion.button>
              )}
            </div>

            {/* Desktop Layout (1500px+): Full horizontal cards */}
            <div className="hidden desktop:flex gap-3 justify-center items-end">
              {/* Bus Offer Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onOpenBusOffer}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "rounded-2xl border-2 px-6 py-4 flex items-center gap-4 transition-all shadow-xl hover:shadow-2xl",
                  busOfferConfirmed
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-400 dark:border-green-500"
                    : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-blue-400 dark:border-blue-500"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                  busOfferConfirmed
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                )}>
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={cn(
                    "font-bold text-lg",
                    busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"
                  )}>Offre Bus</h3>
                  <p className={cn(
                    "text-sm",
                    busOfferConfirmed ? "text-green-600 dark:text-green-300" : "text-blue-600 dark:text-blue-300"
                  )}>
                    {busOfferConfirmed ? "✓ Choix confirmés" : "À confirmer"}
                  </p>
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5",
                  busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"
                )} />
              </motion.button>

              {/* Financing Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onOpenFinancing}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 rounded-2xl border-2 border-yellow-400 dark:border-yellow-500 px-6 py-4 flex items-center gap-4 hover:border-yellow-500 dark:hover:border-yellow-400 transition-all shadow-xl hover:shadow-2xl"
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

              {/* Validation Button - Same structure as other cards */}
              {hasProjects && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (!busOfferConfirmed) {
                      setShowBusOfferWarning(true)
                    } else if (budgetValid) {
                      setPhase('results')
                    }
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!budgetValid}
                  className={cn(
                    "rounded-2xl border-2 px-6 py-4 flex items-center gap-4 shadow-xl hover:shadow-2xl transition-all",
                    budgetValid
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-400 dark:border-green-500"
                      : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                    budgetValid
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gray-400 dark:bg-gray-600"
                  )}>
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className={cn(
                      "font-bold text-lg",
                      budgetValid ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
                    )}>Valider</h3>
                    <p className={cn(
                      "text-sm",
                      budgetValid ? "text-green-600 dark:text-green-300" : "text-gray-400 dark:text-gray-500"
                    )}>
                      {budgetValid ? "Voir les résultats" : "Budget invalide"}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "w-5 h-5",
                    budgetValid ? "text-green-700 dark:text-green-400" : "text-gray-400"
                  )} />
                </motion.button>
              )}
            </div>
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
            <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
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
                      <span className="text-blue-600 dark:text-blue-400 font-medium">Confirmez vos choix</span>
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

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-400 dark:border-red-500 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg">Réinitialiser la carte</h3>
                  <p className="text-red-600 dark:text-red-400 text-sm">Action irréversible</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Êtes-vous sûr de vouloir <strong className="text-gray-900 dark:text-white">réinitialiser complètement</strong> la carte ?
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Cela supprimera :
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1 ml-2">
                  <li>Tous les projets sélectionnés ({totalProjects} projet{totalProjects > 1 ? 's' : ''})</li>
                  <li>Tous les choix de financement</li>
                  <li>Les options de bus confirmées</li>
                </ul>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                  ⚠️ Cette action ne peut pas être annulée.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    reset()
                    setShowResetModal(false)
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bus Offer Warning Modal */}
      <AnimatePresence>
        {showBusOfferWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowBusOfferWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-400 dark:border-orange-500 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg">Offre Bus requise</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">Étape manquante</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Avant de voir les résultats, vous devez <strong className="text-gray-900 dark:text-white">confirmer vos choix pour l&apos;offre bus</strong>.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  L&apos;offre bus comprend :
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1 ml-2">
                  <li>Électrification de la flotte de bus (460 Millions €)</li>
                  <li>Entretien et renouvellement de la flotte (800 Millions €)</li>
                </ul>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  💡 Ces choix impactent votre budget et doivent être validés.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBusOfferWarning(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowBusOfferWarning(false)
                    onOpenBusOffer()
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Bus className="w-4 h-4" />
                  Ouvrir l&apos;offre bus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deficit Warning Modal */}
      <AnimatePresence>
        {showDeficitWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowDeficitWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-yellow-400 dark:border-yellow-500 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg">Budget en déficit</h3>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm">Attention requise</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Votre budget est passé <strong className="text-red-600 dark:text-red-400">en dessous de zéro</strong> pour au moins un mandat.
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mandat 1 :</span>
                    <span className={cn("font-bold", budget.m1 >= 0 ? "text-green-600" : "text-red-600")}>
                      {formatCurrency(budget.m1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mandat 2 :</span>
                    <span className={cn("font-bold", budget.m2 >= 0 ? "text-green-600" : "text-red-600")}>
                      {formatCurrency(budget.m2)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Vous pouvez équilibrer votre budget en :
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1 ml-2">
                  <li>Activant des leviers de financement</li>
                  <li>Retirant certains projets</li>
                  <li>Étalant des projets sur les deux mandats</li>
                </ul>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                  💡 Un déficit jusqu&apos;à 100M€ par mandat est acceptable.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeficitWarning(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Compris
                </button>
                <button
                  onClick={() => {
                    setShowDeficitWarning(false)
                    onClearHover?.()
                    onOpenFinancing()
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  Voir le financement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
