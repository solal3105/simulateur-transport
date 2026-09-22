import type { SVGProps } from 'react'
import type { Mode } from '@/lib/types'

/**
 * Pictogrammes dessinés pour ce panneau : aplats pleins, une seule graisse,
 * les évidements peints dans la couleur du fond de la plaque.
 * `--picto-hole` vaut le noir de plaque par défaut et se redéfinit sur vert.
 */
type PictoProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  xmlns: 'http://www.w3.org/2000/svg',
} as const

const HOLE = 'var(--picto-hole, #0b0e07)'

export function MetroPicto(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 7a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v10.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5V7Z" />
      <rect x="3.6" y="21" width="16.8" height="1.7" rx="0.85" />
      <rect x="7.6" y="6.6" width="8.8" height="4.6" rx="1.1" fill={HOLE} />
      <rect x="7.8" y="14" width="2.9" height="2.1" rx="1.05" fill={HOLE} />
      <rect x="13.3" y="14" width="2.9" height="2.1" rx="1.05" fill={HOLE} />
    </svg>
  )
}

export function RenovationPicto(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v10.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 4 17.5V7Z" />
      <rect x="6.5" y="6.6" width="8" height="4.6" rx="1.1" fill={HOLE} />
      <rect x="6.7" y="14" width="2.7" height="2.1" rx="1.05" fill={HOLE} />
      <circle cx="18.2" cy="17.6" r="6.1" fill={HOLE} />
      <path d="M18.2 12.6l4 4.6h-2.3v4h-3.4v-4h-2.3l4-4.6Z" />
    </svg>
  )
}

export function TramPicto(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.4" y="1" width="19.2" height="1.4" rx="0.7" />
      <path d="M9.1 6 11.2 3.1h1.6L14.9 6h-1.9l-1-1.5-1 1.5H9.1Z" />
      <path d="M6 10a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v7.6a2.4 2.4 0 0 1-2.4 2.4H8.4A2.4 2.4 0 0 1 6 17.6V10Z" />
      <rect x="4.8" y="21" width="14.4" height="1.7" rx="0.85" />
      <rect x="8.3" y="9.3" width="7.4" height="3.9" rx="1" fill={HOLE} />
      <rect x="8.4" y="15.4" width="2.6" height="1.9" rx="0.95" fill={HOLE} />
      <rect x="13" y="15.4" width="2.6" height="1.9" rx="0.95" fill={HOLE} />
    </svg>
  )
}

export function BusPicto(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 6.2A3.2 3.2 0 0 1 7.7 3h8.6a3.2 3.2 0 0 1 3.2 3.2v11.3a2.2 2.2 0 0 1-2.2 2.2H6.7a2.2 2.2 0 0 1-2.2-2.2V6.2Z" />
      <circle cx="8.1" cy="20.9" r="1.9" />
      <circle cx="15.9" cy="20.9" r="1.9" />
      <rect x="7" y="7" width="10" height="4.8" rx="1" fill={HOLE} />
      <rect x="6.9" y="14.4" width="3" height="2.1" rx="1.05" fill={HOLE} />
      <rect x="14.1" y="14.4" width="3" height="2.1" rx="1.05" fill={HOLE} />
    </svg>
  )
}

export function CablePicto(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M1.6 3.35 22.3 6.9l-.28 1.64L1.32 4.99 1.6 3.35Z" />
      <rect x="11.2" y="6.6" width="1.6" height="4.4" />
      <path d="M6.6 13.2A2.2 2.2 0 0 1 8.8 11h6.4a2.2 2.2 0 0 1 2.2 2.2v6.3a2.2 2.2 0 0 1-2.2 2.2H8.8a2.2 2.2 0 0 1-2.2-2.2v-6.3Z" />
      <rect x="8.7" y="13.3" width="6.6" height="3.6" rx="0.9" fill={HOLE} />
      <circle cx="12" cy="6.2" r="1.9" />
    </svg>
  )
}

export function FluvialPicto(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.2 15.4h19.6l-2.35 4.9a2.4 2.4 0 0 1-2.16 1.36H6.71a2.4 2.4 0 0 1-2.16-1.36L2.2 15.4Z" />
      <path d="M6 8.4A1.8 1.8 0 0 1 7.8 6.6h8.4A1.8 1.8 0 0 1 18 8.4v5.2H6V8.4Z" />
      <rect x="8" y="8.6" width="3.1" height="3" rx="0.8" fill={HOLE} />
      <rect x="12.9" y="8.6" width="3.1" height="3" rx="0.8" fill={HOLE} />
      <rect x="11.2" y="2.2" width="1.6" height="4.4" />
    </svg>
  )
}

const PICTOS: Record<Mode, (props: PictoProps) => React.ReactElement> = {
  metro: MetroPicto,
  renovation: RenovationPicto,
  tram: TramPicto,
  bus: BusPicto,
  cable: CablePicto,
  fluvial: FluvialPicto,
}

export function ModePicto({ mode, ...props }: PictoProps & { mode: Mode }) {
  const Component = PICTOS[mode]
  return <Component aria-hidden {...props} />
}

/* Signes de service : même grille, même graisse. */

export function ArrowRight(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.1 3.9 21.2 12l-8.1 8.1-2.4-2.4 4-4H2.8v-3.4h11.9l-4-4 2.4-2.4Z" />
    </svg>
  )
}

export function ArrowLeft(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10.9 20.1 2.8 12l8.1-8.1 2.4 2.4-4 4h11.9v3.4H9.3l4 4-2.4 2.4Z" />
    </svg>
  )
}

export function ArrowUp(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.9 10.9 12 2.8l8.1 8.1-2.4 2.4-4-4v11.9h-3.4V9.3l-4 4-2.4-2.4Z" />
    </svg>
  )
}

export function ChevronDown(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 16.6 3.7 8.3l2.4-2.4L12 11.8l5.9-5.9 2.4 2.4L12 16.6Z" />
    </svg>
  )
}

export function Cross(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 9.6 18.4 3.2l2.4 2.4L14.4 12l6.4 6.4-2.4 2.4L12 14.4l-6.4 6.4-2.4-2.4L9.6 12 3.2 5.6l2.4-2.4L12 9.6Z" />
    </svg>
  )
}

export function Check(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.6 18.6 3 12l2.4-2.4 4.2 4.2L18.6 4.8 21 7.2 9.6 18.6Z" />
    </svg>
  )
}

export function Restart(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.6a8.4 8.4 0 1 1-8.03 10.9h3.63A5 5 0 1 0 12 7v3.2L6.4 5.8 12 1.4v2.2Z" />
    </svg>
  )
}

export function Gavel(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 1.8a4.6 4.6 0 0 0-4.6 4.6V9H5.9a1.7 1.7 0 0 0-1.7 1.7v9.8a1.7 1.7 0 0 0 1.7 1.7h12.2a1.7 1.7 0 0 0 1.7-1.7v-9.8A1.7 1.7 0 0 0 18.1 9h-1.5V6.4A4.6 4.6 0 0 0 12 1.8Zm0 3.1a1.5 1.5 0 0 1 1.5 1.5V9h-3V6.4A1.5 1.5 0 0 1 12 4.9Z" />
      <rect x="10.3" y="13.4" width="3.4" height="5.2" rx="1.7" fill={HOLE} />
    </svg>
  )
}

export function Download(props: PictoProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10.3 2.4h3.4v8.3l4-4 2.4 2.4-8.1 8.1-8.1-8.1 2.4-2.4 4 4V2.4Z" />
      <rect x="3" y="19" width="18" height="3" rx="0.6" />
    </svg>
  )
}
