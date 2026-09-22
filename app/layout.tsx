import type { Metadata, Viewport } from 'next'
import { Archivo, Martian_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const martian = Martian_Mono({
  subsets: ['latin'],
  variable: '--font-martian',
  display: 'swap',
})

const SITE = 'https://simulateur-transport-tcl.netlify.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Simulateur Transport TCL Lyon',
  description:
    'Répartissez deux enveloppes de 2 000 millions d’euros entre les projets de transport de la Métropole de Lyon, et voyez ce que vos choix construisent vraiment d’ici 2038.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE,
    siteName: 'Simulateur Transport TCL',
    title: 'Simulateur Transport TCL Lyon',
    description:
      'Deux mandats, deux enveloppes, vingt-deux ouvrages réels. Arbitrez le budget des transports lyonnais.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Simulateur Transport TCL Lyon' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulateur Transport TCL Lyon',
    description: 'Deux mandats, deux enveloppes, vingt-deux ouvrages réels.',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#a3d900',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${archivo.variable} ${martian.variable}`}>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VC9WDCWFY1"
          strategy="afterInteractive"
        />
        <Script id="analytics" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-VC9WDCWFY1');`}
        </Script>
      </body>
    </html>
  )
}
