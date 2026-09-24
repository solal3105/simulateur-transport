/**
 * Le coût de construction d'une ligne tracée par le joueur, en millions d'euros 2025 : la voie au
 * kilomètre, chaque station, et les ouvrages qu'impose le terrain (lib/terrain.ts), c'est-à-dire un tunnel
 * ou une tranchée couverte là où la pente dépasse ce que le mode sait gravir, un pont sur un grand cours
 * d'eau, une station de métro plus profonde sous une colline. Le tout est multiplié par un coefficient
 * propre à chaque réseau : à longueur égale, on construit 1,85 fois plus cher en Île-de-France que dans une
 * ville moyenne.
 *
 * Les prix sont calés sur 53 chantiers français, convertis en euros 2025 avec l'index TP01 de l'INSEE ;
 * la méthode, les chantiers, leurs sources et l'écart entre leur coût réel et notre calcul sont dans
 * docs/couts.md, et scripts/verifier-couts.ts refait la comparaison.
 */
import { franchissements, relief, type Terrain } from './terrain'
import type { DetailCout, ModeLigne } from './types'
import type { IdVille } from './villes'

export interface PrixMode {
  /** La voie, par km de tracé, matériel roulant et dépôt compris. */
  km: number
  /** Une station ou une gare. */
  station: number
  /** Surcoût d'un km de tunnel ou de tranchée couverte imposé par la pente. */
  ouvrageKm: number
  /** Un pont sur un grand cours d'eau. */
  pont: number
  /** Par mètre de profondeur au-delà de la profondeur ordinaire d'une station de métro. */
  metreProfondeur: number
}

/** Les prix d'une ville moyenne française, en M€ 2025 (docs/couts.md). */
export const PRIX: Record<ModeLigne, PrixMode> = {
  // Tours, Angers, Montpellier, Grenoble, Dijon : 30 à 36 M€ par km tout compris ; une station de tram coûte
  // de 0,5 à 1,1 M€. Le tunnel de TEOL et celui de la ligne 2 de Nice donnent 70 à 150 M€ de plus par km.
  tram: { km: 33, station: 1, ouvrageKm: 100, pont: 20, metreProfondeur: 0 },
  // Nantes, Nîmes, Metz : 13 à 17 M€ par km. Aucun document ne chiffre une station ni un tunnel de bus :
  // ces deux montants sont nos estimations.
  bus: { km: 14, station: 0.4, ouvrageKm: 80, pont: 15, metreProfondeur: 0 },
  // Métro automatique entièrement souterrain : environ 90 M€ par km de tunnel équipé et 50 M€ par station
  // en province (Toulouse C, Rennes b, Lyon B à Saint-Genis-Laval). Au métro B de Lyon, descendre une station
  // de 5 m coûtait 10 M€ de plus.
  metro: { km: 90, station: 50, ouvrageKm: 0, pont: 0, metreProfondeur: 2 },
  // Téléphériques urbains : Brest, Ajaccio, La Réunion, Grenoble, Téléo et le Câble C1.
  cable: { km: 10, station: 9, ouvrageKm: 0, pont: 0, metreProfondeur: 0 },
}

/**
 * Ce que coûte un chantier dans chaque réseau par rapport à une ville moyenne, d'après les trams et les
 * métros récents : Lyon 39 à 46 M€ par km de tram, Nice 51, Aix-Marseille 56, l'Île-de-France 54 à 78
 * contre 35 ailleurs ; ses métros coûtent de 196 à 295 M€ par km contre 113 à 125 à Rennes et Toulouse.
 */
export const COEFFICIENT_RESEAU: Record<IdVille, number> = { lyon: 1.2, toulouse: 1, marseille: 1.4, nice: 1.45, idf: 1.85 }

/** Profondeur ordinaire d'une station de métro, en mètres : au-delà, chaque mètre coûte. */
const PROFONDEUR_ORDINAIRE = 25

export function coutLigne(
  mode: ModeLigne,
  arrets: [number, number][],
  km: number,
  mx: number,
  ville: IdVille,
  terrain?: Terrain,
): DetailCout {
  const p = PRIX[mode]
  const k = COEFFICIENT_RESEAU[ville]
  const r = terrain ? relief(terrain, mode, arrets, mx) : null
  // Le métro passe sous les fleuves et le câble au-dessus : seuls le tram et le bus ont besoin d'un pont.
  const n = terrain && (mode === 'tram' || mode === 'bus') ? franchissements(terrain, arrets) : 0
  const profondes = r ? r.profondeurs.filter((d) => d > PROFONDEUR_ORDINAIRE) : []
  const kmOuvrage = r ? Math.min(r.kmOuvrage, km) : 0
  return {
    voie: km * p.km * k,
    stations: arrets.length * p.station * k,
    ouvrages: kmOuvrage * p.ouvrageKm * k,
    ponts: n * p.pont * k,
    profondeur: profondes.reduce((t, d) => t + (d - PROFONDEUR_ORDINAIRE) * p.metreProfondeur * k, 0),
    kmOuvrage,
    franchissements: n,
    stationsProfondes: profondes.length,
    penteTerrain: r ? r.penteTerrain : 0,
  }
}

export const totalCout = (d: DetailCout) => Math.round(d.voie + d.stations + d.ouvrages + d.ponts + d.profondeur)

/** Le prix d'un km de voie et d'une station dans un réseau, pour les repères affichés dans le traceur. */
export const prixReseau = (mode: ModeLigne, ville: IdVille) => ({
  km: Math.round(PRIX[mode].km * COEFFICIENT_RESEAU[ville]),
  station: Math.round(PRIX[mode].station * COEFFICIENT_RESEAU[ville] * 10) / 10,
})
