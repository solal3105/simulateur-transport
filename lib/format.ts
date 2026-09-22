import type { Mode } from './types'

/** Espace fine insécable, séparateur de milliers correct en français. */
const THIN = ' '

export function groupDigits(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '−' : ''
  return sign + Math.abs(rounded).toLocaleString('fr-FR').replace(/\s/g, THIN)
}

/** Montants en millions d'euros, l'unité de tout le simulateur. */
export function millions(value: number): string {
  return groupDigits(value)
}

export function signedMillions(value: number): string {
  const rounded = Math.round(value)
  if (rounded === 0) return '0'
  return (rounded > 0 ? '+' : '−') + Math.abs(rounded).toLocaleString('fr-FR').replace(/\s/g, THIN)
}

export function riders(value: number): string {
  return groupDigits(value)
}

export function fare(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

export function percent(value: number): string {
  if (value === 0) return '0 %'
  return `${value > 0 ? '+' : '−'}${Math.abs(value)}${THIN}%`
}

export const MODE_LABEL: Record<Mode, string> = {
  metro: 'Métro',
  renovation: 'Modernisation',
  tram: 'Tramway',
  bus: 'Bus à haut niveau de service',
  cable: 'Téléphérique',
  fluvial: 'Navette fluviale',
}

export const MODE_SHORT: Record<Mode, string> = {
  metro: 'Métro',
  renovation: 'Modernisation',
  tram: 'Tramway',
  bus: 'Bus',
  cable: 'Câble',
  fluvial: 'Fluvial',
}

/** Épaisseur du tracé sur le plan : le mode se lit à la largeur du trait. */
export const MODE_WEIGHT: Record<Mode, number> = {
  metro: 7,
  renovation: 7,
  tram: 5,
  bus: 3.5,
  cable: 3.5,
  fluvial: 3.5,
}
