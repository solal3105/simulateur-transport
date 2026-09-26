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
  const projets = catalogueDe(ville)
  // Un tracé qu'aucun projet ne porte ne se dessine pas : sans prix ni fiche, on ne pourrait rien en faire.
  const portes = new Set(projets.flatMap((p) => (p.trace ? [p.trace] : [])))
  const dessines = fichier.features.filter((f) => portes.has(f.properties.id))
  const deja = new Set(dessines.map((f) => f.properties.id))
  const parcourus = projets
    .filter((p) => p.trace && p.parcours && !deja.has(p.trace))
    .map((p) => ({
      type: 'Feature' as const,
      properties: { id: p.trace! },
      geometry: { type: 'MultiLineString' as const, coordinates: p.parcours!.map((b) => b.map((s) => s.pos)) },
    }))
  return { ...fichier, features: [...dessines, ...parcourus] }
}
