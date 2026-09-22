'use client'

import { useEffect, useState } from 'react'

import { decoderPartie, type PartiePartagee } from '@/lib/lien'
import { useJeu } from '@/lib/store'

import { Accueil } from './ecrans/Accueil'
import { Bilan } from './ecrans/Bilan'
import { FinMandat } from './ecrans/FinMandat'
import { Partie } from './partie/Partie'

/** Aiguillage entre les écrans. La partie enregistrée est relue une fois la page affichée. */
export function Jeu() {
  const ecran = useJeu((s) => s.ecran)
  const [pret, setPret] = useState(false)
  const [partage, setPartage] = useState<PartiePartagee | null>(null)

  useEffect(() => {
    // Un lien de partage (#r=…) affiche le réseau reçu, sans toucher à la partie en cours.
    const code = new URLSearchParams(window.location.hash.slice(1)).get('r')
    const lecture = code ? decoderPartie(code).then(setPartage) : Promise.resolve()
    Promise.all([Promise.resolve(useJeu.persist.rehydrate()), lecture]).then(() => setPret(true))
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ecran])

  if (pret && partage) return <Bilan partage={partage} />
  if (!pret || ecran === 'accueil') return <Accueil />
  if (ecran === 'fin-mandat') return <FinMandat />
  if (ecran === 'bilan') return <Bilan />
  return <Partie />
}
