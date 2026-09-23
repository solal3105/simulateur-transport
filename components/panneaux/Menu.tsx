'use client'

import { useState } from 'react'

import { MANDATS } from '@/lib/catalogue'
import { communauteActive } from '@/lib/communaute'
import { useJeu, useVille } from '@/lib/store'
import { adresseReseaux } from '@/lib/villes'

import { Bouton, BoutonLien } from '../ui'
import { Panneau } from './Panneau'

/**
 * Le menu de la partie : ce qu'on est en train de faire, et de quoi en sortir sans rien perdre (les
 * réseaux publiés, l'explication du calcul), ou la recommencer après confirmation.
 */
export function Menu() {
  const { mandat, fermer, ouvrir, rejouer } = useJeu()
  const ville = useVille()
  const [effacer, setEffacer] = useState(false)
  const { debut, fin } = MANDATS[mandat]

  return (
    <Panneau titre="Votre partie">
      <p className="text-[15px] leading-relaxed">
        Vous jouez à {ville.nom}, au {mandat === 1 ? 'premier' : 'second'} mandat, de {debut} à {fin}. La partie est enregistrée dans ce
        navigateur : vous pouvez quitter la page et la reprendre plus tard.
      </p>
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
      </div>
      <div className="border-t border-trait pt-4">
        {effacer ? (
          <div role="group" aria-labelledby="effacer-partie" className="flex flex-col gap-3 rounded-2xl bg-sable p-4">
            <p id="effacer-partie" className="text-[14.5px] leading-relaxed">
              Votre partie sera effacée. Vous reviendrez à l’accueil, où vous pourrez choisir la ville et recommencer.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Bouton genre="rouge" onClick={rejouer}>
                Effacer ma partie
              </Bouton>
              <Bouton genre="contour" onClick={() => setEffacer(false)}>
                Garder ma partie
              </Bouton>
            </div>
          </div>
        ) : (
          <Bouton genre="sable" iconeAGauche="rejouer" className="w-full justify-start" onClick={() => setEffacer(true)}>
            Recommencer une partie
          </Bouton>
        )}
      </div>
    </Panneau>
  )
}
