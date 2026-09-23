'use client'

import { clsx } from 'clsx'

import { n, signe } from '@/lib/format'
import { detailMesure, MESURES, titreMesure, type ParametresLeviers } from '@/lib/leviers'
import { useJeu, useVille } from '@/lib/store'
import type { Leviers as TLeviers } from '@/lib/types'
import type { Ville } from '@/lib/villes'

import { EcrireBudget } from '../explications/Budget'
import { segmentsBudget, useBilan } from '../partie/budget'
import { Bouton, Icone, Jauge, Surtitre } from '../ui'
import { Panneau } from './Panneau'

const euros = (v: number) =>
  (Math.round((v + 1e-9) * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Repère d'inflation : l'objectif de 2 % par an de la Banque centrale européenne, cumulé sur
 * les six ans d'un mandat. C'est une hypothèse de lecture, pas une prévision.
 */
const INFLATION_ANNUELLE = 0.02
const INFLATION_MANDAT = (1 + INFLATION_ANNUELLE) ** 6 - 1

/** Situe une hausse de tarif par rapport à l'inflation du mandat. */
function situer(hausse: number) {
  const inflation = INFLATION_MANDAT * 100
  if (hausse < 0) return { texte: 'Baisse de prix', ton: 'fort' as const }
  if (hausse === 0) return { texte: 'Prix gelé, donc en baisse une fois l’inflation comptée', ton: 'moyen' as const }
  if (Math.abs(hausse - inflation) <= 1) return { texte: 'Au niveau de l’inflation', ton: 'neutre' as const }
  return hausse < inflation
    ? { texte: 'En dessous de l’inflation', ton: 'moyen' as const }
    : { texte: 'Au-dessus de l’inflation', ton: 'fort' as const }
}

function Repere({ hausse }: { hausse: number }) {
  const s = situer(hausse)
  return (
    <span
      className={clsx(
        'self-start rounded-full px-2.5 py-1 text-xs font-extrabold',
        s.ton === 'fort' ? 'bg-rouge text-white' : s.ton === 'moyen' ? 'bg-rouge-pale text-rouge-fonce' : 'bg-sable text-encre',
      )}
    >
      {s.texte}
    </span>
  )
}

function Pas({
  titre,
  valeur,
  unite,
  detail,
  gain,
  min,
  max,
  onChange,
  desactive,
  enPlus,
}: {
  titre: string
  valeur: number
  unite: string
  detail: string
  gain: number
  min: number
  max: number
  onChange: (v: number) => void
  desactive?: string
  enPlus?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1.5px_var(--color-trait)]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base font-extrabold">{titre}</span>
        <span className={clsx('chiffres text-sm font-black whitespace-nowrap', gain > 0 ? 'text-rouge' : 'text-muet')}>
          {signe(gain)} M€
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label={`Baisser : ${titre}`}
          disabled={valeur <= min || !!desactive}
          onClick={() => onChange(valeur - 1)}
          className="grid size-11 place-items-center rounded-full bg-sable disabled:opacity-35"
        >
          <Icone nom="moins" taille={18} epaisseur={2.6} />
        </button>
        <output className="chiffres flex-1 text-center text-[22px] font-black" aria-live="polite">
          {valeur > 0 ? '+' : ''}
          {valeur} {unite}
        </output>
        <button
          type="button"
          aria-label={`Augmenter : ${titre}`}
          disabled={valeur >= max || !!desactive}
          onClick={() => onChange(valeur + 1)}
          className="grid size-11 place-items-center rounded-full bg-rouge text-white disabled:opacity-35"
        >
          <Icone nom="plus" taille={18} epaisseur={2.6} />
        </button>
      </div>
      <div className="text-[13.5px] leading-snug text-gris">{desactive ?? detail}</div>
      {!desactive ? enPlus : null}
    </div>
  )
}

function Interrupteur({
  titre,
  detail,
  gain,
  actif,
  onChange,
  desactive,
}: {
  titre: string
  detail: string
  gain: number
  actif: boolean
  onChange: (v: boolean) => void
  desactive?: string
}) {
  return (
    <label
      className={clsx(
        'flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4',
        actif ? 'shadow-[inset_0_0_0_2px_var(--color-rouge)]' : 'shadow-[inset_0_0_0_1.5px_var(--color-trait)]',
        desactive && 'cursor-not-allowed opacity-55',
      )}
    >
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-[15.5px] leading-tight font-extrabold">{titre}</span>
        <span className="text-[13.5px] leading-snug text-gris">{desactive ?? detail}</span>
        <span className={clsx('chiffres text-[13px] font-black', gain > 0 ? 'text-rouge' : 'text-gris')}>{signe(gain)} M€ par mandat</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={actif}
        disabled={!!desactive}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={clsx(
          'relative h-7.5 w-12.5 shrink-0 rounded-full transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-encre',
          actif ? 'bg-rouge' : 'bg-[#dcd8d2]',
        )}
      >
        <span className={clsx('absolute top-0.75 size-6 rounded-full bg-white transition-[left]', actif ? 'left-[23px]' : 'left-0.75')} />
      </span>
    </label>
  )
}

/** Un rendement par point : 12 M€, mais 1,3 M€ pour un petit réseau. */
const millions = (v: number) => (v < 10 ? v.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : n(v))

/** Le taux du versement mobilité après la hausse choisie : 2 % relevé de 3 % donne 2,06 %. */
const taux = (t: number) => `${t.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`

export function Leviers() {
  const ville = useVille()
  const p = ville.budget.leviers
  return p ? <Contenu p={p} ville={ville} /> : null
}

function Contenu({ p, ville }: { p: ParametresLeviers; ville: Ville }) {
  const { leviers, mandat, levier, fermer } = useJeu()
  const l = leviers[mandat]
  const bilan = useBilan()
  const { segments, total } = segmentsBudget(bilan)
  const gratuit = l.gratuiteTotale && p.fixes.gratuiteTotale !== undefined
  const sansObjet = 'Sans objet : le réseau est gratuit.'
  const nouveauMois = p.tarifs.abonnement * (1 + l.abonnements / 100)
  const nouveauTicket = p.tarifs.ticket * (1 + l.tickets / 100)

  const groupe = (titre: string, contenu: React.ReactNode, intro?: string, icone?: boolean) => (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 text-gris">
        {icone ? <Icone nom="loi" taille={17} /> : null}
        <Surtitre className="text-gris">{titre}</Surtitre>
      </div>
      {intro ? <p className="text-sm leading-relaxed text-gris">{intro}</p> : null}
      {contenu}
    </section>
  )
  const maj =
    <K extends keyof TLeviers>(k: K) =>
    (v: TLeviers[K]) =>
      levier(k, v)

  return (
    <Panneau
      titre="Trouver de l’argent"
      largeur="large"
      hauteurTelephone="pleine"
      pied={
        <Bouton genre="rouge" icone="fleche" taille="grand" onClick={fermer} className="lg:self-end lg:min-w-[360px]">
          {bilan.reste >= 0 ? `Revenir à la carte avec ${n(bilan.reste)} M€` : `Revenir à la carte, il manque ${n(-bilan.reste)} M€`}
        </Bouton>
      }
    >
      <div className="flex flex-col gap-2 rounded-2xl bg-rouge p-4 text-white">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold opacity-90">Disponible sur ce mandat</span>
          <span className="chiffres text-xl font-black">{bilan.reste >= 0 ? `${n(bilan.reste)} M€` : `-${n(-bilan.reste)} M€`}</span>
        </div>
        <Jauge segments={segments} total={total} surRouge label={`Il reste ${n(bilan.reste)} millions d’euros sur ce mandat.`} />
        <div className="text-[13px] font-semibold opacity-90">
          Vos choix changent l’argent disponible sur ce mandat
          {mandat === 1 ? ' et restent en place au suivant, où vous pourrez les revoir' : ''}. Au total, ils{' '}
          {bilan.leviers >= 0 ? 'rapportent' : 'coûtent'} {n(Math.abs(bilan.leviers))} M€.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {groupe(
          'Les tarifs',
          <>
            <Pas
              titre="Prix des abonnements"
              valeur={l.abonnements}
              unite="%"
              min={-20}
              max={30}
              gain={gratuit ? 0 : l.abonnements * p.rendement.abonnements}
              detail={`Chaque point rapporte ${millions(p.rendement.abonnements)} M€ par mandat.`}
              onChange={maj('abonnements')}
              desactive={gratuit ? sansObjet : undefined}
              enPlus={
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-sable px-3 py-2.5">
                      <div className="chiffres text-lg font-black">{euros(nouveauMois)} €</div>
                      <div className="text-xs leading-snug text-gris">par mois, au lieu de {euros(p.tarifs.abonnement)} €</div>
                    </div>
                    <div className="rounded-xl bg-sable px-3 py-2.5">
                      <div className="chiffres text-lg font-black">{euros(nouveauMois / 2)} €</div>
                      <div className="text-xs leading-snug text-gris">pour un salarié, l’employeur payant la moitié</div>
                    </div>
                  </div>
                  <Repere hausse={l.abonnements} />
                </>
              }
            />
            <Pas
              titre="Prix des tickets"
              valeur={l.tickets}
              unite="%"
              min={-20}
              max={30}
              gain={gratuit ? 0 : l.tickets * p.rendement.tickets}
              detail={`Le ticket passe de ${euros(p.tarifs.ticket)} € à ${euros(nouveauTicket)} €. Chaque point rapporte ${millions(p.rendement.tickets)} M€ par mandat.`}
              onChange={maj('tickets')}
              desactive={gratuit ? sansObjet : undefined}
              enPlus={<Repere hausse={l.tickets} />}
            />
            <p className="text-[12.5px] leading-relaxed text-gris">
              Nous comparons chaque hausse à une inflation de 2 % par an, l’objectif de la Banque centrale européenne : sur les six ans d’un
              mandat, les prix monteraient d’environ {(INFLATION_MANDAT * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %.
              Tout employeur rembourse au moins la moitié de l’abonnement de ses salariés.
            </p>
          </>,
        )}
        {groupe(
          'La gratuité et les services',
          <>
            {MESURES.filter((m) => m.cle !== 'tva' && p.fixes[m.cle] !== undefined).map((m) => (
              <Interrupteur
                key={m.cle}
                titre={titreMesure(m, p)}
                detail={detailMesure(m, p)}
                gain={p.fixes[m.cle]!}
                actif={l[m.cle]}
                onChange={maj(m.cle)}
                desactive={gratuit && m.tarifaire ? sansObjet : undefined}
              />
            ))}
          </>,
        )}
        {groupe(
          'Ce que seule une loi nationale peut changer',
          <>
            {p.fixes.tva !== undefined ? (
              <Interrupteur
                titre="TVA des transports à 5,5 %"
                detail="Au lieu de 10 % aujourd’hui."
                gain={p.fixes.tva}
                actif={l.tva}
                onChange={maj('tva')}
              />
            ) : null}
            <Pas
              titre="Versement mobilité des entreprises"
              valeur={l.versementMobilite}
              unite="%"
              min={0}
              max={5}
              gain={l.versementMobilite * p.rendement.versementMobilite}
              detail={`Cette taxe est payée par les employeurs de 11 salariés et plus, en plus du remboursement des abonnements.${
                p.tauxVersement
                  ? ` Son taux passe de ${taux(p.tauxVersement)} à ${taux(p.tauxVersement * (1 + l.versementMobilite / 100))} de la masse salariale.`
                  : ''
              } Chaque hausse de 1 % rapporte ${millions(p.rendement.versementMobilite)} M€ par mandat.`}
              onChange={maj('versementMobilite')}
            />
          </>,
          'Ces deux mesures demandent une loi nationale. Vous pouvez les activer pour voir ce qu’elles changeraient.',
          true,
        )}
      </div>
      <EcrireBudget ville={ville} compact />
    </Panneau>
  )
}
