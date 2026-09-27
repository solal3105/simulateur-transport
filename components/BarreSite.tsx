'use client'

import { clsx } from 'clsx'
import Link from 'next/link'
import { useEffect } from 'react'

import { communauteActive } from '@/lib/communaute'
import { useJeu } from '@/lib/store'
import { adresseAccueil, adresseMethode, adresseReseaux, MARQUE, type IdVille } from '@/lib/villes'

import { Icone, Logo } from './ui'

/** La page du site où l'on se trouve, soulignée dans la barre. */
export type PageSite = 'accueil' | 'reseaux' | 'methode' | 'autre'

/**
 * La barre du haut de toutes les pages hors de la partie, la même partout : le nom du site, qui ramène à l'accueil du
 * réseau, les réseaux publiés, la façon dont nous calculons, et de quoi jouer ou reprendre sa partie. La page où l'on
 * se trouve est soulignée ; sur l'accueil, le bouton pour jouer laisse la place à celui de la page.
 */
export function BarreSite({ ville, page }: { ville?: IdVille; page: PageSite }) {
  const enCours = useJeu((s) => s.ecran !== 'accueil')
  const villePartie = useJeu((s) => s.ville)
  // Hors de la partie, la partie enregistrée n'est pas encore relue : on la relit une fois pour savoir s'il y en a une.
  useEffect(() => {
    if (!useJeu.persist.hasHydrated()) void useJeu.persist.rehydrate()
  }, [])
  const reseau = ville ?? villePartie
  const lien =
    'flex min-h-9 items-center rounded-full px-3 text-[13px] font-extrabold transition-colors lg:min-h-10 lg:px-3.5 lg:text-[13.5px]'
  const actif = (p: PageSite) => (page === p ? 'bg-white/20' : 'hover:bg-white/12')
  return (
    <div className="flex items-center justify-between gap-2">
      <Link href={adresseAccueil(reseau)} className="flex min-w-0 items-center gap-2.5" aria-label={`${MARQUE}, accueil`}>
        <Logo taille={34} inverse />
        <span className="hidden truncate text-[15px] font-extrabold sm:block lg:text-[17px]">{MARQUE}</span>
      </Link>
      <nav aria-label="Pages du site" className="flex shrink-0 items-center gap-0.5 lg:gap-1">
        {communauteActive ? (
          <Link
            href={adresseReseaux(reseau)}
            aria-current={page === 'reseaux' ? 'page' : undefined}
            className={clsx(lien, actif('reseaux'))}
          >
            <span className="lg:hidden">Réseaux</span>
            <span className="hidden lg:inline">Réseaux publiés</span>
          </Link>
        ) : null}
        <Link href={adresseMethode(reseau)} aria-current={page === 'methode' ? 'page' : undefined} className={clsx(lien, actif('methode'))}>
          <span className="lg:hidden">Méthode</span>
          <span className="hidden lg:inline">Comment nous calculons</span>
        </Link>
        {page !== 'accueil' ? (
          <Link
            href={adresseAccueil(enCours ? villePartie : reseau)}
            className={clsx(lien, 'ml-1 gap-1.5 bg-white text-rouge hover:bg-rouge-pale')}
          >
            {enCours ? 'Reprendre' : 'Jouer'}
            <Icone nom="fleche" taille={15} epaisseur={2.4} />
          </Link>
        ) : null}
      </nav>
    </div>
  )
}
