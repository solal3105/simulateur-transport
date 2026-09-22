import type { StyleSpecification } from 'maplibre-gl'

import { PLAN_PALETTE } from '@/lib/palette'

/**
 * Fond vectoriel CARTO, gratuit et sans clé, repeint dans la palette du panneau.
 * On transforme la feuille de style avant de la donner à la carte, pour qu'aucune
 * image du fond d'origine n'apparaisse, même une fraction de seconde.
 */
const SOURCE_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const {
  ground: GROUND,
  rampTop: RAMP_TOP,
  water: WATER,
  greenspace: GREENSPACE,
  label: LABEL,
  labelHalo: LABEL_HALO,
} = PLAN_PALETTE

/**
 * Couches du fond à écarter : elles encombrent sans aider à s'orienter dans
 * une métropole, et le sujet de la planche reste le réseau.
 */
const DROP = ['hamlet', 'villages', 'housenumber', 'poi_']

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parse(value: unknown): [number, number, number] | null {
  if (typeof value !== 'string') return null
  const text = value.trim()

  const hex = text.match(/^#([0-9a-f]{3,8})$/i)
  if (hex) {
    const digits = hex[1]
    if (digits.length === 3 || digits.length === 4) {
      return [
        parseInt(digits[0] + digits[0], 16),
        parseInt(digits[1] + digits[1], 16),
        parseInt(digits[2] + digits[2], 16),
      ]
    }
    if (digits.length === 6 || digits.length === 8) {
      return [
        parseInt(digits.slice(0, 2), 16),
        parseInt(digits.slice(2, 4), 16),
        parseInt(digits.slice(4, 6), 16),
      ]
    }
    return null
  }

  const rgb = text.match(/^rgba?\(([^)]+)\)$/i)
  if (rgb) {
    const parts = rgb[1].split(/[,/]/).map((p) => parseFloat(p))
    if (parts.length >= 3 && parts.slice(0, 3).every((n) => Number.isFinite(n))) {
      return [parts[0], parts[1], parts[2]]
    }
    return null
  }

  const hsl = text.match(/^hsla?\(([^)]+)\)$/i)
  if (hsl) {
    const parts = hsl[1].split(/[,/]/).map((p) => parseFloat(p))
    if (parts.length < 3) return null
    const [h, s, l] = [parts[0] / 360, parts[1] / 100, parts[2] / 100]
    if (s === 0) return [l * 255, l * 255, l * 255]
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const channel = (t: number) => {
      let value = t
      if (value < 0) value += 1
      if (value > 1) value -= 1
      if (value < 1 / 6) return p + (q - p) * 6 * value
      if (value < 1 / 2) return q
      if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6
      return p
    }
    return [channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255]
  }

  return null
}

function mix(from: readonly number[], to: readonly number[], t: number) {
  const amount = clamp(t, 0, 1)
  const channel = (i: number) => Math.round(from[i] + (to[i] - from[i]) * amount)
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`
}

function repaint(value: unknown, target: readonly number[]): unknown {
  const rgb = parse(value)
  if (!rgb) return value
  const lightness = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
  // Le fond d'origine est très sombre : la racine relève les valeurs basses
  // pour que la trame viaire existe sans jamais concurrencer les tracés.
  return mix(GROUND, target, Math.pow(lightness, 0.55))
}

const WATER_HINTS = ['water', 'ocean', 'sea', 'river', 'bay']
const GREEN_HINTS = ['park', 'wood', 'forest', 'grass', 'landcover', 'pitch', 'cemetery']

function hints(id: string, list: string[]) {
  const lower = id.toLowerCase()
  return list.some((hint) => lower.includes(hint))
}

export async function loadBasemap(signal?: AbortSignal): Promise<StyleSpecification> {
  const response = await fetch(SOURCE_STYLE, { signal })
  if (!response.ok) throw new Error(`Fond de carte indisponible (${response.status})`)
  const style = (await response.json()) as StyleSpecification

  style.layers = style.layers.filter(
    (layer) => !DROP.some((hint) => layer.id.toLowerCase().includes(hint)),
  )

  for (const layer of style.layers) {
    if (layer.type === 'background') {
      layer.paint = { ...layer.paint, 'background-color': mix(GROUND, GROUND, 0) }
      continue
    }

    if (layer.type === 'symbol') {
      // Les toponymes restent, discrets : ils suffisent à s'orienter.
      layer.paint = {
        ...layer.paint,
        'text-color': LABEL,
        'text-halo-color': LABEL_HALO,
        'text-halo-width': 1.4,
        // Les toponymes ne doivent jamais l'emporter sur les tracés.
        'text-opacity': 0.8,
      }
      layer.layout = {
        ...layer.layout,
        'text-letter-spacing': 0.08,
      }
      continue
    }

    const target = hints(layer.id, WATER_HINTS)
      ? WATER
      : hints(layer.id, GREEN_HINTS)
        ? GREENSPACE
        : RAMP_TOP

    const paint = { ...(layer.paint as Record<string, unknown>) }
    for (const key of Object.keys(paint)) {
      if (key.endsWith('-color')) paint[key] = repaint(paint[key], target)
    }
    layer.paint = paint as typeof layer.paint
  }

  return style
}

/** Toute la Métropole, y compris les tracés les plus excentrés vers l'ouest. */
export const METROPOLE_BOUNDS: [[number, number], [number, number]] = [
  [4.7, 45.688],
  [5.09, 45.84],
]

/** Le cœur de l'agglomération, où se concentre la quasi-totalité des ouvrages. */
export const CORE_BOUNDS: [[number, number], [number, number]] = [
  [4.775, 45.7],
  [5.0, 45.815],
]

/**
 * Un cadre large est illisible sur un téléphone en portrait : l'emprise tient
 * compte de la forme du conteneur plutôt que d'imposer la même à tout le monde.
 */
export function framing(width: number, height: number) {
  return width / Math.max(height, 1) > 1.25 ? METROPOLE_BOUNDS : CORE_BOUNDS
}
