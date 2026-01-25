'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export interface DropdownOption {
  key: string
  label: string
  icon?: ReactNode
  activeColor?: string
}

interface NavDropdownProps {
  icon: LucideIcon
  label: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
  compact?: boolean
}

export function NavDropdown({ 
  icon: Icon, 
  label, 
  options, 
  value, 
  onChange, 
  isOpen, 
  onToggle,
  compact = false 
}: NavDropdownProps) {
  const selectedOption = options.find(o => o.key === value)

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 rounded-xl border transition-all",
          compact
            ? "px-2 py-1.5 bg-gray-100 dark:bg-gray-700 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
            : "px-4 py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700"
        )}
      >
        <Icon className={cn("text-gray-500 dark:text-gray-400", compact ? "w-4 h-4" : "w-5 h-5")} />
        <span className={cn(
          "font-medium text-gray-700 dark:text-gray-300",
          compact ? "text-xs hidden sm:inline" : "text-sm"
        )}>
          {selectedOption?.label || label}
        </span>
        <ChevronDown className={cn(
          "text-gray-400 transition-transform",
          compact ? "w-3 h-3" : "w-4 h-4",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={cn(
              "absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-50",
              compact ? "min-w-[120px]" : "min-w-[160px]"
            )}
          >
            {options.map((option) => {
              const isSelected = value === option.key
              return (
                <button
                  key={option.key}
                  onClick={() => {
                    onChange(option.key)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 text-left transition-all",
                    compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
                    isSelected
                      ? option.activeColor || "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span className="font-medium">{option.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
