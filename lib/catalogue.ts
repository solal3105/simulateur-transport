import { idf } from './catalogues/idf'
import { lyon } from './catalogues/lyon'
import { marseille } from './catalogues/marseille'
import { nice } from './catalogues/nice'
import { toulouse } from './catalogues/toulouse'
import type { Action, Catalogue, Mandat, Projet } from './types'
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

/** Un mandat dure six ans, et le premier commence en 2026. */
const PREMIERE_ANNEE = 2026
const DUREE_MANDAT = 6
export const debutMandat = (m: Mandat) => PREMIERE_ANNEE + DUREE_MANDAT * (m - 1)
export const finMandat = (m: Mandat) => debutMandat(m) + DUREE_MANDAT

/** La partie de base compte deux mandats, jusqu'en 2038 ; le jeu libre couvre les mêmes douze ans d'un coup. */
export const MANDATS_DE_BASE = 2
/** Au-delà, une partie ne vient pas du jeu : cent mandats mènent en 2626. */
export const MANDATS_MAX = 100

/** Le nombre de mandats d'une partie arrivée à ce mandat : au moins les deux de la partie de base. */
export const mandatsJoues = (mandat: Mandat) => Math.max(MANDATS_DE_BASE, mandat)

/** L'année où l'on regarde le réseau d'une partie de tant de mandats : la fin du dernier, et jamais avant 2038. */
export const horizon = (mandats: Mandat) => finMandat(Math.max(MANDATS_DE_BASE, mandats))
