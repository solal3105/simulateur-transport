// Copie de lib/villes.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
/**
 * Ce qui change d'une ville à l'autre : la carte, le budget, le réglage de la formule de fréquentation
 * et quelques repères pour les textes. Ce module ne dépend d'aucun navigateur : la fonction serveur de
 * la communauté l'utilise pour recalculer un réseau publié avec les règles de sa ville.
 *
 * Les chiffres de Toulouse, Marseille, Nice et Paris et leurs sources sont dans docs/villes.md, sauf le
 * budget, que chaque ville détaille dans lib/budgets selon la méthode de docs/budgets.md. La constante de
 * la formule de fréquentation de chaque ville est dans lib/formule.ts, écrit par le moteur.
 */

import type { BudgetVille } from './budget.ts'
import { lyon } from './budgets/lyon.ts'
import { marseille } from './budgets/marseille.ts'
import { nice } from './budgets/nice.ts'
import { paris } from './budgets/paris.ts'
import { toulouse } from './budgets/toulouse.ts'

export type IdVille = 'lyon' | 'toulouse' | 'marseille' | 'nice' | 'paris'

/** Le nom du site, le même dans toutes les villes : TCL et Tisséo sont les noms des réseaux, pas du site. */
export const MARQUE = 'Simulateur transport'

type Emprise = [[number, number], [number, number]]

export interface Ville {
  id: IdVille
  nom: string
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
  /** Le centre de la ville, [lon, lat], d'où la formule de fréquentation mesure la distance au centre. */
  centre: [number, number]
  /** Le budget de chaque mandat, poste par poste et avec ses sources : lib/budgets/<ville>.ts. */
  budget: BudgetVille
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
    titrePage: 'Simulateur transport : construisez le réseau TCL de 2038',
    reseau: 'TCL',
    autorite: 'Métropole de Lyon, réseau TCL',
    territoire: 'de la Métropole',
    dossier: '',
    latitude: 45.755,
    centre: [4.8357, 45.764],
    budget: lyon,
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
    titrePage: 'Simulateur transport : construisez le réseau Tisséo de 2038',
    reseau: 'Tisséo',
    autorite: 'Tisséo Collectivités',
    territoire: 'de l’agglomération toulousaine',
    dossier: 'toulouse',
    latitude: 43.604,
    centre: [1.444, 43.6045],
    budget: toulouse,
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
  marseille: {
    id: 'marseille',
    nom: 'Marseille',
    titrePage: 'Simulateur transport : construisez le réseau RTM de 2038',
    reseau: 'RTM',
    autorite: 'Métropole d’Aix-Marseille-Provence',
    territoire: 'de la métropole Aix-Marseille-Provence',
    dossier: 'marseille',
    latitude: 43.3,
    centre: [5.3698, 43.2965],
    budget: marseille,
    catalogue: false,
    leviers: false,
    emprise: [
      [5.27, 43.2],
      [5.57, 43.4],
    ],
    limites: [
      [4.6, 43.05],
      [5.95, 43.85],
    ],
    zoneQuartiers: [
      [5.2, 43.15],
      [5.65, 43.45],
    ],
    zoneRecherche: [
      [4.7, 43.13],
      [5.85, 43.8],
    ],
    exempleRecherche: 'Castellane, Aix-en-Provence, La Joliette…',
    lieux: [
      { nom: 'Marseille', pos: [5.37, 43.296], grand: true },
      { nom: 'Aix-en-Provence', pos: [5.447, 43.529], grand: true },
      { nom: 'Aubagne', pos: [5.57, 43.292] },
      { nom: 'La Ciotat', pos: [5.605, 43.175] },
      { nom: 'Martigues', pos: [5.054, 43.405] },
      { nom: 'Vitrolles', pos: [5.248, 43.46] },
      { nom: 'Marignane', pos: [5.214, 43.416] },
      { nom: 'Istres', pos: [4.987, 43.513] },
      { nom: 'Salon-de-Provence', pos: [5.097, 43.64] },
      { nom: 'Gardanne', pos: [5.469, 43.455] },
      { nom: 'Allauch', pos: [5.483, 43.336] },
      { nom: 'Cassis', pos: [5.538, 43.214] },
      { nom: 'Pertuis', pos: [5.502, 43.694] },
      { nom: 'Miramas', pos: [5.002, 43.582] },
    ],
    densite: [100, 400, 1200, 2500],
    repere: 'Pour comparer, le tram T2, long de 5,7 km, transporte environ 67 000 voyageurs par jour.',
  },
  nice: {
    id: 'nice',
    nom: 'Nice',
    titrePage: 'Simulateur transport : construisez le réseau Lignes d’Azur de 2038',
    reseau: 'Lignes d’Azur',
    autorite: 'Métropole Nice Côte d’Azur',
    territoire: 'de la métropole Nice Côte d’Azur',
    dossier: 'nice',
    latitude: 43.7,
    centre: [7.27, 43.6975],
    budget: nice,
    catalogue: false,
    leviers: false,
    emprise: [
      [7.14, 43.64],
      [7.36, 43.76],
    ],
    limites: [
      [6.7, 43.55],
      [7.55, 44.42],
    ],
    zoneQuartiers: [
      [7.1, 43.63],
      [7.38, 43.8],
    ],
    zoneRecherche: [
      [6.76, 43.6],
      [7.46, 44.38],
    ],
    exempleRecherche: 'Masséna, Saint-Laurent-du-Var, L’Ariane…',
    lieux: [
      { nom: 'Nice', pos: [7.262, 43.703], grand: true },
      { nom: 'Saint-Laurent-du-Var', pos: [7.19, 43.673] },
      { nom: 'Cagnes-sur-Mer', pos: [7.149, 43.664] },
      { nom: 'Vence', pos: [7.112, 43.722] },
      { nom: 'Saint-Jeannet', pos: [7.143, 43.748] },
      { nom: 'Carros', pos: [7.187, 43.788] },
      { nom: 'La Trinité', pos: [7.314, 43.742] },
      { nom: 'Drap', pos: [7.322, 43.755] },
      { nom: 'Èze', pos: [7.361, 43.728] },
      { nom: 'Levens', pos: [7.225, 43.859] },
      { nom: 'Tourrette-Levens', pos: [7.276, 43.786] },
    ],
    densite: [100, 450, 1200, 2000],
    repere: 'Pour comparer, le tram L1, long de 9,2 km, transporte environ 120 000 voyageurs par jour.',
  },
  paris: {
    id: 'paris',
    nom: 'Paris',
    titrePage: 'Simulateur transport : construisez le réseau parisien de 2038',
    reseau: 'parisien',
    autorite: 'Île-de-France Mobilités',
    territoire: 'de Paris et de la petite couronne',
    dossier: 'paris',
    latitude: 48.86,
    centre: [2.3522, 48.8566],
    budget: paris,
    catalogue: false,
    leviers: false,
    emprise: [
      [2.22, 48.8],
      [2.48, 48.92],
    ],
    limites: [
      [2.0, 48.6],
      [2.8, 49.1],
    ],
    zoneQuartiers: [
      [2.14, 48.68],
      [2.62, 49.02],
    ],
    zoneRecherche: [
      [2.1, 48.66],
      [2.66, 49.04],
    ],
    exempleRecherche: 'Châtelet, Saint-Denis, Créteil…',
    lieux: [
      { nom: 'Paris', pos: [2.3522, 48.8566], grand: true },
      { nom: 'Saint-Denis', pos: [2.358, 48.936] },
      { nom: 'Montreuil', pos: [2.443, 48.863] },
      { nom: 'Boulogne-Billancourt', pos: [2.24, 48.835] },
      { nom: 'Nanterre', pos: [2.206, 48.892] },
      { nom: 'Créteil', pos: [2.455, 48.79] },
      { nom: 'Vitry-sur-Seine', pos: [2.393, 48.787] },
      { nom: 'Colombes', pos: [2.254, 48.922] },
      { nom: 'Champigny-sur-Marne', pos: [2.515, 48.817] },
      { nom: 'Aulnay-sous-Bois', pos: [2.497, 48.938] },
      { nom: 'Bobigny', pos: [2.44, 48.908] },
      { nom: 'Noisy-le-Grand', pos: [2.553, 48.848] },
    ],
    densite: [500, 1500, 2600, 4000],
    repere: 'Pour comparer, le tram T3a, long de 12 km, transporte environ 250 000 voyageurs par jour.',
  },
}

export const ID_VILLES = Object.keys(VILLES) as IdVille[]

// Object.hasOwn écarte les noms hérités comme « toString », qu'un lien fabriqué pourrait envoyer.
export const estVille = (id: unknown): id is IdVille => typeof id === 'string' && Object.hasOwn(VILLES, id)

/** La ville d'un identifiant venu de l'extérieur, Lyon par défaut. */
export const villeDe = (id: unknown): Ville => (estVille(id) ? VILLES[id] : VILLES.lyon)

/** L'adresse de l'accueil d'une ville : la racine du site pour Lyon. */
export const adresseAccueil = (ville: IdVille) => (ville === 'lyon' ? '/' : `/${ville}`)

/** L'adresse des réseaux publiés d'une ville. */
export const adresseReseaux = (ville: IdVille) => (ville === 'lyon' ? '/communaute' : `/communaute?ville=${ville}`)
