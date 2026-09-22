/**
 * Le programme s'étale sur deux mandats métropolitains consécutifs.
 * Un ouvrage est inscrit sur l'un, sur l'autre, ou étalé sur les deux.
 */
export type Phase = 'M1' | 'M2' | 'M1M2'

/** Famille de mode, qui détermine le pictogramme et la couleur du tracé. */
export type Mode = 'metro' | 'renovation' | 'tram' | 'bus' | 'cable' | 'fluvial'

export interface Variant {
  id: string
  /** Libellé court affiché dans le sélecteur de variante. */
  name: string
  /** Une phrase qui dit ce que la variante change concrètement. */
  detail: string
  mode: Mode
  /** Investissement total en millions d'euros. */
  cost: number
  /** Fréquentation supplémentaire estimée, en voyageurs par jour. */
  ridership: number
  /** Durée de chantier en années, à partir du début de la phase. */
  duration: number
}

export interface Project {
  id: string
  name: string
  /** Deux ou trois phrases, dans la langue du produit, sur ce que l'ouvrage fait. */
  description: string
  mode: Mode
  cost: number
  ridership: number
  duration: number
  /** Variantes exclusives : le joueur en retient exactement une. */
  variants?: Variant[]
  /** Option supplémentaire payante sur la variante de base. */
  option?: {
    name: string
    detail: string
    extraCost: number
    extraRidership: number
    duration: number
  }
  /** Ouvrage dont celui-ci dépend : sans lui, il ne peut pas être inscrit. */
  requires?: string
  /** Fichier de tracé, absent quand l'ouvrage n'a pas de géométrie propre. */
  geometryId?: string
}

export interface Selection {
  projectId: string
  phase: Phase
  variantId?: string
  optionTaken?: boolean
}

/** Programme d'exploitation du parc de bus, financé hors catalogue d'ouvrages. */
export interface FleetProgramme {
  id: 'maintenance' | 'electrification'
  name: string
  description: string
  /** Coût total, réparti sur la ou les phases retenues. */
  cost: number
}

export type LeverId =
  | 'gratuiteTotale'
  | 'gratuiteMoins25'
  | 'gratuiteJeunesAbonnes'
  | 'suppressionTarifSocial'
  | 'metroNuitWeekend'
  | 'tva55'

export interface ToggleLever {
  id: LeverId
  name: string
  detail: string
  /** Effet sur l'enveloppe d'une phase : négatif quand la mesure coûte. */
  perPhase: number
  /** La mesure ne relève pas de la Métropole mais d'une loi nationale. */
  requiresLaw?: boolean
  /** La gratuité totale rend la mesure sans objet. */
  voidedByFreeTravel?: boolean
}

export interface LeverState {
  gratuiteTotale: Phase | null
  gratuiteMoins25: Phase | null
  gratuiteJeunesAbonnes: Phase | null
  suppressionTarifSocial: Phase | null
  metroNuitWeekend: Phase | null
  tva55: Phase | null
  /** Écart au tarif actuel des abonnements, en pourcentage. */
  tarifAbonnements: number
  /** Écart au tarif actuel des tickets, en pourcentage. */
  tarifTickets: number
  /** Écart au taux actuel du versement mobilité, en pourcentage. */
  versementMobilite: number
  maintenance: Phase | null
  electrification: Phase | null
}

export interface PhaseBalance {
  /** Enveloppe de départ, avant leviers. */
  base: number
  /** Effet net des leviers de financement sur cette phase. */
  levers: number
  /** Investissement engagé sur cette phase. */
  spend: number
  /** Ce qu'il reste : base + leviers - engagé. */
  left: number
}

export interface Assessment {
  m1: PhaseBalance
  m2: PhaseBalance
  /** Fréquentation supplémentaire cumulée, en voyageurs par jour. */
  ridership: number
  /** Voyageurs gagnés par million d'euros engagé. */
  yield: number
  spend: number
  balanced: boolean
}

export interface Delivery {
  projectId: string
  name: string
  mode: Mode
  phase: Phase
  start: number
  year: number
}
