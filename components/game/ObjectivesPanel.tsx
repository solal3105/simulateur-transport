'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { cn } from '@/lib/utils'
import { 
  Target, 
  Trophy, 
  CheckCircle2, 
  Circle,
  Star,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'

export function ObjectivesPanel() {
  const { getObjectives, getAchievements, getScore } = useGameStore()
  const objectives = getObjectives()
  const achievements = getAchievements()
  const score = getScore()
  const [showAchievementToast, setShowAchievementToast] = useState<string | null>(null)
  const [prevAchievements, setPrevAchievements] = useState<string[]>([])

  // Detect newly unlocked achievements
  useEffect(() => {
    const currentUnlocked = achievements.filter(a => a.unlocked).map(a => a.id)
    const newlyUnlocked = currentUnlocked.filter(id => !prevAchievements.includes(id))
    
    if (newlyUnlocked.length > 0) {
      const achievement = achievements.find(a => a.id === newlyUnlocked[0])
      if (achievement) {
        setShowAchievementToast(achievement.id)
        setTimeout(() => setShowAchievementToast(null), 4000)
      }
    }
    
    setPrevAchievements(currentUnlocked)
  }, [achievements, prevAchievements])

  const completedObjectives = objectives.filter(o => o.completed).length
  const unlockedAchievements = achievements.filter(a => a.unlocked).length

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Objectifs & Succès</h2>
                <p className="text-gray-400 text-sm">{completedObjectives}/{objectives.length} objectifs • {unlockedAchievements}/{achievements.length} succès</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 font-bold">{score}</span>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Objectifs
          </h3>
          <div className="space-y-2">
            {objectives.map((objective) => (
              <ObjectiveItem key={objective.id} objective={objective} />
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="p-4">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Succès
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Achievement toast */}
      <AnimatePresence>
        {showAchievementToast && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                {achievements.find(a => a.id === showAchievementToast)?.icon}
              </div>
              <div>
                <p className="text-white/80 text-xs uppercase tracking-wider">Succès débloqué !</p>
                <p className="text-white font-bold text-lg">
                  {achievements.find(a => a.id === showAchievementToast)?.name}
                </p>
              </div>
              <Sparkles className="w-6 h-6 text-white/80" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ObjectiveItem({ objective }: { objective: ReturnType<ReturnType<typeof useGameStore.getState>['getObjectives']>[0] }) {
  const progress = Math.min(100, (objective.current / objective.target) * 100)

  return (
    <div className={cn(
      "rounded-xl p-3 transition-all",
      objective.completed 
        ? "bg-green-500/10 border border-green-500/30" 
        : "bg-gray-900/30 border border-gray-700/30"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {objective.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-500" />
          )}
          <div>
            <p className={cn(
              "font-medium text-sm",
              objective.completed ? "text-green-400" : "text-white"
            )}>
              {objective.name}
            </p>
            <p className="text-gray-500 text-xs">{objective.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-500 text-xs font-medium">+{objective.reward}</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            objective.completed 
              ? "bg-gradient-to-r from-green-500 to-emerald-500" 
              : "bg-gradient-to-r from-blue-500 to-purple-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <p className="text-gray-500 text-xs mt-1 text-right">
        {objective.current.toLocaleString()} / {objective.target.toLocaleString()}
      </p>
    </div>
  )
}

function AchievementBadge({ achievement }: { achievement: ReturnType<ReturnType<typeof useGameStore.getState>['getAchievements']>[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer group relative",
        achievement.unlocked
          ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
          : "bg-gray-900/30 border border-gray-700/30 opacity-50"
      )}
    >
      <span className="text-2xl mb-1">{achievement.icon}</span>
      <p className={cn(
        "text-xs text-center font-medium leading-tight",
        achievement.unlocked ? "text-white" : "text-gray-500"
      )}>
        {achievement.unlocked ? achievement.name : '???'}
      </p>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 rounded-xl border border-gray-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <p className="text-white font-medium text-sm mb-1">{achievement.name}</p>
        <p className="text-gray-400 text-xs">{achievement.description}</p>
      </div>
    </motion.div>
  )
}
