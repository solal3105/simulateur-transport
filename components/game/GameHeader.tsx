'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { formatNumber, formatCurrency, cn } from '@/lib/utils'
import { 
  Users, 
  Wallet, 
  Trophy,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export function GameHeader() {
  const { getBudgetState, getScore, animatingBudget, lastAction, setLastAction } = useGameStore()
  const budget = getBudgetState()
  const score = getScore()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      {/* Desktop Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-white font-bold">TCL Simulator</h1>
                <p className="text-gray-400 text-xs">Mode Président(e)</p>
              </div>
            </div>

            {/* Stats - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              {/* Score */}
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-xl border border-yellow-500/30"
                animate={animatingBudget ? { scale: [1, 1.05, 1] } : {}}
              >
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-yellow-500 font-bold text-lg">{formatNumber(score)}</p>
                  <p className="text-yellow-500/60 text-xs">points</p>
                </div>
              </motion.div>

              {/* Impact */}
              <motion.div
                className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-xl border border-purple-500/30"
                animate={animatingBudget ? { scale: [1, 1.05, 1] } : {}}
              >
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-purple-400 font-bold text-lg">{formatNumber(budget.totalImpact)}</p>
                  <p className="text-purple-400/60 text-xs">voyageurs/jour</p>
                </div>
              </motion.div>

              {/* Budget M1 */}
              <BudgetPill
                label="Mandat 1 (2026-2032)"
                value={budget.m1}
                animating={animatingBudget}
              />

              {/* Budget M2 */}
              <BudgetPill
                label="Mandat 2 (2032-2038)"
                value={budget.m2}
                animating={animatingBudget}
              />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-white"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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

      {/* Mobile Stats Panel */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 md:hidden"
          >
            <div className="p-4 grid grid-cols-2 gap-3">
              {/* Score */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-2 rounded-xl border border-yellow-500/30">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-yellow-500 font-bold">{formatNumber(score)}</p>
                  <p className="text-yellow-500/60 text-xs">points</p>
                </div>
              </div>

              {/* Impact */}
              <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-2 rounded-xl border border-purple-500/30">
                <Users className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-purple-400 font-bold">{formatNumber(budget.totalImpact)}</p>
                  <p className="text-purple-400/60 text-xs">voy/jour</p>
                </div>
              </div>

              {/* Budget M1 */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border",
                budget.m1 >= 0 
                  ? "bg-green-500/20 border-green-500/30" 
                  : budget.m1 >= -1000
                  ? "bg-orange-500/20 border-orange-500/30"
                  : "bg-red-500/20 border-red-500/30 animate-pulse"
              )}>
                <Wallet className={cn(
                  "w-4 h-4", 
                  budget.m1 >= 0 ? "text-green-400" : 
                  budget.m1 >= -1000 ? "text-orange-400" : "text-red-400"
                )} />
                <div>
                  <p className={cn(
                    "font-bold", 
                    budget.m1 >= 0 ? "text-green-400" : 
                    budget.m1 >= -1000 ? "text-orange-400" : "text-red-400"
                  )}>
                    {formatCurrency(Math.abs(budget.m1))}
                  </p>
                  <p className={cn(
                    "text-xs", 
                    budget.m1 >= 0 ? "text-green-400/60" : 
                    budget.m1 >= -1000 ? "text-orange-400/60" : "text-red-400/60"
                  )}>
                    2026-2032 {budget.m1 >= 0 ? '' : '(déficit)'}
                  </p>
                </div>
              </div>

              {/* Budget M2 */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border",
                budget.m2 >= 0 
                  ? "bg-green-500/20 border-green-500/30" 
                  : budget.m2 >= -1000
                  ? "bg-orange-500/20 border-orange-500/30"
                  : "bg-red-500/20 border-red-500/30 animate-pulse"
              )}>
                <Wallet className={cn(
                  "w-4 h-4", 
                  budget.m2 >= 0 ? "text-green-400" : 
                  budget.m2 >= -1000 ? "text-orange-400" : "text-red-400"
                )} />
                <div>
                  <p className={cn(
                    "font-bold", 
                    budget.m2 >= 0 ? "text-green-400" : 
                    budget.m2 >= -1000 ? "text-orange-400" : "text-red-400"
                  )}>
                    {formatCurrency(Math.abs(budget.m2))}
                  </p>
                  <p className={cn(
                    "text-xs", 
                    budget.m2 >= 0 ? "text-green-400/60" : 
                    budget.m2 >= -1000 ? "text-orange-400/60" : "text-red-400/60"
                  )}>
                    2032-2038 {budget.m2 >= 0 ? '' : '(déficit)'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function BudgetPill({ label, value, animating }: { label: string; value: number; animating: boolean }) {
  const isPositive = value >= 0
  const isExcessiveDebt = value < -1000
  
  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl border",
        isPositive 
          ? "bg-green-500/20 border-green-500/30" 
          : isExcessiveDebt
          ? "bg-red-500/20 border-red-500/30 animate-pulse"
          : "bg-orange-500/20 border-orange-500/30"
      )}
      animate={animating ? { scale: [1, 1.05, 1] } : {}}
    >
      {isPositive ? (
        <TrendingUp className="w-5 h-5 text-green-400" />
      ) : (
        <TrendingDown className={cn(
          "w-5 h-5",
          isExcessiveDebt ? "text-red-400" : "text-orange-400"
        )} />
      )}
      <div>
        <p className={cn(
          "font-bold text-lg",
          isPositive ? "text-green-400" : 
          isExcessiveDebt ? "text-red-400" : "text-orange-400"
        )}>
          {isPositive ? '' : '-'}{formatCurrency(Math.abs(value))}
        </p>
        <p className={cn(
          "text-xs",
          isPositive ? "text-green-400/60" : 
          isExcessiveDebt ? "text-red-400/60" : "text-orange-400/60"
        )}>
          {label}
        </p>
      </div>
    </motion.div>
  )
}
