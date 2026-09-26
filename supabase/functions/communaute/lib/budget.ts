// Copie de lib/budget.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
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
import type { ParametresLeviers } from './leviers.ts'
import type { Mandat } from './types.ts'

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
  /**
   * En millions d'euros, pour chacun des deux mandats de la partie de base. Au-delà de 2038, personne ne publie ses
   * investissements : un mandat de plus reprend les montants du second (voir `montant`).
   */
  montants: Record<1 | 2, number>
  /** Ce que couvre ce poste, en une phrase courte que tout le monde comprend, avec un ou deux chiffres. */
  simple: string
  /** Le détail du calcul, pour qui veut vérifier. */
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
  /** Ce que rapportent ou coûtent les leviers de financement ; sans eux, le réseau n'en propose pas. */
  leviers?: ParametresLeviers
  /** Ce que nous n'avons pas pu vérifier, une phrase par point. */
  limites: string[]
  /** Le mois où les chiffres ont été relevés : « septembre 2026 ». */
  releve: string
}

export const POSTES = ['total', 'decides', 'bus', 'lignes'] as const
export type NomPoste = (typeof POSTES)[number]

/** Le montant d'un poste pour un mandat : chaque mandat après le second reprend les montants du second. */
export const montant = (p: Poste, m: Mandat) => p.montants[m <= 1 ? 1 : 2]

/** L'enveloppe d'un mandat pour le jeu : tout l'investissement, moins les projets décidés déjà sur la carte. */
export const enveloppe = (b: BudgetVille, m: Mandat) => montant(b.total, m) - montant(b.decides, m)

/** Ce qui est réservé d'office sur un mandat : les bus et les lignes existantes. */
export const reserve = (b: BudgetVille, m: Mandat) => montant(b.bus, m) + montant(b.lignes, m)

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
    : { court: 'Renouvellement des bus', phrase: 'au renouvellement des bus', payes: 'une fois payé le renouvellement des bus' }
}
