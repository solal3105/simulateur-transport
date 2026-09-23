'use client'

import { useMemo } from 'react'

import { bilanMandat, score, type Bilan } from '@/lib/regles'
import { useJeu } from '@/lib/store'
import type { Mandat } from '@/lib/types'

import type { Segment } from '../ui'

export function useBilan(mandat?: Mandat) {
  const { chantiers, lignes, leviers, mandat: courant } = useJeu()
  const m = mandat ?? courant
  return useMemo(() => bilanMandat(m, chantiers, lignes, leviers), [m, chantiers, lignes, leviers])
}

export function useScore() {
  const { chantiers, lignes } = useJeu()
  return useMemo(() => score(chantiers, lignes), [chantiers, lignes])
}

/**
 * Découpe la jauge du mandat : entretien des bus, moitiés reportées, projets du mandat,
 * aperçu d'un projet en cours d'examen, puis ce qui reste libre ou ce qui manque.
 */
export function segmentsBudget(bilan: Bilan, apercu = 0): { segments: Segment[]; total: number } {
  const segments: Segment[] = [{ montant: bilan.bus, style: 'bus' }]
  if (bilan.leviers < 0) segments.push({ montant: -bilan.leviers, style: 'bus' })
  segments.push({ montant: bilan.reports, style: 'report' })
  segments.push({ montant: bilan.projets, style: 'fait' })
  const libreAvant = bilan.reste
  if (libreAvant < 0) {
    segments.push({ montant: -libreAvant + apercu, style: 'manque' })
  } else if (apercu > libreAvant) {
    segments.push({ montant: libreAvant, style: 'apercu' })
    segments.push({ montant: apercu - libreAvant, style: 'manque' })
  } else {
    segments.push({ montant: apercu, style: 'apercu' })
    segments.push({ montant: libreAvant - apercu, style: 'libre' })
  }
  const total = segments.reduce((t, s) => t + Math.max(0, s.montant), 0)
  return { segments, total }
}
