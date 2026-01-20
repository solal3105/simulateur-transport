'use client'

import { motion } from 'framer-motion'
import { Project } from '@/lib/types'
import { PROJECT_TYPE_COLORS } from '@/lib/projectsGeo'
import { formatCurrency } from '@/lib/utils'
import { Euro, TramFront, Bus, Ship } from 'lucide-react'

interface ProjectTooltipProps {
  project: Project
  projectType: string
  mousePosition: { x: number; y: number }
}

function getProjectIcon(type: string) {
  switch (type) {
    case 'metro': return TramFront
    case 'tram': return TramFront
    case 'bus': return Bus
    case 'other': return Ship
    default: return TramFront
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

export function ProjectTooltip({ project, projectType, mousePosition }: ProjectTooltipProps) {
  const Icon = getProjectIcon(projectType)
  const typeColor = PROJECT_TYPE_COLORS[projectType as keyof typeof PROJECT_TYPE_COLORS] || PROJECT_TYPE_COLORS.metro

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="fixed pointer-events-none z-[1000]"
      style={{
        left: mousePosition.x + 20,
        top: mousePosition.y - 10,
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden max-w-xs"
        style={{ boxShadow: `0 10px 40px -10px ${typeColor}40` }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700"
          style={{ background: `linear-gradient(135deg, ${typeColor}20, transparent)` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${typeColor}, ${typeColor}80)` }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div 
                className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-1"
                style={{ background: `${typeColor}30`, color: typeColor }}
              >
                {getProjectTypeLabel(projectType)}
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
                {project.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3 space-y-2">
          {/* Description */}
          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-3">
              {project.description}
            </p>
          )}

          {/* Cost */}
          <div className="flex items-center gap-2 pt-1">
            <Euro className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {formatCurrency(project.cost)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
