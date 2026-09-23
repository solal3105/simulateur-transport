/**
 * Le budget d'une ville, établi partout de la même façon (la méthode est dans docs/budgets.md) : ce que
 * l'autorité organisatrice investira dans les transports publics à chaque mandat, moins ce qui reste à payer
 * sur les projets déjà décidés et dessinés sur la carte, moins le renouvellement des bus et des lignes
 * existantes. Ce qui reste revient au joueur.
 *
 * Chaque ville a son fichier dans lib/budgets, avec les mêmes quatre postes, et pour chacun ses montants,
 * une explication lisible par un joueur et ses sources. L'écran « Comment nous calculons votre budget »
 * les affiche tels quels ; scripts/verifier-budgets.ts contrôle qu'aucun chiffre n'est sans source.
 */
import type { Mandat } from './types'

/** Un document cité à l'appui d'un chiffre. */
export interface Source {
  /** Qui publie le document et ce qu'il est : « Tisséo Collectivités, budget primitif 2026 ». */
  titre: string
  url: string
  /** Les pages où lire le chiffre, quand le document est long : « p. 4 et 19 ». */
  pages?: string
}

/** Un poste du budget : son montant à chaque mandat, comment nous l'avons établi, et d'où viennent les chiffres. */
export interface Poste {
  /** En millions d'euros, pour chacun des deux mandats. */
  montants: Record<Mandat, number>
  /** Comment nous avons établi ces montants, en quelques phrases qu'un joueur peut lire. */
  explication: string
  sources: Source[]
}

export interface BudgetVille {
  /** Qui paie, tel qu'on le nomme dans une phrase : « Tisséo Collectivités ». */
  payeur: string
  /** Ce que les financeurs investiront dans les transports publics du territoire du jeu, projets décidés compris. */
  total: Poste
  /** Ce qui reste à payer sur les projets déjà décidés et dessinés sur la carte comme des lignes existantes. */
  decides: Poste
  /** Le renouvellement des bus et de leurs dépôts. */
  bus: Poste
  /** L'entretien, le renouvellement et la modernisation des lignes existantes. */
  lignes: Poste
  /** Ce que nous n'avons pas pu vérifier, une phrase par point. */
  limites: string[]
  /** Le mois où les chiffres ont été relevés : « septembre 2026 ». */
  releve: string
}

export const POSTES = ['total', 'decides', 'bus', 'lignes'] as const
export type NomPoste = (typeof POSTES)[number]

/** L'enveloppe d'un mandat pour le jeu : tout l'investissement, moins les projets décidés déjà sur la carte. */
export const enveloppe = (b: BudgetVille, m: Mandat) => b.total.montants[m] - b.decides.montants[m]

/** Ce qui est réservé d'office sur un mandat : les bus et les lignes existantes. */
export const reserve = (b: BudgetVille, m: Mandat) => b.bus.montants[m] + b.lignes.montants[m]

/** Ce qui revient au joueur sur un mandat, avant ses leviers de financement. */
export const libre = (b: BudgetVille, m: Mandat) => enveloppe(b, m) - reserve(b, m)

/** Un budget s'explique quand chacun de ses postes non nuls cite au moins un document. */
export const estSource = (b: BudgetVille) =>
  POSTES.every((p) => b[p].sources.length > 0 || (b[p].montants[1] === 0 && b[p].montants[2] === 0))

/**
 * Le nom de la part réservée : court pour la légende de la jauge, après « réservés » dans une phrase, et
 * pour dire ce qui reste « une fois payés » les bus et les lignes existantes.
 */
export function nomReserve(b: BudgetVille) {
  const lignes = b.lignes.montants[1] > 0 || b.lignes.montants[2] > 0
  return lignes
    ? {
        court: 'Bus et lignes existantes',
        phrase: 'aux bus et aux lignes existantes',
        payes: 'une fois payés les bus et les lignes existantes',
      }
    : { court: 'Entretien des bus', phrase: 'à l’entretien des bus', payes: 'une fois payé l’entretien des bus' }
}
