'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { POLITICAL_PARTIES } from '@/lib/politicalParties'
import { cn } from '@/lib/utils'
import { ChevronDown, Vote, X, Check } from 'lucide-react'

interface PartySelectorProps {
  compact?: boolean
  desktopStyle?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PartySelector({ compact = false, desktopStyle = false, isOpen: controlledIsOpen, onOpenChange }: PartySelectorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = onOpenChange || setInternalIsOpen
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPartyId, setPendingPartyId] = useState<string | null>(null)
  const { selectedPartyId, applyPartyPreselection, projectSelections } = useGameStore()

  const selectedParty = POLITICAL_PARTIES.find(p => p.id === selectedPartyId)
  const hasExistingSelections = projectSelections.length > 0

  const handlePartyClick = (partyId: string | null) => {
    if (hasExistingSelections && partyId !== selectedPartyId) {
      setPendingPartyId(partyId)
      setShowConfirmModal(true)
      setIsOpen(false)
    } else {
      applyPartyPreselection(partyId)
      setIsOpen(false)
    }
  }

  const confirmPartyChange = () => {
    applyPartyPreselection(pendingPartyId)
    setShowConfirmModal(false)
    setPendingPartyId(null)
  }

  const cancelPartyChange = () => {
    setShowConfirmModal(false)
    setPendingPartyId(null)
  }

  if (compact) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center gap-2 rounded-xl border transition-all",
              desktopStyle 
                ? "px-4 py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                : "px-3 py-2",
              !desktopStyle && (selectedParty
                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                : "bg-gray-100 dark:bg-gray-700 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600")
            )}
          >
            {selectedParty ? (
              <>
                <span className={desktopStyle ? "text-lg" : "text-base"}>{selectedParty.emoji}</span>
                <span className={cn(
                  "font-medium text-gray-700 dark:text-gray-300 hidden sm:inline",
                  desktopStyle ? "text-sm" : "text-xs"
                )}>
                  {selectedParty.shortName}
                </span>
              </>
            ) : (
              <>
                <Vote className={cn("text-gray-500 dark:text-gray-400", desktopStyle ? "w-5 h-5" : "w-4 h-4")} />
                <span className={cn(
                  "font-medium text-gray-600 dark:text-gray-400 hidden sm:inline",
                  desktopStyle ? "text-sm" : "text-xs"
                )}>
                  Programmes
                </span>
              </>
            )}
            <ChevronDown className={cn("text-gray-400 transition-transform", desktopStyle ? "w-4 h-4" : "w-3 h-3", isOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden min-w-[200px] z-50"
              >
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
                    Programmes électoraux
                  </p>
                </div>
                <div className="p-1">
                  {POLITICAL_PARTIES.map((party) => (
                    <button
                      key={party.id}
                      onClick={() => handlePartyClick(party.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
                        selectedPartyId === party.id
                          ? "bg-gray-100 dark:bg-gray-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      )}
                    >
                      <span className="text-lg">{party.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {party.shortName}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {party.projectSelections.length} projets
                        </p>
                      </div>
                      {selectedPartyId === party.id && (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  {selectedPartyId && (
                    <>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <button
                        onClick={() => handlePartyClick(null)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
                      >
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          Réinitialiser
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={cancelPartyChange}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Vote className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Changer de programme ?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Cela remplacera vos {projectSelections.length} projets actuels par ceux du programme sélectionné.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelPartyChange}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmPartyChange}
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all"
                  >
                    Confirmer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Full version (not compact)
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Vote className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Programmes 2026</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Chargez les propositions d&apos;un parti politique
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {POLITICAL_PARTIES.map((party) => {
            const isSelected = selectedPartyId === party.id
            return (
              <motion.button
                key={party.id}
                onClick={() => handlePartyClick(party.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex flex-col p-4 rounded-xl border-2 transition-all text-left overflow-hidden group",
                  isSelected
                    ? "border-transparent shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                )}
                style={{
                  background: isSelected 
                    ? `linear-gradient(135deg, ${party.color}15, ${party.color}30)` 
                    : undefined
                }}
              >
                {/* Color accent bar */}
                <div 
                  className={cn(
                    "absolute top-0 left-0 right-0 h-1 transition-all",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  )}
                  style={{ backgroundColor: party.color }}
                />
                
                <div className="flex items-start gap-3">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all",
                      isSelected ? "shadow-md" : "group-hover:scale-110"
                    )}
                    style={{ 
                      backgroundColor: `${party.color}20`,
                      border: `2px solid ${party.color}40`
                    }}
                  >
                    {party.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-semibold leading-tight",
                      isSelected
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-800 dark:text-gray-200"
                    )}>
                      {party.shortName}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {party.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: party.color }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <span 
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${party.color}20`,
                      color: party.color
                    }}
                  >
                    {party.projectSelections.length} projets
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {Object.keys(party.financingLevers).length > 0 
                      ? `${Object.keys(party.financingLevers).length} leviers` 
                      : 'Sans leviers'}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
        {selectedPartyId && (
          <button
            onClick={() => handlePartyClick(null)}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">Réinitialiser la sélection</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={cancelPartyChange}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Changer de programme ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Cela remplacera vos {projectSelections.length} projets actuels par ceux du programme sélectionné.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cancelPartyChange}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmPartyChange}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
