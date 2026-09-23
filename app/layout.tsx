import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'

import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://simulateur-transport-tcl.netlify.app'),
  title: 'Simulateur TCL : construisez le réseau lyonnais de 2038',
  description:
    'Deux mandats, 4 milliards d’euros et 22 projets réels de métro, tram et bus. Choisissez ceux qui verront le jour, ou tracez votre propre ligne.',
  openGraph: {
    title: 'Simulateur TCL : construisez le réseau lyonnais de 2038',
    description: 'Deux mandats, 4 milliards d’euros et 22 projets réels. Lesquels construiriez-vous ?',
    images: ['/og-image.png'],
    locale: 'fr_FR',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e3051b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={figtree.variable}>
      <body>{children}</body>
    </html>
  )
}
