import Image from '@/app/communaute/opengraph-image'
import { TAILLE } from '@/lib/apercus'

/** L'image des réseaux publiés, la même pour chaque réseau (app/communaute/opengraph-image.tsx). */
export const alt = 'Les réseaux de transport publiés par les joueurs du simulateur, les plus soutenus en vitrine'
export const size = TAILLE
export const contentType = 'image/png'
export const revalidate = 600

export default Image
