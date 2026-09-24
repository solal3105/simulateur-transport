/**
 * Compare notre calcul du coût d'une ligne au coût réel de chantiers français récents, en euros 2025
 * (docs/couts.md). Le calcul ne connaît ici que la longueur, le nombre de stations et le réseau : les
 * tunnels, les viaducs et les ponts des chantiers réels ne sont pas comptés, ce qui explique une partie
 * des écarts signalés.
 *
 *   node_modules/.bin/jiti scripts/verifier-couts.ts
 */
import { COEFFICIENT_RESEAU, PRIX } from '../lib/couts'
import type { ModeLigne } from '../lib/types'
import type { IdVille } from '../lib/villes'

type Chantier = [nom: string, mode: ModeLigne, reseau: IdVille | null, km: number, stations: number, reel: number, note?: string]

// Coûts en M€ 2025, index TP01 (docs/couts.md, qui cite la source de chacun).
const CHANTIERS: Chantier[] = [
  ['Lyon T6 nord', 'tram', 'lyon', 5.4, 10, 222],
  ['Lyon T9', 'tram', 'lyon', 8.8, 19, 346],
  ['Lyon T10', 'tram', 'lyon', 7.6, 14, 352],
  ['Lyon TEOL', 'tram', 'lyon', 6, 5, 812, 'tunnel de 2,9 km'],
  ['Nice T5', 'tram', 'nice', 7.5, 15, 382],
  ['Nice L2', 'tram', 'nice', 11.3, 20, 878, 'tunnel de 3,2 km'],
  ['Île-de-France T9', 'tram', 'idf', 10, 19, 583],
  ['Île-de-France T10', 'tram', 'idf', 8.2, 13, 443],
  ['Île-de-France T1 à Rueil', 'tram', 'idf', 7.5, 15, 537],
  ['Île-de-France T3b', 'tram', 'idf', 3.2, 7, 249],
  ['Besançon', 'tram', null, 14.5, 31, 314],
  ['Tours A', 'tram', null, 14.8, 29, 531],
  ['Tours ligne 2', 'tram', null, 12.5, 22, 502],
  ['Grenoble E', 'tram', null, 11.2, 18, 308],
  ['Reims', 'tram', null, 11.2, 23, 607],
  ['Angers B et C', 'tram', null, 10, 19, 351],
  ['Montpellier L5', 'tram', null, 15.7, 25, 482],
  ['Dijon', 'tram', null, 18.9, 35, 550],
  ['Lyon TB12', 'bus', 'lyon', 8, 19, 171],
  ['Nantes Busway', 'bus', null, 7, 15, 115],
  ['Nîmes T2', 'bus', null, 11.5, 26, 150],
  ['Lyon B à Saint-Genis-Laval', 'metro', 'lyon', 2.4, 2, 420, 'coût sans année de valeur'],
  ['Toulouse ligne C', 'metro', 'toulouse', 27, 21, 3380, '8,5 km aériens ou au sol'],
  ['Rennes b', 'metro', null, 14, 15, 1576, '5 km en viaduc ou en surface'],
  ['Île-de-France M11 à Rosny', 'metro', 'idf', 6, 6, 1331],
  ['Île-de-France M4 à Bagneux', 'metro', 'idf', 1.8, 2, 479],
  ['Île-de-France M14 nord', 'metro', 'idf', 5.8, 4, 1691],
  ['Île-de-France M14 sud', 'metro', 'idf', 14, 7, 2744],
  ['Grand Paris L15 Sud', 'metro', 'idf', 33, 16, 9751, 'grand gabarit, gares profondes'],
  ['Grand Paris L16', 'metro', 'idf', 28, 10, 6787, 'grand gabarit'],
  ['Brest', 'cable', null, 0.42, 2, 24],
  ['Ajaccio', 'cable', null, 3, 4, 41],
  ['La Réunion, Papang', 'cable', null, 2.7, 5, 52],
  ['Toulouse Téléo', 'cable', 'toulouse', 3, 3, 104, 'tricâble'],
]

const ecarts: number[] = []
for (const [nom, mode, reseau, km, stations, reel, note] of CHANTIERS) {
  const k = reseau ? COEFFICIENT_RESEAU[reseau] : 1
  const calcul = (km * PRIX[mode].km + stations * PRIX[mode].station) * k
  const ecart = Math.round(((calcul - reel) / reel) * 100)
  if (!note) ecarts.push(Math.abs(ecart))
  console.log(`${nom.padEnd(30)} réel ${String(reel).padStart(5)}  calcul ${String(Math.round(calcul)).padStart(5)}  ${ecart > 0 ? '+' : ''}${ecart} %${note ? `  (${note})` : ''}`)
}
ecarts.sort((a, b) => a - b)
console.log(`\nÉcart médian sur les ${ecarts.length} chantiers sans ouvrage particulier : ${ecarts[Math.floor(ecarts.length / 2)]} %`)
