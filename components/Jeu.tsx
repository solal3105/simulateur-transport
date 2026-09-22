'use client'

import { useEffect, useState } from 'react'

import { useJeu } from '@/lib/store'

import { Accueil } from './ecrans/Accueil'
import { Bilan } from './ecrans/Bilan'
import { FinMandat } from './ecrans/FinMandat'
import { Partie } from './partie/Partie'

/** Aiguillage entre les écrans. La partie enregistrée est relue une fois la page affichée. */
export function Jeu() {
  const ecran = useJeu((s) => s.ecran)
  const [pret, setPret] = useState(false)

  useEffect(() => {
    Promise.resolve(useJeu.persist.rehydrate()).then(() => setPret(true))
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ecran])

  if (!pret || ecran === 'accueil') return <Accueil />
  if (ecran === 'fin-mandat') return <FinMandat />
  if (ecran === 'bilan') return <Bilan />
  return <Partie />
}
