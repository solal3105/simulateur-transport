'use client'

import { clsx } from 'clsx'
import { useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react'

import { chantierComparable } from '@/lib/chantiers'
import { useDonnees } from '@/lib/donnees'
import { approx, km, n } from '@/lib/format'
import { communesDes } from '@/lib/lieux'
import { prixReseau } from '@/lib/couts'
import { PENTE_MAX, relief, TUNNEL_PROFOND } from '@/lib/terrain'
import {
  DUREE_CHANTIER,
  estimer,
  premiereStationPayee,
  projetContinue,
  prolongementPossible,
  rayonBassin,
  stationsDuTrace,
  suiteDe,
} from '@/lib/modele'
import { boutsDeLigne, lignesAProlonger, nomDuDepart, origineDe, type AProlonger } from '@/lib/prolongements'
import { correspondances, direLignes, nommerTrace, prolongementsDepuis, stationProche } from '@/lib/reseau'
import { NOM_ARRET_MAX } from '@/lib/partie'
import { ouverture } from '@/lib/regles'
import { useJeu, useVille } from '@/lib/store'
import type { Estimation, LigneJoueur, Mandat, ModeLigne } from '@/lib/types'

import { useBilan, useDepenses } from '../partie/budget'
import { Bouton, CarteChiffre, Deroulant, Icone, ICONE_MODE, Pastille, Surtitre, useGrandEcran, type NomIcone } from '../ui'
import { Panneau } from './Panneau'
import { Rendement } from './Rendement'

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
  const lignes = useJeu((s) => s.lignes)
  const chantiers = useJeu((s) => s.chantiers)
  const mandat = useJeu((s) => s.mandat)
  return useMemo(
    () =>
      donnees && brouillon
        ? estimer(brouillon.mode, brouillon.arrets, donnees.carreaux, {
            passages: brouillon.passages,
            prolonge: Boolean(brouillon.prolonge),
            // Partir du bout d'une de vos lignes ou d'un prolongement du catalogue d'un mandat précédent, c'est le
            // continuer : sa station est déjà là.
            suite:
              !brouillon.prolonge &&
              premiereStationPayee({ mode: brouillon.mode, arrets: brouillon.arrets, mandat }, lignes, chantiers, donnees.carreaux.mx),
          })
        : null,
    [donnees, brouillon, lignes, chantiers, mandat],
  )
}

/** Ce qui identifie une proposition de prolongement, pour ne plus la montrer une fois écartée. */
const cleProposition = (liste: { ligne: { id: string } }[]) => liste.map((c) => c.ligne.id).join(',')

/** « a, b et c » : une énumération dans une phrase. */
const enumerer = (mots: string[]) => (mots.length <= 1 ? (mots[0] ?? '') : `${mots.slice(0, -1).join(', ')} et ${mots.at(-1)}`)

/** « Métro D » devient « métro D », pour le glisser dans une phrase. */
const minuscule = (texte: string) => texte.charAt(0).toLowerCase() + texte.slice(1)

/**
 * Ce qu'un tracé sait du réseau actuel : lesquels de ses points sont des stations, leurs noms, leurs
 * correspondances, la ligne qu'il prolonge, et celle qu'il pourrait prolonger s'il part de son terminus.
 */
function useReseauDuTrace(trace: (Pick<LigneJoueur, 'mode' | 'arrets' | 'passages' | 'prolonge' | 'noms'> & { mandat?: Mandat }) | null) {
  const donnees = useDonnees(useVille().id)
  const lignes = useJeu((s) => s.lignes)
  const chantiers = useJeu((s) => s.chantiers)
  const mandatCourant = useJeu((s) => s.mandat)
  return useMemo(() => {
    if (!donnees || !trace) return null
    const { mx } = donnees.carreaux
    const estStation = stationsDuTrace(trace.arrets.length, trace.passages)
    const noms = nommerTrace(trace.arrets, estStation, donnees.lieux, donnees.stations, mx, trace.noms)
    const prolongee = trace.prolonge ? donnees.reseau?.lignes.find((l) => l.id === trace.prolonge) : undefined
    const t = { mode: trace.mode, arrets: trace.arrets, mandat: trace.mandat ?? mandatCourant }
    // Une de vos lignes d'un mandat précédent que ce tracé continue depuis son bout, dont il reprend la station ; à
    // défaut, un prolongement du catalogue décidé avant, dont il reprend la dernière station.
    const suite = trace.prolonge ? undefined : suiteDe(t, lignes, mx)
    const projet = trace.prolonge || suite ? undefined : projetContinue(t, chantiers, mx)
    // Ce que le tracé continue en fin de compte : une ligne existante, ou la première de vos lignes.
    const origine = suite || projet ? origineDe(t, { lignes, chantiers }, donnees) : undefined
    // La première station porte le nom de ce qu'elle prolonge ou continue, sauf si le joueur l'a renommée.
    const nomDepart = nomDuDepart({ ...t, prolonge: trace.prolonge }, { lignes, chantiers }, donnees)
    if (nomDepart && estStation[0] && !trace.noms?.[0]) noms[0] = nomDepart
    // Le terminus d'un prolongement est sur la ligne prolongée : ce n'est pas une correspondance avec elle.
    const liste = correspondances(trace.arrets, estStation, donnees.stations, mx)
      .map((c) =>
        c.rang === 0 && trace.prolonge
          ? { ...c, station: { ...c.station, lignes: c.station.lignes.filter((l) => l.id !== trace.prolonge) } }
          : c,
      )
      .filter((c) => c.station.lignes.length || c.station.gare)
    // Les lignes que le tracé pourrait prolonger, s'il part tout près d'un de leurs terminus : toutes, et pas seulement
    // la première, quand deux lignes finissent au même endroit.
    const depart = trace.arrets[0]
    const aProlonger =
      depart && !trace.prolonge
        ? prolongementsDepuis(donnees.reseau, trace.mode, depart, stationProche(donnees.stations, depart, mx, 60), mx, (p) =>
            prolongementPossible(trace.mode, p, donnees.carreaux),
          )
        : []
    const stationsNommees = noms.filter((x): x is string => Boolean(x))
    // Ce que prolonge le tracé, pour le dire : « le tram T10 », ou l'une de vos lignes par son nom.
    const existante = prolongee ?? origine?.existante
    const quoi = existante
      ? { objet: `le ${minuscule(existante.nom)}`, complement: `du ${minuscule(existante.nom)}` }
      : origine?.premiere
        ? { objet: origine.premiere.nom, complement: `de ${origine.premiere.nom}` }
        : null
    // La première station est déjà construite : celle de la ligne prolongée, ou celle de ce que le tracé continue.
    const premiereConstruite = Boolean(trace.prolonge || suite || projet)
    return { estStation, noms, stationsNommees, liste, prolongee, suite, origine, quoi, premiereConstruite, aProlonger, donnees }
  }, [donnees, trace, lignes, chantiers, mandatCourant])
}

/** Les stations d'une ligne, dans l'ordre, reliées par un trait. */
function ListeStations({ noms, titre }: { noms: string[]; titre: string }) {
  if (!noms.length) return null
  return (
    <div className="flex flex-col gap-2">
      <Surtitre>{titre}</Surtitre>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[13.5px] font-bold">
        {noms.map((nom, i) => (
          <li key={i} className="flex items-center gap-1">
            <span className="rounded-full bg-sable px-2.5 py-1">{nom}</span>
            {i < noms.length - 1 ? <span aria-hidden="true" className="h-0.5 w-2.5 bg-encre" /> : null}
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Le champ où l'on donne son nom à une station du tracé, à la place de son nom dans la liste. Il s'ouvre quand on touche
 * la station, ici ou sur la carte ; quitter le champ garde le nom tapé, Échap le referme sans rien changer.
 */
function ChampNom({ i, nom, milieu }: { i: number; nom: string; milieu: boolean }) {
  const { nommerArret, renommer, basculerPassage } = useJeu()
  const [valeur, setValeur] = useState(nom)
  // Le champ disparaît dès qu'on a validé ou annulé : sa perte de focus ne doit rien enregistrer de plus.
  const fini = useRef(false)
  const valider = () => {
    if (fini.current) return
    fini.current = true
    nommerArret(i, valeur)
  }
  // Au clavier, on retrouve la station dans la liste une fois le champ refermé.
  const revenir = () => requestAnimationFrame(() => document.getElementById(`station-${i}`)?.focus())
  // Un clic sur un bouton du champ ne doit pas lui faire perdre le focus avant d'agir : Safari ne le donne pas aux boutons.
  const garderFocus = (e: MouseEvent) => e.preventDefault()
  return (
    <form
      className="flex w-full flex-wrap items-center gap-2 rounded-2xl bg-sable p-2"
      onSubmit={(e) => {
        e.preventDefault()
        valider()
        revenir()
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) valider()
      }}
    >
      <label htmlFor={`nom-station-${i}`} className="sr-only">
        Nom de la station
      </label>
      <input
        id={`nom-station-${i}`}
        autoFocus
        value={valeur}
        maxLength={NOM_ARRET_MAX}
        autoComplete="off"
        enterKeyHint="done"
        onChange={(e) => setValeur(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          // Échap referme le champ, pas le panneau.
          e.preventDefault()
          e.stopPropagation()
          fini.current = true
          renommer()
          revenir()
        }}
        className="min-h-10 min-w-0 flex-1 rounded-full bg-white px-3.5 text-[14px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-encre"
      />
      <Bouton type="submit" genre="encre" taille="petit" onMouseDown={garderFocus}>
        Valider
      </Bouton>
      {milieu ? (
        <button
          type="button"
          onMouseDown={garderFocus}
          onClick={() => {
            fini.current = true
            renommer()
            basculerPassage(i)
          }}
          className="basis-full px-1.5 text-left text-[12.5px] font-bold text-gris underline underline-offset-3 hover:text-encre"
        >
          En faire un point de passage, où la ligne passe sans s’arrêter
        </button>
      ) : null}
    </form>
  )
}

/**
 * Ce qui situe une ligne tracée, calculé sans rien inventer : les communes que ses stations desservent, et le chantier
 * réel qui lui ressemble le plus parmi ceux qui calent nos prix.
 */
function EnBref({ trace, longueur }: { trace: Pick<LigneJoueur, 'mode' | 'arrets' | 'passages'>; longueur: number }) {
  const ville = useVille()
  const donnees = useDonnees(ville.id)
  const communes = useMemo(() => {
    if (!donnees) return []
    const estStation = stationsDuTrace(trace.arrets.length, trace.passages)
    return communesDes(
      trace.arrets.filter((_, i) => estStation[i]),
      donnees.lieux,
    )
  }, [donnees, trace])
  const comparable = chantierComparable(trace.mode, longueur, ville.id)
  if (!communes.length && !comparable) return null
  return (
    <p className="text-[13px] leading-normal text-gris">
      {communes.length ? `Elle dessert ${enumerer(communes)}. ` : ''}
      {comparable
        ? `Pour comparer, ${comparable.nom} compte ${comparable.stations} stations sur ${km(comparable.km)} km et revient à ${n(comparable.cout)} M€.`
        : ''}
    </p>
  )
}

/** Les correspondances d'un tracé en une phrase : « métro A et D à Bellecour, tram T1 à Perrache ». */
function PhraseCorrespondances({ liste }: { liste: NonNullable<ReturnType<typeof useReseauDuTrace>>['liste'] }) {
  if (!liste.length) return null
  const morceaux = liste.map((c) =>
    c.station.lignes.length ? `${direLignes(c.station.lignes)} à ${c.station.nom}` : `la gare de ${c.station.nom}`,
  )
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-sable px-3.5 py-2.5 text-[13.5px] leading-snug">
      <Icone nom="voyageurs" taille={17} epaisseur={2.3} className="mt-0.5 shrink-0" />
      <span>
        {liste.length > 1 ? `${liste.length} correspondances avec le réseau actuel : ` : 'Une correspondance avec le réseau actuel : '}
        {morceaux.join(', ')}.
      </span>
    </p>
  )
}

function Ligne({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-trait py-1.5 text-[13px]">
      <span className="text-gris">{libelle}</span>
      <span className="chiffres text-right font-extrabold">{valeur}</span>
    </div>
  )
}

/** D'où vient le coût d'une ligne : la voie, les stations, et ce que le terrain impose en plus. */
export function DetailCout({ e, arrets, mode, prolonge }: { e: Estimation; arrets: number; mode: ModeLigne; prolonge?: boolean }) {
  const d = e.detail
  if (!d) return null
  const pluriel = (k: number, un: string, plusieurs: string) => (k > 1 ? plusieurs : un)
  const lignes: [string, number][] = [
    [`La voie, ${km(e.km)} km`, d.voie],
    [`${arrets} ${pluriel(arrets, 'station', 'stations')}${prolonge ? `, le terminus existant en plus` : ''}`, d.stations],
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
function Profil({ mode, arrets, passages }: { mode: ModeLigne; arrets: [number, number][]; passages?: number[] }) {
  const donnees = useDonnees(useVille().id)
  const terrain = donnees?.carreaux.terrain
  const r = useMemo(
    () =>
      terrain && donnees && arrets.length >= 2
        ? relief(terrain, mode, arrets, donnees.carreaux.mx, stationsDuTrace(arrets.length, passages))
        : null,
    [terrain, donnees, mode, arrets, passages],
  )
  if (!r || r.profil.length < 2) return null
  const L = 320
  const H = 92
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
    <div className="flex flex-col">
      <div className={clsx('flex items-baseline gap-1 whitespace-nowrap', accent && 'text-rouge')}>
        <span className="chiffres text-[17px] font-black">{valeur}</span>
        <span className="text-[11px] font-extrabold">{unite}</span>
      </div>
      <span className="text-[11.5px] leading-tight font-semibold text-gris">{legende}</span>
    </div>
  )
  return (
    <div className="grid grid-cols-[auto_auto_auto_minmax(0,1fr)] gap-x-4 gap-y-1 rounded-xl bg-sable px-3 py-2.5">
      {cellule(km(e.km), 'km', 'de ligne')}
      {cellule(String(arrets), '', arrets > 1 ? 'stations' : 'station')}
      {cellule(n(e.cout), 'M€', 'à construire')}
      {/* Comme dans les fiches : les voyageurs qui comptent dans le score, les nouveaux sur le réseau. */}
      {cellule(e.nouveaux > 0 ? `+${approx(e.nouveaux)}` : '0', '', 'nouveaux voyageurs par jour', true)}
    </div>
  )
}

/** Un nom réduit à ses lettres : « Châtelet » et « chatelet », « L’Ariane » et « l'ariane », « St-Priest » et « Saint Priest » se retrouvent. */
const cleRecherche = (nom: string) =>
  nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    // « Cœur d'Orly » s'écrit aussi « Coeur d'Orly ».
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    // « St Priest », « Ste-Foy » : les abréviations de saint et de sainte.
    .replace(/\bste?\b/g, (m) => (m === 'st' ? 'saint' : 'sainte'))

/** Un lieu où poser un arrêt : une station ou une gare du réseau actuel, un arrondissement, une commune ou un quartier. */
type LieuCherche = { nom: string; cle: string; pos: [number, number]; station: boolean }

/**
 * Poser un arrêt en tapant le nom d'une station, d'une commune ou d'un quartier : l'alternative au toucher sur la carte.
 * Le nom exact passe avant un début de nom, puis un mot du nom, puis un morceau. À égalité, une station passe avant un
 * quartier du même nom, et un lieu proche du dernier arrêt posé avant un homonyme lointain : « Saint-Lazare » mène à
 * la gare parisienne, pas au quartier de Saint-Mammès. Une station choisie ainsi est posée sur la station elle-même.
 */
function AjoutParNom() {
  const ville = useVille()
  const donnees = useDonnees(ville.id)
  const ajouterArret = useJeu((s) => s.ajouterArret)
  const dernierArret = useJeu((s) => s.brouillon?.arrets.at(-1))
  const [texte, setTexte] = useState('')
  const [erreur, setErreur] = useState('')
  // Sur téléphone, le champ reste replié pour laisser la carte visible ; sur ordinateur, il est ouvert tant qu'on ne le replie pas.
  const grand = useGrandEcran()
  const [ouvert, setOuvert] = useState<boolean | null>(null)
  const lieux = useMemo<LieuCherche[]>(() => {
    if (!donnees) return []
    const [[ouest, sud], [est, nord]] = ville.zoneRecherche
    const dansLaZone = ([lon, lat]: [number, number]) => lon > ouest && lon < est && lat > sud && lat < nord
    const lieu = (nom: string, pos: [number, number], station = false): LieuCherche => ({ nom, cle: cleRecherche(nom), pos, station })
    const stations = donnees.stations.filter((s) => s.nom && dansLaZone(s.pos)).map((s) => lieu(s.nom, s.pos, true))
    const quartiers = donnees.lieux.quartiers.filter(([lon, lat]) => dansLaZone([lon, lat])).map(([lon, lat, nom]) => lieu(nom, [lon, lat]))
    const communes = donnees.lieux.communes
      .map((c) => {
        const anneau = c.anneaux[0] ?? []
        const lon = anneau.reduce((t, p) => t + p[0], 0) / Math.max(1, anneau.length)
        const lat = anneau.reduce((t, p) => t + p[1], 0) / Math.max(1, anneau.length)
        return lieu(c.nom, [lon, lat])
      })
      // Lyon se cherche par arrondissement.
      .filter((c) => dansLaZone(c.pos) && c.nom !== 'Lyon')
    const arrondissements = donnees.lieux.arrondissements.map(([lon, lat, nom]) => lieu(nom, [lon, lat]))
    return [...stations, ...arrondissements, ...communes, ...quartiers]
  }, [donnees, ville])
  // Les suggestions du champ : chaque nom une fois, dans l'ordre alphabétique.
  const suggestions = useMemo(() => [...new Set(lieux.map((l) => l.nom))].sort((a, b) => a.localeCompare(b, 'fr')), [lieux])

  const chercher = (demande: string) => {
    const q = cleRecherche(demande)
    if (!q) return undefined
    const rang = (l: LieuCherche) =>
      l.cle === q ? 0 : l.cle.startsWith(q) ? 1 : ` ${l.cle}`.includes(` ${q}`) ? 2 : l.cle.includes(q) ? 3 : Infinity
    const [lon0, lat0] = dernierArret ?? ville.centre
    const kx = Math.cos((lat0 * Math.PI) / 180)
    const eloignement = (l: LieuCherche) => Math.hypot((l.pos[0] - lon0) * kx, l.pos[1] - lat0)
    return lieux
      .map((l) => ({ l, r: rang(l) }))
      .filter((x) => x.r < Infinity)
      .sort((a, b) => a.r - b.r || Number(b.l.station) - Number(a.l.station) || eloignement(a.l) - eloignement(b.l))[0]?.l
  }

  const ajouter = (ev: React.FormEvent) => {
    ev.preventDefault()
    const trouve = chercher(texte)
    if (!trouve) {
      setErreur(`Nous ne trouvons pas ce lieu. Essayez un nom de station, de commune ou de quartier ${ville.territoire}.`)
      return
    }
    ajouterArret(trouve.pos, { station: true })
    setTexte('')
    setErreur('')
  }

  return (
    <Deroulant
      taille="compact"
      icone="loupe"
      titre="Ajouter un arrêt par son nom"
      resume="Tapez une station, une commune ou un quartier : l’arrêt s’ajoute au bout de la ligne."
      ouvert={ouvert ?? grand}
      onChange={setOuvert}
    >
      <form onSubmit={ajouter} className="flex flex-col gap-1.5">
        <label htmlFor="ajout-arret" className="sr-only">
          Nom de l’arrêt à ajouter
        </label>
        <div className="flex gap-1.5">
          <input
            id="ajout-arret"
            list="lieux-arrets"
            value={texte}
            onChange={(ev) => setTexte(ev.target.value)}
            placeholder={ville.exempleRecherche}
            aria-describedby={erreur ? 'erreur-arret' : undefined}
            className="min-h-10 min-w-0 flex-1 rounded-xl bg-sable px-3 text-[14px] font-semibold outline-none focus:shadow-[inset_0_0_0_2px_var(--color-encre)]"
          />
          <button type="submit" className="min-h-10 shrink-0 rounded-xl bg-encre px-3.5 text-[13px] font-extrabold text-white">
            Ajouter
          </button>
        </div>
        <datalist id="lieux-arrets">
          {suggestions.map((nom) => (
            <option key={nom} value={nom} />
          ))}
        </datalist>
        {erreur ? (
          <p id="erreur-arret" className="text-[13px] font-semibold text-rouge-fonce">
            {erreur}
          </p>
        ) : null}
      </form>
    </Deroulant>
  )
}

/** « 8 stations et 1 point de passage » : ce que compte un tracé. */
const compte = (stations: number, passages: number) =>
  `${stations} ${stations > 1 ? 'stations' : 'station'}${passages ? ` et ${passages} ${passages > 1 ? 'points de passage' : 'point de passage'}` : ''}`

/** Un point qu'on fait glisser dans la liste : d'où il part, où il irait, et la place de chaque ligne au départ. */
type Glisse = { de: number; vers: number; dy: number; y0: number; centres: number[]; hauteur: number }

/**
 * Les points du tracé, du premier au dernier. On change leur ordre en les faisant glisser par leur poignée, ou avec les
 * flèches du clavier, et le + entre deux points ajoute une station à mi-chemin, qu'on place ensuite sur la carte. Le
 * terminus d'une ligne qu'on prolonge reste en tête : c'est la station qui existe déjà.
 */
function ListeTrace({ noms, estStation, fixe }: { noms: (string | null)[]; estStation: boolean[]; fixe: boolean }) {
  const { brouillon, renommer, basculerPassage, enleverArret, insererArret, reordonner } = useJeu()
  const elements = useRef<(HTMLLIElement | null)[]>([])
  const [glisse, setGlisse] = useState<Glisse | null>(null)
  if (!brouillon) return null
  const arrets = brouillon.arrets
  const n = arrets.length
  const premier = fixe ? 1 : 0
  const libelleDe = (i: number) => (estStation[i] === false ? 'Point de passage' : (noms[i] ?? `Station ${i + 1}`))

  const saisir = (i: number) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const cadres = elements.current.slice(0, n).map((el) => el?.getBoundingClientRect())
    setGlisse({
      de: i,
      vers: i,
      dy: 0,
      y0: e.clientY,
      centres: cadres.map((c) => (c ? c.top + c.height / 2 : 0)),
      hauteur: cadres[i]?.height ?? 40,
    })
  }
  const bouger = (e: PointerEvent<HTMLButtonElement>) => {
    if (!glisse) return
    const dy = e.clientY - glisse.y0
    const centre = glisse.centres[glisse.de]! + dy
    const avant = glisse.centres.filter((c, k) => k !== glisse.de && c < centre).length
    setGlisse({ ...glisse, dy, vers: Math.max(premier, Math.min(n - 1, avant)) })
  }
  const lacher = (garder: boolean) => () => {
    if (glisse && garder && glisse.vers !== glisse.de) reordonner(glisse.de, glisse.vers)
    setGlisse(null)
  }
  // Pendant le glissement, les autres points s'écartent pour lui faire place.
  const decalage = (k: number) => {
    if (!glisse) return 0
    if (k === glisse.de) return glisse.dy
    if (glisse.de < glisse.vers && k > glisse.de && k <= glisse.vers) return -glisse.hauteur
    if (glisse.vers < glisse.de && k >= glisse.vers && k < glisse.de) return glisse.hauteur
    return 0
  }

  return (
    <>
      <ol className="flex flex-col text-[13.5px] font-bold" aria-describedby="aide-liste-trace">
        {arrets.map((a, i) => {
          const passage = estStation[i] === false
          const libelle = libelleDe(i)
          const mobile = i >= premier && n > premier + 1
          const suivant = arrets[i + 1]
          return (
            <li
              key={`${i}-${a.join(',')}`}
              ref={(el) => {
                elements.current[i] = el
              }}
              style={decalage(i) ? { transform: `translateY(${decalage(i)}px)` } : undefined}
              className={clsx(
                'relative flex min-h-11 items-center gap-1',
                glisse?.de === i ? 'z-10 rounded-xl bg-white shadow-flotte' : glisse && 'transition-transform duration-150',
              )}
            >
              {mobile ? (
                <button
                  id={`poignee-${i}`}
                  type="button"
                  onPointerDown={saisir(i)}
                  onPointerMove={bouger}
                  onPointerUp={lacher(true)}
                  onPointerCancel={lacher(false)}
                  onKeyDown={(e) => {
                    const vers = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : null
                    if (vers === null || vers < premier || vers >= n) return
                    e.preventDefault()
                    reordonner(i, vers)
                    requestAnimationFrame(() => document.getElementById(`poignee-${vers}`)?.focus())
                  }}
                  aria-label={`Changer la place de ${libelle}, ${i + 1} sur ${n}`}
                  title="Faire glisser pour changer l’ordre"
                  className={clsx(
                    'grid size-8 shrink-0 touch-none place-items-center rounded-lg text-muet hover:bg-sable hover:text-encre',
                    glisse?.de === i ? 'cursor-grabbing' : 'cursor-grab',
                  )}
                >
                  <Icone nom="poignee" taille={18} epaisseur={3.2} />
                </button>
              ) : (
                <span className="size-8 shrink-0" />
              )}
              {/* Le fil de la ligne, avec un rond plein par station et un petit rond creux par point de passage. */}
              <span aria-hidden="true" className="relative flex w-4 shrink-0 justify-center self-stretch">
                {i > 0 ? <span className="absolute top-0 bottom-1/2 w-0.5 bg-encre" /> : null}
                {i < n - 1 ? <span className="absolute top-1/2 bottom-0 w-0.5 bg-encre" /> : null}
                <span
                  className={clsx(
                    'relative self-center rounded-full bg-white',
                    passage ? 'size-2 shadow-[0_0_0_2px_var(--color-muet)]' : 'size-3 shadow-[0_0_0_2.5px_var(--color-encre)]',
                  )}
                />
              </span>
              {!passage && brouillon.renomme === i ? (
                <div className="min-w-0 flex-1 py-1">
                  <ChampNom i={i} nom={libelle} milieu={i > 0 && i < n - 1} />
                </div>
              ) : (
                <>
                  {/* Toucher une station ouvre son nom ; toucher un point de passage en refait une station. */}
                  <button
                    id={`station-${i}`}
                    type="button"
                    onClick={() => (passage ? basculerPassage(i) : renommer(i))}
                    title={passage ? 'En faire une station' : 'Renommer cette station'}
                    aria-label={passage ? 'Faire de ce point de passage une station' : `Renommer ${libelle}`}
                    className={clsx(
                      'min-w-0 flex-1 truncate py-2 pl-1 text-left underline decoration-transparent underline-offset-3 hover:decoration-current',
                      passage && 'font-semibold text-gris',
                    )}
                  >
                    {libelle}
                  </button>
                  <button
                    type="button"
                    onClick={() => enleverArret(i)}
                    aria-label={`Retirer ${passage ? 'ce point de passage' : libelle}`}
                    title="Retirer ce point"
                    className="grid size-8 shrink-0 place-items-center rounded-full text-gris transition-colors hover:bg-sable hover:text-rouge-fonce"
                  >
                    <Icone nom="fermer" taille={13} epaisseur={2.6} />
                  </button>
                </>
              )}
              {suivant && !glisse && brouillon.renomme === undefined ? (
                <button
                  type="button"
                  onClick={() => insererArret(i + 1, [(a[0] + suivant[0]) / 2, (a[1] + suivant[1]) / 2], { station: true })}
                  aria-label={`Ajouter une station entre ${libelle} et ${libelleDe(i + 1)}`}
                  title="Ajouter une station ici"
                  className="absolute -bottom-[9px] left-[35px] z-20 grid size-[18px] place-items-center rounded-full bg-white text-gris shadow-[inset_0_0_0_1.5px_var(--color-trait)] transition-colors before:absolute before:-inset-[5px] hover:text-rouge hover:shadow-[inset_0_0_0_1.5px_var(--color-rouge)]"
                >
                  <Icone nom="plus" taille={11} epaisseur={2.8} />
                </button>
              ) : null}
            </li>
          )
        })}
      </ol>
      <p id="aide-liste-trace" className="text-[12px] leading-snug font-semibold text-gris">
        {n > premier + 1 ? 'Faites glisser la poignée pour changer l’ordre. ' : ''}
        {n >= 2 ? 'Le + ajoute une station à mi-chemin, que vous placez ensuite sur la carte.' : 'Posez un deuxième arrêt sur la carte.'}
      </p>
    </>
  )
}

/** Le panneau affiché pendant qu'on pose les arrêts. */
export function Traceur() {
  const { brouillon, changerMode, retirerArret, enleverArret, abandonnerTrace, ouvrir, libre, lignes, basculerPassage, choisirOutil } =
    useJeu()
  const renommer = useJeu((s) => s.renommer)
  const { detacher, rattacher } = useJeu()
  const ville = useVille()
  const bilan = useBilan()
  const depenses = useDepenses()
  const e = useEstimation()
  const r = useReseauDuTrace(brouillon)
  // Fermer le panneau efface le tracé : au-delà d'un arrêt posé, on demande d'abord.
  const [confirmer, setConfirmer] = useState(false)
  // La suggestion de prolonger une ligne, écartée pour ce terminus.
  const [ecartee, setEcartee] = useState<string | null>(null)
  const [listeOuverte, setListeOuverte] = useState(false)
  if (!brouillon) return null
  const arrets = brouillon.arrets.length
  const pret = arrets >= 2 && e
  const noms = r?.noms ?? []
  const nomsStations = r?.stationsNommees ?? []
  const stations = r ? r.estStation.filter(Boolean).length : arrets
  const outil = brouillon.outil ?? 'station'
  // En modification, fermer ramène à la fiche de la ligne sans rien changer.
  const modifiee = brouillon.edition ? lignes.find((l) => l.id === brouillon.edition) : undefined
  const fermer = () => (arrets >= 2 && !confirmer ? setConfirmer(true) : abandonnerTrace())

  return (
    <Panneau
      titre={modifiee ? `Modifier ${modifiee.nom}` : r?.quoi ? `Prolonger ${r.quoi.objet}` : `Tracer un ${NOM_MODE[brouillon.mode]}`}
      onFermer={fermer}
      pied={
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
          <Bouton
            genre="sable"
            iconeAGauche="annuler"
            taille="petit"
            className="justify-start"
            disabled={arrets === 0}
            onClick={retirerArret}
          >
            Retirer l’arrêt
          </Bouton>
          <Bouton genre="rouge" taille="petit" className="whitespace-nowrap" disabled={!pret} onClick={() => ouvrir({ type: 'ligne' })}>
            {modifiee ? 'Voir le résultat' : 'Terminer la ligne'}
          </Bouton>
        </div>
      }
    >
      {confirmer ? (
        <div role="group" aria-labelledby="abandon-trace" className="flex flex-col gap-3 rounded-xl bg-sable p-3">
          <p id="abandon-trace" className="text-[13.5px] leading-normal">
            {modifiee
              ? `Abandonner les modifications ? ${modifiee.nom} garde son tracé de départ.`
              : `Abandonner ce tracé ? Les ${arrets} arrêts posés seront effacés.`}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Bouton genre="rouge" taille="petit" onClick={abandonnerTrace}>
              {modifiee ? 'Abandonner les modifications' : 'Abandonner'}
            </Bouton>
            <Bouton genre="contour" taille="petit" onClick={() => setConfirmer(false)}>
              Continuer le tracé
            </Bouton>
          </div>
        </div>
      ) : null}
      {r?.prolongee ? (
        <div className="flex flex-col gap-1 rounded-xl bg-rouge-pale px-3 py-2.5">
          <p className="text-[13px] leading-snug font-semibold">
            Vous prolongez le {minuscule(r.prolongee.nom)} depuis {noms[0] ?? 'son terminus'}. Cette station existe déjà : vous ne payez que
            les nouvelles.
          </p>
          <button
            type="button"
            onClick={detacher}
            className="min-h-8 self-start text-[12.5px] font-extrabold text-rouge-fonce underline underline-offset-3"
          >
            En faire une ligne à part
          </button>
        </div>
      ) : r?.origine ? (
        <p className="rounded-xl bg-rouge-pale px-3 py-2.5 text-[13px] leading-snug font-semibold">
          {r.origine.existante
            ? `Vous prolongez le ${minuscule(r.origine.existante.nom)} depuis ${noms[0] ?? 'son terminus'}, au bout du prolongement décidé au mandat ${r.origine.mandat}.`
            : `Vous prolongez votre ligne ${r.origine.premiere?.nom ?? ''}, décidée au mandat ${r.origine.mandat}, depuis ${noms[0] ?? 'son terminus'}.`}{' '}
          Cette station sera déjà construite : vous ne payez que les nouvelles.
        </p>
      ) : null}
      {arrets === 0 && !modifiee ? <Prolonger /> : null}
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Type de ligne</legend>
        {/* Téléphone : une rangée compacte pour laisser la carte visible. */}
        <div className="flex gap-1.5 lg:hidden">
          {MODES.map((m) => (
            <label
              key={m.id}
              className={clsx(
                'relative flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full text-[13px] font-extrabold',
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
        {/* Ordinateur : quatre tuiles côte à côte avec leur prix au kilomètre, puis ce qui fait le prix du mode choisi. */}
        <div className="hidden grid-cols-4 gap-1.5 lg:grid">
          {MODES.map((m) => (
            <label
              key={m.id}
              className={clsx(
                'relative flex cursor-pointer flex-col items-center gap-0.5 rounded-xl px-1 pt-2 pb-1.5 text-center transition-colors',
                brouillon.mode === m.id
                  ? 'bg-white shadow-[inset_0_0_0_2px_var(--color-rouge)]'
                  : 'bg-white shadow-[inset_0_0_0_1.5px_var(--color-trait)] hover:bg-sable',
              )}
            >
              <input type="radio" name="mode" className="sr-only" checked={brouillon.mode === m.id} onChange={() => changerMode(m.id)} />
              <Icone nom={m.icone} taille={18} className={brouillon.mode === m.id ? 'text-rouge' : 'text-gris'} />
              <span className="text-[12.5px] leading-tight font-extrabold">{m.court}</span>
              <span className="chiffres text-[11.5px] leading-tight font-bold text-gris">{prixReseau(m.id, ville.id).km} M€/km</span>
            </label>
          ))}
        </div>
        <p className="hidden text-[12.5px] leading-snug text-gris lg:block">
          <span className="font-extrabold text-encre">{MODES.find((m) => m.id === brouillon.mode)?.nom}.</span>{' '}
          {MODES.find((m) => m.id === brouillon.mode)?.repere} Chantier d’environ {DUREE_CHANTIER[brouillon.mode]} ans.
        </p>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <div role="radiogroup" aria-label="Ce que pose un toucher sur la carte" className="grid grid-cols-2 rounded-full bg-sable p-1">
          {(
            [
              { valeur: 'station', texte: 'Poser une station', court: 'Station' },
              { valeur: 'passage', texte: 'Poser un point de passage', court: 'Point de passage' },
            ] as const
          ).map((o) => (
            <button
              key={o.valeur}
              type="button"
              role="radio"
              aria-checked={outil === o.valeur}
              onClick={() => choisirOutil(o.valeur)}
              className={clsx(
                'min-h-9 rounded-full px-2 text-[12.5px] leading-tight font-extrabold transition-colors',
                outil === o.valeur ? 'bg-encre text-white' : 'text-gris hover:text-encre',
              )}
            >
              {/* Sur téléphone, un libellé court garde la carte visible ; le nom complet reste lu à voix haute. */}
              <span className="lg:hidden" aria-hidden="true">
                {o.court}
              </span>
              <span className="sr-only lg:not-sr-only">{o.texte}</span>
            </button>
          ))}
        </div>
        {outil === 'passage' ? (
          <p className="text-[12.5px] leading-snug text-gris">
            La ligne passe par ce point sans s’y arrêter : il ne coûte rien et n’attire pas de voyageurs, il sert à suivre une rue ou à
            contourner un obstacle.
          </p>
        ) : null}
      </div>

      <AjoutParNom />

      {r?.aProlonger.length && ecartee !== cleProposition(r.aProlonger) ? (
        <div role="group" aria-labelledby="proposer-prolongement" className="flex flex-col gap-3 rounded-xl bg-sable p-3">
          <p id="proposer-prolongement" className="text-[13.5px] leading-normal">
            {r.aProlonger.length === 1
              ? `Votre ligne part du terminus du ${minuscule(r.aProlonger[0]!.ligne.nom)}, à ${r.aProlonger[0]!.terminus.nom}. Voulez-vous la prolonger ? Sa première station existe déjà.`
              : `Votre ligne part d’un terminus ${enumerer(r.aProlonger.map((c) => `du ${minuscule(c.ligne.nom)}`))}. Voulez-vous prolonger l’une de ces lignes ? Sa première station existe déjà.`}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {r.aProlonger.map((c) => (
              <Bouton key={c.ligne.id} genre="rouge" taille="petit" onClick={() => rattacher(c.ligne.id, c.terminus.pos)}>
                Prolonger le {minuscule(c.ligne.nom)}
              </Bouton>
            ))}
            <Bouton genre="contour" taille="petit" onClick={() => setEcartee(cleProposition(r.aProlonger))}>
              Garder une ligne à part
            </Bouton>
          </div>
        </div>
      ) : null}

      {arrets > 0 ? (
        <div className="flex flex-col gap-2">
          <Deroulant
            taille="compact"
            icone="liste"
            titre="Votre tracé"
            resume={
              arrets >= 2
                ? `Changez l’ordre de vos ${compte(stations, arrets - stations)}, ou ajoutez-en entre deux.`
                : 'Votre première station est posée : posez la suivante sur la carte.'
            }
            // Toucher une station sur la carte ouvre son nom ici : la liste se déplie pour le montrer.
            ouvert={listeOuverte || brouillon.renomme !== undefined}
            onChange={(v) => {
              setListeOuverte(v)
              if (!v) renommer()
            }}
          >
            <ListeTrace noms={noms} estStation={r?.estStation ?? []} fixe={Boolean(r?.premiereConstruite)} />
          </Deroulant>
          {arrets >= 2 ? (
            <p className="text-[12px] leading-snug text-gris">
              Sur la carte, faites glisser un point pour le déplacer ou touchez la ligne pour en ajouter un. Touchez une station pour la
              renommer ou en faire un point de passage.
            </p>
          ) : null}
          {r ? <PhraseCorrespondances liste={r.liste} /> : null}
        </div>
      ) : null}

      {!pret ? (
        <p className="flex items-start gap-2 rounded-xl bg-encre px-3 py-2.5 text-[13px] leading-snug font-semibold text-white">
          <Icone nom="main" taille={18} className="mt-0.5 shrink-0" />
          {arrets === 0
            ? 'Touchez la carte pour poser la première station. Les zones les plus colorées sont celles où vivent et travaillent le plus de gens ; une station posée sur une station existante s’y accroche.'
            : 'Posez au moins une deuxième station pour voir le prix et les voyageurs.'}
        </p>
      ) : (
        <>
          <Chiffres e={e} arrets={stations} mode={brouillon.mode} />
          <p className="text-[13px] leading-snug font-semibold">
            <span className="text-gris">De </span>
            {nomsStations[0]}
            <span className="text-gris"> à </span>
            {nomsStations.at(-1)}
            {nomsStations.length > 2 ? <span className="text-gris">, par {nomsStations.slice(1, -1).join(', ')}</span> : null}
          </p>
          <div className="flex flex-col gap-1">
            <Surtitre>Le relief sous la ligne</Surtitre>
            <Profil mode={brouillon.mode} arrets={brouillon.arrets} passages={brouillon.passages} />
          </div>
          <div className="flex flex-col gap-0.5">
            <Surtitre>Ce que coûte la ligne</Surtitre>
            <DetailCout
              e={e}
              arrets={stations - (r?.premiereConstruite ? 1 : 0)}
              mode={brouillon.mode}
              prolonge={Boolean(r?.premiereConstruite)}
            />
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

/**
 * Prolonger une ligne : on choisit l'une de vos lignes des mandats précédents ou une ligne du réseau actuel, puis le
 * bout d'où partir. Une ligne existante que vous avez déjà prolongée repart du bout de votre prolongement. Le tracé
 * commence alors sur cette station, qui existe déjà, dans le mode de la ligne.
 */
function Prolonger() {
  const { prolonger, lignes, chantiers, mandat } = useJeu()
  const donnees = useDonnees(useVille().id)
  const [choisie, setChoisie] = useState<string | null>(null)
  const choix = useMemo(
    () => (donnees ? lignesAProlonger(donnees, { lignes, chantiers, mandat }) : []),
    [donnees, lignes, chantiers, mandat],
  )
  if (!choix.length) return null
  const ligne = choix.find((l) => l.id === choisie)
  const vous = choix.filter((l) => !l.existante)
  const existantes = choix.filter((l) => l.existante)
  const pastille = (l: AProlonger) => (
    <button
      key={l.id}
      type="button"
      aria-pressed={choisie === l.id}
      onClick={() => setChoisie(choisie === l.id ? null : l.id)}
      className={clsx(
        'flex min-h-8 items-center gap-1 rounded-full pr-2.5 pl-2 text-[12.5px] font-extrabold transition-colors',
        choisie === l.id ? 'bg-encre text-white' : 'bg-white shadow-[inset_0_0_0_1.5px_var(--color-trait)] hover:bg-sable',
      )}
    >
      <Icone nom={ICONE_MODE[l.mode] ?? 'trace'} taille={14} epaisseur={2.3} className={choisie === l.id ? 'text-white' : 'text-muet'} />
      {l.nom}
    </button>
  )
  return (
    <Deroulant
      taille="compact"
      icone="trace"
      titre="Prolonger une ligne existante"
      resume="Partez du terminus d’une ligne pour la continuer : sa station existe déjà."
    >
      {vous.length ? (
        <div className="flex flex-col gap-1.5">
          <Surtitre>Vos lignes des mandats précédents</Surtitre>
          <div className="flex flex-wrap gap-1">{vous.map(pastille)}</div>
        </div>
      ) : null}
      {existantes.length ? (
        <div className="flex flex-col gap-1.5">
          <Surtitre>Le réseau actuel</Surtitre>
          <div className="flex flex-wrap gap-1">{existantes.map(pastille)}</div>
        </div>
      ) : null}
      {ligne ? (
        <div className="flex flex-col gap-1.5">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {ligne.bouts.map((b) => (
              <Bouton
                key={b.pos.join(',')}
                genre="rouge"
                taille="petit"
                icone="fleche"
                onClick={() => prolonger(b.decide ? undefined : ligne.id, ligne.mode, b.pos)}
              >
                Depuis {b.nom}
              </Bouton>
            ))}
          </div>
          {ligne.existante && ligne.bouts.some((b) => b.decide) ? (
            <p className="text-[12px] leading-snug text-gris">
              Vous avez déjà prolongé cette ligne : elle repart du bout de ce prolongement, dont vous ne repayez pas la station.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-[12px] leading-snug text-gris">Choisissez une ligne, puis le terminus d’où partir.</p>
      )}
    </Deroulant>
  )
}

/** Le résultat d'une ligne terminée, avant de la construire. */
/** La part du budget restant qu'une dépense prendrait, comme dans la fiche d'un projet. */
const partDuBudget = (cout: number, reste: number) =>
  reste === Infinity
    ? 'sans budget à tenir, en jeu libre'
    : reste > 0
      ? `${Math.min(999, Math.round((cout / reste) * 100))} % de ce qui vous reste`
      : 'votre budget est épuisé'

/**
 * Les trois chiffres d'une ligne tracée, présentés comme ceux d'un projet du catalogue : son coût, les voyageurs qu'elle
 * ajoute à votre score (les nouveaux sur le réseau) et son année d'ouverture.
 */
function ChiffresLigne({ e, annee, legendeCout }: { e: Estimation; annee: number; legendeCout: string }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      <CarteChiffre icone="pieces" valeur={n(e.cout)} unite="M€" legende={legendeCout} />
      <CarteChiffre
        icone="voyageurs"
        valeur={e.nouveaux > 0 ? `+${approx(e.nouveaux)}` : '0'}
        legende={`nouveaux voyageurs par jour, sur ${approx(e.voyageurs)} au total`}
        accent
      />
      <CarteChiffre icone="horloge" valeur={String(annee)} legende={`après ${e.duree} ans de chantier`} />
    </div>
  )
}

/** D'où viennent les voyageurs d'une ligne : combien l'emprunteraient, et combien sont nouveaux, les seuls qui comptent. */
function VoyageursLigne({ e, conditionnel = false }: { e: Estimation; conditionnel?: boolean }) {
  const verbe = conditionnel ? 'emprunteraient' : 'empruntent'
  return (
    <p className="rounded-2xl bg-rouge-pale px-4 py-3.5 text-sm leading-normal">
      Environ <b className="chiffres">{approx(e.voyageurs)}</b> voyageurs par jour {verbe} cette ligne, entre {approx(e.bas)} et{' '}
      {approx(e.haut)} selon notre calcul. <b className="chiffres">{approx(e.nouveaux)}</b> d’entre eux {conditionnel ? 'seraient' : 'sont'}{' '}
      nouveaux sur le réseau, les autres {conditionnel ? 'viendraient' : 'viennent'} d’une ligne voisine : seuls les nouveaux comptent dans
      votre score.
    </p>
  )
}

export function MaLigne() {
  const { brouillon, mandat, construireLigne, ouvrir, libre, lignes } = useJeu()
  const ville = useVille()
  const bilan = useBilan()
  const e = useEstimation()
  const r = useReseauDuTrace(brouillon)
  const noms = r?.stationsNommees ?? []
  // Une ligne modifiée garde son nom, son mandat et son paiement ; on la compare à ce qu'elle était.
  const ancienne = brouillon?.edition ? lignes.find((l) => l.id === brouillon.edition) : undefined
  // Tant que le joueur ne l'a pas renommée, la ligne porte le nom de ses terminus, ou celui de la ligne qu'elle prolonge.
  const [nomSaisi, setNom] = useState<string | null>(ancienne?.nom ?? null)
  // Le prolongement d'un prolongement ne reprend pas tel quel le nom du premier : il y ajoute son mandat.
  const sansDoublon = (base: string) => (lignes.some((l) => l.nom === base && l.id !== ancienne?.id) ? `${base}, mandat ${mandat}` : base)
  const nom =
    nomSaisi ??
    (r?.quoi
      ? sansDoublon(`Prolongement ${r.quoi.complement}`)
      : noms.length >= 2
        ? `${noms[0]} - ${noms.at(-1)}`
        : `Ma ligne de ${brouillon ? NOM_MODE[brouillon.mode] : 'tramway'}`)
  if (!brouillon || !e) return null
  const annee = ouverture(mandat, e.duree)
  // La part payée sur ce mandat ; en modification, l'ancienne version libère la sienne.
  const partDuMandat = (cout: number) => (ancienne?.etale && mandat === 1 ? cout / 2 : cout)
  // En jeu libre, il n'y a pas de budget à tenir, ni de paiement en deux fois.
  const reste = libre ? Infinity : bilan.reste + (ancienne ? partDuMandat(ancienne.estimation.cout) : 0)
  const etaler = mandat === 1 && !libre && !ancienne
  const moitie = Math.round(e.cout / 2)

  return (
    <Panneau
      surtitre={
        <Pastille icone="trace">
          {ancienne
            ? 'Modification de votre ligne'
            : r?.quoi
              ? `Prolongement ${r.quoi.complement}`
              : `Votre ligne de ${NOM_MODE[brouillon.mode]}`}
        </Pastille>
      }
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
          <Bouton genre="rouge" icone="valider" onClick={() => construireLigne(nom.trim() || 'Ma ligne', e, false)}>
            {ancienne
              ? partDuMandat(e.cout) <= reste
                ? `Enregistrer pour ${n(e.cout)} M€`
                : `Enregistrer pour ${n(e.cout)} M€, avec un déficit`
              : e.cout <= reste
                ? `Construire pour ${n(e.cout)} M€`
                : `Construire pour ${n(e.cout)} M€, avec un déficit`}
          </Bouton>
          <div className="grid grid-cols-2 gap-2">
            {etaler ? (
              <Bouton
                genre="contour"
                taille="petit"
                title={`${n(moitie)} M€ maintenant, le reste au mandat suivant`}
                onClick={() => construireLigne(nom.trim() || 'Ma ligne', e, true)}
              >
                Payer en deux fois
              </Bouton>
            ) : null}
            <Bouton genre="contour" taille="petit" onClick={() => ouvrir({ type: 'trace' })} className={etaler ? '' : 'col-span-2'}>
              Modifier le tracé
            </Bouton>
          </div>
        </>
      }
    >
      <ChiffresLigne e={e} annee={annee} legendeCout={partDuBudget(e.cout, reste)} />
      <EnBref trace={brouillon} longueur={e.km} />
      {ancienne ? (
        <p className="text-[13.5px] leading-normal text-gris">
          Avant la modification : {n(ancienne.estimation.cout)} M€ et environ {approx(ancienne.estimation.nouveaux)} nouveaux voyageurs par
          jour.
        </p>
      ) : null}
      <div className="flex flex-col gap-0.5">
        <Surtitre>Ce que coûte la ligne</Surtitre>
        <DetailCout
          e={e}
          arrets={noms.length - (r?.premiereConstruite ? 1 : 0)}
          mode={brouillon.mode}
          prolonge={Boolean(r?.premiereConstruite)}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <Surtitre>
          Autour de vos {noms.length} stations, à moins de {distanceBassin(brouillon.mode)}
        </Surtitre>
        <Ligne libelle="Habitants" valeur={approx(e.habitants)} />
        <Ligne libelle="Emplois" valeur={approx(e.emplois)} />
        <Ligne libelle="Habitants sans tram ni métro aujourd’hui" valeur={approx(e.habitantsNonDesservis)} />
      </div>
      <ListeStations noms={noms} titre="Vos stations" />
      {r ? <PhraseCorrespondances liste={r.liste} /> : null}
      <VoyageursLigne e={e} conditionnel />
      <Rendement voyageurs={e.nouveaux} cout={e.cout} ligne />
      <p className="text-[13.5px] leading-normal text-gris">
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
 * le détail de son coût, ses arrêts, et de quoi la supprimer ; décidée à un mandat précédent, de quoi la prolonger.
 */
export function FicheLigne({ id }: { id: string }) {
  const { lignes, chantiers, mandat, retirer, fermer, changerPaiement, libre, modifierLigne, prolonger } = useJeu()
  const ville = useVille()
  const l = lignes.find((x) => x.id === id)
  const r = useReseauDuTrace(l ?? null)
  const noms = r?.stationsNommees ?? []
  const [confirmer, setConfirmer] = useState(false)
  if (!l) return null
  const e = l.estimation
  const annee = ouverture(l.mandat, e.duree)
  // Comme un projet du catalogue, une ligne décidée à un mandat précédent est lancée : on ne la supprime plus.
  const modifiable = l.mandat === mandat
  const moitie = Math.round(e.cout / 2)
  const supprimer = () => {
    retirer(l.id)
    fermer()
  }

  let pied: React.ReactNode
  if (!modifiable) {
    // Ses bouts d'où repartir, à jour des lignes qui l'ont déjà continuée.
    const bouts = r ? boutsDeLigne(l, { lignes, chantiers, mandat }, r.donnees) : []
    pied = (
      <>
        {bouts.length ? (
          <div className={clsx('grid gap-2', bouts.length > 1 && 'sm:grid-cols-2')}>
            {bouts.map((b) => (
              <Bouton
                key={b.pos.join(',')}
                genre={bouts.length > 1 ? 'contour' : 'rouge'}
                taille={bouts.length > 1 ? 'petit' : 'normal'}
                iconeAGauche="trace"
                onClick={() => prolonger(undefined, l.mode, b.pos)}
              >
                Prolonger depuis {b.nom}
              </Bouton>
            ))}
          </div>
        ) : null}
        <p className="text-[13px] leading-normal text-gris">
          {l.mandat === 1 ? 'Décidée pendant le premier mandat' : `Décidée pendant le mandat ${l.mandat}`}, cette ligne ne peut plus être
          supprimée{bouts.length ? ', mais vous pouvez la prolonger sans repayer sa station.' : '.'}
        </p>
      </>
    )
  } else if (confirmer) {
    pied = (
      <div role="group" aria-labelledby="supprimer-ligne" className="flex flex-col gap-3">
        <p id="supprimer-ligne" className="text-[13.5px] leading-normal">
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
      <>
        <Bouton genre="rouge" iconeAGauche="crayon" onClick={() => modifierLigne(l.id)}>
          Modifier le tracé
        </Bouton>
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
      </>
    )
  }

  return (
    <Panneau
      surtitre={<Pastille icone="trace">{r?.quoi ? `Prolongement ${r.quoi.complement}` : `Votre ligne de ${NOM_MODE[l.mode]}`}</Pastille>}
      titre={l.nom}
      pied={pied}
    >
      <ChiffresLigne e={e} annee={annee} legendeCout="investis" />
      <EnBref trace={l} longueur={e.km} />
      {l.etale && !libre ? (
        <p className="text-[13.5px] leading-normal text-gris">
          Payée en deux fois : {n(moitie)} M€ sur le premier mandat, {n(e.cout - moitie)} M€ sur le second.
        </p>
      ) : null}
      <VoyageursLigne e={e} />
      <Rendement voyageurs={e.nouveaux} cout={e.cout} ligne />
      <div className="flex flex-col gap-1">
        <Surtitre>Le relief sous la ligne</Surtitre>
        <Profil mode={l.mode} arrets={l.arrets} passages={l.passages} />
      </div>
      <div className="flex flex-col gap-0.5">
        <Surtitre>Ce que coûte la ligne</Surtitre>
        <DetailCout e={e} arrets={noms.length - (r?.premiereConstruite ? 1 : 0)} mode={l.mode} prolonge={Boolean(r?.premiereConstruite)} />
      </div>
      <div className="flex flex-col gap-0.5">
        <Surtitre>
          Autour de ses {noms.length} stations, à moins de {distanceBassin(l.mode)}
        </Surtitre>
        <Ligne libelle="Habitants" valeur={approx(e.habitants)} />
        <Ligne libelle="Emplois" valeur={approx(e.emplois)} />
        <Ligne libelle="Habitants sans tram ni métro aujourd’hui" valeur={approx(e.habitantsNonDesservis)} />
      </div>
      <ListeStations noms={noms} titre="Ses stations" />
      {r ? <PhraseCorrespondances liste={r.liste} /> : null}
    </Panneau>
  )
}
