// Copie de lib/leviers.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
/**
 * Les leviers de financement d'un réseau : ce que rapporte ou coûte chacun sur un mandat de six ans, en
 * millions d'euros, calculé à partir des recettes réelles du réseau (la méthode est dans docs/budgets.md).
 * Chaque réseau a les siens dans son fichier de lib/budgets ; une mesure absente n'y est pas proposée.
 */
import type { Source } from './budget.ts'
import type { Leviers } from './types.ts'

/** Les mesures à coût fixe, activées ou non par le joueur. */
export type MesureFixe = 'gratuiteTotale' | 'gratuiteMoins25' | 'gratuiteJeunesAbonnes' | 'suppressionTarifSocial' | 'metroNuit' | 'tva'

export interface ParametresLeviers {
  /** Les tarifs actuels, en euros, affichés quand on les modifie. */
  tarifs: { abonnement: number; ticket: number }
  /** Ce que rapporte, par mandat, 1 % de hausse du prix des abonnements, des tickets ou du versement mobilité. */
  rendement: { abonnements: number; tickets: number; versementMobilite: number }
  /** Le taux actuel du versement mobilité, en pourcentage de la masse salariale, quand il est connu. */
  tauxVersement?: number
  /** Ce que rapporte (positif) ou coûte (négatif) chaque mesure sur un mandat. */
  fixes: Partial<Record<MesureFixe, number>>
  /**
   * Le texte d'une mesure quand il diffère d'un réseau à l'autre : le service de nuit (le métro à Lyon, le
   * tram à Nice) doit toujours en avoir un, et une mesure que la loi encadre peut changer de nom.
   */
  textes?: Partial<Record<MesureFixe, { titre: string; detail: string }>>
  /** En une ou deux phrases simples : d'où viennent ces montants. */
  simple: string
  /** Le détail du calcul, pour qui veut vérifier. */
  explication: string
  sources: Source[]
}

/** Ce que les leviers ajoutent ou retirent à l'enveloppe d'un mandat. */
export function effetLeviers(l: Leviers, p: ParametresLeviers): number {
  const fixe = (m: MesureFixe) => (l[m] ? (p.fixes[m] ?? 0) : 0)
  let total = 0
  if (l.gratuiteTotale && p.fixes.gratuiteTotale !== undefined) total += p.fixes.gratuiteTotale
  else {
    // La gratuité totale rend sans objet les autres mesures tarifaires.
    total += fixe('gratuiteMoins25') + fixe('gratuiteJeunesAbonnes') + fixe('suppressionTarifSocial')
    total += l.abonnements * p.rendement.abonnements + l.tickets * p.rendement.tickets
  }
  total += fixe('metroNuit') + fixe('tva')
  total += l.versementMobilite * p.rendement.versementMobilite
  return total
}

/** Les leviers qu'un réseau propose : une mesure absente de ses paramètres reste désactivée. */
export function leviersPossibles(l: Leviers, p: ParametresLeviers): Leviers {
  const garder = (m: MesureFixe) => l[m] && p.fixes[m] !== undefined
  return {
    ...l,
    gratuiteTotale: garder('gratuiteTotale'),
    gratuiteMoins25: garder('gratuiteMoins25'),
    gratuiteJeunesAbonnes: garder('gratuiteJeunesAbonnes'),
    suppressionTarifSocial: garder('suppressionTarifSocial'),
    metroNuit: garder('metroNuit'),
    tva: garder('tva'),
  }
}

/** Les mesures à coût fixe, dans l'ordre où elles s'affichent, avec leur texte. */
export const MESURES: { cle: MesureFixe; titre: string; detail: string; tarifaire: boolean }[] = [
  {
    cle: 'gratuiteTotale',
    titre: 'Gratuité pour tout le monde',
    detail: 'Plus aucune recette de billets ni d’abonnements.',
    tarifaire: false,
  },
  { cle: 'gratuiteMoins25', titre: 'Gratuité pour les moins de 25 ans', detail: 'Sans condition de ressources.', tarifaire: true },
  {
    cle: 'gratuiteJeunesAbonnes',
    titre: 'Gratuité des 11-18 ans enfants d’abonnés',
    detail: 'Dès qu’un parent a un abonnement.',
    tarifaire: true,
  },
  { cle: 'metroNuit', titre: 'Service de nuit le week-end', detail: '', tarifaire: false },
  {
    // La clé garde son nom d'origine pour les parties déjà enregistrées ; la loi interdit de supprimer les
    // tarifs solidaires, on ne peut que les ramener au minimum légal.
    cle: 'suppressionTarifSocial',
    titre: 'Ramener les réductions solidaires à 50 %',
    detail: 'La loi impose au moins 50 % de réduction aux plus modestes : on ne peut que reprendre ce qui est accordé au-delà.',
    tarifaire: true,
  },
  { cle: 'tva', titre: 'TVA des transports à 5,5 %', detail: 'Au lieu de 10 % aujourd’hui.', tarifaire: false },
]

/** Le titre et le détail d'une mesure sur un réseau : les siens s'il en a, sinon ceux de tous. */
export const titreMesure = (m: (typeof MESURES)[number], p: ParametresLeviers) => p.textes?.[m.cle]?.titre ?? m.titre
export const detailMesure = (m: (typeof MESURES)[number], p: ParametresLeviers) => p.textes?.[m.cle]?.detail ?? m.detail
