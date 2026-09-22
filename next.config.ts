import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  // Permet d'ouvrir le serveur de développement sur 127.0.0.1 en plus de localhost.
  allowedDevOrigins: ['127.0.0.1'],
}

export default config
