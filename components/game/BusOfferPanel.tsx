'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { MandatPeriod } from '@/lib/types'
import { cn, formatCurrency } from '@/lib/utils'
import { 
  Bus,
  Zap,
  Wrench,
  AlertTriangle,
  Check,
  Info
} from 'lucide-react'
import { useState } from 'react'

export function BusOfferPanel() {
  const { financingLevers, setFinancingLever, setBusOfferConfirmed, busOfferConfirmed, getBudgetState } = useGameStore()
  const budget = getBudgetState()
  const [showElectrificationWarning, setShowElectrificationWarning] = useState(false)
  const [showEntretienWarning, setShowEntretienWarning] = useState(false)

  const handleElectrificationChange = (val: MandatPeriod) => {
    if (val === null && financingLevers.electrificationBus !== null) {
      setShowElectrificationWarning(true)
    } else {
      setFinancingLever('electrificationBus', val)
    }
  }

  const handleEntretienChange = (val: MandatPeriod) => {
    if (val === null && financingLevers.entretienBus !== null) {
      setShowEntretienWarning(true)
    } else {
      setFinancingLever('entretienBus', val)
    }
  }

  const confirmElectrificationOff = () => {
    setFinancingLever('electrificationBus', null)
    setShowElectrificationWarning(false)
  }

  const confirmEntretienOff = () => {
    setFinancingLever('entretienBus', null)
    setShowEntretienWarning(false)
  }

  // Calculate total bus cost
  const getElectrificationCost = () => {
    if (!financingLevers.electrificationBus) return 0
    return financingLevers.electrificationBus === 'M1+M2' ? 230 : 460
  }

  const getEntretienCost = () => {
    if (!financingLevers.entretienBus) return 0
    return financingLevers.entretienBus === 'M1+M2' ? 400 : 800
  }

  const totalBusCost = getElectrificationCost() + getEntretienCost()

  const periodOptions: { value: MandatPeriod; label: string }[] = [
    { value: null, label: 'Non' },
    { value: 'M1', label: 'Mandat 1' },
    { value: 'M2', label: 'Mandat 2' },
    { value: 'M1+M2', label: 'Étalé' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Warning Popups */}
      {showElectrificationWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowElectrificationWarning(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-400 p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-bold text-xl">Attention !</h3>
                <p className="text-orange-600 dark:text-orange-400 font-medium">Pas d&apos;électrification</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-gray-600 dark:text-gray-300"><strong>Impacts écologiques :</strong> Maintien des émissions CO2 et particules fines.</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Coûts long terme :</strong> Maintenance et carburant plus élevés.</p>
              <p className="text-red-600 dark:text-red-400 font-bold">Sur le long terme, c&apos;est perdant économiquement et écologiquement.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowElectrificationWarning(false)} className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                Annuler
              </button>
              <button onClick={confirmElectrificationOff} className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showEntretienWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowEntretienWarning(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-400 p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-bold text-xl">Danger !</h3>
                <p className="text-red-600 dark:text-red-400 font-medium">Pas d&apos;entretien de la flotte</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-gray-600 dark:text-gray-300"><strong>Sécurité :</strong> Risques de pannes et d&apos;accidents accrus.</p>
              <p className="text-gray-600 dark:text-gray-300"><strong>Service :</strong> Retards, annulations, image dégradée.</p>
              <p className="text-red-600 dark:text-red-400 font-bold">Sans entretien, le réseau bus s&apos;effondrera. C&apos;est irresponsable.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEntretienWarning(false)} className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                Annuler
              </button>
              <button onClick={confirmEntretienOff} className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg">
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offre Bus</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Définissez votre stratégie pour la flotte de bus</p>
          </div>
        </div>
        
        {/* Total cost indicator */}
        <div className="px-5 py-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Coût total par mandat</span>
          <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {totalBusCost} Millions € / mandat
          </span>
        </div>
      </div>

      {/* Entretien Bus */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Entretien de la flotte</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">800 Millions € sur 12 ans</p>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Maintenance et renouvellement des bus TCL. Indispensable pour la qualité de service.
        </p>

        <div className="grid grid-cols-4 gap-2">
          {periodOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleEntretienChange(opt.value)}
              className={cn(
                "py-3 px-2 rounded-xl text-sm font-semibold transition-all",
                financingLevers.entretienBus === opt.value
                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        <div className="mt-3 flex gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <span className="text-blue-700 dark:text-blue-300 text-sm">
            {financingLevers.entretienBus === 'M1+M2' ? '400 Millions €/mandat (étalé)' : 
             financingLevers.entretienBus ? '800 Millions € sur un mandat' : 
             'Aucun entretien prévu - Risque majeur !'}
          </span>
        </div>
      </div>

      {/* Électrification Bus */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Électrification de la flotte</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">460 Millions € sur 12 ans</p>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Conversion des bus thermiques vers l&apos;électrique. Réduit les émissions et le bruit.
        </p>

        <div className="grid grid-cols-4 gap-2">
          {periodOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleElectrificationChange(opt.value)}
              className={cn(
                "py-3 px-2 rounded-xl text-sm font-semibold transition-all",
                financingLevers.electrificationBus === opt.value
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        <div className="mt-3 flex gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
          <Info className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <span className="text-green-700 dark:text-green-300 text-sm">
            {financingLevers.electrificationBus === 'M1+M2' ? '230 Millions €/mandat (étalé)' : 
             financingLevers.electrificationBus ? '460 Millions € sur un mandat' : 
             'Pas d\'électrification prévue'}
          </span>
        </div>
      </div>

    </motion.div>
  )
}
