'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS } from '@/lib/data'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  Sparkles,
  Calendar,
  Target,
  Medal,
  TramFront,
  Bus,
  Zap,
  Euro,
  Leaf,
  Building2,
  ArrowRight,
  Star
} from 'lucide-react'

// Simple bar chart component
function BarChart({ data, maxValue, color }: { data: { label: string; value: number }[]; maxValue: number; color: string }) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * i }}
        >
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">{item.label}</span>
            <span className="text-white font-bold">{formatNumber(item.value)}</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((item.value / maxValue) * 100, 100)}%` }}
              transition={{ delay: 0.2 + 0.1 * i, duration: 0.8, ease: 'easeOut' }}
              className={cn("h-full rounded-full", color)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Donut chart component
function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0)
  let currentAngle = 0
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {segments.map((segment, i) => {
          const percentage = (segment.value / total) * 100
          const dashArray = `${percentage} ${100 - percentage}`
          const dashOffset = -currentAngle
          currentAngle += percentage
          
          return (
            <motion.circle
              key={i}
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              strokeWidth="3"
              className={segment.color}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            />
          )
        })}
      </svg>
    </div>
  )
}

export function ResultsScreen() {
  const { 
    getBudgetState, 
    getScore, 
    getObjectives, 
    getAchievements, 
    projectSelections,
    financingLevers,
    reset,
    setPhase
  } = useGameStore()

  const budget = getBudgetState()
  const score = getScore()
  const objectives = getObjectives()
  const achievements = getAchievements()

  const completedObjectives = objectives.filter(o => o.completed).length
  const unlockedAchievements = achievements.filter(a => a.unlocked).length

  const selectedProjects = projectSelections.map(selection => {
    const project = PROJECTS.find(p => p.id === selection.projectId)!
    return { ...selection, project }
  })

  // Calculate statistics
  const totalInvestment = selectedProjects.reduce((acc, s) => acc + s.project.cost, 0)
  const metroProjects = selectedProjects.filter(s => s.project.name.includes('Métro') || s.project.name.includes('Ligne') || s.project.name.includes('Extension'))
  const tramProjects = selectedProjects.filter(s => s.project.name.includes('T') && !s.project.name.includes('Métro'))
  const busProjects = selectedProjects.filter(s => s.project.name.includes('Bus') || s.project.name.includes('BHNS'))
  
  const m1Projects = selectedProjects.filter(s => s.period === 'M1')
  const m2Projects = selectedProjects.filter(s => s.period === 'M2')
  const spreadProjects = selectedProjects.filter(s => s.period === 'M1+M2')

  // Personalized message based on choices
  const getPersonalizedMessage = () => {
    const hasGratuite = financingLevers?.gratuiteTotale
    const hasGratuiteConditionnee = financingLevers?.gratuiteConditionnee
    const hasHighImpact = budget.totalImpact > 500000
    const isBalanced = budget.m1 >= 0 && budget.m2 >= 0
    const hasMetro = metroProjects.length >= 3
    
    if (hasGratuite && hasHighImpact) {
      return {
        title: "Visionnaire Social ! 🌟",
        message: "Vous avez fait le pari audacieux de la gratuité totale combinée à des investissements massifs. Un choix politique fort qui transformera la mobilité lyonnaise !",
        color: "from-purple-500 to-pink-500"
      }
    }
    if (hasGratuiteConditionnee && isBalanced) {
      return {
        title: "Équilibre Social 🤝",
        message: "La gratuité conditionnée avec un budget équilibré : vous conciliez justice sociale et responsabilité financière. La proposition Aulas en action !",
        color: "from-blue-500 to-cyan-500"
      }
    }
    if (hasMetro && hasHighImpact) {
      return {
        title: "Bâtisseur de Métro ! 🚇",
        message: `Avec ${metroProjects.length} projets métro et +${formatNumber(budget.totalImpact)} voyageurs/jour, vous misez sur le transport lourd. Lyon devient une vraie métropole de métro !`,
        color: "from-blue-600 to-indigo-600"
      }
    }
    if (isBalanced && selectedProjects.length > 15) {
      return {
        title: "Gestionnaire Exemplaire ! 📊",
        message: "Budget équilibré avec un programme ambitieux de plus de 15 projets. Vous prouvez qu'on peut être ambitieux ET responsable !",
        color: "from-green-500 to-emerald-500"
      }
    }
    if (!isBalanced && selectedProjects.length > 10) {
      return {
        title: "Ambitieux Assumé ! 🚀",
        message: "Vous avez choisi d'investir massivement, quitte à creuser un peu la dette. Un pari sur l'avenir de la mobilité lyonnaise !",
        color: "from-orange-500 to-red-500"
      }
    }
    if (selectedProjects.length < 5) {
      return {
        title: "Approche Prudente 🎯",
        message: "Quelques projets ciblés plutôt qu'un programme dispersé. Une stratégie de concentration des moyens sur l'essentiel.",
        color: "from-gray-500 to-gray-600"
      }
    }
    return {
      title: "Programme Équilibré ✅",
      message: `${selectedProjects.length} projets sélectionnés pour un impact de +${formatNumber(budget.totalImpact)} voyageurs/jour. Un plan cohérent pour Lyon 2040 !`,
      color: "from-green-500 to-teal-500"
    }
  }

  const personalizedMsg = getPersonalizedMessage()

  const getGrade = () => {
    if (score >= 2000) return { grade: 'S', color: 'from-yellow-400 to-orange-500', bg: 'bg-gradient-to-br from-yellow-400 to-orange-500' }
    if (score >= 1500) return { grade: 'A', color: 'from-green-400 to-emerald-500', bg: 'bg-gradient-to-br from-green-400 to-emerald-500' }
    if (score >= 1000) return { grade: 'B', color: 'from-blue-400 to-cyan-500', bg: 'bg-gradient-to-br from-blue-400 to-cyan-500' }
    if (score >= 500) return { grade: 'C', color: 'from-purple-400 to-pink-500', bg: 'bg-gradient-to-br from-purple-400 to-pink-500' }
    return { grade: 'D', color: 'from-gray-400 to-gray-500', bg: 'bg-gradient-to-br from-gray-400 to-gray-500' }
  }

  const grade = getGrade()

  const handleRestart = () => {
    reset()
    setPhase('playing')
  }

  const handleNewSimulation = () => {
    reset()
    setPhase('intro')
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black" />
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section with Grade */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className={cn(
              "w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl relative",
              grade.bg
            )}>
              <span className="text-5xl font-black text-white">{grade.grade}</span>
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{ boxShadow: ['0 0 20px rgba(255,255,255,0.3)', '0 0 40px rgba(255,255,255,0.1)', '0 0 20px rgba(255,255,255,0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black text-white mb-2"
          >
            {formatNumber(score)} points
          </motion.p>
        </motion.div>

        {/* Personalized Message Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "rounded-3xl p-6 mb-8 text-center bg-gradient-to-r",
            personalizedMsg.color
          )}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{personalizedMsg.title}</h2>
          <p className="text-white/90 text-lg max-w-3xl mx-auto">{personalizedMsg.message}</p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, value: formatNumber(budget.totalImpact), label: "Voyageurs/jour", color: "from-purple-500 to-pink-600", prefix: "+" },
            { icon: Euro, value: formatCurrency(totalInvestment), label: "Investissement", color: "from-yellow-500 to-orange-600" },
            { icon: Building2, value: selectedProjects.length.toString(), label: "Projets", color: "from-blue-500 to-cyan-600" },
            { icon: Target, value: `${completedObjectives}/${objectives.length}`, label: "Objectifs", color: "from-green-500 to-emerald-600" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-5 border border-gray-800"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br", stat.color)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-black text-white">{stat.prefix || ''}{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Investment by Type */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <TramFront className="w-5 h-5 text-blue-400" />
              Répartition par type
            </h3>
            <div className="flex items-center gap-6">
              <DonutChart
                segments={[
                  { value: metroProjects.length || 0.1, color: "stroke-blue-500", label: "Métro" },
                  { value: tramProjects.length || 0.1, color: "stroke-green-500", label: "Tram" },
                  { value: busProjects.length || 0.1, color: "stroke-orange-500", label: "Bus" },
                  { value: Math.max(0, selectedProjects.length - metroProjects.length - tramProjects.length - busProjects.length) || 0.1, color: "stroke-purple-500", label: "Autre" },
                ]}
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-400 text-sm">Métro: {metroProjects.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-400 text-sm">Tram: {tramProjects.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-400 text-sm">Bus/BHNS: {busProjects.length}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              Planning des projets
            </h3>
            <BarChart
              data={[
                { label: "Mandat 1 (2026-32)", value: m1Projects.length },
                { label: "Mandat 2 (2032-38)", value: m2Projects.length },
                { label: "Étalé (M1+M2)", value: spreadProjects.length },
              ]}
              maxValue={Math.max(m1Projects.length, m2Projects.length, spreadProjects.length, 1)}
              color="bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </motion.div>
        </div>

        {/* Budget Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {[
            { title: "Mandat 1", subtitle: "2026-2032", value: budget.m1 },
            { title: "Mandat 2", subtitle: "2032-2038", value: budget.m2 },
          ].map((mandat, i) => (
            <div
              key={mandat.title}
              className={cn(
                "rounded-2xl p-5 border flex items-center justify-between",
                mandat.value >= 0 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-red-500/10 border-red-500/30"
              )}
            >
              <div className="flex items-center gap-4">
                {mandat.value >= 0 ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500" />
                )}
                <div>
                  <p className="text-white font-bold">{mandat.title}</p>
                  <p className="text-gray-500 text-sm">{mandat.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-2xl font-black",
                  mandat.value >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatCurrency(mandat.value)}
                </p>
                <p className={cn(
                  "text-sm",
                  mandat.value >= 0 ? "text-green-400/70" : "text-red-400/70"
                )}>
                  {mandat.value >= 0 ? 'Excédent' : 'Déficit'}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Top 5 Impact Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 mb-8"
        >
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Top 5 projets à plus fort impact
          </h3>
          <div className="space-y-3">
            {selectedProjects
              .filter(s => s.project.impact)
              .sort((a, b) => (b.project.impact || 0) - (a.project.impact || 0))
              .slice(0, 5)
              .map((item, i) => (
                <motion.div
                  key={item.project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-gray-600">#{i + 1}</span>
                    <div>
                      <p className="text-white font-medium">{item.project.name}</p>
                      <p className="text-gray-500 text-xs">{item.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-bold">+{formatNumber(item.project.impact || 0)}</p>
                    <p className="text-gray-500 text-xs">voy/jour</p>
                  </div>
                </motion.div>
              ))}
          </div>
          {selectedProjects.filter(s => s.project.impact).length === 0 && (
            <p className="text-gray-500 text-center py-4">Aucun projet avec impact sélectionné</p>
          )}
        </motion.div>

        {/* Financing Policies */}
        {(financingLevers?.gratuiteTotale || financingLevers?.gratuiteConditionnee || financingLevers?.gratuiteJeunesAbonnes || financingLevers?.metro24hWeekend) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/30 mb-8"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-400" />
              Politiques publiques activées
            </h3>
            <div className="flex flex-wrap gap-3">
              {financingLevers?.gratuiteTotale && (
                <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 font-medium text-sm">🎫 Gratuité Totale</span>
              )}
              {financingLevers?.gratuiteConditionnee && (
                <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 font-medium text-sm">🎟️ Gratuité Conditionnée (Aulas)</span>
              )}
              {financingLevers?.gratuiteJeunesAbonnes && (
                <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 font-medium text-sm">👦 Gratuité 11-18 ans</span>
              )}
              {financingLevers?.metro24hWeekend && (
                <span className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 font-medium text-sm">🌙 Métro 24h/24 weekend</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        {achievements.filter(a => a.unlocked).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 mb-8"
          >
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Succès débloqués
            </h3>
            <div className="flex flex-wrap gap-3">
              {achievements.filter(a => a.unlocked).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
                >
                  <span className="text-xl">{achievement.icon}</span>
                  <span className="text-yellow-400 font-medium text-sm">{achievement.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={handleRestart}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white border-0 px-8"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Modifier ma simulation
          </Button>
          
          <Button
            size="lg"
            onClick={handleNewSimulation}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white border-0 px-8"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Nouvelle simulation
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Partager
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
