// Copie de lib/catalogues/nice.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { Catalogue, Projet } from '../types.ts'

/**
 * Les projets sur la table dans la métropole Nice Côte d’Azur, rassemblés le 25 septembre 2026 dans les arrêtés de
 * la préfecture, les délibérations de la Métropole et la presse locale. Chaque projet cite ses sources.
 */
const projets: Projet[] = [
  {
    id: 'nca-tram-ligne-5',
    nom: 'Ligne 5 du tramway',
    genre: 'Nouvelle ligne de tramway',
    description: '',
    mode: 'tram',
    cout: 376,
    voyageurs: 45900,
    duree: 5,
    feminin: true,
    trace: 'nca-tram-ligne-5',
  },
  {
    id: 'nca-tram-ligne-4',
    nom: 'Ligne 4 du tramway',
    genre: 'Nouvelle ligne de tramway',
    description: '',
    mode: 'tram',
    cout: 328,
    voyageurs: 40000,
    duree: 6,
    feminin: true,
    trace: 'nca-tram-ligne-4',
  },
  {
    id: 'nca-telepherique-nice-saint-laurent',
    nom: 'Téléphérique de Saint-Laurent-du-Var',
    genre: 'Téléphérique urbain',
    description: '',
    mode: 'cable',
    cout: 40,
    voyageurs: 3400,
    duree: 3,
    trace: 'nca-telepherique-nice-saint-laurent',
  },
]

export const nice: Catalogue = {
  projets,
  tutoriel: {
    projet: 'nca-tram-ligne-5',
    consigne: 'Touchez la ligne 5 du tramway, en noir sur la carte.',
    detail:
      'Chaque pointillé est un projet réel, avec son prix écrit dessus. La ligne 5 relierait le Palais des Expositions à Drap, le long du Paillon, pour 376 M€.',
  },
}
