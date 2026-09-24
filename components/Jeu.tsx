'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

import { aAcces } from '@/lib/acces'
import { decoderPartie, type PartiePartagee } from '@/lib/lien'
import { useJeu } from '@/lib/store'
import { adresseAccueil, VILLES, type IdVille } from '@/lib/villes'

import { Accueil } from './ecrans/Accueil'
import { Bilan } from './ecrans/Bilan'
import { FinMandat } from './ecrans/FinMandat'
import { Partie } from './partie/Partie'

const abonnerAdresse = (changer: () => void) => {
  window.addEventListener('hashchange', changer)
  return () => window.removeEventListener('hashchange', changer)
}

/**
 * Aiguillage entre les écrans. La partie enregistrée est relue une fois la page affichée.
 * `ville` est la ville de l'adresse (/toulouse) : l'accueil la propose, et si la partie enregistrée se
 * joue ailleurs, l'accueil le signale au lieu de l'ouvrir directement. L'accueil s'affiche aussi à la
 * demande du joueur (menu de la partie, bilan), sans effacer la partie.
 */
export function Jeu({ ville }: { ville?: IdVille }) {
  const ecran = useJeu((s) => s.ecran)
  const villePartie = useJeu((s) => s.ville)
  const pause = useJeu((s) => s.pause)
  const publie = useJeu((s) => s.publie)
  const [pret, setPret] = useState(false)
  const [partage, setPartage] = useState<PartiePartagee | null>(null)
  const [reprise, setReprise] = useState(false)
  // Un lien de partage s'ouvre sur son réseau : pendant qu'il se lit, pas d'accueil qui apparaîtrait puis disparaîtrait.
  const lienPartage = useSyncExternalStore(
    abonnerAdresse,
    () => new URLSearchParams(window.location.hash.slice(1)).has('r'),
    () => false,
  )

  useEffect(() => {
    // Un lien de partage (#r=…) affiche le réseau reçu, sans toucher à la partie en cours.
    const code = new URLSearchParams(window.location.hash.slice(1)).get('r')
    const lecture = code ? decoderPartie(code).then(setPartage) : Promise.resolve()
    Promise.all([Promise.resolve(useJeu.persist.rehydrate()), lecture]).then(() => {
      // Sans l'accès anticipé, une partie enregistrée ne s'ouvre pas : l'accueil passe devant, et demande
      // le mot de passe avant de la reprendre.
      if (!aAcces() && useJeu.getState().ecran !== 'accueil') useJeu.getState().allerAccueil()
      setPret(true)
    })
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ecran])

  // Pendant une partie, l'onglet et l'adresse disent la ville jouée ; un réseau reçu garde la sienne.
  const autreVille = ville !== undefined && villePartie !== ville && !reprise
  useEffect(() => {
    if (!pret) return
    if (partage) {
      document.title = VILLES[partage.ville].titrePage
      return
    }
    if (ecran === 'accueil' || autreVille || pause) return
    const titre = VILLES[villePartie].titrePage
    const adresse = adresseAccueil(villePartie)
    if (window.location.pathname === adresse) {
      document.title = titre
      return
    }
    // Le routeur remet le titre de la page d'origine après un changement d'adresse : on le corrige ensuite.
    window.history.replaceState(null, '', adresse)
    const t = window.setTimeout(() => (document.title = titre), 50)
    return () => window.clearTimeout(t)
  }, [pret, partage, ecran, villePartie, autreVille, pause])

  // Quitter le réseau reçu efface le lien de l'adresse et affiche la partie du visiteur, telle qu'elle est enregistrée.
  const quitter = () => {
    window.history.replaceState(null, '', window.location.pathname)
    setPartage(null)
  }

  if (pret && partage) return <Bilan partage={partage} quitter={quitter} />
  if (!pret && lienPartage) {
    return (
      <main className="grid min-h-dvh place-items-center bg-sable">
        <p className="text-sm font-bold text-muet" aria-live="polite">
          Ouverture du réseau partagé
        </p>
      </main>
    )
  }
  // Sans ville dans l'adresse, l'accueil propose celle de la dernière partie, Lyon pour une première visite.
  if (!pret || ecran === 'accueil') return <Accueil villeInitiale={ville ?? (pret ? villePartie : 'lyon')} />
  if (autreVille || pause) {
    const reprendre = () => {
      if (window.location.pathname !== adresseAccueil(villePartie)) window.history.replaceState(null, '', adresseAccueil(villePartie))
      setReprise(true)
      useJeu.getState().quitterAccueil()
    }
    return (
      <Accueil
        villeInitiale={pause ? villePartie : ville}
        partieEnCours={{ ville: villePartie, terminee: ecran === 'bilan', publiee: publie !== null, reprendre }}
      />
    )
  }
  if (ecran === 'fin-mandat') return <FinMandat />
  if (ecran === 'bilan') return <Bilan />
  return <Partie />
}
