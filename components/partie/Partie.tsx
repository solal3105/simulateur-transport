'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import { useJeu, useVille } from '@/lib/store'

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
import { LEGENDE_MODES } from '@/lib/couleurs'

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
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-3 top-44 z-20 flex justify-center lg:top-auto lg:right-auto lg:bottom-24 lg:left-[358px] lg:justify-start"
    >
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

/** Les couleurs des projets par mode, et le réseau actuel en gris. */
function Legende() {
  return (
    <div
      aria-label="Légende de la carte"
      className="absolute top-[166px] left-3 z-10 flex max-w-[calc(100%-24px)] flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-white/95 px-3 py-2 text-[11.5px] font-bold shadow-flotte lg:top-auto lg:bottom-6 lg:left-[358px] lg:gap-x-4 lg:px-4 lg:py-3 lg:text-[12.5px]"
    >
      {LEGENDE_MODES.map((m) => (
        <span key={m.nom} className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 rounded-full" style={{ background: m.couleur }} />
          {m.nom}
        </span>
      ))}
      <span className="hidden items-center gap-1.5 text-gris lg:flex">
        <span className="w-4 border-t-2 border-dashed border-gris" />
        En pointillés : pas encore décidé
      </span>
      <span className="hidden items-center gap-1.5 text-gris lg:flex">
        <span className="h-1 w-4 rounded-full bg-[#958e84]" />
        Réseau actuel
      </span>
    </div>
  )
}

export function Partie() {
  const { panneau, brouillon, ecran, ouvrir, tracer, tuto: etapeTuto, lignes } = useJeu()
  const ville = useVille()
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
      <h1 className="sr-only">
        {ville.marque}, partie en cours à {ville.nom}
      </h1>
      <Carte marges={marges} />
      <Entete />
      {!tuto || etapeTuto === 2 ? <Programme /> : null}

      {!tuto && !panneau && !brouillon ? (
        <>
          <div className="absolute right-3 bottom-28 z-10 flex flex-col items-end gap-2 lg:top-[114px] lg:right-auto lg:bottom-auto lg:left-[358px] lg:flex-row">
            <Bouton genre="encre" iconeAGauche="trace" taille="petit" onClick={() => tracer('tram')} className="shadow-flotte">
              Créer ma ligne
            </Bouton>
            {/* Sans catalogue, la liste ne montre que les lignes tracées. */}
            {ville.catalogue || lignes.length > 0 ? (
              <Bouton
                genre="contour"
                iconeAGauche="liste"
                taille="petit"
                onClick={() => ouvrir({ type: 'liste' })}
                className="shadow-flotte"
              >
                {ville.catalogue ? 'Voir en liste' : 'Voir mes lignes'}
              </Bouton>
            ) : null}
          </div>
          <Legende />
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
