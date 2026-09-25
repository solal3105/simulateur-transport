// Copie de lib/villes.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
/**
 * Ce qui change d'un réseau à l'autre : la carte, le budget, les leviers de financement, les couleurs,
 * le réglage de la formule de fréquentation et quelques repères pour les textes. Chaque réseau couvre le
 * territoire de son autorité organisatrice (toute l'Île-de-France pour Île-de-France Mobilités), pas une
 * seule ville ; le code garde le mot « ville » pour ses identifiants. Ce module ne dépend d'aucun navigateur : la fonction serveur de
 * la communauté l'utilise pour recalculer un réseau publié avec les règles de sa ville.
 *
 * Les chiffres de Tisséo, d'Aix-Marseille-Provence, de Lignes d'Azur et d'Île-de-France Mobilités et leurs
 * sources sont dans docs/villes.md, sauf le
 * budget, que chaque ville détaille dans lib/budgets selon la méthode de docs/budgets.md. La constante de
 * la formule de fréquentation de chaque ville est dans lib/formule.ts, écrit par le moteur.
 */

import type { BudgetVille } from './budget.ts'
import { idf } from './budgets/idf.ts'
import { lyon } from './budgets/lyon.ts'
import { marseille } from './budgets/marseille.ts'
import { nice } from './budgets/nice.ts'
import { toulouse } from './budgets/toulouse.ts'

export type IdVille = 'lyon' | 'toulouse' | 'marseille' | 'nice' | 'idf'

/** Le nom du site, le même pour tous les réseaux : TCL et Tisséo sont les noms des réseaux, pas du site. */
export const MARQUE = 'Simulateur transport'

type Emprise = [[number, number], [number, number]]

/** Les couleurs d'un réseau, qui remplacent le rouge TCL dans toute l'interface quand on y joue. */
export interface Couleurs {
  /** La couleur de la marque, sur laquelle le texte blanc reste lisible. */
  principale: string
  /** Plus sombre, pour les survols et les textes sur fond pâle. */
  fonce: string
  /** Très claire, pour les fonds. */
  pale: string
  /** Entre les deux, pour les hachures des jauges. */
  moyen: string
}

export interface Ville {
  id: IdVille
  /** Le nom du réseau, tel qu'on le montre partout : « TCL », « Île-de-France Mobilités ». */
  nom: string
  /** Le territoire en quelques mots, sous le nom du réseau : « Métropole de Lyon », « Île-de-France ». */
  lieu: string
  /** Où l'on joue, dans une phrase : « sur le réseau TCL », « en Île-de-France ». */
  ou: string
  /** Le chemin de sa page d'accueil : vide pour Lyon, à la racine du site. */
  chemin: string
  couleurs: Couleurs
  /** Le titre de la page d'accueil du réseau, dans l'onglet et les moteurs de recherche. */
  titrePage: string
  /** Ce qui suit « le réseau » dans une phrase : « le réseau TCL », « le réseau francilien ». */
  reseau: string
  /** Qui organise les transports, tel qu'on le présente à l'accueil. */
  autorite: string
  /** Le territoire du jeu dans une phrase : « les transports de la Métropole ». */
  territoire: string
  /** Sous-dossier de public/data. Lyon garde la racine, où ses données ont toujours été. */
  dossier: string
  /** Latitude de référence des distances : un degré de longitude y mesure 111 320 m × cos(latitude). */
  latitude: number
  /** Le centre du territoire, [lon, lat], d'où la formule de fréquentation mesure la distance au centre. */
  centre: [number, number]
  /** Le budget de chaque mandat, poste par poste et avec ses sources : lib/budgets/<ville>.ts. */
  budget: BudgetVille
  /** Un catalogue de projets réels ; sans lui, le joueur trace toutes ses lignes. */
  catalogue: boolean
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
    nom: 'TCL',
    lieu: 'Métropole de Lyon',
    ou: 'sur le réseau TCL',
    chemin: '',
    // Le rouge et le rouge foncé déclarés par la feuille de style de tcl.fr, relevés le 24 septembre 2026.
    couleurs: { principale: '#e30613', fonce: '#b40014', pale: '#fce9ea', moyen: '#f18289' },
    titrePage: 'Simulateur transport : construisez le réseau TCL de 2038',
    reseau: 'TCL',
    autorite: 'Métropole de Lyon, réseau TCL',
    territoire: 'de la Métropole de Lyon',
    dossier: '',
    latitude: 45.755,
    centre: [4.8357, 45.764],
    budget: lyon,
    catalogue: true,
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
    nom: 'Tisséo',
    lieu: 'Agglomération toulousaine',
    ou: 'sur le réseau Tisséo',
    chemin: 'toulouse',
    // Le magenta déclaré par la feuille de style de tisseo.fr, relevé le 24 septembre 2026.
    couleurs: { principale: '#e5056e', fonce: '#b30456', pale: '#fde8f2', moyen: '#f282b6' },
    titrePage: 'Simulateur transport : construisez le réseau Tisséo de 2038',
    reseau: 'Tisséo',
    autorite: 'Tisséo Collectivités',
    territoire: 'de l’agglomération toulousaine',
    dossier: 'toulouse',
    latitude: 43.604,
    centre: [1.444, 43.6045],
    budget: toulouse,
    catalogue: true,
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
    nom: 'La Métropole Mobilité',
    lieu: 'Aix-Marseille-Provence',
    ou: 'dans la métropole Aix-Marseille-Provence',
    chemin: 'marseille',
    // L'ocre de La Métropole Mobilité (#e94e1b) est trop clair pour du texte blanc : on prend la teinte plus
    // soutenue que rtm.fr utilise pour ses onglets actifs, relevée le 24 septembre 2026.
    couleurs: { principale: '#d14415', fonce: '#a33511', pale: '#fbede8', moyen: '#e8a28a' },
    titrePage: 'Simulateur transport : construisez le réseau d’Aix-Marseille-Provence de 2038',
    reseau: 'd’Aix-Marseille-Provence',
    autorite: 'Métropole d’Aix-Marseille-Provence',
    territoire: 'de la métropole Aix-Marseille-Provence',
    dossier: 'marseille',
    latitude: 43.3,
    centre: [5.3698, 43.2965],
    budget: marseille,
    catalogue: true,
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
    nom: 'Lignes d’Azur',
    lieu: 'Métropole Nice Côte d’Azur',
    ou: 'sur le réseau Lignes d’Azur',
    chemin: 'nice',
    // L'orange de lignesdazur.com (#ec6608), assombri juste assez pour que le texte blanc reste lisible.
    couleurs: { principale: '#c25407', fonce: '#974105', pale: '#f9f0e9', moyen: '#e0a983' },
    titrePage: 'Simulateur transport : construisez le réseau Lignes d’Azur de 2038',
    reseau: 'Lignes d’Azur',
    autorite: 'Métropole Nice Côte d’Azur',
    territoire: 'de la métropole Nice Côte d’Azur',
    dossier: 'nice',
    latitude: 43.7,
    centre: [7.27, 43.6975],
    budget: nice,
    catalogue: true,
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
  idf: {
    id: 'idf',
    nom: 'Île-de-France Mobilités',
    lieu: 'Île-de-France',
    ou: 'en Île-de-France',
    chemin: 'ile-de-france',
    // Le bleu des boutons du site d'Île-de-France Mobilités, avec son bleu ciel identitaire (#64b5f6) en nuance.
    couleurs: { principale: '#1972d2', fonce: '#1459a4', pale: '#eaf2fb', moyen: '#64b5f6' },
    titrePage: 'Simulateur transport : construisez le réseau francilien de 2038',
    reseau: 'francilien',
    autorite: 'Île-de-France Mobilités',
    territoire: 'd’Île-de-France',
    dossier: 'idf',
    latitude: 48.86,
    centre: [2.3522, 48.8566],
    budget: idf,
    catalogue: true,
    emprise: [
      [2.2, 48.79],
      [2.5, 48.93],
    ],
    limites: [
      [1.2, 47.95],
      [3.8, 49.4],
    ],
    zoneQuartiers: [
      [1.43, 48.1],
      [3.57, 49.25],
    ],
    zoneRecherche: [
      [1.43, 48.1],
      [3.57, 49.25],
    ],
    exempleRecherche: 'Châtelet, Versailles, Évry…',
    lieux: [
      { nom: 'Paris', pos: [2.3522, 48.8566], grand: true },
      { nom: 'Saint-Denis', pos: [2.358, 48.936] },
      { nom: 'Montreuil', pos: [2.443, 48.863] },
      { nom: 'Boulogne-Billancourt', pos: [2.24, 48.835] },
      { nom: 'Nanterre', pos: [2.206, 48.892] },
      { nom: 'Créteil', pos: [2.455, 48.79] },
      { nom: 'Argenteuil', pos: [2.25, 48.948] },
      { nom: 'Versailles', pos: [2.13, 48.805] },
      { nom: 'Cergy', pos: [2.064, 49.036] },
      { nom: 'Évry-Courcouronnes', pos: [2.441, 48.629] },
      { nom: 'Massy', pos: [2.27, 48.73] },
      { nom: 'Saint-Quentin-en-Yvelines', pos: [2.037, 48.771] },
      { nom: 'Roissy', pos: [2.52, 49.004] },
      { nom: 'Marne-la-Vallée', pos: [2.6, 48.84] },
      { nom: 'Meaux', pos: [2.878, 48.96] },
      { nom: 'Melun', pos: [2.655, 48.54] },
      { nom: 'Mantes-la-Jolie', pos: [1.717, 48.99] },
      { nom: 'Poissy', pos: [2.047, 48.929] },
      { nom: 'Corbeil-Essonnes', pos: [2.482, 48.61] },
      { nom: 'Saclay', pos: [2.17, 48.73] },
    ],
    densite: [300, 1200, 2600, 4000],
    repere: 'Pour comparer, le tram T3a, long de 12 km, transporte environ 220 000 voyageurs par jour.',
  },
}

export const ID_VILLES = Object.keys(VILLES) as IdVille[]

// Object.hasOwn écarte les noms hérités comme « toString », qu'un lien fabriqué pourrait envoyer.
export const estVille = (id: unknown): id is IdVille => typeof id === 'string' && Object.hasOwn(VILLES, id)

/** La ville d'un identifiant venu de l'extérieur, Lyon par défaut. */
export const villeDe = (id: unknown): Ville => (estVille(id) ? VILLES[id] : VILLES.lyon)

/** L'adresse de l'accueil d'un réseau : la racine du site pour Lyon. */
export const adresseAccueil = (ville: IdVille) => `/${VILLES[ville].chemin}`

/** L'adresse de la page qui explique le budget et le calcul des voyageurs d'un réseau. */
export const adresseMethode = (ville: IdVille) => (VILLES[ville].chemin ? `/${VILLES[ville].chemin}/methode` : '/methode')

/** Les couleurs d'un réseau, en variables CSS, pour la première peinture d'une page. */
export const cssCouleurs = (c: Couleurs) =>
  `:root{--color-rouge:${c.principale};--color-rouge-fonce:${c.fonce};--color-rouge-pale:${c.pale};--color-rouge-moyen:${c.moyen}}`

/** L'adresse des réseaux publiés d'un réseau, rangée comme sa page de méthode : /toulouse/communaute. */
export const adresseReseaux = (ville: IdVille) => (VILLES[ville].chemin ? `/${VILLES[ville].chemin}/communaute` : '/communaute')
