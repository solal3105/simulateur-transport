'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { publier, useProfilLocal } from '@/lib/communaute'
import { de, n } from '@/lib/format'
import { compacter, type PartiePartagee } from '@/lib/partie'
import { VILLES } from '@/lib/villes'
import type { Inspiration } from '@/lib/store'

import { Bouton, BoutonRond, Icone } from '../ui'
import { MiniCarte } from './MiniCarte'

const champ =
  'w-full rounded-[14px] bg-sable px-3.5 py-3 text-[15px] font-semibold text-encre outline-none placeholder:font-medium placeholder:text-muet focus-visible:shadow-[inset_0_0_0_2px_var(--color-encre)]'

/**
 * Publier son réseau dans la communauté, depuis le bilan : un titre, une phrase, un pseudo la première
 * fois, et qui peut le voir. Le serveur recalcule tout avant de l'enregistrer.
 */
export function Publier({
  partie,
  voyageurs,
  investi,
  inspire,
  fermer,
  publie,
}: {
  partie: PartiePartagee
  voyageurs: number
  investi: number
  inspire: Inspiration | null
  fermer: () => void
  publie: (id: string) => void
}) {
  const profil = useProfilLocal()
  const [titre, setTitre] = useState('')
  const [intention, setIntention] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [changerPseudo, setChangerPseudo] = useState(false)
  const [visibilite, setVisibilite] = useState<'publique' | 'lien'>('publique')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [resultat, setResultat] = useState<{ id: string; pseudo: string } | null>(null)
  const [copie, setCopie] = useState(false)
  const refTitre = useRef<HTMLInputElement>(null)

  useEffect(() => {
    refTitre.current?.focus({ preventScroll: true })
    const clavier = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    window.addEventListener('keydown', clavier)
    return () => window.removeEventListener('keydown', clavier)
  }, [fermer])

  const demanderPseudo = !profil || changerPseudo
  const nom = demanderPseudo ? pseudo.trim() : profil.pseudo

  const envoyer = async (e: FormEvent) => {
    e.preventDefault()
    if (titre.trim().length < 3) return setErreur('Donnez un titre d’au moins 3 caractères à votre réseau.')
    if (demanderPseudo && pseudo.trim().length < 2) return setErreur('Choisissez un pseudo d’au moins 2 caractères.')
    setEnvoi(true)
    setErreur(null)
    try {
      const r = await publier({
        titre: titre.trim(),
        intention: intention.trim(),
        visibilite,
        // Le pseudo connu localement est renvoyé : si le serveur a perdu le profil, il le recrée sous le même nom.
        pseudo: demanderPseudo ? pseudo.trim() : profil.pseudo,
        partie: compacter(partie),
        inspire_de: inspire?.id ?? null,
      })
      publie(r.id)
      setResultat({ id: r.id, pseudo: r.profil.pseudo })
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'La publication n’a pas abouti. Réessayez dans un instant.')
    } finally {
      setEnvoi(false)
    }
  }

  const copierLien = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/reseau/${id}`)
      setCopie(true)
    } catch {
      setCopie(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-encre/45 lg:items-center" onClick={fermer}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-publier"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-[560px] flex-col gap-4 overflow-y-auto rounded-t-[26px] bg-white px-5 pt-5 pb-7 lg:rounded-[26px] lg:px-7 lg:pt-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="titre-publier" className="text-[24px] leading-tight font-black tracking-tight">
            {resultat ? 'Votre réseau est publié' : 'Publier mon réseau'}
          </h2>
          <BoutonRond label="Fermer" icone="fermer" onClick={fermer} className="-mt-1 -mr-1.5" />
        </div>

        <div className="shrink-0 overflow-hidden rounded-[18px] shadow-[inset_0_0_0_1px_var(--color-trait)]">
          <div className="h-[150px]">
            <MiniCarte partie={compacter(partie)} />
          </div>
          <div className="chiffres flex justify-between gap-3 px-4 py-3 text-[13.5px] font-extrabold">
            <span className="text-rouge">+{n(voyageurs)} voyageurs par jour</span>
            <span>{n(investi)} M€</span>
          </div>
        </div>

        {resultat ? (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-gris">
              {visibilite === 'publique'
                ? `Il apparaît dans les réseaux publiés à ${VILLES[partie.ville].nom}, sous le nom ${resultat.pseudo}. D’autres joueurs peuvent le soutenir, le comparer au leur ou partir de lui pour leur partie.`
                : `Seules les personnes qui ont son lien peuvent le voir. Il n’apparaît dans aucune liste.`}
            </p>
            <Link
              href={`/reseau/${resultat.id}`}
              className="flex min-h-13 items-center justify-between gap-2.5 rounded-full bg-rouge px-5 text-[15px] font-extrabold text-white"
            >
              Voir la page de mon réseau
              <Icone nom="fleche" taille={19} epaisseur={2.3} />
            </Link>
            <Bouton genre="contour" icone="partager" onClick={() => void copierLien(resultat.id)}>
              {copie ? 'Lien copié' : 'Copier le lien de mon réseau'}
            </Bouton>
          </div>
        ) : (
          <form onSubmit={envoyer} className="flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-extrabold">Titre</span>
              <input
                ref={refTitre}
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                maxLength={60}
                required
                placeholder="Par exemple : L’est d’abord"
                className={champ}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-extrabold">En une phrase, pourquoi ce réseau ?</span>
              <textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Ce que vous avez voulu faire, en quelques mots. Facultatif."
                className={`${champ} resize-none leading-relaxed`}
              />
              <span className="chiffres text-[12.5px] text-gris">{intention.length} caractères sur 200</span>
            </label>

            {demanderPseudo ? (
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-extrabold">Votre pseudo</span>
                <input
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  maxLength={30}
                  placeholder="Il sera affiché avec votre réseau"
                  autoComplete="nickname"
                  className={champ}
                />
                <span className="text-[12.5px] leading-snug text-gris">
                  Pas de compte ni de mot de passe : ce navigateur se souvient de vous pour vos prochaines publications.
                </span>
              </label>
            ) : (
              <p className="flex flex-wrap items-center gap-x-2 text-[14px]">
                <span>
                  Publié sous le nom <b>{profil.pseudo}</b>.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPseudo(profil.pseudo)
                    setChangerPseudo(true)
                  }}
                  className="font-extrabold underline underline-offset-3"
                >
                  Changer de pseudo
                </button>
              </p>
            )}

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-extrabold">Qui peut le voir</legend>
              {(
                [
                  [
                    'publique',
                    'Tout le monde',
                    `Il apparaît dans les réseaux publiés à ${VILLES[partie.ville].nom}, et d’autres peuvent partir de lui pour leur partie.`,
                  ],
                  [
                    'lien',
                    'Seulement les personnes qui ont le lien',
                    'Pour le montrer à quelques proches, sans l’afficher dans les listes.',
                  ],
                ] as const
              ).map(([valeur, titreOption, detail]) => (
                <label
                  key={valeur}
                  className={`flex cursor-pointer items-start gap-3 rounded-[14px] px-3.5 py-3 ${visibilite === valeur ? 'shadow-[inset_0_0_0_2.5px_var(--color-rouge)]' : 'shadow-[inset_0_0_0_1.5px_var(--color-trait)]'}`}
                >
                  <input
                    type="radio"
                    name="visibilite"
                    value={valeur}
                    checked={visibilite === valeur}
                    onChange={() => setVisibilite(valeur)}
                    className="mt-1 size-4 accent-[var(--color-rouge)]"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-extrabold">{titreOption}</span>
                    <span className="text-[12.5px] leading-snug text-gris">{detail}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {inspire ? (
              <p className="text-[13.5px] leading-relaxed text-gris">
                Votre réseau part de « {inspire.titre} »{inspire.pseudo ? `, ${de(inspire.pseudo)}` : ''} : sa page le mentionnera.
              </p>
            ) : null}

            <p aria-live="polite" className="text-[14px] font-semibold text-rouge-fonce empty:hidden">
              {erreur ?? ''}
            </p>

            <div className="flex flex-col gap-2">
              <Bouton type="submit" genre="rouge" icone="partager" taille="grand" disabled={envoi}>
                {envoi ? 'Publication en cours' : nom ? `Publier sous le nom ${nom}` : 'Publier mon réseau'}
              </Bouton>
              <p className="text-center text-[12.5px] leading-snug text-gris">
                Vous pourrez le retirer à tout moment depuis sa page. Son score est recalculé par nos soins avant d’être publié.
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
