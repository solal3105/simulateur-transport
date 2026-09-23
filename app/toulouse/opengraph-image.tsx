import { imageVille } from '@/lib/apercuVille'
import { VILLES } from '@/lib/villes'
import fond from '@/public/data/toulouse/fond.json'

/** L'image qui accompagne un lien vers l'accueil de Toulouse : la carte du réseau actuel et ce qu'on y fait. */

export const alt = 'La carte du métro et du tram de Toulouse, avec le titre du jeu'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return imageVille(VILLES.toulouse, fond)
}
