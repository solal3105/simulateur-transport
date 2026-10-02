import { PROJETS } from './catalogue'
import { resoudre } from './regles'
import type { Chantier, Mode, ModeLigne } from './types'

/**
 * Une couleur par mode de transport, pour les projets et les lignes du joueur. Le réseau actuel garde les couleurs
 * de ses propres lignes, en traits plus fins, pour que les projets se lisent d'abord.
 */
export const COULEUR_MODE: Record<Exclude<Mode, 'renovation'>, string> = {
  metro: '#e3051b',
  tram: '#7c3aed',
  bus: '#0d9488',
  cable: '#d97706',
  fluvial: '#2563eb',
}

/** Une modernisation prend la couleur de la ligne de métro qu'elle modernise. */
const COULEUR_MODERNISATION: Record<string, string> = {
  'modern-a': '#d8336f',
  'modern-c': '#f29a1f',
  'modern-d': '#2e9e4f',
}

/**
 * Les familles de lignes que le filtre de la carte peut cacher : une modernisation compte avec le métro, et le RER avec
 * les trains.
 */
export type ModeCarte = Exclude<Mode, 'renovation'> | 'train'

export const modeCarte = (mode: Mode | ModeLigne | 'rer' | 'train'): ModeCarte =>
  mode === 'renovation' ? 'metro' : mode === 'rer' ? 'train' : mode

export const LEGENDE_MODES: { nom: string; couleur: string; mode: ModeCarte }[] = [
  { nom: 'Métro', couleur: COULEUR_MODE.metro, mode: 'metro' },
  { nom: 'Tramway', couleur: COULEUR_MODE.tram, mode: 'tram' },
  { nom: 'Bus rapide', couleur: COULEUR_MODE.bus, mode: 'bus' },
  { nom: 'Téléphérique', couleur: COULEUR_MODE.cable, mode: 'cable' },
  { nom: 'Bateau', couleur: COULEUR_MODE.fluvial, mode: 'fluvial' },
]

export function couleurProjet(id: string, choix?: Pick<Chantier, 'varianteId' | 'option'>): string {
  if (COULEUR_MODERNISATION[id]) return COULEUR_MODERNISATION[id]!
  const projet = PROJETS.get(id)
  if (!projet) return COULEUR_MODE.metro
  const mode = resoudre(projet, choix).mode
  return mode === 'renovation' ? COULEUR_MODE.metro : COULEUR_MODE[mode]
}

/**
 * Les couleurs qu'un joueur peut donner à ses lignes, les mêmes dans tous les réseaux : assez soutenues pour se lire sur
 * le plan comme sur les photographies aériennes, et assez différentes pour distinguer ses lignes entre elles.
 */
export const PALETTE_LIGNES: { nom: string; couleur: string }[] = [
  { nom: 'Rouge', couleur: '#d62828' },
  { nom: 'Orange', couleur: '#ee7a12' },
  { nom: 'Jaune', couleur: '#e0ac00' },
  { nom: 'Olive', couleur: '#8a9a10' },
  { nom: 'Vert', couleur: '#2f9e44' },
  { nom: 'Émeraude', couleur: '#0b8a7a' },
  { nom: 'Turquoise', couleur: '#1497b8' },
  { nom: 'Bleu', couleur: '#2d6ad6' },
  { nom: 'Marine', couleur: '#233a8c' },
  { nom: 'Violet', couleur: '#7a3fc0' },
  { nom: 'Magenta', couleur: '#c2338a' },
  { nom: 'Rose', couleur: '#ea6f9f' },
  { nom: 'Brun', couleur: '#8a5a2b' },
  { nom: 'Ardoise', couleur: '#56606b' },
]

/** La couleur d'une ligne du joueur : celle qu'il a choisie, sinon celle de son mode. */
export const couleurLigne = (mode: ModeLigne, couleur?: string) => couleur ?? COULEUR_MODE[mode]

/** La couleur d'une ouverture de la frise, projet du catalogue ou ligne du joueur. */
export const couleurOuverture = (o: { id: string; joueur: boolean; varianteId?: string; modeLigne?: ModeLigne; couleur?: string }) =>
  o.joueur && o.modeLigne ? couleurLigne(o.modeLigne, o.couleur) : couleurProjet(o.id, { varianteId: o.varianteId })
