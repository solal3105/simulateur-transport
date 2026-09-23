import type { Metadata } from 'next'

import { Jeu } from '@/components/Jeu'
import { VILLES } from '@/lib/villes'

const titre = VILLES.nice.titrePage
const description =
  'Deux mandats et 1,6 milliard d’euros pour la métropole Nice Côte d’Azur. Tracez vos lignes de tram, de bus ou de métro, et voyez combien de voyageurs elles gagnent.'

export const metadata: Metadata = {
  title: titre,
  description,
  openGraph: { title: titre, description, locale: 'fr_FR' },
  twitter: { card: 'summary_large_image', title: titre, description },
}

export default function Page() {
  return <Jeu ville="nice" />
}
