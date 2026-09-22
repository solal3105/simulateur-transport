'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'

import { resolveProject } from '@/lib/budget'
import { millions } from '@/lib/format'
import { PROJECT_NUMBER } from '@/lib/projects'
import { useStudy } from '@/lib/store'
import type { Project, Selection } from '@/lib/types'
import { ModePicto } from '@/components/icons'

/**
 * La plaque d'un ouvrage retenu, posée au milieu de son tracé.
 * Elle ne s'affiche que pour ce qui est inscrit au programme : le plan
 * montre d'abord ce que le joueur a décidé.
 */
export function PlanPlate({
  maplibre,
  map,
  position,
  project,
  selection,
}: {
  maplibre: typeof import('maplibre-gl')
  map: MapLibreMap
  position: [number, number]
  project: Project
  selection: Selection
}) {
  const host = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [mounted, setMounted] = useState(false)

  const hovered = useStudy((s) => s.hovered)
  const setHovered = useStudy((s) => s.setHovered)
  const setFocused = useStudy((s) => s.setFocused)

  if (!host.current && typeof document !== 'undefined') {
    host.current = document.createElement('div')
  }

  useEffect(() => {
    if (!host.current) return
    const marker = new maplibre.Marker({ element: host.current, anchor: 'center' })
      .setLngLat(position)
      .addTo(map)
    markerRef.current = marker
    setMounted(true)
    return () => {
      marker.remove()
      markerRef.current = null
    }
  }, [map, maplibre, position])

  useEffect(() => {
    markerRef.current?.setLngLat(position)
  }, [position])

  if (!host.current || !mounted) return null

  const resolved = resolveProject(project, selection)
  const secondPhase = selection.phase === 'M2'
  const lit = hovered === project.id
  const tone = secondPhase ? 'text-chalk' : 'text-signal'
  const edge = secondPhase ? 'border-chalk' : 'border-signal'

  return createPortal(
    <div className="relative">
      <button
        type="button"
        onMouseEnter={() => setHovered(project.id)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(project.id)}
        onBlur={() => setHovered(null)}
        onClick={() => setFocused(project.id)}
        aria-label={`${project.name}, ${millions(resolved.cost)} millions d’euros`}
        className={`flex h-8 w-8 items-center justify-center border-2 bg-ink transition-transform duration-200 ease-[var(--ease-sign)] ${edge} ${
          lit ? 'scale-125' : 'scale-100'
        }`}
        style={{ borderRadius: 'var(--radius-plate)' }}
      >
        <ModePicto mode={resolved.mode} className={`h-4 w-4 ${tone}`} />
      </button>

      <span
        aria-hidden
        className={`pointer-events-none absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center px-1 font-mono text-[9px] font-bold lining ${
          secondPhase ? 'bg-chalk text-ink' : 'bg-signal text-ink'
        }`}
        style={{ borderRadius: 'var(--radius-plate)' }}
      >
        {PROJECT_NUMBER.get(project.id)}
      </span>

      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max max-w-56 -translate-x-1/2 border border-ink-rule bg-ink px-2.5 py-1.5 transition-opacity duration-150 ${
          lit ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ borderRadius: 'var(--radius-plate)' }}
      >
        <p className="text-[12px] font-bold leading-tight text-chalk">{project.name}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-chalk-dim lining">
          {millions(resolved.cost)} M€ · {secondPhase ? 'phase 2' : selection.phase === 'M1M2' ? 'les deux phases' : 'phase 1'}
        </p>
      </div>
    </div>,
    host.current,
  )
}
