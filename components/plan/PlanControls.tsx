'use client'

import { useStudy } from '@/lib/store'
import { Restart } from '@/components/icons'

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center border border-ink-rule bg-ink text-signal transition-colors duration-150 hover:bg-signal hover:text-ink"
      style={{ borderRadius: 'var(--radius-plate)' }}
    >
      {children}
    </button>
  )
}

export function PlanControls({
  onZoom,
  onRecentre,
}: {
  onZoom: (delta: number) => void
  onRecentre: () => void
}) {
  const setStage = useStudy((s) => s.setStage)

  return (
    <div className="absolute right-3 top-3 flex flex-col gap-1.5">
      <ControlButton label="Revoir la règle du jeu" onClick={() => setStage('briefing')}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <path d="M12 1.8c-3.2 0-5.8 2.4-5.8 5.4h3.4c0-1.3 1.1-2.3 2.4-2.3s2.4 1 2.4 2.3c0 1-.5 1.5-1.7 2.3-1.4 1-2.4 2-2.4 4.1v1h3.4v-.8c0-1 .4-1.4 1.6-2.2 1.5-1 2.5-2.1 2.5-4.4 0-3-2.6-5.4-5.8-5.4Zm-1.9 16.4a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 0 0-3.8 0Z" />
        </svg>
      </ControlButton>
      <ControlButton label="Agrandir le plan" onClick={() => onZoom(0.8)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <path d="M10.3 3h3.4v7.3H21v3.4h-7.3V21h-3.4v-7.3H3v-3.4h7.3V3Z" />
        </svg>
      </ControlButton>
      <ControlButton label="Réduire le plan" onClick={() => onZoom(-0.8)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <path d="M3 10.3h18v3.4H3v-3.4Z" />
        </svg>
      </ControlButton>
      <ControlButton label="Revenir sur la Métropole" onClick={onRecentre}>
        <Restart className="h-4 w-4" aria-hidden />
      </ControlButton>
    </div>
  )
}
