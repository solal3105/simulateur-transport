'use client'

import Link from 'next/link'
import { useMemo } from 'react'

import { debutMandat, finMandat, mandatsJoues } from '@/lib/catalogue'
import { communauteActive } from '@/lib/communaute'
import { ordinal } from '@/lib/format'
import { objectifs } from '@/lib/objectifs'
import { useJeu, useVille } from '@/lib/store'
import { adresseReseaux } from '@/lib/villes'

import { ListeObjectifs } from '../partie/Objectifs'
import { ouvrirRetour } from '../partie/Retour'
import { Bouton, BoutonLien, Surtitre } from '../ui'
import { Panneau } from './Panneau'

/**
 * Le menu de la partie : ce qu'on est en train de faire, les réseaux publiés, l'explication des estimations et
 * du budget, et le signalement d'un bug ou d'une amélioration. Le retour à l'accueil a son propre bouton, la maison, dans l'en-tête.
 */
export function Menu() {
  const { mandat, fermer, ouvrir, libre, chantiers, lignes, leviers } = useJeu()
  const ville = useVille()
  // Où en sont les objectifs, avec les choix faits jusqu'ici : ils se jugent au bilan.
  const liste = useMemo(
    () => objectifs({ chantiers, lignes, leviers, mandats: mandatsJoues(mandat), libre }, ville),
    [chantiers, lignes, leviers, mandat, libre, ville],
  )

  return (
    <Panneau titre="Votre partie">
      <p className="text-[14px] leading-normal">
        {libre
          ? `Vous jouez ${ville.ou}, en jeu libre : il n’y a pas de budget à tenir.`
          : `Vous jouez ${ville.ou}, au ${ordinal(mandat)} mandat, de ${debutMandat(mandat)} à ${finMandat(mandat)}.`}{' '}
        La partie est enregistrée dans ce navigateur : la maison, en haut, vous ramène à l’accueil, où vous la retrouverez ou en commencerez
        une autre.
      </p>
      {liste.length ? (
        <section aria-labelledby="objectifs" className="flex flex-col gap-2.5 rounded-xl bg-sable p-3">
          <Surtitre>
            <span id="objectifs">Vos objectifs, avec vos choix actuels</span>
          </Surtitre>
          <ListeObjectifs liste={liste} />
          <p className="text-[12.5px] leading-snug text-gris">Ils se jugent au bilan, à la fin de la partie.</p>
        </section>
      ) : null}
      <div className="flex flex-col gap-2">
        <Bouton genre="rouge" icone="fleche" onClick={fermer}>
          Continuer la partie
        </Bouton>
        {communauteActive ? (
          <BoutonLien href={adresseReseaux(ville.id)} genre="contour" iconeAGauche="voyageurs" className="justify-start">
            Voir les réseaux publiés
          </BoutonLien>
        ) : null}
        <Bouton genre="contour" iconeAGauche="info" className="justify-start" onClick={() => ouvrir({ type: 'methode' })}>
          Comment nous estimons les lignes
        </Bouton>
        <Bouton genre="contour" iconeAGauche="info" className="justify-start" onClick={() => ouvrir({ type: 'budget' })}>
          Comment nous calculons votre budget
        </Bouton>
        <Bouton
          genre="contour"
          iconeAGauche="bug"
          className="justify-start"
          onClick={() => {
            fermer()
            ouvrirRetour()
          }}
        >
          Signaler un bug ou proposer une amélioration
        </Bouton>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        <Link
          href="/nouveautes"
          className="text-[13.5px] font-extrabold text-gris underline decoration-trait underline-offset-3 hover:text-encre"
        >
          Nouveautés du jeu
        </Link>
        <Link
          href="/mentions-legales"
          className="text-[13.5px] font-extrabold text-gris underline decoration-trait underline-offset-3 hover:text-encre"
        >
          Mentions légales et confidentialité
        </Link>
      </div>
    </Panneau>
  )
}
