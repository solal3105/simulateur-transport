'use client'

import type { Terrain } from '@/lib/terrain'

/**
 * L'ombrage du relief, dessiné à partir de la grille d'altitudes : une image posée sur la carte pendant le
 * tracé d'une ligne, pour voir les collines avant d'y faire passer un tram. La lumière vient du nord-ouest,
 * comme sur les cartes de l'IGN ; les pentes à l'ombre s'assombrissent, celles au soleil s'éclaircissent.
 */
export function imageRelief(t: Terrain): {
  url: string
  coordinates: [[number, number], [number, number], [number, number], [number, number]]
} {
  const [nx, ny] = t.taille
  const latitude = t.origine[1] + (t.pas[1] * ny) / 2
  const dx = t.pas[0] * 111320 * Math.cos((latitude * Math.PI) / 180)
  const dy = t.pas[1] * 111320
  const canvas = document.createElement('canvas')
  canvas.width = nx
  canvas.height = ny
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(nx, ny)
  const z = (i: number, j: number) => t.z[Math.min(ny - 1, Math.max(0, j)) * nx + Math.min(nx - 1, Math.max(0, i))]!
  // Soleil au nord-ouest, à 45° au-dessus de l'horizon ; le relief est exagéré deux fois pour se lire.
  const soleil = [-0.5, 0.5, Math.SQRT1_2]
  const plat = soleil[2]!
  for (let j = 0; j < ny; j += 1) {
    for (let i = 0; i < nx; i += 1) {
      const dzdx = ((z(i + 1, j) - z(i - 1, j)) / (2 * dx)) * 2
      const dzdy = ((z(i, j + 1) - z(i, j - 1)) / (2 * dy)) * 2
      // La lumière reçue est le produit de la normale au sol par la direction du soleil.
      const norme = Math.hypot(dzdx, dzdy, 1)
      const lumiere = (-dzdx * soleil[0]! - dzdy * soleil[1]! + plat) / norme
      const k = ((ny - 1 - j) * nx + i) * 4
      const ecart = lumiere - plat
      const ombre = ecart < 0
      image.data[k] = ombre ? 60 : 255
      image.data[k + 1] = ombre ? 50 : 255
      image.data[k + 2] = ombre ? 40 : 255
      image.data[k + 3] = Math.min(150, Math.round(Math.abs(ecart) * (ombre ? 520 : 380)))
    }
  }
  ctx.putImageData(image, 0, 0)
  const [ouest, sud] = t.origine
  const est = ouest + t.pas[0] * (nx - 1)
  const nord = sud + t.pas[1] * (ny - 1)
  return {
    url: canvas.toDataURL('image/png'),
    coordinates: [
      [ouest, nord],
      [est, nord],
      [est, sud],
      [ouest, sud],
    ],
  }
}
