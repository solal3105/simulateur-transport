import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'

import { enveloppe } from '@/lib/budget'
import { nombreProjets } from '@/lib/catalogue'
import { enLettres } from '@/lib/format'
import { VILLES } from '@/lib/villes'

import { Mesure } from '@/components/Mesure'

import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', weight: ['400', '500', '600', '700', '800', '900'] })

// L'accueil lyonnais, à la racine du site, décrit son budget et son catalogue tels que le jeu les calcule.
const LYON = VILLES.lyon.budget
const MONTANT = `${enLettres(enveloppe(LYON, 1) + enveloppe(LYON, 2))} d’euros`
const PROJETS = `${nombreProjets('lyon')} projets réels`

export const metadata: Metadata = {
  metadataBase: new URL('https://tcl-2040.com'),
  title: VILLES.lyon.titrePage,
  description: `Deux mandats, ${MONTANT} et ${PROJETS} de métro, tram et bus. Choisissez ceux qui verront le jour, ou tracez votre propre ligne.`,
  openGraph: {
    title: VILLES.lyon.titrePage,
    description: `Deux mandats, ${MONTANT} et ${PROJETS}. Lesquels construiriez-vous ?`,
    locale: 'fr_FR',
  },
  twitter: { card: 'summary_large_image' },
  // Avec la traduction automatique du navigateur, le premier choix fait planter la page ; voir RootLayout.
  other: { google: 'notranslate' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e30613',
}

/**
 * La page refuse la traduction automatique : Chrome, Edge ou Safari remplacent nos textes par les leurs, et React, qui
 * ne retrouve plus ses textes, fait planter la page au premier choix du joueur (retour n° 80, un joueur hispanophone).
 * Laisser traduire sans planter afficherait des budgets figés à leur première valeur traduite : mieux vaut le français
 * juste.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" translate="no" className={figtree.variable}>
      <body>
        {children}
        <Mesure />
      </body>
    </html>
  )
}
