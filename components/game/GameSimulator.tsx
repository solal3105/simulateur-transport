'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS } from '@/lib/data'
import { GameHeader } from './GameHeader'
import { GameProjectCard } from './ProjectCard'
import { GameFinancingPanel } from './FinancingPanel'
import { ObjectivesPanel } from './ObjectivesPanel'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Filter,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  TramFront,
  Bus,
  Wrench,
  Ship
} from 'lucide-react'

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
  const budget = getBudgetState()
  const isValid = budget.m1 >= -1000 && budget.m2 >= -1000
  const hasExcessiveDebt = budget.m1 < -1000 || budget.m2 < -1000

  const filteredProjects = selectedCategory && selectedCategory !== 'all'
    ? PROJECTS.filter(p => getProjectCategory(p.name) === selectedCategory)
    : PROJECTS

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <GameHeader />

      {/* Main content */}
      <main className="pt-20 md:pt-24 pb-32">
        <div className="container mx-auto px-4">
          {/* Category filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                    (selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory))
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                  {cat.id !== 'all' && (
                    <span className="text-xs opacity-70">
                      ({PROJECTS.filter(p => getProjectCategory(p.name) === cat.id).length})
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>

          {/* Projects grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            {/* Quick stats */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setShowObjectives(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all border border-yellow-500/30 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-bold">Objectifs & Succès</span>
                <span className="md:hidden text-sm font-bold">Objectifs</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowFinancing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 transition-all border border-green-500/30 shadow-lg"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-bold">Leviers de financement</span>
                <span className="md:hidden text-sm font-bold">Financement</span>
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
              className="fixed top-0 left-0 bottom-0 w-full max-w-md z-50 overflow-y-auto"
            >
              <div className="p-4 pt-6">
                <button
                  onClick={() => setShowObjectives(false)}
                  className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <ObjectivesPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
