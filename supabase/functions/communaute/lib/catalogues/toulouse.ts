// Copie de lib/catalogues/toulouse.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { Catalogue, Projet } from '../types.ts'

/**
 * Les projets de Toulouse. Tisséo n’en a pas décidé d’autres que la ligne C, la connexion de la ligne B et la
 * ligne Aéroport, déjà sur la carte : sa programmation 2026-2038, présentée le 20 mai 2026, ne nomme aucune
 * nouvelle ligne, et les projets encore à l’étude n’ont ni coût ni fréquentation publiés. Restent deux projets
 * étudiés et chiffrés par Tisséo en 2013, puis abandonnés. Recherche du 25 septembre 2026.
 */
const projets: Projet[] = [
  {
    id: 'tls-bhns-ouest',
    nom: 'Bus rapide de l’Ouest',
    genre: 'Bus à haut niveau de service',
    description: '',
    mode: 'bus',
    cout: 180,
    voyageurs: 35000,
    duree: 2,
    trace: 'tls-bhns-ouest',
  },
  {
    id: 'tls-tram-canal',
    nom: 'Tram Canal',
    genre: 'Nouvelle ligne de tramway',
    description: '',
    mode: 'tram',
    cout: 300,
    voyageurs: 34200,
    duree: 2,
    trace: 'tls-tram-canal',
    estime: { voyageurs: true },
  },
]

export const toulouse: Catalogue = {
  projets,
  tutoriel: {
    projet: 'tls-bhns-ouest',
    consigne: 'Touchez le bus rapide de l’Ouest, en noir sur la carte.',
    detail:
      'Chaque pointillé est un projet réel, avec son prix écrit dessus. Ce bus relierait Plaisance-du-Touch à la gare Matabiau pour 180 M€.',
  },
}
