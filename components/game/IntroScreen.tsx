'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/gameStore'
import { ChevronRight, Zap, TramFront } from 'lucide-react'

const introLines = [
  { text: "Lyon, 2026.", delay: 0 },
  { text: "La métropole fait face à un défi colossal.", delay: 1.5 },
  { text: "4 milliards d'euros.", delay: 3.5 },
  { text: "25 projets de transport.", delay: 5 },
  { text: "2 mandats pour tout changer.", delay: 6.5 },
  { text: "Et vous êtes aux commandes.", delay: 8.5 },
]

export function IntroScreen() {
  const { setPhase } = useGameStore()
  const [currentLine, setCurrentLine] = useState(0)
  const [showButton, setShowButton] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)

  useEffect(() => {
    if (isSkipping) return

    const timers = introLines.map((line, index) => {
      return setTimeout(() => {
        setCurrentLine(index + 1)
      }, line.delay * 1000)
    })

    const buttonTimer = setTimeout(() => {
      setShowButton(true)
    }, 10500)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(buttonTimer)
    }
  }, [isSkipping])

  const handleSkip = () => {
    setIsSkipping(true)
    setCurrentLine(introLines.length)
    setShowButton(true)
  }

  const handleStart = () => {
    setPhase('onboarding')
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-950 via-black to-purple-950"
          animate={{
            background: [
              'linear-gradient(to bottom right, #172554, #000000, #3b0764)',
              'linear-gradient(to bottom right, #3b0764, #000000, #172554)',
              'linear-gradient(to bottom right, #172554, #000000, #3b0764)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <div className="text-center space-y-4 max-w-3xl">
            {introLines.slice(0, currentLine).map((line, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`
                  ${index === 0 ? 'text-2xl md:text-4xl font-light text-blue-400' : ''}
                  ${index === 1 ? 'text-xl md:text-2xl text-gray-300' : ''}
                  ${index === 2 ? 'text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent' : ''}
                  ${index === 3 ? 'text-2xl md:text-3xl text-white' : ''}
                  ${index === 4 ? 'text-xl md:text-2xl text-gray-400' : ''}
                  ${index === 5 ? 'text-3xl md:text-5xl font-bold text-white mt-8' : ''}
                `}
              >
                {line.text}
              </motion.p>
            ))}
          </div>
        </AnimatePresence>

        {/* Start button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16"
            >
              <motion.button
                onClick={handleStart}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-white font-semibold text-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <span className="relative flex items-center gap-2">
                  <TramFront className="w-5 h-5" />
                  Prendre les commandes
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip button */}
        {!showButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={handleSkip}
            className="absolute bottom-8 right-8 text-gray-500 hover:text-white text-sm transition-colors"
          >
            Passer l&apos;intro →
          </motion.button>
        )}
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  )
}
