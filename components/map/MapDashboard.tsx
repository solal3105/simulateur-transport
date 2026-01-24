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
  RotateCcw,
  Calendar,
  Trophy
} from 'lucide-react'
import { GameFinancingPanel } from '@/components/game/FinancingPanel'
import { BusOfferPanel } from '@/components/game/BusOfferPanel'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Bus } from 'lucide-react'
import { ProjectTimeline } from '@/components/game/ProjectTimeline'
import { PartySelector } from '@/components/game/PartySelector'

// Circular gauge component with value BELOW the circle
function CircularGauge({ 
  value, 
  maxValue = 2000, 
  label,
  unit = 'M€',
  size = 48,
  colorScheme = 'budget'
}: { 
  value: number
  maxValue?: number
  label: string
  unit?: string
  size?: number
  colorScheme?: 'budget' | 'impact'
}) {
  const percentage = Math.max(0, Math.min(value / maxValue, 1))
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - percentage)
  
  const getColor = () => {
    if (colorScheme === 'impact') {
      return { stroke: '#a855f7', text: 'text-purple-600 dark:text-purple-400', bg: 'stroke-purple-200 dark:stroke-purple-900' }
    }
    if (value < -100) return { stroke: '#ef4444', text: 'text-red-600 dark:text-red-400', bg: 'stroke-red-200 dark:stroke-red-900' }
    if (value < 0) return { stroke: '#f59e0b', text: 'text-amber-600 dark:text-amber-400', bg: 'stroke-amber-200 dark:stroke-amber-900' }
    if (percentage > 0.5) return { stroke: '#22c55e', text: 'text-green-600 dark:text-green-400', bg: 'stroke-green-200 dark:stroke-green-900' }
    return { stroke: '#eab308', text: 'text-yellow-600 dark:text-yellow-400', bg: 'stroke-yellow-200 dark:stroke-yellow-900' }
  }
  
  const colors = getColor()
  const displayValue = colorScheme === 'impact' 
    ? `+${formatNumber(value)}` 
    : (value < 0 ? `-${Math.abs(value)}` : `${value}`)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={5}
            className={colors.bg}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={5}
            strokeLinecap="round"
            stroke={colors.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className={cn("font-bold text-sm leading-tight", colors.text)}>{displayValue}</p>
        <p className="text-gray-500 dark:text-gray-400 text-[10px]">{unit}</p>
        <p className="text-gray-600 dark:text-gray-300 text-[10px] font-medium">{label}</p>
      </div>
    </div>
  )
}

// Bar gauge for desktop budget display
function BudgetBarGauge({ value, maxValue = 2000, label, sublabel }: { value: number; maxValue?: number; label: string; sublabel: string }) {
  const percentage = Math.max(0, Math.min((value / maxValue) * 100, 100))
  
  const getColors = () => {
    if (value < -100) return { bar: 'from-red-500 to-red-600', text: 'text-red-500 dark:text-red-400' }
    if (value < 0) return { bar: 'from-amber-500 to-orange-500', text: 'text-amber-500 dark:text-amber-400' }
    if (percentage > 50) return { bar: 'from-green-500 to-emerald-500', text: 'text-green-500 dark:text-green-400' }
    return { bar: 'from-yellow-500 to-amber-500', text: 'text-yellow-500 dark:text-yellow-400' }
  }
  
  const colors = getColors()

  return (
    <div className="min-w-[160px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">{label}</span>
        <span className={cn("font-bold text-sm", colors.text)}>
          {value < 0 ? '-' : ''}{formatCurrency(Math.abs(value))}
        </span>
      </div>
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", colors.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-gray-500 dark:text-gray-500 text-[10px] mt-1">{sublabel}</p>
    </div>
  )
}

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
  const [showColorModeMenu, setShowColorModeMenu] = useState(false)
  const [showPartyMenu, setShowPartyMenu] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  // Close all other dropdowns when opening one
  const openMapStyleMenu = () => {
    setShowColorModeMenu(false)
    setShowPartyMenu(false)
    setShowMapStyleMenu(true)
  }
  const openColorModeMenu = () => {
    setShowMapStyleMenu(false)
    setShowPartyMenu(false)
    setShowColorModeMenu(true)
  }
  const openPartyMenu = () => {
    setShowMapStyleMenu(false)
    setShowColorModeMenu(false)
    setShowPartyMenu(true)
  }
  const [showBusOfferWarning, setShowBusOfferWarning] = useState(false)
  const [showDeficitWarning, setShowDeficitWarning] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const prevBudgetRef = useRef({ m1: 0, m2: 0 })
  const { 
    getBudgetState, 
    projectSelections, 
    financingLevers,
    busOfferConfirmed,
    setBusOfferConfirmed,
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
                {/* Row 1: Logo + Controls */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <img 
                    src="/logo-rectangle-white.png" 
                    alt="TCL 2040" 
                    className="h-8 w-auto dark:invert"
                  />
                  {/* Mobile Controls */}
                  <div className="flex items-center gap-1">
                    {/* Party Selector */}
                    <PartySelector compact />
                    {/* Color Mode Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => showColorModeMenu ? setShowColorModeMenu(false) : openColorModeMenu()}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                          {colorMode === 'cost' ? 'Coût' : colorMode === 'impact' ? 'Eff.' : 'Type'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </button>
                      <AnimatePresence>
                        {showColorModeMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-w-[100px] z-50"
                          >
                            <button onClick={() => { onColorModeChange('cost'); setShowColorModeMenu(false) }} className={cn("w-full px-3 py-2 text-left text-xs font-medium", colorMode === 'cost' ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}>Coût</button>
                            <button onClick={() => { onColorModeChange('impact'); setShowColorModeMenu(false) }} className={cn("w-full px-3 py-2 text-left text-xs font-medium", colorMode === 'impact' ? "bg-green-50 dark:bg-green-900/30 text-green-600" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}>Efficacité</button>
                            <button onClick={() => { onColorModeChange('mode'); setShowColorModeMenu(false) }} className={cn("w-full px-3 py-2 text-left text-xs font-medium", colorMode === 'mode' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}>Type</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => setShowResetModal(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => showMapStyleMenu ? setShowMapStyleMenu(false) : openMapStyleMenu()}
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
                
                {/* Row 2: 3 columns with horizontal bar gauges */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Mandat 1 */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 dark:text-gray-400 text-[10px] font-medium">M1</span>
                      <span className={cn("font-bold text-[10px]", budget.m1 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{formatCurrency(budget.m1)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", budget.m1 >= 0 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-orange-500")}
                        style={{ width: `${Math.min(100, Math.max(0, (budget.m1 / 2000) * 100))}%` }}
                      />
                    </div>
                  </div>
                  {/* Mandat 2 */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 dark:text-gray-400 text-[10px] font-medium">M2</span>
                      <span className={cn("font-bold text-[10px]", budget.m2 >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400")}>{formatCurrency(budget.m2)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", budget.m2 >= 0 ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-red-500 to-orange-500")}
                        style={{ width: `${Math.min(100, Math.max(0, (budget.m2 / 2000) * 100))}%` }}
                      />
                    </div>
                  </div>
                  {/* Impact */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 dark:text-gray-400 text-[10px] font-medium">Impact</span>
                      <span className="font-bold text-[10px] text-purple-600 dark:text-purple-400">+{formatNumber(budget.totalImpact)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
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
                {/* Row 1: Logo + Controls */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/logo-rectangle-white.png" 
                      alt="TCL 2040" 
                      className="h-10 w-auto dark:invert"
                    />
                  </div>

                  {/* Tablet Controls */}
                  <div className="flex items-center gap-2">
                    {/* Party Selector */}
                    <PartySelector compact />
                    {/* Color Mode Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => showColorModeMenu ? setShowColorModeMenu(false) : openColorModeMenu()}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {colorMode === 'cost' ? 'Coût' : colorMode === 'impact' ? 'Efficacité' : 'Type'}
                        </span>
                        <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", showColorModeMenu && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {showColorModeMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-w-[120px] z-50"
                          >
                            {[
                              { key: 'cost', label: 'Coût', color: 'orange' },
                              { key: 'impact', label: 'Efficacité', color: 'green' },
                              { key: 'mode', label: 'Type', color: 'blue' }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                onClick={() => {
                                  onColorModeChange(opt.key as 'cost' | 'impact' | 'mode')
                                  setShowColorModeMenu(false)
                                }}
                                className={cn(
                                  "w-full px-3 py-2 text-left text-xs font-medium transition-all",
                                  colorMode === opt.key
                                    ? `bg-${opt.color}-50 dark:bg-${opt.color}-900/30 text-${opt.color}-600 dark:text-${opt.color}-400`
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => setShowResetModal(true)}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => showMapStyleMenu ? setShowMapStyleMenu(false) : openMapStyleMenu()}
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
                
                {/* Row 2: 3 columns with horizontal bar gauges */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Mandat 1 */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Mandat 1</span>
                      <span className={cn("font-bold text-sm", budget.m1 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{formatCurrency(budget.m1)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", budget.m1 >= 0 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-orange-500")}
                        style={{ width: `${Math.min(100, Math.max(0, (budget.m1 / 2000) * 100))}%` }}
                      />
                    </div>
                  </div>
                  {/* Mandat 2 */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Mandat 2</span>
                      <span className={cn("font-bold text-sm", budget.m2 >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400")}>{formatCurrency(budget.m2)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", budget.m2 >= 0 ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-red-500 to-orange-500")}
                        style={{ width: `${Math.min(100, Math.max(0, (budget.m2 / 2000) * 100))}%` }}
                      />
                    </div>
                  </div>
                  {/* Impact */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Impact</span>
                      <span className="font-bold text-sm text-purple-600 dark:text-purple-400">+{formatNumber(budget.totalImpact)}/j</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (budget.totalImpact / 899000) * 100)}%` }}
                      />
                    </div>
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
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-3 flex items-center shadow-xl"
                >
                  <img 
                    src="/logo-square-white.png" 
                    alt="TCL 2040" 
                    className="h-14 w-auto dark:invert"
                  />
                </motion.div>

                {/* Unified Stats Card - Budget + Impact + Projects */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-6 py-3 shadow-xl flex items-center gap-8"
                >
                  {/* Budget Section */}
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                      <Wallet className="w-4 h-4" />
                      <span className="text-xs font-medium">Budget restant</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <BudgetBarGauge value={budget.m1} label="Mandat 1" sublabel="2026-2032" />
                      <BudgetBarGauge value={budget.m2} label="Mandat 2" sublabel="2032-2038" />
                    </div>
                  </div>

                  <div className="w-px h-20 bg-gray-200 dark:bg-gray-700" />

                  {/* Impact Section */}
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Impact voyageurs</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      +{formatNumber(budget.totalImpact)}<span className="text-sm font-normal text-gray-500 ml-1">/jour</span>
                    </p>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (budget.totalImpact / 899000) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                      {Math.round((budget.totalImpact / 899000) * 100)}% de l&apos;objectif max
                    </p>
                  </div>

                  <div className="w-px h-20 bg-gray-200 dark:bg-gray-700" />

                  {/* Projects Section */}
                  <div className="text-center px-2">
                    <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-2">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-medium">Projets</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalProjects}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatCurrency(totalInvestment)}</p>
                  </div>
                </motion.div>

                {/* Desktop Controls */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 ml-auto"
                >
                  {/* Party Selector */}
                  <PartySelector 
                    compact 
                    desktopStyle 
                    isOpen={showPartyMenu}
                    onOpenChange={(open) => open ? openPartyMenu() : setShowPartyMenu(false)}
                  />
                  {/* Color Mode Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => showColorModeMenu ? setShowColorModeMenu(false) : openColorModeMenu()}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {colorMode === 'cost' ? 'Coût' : colorMode === 'impact' ? 'Efficacité' : 'Type'}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showColorModeMenu && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {showColorModeMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-w-[140px] z-50"
                        >
                          <button
                            onClick={() => { onColorModeChange('cost'); setShowColorModeMenu(false) }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm font-medium transition-all",
                              colorMode === 'cost'
                                ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                          >
                            Coût
                          </button>
                          <button
                            onClick={() => { onColorModeChange('impact'); setShowColorModeMenu(false) }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm font-medium transition-all",
                              colorMode === 'impact'
                                ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                          >
                            Efficacité
                          </button>
                          <button
                            onClick={() => { onColorModeChange('mode'); setShowColorModeMenu(false) }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm font-medium transition-all",
                              colorMode === 'mode'
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                          >
                            Type
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => showMapStyleMenu ? setShowMapStyleMenu(false) : openMapStyleMenu()}
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
            <div className="tablet:hidden space-y-1.5">
              {/* Row 1: Bus + Financing + Timeline - Compact horizontal buttons */}
              <div className="flex gap-1.5">
                {/* Bus Offer */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onOpenBusOffer}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex-1 rounded-lg border-2 py-2 px-1 flex items-center justify-center gap-1 transition-all shadow-lg relative backdrop-blur-md",
                    busOfferConfirmed
                      ? "bg-green-50/90 dark:bg-green-900/70 border-green-400"
                      : "bg-orange-50/90 dark:bg-orange-900/70 border-orange-400 animate-pulse"
                  )}
                >
                  {!busOfferConfirmed && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[7px] font-bold">!</span>
                    </div>
                  )}
                  <span className={cn(
                    "font-semibold text-[11px]",
                    busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
                  )}>Réseau Bus</span>
                  <span className={cn(
                    "text-[10px]",
                    busOfferConfirmed ? "text-green-600" : "text-orange-600"
                  )}>
                    {busOfferConfirmed ? "✓" : "⚠"}
                  </span>
                </motion.button>

                {/* Financing */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onOpenFinancing}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-yellow-50/90 dark:bg-yellow-900/70 backdrop-blur-md rounded-lg border-2 border-yellow-400 py-2 px-1 flex items-center justify-center gap-1 transition-all shadow-lg"
                >
                  <span className="text-yellow-700 dark:text-yellow-400 font-semibold text-[11px]">Financement</span>
                </motion.button>

                {/* Timeline */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setShowTimeline(true)}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-indigo-50/90 dark:bg-indigo-900/70 backdrop-blur-md rounded-lg border-2 border-indigo-400 py-2 px-1 flex items-center justify-center gap-1 transition-all shadow-lg"
                >
                  <span className="text-indigo-700 dark:text-indigo-400 font-semibold text-[11px]">Planning</span>
                  <span className="text-indigo-600 dark:text-indigo-500 text-[10px] font-medium">{totalProjects}</span>
                </motion.button>
              </div>

              {/* Row 2: Validation button (full width on mobile) */}
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
                    "w-full rounded-lg border-2 py-2 flex items-center justify-center shadow-lg font-semibold text-xs transition-all backdrop-blur-md",
                    budgetValid
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400"
                      : "bg-gray-100/80 dark:bg-gray-800/80 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  )}
                >
                  Valider le projet
                </motion.button>
              )}
            </div>

            {/* Tablet Layout (800px to 1500px): Compact horizontal */}
            <div className="hidden tablet:flex desktop:hidden gap-3 justify-center items-stretch">
              {/* Bus Offer */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onOpenBusOffer}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "min-w-[140px] rounded-xl border-2 p-3 flex items-center gap-3 transition-all shadow-xl relative backdrop-blur-md",
                  busOfferConfirmed
                    ? "bg-green-50/80 dark:bg-green-900/60 border-green-400"
                    : "bg-orange-50/80 dark:bg-orange-900/60 border-orange-400 animate-pulse"
                )}
              >
                {!busOfferConfirmed && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">!</span>
                  </div>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shadow-md",
                  busOfferConfirmed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-orange-500 to-amber-600"
                )}>
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={cn(
                    "font-bold text-sm",
                    busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
                  )}>Offre Bus</h3>
                  <p className={cn(
                    "text-xs",
                    busOfferConfirmed ? "text-green-600 dark:text-green-500" : "text-orange-600 dark:text-orange-500"
                  )}>
                    {busOfferConfirmed ? "✓ Confirmée" : "⚠ À confirmer"}
                  </p>
                </div>
              </motion.button>

              {/* Financing */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onOpenFinancing}
                whileTap={{ scale: 0.98 }}
                className="min-w-[140px] bg-yellow-50/80 dark:bg-yellow-900/60 backdrop-blur-md rounded-xl border-2 border-yellow-400 p-3 flex items-center gap-3 transition-all shadow-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-md">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-yellow-700 dark:text-yellow-400 font-bold text-sm">Financement</h3>
                  <p className="text-yellow-600 dark:text-yellow-500 text-xs">
                    {financingLevers?.gratuiteTotale ? "Gratuité ✓" : "Ajuster leviers"}
                  </p>
                </div>
              </motion.button>

              {/* Timeline */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowTimeline(true)}
                whileTap={{ scale: 0.98 }}
                className="min-w-[140px] bg-indigo-50/80 dark:bg-indigo-900/60 backdrop-blur-md rounded-xl border-2 border-indigo-400 p-3 flex items-center gap-3 transition-all shadow-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-indigo-700 dark:text-indigo-400 font-bold text-sm">Planning</h3>
                  <p className="text-indigo-600 dark:text-indigo-500 text-xs">{totalProjects} projets</p>
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
                    "min-w-[140px] rounded-xl border-2 p-3 flex items-center gap-3 shadow-xl font-bold text-sm transition-all backdrop-blur-md",
                    budgetValid
                      ? "bg-green-500/90 text-white border-green-400 hover:bg-green-600/90"
                      : "bg-gray-100/80 dark:bg-gray-800/80 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-md">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Valider</h3>
                    <p className="text-xs opacity-80">Voir résultats</p>
                  </div>
                </motion.button>
              )}
            </div>

            {/* Desktop Layout (1500px+): Full horizontal cards */}
            <div className="hidden desktop:flex gap-4 justify-center items-end">
              {/* Bus Offer Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onOpenBusOffer}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "min-w-[160px] rounded-2xl border-2 px-5 py-3 flex items-center gap-3 transition-all shadow-xl hover:shadow-2xl relative backdrop-blur-md",
                  busOfferConfirmed
                    ? "bg-green-50/80 dark:bg-green-900/60 border-green-400 dark:border-green-500"
                    : "bg-orange-50/80 dark:bg-orange-900/60 border-orange-400 dark:border-orange-500 animate-pulse"
                )}
              >
                {!busOfferConfirmed && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                  busOfferConfirmed
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-orange-500 to-amber-600"
                )}>
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className={cn(
                    "font-bold text-sm",
                    busOfferConfirmed ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"
                  )}>Offre Bus</h3>
                  <p className={cn(
                    "text-xs",
                    busOfferConfirmed ? "text-green-600 dark:text-green-300" : "text-orange-600 dark:text-orange-300"
                  )}>
                    {busOfferConfirmed ? "✓ Confirmée" : "⚠ À confirmer"}
                  </p>
                </div>
              </motion.button>

              {/* Financing Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onOpenFinancing}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="min-w-[160px] bg-yellow-50/80 dark:bg-yellow-900/60 backdrop-blur-md rounded-2xl border-2 border-yellow-400 dark:border-yellow-500 px-5 py-3 flex items-center gap-3 hover:border-yellow-500 dark:hover:border-yellow-400 transition-all shadow-xl hover:shadow-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-yellow-700 dark:text-yellow-400 font-bold text-sm">Financement</h3>
                  <p className="text-yellow-600 dark:text-yellow-300 text-xs">
                    {financingLevers?.gratuiteTotale ? "Gratuité ✓" : "Ajuster leviers"}
                  </p>
                </div>
              </motion.button>

              {/* Timeline Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowTimeline(true)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="min-w-[160px] bg-indigo-50/80 dark:bg-indigo-900/60 backdrop-blur-md rounded-2xl border-2 border-indigo-400 dark:border-indigo-500 px-5 py-3 flex items-center gap-3 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-xl hover:shadow-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-indigo-700 dark:text-indigo-400 font-bold text-sm">Planning</h3>
                  <p className="text-indigo-600 dark:text-indigo-300 text-xs">{totalProjects} projets</p>
                </div>
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
                    "min-w-[160px] rounded-2xl border-2 px-5 py-3 flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all backdrop-blur-md",
                    budgetValid
                      ? "bg-green-50/80 dark:bg-green-900/60 border-green-400 dark:border-green-500"
                      : "bg-gray-100/80 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                    budgetValid
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gray-400 dark:bg-gray-600"
                  )}>
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className={cn(
                      "font-bold text-sm",
                      budgetValid ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
                    )}>Valider</h3>
                    <p className={cn(
                      "text-xs",
                      budgetValid ? "text-green-600 dark:text-green-300" : "text-gray-400 dark:text-gray-500"
                    )}>
                      {budgetValid ? "Voir résultats" : "Budget invalide"}
                    </p>
                  </div>
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
              <div className="container mx-auto max-w-4xl px-3 tablet:px-4 py-2 tablet:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 tablet:gap-4">
                  <div className="w-8 h-8 tablet:w-12 tablet:h-12 rounded-lg tablet:rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                    <Coins className="w-4 h-4 tablet:w-6 tablet:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base tablet:text-2xl font-bold text-gray-900 dark:text-white">Financement</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-[10px] tablet:text-sm hidden tablet:block">Ajustez vos leviers pour équilibrer le budget</p>
                  </div>
                </div>
                <button
                  onClick={onCloseFinancing}
                  className="p-2 tablet:p-3 rounded-lg tablet:rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-5 h-5 tablet:w-6 tablet:h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-4xl px-3 tablet:px-4 py-4 tablet:py-8 pb-20 tablet:pb-24">
              <GameFinancingPanel />
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
              <div className="container mx-auto max-w-4xl px-3 tablet:px-4 py-2 tablet:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 tablet:gap-3">
                  {isValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 tablet:w-6 tablet:h-6 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium text-xs tablet:text-base">Budget équilibré</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 tablet:w-6 tablet:h-6 text-red-500" />
                      <span className="text-red-600 dark:text-red-400 font-medium text-xs tablet:text-base">Budget déséquilibré</span>
                    </>
                  )}
                </div>
                <button
                  onClick={onCloseFinancing}
                  className="px-3 tablet:px-6 py-2 tablet:py-3 rounded-lg tablet:rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-semibold tablet:font-bold text-xs tablet:text-base hover:opacity-90 transition-all flex items-center gap-1.5 tablet:gap-2"
                >
                  Retour
                  <ArrowRight className="w-4 h-4 tablet:w-5 tablet:h-5" />
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
            className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 overflow-y-auto flex flex-col min-h-screen"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="container mx-auto max-w-4xl px-3 tablet:px-4 py-2 tablet:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 tablet:gap-4">
                  <div className="w-8 h-8 tablet:w-12 tablet:h-12 rounded-lg tablet:rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                    <Bus className="w-4 h-4 tablet:w-6 tablet:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base tablet:text-2xl font-bold text-gray-900 dark:text-white">Réseau Bus</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-[10px] tablet:text-sm hidden tablet:block">Définissez votre stratégie pour la flotte de bus</p>
                  </div>
                </div>
                <button
                  onClick={onCloseBusOffer}
                  className="p-2 tablet:p-3 rounded-lg tablet:rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-5 h-5 tablet:w-6 tablet:h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-4xl px-3 tablet:px-4 py-4 tablet:py-8 pb-20 tablet:pb-24 flex-1">
              <BusOfferPanel />
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
              <div className="container mx-auto max-w-4xl px-3 tablet:px-4 py-2 tablet:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 tablet:gap-3">
                  <CheckCircle2 className="w-4 h-4 tablet:w-6 tablet:h-6 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium text-xs tablet:text-base hidden tablet:inline">Vos choix seront validés</span>
                  <span className="text-green-600 dark:text-green-400 font-medium text-xs tablet:hidden">Validé auto</span>
                </div>
                <button
                  onClick={() => {
                    setBusOfferConfirmed(true)
                    onCloseBusOffer()
                  }}
                  className="px-3 tablet:px-6 py-2 tablet:py-3 rounded-lg tablet:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold tablet:font-bold text-xs tablet:text-base hover:opacity-90 transition-all flex items-center gap-1.5 tablet:gap-2"
                >
                  Valider
                  <ArrowRight className="w-4 h-4 tablet:w-5 tablet:h-5" />
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

      {/* Timeline Panel - Full Page */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 overflow-y-auto flex flex-col min-h-screen"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planning des projets</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{totalProjects} projets sélectionnés</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTimeline(false)}
                  className="p-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-6xl px-4 py-8 flex-1">
              {totalProjects > 0 ? (
                <ProjectTimeline />
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">Aucun projet sélectionné</h3>
                  <p className="text-gray-600 dark:text-gray-400">Sélectionnez des projets sur la carte pour voir leur planning</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-indigo-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{totalProjects} projets • {formatCurrency(totalInvestment)} investis</span>
                </div>
                <button
                  onClick={() => setShowTimeline(false)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  Retour à la carte
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
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
