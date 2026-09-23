/**
 * La formule de fréquentation retenue par le moteur (scripts/modele/moteur.py, docs/modele.md). Ce
 * fichier est écrit par le moteur : pour le changer, on relance le moteur, on ne le modifie pas à la main.
 *
 * Calée sur 135 lignes de 29 villes. Sur une ligne absente du calage, l'écart moyen vaut
 * 30 % quand on connaît les autres lignes de la ville, et 35 % pour une ville sans aucun chiffre.
 *
 *   voyageurs par jour = exp(constante de la ville + mode + somme des coefficients × variables)
 *
 * bassin : log(1 + habitants + 1.0 × emplois) à moins de rayonMetro d'une station de métro
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
import type { ModeLigne } from './types'
import type { IdVille } from './villes'

export type VariableLigne = 'bassin' | 'stations' | 'longueur' | 'distanceCentre' | 'partCentre' | 'concurrence' | 'bassinLarge'

export interface Formule {
  rayonMetro: number
  rayonAutres: number
  poidsEmplois: number
  poidsCouronne: number
  coefficients: Partial<Record<VariableLigne, number>>
  modes: Record<ModeLigne, number>
  /** Constante de chaque ville, recalée sur les carreaux du jeu (scripts/modele/recaler-jeu.ts). */
  constantes: Record<IdVille, number>
  /** Constante de chaque ville telle que le moteur la calcule sur sa grille nationale. */
  constantesMoteur: Record<IdVille, number>
  /** Ce qu'ajoute le recalage sur les carreaux du jeu, par ville. */
  recalage: Record<IdVille, number>
  /** Écarts propres à une ville et à un mode : le métro parisien compte ses entrées, sans les correspondances. */
  ajustements: Partial<Record<IdVille, Partial<Record<ModeLigne, number>>>>
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
  poidsEmplois: 1.0,
  poidsCouronne: 0.0,
  coefficients: {
    bassin: 1.075,
    concurrence: -0.5027,
  },
  modes: { tram: 0, metro: -0.062, bus: -0.8231, cable: -0.132 },
  constantes: { lyon: -1.4072, toulouse: -1.2728, marseille: -1.3255, nice: -1.298, paris: -1.218 },
  constantesMoteur: { lyon: -1.3355, toulouse: -1.3313, marseille: -1.3519, nice: -1.3284, paris: -1.1954 },
  recalage: { lyon: -0.0717, toulouse: 0.0585, marseille: 0.0264, nice: 0.0304, paris: -0.0226 },
  ajustements: { paris: { metro: -0.6965 } },
  fourchette: { bas: 0.64, haut: 1.59 },
  variablesDeVille: [],
  formules: 23980,
  lignes: 135,
  villes: 29,
  ecartVilleConnue: 32,
  ecartVilleInconnue: 39,
  calage: {
    lyon: [
      { ligne: 'Métro D', reel: 307400, ecart: -28 },
      { ligne: 'Métro A', reel: 271300, ecart: -18 },
      { ligne: 'Métro B', reel: 173200, ecart: 20 },
      { ligne: 'Tram T4', reel: 107900, ecart: -15 },
      { ligne: 'Tram T1', reel: 103900, ecart: -11 },
      { ligne: 'Tram T2', reel: 98300, ecart: -23 },
      { ligne: 'Tram T3', reel: 52200, ecart: -30 },
      { ligne: 'Tram T5', reel: 8500, ecart: 92 },
    ],
    toulouse: [
      { ligne: 'Métro A', reel: 228300, ecart: -25 },
      { ligne: 'Métro B', reel: 218100, ecart: -14 },
      { ligne: 'Tram T1', reel: 48700, ecart: 7 },
      { ligne: 'Bus L1', reel: 21500, ecart: -29 },
      { ligne: 'Bus L9', reel: 16800, ecart: 13 },
      { ligne: 'Bus L14', reel: 11700, ecart: 53 },
      { ligne: 'Bus L2', reel: 11500, ecart: -6 },
      { ligne: 'Bus L8', reel: 8900, ecart: 40 },
      { ligne: 'Bus L3', reel: 8800, ecart: -34 },
      { ligne: 'Bus L4', reel: 7300, ecart: 85 },
      { ligne: 'Bus L10', reel: 7300, ecart: -36 },
      { ligne: 'Bus L6', reel: 7100, ecart: -55 },
      { ligne: 'Bus L5', reel: 6000, ecart: -10 },
      { ligne: 'Bus L11', reel: 5300, ecart: 21 },
    ],
    marseille: [
      { ligne: 'Métro M2', reel: 170500, ecart: 2 },
      { ligne: 'Métro M1', reel: 162600, ecart: 53 },
      { ligne: 'Tram T2', reel: 67000, ecart: -20 },
      { ligne: 'Tram T1', reel: 32200, ecart: 33 },
      { ligne: 'Bus B1', reel: 22700, ecart: -17 },
      { ligne: 'Bus B2', reel: 17900, ecart: -27 },
      { ligne: 'Bus B3', reel: 14000, ecart: -37 },
    ],
    nice: [
      { ligne: 'Tram L1', reel: 120000, ecart: -29 },
    ],
    paris: [
      { ligne: 'Métro 1', reel: 636800, ecart: -33 },
      { ligne: 'Métro 4', reel: 631900, ecart: -53 },
      { ligne: 'Métro 14', reel: 574400, ecart: -31 },
      { ligne: 'Métro 9', reel: 485900, ecart: 14 },
      { ligne: 'Métro 7', reel: 448800, ecart: 10 },
      { ligne: 'Métro 13', reel: 443900, ecart: 10 },
      { ligne: 'Métro 8', reel: 398300, ecart: 27 },
      { ligne: 'Métro 5', reel: 397100, ecart: -25 },
      { ligne: 'Métro 6', reel: 379200, ecart: -3 },
      { ligne: 'Métro 2', reel: 348200, ecart: 11 },
      { ligne: 'Métro 12', reel: 317100, ecart: 33 },
      { ligne: 'Tram T3b', reel: 305400, ecart: -20 },
      { ligne: 'Métro 3', reel: 303500, ecart: 24 },
      { ligne: 'Tram T3a', reel: 250200, ecart: -40 },
      { ligne: 'Tram T2', reel: 242200, ecart: -19 },
      { ligne: 'Métro 11', reel: 197600, ecart: 17 },
      { ligne: 'Tram T1', reel: 177400, ecart: -20 },
      { ligne: 'Métro 10', reel: 165000, ecart: 67 },
      { ligne: 'Tram T9', reel: 82000, ecart: 28 },
      { ligne: 'Tram T6', reel: 80900, ecart: 23 },
      { ligne: 'Tram T5', reel: 78200, ecart: -27 },
      { ligne: 'Tram T4', reel: 74000, ecart: -14 },
      { ligne: 'Tram T8', reel: 61000, ecart: -24 },
      { ligne: 'Tram T11', reel: 43400, ecart: -65 },
      { ligne: 'Tram T7', reel: 37800, ecart: -12 },
      { ligne: 'Tram T10', reel: 30000, ecart: 5 },
    ],
  },
}
