// Copie de lib/couts.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
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
import { ECART_OUVRAGE, franchissements, relief, type Terrain } from './terrain.ts'
import type { DetailCout, ModeLigne } from './types.ts'
import type { IdVille } from './villes.ts'

export interface PrixMode {
  /** La voie, par km de tracé, matériel roulant et dépôt compris. */
  km: number
  /** Une station ou une gare. */
  station: number
  /** Surcoût d'un km de tunnel ou de tranchée couverte imposé par la pente ; pour le métro, d'un km de tunnel à plus de 30 m. */
  ouvrageKm: number
  /** Un pont sur un grand cours d'eau ; pour le métro, le passage dessous. */
  pont: number
  /** Par mètre de profondeur au-delà de la profondeur ordinaire d'une station de métro. */
  metreProfondeur: number
  /** Une station de tram ou de bus creusée sous la colline, en plus d'un quai ordinaire. */
  stationSouterraine: number
}

/**
 * Les prix d'une ville moyenne française, en M€ 2025, calés par scripts/caler-couts.ts : la voie et les
 * stations sur 27 chantiers en terrain plat, les ouvrages sur les chantiers lyonnais sous une colline
 * (docs/couts.md).
 */
export const PRIX: Record<ModeLigne, PrixMode> = {
  // Tram : 32 M€ par km et 1,5 M€ par station (Tours, Angers, Montpellier, Grenoble, Dijon, Lyon, Nice, Paris :
  // écart moyen de 15 %). Sous une colline, 160 M€ de plus par km de tunnel, rampes d'accès comprises, et 40 M€
  // par station souterraine : TEOL, tunnel de 2,9 km sous Fourvière, est retrouvé à 3 % près. Une note déposée
  // au BAPE du Québec donne 30 à 60 M€ par station de tram souterraine.
  tram: { km: 32, station: 1.5, ouvrageKm: 160, pont: 20, metreProfondeur: 0, stationSouterraine: 40 },
  // Bus : 15 M€ par km et 0,6 M€ par station (Nantes, Nîmes, Lyon : écart moyen de 11 %). Aucun document ne
  // chiffre un tunnel ni une station souterraine de bus : ces montants sont nos estimations.
  bus: { km: 15, station: 0.6, ouvrageKm: 100, pont: 15, metreProfondeur: 0, stationSouterraine: 30 },
  // Métro automatique entièrement souterrain : 100 M€ par km et 40 M€ par station (Toulouse C, Rennes b et
  // les métros d'Île-de-France : écart moyen de 14 %). Sous une colline, le tunnel passe à plus de 30 m
  // (250 M€ de plus par km : roche, puits d'accès et de secours plus hauts) et les stations se creusent plus
  // bas (7 M€ par mètre au-delà de 25 m) ; passer sous un grand fleuve coûte 30 M€. Ces montants sont calés
  // sur la ligne E de Lyon, estimée à 316 M€ 2025 par km, retrouvée à 11 % près, et sur le métro B à
  // Saint-Genis-Laval, retrouvé à 3 % près.
  metro: { km: 100, station: 40, ouvrageKm: 250, pont: 30, metreProfondeur: 7, stationSouterraine: 0 },
  // Téléphériques urbains : Brest, Ajaccio, La Réunion, Grenoble, Téléo et le Câble C1.
  cable: { km: 10, station: 9, ouvrageKm: 0, pont: 0, metreProfondeur: 0, stationSouterraine: 0 },
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
  // Le câble passe au-dessus des fleuves ; le tram et le bus ont besoin d'un pont, le métro d'un tunnel plus profond.
  const n = terrain && mode !== 'cable' ? franchissements(terrain, arrets) : 0
  // En métro, les stations plus basses que d'ordinaire ; en tram et en bus, celles qui passent sous le sol.
  const seuil = mode === 'metro' ? PROFONDEUR_ORDINAIRE : ECART_OUVRAGE
  const profondes = r && mode !== 'cable' ? r.profondeurs.filter((d) => d > seuil) : []
  const kmOuvrage = r ? Math.min(r.kmOuvrage, km) : 0
  return {
    voie: km * p.km * k,
    stations: arrets.length * p.station * k,
    ouvrages: kmOuvrage * p.ouvrageKm * k,
    ponts: n * p.pont * k,
    profondeur:
      mode === 'metro'
        ? profondes.reduce((t, d) => t + (d - PROFONDEUR_ORDINAIRE) * p.metreProfondeur * k, 0)
        : profondes.length * p.stationSouterraine * k,
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
