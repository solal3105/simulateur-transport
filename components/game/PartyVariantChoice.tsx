'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PartyVariant } from '@/lib/politicalParties'
import { cn } from '@/lib/utils'
import { Vote, X, ArrowRight, AlertTriangle } from 'lucide-react'

interface PartyVariantChoiceProps {
  isOpen: boolean
  onClose: () => void
  variants: PartyVariant[]
  partyName: string
  partyColor: string
  partyEmoji: string
  onSelectVariant: (variantId: string) => void
}

export function PartyVariantChoice({
  isOpen,
  onClose,
  variants,
  partyName,
  partyColor,
  partyEmoji,
  onSelectVariant,
}: PartyVariantChoiceProps) {
  if (!isOpen || variants.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ 
                  backgroundColor: `${partyColor}20`,
                  border: `2px solid ${partyColor}40`
                }}
              >
                {partyEmoji}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {partyName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choisissez votre scénario
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Volonté de changement législatif
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                  LFI a la volonté de changer la loi au niveau national pour atteindre la gratuité totale des transports. 
                  C&apos;est sous cette condition qu&apos;ils viseront la gratuité totale. 
                  Nous présentons ici les deux scénarios : avec et sans modification législative.
                </p>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variants.map((variant) => {
              const hasGratuite = variant.financingLevers.gratuiteTotale
              const hasVersement = variant.financingLevers.versementMobilite && variant.financingLevers.versementMobilite >= 50

              return (
                <motion.button
                  key={variant.id}
                  onClick={() => onSelectVariant(variant.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex flex-col p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all text-left group"
                >
                  {/* Variant Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {variant.name}
                    </h4>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {variant.description}
                  </p>

                  {/* Impacts */}
                  <div className="space-y-2 mt-auto">
                    {hasGratuite && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Gratuité totale activée
                        </span>
                      </div>
                    )}
                    {hasVersement && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Versement mobilité +{variant.financingLevers.versementMobilite}% 
                          {variant.financingLevers.versementMobilite && ` (+${variant.financingLevers.versementMobilite * 28} M€/mandat)`}
                        </span>
                      </div>
                    )}
                    {!hasGratuite && !hasVersement && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Aucun levier de financement spécifique
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                    style={{ backgroundColor: partyColor }}
                  />
                </motion.button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Les projets d&apos;infrastructure restent identiques dans les deux scénarios
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
