'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamic import to avoid SSR issues with Leaflet
const MapViewComponent = dynamic(
  () => import('./MapView').then((mod) => mod.MapView),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-pulse">
            <span className="text-3xl">🚇</span>
          </div>
          <p className="text-white font-semibold">Chargement de la carte...</p>
          <p className="text-gray-500 text-sm mt-1">Préparation de votre simulation</p>
        </motion.div>
      </div>
    )
  }
)

export function MapSimulator() {
  return <MapViewComponent />
}
