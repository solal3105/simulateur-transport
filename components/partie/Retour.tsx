'use client'

import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react'

import { useAdresseInscrite } from '@/lib/acces'
import { mandatsJoues } from '@/lib/catalogue'
import { communauteActive, envoyerRetour } from '@/lib/communaute'
import { compacter } from '@/lib/partie'
import { useJeu } from '@/lib/store'

import { Bouton, BoutonRond, Icone } from '../ui'

/**
 * Le signalement d'un bug ou d'une amélioration, que les joueurs de l'accès anticipé s'engagent à nous faire. Le
 * bouton est dans l'en-tête de la partie, dans son menu et au bilan ; la fenêtre joint au message l'écran où en
 * était le joueur, sa partie et son navigateur, pour qu'on puisse reproduire ce qu'il a vu.
 */

let ouvert = false
const abonnes = new Set<() => void>()
const changer = (valeur: boolean) => {
  ouvert = valeur
  abonnes.forEach((f) => f())
}
const abonner = (f: () => void) => {
  abonnes.add(f)
  return () => {
    abonnes.delete(f)
  }
}

/** Ouvre la fenêtre de signalement, d'où qu'on soit dans le jeu. */
export const ouvrirRetour = () => changer(true)

const TEXTES = {
  bug: {
    nom: 'Un bug',
    detail: 'Quelque chose ne marche pas, s’affiche mal ou donne un chiffre qui paraît faux.',
    question: 'Que s’est-il passé ?',
    aide: 'Ce que vous faisiez, ce qui s’est passé, et ce que vous attendiez.',
    envoyer: 'Envoyer le bug',
    merci: 'Merci, votre bug est enregistré',
  },
  amelioration: {
    nom: 'Une amélioration',
    detail: 'Une idée, un manque, ce qui rendrait le jeu plus clair ou plus juste.',
    question: 'Que proposez-vous ?',
    aide: 'Ce qui vous manque, et à quoi cela vous servirait.',
    envoyer: 'Envoyer l’amélioration',
    merci: 'Merci, votre amélioration est enregistrée',
  },
} as const
type Type = keyof typeof TEXTES

/** Où en était le joueur, et sa partie au format des liens de partage. */
function etatDuJeu() {
  const s = useJeu.getState()
  return {
    contexte: {
      ecran: s.ecran,
      panneau: s.panneau,
      trace: s.brouillon ? { mode: s.brouillon.mode, points: s.brouillon.arrets.length } : null,
      ville: s.ville,
      mandat: s.mandat,
      libre: s.libre,
      tuto: s.tuto,
      page: window.location.pathname,
      fenetre: `${window.innerWidth}×${window.innerHeight}`,
    },
    partie: compacter({
      ville: s.ville,
      libre: s.libre,
      mandats: mandatsJoues(s.mandat),
      chantiers: s.chantiers,
      lignes: s.lignes,
      leviers: s.leviers,
    }),
  }
}

/** Le bouton qui ouvre la fenêtre : rond sur téléphone, avec son nom sur grand écran. */
export function BoutonRetour({ forme, className }: { forme: 'rond' | 'pastille'; className?: string }) {
  if (forme === 'rond') {
    return (
      <button
        type="button"
        aria-label="Signaler un bug ou proposer une amélioration"
        title="Bug ou amélioration"
        onClick={ouvrirRetour}
        className={clsx(
          'grid size-10 shrink-0 place-items-center rounded-full bg-white text-rouge transition-colors hover:bg-rouge-pale',
          className,
        )}
      >
        <Icone nom="bug" taille={21} epaisseur={2.2} />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={ouvrirRetour}
      className={clsx(
        'flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-white pr-4 pl-3 text-[14px] font-black text-encre transition-colors hover:bg-rouge-pale',
        className,
      )}
    >
      <Icone nom="bug" taille={19} epaisseur={2.2} className="text-rouge" />
      Bug ou amélioration
    </button>
  )
}

/** La fenêtre de signalement, montée une fois pour tout le jeu. */
export function Retour() {
  const estOuvert = useSyncExternalStore(
    abonner,
    () => ouvert,
    () => false,
  )
  const adresse = useAdresseInscrite()
  const [type, setType] = useState<Type | null>(null)
  const [texte, setTexte] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [numero, setNumero] = useState<number | null>(null)
  const fenetre = useRef<HTMLDivElement>(null)

  const recommencer = () => {
    setType(null)
    setTexte('')
    setErreur(null)
    setNumero(null)
  }
  const fermer = () => {
    changer(false)
    // Après un envoi, la fenêtre se rouvrira vide ; un message commencé reste là si on la referme sans l'envoyer.
    if (numero !== null) recommencer()
  }

  useEffect(() => {
    if (!estOuvert) return
    fenetre.current?.focus()
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && changer(false)
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  }, [estOuvert])

  const envoyer = async (e: FormEvent) => {
    e.preventDefault()
    if (envoi) return
    if (!type) return setErreur('Dites-nous d’abord s’il s’agit d’un bug ou d’une amélioration.')
    if (texte.trim().length < 10) return setErreur('Décrivez-le en quelques mots de plus.')
    if (!communauteActive) return setErreur('Les signalements ne sont pas encore reliés à notre serveur.')
    setEnvoi(true)
    setErreur(null)
    try {
      const { contexte, partie } = etatDuJeu()
      const r = await envoyerRetour({ type, texte: texte.trim(), contexte, partie, navigateur: navigator.userAgent.slice(0, 300) })
      setNumero(r.id)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'L’envoi n’a pas abouti. Réessayez dans un instant.')
    } finally {
      setEnvoi(false)
    }
  }

  const t = type ? TEXTES[type] : null
  const precision = adresse ? ` S’il nous manque une précision, nous vous écrirons à ${adresse}.` : ''

  return (
    <AnimatePresence>
      {estOuvert ? (
        <motion.div
          key="retour"
          className="fixed inset-0 z-50 flex items-end justify-center bg-encre/50 lg:items-center lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={fermer}
        >
          <motion.div
            ref={fenetre}
            role="dialog"
            aria-modal="true"
            aria-labelledby="retour-titre"
            tabIndex={-1}
            className="flex max-h-[92dvh] w-full max-w-[600px] flex-col overflow-y-auto rounded-t-[28px] bg-white px-5 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] text-encre outline-none lg:rounded-[28px] lg:px-8 lg:pt-7 lg:pb-8"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {numero !== null && t ? (
              <div className="flex flex-col gap-4">
                <span className="grid size-14 place-items-center rounded-2xl bg-rouge text-white">
                  <Icone nom="valider" taille={28} epaisseur={2.6} />
                </span>
                <h2 id="retour-titre" className="text-[26px] leading-[1.08] font-black tracking-[-0.02em]">
                  {t.merci}
                </h2>
                <p className="text-[15.5px] leading-relaxed text-gris">
                  Il porte le numéro {numero}.{precision}
                </p>
                <div className="flex flex-col gap-2 lg:flex-row">
                  <Bouton genre="rouge" icone="fleche" onClick={fermer} className="lg:w-[260px]">
                    Revenir au jeu
                  </Bouton>
                  <Bouton genre="contour" onClick={recommencer}>
                    Envoyer autre chose
                  </Bouton>
                </div>
              </div>
            ) : (
              <form onSubmit={envoyer} noValidate className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 id="retour-titre" className="text-[24px] leading-[1.08] font-black tracking-[-0.02em] lg:text-[28px]">
                    Signaler un bug ou proposer une amélioration
                  </h2>
                  <BoutonRond label="Fermer" icone="fermer" onClick={fermer} />
                </div>

                <fieldset className="grid gap-2 sm:grid-cols-2">
                  <legend className="sr-only">Ce que vous nous envoyez</legend>
                  {(Object.keys(TEXTES) as Type[]).map((cle) => (
                    <button
                      key={cle}
                      type="button"
                      aria-pressed={type === cle}
                      onClick={() => {
                        setType(cle)
                        setErreur(null)
                      }}
                      className={clsx(
                        'flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition-colors',
                        type === cle ? 'bg-encre text-white' : 'bg-sable text-encre hover:bg-trait',
                      )}
                    >
                      <span className="flex items-center gap-2 text-[16.5px] font-black">
                        <Icone
                          nom={cle === 'bug' ? 'bug' : 'ampoule'}
                          taille={20}
                          epaisseur={2.2}
                          className={type === cle ? '' : 'text-rouge'}
                        />
                        {TEXTES[cle].nom}
                      </span>
                      <span className={clsx('text-[13.5px] leading-snug', type === cle ? 'text-white/85' : 'text-gris')}>
                        {TEXTES[cle].detail}
                      </span>
                    </button>
                  ))}
                </fieldset>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[14.5px] font-extrabold">{t ? t.question : 'Votre message'}</span>
                  {t ? <span className="text-[13.5px] leading-snug text-gris">{t.aide}</span> : null}
                  <textarea
                    rows={5}
                    value={texte}
                    maxLength={2000}
                    onChange={(e) => {
                      setTexte(e.target.value)
                      setErreur(null)
                    }}
                    className="resize-none rounded-2xl bg-sable px-4 py-3 text-[15.5px] leading-relaxed text-encre outline-none focus-visible:ring-3 focus-visible:ring-rouge/40"
                  />
                </label>

                <div className="flex gap-2.5 rounded-2xl bg-sable px-4 py-3 text-[13.5px] leading-snug text-gris">
                  <Icone nom="info" taille={18} epaisseur={2.2} className="mt-px shrink-0" />
                  <p>
                    Nous joignons l’écran où vous êtes, votre partie en cours et le nom de votre navigateur, pour voir ce que vous avez vu.
                    {precision}
                  </p>
                </div>

                <p aria-live="polite" className="text-[14.5px] leading-snug font-extrabold text-rouge-fonce empty:hidden">
                  {erreur ?? ''}
                </p>

                <Bouton type="submit" genre="rouge" icone="fleche" taille="grand" disabled={envoi}>
                  {envoi ? 'Envoi en cours' : t ? t.envoyer : 'Envoyer'}
                </Bouton>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
