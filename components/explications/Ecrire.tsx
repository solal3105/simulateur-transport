'use client'

import { clsx } from 'clsx'
import { useState } from 'react'

import { Icone } from '../ui'

/**
 * L'adresse de contact n'est jamais écrite en clair dans la page ni dans son code : elle est encodée
 * en deux morceaux et n'est assemblée qu'au clic, ce qui la cache aux robots qui ramassent les adresses.
 */
const PARTIES = ['c29sYWwuZ2VuZHJpbg==', 'Z21haWwuY29t']
const adresse = () => PARTIES.map((p) => atob(p)).join('@')

/** Ouvre la messagerie avec un objet déjà rempli, et renvoie l'adresse pour l'afficher au besoin. */
export function ouvrirMessagerie(sujet: string, corps?: string) {
  const a = adresse()
  const texte = corps ? `&body=${encodeURIComponent(corps)}` : ''
  window.location.href = `mailto:${a}?subject=${encodeURIComponent(`Simulateur transport : ${sujet}`)}${texte}`
  return a
}

/**
 * Une invitation à écrire, là où un chiffre peut être contesté : le budget, les leviers, le calcul des
 * voyageurs. Le clic ouvre la messagerie avec un objet déjà rempli, puis montre l'adresse au cas où
 * aucune messagerie ne s'ouvre.
 */
export function Ecrire({ texte, sujet, compact }: { texte: string; sujet: string; compact?: boolean }) {
  const [montree, setMontree] = useState<string | null>(null)
  const ouvrir = () => setMontree(ouvrirMessagerie(sujet))
  return (
    <div className={clsx('flex flex-col gap-2.5', compact ? '' : 'rounded-2xl bg-sable p-4 lg:p-5')}>
      <p className={clsx('leading-relaxed', compact ? 'text-[13.5px] text-gris' : 'text-[15px]')}>{texte}</p>
      <button
        type="button"
        onClick={ouvrir}
        className="flex min-h-11 items-center gap-2 self-start rounded-full bg-white px-4 text-[14.5px] font-extrabold text-rouge-fonce shadow-[inset_0_0_0_1.5px_var(--color-trait)] transition-colors hover:shadow-[inset_0_0_0_1.5px_var(--color-rouge)]"
      >
        <Icone nom="lettre" taille={18} epaisseur={2.1} />
        Nous écrire
      </button>
      {montree ? (
        <p className="text-[13px] leading-relaxed text-gris" aria-live="polite">
          Si votre messagerie ne s’ouvre pas, écrivez à <span className="font-bold text-encre select-all">{montree}</span>.
        </p>
      ) : null}
    </div>
  )
}
