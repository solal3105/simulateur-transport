'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { formatNumber, formatCurrency, cn } from '@/lib/utils'
import { 
  Users, 
  Trophy,
  TramFront
} from 'lucide-react'

// Circular gauge component for compact display
function CircularGauge({ 
  value, 
  maxValue, 
  label, 
  sublabel,
  size = 70,
  strokeWidth = 6,
  colorClass = 'text-green-500'
}: { 
  value: number
  maxValue: number
  label: string
  sublabel?: string
  size?: number
  strokeWidth?: number
  colorClass?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min(Math.max(value / maxValue, 0), 1)
  const strokeDashoffset = circumference * (1 - percentage)
  
  // Determine color based on value
  const getColor = () => {
    if (value < 0) return value < -1000 ? 'text-red-500' : 'text-orange-500'
    return colorClass
  }
  
  const getBgColor = () => {
    if (value < 0) return value < -1000 ? 'stroke-red-500/20' : 'stroke-orange-500/20'
    return 'stroke-gray-700'
  }

  const color = getColor()
  const displayValue = value < 0 ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={getBgColor()}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn("transition-all duration-500", color.replace('text-', 'stroke-'))}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-xs", color)}>{displayValue}</span>
        </div>
      </div>
      <p className="text-gray-400 text-[10px] mt-1 text-center leading-tight">{label}</p>
      {sublabel && <p className="text-gray-500 text-[9px]">{sublabel}</p>}
    </div>
  )
}

// Bar gauge for larger displays
function BarGauge({
  value,
  maxValue,
  label,
  sublabel,
}: {
  value: number
  maxValue: number
  label: string
  sublabel?: string
}) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100)
  const isNegative = value < 0
  const isExcessiveDebt = value < -1000
  
  const getColorClass = () => {
    if (isExcessiveDebt) return 'from-red-500 to-red-600'
    if (isNegative) return 'from-orange-500 to-orange-600'
    if (percentage > 50) return 'from-green-500 to-emerald-500'
    if (percentage > 25) return 'from-yellow-500 to-orange-500'
    return 'from-orange-500 to-red-500'
  }

  const getTextColor = () => {
    if (isExcessiveDebt) return 'text-red-400'
    if (isNegative) return 'text-orange-400'
    return 'text-green-400'
  }

  const displayValue = isNegative ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-400 text-xs">{label}</span>
        <span className={cn("font-bold text-sm", getTextColor())}>{displayValue}</span>
      </div>
      <div className="h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", getColorClass())}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {sublabel && <p className="text-gray-500 text-[10px] mt-0.5">{sublabel}</p>}
    </div>
  )
}

// Impact gauge (special design)
function ImpactGauge({ value, maxValue }: { value: number; maxValue: number }) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  
  return (
    <div className="flex items-center gap-3 bg-purple-500/10 px-3 py-2 rounded-xl border border-purple-500/30">
      <Users className="w-5 h-5 text-purple-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-purple-300 text-xs">Impact voyageurs</span>
          <span className="text-purple-400 font-bold text-sm">+{formatNumber(value)}/j</span>
        </div>
        <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

export function GameHeader() {
  const { getBudgetState, getScore, animatingBudget, lastAction, setLastAction } = useGameStore()
  const budget = getBudgetState()
  const score = getScore()
  
  const BASE_BUDGET = 2000 // 2 Md€ par mandat
  const MAX_IMPACT = 800000 // Impact max théorique

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-3 md:px-4">
          {/* Mobile Layout */}
          <div className="flex md:hidden items-center justify-between h-14">
            {/* Logo compact */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 via-blue-500 to-green-500 flex items-center justify-center">
                <TramFront className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-sm">TCL 2040</span>
            </div>

            {/* Circular gauges for mobile */}
            <div className="flex items-center gap-2">
              <CircularGauge
                value={budget.m1}
                maxValue={BASE_BUDGET}
                label="2026-32"
                size={52}
                strokeWidth={5}
              />
              <CircularGauge
                value={budget.m2}
                maxValue={BASE_BUDGET}
                label="2032-38"
                size={52}
                strokeWidth={5}
              />
              {/* Score compact */}
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg border border-yellow-500/30">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-yellow-500 font-bold text-xs">{score}</span>
              </div>
            </div>
          </div>

          {/* Tablet Layout (md) */}
          <div className="hidden md:flex lg:hidden items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 via-blue-500 to-green-500 flex items-center justify-center">
                <TramFront className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-sm">TCL 2040</span>
                <p className="text-gray-500 text-[10px]">Simulateur</p>
              </div>
            </div>

            {/* Circular gauges + Impact for tablet */}
            <div className="flex items-center gap-4">
              <CircularGauge
                value={budget.m1}
                maxValue={BASE_BUDGET}
                label="Mandat 1"
                sublabel="2026-2032"
                size={64}
                strokeWidth={5}
              />
              <CircularGauge
                value={budget.m2}
                maxValue={BASE_BUDGET}
                label="Mandat 2"
                sublabel="2032-2038"
                size={64}
                strokeWidth={5}
              />
              
              {/* Impact compact */}
              <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-2 rounded-xl border border-purple-500/30">
                <Users className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-purple-400 font-bold text-sm">+{formatNumber(budget.totalImpact)}</p>
                  <p className="text-purple-400/60 text-[10px]">voy/jour</p>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-xl border border-yellow-500/30">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-bold">{score}</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout (lg+) */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 via-blue-500 to-green-500 flex items-center justify-center shadow-lg">
                <TramFront className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-black text-lg">TCL 2040</h1>
                <p className="text-gray-400 text-xs">Simulateur de réseau</p>
              </div>
            </div>

            {/* Stats with bar gauges */}
            <div className="flex items-center gap-6">
              {/* Budget gauges */}
              <div className="flex items-center gap-4 bg-gray-800/50 px-4 py-2.5 rounded-xl border border-gray-700/50">
                <BarGauge
                  value={budget.m1}
                  maxValue={BASE_BUDGET}
                  label="Mandat 1 (2026-2032)"
                />
                <div className="w-px h-10 bg-gray-700" />
                <BarGauge
                  value={budget.m2}
                  maxValue={BASE_BUDGET}
                  label="Mandat 2 (2032-2038)"
                />
              </div>

              {/* Impact gauge */}
              <ImpactGauge value={budget.totalImpact} maxValue={MAX_IMPACT} />

              {/* Score */}
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2.5 rounded-xl border border-yellow-500/30"
                animate={animatingBudget ? { scale: [1, 1.05, 1] } : {}}
              >
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-yellow-500 font-bold text-lg">{formatNumber(score)}</p>
                  <p className="text-yellow-500/60 text-xs">points</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Action toast */}
        <AnimatePresence>
          {lastAction && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onAnimationComplete={() => {
                setTimeout(() => setLastAction(null), 2000)
              }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-white text-sm border border-white/20"
            >
              {lastAction}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile: Impact bar below header */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-gray-900/90 backdrop-blur-sm px-3 py-2 border-b border-gray-800/50 md:hidden">
        <ImpactGauge value={budget.totalImpact} maxValue={MAX_IMPACT} />
      </div>
    </>
  )
}
