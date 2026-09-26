'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'
import { useEffect, useEffectEvent, useRef, useState, type PointerEvent as EvenementPointeur, type ReactNode } from 'react'

import { useJeu } from '@/lib/store'

import { BoutonRond } from '../ui'

export type Largeur = 'normale' | 'large' | 'pleine'

/** Sur téléphone, une feuille se tient à l'une de ces trois hauteurs : repliée, ouverte ou dépliée. */
type Position = 'repliee' | 'ouverte' | 'depliee'

/** Ce que l'en-tête de la partie occupe en haut de l'écran du téléphone, et la barre du bas quand elle reste visible. */
const HAUT_ENTETE = 150
const HAUT_BARRE = 88
/** Ouverte, la feuille prend au plus cette part de l'écran : la carte reste visible au-dessus. */
const PART_OUVERTE = 0.45
/** En deçà de ce déplacement, en pixels, le doigt a touché la poignée sans la tirer. */
const SEUIL_GLISSEMENT = 5
/** Au-delà de cette vitesse, en pixels par milliseconde, un geste bref suffit à passer à la position suivante. */
const VITESSE_LANCER = 0.45

/** La hauteur de la fenêtre, suivie quand le téléphone tourne ou que la barre d'adresse se replie. */
export function useHauteurFenetre() {
  const [hauteur, setHauteur] = useState(() => (typeof window === 'undefined' ? 800 : window.innerHeight))
  useEffect(() => {
    const maj = () => setHauteur(window.innerHeight)
    window.addEventListener('resize', maj)
    return () => window.removeEventListener('resize', maj)
  }, [])
  return hauteur
}

/**
 * Ce qu'une feuille ouverte cache du bas de l'écran du téléphone, barre du bas comprise quand elle reste visible : la
 * carte cadre ce qu'elle montre au-dessus.
 */
export const hauteurFeuilleOuverte = (fenetre: number, barre: boolean) =>
  Math.min(fenetre - HAUT_ENTETE - (barre ? HAUT_BARRE : 0), Math.round(fenetre * PART_OUVERTE)) + (barre ? HAUT_BARRE : 0)

/**
 * Le conteneur des panneaux : une feuille qui monte du bas sur téléphone, une colonne à droite de la carte sur
 * ordinateur. Échap le ferme, et le titre reçoit le focus à l'ouverture.
 *
 * Sur téléphone, la feuille s'ouvre à moins de la moitié de l'écran pour laisser la carte visible, en particulier
 * pendant le tracé d'une ligne. On la tire par sa poignée ou par son titre : vers le bas, elle se replie jusqu'à
 * ne garder que son titre et ses boutons ; vers le haut, elle se déplie. Toucher la poignée la replie ou la rouvre.
 * Les panneaux qui n'ont pas besoin de la carte, comme la liste des projets, prennent tout l'écran.
 */
export function Panneau({
  titre,
  surtitre,
  largeur = 'normale',
  children,
  pied,
  onFermer,
  hauteurTelephone = 'auto',
}: {
  titre: ReactNode
  surtitre?: ReactNode
  largeur?: Largeur
  children: ReactNode
  pied?: ReactNode
  onFermer?: () => void
  hauteurTelephone?: 'auto' | 'pleine'
}) {
  const fermer = useJeu((s) => s.fermer)
  // Sur téléphone, la barre « Trouver de l'argent / Finir le mandat » reste visible sous le panneau.
  const barreVisible = useJeu((s) => !s.brouillon && !(s.ecran === 'tuto' && s.tuto < 2))
  // Sur ordinateur, le panneau arrive de la droite ; sur téléphone, il monte du bas.
  const [grand] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches)
  const refTitre = useRef<HTMLHeadingElement>(null)
  const refFeuille = useRef<HTMLElement>(null)
  const refContenu = useRef<HTMLDivElement>(null)
  const quitter = onFermer ?? fermer

  const feuille = !grand && hauteurTelephone === 'auto'
  const fenetre = useHauteurFenetre()
  const [position, setPosition] = useState<Position>('ouverte')
  // Pendant qu'on tire la feuille, sa hauteur suit le doigt ; au lâcher, elle rejoint la position la plus proche.
  const [tiree, setTiree] = useState<number | null>(null)
  // La hauteur du titre et des boutons du bas : la feuille repliée ne garde qu'eux.
  const [repliee, setRepliee] = useState(0)
  const geste = useRef<{ y: number; hauteur: number; temps: number; glisse: boolean; poignee: boolean } | null>(null)

  const maximum = fenetre - HAUT_ENTETE - (barreVisible ? HAUT_BARRE : 0)
  const ouverte = Math.min(maximum, Math.round(fenetre * PART_OUVERTE))
  const hauteurs: Record<Position, number> = { repliee, ouverte, depliee: maximum }

  // Le titre reçoit le focus une seule fois, à l'ouverture : sinon chaque nouveau rendu du panneau, comme à chaque
  // lettre tapée dans le nom d'une ligne, le lui reprendrait.
  useEffect(() => {
    refTitre.current?.focus({ preventScroll: true })
  }, [])
  const echap = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') quitter()
  })
  useEffect(() => {
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [])

  // La partie fixe de la feuille, mesurée : sa hauteur moins celle de son contenu défilant.
  const mesurerFixe = () => {
    const f = refFeuille.current
    const c = refContenu.current
    return f && c ? f.offsetHeight - c.offsetHeight : repliee
  }
  const allerA = (p: Position) => {
    if (p === 'repliee') setRepliee(mesurerFixe())
    setPosition(p)
  }

  const commencer = (e: EvenementPointeur<HTMLDivElement>) => {
    if (!feuille || !refFeuille.current) return
    // Les boutons et les champs de l'en-tête, comme le nom d'une ligne, gardent leur comportement.
    const cible = e.target as HTMLElement
    const poignee = Boolean(cible.closest('[data-poignee]'))
    if (!poignee && cible.closest('button, input, textarea, select, a, label')) return
    geste.current = { y: e.clientY, hauteur: refFeuille.current.offsetHeight, temps: e.timeStamp, glisse: false, poignee }
    setRepliee(mesurerFixe())
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const suivre = (e: EvenementPointeur<HTMLDivElement>) => {
    const g = geste.current
    if (!g) return
    const ecart = g.y - e.clientY
    if (!g.glisse && Math.abs(ecart) < SEUIL_GLISSEMENT) return
    g.glisse = true
    setTiree(Math.max(repliee, Math.min(maximum, g.hauteur + ecart)))
  }
  const lacher = (e: EvenementPointeur<HTMLDivElement>) => {
    const g = geste.current
    geste.current = null
    if (!g) return
    if (!g.glisse) {
      // Un simple toucher sur la poignée replie la feuille, ou la rouvre.
      if (g.poignee) allerA(position === 'repliee' ? 'ouverte' : 'repliee')
      return
    }
    const hauteur = Math.max(repliee, Math.min(maximum, g.hauteur + g.y - e.clientY))
    const vitesse = (g.y - e.clientY) / Math.max(1, e.timeStamp - g.temps)
    const ordre: Position[] = ['repliee', 'ouverte', 'depliee']
    let rang = ordre.reduce(
      (meilleur, p, i) => (Math.abs(hauteurs[p] - hauteur) < Math.abs(hauteurs[ordre[meilleur]!] - hauteur) ? i : meilleur),
      0,
    )
    // Un geste vif va jusqu'à la position suivante dans son sens, même s'il s'arrête avant.
    if (vitesse > VITESSE_LANCER && hauteurs[ordre[rang]!] <= hauteur) rang = Math.min(2, rang + 1)
    if (vitesse < -VITESSE_LANCER && hauteurs[ordre[rang]!] >= hauteur) rang = Math.max(0, rang - 1)
    setTiree(null)
    allerA(ordre[rang]!)
  }

  const hauteurMax = !feuille ? undefined : (tiree ?? hauteurs[position])
  const replieeVisible = feuille && tiree === null && position === 'repliee'

  return (
    <motion.section
      ref={refFeuille}
      role="dialog"
      aria-modal="false"
      aria-labelledby="titre-panneau"
      initial={grand ? { opacity: 0, x: 60 } : { y: '100%' }}
      animate={grand ? { opacity: 1, x: 0 } : { y: 0 }}
      exit={grand ? { opacity: 0, x: 60 } : { y: '100%' }}
      transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.9 }}
      style={hauteurMax !== undefined ? { maxHeight: hauteurMax } : undefined}
      className={clsx(
        // Le panneau rogne son contenu sans jamais défiler lui-même : un champ qui prend le focus fait défiler sa
        // liste, pas le panneau entier, qui laisserait sinon un grand vide blanc.
        'fixed inset-x-0 z-30 flex flex-col overflow-hidden supports-[overflow:clip]:overflow-clip rounded-t-[26px] bg-white shadow-panneau',
        barreVisible ? 'bottom-[88px]' : 'bottom-0',
        hauteurTelephone === 'pleine' && 'top-0 rounded-t-none',
        // La hauteur suit le doigt sans retard, puis glisse jusqu'à sa position au lâcher.
        feuille && tiree === null && 'transition-[max-height] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        'lg:absolute lg:top-24 lg:right-0 lg:bottom-0 lg:left-auto lg:max-h-none lg:rounded-none lg:rounded-l-none lg:shadow-[-8px_0_30px_rgb(0_0_0/0.08)]',
        largeur === 'normale' && 'lg:w-[440px]',
        largeur === 'large' && 'lg:w-[min(1100px,calc(100vw-340px))]',
        largeur === 'pleine' && 'lg:left-[340px] lg:w-auto',
      )}
    >
      <div
        onPointerDown={commencer}
        onPointerMove={suivre}
        onPointerUp={lacher}
        onPointerCancel={() => {
          geste.current = null
          setTiree(null)
        }}
        className={clsx('flex shrink-0 flex-col', feuille && 'touch-none select-none')}
      >
        {feuille ? (
          <button
            type="button"
            data-poignee
            aria-label={position === 'repliee' ? 'Déplier le panneau' : 'Replier le panneau'}
            aria-expanded={position !== 'repliee'}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              allerA(position === 'repliee' ? 'ouverte' : 'repliee')
            }}
            className="flex h-6 w-full shrink-0 cursor-grab items-end justify-center outline-none active:cursor-grabbing"
          >
            <span className="h-1.5 w-11 rounded-full bg-trait" />
          </button>
        ) : null}
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-2.5 pb-3 lg:px-7 lg:pt-6.5">
          <div className="flex min-w-0 flex-col gap-1.5">
            {surtitre}
            <h2
              id="titre-panneau"
              ref={refTitre}
              tabIndex={-1}
              className="text-[23px] leading-[1.08] font-black tracking-tight outline-none lg:text-[28px]"
            >
              {titre}
            </h2>
          </div>
          <BoutonRond label="Fermer" icone="fermer" onClick={quitter} className="-mr-1" />
        </div>
      </div>
      {/* La zone qui défile peut se réduire à rien quand la feuille est repliée : ses marges sont à l'intérieur. Elle
          sert de repère aux cases cachées derrière les interrupteurs, qui défilent ainsi avec elle. */}
      <div
        ref={refContenu}
        inert={replieeVisible || undefined}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
      >
        <div className="flex grow flex-col gap-4 px-5 pb-5 lg:px-7">{children}</div>
      </div>
      {pied ? <div className="flex shrink-0 flex-col gap-2 border-t border-trait px-5 pt-3 pb-6 lg:px-7 lg:pb-7">{pied}</div> : null}
    </motion.section>
  )
}
