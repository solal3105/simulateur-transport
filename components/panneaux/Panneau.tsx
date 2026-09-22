'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'

import { useJeu } from '@/lib/store'

import { BoutonRond } from '../ui'

export type Largeur = 'normale' | 'large' | 'pleine'

/**
 * Le conteneur des panneaux : une feuille qui monte du bas sur téléphone, une colonne à
 * droite de la carte sur ordinateur. Échap le ferme, et le titre reçoit le focus à l'ouverture.
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
  const refTitre = useRef<HTMLHeadingElement>(null)
  const quitter = onFermer ?? fermer

  useEffect(() => {
    refTitre.current?.focus({ preventScroll: true })
    const clavier = (e: KeyboardEvent) => e.key === 'Escape' && quitter()
    window.addEventListener('keydown', clavier)
    return () => window.removeEventListener('keydown', clavier)
  }, [quitter])

  return (
    <motion.section
      role="dialog"
      aria-modal="false"
      aria-labelledby="titre-panneau"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className={clsx(
        'fixed inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden rounded-t-[26px] bg-white shadow-panneau',
        hauteurTelephone === 'pleine' ? 'top-0 rounded-t-none' : 'max-h-[88dvh]',
        'lg:absolute lg:top-24 lg:right-0 lg:bottom-0 lg:left-auto lg:max-h-none lg:rounded-none lg:rounded-l-none lg:shadow-[-8px_0_30px_rgb(0_0_0/0.08)]',
        largeur === 'normale' && 'lg:w-[440px]',
        largeur === 'large' && 'lg:w-[min(1100px,calc(100vw-340px))]',
        largeur === 'pleine' && 'lg:left-[340px] lg:w-auto',
      )}
    >
      <div className={clsx('mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-trait lg:hidden', hauteurTelephone === 'pleine' && 'hidden')} />
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-3 pb-3 lg:px-7 lg:pt-6.5">
        <div className="flex min-w-0 flex-col gap-1.5">
          {surtitre}
          <h2 id="titre-panneau" ref={refTitre} tabIndex={-1} className="text-[23px] leading-[1.08] font-black tracking-tight outline-none lg:text-[28px]">
            {titre}
          </h2>
        </div>
        <BoutonRond label="Fermer" icone="fermer" onClick={quitter} className="-mr-1" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 pb-5 lg:px-7">{children}</div>
      {pied ? <div className="flex shrink-0 flex-col gap-2 border-t border-trait px-5 pt-3 pb-6 lg:px-7 lg:pb-7">{pied}</div> : null}
    </motion.section>
  )
}
