'use client'

import type { FeatureCollection, MultiLineString } from 'geojson'
import { useEffect, useState } from 'react'

import type { Lieux } from './lieux'
import { preparerCarreaux, type Carreaux } from './modele'

export interface Donnees {
  fond: FeatureCollection<MultiLineString, { kind: string; name?: string; line?: string }>
  projets: FeatureCollection<MultiLineString, { id: string }>
  carreauxBruts: number[][]
  carreaux: Carreaux
  lieux: Lieux
  /** [lon, lat, métro (1) ou tram (0)] */
  arrets: number[][]
}

let promesse: Promise<Donnees> | null = null

const lire = <T,>(nom: string) => fetch(`/data/${nom}.json`).then((r) => r.json() as Promise<T>)

export function chargerDonnees() {
  promesse ??= Promise.all([
    lire<Donnees['fond']>('fond'),
    lire<Donnees['projets']>('projets'),
    lire<number[][]>('carreaux'),
    lire<number[][]>('arrets'),
    lire<Lieux>('lieux'),
  ]).then(([fond, projets, carreauxBruts, arrets, lieux]) => ({
    fond,
    projets,
    carreauxBruts,
    carreaux: preparerCarreaux(carreauxBruts, arrets),
    lieux,
    arrets,
  }))
  return promesse
}

export function useDonnees() {
  const [donnees, setDonnees] = useState<Donnees | null>(null)
  useEffect(() => {
    let actif = true
    chargerDonnees().then((d) => actif && setDonnees(d))
    return () => {
      actif = false
    }
  }, [])
  return donnees
}
