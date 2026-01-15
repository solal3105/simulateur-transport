'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Project, MandatPeriod } from '@/lib/types'
import { PROJECT_GEO_DATA, PROJECT_TYPE_COLORS } from '@/lib/projectsGeo'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { useGameStore } from '@/lib/gameStore'
import { 
  X, 
  Users, 
  Zap, 
  TramFront, 
  Bus, 
  Ship, 
  MapPin,
  Euro,
  Check,
  Calendar,
  AlertTriangle
} from 'lucide-react'

interface ProjectDetailPanelProps {
  project: Project
  selectedPeriod: MandatPeriod
  onSelectPeriod: (period: MandatPeriod) => void
  onClose: () => void
}

function getProjectIcon(type: string) {
  switch (type) {
    case 'metro': return TramFront
    case 'tram': return TramFront
    case 'bus': return Bus
    case 'other': return Ship
    default: return MapPin
  }
}

function getProjectTypeLabel(type: string): string {
  switch (type) {
    case 'metro': return 'Métro'
    case 'tram': return 'Tramway'
    case 'bus': return 'Bus / BHNS'
    case 'other': return 'Autre'
    default: return 'Infrastructure'
  }
}

export function ProjectDetailPanel({ 
  project, 
  selectedPeriod, 
  onSelectPeriod, 
  onClose 
}: ProjectDetailPanelProps) {
  const { projectSelections } = useGameStore()
  const [showDependencyWarning, setShowDependencyWarning] = useState(false)
  const geoData = PROJECT_GEO_DATA[project.id]
  const projectType = geoData?.type || 'other'
  const Icon = getProjectIcon(projectType)
  const typeColor = PROJECT_TYPE_COLORS[projectType]
  const efficiency = project.impact ? Math.round(project.impact / project.cost) : 0
  const isLocked = project.mandatOnly === 'M1+M2'

  // Check if metro-e-bellecour is selected (required for metro-e-part-dieu)
  const isBellecourSelected = projectSelections.some(s => s.projectId === 'metro-e-bellecour')
  const requiresBellecour = project.id === 'metro-e-part-dieu'
  const canSelect = !requiresBellecour || isBellecourSelected

  const handlePeriodSelect = (period: MandatPeriod) => {
    if (requiresBellecour && !isBellecourSelected && period !== null) {
      setShowDependencyWarning(true)
      return
    }
    onSelectPeriod(period)
  }

  const periods: { value: MandatPeriod; label: string; sublabel: string }[] = isLocked 
    ? [{ value: 'M1+M2', label: 'M1+M2', sublabel: '2026-2038' }]
    : [
        { value: 'M1', label: 'M1', sublabel: '2026-32' },
        { value: 'M2', label: 'M2', sublabel: '2032-38' },
        { value: 'M1+M2', label: 'Étalé', sublabel: '÷2' },
      ]

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg max-h-[90vh] pointer-events-auto"
        >
          <div 
            className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: `0 25px 80px -20px ${typeColor}40` }}
          >
          {/* Header */}
          <div 
            className="relative p-5"
            style={{ background: `linear-gradient(135deg, ${typeColor}25, transparent)` }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${typeColor}, ${typeColor}80)` }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div 
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-1"
                  style={{ background: `${typeColor}30`, color: typeColor }}
                >
                  {getProjectTypeLabel(projectType)}
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {project.name}
                </h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 pt-0 space-y-4">
            {/* Description */}
            {project.description && (
              <p className="text-gray-400 text-sm leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex gap-3">
              {/* Cost */}
              <div className="flex-1 bg-gray-800/50 rounded-xl p-3 text-center">
                <Euro className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {formatCurrency(project.cost)}
                </p>
                <p className="text-xs text-gray-500">Coût</p>
              </div>

              {/* Impact */}
              {project.impact && (
                <div className="flex-1 bg-gray-800/50 rounded-xl p-3 text-center">
                  <Users className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">
                    +{formatNumber(project.impact)}
                  </p>
                  <p className="text-xs text-gray-500">voy/jour</p>
                </div>
              )}

              {/* Efficiency */}
              {project.impact && (
                <div className="flex-1 bg-gray-800/50 rounded-xl p-3 text-center">
                  <Zap className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{efficiency}</p>
                  <p className="text-xs text-gray-500">voy/M€</p>
                </div>
              )}
            </div>

            {/* Period Selection - Horizontal */}
            <div className="space-y-2">
              <p className="text-gray-400 text-xs font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Quand réaliser ce projet ?
              </p>
              
              <div className="flex gap-2">
                {periods.map((period) => {
                  const isSelected = selectedPeriod === period.value
                  return (
                    <motion.button
                      key={period.value}
                      onClick={() => handlePeriodSelect(isSelected ? null : period.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex-1 py-3 px-3 rounded-xl font-semibold text-sm transition-all duration-200 relative",
                        isSelected 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
                      )}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 absolute top-2 right-2" />
                      )}
                      <span className="block text-base">{period.label}</span>
                      <span className={cn(
                        "block text-xs",
                        isSelected ? "text-white/70" : "text-gray-500"
                      )}>
                        {period.sublabel}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {selectedPeriod ? (
                <>
                  <button
                    onClick={() => onSelectPeriod(null)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all"
                  >
                    Retirer
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30 transition-all"
                  >
                    ✓ Confirmer
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl text-sm font-medium text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 transition-all"
                >
                  Fermer
                </button>
              )}
            </div>

            {/* Locked Notice */}
            {isLocked && (
              <p className="text-yellow-400/70 text-xs text-center">
                ⚠️ Projet obligatoirement étalé sur les deux mandats
              </p>
            )}

            {/* Dependency Notice */}
            {requiresBellecour && !isBellecourSelected && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-orange-400 text-xs">
                  <strong>Prérequis :</strong> Vous devez d'abord sélectionner le Métro E Bellecour (section centrale)
                </p>
              </div>
            )}
          </div>
        </div>
        </motion.div>
      </div>

      {/* Dependency Warning Modal */}
      <AnimatePresence>
        {showDependencyWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowDependencyWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl border border-orange-500/50 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Prérequis manquant</h3>
                  <p className="text-orange-400 text-sm">Dépendance de projet</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-300">
                  <strong className="text-white">Extension Métro E Part-Dieu</strong> est une extension de la ligne E.
                </p>
                <p className="text-gray-300">
                  Vous devez d'abord sélectionner <strong className="text-orange-400">Métro E Bellecour</strong> (la section centrale de la ligne) avant de pouvoir ajouter cette extension.
                </p>
                <p className="text-gray-400 text-sm">
                  💡 La ligne E se construit par étapes : d'abord la section centrale (Bellecour), puis les extensions peuvent être ajoutées.
                </p>
              </div>
              <button
                onClick={() => setShowDependencyWarning(false)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:opacity-90 transition-opacity"
              >
                Compris
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
