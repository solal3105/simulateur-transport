'use client'

import { clsx } from 'clsx'
import { useMemo } from 'react'

import { useDonnees } from '@/lib/donnees'
import type { IdVille } from '@/lib/villes'

/**
 * Le trait qui représente le réseau actuel dans les légendes : les couleurs de trois de ses lignes de métro ou de
 * tram, comme sur la carte, et du gris tant qu'elles ne sont pas chargées.
 */
export function TraitReseau({ ville, className }: { ville: IdVille; className?: string }) {
  const reseau = useDonnees(ville)?.reseau
  const couleurs = useMemo(() => {
    const lignes = (reseau?.lignes ?? []).filter((l) => l.mode === 'metro' || l.mode === 'tram')
    const distinctes = [...new Set(lignes.flatMap((l) => (l.couleur ? [l.couleur] : [])))].slice(0, 3)
    return distinctes.length ? distinctes : ['#5d5852']
  }, [reseau])
  return (
    <span className={clsx('flex overflow-hidden rounded-full', className)}>
      {couleurs.map((c) => (
        <span key={c} className="h-full flex-1" style={{ background: c }} />
      ))}
    </span>
  )
}
