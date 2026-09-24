import { imageMethode, TAILLE } from '@/lib/apercus'
import { VILLES } from '@/lib/villes'

/** L'image qui accompagne un lien vers la page qui explique les calculs de ce réseau (lib/apercus.tsx). */
export const alt = `Comment le simulateur calcule le budget, les coûts et les voyageurs du réseau ${VILLES.nice.nom}`
export const size = TAILLE
export const contentType = 'image/png'

export default function Image() {
  return imageMethode(VILLES.nice)
}
