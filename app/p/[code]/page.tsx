import type { Metadata } from 'next'

import { lireCode } from '@/lib/partieServeur'
import { villeDePartie } from '@/lib/partie'
import { MARQUE, VILLES } from '@/lib/villes'

import { Ouverture } from './Ouverture'

type Props = { params: Promise<{ code: string }> }

/**
 * L'adresse d'une partie partagée depuis le bilan. Elle existe pour que les réseaux sociaux trouvent un
 * titre et une image propres à ce réseau ; le visiteur, lui, est aussitôt envoyé dans le jeu.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const partie = lireCode(code)
  const ville = VILLES[(partie && villeDePartie(partie)) || 'lyon']
  if (!partie) return { title: VILLES.lyon.titrePage, robots: { index: false } }
  const lignes = partie.l.length
  const projets = partie.c.length
  const contenu = [
    projets ? `${projets} projet${projets > 1 ? 's' : ''}` : '',
    lignes ? `${lignes} ligne${lignes > 1 ? 's' : ''} tracée${lignes > 1 ? 's' : ''}` : '',
  ]
    .filter(Boolean)
    .join(' et ')
  const titre = `Mon réseau ${ville.reseau} de 2038`
  const description = `${contenu ? `${contenu[0]!.toUpperCase()}${contenu.slice(1)}. ` : ''}Ouvrez-le pour voir ses voyageurs, son coût, et le reprendre pour votre partie.`
  return {
    title: `${titre} | ${MARQUE}`,
    description,
    robots: { index: false },
    openGraph: { title: titre, description, locale: 'fr_FR' },
    twitter: { card: 'summary_large_image', title: titre, description },
  }
}

export default async function Page({ params }: Props) {
  const { code } = await params
  return <Ouverture code={code} />
}
