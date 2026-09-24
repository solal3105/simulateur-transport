'use client'

import { useEffect } from 'react'

/** Ouvre la partie dans le jeu, qui la lit dans l'adresse sans l'envoyer à aucun serveur. */
export function Ouverture({ code }: { code: string }) {
  useEffect(() => {
    window.location.replace(`/#r=${code}`)
  }, [code])
  return <main className="flex min-h-dvh items-center justify-center p-6 text-center text-lg font-semibold">Ouverture du réseau…</main>
}
