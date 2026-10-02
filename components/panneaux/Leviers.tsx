'use client'

import { clsx } from 'clsx'

import { hausse as enHausse, n, signe } from '@/lib/format'
import { BAISSE_MAX, detailMesure, HAUSSE_MAX, hausseReelle, MESURES, titreMesure, type ParametresLeviers } from '@/lib/leviers'
import { INFLATION_ANNUELLE, leviersDu, prixDuMandat } from '@/lib/regles'
import { useJeu, useVille } from '@/lib/store'
import type { Leviers as TLeviers } from '@/lib/types'
import type { Ville } from '@/lib/villes'

import { EcrireBudget } from '../explications/Budget'
import { segmentsBudget, useBilan } from '../partie/budget'
import { Bouton, Icone, Jauge, Surtitre } from '../ui'
import { Panneau } from './Panneau'

const euros = (v: number) =>
  (Math.round((v + 1e-9) * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Ce que les prix prennent en un mandat de six ans, à 2 % par an : environ 12,6 %. */
const INFLATION_MANDAT = (1 + INFLATION_ANNUELLE) ** 6

/**
 * Situe un tarif par rapport à l'inflation depuis 2026 : `hausse` est le prix fixé par le joueur par rapport à 2026,
 * `prix` ce que vaut un euro de 2026 au mandat en cours, et `auto` dit si le tarif suit l'inflation de lui-même.
 */
function situer(hausse: number, prix: number, auto: boolean) {
  const nominale = auto ? (prix - 1) * 100 : hausse
  const reelle = hausseReelle(hausse, prix, auto)
  if (nominale < 0) return { texte: 'Baisse de prix', ton: 'fort' as const }
  if (Math.abs(reelle) < 0.5) return { texte: 'Au niveau de l’inflation', ton: 'neutre' as const }
  if (reelle < 0)
    return nominale === 0
      ? { texte: 'Prix gelé, donc en baisse une fois l’inflation comptée', ton: 'moyen' as const }
      : { texte: 'En dessous de l’inflation', ton: 'moyen' as const }
  return { texte: 'Au-dessus de l’inflation', ton: 'fort' as const }
}

function Repere({ hausse, prix, auto }: { hausse: number; prix: number; auto: boolean }) {
  const s = situer(hausse, prix, auto)
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

/** Le pas des boutons + et - : un point jusqu'à 30 %, puis 5 jusqu'à 100 %, puis 10, pour atteindre +200 % sans cent clics. */
const pasVers = (valeur: number, sens: 1 | -1) => {
  const v = sens > 0 ? valeur : valeur - 1
  return v >= 100 ? 10 : v >= 30 ? 5 : 1
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
  auto,
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
  /** Le réglage suit l'inflation de lui-même : ses boutons sont grisés, mais on voit toujours le prix qui en résulte. */
  auto?: string
  enPlus?: React.ReactNode
}) {
  const bloque = Boolean(desactive || auto)
  return (
    <div className="flex flex-col gap-2.5 rounded-xl bg-white p-3 shadow-[inset_0_0_0_1.5px_var(--color-trait)]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-extrabold">{titre}</span>
        <span className={clsx('chiffres text-sm font-black whitespace-nowrap', gain > 0 ? 'text-rouge' : 'text-muet')}>
          {signe(gain)} M€
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label={`Baisser : ${titre}`}
          disabled={valeur <= min || bloque}
          onClick={() => onChange(Math.max(min, valeur - pasVers(valeur, -1)))}
          className="grid size-11 place-items-center rounded-full bg-sable disabled:opacity-35"
        >
          <Icone nom="moins" taille={18} epaisseur={2.6} />
        </button>
        <output className={clsx('chiffres flex-1 text-center text-[22px] font-black', auto && 'text-muet')} aria-live="polite">
          {valeur > 0 ? '+' : ''}
          {valeur} {unite}
        </output>
        <button
          type="button"
          aria-label={`Augmenter : ${titre}`}
          disabled={valeur >= max || bloque}
          onClick={() => onChange(Math.min(max, valeur + pasVers(valeur, 1)))}
          className="grid size-11 place-items-center rounded-full bg-rouge text-white disabled:opacity-35"
        >
          <Icone nom="plus" taille={18} epaisseur={2.6} />
        </button>
      </div>
      <div className="text-[13.5px] leading-snug text-gris">{desactive ?? auto ?? detail}</div>
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
        'relative flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3',
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
  const l = leviersDu(leviers, mandat)
  const bilan = useBilan()
  const { segments, total } = segmentsBudget(bilan)
  const gratuit = l.gratuiteTotale && p.fixes.gratuiteTotale !== undefined
  const sansObjet = 'Sans objet : le réseau est gratuit.'
  // Les montants du mandat en cours suivent l'inflation depuis 2026. Les tarifs aussi quand la case est cochée ; sinon,
  // le joueur fixe leur prix par rapport à 2026.
  const prix = prixDuMandat(mandat)
  const auto = l.inflationTarifs !== false
  const auPrix = (base: number, hausse: number) => base * (auto ? prix : 1 + hausse / 100)
  const nouveauMois = auPrix(p.tarifs.abonnement, l.abonnements)
  const nouveauTicket = auPrix(p.tarifs.ticket, l.tickets)
  const gainTarif = (hausse: number, rendement: number) => hausseReelle(hausse, prix, auto) * rendement * prix
  const hausseInflation = Math.round((prix - 1) * 100)
  // Décocher la case part du prix du moment, celui de l'inflation, pour qu'il ne saute pas.
  const suivreInflation = (oui: boolean) => {
    if (!oui) {
      levier('abonnements', hausseInflation)
      levier('tickets', hausseInflation)
    }
    levier('inflationTarifs', oui)
  }
  const texteAuto = (quoi: string, base: number, unite: string) =>
    mandat === 1
      ? `${quoi} suit l’inflation : ${euros(base)} €${unite} sur ce premier mandat, puis ${enHausse(INFLATION_MANDAT)} de plus à chaque mandat. Décochez la case au-dessus pour le fixer vous-même.`
      : `${quoi} suit l’inflation : ${euros(base * prix)} €${unite} au lieu de ${euros(base)} € en 2026. Décochez la case au-dessus pour le fixer vous-même.`

  const groupe = (titre: string, contenu: React.ReactNode, intro?: string, icone?: boolean) => (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 text-gris">
        {icone ? <Icone nom="loi" taille={17} /> : null}
        <Surtitre className="text-gris">{titre}</Surtitre>
      </div>
      {intro ? <p className="text-sm leading-normal text-gris">{intro}</p> : null}
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
        <Bouton genre="rouge" icone="fleche" onClick={fermer} className="lg:min-w-[320px] lg:self-end">
          {bilan.reste >= 0 ? `Revenir à la carte avec ${n(bilan.reste)} M€` : `Revenir à la carte, il manque ${n(-bilan.reste)} M€`}
        </Bouton>
      }
    >
      <div className="flex flex-col gap-2 rounded-xl bg-rouge p-3 text-white">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold opacity-90">Disponible sur ce mandat</span>
          <span className="chiffres text-xl font-black">{bilan.reste >= 0 ? `${n(bilan.reste)} M€` : `-${n(-bilan.reste)} M€`}</span>
        </div>
        <Jauge segments={segments} total={total} surRouge label={`Il reste ${n(bilan.reste)} millions d’euros sur ce mandat.`} />
        <div className="text-[13px] font-semibold opacity-90">
          Vos choix changent l’argent disponible sur ce mandat
          {mandat === 1
            ? ' et restent en place au suivant, où vous pourrez les revoir'
            : ' et restent en place si vous continuez la partie'}
          . Au total, ils {bilan.leviers >= 0 ? 'rapportent' : 'coûtent'} {n(Math.abs(bilan.leviers))} M€.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {groupe(
          'Les tarifs',
          <>
            {/* La case et le repère d'inflation, au-dessus des deux tarifs qu'elle concerne. */}
            <label
              className={clsx(
                'flex cursor-pointer items-start gap-3 rounded-xl bg-white p-3',
                auto && !gratuit ? 'shadow-[inset_0_0_0_2px_var(--color-rouge)]' : 'shadow-[inset_0_0_0_1.5px_var(--color-trait)]',
                gratuit && 'cursor-not-allowed opacity-55',
              )}
            >
              <input
                type="checkbox"
                checked={auto}
                disabled={gratuit}
                onChange={(e) => suivreInflation(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-rouge"
              />
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="text-[15px] leading-tight font-extrabold">Faire suivre l’inflation aux tarifs</span>
                <span className="text-[13.5px] leading-snug text-gris">
                  {gratuit
                    ? sansObjet
                    : auto
                      ? `Le ticket et l’abonnement montent avec les prix, de 2 % par an, sans rien rapporter de plus. Décochez la case pour fixer vous-même leur prix, de ${BAISSE_MAX} % à +${HAUSSE_MAX} % par rapport à 2026.`
                      : 'Vous fixez vous-même le prix du ticket et de l’abonnement par rapport à 2026. Au-dessus de l’inflation, ils rapportent davantage ; en dessous, moins.'}
                </span>
                <span className="self-start rounded-full bg-sable px-2.5 py-1 text-xs font-extrabold">
                  {mandat === 1
                    ? `Prix de 2026 sur ce mandat, puis +${enHausse(INFLATION_MANDAT)} à chaque mandat`
                    : `Inflation depuis 2026 : +${enHausse(prix)}`}
                </span>
              </span>
            </label>
            <Pas
              titre="Prix des abonnements"
              valeur={auto ? hausseInflation : l.abonnements}
              unite="%"
              min={BAISSE_MAX}
              max={HAUSSE_MAX}
              gain={gratuit ? 0 : gainTarif(l.abonnements, p.rendement.abonnements)}
              detail={`Par rapport au prix de 2026. Chaque point rapporte ${millions(p.rendement.abonnements * prix)} M€ par mandat.`}
              onChange={maj('abonnements')}
              desactive={gratuit ? sansObjet : undefined}
              auto={auto ? texteAuto('L’abonnement', p.tarifs.abonnement, ' par mois') : undefined}
              enPlus={
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-sable px-3 py-2.5">
                      <div className="chiffres text-lg font-black">{euros(nouveauMois)} €</div>
                      <div className="text-xs leading-snug text-gris">
                        {euros(nouveauMois) === euros(p.tarifs.abonnement)
                          ? 'par mois, comme en 2026'
                          : `par mois, au lieu de ${euros(p.tarifs.abonnement)} € en 2026`}
                      </div>
                    </div>
                    <div className="rounded-xl bg-sable px-3 py-2.5">
                      <div className="chiffres text-lg font-black">{euros(nouveauMois / 2)} €</div>
                      <div className="text-xs leading-snug text-gris">pour un salarié, l’employeur payant la moitié</div>
                    </div>
                  </div>
                  <Repere hausse={l.abonnements} prix={prix} auto={auto} />
                </>
              }
            />
            <Pas
              titre="Prix des tickets"
              valeur={auto ? hausseInflation : l.tickets}
              unite="%"
              min={BAISSE_MAX}
              max={HAUSSE_MAX}
              gain={gratuit ? 0 : gainTarif(l.tickets, p.rendement.tickets)}
              detail={`${
                euros(nouveauTicket) === euros(p.tarifs.ticket)
                  ? `Le ticket reste à ${euros(p.tarifs.ticket)} €, son prix de 2026.`
                  : `Le ticket passe de ${euros(p.tarifs.ticket)} € en 2026 à ${euros(nouveauTicket)} €.`
              } Chaque point rapporte ${millions(p.rendement.tickets * prix)} M€ par mandat.`}
              onChange={maj('tickets')}
              desactive={gratuit ? sansObjet : undefined}
              auto={auto ? texteAuto('Le ticket', p.tarifs.ticket, '') : undefined}
              enPlus={<Repere hausse={l.tickets} prix={prix} auto={auto} />}
            />
            <p className="text-[12.5px] leading-normal text-gris">
              Nous comptons une inflation de 2 % par an, l’objectif de la Banque centrale européenne : les prix montent d’environ{' '}
              {enHausse(INFLATION_MANDAT)} à chaque mandat, et les coûts des projets comme votre budget aussi. Tout employeur rembourse au
              moins la moitié de l’abonnement de ses salariés.
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
                gain={p.fixes[m.cle]! * prix}
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
                gain={p.fixes.tva * prix}
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
              gain={l.versementMobilite * p.rendement.versementMobilite * prix}
              detail={`Cette taxe est payée par les employeurs de 11 salariés et plus, en plus du remboursement des abonnements.${
                p.tauxVersement
                  ? ` Son taux passe de ${taux(p.tauxVersement)} à ${taux(p.tauxVersement * (1 + l.versementMobilite / 100))} de la masse salariale.`
                  : ''
              } Chaque hausse de 1 % rapporte ${millions(p.rendement.versementMobilite * prix)} M€ par mandat.`}
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
