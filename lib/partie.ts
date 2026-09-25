import { PROJETS } from './catalogue'
import { leviersPossibles } from './leviers'
import { estimer, prolongementPossible, type Carreaux } from './modele'
import { LEVIERS_NEUTRES } from './regles'
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
  chantiers: Chantier[]
  lignes: LigneJoueur[]
  leviers: Record<1 | 2, Leviers>
}

export const VERSION_PARTIE = 1

/** Au-delà, un tracé ne vient pas du jeu : même avec des points de passage, une ligne en compte bien moins. */
export const POINTS_MAX = 150

/** La forme compacte : choix du joueur seulement, sans aucun chiffre calculé. */
export interface PartieCompacte {
  v: number
  /** La ville, absente pour Lyon : les liens et les réseaux publiés avant l'ouverture de Toulouse restent lisibles. */
  w?: IdVille
  /** 1 pour une partie en jeu libre, absent sinon. */
  x?: 1
  c: [string, number, number, string, number][]
  /** Les lignes : nom, mode, mandat, paiement étalé, points, et au besoin les rangs des points de passage et la ligne prolongée. */
  l: { n: string; m: string; d: number; e: number; a: [number, number][]; p?: number[]; o?: string }[]
  f: Record<1 | 2, Leviers>
}

export function compacter(p: PartiePartagee): PartieCompacte {
  return {
    v: VERSION_PARTIE,
    ...(p.ville === 'lyon' ? {} : { w: p.ville }),
    ...(p.libre ? { x: 1 as const } : {}),
    c: p.chantiers.map((c) => [c.id, c.mandat, c.etale ? 1 : 0, c.varianteId ?? '', c.option ? 1 : 0]),
    l: p.lignes.map((l) => ({
      n: l.nom,
      m: l.mode,
      d: l.mandat,
      e: l.etale ? 1 : 0,
      a: l.arrets.map(([lon, lat]) => [Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5] as [number, number]),
      ...(l.passages?.length ? { p: l.passages } : {}),
      ...(l.prolonge ? { o: l.prolonge } : {}),
    })),
    f: p.leviers,
  }
}

const MODES: readonly ModeLigne[] = ['tram', 'bus', 'metro', 'cable']
const estPoint = (p: unknown): p is [number, number] =>
  Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'number' && Number.isFinite(x))

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

  const vus = new Set<string>()
  const chantiers: Chantier[] = []
  for (const entree of catalogue ? b.c : []) {
    if (!Array.isArray(entree)) continue
    const [id, mandat, etale, varianteId, option] = entree
    const projet = typeof id === 'string' ? PROJETS.get(id) : undefined
    if (!projet || vus.has(projet.id)) continue
    vus.add(projet.id)
    chantiers.push({
      id: projet.id,
      mandat: mandat === 2 && !libre ? 2 : 1,
      // Seul un projet décidé au premier mandat peut être payé en deux fois.
      etale: etale === 1 && mandat !== 2 && !libre,
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
    lignes.push({
      id: `partage-${i}`,
      nom: String(l.n ?? '').slice(0, 60) || `Ligne ${i + 1}`,
      mode,
      ...(passages.length ? { passages } : {}),
      ...(prolonge ? { prolonge } : {}),
      mandat: l.d === 2 && !libre ? 2 : 1,
      etale: l.e === 1 && l.d !== 2 && !libre,
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
  const f = (b.f ?? {}) as Partial<Record<1 | 2, Partial<Leviers>>>
  const parametres = VILLES[ville].budget.leviers
  const leviers =
    parametres && !libre
      ? { 1: leviersPossibles(lire(f[1]), parametres), 2: leviersPossibles(lire(f[2]), parametres) }
      : { 1: LEVIERS_NEUTRES, 2: LEVIERS_NEUTRES }
  return { ville, libre, chantiers: chantiersValides, lignes, leviers }
}
