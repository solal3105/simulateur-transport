import { imageAccueil, TAILLE } from '@/lib/apercus'
import { VILLES } from '@/lib/villes'

/** L'image qui accompagne un lien vers l'accueil de ce réseau (lib/apercus.tsx). */
export const alt = `La carte du réseau ${VILLES.nice.nom}, avec le titre du jeu et l’argent disponible pour vos lignes`
export const size = TAILLE
export const contentType = 'image/png'

export default function Image() {
  return imageAccueil(VILLES.nice)
}
