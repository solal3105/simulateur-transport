'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'

import { PROJETS } from '@/lib/catalogue'
import { n } from '@/lib/format'
import { resumer } from '@/lib/regles'
import type { Chantier, Leviers, LigneJoueur, Mandat } from '@/lib/types'
import { VILLES, type IdVille } from '@/lib/villes'

import { Carte } from '../carte/Carte'
import { BoutonRond, Surtitre } from '../ui'

export interface Reseau {
  /** Le nom du réseau en tête de colonne, et tel qu'on le cite dans une phrase. */
  titre: string
  sujet: string
  /** Les deux réseaux comparés sont toujours de la même ville. */
  ville: IdVille
  /** Un réseau fait en jeu libre n'a pas de budget à tenir. */
  libre: boolean
  chantiers: Chantier[]
  lignes: LigneJoueur[]
  leviers: Record<Mandat, Leviers>
}

const MARGES = { top: 18, left: 18, right: 18, bottom: 18 }
const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type Resume = ReturnType<typeof resumer>

/** Une phrase qui dit lequel des deux réseaux transporte le plus, et à quel prix. */
function conclusion(a: Reseau, ra: Resume, b: Reseau, rb: Resume) {
  const dv = rb.voyageurs - ra.voyageurs
  const dc = rb.investi - ra.investi
  if (dv === 0) {
    if (dc === 0) return 'Les deux réseaux gagnent autant de voyageurs pour le même coût.'
    const moinsCher = dc < 0 ? b : a
    return `Les deux réseaux gagnent autant de voyageurs, mais ${moinsCher.sujet} coûte ${n(Math.abs(dc))} M€ de moins.`
  }
  const [meilleur, autre, ecartCout] = dv > 0 ? [b, a, dc] : [a, b, -dc]
  const debut = `${majuscule(meilleur.sujet)} gagne ${n(Math.abs(dv))} voyageurs de plus par jour que ${autre.sujet}`
  if (ecartCout === 0) return `${debut}, pour le même coût.`
  return ecartCout < 0 ? `${debut}, et coûte ${n(-ecartCout)} M€ de moins.` : `${debut}, mais coûte ${n(ecartCout)} M€ de plus.`
}

function nomsProjets(r: Reseau) {
  return new Map([
    ...r.chantiers.flatMap((c) => {
      const p = PROJETS.get(c.id)
      return p ? [[c.id, p.nom] as const] : []
    }),
    ...r.lignes.map((l) => [l.id, l.nom] as const),
  ])
}

function Ligne({ label, a, b, meilleur }: { label: string; a: string; b: string; meilleur?: 'a' | 'b' }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-3 border-b border-trait py-3 lg:py-3.5">
      <span className={clsx('chiffres text-right text-base lg:text-lg', meilleur === 'a' ? 'font-black text-rouge' : 'font-bold')}>
        {a}
      </span>
      <span className="text-center text-[12.5px] leading-snug font-bold text-gris lg:text-[13.5px]">{label}</span>
      <span className={clsx('chiffres text-base lg:text-lg', meilleur === 'b' ? 'font-black text-rouge' : 'font-bold')}>{b}</span>
    </div>
  )
}

/**
 * Deux réseaux côte à côte : leurs cartes, leurs chiffres et les projets qu'ils ont en commun.
 * S'ouvre par-dessus le bilan ; Échap ou le bouton de fermeture y ramènent.
 */
export function Comparaison({ a, b, fermer }: { a: Reseau; b: Reseau; fermer: () => void }) {
  const ra = resumer(a.chantiers, a.lignes, a.leviers, VILLES[a.ville])
  const rb = resumer(b.chantiers, b.lignes, b.leviers, VILLES[b.ville])
  const catalogue = VILLES[a.ville].catalogue
  const rendement = (r: Resume) => (r.investi > 0 ? Math.round(r.voyageurs / r.investi) : 0)
  const mieux = (va: number, vb: number, plusGrandGagne = true) =>
    va === vb ? undefined : va > vb === plusGrandGagne ? ('a' as const) : ('b' as const)

  const nomsA = nomsProjets(a)
  const nomsB = nomsProjets(b)
  const communs = [...nomsA].filter(([id]) => nomsB.has(id)).map(([, nom]) => nom)
  const seulsA = [...nomsA].filter(([id]) => !nomsB.has(id)).map(([, nom]) => nom)
  const seulsB = [...nomsB].filter(([id]) => !nomsA.has(id)).map(([, nom]) => nom)

  const refFermer = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    refFermer.current?.focus({ preventScroll: true })
    const clavier = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    window.addEventListener('keydown', clavier)
    return () => window.removeEventListener('keydown', clavier)
  }, [fermer])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-comparaison"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-white"
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 pt-5 pb-10 lg:gap-8 lg:px-10 lg:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="titre-comparaison" className="text-[26px] leading-tight font-black tracking-tight lg:text-[34px]">
              Comparer les deux réseaux
            </h2>
            <p className="max-w-[680px] text-[15px] leading-relaxed text-gris lg:text-base">{conclusion(a, ra, b, rb)}</p>
          </div>
          <BoutonRond label="Fermer la comparaison" icone="fermer" onClick={fermer} ref={refFermer} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-10">
          {[a, b].map((r) => (
            <section key={r.titre} className="flex flex-col gap-3">
              <Surtitre>{r.titre}</Surtitre>
              <div className="relative h-[220px] overflow-hidden rounded-[20px] bg-sable shadow-[inset_0_0_0_1px_var(--color-trait)] lg:h-[340px]">
                <Carte marges={MARGES} decor partie={r} ville={r.ville} />
              </div>
            </section>
          ))}
        </div>

        <div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] gap-3 pb-1 text-[12px] font-extrabold tracking-[0.06em] text-muet uppercase">
            <span className="text-right">{a.titre}</span>
            <span />
            <span>{b.titre}</span>
          </div>
          <Ligne
            label="Voyageurs gagnés par jour"
            a={`+${n(ra.voyageurs)}`}
            b={`+${n(rb.voyageurs)}`}
            meilleur={mieux(ra.voyageurs, rb.voyageurs)}
          />
          <Ligne
            label="Investi sur les deux mandats"
            a={`${n(ra.investi)} M€`}
            b={`${n(rb.investi)} M€`}
            meilleur={mieux(ra.investi, rb.investi, false)}
          />
          <Ligne
            label="Voyageurs par million investi"
            a={n(rendement(ra))}
            b={n(rendement(rb))}
            meilleur={mieux(rendement(ra), rendement(rb))}
          />
          <Ligne
            label="Budget des deux mandats"
            a={a.libre ? 'Jeu libre' : ra.equilibre ? 'Tenu' : `Déficit de ${n(-ra.deficit)} M€`}
            b={b.libre ? 'Jeu libre' : rb.equilibre ? 'Tenu' : `Déficit de ${n(-rb.deficit)} M€`}
          />
          {catalogue ? <Ligne label="Projets et lignes retenus" a={n(ra.retenus)} b={n(rb.retenus)} /> : null}
          <Ligne label="Lignes tracées par le joueur" a={n(a.lignes.length)} b={n(b.lignes.length)} />
        </div>

        {/* Sans catalogue, deux réseaux n'ont jamais de ligne en commun : on montre les lignes de chacun. */}
        <div className={clsx('grid gap-4 lg:gap-8', catalogue ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}>
          {(catalogue
            ? [
                { titre: 'Dans les deux réseaux', noms: communs },
                { titre: `Seulement dans ${a.sujet}`, noms: seulsA },
                { titre: `Seulement dans ${b.sujet}`, noms: seulsB },
              ]
            : [
                { titre: `Les lignes de ${a.sujet}`, noms: seulsA },
                { titre: `Les lignes de ${b.sujet}`, noms: seulsB },
              ]
          ).map(({ titre, noms }) => (
            <section key={titre} className="flex flex-col gap-1.5">
              <h3 className="text-[15px] font-black">{majuscule(titre)}</h3>
              <p className="text-[14.5px] leading-relaxed text-gris">
                {noms.length ? `${noms.join(', ')}.` : catalogue ? 'Aucun projet.' : 'Aucune ligne.'}
              </p>
            </section>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
