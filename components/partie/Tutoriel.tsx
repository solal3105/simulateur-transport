'use client'

import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'

import { PROJETS } from '@/lib/catalogue'
import { n } from '@/lib/format'
import { ouverture, resoudre } from '@/lib/regles'
import { useJeu } from '@/lib/store'

import { Bouton, Icone } from '../ui'
import { useBilan } from './budget'

/**
 * Le tutoriel suit les gestes du joueur plutôt que de les décrire.
 * Étape 0 : toucher le T8 sur la carte. Étape 1 : la fiche guide depuis l'intérieur (voir FicheProjet).
 * Étape 2 : ce que la décision vient de changer, et la suite de la partie.
 */
export function Tutoriel() {
  const { tuto, finirTuto, chantiers } = useJeu()
  const bilan = useBilan()
  const dernier = chantiers.at(-1)
  const projet = dernier ? PROJETS.get(dernier.id) : undefined
  const r = projet && dernier ? resoudre(projet, dernier) : undefined

  return (
    <AnimatePresence mode="wait">
      {tuto === 0 ? (
        <Bulle key="0" position="bas">
          <Entete etape={1} onPasser={finirTuto} />
          <div className="flex items-start gap-3">
            <Pastille />
            <div className="flex flex-col gap-1">
              <h2 id="titre-tuto" className="text-lg leading-tight font-black lg:text-xl">
                Touchez le tramway T8, en noir sur la carte.
              </h2>
              <p className="text-[14.5px] leading-relaxed text-gris">
                Chaque pointillé est un projet réel, avec son prix écrit dessus. Le T8 relierait Vaulx-en-Velin à Vénissieux pour 245 M€.
              </p>
            </div>
          </div>
        </Bulle>
      ) : null}
      {tuto === 2 && projet && r && dernier ? (
        <Bulle key="2" position="haut">
          <Entete etape={3} />
          <div className="flex flex-col gap-2">
            <h2 id="titre-tuto" className="text-lg leading-tight font-black lg:text-xl">
              {r.voyageurs > 0
                ? `Bien joué : ${n(r.voyageurs)} voyageurs de plus par jour dès ${ouverture(dernier.mandat, r.duree)}.`
                : 'C’est lancé.'}
            </h2>
            <p className="text-[14.5px] leading-relaxed text-gris">
              Votre score, en haut à droite, a monté d’autant. Il vous reste {n(bilan.reste)} M€ sur ce mandat pour d’autres projets, ou
              pour tracer votre propre ligne.
            </p>
            <p className="text-[14.5px] leading-relaxed text-gris">
              Quand vous avez fini, terminez le mandat avec le bouton rouge : la partie passe alors à 2032.
            </p>
          </div>
          <Bouton genre="rouge" icone="fleche" onClick={finirTuto}>
            Continuer la partie
          </Bouton>
        </Bulle>
      ) : null}
    </AnimatePresence>
  )
}

function Bulle({ children, position }: { children: React.ReactNode; position: 'bas' | 'haut' }) {
  return (
    <motion.div
      role="dialog"
      aria-labelledby="titre-tuto"
      initial={{ opacity: 0, y: position === 'bas' ? 30 : -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: position === 'bas' ? 30 : -20, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={clsx(
        'absolute inset-x-3 z-40 flex flex-col gap-3.5 rounded-[22px] bg-white p-5 shadow-[0_16px_40px_rgb(0_0_0/0.2)]',
        position === 'bas' ? 'bottom-6' : 'bottom-28',
        'lg:inset-x-auto lg:right-10 lg:bottom-auto lg:w-[390px]',
        position === 'bas' ? 'lg:top-32' : 'lg:top-28',
      )}
    >
      {children}
    </motion.div>
  )
}

function Entete({ etape, onPasser }: { etape: number; onPasser?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex gap-1" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <span key={i} className={clsx('h-1.5 w-5.5 rounded-full transition-colors', i <= etape ? 'bg-rouge' : 'bg-trait')} />
          ))}
        </div>
        <span className="text-xs font-extrabold text-muet">Première décision, étape {etape} sur 3</span>
      </div>
      {onPasser ? (
        <button type="button" onClick={onPasser} className="min-h-10 text-[13px] font-extrabold text-gris underline underline-offset-3">
          Passer
        </button>
      ) : null}
    </div>
  )
}

function Pastille() {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-rouge-pale text-rouge">
      <span className="absolute inset-0 animate-ping rounded-full bg-rouge/20" aria-hidden="true" />
      <Icone nom="main" taille={23} epaisseur={2.2} />
    </span>
  )
}
