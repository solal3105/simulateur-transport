'use client'

import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { LEGENDE_MODES } from '@/lib/couleurs'
import { useDonnees } from '@/lib/donnees'
import { useJeu, useVille } from '@/lib/store'
import { MARQUE } from '@/lib/villes'

import { Carte } from '../carte/Carte'
import { TraitReseau } from '../carte/TraitReseau'
import { useCouleursReseau } from '../couleurs'
import { Budget } from '../panneaux/Budget'
import { FicheProjet } from '../panneaux/FicheProjet'
import { Leviers } from '../panneaux/Leviers'
import { Liste } from '../panneaux/Liste'
import { Menu } from '../panneaux/Menu'
import { Methode } from '../panneaux/Methode'
import { hauteurFeuilleOuverte, useHauteurFenetre } from '../panneaux/Panneau'
import { FicheLigne, MaLigne, Traceur } from '../panneaux/Traceur'
import { Bouton, Icone, useGrandEcran } from '../ui'
import { Entete } from './Entete'
import { BarreBas, Programme } from './Programme'
import { Tutoriel } from './Tutoriel'

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
      className="pointer-events-none absolute inset-x-3 top-[104px] z-20 flex justify-center lg:top-auto lg:right-auto lg:bottom-24 lg:left-[358px] lg:justify-start"
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

/**
 * Les couleurs des projets par mode, et le réseau actuel dans les couleurs de ses lignes. Sans catalogue, ni bateau
 * ni projet à décider.
 */
function Legende() {
  const { catalogue, id } = useVille()
  const { modesCaches } = useJeu()
  return (
    <div
      aria-label="Légende de la carte"
      className="absolute top-[100px] left-2 z-10 flex max-w-[calc(100%-16px)] flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl bg-white/90 px-2 py-1 text-[10.5px] font-bold shadow-flotte lg:top-auto lg:bottom-6 lg:left-[358px] lg:gap-x-4 lg:rounded-2xl lg:px-4 lg:py-3 lg:text-[12.5px]"
    >
      {LEGENDE_MODES.filter((m) => catalogue || m.mode !== 'fluvial').map((m) => (
        <span key={m.nom} className={clsx('flex items-center gap-1 lg:gap-1.5', modesCaches.includes(m.mode) && 'line-through opacity-40')}>
          <span className="h-1 w-3 rounded-full lg:h-1.5 lg:w-4" style={{ background: m.couleur }} />
          {m.nom}
        </span>
      ))}
      {catalogue ? (
        <span className="hidden items-center gap-1.5 text-gris lg:flex">
          <span className="w-4 border-t-2 border-dashed border-gris" />
          En pointillés : pas encore décidé
        </span>
      ) : null}
      <span className="hidden items-center gap-1.5 text-gris lg:flex">
        <span className="relative flex h-3 w-6 items-center">
          <TraitReseau ville={id} className="h-1 w-6" />
          <span className="absolute left-2 size-2.5 rounded-full border-2 border-[#5d5852] bg-white" />
        </span>
        Réseau actuel et ses stations
      </span>
      <span className="hidden items-center gap-1.5 text-gris lg:flex">
        <span className="grid size-3.5 place-items-center rounded-full border-2 border-[#3f3a35] bg-white">
          <span className="size-1 rounded-full bg-[#3f3a35]" />
        </span>
        Gare
      </span>
    </div>
  )
}

/**
 * Le réglage de la carte, derrière un seul bouton discret : le fond en plan ou en photographies aériennes de l'IGN, les
 * familles de lignes à montrer, et la densité de population hors du tracé d'une ligne. Un bouton rond sous la légende
 * sur téléphone, où il reste visible pendant le tracé, et une étiquette sur ordinateur, à gauche du panneau ouvert.
 */
function Affichage({ droite }: { droite?: number }) {
  const { aerien, basculerAerien, modesCaches, basculerMode, densite, basculerDensite } = useJeu()
  const { catalogue, id } = useVille()
  const donnees = useDonnees(id)
  const [ouvert, setOuvert] = useState(false)
  const boite = useRef<HTMLDivElement>(null)
  // Les trains et le RER ne s'affichent que dans les réseaux qui en ont.
  const trains = Boolean(donnees?.reseau?.lignes.some((l) => l.mode === 'rer' || l.mode === 'train'))
  const familles = [
    ...LEGENDE_MODES.filter((m) => catalogue || m.mode !== 'fluvial'),
    ...(trains ? [{ nom: 'Trains et RER', couleur: '#5d5852', mode: 'train' as const }] : []),
  ]
  const filtre = modesCaches.length > 0 || densite

  useEffect(() => {
    if (!ouvert) return
    const dehors = (e: PointerEvent) => {
      if (!boite.current?.contains(e.target as Node)) setOuvert(false)
    }
    const echap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false)
    }
    document.addEventListener('pointerdown', dehors)
    document.addEventListener('keydown', echap)
    return () => {
      document.removeEventListener('pointerdown', dehors)
      document.removeEventListener('keydown', echap)
    }
  }, [ouvert])

  const choix = (actif: boolean) =>
    clsx(
      'flex min-h-9 items-center gap-2 rounded-full px-3 text-[13px] font-extrabold transition-colors',
      actif ? 'bg-encre text-white' : 'bg-sable text-encre hover:bg-trait',
    )

  return (
    <div
      ref={boite}
      style={droite !== undefined ? { right: droite } : undefined}
      className="absolute top-[134px] right-2 z-10 flex flex-col items-end gap-2 lg:top-[114px]"
    >
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        aria-controls="reglage-carte"
        title="Régler l’affichage de la carte"
        className={clsx(
          'relative grid size-9 place-items-center rounded-full shadow-flotte transition-colors lg:flex lg:size-auto lg:min-h-11 lg:gap-2 lg:px-4',
          ouvert || aerien ? 'bg-encre text-white' : 'bg-white text-encre hover:bg-sable',
        )}
      >
        <Icone nom="calques" taille={18} epaisseur={2.2} />
        <span className="sr-only text-sm font-extrabold lg:not-sr-only">Affichage</span>
        {/* Un point rouge rappelle qu'une partie des lignes est cachée, ou que la densité est affichée. */}
        {filtre ? <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-rouge" /> : null}
      </button>
      {ouvert ? (
        <div
          id="reglage-carte"
          role="group"
          aria-label="Affichage de la carte"
          className="flex w-[272px] flex-col gap-3.5 rounded-2xl bg-white p-4 shadow-flotte"
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-muet">Fond de carte</span>
            <div className="flex gap-1.5">
              <button type="button" aria-pressed={!aerien} onClick={() => aerien && basculerAerien()} className={choix(!aerien)}>
                Plan
              </button>
              <button type="button" aria-pressed={aerien} onClick={() => !aerien && basculerAerien()} className={choix(aerien)}>
                Photos aériennes
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-muet">Lignes affichées</span>
            <div className="flex flex-wrap gap-1.5">
              {familles.map((f) => {
                const montre = !modesCaches.includes(f.mode)
                return (
                  <button key={f.mode} type="button" aria-pressed={montre} onClick={() => basculerMode(f.mode)} className={choix(montre)}>
                    <span className="h-1.5 w-3.5 rounded-full" style={{ background: f.couleur, opacity: montre ? 1 : 0.45 }} />
                    {f.nom}
                  </button>
                )
              })}
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" checked={densite} onChange={basculerDensite} className="mt-0.5 size-4.5 shrink-0 accent-rouge" />
            <span className="flex flex-col gap-0.5">
              <span className="text-[13.5px] font-extrabold">Densité de population</span>
              <span className="text-xs leading-snug text-gris">
                Par carré de 200 mètres : plus le rouge est foncé, plus il y a d’habitants et d’emplois.
              </span>
            </span>
          </label>
        </div>
      ) : null}
    </div>
  )
}

export function Partie() {
  const { panneau, brouillon, ecran, ouvrir, tracer, tuto: etapeTuto, lignes } = useJeu()
  const ville = useVille()
  useCouleursReseau(ville.id)
  const grand = useGrandEcran()
  const tuto = ecran === 'tuto'

  const largeurPanneau = !panneau ? 0 : panneau.type === 'leviers' ? 1100 : panneau.type === 'liste' ? 2000 : 440
  // Sur téléphone, la carte cadre au-dessus de la feuille ouverte et de la barre du bas quand elle reste visible.
  const fenetre = useHauteurFenetre()
  const barre = !brouillon && !(tuto && etapeTuto < 2)
  const marges = useMemo(
    () =>
      grand
        ? { top: 96 + 20, left: 340 + 20, right: Math.min(largeurPanneau, 700) + 20, bottom: 80 }
        : { top: 120, left: 10, right: 10, bottom: panneau ? hauteurFeuilleOuverte(fenetre, barre) + 12 : 110 },
    [grand, largeurPanneau, panneau, fenetre, barre],
  )

  return (
    <main className="fixed inset-0 overflow-hidden bg-sable" data-tuto={tuto ? etapeTuto : undefined}>
      <h1 className="sr-only">
        {MARQUE}, partie en cours {ville.ou}
      </h1>
      <Carte marges={marges} />
      <Entete />
      {!tuto || etapeTuto >= 2 ? <Programme /> : null}
      {!tuto ? <Affichage droite={grand ? (panneau ? marges.right : 20) : undefined} /> : null}

      {!tuto && !panneau && !brouillon ? (
        <>
          <div className="absolute right-2 bottom-[68px] z-10 flex flex-row items-end gap-1.5 lg:top-[114px] lg:right-auto lg:bottom-auto lg:left-[358px] lg:gap-2">
            <Bouton
              genre="encre"
              iconeAGauche="trace"
              taille="petit"
              onClick={() => tracer('tram')}
              className="min-h-9! px-3! text-[12.5px]! shadow-flotte lg:min-h-11! lg:px-4! lg:text-sm!"
            >
              Créer ma ligne
            </Bouton>
            {/* Sans catalogue, la liste ne montre que les lignes tracées. */}
            {ville.catalogue || lignes.length > 0 ? (
              <Bouton
                genre="contour"
                iconeAGauche="liste"
                taille="petit"
                onClick={() => ouvrir({ type: 'liste' })}
                className="min-h-9! px-3! text-[12.5px]! shadow-flotte lg:min-h-11! lg:px-4! lg:text-sm!"
              >
                {ville.catalogue ? 'Voir en liste' : 'Voir mes lignes'}
              </Bouton>
            ) : null}
          </div>
          <Legende />
        </>
      ) : null}

      {(!tuto || etapeTuto >= 2) && !brouillon ? <BarreBas /> : null}
      <Message />

      <AnimatePresence>
        {panneau?.type === 'projet' ? <FicheProjet key={panneau.id} id={panneau.id} /> : null}
        {panneau?.type === 'leviers' ? <Leviers key="leviers" /> : null}
        {panneau?.type === 'liste' ? <Liste key="liste" /> : null}
        {panneau?.type === 'trace' ? <Traceur key="trace" /> : null}
        {panneau?.type === 'ligne' ? <MaLigne key="ligne" /> : null}
        {panneau?.type === 'ligne-joueur' ? <FicheLigne key={panneau.id} id={panneau.id} /> : null}
        {panneau?.type === 'methode' ? <Methode key="methode" /> : null}
        {panneau?.type === 'budget' ? <Budget key="budget" /> : null}
        {panneau?.type === 'menu' ? <Menu key="menu" /> : null}
      </AnimatePresence>

      {tuto ? <Tutoriel /> : null}
    </main>
  )
}
