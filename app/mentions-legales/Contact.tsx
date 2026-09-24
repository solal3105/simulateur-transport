'use client'

import { useState } from 'react'

import { ouvrirMessagerie } from '@/components/explications/Ecrire'
import { Bouton } from '@/components/ui'

/** Le bouton pour nous écrire : la messagerie s'ouvre, et l'adresse s'affiche au cas où elle ne s'ouvre pas. */
export function Contact() {
  const [adresse, setAdresse] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-2">
      <Bouton genre="rouge" iconeAGauche="lettre" className="self-start" onClick={() => setAdresse(ouvrirMessagerie('mentions légales'))}>
        Nous écrire
      </Bouton>
      {adresse ? (
        <p className="text-[14px] text-gris" aria-live="polite">
          Si votre messagerie ne s’ouvre pas, écrivez à <span className="font-extrabold text-encre select-all">{adresse}</span>.
        </p>
      ) : null}
    </div>
  )
}
