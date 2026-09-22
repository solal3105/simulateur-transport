'use client'

import { clsx } from 'clsx'
import type { Phase } from '@/lib/types'

const CELLS: { phase: Phase; glyph: string; title: string }[] = [
  { phase: 'M1', glyph: '1', title: 'Inscrire en phase 1, de 2026 à 2032' },
  { phase: 'M2', glyph: '2', title: 'Inscrire en phase 2, de 2032 à 2038' },
  { phase: 'M1M2', glyph: '1·2', title: 'Étaler sur les deux phases, moitié-moitié' },
]

export function PhaseSwitch({
  value,
  onChange,
  disabled,
  disabledReason,
  size = 'md',
}: {
  value: Phase | null
  onChange: (phase: Phase | null) => void
  disabled?: boolean
  disabledReason?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      className="flex shrink-0 gap-px"
      role="group"
      aria-label="Phase d’inscription au programme"
    >
      {CELLS.map((cell) => {
        const active = value === cell.phase
        return (
          <button
            key={cell.phase}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            title={disabled ? disabledReason : active ? 'Retirer du programme' : cell.title}
            onClick={() => onChange(active ? null : cell.phase)}
            className={clsx(
              'lining font-bold transition-colors duration-150',
              size === 'md' ? 'h-8 w-9 text-[12px]' : 'h-7 w-8 text-[11px]',
              cell.phase === 'M1M2' && (size === 'md' ? 'w-11' : 'w-10'),
              disabled && 'cursor-not-allowed border border-chalk-dim/20 text-chalk-dim/35',
              !disabled &&
                active &&
                'bg-signal text-ink hover:bg-alert hover:text-chalk',
              !disabled &&
                !active &&
                'border border-chalk-dim/35 text-chalk-dim hover:border-signal hover:text-signal',
            )}
            style={{ borderRadius: 'var(--radius-plate)' }}
          >
            {cell.glyph}
          </button>
        )
      })}
    </div>
  )
}
