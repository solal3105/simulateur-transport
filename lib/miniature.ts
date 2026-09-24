import type { FeatureCollection, MultiLineString } from 'geojson'

import { PROJETS } from './catalogue'
import { couleurLigne, couleurProjet } from './couleurs'
import type { PartieCompacte } from './partie'
import type { ModeLigne } from './types'
import type { Ville } from './villes'

/**
 * Un réseau en miniature, en chemins SVG : le fond (mer, fleuves, métro et tram actuels) et les tracés du
 * réseau dans la couleur de leur mode. Sert aux cartes de la communauté et à l'image d'aperçu d'un
 * réseau publié ; ne dépend d'aucun navigateur.
 *
 * Le dessin couvre la vue de départ de la carte de la ville, sur 1000 unités de large.
 */

type Fond = FeatureCollection<MultiLineString, { kind: string }>
type Projets = FeatureCollection<MultiLineString, { id: string }>

export const LARGEUR_MINIATURE = 1000

export function cadreMiniature(ville: Pick<Ville, 'emprise' | 'latitude'>) {
  const [[lon0, lat0], [lon1, lat1]] = ville.emprise
  const kx = Math.cos((ville.latitude * Math.PI) / 180)
  const echelle = LARGEUR_MINIATURE / ((lon1 - lon0) * kx)
  const hauteur = Math.round((lat1 - lat0) * echelle)
  const xy = (lon: number, lat: number): [number, number] => [(lon - lon0) * kx * echelle, (lat1 - lat) * echelle]
  const point = (lon: number, lat: number) =>
    xy(lon, lat)
      .map((v) => v.toFixed(1))
      .join(' ')
  const chemin = (parties: number[][][]) => parties.map((l) => 'M' + l.map(([lon, lat]) => point(lon!, lat!)).join('L')).join('')
  // Le cadre montré est un peu resserré sur le centre de l'agglomération.
  return { hauteur, viewBox: `60 40 ${LARGEUR_MINIATURE - 120} ${hauteur - 80}`, chemin, xy }
}

export function cheminsFond(fond: Fond, ville: Pick<Ville, 'emprise' | 'latitude'>) {
  const { chemin } = cadreMiniature(ville)
  const de = (genre: string) =>
    fond.features
      .filter((f) => f.properties.kind === genre)
      .map((f) => chemin(f.geometry.coordinates))
      .join('')
  // La mer est faite d'anneaux fermés, la mer et ses îles, à remplir avec la règle pair-impair.
  return { mer: de('cote'), fleuves: de('fleuve'), tram: de('tram'), metro: de('metro') }
}

export function cheminsReseau(projets: Projets, partie: PartieCompacte, ville: Pick<Ville, 'emprise' | 'latitude'>) {
  const { chemin } = cadreMiniature(ville)
  const parTrace = new Map(projets.features.map((f) => [f.properties.id, f.geometry]))
  const traces = partie.c.flatMap(([id, , , varianteId, option]) => {
    const trace = PROJETS.get(id)?.trace
    const geometrie = trace ? parTrace.get(trace) : undefined
    return geometrie
      ? [{ d: chemin(geometrie.coordinates), couleur: couleurProjet(id, { varianteId: varianteId || undefined, option: option === 1 }) }]
      : []
  })
  const lignes = partie.l.map((l) => ({ d: chemin([l.a]), couleur: couleurLigne(l.m as ModeLigne) }))
  return [...traces, ...lignes]
}
