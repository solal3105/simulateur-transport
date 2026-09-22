'use client'

import { motion } from 'motion/react'

import { CATALOGUE, ENVELOPPE } from '@/lib/catalogue'
import { n } from '@/lib/format'
import { totauxCatalogue } from '@/lib/regles'
import { useJeu } from '@/lib/store'

import { cascade } from '../anim'
import { Carte } from '../carte/Carte'
import { Bouton, Logo } from '../ui'

const TOTAL = totauxCatalogue(CATALOGUE.filter((p) => p.trace))
const MARGES = { top: 20, left: 20, right: 20, bottom: 20 }

function Etapes() {
  const etapes = [
    'Vous choisissez des lignes sur la carte.',
    'Vous finissez chaque mandat sans déficit.',
    'Votre score est le nombre de voyageurs gagnés.',
  ]
  return (
    <motion.ol variants={cascade.parent} className="flex flex-col gap-2.5 lg:gap-3">
      {etapes.map((e, i) => (
        <motion.li
          variants={cascade.enfant}
          key={e}
          className="flex items-center gap-3 text-[15px] leading-snug font-semibold lg:text-[17px]"
        >
          <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-white text-[13px] font-black text-rouge lg:size-7.5">
            {i + 1}
          </span>
          {e}
        </motion.li>
      ))}
    </motion.ol>
  )
}

export function Accueil() {
  const commencer = useJeu((s) => s.commencer)
  const milliards = Math.floor(TOTAL.cout / 1000)

  return (
    <main className="min-h-dvh bg-rouge text-white lg:fixed lg:inset-0 lg:bg-sable">
      <motion.div
        variants={cascade.parent}
        initial="hidden"
        animate="show"
        className="flex min-h-dvh flex-col gap-5 px-6 pt-5 pb-7 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[640px] lg:gap-7 lg:rounded-r-[36px] lg:bg-rouge lg:px-14 lg:pt-10 lg:pb-12"
      >
        <motion.div variants={cascade.enfant} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo taille={38} inverse />
            <span className="text-[15px] font-extrabold lg:text-[17px]">Simulateur TCL</span>
          </div>
          <a href="#sources" className="text-[13px] font-bold underline underline-offset-3 lg:text-sm">
            D’où viennent les chiffres
          </a>
        </motion.div>

        <motion.div variants={cascade.enfant} className="flex flex-col gap-3 lg:mt-6 lg:gap-5">
          <h1 className="text-[44px] leading-[0.95] font-black tracking-[-0.035em] text-balance lg:text-[72px] lg:leading-[0.93]">
            Construisez le réseau TCL de 2038.
          </h1>
          <p className="max-w-[500px] text-base leading-relaxed font-medium lg:text-[19px]">
            Vous dirigez les transports de la Métropole pendant deux mandats, avec {n((ENVELOPPE * 2) / 1000)} milliards d’euros. Les{' '}
            {CATALOGUE.filter((p) => p.trace).length} projets sur la table en coûtent plus de {milliards}. Vous choisissez ceux qui verront
            le jour.
          </p>
        </motion.div>

        {/* Une seule carte : une vignette sur téléphone, le fond de l'écran sur ordinateur. */}
        <div
          aria-hidden="true"
          className="relative h-[230px] shrink-0 overflow-hidden rounded-[20px] bg-sable lg:fixed lg:inset-y-0 lg:right-0 lg:left-[640px] lg:h-auto lg:rounded-none"
        >
          <Carte marges={MARGES} decor />
          <div className="absolute top-2.5 left-2.5 flex gap-1.5 lg:hidden">
            <span className="rounded-full bg-encre px-2.5 py-1 text-xs font-extrabold text-white">22 projets réels</span>
            <span className="chiffres rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-encre shadow-[inset_0_0_0_1.5px_var(--color-encre)]">
              {n(TOTAL.cout)} M€ au total
            </span>
          </div>
        </div>

        <Etapes />

        <motion.div variants={cascade.enfant} className="mt-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          <Bouton genre="blanc" icone="fleche" taille="grand" onClick={commencer} className="w-full lg:w-[300px]">
            Commencer la partie
          </Bouton>
          <p className="text-center text-[13px] leading-snug font-semibold opacity-90 lg:text-left lg:text-sm">
            Sans compte. Votre partie reste dans ce navigateur.
          </p>
        </motion.div>

        <section
          id="sources"
          className="flex flex-col gap-2 border-t border-white/30 pt-5 text-[13px] leading-relaxed opacity-95 lg:hidden"
        >
          <Sources />
        </section>
      </motion.div>
      <section className="sr-only lg:not-sr-only lg:absolute lg:right-6 lg:bottom-6 lg:w-[420px] lg:rounded-2xl lg:bg-white lg:p-4 lg:text-[12.5px] lg:leading-relaxed lg:text-gris lg:shadow-flotte">
        <Sources />
      </section>
    </main>
  )
}

function Sources() {
  return (
    <p>
      Les coûts, les voyageurs et les durées de chantier viennent d’études et de délibérations publiques ; ce sont des estimations, pas des
      devis signés. La carte utilise OpenStreetMap, et le traceur de ligne les données de population et d’emploi de l’INSEE. Projet citoyen,
      sous licence CC BY-NC 4.0.
    </p>
  )
}
