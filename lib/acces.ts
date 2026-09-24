'use client'

import { useSyncExternalStore } from 'react'

/**
 * L'accès anticipé : tant que le jeu n'est pas ouvert à tous, on ne joue qu'après avoir donné le mot de
 * passe, vérifié par le serveur (app/api/acces). Le navigateur s'en souvient ensuite ; sans stockage
 * possible, il s'en souvient jusqu'à la fermeture de la page.
 */
const CLE = 'acces-anticipe'
const abonnes = new Set<() => void>()
let ouvertIci = false

function lire() {
  if (ouvertIci) return true
  try {
    return localStorage.getItem(CLE) === '1'
  } catch {
    return false
  }
}

function abonner(changer: () => void) {
  abonnes.add(changer)
  return () => {
    abonnes.delete(changer)
  }
}

/** Le visiteur a-t-il l'accès, lu à l'instant. */
export const aAcces = lire

/** Le visiteur a-t-il l'accès ? Toujours non pendant le rendu sur le serveur. */
export const useAcces = () => useSyncExternalStore(abonner, lire, () => false)

/** Envoie le mot de passe au serveur et, s'il est bon, ouvre le jeu dans ce navigateur. */
export async function essayerMotDePasse(motDePasse: string): Promise<'ok' | 'faux' | 'erreur'> {
  try {
    const reponse = await fetch('/api/acces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motDePasse }),
    })
    if (reponse.status === 401) return 'faux'
    if (!reponse.ok) return 'erreur'
  } catch {
    return 'erreur'
  }
  ouvertIci = true
  try {
    localStorage.setItem(CLE, '1')
  } catch {
    // Sans stockage, l'accès vaut pour cette page seulement.
  }
  abonnes.forEach((changer) => changer())
  return 'ok'
}
