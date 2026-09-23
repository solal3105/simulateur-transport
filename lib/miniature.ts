import type { FeatureCollection, MultiLineString } from 'geojson'

import { PROJETS } from './catalogue'
import { couleurLigne, couleurProjet } from './couleurs'
import type { PartieCompacte } from './partie'
import type { ModeLigne } from './types'

/**
 * Un réseau en miniature, en chemins SVG : le fond (fleuves, métro et tram actuels) et les tracés du
 * réseau dans la couleur de leur mode. Sert aux cartes de la communauté et à l'image d'aperçu d'un
 * réseau publié ; ne dépend d'aucun navigateur.
 */

// La Métropole, de Tassin à Meyzieu, comme à l'ouverture de la carte du jeu.
const LON0 = 4.74
const LON1 = 5.02
const LAT1 = 45.83
const LAT0 = 45.69
const KX = Math.cos((45.76 * Math.PI) / 180)
const ECHELLE = 1000 / ((LON1 - LON0) * KX)
export const LARGEUR_MINIATURE = 1000
export const HAUTEUR_MINIATURE = Math.round((LAT1 - LAT0) * ECHELLE)
/** Le cadre montré : un peu resserré sur le centre de l'agglomération. */
export const CADRE_MINIATURE = `60 40 ${LARGEUR_MINIATURE - 120} ${HAUTEUR_MINIATURE - 80}`

const point = (lon: number, lat: number) => `${((lon - LON0) * KX * ECHELLE).toFixed(1)} ${((LAT1 - lat) * ECHELLE).toFixed(1)}`
const chemin = (parties: number[][][]) => parties.map((l) => 'M' + l.map(([lon, lat]) => point(lon!, lat!)).join('L')).join('')

type Fond = FeatureCollection<MultiLineString, { kind: string }>
type Projets = FeatureCollection<MultiLineString, { id: string }>

export function cheminsFond(fond: Fond) {
  const de = (genre: string) =>
    fond.features
      .filter((f) => f.properties.kind === genre)
      .map((f) => chemin(f.geometry.coordinates))
      .join('')
  return { fleuves: de('fleuve'), tram: de('tram'), metro: de('metro') }
}

export function cheminsReseau(projets: Projets, partie: PartieCompacte) {
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
