'use client'

import { useJeu, useVille } from '@/lib/store'

import { EcrireBudget, ExplicationBudget, ExplicationLeviers } from '../explications/Budget'
import { Panneau } from './Panneau'

export function Budget() {
  const { brouillon, ouvrir, fermer, libre } = useJeu()
  const ville = useVille()
  return (
    <Panneau
      titre="Comment nous calculons votre budget"
      hauteurTelephone="pleine"
      onFermer={() => (brouillon ? ouvrir({ type: 'ligne' }) : fermer())}
    >
      <ExplicationBudget ville={ville} />
      {ville.budget.leviers && !libre ? (
        <>
          <h3 className="text-lg font-black">Trouver de l’argent</h3>
          <ExplicationLeviers ville={ville} />
        </>
      ) : null}
      <EcrireBudget ville={ville} />
    </Panneau>
  )
}
