'use client'

import { clsx } from 'clsx'

import { finMandat, PROJETS } from '@/lib/catalogue'
import { couleurLigne, couleurProjet } from '@/lib/couleurs'
import { n, ordinal } from '@/lib/format'
import { ouverture, resoudre } from '@/lib/regles'
import { useJeu, useVille } from '@/lib/store'

import { Bouton, Icone } from '../ui'
import { useBilan } from './budget'

/** Ce que le joueur a décidé, mandat par mandat, avec une ligne par projet. */
export function useProgramme() {
  const { chantiers, lignes, mandat } = useJeu()
  const lignesProgramme = [
    ...chantiers.map((c) => {
      const p = PROJETS.get(c.id)!
      const r = resoudre(p, c)
      return {
        id: c.id,
        nom: p.nom,
        cout: r.cout,
        voyageurs: r.voyageurs,
        annee: ouverture(c.mandat, r.duree),
        mandat: c.mandat,
        etale: c.etale,
        joueur: false,
        couleur: couleurProjet(c.id, c),
      }
    }),
    ...lignes.map((l) => ({
      id: l.id,
      nom: l.nom,
      cout: l.estimation.cout,
      voyageurs: l.estimation.nouveaux,
      annee: ouverture(l.mandat, l.estimation.duree),
      mandat: l.mandat,
      etale: l.etale,
      joueur: true,
      couleur: couleurLigne(l.mode),
    })),
  ]
  return { lignesProgramme, mandat }
}

export function Programme() {
  const { mandat, ouvrir, finirMandat, ecran, tuto, aVenir, libre, retirer } = useJeu()
  const ville = useVille()
  // Sans catalogue, le programme ne compte que des lignes tracées.
  const mot = ville.catalogue ? 'projet' : 'ligne'
  // Les choix du réseau repris qui arriveront au mandat suivant.
  const nombreAVenir = aVenir ? [...aVenir.chantiers, ...aVenir.lignes].filter((x) => x.mandat === mandat + 1).length : 0
  const guide = ecran === 'tuto' && tuto === 2
  const { lignesProgramme } = useProgramme()
  const bilan = useBilan()
  const courant = lignesProgramme.filter((l) => l.mandat === mandat)
  const precedent = lignesProgramme.filter((l) => l.mandat !== mandat)

  return (
    <aside className="absolute top-24 bottom-0 left-0 z-10 hidden w-[340px] flex-col border-r border-trait bg-white lg:flex">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6.5 pt-6.5 pb-6">
        <section className="flex flex-col">
          <div className="flex items-baseline justify-between border-b border-trait pb-2">
            <h2 className="text-[17px] font-black">Votre programme</h2>
            <span className="text-[13px] font-bold text-gris">
              {courant.length} {mot}
              {courant.length > 1 ? 's' : ''}
            </span>
          </div>
          {courant.length === 0 ? (
            <p className="pt-3 text-sm leading-relaxed text-gris">
              {ville.catalogue
                ? 'Aucun projet pour l’instant. Ceux que vous construisez s’ajoutent ici.'
                : 'Aucune ligne pour l’instant. Celles que vous construisez s’ajoutent ici.'}
            </p>
          ) : (
            <ul>
              {courant.map((l) => (
                <li key={l.id} className="flex items-center gap-1 border-b border-trait">
                  <button
                    type="button"
                    onClick={() => ouvrir(l.joueur ? { type: 'ligne-joueur', id: l.id } : { type: 'projet', id: l.id })}
                    className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left"
                  >
                    <span className="grid size-8.5 shrink-0 place-items-center rounded-[10px] text-white" style={{ background: l.couleur }}>
                      <Icone nom={l.joueur ? 'trace' : 'valider'} taille={17} epaisseur={2.6} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[14.5px] leading-tight font-extrabold">{l.nom}</span>
                      <span className="chiffres text-[12.5px] font-semibold text-gris">
                        ouvre en {l.annee} · +{n(l.voyageurs)} voy./jour{l.etale ? ' · payé en deux fois' : ''}
                      </span>
                    </span>
                    <span className="chiffres text-sm font-black">{n(l.etale && mandat === 1 ? l.cout / 2 : l.cout)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => retirer(l.id)}
                    aria-label={`Retirer ${l.nom}`}
                    title="Retirer"
                    className="grid size-9 shrink-0 place-items-center rounded-full text-gris transition-colors hover:bg-rouge-pale hover:text-rouge-fonce"
                  >
                    <Icone nom="poubelle" taille={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {precedent.length > 0 ? (
            <p className="pt-3 text-[13px] leading-relaxed text-gris">
              {mandat === 2 ? 'Décidés au premier mandat' : 'Décidés aux mandats précédents'} : {precedent.map((l) => l.nom).join(', ')}.
            </p>
          ) : null}
          {nombreAVenir > 0 ? (
            <p className="pt-3 text-[13px] leading-relaxed text-gris">
              {mandat === 1 ? 'Au second mandat' : `Si vous continuez la partie après ${finMandat(mandat)}`},{' '}
              {nombreAVenir > 1 ? `les ${nombreAVenir} choix` : 'le choix'} du réseau que vous avez repris{' '}
              {nombreAVenir > 1 ? 's’ajouteront' : 's’ajoutera'} à votre programme. Vous pourrez{' '}
              {nombreAVenir > 1 ? 'les garder ou les retirer' : 'le garder ou le retirer'}.
            </p>
          ) : null}
        </section>

        <p className="text-sm leading-relaxed text-gris">
          {ville.catalogue ? 'Choisissez des projets sur la carte ou tracez votre propre ligne.' : 'Tracez vos lignes sur la carte.'}{' '}
          {libre
            ? 'Il n’y a pas de budget à tenir : quand vous avez fini, voyez votre réseau en 2038.'
            : `Quand vous avez fini, terminez le mandat. ${
                mandat === 1
                  ? 'L’argent que vous n’aurez pas dépensé passera au second mandat.'
                  : `Vous verrez votre réseau en ${finMandat(mandat)}, et vous pourrez continuer la partie : l’argent non dépensé passera au mandat suivant.`
              }`}
        </p>
      </div>

      {/* Les deux actions de la partie restent fixées en bas, quelle que soit la longueur du programme. */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-trait bg-white px-6.5 pt-4 pb-6">
        {ville.budget.leviers && !libre ? (
          <Bouton genre="sable" iconeAGauche="pieces" onClick={() => ouvrir({ type: 'leviers' })} className="justify-start">
            Trouver de l’argent
          </Bouton>
        ) : null}
        <Bouton
          genre="rouge"
          icone="drapeau"
          onClick={finirMandat}
          disabled={!libre && bilan.reste < 0}
          data-guide={guide ? '' : undefined}
        >
          {libre ? 'Voir mon réseau en 2038' : `Finir le ${ordinal(mandat)} mandat`}
        </Bouton>
        {!libre && bilan.reste < 0 ? (
          <p className="text-[13px] leading-snug font-semibold text-rouge-fonce">
            Le mandat est en déficit de {n(-bilan.reste)} M€.{' '}
            {ville.budget.leviers
              ? 'Retirez un projet ou trouvez de l’argent pour pouvoir le terminer.'
              : 'Retirez une ligne pour pouvoir le terminer.'}
          </p>
        ) : null}
      </div>
    </aside>
  )
}

export function BarreBas() {
  const { ouvrir, finirMandat, ecran, tuto, libre } = useJeu()
  const ville = useVille()
  const guide = ecran === 'tuto' && tuto === 2
  const bilan = useBilan()
  if (libre) {
    return (
      <div className="absolute inset-x-0 bottom-0 z-20 grid border-t border-trait bg-white px-4 pt-3 pb-6 lg:hidden">
        <Bouton genre="rouge" icone="drapeau" taille="petit" className="min-h-13 text-[13.5px]! whitespace-nowrap" onClick={finirMandat}>
          Voir mon réseau en 2038
        </Bouton>
      </div>
    )
  }
  // Sans leviers de financement, un déficit se comble en retirant une ligne depuis la liste.
  const combler = () => ouvrir(ville.budget.leviers ? { type: 'leviers' } : { type: 'liste' })
  return (
    <div
      className={clsx(
        'absolute inset-x-0 bottom-0 z-20 grid gap-2 border-t border-trait bg-white px-4 pt-3 pb-6 lg:hidden',
        ville.budget.leviers ? 'grid-cols-2' : 'grid-cols-1',
      )}
    >
      {ville.budget.leviers ? (
        <Bouton
          genre="sable"
          iconeAGauche="pieces"
          taille="petit"
          className="min-h-13 justify-start px-3.5! text-[13.5px]! whitespace-nowrap"
          onClick={() => ouvrir({ type: 'leviers' })}
        >
          Trouver de l’argent
        </Bouton>
      ) : null}
      <Bouton
        genre="rouge"
        icone="drapeau"
        taille="petit"
        className="min-h-13 text-[13.5px]! whitespace-nowrap"
        data-guide={guide ? '' : undefined}
        onClick={() => (bilan.reste < 0 ? combler() : finirMandat())}
        aria-describedby={bilan.reste < 0 ? 'deficit' : undefined}
      >
        {bilan.reste < 0 ? (ville.budget.leviers ? 'Combler le déficit' : 'Retirer une ligne') : 'Finir le mandat'}
      </Bouton>
      {bilan.reste < 0 ? (
        <span id="deficit" className="sr-only">
          Le mandat est en déficit de {n(-bilan.reste)} millions d’euros.
        </span>
      ) : null}
    </div>
  )
}
