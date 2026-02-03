import { Project } from './types'

export interface ProjectGeoData {
  id: string
  type: 'metro' | 'tram' | 'bus' | 'other' | 'metro-new' | 'metro-modern' | 'fluvial' | 'upgrade'
  geojsonFile: string
}

export const PROJECT_GEO_DATA: Record<string, ProjectGeoData> = {
  'ligne-du-nord': { id: 'ligne-du-nord', type: 'upgrade', geojsonFile: 'ext-b-nord.geojson' },
  'metro-e-part-dieu': { id: 'metro-e-part-dieu', type: 'metro-new', geojsonFile: 'metro-e-part-dieu.geojson' },
  'ext-a-est': { id: 'ext-a-est', type: 'metro-new', geojsonFile: 'ext-a-est.geojson' },
  'metro-e-bellecour': { id: 'metro-e-bellecour', type: 'metro-new', geojsonFile: 'metro-e-bellecour.geojson' },
  'ext-d': { id: 'ext-d', type: 'metro-new', geojsonFile: 'ext-d.geojson' },
  'grande-dorsale': { id: 'grande-dorsale', type: 'metro-new', geojsonFile: 'grande-dorsale.geojson' },
  'teol': { id: 'teol', type: 'tram', geojsonFile: 'teol.geojson' },
  'modern-a': { id: 'modern-a', type: 'metro-modern', geojsonFile: 'modern-a.geojson' },
  'ligne-ouest': { id: 'ligne-ouest', type: 'upgrade', geojsonFile: 'ligne-ouest.geojson' },
  't12-c3': { id: 't12-c3', type: 'tram', geojsonFile: 't12-c3.geojson' },
  't9-c2': { id: 't9-c2', type: 'tram', geojsonFile: 't9-c2.geojson' },
  'modern-d': { id: 'modern-d', type: 'metro-modern', geojsonFile: 'modern-d.geojson' },
  't8': { id: 't8', type: 'tram', geojsonFile: 't8.geojson' },
  'modern-c': { id: 'modern-c', type: 'metro-modern', geojsonFile: 'modern-c.geojson' },
  't3-renf': { id: 't3-renf', type: 'tram', geojsonFile: 't3-renf.geojson' },
  't9-final': { id: 't9-final', type: 'tram', geojsonFile: 't9-final.geojson' },
  't10-final': { id: 't10-final', type: 'tram', geojsonFile: 't10-final.geojson' },
  'bhns-parilly': { id: 'bhns-parilly', type: 'bus', geojsonFile: 'bhns-parilly.geojson' },
  'bhns-kimmerling': { id: 'bhns-kimmerling', type: 'bus', geojsonFile: 'bhns-kimmerling.geojson' },
  'navette-fluv': { id: 'navette-fluv', type: 'fluvial', geojsonFile: 'navette-fluv.geojson' },
  'bhns-rive-droite': { id: 'bhns-rive-droite', type: 'bus', geojsonFile: 'bhns-rive-droite.geojson' },
  'telepherique-ouest': { id: 'telepherique-ouest', type: 'other', geojsonFile: 'telepherique-ouest.geojson' },
  'teol-craponne': { id: 'teol-craponne', type: 'tram', geojsonFile: 'teol-craponne.geojson' },
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
