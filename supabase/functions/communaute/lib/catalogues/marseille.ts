// Copie de lib/catalogues/marseille.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { Catalogue, Projet } from '../types.ts'

/**
 * Les projets sur la table dans la métropole Aix-Marseille-Provence, rassemblés le 25 septembre 2026 dans les
 * délibérations de la Métropole, ses dossiers de projet et la presse locale. Chaque projet cite ses sources ;
 * quand un chiffre manque, nous l’estimons comme pour les lignes du joueur (scripts/estimer-projets.ts) et le
 * disons dans ses précisions.
 */
const projets: Projet[] = [
  {
    id: 'amp-t3-nord-bricarde',
    nom: 'Tramway T3 jusqu’à La Bricarde',
    genre: 'Prolongement de tramway',
    description: '',
    mode: 'tram',
    cout: 453,
    voyageurs: 45000,
    duree: 4,
    trace: 'amp-t3-nord-bricarde',
    prolonge: 'tram-T3',
  },
  {
    id: 'amp-t2-quatre-septembre',
    nom: 'Tramway du 4-Septembre',
    genre: 'Nouvelle branche de tramway',
    description: '',
    mode: 'tram',
    cout: 76,
    voyageurs: 22700,
    duree: 3,
    trace: 'amp-t2-quatre-septembre',
  },
  {
    id: 'amp-tram-belle-de-mai',
    nom: 'Tramway de la Belle de Mai',
    genre: 'Nouvelle ligne de tramway',
    description: '',
    mode: 'tram',
    cout: 176,
    voyageurs: 40000,
    duree: 3,
    trace: 'amp-tram-belle-de-mai',
  },
  {
    id: 'amp-m2-saint-loup',
    nom: 'Métro 2 jusqu’à Saint-Loup',
    genre: 'Prolongement de métro',
    description: '',
    mode: 'metro',
    cout: 800,
    voyageurs: 63600,
    duree: 8,
    trace: 'amp-m2-saint-loup',
    prolonge: 'metro-M2',
    estime: { voyageurs: true, duree: true },
  },
  {
    id: 'amp-cable-aeroport',
    nom: 'Téléphérique de l’aéroport Marseille Provence',
    genre: 'Transport par câble',
    description: '',
    mode: 'cable',
    cout: 43,
    voyageurs: 3600,
    duree: 3,
    trace: 'amp-cable-aeroport',
  },
  {
    id: 'amp-aixpress-val-saint-andre',
    nom: 'Aixpress jusqu’au Val Saint-André',
    genre: 'Prolongement de bus à haut niveau de service',
    description: '',
    mode: 'bus',
    cout: 25,
    voyageurs: 5100,
    duree: 2,
    trace: 'amp-aixpress-val-saint-andre',
  },
  {
    id: 'amp-bhns-aix-duranne',
    nom: 'Bus rapide d’Aix jusqu’à la Duranne',
    genre: 'Bus à haut niveau de service',
    description: '',
    mode: 'bus',
    cout: 139,
    voyageurs: 11500,
    duree: 5,
    trace: 'amp-bhns-aix-duranne',
    estime: { voyageurs: true },
  },
  {
    id: 'amp-bhns-martigues-port-de-bouc',
    nom: 'Bus rapide Martigues, Port-de-Bouc',
    genre: 'Bus à haut niveau de service',
    description: '',
    mode: 'bus',
    cout: 17,
    voyageurs: 7700,
    duree: 2,
    trace: 'amp-bhns-martigues-port-de-bouc',
  },
  {
    id: 'amp-bhns-istres',
    nom: 'Bus rapide d’Istres',
    genre: 'Bus à haut niveau de service',
    description: '',
    mode: 'bus',
    cout: 16,
    voyageurs: 6400,
    duree: 4,
    trace: 'amp-bhns-istres',
    estime: { voyageurs: true },
  },
]

export const marseille: Catalogue = {
  projets,
  tutoriel: {
    projet: 'amp-t2-quatre-septembre',
    consigne: 'Touchez le tramway du 4-Septembre, en noir sur la carte.',
    detail:
      'Chaque pointillé est un projet réel, avec son prix écrit dessus. Cette branche du tram relierait la rue de Rome à la place du 4-Septembre pour 76 M€.',
  },
}
