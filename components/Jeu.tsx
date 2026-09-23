'use client'

import { useEffect, useState } from 'react'

import { decoderPartie, type PartiePartagee } from '@/lib/lien'
import { useJeu } from '@/lib/store'
import type { IdVille } from '@/lib/villes'

import { Accueil, adresseVille } from './ecrans/Accueil'
import { Bilan } from './ecrans/Bilan'
import { FinMandat } from './ecrans/FinMandat'
import { Partie } from './partie/Partie'

/**
 * Aiguillage entre les écrans. La partie enregistrée est relue une fois la page affichée.
 * `ville` est la ville de l'adresse (/toulouse) : l'accueil la propose, et si la partie enregistrée se
 * joue ailleurs, l'accueil le signale au lieu de l'ouvrir directement.
 */
export function Jeu({ ville }: { ville?: IdVille }) {
  const ecran = useJeu((s) => s.ecran)
  const villePartie = useJeu((s) => s.ville)
  const [pret, setPret] = useState(false)
  const [partage, setPartage] = useState<PartiePartagee | null>(null)
  const [reprise, setReprise] = useState(false)

  useEffect(() => {
    // Un lien de partage (#r=…) affiche le réseau reçu, sans toucher à la partie en cours.
    const code = new URLSearchParams(window.location.hash.slice(1)).get('r')
    const lecture = code ? decoderPartie(code).then(setPartage) : Promise.resolve()
    Promise.all([Promise.resolve(useJeu.persist.rehydrate()), lecture]).then(() => setPret(true))
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ecran])

  // Quitter le réseau reçu efface le lien de l'adresse et affiche la partie du visiteur, telle qu'elle est enregistrée.
  const quitter = () => {
    window.history.replaceState(null, '', window.location.pathname)
    setPartage(null)
  }

  if (pret && partage) return <Bilan partage={partage} quitter={quitter} />
  if (!pret || ecran === 'accueil') return <Accueil villeInitiale={ville} />
  if (ville && villePartie !== ville && !reprise) {
    const reprendre = () => {
      window.history.replaceState(null, '', adresseVille(villePartie))
      setReprise(true)
    }
    return <Accueil villeInitiale={ville} partieEnCours={{ ville: villePartie, reprendre }} />
  }
  if (ecran === 'fin-mandat') return <FinMandat />
  if (ecran === 'bilan') return <Bilan />
  return <Partie />
}
