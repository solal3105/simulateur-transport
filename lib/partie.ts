import { MANDATS_DE_BASE, MANDATS_MAX, PROJETS, projetDe } from './catalogue'
import { leviersPossibles } from './leviers'
import { estimer, prolongementPossible, type Carreaux } from './modele'
import { LEVIERS_NEUTRES, leviersDu } from './regles'
import type { Chantier, Leviers, LigneJoueur, ModeLigne } from './types'
import { estVille, VILLES, type IdVille } from './villes'

/**
 * Une partie telle qu'elle voyage : dans un lien de partage, ou dans un réseau publié. Ce module
 * ne dépend d'aucun navigateur, pour que le site et la fonction serveur de la communauté appliquent
 * exactement les mêmes vérifications.
 */
export interface PartiePartagee {
  ville: IdVille
  /** Jeu libre : sans budget à tenir ni mandats, et signalé comme tel partout où le réseau se montre. */
  libre: boolean
  /** Le nombre de mandats joués : deux dans la partie de base et en jeu libre, davantage quand on l'a continuée. */
  mandats: number
  chantiers: Chantier[]
  lignes: LigneJoueur[]
  /** Les leviers de chaque mandat joué. */
  leviers: Record<number, Leviers>
}

export const VERSION_PARTIE = 1

/** Au-delà, un tracé ne vient pas du jeu : même avec des points de passage, une ligne en compte bien moins. */
export const POINTS_MAX = 150

/** La longueur d'un nom de station choisi par le joueur : « Hôpital Édouard Herriot » en compte 23. */
export const NOM_ARRET_MAX = 40

/** Un nom de station tel qu'on le garde : sans espaces en trop, coupé à la longueur permise ; vide, il rend le nom proposé. */
export const nomArret = (texte: string) => texte.trim().replace(/\s+/g, ' ').slice(0, NOM_ARRET_MAX).trim()

/** La forme compacte : choix du joueur seulement, sans aucun chiffre calculé. */
export interface PartieCompacte {
  v: number
  /** La ville, absente pour Lyon : les liens et les réseaux publiés avant l'ouverture de Toulouse restent lisibles. */
  w?: IdVille
  /** 1 pour une partie en jeu libre, absent sinon. */
  x?: 1
  /** Le nombre de mandats joués, absent pour la partie de base en deux mandats. */
  k?: number
  c: [string, number, number, string, number][]
  /**
   * Les lignes : nom, mode, mandat, paiement étalé, points, et au besoin les rangs des points de passage, la ligne prolongée
   * et les stations renommées par le joueur, chacune avec son rang.
   */
  l: { n: string; m: string; d: number; e: number; a: [number, number][]; p?: number[]; o?: string; s?: [number, string][] }[]
  f: Record<number, Leviers>
}

/** Les stations renommées d'une ligne, avec leur rang : un point de passage n'a pas de nom à garder. */
const nomsChoisis = (l: LigneJoueur) =>
  (l.noms ?? []).flatMap((nom, k) => (nom && k < l.arrets.length && !l.passages?.includes(k) ? [[k, nom] as [number, string]] : []))

export function compacter(p: PartiePartagee): PartieCompacte {
  return {
    v: VERSION_PARTIE,
    ...(p.ville === 'lyon' ? {} : { w: p.ville }),
    ...(p.libre ? { x: 1 as const } : {}),
    ...(p.mandats > MANDATS_DE_BASE ? { k: p.mandats } : {}),
    c: p.chantiers.map((c) => [c.id, c.mandat, c.etale ? 1 : 0, c.varianteId ?? '', c.option ? 1 : 0]),
    l: p.lignes.map((l) => ({
      n: l.nom,
      m: l.mode,
      d: l.mandat,
      e: l.etale ? 1 : 0,
      a: l.arrets.map(([lon, lat]) => [Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5] as [number, number]),
      ...(l.passages?.length ? { p: l.passages } : {}),
      ...(l.prolonge ? { o: l.prolonge } : {}),
      ...(nomsChoisis(l).length ? { s: nomsChoisis(l) } : {}),
    })),
    f: Object.fromEntries(Array.from({ length: Math.max(MANDATS_DE_BASE, p.mandats) }, (_, i) => [i + 1, leviersDu(p.leviers, i + 1)])),
  }
}

const MODES: readonly ModeLigne[] = ['tram', 'bus', 'metro', 'cable']
const estPoint = (p: unknown): p is [number, number] =>
  Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'number' && Number.isFinite(x))

/** Les noms de stations choisis par le joueur, rang par rang : jamais sur un point de passage ni hors du tracé. */
function lireNoms(brut: unknown, nombre: number, passages: number[]) {
  if (!Array.isArray(brut)) return undefined
  const noms: (string | null)[] = Array.from({ length: nombre }, () => null)
  for (const entree of brut) {
    if (!Array.isArray(entree)) continue
    const [k, nom] = entree
    if (!Number.isInteger(k) || k < 0 || k >= nombre || passages.includes(k) || typeof nom !== 'string') continue
    noms[k] = nomArret(nom) || null
  }
  return noms.some(Boolean) ? noms : undefined
}

/** Le nombre de mandats d'une partie compacte : deux dans la partie de base et en jeu libre, jusqu'à cent quand on l'a continuée. */
export function mandatsDe(brut: unknown) {
  if (!brut || typeof brut !== 'object') return MANDATS_DE_BASE
  const { k, x } = brut as Partial<PartieCompacte>
  return x !== 1 && typeof k === 'number' && Number.isInteger(k) && k > MANDATS_DE_BASE && k <= MANDATS_MAX ? k : MANDATS_DE_BASE
}

/** La ville d'une partie compacte, avant même de la vérifier : il faut charger ses données pour la relire. */
export function villeDePartie(brut: unknown): IdVille | null {
  if (!brut || typeof brut !== 'object') return null
  const w = (brut as Partial<PartieCompacte>).w
  if (w === undefined) return 'lyon'
  return estVille(w) ? w : null
}

/**
 * Vérifie une partie compacte et recalcule tout ce qui en découle. Les estimations des lignes ne
 * voyagent jamais : elles sont recalculées ici, pour qu'une partie modifiée à la main ne puisse pas
 * afficher un faux score. Renvoie null si la partie n'est pas lisible.
 */
export function normaliserPartie(brut: unknown, carreaux: Carreaux): PartiePartagee | null {
  if (!brut || typeof brut !== 'object') return null
  const b = brut as Partial<PartieCompacte>
  if (b.v !== VERSION_PARTIE || !Array.isArray(b.c) || !Array.isArray(b.l)) return null
  // Les lignes se recalculent avec les habitants et les emplois de leur ville, jamais d'une autre.
  const ville = villeDePartie(brut)
  if (!ville || ville !== carreaux.ville) return null
  // Une ville sans catalogue n'a que des lignes tracées.
  const catalogue = VILLES[ville].catalogue
  // Le jeu libre n'a qu'une étape : tout y est décidé d'un coup, payé en une fois, sans leviers.
  const libre = b.x === 1
  const mandats = mandatsDe(brut)
  // Un mandat hors de la partie ramène la décision au premier, comme en jeu libre.
  const mandatDe = (m: unknown) => (!libre && typeof m === 'number' && Number.isInteger(m) && m >= 1 && m <= mandats ? m : 1)

  const vus = new Set<string>()
  const chantiers: Chantier[] = []
  for (const entree of catalogue ? b.c : []) {
    if (!Array.isArray(entree)) continue
    const [id, mandat, etale, varianteId, option] = entree
    // Seuls les projets du catalogue de la ville : une partie de Toulouse ne peut pas décider d'un projet lyonnais.
    const projet = projetDe(ville, id)
    if (!projet || vus.has(projet.id)) continue
    vus.add(projet.id)
    chantiers.push({
      id: projet.id,
      mandat: mandatDe(mandat),
      // Seul un projet décidé au premier mandat peut être payé en deux fois.
      etale: etale === 1 && mandatDe(mandat) === 1 && !libre,
      varianteId: projet.variantes?.some((v) => v.id === varianteId) ? (varianteId as string) : undefined,
      option: option === 1 && Boolean(projet.option),
    })
  }
  // Un projet qui dépend d'un autre ne tient pas sans lui.
  const decides = new Set(chantiers.map((c) => c.id))
  const chantiersValides = chantiers.filter((c) => {
    const requis = PROJETS.get(c.id)?.requiert
    return !requis || decides.has(requis)
  })

  const lignes: LigneJoueur[] = []
  b.l.forEach((l, i) => {
    if (!l || typeof l !== 'object') return
    const mode = MODES.find((m) => m === l.m)
    if (!mode || !Array.isArray(l.a) || l.a.length < 2 || l.a.length > POINTS_MAX || !l.a.every(estPoint)) return
    // Les points de passage : des rangs entiers, jamais un terminus, sans doublon.
    const passages = Array.isArray(l.p)
      ? [...new Set(l.p.filter((k): k is number => Number.isInteger(k) && k > 0 && k < l.a.length - 1))].sort((x, y) => x - y)
      : []
    // Un prolongement doit partir d'une station existante du même mode ; sinon, c'est une ligne à part entière.
    const prolonge =
      typeof l.o === 'string' && /^(metro|tram)-[\p{L}\p{N} .'-]{1,24}$/u.test(l.o) && prolongementPossible(mode, l.a[0], carreaux)
        ? l.o
        : undefined
    const estimation = estimer(mode, l.a, carreaux, { passages, prolonge: Boolean(prolonge) })
    const noms = lireNoms(l.s, l.a.length, passages)
    lignes.push({
      id: `partage-${i}`,
      nom: String(l.n ?? '').slice(0, 60) || `Ligne ${i + 1}`,
      mode,
      ...(passages.length ? { passages } : {}),
      ...(prolonge ? { prolonge } : {}),
      ...(noms ? { noms } : {}),
      mandat: mandatDe(l.d),
      etale: l.e === 1 && mandatDe(l.d) === 1 && !libre,
      arrets: l.a,
      estimation: { ...estimation, nouveaux: Math.round(estimation.nouveaux / 100) * 100 },
    })
  })

  // Les leviers sont bornés aux valeurs que le jeu permet.
  const borne = (v: unknown, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)))
  const lire = (l: Partial<Leviers> | undefined): Leviers => ({
    ...LEVIERS_NEUTRES,
    abonnements: borne(l?.abonnements, -20, 30),
    tickets: borne(l?.tickets, -20, 30),
    versementMobilite: borne(l?.versementMobilite, 0, 5),
    gratuiteTotale: l?.gratuiteTotale === true,
    gratuiteMoins25: l?.gratuiteMoins25 === true,
    gratuiteJeunesAbonnes: l?.gratuiteJeunesAbonnes === true,
    suppressionTarifSocial: l?.suppressionTarifSocial === true,
    metroNuit: l?.metroNuit === true,
    tva: l?.tva === true,
  })
  const f = (b.f ?? {}) as Partial<Record<number, Partial<Leviers>>>
  const parametres = VILLES[ville].budget.leviers
  const leviers: Record<number, Leviers> = {}
  for (let m = 1; m <= mandats; m += 1) leviers[m] = parametres && !libre ? leviersPossibles(lire(f[m]), parametres) : LEVIERS_NEUTRES
  return { ville, libre, mandats, chantiers: chantiersValides, lignes, leviers }
}
