'use client'

import { clsx } from 'clsx'
import { useMemo, useState } from 'react'

import { CATALOGUE, mots } from '@/lib/catalogue'
import { couleurLigne, couleurProjet } from '@/lib/couleurs'
import { n } from '@/lib/format'
import { ouverture, resoudre, totauxCatalogue } from '@/lib/regles'
import { useJeu, useVille } from '@/lib/store'

import { Icone, ICONE_MODE } from '../ui'
import { Panneau } from './Panneau'

type Tri = 'rendement' | 'prix' | 'ouverture'
const MEILLEUR = totauxCatalogue(CATALOGUE).meilleur

export function Liste() {
  const { chantiers, lignes, mandat, ouvrir, retirer, changerPaiement } = useJeu()
  const ville = useVille()
  const [tri, setTri] = useState<Tri>('rendement')

  const lignesTableau = useMemo(() => {
    const faits = new Map(chantiers.map((c) => [c.id, c]))
    const rows = CATALOGUE.map((p) => {
      const c = faits.get(p.id)
      const r = resoudre(p, c)
      return { p, r, c, rendement: r.cout > 0 ? r.voyageurs / r.cout : 0, annee: ouverture(c?.mandat ?? mandat, r.duree) }
    })
    rows.sort((a, b) => (tri === 'rendement' ? b.rendement - a.rendement : tri === 'prix' ? a.r.cout - b.r.cout : a.annee - b.annee))
    return rows
  }, [chantiers, mandat, tri])

  const tris: { id: Tri; texte: string }[] = [
    { id: 'rendement', texte: 'Voyageurs par euro' },
    { id: 'prix', texte: 'Prix' },
    { id: 'ouverture', texte: 'Ouverture' },
  ]

  return (
    <Panneau titre={ville.catalogue ? `${CATALOGUE.length} projets` : 'Vos lignes'} largeur="pleine" hauteurTelephone="pleine">
      {/* Sans catalogue, le panneau ne montre que les lignes tracées. */}
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

      {lignes.length > 0 ? (
        <section className="flex flex-col gap-2">
          {ville.catalogue ? <h3 className="text-base font-black">Vos lignes</h3> : null}
          {lignes.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-2xl bg-rouge-pale px-4 py-3">
              <span style={{ color: couleurLigne(l.mode) }}>
                <Icone nom="trace" taille={20} />
              </span>
              <button type="button" onClick={() => ouvrir({ type: 'ligne-joueur', id: l.id })} className="flex flex-1 flex-col text-left">
                <span className="font-extrabold underline-offset-3 hover:underline">{l.nom}</span>
                <span className="chiffres text-[12.5px] font-semibold text-gris">
                  {n(l.estimation.cout)} M€ · +{n(l.estimation.nouveaux)} nouveaux voyageurs par jour · ouvre en{' '}
                  {ouverture(l.mandat, l.estimation.duree)}
                </span>
              </button>
              {l.mandat === mandat ? (
                <span className="flex flex-wrap justify-end gap-1.5">
                  {mandat === 1 ? (
                    <button
                      type="button"
                      onClick={() => changerPaiement(l.id, !l.etale)}
                      className="min-h-10 rounded-full bg-white px-3.5 text-[13px] font-extrabold"
                    >
                      {l.etale ? 'Payer en une fois' : 'Payer en deux fois'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => retirer(l.id)}
                    aria-label={`Retirer ${l.nom}`}
                    title="Retirer"
                    className="grid size-10 place-items-center rounded-full bg-white text-rouge-fonce transition-colors hover:bg-rouge hover:text-white"
                  >
                    <Icone nom="poubelle" taille={18} />
                  </button>
                </span>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {ville.catalogue ? (
        <div className="-mx-5 lg:-mx-7" role="table" aria-label="Projets du catalogue">
          <div
            role="row"
            className="hidden grid-cols-[minmax(0,3.2fr)_1fr_1.2fr_1.6fr_0.8fr_1.2fr] gap-4 border-y border-trait px-7 py-2.5 text-xs font-extrabold tracking-[0.06em] text-muet uppercase lg:grid"
          >
            <span role="columnheader">Projet</span>
            <span role="columnheader">Prix</span>
            <span role="columnheader">Voyageurs par jour</span>
            <span role="columnheader">Voyageurs par M€</span>
            <span role="columnheader">Ouverture</span>
            <span role="columnheader">
              <span className="sr-only">Action</span>
            </span>
          </div>
          {lignesTableau.map(({ p, r, c, rendement, annee }) => (
            <div
              key={p.id}
              role="row"
              className={clsx(
                'grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-b border-trait px-5 py-3 lg:grid-cols-[minmax(0,3.2fr)_1fr_1.2fr_1.6fr_0.8fr_1.2fr] lg:gap-4 lg:px-7',
                c && 'bg-[#fff7f8]',
              )}
            >
              <span role="cell" className="flex min-w-0 items-center gap-3">
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
                <span className="flex min-w-0 flex-col">
                  <span className="leading-tight font-extrabold">{p.nom}</span>
                  <span className="chiffres text-[12.5px] font-semibold text-gris lg:hidden">
                    +{n(r.voyageurs)} voy./jour · {n(rendement)} par M€ · {annee}
                  </span>
                </span>
              </span>
              <span role="cell" className="chiffres text-right font-black lg:text-left">
                {n(r.cout)} M€
              </span>
              <span role="cell" className="chiffres hidden font-extrabold text-rouge lg:block">
                +{n(r.voyageurs)}
              </span>
              <span role="cell" className="hidden items-center gap-2.5 lg:flex">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sable">
                  <span className="block h-full bg-encre" style={{ width: `${Math.min(100, (rendement / MEILLEUR) * 100)}%` }} />
                </span>
                <span className="chiffres w-9 text-right font-extrabold">{n(rendement)}</span>
              </span>
              <span role="cell" className="chiffres hidden font-bold lg:block">
                {annee}
              </span>
              <span role="cell" className="col-span-2 lg:col-span-1">
                {c && c.mandat === mandat ? (
                  <button
                    type="button"
                    onClick={() => ouvrir({ type: 'projet', id: p.id })}
                    className="min-h-10 rounded-full bg-white px-4 text-[13.5px] font-extrabold shadow-[inset_0_0_0_1.5px_var(--color-trait)]"
                  >
                    Modifier
                  </button>
                ) : c ? (
                  <span className="text-[13px] font-extrabold text-rouge">{mots(p.id).participe}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => ouvrir({ type: 'projet', id: p.id })}
                    className="min-h-10 rounded-full bg-rouge-pale px-4 text-[13.5px] font-extrabold text-rouge-fonce"
                  >
                    Voir le projet
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </Panneau>
  )
}
