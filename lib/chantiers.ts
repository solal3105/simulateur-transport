import type { ModeLigne } from './types'
import type { IdVille } from './villes'

/**
 * Des chantiers français récents en terrain plat, avec leur longueur, leurs stations et leur coût en millions d'euros
 * 2025 (index TP01 de l'INSEE). Ils calent nos prix (scripts/caler-couts.ts, sources dans docs/couts.md) et servent de
 * point de comparaison pour les lignes que trace le joueur.
 */
export interface ChantierReel {
  /** Le nom dans une phrase : « le T9 de Lyon ». */
  nom: string
  mode: ModeLigne
  /** Le réseau du jeu où il se trouve, s'il y en a un : son coefficient de prix s'applique. */
  reseau: IdVille | null
  km: number
  stations: number
  cout: number
  /** Son poids dans le calage : réduit pour les métros en partie aériens et le grand gabarit parisien. */
  poids: number
}

export const CHANTIERS_REELS: ChantierReel[] = [
  { nom: 'le T6 nord de Lyon', mode: 'tram', reseau: 'lyon', km: 5.4, stations: 10, cout: 222, poids: 1 },
  { nom: 'le T9 de Lyon', mode: 'tram', reseau: 'lyon', km: 8.8, stations: 19, cout: 346, poids: 1 },
  { nom: 'le T10 de Lyon', mode: 'tram', reseau: 'lyon', km: 7.6, stations: 14, cout: 352, poids: 1 },
  { nom: 'le T5 de Nice', mode: 'tram', reseau: 'nice', km: 7.5, stations: 15, cout: 382, poids: 1 },
  { nom: 'le T9 d’Île-de-France', mode: 'tram', reseau: 'idf', km: 10, stations: 19, cout: 583, poids: 1 },
  { nom: 'le T10 d’Île-de-France', mode: 'tram', reseau: 'idf', km: 8.2, stations: 13, cout: 443, poids: 1 },
  { nom: 'le prolongement du T1 vers Rueil-Malmaison', mode: 'tram', reseau: 'idf', km: 7.5, stations: 15, cout: 537, poids: 1 },
  { nom: 'le prolongement du T3b', mode: 'tram', reseau: 'idf', km: 3.2, stations: 7, cout: 249, poids: 1 },
  { nom: 'le tram de Besançon', mode: 'tram', reseau: null, km: 14.5, stations: 31, cout: 314, poids: 1 },
  { nom: 'la ligne A du tram de Tours', mode: 'tram', reseau: null, km: 14.8, stations: 29, cout: 531, poids: 1 },
  { nom: 'la ligne 2 du tram de Tours', mode: 'tram', reseau: null, km: 12.5, stations: 22, cout: 502, poids: 1 },
  { nom: 'la ligne E du tram de Grenoble', mode: 'tram', reseau: null, km: 11.2, stations: 18, cout: 308, poids: 1 },
  { nom: 'le tram de Reims', mode: 'tram', reseau: null, km: 11.2, stations: 23, cout: 607, poids: 1 },
  { nom: 'le tram d’Angers', mode: 'tram', reseau: null, km: 10, stations: 19, cout: 351, poids: 1 },
  { nom: 'la ligne 5 du tram de Montpellier', mode: 'tram', reseau: null, km: 15.7, stations: 25, cout: 482, poids: 1 },
  { nom: 'le tram de Dijon', mode: 'tram', reseau: null, km: 18.9, stations: 35, cout: 550, poids: 1 },
  { nom: 'le TB12 de Lyon', mode: 'bus', reseau: 'lyon', km: 8, stations: 19, cout: 171, poids: 1 },
  { nom: 'le Busway de Nantes', mode: 'bus', reseau: null, km: 7, stations: 15, cout: 115, poids: 1 },
  { nom: 'la ligne T2 de Nîmes', mode: 'bus', reseau: null, km: 11.5, stations: 26, cout: 150, poids: 1 },
  { nom: 'la ligne C du métro de Toulouse', mode: 'metro', reseau: 'toulouse', km: 27, stations: 21, cout: 3380, poids: 0.5 },
  { nom: 'la ligne b du métro de Rennes', mode: 'metro', reseau: null, km: 14, stations: 15, cout: 1576, poids: 0.5 },
  { nom: 'le prolongement de la ligne 11 du métro parisien', mode: 'metro', reseau: 'idf', km: 6, stations: 6, cout: 1331, poids: 1 },
  { nom: 'le prolongement de la ligne 4 du métro parisien', mode: 'metro', reseau: 'idf', km: 1.8, stations: 2, cout: 479, poids: 1 },
  { nom: 'le prolongement nord de la ligne 14', mode: 'metro', reseau: 'idf', km: 5.8, stations: 4, cout: 1691, poids: 1 },
  { nom: 'le prolongement sud de la ligne 14', mode: 'metro', reseau: 'idf', km: 14, stations: 7, cout: 2744, poids: 1 },
  { nom: 'la ligne 15 Sud du Grand Paris Express', mode: 'metro', reseau: 'idf', km: 33, stations: 16, cout: 9751, poids: 0.5 },
  { nom: 'la ligne 16 du Grand Paris Express', mode: 'metro', reseau: 'idf', km: 28, stations: 10, cout: 6787, poids: 0.5 },
]

/**
 * Le chantier réel le plus proche d'une ligne tracée : du même mode, de longueur voisine, et à égalité celui du même
 * réseau. Aucun pour le téléphérique, faute de chantier comparable dans notre liste.
 */
export function chantierComparable(mode: ModeLigne, km: number, reseau: IdVille): ChantierReel | undefined {
  // Un chantier du même réseau parle davantage au joueur : il l'emporte sur un autre un peu plus proche en longueur.
  const ecart = (c: ChantierReel) => Math.abs(Math.log(c.km / Math.max(0.5, km))) - (c.reseau === reseau ? 0.3 : 0)
  return CHANTIERS_REELS.filter((c) => c.mode === mode).sort((a, b) => ecart(a) - ecart(b))[0]
}
