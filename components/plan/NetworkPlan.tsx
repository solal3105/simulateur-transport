'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GeoJSONSource, Map as MapLibreMap, LngLatBoundsLike } from 'maplibre-gl'
import type { Feature, FeatureCollection, LineString, MultiLineString } from 'geojson'

import { resolveProject } from '@/lib/budget'
import { MODE_WEIGHT } from '@/lib/format'
import { PALETTE, PLAN_PALETTE } from '@/lib/palette'
import { PROJECTS_BY_ID } from '@/lib/projects'
import { useStudy } from '@/lib/store'
import type { Selection } from '@/lib/types'
import { framing, loadBasemap } from './basemap'
import { PlanControls } from './PlanControls'
import { PlanPlate } from './PlanPlate'

const { signal: SIGNAL, chalk: CHALK, plate: PLATE } = PALETTE
const { study: STUDY } = PLAN_PALETTE

interface Anchor {
  anchor: [number, number]
  ends: [[number, number], [number, number]]
  bounds: [number, number, number, number]
}
type Anchors = Record<string, Anchor>

type TraceFeature = Feature<LineString | MultiLineString, Record<string, unknown>>

function decorate(raw: FeatureCollection, selections: Selection[]): FeatureCollection {
  const byId = new Map(selections.map((s) => [s.projectId, s]))

  return {
    type: 'FeatureCollection',
    features: raw.features.map((feature) => {
      const id = String((feature.properties as { id?: string })?.id ?? feature.id ?? '')
      const project = PROJECTS_BY_ID.get(id)
      const selection = byId.get(id)
      const resolved = project ? resolveProject(project, selection) : null

      return {
        ...feature,
        id,
        properties: {
          id,
          retained: Boolean(selection),
          phase: selection?.phase ?? '',
          weight: resolved ? MODE_WEIGHT[resolved.mode] : 4,
        },
      } as TraceFeature
    }),
  }
}

function terminusPoints(anchors: Anchors, selections: Selection[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: selections.flatMap((selection) => {
      const anchor = anchors[selection.projectId]
      if (!anchor) return []
      return anchor.ends.map((position, index) => ({
        type: 'Feature' as const,
        id: `${selection.projectId}-${index}`,
        properties: { phase: selection.phase },
        geometry: { type: 'Point' as const, coordinates: position },
      }))
    }),
  }
}

/**
 * L'épaisseur d'un tracé combine le mode de l'ouvrage et le zoom. MapLibre exige
 * que `zoom` soit l'entrée d'un `interpolate` de premier niveau : le facteur de
 * mode vit donc dans les sorties, jamais autour de l'interpolation.
 */
const STOPS: [number, number][] = [
  [9, 0.5],
  [12, 0.85],
  [15, 1.35],
]

function lineWidth(scale = 1, add = 0) {
  const weight = ['coalesce', ['get', 'weight'], 4]
  return [
    'interpolate',
    ['exponential', 1.25],
    ['zoom'],
    ...STOPS.flatMap(([zoom, factor]) => [
      zoom,
      add === 0
        ? ['*', weight, factor * scale]
        : ['+', ['*', weight, factor * scale], add],
    ]),
  ] as unknown as never
}

export function NetworkPlan() {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const rawRef = useRef<FeatureCollection | null>(null)
  const [anchors, setAnchors] = useState<Anchors | null>(null)
  const [glReady, setGlReady] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [markerFactory, setMarkerFactory] = useState<typeof import('maplibre-gl') | null>(null)

  const selections = useStudy((s) => s.selections)
  const hovered = useStudy((s) => s.hovered)
  const focused = useStudy((s) => s.focused)
  const drawing = useStudy((s) => s.drawing)
  const setHovered = useStudy((s) => s.setHovered)
  const setFocused = useStudy((s) => s.setFocused)
  const clearDrawing = useStudy((s) => s.clearDrawing)

  const selectionsRef = useRef(selections)
  selectionsRef.current = selections

  /* Mise en place de la carte, une seule fois. */
  useEffect(() => {
    let cancelled = false
    const abort = new AbortController()

    async function start() {
      try {
        const [maplibre, style, network, anchorData] = await Promise.all([
          import('maplibre-gl'),
          loadBasemap(abort.signal),
          fetch('/data/reseau.geojson', { signal: abort.signal }).then((r) => r.json()),
          fetch('/data/ancres.json', { signal: abort.signal }).then((r) => r.json()),
        ])
        if (cancelled || !container.current) return

        rawRef.current = network as FeatureCollection
        setAnchors(anchorData as Anchors)
        setMarkerFactory(maplibre)

        const box = container.current.getBoundingClientRect()
        const map = new maplibre.Map({
          container: container.current,
          style,
          bounds: framing(box.width, box.height) as LngLatBoundsLike,
          fitBoundsOptions: { padding: 28 },
          minZoom: 8.5,
          maxZoom: 16,
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: false },
        })
        map.touchZoomRotate.disableRotation()
        map.keyboard.enable()
        mapRef.current = map

        map.on('load', () => {
          if (cancelled) return
          const firstLabel = map.getStyle().layers?.find((l) => l.type === 'symbol')?.id

          map.addSource('reseau', {
            type: 'geojson',
            data: decorate(rawRef.current!, selectionsRef.current),
            lineMetrics: true,
            promoteId: 'id',
          })
          map.addSource('terminus', {
            type: 'geojson',
            data: terminusPoints(anchorData as Anchors, selectionsRef.current),
          })

          map.addLayer(
            {
              id: 'trace-halo',
              type: 'line',
              source: 'reseau',
              filter: ['==', ['get', 'id'], ''],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-color': SIGNAL,
                'line-width': lineWidth(1, 14),
                'line-blur': 10,
                'line-opacity': 0.4,
              },
            },
            firstLabel,
          )

          map.addLayer(
            {
              id: 'trace-etude',
              type: 'line',
              source: 'reseau',
              filter: ['!=', ['get', 'retained'], true],
              layout: { 'line-cap': 'butt', 'line-join': 'round' },
              paint: {
                'line-color': STUDY,
                'line-width': lineWidth(0.55),
                'line-dasharray': [1.3, 2],
              },
            },
            firstLabel,
          )

          map.addLayer(
            {
              id: 'trace-casing',
              type: 'line',
              source: 'reseau',
              filter: ['==', ['get', 'retained'], true],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: { 'line-color': PLATE, 'line-width': lineWidth(1, 5) },
            },
            firstLabel,
          )

          map.addLayer(
            {
              id: 'trace',
              type: 'line',
              source: 'reseau',
              filter: ['==', ['get', 'retained'], true],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-color': ['case', ['==', ['get', 'phase'], 'M2'], CHALK, SIGNAL],
                'line-width': lineWidth(),
              },
            },
            firstLabel,
          )

          // Un ouvrage étalé sur les deux phases porte les deux couleurs.
          map.addLayer(
            {
              id: 'trace-partage',
              type: 'line',
              source: 'reseau',
              filter: ['==', ['get', 'phase'], 'M1M2'],
              layout: { 'line-cap': 'butt', 'line-join': 'round' },
              paint: {
                'line-color': CHALK,
                'line-width': lineWidth(),
                'line-dasharray': [1.6, 1.6],
              },
            },
            firstLabel,
          )

          map.addLayer(
            {
              id: 'trace-draw',
              type: 'line',
              source: 'reseau',
              filter: ['==', ['get', 'id'], ''],
              layout: { 'line-cap': 'round', 'line-join': 'round' },
              paint: {
                'line-width': lineWidth(1, 1),
                'line-gradient': [
                  'step',
                  ['line-progress'],
                  SIGNAL,
                  0.0001,
                  'rgba(0,0,0,0)',
                ] as never,
              },
            },
            firstLabel,
          )

          map.addLayer(
            {
              id: 'terminus',
              type: 'circle',
              source: 'terminus',
              paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2.6, 14, 5.4],
                'circle-color': PLATE,
                'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 10, 1.4, 14, 2.6],
                'circle-stroke-color': [
                  'case',
                  ['==', ['get', 'phase'], 'M2'],
                  CHALK,
                  SIGNAL,
                ],
              },
            },
            firstLabel,
          )

          map.addLayer(
            {
              id: 'trace-hit',
              type: 'line',
              source: 'reseau',
              paint: { 'line-color': PLATE, 'line-opacity': 0, 'line-width': 22 },
            },
            firstLabel,
          )

          map.on('mousemove', 'trace-hit', (event) => {
            const id = event.features?.[0]?.properties?.id
            if (typeof id === 'string') {
              map.getCanvas().style.cursor = 'pointer'
              setHovered(id)
            }
          })
          map.on('mouseleave', 'trace-hit', () => {
            map.getCanvas().style.cursor = ''
            setHovered(null)
          })
          map.on('click', 'trace-hit', (event) => {
            const id = event.features?.[0]?.properties?.id
            if (typeof id === 'string') setFocused(id)
          })

          map.resize()
          requestAnimationFrame(() => {
            map.resize()
            const current = map.getContainer().getBoundingClientRect()
            map.fitBounds(framing(current.width, current.height) as LngLatBoundsLike, {
              padding: 28,
              duration: 0,
            })
          })
          setGlReady(true)
        })

        map.on('error', (event) => {
          if (event.error?.message) console.warn('[plan]', event.error.message)
        })
      } catch (error) {
        if (cancelled || (error as Error).name === 'AbortError') return
        setFailure(
          "Le fond de carte n'a pas pu être chargé. Les tracés et les enveloppes restent utilisables.",
        )
      }
    }

    start()

    return () => {
      cancelled = true
      abort.abort()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [setFocused, setHovered])

  /* Les tracés suivent la sélection. */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !glReady || !rawRef.current || !anchors) return
    ;(map.getSource('reseau') as GeoJSONSource | undefined)?.setData(
      decorate(rawRef.current, selections),
    )
    ;(map.getSource('terminus') as GeoJSONSource | undefined)?.setData(
      terminusPoints(anchors, selections),
    )
  }, [selections, glReady, anchors])

  /* L'ouvrage survolé ou ouvert se détache du reste du plan. */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !glReady) return
    const lit = [hovered, focused].filter(Boolean) as string[]
    map.setFilter('trace-halo', ['in', ['get', 'id'], ['literal', lit]])
  }, [hovered, focused, glReady])

  /* Le tracé s'écrit d'un terminus à l'autre au moment où l'ouvrage entre au plan. */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !glReady) return

    if (!drawing) {
      map.setFilter('trace', ['==', ['get', 'retained'], true])
      map.setFilter('trace-draw', ['==', ['get', 'id'], ''])
      return
    }

    const selection = selections.find((s) => s.projectId === drawing)
    const color = selection?.phase === 'M2' ? CHALK : SIGNAL
    // La caméra n'élargit que si le nouveau tracé sort du cadre. Elle ne
    // rapproche jamais d'elle-même : on ne retire pas au joueur sa vue d'ensemble.
    const anchor = anchors?.[drawing]
    if (anchor) {
      const view = map.getBounds()
      const [west, south, east, north] = anchor.bounds
      const visible =
        view.getWest() <= west &&
        view.getEast() >= east &&
        view.getSouth() <= south &&
        view.getNorth() >= north

      if (!visible) {
        map.fitBounds(
          [
            [Math.min(view.getWest(), west), Math.min(view.getSouth(), south)],
            [Math.max(view.getEast(), east), Math.max(view.getNorth(), north)],
          ],
          { padding: 40, duration: 900 },
        )
      }
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      clearDrawing(drawing)
      return
    }

    map.setFilter('trace', [
      'all',
      ['==', ['get', 'retained'], true],
      ['!=', ['get', 'id'], drawing],
    ])
    map.setFilter('trace-draw', ['==', ['get', 'id'], drawing])

    let frame = 0
    const began = performance.now()
    const duration = 1000

    const step = (now: number) => {
      const t = Math.min(1, (now - began) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const progress = Math.min(0.9999, Math.max(0.0001, eased))
      map.setPaintProperty('trace-draw', 'line-gradient', [
        'step',
        ['line-progress'],
        color,
        progress,
        'rgba(0,0,0,0)',
      ] as never)
      if (t < 1) {
        frame = requestAnimationFrame(step)
      } else {
        clearDrawing(drawing)
      }
    }
    frame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frame)
    // selections volontairement absent : seul le début d'un tracé relance l'écriture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing, glReady, anchors, clearDrawing])

  const zoomBy = useCallback((delta: number) => {
    const map = mapRef.current
    if (!map) return
    map.easeTo({ zoom: map.getZoom() + delta, duration: 260 })
  }, [])

  const recentre = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const box = map.getContainer().getBoundingClientRect()
    map.fitBounds(framing(box.width, box.height) as LngLatBoundsLike, {
      padding: 28,
      duration: 700,
    })
  }, [])

  const plates = useMemo(() => {
    if (!anchors) return []
    return selections
      .map((selection) => {
        const project = PROJECTS_BY_ID.get(selection.projectId)
        const anchor = anchors[selection.projectId]
        if (!project || !anchor) return null
        return { key: selection.projectId, position: anchor.anchor, project, selection }
      })
      .filter((plate): plate is NonNullable<typeof plate> => plate !== null)
  }, [anchors, selections])

  return (
    <div className="on-plate relative h-full w-full overflow-hidden rounded-[var(--radius-inset)] bg-plate">
      {/* MapLibre impose `position: relative` à son conteneur : on lui donne donc
          sa taille par les dimensions, pas par un positionnement absolu. */}
      <div
        ref={container}
        className="h-full w-full"
        role="region"
        aria-label="Plan des ouvrages de la Métropole de Lyon"
      />

      {!glReady && !failure ? (
        <div className="absolute inset-0 grid place-items-center">
          <p className="sign-label text-chalk-dim">Chargement du plan</p>
        </div>
      ) : null}

      {failure ? (
        <div className="absolute inset-0 grid place-items-center px-8">
          <p className="max-w-sm text-center text-sm leading-relaxed text-chalk-dim">{failure}</p>
        </div>
      ) : null}

      {markerFactory && mapRef.current && glReady
        ? plates.map((plate) => (
            <PlanPlate
              key={plate.key}
              maplibre={markerFactory}
              map={mapRef.current!}
              position={plate.position}
              project={plate.project}
              selection={plate.selection}
            />
          ))
        : null}

      <PlanControls onZoom={zoomBy} onRecentre={recentre} />
    </div>
  )
}
