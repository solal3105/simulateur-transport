'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { communauteActive, lireReseau } from '@/lib/communaute'
import { lirePartie, type PartiePartagee } from '@/lib/lien'
import { useJeu } from '@/lib/store'

import { Bilan } from '../ecrans/Bilan'
import { Icone } from '../ui'
import { EnteteCommunaute } from './Communaute'
import type { Publication } from './EnTetePublication'

type Etat = { partie: PartiePartagee; publication: Publication } | 'introuvable' | 'erreur' | null

/** La page d'un réseau publié : son bilan animé, et de quoi le soutenir, le reprendre ou le comparer. */
export function ReseauPage({ id }: { id: string }) {
  const router = useRouter()
  const [etat, setEtat] = useState<Etat>(null)

  useEffect(() => {
    let actif = true
    // La partie du visiteur sert à la comparaison et à la reprise : on la relit ici aussi.
    void useJeu.persist.rehydrate()
    ;(async () => {
      try {
        const lu = communauteActive ? await lireReseau(id) : null
        const partie = lu ? await lirePartie(lu.reseau.partie) : null
        if (!actif) return
        if (!lu || !partie) return setEtat('introuvable')
        const r = lu.reseau
        setEtat({
          partie,
          publication: {
            id: r.id,
            titre: r.titre,
            intention: r.intention,
            auteur: r.auteur,
            soutiens: r.soutiens,
            reprises: r.reprises,
            creeLe: r.cree_le,
            source: lu.source,
          },
        })
      } catch {
        if (actif) setEtat('erreur')
      }
    })()
    return () => {
      actif = false
    }
  }, [id])

  if (etat && typeof etat === 'object') {
    return <Bilan partage={etat.partie} publication={etat.publication} quitter={() => router.push('/')} />
  }
  return (
    <div className="min-h-dvh bg-[#faf9f7]">
      <EnteteCommunaute />
      <main className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-5 pt-8 lg:px-8">
        {etat === null ? (
          <p className="text-[15px] text-gris" aria-live="polite">
            Chargement du réseau
          </p>
        ) : (
          <>
            <h1 className="text-[26px] font-black tracking-tight">
              {etat === 'introuvable' ? 'Ce réseau n’est plus publié' : 'Nous n’arrivons pas à afficher ce réseau'}
            </h1>
            <p className="max-w-[560px] text-[15px] leading-relaxed text-gris">
              {etat === 'introuvable'
                ? 'Son auteur l’a peut-être retiré, ou il a été masqué après plusieurs signalements.'
                : 'La communauté ne répond pas pour l’instant. Réessayez dans un moment.'}
            </p>
            <Link
              href="/communaute"
              className="flex min-h-13 items-center gap-2.5 rounded-full bg-rouge px-5 text-[15px] font-extrabold text-white"
            >
              Voir les autres réseaux
              <Icone nom="fleche" taille={19} epaisseur={2.3} />
            </Link>
          </>
        )}
      </main>
    </div>
  )
}
