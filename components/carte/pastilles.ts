'use client'

import type { ModeExistant } from '@/lib/reseau'

/** Luminance relative d'une couleur « #rrggbb », selon la définition des règles d'accessibilité du web. */
function luminance(couleur: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(couleur.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

const ENCRE = '#1b1b1f'

/** Le texte qui se lit le mieux sur une couleur : blanc sur le bleu du RER B, foncé sur le jaune du métro 1. */
export function encreSur(couleur: string) {
  const l = luminance(couleur)
  const surBlanc = 1.05 / (l + 0.05)
  const surEncre = (l + 0.05) / (luminance(ENCRE) + 0.05)
  return surBlanc >= surEncre ? '#fff' : ENCRE
}

/**
 * La pastille d'une ligne du réseau actuel, que la carte répète le long de son tracé : son nom court dans sa
 * couleur, cerclé de blanc pour se détacher du trait qu'elle recouvre. Le métro, le RER et le téléphérique ont des
 * angles arrondis, le tram et les trains une forme de gélule, comme sur les plans des réseaux.
 */
export function imagePastille(ref: string, couleur: string, mode: ModeExistant) {
  const ratio = Math.min(3, Math.max(2, Math.ceil(window.devicePixelRatio || 1)))
  const famille = getComputedStyle(document.documentElement).getPropertyValue('--font-figtree').trim() || 'sans-serif'
  const [hauteur, bord, marge, police] = [18, 2, 5, 11]
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  ctx.font = `800 ${police * ratio}px ${famille}`
  const largeur = Math.max(hauteur, Math.ceil(ctx.measureText(ref).width / ratio) + 2 * (marge + bord))
  canvas.width = largeur * ratio
  canvas.height = hauteur * ratio
  const rond = mode === 'tram' || mode === 'train'
  const forme = (retrait: number) => {
    const rayon = rond ? (hauteur - 2 * retrait) / 2 : Math.max(2, 5 - retrait / 2)
    ctx.beginPath()
    ctx.roundRect(retrait * ratio, retrait * ratio, (largeur - 2 * retrait) * ratio, (hauteur - 2 * retrait) * ratio, rayon * ratio)
  }
  forme(0)
  ctx.fillStyle = '#fff'
  ctx.fill()
  forme(bord)
  ctx.fillStyle = couleur
  ctx.fill()
  // La police se règle après le redimensionnement du canevas, qui la remet à zéro.
  ctx.font = `800 ${police * ratio}px ${famille}`
  ctx.fillStyle = encreSur(couleur)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(ref, (largeur / 2) * ratio, (hauteur / 2 + 0.5) * ratio)
  return { image: ctx.getImageData(0, 0, canvas.width, canvas.height), ratio }
}
