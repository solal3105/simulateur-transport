import { imageVille } from '@/lib/apercuVille'
import { VILLES } from '@/lib/villes'
import fond from '@/public/data/nice/fond.json'

/** L'image qui accompagne un lien vers l'accueil de Nice : la carte du réseau actuel et ce qu'on y fait. */

export const alt = 'La carte du tram de Nice et la mer, avec le titre du jeu'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return imageVille(VILLES.nice, fond)
}
