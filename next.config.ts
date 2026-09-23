import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  // Permet d'ouvrir le serveur de développement sur 127.0.0.1 en plus de localhost.
  allowedDevOrigins: ['127.0.0.1'],
  // Le badge de développement de Next.js masquait le bouton « Finir le mandat ».
  devIndicators: false,
}

export default config
