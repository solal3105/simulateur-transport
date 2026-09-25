// Copie de lib/catalogues/idf.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { Catalogue, Projet } from '../types.ts'

/**
 * Les projets sur la table en Île-de-France, en dehors du Grand Paris Express, déjà dessiné sur la carte, rassemblés le
 * 25 septembre 2026 dans les dossiers d’Île-de-France Mobilités, les délibérations et les arrêtés d’utilité publique.
 * Chaque projet cite ses sources. Le coût comprend les rames ou les bus quand la source les chiffre avec le projet.
 */
const projets: Projet[] = [
  {
    id: 'idf-metro-1-val-de-fontenay',
    nom: 'Métro 1 jusqu’à Val de Fontenay',
    genre: 'Prolongement de métro',
    description: '',
    mode: 'metro',
    // 1 710 M€ HT de travaux (janvier 2026) et 130 M€ de rames.
    cout: 1840,
    voyageurs: 81000,
    duree: 14,
    trace: 'idf-metro-1-val-de-fontenay',
    prolonge: 'metro-1',
  },
  {
    id: 'idf-t1-val-de-fontenay',
    nom: 'Tram T1 jusqu’à Val de Fontenay',
    genre: 'Prolongement de tramway en chantier',
    description: '',
    mode: 'tram',
    // 485,4 M€ HT d’infrastructure (janvier 2011) et 78,5 M€ de rames.
    cout: 564,
    voyageurs: 70400,
    duree: 4,
    trace: 'idf-t1-val-de-fontenay',
    prolonge: 'tram-T1',
  },
  {
    id: 'idf-t1-colombes',
    nom: 'Tram T1 jusqu’à Petit Colombes',
    genre: 'Prolongement de tramway',
    description: '',
    mode: 'tram',
    // 279,2 M€ d’infrastructure et 46 M€ de rames, en euros de 2013, pour les deux phases.
    cout: 325,
    voyageurs: 60000,
    duree: 5,
    trace: 'idf-t1-colombes',
    prolonge: 'tram-T1',
    estime: { duree: true },
  },
  {
    id: 'idf-t1-rueil-malmaison',
    nom: 'Tram T1 jusqu’à Rueil-Malmaison',
    genre: 'Prolongement de tramway',
    description: '',
    mode: 'tram',
    // 430,8 M€ HT (janvier 2017), dont 51 M€ de rames.
    cout: 431,
    voyageurs: 64000,
    duree: 5,
    requiert: 'idf-t1-colombes',
    trace: 'idf-t1-rueil-malmaison',
  },
  {
    id: 'idf-t8-sud',
    nom: 'Tram T8 jusqu’à Paris Rosa Parks',
    genre: 'Prolongement de tramway',
    description: '',
    mode: 'tram',
    // 224 M€ HT d’infrastructure et 48 M€ pour seize rames (janvier 2023).
    cout: 272,
    voyageurs: 98000,
    duree: 5,
    trace: 'idf-t8-sud',
    prolonge: 'tram-T8',
  },
  {
    id: 'idf-t10-clamart',
    nom: 'Tram T10 jusqu’à la gare de Clamart',
    genre: 'Prolongement de tramway',
    description: '',
    mode: 'tram',
    // 728,6 M€ HT (juillet 2024) et 40,5 M€ de rames.
    cout: 769,
    voyageurs: 55000,
    duree: 12,
    trace: 'idf-t10-clamart',
    prolonge: 'tram-T10',
  },
  {
    id: 'idf-t7-juvisy',
    nom: 'Tram T7 jusqu’à Juvisy-sur-Orge',
    genre: 'Prolongement de tramway en chantier',
    description: '',
    mode: 'tram',
    // 223,5 M€ d’infrastructure (euros de 2011) et 29 M€ de rames (euros de 2018).
    cout: 253,
    voyageurs: 22400,
    duree: 6,
    trace: 'idf-t7-juvisy',
    prolonge: 'tram-T7',
  },
  {
    id: 'idf-t13-acheres',
    nom: 'Tram T13 jusqu’à Achères',
    genre: 'Nouvelle branche de tram-train en chantier',
    description: '',
    mode: 'tram',
    // 361,2 M€ HT d’infrastructure (janvier 2013) et 84,6 M€ de rames.
    cout: 446,
    voyageurs: 17000,
    duree: 2,
    trace: 'idf-t13-acheres',
  },
  {
    id: 'idf-tzen-5',
    nom: 'Tzen 5, de Paris à Choisy-le-Roi',
    genre: 'Bus à haut niveau de service',
    description: '',
    mode: 'bus',
    // 117 M€ HT d’infrastructure (août 2014) et 25,5 M€ de bus.
    cout: 143,
    voyageurs: 37000,
    duree: 2,
    trace: 'idf-tzen-5',
  },
  {
    id: 'idf-tzen-3',
    nom: 'Tzen 3, de Paris aux Pavillons-sous-Bois',
    genre: 'Bus à haut niveau de service',
    description: '',
    mode: 'bus',
    // 187,7 M€ HT d’infrastructure (2010) et 16 M€ de bus.
    cout: 204,
    voyageurs: 42000,
    duree: 4,
    trace: 'idf-tzen-3',
  },
  {
    id: 'idf-tzen-2',
    nom: 'Tzen 2, de Lieusaint à Melun',
    genre: 'Bus à haut niveau de service en chantier',
    description: '',
    mode: 'bus',
    // 179,1 M€ d’infrastructure (2016), sans les bus.
    cout: 179,
    voyageurs: 27000,
    duree: 5,
    trace: 'idf-tzen-2',
  },
  {
    id: 'idf-bus-bords-de-marne',
    nom: 'Bus Bords de Marne',
    genre: 'Bus à haut niveau de service',
    description: '',
    mode: 'bus',
    // 274 M€ HT (juin 2023), dont 37 M€ de bus.
    cout: 274,
    voyageurs: 33000,
    duree: 4,
    trace: 'idf-bus-bords-de-marne',
  },
  {
    id: 'idf-bus-eve',
    nom: 'Bus EVE, d’Esbly au Val d’Europe',
    genre: 'Bus à haut niveau de service',
    description: '',
    mode: 'bus',
    // 124 M€ HT (janvier 2020) et 6,7 M€ de bus.
    cout: 131,
    voyageurs: 11600,
    duree: 6,
    trace: 'idf-bus-eve',
  },
]

export const idf: Catalogue = {
  projets,
  tutoriel: {
    projet: 'idf-t8-sud',
    consigne: 'Touchez le tram T8 prolongé jusqu’à Paris, en noir sur la carte.',
    detail:
      'Chaque pointillé est un projet réel, avec son prix écrit dessus. Le T8 relierait Saint-Denis à la gare Rosa Parks, à Paris, pour 272 M€.',
  },
}
