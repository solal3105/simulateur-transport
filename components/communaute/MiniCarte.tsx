'use client'

import { clsx } from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { chargerTraces } from '@/lib/donnees'
import { cadreMiniature, cheminsFond, cheminsReseau } from '@/lib/miniature'
import { villeDePartie, type PartieCompacte } from '@/lib/partie'
import { VILLES, type IdVille } from '@/lib/villes'

type Traces = Awaited<ReturnType<typeof chargerTraces>>

/**
 * Un réseau en miniature, dessiné en SVG sans carte interactive : les fleuves, le métro et le tram
 * actuels en gris, puis les projets et les lignes du réseau dans la couleur de leur mode.
 */
export function MiniCarte({ partie, className }: { partie: PartieCompacte; className?: string }) {
  const ville = VILLES[villeDePartie(partie) ?? 'lyon']
  const [traces, setTraces] = useState<{ ville: IdVille; traces: Traces } | null>(null)
  useEffect(() => {
    let actif = true
    chargerTraces(ville.id)
      .then((t) => actif && setTraces({ ville: ville.id, traces: t }))
      .catch(() => {})
    return () => {
      actif = false
    }
  }, [ville.id])

  const pretes = traces?.ville === ville.id ? traces.traces : null
  const fond = useMemo(() => (pretes ? cheminsFond(pretes.fond, ville) : null), [pretes, ville])
  const reseau = useMemo(() => (pretes ? cheminsReseau(pretes.projets, partie, ville) : []), [pretes, partie, ville])

  return (
    <svg
      viewBox={cadreMiniature(ville).viewBox}
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
      {reseau.map((l, i) => (
        <path key={`b${i}`} d={l.d} fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {reseau.map((l, i) => (
        <path key={`c${i}`} d={l.d} fill="none" stroke={l.couleur} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}
