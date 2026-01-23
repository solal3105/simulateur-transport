'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { PROJECTS, PROJECT_DURATIONS } from '@/lib/data'
import { X, Calendar, TramFront, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineProject {
  id: string
  name: string
  startYear: number
  endYear: number
  period: string
  color: string
}

function getProjectDuration(projectId: string, upgradeOptionId?: string, upgraded?: boolean): number {
  const duration = PROJECT_DURATIONS[projectId]
  
  if (typeof duration === 'number') {
    // Check for TEOL upgrade
    if (projectId === 'teol' && upgraded) {
      return PROJECT_DURATIONS['teol-enterre'] as number || 8
    }
    return duration
  }
  
  if (typeof duration === 'object' && upgradeOptionId) {
    return duration[upgradeOptionId] || 6
  }
  
  // Default duration if not found
  return 6
}

function getProjectColor(projectId: string): string {
  if (projectId.includes('metro') || projectId.includes('modern') || projectId === 'grande-dorsale' || projectId === 'ext-a-est' || projectId === 'ext-d') {
    return 'from-blue-500 to-indigo-600'
  }
  if (projectId.includes('t') && (projectId.includes('tram') || projectId.match(/^t\d/))) {
    return 'from-green-500 to-emerald-600'
  }
  if (projectId.includes('bhns')) {
    return 'from-orange-500 to-amber-600'
  }
  if (projectId.includes('teol')) {
    return 'from-purple-500 to-violet-600'
  }
  if (projectId === 'navette-fluv') {
    return 'from-cyan-500 to-teal-600'
  }
  if (projectId === 'ligne-du-nord') {
    return 'from-red-500 to-rose-600'
  }
  if (projectId === 'ligne-ouest') {
    return 'from-yellow-500 to-orange-500'
  }
  return 'from-gray-500 to-gray-600'
}

export function ProjectTimeline({ isModal = false, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const { projectSelections } = useGameStore()

  const timelineProjects: TimelineProject[] = projectSelections.map((selection) => {
    const project = PROJECTS.find((p) => p.id === selection.projectId)
    if (!project) return null

    const startYear = selection.period === 'M2' ? 2032 : 2026
    const duration = getProjectDuration(
      selection.projectId,
      selection.selectedUpgradeOptionId,
      selection.upgraded
    )
    const endYear = startYear + duration

    return {
      id: selection.projectId,
      name: project.name,
      startYear,
      endYear,
      period: selection.period || 'M1',
      color: getProjectColor(selection.projectId),
    }
  }).filter(Boolean) as TimelineProject[]

  // Sort by start year, then by end year
  timelineProjects.sort((a, b) => {
    if (a.startYear !== b.startYear) return a.startYear - b.startYear
    return a.endYear - b.endYear
  })

  const minYear = 2026
  const maxYear = Math.max(2044, ...timelineProjects.map((p) => p.endYear))
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

  const content = (
    <div className="space-y-4 tablet:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 tablet:gap-4">
          <div className="w-10 h-10 tablet:w-14 tablet:h-14 rounded-xl tablet:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-5 h-5 tablet:w-7 tablet:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg tablet:text-2xl font-bold text-gray-900 dark:text-white">Frise Chronologique</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5 tablet:mt-1 text-xs tablet:text-base">Calendrier des projets</p>
          </div>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 tablet:gap-4 text-xs tablet:text-sm">
        <div className="flex items-center gap-1.5 tablet:gap-2">
          <div className="w-3 h-3 tablet:w-4 tablet:h-4 rounded bg-blue-500/30 border-2 border-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">M1 (2026-32)</span>
        </div>
        <div className="flex items-center gap-1.5 tablet:gap-2">
          <div className="w-3 h-3 tablet:w-4 tablet:h-4 rounded bg-purple-500/30 border-2 border-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">M2 (2032-38)</span>
        </div>
      </div>

      {timelineProjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <TramFront className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun projet sélectionné</p>
          <p className="text-sm mt-1">Sélectionnez des projets pour voir leur calendrier de réalisation</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          {/* Timeline grid */}
          <div className="min-w-[800px]">
            {/* Year headers */}
            <div className="flex border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4">
              <div className="w-48 flex-shrink-0" />
              <div className="flex-1 flex">
                {years.map((year) => (
                  <div
                    key={year}
                    className={cn(
                      "flex-1 text-center text-xs font-medium",
                      year === 2032 ? "text-purple-600 dark:text-purple-400 font-bold" : "text-gray-500 dark:text-gray-400",
                      year % 2 === 0 ? "opacity-100" : "opacity-50"
                    )}
                  >
                    {year % 2 === 0 ? year : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Mandat zones background */}
            <div className="relative">
              <div className="absolute inset-0 flex pointer-events-none">
                <div className="w-48 flex-shrink-0" />
                <div className="flex-1 flex">
                  {years.map((year) => (
                    <div
                      key={year}
                      className={cn(
                        "flex-1 border-l",
                        year >= 2026 && year < 2032 ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/30" : "",
                        year >= 2032 && year < 2038 ? "bg-purple-50/50 dark:bg-purple-900/10 border-purple-200/50 dark:border-purple-800/30" : "",
                        year >= 2038 ? "bg-gray-50/50 dark:bg-gray-900/10 border-gray-200/50 dark:border-gray-800/30" : ""
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Project bars */}
              <div className="relative space-y-2">
                {timelineProjects.map((project, index) => {
                  const startOffset = ((project.startYear - minYear) / years.length) * 100
                  const width = ((project.endYear - project.startYear) / years.length) * 100

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center h-10"
                    >
                      {/* Project name */}
                      <div className="w-48 flex-shrink-0 pr-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {project.startYear} → {project.endYear}
                        </p>
                      </div>

                      {/* Bar container */}
                      <div className="flex-1 relative h-8">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                          style={{
                            left: `${startOffset}%`,
                            width: `${width}%`,
                          }}
                          className={cn(
                            "absolute h-full rounded-lg bg-gradient-to-r shadow-md origin-left",
                            project.color
                          )}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold drop-shadow-md px-2 truncate">
                              {project.endYear - project.startYear} ans
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Mandat markers */}
            <div className="flex mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="w-48 flex-shrink-0" />
              <div className="flex-1 flex">
                {/* Mandat 1 */}
                <div 
                  className="text-center border-r-2 border-blue-400"
                  style={{ width: `${((2032 - minYear) / years.length) * 100}%` }}
                >
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                    MANDAT 1
                  </span>
                </div>
                {/* Mandat 2 */}
                <div 
                  className="text-center border-r-2 border-purple-400"
                  style={{ width: `${((2038 - 2032) / years.length) * 100}%` }}
                >
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded">
                    MANDAT 2
                  </span>
                </div>
                {/* Post-mandats */}
                <div className="flex-1 text-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    POST-MANDATS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats summary */}
      {timelineProjects.length > 0 && (
        <div className="grid grid-cols-4 gap-2 tablet:gap-4 pt-3 tablet:pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center p-2 tablet:p-3 rounded-lg tablet:rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <p className="text-lg tablet:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {timelineProjects.filter((p) => p.period === 'M1').length}
            </p>
            <p className="text-[10px] tablet:text-xs text-gray-500 dark:text-gray-400">M1</p>
          </div>
          <div className="text-center p-2 tablet:p-3 rounded-lg tablet:rounded-xl bg-purple-50 dark:bg-purple-900/20">
            <p className="text-lg tablet:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {timelineProjects.filter((p) => p.period === 'M2').length}
            </p>
            <p className="text-[10px] tablet:text-xs text-gray-500 dark:text-gray-400">M2</p>
          </div>
          <div className="text-center p-2 tablet:p-3 rounded-lg tablet:rounded-xl bg-green-50 dark:bg-green-900/20">
            <p className="text-lg tablet:text-2xl font-bold text-green-600 dark:text-green-400">
              {timelineProjects.filter((p) => p.period === 'M1+M2').length}
            </p>
            <p className="text-[10px] tablet:text-xs text-gray-500 dark:text-gray-400">Étalés</p>
          </div>
          <div className="text-center p-2 tablet:p-3 rounded-lg tablet:rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <p className="text-lg tablet:text-2xl font-bold text-amber-600 dark:text-amber-400">
              {Math.max(...timelineProjects.map((p) => p.endYear))}
            </p>
            <p className="text-[10px] tablet:text-xs text-gray-500 dark:text-gray-400">Fin</p>
          </div>
        </div>
      )}
    </div>
  )

  if (isModal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl tablet:rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 tablet:p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl tablet:rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 tablet:p-6 shadow-lg">
      {content}
    </div>
  )
}
