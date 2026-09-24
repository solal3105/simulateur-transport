import { imageAccueilLyon, TAILLE } from '@/lib/apercus'

/**
 * L'image qui accompagne un lien vers l'accueil lyonnais, et vers toute page qui n'a pas la sienne
 * (lib/apercus.tsx).
 */
export const alt = 'La carte des projets de métro, de tram et de bus de Lyon, avec le titre du jeu'
export const size = TAILLE
export const contentType = 'image/png'

export default function Image() {
  return imageAccueilLyon()
}
