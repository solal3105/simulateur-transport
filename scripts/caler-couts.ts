/**
 * Cherche les prix qui collent le mieux aux chantiers réels : d'abord la voie et les stations sur les
 * chantiers en terrain plat, puis les ouvrages sur les chantiers sous une colline, recalculés avec le relief
 * sur des tracés approchés. Le script affiche les meilleurs réglages ; on les reporte à la main dans
 * lib/couts.ts et lib/terrain.ts.
 *
 *   node_modules/.bin/jiti scripts/caler-couts.ts
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CHANTIERS_REELS } from '../lib/chantiers'
import { COEFFICIENT_RESEAU, PRIX } from '../lib/couts'
import { estimer, preparerCarreaux } from '../lib/modele'
import { fleuvesDe, preparerTerrain, REGLAGES } from '../lib/terrain'
import type { ModeLigne } from '../lib/types'
import { VILLES, type IdVille } from '../lib/villes'

type Plat = [nom: string, mode: ModeLigne, reseau: IdVille | null, km: number, stations: number, reel: number, poids: number]
// Coûts en M€ 2025 (docs/couts.md), la même liste que celle qui sert de comparaison aux lignes du joueur.
const PLATS: Plat[] = CHANTIERS_REELS.map((c) => [c.nom, c.mode, c.reseau, c.km, c.stations, c.cout, c.poids])
const plat = (p: Plat) => (p[3] * PRIX[p[1]].km + p[4] * PRIX[p[1]].station) * (p[2] ? COEFFICIENT_RESEAU[p[2]] : 1)

const racine = join(__dirname, '..')
const lire = (d: string, n: string) => JSON.parse(readFileSync(join(racine, 'public', 'data', d, `${n}.json`), 'utf8'))
const lyon = preparerCarreaux(
  lire('', 'carreaux'),
  lire('', 'arrets'),
  VILLES.lyon,
  preparerTerrain(lire('', 'relief'), fleuvesDe(lire('', 'fond'))),
)
// Chantiers sous une colline, comparés au km : tracés approchés à partir des arrêts connus.
const COLLINES: [string, ModeLigne, number, [number, number][]][] = [
  [
    'TEOL',
    'tram',
    812 / 6,
    [
      [4.7745, 45.7505],
      [4.788, 45.7545],
      [4.7985, 45.759],
      [4.815, 45.758],
      [4.824, 45.752],
      [4.823, 45.744],
    ],
  ],
  [
    'Ligne E',
    'metro',
    2088 / 6.6,
    [
      [4.7745, 45.7505],
      [4.788, 45.7545],
      [4.8, 45.76],
      [4.812, 45.758],
      [4.823, 45.7595],
      [4.832, 45.7578],
    ],
  ],
  [
    'Métro B Saint-Genis',
    'metro',
    420 / 2.4,
    [
      [4.8126, 45.7147],
      [4.8053, 45.7089],
      [4.798, 45.6972],
    ],
  ],
]
const colline = (c: (typeof COLLINES)[number]) => {
  const e = estimer(c[1], c[3], lyon)
  return e.cout / e.km
}
const ecart = (calcul: number, reel: number) => Math.log(calcul / reel)
const moyenne = (v: [number, number][]) => v.reduce((t, [e, w]) => t + Math.abs(e) * w, 0) / v.reduce((t, [, w]) => t + w, 0)

// 1. La voie et les stations, sur les chantiers plats, mode par mode.
const grilles: Record<ModeLigne, [number[], number[]]> = {
  tram: [
    [28, 30, 32, 33, 34, 36, 38],
    [0.5, 1, 1.5],
  ],
  bus: [
    [12, 13, 14, 15, 16, 18],
    [0.3, 0.4, 0.6],
  ],
  metro: [
    [80, 90, 100, 110, 120],
    [40, 50, 60, 70, 80, 100],
  ],
  cable: [[PRIX.cable.km], [PRIX.cable.station]],
}
for (const mode of ['tram', 'bus', 'metro'] as ModeLigne[]) {
  let meilleur = { e: Infinity, km: 0, st: 0, biais: 0 }
  for (const km of grilles[mode][0])
    for (const st of grilles[mode][1]) {
      PRIX[mode].km = km
      PRIX[mode].station = st
      const v = PLATS.filter((p) => p[1] === mode).map((p) => [ecart(plat(p), p[5]), p[6]] as [number, number])
      const e = moyenne(v)
      if (e < meilleur.e) meilleur = { e, km, st, biais: v.reduce((t, [x, w]) => t + x * w, 0) / v.reduce((t, [, w]) => t + w, 0) }
    }
  PRIX[mode].km = meilleur.km
  PRIX[mode].station = meilleur.st
  console.log(
    `${mode} : ${meilleur.km} M€/km, ${meilleur.st} M€ par station, écart moyen ${Math.round(meilleur.e * 100)} %, biais ${Math.round(meilleur.biais * 100)} %`,
  )
}

// 2. Les ouvrages, sur les chantiers sous une colline.
let meilleur = { e: Infinity, reglage: '' }
for (const rampe of [0, 150, 250, 350, 500])
  for (const tunnelTram of [100, 130, 160, 200])
    for (const souterraine of [30, 45, 60])
      for (const tunnelMetro of [150, 200, 250, 300])
        for (const metre of [5, 7, 10]) {
          REGLAGES.rampe = rampe
          PRIX.tram.ouvrageKm = tunnelTram
          PRIX.tram.stationSouterraine = souterraine
          PRIX.metro.ouvrageKm = tunnelMetro
          PRIX.metro.metreProfondeur = metre
          const v = COLLINES.map((c) => [ecart(colline(c), c[2]), 1] as [number, number])
          const e = moyenne(v)
          // À écart égal, on préfère les montants les plus proches des sources (rampe de 250 m, 30 à 60 M€).
          if (e < meilleur.e - 0.005)
            meilleur = {
              e,
              reglage: `rampe ${rampe} m, tunnel de tram +${tunnelTram} M€/km, station souterraine ${souterraine} M€, tunnel de métro profond +${tunnelMetro} M€/km, ${metre} M€ par mètre ; écarts ${COLLINES.map((c) => `${c[0]} ${Math.round(ecart(colline(c), c[2]) * 100)} %`).join(', ')}`,
            }
        }
console.log(`Ouvrages : ${meilleur.reglage}, écart moyen ${Math.round(meilleur.e * 100)} %`)
