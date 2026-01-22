'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { 
  ChevronRight, 
  TramFront, 
  Euro, 
  Users, 
  Calendar,
  Target,
  MousePointer2,
  Sliders,
  Trophy,
  Map,
  CheckCircle2,
  Clock,
  Coins,
  BarChart3,
  Sparkles
} from 'lucide-react'

export function IntroScreen() {
  const { setPhase } = useGameStore()
  const [step, setStep] = useState(0)

  const handleStart = () => {
    setPhase('playing') // Skip onboarding, go directly to game
  }

  return (
    <div className="fixed inset-0 bg-gray-950 overflow-hidden overflow-y-auto">
      {/* Animated metro lines background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <motion.path
            d="M0,200 Q250,150 500,200 T1000,200"
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,400 Q250,350 500,400 T1000,400"
            stroke="#EF4444"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,600 Q250,650 500,600 T1000,600"
            stroke="#F59E0B"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.6, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,800 Q250,750 500,800 T1000,800"
            stroke="#22C55E"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.9, ease: "easeInOut" }}
          />
        </svg>

        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-full flex flex-col">
        {/* Header */}
        <motion.div 
          className="p-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 via-blue-500 to-green-500 flex items-center justify-center shadow-lg">
              <TramFront className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight">TCL 2040</p>
              <p className="text-gray-500 text-xs">Simulateur de réseau</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
            <p className="text-amber-400 text-xs font-medium">Expérience pédagogique</p>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-8">
          <div className="max-w-6xl w-full">
            <AnimatePresence mode="wait">
              {/* STEP 0: Hero */}
              {step === 0 && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6"
                  >
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">22 mars 2026 — Élection métropolitaine</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
                  >
                    Vous êtes élu(e)
                    <br />
                    <span className="bg-gradient-to-r from-red-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                      Président(e) de la Métropole
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
                  >
                    Vous avez <strong className="text-white">2 mandats</strong> pour transformer le réseau TCL.
                    <br />
                    Quels projets allez-vous financer ?
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 max-w-3xl mx-auto"
                  >
                    {[
                      { icon: Euro, value: '4 Milliards €', label: 'Budget total', color: 'from-green-500 to-emerald-500' },
                      { icon: Calendar, value: '2026 → 2038', label: '12 ans, 2 mandats', color: 'from-blue-500 to-cyan-500' },
                      { icon: Map, value: '25 projets', label: 'À sélectionner', color: 'from-purple-500 to-pink-500' },
                      { icon: Users, value: '+X voyageurs', label: 'Votre objectif', color: 'from-orange-500 to-red-500' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center"
                      >
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white font-bold text-sm md:text-lg">{stat.value}</p>
                        <p className="text-gray-500 text-xs">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    onClick={() => setStep(1)}
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full text-white font-bold text-lg transition-all shadow-lg shadow-purple-500/25"
                  >
                    <span className="flex items-center gap-2">
                      Comprendre l&apos;interface
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </motion.div>
              )}

              {/* STEP 1: Interface Guide */}
              {step === 1 && (
                <motion.div
                  key="interface"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                      Comment jouer ?
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                      Découvrez les éléments de l&apos;interface que vous utiliserez pour construire votre réseau.
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {/* Card 1: Projects */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                        <MousePointer2 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Les cartes projets</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Cliquez sur un projet pour l&apos;ajouter à votre plan. Choisissez ensuite quand le réaliser :
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-blue-400">
                          <Clock className="w-4 h-4" />
                          <span><strong>Mandat 1</strong> (2026-2032)</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-400">
                          <Clock className="w-4 h-4" />
                          <span><strong>Mandat 2</strong> (2032-2038)</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                          <Clock className="w-4 h-4" />
                          <span><strong>Étalé</strong> (coût divisé sur les 2)</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Card 2: Budget */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">La jauge budget</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        En haut de l&apos;écran, vous voyez votre budget restant pour chaque mandat.
                      </p>
                      <div className="bg-gray-900/50 rounded-xl p-3 space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Mandat 1</span>
                            <span className="text-green-400">1.5 Md€</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Mandat 2</span>
                            <span className="text-blue-400">2.0 Md€</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Card 3: Financing */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                        <Sliders className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Les leviers de financement</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Le bouton <strong className="text-yellow-400">€</strong> ouvre un panneau avec des options pour augmenter ou réduire votre budget :
                      </p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Augmenter les tarifs des tickets</li>
                        <li>• Activer des mesures sociales</li>
                        <li>• Taxe versement mobilité</li>
                        <li>• Et plus encore...</li>
                      </ul>
                    </motion.div>

                    {/* Card 4: Impact */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">L&apos;impact voyageurs</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Chaque projet affiche son <strong className="text-purple-400">impact voyageurs/jour</strong>. 
                        C&apos;est le nombre de personnes supplémentaires qui utiliseront les transports.
                      </p>
                      <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 text-sm font-medium">+180 000 voy/jour</span>
                      </div>
                    </motion.div>

                    {/* Card 5: Objectives */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-4">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Objectifs & Succès</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Le bouton <strong className="text-rose-400">🏆</strong> affiche vos objectifs à atteindre et les succès à débloquer.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-gray-300">+200k voyageurs/jour</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">Budget équilibré</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Card 6: Validate */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Valider votre plan</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Quand vous êtes satisfait de vos choix, cliquez sur <strong className="text-emerald-400">Valider</strong> pour voir les résultats.
                      </p>
                      <p className="text-gray-500 text-xs">
                        Vous verrez une carte interactive, la frise chronologique de vos projets, et un bilan complet.
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-4"
                  >
                    <button
                      onClick={() => setStep(0)}
                      className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={handleStart}
                      className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-full text-white font-bold text-lg transition-all shadow-lg shadow-green-500/25"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Commencer l&apos;expérience
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="p-4 text-center border-t border-gray-800/50"
        >
          <p className="text-gray-600 text-xs">
            Expérience pédagogique indépendante • Non affiliée au SYTRAL ni à la Métropole de Lyon
          </p>
        </motion.div>
      </div>
    </div>
  )
}
