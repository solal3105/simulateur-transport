'use client'

import { clsx } from 'clsx'

import { estSource, libre, POSTES, type BudgetVille, type NomPoste, type Source } from '@/lib/budget'
import { MANDATS } from '@/lib/catalogue'
import { de, enLettres, n } from '@/lib/format'
import { MESURES, titreMesure } from '@/lib/leviers'
import type { Mandat } from '@/lib/types'
import type { Ville } from '@/lib/villes'

import { Deplier } from './Deplier'
import { Ecrire } from './Ecrire'

const TITRES: Record<NomPoste, string> = {
  total: 'L’investissement prévu',
  decides: 'Les chantiers déjà décidés',
  bus: 'Les bus',
  lignes: 'Le réseau existant',
}

/** Ce que nous retirons de l'investissement prévu, dans l'ordre du calcul, avec la couleur de la jauge. */
const PARTS = [
  { poste: 'decides', nom: 'Chantiers déjà décidés', phrase: 'les chantiers déjà décidés', couleur: 'bg-muet' },
  {
    poste: 'bus',
    nom: 'Bus et dépôts',
    phrase: 'le renouvellement des bus',
    couleur: 'bg-[repeating-linear-gradient(135deg,#b9b5af_0_3px,#dad6d0_3px_6px)]',
  },
  {
    poste: 'lignes',
    nom: 'Entretien du réseau existant',
    phrase: 'l’entretien du réseau existant',
    couleur: 'bg-[repeating-linear-gradient(135deg,#85858e_0_3px,#c9c5bf_3px_6px)]',
  },
] as const

/** Ce qui reste pour les lignes du joueur, en une phrase. */
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

export function Sources({ sources }: { sources: Source[] }) {
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

/** Le budget d'un réseau expliqué simplement : d'où il vient, ce qui est déjà pris, ce qui reste. */
export function ExplicationBudget({ ville }: { ville: Ville }) {
  const b = ville.budget
  const source = estSource(b)
  const total = b.total.montants[1] + b.total.montants[2]
  const pourLignes = libre(b, 1) + libre(b, 2)
  const pris = PARTS.filter((p) => b[p.poste].montants[1] + b[p.poste].montants[2] > 0).map((p) => p.phrase)
  return (
    <div className="flex flex-col gap-4">
      {source ? (
        <p className="text-[16px] leading-relaxed lg:text-[17px]">
          De 2026 à 2038, les transports {ville.territoire} recevront environ {enLettres(total)} d’euros d’investissement. Il en reste{' '}
          <b className="text-rouge-fonce">{enLettres(pourLignes)}</b> pour de nouvelles lignes : c’est votre budget. Le reste est déjà pris
          par {pris.join(', ').replace(/, ([^,]*)$/, ' et $1')}.
        </p>
      ) : (
        <p className="text-[16px] leading-relaxed lg:text-[17px]">
          Le jeu vous donne {enLettres(b.total.montants[1])} d’euros à chaque mandat, dont {enLettres(b.bus.montants[1])} réservés d’office
          à l’entretien des bus. Ces montants viennent de la première version du jeu : nous ne les avons pas encore rapprochés des comptes{' '}
          de {b.payeur}.
        </p>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {memesMontants(b) ? (
          <div className="lg:col-span-2">
            <Calcul b={b} m={1} titre={`À chaque mandat, de ${MANDATS[1].debut} à ${MANDATS[2].fin}`} />
          </div>
        ) : (
          ([1, 2] as const).map((m) => (
            <Calcul key={m} b={b} m={m} titre={`${m === 1 ? 'Premier' : 'Second'} mandat, ${MANDATS[m].debut}-${MANDATS[m].fin}`} />
          ))
        )}
      </div>
      {source ? (
        <ul className="flex flex-col gap-2.5">
          {POSTES.filter((p) => b[p].simple).map((p) => (
            <li key={p} className="flex flex-col gap-0.5 text-[15px] leading-relaxed">
              <span className="font-extrabold">{TITRES[p]}</span>
              <span>{b[p].simple}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {source ? (
        <Deplier titre="Voir le détail du calcul et les sources">
          {POSTES.filter((p) => b[p].explication).map((p) => (
            <section key={p} className="flex flex-col gap-2">
              <h4 className="text-[15.5px] font-black">{TITRES[p]}</h4>
              <p className="text-[14.5px] leading-relaxed">{b[p].explication}</p>
              <Sources sources={b[p].sources} />
            </section>
          ))}
          {b.limites.length ? (
            <section className="flex flex-col gap-2">
              <h4 className="text-[15.5px] font-black">Ce que nous n’avons pas pu vérifier</h4>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14.5px] leading-relaxed">
                {b.limites.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {b.releve ? <p className="text-[13px] leading-relaxed text-gris">Chiffres relevés en {b.releve}.</p> : null}
        </Deplier>
      ) : null}
    </div>
  )
}

/** Ce que rapporte ou coûte chaque levier de financement, sur un mandat de six ans. */
export function ExplicationLeviers({ ville }: { ville: Ville }) {
  const p = ville.budget.leviers
  if (!p) return null
  const mesures = [
    { titre: 'Abonnements 1 % plus chers', montant: p.rendement.abonnements },
    { titre: 'Tickets 1 % plus chers', montant: p.rendement.tickets },
    { titre: 'Versement mobilité relevé de 1 %', montant: p.rendement.versementMobilite },
    ...MESURES.filter((m) => p.fixes[m.cle] !== undefined).map((m) => ({ titre: titreMesure(m, p), montant: p.fixes[m.cle]! })),
  ]
  const colonne = (titre: string, liste: typeof mesures) =>
    liste.length ? (
      <div className="flex flex-col gap-2 rounded-2xl bg-sable p-4">
        <span className="text-[13.5px] font-extrabold">{titre}</span>
        <ul className="flex flex-col gap-1.5 text-[14px]">
          {liste.map((m) => (
            <li key={m.titre} className="flex items-baseline justify-between gap-3">
              <span>{m.titre}</span>
              <span className="chiffres font-extrabold whitespace-nowrap">{n(Math.abs(m.montant))} M€</span>
            </li>
          ))}
        </ul>
      </div>
    ) : null
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] leading-relaxed lg:text-[17px]">
        En cours de partie, vous pouvez trouver de l’argent en changeant les tarifs, ou voir ce que changerait une loi. Voici ce que
        rapporte ou coûte chaque mesure sur un mandat de six ans.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {colonne(
          'Ce qui rapporte',
          mesures.filter((m) => m.montant > 0),
        )}
        {colonne(
          'Ce qui coûte',
          mesures.filter((m) => m.montant < 0),
        )}
      </div>
      <p className="text-[15px] leading-relaxed">{p.simple}</p>
      {p.sources.length ? (
        <Deplier titre="Voir le détail du calcul et les sources">
          <p className="text-[14.5px] leading-relaxed">{p.explication}</p>
          <Sources sources={p.sources} />
        </Deplier>
      ) : (
        <p className="text-[14.5px] leading-relaxed text-gris">{p.explication}</p>
      )}
    </div>
  )
}

/** L'invitation à corriger un chiffre du budget ou des leviers. */
export function EcrireBudget({ ville, compact }: { ville: Ville; compact?: boolean }) {
  return (
    <Ecrire
      compact={compact}
      sujet={`le budget ${de(ville.nom)}`}
      texte="Un budget, un tarif ou un taux vous semble faux ou dépassé ? Écrivez-nous pour que nous le corrigions."
    />
  )
}
