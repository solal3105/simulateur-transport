'use client'

import { clsx } from 'clsx'
import type { MultiLineString } from 'geojson'
import { useEffect, useMemo, useState } from 'react'

import { PROJETS } from '@/lib/catalogue'
import { couleurLigne, couleurProjet } from '@/lib/couleurs'
import { chargerTraces } from '@/lib/donnees'
import type { PartieCompacte } from '@/lib/partie'
import type { ModeLigne } from '@/lib/types'

// La Métropole, de Tassin à Meyzieu, comme à l'ouverture de la carte du jeu.
const LON0 = 4.74
const LON1 = 5.02
const LAT0 = 45.69
const LAT1 = 45.83
const KX = Math.cos((45.76 * Math.PI) / 180)
const ECHELLE = 1000 / ((LON1 - LON0) * KX)
const LARGEUR = 1000
const HAUTEUR = Math.round((LAT1 - LAT0) * ECHELLE)

const point = (lon: number, lat: number) => `${((lon - LON0) * KX * ECHELLE).toFixed(1)} ${((LAT1 - lat) * ECHELLE).toFixed(1)}`
const chemin = (parties: number[][][]) => parties.map((l) => 'M' + l.map(([lon, lat]) => point(lon!, lat!)).join('L')).join('')

type Traces = Awaited<ReturnType<typeof chargerTraces>>

/**
 * Un réseau en miniature, dessiné en SVG sans carte interactive : le Rhône et la Saône, le métro et
 * le tram actuels en gris, puis les projets et les lignes du réseau dans la couleur de leur mode.
 */
export function MiniCarte({ partie, className }: { partie: PartieCompacte; className?: string }) {
  const [traces, setTraces] = useState<Traces | null>(null)
  useEffect(() => {
    let actif = true
    chargerTraces().then((t) => actif && setTraces(t))
    return () => {
      actif = false
    }
  }, [])

  const fond = useMemo(() => {
    if (!traces) return null
    const de = (genre: string) =>
      traces.fond.features
        .filter((f) => f.properties.kind === genre)
        .map((f) => chemin(f.geometry.coordinates))
        .join('')
    return { fleuves: de('fleuve'), tram: de('tram'), metro: de('metro') }
  }, [traces])

  const lignesReseau = useMemo(() => {
    if (!traces) return []
    const parTrace = new Map(traces.projets.features.map((f) => [f.properties.id, f.geometry as MultiLineString]))
    const projets = partie.c.flatMap(([id, , , varianteId, option]) => {
      const trace = PROJETS.get(id)?.trace
      const geometrie = trace ? parTrace.get(trace) : undefined
      return geometrie
        ? [{ d: chemin(geometrie.coordinates), couleur: couleurProjet(id, { varianteId: varianteId || undefined, option: option === 1 }) }]
        : []
    })
    const lignes = partie.l.map((l) => ({ d: chemin([l.a]), couleur: couleurLigne(l.m as ModeLigne) }))
    return [...projets, ...lignes]
  }, [traces, partie])

  return (
    <svg
      viewBox={`60 40 ${LARGEUR - 120} ${HAUTEUR - 80}`}
      preserveAspectRatio="xMidYMid slice"
      className={clsx('block h-full w-full bg-[#f4f1ec]', className)}
      aria-hidden="true"
    >
      {fond ? (
        <>
          <path d={fond.fleuves} fill="none" stroke="#c6dde9" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <path d={fond.tram} fill="none" stroke="#d9d3ca" strokeWidth={2} strokeLinecap="round" />
          <path d={fond.metro} fill="none" stroke="#958e84" strokeWidth={3.5} strokeLinecap="round" />
        </>
      ) : null}
      {lignesReseau.map((l, i) => (
        <path key={`b${i}`} d={l.d} fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {lignesReseau.map((l, i) => (
        <path key={`c${i}`} d={l.d} fill="none" stroke={l.couleur} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}
