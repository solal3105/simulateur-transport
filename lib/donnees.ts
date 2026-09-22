'use client'

import type { FeatureCollection, MultiLineString } from 'geojson'
import { useEffect, useState } from 'react'

import { preparerCarreaux, type Carreaux } from './modele'

export interface Donnees {
  fond: FeatureCollection<MultiLineString, { kind: string; name?: string; line?: string }>
  projets: FeatureCollection<MultiLineString, { id: string }>
  carreauxBruts: number[][]
  carreaux: Carreaux
}

let promesse: Promise<Donnees> | null = null

const lire = <T,>(nom: string) => fetch(`/data/${nom}.json`).then((r) => r.json() as Promise<T>)

export function chargerDonnees() {
  promesse ??= Promise.all([
    lire<Donnees['fond']>('fond'),
    lire<Donnees['projets']>('projets'),
    lire<number[][]>('carreaux'),
    lire<number[][]>('arrets'),
  ]).then(([fond, projets, carreauxBruts, arrets]) => ({
    fond,
    projets,
    carreauxBruts,
    carreaux: preparerCarreaux(carreauxBruts, arrets),
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
