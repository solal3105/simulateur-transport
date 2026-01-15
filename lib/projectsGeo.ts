import { Project } from './types'

export interface ProjectGeoData {
  id: string
  coordinates: [number, number] // [lat, lng]
  type: 'metro' | 'tram' | 'bus' | 'other'
  geojsonFile?: string // Pour les tracés complets plus tard
}

// Coordonnées des projets dans la région lyonnaise
// Format: [latitude, longitude]
export const PROJECT_GEO_DATA: Record<string, ProjectGeoData> = {
  'ext-b-nord': {
    id: 'ext-b-nord',
    coordinates: [45.8142, 4.8823], // Rillieux-la-Pape
    type: 'metro',
    geojsonFile: 'ext-b-nord.geojson',
  },
  'metro-e-part-dieu': {
    id: 'metro-e-part-dieu',
    coordinates: [45.7607, 4.8595], // Part-Dieu
    type: 'metro',
    geojsonFile: 'metro-e-part-dieu.geojson',
  },
  'ext-a-est': {
    id: 'ext-a-est',
    coordinates: [45.7678, 4.9205], // Vaulx-en-Velin Est
    type: 'metro',
    geojsonFile: 'ext-a-est.geojson',
  },
  'metro-e-bellecour': {
    id: 'metro-e-bellecour',
    coordinates: [45.7578, 4.8320], // Bellecour
    type: 'metro',
    geojsonFile: 'metro-e-bellecour.geojson',
  },
  'ext-d': {
    id: 'ext-d',
    coordinates: [45.6989, 4.8364], // Sud Lyon
    type: 'metro',
    geojsonFile: 'ext-d.geojson',
  },
  't13-souterrain': {
    id: 't13-souterrain',
    coordinates: [45.7445, 4.8795], // Grange Blanche
    type: 'tram',
    geojsonFile: 't13-souterrain.geojson',
  },
  'teol-enterre': {
    id: 'teol-enterre',
    coordinates: [45.7667, 4.8050], // Alaï/Gorge de Loup
    type: 'tram',
    geojsonFile: 'teol-enterre.geojson',
  },
  'teol-semi-enterre': {
    id: 'teol-semi-enterre',
    coordinates: [45.7650, 4.8100], // Alaï/Gorge de Loup variante
    type: 'tram',
    geojsonFile: 'teol-semi-enterre.geojson',
  },
  'entretien-bus': {
    id: 'entretien-bus',
    coordinates: [45.7484, 4.8467], // Centre Lyon (dépôt)
    type: 'bus',
    geojsonFile: 'entretien-bus.geojson',
  },
  'modern-a': {
    id: 'modern-a',
    coordinates: [45.7580, 4.8590], // Ligne A centrale
    type: 'metro',
    geojsonFile: 'modern-a.geojson',
  },
  't10-c6': {
    id: 't10-c6',
    coordinates: [45.7050, 4.8600], // Vénissieux/Saint-Fons
    type: 'tram',
    geojsonFile: 't10-c6.geojson',
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
    geojsonFile: 't9-c2.geojson',
  },
  'electrif-bus': {
    id: 'electrif-bus',
    coordinates: [45.7500, 4.8300], // Centre maintenance
    type: 'bus',
    geojsonFile: 'electrif-bus.geojson',
  },
  'modern-d': {
    id: 'modern-d',
    coordinates: [45.7450, 4.8420], // Ligne D
    type: 'metro',
    geojsonFile: 'modern-d.geojson',
  },
  't8': {
    id: 't8',
    coordinates: [45.7380, 4.8250], // Confluence/Gerland
    type: 'tram',
    geojsonFile: 't8.geojson',
  },
  'c6-bhns': {
    id: 'c6-bhns',
    coordinates: [45.7100, 4.8450], // Sud Est
    type: 'bus',
    geojsonFile: 'c6-bhns.geojson',
  },
  'c2-bhns': {
    id: 'c2-bhns',
    coordinates: [45.7700, 4.8750], // Villeurbanne
    type: 'bus',
    geojsonFile: 'c2-bhns.geojson',
  },
  'modern-c': {
    id: 'modern-c',
    coordinates: [45.7740, 4.8280], // Croix-Rousse
    type: 'metro',
    geojsonFile: 'modern-c.geojson',
  },
  't3-renf': {
    id: 't3-renf',
    coordinates: [45.7850, 4.9200], // Part-Dieu → Meyzieu
    type: 'tram',
    geojsonFile: 't3-renf.geojson',
  },
  't11': {
    id: 't11',
    coordinates: [45.7680, 4.9700], // Décines/Meyzieu
    type: 'tram',
    geojsonFile: 't11.geojson',
  },
  't9-t10-final': {
    id: 't9-t10-final',
    coordinates: [45.7200, 4.8700], // Sud
    type: 'tram',
    geojsonFile: 't9-t10-final.geojson',
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
    type: 'other',
    geojsonFile: 'navette-fluv.geojson',
  },
  'bhns-rive-droite': {
    id: 'bhns-rive-droite',
    coordinates: [45.7420, 4.8180], // Rive droite Rhône
    type: 'bus',
    geojsonFile: 'bhns-rive-droite.geojson',
  },
}

// Couleurs selon le type de projet
export const PROJECT_TYPE_COLORS = {
  metro: '#3B82F6', // Bleu
  tram: '#10B981', // Vert
  bus: '#F97316', // Orange
  other: '#8B5CF6', // Violet
}

// Couleurs selon la sélection
export const SELECTION_COLORS = {
  M1: '#166534', // Vert foncé
  M2: '#22C55E', // Vert moyen
  'M1+M2': '#86EFAC', // Vert clair
  none: '#6B7280', // Gris
}
