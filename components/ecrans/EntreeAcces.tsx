'use client'

import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { abandonnerDemande, estAdresse, PROFILS_JOUEUR, rejoindre, useDemandeAcces, type ProfilJoueur } from '@/lib/acces'

import { Bouton, BoutonRond, Icone } from '../ui'

/**
 * L'écran d'entrée dans l'accès anticipé, montré une seule fois, quand le joueur commence ou reprend sa première partie
 * dans ce navigateur. Il dit que le jeu est en construction et demande, en échange, l'adresse électronique du joueur et
 * son engagement à signaler bugs et améliorations. Il s'ouvre partout où une partie peut commencer : l'accueil, un
 * réseau reçu ou publié.
 */
export function EntreeAcces() {
  const demande = useDemandeAcces()
  const ouvert = demande !== null
  const [email, setEmail] = useState('')
  const [profil, setProfil] = useState<ProfilJoueur | null>(null)
  const [engage, setEngage] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const fenetre = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ouvert) return
    fenetre.current?.focus()
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && abandonnerDemande()
    window.addEventListener('keydown', touche)
    const defilement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', touche)
      document.body.style.overflow = defilement
    }
  }, [ouvert])

  const entrer = async (e: FormEvent) => {
    e.preventDefault()
    if (envoi || !demande) return
    const adresse = email.trim().toLowerCase()
    if (!estAdresse(adresse)) return setErreur('Cette adresse électronique ne semble pas complète.')
    if (!engage) return setErreur('Cochez l’engagement pour entrer dans le jeu.')
    setEnvoi(true)
    setErreur(null)
    const probleme = await rejoindre(adresse, profil, demande.ville)
    setEnvoi(false)
    if (probleme) setErreur(probleme)
  }

  return (
    <AnimatePresence>
      {ouvert ? (
        <motion.div
          key="entree-acces"
          className="fixed inset-0 z-50 flex items-end justify-center bg-encre/50 lg:items-center lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={abandonnerDemande}
        >
          <motion.div
            ref={fenetre}
            role="dialog"
            aria-modal="true"
            aria-labelledby="entree-titre"
            tabIndex={-1}
            className="flex max-h-[94dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[28px] bg-white text-encre outline-none lg:rounded-[28px]"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto">
              <div className="flex flex-col gap-3 bg-rouge px-6 pt-6 pb-6 text-white lg:px-9 lg:pt-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-black tracking-wide uppercase">
                    Accès anticipé
                  </span>
                  <BoutonRond
                    label="Fermer"
                    icone="fermer"
                    onClick={abandonnerDemande}
                    className="-mt-1 -mr-1 bg-white/15 text-white hover:bg-white/25"
                  />
                </div>
                <h2 id="entree-titre" className="text-[30px] leading-[1.02] font-black tracking-[-0.03em] lg:text-[40px]">
                  Rejoignez l’accès anticipé
                </h2>
                <p className="text-[15.5px] leading-snug font-semibold opacity-95">
                  Le jeu est ouvert à tous, mais il est encore en construction : vous tomberez peut-être sur des bugs, et certains chiffres
                  peuvent encore changer.
                </p>
              </div>

              <form onSubmit={entrer} noValidate className="flex flex-col gap-5 px-6 pt-6 lg:px-9">
                <div className="flex flex-col gap-3.5">
                  <h3 className="text-[20px] font-black tracking-tight">En échange, deux choses</h3>
                  <div className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rouge-pale text-rouge">
                      <Icone nom="bug" taille={21} epaisseur={2.1} />
                    </span>
                    <p className="text-[15px] leading-relaxed">
                      Vous nous signalez les bugs que vous trouvez et les améliorations que vous souhaitez, avec le bouton{' '}
                      <span
                        className="inline-grid size-6 translate-y-[5px] place-items-center rounded-full bg-rouge text-white"
                        aria-hidden="true"
                      >
                        <Icone nom="bug" taille={15} epaisseur={2.3} />
                      </span>{' '}
                      « Bug ou amélioration », en haut de l’écran de jeu.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rouge-pale text-rouge">
                      <Icone nom="lettre" taille={21} epaisseur={2.1} />
                    </span>
                    <p className="text-[15px] leading-relaxed">
                      Vous nous laissez votre adresse électronique, pour que nous puissions revenir vers vous sur un signalement et vous
                      prévenir des nouvelles versions.
                    </p>
                  </div>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[14.5px] font-extrabold">Votre adresse électronique</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErreur(null)
                    }}
                    placeholder="prenom@exemple.fr"
                    className="min-h-13 rounded-2xl bg-sable px-4 text-[16px] font-semibold text-encre outline-none placeholder:font-medium placeholder:text-muet focus-visible:ring-3 focus-visible:ring-rouge/40"
                  />
                </label>

                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-[14.5px] font-extrabold">
                    Vous êtes <span className="font-semibold text-gris">(facultatif)</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {PROFILS_JOUEUR.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={profil === p.id}
                        onClick={() => setProfil(profil === p.id ? null : p.id)}
                        className={clsx(
                          'min-h-10 rounded-full px-3.5 text-[14px] font-extrabold transition-colors',
                          profil === p.id
                            ? 'bg-encre text-white'
                            : 'bg-white text-encre shadow-[inset_0_0_0_1.5px_var(--color-trait)] hover:shadow-[inset_0_0_0_1.5px_var(--color-muet)]',
                        )}
                      >
                        {p.nom}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="flex items-start gap-3 rounded-2xl bg-rouge-pale p-4 text-[15px] leading-snug font-extrabold">
                  <input
                    type="checkbox"
                    checked={engage}
                    onChange={(e) => {
                      setEngage(e.target.checked)
                      setErreur(null)
                    }}
                    className="mt-px size-[22px] shrink-0 accent-rouge"
                  />
                  Je signalerai les bugs que je trouve et les améliorations que je souhaite.
                </label>

                <p className="text-[13px] leading-relaxed text-gris">
                  Nous gardons votre adresse le temps de l’accès anticipé, pour vous écrire à propos du jeu. Elle n’est jamais publiée ni
                  partagée, et vous pouvez la faire effacer à tout moment : tout est expliqué dans{' '}
                  <Link href="/mentions-legales#donnees" className="font-bold text-encre underline underline-offset-2">
                    les mentions légales
                  </Link>
                  .
                </p>

                {/* Le bouton reste en bas de la fenêtre pendant qu'on la fait défiler, avec le message qui dit ce qui manque. */}
                <div className="sticky bottom-0 -mx-6 flex flex-col gap-2 border-t border-trait bg-white px-6 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] lg:-mx-9 lg:px-9 lg:pb-5">
                  <p aria-live="polite" className="text-[14.5px] leading-snug font-extrabold text-rouge-fonce empty:hidden">
                    {erreur ?? ''}
                  </p>
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
                    <Bouton
                      type="submit"
                      genre="rouge"
                      icone="fleche"
                      taille="grand"
                      disabled={envoi}
                      className="w-full shrink-0 lg:w-[280px]"
                    >
                      {envoi ? 'Un instant' : 'Entrer dans le jeu'}
                    </Bouton>
                    <p className="text-center text-[13px] leading-snug font-semibold text-gris lg:text-left">
                      Ce navigateur s’en souviendra : cet écran ne s’affiche qu’une fois.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
