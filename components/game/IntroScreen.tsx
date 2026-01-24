'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useGameStore, isLeverActive } from '@/lib/gameStore'
import { POLITICAL_PARTIES } from '@/lib/politicalParties'
import { PROJECTS } from '@/lib/data'
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
  Play,
  ExternalLink,
  Target,
  Scale,
  ChevronDown,
  Star,
  AlertTriangle,
  Calendar,
  BookOpen
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
  const { setPhase, applyPartyPreselection } = useGameStore()
  const [phase, setLocalPhase] = useState<'landing' | 'tutorial' | 'ready'>('landing')
  const [landingStep, setLandingStep] = useState(0)
  const [tutorialStep, setTutorialStep] = useState(0)
  const totalTutorialSteps = 5
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [mockMandat, setMockMandat] = useState<'m1' | 'm2' | 'both' | null>(null)
  const [mockBudget, setMockBudget] = useState({ m1: 2000, m2: 2000 })
  const [showMandatChoice, setShowMandatChoice] = useState(false)
  const [showFloatingCTA, setShowFloatingCTA] = useState(true)
  const footerRef = useRef<HTMLElement>(null)
  
  // Tutorial step 3 toggles state - using real values from FINANCING_IMPACTS
  const [tutorialToggles, setTutorialToggles] = useState({
    gratuiteJeunes: false, // -48M€/mandat
    tarifHausse: false, // +120M€/mandat (10% increase)
    metro24h: false // -24M€/mandat
  })
  const tutorialBudgetImpact = 
    (tutorialToggles.gratuiteJeunes ? -48 : 0) +
    (tutorialToggles.tarifHausse ? 120 : 0) +
    (tutorialToggles.metro24h ? -24 : 0)
  
  // Tutorial step titles for the stepper
  const tutorialStepTitles = [
    'Bienvenue',
    'Vos projets',
    'Budget',
    'Financement',
    'Simulation'
  ]
  
  // Hide floating CTA when footer is visible
  useEffect(() => {
    if (phase !== 'landing') return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingCTA(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    
    if (footerRef.current) {
      observer.observe(footerRef.current)
    }
    
    return () => observer.disconnect()
  }, [phase])

  const handleStart = useCallback(() => {
    setPhase('playing')
  }, [setPhase])

  // Landing page steps
  const advanceLanding = useCallback(() => {
    if (landingStep < 4) {
      setLandingStep(prev => prev + 1)
    }
  }, [landingStep])

  // Navigate to next tutorial step
  const nextTutorialStep = useCallback(() => {
    if (tutorialStep < totalTutorialSteps - 1) {
      setTutorialStep(prev => prev + 1)
    }
  }, [tutorialStep])

  // Tutorial interaction handlers
  const handleProjectToggle = useCallback((projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId)
      }
      return [...prev, projectId]
    })
  }, [])

  const handleMandatSelect = useCallback((mandat: 'm1' | 'm2' | 'both') => {
    setMockMandat(mandat)
    setShowMandatChoice(false)
    const selectedProject = selectedProjects[0]
    const project = PROJECTS.find(p => p.id === selectedProject)
    const cost = project?.cost || 500
    if (mandat === 'm1') {
      setMockBudget(prev => ({ ...prev, m1: prev.m1 - cost }))
    } else if (mandat === 'm2') {
      setMockBudget(prev => ({ ...prev, m2: prev.m2 - cost }))
    } else {
      setMockBudget(prev => ({ m1: prev.m1 - cost/2, m2: prev.m2 - cost/2 }))
    }
    setTimeout(() => setTutorialStep(2), 800)
  }, [selectedProjects])

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
              className="min-h-screen"
            >
              {/* Floating CTA - Hidden when footer visible */}
              <AnimatePresence>
                {showFloatingCTA && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-8 left-0 right-0 z-50 flex justify-center"
              >
                <div className="flex flex-col items-center gap-3 p-4 bg-gray-950/80 backdrop-blur-md rounded-2xl border border-white/10">
                  <button
                    onClick={() => setLocalPhase('tutorial')}
                    className="group px-6 tablet:px-8 py-3 tablet:py-4 bg-white text-gray-900 rounded-full font-bold text-sm tablet:text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center gap-2 tablet:gap-3"
                  >
                    <Play className="w-4 h-4 tablet:w-5 tablet:h-5" />
                    Découvrir comment jouer
                    <ArrowRight className="w-4 h-4 tablet:w-5 tablet:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleStart}
                    className="text-gray-300 hover:text-white transition-colors text-xs tablet:text-sm px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full"
                  >
                    ou commencer directement →
                  </button>
                </div>
              </motion.div>
                )}
              </AnimatePresence>

              {/* ===== SECTION 1: HERO ===== */}
              <section className="min-h-screen flex flex-col relative">
                {/* Header */}
                <div className="p-4 tablet:p-6 flex items-center justify-between">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <img 
                      src="/logo-rectangle-white.png" 
                      alt="TCL 2040" 
                      className="h-8 tablet:h-10 w-auto invert"
                    />
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    onClick={handleStart}
                    className="text-gray-500 hover:text-white transition-colors text-xs tablet:text-sm"
                  >
                    Passer l&apos;intro →
                  </motion.button>
                </div>

                {/* Hero Content */}
                <div className="flex-1 flex items-center justify-center px-4 tablet:px-6">
                  <div className="max-w-4xl w-full text-center">
                    {/* Date badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm">
                        <Sparkles className="w-4 h-4" />
                        22 mars 2026 — Élections métropolitaines
                      </span>
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl tablet:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6"
                    >
                      <span className="block">Vous venez d&apos;être élu(e)</span>
                      <span className="block mt-2 bg-gradient-to-r from-red-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                        Président(e) de la Métropole de Lyon
                      </span>
                    </motion.h1>

                    {/* Mission card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-white/10 rounded-2xl p-6 tablet:p-8 max-w-2xl mx-auto mb-8"
                    >
                      <p className="text-xl tablet:text-2xl md:text-3xl font-bold text-white">
                        Votre mission ?
                      </p>
                      <p className="text-xl tablet:text-2xl md:text-3xl font-bold text-white">
                        Préparer le réseau TCL pour les 12 prochaines années
                      </p>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="mt-12 flex flex-col items-center gap-2 text-gray-500"
                    >
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronDown className="w-6 h-6" />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* ===== SECTION 2: POURQUOI CE SIMULATEUR ===== */}
              <section className="py-16 tablet:py-24 px-4 tablet:px-6">
                <div className="max-w-4xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl tablet:text-3xl font-black text-white">Pourquoi ce simulateur ?</h2>
                    </div>

                    <div className="grid tablet:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                          <Scale className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">Le problème</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          En campagne, on empile des annonces (métro, tram, gratuité…) sans la calculette sous les yeux. Tout semble compatible avec tout.
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">La solution</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          Un budget fermé, des projets réels, des impacts chiffrés. Et la question qu&apos;on repousse toujours : &quot;tu finances comment ?&quot;
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl">
                      <p className="text-gray-300 text-sm tablet:text-base leading-relaxed">
                        Je souhaite que nous puissions discuter sur une base commune, factuelle et lisible pour parler transport.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* ===== SECTION 3: PROGRAMMES DES CANDIDATS ===== */}
              <section className="py-16 tablet:py-24 px-4 tablet:px-6 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-center mb-10">
                      <h2 className="text-2xl tablet:text-3xl font-black text-white mb-3">Programmes des candidats 2026</h2>
                      <p className="text-gray-400 text-sm tablet:text-base max-w-xl mx-auto">
                        Chargez directement le programme transport d&apos;un candidat et visualisez son impact budgétaire
                      </p>
                    </div>

                    <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3 tablet:gap-4">
                      {POLITICAL_PARTIES.map((party, index) => {
                        const projectCount = party.projectSelections.length
                        // Calculate total cost including upgrade options
                        const projectsCost = party.projectSelections.reduce((acc, sel) => {
                          const project = PROJECTS.find(p => p.id === sel.projectId)
                          if (!project) return acc
                          // If project has upgrade options and one is selected, use that cost
                          if (project.upgradeOptions && sel.selectedUpgradeOptionId) {
                            const option = project.upgradeOptions.find(o => o.id === sel.selectedUpgradeOptionId)
                            return acc + (option?.cost || project.cost)
                          }
                          return acc + project.cost
                        }, 0)
                        // Add financing lever costs and social policies
                        const leversCost = 
                          (party.financingLevers.electrificationBus ? 460 : 0) +
                          (party.financingLevers.entretienBus ? 200 : 0)
                        // Add social policies costs (per mandat * 2 mandats)
                        const socialPoliciesCost = 
                          (isLeverActive(party.financingLevers.gratuiteTotale as any) ? 1925 * 2 : 0) +
                          (isLeverActive(party.financingLevers.gratuiteJeunesAbonnes as any) ? 48 * 2 : 0) +
                          (isLeverActive(party.financingLevers.metro24hWeekend as any) ? 24 * 2 : 0)
                        const totalCost = projectsCost + leversCost + socialPoliciesCost
                        const levers = party.financingLevers
                        
                        return (
                          <motion.button
                            key={party.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => {
                              applyPartyPreselection(party.id)
                              handleStart()
                            }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl p-4 tablet:p-5 text-left transition-all group"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-3xl tablet:text-4xl">{party.emoji}</span>
                              <div>
                                <span className="text-white font-bold text-sm tablet:text-base block">{party.shortName}</span>
                                <span className="text-gray-500 text-xs">{party.name}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1.5 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Projets</span>
                                <span className="text-white font-semibold">{projectCount}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Dépenses</span>
                                <span className="text-green-400 font-semibold">{(totalCost / 1000).toFixed(1)} Md€</span>
                              </div>
                              
                              {/* Social policies details */}
                              <div className="pt-2 space-y-1">
                                {levers.gratuiteTotale && isLeverActive(levers.gratuiteTotale as any) && (
                                  <p className="text-purple-300 text-[10px] tablet:text-xs">🎫 Gratuité totale</p>
                                )}
                                {levers.gratuiteJeunesAbonnes && isLeverActive(levers.gratuiteJeunesAbonnes as any) && (
                                  <p className="text-green-300 text-[10px] tablet:text-xs">🎓 Gratuité 11-18 ans</p>
                                )}
                                {levers.metro24hWeekend && isLeverActive(levers.metro24hWeekend as any) && (
                                  <p className="text-blue-300 text-[10px] tablet:text-xs">🌙 Métro 24h weekend</p>
                                )}
                                {levers.electrificationBus && (
                                  <p className="text-yellow-300 text-[10px] tablet:text-xs">⚡ Électrification bus</p>
                                )}
                                {levers.entretienBus && (
                                  <p className="text-orange-300 text-[10px] tablet:text-xs">🚌 Entretien flotte bus</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t border-white/10">
                              <span className="text-gray-400 group-hover:text-white text-xs tablet:text-sm flex items-center gap-2 transition-colors">
                                Charger ce programme
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>

                    <div className="text-center mt-8 space-y-3">
                      <button
                        onClick={handleStart}
                        className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                      >
                        Ou créez votre propre programme
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <p className="text-gray-500 text-xs">
                        Vous représentez un mouvement politique ? <a href="https://www.linkedin.com/in/solal-gendrin/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Contactez-moi sur LinkedIn</a> pour faire évoluer votre programme.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* ===== SECTION 4: QUI JE SUIS ===== */}
              <section className="py-16 tablet:py-24 px-4 tablet:px-6">
                <div className="max-w-3xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-6 tablet:p-10"
                  >
                    <div className="flex flex-col tablet:flex-row gap-6 tablet:gap-10 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 tablet:w-24 tablet:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl tablet:text-5xl">
                          👋
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h2 className="text-2xl tablet:text-3xl font-black text-white mb-2">Salut, moi c&apos;est Solal</h2>
                        <p className="text-gray-400 text-sm tablet:text-base leading-relaxed mb-4">
                          Je crée des outils open source pour rendre l&apos;urbanisme et l&apos;information travaux accessibles à tous.
                        </p>
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                          <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs tablet:text-sm font-medium">
                            Product Manager
                          </span>
                          <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-xs tablet:text-sm font-medium">
                            Passionné d&apos;urbanisme
                          </span>
                          <span className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-full text-xs tablet:text-sm font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Villeurbanne
                          </span>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                          <p className="text-gray-400 text-sm mb-2">Également créateur de</p>
                          <a 
                            href="https://grandsprojets.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-white font-semibold hover:text-blue-400 transition-colors"
                          >
                            grandsprojets.com
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <p className="text-gray-500 text-xs mt-1">
                            Suivez tous les grands projets urbains de la métropole de lyon
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* ===== FOOTER ===== */}
              <footer ref={footerRef} className="py-12 px-4 border-t border-white/10 bg-white/[0.02] mb-[200px]">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
                    <span className="text-amber-400 text-sm font-medium">⚠️ Expérience pédagogique indépendante</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Ce simulateur n&apos;est pas affilié au SYTRAL Mobilités ni à aucune institution publique.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Les données sont issues de sources publiques et peuvent contenir des approximations.
                  </p>
                </div>
              </footer>
            </motion.div>
          )}

          {/* ==================== PHASE 2: INTERACTIVE TUTORIAL ==================== */}
          {phase === 'tutorial' && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Tutorial Header - Compact Stepper */}
              <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3">
                  <div className="flex items-center justify-between">
                    {/* Stepper dots - always visible */}
                    <div className="flex items-center gap-1.5">
                      {tutorialStepTitles.map((title, i) => (
                        <div 
                          key={i} 
                          className="group relative"
                          title={title}
                        >
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all",
                            i < tutorialStep ? "bg-green-500" :
                            i === tutorialStep ? "bg-blue-500 ring-2 ring-blue-500/30" :
                            "bg-gray-700"
                          )} />
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        {tutorialStep + 1}/{totalTutorialSteps}
                      </span>
                    </div>
                    <button
                      onClick={handleStart}
                      className="text-gray-500 hover:text-white transition-colors text-xs flex items-center gap-1"
                    >
                      Passer <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tutorial Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-8">
                  <AnimatePresence mode="wait">
                    
                    {/* ===== STEP 0: BIENVENUE - Prise de fonction ===== */}
                    {tutorialStep === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-4">
                            <Star className="w-3 h-3" />
                            Étape 1 sur 5
                          </div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Bienvenue, Président(e) du SYTRAL
                          </h1>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Vous venez d&apos;être élu(e) à la tête du Syndicat des Transports de Lyon. 
                            Votre mission : transformer le réseau TCL pour les 12 prochaines années.
                          </p>
                        </div>

                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6">
                          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Euro className="w-4 h-4 text-green-400" />
                            Votre enveloppe budgétaire
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Le SYTRAL dispose d&apos;un budget d&apos;investissement de <strong className="text-white">4 milliards d&apos;euros</strong> pour financer les nouveaux projets de transport. 
                            Cette somme est répartie sur deux mandats de 6 ans, soit 2 milliards par mandat.
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                              <p className="text-blue-400 text-xs mb-1">Mandat 1 (2026-2032)</p>
                              <p className="text-white font-bold text-lg">2 Md€</p>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                              <p className="text-purple-400 text-xs mb-1">Mandat 2 (2032-2038)</p>
                              <p className="text-white font-bold text-lg">2 Md€</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <button
                            onClick={nextTutorialStep}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            Découvrir les projets
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ===== STEP 1: VOS PROJETS - Sélection interactive ===== */}
                    {tutorialStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium mb-4">
                            <MousePointerClick className="w-3 h-3" />
                            Étape 2 sur 5 — Interactif
                          </div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Choisissez vos projets prioritaires
                          </h1>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Plus de 25 projets sont sur la table : extensions de métro, nouvelles lignes de tram, bus express... 
                            <strong className="text-white"> Cliquez sur les projets</strong> qui vous semblent prioritaires pour les sélectionner.
                          </p>
                        </div>

                        {/* Interactive project grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                          {PROJECTS.slice(0, 8).map((project) => {
                            const isSelected = selectedProjects.includes(project.id)
                            const typeConfig = project.id.includes('metro') || project.id.includes('modern') 
                              ? { icon: Train, color: 'from-blue-500 to-indigo-600', label: 'Métro' }
                              : project.id.includes('t8') || project.id.includes('t9') || project.id.includes('t10') || project.id.includes('teol') || project.id.includes('t3') || project.id.includes('t12')
                              ? { icon: TramFront, color: 'from-green-500 to-emerald-600', label: 'Tram' }
                              : { icon: Bus, color: 'from-orange-500 to-red-600', label: 'BHNS' }
                            const Icon = typeConfig.icon
                            
                            return (
                              <motion.div
                                key={project.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleProjectToggle(project.id)}
                                className={cn(
                                  "relative p-3 rounded-lg cursor-pointer transition-all border",
                                  isSelected 
                                    ? "bg-blue-500/20 border-blue-500" 
                                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                                )}
                              >
                                {isSelected && (
                                  <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  </motion.div>
                                )}
                                <div className={cn("w-6 h-6 rounded bg-gradient-to-br flex items-center justify-center mb-1.5", typeConfig.color)}>
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                                <p className="text-white text-xs font-medium truncate">{project.name}</p>
                                <p className="text-gray-500 text-[10px]">{project.cost}M€</p>
                              </motion.div>
                            )
                          })}
                        </div>

                        {selectedProjects.length > 0 ? (
                          <div className="text-center">
                            <p className="text-gray-400 text-sm mb-3">
                              Vous avez sélectionné <strong className="text-white">{selectedProjects.length} projet{selectedProjects.length > 1 ? 's' : ''}</strong>. 
                              Voyons maintenant quand les réaliser.
                            </p>
                            <button
                              onClick={() => {
                                setShowMandatChoice(true)
                                setTutorialStep(2)
                              }}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all flex items-center gap-2 mx-auto"
                            >
                              Planifier le calendrier
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 text-sm">
                            👆 Cliquez sur au moins un projet pour continuer
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* ===== STEP 2: BUDGET - Choix du mandat ===== */}
                    {tutorialStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium mb-4">
                            <Calendar className="w-3 h-3" />
                            Étape 3 sur 5 — Interactif
                          </div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Quand réaliser ce projet ?
                          </h1>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Les grands projets de transport prennent du temps : études, enquêtes publiques, travaux... 
                            Vous devez décider sur quel mandat affecter le coût de chaque projet.
                          </p>
                        </div>

                        {/* Selected project */}
                        {selectedProjects[0] && (() => {
                          const project = PROJECTS.find(p => p.id === selectedProjects[0])
                          if (!project) return null
                          return (
                            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Train className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{project.name}</p>
                                <p className="text-gray-500 text-sm">Coût : {project.cost}M€</p>
                              </div>
                            </div>
                          )
                        })()}

                        {/* Mandate choice */}
                        {showMandatChoice && (
                          <div className="space-y-3 mb-6">
                            <p className="text-gray-400 text-sm text-center mb-4">
                              Sur quel mandat souhaitez-vous imputer ce projet ? Chaque choix impacte différemment votre budget.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <button
                                onClick={() => handleMandatSelect('m1')}
                                className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 hover:border-blue-400 text-white rounded-xl transition-all text-left"
                              >
                                <p className="font-bold text-blue-400 text-sm">Mandat 1</p>
                                <p className="text-white font-bold">2026 → 2032</p>
                                <p className="text-gray-400 text-xs mt-1">Budget restant : 2 000 M€</p>
                              </button>
                              <button
                                onClick={() => handleMandatSelect('m2')}
                                className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 hover:border-purple-400 text-white rounded-xl transition-all text-left"
                              >
                                <p className="font-bold text-purple-400 text-sm">Mandat 2</p>
                                <p className="text-white font-bold">2032 → 2038</p>
                                <p className="text-gray-400 text-xs mt-1">Budget restant : 2 000 M€</p>
                              </button>
                              <button
                                onClick={() => handleMandatSelect('both')}
                                className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-indigo-500/50 hover:border-indigo-400 text-white rounded-xl transition-all text-left"
                              >
                                <p className="font-bold text-indigo-400 text-sm">Étalé</p>
                                <p className="text-white font-bold">2026 → 2038</p>
                                <p className="text-gray-400 text-xs mt-1">50% sur chaque mandat</p>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Budget gauges if mandate selected */}
                        {mockMandat && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <p className="text-gray-400 text-sm text-center mb-4">
                              Voici l&apos;impact sur vos budgets. Les jauges se mettent à jour en temps réel à chaque décision.
                            </p>
                            <div className="space-y-3 mb-6">
                              <MockBudgetGauge value={mockBudget.m1} label="Mandat 1 (2026-2032)" color="text-blue-400" />
                              <MockBudgetGauge value={mockBudget.m2} label="Mandat 2 (2032-2038)" color="text-purple-400" />
                            </div>
                            <div className="flex justify-center">
                              <button
                                onClick={() => setTutorialStep(3)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                              >
                                Découvrir les leviers de financement
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {/* ===== STEP 3: FINANCEMENT - Toggles interactifs ===== */}
                    {tutorialStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium mb-4">
                            <Scale className="w-3 h-3" />
                            Étape 4 sur 5 — Interactif
                          </div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                            Ajustez vos leviers de financement
                          </h1>
                          <p className="text-gray-400 max-w-xl mx-auto">
                            Si vos projets dépassent le budget, vous pouvez activer des politiques tarifaires pour générer des recettes supplémentaires.
                            <strong className="text-white"> Testez les interrupteurs</strong> ci-dessous pour voir l&apos;impact sur votre budget.
                          </p>
                        </div>

                        {/* Live budget impact bar */}
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Impact sur le budget annuel</span>
                            <motion.span 
                              key={tutorialBudgetImpact}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className={cn(
                                "font-bold",
                                tutorialBudgetImpact >= 0 ? "text-green-400" : "text-red-400"
                              )}
                            >
                              {tutorialBudgetImpact >= 0 ? '+' : ''}{tutorialBudgetImpact}M€/mandat
                            </motion.span>
                          </div>
                          <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-0.5 h-full bg-white/20" />
                            </div>
                            <motion.div 
                              initial={{ width: '50%' }}
                              animate={{ 
                                width: `${Math.max(5, Math.min(95, 50 + (tutorialBudgetImpact / 3)))}%`
                              }}
                              className={cn(
                                "h-full rounded-full transition-all",
                                tutorialBudgetImpact >= 0 
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                                  : "bg-gradient-to-r from-red-500 to-orange-500"
                              )}
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                            <span>Déficit</span>
                            <span>Équilibré</span>
                            <span>Excédent</span>
                          </div>
                        </div>

                        {/* Interactive toggles */}
                        <div className="space-y-3 mb-6">
                          {/* Toggle 1 */}
                          <div 
                            onClick={() => setTutorialToggles(prev => ({ ...prev, gratuiteJeunes: !prev.gratuiteJeunes }))}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border",
                              tutorialToggles.gratuiteJeunes 
                                ? "bg-purple-500/20 border-purple-500" 
                                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🎫</span>
                              <div>
                                <p className="text-white font-medium text-sm">Gratuité 11-18 ans</p>
                                <p className="text-gray-500 text-xs">Coût pour le réseau</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-red-400 text-xs font-bold">-48M€</span>
                              <div className={cn(
                                "w-10 h-5 rounded-full transition-all flex items-center p-0.5",
                                tutorialToggles.gratuiteJeunes ? "bg-purple-500 justify-end" : "bg-gray-600 justify-start"
                              )}>
                                <motion.div layout className="w-4 h-4 bg-white rounded-full" />
                              </div>
                            </div>
                          </div>

                          {/* Toggle 2 */}
                          <div 
                            onClick={() => setTutorialToggles(prev => ({ ...prev, tarifHausse: !prev.tarifHausse }))}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border",
                              tutorialToggles.tarifHausse 
                                ? "bg-green-500/20 border-green-500" 
                                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">💰</span>
                              <div>
                                <p className="text-white font-medium text-sm">Hausse abonnements +10%</p>
                                <p className="text-gray-500 text-xs">Recettes supplémentaires</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 text-xs font-bold">+120M€</span>
                              <div className={cn(
                                "w-10 h-5 rounded-full transition-all flex items-center p-0.5",
                                tutorialToggles.tarifHausse ? "bg-green-500 justify-end" : "bg-gray-600 justify-start"
                              )}>
                                <motion.div layout className="w-4 h-4 bg-white rounded-full" />
                              </div>
                            </div>
                          </div>

                          {/* Toggle 3 */}
                          <div 
                            onClick={() => setTutorialToggles(prev => ({ ...prev, metro24h: !prev.metro24h }))}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border",
                              tutorialToggles.metro24h 
                                ? "bg-blue-500/20 border-blue-500" 
                                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🌙</span>
                              <div>
                                <p className="text-white font-medium text-sm">Métro 24h le weekend</p>
                                <p className="text-gray-500 text-xs">Coût d&apos;exploitation</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-red-400 text-xs font-bold">-24M€</span>
                              <div className={cn(
                                "w-10 h-5 rounded-full transition-all flex items-center p-0.5",
                                tutorialToggles.metro24h ? "bg-blue-500 justify-end" : "bg-gray-600 justify-start"
                              )}>
                                <motion.div layout className="w-4 h-4 bg-white rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-500 text-xs text-center mb-4">
                          Ces leviers sont des exemples. Dans la simulation, vous aurez accès à de nombreuses autres options.
                        </p>

                        <div className="flex justify-center">
                          <button
                            onClick={nextTutorialStep}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            Terminer le tutoriel
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ===== STEP 4: SIMULATION - CTA Final ===== */}
                    {tutorialStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                      >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
                          <CheckCircle2 className="w-3 h-3" />
                          Tutoriel terminé
                        </div>
                        
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                          Vous êtes prêt(e), Président(e)
                        </h1>
                        
                        <p className="text-gray-400 max-w-lg mx-auto mb-6">
                          Vous avez compris les bases : choisir des projets, les planifier dans le temps, et équilibrer le budget grâce aux leviers de financement. 
                          Il est temps de passer aux choses sérieuses.
                        </p>

                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-8 text-left max-w-md mx-auto">
                          <h3 className="text-white font-semibold mb-3">Ce qui vous attend :</h3>
                          <ul className="space-y-2 text-gray-400 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Une carte interactive avec tous les projets</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Des détails sur chaque projet (coût, impact, description)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Un panneau de financement complet</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>La possibilité de comparer avec les programmes des partis</span>
                            </li>
                          </ul>
                        </div>

                        <motion.button
                          onClick={handleStart}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto"
                        >
                          <Play className="w-5 h-5" />
                          Entrer dans la simulation
                        </motion.button>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
