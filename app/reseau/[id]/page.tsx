import type { Metadata } from 'next'

import { ReseauPage } from '@/components/communaute/ReseauPage'
import { villeDePartie } from '@/lib/partie'
import { VILLES } from '@/lib/villes'

import { lireApercu } from './apercu'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const reseau = await lireApercu(id)
  if (!reseau) return { title: 'Réseau introuvable | Simulateur TCL' }
  const titre = `${reseau.titre}, par ${reseau.auteur?.pseudo ?? 'un joueur'}`
  const voyageurs = reseau.voyageurs.toLocaleString('fr-FR')
  const ville = VILLES[villeDePartie(reseau.partie) ?? 'lyon']
  const description = reseau.intention ?? `Un réseau de transport pour ${ville.nom} en 2038, qui gagne ${voyageurs} voyageurs par jour.`
  return {
    title: `${titre} | ${ville.marque}`,
    description,
    openGraph: { title: titre, description },
    twitter: { card: 'summary_large_image', title: titre, description },
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <ReseauPage id={id} />
}
