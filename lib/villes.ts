/**
 * Ce qui change d'une ville à l'autre : la carte, le budget, le réglage de la formule de fréquentation
 * et quelques repères pour les textes. Ce module ne dépend d'aucun navigateur : la fonction serveur de
 * la communauté l'utilise pour recalculer un réseau publié avec les règles de sa ville.
 *
 * Les chiffres de Toulouse et leurs sources sont dans docs/villes.md.
 */

export type IdVille = 'lyon' | 'toulouse'

type Emprise = [[number, number], [number, number]]

export interface Ville {
  id: IdVille
  nom: string
  /** Le nom du site sur les écrans de cette ville. */
  marque: string
  /** Le titre de la page d'accueil de la ville, dans l'onglet et les moteurs de recherche. */
  titrePage: string
  /** Le nom du réseau de transport : « le réseau TCL ». */
  reseau: string
  /** Qui organise les transports, tel qu'on le présente à l'accueil. */
  autorite: string
  /** Le territoire du jeu dans une phrase : « les transports de la Métropole ». */
  territoire: string
  /** Sous-dossier de public/data. Lyon garde la racine, où ses données ont toujours été. */
  dossier: string
  /** Latitude de référence des distances : un degré de longitude y mesure 111 320 m × cos(latitude). */
  latitude: number
  /** Constante A de la formule de fréquentation (lib/modele.ts), recalée sur les lignes de la ville. */
  constante: number
  /** Enveloppe d'investissement de chaque mandat, en millions d'euros. */
  enveloppe: number
  /** Entretien et renouvellement du parc de bus, réservé d'office sur chaque mandat. */
  entretienBus: number
  /** Un catalogue de projets réels ; sans lui, le joueur trace toutes ses lignes. */
  catalogue: boolean
  /** Les leviers de financement (tarifs, versement mobilité) sont calculés pour ce réseau. */
  leviers: boolean
  /** Vue de départ de la carte. */
  emprise: Emprise
  /** Au-delà, la carte ne se déplace plus. */
  limites: Emprise
  /** Où afficher les noms de quartiers quand on zoome. */
  zoneQuartiers: Emprise
  /** Où chercher un lieu tapé au clavier dans le traceur. */
  zoneRecherche: Emprise
  /** Exemples de lieux pour le champ de recherche du traceur. */
  exempleRecherche: string
  /** Les noms affichés sur la vue d'ensemble de la carte. */
  lieux: { nom: string; pos: [number, number]; grand?: boolean }[]
  /** Paliers de densité (habitants plus 0,3 emploi par carreau) de la couche rouge du traceur. */
  densite: [number, number, number, number]
  /** Une ligne connue, pour situer l'estimation d'une ligne tracée. */
  repere: string
}

export const VILLES: Record<IdVille, Ville> = {
  lyon: {
    id: 'lyon',
    nom: 'Lyon',
    marque: 'Simulateur TCL',
    titrePage: 'Simulateur TCL : construisez le réseau lyonnais de 2038',
    reseau: 'TCL',
    autorite: 'Métropole de Lyon, réseau TCL',
    territoire: 'de la Métropole',
    dossier: '',
    latitude: 45.755,
    constante: -8.03,
    enveloppe: 2000,
    entretienBus: 400,
    catalogue: true,
    leviers: true,
    emprise: [
      [4.74, 45.69],
      [5.02, 45.83],
    ],
    limites: [
      [4.55, 45.6],
      [5.2, 45.92],
    ],
    zoneQuartiers: [
      [4.76, 45.69],
      [4.99, 45.82],
    ],
    zoneRecherche: [
      [4.68, 45.64],
      [5.12, 45.88],
    ],
    exempleRecherche: 'Gratte-Ciel, Bron, Lyon 7e…',
    lieux: [
      { nom: 'Lyon', pos: [4.835, 45.76], grand: true },
      { nom: 'Villeurbanne', pos: [4.88, 45.771] },
      { nom: 'Vénissieux', pos: [4.886, 45.697] },
      { nom: 'Bron', pos: [4.912, 45.738] },
      { nom: 'Vaulx-en-Velin', pos: [4.925, 45.78] },
      { nom: 'Décines', pos: [4.96, 45.769] },
      { nom: 'Caluire', pos: [4.846, 45.797] },
      { nom: 'Écully', pos: [4.777, 45.776] },
      { nom: 'Tassin', pos: [4.762, 45.762] },
      { nom: 'Oullins', pos: [4.806, 45.714] },
      { nom: 'Saint-Priest', pos: [4.944, 45.696] },
      { nom: 'Rillieux', pos: [4.899, 45.818] },
      { nom: 'Craponne', pos: [4.724, 45.745] },
      { nom: 'Meyzieu', pos: [5.004, 45.767] },
      { nom: 'Saint-Fons', pos: [4.855, 45.708] },
    ],
    densite: [150, 600, 1500, 3000],
    repere: 'Pour comparer, le tram T9, long de 11,3 km, est attendu à 38 000 voyageurs par jour pour 290 M€.',
  },
  toulouse: {
    id: 'toulouse',
    nom: 'Toulouse',
    marque: 'Simulateur transport',
    titrePage: 'Simulateur transport : construisez le réseau toulousain de 2038',
    reseau: 'Tisséo',
    autorite: 'Tisséo Collectivités',
    territoire: 'de l’agglomération toulousaine',
    dossier: 'toulouse',
    latitude: 43.604,
    // Recalée sur les métros A et B et le tram T1 : les résultats de la formule lyonnaise sont multipliés par 1,45.
    constante: -7.66,
    // Le budget de Lyon rapporté aux 1 115 836 habitants des 114 communes de Tisséo (recensement 2022).
    enveloppe: 1560,
    entretienBus: 310,
    catalogue: false,
    leviers: false,
    emprise: [
      [1.33, 43.535],
      [1.54, 43.675],
    ],
    limites: [
      [0.98, 43.33],
      [1.78, 43.82],
    ],
    zoneQuartiers: [
      [1.33, 43.53],
      [1.54, 43.68],
    ],
    zoneRecherche: [
      [0.98, 43.33],
      [1.78, 43.82],
    ],
    exempleRecherche: 'Capitole, Blagnac, Rangueil…',
    lieux: [
      { nom: 'Toulouse', pos: [1.444, 43.604], grand: true },
      { nom: 'Blagnac', pos: [1.399, 43.634] },
      { nom: 'Colomiers', pos: [1.337, 43.611] },
      { nom: 'Tournefeuille', pos: [1.346, 43.583] },
      { nom: 'Cugnaux', pos: [1.345, 43.537] },
      { nom: 'Balma', pos: [1.498, 43.61] },
      { nom: 'L’Union', pos: [1.484, 43.658] },
      { nom: 'Castelginest', pos: [1.428, 43.693] },
      { nom: 'Ramonville', pos: [1.475, 43.546] },
      { nom: 'Saint-Orens', pos: [1.534, 43.552] },
      { nom: 'Castanet', pos: [1.498, 43.517] },
      { nom: 'Labège', pos: [1.53, 43.529] },
      { nom: 'Portet', pos: [1.408, 43.522] },
      { nom: 'Quint-Fonsegrives', pos: [1.528, 43.585] },
    ],
    densite: [60, 240, 600, 1200],
    repere: 'Pour comparer, le tram T1, long de 14,6 km, transporte environ 48 000 voyageurs par jour.',
  },
}

export const ID_VILLES = Object.keys(VILLES) as IdVille[]

// Object.hasOwn écarte les noms hérités comme « toString », qu'un lien fabriqué pourrait envoyer.
export const estVille = (id: unknown): id is IdVille => typeof id === 'string' && Object.hasOwn(VILLES, id)

/** La ville d'un identifiant venu de l'extérieur, Lyon par défaut. */
export const villeDe = (id: unknown): Ville => (estVille(id) ? VILLES[id] : VILLES.lyon)
