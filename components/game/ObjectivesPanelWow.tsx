'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { cn } from '@/lib/utils'
import { 
  Trophy, 
  CheckCircle2, 
  Star,
  Sparkles,
  Lock,
  Zap,
  Crown,
  Flame,
  Heart,
  Shield,
  Rocket,
  Gift
} from 'lucide-react'
import { useState, useEffect } from 'react'

// Enriched objective data with emojis and detailed info
const OBJECTIVE_DETAILS: Record<string, {
  emoji: string
  icon: any
  color: string
  gradient: string
  detailedDescription: string
  tip: string
}> = {
  'impact-200k': {
    emoji: '🚇',
    icon: Rocket,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    detailedDescription: 'Atteignez 200 000 nouveaux voyageurs quotidiens grâce à vos projets de transport. C\'est l\'équivalent de 73 millions de trajets par an !',
    tip: 'Privilégiez les grands projets métro qui ont le plus d\'impact voyageurs.',
  },
  'impact-600k': {
    emoji: '🌟',
    icon: Crown,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-500',
    detailedDescription: 'Révolutionnez la mobilité lyonnaise avec 600 000 nouveaux voyageurs/jour. Vous transformez radicalement les habitudes de déplacement !',
    tip: 'Combinez métros, trams et BHNS pour maximiser l\'impact.',
  },
  'budget-equilibre': {
    emoji: '⚖️',
    icon: Shield,
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
    detailedDescription: 'Gérez les finances publiques avec sagesse : terminez les deux mandats avec un budget positif. Les contribuables vous remercient !',
    tip: 'Utilisez les leviers de financement pour équilibrer vos comptes.',
  },
  'projects-10': {
    emoji: '🏗️',
    icon: Flame,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-red-500',
    detailedDescription: 'Lancez 10 projets d\'infrastructure majeurs. Vous êtes un véritable bâtisseur qui transforme le territoire !',
    tip: 'Diversifiez : métros, trams, BHNS... chaque type compte.',
  },
  'metro-network': {
    emoji: '🚈',
    icon: Zap,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-violet-500',
    detailedDescription: 'Développez le réseau souterrain avec 4 projets métro ou extensions. Le métro est l\'épine dorsale du réseau TCL !',
    tip: 'Les modernisations comptent aussi comme projets métro.',
  },
  'social-policy': {
    emoji: '❤️',
    icon: Heart,
    color: 'text-rose-400',
    gradient: 'from-rose-500 to-pink-500',
    detailedDescription: 'Mettez en place une politique sociale ambitieuse : gratuité totale, conditionnée, ou pour les jeunes. L\'accès au transport est un droit !',
    tip: 'Attention au coût : la gratuité totale coûte près de 2 Md€.',
  },
  'no-law-dependency': {
    emoji: '🏛️',
    icon: Shield,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-yellow-500',
    detailedDescription: 'Restez maître de votre destin : n\'utilisez pas les leviers nécessitant une loi nationale (VM+, TVA 5.5%). Autonomie totale !',
    tip: 'Compensez avec les tarifs ou des économies sur les projets.',
  },
  'price-stability': {
    emoji: '💰',
    icon: Gift,
    color: 'text-teal-400',
    gradient: 'from-teal-500 to-cyan-500',
    detailedDescription: 'Maintenez le pouvoir d\'achat des usagers : augmentation des tarifs ≤ 10%. L\'inflation naturelle fait le reste !',
    tip: 'Même avec +10%, les usagers gardent un pouvoir d\'achat équivalent.',
  },
}

const ACHIEVEMENT_DETAILS: Record<string, {
  emoji: string
  color: string
  gradient: string
  secretName: string
  detailedDescription: string
}> = {
  'first-project': {
    emoji: '🎯',
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    secretName: 'Premier pas',
    detailedDescription: 'Votre aventure commence ! Vous avez sélectionné votre premier projet.',
  },
  'eco-friendly': {
    emoji: '🌱',
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
    secretName: 'Écolo',
    detailedDescription: 'Vous avez fait le choix de l\'électrification des bus. La planète vous dit merci !',
  },
  'big-spender': {
    emoji: '💸',
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-500',
    secretName: 'Mégalomane',
    detailedDescription: 'Plus de 5 milliards investis ! Vous voyez grand, très grand.',
  },
  'efficiency-master': {
    emoji: '⚡',
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-500',
    secretName: 'Efficacité maximale',
    detailedDescription: 'Ratio supérieur à 100 voyageurs/M€. Chaque euro est optimisé !',
  },
  'balanced': {
    emoji: '⚖️',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    secretName: 'Équilibriste',
    detailedDescription: 'Budget positif sur les deux mandats avec plus de 5 projets. Bravo !',
  },
  'fluvial': {
    emoji: '🚢',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-500',
    secretName: 'Capitaine',
    detailedDescription: 'Vous avez misé sur la navette fluviale. Lyon retrouve sa Saône !',
  },
}

export function ObjectivesPanelWow() {
  const { getObjectives, getAchievements, getScore } = useGameStore()
  const objectives = getObjectives()
  const achievements = getAchievements()
  const score = getScore()
  const [showAchievementToast, setShowAchievementToast] = useState<string | null>(null)
  const [prevAchievements, setPrevAchievements] = useState<string[]>([])
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null)

  useEffect(() => {
    const currentUnlocked = achievements.filter(a => a.unlocked).map(a => a.id)
    const newlyUnlocked = currentUnlocked.filter(id => !prevAchievements.includes(id))
    
    if (newlyUnlocked.length > 0) {
      const achievement = achievements.find(a => a.id === newlyUnlocked[0])
      if (achievement) {
        setShowAchievementToast(achievement.id)
        setTimeout(() => setShowAchievementToast(null), 5000)
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
        {/* Header with animated glow */}
        <div className="relative p-5 bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 border-b border-gray-700/50 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-white font-bold text-xl">Objectifs & Succès</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  <span className="text-green-400 font-semibold">{completedObjectives}</span>/{objectives.length} objectifs • 
                  <span className="text-yellow-400 font-semibold ml-1">{unlockedAchievements}</span>/{achievements.length} succès
                </p>
              </div>
            </div>
            <motion.div 
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 px-4 py-2 rounded-full border border-yellow-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
              <span className="text-yellow-400 font-black text-lg">{score}</span>
              <span className="text-yellow-500/70 text-xs">pts</span>
            </motion.div>
          </div>
        </div>

        {/* Objectives */}
        <div className="p-5">
          <h3 className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Missions Principales
          </h3>
          <div className="space-y-3">
            {objectives.map((objective, index) => {
              const details = OBJECTIVE_DETAILS[objective.id] || {
                emoji: '🎯',
                icon: Star,
                color: 'text-gray-400',
                gradient: 'from-gray-500 to-gray-600',
                detailedDescription: objective.description,
                tip: '',
              }
              const Icon = details.icon
              const progress = Math.min(100, (objective.current / objective.target) * 100)
              const isExpanded = expandedObjective === objective.id

              return (
                <motion.div
                  key={objective.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setExpandedObjective(isExpanded ? null : objective.id)}
                  className={cn(
                    "rounded-2xl p-4 transition-all cursor-pointer border-2",
                    objective.completed 
                      ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/40" 
                      : "bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Emoji/Icon */}
                    <motion.div 
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0",
                        objective.completed 
                          ? "bg-gradient-to-br from-green-500/30 to-emerald-500/30" 
                          : `bg-gradient-to-br ${details.gradient} opacity-30`
                      )}
                      animate={objective.completed ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {objective.completed ? '✅' : details.emoji}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn(
                          "font-bold text-base",
                          objective.completed ? "text-green-400" : "text-white"
                        )}>
                          {objective.name}
                        </h4>
                        <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2.5 py-1 rounded-full">
                          <Star className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
                          <span className="text-yellow-500 text-sm font-bold">+{objective.reward}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{objective.description}</p>

                      {/* Progress bar */}
                      <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "absolute inset-y-0 left-0 rounded-full",
                            objective.completed 
                              ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                              : `bg-gradient-to-r ${details.gradient}`
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                        {/* Shimmer effect */}
                        {!objective.completed && progress > 0 && (
                          <motion.div
                            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '400%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />
                        )}
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className={cn(
                          "text-xs font-medium",
                          objective.completed ? "text-green-400" : details.color
                        )}>
                          {Math.round(progress)}%
                        </span>
                        <span className="text-gray-500 text-xs">
                          {objective.current.toLocaleString()} / {objective.target.toLocaleString()}
                        </span>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-700/50"
                          >
                            <p className="text-gray-300 text-sm leading-relaxed mb-3">
                              {details.detailedDescription}
                            </p>
                            {details.tip && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <span className="text-lg">💡</span>
                                <p className="text-yellow-300/90 text-sm">{details.tip}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-5 pt-0">
          <h3 className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            Succès Secrets
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => {
              const details = ACHIEVEMENT_DETAILS[achievement.id] || {
                emoji: '🏆',
                color: 'text-gray-400',
                gradient: 'from-gray-500 to-gray-600',
                secretName: '???',
                detailedDescription: achievement.description,
              }

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "relative rounded-xl p-4 transition-all overflow-hidden group",
                    achievement.unlocked
                      ? `bg-gradient-to-br ${details.gradient} bg-opacity-20`
                      : "bg-gray-900/50 border border-gray-700/30"
                  )}
                >
                  {/* Glow effect for unlocked */}
                  {achievement.unlocked && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  )}

                  <div className="relative flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                      achievement.unlocked 
                        ? "bg-white/10" 
                        : "bg-gray-800 border border-gray-700"
                    )}>
                      {achievement.unlocked ? details.emoji : <Lock className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-bold text-sm truncate",
                        achievement.unlocked ? "text-white" : "text-gray-500"
                      )}>
                        {achievement.unlocked ? achievement.name : '???'}
                      </p>
                      <p className={cn(
                        "text-xs truncate",
                        achievement.unlocked ? "text-white/70" : "text-gray-600"
                      )}>
                        {achievement.unlocked ? details.detailedDescription : 'Succès verrouillé'}
                      </p>
                    </div>
                  </div>

                  {/* Completed badge */}
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Achievement toast - Super fancy */}
      <AnimatePresence>
        {showAchievementToast && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 blur-xl opacity-50" />
              
              {/* Card */}
              <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-1 rounded-2xl">
                <div className="bg-gray-900 px-6 py-5 rounded-xl flex items-center gap-5">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {ACHIEVEMENT_DETAILS[showAchievementToast]?.emoji || '🏆'}
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-yellow-400 text-xs uppercase tracking-widest font-bold mb-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      ⭐ Succès Débloqué !
                    </motion.p>
                    <motion.p 
                      className="text-white font-black text-xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {achievements.find(a => a.id === showAchievementToast)?.name}
                    </motion.p>
                    <motion.p 
                      className="text-white/70 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {ACHIEVEMENT_DETAILS[showAchievementToast]?.detailedDescription}
                    </motion.p>
                  </div>
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
