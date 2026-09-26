'use client'

import { clsx } from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { MANDATS, mots, PROJETS } from '@/lib/catalogue'
import { couleurProjet } from '@/lib/couleurs'
import { n } from '@/lib/format'
import { ouverture, resoudre } from '@/lib/regles'
import { useJeu } from '@/lib/store'
import type { PointProjet } from '@/lib/types'

import { Deplier } from '../explications/Deplier'
import { Sources } from '../explications/Budget'
import { useBilan } from '../partie/budget'
import { Bouton, CarteChiffre, Icone, ICONE_MODE, Pastille, Surtitre } from '../ui'
import { Panneau } from './Panneau'
import { Rendement } from './Rendement'

function Voie({ titre, detail, onClick, possible }: { titre: string; detail: string; onClick: () => void; possible?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left transition-shadow',
        possible
          ? 'shadow-[inset_0_0_0_2.5px_var(--color-rouge)]'
          : 'shadow-[inset_0_0_0_1.5px_var(--color-trait)] hover:shadow-[inset_0_0_0_1.5px_var(--color-muet)]',
      )}
    >
      <span className="flex flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15.5px] font-extrabold">{titre}</span>
          {possible ? <span className="rounded-full bg-rouge px-2 py-0.5 text-[11.5px] font-extrabold text-white">Possible</span> : null}
        </span>
        <span className="text-[13.5px] leading-snug text-gris">{detail}</span>
      </span>
      <Icone nom="fleche" taille={19} epaisseur={2.3} className="text-rouge" />
    </button>
  )
}

export function FicheProjet({ id }: { id: string }) {
  const projet = PROJETS.get(id)!
  const { chantiers, mandat, construire, retirer, ouvrir, setApercu, changerPaiement, ecran, tuto, libre } = useJeu()
  const { verbe } = mots(id)
  const guide = ecran === 'tuto' && tuto === 1
  const bilan = useBilan()
  const existant = chantiers.find((c) => c.id === id)
  const [varianteId, setVarianteId] = useState(existant?.varianteId ?? projet.variantes?.[0]?.id)
  const [option, setOption] = useState(existant?.option ?? false)
  const r = useMemo(() => resoudre(projet, { varianteId, option }), [projet, varianteId, option])

  const dependance = projet.requiert ? PROJETS.get(projet.requiert) : undefined
  const bloque = dependance && !chantiers.some((c) => c.id === dependance.id)
  // En jeu libre, il n'y a pas de budget à tenir : rien n'est trop cher, et tout se paie en une fois.
  const reste = libre ? Infinity : bilan.reste
  const annee = ouverture(existant?.mandat ?? mandat, r.duree)
  const apresFin = annee > MANDATS[2].fin
  const peutEtaler = mandat === 1 && !libre
  const moitie = Math.round(r.cout / 2)

  useEffect(() => {
    setApercu(existant || bloque ? 0 : r.cout)
  }, [r.cout, existant, bloque, setApercu])

  const message = {
    titre: 'C’est lancé.',
    texte:
      r.voyageurs > 0
        ? `${projet.nom} : ${n(r.voyageurs)} voyageurs de plus par jour à partir de ${annee}.`
        : `${projet.nom} : travaux terminés en ${annee}.`,
  }
  const bati = (etale: boolean) => construire({ id, varianteId, option, etale }, message)

  // Ce que libéreraient les projets déjà choisis sur ce mandat.
  const liberable = chantiers
    .filter((c) => c.mandat === mandat)
    .reduce((t, c) => t + resoudre(PROJETS.get(c.id)!, c).cout * (c.etale ? 0.5 : 1), 0)

  let pied: React.ReactNode = null
  let corpsManque: React.ReactNode = null

  if (existant) {
    pied =
      existant.mandat === mandat ? (
        <Bouton genre="contour" iconeAGauche="annuler" onClick={() => retirer(id)}>
          Retirer ce projet
        </Bouton>
      ) : (
        <p className="text-sm leading-relaxed text-gris">Décidé pendant le premier mandat, ce projet ne peut plus être retiré.</p>
      )
  } else if (bloque) {
    pied = (
      <Bouton genre="rouge" icone="fleche" onClick={() => ouvrir({ type: 'projet', id: dependance!.id })}>
        Voir {dependance!.nom}
      </Bouton>
    )
  } else if (r.cout <= reste) {
    pied = (
      <>
        <Bouton genre="rouge" icone="valider" taille="grand" onClick={() => bati(false)} data-guide={guide ? '' : undefined}>
          {verbe} pour {n(r.cout)} M€
        </Bouton>
        {peutEtaler ? (
          <Bouton genre="contour" taille="petit" onClick={() => bati(true)}>
            Payer la moitié maintenant, la moitié en 2032
          </Bouton>
        ) : null}
      </>
    )
  } else {
    corpsManque = (
      <>
        <div className="flex items-center gap-3.5 rounded-2xl bg-encre px-4 py-3.5 text-white">
          <div className="chiffres text-[26px] font-black tracking-tight whitespace-nowrap text-[#ff6b78]">
            -{n(r.cout - Math.max(reste, 0))} M€
          </div>
          <div className="text-sm leading-snug font-semibold">
            Ce projet coûte {n(r.cout)} M€ et il vous en reste {n(Math.max(reste, 0))}.
          </div>
        </div>
        <div className="text-[15px] font-extrabold">Vous pouvez quand même le construire :</div>
        <div className="flex flex-col gap-2">
          {peutEtaler ? (
            <Voie
              titre="Payer la moitié maintenant, la moitié en 2032"
              detail={
                moitie <= reste
                  ? `${n(moitie)} M€ sur ce mandat, ${n(r.cout - moitie)} M€ réservés sur le suivant. Il vous restera ${n(reste - moitie)} M€.`
                  : `${n(moitie)} M€ sur ce mandat : il manquerait encore ${n(moitie - reste)} M€.`
              }
              possible={moitie <= reste}
              onClick={() => bati(true)}
            />
          ) : null}
          <Voie
            titre="Trouver de l’argent"
            detail="Hausse des tarifs, baisse de la TVA, versement des entreprises."
            onClick={() => ouvrir({ type: 'leviers' })}
          />
          {liberable > 0 ? (
            <Voie
              titre="Retirer un projet déjà choisi"
              detail={
                liberable >= r.cout - reste
                  ? `Vos projets de ce mandat libéreraient jusqu’à ${n(liberable)} M€.`
                  : `Vos projets de ce mandat libéreraient ${n(liberable)} M€. Il manquerait encore ${n(r.cout - reste - liberable)} M€.`
              }
              onClick={() => ouvrir({ type: 'liste' })}
            />
          ) : null}
        </div>
      </>
    )
    pied = (
      <button type="button" onClick={() => bati(false)} className="min-h-12 text-sm font-extrabold text-gris underline underline-offset-4">
        {verbe} quand même, et combler le déficit ensuite
      </button>
    )
  }

  return (
    <Panneau
      surtitre={
        <Pastille icone={ICONE_MODE[r.mode]} couleur={couleurProjet(id, { varianteId, option })}>
          {projet.genre}
        </Pastille>
      }
      titre={projet.nom}
      pied={pied}
    >
      {guide && !existant ? (
        <div className="flex items-start gap-3 rounded-2xl bg-encre p-4 text-white">
          <Icone nom="main" taille={22} className="mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1.5 text-[14.5px] leading-relaxed">
            <span className="text-xs font-extrabold tracking-[0.08em] text-white/70 uppercase">Première décision, étape 2 sur 3</span>
            <span>
              Il coûte {n(r.cout)} M€ : la partie noire de la jauge, tout en haut, montre ce qu’il prendrait sur votre budget. Il
              apporterait {n(r.voyageurs)} voyageurs par jour.
            </span>
            <span className="font-extrabold">
              Appuyez sur « {verbe} pour {n(r.cout)} M€ » pour le lancer.
            </span>
          </div>
        </div>
      ) : null}

      <p className="text-[15px] leading-relaxed text-gris">{projet.description}</p>

      {projet.statut ? (
        <div className="flex flex-col gap-1 rounded-2xl bg-sable px-4 py-3">
          <Surtitre>Où en est le projet</Surtitre>
          <p className="text-[14px] leading-snug font-semibold">{projet.statut}</p>
        </div>
      ) : null}

      {corpsManque}

      {existant ? (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rouge-pale px-4 py-3 text-sm font-bold text-rouge-fonce">
          <Icone nom="valider" taille={18} epaisseur={2.8} />
          {libre ? 'Dans votre programme.' : `Dans votre programme depuis le mandat ${existant.mandat}.`}
        </div>
      ) : null}

      {existant && existant.mandat === mandat && mandat === 1 && !libre ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[15px] font-extrabold">Comment le payer</legend>
          {[
            { etale: false, titre: 'En une fois', detail: `${n(r.cout)} M€ sur ce mandat.` },
            {
              etale: true,
              titre: 'En deux fois',
              detail: `${n(moitie)} M€ maintenant, ${n(r.cout - moitie)} M€ réservés sur le mandat 2032-2038.`,
            },
          ].map((o) => (
            <label
              key={o.titre}
              className={clsx(
                'flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-4 py-3',
                existant.etale === o.etale
                  ? 'shadow-[inset_0_0_0_2.5px_var(--color-rouge)]'
                  : 'shadow-[inset_0_0_0_1.5px_var(--color-trait)]',
              )}
            >
              <input
                type="radio"
                name="paiement"
                checked={existant.etale === o.etale}
                onChange={() => changerPaiement(id, o.etale)}
                className="mt-1 size-5 accent-rouge"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-extrabold">{o.titre}</span>
                <span className="text-[13.5px] leading-snug text-gris">{o.detail}</span>
              </span>
            </label>
          ))}
          <p className="text-[13px] leading-snug text-gris">
            {existant.etale
              ? 'Payer en deux fois libère de l’argent maintenant, mais votre second mandat commencera déjà engagé.'
              : 'Payer en une fois laisse votre second mandat libre.'}
          </p>
        </fieldset>
      ) : null}

      {bloque ? (
        <div className="rounded-2xl bg-sable px-4 py-3.5 text-sm leading-relaxed">
          Ce projet prolonge {dependance!.nom}. Il faut d’abord construire celui-ci.
        </div>
      ) : null}

      {projet.variantes && !existant ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[15px] font-extrabold">Choisissez une version</legend>
          {projet.variantes.map((v) => {
            const choisi = v.id === varianteId
            const tropCher = v.cout > reste
            return (
              <label
                key={v.id}
                className={clsx(
                  'flex cursor-pointer gap-3 rounded-2xl bg-white px-4 py-3.5',
                  choisi ? 'shadow-[inset_0_0_0_2.5px_var(--color-rouge)]' : 'shadow-[inset_0_0_0_1.5px_var(--color-trait)]',
                )}
              >
                <input
                  type="radio"
                  name="variante"
                  value={v.id}
                  checked={choisi}
                  onChange={() => setVarianteId(v.id)}
                  className="mt-1 size-5 accent-rouge"
                />
                <span className="flex flex-1 flex-col gap-1.5">
                  <span className="text-base font-extrabold">{v.nom}</span>
                  <span className="text-[13.5px] leading-snug text-gris">{v.detail}</span>
                  <span className="chiffres flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] font-extrabold">
                    <span>{n(v.cout)} M€</span>
                    <span className="text-rouge">+{n(v.voyageurs)} voy./jour</span>
                    <span className="text-gris">ouvre en {ouverture(mandat, v.duree)}</span>
                  </span>
                  {tropCher ? (
                    <span className="text-[12.5px] font-extrabold text-rouge-fonce">Plus cher que tout votre budget restant</span>
                  ) : null}
                </span>
              </label>
            )
          })}
        </fieldset>
      ) : null}

      {projet.option && !existant ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-sable px-4 py-3.5">
          <input type="checkbox" checked={option} onChange={(e) => setOption(e.target.checked)} className="mt-1 size-5 accent-rouge" />
          <span className="flex flex-col gap-1">
            <span className="text-[15px] font-extrabold">
              {projet.option.nom}, {n(projet.option.surcout)} M€ de plus
            </span>
            <span className="text-[13.5px] leading-snug text-gris">{projet.option.detail}</span>
          </span>
        </label>
      ) : null}

      <div className="grid grid-cols-3 gap-1.5">
        <CarteChiffre
          icone="pieces"
          valeur={n(r.cout)}
          unite="M€"
          legende={
            existant
              ? 'investis'
              : libre
                ? 'sans budget à tenir, en jeu libre'
                : reste > 0
                  ? `${Math.min(999, Math.round((r.cout / reste) * 100))} % de ce qui vous reste`
                  : 'votre budget est épuisé'
          }
        />
        <CarteChiffre
          icone="voyageurs"
          valeur={r.voyageurs > 0 ? `+${n(r.voyageurs)}` : '0'}
          legende={projet.estime?.voyageurs ? 'voyageurs par jour, selon notre estimation' : 'voyageurs par jour'}
          accent
        />
        <CarteChiffre
          icone="horloge"
          valeur={String(annee)}
          legende={`après ${r.duree} an${r.duree > 1 ? 's' : ''} de chantier${projet.estime?.duree ? ', selon notre estimation' : ''}`}
        />
      </div>

      {apresFin ? (
        <p className="text-sm leading-relaxed text-gris">
          Ce projet ouvrira après la fin de votre second mandat : vous le payez, un autre l’inaugurera.
        </p>
      ) : null}

      <Rendement voyageurs={r.voyageurs} cout={r.cout} />

      <StationsProjet parcours={projet.parcours} />

      {projet.precisions?.length || projet.sources?.length ? (
        <Deplier titre="D’où viennent ces chiffres">
          {projet.precisions?.length ? (
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] leading-relaxed text-gris">
              {projet.precisions.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : null}
          <Sources sources={projet.sources ?? []} />
        </Deplier>
      ) : null}
    </Panneau>
  )
}

/** Les stations d'un projet, dans l'ordre, branche par branche ; les points de passage n'ont pas de nom. */
function StationsProjet({ parcours }: { parcours?: PointProjet[][] }) {
  const branches = (parcours ?? []).map((b) => b.flatMap((p) => (p.nom ? [p.nom] : []))).filter((b) => b.length)
  if (!branches.length) return null
  return (
    <div className="flex flex-col gap-2">
      <Surtitre>{branches.length > 1 ? 'Les stations, branche par branche' : 'Les stations, dans l’ordre'}</Surtitre>
      {branches.map((noms, k) => (
        <ol key={k} className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[13px] font-bold">
          {noms.map((nom, i) => (
            <li key={`${nom}-${i}`} className="flex items-center gap-1">
              <span className="rounded-full bg-sable px-2.5 py-1">{nom}</span>
              {i < noms.length - 1 ? <span aria-hidden="true" className="h-0.5 w-2.5 bg-encre" /> : null}
            </li>
          ))}
        </ol>
      ))}
    </div>
  )
}
