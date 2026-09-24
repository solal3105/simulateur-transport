'use client'

import { clsx } from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { chargerTraces } from '@/lib/donnees'
import { cadreMiniature, cheminsFond, cheminsReseau } from '@/lib/miniature'
import { villeDePartie, type PartieCompacte } from '@/lib/partie'
import { VILLES, type IdVille } from '@/lib/villes'

type Traces = Awaited<ReturnType<typeof chargerTraces>>

/** Écart entre deux couleurs « #rrggbb », pour ne pas dessiner une ligne rouge sur le rouge de TCL. */
const ecart = (a: string, b: string) => {
  const [x, y] = [parseInt(a.slice(1), 16), parseInt(b.slice(1), 16)]
  return Math.hypot(((x >> 16) & 255) - ((y >> 16) & 255), ((x >> 8) & 255) - ((y >> 8) & 255), (x & 255) - (y & 255))
}

/**
 * Un réseau en miniature, dessiné en SVG sans carte interactive : les fleuves, le métro et le tram
 * actuels en gris, puis les projets et les lignes du réseau dans la couleur de leur mode. Avec `teinte`,
 * la carte prend la couleur du réseau et son réseau actuel passe en blanc, comme sur les images de partage.
 */
export function MiniCarte({ partie, className, teinte }: { partie: PartieCompacte; className?: string; teinte?: boolean }) {
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

  if (teinte) {
    const fondCouleur = ville.couleurs.principale
    const encre = (c: string) => (ecart(c, fondCouleur) < 90 ? '#17171b' : c)
    return (
      <svg
        viewBox={cadreMiniature(ville).viewBox}
        preserveAspectRatio="xMidYMid slice"
        className={clsx('block h-full w-full', className)}
        style={{ background: fondCouleur }}
        aria-hidden="true"
      >
        {fond ? (
          <>
            <path d={fond.mer} fill="#fff" fillOpacity={0.14} fillRule="evenodd" />
            <path d={fond.fleuves} fill="none" stroke="#fff" strokeOpacity={0.2} strokeWidth={9} strokeLinecap="round" />
            <path d={fond.tram} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={2} strokeLinecap="round" />
            <path d={fond.metro} fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={3.5} strokeLinecap="round" />
          </>
        ) : null}
        {reseau.map((l, i) => (
          <path key={`b${i}`} d={l.d} fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {reseau.map((l, i) => (
          <path key={`c${i}`} d={l.d} fill="none" stroke={encre(l.couleur)} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    )
  }

  return (
    <svg
      viewBox={cadreMiniature(ville).viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={clsx('block h-full w-full bg-[#f4f1ec]', className)}
      aria-hidden="true"
    >
      {fond ? (
        <>
          <path d={fond.mer} fill="#c6dde9" fillRule="evenodd" />
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
