'use client'

import { clsx } from 'clsx'
import { useMemo, useState, type ReactNode } from 'react'

import { catalogueDe, mots } from '@/lib/catalogue'
import { couleurLigne, couleurProjet } from '@/lib/couleurs'
import { approx, n } from '@/lib/format'
import { ouverture, resoudre } from '@/lib/regles'
import { useJeu, useVille } from '@/lib/store'

import { Icone, ICONE_MODE } from '../ui'
import { Panneau } from './Panneau'
import { useMeilleurRendement } from './Rendement'

type Tri = 'voyageurs' | 'rendement' | 'prix' | 'ouverture'

const GRILLE = 'lg:grid-cols-[minmax(0,3fr)_0.9fr_1.8fr_1.3fr_0.7fr_1.3fr]'

/** Une barre fine, rapportée au plus grand de la liste : les voyageurs ou les voyageurs par million. */
function Barre({ part, forte = false }: { part: number; forte?: boolean }) {
  // Sous le nombre de voyageurs, la barre prend toute la largeur de sa colonne ; à côté du rapport, elle partage la rangée.
  return (
    <span className={clsx('block h-1.5 overflow-hidden rounded-full', forte ? 'w-full bg-rouge-pale' : 'flex-1 bg-sable')}>
      <span
        className={clsx('block h-full', forte ? 'bg-rouge' : 'bg-encre')}
        style={{ width: `${Math.min(100, Math.max(2, part * 100))}%` }}
      />
    </span>
  )
}

/**
 * Une rangée du tableau, la même pour un projet du catalogue et pour une ligne tracée : son nom, son prix, les voyageurs
 * qu'elle ajoute au score, mis en avant, puis ses voyageurs par million et son année d'ouverture.
 */
function Rangee({
  icone,
  nom,
  resume,
  cout,
  voyageurs,
  detailVoyageurs,
  partVoyageurs,
  rendement,
  partRendement,
  annee,
  action,
  choisi,
}: {
  icone: ReactNode
  nom: string
  resume: ReactNode
  cout: number
  voyageurs: number
  detailVoyageurs?: string
  partVoyageurs: number
  rendement: number
  partRendement: number
  annee: number
  action: ReactNode
  choisi: boolean
}) {
  return (
    <div
      role="row"
      className={clsx(
        'grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-b border-trait px-5 py-3 lg:gap-4 lg:px-7',
        GRILLE,
        choisi && 'bg-[#fff7f8]',
      )}
    >
      <span role="cell" className="flex min-w-0 items-center gap-3">
        {icone}
        <span className="flex min-w-0 flex-col">
          <span className="leading-tight font-extrabold">{nom}</span>
          <span className="chiffres text-[12.5px] font-semibold text-gris lg:hidden">{resume}</span>
        </span>
      </span>
      <span role="cell" className="chiffres text-right font-black lg:text-left">
        {n(cout)} M€
      </span>
      <span role="cell" className="hidden flex-col gap-1 lg:flex">
        <span className="flex items-baseline gap-2">
          <span className="chiffres text-[17px] font-black text-rouge">+{n(voyageurs)}</span>
          {detailVoyageurs ? <span className="text-[11.5px] leading-tight font-bold text-gris">{detailVoyageurs}</span> : null}
        </span>
        <Barre part={partVoyageurs} forte />
      </span>
      <span role="cell" className="hidden items-center gap-2.5 lg:flex">
        <Barre part={partRendement} />
        <span className="chiffres w-9 text-right font-extrabold">{n(rendement)}</span>
      </span>
      <span role="cell" className="chiffres hidden font-bold lg:block">
        {annee}
      </span>
      <span role="cell" className="col-span-2 flex flex-wrap gap-1.5 lg:col-span-1">
        {action}
      </span>
    </div>
  )
}

/** Sur téléphone, le résumé sous le nom : les voyageurs d'abord, en couleur, puis le rapport par million et l'ouverture. */
const Resume = ({ voyageurs, detail, rendement, annee }: { voyageurs: number; detail?: string; rendement: number; annee: number }) => (
  <>
    <b className="font-black text-rouge">+{n(voyageurs)} voyageurs par jour</b>
    {detail ? ` ${detail}` : ''} · {n(rendement)} par M€ · {annee}
  </>
)

export function Liste() {
  const { chantiers, lignes, mandat, ouvrir, retirer, changerPaiement } = useJeu()
  const ville = useVille()
  const [tri, setTri] = useState<Tri>('voyageurs')
  const catalogue = catalogueDe(ville.id)
  const meilleur = useMeilleurRendement()

  const lignesTableau = useMemo(() => {
    const faits = new Map(chantiers.map((c) => [c.id, c]))
    const rows = catalogue.map((p) => {
      const c = faits.get(p.id)
      const r = resoudre(p, c)
      return { p, r, c, rendement: r.cout > 0 ? r.voyageurs / r.cout : 0, annee: ouverture(c?.mandat ?? mandat, r.duree) }
    })
    rows.sort((a, b) =>
      tri === 'voyageurs'
        ? b.r.voyageurs - a.r.voyageurs
        : tri === 'rendement'
          ? b.rendement - a.rendement
          : tri === 'prix'
            ? a.r.cout - b.r.cout
            : a.annee - b.annee,
    )
    return rows
  }, [catalogue, chantiers, mandat, tri])

  // La barre des voyageurs se rapporte au plus fréquenté de la liste, projets et lignes tracées ensemble.
  const plusFrequente = Math.max(1, ...lignesTableau.map((x) => x.r.voyageurs), ...lignes.map((l) => l.estimation.nouveaux))
  const echelleRendement =
    meilleur || Math.max(1, ...lignes.map((l) => (l.estimation.cout > 0 ? l.estimation.nouveaux / l.estimation.cout : 0)))

  const tris: { id: Tri; texte: string }[] = [
    { id: 'voyageurs', texte: 'Voyageurs par jour' },
    { id: 'rendement', texte: 'Voyageurs par euro' },
    { id: 'prix', texte: 'Prix' },
    { id: 'ouverture', texte: 'Ouverture' },
  ]

  const bouton = 'min-h-10 rounded-full px-4 text-[13.5px] font-extrabold'

  return (
    <Panneau titre={ville.catalogue ? `${catalogue.length} projets` : 'Vos lignes'} largeur="pleine" hauteurTelephone="pleine">
      {ville.catalogue ? (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Trier les projets">
          <span className="mr-1 text-[13px] font-semibold text-gris">Trier par</span>
          {tris.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tri === t.id}
              onClick={() => setTri(t.id)}
              className={clsx(
                'min-h-9 rounded-full px-3.5 text-[13.5px] font-extrabold',
                tri === t.id ? 'bg-encre text-white' : 'bg-sable text-encre',
              )}
            >
              {t.texte}
            </button>
          ))}
        </div>
      ) : null}

      <div className="-mx-5 lg:-mx-7" role="table" aria-label={ville.catalogue ? 'Vos lignes et les projets du catalogue' : 'Vos lignes'}>
        <div
          role="row"
          className={clsx(
            'hidden gap-4 border-y border-trait px-7 py-2.5 text-xs font-extrabold tracking-[0.06em] text-muet uppercase lg:grid',
            GRILLE,
          )}
        >
          <span role="columnheader">{ville.catalogue ? 'Projet' : 'Ligne'}</span>
          <span role="columnheader">Prix</span>
          <span role="columnheader">Voyageurs par jour</span>
          <span role="columnheader">Voyageurs par M€</span>
          <span role="columnheader">Ouverture</span>
          <span role="columnheader">
            <span className="sr-only">Action</span>
          </span>
        </div>

        {lignes.length ? (
          <>
            {ville.catalogue ? <h3 className="px-5 pt-4 pb-1 text-base font-black lg:px-7">Vos lignes</h3> : null}
            {lignes.map((l) => {
              const e = l.estimation
              const rendement = e.cout > 0 ? e.nouveaux / e.cout : 0
              const annee = ouverture(l.mandat, e.duree)
              const detail = `nouveaux, sur ${approx(e.voyageurs)}`
              return (
                <Rangee
                  key={l.id}
                  choisi
                  icone={
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
                      style={{ background: couleurLigne(l.mode) }}
                    >
                      <Icone nom="trace" taille={19} />
                    </span>
                  }
                  nom={l.nom}
                  resume={<Resume voyageurs={e.nouveaux} detail={detail} rendement={rendement} annee={annee} />}
                  cout={e.cout}
                  voyageurs={e.nouveaux}
                  detailVoyageurs={detail}
                  partVoyageurs={e.nouveaux / plusFrequente}
                  rendement={rendement}
                  partRendement={rendement / echelleRendement}
                  annee={annee}
                  action={
                    <>
                      <button
                        type="button"
                        onClick={() => ouvrir({ type: 'ligne-joueur', id: l.id })}
                        className={clsx(bouton, 'bg-white shadow-[inset_0_0_0_1.5px_var(--color-trait)]')}
                      >
                        Voir la ligne
                      </button>
                      {l.mandat === mandat && mandat === 1 ? (
                        <button type="button" onClick={() => changerPaiement(l.id, !l.etale)} className={clsx(bouton, 'bg-sable')}>
                          {l.etale ? 'Payer en une fois' : 'Payer en deux fois'}
                        </button>
                      ) : null}
                      {l.mandat === mandat ? (
                        <button
                          type="button"
                          onClick={() => retirer(l.id)}
                          aria-label={`Retirer ${l.nom}`}
                          title="Retirer"
                          className="grid size-10 place-items-center rounded-full bg-sable text-rouge-fonce transition-colors hover:bg-rouge hover:text-white"
                        >
                          <Icone nom="poubelle" taille={18} />
                        </button>
                      ) : null}
                    </>
                  }
                />
              )
            })}
            {ville.catalogue ? <h3 className="px-5 pt-5 pb-1 text-base font-black lg:px-7">Les projets du catalogue</h3> : null}
          </>
        ) : null}

        {ville.catalogue
          ? lignesTableau.map(({ p, r, c, rendement, annee }) => {
              // Faute d'étude publiée, ce chiffre est le nôtre : on le dit dans la liste comme dans la fiche.
              const detail = p.estime?.voyageurs ? 'notre estimation' : undefined
              return (
                <Rangee
                  key={p.id}
                  choisi={Boolean(c)}
                  icone={
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl"
                      style={
                        c
                          ? { background: couleurProjet(p.id, c), color: '#fff' }
                          : { boxShadow: `inset 0 0 0 2px ${couleurProjet(p.id)}`, color: couleurProjet(p.id) }
                      }
                    >
                      <Icone nom={c ? 'valider' : ICONE_MODE[r.mode]!} taille={19} epaisseur={c ? 2.8 : 2} />
                    </span>
                  }
                  nom={p.nom}
                  resume={
                    <Resume voyageurs={r.voyageurs} detail={detail ? `, ${detail}` : undefined} rendement={rendement} annee={annee} />
                  }
                  cout={r.cout}
                  voyageurs={r.voyageurs}
                  detailVoyageurs={detail}
                  partVoyageurs={r.voyageurs / plusFrequente}
                  rendement={rendement}
                  partRendement={rendement / (meilleur || 1)}
                  annee={annee}
                  action={
                    c && c.mandat === mandat ? (
                      <button
                        type="button"
                        onClick={() => ouvrir({ type: 'projet', id: p.id })}
                        className={clsx(bouton, 'bg-white shadow-[inset_0_0_0_1.5px_var(--color-trait)]')}
                      >
                        Modifier
                      </button>
                    ) : c ? (
                      <span className="text-[13px] font-extrabold text-rouge">{mots(p.id).participe}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => ouvrir({ type: 'projet', id: p.id })}
                        className={clsx(bouton, 'bg-rouge-pale text-rouge-fonce')}
                      >
                        Voir le projet
                      </button>
                    )
                  }
                />
              )
            })
          : null}
      </div>
    </Panneau>
  )
}
