import type { Metadata } from 'next'

import { ReseauPage } from '@/components/communaute/ReseauPage'

import { lireApercu } from './apercu'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const reseau = await lireApercu(id)
  if (!reseau) return { title: 'Réseau introuvable | Simulateur TCL' }
  const titre = `${reseau.titre}, par ${reseau.auteur?.pseudo ?? 'un joueur'}`
  const voyageurs = reseau.voyageurs.toLocaleString('fr-FR')
  const description = reseau.intention ?? `Un réseau de transport pour Lyon en 2038, qui gagne ${voyageurs} voyageurs par jour.`
  return {
    title: `${titre} | Simulateur TCL`,
    description,
    openGraph: { title: titre, description },
    twitter: { card: 'summary_large_image', title: titre, description },
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <ReseauPage id={id} />
}
