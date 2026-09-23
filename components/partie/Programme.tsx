'use client'

import { clsx } from 'clsx'

import { PROJETS } from '@/lib/catalogue'
import { couleurLigne, couleurProjet } from '@/lib/couleurs'
import { n } from '@/lib/format'
import { ouverture, resoudre } from '@/lib/regles'
import { useJeu } from '@/lib/store'

import { Bouton, Icone, Surtitre } from '../ui'
import { useBilan } from './budget'

function Etape({ numero, texte, etat }: { numero: number; texte: string; etat: 'fait' | 'encours' | 'avenir' }) {
  return (
    <li className={clsx('flex items-center gap-2.5 text-sm font-extrabold', etat === 'avenir' ? 'text-muet' : 'text-encre')}>
      <span
        className={clsx(
          'chiffres grid size-6.5 place-items-center rounded-full text-xs font-black',
          etat === 'fait' && 'bg-rouge text-white',
          etat === 'encours' && 'bg-white text-rouge shadow-[inset_0_0_0_2.5px_var(--color-rouge)]',
          etat === 'avenir' && 'bg-sable text-muet',
        )}
      >
        {etat === 'fait' ? <Icone nom="valider" taille={14} epaisseur={3} /> : numero}
      </span>
      {texte}
      {etat === 'encours' ? <span className="sr-only">(en cours)</span> : null}
    </li>
  )
}

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
  const { mandat, ouvrir, finirMandat, ecran, tuto, aVenir } = useJeu()
  const nombreAVenir = aVenir ? aVenir.chantiers.length + aVenir.lignes.length : 0
  const guide = ecran === 'tuto' && tuto === 2
  const { lignesProgramme } = useProgramme()
  const bilan = useBilan()
  const courant = lignesProgramme.filter((l) => l.mandat === mandat)
  const precedent = lignesProgramme.filter((l) => l.mandat !== mandat)

  return (
    <aside className="absolute top-24 bottom-0 left-0 z-10 hidden w-[340px] flex-col border-r border-trait bg-white lg:flex">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6.5 pt-6.5 pb-6">
        <div className="flex flex-col gap-3">
          <Surtitre>Où vous en êtes</Surtitre>
          <ol className="flex flex-col gap-3">
            <Etape numero={1} texte="Premier mandat, 2026-2032" etat={mandat === 1 ? 'encours' : 'fait'} />
            <Etape numero={2} texte="Second mandat, 2032-2038" etat={mandat === 2 ? 'encours' : 'avenir'} />
            <Etape numero={3} texte="Votre réseau en 2038" etat="avenir" />
          </ol>
        </div>

        <section className="flex flex-col">
          <div className="flex items-baseline justify-between border-b border-trait pb-2">
            <h2 className="text-[17px] font-black">Votre programme</h2>
            <span className="text-[13px] font-bold text-gris">
              {courant.length} projet{courant.length > 1 ? 's' : ''}
            </span>
          </div>
          {courant.length === 0 ? (
            <p className="pt-3 text-sm leading-relaxed text-gris">Aucun projet pour l’instant. Ceux que vous construisez s’ajoutent ici.</p>
          ) : (
            <ul>
              {courant.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => ouvrir(l.joueur ? { type: 'liste' } : { type: 'projet', id: l.id })}
                    className="flex w-full items-center gap-3 border-b border-trait py-3 text-left"
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
                </li>
              ))}
            </ul>
          )}
          {precedent.length > 0 ? (
            <p className="pt-3 text-[13px] leading-relaxed text-gris">
              Décidés au premier mandat : {precedent.map((l) => l.nom).join(', ')}.
            </p>
          ) : null}
          {nombreAVenir > 0 ? (
            <p className="pt-3 text-[13px] leading-relaxed text-gris">
              Au second mandat, {nombreAVenir > 1 ? `les ${nombreAVenir} choix` : 'le choix'} du réseau que vous avez repris{' '}
              {nombreAVenir > 1 ? 's’ajouteront' : 's’ajoutera'} à votre programme. Vous pourrez les garder ou les retirer.
            </p>
          ) : null}
        </section>

        <p className="text-sm leading-relaxed text-gris">
          Choisissez des projets sur la carte ou tracez votre propre ligne. Quand vous avez fini, terminez le mandat.{' '}
          {mandat === 1
            ? 'L’argent que vous n’aurez pas dépensé passera au second mandat.'
            : 'L’argent non dépensé restera disponible pour la suite.'}
        </p>
      </div>

      {/* Les deux actions de la partie restent fixées en bas, quelle que soit la longueur du programme. */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-trait bg-white px-6.5 pt-4 pb-6">
        <Bouton genre="sable" iconeAGauche="pieces" onClick={() => ouvrir({ type: 'leviers' })} className="justify-start">
          Trouver de l’argent
        </Bouton>
        <Bouton genre="rouge" icone="drapeau" onClick={finirMandat} disabled={bilan.reste < 0} data-guide={guide ? '' : undefined}>
          {mandat === 1 ? 'Finir le premier mandat' : 'Finir le second mandat'}
        </Bouton>
        {bilan.reste < 0 ? (
          <p className="text-[13px] leading-snug font-semibold text-rouge-fonce">
            Le mandat est en déficit de {n(-bilan.reste)} M€. Retirez un projet ou trouvez de l’argent pour pouvoir le terminer.
          </p>
        ) : null}
      </div>
    </aside>
  )
}

export function BarreBas() {
  const { ouvrir, finirMandat, mandat, ecran, tuto } = useJeu()
  const guide = ecran === 'tuto' && tuto === 2
  const bilan = useBilan()
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-2 gap-2 border-t border-trait bg-white px-4 pt-3 pb-6 lg:hidden">
      <Bouton
        genre="sable"
        iconeAGauche="pieces"
        taille="petit"
        className="min-h-13 justify-start px-3.5! text-[13.5px]! whitespace-nowrap"
        onClick={() => ouvrir({ type: 'leviers' })}
      >
        Trouver de l’argent
      </Bouton>
      <Bouton
        genre="rouge"
        icone="drapeau"
        taille="petit"
        className="min-h-13 text-[13.5px]! whitespace-nowrap"
        data-guide={guide ? '' : undefined}
        onClick={() => (bilan.reste < 0 ? ouvrir({ type: 'leviers' }) : finirMandat())}
        aria-describedby={bilan.reste < 0 ? 'deficit' : undefined}
      >
        {bilan.reste < 0 ? 'Combler le déficit' : mandat === 1 ? 'Finir le mandat' : 'Finir la partie'}
      </Bouton>
      {bilan.reste < 0 ? (
        <span id="deficit" className="sr-only">
          Le mandat est en déficit de {n(-bilan.reste)} millions d’euros.
        </span>
      ) : null}
    </div>
  )
}
