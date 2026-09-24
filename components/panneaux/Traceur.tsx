'use client'

import { clsx } from 'clsx'
import { useMemo, useState } from 'react'

import { useDonnees } from '@/lib/donnees'
import { approx, km, n } from '@/lib/format'
import { nommerArrets } from '@/lib/lieux'
import { prixReseau } from '@/lib/couts'
import { PENTE_MAX, relief, TUNNEL_PROFOND } from '@/lib/terrain'
import { DUREE_CHANTIER, estimer, rayonBassin } from '@/lib/modele'
import { ouverture } from '@/lib/regles'
import { useJeu, useVille } from '@/lib/store'
import type { Estimation, ModeLigne } from '@/lib/types'

import { useBilan, useDepenses } from '../partie/budget'
import { Bouton, CarteChiffre, Icone, Pastille, Surtitre, type NomIcone } from '../ui'
import { Panneau } from './Panneau'

// Les prix viennent de 53 chantiers français (lib/couts.ts, docs/couts.md) ; chaque repère dit ce qui fait monter le coût.
const MODES: { id: ModeLigne; nom: string; court: string; icone: NomIcone; repere: string }[] = [
  {
    id: 'tram',
    nom: 'Tramway',
    court: 'Tram',
    icone: 'tram',
    repere: 'Il ne monte pas au-delà de 6 % : plus raide, il lui faut un tunnel, et un pont pour chaque grand fleuve.',
  },
  {
    id: 'bus',
    nom: 'Bus à haut niveau de service',
    court: 'Bus rapide',
    icone: 'bus',
    repere: 'Le moins cher au kilomètre, sur des voies réservées, et il grimpe jusqu’à 10 %.',
  },
  {
    id: 'metro',
    nom: 'Métro automatique',
    court: 'Métro',
    icone: 'metro',
    repere: 'Chaque station coûte cher, et plus encore creusée profond sous une colline.',
  },
  {
    id: 'cable',
    nom: 'Téléphérique',
    court: 'Câble',
    icone: 'cable',
    repere: 'Il passe au-dessus des fleuves et des collines sans ouvrage, et ne tourne qu’à une gare.',
  },
]
const NOM_MODE: Record<ModeLigne, string> = { tram: 'tramway', bus: 'bus rapide', metro: 'métro', cable: 'téléphérique' }

/** La distance où nous comptons habitants et emplois autour des arrêts, en toutes lettres : « 1 km », « 400 m ». */
const distanceBassin = (mode: ModeLigne) => {
  const r = rayonBassin(mode)
  return r >= 1000 ? `${String(r / 1000).replace('.', ',')} km` : `${r} m`
}

export function useEstimation(): Estimation | null {
  const donnees = useDonnees(useVille().id)
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

/** D'où vient le coût d'une ligne : la voie, les stations, et ce que le terrain impose en plus. */
export function DetailCout({ e, arrets, mode }: { e: Estimation; arrets: number; mode: ModeLigne }) {
  const d = e.detail
  if (!d) return null
  const pluriel = (k: number, un: string, plusieurs: string) => (k > 1 ? plusieurs : un)
  const lignes: [string, number][] = [
    [`La voie, ${km(e.km)} km`, d.voie],
    [`${arrets} ${pluriel(arrets, 'station', 'stations')}`, d.stations],
  ]
  if (d.ouvrages > 0)
    lignes.push([
      mode === 'metro'
        ? `Tunnel à plus de ${TUNNEL_PROFOND} m sous le sol sur ${km(d.kmOuvrage)} km`
        : `Tunnel ou tranchée sur ${km(d.kmOuvrage)} km, le terrain montant jusqu’à ${n(d.penteTerrain)} %`,
      d.ouvrages,
    ])
  if (d.ponts > 0)
    lignes.push([
      mode === 'metro'
        ? `${d.franchissements} ${pluriel(d.franchissements, 'passage', 'passages')} sous un fleuve`
        : `${d.franchissements} ${pluriel(d.franchissements, 'pont', 'ponts')} sur un fleuve`,
      d.ponts,
    ])
  if (d.profondeur > 0)
    lignes.push([
      mode === 'metro'
        ? `${d.stationsProfondes} ${pluriel(d.stationsProfondes, 'station creusée', 'stations creusées')} plus profond sous une colline`
        : `${d.stationsProfondes} ${pluriel(d.stationsProfondes, 'station souterraine', 'stations souterraines')} sous la colline`,
      d.profondeur,
    ])
  return (
    <div className="flex flex-col">
      {lignes.map(([libelle, valeur]) => (
        <Ligne key={libelle} libelle={libelle} valeur={`${n(valeur)} M€`} />
      ))}
    </div>
  )
}

/**
 * Le profil en long de la ligne en cours de tracé : le terrain, la voie que le mode peut suivre, et chaque
 * station. En métro, la profondeur de chaque station ; en tram et en bus, les passages en tunnel.
 */
function Profil({ mode, arrets }: { mode: ModeLigne; arrets: [number, number][] }) {
  const donnees = useDonnees(useVille().id)
  const terrain = donnees?.carreaux.terrain
  const r = useMemo(
    () => (terrain && donnees && arrets.length >= 2 ? relief(terrain, mode, arrets, donnees.carreaux.mx) : null),
    [terrain, donnees, mode, arrets],
  )
  if (!r || r.profil.length < 2) return null
  const L = 320
  const H = 116
  const haut = 14
  const bas = 18
  const total = r.profil.at(-1)!.s || 1
  const valeurs = r.profil.flatMap((p) => [p.z, p.voie])
  const min = Math.min(...valeurs) - 4
  const max = Math.max(...valeurs) + 4
  const x = (s: number) => (s / total) * L
  const y = (z: number) => haut + (1 - (z - min) / (max - min)) * (H - haut - bas)
  const sol = `M0,${H} ${r.profil.map((p) => `L${x(p.s).toFixed(1)},${y(p.z).toFixed(1)}`).join(' ')} L${L},${H} Z`
  const voie = r.profil.map((p, i) => `${i ? 'L' : 'M'}${x(p.s).toFixed(1)},${y(p.voie).toFixed(1)}`).join(' ')
  // Les passages où la voie quitte le terrain : tunnel ou tranchée en tram et en bus.
  const ouvrages =
    mode === 'tram' || mode === 'bus'
      ? r.profil
          .map((p, i) =>
            i > 0 && Math.abs(p.z - p.voie) > 6
              ? `M${x(r.profil[i - 1]!.s).toFixed(1)},${y(r.profil[i - 1]!.voie).toFixed(1)} L${x(p.s).toFixed(1)},${y(p.voie).toFixed(1)}`
              : '',
          )
          .join(' ')
      : ''
  const profondeMax = mode === 'metro' ? Math.max(...r.stations.map((st) => st.z - st.voie)) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <svg viewBox={`0 0 ${L} ${H}`} className="w-full" role="img" aria-label="Profil en long de la ligne">
        <path d={sol} fill="#e9e3d8" stroke="#b9b1a3" strokeWidth={1} />
        <path d={voie} fill="none" stroke="var(--color-rouge)" strokeWidth={2.5} strokeDasharray={mode === 'metro' ? '5 3' : undefined} />
        {ouvrages ? <path d={ouvrages} fill="none" stroke="#1b1b1f" strokeWidth={3.5} /> : null}
        {r.stations.map((st, i) => (
          <g key={i}>
            {mode === 'metro' || st.z - st.voie > 6 ? (
              <line x1={x(st.s)} x2={x(st.s)} y1={y(st.z)} y2={y(st.voie)} stroke="#1b1b1f" strokeWidth={1} strokeDasharray="2 2" />
            ) : null}
            <circle cx={x(st.s)} cy={y(st.voie)} r={3.5} fill="white" stroke="var(--color-rouge)" strokeWidth={2} />
            {mode === 'metro' || st.z - st.voie > 6 ? (
              <text x={Math.min(L - 14, Math.max(14, x(st.s)))} y={H - 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#1b1b1f">
                {Math.round(st.z - st.voie)} m
              </text>
            ) : null}
          </g>
        ))}
        <text x={2} y={10} fontSize={9.5} fontWeight={700} fill="#6b6760">
          {Math.round(max - 4)} m
        </text>
      </svg>
      <p className="text-[12.5px] leading-snug text-gris">
        {mode === 'metro'
          ? `Le tunnel suit le terrain d’aussi près que sa pente de ${Math.round(PENTE_MAX.metro * 100)} % le permet. Sous chaque station, sa profondeur : la plus basse est à ${Math.round(profondeMax)} m.`
          : mode === 'cable'
            ? `Le câble passe au-dessus du terrain, qui varie de ${r.denivele} m le long de la ligne.`
            : `Le terrain monte jusqu’à ${n(r.penteTerrain)} %, et la voie ne dépasse pas ${Math.round(PENTE_MAX[mode] * 100)} %${r.kmOuvrage > 0 ? ' : en noir, les passages en tunnel ou en tranchée' : ''}.`}
      </p>
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
      {cellule(n(e.cout), 'M€', 'de construction')}
      {cellule(`~${approx(e.voyageurs)}`, '', 'voyageurs / jour', true)}
    </div>
  )
}

/** Poser un arrêt en tapant le nom d'un quartier ou d'une commune : l'alternative au toucher sur la carte. */
function AjoutParNom() {
  const ville = useVille()
  const donnees = useDonnees(ville.id)
  const ajouterArret = useJeu((s) => s.ajouterArret)
  const [texte, setTexte] = useState('')
  const [erreur, setErreur] = useState('')
  // Sur téléphone, le champ reste replié pour laisser la carte visible.
  const [ouvert, setOuvert] = useState(false)
  const lieux = useMemo(() => {
    if (!donnees) return []
    const [[ouest, sud], [est, nord]] = ville.zoneRecherche
    const dansLaZone = ([lon, lat]: [number, number]) => lon > ouest && lon < est && lat > sud && lat < nord
    const quartiers = donnees.lieux.quartiers
      .filter(([lon, lat]) => dansLaZone([lon, lat]))
      .map(([lon, lat, nom]) => ({ nom, pos: [lon, lat] as [number, number] }))
    const communes = donnees.lieux.communes
      .map((c) => {
        const anneau = c.anneaux[0] ?? []
        const lon = anneau.reduce((t, p) => t + p[0], 0) / Math.max(1, anneau.length)
        const lat = anneau.reduce((t, p) => t + p[1], 0) / Math.max(1, anneau.length)
        return { nom: c.nom, pos: [lon, lat] as [number, number] }
      })
      // Lyon se cherche par arrondissement.
      .filter((c) => dansLaZone(c.pos) && c.nom !== 'Lyon')
    const arrondissements = donnees.lieux.arrondissements.map(([lon, lat, nom]) => ({ nom, pos: [lon, lat] as [number, number] }))
    const vus = new Set<string>()
    return [...arrondissements, ...communes, ...quartiers]
      .filter((l) => (vus.has(l.nom) ? false : (vus.add(l.nom), true)))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  }, [donnees, ville])

  const ajouter = (ev: React.FormEvent) => {
    ev.preventDefault()
    const cherche = texte.trim().toLocaleLowerCase('fr')
    const trouve =
      lieux.find((l) => l.nom.toLocaleLowerCase('fr') === cherche) ?? lieux.find((l) => l.nom.toLocaleLowerCase('fr').startsWith(cherche))
    if (!cherche || !trouve) {
      setErreur(`Nous ne trouvons pas ce lieu. Essayez un nom de commune ou de quartier ${ville.territoire}.`)
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
            placeholder={ville.exempleRecherche}
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
  const { brouillon, changerMode, retirerArret, abandonnerTrace, ouvrir, libre } = useJeu()
  const ville = useVille()
  const bilan = useBilan()
  const depenses = useDepenses()
  const e = useEstimation()
  const noms = useNomsArrets()
  // Fermer le panneau efface le tracé : au-delà d'un arrêt posé, on demande d'abord.
  const [confirmer, setConfirmer] = useState(false)
  if (!brouillon) return null
  const arrets = brouillon.arrets.length
  const pret = arrets >= 2 && e
  const fermer = () => (arrets >= 2 && !confirmer ? setConfirmer(true) : abandonnerTrace())

  return (
    <Panneau
      titre={`Tracer un ${NOM_MODE[brouillon.mode]}`}
      onFermer={fermer}
      pied={
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
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
            taille="petit"
            className="min-h-13 whitespace-nowrap"
            disabled={!pret}
            onClick={() => ouvrir({ type: 'ligne' })}
          >
            Terminer la ligne
          </Bouton>
        </div>
      }
    >
      {confirmer ? (
        <div role="group" aria-labelledby="abandon-trace" className="flex flex-col gap-3 rounded-2xl bg-sable p-4">
          <p id="abandon-trace" className="text-[14.5px] leading-relaxed">
            Abandonner ce tracé ? Les {arrets} arrêts posés seront effacés.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Bouton genre="rouge" taille="petit" onClick={abandonnerTrace}>
              Abandonner
            </Bouton>
            <Bouton genre="contour" taille="petit" onClick={() => setConfirmer(false)}>
              Continuer le tracé
            </Bouton>
          </div>
        </div>
      ) : null}
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
                <span className="chiffres text-sm font-black whitespace-nowrap">{prixReseau(m.id, ville.id).km} M€ / km</span>
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
            ? 'Touchez la carte pour poser le premier arrêt. Les zones les plus colorées sont celles où vivent et travaillent le plus de gens.'
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
          <div className="flex flex-col gap-1">
            <Surtitre>Le relief sous la ligne</Surtitre>
            <Profil mode={brouillon.mode} arrets={brouillon.arrets} />
          </div>
          <div className="flex flex-col gap-0.5">
            <Surtitre>Ce que coûte la ligne</Surtitre>
            <DetailCout e={e} arrets={arrets} mode={brouillon.mode} />
          </div>
          <div className="hidden flex-col gap-0.5 lg:flex">
            <Surtitre>Autour de vos arrêts, à moins de {distanceBassin(brouillon.mode)}</Surtitre>
            <Ligne libelle="Habitants" valeur={approx(e.habitants)} />
            <Ligne libelle="Emplois" valeur={approx(e.emplois)} />
            <Ligne libelle="Habitants sans tram ni métro aujourd’hui" valeur={approx(e.habitantsNonDesservis)} />
          </div>
          <p className="text-[13px] leading-snug text-gris">
            {libre
              ? `Votre réseau coûterait alors ${n(depenses.investi + e.cout)} M€.`
              : e.cout <= bilan.reste
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
  const donnees = useDonnees(useVille().id)
  const brouillon = useJeu((s) => s.brouillon)
  return useMemo(() => (donnees && brouillon ? nommerArrets(brouillon.arrets, donnees.lieux) : []), [donnees, brouillon])
}

/** Le résultat d'une ligne terminée, avant de la construire. */
export function MaLigne() {
  const { brouillon, mandat, construireLigne, ouvrir, libre } = useJeu()
  const ville = useVille()
  const bilan = useBilan()
  const e = useEstimation()
  const noms = useNomsArrets()
  // Une ligne porte le nom de ses deux terminus, comme sur le réseau.
  // Tant que le joueur ne l'a pas renommée, la ligne porte le nom de ses terminus.
  const [nomSaisi, setNom] = useState<string | null>(null)
  const nom =
    nomSaisi ?? (noms.length >= 2 ? `${noms[0]} - ${noms.at(-1)}` : `Ma ligne de ${brouillon ? NOM_MODE[brouillon.mode] : 'tramway'}`)
  if (!brouillon || !e) return null
  const annee = ouverture(mandat, e.duree)
  // En jeu libre, il n'y a pas de budget à tenir, ni de paiement en deux fois.
  const reste = libre ? Infinity : bilan.reste
  const etaler = mandat === 1 && !libre
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
            {etaler ? (
              <Bouton genre="contour" taille="petit" onClick={() => construireLigne(nom.trim() || 'Ma ligne', e, true)}>
                Payer {n(moitie)} M€ maintenant
              </Bouton>
            ) : null}
            <Bouton genre="contour" taille="petit" onClick={() => ouvrir({ type: 'trace' })} className={etaler ? '' : 'col-span-2'}>
              Modifier le tracé
            </Bouton>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-1.5">
        <CarteChiffre icone="pieces" valeur={n(e.cout)} unite="M€" legende={`pour ${km(e.km)} km et ${brouillon.arrets.length} stations`} />
        <CarteChiffre
          icone="voyageurs"
          valeur={`~${approx(e.voyageurs)}`}
          legende={`voyageurs par jour, entre ${approx(e.bas)} et ${approx(e.haut)}`}
          accent
        />
        <CarteChiffre icone="horloge" valeur={String(annee)} legende={`après ${e.duree} ans de chantier`} />
      </div>
      <div className="flex flex-col gap-0.5">
        <Surtitre>Ce que coûte la ligne</Surtitre>
        <DetailCout e={e} arrets={brouillon.arrets.length} mode={brouillon.mode} />
      </div>
      <div className="flex flex-col gap-0.5">
        <Surtitre>
          Autour de vos {brouillon.arrets.length} arrêts, à moins de {distanceBassin(brouillon.mode)}
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
        {ville.repere}{' '}
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

/**
 * La fiche d'une ligne déjà construite, ouverte d'un clic sur son tracé : ses chiffres, son profil en long,
 * le détail de son coût, ses arrêts, et de quoi la supprimer.
 */
export function FicheLigne({ id }: { id: string }) {
  const { lignes, mandat, retirer, fermer, changerPaiement, libre } = useJeu()
  const ville = useVille()
  const donnees = useDonnees(ville.id)
  const l = lignes.find((x) => x.id === id)
  const noms = useMemo(() => (donnees && l ? nommerArrets(l.arrets, donnees.lieux) : []), [donnees, l])
  const [confirmer, setConfirmer] = useState(false)
  if (!l) return null
  const e = l.estimation
  const annee = ouverture(l.mandat, e.duree)
  // Comme un projet du catalogue, une ligne décidée au premier mandat est lancée : on ne la supprime plus au second.
  const modifiable = l.mandat === mandat
  const moitie = Math.round(e.cout / 2)
  const supprimer = () => {
    retirer(l.id)
    fermer()
  }

  let pied: React.ReactNode
  if (!modifiable) {
    pied = <p className="text-sm leading-relaxed text-gris">Décidée pendant le premier mandat, cette ligne ne peut plus être supprimée.</p>
  } else if (confirmer) {
    pied = (
      <div role="group" aria-labelledby="supprimer-ligne" className="flex flex-col gap-3">
        <p id="supprimer-ligne" className="text-[14.5px] leading-relaxed">
          Supprimer {l.nom} ? Son tracé sera effacé
          {libre ? '.' : ` et ses ${n(l.etale && mandat === 1 ? moitie : e.cout)} M€ reviendront dans votre budget.`}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Bouton genre="rouge" taille="petit" iconeAGauche="poubelle" onClick={supprimer}>
            Supprimer la ligne
          </Bouton>
          <Bouton genre="contour" taille="petit" onClick={() => setConfirmer(false)}>
            Garder la ligne
          </Bouton>
        </div>
      </div>
    )
  } else {
    pied = (
      <div className={clsx('grid gap-2', mandat === 1 && !libre ? 'grid-cols-2' : 'grid-cols-1')}>
        {mandat === 1 && !libre ? (
          <Bouton genre="contour" taille="petit" onClick={() => changerPaiement(l.id, !l.etale)}>
            {l.etale ? 'Payer en une fois' : 'Payer en deux fois'}
          </Bouton>
        ) : null}
        <Bouton genre="contour" taille="petit" iconeAGauche="poubelle" onClick={() => setConfirmer(true)}>
          Supprimer la ligne
        </Bouton>
      </div>
    )
  }

  return (
    <Panneau surtitre={<Pastille icone="trace">Votre ligne de {NOM_MODE[l.mode]}</Pastille>} titre={l.nom} pied={pied}>
      <div className="grid grid-cols-3 gap-1.5">
        <CarteChiffre icone="pieces" valeur={n(e.cout)} unite="M€" legende={`pour ${km(e.km)} km et ${l.arrets.length} stations`} />
        <CarteChiffre
          icone="voyageurs"
          valeur={`~${approx(e.voyageurs)}`}
          legende={`voyageurs par jour, entre ${approx(e.bas)} et ${approx(e.haut)}`}
          accent
        />
        <CarteChiffre icone="horloge" valeur={String(annee)} legende={`après ${e.duree} ans de chantier`} />
      </div>
      {l.etale && !libre ? (
        <p className="text-[13.5px] leading-relaxed text-gris">
          Payée en deux fois : {n(moitie)} M€ sur le premier mandat, {n(e.cout - moitie)} M€ sur le second.
        </p>
      ) : null}
      <p className="rounded-2xl bg-rouge-pale px-4 py-3.5 text-sm leading-relaxed">
        Environ <b className="chiffres">{approx(e.nouveaux)}</b> de ces voyageurs sont nouveaux sur le réseau : c’est ce chiffre qui compte
        dans votre score.
      </p>
      <div className="flex flex-col gap-1">
        <Surtitre>Le relief sous la ligne</Surtitre>
        <Profil mode={l.mode} arrets={l.arrets} />
      </div>
      <div className="flex flex-col gap-0.5">
        <Surtitre>Ce que coûte la ligne</Surtitre>
        <DetailCout e={e} arrets={l.arrets.length} mode={l.mode} />
      </div>
      <div className="flex flex-col gap-0.5">
        <Surtitre>
          Autour de ses {l.arrets.length} arrêts, à moins de {distanceBassin(l.mode)}
        </Surtitre>
        <Ligne libelle="Habitants" valeur={approx(e.habitants)} />
        <Ligne libelle="Emplois" valeur={approx(e.emplois)} />
        <Ligne libelle="Habitants sans tram ni métro aujourd’hui" valeur={approx(e.habitantsNonDesservis)} />
      </div>
      {noms.length ? (
        <div className="flex flex-col gap-2">
          <Surtitre>Ses arrêts</Surtitre>
          <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[13.5px] font-bold">
            {noms.map((nomArret, i) => (
              <li key={i} className="flex items-center gap-1">
                <span className="rounded-full bg-sable px-2.5 py-1">{nomArret}</span>
                {i < noms.length - 1 ? <span aria-hidden="true" className="h-0.5 w-2.5 bg-encre" /> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </Panneau>
  )
}
