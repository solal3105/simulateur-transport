import type { ReactNode } from 'react'

import { Icone } from '../ui'

/** Le détail d'une explication, replié par défaut : l'essentiel se lit sans lui. */
export function Deplier({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl shadow-[inset_0_0_0_1.5px_var(--color-trait)]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[14.5px] font-extrabold [&::-webkit-details-marker]:hidden">
        {titre}
        <Icone nom="plus" taille={18} epaisseur={2.4} className="shrink-0 text-rouge transition-transform group-open:rotate-45" />
      </summary>
      <div className="flex flex-col gap-4 px-4 pb-5">{children}</div>
    </details>
  )
}
