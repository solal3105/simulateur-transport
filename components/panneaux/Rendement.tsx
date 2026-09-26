'use client'

import { useMemo } from 'react'

import { catalogueDe } from '@/lib/catalogue'
import { n } from '@/lib/format'
import { totauxCatalogue } from '@/lib/regles'
import { useVille } from '@/lib/store'

/** Le meilleur rapport entre voyageurs et coût du catalogue du réseau, pour situer un projet ou une ligne ; 0 sans catalogue. */
export function useMeilleurRendement() {
  const ville = useVille()
  return useMemo(() => (ville.catalogue ? totauxCatalogue(catalogueDe(ville.id)).meilleur : 0), [ville])
}

/**
 * Les voyageurs gagnés par million investi : le même bloc pour un projet du catalogue et pour une ligne tracée, avec ce
 * que chaque million ajoute au score, comparé au meilleur projet du catalogue. Un projet compte les voyageurs qu'annonce
 * son porteur, une ligne tracée les nouveaux voyageurs que nous estimons : sous la barre, on le dit pour une ligne.
 */
export function Rendement({ voyageurs, cout, ligne = false }: { voyageurs: number; cout: number; ligne?: boolean }) {
  const meilleur = useMeilleurRendement()
  if (voyageurs <= 0 || cout <= 0) return null
  const valeur = voyageurs / cout
  const repere = !meilleur
    ? null
    : valeur >= meilleur * 0.99
      ? ligne
        ? `Autant ou plus que le meilleur projet du catalogue, qui en apporte ${n(meilleur)}.`
        : 'C’est le meilleur rapport de tout le catalogue.'
      : `Le meilleur projet du catalogue en apporte ${n(meilleur)}.`
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-sable p-4">
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-semibold text-gris">Voyageurs gagnés par million investi</span>
        <span className="chiffres font-black">{n(valeur)}</span>
      </div>
      {meilleur > 0 ? (
        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-rouge" style={{ width: `${Math.min(100, Math.max(2, (valeur / meilleur) * 100))}%` }} />
        </div>
      ) : null}
      {repere || ligne ? (
        <p className="text-[13px] leading-snug text-gris">
          {repere}
          {ligne
            ? `${repere ? ' ' : ''}Pour votre ligne, nous comptons les nouveaux voyageurs, ceux qui entrent dans votre score ; un projet du catalogue compte les voyageurs qu’annonce son porteur.`
            : null}
        </p>
      ) : null}
    </div>
  )
}
