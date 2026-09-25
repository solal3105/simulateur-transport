import type { FeatureCollection, MultiLineString } from 'geojson'

import { catalogueDe } from './catalogue'
import type { IdVille } from './villes'

export type TracesProjets = FeatureCollection<MultiLineString, { id: string }>

/**
 * Les tracés des projets d'un réseau : ceux de son fichier de tracés (les projets lyonnais, dessinés à la main
 * dans data/projets), et pour les autres la ligne qui relie leurs stations et leurs points de passage, branche
 * par branche.
 */
export function tracesProjets(ville: IdVille, fichier: TracesProjets): TracesProjets {
  const dessines = new Set(fichier.features.map((f) => f.properties.id))
  const parcourus = catalogueDe(ville)
    .filter((p) => p.trace && p.parcours && !dessines.has(p.trace))
    .map((p) => ({
      type: 'Feature' as const,
      properties: { id: p.trace! },
      geometry: { type: 'MultiLineString' as const, coordinates: p.parcours!.map((b) => b.map((s) => s.pos)) },
    }))
  return { ...fichier, features: [...fichier.features, ...parcourus] }
}
