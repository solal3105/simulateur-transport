'use client'

import { motion } from 'framer-motion'
import { Project, MandatPeriod } from '@/lib/types'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { 
  Users, 
  TramFront, 
  Bus, 
  Ship,
  Zap,
  Wrench,
  Info,
  Lock
} from 'lucide-react'
import { useState } from 'react'

interface GameProjectCardProps {
  project: Project
  selectedPeriod: MandatPeriod
  onSelectPeriod: (period: MandatPeriod) => void
  index: number
}

function getProjectIcon(name: string) {
  if (name.includes('Métro') || name.includes('Ligne')) return TramFront
  if (name.includes('Tram') || name.includes('T')) return TramFront
  if (name.includes('BHNS') || name.includes('Bus')) return Bus
  if (name.includes('Navette')) return Ship
  if (name.includes('Électrification')) return Zap
  if (name.includes('Modernisation') || name.includes('Entretien')) return Wrench
  return TramFront
}

function getProjectType(name: string): { label: string; color: string } {
  if (name.includes('Métro') || name.includes('Extension Ligne')) {
    return { label: 'MÉTRO', color: 'from-blue-500 to-blue-600' }
  }
  if (name.includes('Tram') || name.match(/T\d+/)) {
    return { label: 'TRAMWAY', color: 'from-green-500 to-emerald-600' }
  }
  if (name.includes('BHNS') || name.includes('Bus')) {
    return { label: 'BUS', color: 'from-orange-500 to-red-500' }
  }
  if (name.includes('Modernisation')) {
    return { label: 'MODERNISATION', color: 'from-purple-500 to-pink-500' }
  }
  if (name.includes('Navette')) {
    return { label: 'FLUVIAL', color: 'from-cyan-500 to-blue-500' }
  }
  return { label: 'INFRASTRUCTURE', color: 'from-gray-500 to-gray-600' }
}

export function GameProjectCard({ project, selectedPeriod, onSelectPeriod, index }: GameProjectCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  const Icon = getProjectIcon(project.name)
  const type = getProjectType(project.name)
  const isLocked = project.mandatOnly === 'M1+M2'
  const isSelected = selectedPeriod !== null

  const periods: { value: MandatPeriod; label: string }[] = isLocked 
    ? [{ value: 'M1+M2', label: 'Étalé' }]
    : [
        { value: 'M1', label: 'Mandat 1' },
        { value: 'M2', label: 'Mandat 2' },
        { value: 'M1+M2', label: 'Étalé' },
      ]

  const efficiency = project.impact ? Math.round(project.impact / project.cost) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative group",
        isSelected && "z-10"
      )}
    >
      <div className={cn(
        "relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 overflow-hidden",
        isSelected 
          ? "border-green-500 shadow-lg shadow-green-500/20" 
          : "border-gray-700/50 hover:border-gray-600"
      )}>
        {/* Glow effect when selected */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        {/* Type badge */}
        <div className={cn(
          "absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-xl bg-gradient-to-r",
          type.color
        )}>
          {type.label}
        </div>

        {/* Locked indicator */}
        {isLocked && (
          <div className="absolute top-0 left-0 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-medium rounded-br-xl flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Étalé uniquement
          </div>
        )}

        <div className="p-4 pt-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
              type.color
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm leading-tight mb-1 pr-2">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {formatCurrency(project.cost)}
                </span>
              </div>
            </div>
          </div>

          {/* Impact & Efficiency */}
          {project.impact ? (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-900/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Impact</span>
                </div>
                <p className="text-white font-bold">
                  +{formatNumber(project.impact)}
                </p>
                <p className="text-gray-500 text-xs">voyageurs/jour</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-green-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-medium">Efficacité</span>
                </div>
                <p className="text-white font-bold">
                  {efficiency}
                </p>
                <p className="text-gray-500 text-xs">voy/M€</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-xl p-3 mb-4">
              <p className="text-gray-400 text-sm text-center">
                Infrastructure essentielle
              </p>
            </div>
          )}

          {/* Period selection */}
          <div className="space-y-2">
            <div className="flex gap-2">
              {periods.map((period) => {
                const periodLabel = period.value === 'M1' ? '2026-2032' : 
                                   period.value === 'M2' ? '2032-2038' : 
                                   '2026-2038'
                return (
                  <motion.button
                    key={period.value}
                    onClick={() => onSelectPeriod(selectedPeriod === period.value ? null : period.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all duration-200",
                      selectedPeriod === period.value
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
                    )}
                  >
                    <span className="block">{period.label}</span>
                    <span className="block text-xs opacity-70 font-normal">
                      {periodLabel}
                    </span>
                    {period.value === 'M1+M2' && !isLocked && (
                      <span className="block text-xs opacity-70 font-normal">
                        ÷2/mandat
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
            {selectedPeriod && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectPeriod(null)
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all"
              >
                ✕ Retirer ce projet
              </motion.button>
            )}
          </div>
        </div>

        {/* Info tooltip trigger */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Info tooltip */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-xl z-20"
        >
          {project.description && (
            <p className="text-white text-sm mb-3 font-medium border-b border-gray-700 pb-3">
              {project.description}
            </p>
          )}
          <p className="text-gray-300 text-sm">
            {project.impact ? (
              <>
                Ce projet permettra d&apos;accueillir <strong className="text-white">{formatNumber(project.impact)} voyageurs supplémentaires par jour</strong>.
                {efficiency > 100 && " C&apos;est un projet très efficient !"}
                {efficiency < 50 && " Le coût par voyageur est élevé, mais l&apos;impact peut être stratégique."}
              </>
            ) : (
              "Ce projet est une infrastructure essentielle pour le bon fonctionnement du réseau."
            )}
          </p>
          <button
            onClick={() => setShowInfo(false)}
            className="mt-2 text-xs text-gray-500 hover:text-white"
          >
            Fermer
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
