'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { Button } from '@/components/ui/button'
import { 
  TramFront, 
  Coins, 
  Target, 
  Trophy, 
  ArrowRight,
  Lightbulb,
  Users,
  Calendar
} from 'lucide-react'

const onboardingSteps = [
  {
    icon: TramFront,
    title: "22 mars 2026",
    subtitle: "Vous venez d'être élu(e)",
    content: "L'élection métropolitaine a eu lieu. Vous êtes le nouveau Président(e) de la Métropole de Lyon. Votre mission : transformer le réseau TCL pour les 12 prochaines années.",
    tip: "Chaque décision que vous prendrez aura un impact sur des millions de Lyonnais.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Coins,
    title: "Votre Budget",
    subtitle: "4 milliards d'euros",
    content: "Vous disposez de 2 milliards d'euros par mandat (2026-2032 et 2032-2038). Ce budget peut être ajusté grâce aux leviers de financement.",
    tip: "Attention : vous ne pouvez pas valider un budget avec plus de 1 milliard d'euros de dette par mandat. Un déficit modéré est acceptable, mais une dette excessive est insoutenable !",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Target,
    title: "25 Projets",
    subtitle: "Des choix stratégiques",
    content: "Métros, tramways, bus... Chaque projet a un coût et un impact sur les voyageurs quotidiens. Vous pouvez les planifier sur Mandat 1 (2026-2032), Mandat 2 (2032-2038), ou étaler le coût sur les deux mandats (2026-2038).",
    tip: "Conseil : les projets M1+M2 divisent le coût par 2 sur chaque mandat. Cliquez à nouveau sur un projet sélectionné pour le retirer.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Impact Voyageurs",
    subtitle: "L'objectif ultime",
    content: "Votre but : maximiser le nombre de voyageurs quotidiens. Plus votre réseau est attractif, plus les Lyonnais abandonneront leur voiture.",
    tip: "Un réseau efficace = moins de pollution, moins de bouchons, une ville plus agréable.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Trophy,
    title: "Débloquez des Succès",
    subtitle: "Relevez les défis",
    content: "Complétez des objectifs pour gagner des points et débloquer des succès. Équilibrez votre budget, diversifiez vos projets, maximisez l'efficacité !",
    tip: "Prêt à relever le défi ? Votre mandat commence maintenant.",
    color: "from-red-500 to-rose-500",
  },
]

export function OnboardingScreen() {
  const { onboardingStep, nextOnboardingStep, skipOnboarding, totalOnboardingSteps } = useGameStore()
  const step = onboardingSteps[onboardingStep]
  const Icon = step.icon
  const progress = ((onboardingStep + 1) / totalOnboardingSteps) * 100

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={skipOnboarding}
        className="absolute top-6 right-6 text-gray-500 hover:text-white text-sm transition-colors z-20"
      >
        Passer le tutoriel →
      </motion.button>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="max-w-2xl w-full"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
              className={`w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br ${step.color} p-5 shadow-2xl`}
            >
              <Icon className="w-full h-full text-white" />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                {step.subtitle}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {step.title}
              </h1>
            </motion.div>

            {/* Content card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10"
            >
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {step.content}
              </p>
              
              <div className="flex items-start gap-3 bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-200/80 text-sm">
                  {step.tip}
                </p>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center justify-between"
            >
              {/* Step indicators */}
              <div className="flex gap-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === onboardingStep
                        ? 'w-8 bg-white'
                        : index < onboardingStep
                        ? 'w-2 bg-white/50'
                        : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Next button */}
              <Button
                onClick={nextOnboardingStep}
                size="lg"
                className={`bg-gradient-to-r ${step.color} hover:opacity-90 text-white border-0 px-8`}
              >
                {onboardingStep === totalOnboardingSteps - 1 ? (
                  <>
                    Commencer
                    <Trophy className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <motion.div
        className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-3xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className={`absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-3xl`}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  )
}
