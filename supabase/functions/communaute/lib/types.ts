// Copie de lib/types.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { Source } from './budget.ts'

export type Mode = 'metro' | 'renovation' | 'tram' | 'bus' | 'cable' | 'fluvial'

/**
 * Le rang d'un mandat de six ans : le premier va de 2026 à 2032, le second de 2032 à 2038. La partie de base
 * s'arrête là ; au bilan, on peut la continuer un mandat après l'autre, sans limite.
 */
export type Mandat = number

export interface Variante {
  id: string
  nom: string
  /** Une phrase qui dit ce que la version change concrètement. */
  detail: string
  mode: Mode
  cout: number
  voyageurs: number
  duree: number
}

/** Ce qu'on fait d'un projet, pour le bouton et la carte : « Moderniser pour 522 M€ », « Modernisée ». */
export type Action = 'construire' | 'moderniser' | 'achever' | 'renforcer' | 'electrifier'

/** Un point du tracé d'un projet : une station, ou un point de passage quand il n'a pas de nom. */
export interface PointProjet {
  nom?: string
  pos: [number, number]
}

export interface Projet {
  id: string
  nom: string
  /** Le genre d'ouvrage, en quelques mots, affiché au-dessus du nom. */
  genre: string
  description: string
  mode: Mode
  /** Investissement en millions d'euros. */
  cout: number
  /** Voyageurs par jour de semaine, d'après les études publiques, ou notre estimation quand `estime.voyageurs`. */
  voyageurs: number
  /** Durée du chantier en années. */
  duree: number
  variantes?: Variante[]
  option?: { nom: string; detail: string; surcout: number; duree: number }
  /** Projet sans lequel celui-ci ne peut pas être construit. */
  requiert?: string
  /**
   * Le nom de son tracé sur la carte : dans public/data/projets.json pour Lyon, et ailleurs le tracé dessiné par
   * `parcours`. Absent pour les projets sans tracé propre.
   */
  trace?: string
  /** Le tracé, branche par branche, quand il n'a pas de fichier : les stations dans l'ordre et quelques points de passage. */
  parcours?: PointProjet[][]
  /** La ligne existante que le projet prolonge depuis son terminus, premier point de son parcours : « metro-M2 ». */
  prolonge?: string
  /** Construire par défaut. */
  action?: Action
  /** Le nom appelle un accord au féminin : « La ligne 5, construite ». */
  feminin?: boolean
  /** Où en est le projet dans la réalité, en une phrase : « Déclaré d'utilité publique en juillet 2026. » */
  statut?: string
  /** Ce qu'il faut savoir de ses chiffres : leur date, ce qu'ils comptent, ce qui reste incertain. Une phrase par point. */
  precisions?: string[]
  /** Les chiffres que nous estimons nous-mêmes, faute d'étude publiée, avec la méthode des lignes que vous tracez. */
  estime?: { voyageurs?: boolean; duree?: boolean }
  sources?: Source[]
  /** L'histoire du projet en quelques dates, « 2024-06 » ou « 2024 », chacune avec le document qui l'établit. */
  histoire?: { date: string; texte: string; source: Source }[]
  /** Ce qu'en ont dit les habitants pendant la concertation ou l'enquête publique, résumé, avec le document résumé. */
  avis?: { texte: string; source: Source }
  /** Des articles de presse sur le projet : leur titre, leur média, leur date et leur adresse, jamais leur texte. */
  presse?: { titre: string; media: string; date: string; url: string }[]
}

/** Le catalogue d'un réseau : ses projets réels, et celui que le tutoriel fait lancer. */
export interface Catalogue {
  projets: Projet[]
  /** Le projet que le tutoriel fait toucher sur la carte, la consigne, et ce qu'on en dit. */
  tutoriel?: { projet: string; consigne: string; detail: string }
  /**
   * Le programme que l'autorité a réellement décidé pour les années du jeu : les projets du catalogue qu'il contient, et
   * les documents qui le disent. Il sert de repère à l'objectif « faire mieux que le plan réel ».
   */
  planReel?: { nom: string; projets: string[]; sources: Source[] }
}

/** Un projet du catalogue que le joueur a décidé de construire. */
export interface Chantier {
  id: string
  varianteId?: string
  option?: boolean
  /** Mandat pendant lequel la décision a été prise. */
  mandat: Mandat
  /** La moitié du coût est reportée sur le mandat suivant. */
  etale: boolean
}

export type ModeLigne = 'tram' | 'bus' | 'metro' | 'cable'

/** Une ligne dessinée par le joueur. */
export interface LigneJoueur {
  id: string
  nom: string
  mode: ModeLigne
  /** Les points du tracé, dans l'ordre : des stations, et des points de passage. */
  arrets: [number, number][]
  /** Les rangs des points de passage dans `arrets` : la ligne y passe sans s'arrêter. Les terminus sont toujours des stations. */
  passages?: number[]
  /** La ligne existante que celle-ci prolonge depuis son terminus, qui est alors son premier point : « metro-D ». */
  prolonge?: string
  /** Les noms choisis par le joueur, rang par rang comme `arrets` ; null garde le nom de la station existante ou du quartier. */
  noms?: (string | null)[]
  mandat: Mandat
  etale: boolean
  estimation: Estimation
}

/** Ce que le calcul d'une ligne doit savoir en plus de ses points. */
export interface OptionsLigne {
  passages?: number[]
  /** Le premier point est le terminus d'une ligne existante : sa station est déjà construite. */
  prolonge?: boolean
  /**
   * Le premier point est le terminus d'une ligne du joueur décidée à un mandat précédent, que celle-ci continue : sa
   * station est déjà construite. Celui qui appelle l'a vérifié (`suiteDe`).
   */
  suite?: boolean
}

export interface Estimation {
  km: number
  cout: number
  duree: number
  voyageurs: number
  bas: number
  haut: number
  /** Part des voyageurs qui n'ont aujourd'hui ni tram ni métro à proximité. */
  nouveaux: number
  habitants: number
  emplois: number
  habitantsNonDesservis: number
  /** D'où vient le coût : la voie, les stations et les ouvrages qu'impose le terrain (lib/couts.ts). */
  detail?: DetailCout
}

/** Le coût d'une ligne, part par part, en millions d'euros, avec ce qui l'explique. */
export interface DetailCout {
  voie: number
  stations: number
  /** Tunnels, tranchées couvertes ou viaducs là où la pente est trop forte pour le mode. */
  ouvrages: number
  /** Ponts sur les grands cours d'eau. */
  ponts: number
  /** Stations de métro plus profondes que d'ordinaire, sous une colline. */
  profondeur: number
  kmOuvrage: number
  franchissements: number
  stationsProfondes: number
  /** Plus forte pente du terrain sur 200 m, en pourcentage. */
  penteTerrain: number
}

export interface Leviers {
  abonnements: number
  tickets: number
  versementMobilite: number
  gratuiteTotale: boolean
  gratuiteMoins25: boolean
  gratuiteJeunesAbonnes: boolean
  suppressionTarifSocial: boolean
  metroNuit: boolean
  tva: boolean
}
