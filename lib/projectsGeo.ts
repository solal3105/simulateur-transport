import { Project } from './types'

export interface ProjectGeoData {
  id: string
  coordinates: [number, number] // [lat, lng]
  type: 'metro' | 'tram' | 'bus' | 'other' | 'metro-new' | 'metro-modern' | 'fluvial' | 'upgrade'
  geojsonFile?: string // Pour les tracés complets plus tard
}

// Coordonnées des projets dans la région lyonnaise
// Format: [latitude, longitude]
export const PROJECT_GEO_DATA: Record<string, ProjectGeoData> = {
  'ligne-du-nord': {
    id: 'ligne-du-nord',
    coordinates: [45.8142, 4.8823], // Rillieux-la-Pape
    type: 'upgrade',
    geojsonFile: 'ext-b-nord.geojson',
  },
  'metro-e-part-dieu': {
    id: 'metro-e-part-dieu',
    coordinates: [45.7607, 4.8595], // Part-Dieu
    type: 'metro-new',
    geojsonFile: 'metro-e-part-dieu.geojson',
  },
  'ext-a-est': {
    id: 'ext-a-est',
    coordinates: [45.7678, 4.9205], // Vaulx-en-Velin Est
    type: 'metro-new',
    geojsonFile: 'ext-a-est.geojson',
  },
  'metro-e-bellecour': {
    id: 'metro-e-bellecour',
    coordinates: [45.7578, 4.8320], // Bellecour
    type: 'metro-new',
    geojsonFile: 'metro-e-bellecour.geojson',
  },
  'ext-d': {
    id: 'ext-d',
    coordinates: [45.6989, 4.8364], // Sud Lyon
    type: 'metro-new',
    geojsonFile: 'ext-d.geojson',
  },
  'grande-dorsale': {
    id: 'grande-dorsale',
    coordinates: [45.7600, 4.8400], // Centre Lyon
    type: 'metro-new',
    geojsonFile: 'grande-dorsale.geojson',
  },
  'teol': {
    id: 'teol',
    coordinates: [45.7650, 4.8100], // Alaï/Gorge de Loup
    type: 'tram',
    geojsonFile: 'teol.geojson',
  },
  'modern-a': {
    id: 'modern-a',
    coordinates: [45.7580, 4.8590], // Ligne A centrale
    type: 'metro-modern',
    geojsonFile: 'modern-a.geojson',
  },
  'ligne-ouest': {
    id: 'ligne-ouest',
    coordinates: [45.7050, 4.8600], // Ouest lyonnais
    type: 'upgrade',
    geojsonFile: 'ligne-ouest.geojson',
  },
  't12-c3': {
    id: 't12-c3',
    coordinates: [45.7750, 4.8900], // Villeurbanne Nord
    type: 'tram',
    geojsonFile: 't12-c3.geojson',
  },
  't9-c2': {
    id: 't9-c2',
    coordinates: [45.7720, 4.8680], // Charpennes/Tonkin
    type: 'tram',
  },
  'modern-d': {
    id: 'modern-d',
    coordinates: [45.7450, 4.8420], // Ligne D
    type: 'metro-modern',
    geojsonFile: 'modern-d.geojson',
  },
  't8': {
    id: 't8',
    coordinates: [45.7380, 4.8250], // Confluence/Gerland
    type: 'tram',
    geojsonFile: 't8.geojson',
  },
  'modern-c': {
    id: 'modern-c',
    coordinates: [45.7740, 4.8280], // Croix-Rousse
    type: 'metro-modern',
    geojsonFile: 'modern-c.geojson',
  },
  't3-renf': {
    id: 't3-renf',
    coordinates: [45.7850, 4.9200], // Part-Dieu → Meyzieu
    type: 'tram',
    geojsonFile: 't3-renf.geojson',
  },
  't9-final': {
    id: 't9-final',
    coordinates: [45.7180, 4.8650], // Sud T9
    type: 'tram',
    geojsonFile: 't9-final.geojson',
  },
  't10-final': {
    id: 't10-final',
    coordinates: [45.7220, 4.8750], // Sud T10
    type: 'tram',
    geojsonFile: 't10-final.geojson',
  },
  'bhns-parilly': {
    id: 'bhns-parilly',
    coordinates: [45.7280, 4.8850], // Parilly
    type: 'bus',
    geojsonFile: 'bhns-parilly.geojson',
  },
  'navette-fluv': {
    id: 'navette-fluv',
    coordinates: [45.7550, 4.8380], // Confluence fluviale
    type: 'fluvial',
    geojsonFile: 'navette-fluv.geojson',
  },
  'bhns-rive-droite': {
    id: 'bhns-rive-droite',
    coordinates: [45.7420, 4.8180], // Rive droite Rhône
    type: 'bus',
    geojsonFile: 'bhns-rive-droite.geojson',
  },
  'telepherique-ouest': {
    id: 'telepherique-ouest',
    coordinates: [45.7650, 4.8000], // Ouest lyonnais
    type: 'other',
    geojsonFile: 'telepherique-ouest.geojson',
  },
  'teol-craponne': {
    id: 'teol-craponne',
    coordinates: [45.7450, 4.7700], // Craponne
    type: 'tram',
    geojsonFile: 'teol-craponne.geojson',
  },
}

// Couleurs selon le type de projet
export const PROJECT_TYPE_COLORS = {
  'metro-new': '#DC2626', // Rouge (nouveaux métros)
  'metro-modern': '#1E3A8A', // Bleu nuit (modernisation métro)
  'metro': '#8B4513', // Marron (métro par défaut)
  tram: '#7C3AED', // Violet foncé
  bus: '#EA580C', // Orange foncé (bus rapide/BHNS)
  fluvial: '#3B82F6', // Bleu (navette fluviale)
  upgrade: '#A855F7', // Violet vif (projets avec upgrades)
  other: '#A855F7', // Violet vif (fallback)
}

// Couleurs non sélectionnées (pour affichage sur la carte)
export const UNSELECTED_COLORS = {
  'metro-new': '#F87171', // Rouge clair (nouveaux métros)
  'metro-modern': '#3B82F6', // Bleu clair (modernisation métro)
  'metro': '#A0826D', // Marron clair (métro par défaut)
  tram: '#A78BFA', // Violet clair
  bus: '#FB923C', // Orange clair (bus rapide/BHNS)
  fluvial: '#60A5FA', // Bleu clair (navette fluviale)
  upgrade: '#C084FC', // Violet vif clair (projets avec upgrades)
  other: '#C084FC', // Violet vif clair (fallback)
}

// Couleurs selon la sélection
export const SELECTION_COLORS = {
  M1: '#166534', // Vert foncé
  M2: '#22C55E', // Vert moyen
  'M1+M2': '#86EFAC', // Vert clair
  none: '#6B7280', // Gris
}
