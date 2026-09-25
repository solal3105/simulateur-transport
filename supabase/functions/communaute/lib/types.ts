// Copie de lib/types.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
export type Mode = 'metro' | 'renovation' | 'tram' | 'bus' | 'cable' | 'fluvial'

/** Les deux mandats de la partie. */
export type Mandat = 1 | 2

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

export interface Projet {
  id: string
  nom: string
  /** Le genre d'ouvrage, en quelques mots, affiché au-dessus du nom. */
  genre: string
  description: string
  mode: Mode
  /** Investissement en millions d'euros. */
  cout: number
  /** Voyageurs gagnés par jour de semaine, d'après les études publiques. */
  voyageurs: number
  /** Durée du chantier en années. */
  duree: number
  variantes?: Variante[]
  option?: { nom: string; detail: string; surcout: number; duree: number }
  /** Projet sans lequel celui-ci ne peut pas être construit. */
  requiert?: string
  /** Nom du tracé dans public/data/projets.json. Absent pour les projets sans tracé propre. */
  trace?: string
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
  mandat: Mandat
  etale: boolean
  estimation: Estimation
}

/** Ce que le calcul d'une ligne doit savoir en plus de ses points. */
export interface OptionsLigne {
  passages?: number[]
  /** Le premier point est le terminus d'une ligne existante : sa station est déjà construite. */
  prolonge?: boolean
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
