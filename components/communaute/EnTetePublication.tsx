'use client'

import { clsx } from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { profilLocal, retirer, signaler, soutenir, soutiensLocaux, type Motif } from '@/lib/communaute'
import { de, n } from '@/lib/format'
import { useJeu } from '@/lib/store'

import { Bouton, Icone } from '../ui'

/** Ce qu'on sait d'un réseau publié, en plus de la partie elle-même. */
export interface Publication {
  id: string
  titre: string
  intention: string | null
  auteur: { id: string; pseudo: string } | null
  soutiens: number
  reprises: number
  creeLe: string
  source: { id: string; titre: string; pseudo: string } | null
}

const date = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

/** Le haut de la page d'un réseau publié : qui l'a fait, pourquoi, et le bouton pour le soutenir. */
export function EnTetePublication({ publication }: { publication: Publication }) {
  const [soutiens, setSoutiens] = useState(publication.soutiens)
  const [soutenu, setSoutenu] = useState(() => soutiensLocaux().has(publication.id))
  const [envoi, setEnvoi] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const estAuteur = profilLocal()?.id === publication.auteur?.id

  const basculer = async () => {
    setEnvoi(true)
    setMessage(null)
    try {
      const r = await soutenir(publication.id, !soutenu)
      setSoutiens(r.soutiens)
      setSoutenu(r.soutenu)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Le soutien n’a pas été enregistré. Réessayez dans un instant.')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[13.5px] font-bold text-gris">
        Publié par {publication.auteur?.pseudo ?? 'un joueur'}, le {date(publication.creeLe)}
      </span>
      <h1 className="text-[30px] leading-[1.02] font-black tracking-[-0.025em] text-balance lg:text-[38px]">{publication.titre}</h1>
      {publication.intention ? <p className="text-[15.5px] leading-relaxed text-gris">{publication.intention}</p> : null}
      {publication.source ? (
        <p className="text-[14px] leading-relaxed text-gris">
          Inspiré de{' '}
          <Link href={`/reseau/${publication.source.id}`} className="font-extrabold text-encre underline underline-offset-3">
            « {publication.source.titre} »
          </Link>
          {publication.source.pseudo ? `, ${de(publication.source.pseudo)}` : ''}.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {estAuteur ? (
          <span className="chiffres text-[14px] font-extrabold">
            {n(soutiens)} soutien{soutiens > 1 ? 's' : ''}
          </span>
        ) : (
          <button
            type="button"
            aria-pressed={soutenu}
            disabled={envoi}
            onClick={() => void basculer()}
            className={clsx(
              'flex min-h-11 items-center gap-2 rounded-full px-4.5 text-[14.5px] font-extrabold transition-colors disabled:opacity-60',
              soutenu ? 'bg-rouge-pale text-rouge-fonce' : 'bg-rouge text-white hover:bg-rouge-fonce',
            )}
          >
            <Icone nom="valider" taille={17} epaisseur={2.8} />
            <span className="chiffres">
              {soutenu ? 'Vous le soutenez' : 'Soutenir ce réseau'} · {n(soutiens)}
            </span>
          </button>
        )}
        <span className="chiffres flex items-center gap-1.5 text-[13.5px] font-bold text-gris">
          <Icone nom="rejouer" taille={15} />
          Repris {n(publication.reprises)} fois
        </span>
      </div>
      <p aria-live="polite" className="text-[13.5px] font-semibold text-rouge-fonce empty:hidden">
        {message ?? ''}
      </p>
    </div>
  )
}

/** En bas de la page : signaler un réseau, ou le retirer quand on en est l'auteur. */
export function PiedPublication({ publication }: { publication: Publication }) {
  const router = useRouter()
  const [ouvert, setOuvert] = useState<'signaler' | 'retirer' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)
  const estAuteur = profilLocal()?.id === publication.auteur?.id

  const envoyerSignalement = async (motif: Motif) => {
    setEnvoi(true)
    try {
      await signaler(publication.id, motif)
      setOuvert(null)
      setMessage('Merci. Au troisième signalement, un réseau est masqué en attendant une vérification.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Le signalement n’a pas été envoyé.')
    } finally {
      setEnvoi(false)
    }
  }

  const retirerReseau = async () => {
    setEnvoi(true)
    try {
      await retirer(publication.id)
      // La partie qui avait publié ce réseau peut le publier à nouveau.
      if (useJeu.getState().publie === publication.id) useJeu.setState({ publie: null })
      router.push('/communaute')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Le retrait n’a pas abouti.')
      setEnvoi(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-trait pt-4">
      {ouvert === 'signaler' ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-[14px] font-extrabold">Pourquoi signalez-vous ce réseau ?</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['propos', 'Son titre ou sa phrase sont déplacés'],
                ['triche', 'Son score me paraît truqué'],
                ['autre', 'Une autre raison'],
              ] as const
            ).map(([motif, libelle]) => (
              <Bouton key={motif} genre="contour" taille="petit" disabled={envoi} onClick={() => void envoyerSignalement(motif)}>
                {libelle}
              </Bouton>
            ))}
            <Bouton genre="sable" taille="petit" onClick={() => setOuvert(null)}>
              Ne pas signaler
            </Bouton>
          </div>
        </div>
      ) : ouvert === 'retirer' ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-[14px] leading-relaxed">
            Ce réseau disparaîtra de la communauté, et son lien ne mènera plus nulle part. Vous ne pourrez pas le récupérer.
          </p>
          <div className="flex flex-wrap gap-2">
            <Bouton genre="rouge" taille="petit" disabled={envoi} onClick={() => void retirerReseau()}>
              Retirer mon réseau
            </Bouton>
            <Bouton genre="contour" taille="petit" onClick={() => setOuvert(null)}>
              Le garder
            </Bouton>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-bold text-gris">
          <Link href="/communaute" className="underline underline-offset-3">
            Voir les autres réseaux
          </Link>
          {estAuteur ? (
            <button type="button" onClick={() => setOuvert('retirer')} className="underline underline-offset-3">
              Retirer ce réseau
            </button>
          ) : (
            <button type="button" onClick={() => setOuvert('signaler')} className="underline underline-offset-3">
              Signaler ce réseau
            </button>
          )}
        </div>
      )}
      <p aria-live="polite" className="text-[13.5px] leading-relaxed text-gris empty:hidden">
        {message ?? ''}
      </p>
    </div>
  )
}
