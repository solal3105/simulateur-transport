'use client'

import { clsx } from 'clsx'
import { useMemo, useState } from 'react'

import { useDonnees } from '@/lib/donnees'
import { approx, km, n } from '@/lib/format'
import { nommerArrets } from '@/lib/lieux'
import { DUREE_CHANTIER, estimer, PRIX_KM } from '@/lib/modele'
import { ouverture } from '@/lib/regles'
import { useJeu } from '@/lib/store'
import type { Estimation, ModeLigne } from '@/lib/types'

import { useBilan } from '../partie/budget'
import { Bouton, CarteChiffre, Icone, Pastille, Surtitre, type NomIcone } from '../ui'
import { Panneau } from './Panneau'

const MODES: { id: ModeLigne; nom: string; court: string; icone: NomIcone; repere: string }[] = [
  { id: 'tram', nom: 'Tramway', court: 'Tram', icone: 'tram', repere: 'Moyenne des T6 nord, T9 et T10, entre 32 et 37 M€ par km.' },
  {
    id: 'bus',
    nom: 'Bus à haut niveau de service',
    court: 'Bus rapide',
    icone: 'bus',
    repere: 'Comme la ligne TB12 Part-Dieu - Sept Chemins, entre 12 et 17 M€ par km.',
  },
  {
    id: 'metro',
    nom: 'Métro automatique',
    court: 'Métro',
    icone: 'metro',
    repere: 'Le prolongement du métro B à Saint-Genis-Laval a coûté environ 160 M€ par km.',
  },
  {
    id: 'cable',
    nom: 'Téléphérique',
    court: 'Câble',
    icone: 'cable',
    repere: 'Comme Téléo à Toulouse ou le Câble C1 à Créteil, entre 27 et 31 M€ par km.',
  },
]
const NOM_MODE: Record<ModeLigne, string> = { tram: 'tramway', bus: 'bus rapide', metro: 'métro', cable: 'téléphérique' }

export function useEstimation(): Estimation | null {
  const donnees = useDonnees()
  const brouillon = useJeu((s) => s.brouillon)
  return useMemo(() => (donnees && brouillon ? estimer(brouillon.mode, brouillon.arrets, donnees.carreaux) : null), [donnees, brouillon])
}

function Ligne({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-trait py-2 text-sm">
      <span className="text-gris">{libelle}</span>
      <span className="chiffres text-right font-extrabold">{valeur}</span>
    </div>
  )
}

function Chiffres({ e, arrets, mode }: { e: Estimation; arrets: number; mode: ModeLigne }) {
  const cellule = (valeur: string, unite: string, legende: string, accent?: boolean) => (
    <div className="flex flex-col gap-0.5">
      <div className={clsx('flex items-baseline gap-1 whitespace-nowrap', accent && 'text-rouge')}>
        <span className="chiffres text-xl font-black">{valeur}</span>
        <span className="text-xs font-extrabold">{unite}</span>
      </div>
      <span className="text-xs font-semibold text-gris">{legende}</span>
    </div>
  )
  return (
    <div className="grid grid-cols-4 gap-2">
      {cellule(km(e.km), 'km', 'de ligne')}
      {cellule(String(arrets), '', arrets > 1 ? 'arrêts' : 'arrêt')}
      {cellule(n(e.cout), 'M€', `à ${PRIX_KM[mode]} M€ / km`)}
      {cellule(`~${approx(e.voyageurs)}`, '', 'voyageurs / jour', true)}
    </div>
  )
}

/** Poser un arrêt en tapant le nom d'un quartier ou d'une commune : l'alternative au toucher sur la carte. */
function AjoutParNom() {
  const donnees = useDonnees()
  const ajouterArret = useJeu((s) => s.ajouterArret)
  const [texte, setTexte] = useState('')
  const [erreur, setErreur] = useState('')
  // Sur téléphone, le champ reste replié pour laisser la carte visible.
  const [ouvert, setOuvert] = useState(false)
  const lieux = useMemo(() => {
    if (!donnees) return []
    const dansMetropole = ([lon, lat]: [number, number]) => lon > 4.68 && lon < 5.12 && lat > 45.64 && lat < 45.88
    const quartiers = donnees.lieux.quartiers
      .filter(([lon, lat]) => dansMetropole([lon, lat]))
      .map(([lon, lat, nom]) => ({ nom, pos: [lon, lat] as [number, number] }))
    const communes = donnees.lieux.communes
      .map((c) => {
        const anneau = c.anneaux[0] ?? []
        const lon = anneau.reduce((t, p) => t + p[0], 0) / Math.max(1, anneau.length)
        const lat = anneau.reduce((t, p) => t + p[1], 0) / Math.max(1, anneau.length)
        return { nom: c.nom, pos: [lon, lat] as [number, number] }
      })
      .filter((c) => dansMetropole(c.pos) && c.nom !== 'Lyon')
    const arrondissements = donnees.lieux.arrondissements.map(([lon, lat, nom]) => ({ nom, pos: [lon, lat] as [number, number] }))
    const vus = new Set<string>()
    return [...arrondissements, ...communes, ...quartiers]
      .filter((l) => (vus.has(l.nom) ? false : (vus.add(l.nom), true)))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  }, [donnees])

  const ajouter = (ev: React.FormEvent) => {
    ev.preventDefault()
    const cherche = texte.trim().toLocaleLowerCase('fr')
    const trouve =
      lieux.find((l) => l.nom.toLocaleLowerCase('fr') === cherche) ?? lieux.find((l) => l.nom.toLocaleLowerCase('fr').startsWith(cherche))
    if (!cherche || !trouve) {
      setErreur('Nous ne trouvons pas ce lieu. Essayez un nom de commune ou de quartier de la Métropole.')
      return
    }
    ajouterArret(trouve.pos)
    setTexte('')
    setErreur('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className={clsx('self-start text-[13px] font-extrabold text-gris underline underline-offset-3 lg:hidden', ouvert && 'hidden')}
      >
        Ajouter un arrêt par son nom
      </button>
      <form onSubmit={ajouter} className={clsx('flex-col gap-1.5 lg:flex', ouvert ? 'flex' : 'hidden')}>
        <label htmlFor="ajout-arret" className="text-[13px] font-extrabold">
          Ou ajoutez un arrêt par son nom
        </label>
        <div className="flex gap-2">
          <input
            id="ajout-arret"
            list="lieux-arrets"
            value={texte}
            onChange={(ev) => setTexte(ev.target.value)}
            placeholder="Gratte-Ciel, Bron, Lyon 7e…"
            aria-describedby={erreur ? 'erreur-arret' : undefined}
            className="min-h-11 min-w-0 flex-1 rounded-xl bg-sable px-3.5 text-[15px] font-semibold outline-none focus:shadow-[inset_0_0_0_2px_var(--color-encre)]"
          />
          <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-encre px-4 text-sm font-extrabold text-white">
            Ajouter
          </button>
        </div>
        <datalist id="lieux-arrets">
          {lieux.map((l) => (
            <option key={l.nom} value={l.nom} />
          ))}
        </datalist>
        {erreur ? (
          <p id="erreur-arret" className="text-[13px] font-semibold text-rouge-fonce">
            {erreur}
          </p>
        ) : null}
      </form>
    </>
  )
}

/** Le panneau affiché pendant qu'on pose les arrêts. */
export function Traceur() {
  const { brouillon, changerMode, retirerArret, abandonnerTrace, ouvrir } = useJeu()
  const bilan = useBilan()
  const e = useEstimation()
  const noms = useNomsArrets()
  if (!brouillon) return null
  const arrets = brouillon.arrets.length
  const pret = arrets >= 2 && e

  return (
    <Panneau
      titre={`Tracer un ${NOM_MODE[brouillon.mode]}`}
      onFermer={abandonnerTrace}
      pied={
        <div className="grid grid-cols-2 gap-2">
          <Bouton
            genre="sable"
            iconeAGauche="annuler"
            taille="petit"
            className="min-h-13 justify-start"
            disabled={arrets === 0}
            onClick={retirerArret}
          >
            Retirer l’arrêt
          </Bouton>
          <Bouton
            genre="rouge"
            icone="valider"
            taille="petit"
            className="min-h-13"
            disabled={!pret}
            onClick={() => ouvrir({ type: 'ligne' })}
          >
            Terminer la ligne
          </Bouton>
        </div>
      }
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Type de ligne</legend>
        {/* Téléphone : une rangée compacte pour laisser la carte visible. */}
        <div className="flex gap-1.5 lg:hidden">
          {MODES.map((m) => (
            <label
              key={m.id}
              className={clsx(
                'flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full text-[13px] font-extrabold',
                brouillon.mode === m.id ? 'bg-encre text-white' : 'bg-sable',
              )}
            >
              <input
                type="radio"
                name="mode-court"
                className="sr-only"
                checked={brouillon.mode === m.id}
                onChange={() => changerMode(m.id)}
              />
              {m.court}
            </label>
          ))}
        </div>
        {/* Ordinateur : le prix et sa référence. */}
        {MODES.map((m) => (
          <label
            key={m.id}
            className={clsx(
              'hidden cursor-pointer items-start gap-3 rounded-2xl bg-white px-3.5 py-3 lg:flex',
              brouillon.mode === m.id ? 'shadow-[inset_0_0_0_2.5px_var(--color-rouge)]' : 'shadow-[inset_0_0_0_1.5px_var(--color-trait)]',
            )}
          >
            <input type="radio" name="mode" className="sr-only" checked={brouillon.mode === m.id} onChange={() => changerMode(m.id)} />
            <span
              className={clsx(
                'grid size-9.5 shrink-0 place-items-center rounded-xl',
                brouillon.mode === m.id ? 'bg-rouge text-white' : 'bg-sable',
              )}
            >
              <Icone nom={m.icone} taille={20} />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[15px] font-extrabold">{m.nom}</span>
                <span className="chiffres text-sm font-black whitespace-nowrap">{PRIX_KM[m.id]} M€ / km</span>
              </span>
              <span className="text-[12.5px] leading-snug text-gris">
                {m.repere} Chantier d’environ {DUREE_CHANTIER[m.id]} ans.
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <AjoutParNom />

      {!pret ? (
        <p className="flex items-start gap-2.5 rounded-2xl bg-encre px-4 py-3 text-sm leading-snug font-semibold text-white">
          <Icone nom="main" taille={20} className="mt-0.5" />
          {arrets === 0
            ? 'Touchez la carte pour poser le premier arrêt. Les zones rouges sont celles où vivent et travaillent le plus de gens.'
            : 'Posez au moins un deuxième arrêt pour voir le prix et les voyageurs.'}
        </p>
      ) : (
        <>
          <Chiffres e={e} arrets={arrets} mode={brouillon.mode} />
          <p className="text-[13px] leading-snug font-semibold">
            <span className="text-gris">De </span>
            {noms[0]}
            <span className="text-gris"> à </span>
            {noms.at(-1)}
            {noms.length > 2 ? <span className="text-gris">, par {noms.slice(1, -1).join(', ')}</span> : null}
          </p>
          <div className="hidden flex-col gap-0.5 lg:flex">
            <Surtitre>Autour de vos arrêts, à moins de {brouillon.mode === 'metro' ? 600 : 400} m</Surtitre>
            <Ligne libelle="Habitants" valeur={approx(e.habitants)} />
            <Ligne libelle="Emplois" valeur={approx(e.emplois)} />
            <Ligne libelle="Habitants sans tram ni métro aujourd’hui" valeur={approx(e.habitantsNonDesservis)} />
          </div>
          <p className="text-[13px] leading-snug text-gris">
            {e.cout <= bilan.reste
              ? `Il vous resterait ${n(bilan.reste - e.cout)} M€ sur ce mandat.`
              : `Il manquerait ${n(e.cout - Math.max(0, bilan.reste))} M€ sur ce mandat.`}{' '}
            Nous recalculons à chaque arrêt à partir des données INSEE.
          </p>
        </>
      )}
    </Panneau>
  )
}

/** Noms des arrêts du tracé en cours, d'après les quartiers et les communes. */
function useNomsArrets() {
  const donnees = useDonnees()
  const brouillon = useJeu((s) => s.brouillon)
  return useMemo(() => (donnees && brouillon ? nommerArrets(brouillon.arrets, donnees.lieux) : []), [donnees, brouillon])
}

/** Le résultat d'une ligne terminée, avant de la construire. */
export function MaLigne() {
  const { brouillon, mandat, construireLigne, ouvrir } = useJeu()
  const bilan = useBilan()
  const e = useEstimation()
  const noms = useNomsArrets()
  // Une ligne porte le nom de ses deux terminus, comme sur le réseau.
  // Tant que le joueur ne l'a pas renommée, la ligne porte le nom de ses terminus.
  const [nomSaisi, setNom] = useState<string | null>(null)
  const nom = nomSaisi ?? (noms.length >= 2 ? `${noms[0]} - ${noms.at(-1)}` : `Ma ligne de ${brouillon ? NOM_MODE[brouillon.mode] : 'tramway'}`)
  if (!brouillon || !e) return null
  const annee = ouverture(mandat, e.duree)
  const reste = bilan.reste
  const moitie = Math.round(e.cout / 2)

  return (
    <Panneau
      surtitre={<Pastille icone="trace">Votre ligne de {NOM_MODE[brouillon.mode]}</Pastille>}
      titre={
        <label className="flex items-center gap-2">
          <span className="sr-only">Nom de la ligne</span>
          <input
            value={nom}
            onChange={(ev) => setNom(ev.target.value)}
            maxLength={40}
            className="min-w-0 flex-1 rounded-lg bg-transparent font-black outline-none focus:bg-sable focus:px-2"
          />
          <Icone nom="crayon" taille={18} className="text-muet" />
        </label>
      }
      onFermer={() => ouvrir({ type: 'trace' })}
      pied={
        <>
          <Bouton genre="rouge" icone="valider" taille="grand" onClick={() => construireLigne(nom.trim() || 'Ma ligne', e, false)}>
            {e.cout <= reste ? `Construire pour ${n(e.cout)} M€` : `Construire pour ${n(e.cout)} M€, avec un déficit`}
          </Bouton>
          <div className="grid grid-cols-2 gap-2">
            {mandat === 1 ? (
              <Bouton genre="contour" taille="petit" onClick={() => construireLigne(nom.trim() || 'Ma ligne', e, true)}>
                Payer {n(moitie)} M€ maintenant
              </Bouton>
            ) : null}
            <Bouton genre="contour" taille="petit" onClick={() => ouvrir({ type: 'trace' })} className={mandat === 1 ? '' : 'col-span-2'}>
              Modifier le tracé
            </Bouton>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-1.5">
        <CarteChiffre icone="pieces" valeur={n(e.cout)} unite="M€" legende={`${km(e.km)} km à ${PRIX_KM[brouillon.mode]} M€ le km`} />
        <CarteChiffre
          icone="voyageurs"
          valeur={`~${approx(e.voyageurs)}`}
          legende={`voyageurs par jour, entre ${approx(e.bas)} et ${approx(e.haut)}`}
          accent
        />
        <CarteChiffre icone="horloge" valeur={String(annee)} legende={`après ${e.duree} ans de chantier`} />
      </div>
      <div className="flex flex-col gap-0.5">
        <Surtitre>
          Autour de vos {brouillon.arrets.length} arrêts, à moins de {brouillon.mode === 'metro' ? 600 : 400} m
        </Surtitre>
        <Ligne libelle="Habitants" valeur={approx(e.habitants)} />
        <Ligne libelle="Emplois" valeur={approx(e.emplois)} />
        <Ligne libelle="Habitants sans tram ni métro aujourd’hui" valeur={approx(e.habitantsNonDesservis)} />
      </div>
      <div className="flex flex-col gap-2">
        <Surtitre>Vos arrêts</Surtitre>
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[13.5px] font-bold">
          {noms.map((nomArret, i) => (
            <li key={i} className="flex items-center gap-1">
              <span className="rounded-full bg-sable px-2.5 py-1">{nomArret}</span>
              {i < noms.length - 1 ? <span aria-hidden="true" className="h-0.5 w-2.5 bg-encre" /> : null}
            </li>
          ))}
        </ol>
      </div>
      <p className="rounded-2xl bg-rouge-pale px-4 py-3.5 text-sm leading-relaxed">
        Environ <b className="chiffres">{approx(e.nouveaux)}</b> de ces voyageurs seraient nouveaux sur le réseau, les autres viendraient
        d’une ligne voisine. C’est ce chiffre qui s’ajoute à votre score.
      </p>
      <p className="text-[13.5px] leading-relaxed text-gris">
        Pour comparer, le tram T9, long de 11,3 km, est attendu à 38 000 voyageurs par jour pour 290 M€.{' '}
        <button
          type="button"
          onClick={() => ouvrir({ type: 'methode' })}
          className="font-extrabold text-rouge-fonce underline underline-offset-3"
        >
          Notre calcul
        </button>
      </p>
    </Panneau>
  )
}
