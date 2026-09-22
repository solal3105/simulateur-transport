'use client'

import type { Feature, FeatureCollection, LineString, Point, Polygon } from 'geojson'
import { Map as CarteMaplibre, Marker, setWorkerUrl, type GeoJSONSource, type MapLayerMouseEvent, type MapMouseEvent, type StyleSpecification } from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CATALOGUE, MANDATS } from '@/lib/catalogue'
import { useDonnees, type Donnees } from '@/lib/donnees'
import { n } from '@/lib/format'
import { carreau, cercle, LIEUX, milieu } from '@/lib/geo'
import { ouverture, resoudre } from '@/lib/regles'
import { useJeu } from '@/lib/store'

// Le worker est copié dans public/maplibre par scripts/copier-maplibre.mjs.
if (typeof window !== 'undefined') setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

const COULEURS = {
  rouge: '#e3051b',
  encre: '#1b1b1f',
  sable: '#f5f3f0',
  fleuve: '#cfe2ec',
  tram: '#d9d5cf',
  metro: { A: '#d8336f', B: '#1d6fb8', C: '#f29a1f', D: '#2e9e4f' },
}

/** Emprise de départ : la Métropole, du Tassin à Meyzieu. */
const EMPRISE: [[number, number], [number, number]] = [
  [4.74, 45.69],
  [5.02, 45.83],
]

type EtatProjet = 'etude' | 'construit' | 'chantier' | 'choisi' | 'indisponible'

const largeur = (base: number) =>
  ['interpolate', ['exponential', 1.5], ['zoom'], 10, base * 0.6, 13, base * 1.4, 15, base * 3] as unknown as number

function styleDeBase(donnees: Donnees): StyleSpecification {
  const densite: FeatureCollection<Polygon, { poids: number }> = {
    type: 'FeatureCollection',
    features: donnees.carreauxBruts
      .map(([lon, lat, pop, jobs]) => ({ poids: pop! + 0.3 * jobs!, lon: lon!, lat: lat! }))
      .filter((c) => c.poids >= 150)
      .map((c) => ({
        type: 'Feature',
        properties: { poids: c.poids },
        geometry: { type: 'Polygon', coordinates: [carreau(c.lon, c.lat)] },
      })),
  }
  const vide = { type: 'FeatureCollection', features: [] } as FeatureCollection
  return {
    version: 8,
    sources: {
      fond: { type: 'geojson', data: donnees.fond },
      projets: { type: 'geojson', data: donnees.projets },
      densite: { type: 'geojson', data: densite },
      joueur: { type: 'geojson', data: vide },
      brouillon: { type: 'geojson', data: vide },
      zones: { type: 'geojson', data: vide },
    },
    layers: [
      { id: 'sol', type: 'background', paint: { 'background-color': COULEURS.sable } },
      {
        id: 'densite',
        type: 'fill',
        source: 'densite',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': COULEURS.rouge,
          'fill-opacity': ['interpolate', ['linear'], ['get', 'poids'], 150, 0.06, 600, 0.18, 1500, 0.34, 3000, 0.55],
        },
      },
      {
        id: 'fleuves',
        type: 'line',
        source: 'fond',
        filter: ['==', ['get', 'kind'], 'fleuve'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.fleuve, 'line-width': largeur(9) },
      },
      {
        id: 'tram-actuel',
        type: 'line',
        source: 'fond',
        filter: ['==', ['get', 'kind'], 'tram'],
        paint: { 'line-color': COULEURS.tram, 'line-width': largeur(1.6) },
      },
      {
        id: 'metro-actuel',
        type: 'line',
        source: 'fond',
        filter: ['==', ['get', 'kind'], 'metro'],
        layout: { 'line-cap': 'round' },
        paint: {
          'line-color': ['match', ['get', 'line'], 'A', COULEURS.metro.A, 'B', COULEURS.metro.B, 'C', COULEURS.metro.C, COULEURS.metro.D],
          'line-opacity': 0.55,
          'line-width': largeur(2.8),
        },
      },
      {
        id: 'projets-etude',
        type: 'line',
        source: 'projets',
        filter: ['!', ['in', ['get', 'etat'], ['literal', ['construit', 'chantier', 'choisi']]]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': COULEURS.encre,
          'line-opacity': ['case', ['==', ['get', 'etat'], 'indisponible'], 0.25, 0.8],
          'line-width': largeur(2.2),
          'line-dasharray': [2, 1.6],
        },
      },
      {
        id: 'projets-liseré',
        type: 'line',
        source: 'projets',
        filter: ['in', ['get', 'etat'], ['literal', ['construit', 'chantier', 'choisi']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#fff', 'line-width': largeur(9) },
      },
      {
        id: 'projets-construits',
        type: 'line',
        source: 'projets',
        filter: ['==', ['get', 'etat'], 'construit'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.rouge, 'line-width': largeur(5.5) },
      },
      {
        id: 'projets-chantier',
        type: 'line',
        source: 'projets',
        filter: ['==', ['get', 'etat'], 'chantier'],
        paint: { 'line-color': COULEURS.rouge, 'line-width': largeur(5.5), 'line-dasharray': [0.6, 0.6] },
      },
      {
        id: 'projets-choisi',
        type: 'line',
        source: 'projets',
        filter: ['==', ['get', 'etat'], 'choisi'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.encre, 'line-width': largeur(5.5) },
      },
      {
        id: 'projets-cible',
        type: 'line',
        source: 'projets',
        paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 22 },
      },
      {
        id: 'joueur-liseré',
        type: 'line',
        source: 'joueur',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#fff', 'line-width': largeur(9) },
      },
      {
        id: 'joueur',
        type: 'line',
        source: 'joueur',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.rouge, 'line-width': largeur(5.5) },
      },
      {
        id: 'zones',
        type: 'fill',
        source: 'zones',
        paint: { 'fill-color': COULEURS.encre, 'fill-opacity': 0.06, 'fill-outline-color': 'rgba(27,27,31,0.4)' },
      },
      {
        id: 'brouillon-liseré',
        type: 'line',
        source: 'brouillon',
        filter: ['==', ['geometry-type'], 'LineString'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#fff', 'line-width': largeur(10) },
      },
      {
        id: 'brouillon-ligne',
        type: 'line',
        source: 'brouillon',
        filter: ['==', ['geometry-type'], 'LineString'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.encre, 'line-width': largeur(5.5) },
      },
      {
        id: 'brouillon-arrets',
        type: 'circle',
        source: 'brouillon',
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius': ['case', ['get', 'dernier'], 8, 6],
          'circle-color': ['case', ['get', 'dernier'], COULEURS.rouge, '#fff'],
          'circle-stroke-color': COULEURS.encre,
          'circle-stroke-width': 2.5,
        },
      },
    ],
  }
}

export function Carte({
  marges,
  decor = false,
}: {
  marges: { top: number; right: number; bottom: number; left: number }
  /** Carte d'illustration : pas de clic sur les projets, pas d'étiquettes. */
  decor?: boolean
}) {
  const donnees = useDonnees()
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<CarteMaplibre | null>(null)
  const [etiquettes] = useState(() => new Map<string, HTMLButtonElement>())
  const pret = useRef(false)
  const appliquerEtat = useRef<() => void>(() => {})

  const { chantiers, lignes, brouillon, panneau, ecran, tuto } = useJeu()
  const trace = brouillon !== null

  // État de chaque projet du catalogue, par nom de tracé.
  const etats = useMemo(() => {
    const etat = new Map<string, EtatProjet>()
    const faits = new Map(chantiers.map((c) => [c.id, c]))
    for (const p of CATALOGUE) {
      if (!p.trace) continue
      const c = faits.get(p.id)
      let e: EtatProjet = 'etude'
      if (c) e = ouverture(c.mandat, resoudre(p, c).duree) > MANDATS[2].fin ? 'chantier' : 'construit'
      else if (p.requiert && !faits.has(p.requiert)) e = 'indisponible'
      if (panneau?.type === 'projet' && panneau.id === p.id) e = 'choisi'
      if (ecran === 'tuto' && tuto === 0 && p.id === 't8') e = 'choisi'
      etat.set(p.trace, e)
    }
    return etat
  }, [chantiers, panneau, ecran, tuto])

  // Création de la carte.
  useEffect(() => {
    if (!donnees || !conteneur.current || carte.current) return
    const m = new CarteMaplibre({
      container: conteneur.current,
      style: styleDeBase(donnees),
      bounds: EMPRISE,
      fitBoundsOptions: { padding: 20 },
      minZoom: 9.5,
      maxZoom: 16,
      maxBounds: [
        [4.55, 45.6],
        [5.2, 45.92],
      ],
      attributionControl: { compact: true, customAttribution: '© OpenStreetMap, INSEE' },
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    })
    m.touchZoomRotate.disableRotation()
    carte.current = m

    for (const lieu of LIEUX) {
      const el = document.createElement('div')
      el.className = 'lieu'
      el.dataset.grand = lieu.grand ? '1' : '0'
      el.textContent = lieu.nom
      new Marker({ element: el }).setLngLat(lieu.pos).addTo(m)
    }

    for (const f of donnees.projets.features) {
      const projet = CATALOGUE.find((p) => p.trace === f.properties.id)
      if (!projet) continue
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'etiquette'
      el.setAttribute('aria-label', `${projet.nom}, ${n(projet.cout)} millions d'euros`)
      el.textContent = n(resoudre(projet).cout)
      if (decor) el.hidden = true
      el.addEventListener('click', (ev) => {
        ev.stopPropagation()
        if (useJeu.getState().brouillon) return
        useJeu.getState().ouvrir({ type: 'projet', id: projet.id })
      })
      new Marker({ element: el }).setLngLat(milieu(f.geometry)).addTo(m)
      etiquettes.set(f.properties.id, el)
    }

    m.on('click', 'projets-cible', (e: MapLayerMouseEvent) => {
      if (decor || useJeu.getState().brouillon) return
      const id = e.features?.[0]?.properties?.id as string | undefined
      const projet = CATALOGUE.find((p) => p.trace === id)
      if (projet) useJeu.getState().ouvrir({ type: 'projet', id: projet.id })
    })
    m.on('mouseenter', 'projets-cible', () => {
      if (!decor && !useJeu.getState().brouillon) m.getCanvas().style.cursor = 'pointer'
    })
    m.on('mouseleave', 'projets-cible', () => {
      m.getCanvas().style.cursor = useJeu.getState().brouillon ? 'crosshair' : ''
    })
    m.on('click', (e: MapMouseEvent) => {
      if (useJeu.getState().brouillon) useJeu.getState().ajouterArret([e.lngLat.lng, e.lngLat.lat])
    })
    m.on('load', () => {
      pret.current = true
      appliquerEtat.current()
    })
    return () => {
      m.remove()
      carte.current = null
      pret.current = false
      etiquettes.clear()
    }
  }, [donnees, decor, etiquettes])

  // Mise à jour des états, des étiquettes et du mode tracé.
  useEffect(() => {
    const m = carte.current
    if (!m) return
    const appliquer = () => {
      if (!pret.current) return
      if (donnees) {
        ;(m.getSource('projets') as GeoJSONSource).setData({
          ...donnees.projets,
          features: donnees.projets.features.map((f) => ({
            ...f,
            properties: { ...f.properties, etat: etats.get(f.properties.id) ?? 'etude' },
          })),
        })
      }
      for (const [nomTrace, etat] of etats) {
        const el = etiquettes.get(nomTrace)
        if (!el) continue
        el.dataset.etat = etat
        const projet = CATALOGUE.find((p) => p.trace === nomTrace)
        const c = projet && chantiers.find((x) => x.id === projet.id)
        el.textContent = etat === 'construit' ? 'Construit' : etat === 'chantier' ? 'En chantier' : projet ? n(resoudre(projet, c).cout) : ''
      }
      for (const el of etiquettes.values()) el.style.display = trace || decor ? 'none' : ''
      m.setLayoutProperty('densite', 'visibility', trace ? 'visible' : 'none')
      m.getCanvas().style.cursor = trace ? 'crosshair' : ''

      const joueur: FeatureCollection<LineString> = {
        type: 'FeatureCollection',
        features: lignes.map((l) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: l.arrets } })),
      }
      ;(m.getSource('joueur') as GeoJSONSource).setData(joueur)

      const arrets = brouillon?.arrets ?? []
      const traits: Feature<LineString | Point>[] = []
      if (arrets.length >= 2) traits.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: arrets } })
      arrets.forEach((a, i) =>
        traits.push({ type: 'Feature', properties: { dernier: i === arrets.length - 1 }, geometry: { type: 'Point', coordinates: a } }),
      )
      ;(m.getSource('brouillon') as GeoJSONSource).setData({ type: 'FeatureCollection', features: traits })
      const rayon = brouillon?.mode === 'metro' ? 600 : 400
      ;(m.getSource('zones') as GeoJSONSource).setData({ type: 'FeatureCollection', features: arrets.map((a) => cercle(a, rayon)) })
    }
    appliquerEtat.current = appliquer
    appliquer()
  }, [etats, lignes, brouillon, trace, chantiers, donnees, decor, etiquettes])

  // Pendant la première étape du tutoriel, la carte montre le T8 au-dessus de l'explication.
  useEffect(() => {
    const m = carte.current
    const t8 = donnees?.projets.features.find((f) => f.properties.id === 't8')
    if (!m || !t8 || ecran !== 'tuto' || tuto !== 0) return
    const points = t8.geometry.coordinates.flat()
    const lons = points.map((p) => p[0]!)
    const lats = points.map((p) => p[1]!)
    const grand = window.innerWidth >= 1024
    const cadrer = () =>
      m.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        { padding: grand ? { top: 160, bottom: 80, left: 120, right: 480 } : { top: 190, bottom: 360, left: 60, right: 60 }, maxZoom: 13, duration: 800 },
      )
    if (pret.current) cadrer()
    else m.once('load', cadrer)
  }, [donnees, ecran, tuto])

  // Recadrage quand les panneaux changent de taille.
  useEffect(() => {
    const m = carte.current
    if (!m) return
    m.easeTo({ padding: marges, duration: 300 })
  }, [marges])

  return (
    <div className="absolute inset-0">
      <div ref={conteneur} className="h-full w-full" />
      {!donnees ? (
        <div className="absolute inset-0 grid place-items-center bg-sable text-sm font-bold text-muet">Chargement de la carte</div>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {trace ? `${brouillon?.arrets.length ?? 0} arrêts posés` : ''}
      </span>
    </div>
  )
}
