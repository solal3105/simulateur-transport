'use client'

import { motion } from 'framer-motion'
import { SELECTION_COLORS, PROJECT_TYPE_COLORS } from '@/lib/projectsGeo'
import { cn } from '@/lib/utils'

export function MapLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="absolute bottom-20 left-4 z-20 pointer-events-auto"
    >
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 space-y-4">
        {/* Selection Status */}
        <div>
          <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Statut de sélection
          </h4>
          <div className="space-y-2">
            <LegendItem color={SELECTION_COLORS.M1} label="Mandat 1 (2026-2032)" />
            <LegendItem color={SELECTION_COLORS.M2} label="Mandat 2 (2032-2038)" />
            <LegendItem color={SELECTION_COLORS['M1+M2']} label="Étalé (M1+M2)" />
            <LegendItem color={SELECTION_COLORS.none} label="Non sélectionné" />
          </div>
        </div>

        {/* Project Types */}
        <div className="pt-3 border-t border-gray-700/50">
          <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Types de projet
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <TypeBadge icon="🚇" label="Métro" color={PROJECT_TYPE_COLORS.metro} />
            <TypeBadge icon="🚊" label="Tramway" color={PROJECT_TYPE_COLORS.tram} />
            <TypeBadge icon="🚌" label="Bus/BHNS" color={PROJECT_TYPE_COLORS.bus} />
            <TypeBadge icon="🚢" label="Autre" color={PROJECT_TYPE_COLORS.other} />
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-3 border-t border-gray-700/50">
          <p className="text-gray-500 text-xs">
            💡 Cliquez sur un projet pour voir les détails et le programmer.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-4 h-4 rounded-full border-2 border-white/20"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-300 text-xs">{label}</span>
    </div>
  )
}

function TypeBadge({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div 
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  )
}
