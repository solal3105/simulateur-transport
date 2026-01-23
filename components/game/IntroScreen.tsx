'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { 
  ChevronRight, 
  TramFront, 
  Train,
  Bus,
  Euro,
  Users,
  MapPin,
  Zap,
  CheckCircle2,
  MousePointerClick,
  Hand,
  ArrowRight,
  Sparkles,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Typewriter effect component
function Typewriter({ text, delay = 0, speed = 30, onComplete, className }: { 
  text: string
  delay?: number
  speed?: number
  onComplete?: () => void
  className?: string 
}) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    if (displayed.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1))
      }, speed)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [displayed, text, speed, started, onComplete])

  return (
    <span className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}

// Mock project card for tutorial
function MockProjectCard({ 
  name, 
  type, 
  cost, 
  impact,
  selected,
  onClick,
  highlight,
  disabled
}: { 
  name: string
  type: 'metro' | 'tram' | 'bus'
  cost: number
  impact: number
  selected?: 'm1' | 'm2' | 'both' | null
  onClick?: () => void
  highlight?: boolean
  disabled?: boolean
}) {
  const typeConfig = {
    metro: { icon: Train, color: 'from-blue-500 to-indigo-600', label: 'Métro' },
    tram: { icon: TramFront, color: 'from-green-500 to-emerald-600', label: 'Tramway' },
    bus: { icon: Bus, color: 'from-orange-500 to-red-600', label: 'Bus' }
  }
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-2xl border-2 p-4 cursor-pointer transition-all",
        highlight && "ring-4 ring-yellow-400 ring-opacity-50",
        selected ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {highlight && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
        >
          <Hand className="w-4 h-4 text-yellow-900" />
        </motion.div>
      )}
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0", config.color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{name}</h4>
          <p className="text-xs text-gray-500">{config.label}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Euro className="w-3 h-3" /> {cost}M€
        </span>
        <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
          <Users className="w-3 h-3" /> +{impact.toLocaleString()}/j
        </span>
      </div>
      {selected && (
        <div className="mt-2 flex gap-1">
          {(selected === 'm1' || selected === 'both') && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">M1</span>
          )}
          {(selected === 'm2' || selected === 'both') && (
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium">M2</span>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Mock budget gauge for tutorial
function MockBudgetGauge({ value, label, color }: { value: number, label: string, color: string }) {
  const percentage = Math.max(0, Math.min(100, (value / 2000) * 100))
  
  return (
    <div className="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">{label}</span>
        <span className={cn("font-bold text-sm", value >= 0 ? color : "text-red-500")}>{value.toLocaleString()}M€</span>
      </div>
      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", value >= 0 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-red-500")}
        />
      </div>
    </div>
  )
}

export function IntroScreen() {
  const { setPhase } = useGameStore()
  const [phase, setLocalPhase] = useState<'landing' | 'tutorial' | 'ready'>('landing')
  const [landingStep, setLandingStep] = useState(0)
  const [tutorialStep, setTutorialStep] = useState(0)
  const totalTutorialSteps = 5
  const [mockSelected, setMockSelected] = useState<string | null>(null)
  const [mockMandat, setMockMandat] = useState<'m1' | 'm2' | 'both' | null>(null)
  const [mockBudget, setMockBudget] = useState({ m1: 2000, m2: 2000 })
  const [showMandatChoice, setShowMandatChoice] = useState(false)

  const handleStart = useCallback(() => {
    setPhase('playing')
  }, [setPhase])

  // Landing page steps
  const advanceLanding = useCallback(() => {
    if (landingStep < 4) {
      setLandingStep(prev => prev + 1)
    }
  }, [landingStep])

  // Tutorial interaction handlers
  const handleMockProjectClick = useCallback(() => {
    if (tutorialStep === 0 && !mockSelected) {
      setMockSelected('metro-e')
      setShowMandatChoice(true)
      setTimeout(() => setTutorialStep(1), 500)
    }
  }, [tutorialStep, mockSelected])

  const handleMandatSelect = useCallback((mandat: 'm1' | 'm2' | 'both') => {
    if (tutorialStep === 1) {
      setMockMandat(mandat)
      setShowMandatChoice(false)
      const cost = 800
      if (mandat === 'm1') {
        setMockBudget(prev => ({ ...prev, m1: prev.m1 - cost }))
      } else if (mandat === 'm2') {
        setMockBudget(prev => ({ ...prev, m2: prev.m2 - cost }))
      } else {
        setMockBudget(prev => ({ m1: prev.m1 - cost/2, m2: prev.m2 - cost/2 }))
      }
      setTimeout(() => setTutorialStep(2), 800)
    }
  }, [tutorialStep])

  return (
    <div className="fixed inset-0 bg-gray-950 overflow-y-auto overflow-x-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px]"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"
          animate={{ 
            x: [0, -80, 0], 
            y: [0, -60, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Animated metro lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <motion.line
            x1="0%" y1="30%" x2="100%" y2="25%"
            stroke="#3B82F6" strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.line
            x1="0%" y1="50%" x2="100%" y2="55%"
            stroke="#EF4444" strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
          />
          <motion.line
            x1="0%" y1="75%" x2="100%" y2="70%"
            stroke="#22C55E" strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        <AnimatePresence mode="wait">
          {/* ==================== PHASE 1: LANDING ==================== */}
          {phase === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="p-3 tablet:p-6 flex items-center justify-between">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  {/* Logo - square on desktop, rectangle on mobile/tablet - inverted for dark background */}
                  <img 
                    src="/logo-square-white.png" 
                    alt="TCL 2040" 
                    className="hidden lg:block h-16 w-auto invert"
                  />
                  <img 
                    src="/logo-rectangle-white.png" 
                    alt="TCL 2040" 
                    className="lg:hidden h-8 tablet:h-12 w-auto invert"
                  />
                </motion.div>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  onClick={handleStart}
                  className="text-gray-500 hover:text-white transition-colors text-xs tablet:text-sm"
                >
                  Passer →
                </motion.button>
              </div>

              {/* Main content */}
              <div className="flex-1 flex items-center justify-center px-4 tablet:px-6 py-2 tablet:py-0">
                <div className="max-w-3xl w-full text-center">
                  {/* Step 0: Date */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: landingStep >= 0 ? 1 : 0 }}
                    className="mb-2 tablet:mb-4"
                  >
                    <span className="inline-flex items-center gap-1.5 tablet:gap-2 px-3 tablet:px-4 py-1.5 tablet:py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-xs tablet:text-sm">
                      <Sparkles className="w-3 h-3 tablet:w-4 tablet:h-4" />
                      <Typewriter 
                        text="22 mars 2026 — Élections métropolitaines" 
                        speed={40}
                        onComplete={() => setTimeout(advanceLanding, 800)}
                      />
                    </span>
                  </motion.div>

                  {/* Step 1: Main headline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: landingStep >= 1 ? 1 : 0, y: landingStep >= 1 ? 0 : 20 }}
                    transition={{ duration: 0.8 }}
                    className="mb-3 tablet:mb-6"
                  >
                    <h1 className="text-2xl tablet:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
                      <span className="block">
                        <Typewriter 
                          text="Vous venez d'être"
                          delay={500}
                          speed={50}
                        />
                      </span>
                      <span className="block">
                        {landingStep >= 0 && (
                          <Typewriter 
                            text="élu(e)"
                            delay={1500}
                            speed={80}
                            onComplete={() => setTimeout(advanceLanding, 400)}
                          />
                        )}
                      </span>
                      <span className="block bg-gradient-to-r from-red-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                        {landingStep >= 2 && (
                          <Typewriter 
                            text="Président(e) de la Métropole"
                            speed={55}
                            onComplete={() => setTimeout(advanceLanding, 1000)}
                          />
                        )}
                      </span>
                    </h1>
                  </motion.div>

                  {/* Step 3: Mission - emphasized */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: landingStep >= 3 ? 1 : 0, y: landingStep >= 3 ? 0 : 20 }}
                    transition={{ duration: 0.8 }}
                    className="mb-4 tablet:mb-8"
                  >
                    <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-white/10 rounded-xl tablet:rounded-2xl p-3 tablet:p-6 max-w-2xl mx-auto">
                      <p className="text-gray-300 text-sm tablet:text-lg md:text-xl mb-1 tablet:mb-3">
                        Votre mission pour les <strong className="text-white">12 prochaines années</strong> :
                      </p>
                      <p className="text-lg tablet:text-2xl md:text-3xl font-black text-white">
                        Transformer le réseau TCL
                      </p>
                      <p className="text-gray-400 text-xs tablet:text-sm mt-1 tablet:mt-3 hidden tablet:block">
                        Métros, tramways, bus... Choisissez les projets à financer pour améliorer la mobilité de 1,4 million d&apos;habitants.
                      </p>
                    </div>
                  </motion.div>

                  {/* Step 3: Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: landingStep >= 3 ? 1 : 0, y: landingStep >= 3 ? 0 : 20 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-4 tablet:gap-6 mb-4 tablet:mb-10"
                  >
                    <div className="text-center">
                      <p className="text-2xl tablet:text-4xl md:text-5xl font-black text-green-400">4 Md€</p>
                      <p className="text-gray-500 text-xs tablet:text-sm">Budget</p>
                    </div>
                    <div className="w-px h-10 tablet:h-16 bg-gray-800 hidden tablet:block" />
                    <div className="text-center">
                      <p className="text-2xl tablet:text-4xl md:text-5xl font-black text-blue-400">2</p>
                      <p className="text-gray-500 text-xs tablet:text-sm">Mandats</p>
                    </div>
                    <div className="w-px h-10 tablet:h-16 bg-gray-800 hidden tablet:block" />
                    <div className="text-center">
                      <p className="text-2xl tablet:text-4xl md:text-5xl font-black text-purple-400">25+</p>
                      <p className="text-gray-500 text-xs tablet:text-sm">Projets</p>
                    </div>
                  </motion.div>

                  {/* Step 4: CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: landingStep >= 3 ? 1 : 0, y: landingStep >= 3 ? 0 : 20 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col items-center gap-2 tablet:gap-4"
                  >
                    <button
                      onClick={() => setLocalPhase('tutorial')}
                      className="group px-5 tablet:px-8 py-3 tablet:py-4 bg-white text-gray-900 rounded-full font-bold text-sm tablet:text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/25 flex items-center gap-2 tablet:gap-3"
                    >
                      Découvrir comment jouer
                      <ArrowRight className="w-4 h-4 tablet:w-5 tablet:h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={handleStart}
                      className="text-gray-500 hover:text-white transition-colors text-xs tablet:text-sm"
                    >
                      Commencer directement
                    </button>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: landingStep >= 3 ? 0.5 : 0 }}
                className="p-2 tablet:p-4 text-center"
              >
                <p className="text-gray-600 text-[10px] tablet:text-xs">
                  Expérience pédagogique indépendante • Non affiliée au SYTRAL
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* ==================== PHASE 2: INTERACTIVE TUTORIAL ==================== */}
          {phase === 'tutorial' && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-6"
            >
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-medium">Tutoriel interactif</span>
                  <span className="text-gray-500 text-sm">{tutorialStep + 1} / {totalTutorialSteps}</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((tutorialStep + 1) / totalTutorialSteps) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Tutorial content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="max-w-4xl w-full">
                  <AnimatePresence mode="wait">
                    {/* Step 0: Select a project */}
                    {tutorialStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 mb-4">
                            <MousePointerClick className="w-4 h-4" />
                            <span className="text-sm font-medium">Étape 1 : Sélectionner un projet</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                            Cliquez sur un projet pour le sélectionner
                          </h2>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Chaque projet représente une infrastructure de transport à construire ou améliorer.
                          </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                          <MockProjectCard
                            name="Métro E Part-Dieu"
                            type="metro"
                            cost={800}
                            impact={180000}
                            highlight={!mockSelected}
                            onClick={handleMockProjectClick}
                          />
                          <MockProjectCard
                            name="Tramway T9"
                            type="tram"
                            cost={280}
                            impact={45000}
                            disabled
                          />
                          <MockProjectCard
                            name="Bus Express Nord"
                            type="bus"
                            cost={45}
                            impact={12000}
                            disabled
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Choose mandate */}
                    {tutorialStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 mb-4">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-medium">Étape 2 : Planifier dans le temps</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                            Choisissez quand réaliser ce projet
                          </h2>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Répartissez vos investissements entre les deux mandats selon votre stratégie.
                          </p>
                        </motion.div>

                        <div className="flex flex-col items-center gap-6">
                          <MockProjectCard
                            name="Métro E Part-Dieu"
                            type="metro"
                            cost={800}
                            impact={180000}
                            selected={mockMandat}
                          />

                          {showMandatChoice && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-wrap justify-center gap-3"
                            >
                              <button
                                onClick={() => handleMandatSelect('m1')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105"
                              >
                                Mandat 1 (2026-2032)
                              </button>
                              <button
                                onClick={() => handleMandatSelect('m2')}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all hover:scale-105"
                              >
                                Mandat 2 (2032-2038)
                              </button>
                              <button
                                onClick={() => handleMandatSelect('both')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all hover:scale-105"
                              >
                                Étalé sur les deux
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Budget impact */}
                    {tutorialStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 mb-4">
                            <Euro className="w-4 h-4" />
                            <span className="text-sm font-medium">Étape 3 : Surveiller le budget</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                            Chaque projet impacte votre budget
                          </h2>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Les jauges en haut de l&apos;écran montrent votre budget restant par mandat.
                          </p>
                        </motion.div>

                        <div className="max-w-md mx-auto space-y-4 mb-8">
                          <MockBudgetGauge value={mockBudget.m1} label="Budget Mandat 1" color="text-green-500" />
                          <MockBudgetGauge value={mockBudget.m2} label="Budget Mandat 2" color="text-blue-500" />
                        </div>

                        <button
                          onClick={() => setTutorialStep(3)}
                          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                        >
                          Continuer →
                        </button>
                      </motion.div>
                    )}

                    {/* Step 3: Financing levers */}
                    {tutorialStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 mb-4">
                            <Euro className="w-4 h-4" />
                            <span className="text-sm font-medium">Étape 4 : Les leviers de financement</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                            Augmentez vos recettes si nécessaire
                          </h2>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Le bouton <strong className="text-yellow-400">€ Financement</strong> ouvre un panneau avec des options pour ajuster votre budget.
                          </p>
                        </motion.div>

                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 max-w-xl mx-auto mb-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                              <h4 className="text-green-400 font-bold text-sm mb-2">💰 Augmenter les recettes</h4>
                              <ul className="text-gray-400 text-xs space-y-1">
                                <li>• Hausse des tarifs (+5%, +10%...)</li>
                                <li>• Versement mobilité entreprises</li>
                                <li>• Subventions régionales</li>
                              </ul>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                              <h4 className="text-red-400 font-bold text-sm mb-2">📉 Réduire les dépenses</h4>
                              <ul className="text-gray-400 text-xs space-y-1">
                                <li>• Réduire l&apos;offre bus (-10%)</li>
                                <li>• Différer la maintenance</li>
                                <li>• Optimiser les lignes</li>
                              </ul>
                            </div>
                          </div>
                          <p className="text-gray-500 text-xs mt-4 text-center">
                            ⚠️ Attention : chaque levier a des conséquences sur l&apos;attractivité du réseau !
                          </p>
                        </div>

                        <button
                          onClick={() => setTutorialStep(4)}
                          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                        >
                          Continuer →
                        </button>
                      </motion.div>
                    )}

                    {/* Step 4: Map interaction */}
                    {tutorialStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-8"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">Étape 5 : Explorer la carte</span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                            Explorez les projets sur la carte
                          </h2>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Sur la carte, cliquez sur les lignes colorées pour voir les détails de chaque projet. Voici un exemple avec le projet TEOL :
                          </p>
                        </motion.div>

                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 max-w-xl mx-auto mb-8">
                          {/* Mock map with TEOL line */}
                          <div className="relative h-48 bg-gray-900 rounded-xl overflow-hidden mb-4">
                            {/* Simplified map background */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gray-500 rounded-full" />
                              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-500 rounded-full" />
                              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gray-500 rounded-full" />
                            </div>
                            {/* TEOL tramway line */}
                            <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full">
                              <motion.path
                                d="M40,120 C100,80 180,100 250,90 S350,110 380,100"
                                stroke="#22C55E"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                              />
                              {/* Stations */}
                              <motion.circle cx="40" cy="120" r="6" fill="#22C55E" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} />
                              <motion.circle cx="150" cy="95" r="5" fill="#22C55E" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} />
                              <motion.circle cx="250" cy="90" r="5" fill="#22C55E" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }} />
                              <motion.circle cx="380" cy="100" r="6" fill="#22C55E" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }} />
                            </svg>
                            <motion.div
                              className="absolute top-1/3 left-1/2 -translate-x-1/2"
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                            >
                              <Hand className="w-8 h-8 text-yellow-400" />
                            </motion.div>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur rounded-lg p-2 text-left">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                <p className="text-white text-xs font-bold">TEOL - Tramway Est-Ouest Lyonnais</p>
                              </div>
                              <p className="text-gray-400 text-[10px] mt-0.5">Alaï ↔ Meyzieu • 285M€ • +48 000 voyageurs/jour</p>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm">
                            <strong className="text-white">Astuce :</strong> Utilisez le menu de couleurs pour afficher les projets par coût, efficacité ou type.
                          </p>
                        </div>

                        <button
                          onClick={handleStart}
                          className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                        >
                          <Play className="w-5 h-5" />
                          Lancer la simulation
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Skip button */}
              <div className="text-center">
                <button
                  onClick={handleStart}
                  className="text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Passer le tutoriel →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
