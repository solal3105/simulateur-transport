'use client'

import type { Feature, FeatureCollection, LineString, MultiLineString, Point, Polygon } from 'geojson'
import {
  Map as CarteMaplibre,
  Marker,
  Popup,
  setWorkerUrl,
  type FilterSpecification,
  type GeoJSONSource,
  type MapLayerMouseEvent,
  type MapMouseEvent,
  type MapTouchEvent,
  type StyleSpecification,
  type SymbolLayerSpecification,
} from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CATALOGUES, debutMandat, horizon, mots } from '@/lib/catalogue'
import { couleurLigne, couleurProjet } from '@/lib/couleurs'
import { adresseDonnees, useDonnees, type Donnees } from '@/lib/donnees'
import { n } from '@/lib/format'
import { FORMULE } from '@/lib/formule'
import { carreau, cercle, milieu, pointsLeLong } from '@/lib/geo'
import { rayonBassin, stationsDuTrace } from '@/lib/modele'
import { direLignes, direOuvertures, nommerTrace, terminusProche, type ModeExistant } from '@/lib/reseau'
import { ouverture, resoudre } from '@/lib/regles'
import { useJeu } from '@/lib/store'
import { VILLES, type IdVille, type Ville } from '@/lib/villes'

import { imagePastille } from './pastilles'
import { imageRelief } from './relief'

// Le worker est copié dans public/maplibre par scripts/copier-maplibre.mjs.
if (typeof window !== 'undefined') setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

/** Les couleurs du fond de carte ; la couleur du réseau (zones denses, dernier arrêt) vient de lib/villes. */
const COULEURS = {
  encre: '#1b1b1f',
  sol: '#f4f1ec',
  parc: '#dfe8d2',
  eau: '#c6dde9',
  route: '#ffffff',
  bordRoute: '#e3ddd4',
  rail: '#bdb6ac',
  limite: '#cfc8bd',
  // Chaque ligne du réseau actuel a sa couleur. Le gris reste pour les voies qu'aucune ligne en service n'emprunte
  // encore, comme celles des lignes en chantier, et pour une ligne dont on ne connaît pas la couleur.
  tram: '#9a9288',
  metroActuel: '#5d5852',
  gare: '#3f3a35',
}

/** En deçà de ce zoom, les noms de quartiers restent cachés. */
const ZOOM_QUARTIERS = 13
/** À partir de ce zoom, les gares montrent leur nom. */
const ZOOM_GARES = 12
/** En deçà de ce zoom, les lignes existantes ne portent pas leur nom, pour laisser la vue d'ensemble lisible. */
const ZOOM_NOMS_LIGNES = 10.5

/** L'ordre de dessin des lignes existantes, du train régional au métro, qui passe dessus. */
const RANG_MODE: Record<ModeExistant, number> = { train: 0, rer: 1, bus: 2, tram: 2, cable: 3, metro: 4 }

type EtatProjet = 'etude' | 'construit' | 'chantier' | 'choisi' | 'indisponible'

/**
 * Des noms qui n'apparaissent qu'en zoomant, ceux des quartiers et des gares : la carte ne porte que ceux des environs
 * de la vue, remis à jour à la fin de chaque déplacement. L'Île-de-France en compte plus de deux mille, et les poser
 * tous ralentit chaque glissement sur un téléphone.
 */
function poserProches(m: CarteMaplibre, reperes: { pos: [number, number]; marker: Marker }[], zoomMin: number) {
  const poses = new Set<Marker>()
  const actualiser = () => {
    const b = m.getBounds()
    // Une demi-vue de marge de chaque côté : un glissement ne découvre pas de noms manquants.
    const dx = (b.getEast() - b.getWest()) / 2
    const dy = (b.getNorth() - b.getSouth()) / 2
    const proche = m.getZoom() >= zoomMin
    for (const { pos, marker } of reperes) {
      const garder =
        proche && pos[0] > b.getWest() - dx && pos[0] < b.getEast() + dx && pos[1] > b.getSouth() - dy && pos[1] < b.getNorth() + dy
      if (garder && !poses.has(marker)) {
        marker.addTo(m)
        poses.add(marker)
      } else if (!garder && poses.has(marker)) {
        marker.remove()
        poses.delete(marker)
      }
    }
  }
  actualiser()
  m.on('moveend', actualiser)
}

const largeur = (base: number) =>
  ['interpolate', ['exponential', 1.5], ['zoom'], 10, base * 0.6, 13, base * 1.4, 15, base * 3] as unknown as number

/** Largeur selon le zoom et le rang de la route : le zoom doit rester l'expression la plus externe. */
const largeurRang = (grande: number, moyenne: number) =>
  [
    'interpolate',
    ['exponential', 1.5],
    ['zoom'],
    ...[10, 13, 15].flatMap((z, i) => {
      const k = [0.6, 1.4, 3][i]!
      return [z, ['match', ['get', 'rang'], 1, grande * k, moyenne * k]]
    }),
  ] as unknown as number

/** Une largeur par mode pour les lignes existantes ; comme ailleurs, le zoom reste l'expression la plus externe. */
const largeurMode = (base: Record<ModeExistant, number>) =>
  [
    'interpolate',
    ['exponential', 1.5],
    ['zoom'],
    ...[10, 13, 15].flatMap((z, i) => {
      const k = [0.6, 1.4, 3][i]!
      return [z, ['match', ['get', 'mode'], ...Object.entries(base).flatMap(([mode, b]) => [mode, b * k]), base.tram * k]]
    }),
  ] as unknown as number

/** Les pastilles des lignes existantes, espacées d'autant plus qu'on voit loin. */
const nomsLignes = {
  type: 'symbol',
  source: 'lignes',
  minzoom: ZOOM_NOMS_LIGNES,
  layout: {
    'symbol-placement': 'line',
    'symbol-spacing': ['interpolate', ['linear'], ['zoom'], ZOOM_NOMS_LIGNES, 300, 14, 380],
    'symbol-sort-key': ['get', 'priorite'],
    'symbol-avoid-edges': true,
    'icon-image': ['get', 'pastille'],
    'icon-rotation-alignment': 'viewport',
    'icon-size': ['interpolate', ['linear'], ['zoom'], ZOOM_NOMS_LIGNES, 0.85, 13, 1],
    'icon-padding': 6,
  },
} as const satisfies Omit<SymbolLayerSpecification, 'id'>

const vide = () => ({ type: 'FeatureCollection', features: [] }) as FeatureCollection
const genre = (kind: string): FilterSpecification => ['==', ['get', 'kind'], kind]
const routes = (rangMax: number, rangMin = 1): FilterSpecification => [
  'all',
  ['==', ['get', 'kind'], 'route'],
  ['<=', ['get', 'rang'], rangMax],
  ['>=', ['get', 'rang'], rangMin],
]

function styleDeBase(donnees: Donnees, ville: Ville): StyleSpecification {
  // Les paliers de densité dépendent de la ville : Toulouse est bien moins dense que Lyon.
  const [d1, d2, d3, d4] = ville.densite
  const densite: FeatureCollection<Polygon, { poids: number }> = {
    type: 'FeatureCollection',
    features: donnees.carreauxBruts
      .map(([lon, lat, pop, jobs]) => ({ poids: pop! + 0.3 * jobs!, lon: lon!, lat: lat! }))
      .filter((c) => c.poids >= d1)
      .map((c) => ({
        type: 'Feature',
        properties: { poids: c.poids },
        geometry: { type: 'Polygon', coordinates: [carreau(c.lon, c.lat, ville.latitude)] },
      })),
  }
  // Les stations du réseau actuel, avec leur nom et leurs lignes ; sans le détail des lignes, les stations de métro.
  const stations: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: donnees.stations.length
      ? donnees.stations.map((s) => ({
          type: 'Feature',
          properties: {
            nom: s.nom,
            // Les lignes en service d'un côté, celles en chantier de l'autre, avec leur date d'ouverture.
            lignes: direLignes(s.lignes.filter((l) => !l.ouverture)),
            ouvertures: direOuvertures(s.lignes),
            // Une station de métro, de RER ou de train, dessinée plus grande qu'un arrêt de tram.
            grande: s.lignes.some((l) => l.mode === 'metro' || l.mode === 'rer' || l.mode === 'train'),
            // Une gare ferroviaire, qui a son propre symbole.
            gare: Boolean(s.gare),
          },
          geometry: { type: 'Point', coordinates: s.pos },
        }))
      : donnees.arrets
          .filter((a) => a[2] === 1)
          .map((a) => ({ type: 'Feature', properties: { grande: true }, geometry: { type: 'Point', coordinates: [a[0]!, a[1]!] } })),
  }
  // Chaque ligne du réseau actuel, dans sa couleur. Une ligne en chantier n'a pas encore de tracé : le fil de ses
  // gares ne sert qu'à poser son nom, le long du trait gris que le fond de carte dessine pour elle.
  const lignes: FeatureCollection<MultiLineString> = {
    type: 'FeatureCollection',
    features: (donnees.reseau?.lignes ?? []).map((l) => ({
      type: 'Feature' as const,
      properties: {
        mode: l.mode,
        couleur: l.couleur ?? COULEURS.metroActuel,
        pastille: `ligne-${l.id}`,
        rang: RANG_MODE[l.mode],
        // Quand la place manque, le nom du métro passe avant celui du tram, puis des trains.
        priorite: RANG_MODE.metro - RANG_MODE[l.mode],
        dessinee: Boolean(l.trace?.length),
      },
      geometry: {
        type: 'MultiLineString' as const,
        coordinates: l.trace?.length ? l.trace : l.branches.map((b) => b.map((s) => s.pos)),
      },
    })),
  }
  // Le relief ne se montre que pendant le tracé d'une ligne, sous la densité.
  const relief = donnees.carreaux.terrain ? imageRelief(donnees.carreaux.terrain) : null
  return {
    version: 8,
    sources: {
      ...(relief ? { relief: { type: 'image' as const, url: relief.url, coordinates: relief.coordinates } } : {}),
      decor: { type: 'geojson', data: vide() },
      fond: { type: 'geojson', data: donnees.fond },
      stations: { type: 'geojson', data: stations },
      lignes: { type: 'geojson', data: lignes },
      projets: { type: 'geojson', data: donnees.projets },
      densite: { type: 'geojson', data: densite },
      joueur: { type: 'geojson', data: vide() },
      eclat: { type: 'geojson', data: vide() },
      brouillon: { type: 'geojson', data: vide() },
      zones: { type: 'geojson', data: vide() },
    },
    layers: [
      { id: 'sol', type: 'background', paint: { 'background-color': COULEURS.sol } },
      { id: 'mer', type: 'fill', source: 'decor', filter: genre('mer'), paint: { 'fill-color': COULEURS.eau } },
      { id: 'parcs', type: 'fill', source: 'decor', filter: genre('parc'), paint: { 'fill-color': COULEURS.parc } },
      { id: 'eau', type: 'fill', source: 'decor', filter: genre('eau'), paint: { 'fill-color': COULEURS.eau } },
      {
        id: 'fleuves',
        type: 'line',
        source: 'fond',
        filter: genre('fleuve'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.eau, 'line-width': largeur(7) },
      },
      {
        id: 'limites',
        type: 'line',
        source: 'decor',
        filter: genre('limite'),
        paint: { 'line-color': COULEURS.limite, 'line-width': 1, 'line-dasharray': [3, 2] },
      },
      {
        id: 'routes-bord',
        type: 'line',
        source: 'decor',
        filter: routes(2),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.bordRoute, 'line-width': largeurRang(3.6, 2.4) },
      },
      {
        id: 'routes-secondaires',
        type: 'line',
        source: 'decor',
        filter: routes(3, 3),
        minzoom: 11.5,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.route, 'line-width': largeur(1.1) },
      },
      {
        id: 'routes',
        type: 'line',
        source: 'decor',
        filter: routes(2),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.route, 'line-width': largeurRang(2.4, 1.4) },
      },
      {
        id: 'rail',
        type: 'line',
        source: 'decor',
        filter: genre('rail'),
        paint: { 'line-color': COULEURS.rail, 'line-width': largeur(1), 'line-dasharray': [4, 2] },
      },
      ...(relief
        ? [
            {
              id: 'relief',
              type: 'raster' as const,
              source: 'relief',
              layout: { visibility: 'none' as const },
              paint: { 'raster-opacity': 0.9, 'raster-resampling': 'linear' as const },
            },
          ]
        : []),
      {
        id: 'densite',
        type: 'fill',
        source: 'densite',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': ville.couleurs.principale,
          'fill-opacity': ['interpolate', ['linear'], ['get', 'poids'], d1, 0.06, d2, 0.18, d3, 0.34, d4, 0.55],
        },
      },
      // Les voies de métro et de tram du fond de carte, en gris et plus fines que les lignes en couleur qui les
      // recouvrent : on ne les voit que là où aucune ligne en service ne passe encore, sur les lignes en chantier.
      {
        id: 'tram-bord',
        type: 'line',
        source: 'fond',
        filter: genre('tram'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#fff', 'line-width': largeur(3.4) },
      },
      {
        id: 'tram-actuel',
        type: 'line',
        source: 'fond',
        filter: genre('tram'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.tram, 'line-width': largeur(1.6) },
      },
      {
        id: 'metro-bord',
        type: 'line',
        source: 'fond',
        filter: genre('metro'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#fff', 'line-width': largeur(5) },
      },
      {
        id: 'metro-actuel',
        type: 'line',
        source: 'fond',
        filter: genre('metro'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': COULEURS.metroActuel, 'line-width': largeur(2.6) },
      },
      // Les lignes en service, chacune dans sa couleur, cerclées de blanc ; le métro passe sur le tram et les trains.
      {
        id: 'lignes-bord',
        type: 'line',
        source: 'lignes',
        filter: ['get', 'dessinee'],
        layout: { 'line-cap': 'round', 'line-join': 'round', 'line-sort-key': ['get', 'rang'] },
        paint: { 'line-color': '#fff', 'line-width': largeurMode({ metro: 7, rer: 6.2, tram: 4.6, bus: 4.6, cable: 4.6, train: 3.8 }) },
      },
      {
        id: 'lignes-actuelles',
        type: 'line',
        source: 'lignes',
        filter: ['get', 'dessinee'],
        layout: { 'line-cap': 'round', 'line-join': 'round', 'line-sort-key': ['get', 'rang'] },
        paint: {
          'line-color': ['get', 'couleur'],
          'line-width': largeurMode({ metro: 3.4, rer: 3, tram: 2.2, bus: 2.2, cable: 2.2, train: 1.8 }),
        },
      },
      {
        id: 'stations',
        type: 'circle',
        source: 'stations',
        filter: ['!=', ['get', 'gare'], true],
        minzoom: 10.5,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10.5,
            ['case', ['get', 'grande'], 2.4, 1.6],
            14,
            ['case', ['get', 'grande'], 5.5, 4],
          ],
          'circle-color': '#fff',
          'circle-stroke-color': ['case', ['get', 'grande'], COULEURS.metroActuel, COULEURS.tram],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 10.5, 1.2, 14, 2],
        },
      },
      // Les gares, visibles dès la vue d'ensemble pour qu'on s'y repère : un rond cerclé de noir, pointé au centre.
      {
        id: 'gares',
        type: 'circle',
        source: 'stations',
        filter: ['==', ['get', 'gare'], true],
        minzoom: 9,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 3.2, 12, 5.2, 15, 8],
          'circle-color': '#fff',
          'circle-stroke-color': COULEURS.gare,
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 9, 1.5, 12, 2.2, 15, 3],
        },
      },
      {
        id: 'gares-centre',
        type: 'circle',
        source: 'stations',
        filter: ['==', ['get', 'gare'], true],
        minzoom: 9,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 1.1, 12, 1.9, 15, 3],
          'circle-color': COULEURS.gare,
        },
      },
      // Le nom de chaque ligne, répété le long de son tracé. La carte n'en garde que ce qui tient sans se chevaucher,
      // le métro d'abord, et ceux des trains Transilien n'apparaissent qu'en zoomant ; les pastilles sont dessinées
      // à la demande (voir pastilles.ts).
      { ...nomsLignes, id: 'lignes-noms-trains', filter: ['==', ['get', 'mode'], 'train'], minzoom: ZOOM_GARES },
      { ...nomsLignes, id: 'lignes-noms', filter: ['!=', ['get', 'mode'], 'train'] },
      {
        id: 'projets-etude',
        type: 'line',
        source: 'projets',
        filter: ['!', ['in', ['get', 'etat'], ['literal', ['construit', 'chantier', 'choisi']]]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'couleur'],
          'line-opacity': ['case', ['==', ['get', 'etat'], 'indisponible'], 0.3, 0.9],
          'line-width': largeur(2.6),
          'line-dasharray': [2, 1.4],
        },
      },
      {
        id: 'projets-liseré',
        type: 'line',
        source: 'projets',
        filter: ['in', ['get', 'etat'], ['literal', ['construit', 'chantier', 'choisi']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['case', ['==', ['get', 'etat'], 'choisi'], COULEURS.encre, '#fff'],
          // Le zoom doit rester l'expression la plus externe : le choix de largeur se fait à chaque palier.
          'line-width': [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            ...[10, 13, 15].flatMap((z, i) => {
              const k = [0.6, 1.4, 3][i]!
              return [z, ['case', ['==', ['get', 'etat'], 'choisi'], 10.5 * k, 9 * k]]
            }),
          ] as unknown as number,
        },
      },
      {
        id: 'eclat',
        type: 'line',
        source: 'eclat',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'couleur'], 'line-opacity': 0, 'line-width': 30, 'line-blur': 8 },
      },
      {
        id: 'projets-construits',
        type: 'line',
        source: 'projets',
        filter: ['==', ['get', 'etat'], 'construit'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'couleur'], 'line-width': largeur(5.5) },
      },
      {
        id: 'projets-chantier',
        type: 'line',
        source: 'projets',
        filter: ['==', ['get', 'etat'], 'chantier'],
        paint: { 'line-color': ['get', 'couleur'], 'line-width': largeur(5.5), 'line-dasharray': [0.6, 0.6] },
      },
      {
        id: 'projets-choisi',
        type: 'line',
        source: 'projets',
        filter: ['==', ['get', 'etat'], 'choisi'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'couleur'], 'line-width': largeur(5.5) },
      },
      { id: 'projets-cible', type: 'line', source: 'projets', paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 22 } },
      // La ligne dont la fiche est ouverte, soulignée d'un halo de sa couleur.
      {
        id: 'joueur-halo',
        type: 'line',
        source: 'joueur',
        filter: ['get', 'choisi'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'couleur'], 'line-opacity': 0.3, 'line-width': largeur(20) },
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
        filter: ['!', ['get', 'chantier']],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'couleur'], 'line-width': largeur(5.5) },
      },
      {
        id: 'joueur-chantier',
        type: 'line',
        source: 'joueur',
        filter: ['get', 'chantier'],
        paint: { 'line-color': ['get', 'couleur'], 'line-width': largeur(5.5), 'line-dasharray': [0.6, 0.6] },
      },
      // Une bande invisible et large autour des lignes du joueur, pour les toucher facilement au doigt.
      { id: 'joueur-cible', type: 'line', source: 'joueur', paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 22 } },
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
        paint: { 'line-color': ['coalesce', ['get', 'couleur'], COULEURS.encre], 'line-width': largeur(5.5) },
      },
      // Une bande invisible autour du tracé en cours : la toucher insère un arrêt entre les deux voisins.
      {
        id: 'brouillon-cible',
        type: 'line',
        source: 'brouillon',
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: { 'line-color': '#000', 'line-opacity': 0, 'line-width': 18 },
      },
      {
        id: 'brouillon-arrets',
        type: 'circle',
        source: 'brouillon',
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          // Un point de passage est un petit rond : la ligne y passe sans s'arrêter.
          'circle-radius': ['case', ['get', 'passage'], 4.5, ['get', 'dernier'], 9, 7.5],
          'circle-color': ['case', ['get', 'passage'], COULEURS.encre, ['get', 'dernier'], ville.couleurs.principale, '#fff'],
          'circle-stroke-color': ['case', ['get', 'passage'], '#fff', COULEURS.encre],
          'circle-stroke-width': ['case', ['get', 'passage'], 2, 2.5],
        },
      },
    ],
  }
}

/** Distance en pixels d'un point à un segment, pour savoir entre quels arrêts insérer le nouveau. */
function distanceSegment(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) {
  const [dx, dy] = [b.x - a.x, b.y - a.y]
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

const reduit = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Fait briller un tracé qui vient d'être décidé, puis l'éteint. */
function eclat(m: CarteMaplibre, coordonnees: number[][][], couleur: string) {
  const source = m.getSource('eclat') as GeoJSONSource | undefined
  if (!source || reduit()) return
  source.setData({ type: 'Feature', properties: { couleur }, geometry: { type: 'MultiLineString', coordinates: coordonnees } })
  const debut = performance.now()
  const duree = 1200
  const pas = (t: number) => {
    const x = Math.min(1, (t - debut) / duree)
    const intensite = Math.max(0, x < 0.2 ? x / 0.2 : 1 - (x - 0.2) / 0.8)
    m.setPaintProperty('eclat', 'line-opacity', 0.6 * intensite)
    m.setPaintProperty('eclat', 'line-width', 12 + 30 * x)
    if (x < 1) requestAnimationFrame(pas)
  }
  requestAnimationFrame(pas)
}

const PRIORITE: Record<string, number> = { choisi: 0, construit: 1, chantier: 1, etude: 2, indisponible: 3 }

/** Les places essayées pour l'étiquette d'un projet, en fractions de son tracé : le milieu, puis de part et d'autre. */
const PLACES = [0.5, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9]

/** L'étiquette de prix d'un projet, son marqueur sur la carte et les places qu'elle peut prendre le long de son tracé. */
type Etiquette = { el: HTMLButtonElement; marqueur: Marker; places: [number, number][] }

/**
 * Place les étiquettes sans qu'elles se chevauchent : le projet choisi et les projets décidés passent d'abord, puis les
 * plus chers. Une étiquette dont le milieu est pris glisse le long de son tracé ; si aucune place n'est libre, elle devient
 * un point de la couleur du projet, qui s'ouvre au toucher comme l'étiquette.
 */
function eviterChevauchements(m: CarteMaplibre, etiquettes: Map<string, Etiquette>) {
  const prises: { left: number; right: number; top: number; bottom: number }[] = []
  const libre = (r: (typeof prises)[number]) =>
    !prises.some((v) => r.left < v.right + 4 && r.right > v.left - 4 && r.top < v.bottom + 2 && r.bottom > v.top - 2)
  const ordre = [...etiquettes.values()]
    .filter((e) => e.el.style.display !== 'none')
    .sort(
      (a, b) =>
        (PRIORITE[a.el.dataset.etat ?? 'etude'] ?? 2) - (PRIORITE[b.el.dataset.etat ?? 'etude'] ?? 2) ||
        Number(b.el.dataset.cout ?? 0) - Number(a.el.dataset.cout ?? 0),
    )
  for (const e of ordre) {
    // L'étiquette se mesure dépliée, même si elle était un point au passage précédent.
    delete e.el.dataset.forme
    const r = e.el.getBoundingClientRect()
    const ici = m.project(e.marqueur.getLngLat())
    // Le rectangle qu'occuperait l'étiquette à chaque place : le sien, décalé de l'écart à l'écran.
    const essais = e.places.map((p) => {
      const q = m.project(p)
      const [dx, dy] = [q.x - ici.x, q.y - ici.y]
      return { p, r: { left: r.left + dx, right: r.right + dx, top: r.top + dy, bottom: r.bottom + dy } }
    })
    const choisie = essais.find((x) => libre(x.r))
    if (!choisie) {
      // Faute de place, un point de la couleur du projet au milieu de son tracé, qu'on voit et qu'on touche encore.
      e.el.dataset.forme = 'point'
      e.marqueur.setLngLat(e.places[0]!)
      continue
    }
    prises.push(choisie.r)
    e.marqueur.setLngLat(choisie.p)
  }
}

/** Un « +30 000 » qui s'élève au-dessus d'un tracé. */
function gainFlottant(m: CarteMaplibre, position: [number, number], texte: string) {
  // MapLibre positionne le marqueur avec transform : l'animation vit sur un élément intérieur.
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  const bulle = document.createElement('span')
  bulle.className = 'gain-flottant'
  bulle.textContent = texte
  el.appendChild(bulle)
  const marqueur = new Marker({ element: el, anchor: 'bottom', offset: [0, -16] }).setLngLat(position).addTo(m)
  setTimeout(() => marqueur.remove(), 1900)
}

export function Carte({
  marges,
  decor = false,
  anneeMax,
  partie,
  ville: villeImposee,
}: {
  marges: { top: number; right: number; bottom: number; left: number }
  /** Carte d'illustration : pas de clic sur les projets, pas d'étiquettes. */
  decor?: boolean
  /** Pour le bilan : n'affiche en rouge que ce qui a ouvert à cette date. */
  anneeMax?: number
  /** Un réseau partagé par lien, affiché à la place de la partie en cours, avec le nombre de mandats qu'il a joués. */
  partie?: Pick<ReturnType<typeof useJeu.getState>, 'chantiers' | 'lignes'> & { mandats?: number }
  /** La ville à montrer, si ce n'est pas celle de la partie en cours : l'accueil, un réseau reçu. */
  ville?: IdVille
}) {
  const villePartie = useJeu((s) => s.ville)
  const ville = VILLES[villeImposee ?? villePartie]
  const donnees = useDonnees(ville.id)
  const catalogue = CATALOGUES[ville.id]
  const conteneur = useRef<HTMLDivElement>(null)
  const carte = useRef<CarteMaplibre | null>(null)
  const [etiquettes] = useState(() => new Map<string, Etiquette>())
  const [nomsArrets] = useState<Marker[]>(() => [])
  const pret = useRef(false)
  const appliquerEtat = useRef<() => void>(() => {})
  const precedents = useRef<Map<string, EtatProjet> | null>(null)

  const jeu = useJeu()
  const { brouillon, panneau, ecran, tuto } = jeu
  const chantiers = partie?.chantiers ?? jeu.chantiers
  const lignes = partie?.lignes ?? jeu.lignes
  const trace = brouillon !== null
  // Ce qui ouvre après la fin de la partie, en 2038 ou à la fin du dernier mandat joué, reste en chantier sur la carte.
  const fin = horizon(partie ? (partie.mandats ?? 2) : jeu.mandat)

  // Une carte de récapitulatif (bilan, fin de mandat, comparaison) cadre tout le réseau montré : la vue de départ,
  // élargie aux projets retenus et aux lignes tracées, qui vont parfois jusqu'au Val d'Europe.
  const cadre = useMemo((): [[number, number], [number, number]] => {
    if (!decor || !donnees) return ville.emprise
    const traces = new Set(chantiers.flatMap((c) => catalogue.projets.find((p) => p.id === c.id)?.trace ?? []))
    const points = [
      ...donnees.projets.features.filter((f) => traces.has(f.properties.id)).flatMap((f) => f.geometry.coordinates.flat()),
      ...lignes.flatMap((l) => l.arrets),
    ]
    if (!points.length) return ville.emprise
    const [[o, s], [e, n]] = ville.emprise
    const marge = 0.01
    return [
      [Math.min(o, ...points.map((p) => p[0]! - marge)), Math.min(s, ...points.map((p) => p[1]! - marge))],
      [Math.max(e, ...points.map((p) => p[0]! + marge)), Math.max(n, ...points.map((p) => p[1]! + marge))],
    ]
  }, [catalogue, chantiers, decor, donnees, lignes, ville])

  // État de chaque projet du catalogue, par nom de tracé.
  const etats = useMemo(() => {
    const etat = new Map<string, EtatProjet>()
    const faits = new Map(chantiers.map((c) => [c.id, c]))
    for (const p of catalogue.projets) {
      if (!p.trace) continue
      const c = faits.get(p.id)
      let e: EtatProjet = 'etude'
      if (c) {
        const annee = ouverture(c.mandat, resoudre(p, c).duree)
        // Dans un récapitulatif, un projet apparaît en chantier l'année de sa décision, puis s'allume à son ouverture.
        if (anneeMax !== undefined) e = anneeMax < debutMandat(c.mandat) ? 'etude' : annee <= anneeMax ? 'construit' : 'chantier'
        else e = annee > fin ? 'chantier' : 'construit'
      } else if (p.requiert && !faits.has(p.requiert)) e = 'indisponible'
      if (panneau?.type === 'projet' && panneau.id === p.id) e = 'choisi'
      if (ecran === 'tuto' && tuto === 0 && p.id === catalogue.tutoriel?.projet) e = 'choisi'
      etat.set(p.trace, e)
    }
    return etat
  }, [catalogue, chantiers, panneau, ecran, tuto, anneeMax, fin])

  // Création de la carte.
  useEffect(() => {
    if (!donnees || !conteneur.current || carte.current) return
    const boite = conteneur.current
    const m = new CarteMaplibre({
      container: boite,
      style: styleDeBase(donnees, ville),
      bounds: cadre,
      fitBoundsOptions: { padding: 20 },
      // Un récapitulatif peut reculer davantage, pour montrer sur un téléphone un réseau qui s'étend loin.
      minZoom: decor ? 8 : 9.5,
      maxZoom: 16,
      maxBounds: ville.limites,
      attributionControl: { compact: true, customAttribution: '© OpenStreetMap, INSEE' },
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
    })
    m.touchZoomRotate.disableRotation()
    carte.current = m

    for (const lieu of ville.lieux) {
      const el = document.createElement('div')
      el.className = 'lieu'
      el.dataset.grand = lieu.grand ? '1' : '0'
      el.textContent = lieu.nom
      new Marker({ element: el }).setLngLat(lieu.pos).addTo(m)
    }
    // Les quartiers n'apparaissent qu'en zoomant, pour ne pas charger la vue d'ensemble.
    const [[ouest, sud], [est, nord]] = ville.zoneQuartiers
    const quartiers = donnees.lieux.quartiers.flatMap(([lon, lat, nom]) => {
      if (lon < ouest || lon > est || lat < sud || lat > nord) return []
      const el = document.createElement('div')
      el.className = 'lieu quartier'
      el.textContent = nom
      return [{ pos: [lon, lat] as [number, number], marker: new Marker({ element: el }).setLngLat([lon, lat]) }]
    })
    poserProches(m, quartiers, ZOOM_QUARTIERS)
    // Le nom des gares, en zoomant, pour se repérer.
    const gares = donnees.stations.flatMap((s) => {
      if (!s.gare || !s.nom) return []
      const el = document.createElement('div')
      el.className = 'nom-gare'
      el.setAttribute('aria-hidden', 'true')
      el.textContent = s.nom
      return [{ pos: s.pos, marker: new Marker({ element: el, anchor: 'left', offset: [9, 0] }).setLngLat(s.pos) }]
    })
    poserProches(m, gares, ZOOM_GARES)
    // La pastille de chaque ligne existante se dessine quand la carte en a besoin pour la première fois. Celles
    // dessinées avant l'arrivée de la police du site sont refaites avec elle.
    const pastilles = new Map((donnees.reseau?.lignes ?? []).map((l) => [`ligne-${l.id}`, l]))
    const poserPastille = (id: string) => {
      const l = pastilles.get(id)
      if (!l) return
      const { image, ratio } = imagePastille(l.ref, l.couleur ?? COULEURS.metroActuel, l.mode)
      if (m.hasImage(id)) m.removeImage(id)
      m.addImage(id, image, { pixelRatio: ratio })
    }
    m.setMissingStyleImageResolver(poserPastille)
    if (document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => {
        if (carte.current !== m) return
        for (const id of pastilles.keys()) if (m.hasImage(id)) poserPastille(id)
      })
    }

    const majZoom = () => {
      boite.dataset.proche = m.getZoom() >= ZOOM_QUARTIERS ? '1' : '0'
      boite.dataset.gares = m.getZoom() >= ZOOM_GARES ? '1' : '0'
    }
    majZoom()
    m.on('zoom', majZoom)

    for (const f of donnees.projets.features) {
      const projet = catalogue.projets.find((p) => p.trace === f.properties.id)
      if (!projet) continue
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'etiquette'
      el.setAttribute('aria-label', `${projet.nom}, ${n(projet.cout)} millions d'euros`)
      el.textContent = n(resoudre(projet).cout)
      el.dataset.cout = String(resoudre(projet).cout)
      if (decor) el.hidden = true
      el.addEventListener('click', (ev) => {
        ev.stopPropagation()
        if (useJeu.getState().brouillon) return
        useJeu.getState().ouvrir({ type: 'projet', id: projet.id })
      })
      const places = pointsLeLong(f.geometry, PLACES)
      const marqueur = new Marker({ element: el }).setLngLat(places[0] ?? milieu(f.geometry)).addTo(m)
      etiquettes.set(f.properties.id, { el, marqueur, places })
    }

    // Pendant le tracé, on fait glisser un arrêt pour le déplacer. Un glissement ne doit pas poser d'arrêt au
    // clic qui le termine, et les mises à jour sont regroupées à chaque image pour garder le tracé fluide. En deçà de
    // quelques pixels, ce n'est pas un glissement mais un toucher, qui ouvre le nom de la station.
    let glisse: number | null = null
    let vientDeGlisser = false
    let attente: [number, number] | null = null
    let saisiA = { x: 0, y: 0 }
    const saisir = (e: MapMouseEvent | MapTouchEvent) => {
      if (!useJeu.getState().brouillon || decor) return
      const i = m.queryRenderedFeatures(e.point, { layers: ['brouillon-arrets'] })[0]?.properties?.i
      if (typeof i !== 'number') return
      e.preventDefault()
      glisse = i
      vientDeGlisser = false
      saisiA = e.point
      m.dragPan.disable()
      m.getCanvas().style.cursor = 'grabbing'
    }
    const bouger = (e: MapMouseEvent | MapTouchEvent) => {
      if (glisse === null) return
      if (!vientDeGlisser && Math.hypot(e.point.x - saisiA.x, e.point.y - saisiA.y) < 5) return
      if (!attente) {
        requestAnimationFrame(() => {
          if (glisse !== null && attente) useJeu.getState().deplacerArret(glisse, attente)
          attente = null
        })
      }
      attente = [e.lngLat.lng, e.lngLat.lat]
      vientDeGlisser = true
    }
    const lacher = () => {
      if (glisse === null) return
      glisse = null
      m.dragPan.enable()
      m.getCanvas().style.cursor = useJeu.getState().brouillon ? 'crosshair' : ''
      // Le clic qui suit la fin d'un glissement est ignoré, puis tout redevient normal.
      setTimeout(() => (vientDeGlisser = false), 50)
    }
    m.on('mousedown', 'brouillon-arrets', saisir)
    m.on('touchstart', 'brouillon-arrets', (e) => {
      if (e.points.length === 1) saisir(e)
    })
    m.on('mousemove', bouger)
    m.on('touchmove', bouger)
    m.on('mouseup', lacher)
    m.on('touchend', lacher)
    m.on('mouseenter', 'brouillon-arrets', () => {
      if (glisse === null) m.getCanvas().style.cursor = 'grab'
    })
    m.on('mouseleave', 'brouillon-arrets', () => {
      if (glisse === null) m.getCanvas().style.cursor = useJeu.getState().brouillon ? 'crosshair' : ''
    })

    // Un clic pose un arrêt pendant le tracé, ou l'insère s'il touche la ligne entre deux arrêts ; sinon il
    // ouvre la ligne du joueur touchée, ou à défaut le projet.
    m.on('click', (e: MapMouseEvent) => {
      const jeu = useJeu.getState()
      if (jeu.brouillon) {
        if (vientDeGlisser) return
        // Toucher une station du tracé ouvre son nom dans le panneau ; toucher un point de passage ne fait rien.
        const arret = m.queryRenderedFeatures(e.point, { layers: ['brouillon-arrets'] })[0]?.properties
        if (arret) return typeof arret.i === 'number' && !arret.passage ? jeu.renommer(arret.i) : undefined
        // Une station posée tout près d'une station existante s'y accroche : c'est une correspondance.
        const p = jeu.brouillon.outil === 'passage' ? ([e.lngLat.lng, e.lngLat.lat] as [number, number]) : accrocher(e.point, e.lngLat)
        if (m.queryRenderedFeatures(e.point, { layers: ['brouillon-cible'] }).length) {
          const arrets = jeu.brouillon.arrets
          let meilleur = 0
          let distance = Infinity
          for (let j = 1; j < arrets.length; j += 1) {
            const d = distanceSegment(e.point, m.project(arrets[j - 1]!), m.project(arrets[j]!))
            if (d < distance) [distance, meilleur] = [d, j]
          }
          if (meilleur > 0) return jeu.insererArret(meilleur, p)
        }
        return jeu.ajouterArret(p)
      }
      if (decor) return
      const ligne = m.queryRenderedFeatures(e.point, { layers: ['joueur-cible'] })[0]?.properties?.id as string | undefined
      if (ligne && jeu.lignes.some((l) => l.id === ligne)) return jeu.ouvrir({ type: 'ligne-joueur', id: ligne })
      // Le premier tracé touché qui porte un projet : un tracé voisin ne doit pas avaler le clic. Sans tracé touché, aucun
      // projet : sinon on ouvrirait le premier projet sans tracé, l'électrification des bus.
      const projet = m
        .queryRenderedFeatures(e.point, { layers: ['projets-cible'] })
        .map((f) => f.properties?.id as string | undefined)
        .map((id) => (id ? catalogue.projets.find((p) => p.trace === id) : undefined))
        .find((p) => p !== undefined)
      if (projet) return jeu.ouvrir({ type: 'projet', id: projet.id })
      // Sur un écran tactile, toucher une station du réseau actuel montre son nom et ses lignes.
      const station = m.queryRenderedFeatures(zoneAutour(e.point, 10), { layers: ['gares', 'stations'] })[0]
      if (station) montrerStation(station)
    })

    // Le nom d'une station du réseau actuel et ses lignes, au survol ou au toucher.
    const bulle = new Popup({ closeButton: false, closeOnClick: true, offset: 10, className: 'bulle-station', maxWidth: '260px' })
    const montrerStation = (f: { properties: Record<string, unknown>; geometry: unknown }) => {
      const nom = f.properties.nom as string | undefined
      if (!nom) return
      const el = document.createElement('div')
      const titre = document.createElement('strong')
      titre.textContent = nom
      el.appendChild(titre)
      if (f.properties.lignes) {
        const lignesEl = document.createElement('span')
        lignesEl.textContent = String(f.properties.lignes).replace(/^./, (c) => c.toUpperCase())
        el.appendChild(lignesEl)
      }
      // Une gare sans RER ni train affiché le dit : on y prend les trains régionaux.
      if (f.properties.gare && !/RER|train/.test(String(f.properties.lignes ?? ''))) {
        const gareEl = document.createElement('span')
        gareEl.textContent = 'Gare'
        el.appendChild(gareEl)
      }
      // Une ligne en chantier que la carte montre déjà : on dit quand elle ouvre.
      for (const texte of String(f.properties.ouvertures ?? '')
        .split('\n')
        .filter(Boolean)) {
        const ouverture = document.createElement('span')
        ouverture.textContent = texte
        el.appendChild(ouverture)
      }
      const [lon, lat] = (f.geometry as Point).coordinates as [number, number]
      bulle.setLngLat([lon, lat]).setDOMContent(el).addTo(m)
    }
    for (const couche of ['stations', 'gares']) {
      m.on('mouseenter', couche, (e: MapLayerMouseEvent) => {
        const f = e.features?.[0]
        if (f && glisse === null) montrerStation(f)
      })
      m.on('mouseleave', couche, () => bulle.remove())
    }

    /** Un petit carré autour d'un point de l'écran, pour toucher une station sans viser au pixel près. */
    const zoneAutour = (p: { x: number; y: number }, r: number): [[number, number], [number, number]] => [
      [p.x - r, p.y - r],
      [p.x + r, p.y + r],
    ]
    /**
     * La position d'une station posée : celle de la station existante la plus proche à l'écran, ou le terminus d'une de
     * vos lignes, qu'on peut ainsi prolonger au mandat suivant ; sinon le point touché.
     */
    function accrocher(point: { x: number; y: number }, lngLat: { lng: number; lat: number }): [number, number] {
      let meilleure: [number, number] | null = null
      let distance = Infinity
      const garder = (c: [number, number]) => {
        const q = m.project(c)
        const d = Math.hypot(q.x - point.x, q.y - point.y)
        if (d < distance) [distance, meilleure] = [d, c]
      }
      for (const f of m.queryRenderedFeatures(zoneAutour(point, 14), { layers: ['gares', 'stations'] })) {
        garder((f.geometry as Point).coordinates as [number, number])
      }
      const jeu = useJeu.getState()
      for (const l of jeu.lignes) {
        if (l.id === jeu.brouillon?.edition) continue
        for (const t of [l.arrets[0], l.arrets.at(-1)]) {
          if (!t) continue
          const q = m.project(t)
          if (Math.hypot(q.x - point.x, q.y - point.y) <= 16) garder(t)
        }
      }
      return meilleure ?? [lngLat.lng, lngLat.lat]
    }
    for (const couche of ['projets-cible', 'joueur-cible']) {
      m.on('mouseenter', couche, () => {
        if (!decor && !useJeu.getState().brouillon) m.getCanvas().style.cursor = 'pointer'
      })
      m.on('mouseleave', couche, () => {
        m.getCanvas().style.cursor = useJeu.getState().brouillon ? 'crosshair' : ''
      })
    }
    m.on('moveend', () => eviterChevauchements(m, etiquettes))
    m.on('load', () => {
      pret.current = true
      appliquerEtat.current()
      // Le décor est plus lourd : il arrive après les données du jeu.
      fetch(adresseDonnees(ville.id, 'decor'))
        .then((r) => r.json())
        .then((d) => (m.getSource('decor') as GeoJSONSource | undefined)?.setData(d))
        .catch(() => {})
    })
    return () => {
      m.remove()
      carte.current = null
      pret.current = false
      etiquettes.clear()
    }
  }, [cadre, catalogue, donnees, decor, etiquettes, ville])

  // Mise à jour des états, des étiquettes, des lignes du joueur et du tracé en cours.
  useEffect(() => {
    const m = carte.current
    if (!m || !donnees) return
    const appliquer = () => {
      if (!pret.current) return
      ;(m.getSource('projets') as GeoJSONSource).setData({
        ...donnees.projets,
        features: donnees.projets.features.map((f) => {
          const projet = catalogue.projets.find((p) => p.trace === f.properties.id)
          const choix = projet && chantiers.find((x) => x.id === projet.id)
          return {
            ...f,
            properties: {
              ...f.properties,
              etat: etats.get(f.properties.id) ?? 'etude',
              couleur: projet ? couleurProjet(projet.id, choix) : '#1b1b1f',
            },
          }
        }),
      })

      // Ce qui vient d'être décidé brille un instant, avec le gain de voyageurs.
      const avant = precedents.current
      if (avant && (!decor || anneeMax !== undefined)) {
        for (const [nomTrace, etat] of etats) {
          const etaitFait = avant.get(nomTrace) === 'construit' || avant.get(nomTrace) === 'chantier'
          const estFait = etat === 'construit' || etat === 'chantier'
          // En jeu : le projet brille quand on le décide. Dans un récapitulatif : quand il ouvre.
          const brille = anneeMax === undefined ? estFait && !etaitFait : etat === 'construit' && avant.get(nomTrace) !== 'construit'
          if (!brille) continue
          const f = donnees.projets.features.find((x) => x.properties.id === nomTrace)
          const projet = catalogue.projets.find((p) => p.trace === nomTrace)
          const c = projet && chantiers.find((x) => x.id === projet.id)
          if (!f) continue
          eclat(m, f.geometry.coordinates, projet ? couleurProjet(projet.id, c) : ville.couleurs.principale)
          if (projet && c && !reduit()) gainFlottant(m, milieu(f.geometry), `+${n(resoudre(projet, c).voyageurs)}`)
        }
      }
      precedents.current = new Map(etats)

      for (const [nomTrace, etat] of etats) {
        const el = etiquettes.get(nomTrace)?.el
        if (!el) continue
        el.dataset.etat = etat
        const projet = catalogue.projets.find((p) => p.trace === nomTrace)
        const c = projet && chantiers.find((x) => x.id === projet.id)
        if (projet) el.style.setProperty('--mode', couleurProjet(projet.id, c))
        el.textContent =
          etat === 'construit' && projet
            ? mots(projet.id).participe
            : etat === 'chantier'
              ? 'En chantier'
              : projet
                ? n(resoudre(projet, c).cout)
                : ''
      }
      for (const { el } of etiquettes.values()) el.style.display = trace || decor ? 'none' : ''
      requestAnimationFrame(() => eviterChevauchements(m, etiquettes))
      m.setLayoutProperty('densite', 'visibility', trace ? 'visible' : 'none')
      if (m.getLayer('relief')) m.setLayoutProperty('relief', 'visibility', trace ? 'visible' : 'none')
      m.getCanvas().style.cursor = trace ? 'crosshair' : ''

      const joueur: FeatureCollection<LineString> = {
        type: 'FeatureCollection',
        features: lignes
          .filter((l) => anneeMax === undefined || ouverture(l.mandat, l.estimation.duree) <= anneeMax)
          // La ligne qu'on modifie n'apparaît qu'une fois, sous la forme de son nouveau tracé.
          .filter((l) => l.id !== brouillon?.edition)
          .map((l) => ({
            type: 'Feature',
            properties: {
              id: l.id,
              chantier: anneeMax === undefined && ouverture(l.mandat, l.estimation.duree) > fin,
              couleur: couleurLigne(l.mode),
              choisi: !decor && panneau?.type === 'ligne-joueur' && panneau.id === l.id,
            },
            geometry: { type: 'LineString', coordinates: l.arrets },
          })),
      }
      ;(m.getSource('joueur') as GeoJSONSource).setData(joueur)

      const arrets = brouillon?.arrets ?? []
      const estStation = stationsDuTrace(arrets.length, brouillon?.passages)
      const traits: Feature<LineString | Point>[] = []
      if (arrets.length >= 2 && brouillon)
        traits.push({
          type: 'Feature',
          properties: { couleur: couleurLigne(brouillon.mode) },
          geometry: { type: 'LineString', coordinates: arrets },
        })
      arrets.forEach((a, i) =>
        traits.push({
          type: 'Feature',
          properties: { i, dernier: i === arrets.length - 1, passage: !estStation[i] },
          geometry: { type: 'Point', coordinates: a },
        }),
      )
      ;(m.getSource('brouillon') as GeoJSONSource).setData({ type: 'FeatureCollection', features: traits })
      const rayon = brouillon ? rayonBassin(brouillon.mode) : FORMULE.rayonAutres
      ;(m.getSource('zones') as GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: arrets.filter((_, i) => estStation[i]).map((a) => cercle(a, rayon, ville.latitude)),
      })

      // Le nom de chaque station posée : celui de la station existante où elle s'accroche, sinon son quartier.
      while (nomsArrets.length) nomsArrets.pop()!.remove()
      const noms = nommerTrace(arrets, estStation, donnees.lieux, donnees.stations, donnees.carreaux.mx, brouillon?.noms)
      // Un prolongement part du terminus de sa ligne et en porte le nom, sauf si le joueur l'a renommé.
      const prolongee = brouillon?.prolonge ? donnees.reseau?.lignes.find((l) => l.id === brouillon.prolonge) : undefined
      const depuis = prolongee && arrets[0] ? terminusProche(prolongee, arrets[0], donnees.carreaux.mx) : undefined
      if (depuis && estStation[0] && !brouillon?.noms?.[0]) noms[0] = depuis.nom
      // Toucher le nom ouvre le champ pour le changer, comme toucher la station.
      noms.forEach((nom, i) => {
        if (!nom) return
        const el = document.createElement('div')
        const etiquette = document.createElement('button')
        etiquette.type = 'button'
        etiquette.className = 'nom-arret'
        etiquette.textContent = nom
        etiquette.title = 'Renommer cette station'
        etiquette.setAttribute('aria-label', `Renommer ${nom}`)
        if (brouillon?.renomme === i) etiquette.dataset.actif = ''
        etiquette.addEventListener('click', (ev) => {
          ev.stopPropagation()
          useJeu.getState().renommer(i)
        })
        el.appendChild(etiquette)
        nomsArrets.push(new Marker({ element: el, anchor: 'left', offset: [10, -10] }).setLngLat(arrets[i]!).addTo(m))
      })
    }
    appliquerEtat.current = appliquer
    appliquer()
  }, [catalogue, etats, lignes, brouillon, trace, chantiers, donnees, decor, etiquettes, nomsArrets, anneeMax, ville, panneau, fin])

  // Pendant la première étape du tutoriel, la carte montre le projet à toucher.
  useEffect(() => {
    const m = carte.current
    const nomTrace = catalogue.projets.find((p) => p.id === catalogue.tutoriel?.projet)?.trace
    const projet = donnees?.projets.features.find((f) => f.properties.id === nomTrace)
    if (!m || !projet || ecran !== 'tuto' || tuto !== 0) return
    const points = projet.geometry.coordinates.flat()
    const lons = points.map((p) => p[0]!)
    const lats = points.map((p) => p[1]!)
    const grand = window.innerWidth >= 1024
    const cadrer = () =>
      m.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        {
          padding: grand ? { top: 160, bottom: 80, left: 420, right: 480 } : { top: 200, bottom: 300, left: 60, right: 60 },
          maxZoom: 12.8,
          duration: 1200,
        },
      )
    if (pret.current) cadrer()
    else m.once('load', cadrer)
  }, [catalogue, donnees, ecran, tuto])

  // À la sortie du tutoriel, la carte revient sur toute la Métropole.
  const ecranPrecedent = useRef(ecran)
  useEffect(() => {
    const m = carte.current
    if (m && ecranPrecedent.current === 'tuto' && ecran !== 'tuto') m.fitBounds(ville.emprise, { padding: marges, duration: 1200 })
    ecranPrecedent.current = ecran
  }, [ecran, marges, ville])

  // Recadrage quand les panneaux changent de taille.
  useEffect(() => {
    carte.current?.easeTo({ padding: marges, duration: 400 })
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
