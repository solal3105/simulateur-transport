'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'

import { useJeu } from '@/lib/store'

import { Bouton, Icone, type NomIcone } from '../ui'

const ETAPES: { icone: NomIcone; titre: string; texte: string; action: string }[] = [
  {
    icone: 'main',
    titre: 'Chaque pointillé est un projet que la Métropole pourrait construire.',
    texte: 'Son prix est écrit dessus, en millions d’euros. Le tramway T8, en noir, coûte 245 M€. Dans la partie, touchez un projet pour voir ce qu’il apporte.',
    action: 'Suivant',
  },
  {
    icone: 'pieces',
    titre: 'Le bandeau rouge montre l’argent de votre mandat.',
    texte:
      'Vous disposez de 2 000 M€ par mandat, dont 400 M€ réservés d’office à l’entretien des bus. Chaque projet construit remplit la jauge. Si l’argent manque, vous pouvez le trouver en changeant les tarifs.',
    action: 'Suivant',
  },
  {
    icone: 'drapeau',
    titre: 'Quand vous avez fini, terminez le mandat.',
    texte:
      'Vous passez alors à 2032 pour le second mandat. Votre score est le nombre de voyageurs gagnés par jour, et vous pouvez aussi tracer votre propre ligne.',
    action: 'Commencer à jouer',
  },
]

export function Tutoriel() {
  const { tuto, etapeTuto, finirTuto } = useJeu()
  const etape = ETAPES[tuto] ?? ETAPES[0]!
  const derniere = tuto === ETAPES.length - 1

  return (
    <motion.div
      key={tuto}
      role="dialog"
      aria-labelledby="titre-tuto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'absolute inset-x-3 bottom-6 z-40 flex flex-col gap-3.5 rounded-[22px] bg-white p-5 shadow-[0_12px_32px_rgb(0_0_0/0.18)]',
        'lg:inset-x-auto lg:right-10 lg:bottom-auto lg:w-[380px]',
        tuto === 1 ? 'lg:top-28' : 'lg:top-64',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-1" aria-label={`Étape ${tuto + 1} sur ${ETAPES.length}`}>
          {ETAPES.map((_, i) => (
            <span key={i} className={clsx('h-1.5 w-5.5 rounded-full', i <= tuto ? 'bg-rouge' : 'bg-trait')} />
          ))}
        </div>
        {!derniere ? (
          <button type="button" onClick={finirTuto} className="min-h-10 text-[13.5px] font-extrabold text-gris underline underline-offset-3">
            Passer les explications
          </button>
        ) : null}
      </div>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-rouge-pale text-rouge">
          <Icone nom={etape.icone} taille={23} epaisseur={2.2} />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 id="titre-tuto" className="text-[19px] leading-tight font-black lg:text-[21px]">
            {etape.titre}
          </h2>
          <p className="text-[14.5px] leading-relaxed text-gris">{etape.texte}</p>
        </div>
      </div>
      <Bouton genre="rouge" icone="fleche" onClick={() => (derniere ? finirTuto() : etapeTuto(tuto + 1))}>
        {etape.action}
      </Bouton>
    </motion.div>
  )
}
