'use client'

import { clsx } from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { chargerTraces } from '@/lib/donnees'
import { CADRE_MINIATURE, cheminsFond, cheminsReseau } from '@/lib/miniature'
import type { PartieCompacte } from '@/lib/partie'

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

  const fond = useMemo(() => (traces ? cheminsFond(traces.fond) : null), [traces])
  const reseau = useMemo(() => (traces ? cheminsReseau(traces.projets, partie) : []), [traces, partie])

  return (
    <svg
      viewBox={CADRE_MINIATURE}
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
