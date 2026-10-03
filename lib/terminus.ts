// Écrit par scripts/terminus.ts à partir des lignes du réseau actuel et des catalogues : ne pas modifier à la main.
import type { ModeLigne } from './types'
import type { IdVille } from './villes'

/** Les terminus des bus à haut niveau de service et des téléphériques de chaque réseau, [lon, lat]. */
export const TERMINUS: Record<IdVille, { bus: [number, number][]; cable: [number, number][] }> = {
  lyon: {
    bus: [
      [4.82799, 45.76607],
      [4.90905, 45.76485],
      [4.89907, 45.75324],
      [4.85773, 45.7616],
    ],
    cable: [],
  },
  toulouse: {
    bus: [
      [1.51127, 43.57881],
      [1.41106, 43.62654],
      [1.48979, 43.59165],
      [1.3087, 43.61701],
      [1.41859, 43.59354],
      [1.29088, 43.5632],
      [1.41863, 43.59365],
      [1.39203, 43.57002],
      [1.43738, 43.59884],
      [1.38864, 43.52721],
      [1.44196, 43.58008],
      [1.47783, 43.5561],
      [1.50718, 43.50844],
      [1.55273, 43.53298],
      [1.46351, 43.56066],
      [1.48423, 43.57328],
      [1.45508, 43.61046],
      [1.48248, 43.65493],
      [1.51918, 43.56487],
      [1.4021, 43.69264],
      [1.43522, 43.63378],
      [1.31763, 43.51647],
      [1.39202, 43.57032],
      [1.45266, 43.64146],
      [1.46262, 43.57446],
      [1.39202, 43.57057],
      [1.45554, 43.61085],
    ],
    cable: [
      [1.46465, 43.56023],
      [1.42832, 43.55433],
    ],
  },
  marseille: {
    bus: [
      [5.4294, 43.33351],
      [5.43821, 43.35354],
      [5.41912, 43.53678],
      [5.44893, 43.51138],
      [5.44399, 43.23118],
      [5.38422, 43.28515],
      [5.36292, 43.36867],
      [5.3674, 43.32829],
      [5.43917, 43.34479],
      [5.41032, 43.34267],
      [5.36743, 43.328],
      [5.4241, 43.30392],
      [5.41033, 43.2575],
      [5.42417, 43.30409],
      [4.9981, 43.57614],
      [4.9952, 43.59449],
    ],
    cable: [],
  },
  nice: { bus: [], cable: [] },
  idf: {
    bus: [
      [2.50668, 48.7719],
      [2.38889, 48.7572],
      [2.41835, 48.99449],
      [2.51387, 48.97399],
      [2.16104, 48.72957],
      [2.25898, 48.72415],
      [2.19136, 48.70625],
      [2.30514, 48.76291],
      [2.47242, 48.80613],
      [2.47159, 48.61353],
      [2.56867, 48.62845],
      [2.47149, 48.6136],
      [2.37045, 48.65232],
    ],
    cable: [
      [2.46478, 48.73475],
      [2.46476, 48.76887],
    ],
  },
}

/**
 * Les projets du catalogue qui prolongent une ligne existante : la ligne, son mode, le terminus d'où ils partent, et
 * la dernière station de chaque branche, d'où l'on peut les continuer.
 */
export const BOUTS_PROJETS: Record<
  string,
  { ligne: string; mode: ModeLigne; depuis: [number, number]; bouts: { nom: string; pos: [number, number] }[] }
> = {
  'amp-t3-nord-bricarde': {
    ligne: 'tram-T3',
    mode: 'tram',
    depuis: [5.3663, 43.327],
    bouts: [{ nom: 'La Bricarde', pos: [5.3462, 43.369] }],
  },
  'amp-t1-la-barasse': {
    ligne: 'tram-T1',
    mode: 'tram',
    depuis: [5.4439, 43.2947],
    bouts: [{ nom: 'Gare de La Barasse', pos: [5.4836, 43.2861] }],
  },
  'amp-m2-saint-loup': {
    ligne: 'metro-M2',
    mode: 'metro',
    depuis: [5.4022, 43.2707],
    bouts: [{ nom: 'Rivoire et Carret', pos: [5.4432, 43.2871] }],
  },
  'idf-metro-1-val-de-fontenay': {
    ligne: 'metro-1',
    mode: 'metro',
    depuis: [2.43891, 48.84458],
    bouts: [{ nom: 'Val de Fontenay', pos: [2.48888, 48.85421] }],
  },
  'idf-t1-val-de-fontenay': {
    ligne: 'tram-T1',
    mode: 'tram',
    depuis: [2.46035, 48.89603],
    bouts: [{ nom: 'Val de Fontenay', pos: [2.49212, 48.85638] }],
  },
  'idf-t1-colombes': {
    ligne: 'tram-T1',
    mode: 'tram',
    depuis: [2.27456, 48.92728],
    bouts: [{ nom: 'Petit Colombes', pos: [2.2265, 48.9134] }],
  },
  'idf-t8-sud': { ligne: 'tram-T8', mode: 'tram', depuis: [2.35751, 48.9298], bouts: [{ nom: 'Rosa Parks', pos: [2.37464, 48.89863] }] },
  'idf-t10-clamart': {
    ligne: 'tram-T10',
    mode: 'tram',
    depuis: [2.25277, 48.79022],
    bouts: [{ nom: 'Gare de Clamart', pos: [2.2724, 48.8134] }],
  },
  'idf-t7-juvisy': {
    ligne: 'tram-T7',
    mode: 'tram',
    depuis: [2.37181, 48.71452],
    bouts: [{ nom: 'Pôle intermodal de Juvisy', pos: [2.3812, 48.6903] }],
  },
}
