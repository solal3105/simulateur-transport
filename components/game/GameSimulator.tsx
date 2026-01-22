'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS } from '@/lib/data'
import { GameHeader } from './GameHeader'
import { GameProjectCard } from './ProjectCard'
import { GameFinancingPanel } from './FinancingPanel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  TramFront,
  Bus,
  Wrench,
  Calendar,
  Trophy,
  Target,
  Star
} from 'lucide-react'
import { ProjectTimeline } from './ProjectTimeline'

const categories = [
  { id: 'all', label: 'Tous', icon: Sparkles },
  { id: 'metro', label: 'Métro', icon: TramFront },
  { id: 'tram', label: 'Tramway', icon: TramFront },
  { id: 'bus', label: 'Bus/BHNS', icon: Bus },
  { id: 'other', label: 'Autres', icon: Wrench },
]

function getProjectCategory(name: string): string {
  if (name.includes('Métro') || name.includes('Extension Ligne')) return 'metro'
  if (name.includes('Tram') || name.match(/T\d+/)) return 'tram'
  if (name.includes('BHNS') || name.includes('Bus')) return 'bus'
  return 'other'
}

// Compact achievements display
function AchievementsBar() {
  const { getObjectives, getAchievements } = useGameStore()
  const objectives = getObjectives()
  const achievements = getAchievements()
  
  const completedObjectives = objectives.filter(o => o.completed).length
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-white text-sm font-bold">Succès</span>
        </div>
        <span className="text-gray-400 text-xs">{completedObjectives}/{objectives.length} objectifs</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(completedObjectives / objectives.length) * 100}%` }}
        />
      </div>
      
      {/* Unlocked achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unlockedAchievements.slice(0, 6).map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30"
              title={achievement.description}
            >
              <span className="text-xs">{achievement.icon}</span>
            </motion.div>
          ))}
          {unlockedAchievements.length > 6 && (
            <div className="px-2 py-1 bg-gray-700/50 rounded-lg">
              <span className="text-gray-400 text-xs">+{unlockedAchievements.length - 6}</span>
            </div>
          )}
        </div>
      )}
      
      {unlockedAchievements.length === 0 && (
        <p className="text-gray-500 text-xs text-center py-1">Sélectionnez des projets pour débloquer des succès</p>
      )}
    </div>
  )
}

// Compact objectives list
function ObjectivesCompact() {
  const { getObjectives } = useGameStore()
  const objectives = getObjectives()
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-green-500" />
        <span className="text-white text-sm font-bold">Objectifs</span>
      </div>
      
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {objectives.map((objective) => (
          <div
            key={objective.id}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all",
              objective.completed
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-gray-700/30"
            )}
          >
            {objective.completed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-gray-500 flex-shrink-0" />
            )}
            <span className={cn(
              "flex-1",
              objective.completed ? "text-green-400" : "text-gray-400"
            )}>
              {objective.name}
            </span>
            <span className={cn(
              "font-bold",
              objective.completed ? "text-green-400" : "text-gray-500"
            )}>
              +{objective.reward}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GameSimulator() {
  const { 
    projectSelections, 
    setProjectPeriod, 
    getBudgetState, 
    setPhase,
    selectedCategory,
    setSelectedCategory
  } = useGameStore()
  
  const [showFinancing, setShowFinancing] = useState(false)
  const [showObjectives, setShowObjectives] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const budget = getBudgetState()
  
  // Budget validation: 
  // - Max 1 milliard de dette par mandat normalement
  // - MAIS si M1 dégage du cashflow pour M2 et dette totale < 100M€, on autorise
  const m1Surplus = budget.m1 > 0 ? budget.m1 : 0
  const effectiveM2 = budget.m2 + m1Surplus // M1 peut aider M2
  const totalDebt = Math.min(0, budget.m1) + Math.min(0, budget.m2)
  
  // Validation souple : si M1 positif peut aider M2 et dette < 100M
  const isValidWithTransfer = budget.m1 >= 0 && effectiveM2 >= -100 && totalDebt >= -100
  // Validation stricte : max 1 Md€ de dette par mandat
  const isValidStrict = budget.m1 >= -1000 && budget.m2 >= -1000
  
  const isValid = isValidStrict || isValidWithTransfer
  const hasExcessiveDebt = !isValid

  const filteredProjects = selectedCategory && selectedCategory !== 'all'
    ? PROJECTS.filter(p => getProjectCategory(p.name) === selectedCategory)
    : PROJECTS

  const [showTimelineInline, setShowTimelineInline] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <GameHeader />

      {/* Main content with sidebar on desktop */}
      <main className="pt-[88px] md:pt-20 lg:pt-24 pb-32">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex gap-4">
            {/* Main projects area */}
            <div className="flex-1 min-w-0">
              {/* Category filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
              >
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-sm",
                        (selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory))
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="font-medium">{cat.label}</span>
                      {cat.id !== 'all' && (
                        <span className="text-xs opacity-70">
                          ({PROJECTS.filter(p => getProjectCategory(p.name) === cat.id).length})
                        </span>
                      )}
                    </button>
                  )
                })}
              </motion.div>

              {/* Timeline collapsible on mobile/tablet */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowTimelineInline(!showTimelineInline)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700/50"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-white text-sm font-medium">Frise chronologique</span>
                    <span className="text-gray-500 text-xs">({projectSelections.filter(s => s.period).length} projets)</span>
                  </div>
                  {showTimelineInline ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <AnimatePresence>
                  {showTimelineInline && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2">
                        <ProjectTimeline />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Projects grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {filteredProjects.map((project, index) => {
                  const selection = projectSelections.find(s => s.projectId === project.id)
                  return (
                    <GameProjectCard
                      key={project.id}
                      project={project}
                      selectedPeriod={selection?.period || null}
                      onSelectPeriod={(period) => setProjectPeriod(project.id, period)}
                      index={index}
                    />
                  )
                })}
              </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AchievementsBar />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ObjectivesCompact />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-white text-sm font-bold">Planning</span>
                </div>
                <ProjectTimeline />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed bottom bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50"
      >
        <div className="container mx-auto px-4 py-4">
          {/* Warning message for excessive debt */}
          {hasExcessiveDebt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm">Dette excessive !</p>
                <p className="text-red-300/80 text-xs mt-1">
                  Vous ne pouvez pas valider un budget avec plus de 1 milliard d&apos;euros de dette par mandat. 
                  Ajustez vos projets ou augmentez vos leviers de financement.
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between gap-4">
            {/* Quick actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Objectives - only on mobile/tablet */}
              <motion.button
                onClick={() => setShowObjectives(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all border border-yellow-500/30"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden md:inline text-sm font-bold">Succès</span>
              </motion.button>
              
              {/* Financing - always visible */}
              <motion.button
                onClick={() => setShowFinancing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 transition-all border border-green-500/30"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-bold">Financement</span>
              </motion.button>
            </div>

            {/* Validate button */}
            <Button
              size="lg"
              disabled={!isValid}
              onClick={() => setPhase('results')}
              className={cn(
                "px-8 transition-all",
                isValid 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90" 
                  : "bg-gray-700 cursor-not-allowed"
              )}
            >
              {isValid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Valider la simulation
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : hasExcessiveDebt ? (
                <>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Dette trop élevée
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Budget déséquilibré
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Financing slide-over */}
      <AnimatePresence>
        {showFinancing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFinancing(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 overflow-y-auto"
            >
              <div className="p-4 pt-6">
                <button
                  onClick={() => setShowFinancing(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <GameFinancingPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Objectives slide-over */}
      <AnimatePresence>
        {showObjectives && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowObjectives(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-md z-50 overflow-y-auto bg-gray-900"
            >
              <div className="p-4 pt-6">
                <button
                  onClick={() => setShowObjectives(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Objectifs & Succès
                </h2>
                <div className="space-y-4">
                  <AchievementsBar />
                  <ObjectivesCompact />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Timeline modal */}
      <AnimatePresence>
        {showTimeline && (
          <ProjectTimeline isModal onClose={() => setShowTimeline(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
