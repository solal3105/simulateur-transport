'use client'

import { useMemo } from 'react'

import { libre as libreDuMandat } from '@/lib/budget'
import { PROJETS } from '@/lib/catalogue'
import { bilanMandat, resoudre, score, type Bilan } from '@/lib/regles'
import { useJeu, useVille } from '@/lib/store'
import type { Mandat } from '@/lib/types'

import type { Segment } from '../ui'

export function useBilan(mandat?: Mandat) {
  const { chantiers, lignes, leviers, mandat: courant } = useJeu()
  const ville = useVille()
  const m = mandat ?? courant
  return useMemo(() => bilanMandat(m, chantiers, lignes, leviers, ville), [m, chantiers, lignes, leviers, ville])
}

export function useScore() {
  const { chantiers, lignes } = useJeu()
  return useMemo(() => score(chantiers, lignes), [chantiers, lignes])
}

/**
 * Découpe la jauge du mandat : part réservée aux bus et aux lignes existantes, moitiés reportées, projets du mandat,
 * aperçu d'un projet en cours d'examen, puis ce qui reste libre ou ce qui manque.
 */
export function segmentsBudget(bilan: Bilan, apercu = 0): { segments: Segment[]; total: number } {
  const segments: Segment[] = [{ montant: bilan.reserve, style: 'reserve' }]
  if (bilan.leviers < 0) segments.push({ montant: -bilan.leviers, style: 'reserve' })
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

/** En jeu libre : ce que coûte le réseau, et le budget réel de deux mandats auquel on le compare. */
export function useDepenses() {
  const { chantiers, lignes } = useJeu()
  const ville = useVille()
  return useMemo(() => {
    const investi =
      chantiers.reduce((t, c) => {
        const p = PROJETS.get(c.id)
        return p ? t + resoudre(p, c).cout : t
      }, 0) + lignes.reduce((t, l) => t + l.estimation.cout, 0)
    return { investi, budgetReel: libreDuMandat(ville.budget, 1) + libreDuMandat(ville.budget, 2) }
  }, [chantiers, lignes, ville])
}

/**
 * La jauge du jeu libre : ce qui tient dans le budget réel de deux mandats, ce qui le dépasse, l'aperçu
 * d'un projet en cours d'examen, puis ce qui resterait du budget réel.
 */
export function segmentsLibre(investi: number, budgetReel: number, apercu = 0): { segments: Segment[]; total: number } {
  const segments: Segment[] = [
    { montant: Math.min(investi, budgetReel), style: 'fait' },
    { montant: Math.max(0, investi - budgetReel), style: 'manque' },
    { montant: apercu, style: 'apercu' },
    { montant: Math.max(0, budgetReel - investi - apercu), style: 'libre' },
  ]
  return { segments, total: Math.max(investi + apercu, budgetReel) }
}
