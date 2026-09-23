'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'

import { MANDATS } from '@/lib/catalogue'
import { n } from '@/lib/format'
import { useJeu, useVille } from '@/lib/store'

import { useCompteur } from '../anim'
import { EtapesMandat, Icone, Jauge, Logo } from '../ui'
import { segmentsBudget, useBilan, useScore } from './budget'

function libelleReste(reste: number, apercu: number) {
  if (reste < 0) return { valeur: n(-reste), texte: 'M€ de déficit', manque: true }
  if (apercu > reste) return { valeur: n(apercu - reste), texte: 'M€ manquent pour ce projet', manque: true }
  return { valeur: n(reste), texte: 'M€ encore disponibles', manque: false }
}

/**
 * Le bouton du menu de la partie, caché pendant le tutoriel et pendant le tracé d'une ligne. Sur
 * téléphone, l'icône seule laisse la place au nom de la ville et au mandat.
 */
function BoutonMenu({ compact, className }: { compact?: boolean; className?: string }) {
  const { ouvrir, ecran, brouillon, panneau } = useJeu()
  if (ecran === 'tuto' || brouillon) return null
  return (
    <button
      type="button"
      aria-label="Menu de la partie"
      aria-expanded={panneau?.type === 'menu'}
      onClick={() => ouvrir({ type: 'menu' })}
      className={clsx(
        'flex shrink-0 items-center justify-center gap-2 rounded-full bg-white/18 font-extrabold transition-colors hover:bg-white/28',
        compact ? 'size-10' : 'min-h-10 px-3.5 text-[13.5px]',
        className,
      )}
    >
      <Icone nom="points" taille={18} epaisseur={3.2} />
      {compact ? null : 'Menu'}
    </button>
  )
}

/** Le budget du mandat et le score, toujours visibles pendant la partie. */
export function Entete({ attenue }: { attenue?: boolean }) {
  const { mandat, apercu } = useJeu()
  const ville = useVille()
  const bilan = useBilan()
  const voyageurs = useScore()
  const { segments, total } = segmentsBudget(bilan, apercu)
  const resteAnime = useCompteur(bilan.reste)
  const voyageursAnimes = useCompteur(voyageurs, 1.1)
  const reste = libelleReste(Math.round(resteAnime), apercu)
  const { debut, fin } = MANDATS[mandat]
  const labelJauge = `Budget du mandat : ${n(bilan.bus)} M€ pour l'entretien des bus, ${n(bilan.projets + bilan.reports)} M€ de projets, ${reste.valeur} ${reste.texte}.`

  return (
    <header className={clsx('absolute inset-x-0 top-0 z-20 bg-rouge text-white transition-opacity', attenue && 'opacity-60')}>
      {/* Téléphone */}
      <div className="flex flex-col gap-2.5 rounded-b-[22px] px-4 pt-3.5 pb-3.5 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EtapesMandat mandat={mandat} />
            <span className="text-[13px] font-extrabold">
              {ville.nom}, mandat {mandat} sur 2
            </span>
            <span className="chiffres text-xs font-semibold opacity-80">
              {debut}-{fin}
            </span>
          </div>
          <BoutonMenu compact className="-my-2 -mr-1.5" />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <div className={clsx('flex items-baseline gap-1.5', reste.manque && 'text-encre')}>
              <span className="chiffres text-[32px] leading-none font-black tracking-tight">{reste.valeur}</span>
              <span className="text-sm font-extrabold">M€</span>
            </div>
            <div className="text-[12.5px] font-semibold opacity-90">{reste.texte.replace('M€ ', '')}</div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <motion.div
              key={voyageurs}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-rouge"
            >
              <Icone nom="voyageurs" taille={15} epaisseur={2.3} />
              <span className="chiffres text-sm font-black">+{n(voyageursAnimes)}</span>
            </motion.div>
            <div className="text-[11.5px] font-semibold opacity-90">voyageurs par jour</div>
          </div>
        </div>
        <Jauge segments={segments} total={total} surRouge label={labelJauge} />
      </div>

      {/* Ordinateur */}
      <div className="hidden h-24 items-center gap-9 px-7 lg:flex">
        <div className="flex w-[276px] shrink-0 items-center gap-3">
          <Logo taille={42} inverse />
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-black">
              {ville.nom}, mandat {mandat} sur 2
            </span>
            <div className="flex items-center gap-2">
              <EtapesMandat mandat={mandat} />
              <span className="chiffres text-[12.5px] font-semibold opacity-85">
                {debut}-{fin}
              </span>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-baseline justify-between gap-5">
            <div className={clsx('flex items-baseline gap-2 whitespace-nowrap', reste.manque && 'text-encre')}>
              <span className="chiffres text-[32px] leading-none font-black tracking-tight">{reste.valeur}</span>
              <span className="text-sm font-extrabold">{reste.texte}</span>
            </div>
            <div className="hidden gap-4 text-[12.5px] font-semibold whitespace-nowrap xl:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3.5 rounded-sm bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.8)_0_3px,rgba(255,255,255,0.3)_3px_6px)]" />
                Entretien des bus, {n(bilan.bus)}
              </span>
              {bilan.reliquat > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3.5 rounded-sm shadow-[inset_0_0_0_1.5px_#fff]" />
                  Report du mandat 1, +{n(bilan.reliquat)}
                </span>
              ) : null}
              {bilan.reports > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3.5 rounded-sm bg-[repeating-linear-gradient(135deg,#fff_0_3px,rgba(255,255,255,0.45)_3px_6px)]" />
                  Suite du mandat 1, {n(bilan.reports)}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3.5 rounded-sm bg-white" />
                Vos projets, {n(bilan.projets)}
              </span>
              {apercu > 0 ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3.5 rounded-sm bg-encre" />
                  Ce projet, {n(apercu)}
                </span>
              ) : null}
            </div>
          </div>
          <Jauge segments={segments} total={total} surRouge hauteur={14} label={labelJauge} />
        </div>
        <div className="flex w-[210px] shrink-0 flex-col items-end gap-1">
          <motion.div
            key={voyageurs}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className="flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-rouge"
          >
            <Icone nom="voyageurs" taille={18} epaisseur={2.3} />
            <span className="chiffres text-lg font-black">+{n(voyageursAnimes)}</span>
          </motion.div>
          <span className="text-[12.5px] font-semibold opacity-90">voyageurs gagnés par jour</span>
        </div>
        <BoutonMenu />
      </div>
    </header>
  )
}
