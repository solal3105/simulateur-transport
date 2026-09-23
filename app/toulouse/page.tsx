import type { Metadata } from 'next'

import { Jeu } from '@/components/Jeu'
import { VILLES } from '@/lib/villes'

const titre = VILLES.toulouse.titrePage
const description =
  'Deux mandats et 3,1 milliards d’euros pour l’agglomération toulousaine. Tracez vos lignes de tram, de bus ou de métro, et voyez combien de voyageurs elles gagnent.'

export const metadata: Metadata = {
  title: titre,
  description,
  openGraph: { title: titre, description, locale: 'fr_FR' },
  twitter: { card: 'summary_large_image', title: titre, description },
}

export default function Page() {
  return <Jeu ville="toulouse" />
}
