'use client'

import { MANDATS } from '@/lib/catalogue'
import { communauteActive } from '@/lib/communaute'
import { useJeu, useVille } from '@/lib/store'
import { adresseReseaux } from '@/lib/villes'

import { Bouton, BoutonLien } from '../ui'
import { Panneau } from './Panneau'

/**
 * Le menu de la partie : ce qu'on est en train de faire, et de quoi en sortir sans rien perdre : les
 * réseaux publiés, l'explication des estimations et du budget, ou l'accueil, d'où l'on reprend la partie ou en commence une autre.
 */
export function Menu() {
  const { mandat, fermer, ouvrir, allerAccueil, libre } = useJeu()
  const ville = useVille()
  const { debut, fin } = MANDATS[mandat]

  return (
    <Panneau titre="Votre partie">
      <p className="text-[15px] leading-relaxed">
        {libre
          ? `Vous jouez ${ville.ou}, en jeu libre : il n’y a pas de budget à tenir.`
          : `Vous jouez ${ville.ou}, au ${mandat === 1 ? 'premier' : 'second'} mandat, de ${debut} à ${fin}.`}{' '}
        La partie est enregistrée dans ce navigateur : vous pouvez quitter la page et la reprendre plus tard.
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
        <Bouton genre="contour" iconeAGauche="info" className="justify-start" onClick={() => ouvrir({ type: 'budget' })}>
          Comment nous calculons votre budget
        </Bouton>
      </div>
      <div className="border-t border-trait pt-4">
        <Bouton genre="sable" iconeAGauche="retour" className="w-full justify-start" onClick={allerAccueil}>
          Retour à l’accueil
        </Bouton>
        <p className="pt-2 text-[13px] leading-relaxed text-gris">
          Votre partie reste enregistrée : vous la retrouverez depuis l’accueil, où vous pourrez aussi en commencer une autre, ici ou dans
          une autre ville.
        </p>
      </div>
    </Panneau>
  )
}
