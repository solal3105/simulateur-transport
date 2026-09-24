'use client'

import { useJeu, useVille } from '@/lib/store'

import { EcrireVoyageurs, ExplicationVoyageurs } from '../explications/Voyageurs'
import { Bouton } from '../ui'
import { Panneau } from './Panneau'

export function Methode() {
  const { brouillon, ouvrir, fermer } = useJeu()
  const ville = useVille()
  return (
    <Panneau
      titre="Comment nous estimons une ligne"
      hauteurTelephone="pleine"
      onFermer={() => (brouillon ? ouvrir({ type: 'ligne' }) : fermer())}
    >
      <ExplicationVoyageurs ville={ville} />
      <Bouton genre="contour" iconeAGauche="pieces" className="justify-start" onClick={() => ouvrir({ type: 'budget' })}>
        Comment nous calculons votre budget
      </Bouton>
      <EcrireVoyageurs ville={ville} />
    </Panneau>
  )
}
