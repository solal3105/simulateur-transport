'use client'

import { useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS } from '@/lib/data'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import {
  Users,
  RotateCcw,
  Download,
  Train,
  Wallet,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  TramFront,
  Bus,
  Target,
  Euro,
  Building2
} from 'lucide-react'
import dynamic from 'next/dynamic'
import html2canvas from 'html2canvas'

const ResultsMap = dynamic(() => import('@/components/map/ResultsMap'), { ssr: false })

const MAX_THEORETICAL_IMPACT = 860000

// Bar chart component
function BarChart({ data, maxValue, colorClass }: { data: { label: string; value: number }[]; maxValue: number; colorClass: string }) {
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
            <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
            <span className="text-gray-900 dark:text-white font-bold">{item.value}</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((item.value / maxValue) * 100, 100)}%` }}
              transition={{ delay: 0.2 + 0.1 * i, duration: 0.8, ease: 'easeOut' }}
              className={cn("h-full rounded-full", colorClass)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Donut chart component
function DonutChart({ segments, size = 100 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0)
  if (total === 0) return null
  let currentAngle = 0
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {segments.map((segment, i) => {
          if (segment.value === 0) return null
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
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const { 
    getBudgetState, 
    projectSelections,
    financingLevers,
    getObjectives,
    reset,
    setPhase
  } = useGameStore()

  const budget = getBudgetState()
  const objectives = getObjectives()

  const selectedProjects = projectSelections.map(selection => {
    const project = PROJECTS.find(p => p.id === selection.projectId)!
    return { ...selection, project }
  })

  const totalInvestment = selectedProjects.reduce((acc, s) => acc + s.project.cost, 0)
  const impactPercentage = Math.min((budget.totalImpact / MAX_THEORETICAL_IMPACT) * 100, 100)

  // Calculate stats
  const metroProjects = selectedProjects.filter(s => 
    s.project.name.toLowerCase().includes('métro') || 
    s.project.name.toLowerCase().includes('ligne') || 
    s.project.name.toLowerCase().includes('extension') ||
    s.project.name.toLowerCase().includes('modernisation')
  )
  const tramProjects = selectedProjects.filter(s => 
    s.project.name.toLowerCase().includes('tram') || 
    s.project.name.toLowerCase().includes('t8') ||
    s.project.name.toLowerCase().includes('t3') ||
    s.project.name.toLowerCase().includes('t9') ||
    s.project.name.toLowerCase().includes('t10') ||
    s.project.name.toLowerCase().includes('t12') ||
    s.project.name.toLowerCase().includes('teol')
  )
  const busProjects = selectedProjects.filter(s => 
    s.project.name.toLowerCase().includes('bus') || 
    s.project.name.toLowerCase().includes('bhns')
  )
  const otherProjects = selectedProjects.filter(s => 
    !metroProjects.includes(s) && !tramProjects.includes(s) && !busProjects.includes(s)
  )

  const m1Projects = selectedProjects.filter(s => s.period === 'M1')
  const m2Projects = selectedProjects.filter(s => s.period === 'M2')
  const spreadProjects = selectedProjects.filter(s => s.period === 'M1+M2')

  const completedObjectives = objectives.filter(o => o.completed).length

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    setIsDownloading(true)
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
      
      const link = document.createElement('a')
      link.download = `tcl-2040-simulation-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [])

  const handleRestart = () => {
    reset()
    setPhase('playing')
  }

  if (selectedProjects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-900 dark:text-white text-xl mb-4">Aucun projet sélectionné</p>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold"
          >
            Retour au simulateur
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Modifier</span>
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">{isDownloading ? 'Génération...' : 'Télécharger'}</span>
          </button>
        </motion.div>

        {/* Main card (screenshot target) */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 md:p-8">
            {/* Logo + Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-2xl">🚇</span>
              </div>
              <div>
                <h1 className="text-gray-900 dark:text-white font-bold text-2xl">TCL 2040</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Résultats de ma simulation</p>
              </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, value: `+${formatNumber(budget.totalImpact)}`, label: "Voyageurs/jour", color: "from-purple-500 to-pink-600" },
                { icon: Euro, value: formatCurrency(totalInvestment), label: "Investissement", color: "from-yellow-500 to-orange-600" },
                { icon: Building2, value: selectedProjects.length.toString(), label: "Projets", color: "from-blue-500 to-cyan-600" },
                { icon: Target, value: `${completedObjectives}/${objectives.length}`, label: "Objectifs", color: "from-green-500 to-emerald-600" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br", stat.color)}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Impact gauge */}
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Impact vs Maximum Théorique</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(impactPercentage)}%</span>
              </div>
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${impactPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full"
                />
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                Max théorique avec 4 Md€ : {formatNumber(MAX_THEORETICAL_IMPACT)} voy/jour
              </p>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Type Distribution */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                  <TramFront className="w-5 h-5 text-blue-500" />
                  Répartition par type
                </h3>
                <div className="flex items-center gap-6">
                  <DonutChart
                    segments={[
                      { value: metroProjects.length, color: "stroke-blue-500", label: "Métro" },
                      { value: tramProjects.length, color: "stroke-green-500", label: "Tram" },
                      { value: busProjects.length, color: "stroke-orange-500", label: "Bus" },
                      { value: otherProjects.length, color: "stroke-purple-500", label: "Autre" },
                    ]}
                  />
                  <div className="flex-1 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">Métro/Ligne: {metroProjects.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">Tram: {tramProjects.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-gray-600 dark:text-gray-400">Bus/BHNS: {busProjects.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">Autre: {otherProjects.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Distribution */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Planning
                </h3>
                <BarChart
                  data={[
                    { label: "Mandat 1 (2026-32)", value: m1Projects.length },
                    { label: "Mandat 2 (2032-38)", value: m2Projects.length },
                    { label: "Étalé (M1+M2)", value: spreadProjects.length },
                  ]}
                  maxValue={Math.max(m1Projects.length, m2Projects.length, spreadProjects.length, 1)}
                  colorClass="bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>

            {/* Budget Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { title: "Mandat 1", subtitle: "2026-2032", value: budget.m1 },
                { title: "Mandat 2", subtitle: "2032-2038", value: budget.m2 },
              ].map((mandat) => (
                <div
                  key={mandat.title}
                  className={cn(
                    "rounded-2xl p-4 border flex items-center justify-between",
                    mandat.value >= 0 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {mandat.value >= 0 ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold">{mandat.title}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{mandat.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xl font-black",
                      mandat.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatCurrency(mandat.value)}
                    </p>
                    <p className={cn(
                      "text-xs",
                      mandat.value >= 0 ? "text-green-600/70 dark:text-green-400/70" : "text-red-600/70 dark:text-red-400/70"
                    )}>
                      {mandat.value >= 0 ? 'Excédent' : 'Déficit'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Objectives */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 mb-8">
              <h3 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Objectifs ({completedObjectives}/{objectives.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl",
                      obj.completed 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    {obj.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        obj.completed ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                      )}>
                        {obj.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {obj.current}/{obj.target}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden mb-6 border border-gray-200 dark:border-gray-600">
              <ResultsMap projectIds={selectedProjects.map(s => s.project.id)} />
            </div>

            {/* Projects list */}
            <div className="space-y-2">
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Projets sélectionnés ({selectedProjects.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedProjects.map(({ project, period }) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/30 rounded-lg px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{project.name}</p>
                      <p className="text-gray-500 text-xs">
                        {period === 'M1' ? '2026-2032' : period === 'M2' ? '2032-2038' : '2026-2038'}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-green-600 dark:text-green-400 text-sm font-bold">{formatCurrency(project.cost)}</p>
                      {project.impact && (
                        <p className="text-gray-500 text-xs">+{formatNumber(project.impact)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-gray-400 dark:text-gray-500 text-xs">simulateur-transport-tcl.netlify.app</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">TCL 2040 • Métropole de Lyon</p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all border border-gray-200 dark:border-gray-700"
          >
            <RotateCcw className="w-5 h-5" />
            Modifier ma simulation
          </button>
        </motion.div>
      </div>
    </div>
  )
}
