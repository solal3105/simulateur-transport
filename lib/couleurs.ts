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

export const LEGENDE_MODES: { nom: string; couleur: string }[] = [
  { nom: 'Métro', couleur: COULEUR_MODE.metro },
  { nom: 'Tramway', couleur: COULEUR_MODE.tram },
  { nom: 'Bus rapide', couleur: COULEUR_MODE.bus },
  { nom: 'Téléphérique', couleur: COULEUR_MODE.cable },
  { nom: 'Bateau', couleur: COULEUR_MODE.fluvial },
]

export function couleurProjet(id: string, choix?: Pick<Chantier, 'varianteId' | 'option'>): string {
  if (COULEUR_MODERNISATION[id]) return COULEUR_MODERNISATION[id]!
  const projet = PROJETS.get(id)
  if (!projet) return COULEUR_MODE.metro
  const mode = resoudre(projet, choix).mode
  return mode === 'renovation' ? COULEUR_MODE.metro : COULEUR_MODE[mode]
}

export const couleurLigne = (mode: ModeLigne) => COULEUR_MODE[mode]

/** La couleur d'une ouverture de la frise, projet du catalogue ou ligne du joueur. */
export const couleurOuverture = (o: { id: string; joueur: boolean; varianteId?: string; modeLigne?: ModeLigne }) =>
  o.joueur && o.modeLigne ? couleurLigne(o.modeLigne) : couleurProjet(o.id, { varianteId: o.varianteId })
