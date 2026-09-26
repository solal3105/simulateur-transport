import { imageAccueilLyon, imageReseau, TAILLE } from '@/lib/apercus'
import { horizon } from '@/lib/catalogue'
import { mandatsDe } from '@/lib/partie'
import { resumerCode } from '@/lib/partieServeur'

/**
 * L'image qui accompagne le lien d'une partie partagée depuis le bilan : la carte du réseau, les voyageurs
 * qu'il gagne et ce qu'il coûte, recalculés par le modèle (lib/apercus.tsx).
 */
export const alt = 'La carte d’un réseau imaginé dans le simulateur, avec les voyageurs qu’il gagne chaque jour'
export const size = TAILLE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const r = await resumerCode(code)
  if (!r) return imageAccueilLyon()
  return imageReseau(r.ville, { ...r, titre: `Mon réseau ${r.ville.reseau} de ${horizon(mandatsDe(r.partie))}` })
}
