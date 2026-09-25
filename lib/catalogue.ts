import { idf } from './catalogues/idf'
import { lyon } from './catalogues/lyon'
import { marseille } from './catalogues/marseille'
import { nice } from './catalogues/nice'
import { toulouse } from './catalogues/toulouse'
import type { Action, Catalogue, Projet } from './types'
import type { IdVille } from './villes'

/**
 * Les projets sur la table, réseau par réseau : chacun a son fichier dans lib/catalogues, avec pour chaque projet
 * ses chiffres, ses sources quand nous les avons rassemblées, et le projet que le tutoriel fait lancer. Coûts en
 * millions d'euros, voyageurs par jour de semaine, durée de chantier en années.
 */
export const CATALOGUES: Record<IdVille, Catalogue> = { lyon, toulouse, marseille, nice, idf }

/** Les projets d'un réseau. */
export const catalogueDe = (ville: IdVille): Projet[] => CATALOGUES[ville].projets

/** Le nombre de projets d'un réseau qui ont un tracé sur la carte : ceux qu'on montre et qu'on compte au bilan. */
export const nombreProjets = (ville: IdVille) => catalogueDe(ville).filter((p) => p.trace).length

/** Tous les projets de tous les réseaux, par identifiant : les identifiants sont uniques d'un réseau à l'autre. */
export const PROJETS = new Map(Object.values(CATALOGUES).flatMap((c) => c.projets.map((p) => [p.id, p] as const)))

const PAR_VILLE = Object.fromEntries(
  Object.entries(CATALOGUES).map(([ville, c]) => [ville, new Map(c.projets.map((p) => [p.id, p]))]),
) as Record<IdVille, Map<string, Projet>>

/** Un projet du réseau d'une partie : une partie de Toulouse ne peut pas décider d'un projet lyonnais. */
export const projetDe = (ville: IdVille, id: unknown) => (typeof id === 'string' ? PAR_VILLE[ville].get(id) : undefined)

const MOTS: Record<Action, { verbe: string; participe: string }> = {
  construire: { verbe: 'Construire', participe: 'Construit' },
  moderniser: { verbe: 'Moderniser', participe: 'Modernisé' },
  achever: { verbe: 'Achever', participe: 'Achevé' },
  renforcer: { verbe: 'Renforcer', participe: 'Renforcé' },
  electrifier: { verbe: 'Électrifier', participe: 'Électrifié' },
}

/** Le vocabulaire d'un projet : « Moderniser pour 522 M€ », « Modernisée » sur la carte. */
export function mots(id: string) {
  const projet = PROJETS.get(id)
  const { verbe, participe } = MOTS[projet?.action ?? 'construire']
  return { verbe, participe: projet?.feminin ? `${participe}e` : participe }
}

export const MANDATS = {
  1: { debut: 2026, fin: 2032 },
  2: { debut: 2032, fin: 2038 },
} as const
