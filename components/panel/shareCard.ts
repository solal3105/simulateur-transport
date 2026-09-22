import { millions, riders } from '@/lib/format'
import { PALETTE } from '@/lib/palette'
import { PHASES } from '@/lib/projects'
import type { Assessment } from '@/lib/types'

const WIDTH = 1200
const HEIGHT = 630
const { signal: SIGNAL, ink: INK, chalk: CHALK, alert: ALERT, olive: OLIVE, chalkDim: CHALK_DIM } =
  PALETTE

function familyOf(variable: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  return resolved ? `${resolved}, ${fallback}` : fallback
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fill()
}

/**
 * Carte de partage : le panneau, réduit à ce qui se lit dans un fil.
 * Tout ce qu'elle affiche vient de l'évaluation en cours, rien n'y est décoratif.
 */
export async function drawShareCard({
  assessment,
  built,
  skipped,
}: {
  assessment: Assessment
  built: number
  skipped: number
}) {
  if (typeof document === 'undefined') return
  await document.fonts.ready

  const sans = familyOf('--font-archivo', 'system-ui, sans-serif')
  const mono = familyOf('--font-martian', 'ui-monospace, monospace')

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) return

  context.fillStyle = SIGNAL
  context.fillRect(0, 0, WIDTH, HEIGHT)

  // Bandeau d'identification, en haut à gauche.
  context.fillStyle = INK
  roundedRect(context, 64, 56, 44, 44, 2)
  context.fillStyle = SIGNAL
  context.font = `700 22px ${sans}`
  context.textBaseline = 'middle'
  context.fillText('T', 80, 79)

  context.fillStyle = INK
  context.font = `700 22px ${sans}`
  context.fillText('Simulateur Transport TCL', 124, 79)

  context.fillStyle = OLIVE
  context.font = `500 18px ${mono}`
  context.fillText(`${PHASES.M1.start} → ${PHASES.M2.end}`, 124, 104)

  // L'affirmation principale : ce que le programme ajoute au réseau.
  context.fillStyle = INK
  context.font = `700 132px ${sans}`
  context.textBaseline = 'alphabetic'
  const headline = `+${riders(assessment.ridership)}`
  context.fillText(headline, 64, 292)

  context.font = `700 30px ${sans}`
  context.fillText('voyageurs par jour', 66, 340)

  context.fillStyle = OLIVE
  context.font = `500 20px ${mono}`
  context.fillText(
    `${built} ouvrage${built > 1 ? 's' : ''} inscrits · ${skipped} laissé${skipped > 1 ? 's' : ''} à l’étude`,
    64,
    378,
  )

  // Les trois chiffres du bilan, en colonnes égales.
  const columns: [string, string][] = [
    [`${millions(assessment.spend)} M€`, 'engagés sur deux mandats'],
    [
      assessment.spend > 0 ? `${Math.round(assessment.yield)}` : '0',
      'voyageurs par million d’euros',
    ],
    [
      assessment.balanced ? 'Équilibré' : 'Dépassement',
      assessment.balanced
        ? 'les deux enveloppes tiennent'
        : 'une enveloppe au moins est dépassée',
    ],
  ]

  const cardWidth = (WIDTH - 128 - 32) / 3
  columns.forEach(([value, caption], index) => {
    const x = 64 + index * (cardWidth + 16)
    const last = index === 2
    context.fillStyle = INK
    roundedRect(context, x, 428, cardWidth, 138, 2)

    context.fillStyle = last ? (assessment.balanced ? SIGNAL : ALERT) : CHALK
    context.font = `700 44px ${sans}`
    context.textBaseline = 'alphabetic'
    context.fillText(value, x + 22, 492)

    context.fillStyle = CHALK_DIM
    context.font = `500 16px ${mono}`
    wrap(context, caption, x + 22, 520, cardWidth - 44, 21)
  })

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'mon-reseau-tcl-2038.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let offset = 0

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y + offset)
      line = word
      offset += lineHeight
    } else {
      line = candidate
    }
  }
  if (line) context.fillText(line, x, y + offset)
}
