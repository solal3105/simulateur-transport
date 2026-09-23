'use client'

import type { FeatureCollection, MultiLineString } from 'geojson'
import { useEffect, useState } from 'react'

import type { Lieux } from './lieux'
import { preparerCarreaux, type Carreaux } from './modele'
import { VILLES, type IdVille } from './villes'

export interface Donnees {
  fond: FeatureCollection<MultiLineString, { kind: string; name?: string; line?: string }>
  projets: FeatureCollection<MultiLineString, { id: string }>
  carreauxBruts: number[][]
  carreaux: Carreaux
  lieux: Lieux
  /** [lon, lat, métro (1) ou tram (0)] */
  arrets: number[][]
}

type Traces = Pick<Donnees, 'fond' | 'projets'>

const promesses = new Map<IdVille, Promise<Donnees>>()
const promessesTraces = new Map<IdVille, Promise<Traces>>()

/** L'adresse d'un fichier de données : public/data pour Lyon, public/data/<ville> pour les autres. */
export const adresseDonnees = (ville: IdVille, nom: string) => {
  const dossier = VILLES[ville].dossier
  return `/data/${dossier ? `${dossier}/` : ''}${nom}.json`
}

const lire = <T>(ville: IdVille, nom: string) =>
  fetch(adresseDonnees(ville, nom)).then((r) => {
    if (!r.ok) throw new Error(`${nom} introuvable`)
    return r.json() as Promise<T>
  })

/** Garde une promesse en mémoire, mais l'oublie si elle échoue, pour qu'un nouvel essai reste possible. */
function memoriser<T>(cache: Map<IdVille, Promise<T>>, ville: IdVille, charger: () => Promise<T>) {
  let p = cache.get(ville)
  if (!p) {
    p = charger().catch((e) => {
      cache.delete(ville)
      throw e
    })
    cache.set(ville, p)
  }
  return p
}

/** Le fond de carte et les tracés des projets seulement : de quoi dessiner une carte miniature. */
export function chargerTraces(ville: IdVille) {
  return memoriser(promessesTraces, ville, async () => {
    const [fond, projets] = await Promise.all([lire<Donnees['fond']>(ville, 'fond'), lire<Donnees['projets']>(ville, 'projets')])
    return { fond, projets }
  })
}

export function chargerDonnees(ville: IdVille) {
  return memoriser(promesses, ville, async () => {
    const [{ fond, projets }, carreauxBruts, arrets, lieux] = await Promise.all([
      chargerTraces(ville),
      lire<number[][]>(ville, 'carreaux'),
      lire<number[][]>(ville, 'arrets'),
      lire<Lieux>(ville, 'lieux'),
    ])
    return { fond, projets, carreauxBruts, carreaux: preparerCarreaux(carreauxBruts, arrets, VILLES[ville]), lieux, arrets }
  })
}

/** Les données d'une ville ; pendant le chargement d'une autre ville, rien plutôt que celles de la précédente. */
export function useDonnees(ville: IdVille) {
  const [etat, setEtat] = useState<{ ville: IdVille; donnees: Donnees } | null>(null)
  useEffect(() => {
    let actif = true
    chargerDonnees(ville)
      .then((donnees) => actif && setEtat({ ville, donnees }))
      .catch(() => {})
    return () => {
      actif = false
    }
  }, [ville])
  return etat?.ville === ville ? etat.donnees : null
}
