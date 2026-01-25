'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface ThemeToggleProps {
  isOpen?: boolean
  onToggle?: () => void
}

export function ThemeToggle({ isOpen: controlledIsOpen, onToggle }: ThemeToggleProps = {}) {
  const { theme, setTheme } = useTheme()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen))
  const handleClose = onToggle ? onToggle : () => setInternalIsOpen(false)

  const themes = [
    { value: 'light' as const, label: 'Mode jour', icon: Sun, emoji: '☀️' },
    { value: 'dark' as const, label: 'Mode nuit', icon: Moon, emoji: '🌙' },
  ]

  // Show current state based on actual resolved theme (system resolves to light/dark)
  const currentTheme = themes.find(t => t.value === theme) || themes[0]
  const Icon = currentTheme.icon

  return (
    <div className="relative">
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-xl"
      >
        <Icon className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden z-50"
          >
            {themes.map((t) => {
              const ThemeIcon = t.icon
              const isActive = theme === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => {
                    setTheme(t.value)
                    handleClose()
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-theme"
                      className="ml-auto w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
