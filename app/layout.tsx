import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/contexts/ThemeContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Simulateur Transport TCL Lyon",
  description: "Simulateur interactif pour l'arbitrage budgétaire des projets de transport TCL dans la métropole de Lyon. Explorez les programmes des candidats 2026.",
  metadataBase: new URL('https://simulateur-transport-tcl.netlify.app'),
  openGraph: {
    title: "Simulateur Transport TCL Lyon",
    description: "Simulateur interactif pour l'arbitrage budgétaire des projets de transport TCL dans la métropole de Lyon.",
    url: 'https://simulateur-transport-tcl.netlify.app',
    siteName: 'Simulateur Transport TCL',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Simulateur Transport TCL Lyon',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Simulateur Transport TCL Lyon",
    description: "Simulateur interactif pour l'arbitrage budgétaire des projets de transport TCL.",
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VC9WDCWFY1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VC9WDCWFY1');
          `}
        </Script>
        
        {/* Hotjar */}
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6629925,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
