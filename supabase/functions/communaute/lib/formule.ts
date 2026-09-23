// Copie de lib/formule.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
/**
 * La formule de fréquentation retenue par le moteur (scripts/modele/moteur.py, docs/modele.md). Ce
 * fichier est écrit par le moteur : pour le changer, on relance le moteur, on ne le modifie pas à la main.
 *
 * Calée sur 107 lignes de 22 villes. Sur une ligne absente du calage, l'écart moyen vaut
 * 28 % quand on connaît les autres lignes de la ville, et 33 % pour une ville sans aucun chiffre.
 *
 *   voyageurs par jour = exp(constante de la ville + mode + somme des coefficients × variables)
 *
 * bassin : log(1 + habitants + 0.75 × emplois) à moins de rayonMetro d'une station de métro
 * ou de rayonAutres d'un arrêt des autres modes ; distanceCentre : log(1 + distance en km de l'arrêt le
 * plus proche du centre) ; concurrence : part des habitants et emplois (0,3 par emploi) à moins de 400 m
 * des arrêts qui sont déjà à moins de 400 m d'une station existante ; stations : log du nombre d'arrêts ;
 * longueur : log de la longueur en km ; partCentre : part des arrêts à moins de 1,5 km du centre ;
 * bassinLarge : log(1 + habitants + emplois pondérés) à moins de 2 km.
 *
 * La constante de chaque ville réunit la constante commune, les variables de ville (bassin de vie à
 * 10 et 20 km du centre, emplois, taille du réseau) et le niveau propre à la ville tiré de ses lignes.
 * Le téléphérique n'a aucune ligne dans le calage : son écart au tram est estimé sur Téléo et sur le
 * téléphérique de Brest, prédits comme des trams.
 */
import type { ModeLigne } from './types.ts'
import type { IdVille } from './villes.ts'

export type VariableLigne = 'bassin' | 'stations' | 'longueur' | 'distanceCentre' | 'partCentre' | 'concurrence' | 'bassinLarge'

export interface Formule {
  rayonMetro: number
  rayonAutres: number
  poidsEmplois: number
  poidsCouronne: number
  coefficients: Partial<Record<VariableLigne, number>>
  modes: Record<ModeLigne, number>
  constantes: Record<IdVille, number>
  /** Le réel se situe entre bas et haut fois l'estimation pour huit lignes sur dix du calage. */
  fourchette: { bas: number; haut: number }
  /** Les variables de ville réunies dans la constante de chaque ville. */
  variablesDeVille: ('bassinVie' | 'bassinVieProche' | 'bassinEmploi' | 'emploisCentre' | 'reseau')[]
  /** Ce qu'on dit de la formule à l'écran : combien de formules essayées, sur combien de lignes et de villes. */
  formules: number
  lignes: number
  villes: number
  /** Écart moyen, en pourcentage du réel, sur une ligne absente du calage, selon qu'on connaît sa ville ou non. */
  ecartVilleConnue: number
  ecartVilleInconnue: number
  /** Les lignes de chaque ville, du calage, avec l'écart de l'estimation quand on les prédit sans elles. */
  calage: Record<IdVille, { ligne: string; reel: number; ecart: number }[]>
}

export const FORMULE: Formule = {
  rayonMetro: 1000,
  rayonAutres: 400,
  poidsEmplois: 0.75,
  poidsCouronne: 0.3,
  coefficients: {
    bassin: 0.9351,
    distanceCentre: -0.2188,
    concurrence: -0.7776,
  },
  modes: { tram: 0, metro: 0.3427, bus: -0.74, cable: -0.3675 },
  constantes: { lyon: 0.5376, toulouse: 0.2225, marseille: 0.3733, nice: 0.324, paris: 0.8659 },
  fourchette: { bas: 0.62, haut: 1.39 },
  variablesDeVille: ['reseau'],
  formules: 23980,
  lignes: 107,
  villes: 22,
  ecartVilleConnue: 29,
  ecartVilleInconnue: 36,
  calage: {
    lyon: [
      { ligne: 'Métro D', reel: 307400, ecart: -22 },
      { ligne: 'Métro A', reel: 271300, ecart: 5 },
      { ligne: 'Métro B', reel: 173200, ecart: 19 },
      { ligne: 'Tram T4', reel: 107900, ecart: -17 },
      { ligne: 'Tram T1', reel: 103900, ecart: -17 },
      { ligne: 'Tram T2', reel: 98300, ecart: -21 },
      { ligne: 'Tram T3', reel: 52200, ecart: 7 },
      { ligne: 'Tram T5', reel: 8500, ecart: 138 },
    ],
    toulouse: [
      { ligne: 'Métro A', reel: 228300, ecart: -26 },
      { ligne: 'Métro B', reel: 218100, ecart: -18 },
      { ligne: 'Tram T1', reel: 48700, ecart: -1 },
      { ligne: 'Bus L1', reel: 21500, ecart: -24 },
      { ligne: 'Bus L9', reel: 16800, ecart: 26 },
      { ligne: 'Bus L14', reel: 11700, ecart: 44 },
      { ligne: 'Bus L2', reel: 11500, ecart: -18 },
      { ligne: 'Bus L8', reel: 8900, ecart: 49 },
      { ligne: 'Bus L3', reel: 8800, ecart: -26 },
      { ligne: 'Bus L4', reel: 7300, ecart: 95 },
      { ligne: 'Bus L10', reel: 7300, ecart: -28 },
      { ligne: 'Bus L6', reel: 7100, ecart: -54 },
      { ligne: 'Bus L5', reel: 6000, ecart: -6 },
      { ligne: 'Bus L11', reel: 5300, ecart: 15 },
    ],
    marseille: [
      { ligne: 'Métro M2', reel: 170500, ecart: -8 },
      { ligne: 'Métro M1', reel: 162600, ecart: 55 },
      { ligne: 'Tram T2', reel: 67000, ecart: -25 },
      { ligne: 'Tram T1', reel: 32200, ecart: 70 },
      { ligne: 'Bus B1', reel: 22700, ecart: -10 },
      { ligne: 'Bus B2', reel: 17900, ecart: -14 },
      { ligne: 'Bus B3', reel: 14000, ecart: -35 },
    ],
    nice: [
      { ligne: 'Tram L1', reel: 120000, ecart: -26 },
    ],
    paris: [
      { ligne: 'Métro 1', reel: 636800, ecart: -25 },
      { ligne: 'Métro 4', reel: 631900, ecart: -49 },
      { ligne: 'Métro 14', reel: 574400, ecart: -28 },
      { ligne: 'Métro 9', reel: 485900, ecart: 6 },
      { ligne: 'Métro 7', reel: 448800, ecart: 22 },
      { ligne: 'Métro 13', reel: 443900, ecart: -4 },
      { ligne: 'Métro 8', reel: 398300, ecart: 20 },
      { ligne: 'Métro 5', reel: 397100, ecart: -25 },
      { ligne: 'Métro 6', reel: 379200, ecart: -15 },
      { ligne: 'Métro 2', reel: 348200, ecart: -6 },
      { ligne: 'Métro 12', reel: 317100, ecart: 24 },
      { ligne: 'Tram T3b', reel: 305400, ecart: -15 },
      { ligne: 'Métro 3', reel: 303500, ecart: 19 },
      { ligne: 'Tram T3a', reel: 250200, ecart: -28 },
      { ligne: 'Tram T2', reel: 242200, ecart: -4 },
      { ligne: 'Métro 11', reel: 197600, ecart: 53 },
      { ligne: 'Tram T1', reel: 177400, ecart: -22 },
      { ligne: 'Métro 10', reel: 165000, ecart: 82 },
      { ligne: 'Tram T9', reel: 82000, ecart: 75 },
      { ligne: 'Tram T6', reel: 80900, ecart: 36 },
      { ligne: 'Tram T5', reel: 78200, ecart: -16 },
      { ligne: 'Tram T4', reel: 74000, ecart: 14 },
      { ligne: 'Tram T8', reel: 61000, ecart: -7 },
      { ligne: 'Tram T11', reel: 43400, ecart: -16 },
      { ligne: 'Tram T7', reel: 37800, ecart: 12 },
      { ligne: 'Tram T10', reel: 30000, ecart: 45 },
    ],
  },
}
