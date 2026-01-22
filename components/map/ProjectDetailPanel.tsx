'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Project, MandatPeriod, UpgradeOption } from '@/lib/types'
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
  isUpgraded?: boolean
  onToggleUpgrade?: (upgraded: boolean) => void
  selectedUpgradeOptionId?: string
  onSelectUpgradeOption?: (optionId: string) => void
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
  onClose,
  isUpgraded = false,
  onToggleUpgrade,
  selectedUpgradeOptionId,
  onSelectUpgradeOption
}: ProjectDetailPanelProps) {
  const { projectSelections } = useGameStore()
  const [showDependencyWarning, setShowDependencyWarning] = useState(false)
  
  // Local state for upgrade option selection (for new projects not yet in store)
  const hasUpgradeOptions = project.upgradeOptions && project.upgradeOptions.length > 0
  const [localUpgradeOptionId, setLocalUpgradeOptionId] = useState<string | undefined>(
    selectedUpgradeOptionId || (hasUpgradeOptions ? project.upgradeOptions?.[0]?.id : undefined)
  )
  
  const geoData = PROJECT_GEO_DATA[project.id]
  const projectType = hasUpgradeOptions ? 'other' : (geoData?.type || 'other')
  const Icon = getProjectIcon(projectType)
  const typeColor = PROJECT_TYPE_COLORS[projectType]
  
  // Use local state for upgrade option selection
  const effectiveUpgradeOptionId = localUpgradeOptionId || selectedUpgradeOptionId
  
  // For projects with upgradeOptions, use the selected option's cost/impact
  const selectedOption = hasUpgradeOptions && effectiveUpgradeOptionId 
    ? project.upgradeOptions?.find(o => o.id === effectiveUpgradeOptionId) 
    : (hasUpgradeOptions ? project.upgradeOptions?.[0] : null)
  
  const totalCost = hasUpgradeOptions && selectedOption 
    ? selectedOption.cost 
    : project.cost + (isUpgraded && project.upgrade ? project.upgrade.additionalCost : 0)
  const totalImpact = hasUpgradeOptions && selectedOption 
    ? selectedOption.impact 
    : (project.impact || 0) + (isUpgraded && project.upgrade ? (project.upgrade.additionalImpact || 0) : 0)
  const efficiency = totalImpact ? Math.round(totalImpact / totalCost) : 0
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
    ? [{ value: 'M1+M2', label: 'Étalé', sublabel: '2026-2038' }]
    : [
        { value: 'M1', label: 'Mandat 1', sublabel: '2026-32' },
        { value: 'M2', label: 'Mandat 2', sublabel: '2032-38' },
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] pointer-events-auto"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl border-2 border-b-0 sm:border-b-2 border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: `0 25px 80px -20px ${typeColor}40` }}
          >
          {/* Drag Handle - Mobile only */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Header */}
          <div 
            className="relative p-4 sm:p-5"
            style={{ background: `linear-gradient(135deg, ${typeColor}25, transparent)` }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 sm:gap-4">
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${typeColor}, ${typeColor}80)` }}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div 
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold mb-1"
                  style={{ background: `${typeColor}30`, color: typeColor }}
                >
                  {getProjectTypeLabel(projectType)}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {project.name}
                </h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 pt-0 space-y-3 sm:space-y-4">
            {/* Description */}
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                {project.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex gap-2 sm:gap-3">
              {/* Cost */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-sm">
                <Euro className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mx-auto mb-0.5 sm:mb-1" />
                <p className="text-base sm:text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {formatCurrency(totalCost)}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">Coût</p>
              </div>

              {/* Impact */}
              {totalImpact > 0 && (
                <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 dark:text-purple-400 mx-auto mb-0.5 sm:mb-1" />
                  <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                    +{formatNumber(totalImpact)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">voy/jour</p>
                </div>
              )}

              {/* Efficiency */}
              {totalImpact > 0 && (
                <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-sm">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 dark:text-green-400 mx-auto mb-0.5 sm:mb-1" />
                  <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{efficiency}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">voy/M€</p>
                </div>
              )}
            </div>

            {/* Upgrade Options (Multiple choice like Ligne du Nord) - BEFORE period selection */}
            {hasUpgradeOptions && (
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                  🚇 Choisissez le mode de transport :
                </p>
                <div className="space-y-2">
                  {project.upgradeOptions?.map((option) => {
                    const isOptionSelected = effectiveUpgradeOptionId === option.id
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => {
                          setLocalUpgradeOptionId(option.id)
                          if (onSelectUpgradeOption) onSelectUpgradeOption(option.id)
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          "w-full p-3 rounded-xl text-left transition-all shadow-sm border-2",
                          isOptionSelected
                            ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400 dark:border-blue-500"
                            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "font-bold text-sm",
                            isOptionSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                          )}>
                            {isOptionSelected && <Check className="w-4 h-4 inline mr-1" />}
                            {option.name}
                          </h4>
                          <span className="text-orange-500 font-bold text-sm">
                            {formatCurrency(option.cost)}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                          {option.description}
                        </p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-purple-500">+{formatNumber(option.impact)} voy/j</span>
                          <span className="text-green-500">{Math.round(option.impact / option.cost)} voy/M€</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Upgrade Option (Simple toggle like TEOL) - BEFORE period selection */}
            {project.upgrade && !hasUpgradeOptions && onToggleUpgrade && (
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                  🔧 Option d&apos;amélioration :
                </p>
                <div className="space-y-2">
                  {/* Base version */}
                  <motion.button
                    onClick={() => onToggleUpgrade(false)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all shadow-sm border-2",
                      !isUpgraded
                        ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400 dark:border-blue-500"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        "font-bold text-sm",
                        !isUpgraded ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                      )}>
                        {!isUpgraded && <Check className="w-4 h-4 inline mr-1" />}
                        Version de base
                      </h4>
                      <span className="text-orange-500 font-bold text-sm">
                        {formatCurrency(project.cost)}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-purple-500">+{formatNumber(project.impact || 0)} voy/j</span>
                      <span className="text-green-500">{Math.round((project.impact || 0) / project.cost)} voy/M€</span>
                    </div>
                  </motion.button>
                  
                  {/* Upgraded version */}
                  <motion.button
                    onClick={() => onToggleUpgrade(true)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all shadow-sm border-2",
                      isUpgraded
                        ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400 dark:border-blue-500"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        "font-bold text-sm",
                        isUpgraded ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                      )}>
                        {isUpgraded && <Check className="w-4 h-4 inline mr-1" />}
                        {project.upgrade.name}
                      </h4>
                      <span className="text-orange-500 font-bold text-sm">
                        {formatCurrency(project.cost + project.upgrade.additionalCost)}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                      {project.upgrade.description}
                    </p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-purple-500">+{formatNumber((project.impact || 0) + (project.upgrade.additionalImpact || 0))} voy/j</span>
                      <span className="text-green-500">{Math.round(((project.impact || 0) + (project.upgrade.additionalImpact || 0)) / (project.cost + project.upgrade.additionalCost))} voy/M€</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Period Selection - Horizontal - AFTER upgrade selection */}
            {(hasUpgradeOptions ? effectiveUpgradeOptionId : true) && (
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Quand réaliser ce projet ?
              </p>
              
              <div className="flex gap-1.5 sm:gap-2">
                {periods.map((period) => {
                  const isSelected = selectedPeriod === period.value
                  return (
                    <motion.button
                      key={period.value}
                      onClick={() => handlePeriodSelect(isSelected ? null : period.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex-1 py-2 sm:py-3 px-2 sm:px-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 relative shadow-md",
                        isSelected 
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 absolute top-1.5 sm:top-2 right-1.5 sm:right-2" />
                      )}
                      <span className="block text-sm sm:text-base">{period.label}</span>
                      <span className={cn(
                        "block text-[10px] sm:text-xs",
                        isSelected ? "text-white" : "text-gray-500"
                      )}>
                        {period.sublabel}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
            )}

            {/* Action Buttons - Always visible */}
            <div className="flex gap-2 pt-2 pb-2 sm:pb-0">
              {selectedPeriod ? (
                <>
                  <button
                    onClick={() => onSelectPeriod(null)}
                    className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border-2 border-red-300 dark:border-red-500 transition-all shadow-md"
                  >
                    Retirer
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    ✓ Confirmer
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-md"
                >
                  Fermer
                </button>
              )}
            </div>

            {/* Locked Notice */}
            {isLocked && (
              <p className="text-yellow-600 dark:text-yellow-400 text-xs text-center">
                ⚠️ Projet obligatoirement étalé sur les deux mandats
              </p>
            )}

            {/* Dependency Notice */}
            {requiresBellecour && !isBellecourSelected && (
              <div className="bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-500 rounded-xl p-3 flex items-start gap-2 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-orange-600 dark:text-orange-400 text-xs">
                  <strong>Prérequis :</strong> Vous devez d&apos;abord sélectionner le Métro E Bellecour (section centrale)
                </p>
              </div>
            )}

            {/* Upgrade Info when not selected */}
            {project.upgrade && !selectedPeriod && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-600 rounded-xl p-3 shadow-sm">
                <p className="text-blue-600 dark:text-blue-400 text-xs">
                  💡 <strong>Option disponible :</strong> {project.upgrade.name} (+{formatCurrency(project.upgrade.additionalCost)})
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
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-400 dark:border-orange-500 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg">Prérequis manquant</h3>
                  <p className="text-orange-600 dark:text-orange-400 text-sm">Dépendance de projet</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Extension Métro E Part-Dieu</strong> est une extension de la ligne E.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Vous devez d&apos;abord sélectionner <strong className="text-orange-600 dark:text-orange-400">Métro E Bellecour</strong> (la section centrale de la ligne) avant de pouvoir ajouter cette extension.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  💡 La ligne E se construit par étapes : d&apos;abord la section centrale (Bellecour), puis les extensions peuvent être ajoutées.
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
