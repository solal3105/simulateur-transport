'use client'

import { clsx } from 'clsx'

import type { Objectif } from '@/lib/objectifs'

import { Icone } from '../ui'

/** Les objectifs d'une partie, réussis ou pas encore, chacun avec le chiffre qui le mesure. */
export function ListeObjectifs({ liste }: { liste: Objectif[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {liste.map((o) => (
        <li key={o.id} className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className={clsx(
              'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full',
              o.atteint ? 'bg-rouge text-white' : 'shadow-[inset_0_0_0_2px_var(--color-trait)]',
            )}
          >
            {o.atteint ? <Icone nom="valider" taille={12} epaisseur={3.2} /> : null}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[14px] leading-tight font-extrabold">
              {o.titre}
              <span className="sr-only">{o.atteint ? ' : réussi.' : ' : pas encore.'}</span>
            </span>
            <span className="text-[13px] leading-snug text-gris">{o.mesure}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
