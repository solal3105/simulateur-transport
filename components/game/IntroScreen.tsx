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
  BookOpen,
  AlertCircle,
  X
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
  const totalTutorialSteps = 7
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [mockMandat, setMockMandat] = useState<'m1' | 'm2' | 'both' | null>(null)
  const [mockBudget, setMockBudget] = useState({ m1: 2000, m2: 2000 })
  const [showFloatingCTA, setShowFloatingCTA] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  const [showLFIModal, setShowLFIModal] = useState(false)
  const footerRef = useRef<HTMLElement>(null)
  
  // 3 tutorial projects - real projects from the data
  const tutorialProjects = [
    PROJECTS.find(p => p.id === 't8'),      // T8 - Tramway ~350M€
    PROJECTS.find(p => p.id === 'ext-a-est'), // Extension Métro A ~600M€
    PROJECTS.find(p => p.id === 'bhns-parilly') // BHNS Parilly ~85M€
  ].filter(Boolean)
  
  // Get selected project data
  const selectedProject = selectedProjectId ? PROJECTS.find(p => p.id === selectedProjectId) : null
  
  // Tutorial step 5 toggles state - using real values from FINANCING_IMPACTS
  const [tutorialToggles, setTutorialToggles] = useState({
    gratuiteJeunes: false, // -48M€/mandat
    tarifHausse: false, // +80M€/mandat (10% tickets increase)
    metro24h: false // -24M€/mandat
  })
  const tutorialBudgetImpact = 
    (tutorialToggles.gratuiteJeunes ? -48 : 0) +
    (tutorialToggles.tarifHausse ? 80 : 0) +
    (tutorialToggles.metro24h ? -24 : 0)
  
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
  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProjectId(projectId)
    // Auto-advance to step 2 (project detail)
    setTimeout(() => setTutorialStep(2), 300)
  }, [])

  const handleMandatSelect = useCallback((mandat: 'm1' | 'm2' | 'both') => {
    setMockMandat(mandat)
    const cost = selectedProject?.cost || 500
    if (mandat === 'm1') {
      setMockBudget({ m1: 2000 - cost, m2: 2000 })
    } else if (mandat === 'm2') {
      setMockBudget({ m1: 2000, m2: 2000 - cost })
    } else {
      setMockBudget({ m1: 2000 - cost/2, m2: 2000 - cost/2 })
    }
    // Auto-advance to step 3 (budget gauges)
    setTimeout(() => setTutorialStep(3), 500)
  }, [selectedProject])

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        
                        // Add financing lever costs (bus fleet)
                        const leversCost = 
                          (party.financingLevers.electrificationBus ? 460 : 0) +
                          (party.financingLevers.entretienBus ? 800 : 0)
                        
                        // Add social policies costs (per mandat * 2 mandats)
                        const gratuiteTotaleActive = isLeverActive(party.financingLevers.gratuiteTotale as any)
                        const socialPoliciesCost = 
                          (gratuiteTotaleActive ? 1925 * 2 : 0) +
                          (!gratuiteTotaleActive && isLeverActive(party.financingLevers.gratuiteMoins25ans as any) ? 240 * 2 : 0) +
                          (!gratuiteTotaleActive && isLeverActive(party.financingLevers.gratuiteJeunesAbonnes as any) ? 48 * 2 : 0) +
                          (isLeverActive(party.financingLevers.metro24hWeekend as any) ? 24 * 2 : 0)
                        
                        const totalCost = projectsCost + leversCost + socialPoliciesCost
                        
                        // Calculate financing revenues (per mandat * 2 mandats)
                        const tarifRevenues = gratuiteTotaleActive ? 0 : 
                          ((party.financingLevers.tarifAbonnements || 0) * 12 * 2) +
                          ((party.financingLevers.tarifTickets || 0) * 8 * 2)
                        
                        const versementMobiliteRevenue = (party.financingLevers.versementMobilite || 0) * 28 * 2
                        
                        const tva55Revenue = isLeverActive(party.financingLevers.tva55 as any) ? 96 * 2 : 0
                        
                        const suppressionTarifSocialRevenue = !gratuiteTotaleActive && isLeverActive(party.financingLevers.suppressionTarifSocial as any) 
                          ? 240 * 2 
                          : 0
                        
                        const totalRevenues = tarifRevenues + versementMobiliteRevenue + tva55Revenue + suppressionTarifSocialRevenue
                        
                        // Budget surplus/deficit: 4000M€ base - totalCost + totalRevenues
                        const budgetBalance = 4000 - totalCost + totalRevenues
                        const isPositive = budgetBalance >= 0
                        
                        const levers = party.financingLevers
                        
                        return (
                          <motion.button
                            key={party.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => {
                              if (party.id === 'lfi') {
                                setShowLFIModal(true)
                              } else {
                                applyPartyPreselection(party.id)
                                handleStart()
                              }
                            }}
                            whileHover={{ 
                              scale: 1.02, 
                              y: -6,
                              transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="relative bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/20 hover:border-white/40 rounded-2xl p-5 text-left transition-all duration-200 ease-out group overflow-hidden flex flex-col"
                            style={{
                              boxShadow: `0 0 0 1px ${party.color}20, 0 8px 24px -8px ${party.color}40`
                            }}
                          >
                            {/* Color accent bar */}
                            <div 
                              className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                              style={{ backgroundColor: party.color }}
                            />
                            
                            {/* Party name at top */}
                            <div className="flex items-center gap-3 mb-4">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform"
                                style={{ 
                                  backgroundColor: `${party.color}20`,
                                  border: `2px solid ${party.color}40`,
                                  boxShadow: `0 4px 12px ${party.color}30`
                                }}
                              >
                                {party.emoji}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-bold text-base leading-tight">
                                  {party.shortName}
                                </h3>
                              </div>
                            </div>
                            
                            {/* Budget balance - prominent display */}
                            <div className="mb-4 flex-1">
                              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-xs mb-1">Excédent budgétaire</p>
                                <p className={cn(
                                  "text-2xl font-black mb-1",
                                  isPositive ? "text-green-400" : "text-red-400"
                                )}>
                                  {isPositive ? '+' : ''}{budgetBalance} M€
                                </p>
                                <p className="text-gray-500 text-[10px]">
                                  {projectCount} projet{projectCount > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            
                            {/* Social policies */}
                            {(levers.gratuiteTotale || levers.gratuiteMoins25ans || levers.gratuiteJeunesAbonnes || levers.metro24hWeekend || levers.electrificationBus || levers.entretienBus) && (
                              <div className="space-y-1.5 mb-4 pb-4 border-b border-white/10">
                                {levers.gratuiteTotale && isLeverActive(levers.gratuiteTotale as any) && (
                                  <div className="flex items-center gap-1.5 text-purple-300 text-xs">
                                    <span>🎫</span>
                                    <span>Gratuité totale</span>
                                  </div>
                                )}
                                {levers.gratuiteMoins25ans && isLeverActive(levers.gratuiteMoins25ans as any) && (
                                  <div className="flex items-center gap-1.5 text-purple-300 text-xs">
                                    <span>🎓</span>
                                    <span>Gratuité -25 ans</span>
                                  </div>
                                )}
                                {levers.gratuiteJeunesAbonnes && isLeverActive(levers.gratuiteJeunesAbonnes as any) && (
                                  <div className="flex items-center gap-1.5 text-green-300 text-xs">
                                    <span>🎓</span>
                                    <span>Gratuité 11-18 ans</span>
                                  </div>
                                )}
                                {levers.metro24hWeekend && isLeverActive(levers.metro24hWeekend as any) && (
                                  <div className="flex items-center gap-1.5 text-blue-300 text-xs">
                                    <span>🌙</span>
                                    <span>Métro 24h weekend</span>
                                  </div>
                                )}
                                {levers.electrificationBus && (
                                  <div className="flex items-center gap-1.5 text-yellow-300 text-xs">
                                    <span>⚡</span>
                                    <span>Électrification bus</span>
                                  </div>
                                )}
                                {levers.entretienBus && (
                                  <div className="flex items-center gap-1.5 text-orange-300 text-xs">
                                    <span>🚌</span>
                                    <span>Entretien flotte</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* CTA at bottom */}
                            <div className="flex items-center gap-2 text-gray-300 group-hover:text-white text-sm font-medium transition-colors mt-auto">
                              <span>Charger ce programme</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl max-w-xl mx-auto">
                    <p className="text-blue-300 text-sm mb-2">
                      🐛 <strong>Vous avez repéré une coquille ou une erreur de données ?</strong>
                    </p>
                    <p className="text-gray-400 text-xs">
                      Merci de me prévenir rapidement sur{' '}
                      <a 
                        href="https://www.linkedin.com/in/solal-gendrin/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        LinkedIn
                      </a>
                      {' '}ou par email :{' '}
                      {showEmail ? (
                        <span className="text-blue-400 font-mono">
                          {['solal', '.', 'gendrin', '@', 'gmail', '.', 'com'].join('')}
                        </span>
                      ) : (
                        <button
                          onClick={() => setShowEmail(true)}
                          className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          [afficher l&apos;email]
                        </button>
                      )}
                      {' '}en me sourçant l&apos;information afin que je puisse corriger.
                    </p>
                  </div>
                </div>
              </footer>
            </motion.div>
          )}

          {/* ==================== PHASE 2: TUTORIEL 7 ÉTAPES ==================== */}
          {phase === 'tutorial' && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Header Stepper */}
              <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalTutorialSteps }).map((_, i) => (
                      <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all", i < tutorialStep ? "bg-green-500" : i === tutorialStep ? "bg-blue-500 ring-2 ring-blue-500/30" : "bg-gray-700")} />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">{tutorialStep + 1}/{totalTutorialSteps}</span>
                  </div>
                  <button onClick={handleStart} className="text-gray-500 hover:text-white text-xs flex items-center gap-1">Passer <ArrowRight className="w-3 h-3" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-8">
                  <AnimatePresence mode="wait">
                    
                    {/* ÉTAPE 1: BIENVENUE */}
                    {tutorialStep === 0 && (
                      <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-4"><Star className="w-3 h-3" />Étape 1 sur 7</div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Madame/Monsieur le Président(e),</h1>
                          <p className="text-gray-300 text-lg max-w-xl mx-auto">Vous venez d&apos;être élu(e) à la présidence du SYTRAL. Votre mandat : transformer le réseau TCL pour les <strong className="text-white">12 prochaines années</strong>.</p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
                          <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-lg"><Euro className="w-5 h-5 text-green-400" />Votre enveloppe : 4 milliards d&apos;euros</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                              <p className="text-blue-400 text-sm">Mandat 1</p>
                              <p className="text-white font-bold text-2xl">2 Md€</p>
                              <p className="text-gray-500 text-xs">2026 → 2032</p>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                              <p className="text-purple-400 text-sm">Mandat 2</p>
                              <p className="text-white font-bold text-2xl">2 Md€</p>
                              <p className="text-gray-500 text-xs">2032 → 2038</p>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm text-center">Cette somme peut sembler colossale, mais elle ne suffira pas à tout financer. <strong className="text-white">Vous allez devoir faire des choix.</strong></p>
                        </div>
                        <div className="flex justify-center">
                          <button onClick={nextTutorialStep} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg flex items-center gap-2">Découvrir la carte<ArrowRight className="w-5 h-5" /></button>
                        </div>
                      </motion.div>
                    )}

                    {/* ÉTAPE 2: LES PROJETS - Choix parmi 3 */}
                    {tutorialStep === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium mb-4"><MousePointerClick className="w-3 h-3" />Étape 2 sur 7 — Interactif</div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Voici quelques projets parmi lesquels vous aurez à choisir.</h1>
                          <p className="text-gray-400">Commencez par en choisir un :</p>
                        </div>
                        <div className="space-y-3 mb-6">
                          {tutorialProjects.map((project) => {
                            if (!project) return null
                            const isSelected = selectedProjectId === project.id
                            const typeConfig = project.id.includes('ext-a') ? { color: 'from-blue-500 to-indigo-600', label: 'Métro', emoji: '🚇' } : project.id.includes('t8') ? { color: 'from-green-500 to-emerald-600', label: 'Tramway', emoji: '🚊' } : { color: 'from-orange-500 to-red-600', label: 'Bus Express', emoji: '🚌' }
                            return (
                              <motion.div key={project.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => handleProjectSelect(project.id)}
                                className={cn("relative p-4 rounded-xl cursor-pointer transition-all border", isSelected ? "bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/30" : "bg-gray-800/50 border-gray-700 hover:border-gray-500")}>
                                <div className="flex items-start gap-4">
                                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-2xl", typeConfig.color)}>{typeConfig.emoji}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-white">{project.name}</h4>
                                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold text-white bg-gradient-to-r", typeConfig.color)}>{typeConfig.label}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{project.description}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span className="text-gray-400 flex items-center gap-1"><Euro className="w-3.5 h-3.5 text-green-400" /><strong className="text-white">{project.cost >= 1000 ? `${(project.cost/1000).toFixed(1)} Md€` : `${project.cost} M€`}</strong></span>
                                      <span className="text-gray-400 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-purple-400" /><strong className="text-white">+{(project.impact || 0).toLocaleString()}</strong> voy/jour</span>
                                    </div>
                                  </div>
                                  {isSelected && <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0" />}
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                        <p className="text-center text-gray-500 text-sm">👆 Cliquez sur un projet pour le découvrir en détail</p>
                      </motion.div>
                    )}

                    {/* ÉTAPE 3: LE PANEL PROJET - Comprendre les indicateurs */}
                    {tutorialStep === 2 && selectedProject && (
                      <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium mb-4"><Target className="w-3 h-3" />Étape 3 sur 7 — Interactif</div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Chaque projet possède des caractéristiques clés</h1>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6">
                          <h3 className="text-white font-bold text-lg mb-4">{selectedProject.name}</h3>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                              <p className="text-gray-500 text-xs mb-1">1. Coût</p>
                              <p className="text-white font-bold text-lg">{selectedProject.cost >= 1000 ? `${(selectedProject.cost/1000).toFixed(1)} Md€` : `${selectedProject.cost} M€`}</p>
                            </div>
                            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                              <p className="text-gray-500 text-xs mb-1">2. Impact voyageurs</p>
                              <p className="text-purple-400 font-bold text-lg">+{(selectedProject.impact || 0).toLocaleString()}/j</p>
                            </div>
                            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                              <p className="text-gray-500 text-xs mb-1">3. Efficacité</p>
                              <p className="text-green-400 font-bold text-lg">{selectedProject.impact ? Math.round(selectedProject.impact / selectedProject.cost) : 0} voy/M€</p>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-4">Plus l&apos;efficacité est élevée, meilleur sera le rapport impact/prix.</p>
                          <div className="border-t border-gray-700 pt-4">
                            <p className="text-white font-medium mb-3">Vous devez maintenant choisir <strong>QUAND</strong> réaliser ce projet.</p>
                            <p className="text-gray-400 text-sm mb-4">👇 Trois options s&apos;offrent à vous :</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <button onClick={() => handleMandatSelect('m1')} className={cn("p-4 border rounded-xl transition-all text-left", mockMandat === 'm1' ? "bg-blue-600/30 border-blue-500" : "bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30 hover:border-blue-400")}>
                                <p className="font-bold text-blue-400 text-sm">Mandat 1</p>
                                <p className="text-white font-bold">2026 → 2032</p>
                                <p className="text-gray-400 text-xs mt-1">Projet livré entre 2026-2032</p>
                              </button>
                              <button onClick={() => handleMandatSelect('m2')} className={cn("p-4 border rounded-xl transition-all text-left", mockMandat === 'm2' ? "bg-purple-600/30 border-purple-500" : "bg-purple-600/10 hover:bg-purple-600/20 border-purple-500/30 hover:border-purple-400")}>
                                <p className="font-bold text-purple-400 text-sm">Mandat 2</p>
                                <p className="text-white font-bold">2032 → 2038</p>
                                <p className="text-gray-400 text-xs mt-1">Projet livré entre 2032-2038</p>
                              </button>
                              <button onClick={() => handleMandatSelect('both')} className={cn("p-4 border rounded-xl transition-all text-left", mockMandat === 'both' ? "bg-indigo-600/30 border-indigo-500" : "bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 border-indigo-500/30 hover:border-indigo-400")}>
                                <p className="font-bold text-indigo-400 text-sm">Étalé</p>
                                <p className="text-white font-bold">2026 → 2038</p>
                                <p className="text-gray-400 text-xs mt-1">Coût réparti sur les 2 mandats</p>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ÉTAPE 4: LES JAUGES BUDGET */}
                    {tutorialStep === 3 && selectedProject && (
                      <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium mb-4"><Euro className="w-3 h-3" />Étape 4 sur 7</div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Regardez en haut à gauche : vos budgets se sont mis à jour.</h1>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6">
                          <p className="text-gray-300 mb-4">
                            Vous avez dépensé <strong className="text-white">{selectedProject.cost} M€</strong> sur le {mockMandat === 'm1' ? 'Mandat 1' : mockMandat === 'm2' ? 'Mandat 2' : 'les deux mandats'}. 
                            {mockMandat === 'm1' && <> Il vous reste donc <strong className="text-blue-400">{mockBudget.m1.toLocaleString()} M€</strong> sur le Mandat 1.</>}
                            {mockMandat === 'm2' && <> Il vous reste donc <strong className="text-purple-400">{mockBudget.m2.toLocaleString()} M€</strong> sur le Mandat 2.</>}
                            {mockMandat === 'both' && <> Il vous reste <strong className="text-blue-400">{mockBudget.m1.toLocaleString()} M€</strong> sur M1 et <strong className="text-purple-400">{mockBudget.m2.toLocaleString()} M€</strong> sur M2.</>}
                          </p>
                          <div className="space-y-3 mb-4">
                            <MockBudgetGauge value={mockBudget.m1} label="Mandat 1 (2026-2032)" color="text-blue-400" />
                            <MockBudgetGauge value={mockBudget.m2} label="Mandat 2 (2032-2038)" color="text-purple-400" />
                          </div>
                          <div className="bg-gray-900/50 rounded-lg p-4">
                            <p className="text-white font-medium mb-2">Ces jauges sont votre boussole :</p>
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-gray-300"><strong className="text-green-400">Vert</strong> : Budget respecté</span></p>
                              <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-gray-300"><strong className="text-orange-400">Orange</strong> : Léger déficit acceptable</span></p>
                              <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-gray-300"><strong className="text-red-400">Rouge</strong> : Déficit critique (&gt;100M€)</span></p>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-400 text-center mb-6">L&apos;objectif : <strong className="text-white">rester dans une zone de déficit acceptable.</strong></p>
                        <div className="flex justify-center">
                          <button onClick={nextTutorialStep} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2">Je veillerai sur l&apos;argent public<ArrowRight className="w-5 h-5" /></button>
                        </div>
                      </motion.div>
                    )}

                    {/* ÉTAPE 5: L'IMPACT VOYAGEURS */}
                    {tutorialStep === 4 && selectedProject && (
                      <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium mb-4"><Users className="w-3 h-3" />Étape 5 sur 7</div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Cette jauge violette mesure votre ambition</h1>
                          <p className="text-gray-400">L&apos;impact total sur les usagers.</p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
                          <div className="flex items-center justify-center mb-4">
                            <div className="relative w-32 h-32">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="stroke-gray-700" />
                                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" stroke="#a855f7" strokeLinecap="round" strokeDasharray={`${Math.min(100, ((selectedProject.impact || 0) / 2000) * 100) * 2.51} 251`} />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-purple-400 font-bold text-xl">+{((selectedProject.impact || 0) / 1000).toFixed(0)}k</span>
                                <span className="text-gray-500 text-xs">voy/jour</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300 text-center mb-4">Actuellement : <strong className="text-purple-400">+{(selectedProject.impact || 0).toLocaleString()} voyageurs quotidiens</strong> grâce au {selectedProject.name}.</p>
                          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                            <p className="text-gray-300 text-sm">Plus vous sélectionnez de projets, plus cet impact augmente. Mais attention : <strong className="text-white">plus de projets = plus de coûts.</strong></p>
                            <p className="text-purple-300 text-sm mt-2 font-medium">Votre défi : maximiser l&apos;impact tout en respectant le budget.</p>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <button onClick={nextTutorialStep} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2">Découvrir le financement<ArrowRight className="w-5 h-5" /></button>
                        </div>
                      </motion.div>
                    )}

                    {/* ÉTAPE 6: LE FINANCEMENT */}
                    {tutorialStep === 5 && (
                      <motion.div key="s5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium mb-4"><Scale className="w-3 h-3" />Étape 6 sur 7 — Interactif</div>
                          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Équilibrez votre budget avec les leviers de financement</h1>
                          <p className="text-gray-400">Si vos projets dépassent le budget, vous avez des leviers pour générer des recettes.</p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Impact sur le budget</span>
                            <motion.span key={tutorialBudgetImpact} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={cn("font-bold text-lg", tutorialBudgetImpact >= 0 ? "text-green-400" : "text-red-400")}>{tutorialBudgetImpact >= 0 ? '+' : ''}{tutorialBudgetImpact}M€/mandat</motion.span>
                          </div>
                          <div className="h-4 bg-gray-700 rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center"><div className="w-0.5 h-full bg-white/30" /></div>
                            <motion.div initial={{ width: '50%' }} animate={{ width: `${Math.max(5, Math.min(95, 50 + (tutorialBudgetImpact / 2)))}%` }} className={cn("h-full rounded-full transition-all", tutorialBudgetImpact >= 0 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-red-500 to-orange-500")} />
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-4"><strong className="text-white">3 grandes familles de leviers :</strong></p>
                        <div className="space-y-3 mb-6">
                          <div onClick={() => setTutorialToggles(prev => ({ ...prev, gratuiteJeunes: !prev.gratuiteJeunes }))} className={cn("flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border", tutorialToggles.gratuiteJeunes ? "bg-purple-500/20 border-purple-500" : "bg-gray-800/50 border-gray-700 hover:border-gray-600")}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🎫</span>
                              <div><p className="text-white font-medium text-sm">Gratuité jeunes</p><p className="text-gray-500 text-xs">Politique sociale</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-red-400 text-xs font-bold">-48M€</span>
                              <div className={cn("w-10 h-5 rounded-full transition-all flex items-center p-0.5", tutorialToggles.gratuiteJeunes ? "bg-purple-500 justify-end" : "bg-gray-600 justify-start")}><motion.div layout className="w-4 h-4 bg-white rounded-full" /></div>
                            </div>
                          </div>
                          <div onClick={() => setTutorialToggles(prev => ({ ...prev, metro24h: !prev.metro24h }))} className={cn("flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border", tutorialToggles.metro24h ? "bg-blue-500/20 border-blue-500" : "bg-gray-800/50 border-gray-700 hover:border-gray-600")}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🌙</span>
                              <div><p className="text-white font-medium text-sm">Métro 24h</p><p className="text-gray-500 text-xs">Politique sociale</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-red-400 text-xs font-bold">-24M€</span>
                              <div className={cn("w-10 h-5 rounded-full transition-all flex items-center p-0.5", tutorialToggles.metro24h ? "bg-blue-500 justify-end" : "bg-gray-600 justify-start")}><motion.div layout className="w-4 h-4 bg-white rounded-full" /></div>
                            </div>
                          </div>
                          <div onClick={() => setTutorialToggles(prev => ({ ...prev, tarifHausse: !prev.tarifHausse }))} className={cn("flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border", tutorialToggles.tarifHausse ? "bg-green-500/20 border-green-500" : "bg-gray-800/50 border-gray-700 hover:border-gray-600")}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">💰</span>
                              <div><p className="text-white font-medium text-sm">Hausse tickets +10%</p><p className="text-gray-500 text-xs">Recettes supplémentaires</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 text-xs font-bold">+80M€</span>
                              <div className={cn("w-10 h-5 rounded-full transition-all flex items-center p-0.5", tutorialToggles.tarifHausse ? "bg-green-500 justify-end" : "bg-gray-600 justify-start")}><motion.div layout className="w-4 h-4 bg-white rounded-full" /></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs text-center mb-4">👆 Testez ces leviers pour voir leur impact en temps réel sur vos budgets.</p>
                        <div className="flex justify-center">
                          <button onClick={nextTutorialStep} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2">Valider mon programme<ArrowRight className="w-5 h-5" /></button>
                        </div>
                      </motion.div>
                    )}

                    {/* ÉTAPE 7: PRÊT(E) À GOUVERNER */}
                    {tutorialStep === 6 && (
                      <motion.div key="s6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4"><CheckCircle2 className="w-3 h-3" />Félicitations !</div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Félicitations, Président(e).</h1>
                        <p className="text-gray-300 text-lg max-w-lg mx-auto mb-6">Vous maîtrisez maintenant :</p>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-8 text-left max-w-md mx-auto">
                          <ul className="space-y-3 text-gray-300">
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /><span>La sélection de projets sur la carte</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /><span>La répartition budgétaire sur 2 mandats</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Le suivi de l&apos;impact voyageurs</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /><span>Les leviers de financement</span></li>
                          </ul>
                        </div>
                        <p className="text-gray-400 mb-6">Il est temps de construire votre propre programme.<br/><strong className="text-white">Bonne chance. La métropole compte sur vous.</strong></p>
                        <motion.button onClick={handleStart} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-bold text-xl shadow-lg shadow-emerald-500/20 flex items-center gap-3 mx-auto">
                          <Play className="w-6 h-6" />Entrer dans la simulation
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

      {/* Modale explicative LFI */}
      <AnimatePresence>
        {showLFIModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowLFIModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Programme LFI - Vision et réalité</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-4 border border-purple-200 dark:border-purple-500/20">
                      <p className="text-gray-900 dark:text-white text-sm font-semibold mb-2">🎯 Vision politique de long terme</p>
                      <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                        <strong className="text-purple-600 dark:text-purple-400">La France Insoumise</strong> affiche une vision de long terme : <strong>aller vers la gratuité totale des transports</strong>.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
                      <p className="text-gray-900 dark:text-white text-sm font-semibold mb-2">⚠️ Contraintes actuelles</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed mb-2">
                        En l&apos;état actuel (cadre légal + ressources d&apos;une métropole), <strong className="text-gray-900 dark:text-white">une gratuité totale n&apos;est pas finançable</strong> sans leviers supplémentaires, notamment nationaux.
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                        LFI souhaite donc une <strong className="text-gray-900 dark:text-white">intervention de l&apos;État ou une réforme des règles de financement</strong> (par exemple sur le versement mobilité ou d&apos;autres mécanismes).
                      </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-4 border border-green-200 dark:border-green-500/20">
                      <p className="text-gray-900 dark:text-white text-sm font-semibold mb-2">✅ Programme présenté ici</p>
                      <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed mb-2">
                        Ce scénario est <strong className="text-gray-900 dark:text-white">applicable dans le cadre actuel de la loi</strong>, avec uniquement la <strong>gratuité pour les moins de 25 ans</strong>.
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed italic">
                        Programme établi en concertation avec l&apos;équipe de campagne LFI.
                      </p>
                    </div>
                    
                    <p className="text-orange-600 dark:text-orange-300 text-xs font-medium leading-relaxed">
                      💡 <strong>Important :</strong> L&apos;objectif politique revendiqué reste la gratuité totale, mais il dépend de décisions hors compétence de la métropole.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLFIModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowLFIModal(false)
                    applyPartyPreselection('lfi')
                    handleStart()
                  }}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  Charger le programme
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
