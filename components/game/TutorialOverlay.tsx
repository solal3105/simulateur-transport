'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { X, ChevronRight, MapPin, Coins, Bus, Rocket, Crown, Sparkles, Target, Trophy } from 'lucide-react'

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue, Président(e) !',
    subtitle: '🏛️ Métropole de Lyon',
    description: 'Félicitations pour votre élection ! Les Lyonnais comptent sur vous pour transformer leur réseau de transport. 4 milliards d\'euros et 12 années de mandats vous attendent.',
    icon: Crown,
    position: 'center',
    highlight: null,
    gradient: 'from-amber-500 to-yellow-500',
    emoji: '👑',
  },
  {
    id: 'quest',
    title: 'Votre quête commence...',
    subtitle: '🗺️ Mission principale',
    description: 'Objectif : maximiser l\'impact voyageurs tout en équilibrant le budget. Chaque projet est une décision stratégique qui façonnera la mobilité de demain.',
    icon: Target,
    position: 'center',
    highlight: null,
    gradient: 'from-purple-500 to-pink-500',
    emoji: '⚔️',
  },
  {
    id: 'projects',
    title: 'Explorez le territoire',
    subtitle: '📍 Projets disponibles',
    description: 'Cliquez sur les marqueurs pour découvrir métros, trams et BHNS. Les couleurs indiquent le coût : vert = économique, rouge = ambitieux.',
    icon: MapPin,
    position: 'center',
    highlight: 'map',
    gradient: 'from-blue-500 to-cyan-500',
    emoji: '🗺️',
  },
  {
    id: 'budget',
    title: 'Gérez vos ressources',
    subtitle: '💰 Trésorerie métropolitaine',
    description: 'Surveillez vos 2 milliards d\'euros par mandat. Un déficit modéré est toléré (max 100 millions d\'euros), mais attention à ne pas ruiner les finances publiques !',
    icon: Coins,
    position: 'top',
    highlight: 'budget',
    gradient: 'from-emerald-500 to-green-500',
    emoji: '💎',
  },
  {
    id: 'financing',
    title: 'Débloquez des pouvoirs',
    subtitle: '⚡ Leviers de financement',
    description: 'Versement mobilité, tarifs, gratuité... Chaque levier a ses avantages et inconvénients. Certains nécessitent même une loi nationale !',
    icon: Sparkles,
    position: 'bottom',
    highlight: 'financing',
    gradient: 'from-orange-500 to-red-500',
    emoji: '✨',
  },
  {
    id: 'bus',
    title: 'N\'oubliez pas les bus !',
    subtitle: '🚌 Offre complémentaire',
    description: 'Électrification, entretien... Le réseau bus est essentiel. Configurez votre stratégie avant de valider.',
    icon: Bus,
    position: 'bottom',
    highlight: 'bus',
    gradient: 'from-teal-500 to-cyan-500',
    emoji: '🚌',
  },
  {
    id: 'validate',
    title: 'Remportez la victoire !',
    subtitle: '🏆 Résultats',
    description: 'Quand tout est prêt, validez pour découvrir l\'impact de vos décisions sur les millions de Lyonnais. Bonne chance, Président(e) !',
    icon: Trophy,
    position: 'bottom',
    highlight: 'validate',
    gradient: 'from-yellow-500 to-orange-500',
    emoji: '🎯',
  },
]

export function TutorialOverlay() {
  const { showTutorial, tutorialStep, nextTutorialStep, skipTutorial } = useGameStore()

  if (!showTutorial) return null

  const currentStep = TUTORIAL_STEPS[tutorialStep]
  if (!currentStep) return null

  const Icon = currentStep.icon
  const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none"
      >
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={skipTutorial} />
        
        {/* Tutorial card */}
        <motion.div
          key={tutorialStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className={`
            absolute pointer-events-auto
            ${currentStep.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
            ${currentStep.position === 'top' ? 'top-32 left-1/2 -translate-x-1/2' : ''}
            ${currentStep.position === 'bottom' ? 'bottom-48 left-1/2 -translate-x-1/2' : ''}
          `}
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-6 max-w-md mx-4 overflow-hidden relative">
            {/* RPG-style decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
            
            {/* Close button */}
            <button
              onClick={skipTutorial}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with emoji and icon */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentStep.gradient} flex items-center justify-center shadow-lg relative`}>
                <Icon className="w-8 h-8 text-white" />
                <span className="absolute -top-2 -right-2 text-2xl">{currentStep.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                  {currentStep.subtitle}
                </p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            {/* Description with RPG-style box */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-5">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Progress and actions */}
            <div className="flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {TUTORIAL_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === tutorialStep
                        ? 'bg-blue-500'
                        : index < tutorialStep
                        ? 'bg-blue-300'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={skipTutorial}
                  className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Passer
                </button>
                <button
                  onClick={nextTutorialStep}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
                >
                  {isLastStep ? 'Commencer' : 'Suivant'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
