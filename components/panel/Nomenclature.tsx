'use client'

import { clsx } from 'clsx'
import { useMemo, useState } from 'react'
import { resolveProject } from '@/lib/budget'
import { MODE_LABEL } from '@/lib/format'
import { PROJECTS } from '@/lib/projects'
import { useStudy } from '@/lib/store'
import type { Mode } from '@/lib/types'
import { ModePicto } from '@/components/icons'
import { ProjectRow } from './ProjectRow'

type Order = 'cout' | 'voyageurs' | 'rendement'

const ORDERS: { id: Order; label: string; hint: string }[] = [
  { id: 'cout', label: 'Coût', hint: 'Du plus cher au moins cher' },
  { id: 'voyageurs', label: 'Voyageurs', hint: 'Du plus fréquenté au moins fréquenté' },
  { id: 'rendement', label: 'Rendement', hint: 'Voyageurs gagnés par million d’euros engagé' },
]

const MODES: Mode[] = ['metro', 'renovation', 'tram', 'bus', 'cable', 'fluvial']

export function Nomenclature({ className }: { className?: string }) {
  const selections = useStudy((s) => s.selections)
  const [order, setOrder] = useState<Order>('cout')
  const [modes, setModes] = useState<Set<Mode>>(new Set())

  const selectionById = useMemo(
    () => new Map(selections.map((s) => [s.projectId, s])),
    [selections],
  )

  const rows = useMemo(() => {
    const resolved = PROJECTS.map((project) => ({
      project,
      selection: selectionById.get(project.id),
      figures: resolveProject(project, selectionById.get(project.id)),
    }))

    const filtered =
      modes.size === 0 ? resolved : resolved.filter((row) => modes.has(row.figures.mode))

    return filtered.sort((a, b) => {
      if (order === 'voyageurs') return b.figures.ridership - a.figures.ridership
      if (order === 'rendement') {
        return b.figures.ridership / b.figures.cost - a.figures.ridership / a.figures.cost
      }
      return b.figures.cost - a.figures.cost
    })
  }, [modes, order, selectionById])

  const toggleMode = (mode: Mode) => {
    setModes((current) => {
      const next = new Set(current)
      if (next.has(mode)) next.delete(mode)
      else next.add(mode)
      return next
    })
  }

  return (
    <div className={clsx('flex min-h-0 flex-col', className)}>
      <div className="shrink-0 border-b border-ink-rule px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[14px] font-bold leading-none">Les ouvrages à arbitrer</h2>
          <span className="shrink-0 text-[12px] font-bold text-chalk-dim lining">
            {selections.length}/{PROJECTS.length}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1">
          {MODES.map((mode) => {
            const active = modes.has(mode)
            return (
              <button
                key={mode}
                type="button"
                onClick={() => toggleMode(mode)}
                aria-pressed={active}
                title={MODE_LABEL[mode]}
                className={clsx(
                  'flex h-7 w-7 items-center justify-center transition-colors duration-150',
                  active ? 'bg-signal text-ink' : 'bg-ink-lift text-chalk-dim hover:text-chalk',
                )}
                style={{
                  borderRadius: 'var(--radius-plate)',
                  ['--picto-hole' as string]: active ? 'var(--color-signal)' : 'var(--color-ink-lift)',
                }}
              >
                <ModePicto mode={mode} className="h-4 w-4" />
                <span className="sr-only">{MODE_LABEL[mode]}</span>
              </button>
            )
          })}

          <div className="ml-auto flex items-center gap-px">
            {ORDERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOrder(item.id)}
                aria-pressed={order === item.id}
                title={item.hint}
                className={clsx(
                  'h-7 px-2 text-[11px] font-bold transition-colors duration-150',
                  order === item.id
                    ? 'bg-signal text-ink'
                    : 'text-chalk-dim hover:text-chalk',
                )}
                style={{ borderRadius: 'var(--radius-plate)' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {rows.map((row) => (
          <ProjectRow
            key={row.project.id}
            project={row.project}
            selection={row.selection}
          />
        ))}
        {rows.length === 0 ? (
          <li className="px-4 py-10 text-center text-[13px] leading-relaxed text-chalk-dim">
            Aucun ouvrage dans ce mode. Désélectionnez un pictogramme pour revoir la liste
            complète.
          </li>
        ) : null}
      </ul>
    </div>
  )
}
