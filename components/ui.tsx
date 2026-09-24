'use client'

import { clsx } from 'clsx'
import Link from 'next/link'
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react'

const TRACES = {
  fleche: 'M5 12h14M13 6l6 6-6 6',
  retour: 'M19 12H5M11 6l-6 6 6 6',
  fermer: 'M6 6l12 12M18 6L6 18',
  valider: 'M5 12.5l4.5 4.5L19 7',
  poubelle: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4.5h6V7',
  pieces:
    'M3 7c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6-2.7-2.6-6-2.6S3 5.6 3 7zM3 7v4c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V7M9 16.2c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-4c0-1.4-2.7-2.6-6-2.6',
  drapeau: 'M5 21V4M5 4h11l-2 4 2 4H5',
  voyageurs:
    'M9 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M17 11.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8zM16 14.2c2.3.2 4 1.8 4.5 4.8',
  horloge: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM12 7.5V12l3 2',
  tram: 'M8 4h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM6 11h12M9 20l-1.5 1.5M15 20l1.5 1.5M10 2h4',
  metro: 'M8 3.5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3zM8.5 14l1.5-6 2 4 2-4 1.5 6M8 20.5l-1.5 1M16 20.5l1.5 1',
  bus: 'M7 4h10a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 17 17H7a2.5 2.5 0 0 1-2.5-2.5v-8A2.5 2.5 0 0 1 7 4zM4.5 11h15M8 20v-3M16 20v-3',
  cable: 'M3 5l18 4M12 7v4M9 11h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM7 15h10',
  bateau: 'M4 15l2 5h12l2-5zM12 4v11M12 5l6 7H12',
  cle: 'M14.5 4.5a4 4 0 0 0 5 5l-9.5 9.5a2.1 2.1 0 0 1-3-3z',
  partager: 'M12 3v12M7 8l5-5 5 5M5 14v6h14v-6',
  rejouer: 'M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 3.5v5h5',
  loi: 'M4 20h16M6 17V9M10 17V9M14 17V9M18 17V9M3 9l9-5 9 5z',
  moins: 'M6 12h12',
  plus: 'M6 12h12M12 6v12',
  main: 'M9 11V5.5a1.5 1.5 0 0 1 3 0V10M12 9.5a1.5 1.5 0 0 1 3 0V11M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.7a5 5 0 0 1-4-2l-3.1-4.2a1.5 1.5 0 0 1 2.3-1.9L9 15',
  liste: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  carte: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14',
  points: 'M5 12h.01M12 12h.01M19 12h.01',
  trace:
    'M6 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5',
  crayon: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  annuler: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  telecharger: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  lettre: 'M4.5 5.5h15A1.5 1.5 0 0 1 21 7v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1.5-1.5zM3.5 6.5l8.5 6.5 8.5-6.5',
} as const

export type NomIcone = keyof typeof TRACES

export function Icone({
  nom,
  taille = 20,
  epaisseur = 2,
  className,
}: {
  nom: NomIcone
  taille?: number
  epaisseur?: number
  className?: string
}) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={clsx('shrink-0', className)}
    >
      <path d={TRACES[nom]} />
    </svg>
  )
}

export const ICONE_MODE: Record<string, NomIcone> = {
  metro: 'metro',
  renovation: 'cle',
  tram: 'tram',
  bus: 'bus',
  cable: 'cable',
  fluvial: 'bateau',
}

type Genre = 'rouge' | 'encre' | 'blanc' | 'contour' | 'sable' | 'contourBlanc'

const GENRES: Record<Genre, string> = {
  rouge: 'bg-rouge text-white hover:bg-rouge-fonce',
  encre: 'bg-encre text-white hover:bg-black',
  blanc: 'bg-white text-rouge hover:bg-rouge-pale',
  contour: 'bg-white text-encre shadow-[inset_0_0_0_1.5px_var(--color-trait)] hover:shadow-[inset_0_0_0_1.5px_var(--color-muet)]',
  sable: 'bg-sable text-encre hover:bg-trait',
  contourBlanc: 'bg-transparent text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.6)] hover:bg-white/10',
}

type Aspect = { genre?: Genre; icone?: NomIcone; iconeAGauche?: NomIcone; taille?: 'normal' | 'petit' | 'grand' }

const classesBouton = ({ genre = 'rouge', icone, taille = 'normal' }: Aspect) =>
  clsx(
    'inline-flex items-center gap-2.5 rounded-full font-extrabold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40',
    icone ? 'justify-between' : 'justify-center',
    taille === 'petit' && 'min-h-11 px-4 text-sm',
    taille === 'normal' && 'min-h-13 px-5 text-[15px]',
    taille === 'grand' && 'min-h-14 px-6 text-base',
    GENRES[genre],
  )

function Contenu({ icone, iconeAGauche, children }: Aspect & { children: ReactNode }) {
  return (
    <>
      {iconeAGauche ? <Icone nom={iconeAGauche} taille={18} /> : null}
      <span className="text-left">{children}</span>
      {icone ? <Icone nom={icone} taille={19} epaisseur={2.3} /> : null}
    </>
  )
}

export function Bouton({
  genre,
  icone,
  iconeAGauche,
  taille,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Aspect) {
  return (
    <button type="button" {...props} className={clsx(classesBouton({ genre, icone, taille }), className)}>
      <Contenu icone={icone} iconeAGauche={iconeAGauche}>
        {children}
      </Contenu>
    </button>
  )
}

/** Un lien vers une autre page, avec l'apparence d'un bouton : même taille, mêmes couleurs, mêmes icônes. */
export function BoutonLien({
  href,
  genre,
  icone,
  iconeAGauche,
  taille,
  className,
  children,
}: Aspect & { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={clsx(classesBouton({ genre, icone, taille }), className)}>
      <Contenu icone={icone} iconeAGauche={iconeAGauche}>
        {children}
      </Contenu>
    </Link>
  )
}

export function BoutonRond({
  label,
  icone,
  onClick,
  className,
  ref,
}: {
  label: string
  icone: NomIcone
  onClick: () => void
  className?: string
  ref?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      onClick={onClick}
      className={clsx(
        'grid size-11 shrink-0 place-items-center rounded-full bg-sable text-encre transition-colors hover:bg-trait',
        className,
      )}
    >
      <Icone nom={icone} taille={20} epaisseur={2.3} />
    </button>
  )
}

export function Surtitre({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('text-xs font-extrabold tracking-[0.08em] text-muet uppercase', className)}>{children}</div>
}

export function Pastille({
  icone,
  children,
  className,
  couleur,
}: {
  icone?: NomIcone
  children: ReactNode
  className?: string
  /** Couleur du mode de transport : la pastille la reprend en fond léger. */
  couleur?: string
}) {
  return (
    <span
      style={
        couleur
          ? { color: `color-mix(in srgb, ${couleur} 72%, black)`, background: `color-mix(in srgb, ${couleur} 12%, white)` }
          : undefined
      }
      className={clsx(
        'inline-flex items-center gap-1.5 self-start rounded-full bg-rouge-pale py-1 pr-2.5 pl-2 text-xs font-extrabold text-rouge-fonce',
        className,
      )}
    >
      {icone ? <Icone nom={icone} taille={15} epaisseur={2.3} /> : null}
      {children}
    </span>
  )
}

export function CarteChiffre({
  icone,
  valeur,
  unite,
  legende,
  accent,
}: {
  icone: NomIcone
  valeur: string
  unite?: string
  legende: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-sable p-3">
      <Icone nom={icone} taille={17} className="text-muet" />
      <div className={clsx('flex items-baseline gap-1 whitespace-nowrap', accent && 'text-rouge')}>
        <span className="chiffres text-[19px] font-black tracking-tight">{valeur}</span>
        {unite ? <span className="text-xs font-extrabold">{unite}</span> : null}
      </div>
      <div className="text-xs leading-snug text-gris">{legende}</div>
    </div>
  )
}

export type Segment = { montant: number; style: 'reserve' | 'fait' | 'report' | 'apercu' | 'manque' | 'libre' | 'levier' }

const SEGMENTS_ROUGE: Record<Segment['style'], string> = {
  reserve: 'bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.8)_0_3px,rgba(255,255,255,0.3)_3px_6px)]',
  fait: 'bg-white',
  report: 'bg-[repeating-linear-gradient(135deg,#fff_0_3px,rgba(255,255,255,0.45)_3px_6px)]',
  apercu: 'bg-encre',
  manque: 'bg-[repeating-linear-gradient(135deg,#1b1b1f_0_3px,rgba(27,27,31,0.45)_3px_6px)]',
  libre: 'bg-transparent',
  levier: 'bg-white/60',
}
const SEGMENTS_CLAIR: Record<Segment['style'], string> = {
  reserve: 'bg-[repeating-linear-gradient(135deg,#b9b5af_0_3px,#dad6d0_3px_6px)]',
  fait: 'bg-rouge',
  report: 'bg-[repeating-linear-gradient(135deg,var(--color-rouge)_0_3px,var(--color-rouge-moyen)_3px_6px)]',
  apercu: 'bg-encre',
  manque: 'bg-[repeating-linear-gradient(135deg,#1b1b1f_0_3px,var(--color-rouge)_3px_6px)]',
  libre: 'bg-transparent',
  levier: 'bg-rouge/45',
}

export function Jauge({
  segments,
  total,
  surRouge,
  hauteur = 12,
  label,
}: {
  segments: Segment[]
  total: number
  surRouge?: boolean
  hauteur?: number
  label: string
}) {
  const palette = surRouge ? SEGMENTS_ROUGE : SEGMENTS_CLAIR
  return (
    <div
      role="img"
      aria-label={label}
      className={clsx('flex gap-0.5 overflow-hidden rounded-md', surRouge ? 'bg-black/20' : 'bg-[#eeebe7]')}
      style={{ height: hauteur }}
    >
      {segments
        .filter((s) => s.montant > 0)
        .map((s, i) => (
          <div
            key={i}
            className={clsx('h-full transition-[width] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]', palette[s.style])}
            style={{ width: `${(s.montant / total) * 100}%` }}
          />
        ))}
    </div>
  )
}

export function Logo({ taille = 36, inverse }: { taille?: number; inverse?: boolean }) {
  return (
    <div
      className={clsx('grid shrink-0 place-items-center', inverse ? 'bg-white text-rouge' : 'bg-rouge text-white')}
      style={{ width: taille, height: taille, borderRadius: taille * 0.3 }}
    >
      <Icone nom="tram" taille={Math.round(taille * 0.58)} epaisseur={2.2} />
    </div>
  )
}

export function EtapesMandat({ mandat, surRouge = true }: { mandat: 1 | 2; surRouge?: boolean }) {
  const actif = surRouge ? 'bg-white' : 'bg-rouge'
  const inactif = surRouge ? 'bg-white/35' : 'bg-trait'
  return (
    <div className="flex gap-1" aria-hidden="true">
      <div className={clsx('h-1.5 w-5.5 rounded-full', actif)} />
      <div className={clsx('h-1.5 w-5.5 rounded-full', mandat === 2 ? actif : inactif)} />
    </div>
  )
}

/**
 * Une rangée qui défile sur téléphone garde son élément choisi en vue, sans faire bouger la page : à
 * poser sur la rangée, avec ce qui change le choix.
 */
export function useChoixVisible<T extends HTMLElement>(choix: unknown) {
  const rangee = useRef<T>(null)
  useEffect(() => {
    const r = rangee.current
    const choisi = r?.querySelector<HTMLElement>('[aria-checked="true"], [aria-current="page"]')
    if (r && choisi && r.scrollWidth > r.clientWidth) r.scrollLeft = choisi.offsetLeft - 24
  }, [choix])
  return rangee
}
