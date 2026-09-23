'use client'

import { clsx } from 'clsx'

import { libre, POSTES, type BudgetVille, type NomPoste, type Source } from '@/lib/budget'
import { MANDATS } from '@/lib/catalogue'
import { n } from '@/lib/format'
import { useJeu, useVille } from '@/lib/store'
import type { Mandat } from '@/lib/types'
import type { Ville } from '@/lib/villes'

import { Panneau } from './Panneau'

const TITRES: Record<NomPoste, string> = {
  total: 'L’investissement prévu',
  decides: 'Les projets déjà décidés',
  bus: 'Les bus',
  lignes: 'Les lignes existantes',
}

/** Ce que nous retirons de l'investissement prévu, dans l'ordre du calcul. */
const PARTS = [
  { poste: 'decides', nom: 'Projets décidés, déjà sur la carte', couleur: 'bg-muet' },
  { poste: 'bus', nom: 'Bus et dépôts', couleur: 'bg-[repeating-linear-gradient(135deg,#b9b5af_0_3px,#dad6d0_3px_6px)]' },
  { poste: 'lignes', nom: 'Lignes existantes', couleur: 'bg-[repeating-linear-gradient(135deg,#85858e_0_3px,#c9c5bf_3px_6px)]' },
] as const

/** Ce qui reste pour les lignes du joueur, en une phrase : pour l'écran de méthode comme pour celui du budget. */
export function phraseLibre(b: BudgetVille) {
  const [l1, l2] = [libre(b, 1), libre(b, 2)]
  return l1 === l2
    ? `Il vous reste ${n(l1)} M€ à chaque mandat pour vos lignes.`
    : `Il vous reste ${n(l1)} M€ au premier mandat et ${n(l2)} M€ au second pour vos lignes.`
}

/** Deux mandats aux montants identiques se montrent en un seul calcul. */
const memesMontants = (b: BudgetVille) => POSTES.every((p) => b[p].montants[1] === b[p].montants[2])

function Calcul({ b, m, titre }: { b: BudgetVille; m: Mandat; titre: string }) {
  const total = b.total.montants[m]
  const parts = PARTS.filter((p) => b[p.poste].montants[m] > 0)
  const reste = libre(b, m)
  const resume = parts.map((p) => `${p.nom} : ${n(b[p.poste].montants[m])} M€`).join(', ')
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-sable p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-extrabold">{titre}</span>
        <span className="chiffres text-[13px] font-bold text-gris">{n(total)} M€ investis</span>
      </div>
      <div
        role="img"
        aria-label={`Sur ${n(total)} M€ : ${resume}, et ${n(reste)} M€ pour vos lignes.`}
        className="flex h-3 gap-0.5 overflow-hidden rounded-md bg-trait"
      >
        {parts.map((p) => (
          <div key={p.poste} className={clsx('h-full', p.couleur)} style={{ width: `${(b[p.poste].montants[m] / total) * 100}%` }} />
        ))}
        <div className="h-full bg-rouge" style={{ width: `${(Math.max(0, reste) / total) * 100}%` }} />
      </div>
      <dl className="flex flex-col gap-1 text-[13.5px]">
        {parts.map((p) => (
          <div key={p.poste} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2">
              <span className={clsx('h-2 w-3.5 shrink-0 rounded-sm', p.couleur)} />
              {p.nom}
            </dt>
            <dd className="chiffres font-bold whitespace-nowrap">{n(b[p.poste].montants[m])} M€</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 font-extrabold text-rouge">
          <dt className="flex items-center gap-2">
            <span className="h-2 w-3.5 shrink-0 rounded-sm bg-rouge" />
            Pour vos lignes
          </dt>
          <dd className="chiffres whitespace-nowrap">{n(reste)} M€</dd>
        </div>
      </dl>
    </div>
  )
}

function Sources({ sources }: { sources: Source[] }) {
  if (!sources.length) return null
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-extrabold text-muet">Sources</span>
      <ul className="flex flex-col gap-1 text-[13px] leading-snug text-gris">
        {sources.map((s) => (
          <li key={`${s.titre} ${s.pages ?? ''}`}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-trait decoration-2 underline-offset-2 hover:text-encre hover:decoration-rouge"
            >
              {s.titre}
            </a>
            {s.pages ? `, ${s.pages}` : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Contenu({ ville }: { ville: Ville }) {
  const b = ville.budget
  return (
    <>
      <p className="text-[15px] leading-relaxed">
        Nous partons de l’investissement prévu par {b.payeur} dans les transports {ville.territoire}, mandat par mandat. Nous en retirons ce
        qui reste à payer sur les projets déjà décidés et dessinés sur notre carte, puis ce que demandent les bus et les lignes existantes.{' '}
        {phraseLibre(b)}
      </p>
      <div className="grid gap-3">
        {memesMontants(b) ? (
          <Calcul b={b} m={1} titre={`À chaque mandat, de ${MANDATS[1].debut} à ${MANDATS[2].fin}`} />
        ) : (
          ([1, 2] as const).map((m) => (
            <Calcul key={m} b={b} m={m} titre={`${m === 1 ? 'Premier' : 'Second'} mandat, ${MANDATS[m].debut}-${MANDATS[m].fin}`} />
          ))
        )}
      </div>
      {POSTES.filter((p) => b[p].explication).map((p) => (
        <section key={p} className="flex flex-col gap-2">
          <h3 className="text-lg font-black">{TITRES[p]}</h3>
          <p className="text-[15px] leading-relaxed">{b[p].explication}</p>
          <Sources sources={b[p].sources} />
        </section>
      ))}
      {b.limites.length ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-lg font-black">Ce que nous n’avons pas pu vérifier</h3>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed">
            {b.limites.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {b.releve ? <p className="text-[13px] leading-relaxed text-gris">Chiffres relevés en {b.releve}.</p> : null}
    </>
  )
}

export function Budget() {
  const { brouillon, ouvrir, fermer } = useJeu()
  const ville = useVille()
  return (
    <Panneau
      titre="Comment nous calculons votre budget"
      hauteurTelephone="pleine"
      onFermer={() => (brouillon ? ouvrir({ type: 'ligne' }) : fermer())}
    >
      <Contenu ville={ville} />
    </Panneau>
  )
}
