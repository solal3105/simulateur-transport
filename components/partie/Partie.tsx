'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import { useJeu } from '@/lib/store'

import { Carte } from '../carte/Carte'
import { FicheProjet } from '../panneaux/FicheProjet'
import { Leviers } from '../panneaux/Leviers'
import { Liste } from '../panneaux/Liste'
import { Methode } from '../panneaux/Methode'
import { MaLigne, Traceur } from '../panneaux/Traceur'
import { Bouton, Icone } from '../ui'
import { Entete } from './Entete'
import { BarreBas, Programme } from './Programme'
import { Tutoriel } from './Tutoriel'

function useGrandEcran() {
  const [grand, setGrand] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const maj = () => setGrand(mq.matches)
    maj()
    mq.addEventListener('change', maj)
    return () => mq.removeEventListener('change', maj)
  }, [])
  return grand
}

function Message() {
  const { message, effacerMessage } = useJeu()
  useEffect(() => {
    if (!message) return
    const t = setTimeout(effacerMessage, 5000)
    return () => clearTimeout(t)
  }, [message, effacerMessage])
  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-3 top-44 z-20 flex justify-center lg:top-auto lg:right-auto lg:bottom-24 lg:left-[358px] lg:justify-start">
      <AnimatePresence>
        {message ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto flex max-w-[520px] items-center gap-2.5 rounded-2xl bg-encre py-2.5 pr-4 pl-2.5 text-white shadow-flotte"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-rouge">
              <Icone nom="valider" taille={16} epaisseur={3} />
            </span>
            <span className="text-[13.5px] leading-snug">
              <b>{message.titre}</b> {message.texte}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function Partie() {
  const { panneau, brouillon, ecran, ouvrir, tracer, tuto: etapeTuto } = useJeu()
  const grand = useGrandEcran()
  const tuto = ecran === 'tuto'

  const largeurPanneau = !panneau ? 0 : panneau.type === 'leviers' ? 1100 : panneau.type === 'liste' ? 2000 : 440
  const marges = useMemo(
    () =>
      grand
        ? { top: 96 + 20, left: 340 + 20, right: Math.min(largeurPanneau, 700) + 20, bottom: 80 }
        : { top: 170, left: 10, right: 10, bottom: panneau ? 380 : 100 },
    [grand, largeurPanneau, panneau],
  )

  return (
    <main className="fixed inset-0 overflow-hidden bg-sable" data-tuto={tuto ? etapeTuto : undefined}>
      <h1 className="sr-only">Simulateur TCL, partie en cours</h1>
      <Carte marges={marges} />
      <Entete />
      {!tuto || etapeTuto === 2 ? <Programme /> : null}

      {!tuto && !panneau && !brouillon ? (
        <>
          <div className="absolute right-3 bottom-28 z-10 flex flex-col items-end gap-2 lg:top-[114px] lg:right-auto lg:bottom-auto lg:left-[358px] lg:flex-row">
            <Bouton genre="encre" iconeAGauche="trace" taille="petit" onClick={() => tracer('tram')} className="shadow-flotte">
              Créer ma ligne
            </Bouton>
            <Bouton genre="contour" iconeAGauche="liste" taille="petit" onClick={() => ouvrir({ type: 'liste' })} className="shadow-flotte">
              Voir en liste
            </Bouton>
          </div>
          <div className="absolute bottom-6 left-[358px] z-10 hidden flex-wrap gap-4 rounded-2xl bg-white px-4 py-3 text-[12.5px] font-semibold shadow-flotte lg:flex">
            <span className="flex items-center gap-2">
              <span className="w-6 border-t-[2.5px] border-dashed border-encre" />
              Projet possible, avec son prix en M€
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-rouge" />
              Projet que vous construisez
            </span>
            <span className="flex items-center gap-2">
              <span className="flex w-6 gap-0.5">
                <span className="size-2 rounded-full bg-metro-a" />
                <span className="size-2 rounded-full bg-metro-b" />
                <span className="size-2 rounded-full bg-metro-c" />
                <span className="size-2 rounded-full bg-metro-d" />
              </span>
              Métro actuel, lignes A à D
            </span>
          </div>
        </>
      ) : null}

      {(!tuto || etapeTuto === 2) && !brouillon ? <BarreBas /> : null}
      <Message />

      <AnimatePresence>
        {panneau?.type === 'projet' ? <FicheProjet key={panneau.id} id={panneau.id} /> : null}
        {panneau?.type === 'leviers' ? <Leviers key="leviers" /> : null}
        {panneau?.type === 'liste' ? <Liste key="liste" /> : null}
        {panneau?.type === 'trace' ? <Traceur key="trace" /> : null}
        {panneau?.type === 'ligne' ? <MaLigne key="ligne" /> : null}
        {panneau?.type === 'methode' ? <Methode key="methode" /> : null}
      </AnimatePresence>

      {tuto ? <Tutoriel /> : null}
    </main>
  )
}
