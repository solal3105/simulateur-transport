import { imageAccueilLyon, imageReseau, TAILLE } from '@/lib/apercus'
import { villeDePartie } from '@/lib/partie'
import { VILLES } from '@/lib/villes'

import { lireApercu } from './apercu'

/**
 * L'image qui accompagne le lien d'un réseau publié : sa carte, son titre, son auteur, les voyageurs qu'il
 * gagne et ce qu'il coûte (lib/apercus.tsx).
 */
export const alt = 'La carte du réseau publié, avec son titre, son auteur et les voyageurs qu’il gagne chaque jour'
export const size = TAILLE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reseau = await lireApercu(id)
  if (!reseau) return imageAccueilLyon()
  const ville = VILLES[villeDePartie(reseau.partie) ?? 'lyon']
  return imageReseau(ville, {
    partie: reseau.partie,
    titre: reseau.titre,
    auteur: `par ${reseau.auteur?.pseudo ?? 'un joueur'}`,
    voyageurs: reseau.voyageurs,
    investi: reseau.investi,
    libre: reseau.partie?.x === 1,
  })
}
