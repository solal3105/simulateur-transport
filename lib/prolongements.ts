import type { Donnees } from './donnees'
import { distance, ECART_SUITE, projetContinue, prolongementPossible, stationsDuTrace, suiteDe } from './modele'
import { ECART_PROLONGEMENT, nommerTrace, prolongeable, terminusDe, terminusProche, type LigneExistante } from './reseau'
import { BOUTS_PROJETS } from './terminus'
import type { Chantier, LigneJoueur, Mandat, ModeLigne } from './types'

/**
 * D'où le joueur peut prolonger une ligne : le terminus d'une ligne du réseau actuel, ou le bout de ce qu'il a déjà
 * décidé aux mandats précédents, ses propres lignes comme les prolongements du catalogue. Quand une ligne existante a
 * déjà été prolongée, le terminus à proposer n'est plus celui du réseau actuel mais le bout du prolongement : au second
 * mandat, le tram T10 prolongé jusqu'à la gare de Clamart repart de Gare de Clamart, et plus de Jardin Parisien.
 */

/** Un bout de ligne d'où partir. */
export interface Bout {
  pos: [number, number]
  nom: string
  /** Le mandat du prolongement, de vous ou du catalogue, qui finit ici : partir de ce bout le continue. */
  decide?: Mandat
}

/** Une ligne qu'on peut prolonger, avec ses bouts. */
export interface AProlonger {
  id: string
  nom: string
  mode: ModeLigne
  bouts: Bout[]
  /** La ligne existante, absente pour une ligne du joueur. */
  existante?: LigneExistante & { mode: ModeLigne }
}

/** Ce qu'une ligne en cours de tracé continue en fin de compte, en remontant la chaîne de ce qui a été décidé avant. */
export interface Origine {
  /** La ligne existante dont un prolongement ouvre la chaîne. */
  existante?: LigneExistante
  /** Sinon, la première de vos lignes de la chaîne. */
  premiere?: LigneJoueur
  /** Le mandat où a été décidé ce que le tracé continue directement : l'une de vos lignes, ou un projet du catalogue. */
  mandat: Mandat
}

type Contexte = Pick<Donnees, 'carreaux' | 'lieux' | 'stations' | 'reseau'>
/** Ce que le joueur a décidé, et le mandat en cours : seul ce qui a été décidé avant se continue. */
export type Decide = { lignes: readonly LigneJoueur[]; chantiers: readonly Pick<Chantier, 'id' | 'mandat'>[]; mandat: Mandat }

const ORDRE_MODES: ModeLigne[] = ['metro', 'tram', 'bus', 'cable']

/** Le nom qu'a la station d'un bout de l'une de vos lignes, le premier (0) ou le dernier (-1). */
function nomDuBout(l: LigneJoueur, rang: 0 | -1, d: Contexte) {
  const noms = nommerTrace(l.arrets, stationsDuTrace(l.arrets.length, l.passages), d.lieux, d.stations, d.carreaux.mx, l.noms)
  return (rang === 0 ? noms[0] : noms.at(-1)) ?? l.nom
}

/**
 * Suit, depuis un bout, vos lignes des mandats précédents qui le continuent l'une après l'autre, et rend le dernier bout
 * atteint : une suite part du bout de la précédente et finit plus loin. Au bout d'un projet du catalogue, la suite peut
 * partir un peu plus loin (`ecart`), comme le calcul l'accepte (`projetContinue`).
 */
function suivre(depart: Bout, mode: ModeLigne, x: Decide, d: Contexte, vues: Set<string>, ecart = ECART_SUITE): Bout {
  const metres = distance(d.carreaux.mx)
  let bout = depart
  for (let premier = true; ; premier = false) {
    const suite = x.lignes.find(
      (l) =>
        l.mandat < x.mandat &&
        !vues.has(l.id) &&
        l.mode === mode &&
        !l.prolonge &&
        l.arrets[0] &&
        metres(l.arrets[0], bout.pos) <= (premier ? ecart : ECART_SUITE),
    )
    if (!suite) return bout
    vues.add(suite.id)
    bout = { pos: suite.arrets.at(-1)!, nom: nomDuBout(suite, -1, d), decide: suite.mandat }
  }
}

/**
 * Les bouts d'une ligne existante : ses terminus d'où un prolongement est possible, chacun remplacé par le bout du
 * prolongement décidé à un mandat précédent de ce côté, projet du catalogue ou ligne tracée.
 */
function boutsExistante(ligne: LigneExistante & { mode: ModeLigne }, x: Decide, d: Contexte): Bout[] {
  const metres = distance(d.carreaux.mx)
  return terminusDe(ligne)
    .filter((t) => prolongementPossible(ligne.mode, t.pos, d.carreaux))
    .flatMap((t) => {
      const projet = x.chantiers.find((c) => {
        const p = BOUTS_PROJETS[c.id]
        return c.mandat < x.mandat && p?.ligne === ligne.id && metres(p.depuis, t.pos) <= ECART_PROLONGEMENT
      })
      if (projet)
        return BOUTS_PROJETS[projet.id]!.bouts.map((b) =>
          suivre({ ...b, decide: projet.mandat }, ligne.mode, x, d, new Set(), ECART_PROLONGEMENT),
        )
      const trace = x.lignes.find(
        (l) => l.mandat < x.mandat && l.prolonge === ligne.id && l.arrets[0] && metres(l.arrets[0], t.pos) <= ECART_PROLONGEMENT,
      )
      if (trace)
        return [
          suivre({ pos: trace.arrets.at(-1)!, nom: nomDuBout(trace, -1, d), decide: trace.mandat }, ligne.mode, x, d, new Set([trace.id])),
        ]
      return [{ pos: t.pos, nom: t.nom }]
    })
}

/** Une de vos lignes qui ne prolonge ni ne continue rien : elle a deux bouts d'où repartir. */
const partDeRien = (l: LigneJoueur, x: Decide, mx: number) =>
  !l.prolonge && !suiteDe(l, x.lignes, mx) && !projetContinue(l, x.chantiers, mx)

/**
 * Les bouts d'une de vos lignes d'un mandat précédent : ses deux terminus quand elle part de rien, le dernier seulement
 * quand elle prolonge ou continue quelque chose, dont le premier est la station commune. Chacun suit les lignes qui l'ont
 * déjà continuée.
 */
export function boutsDeLigne(l: LigneJoueur, x: Decide, d: Contexte): Bout[] {
  const bouts: Bout[] = [{ pos: l.arrets.at(-1)!, nom: nomDuBout(l, -1, d), decide: l.mandat }]
  if (partDeRien(l, x, d.carreaux.mx)) bouts.unshift({ pos: l.arrets[0]!, nom: nomDuBout(l, 0, d), decide: l.mandat })
  return bouts.map((b) => suivre(b, l.mode, x, d, new Set([l.id])))
}

/**
 * Tout ce qui se prolonge : d'abord vos lignes des mandats précédents qui partent de rien, puis les lignes du réseau
 * actuel, du métro au téléphérique, avec leurs bouts à jour de ce qui les a déjà prolongées.
 */
export function lignesAProlonger(d: Contexte, x: Decide): AProlonger[] {
  const vous = x.lignes
    .filter((l) => l.mandat < x.mandat && partDeRien(l, x, d.carreaux.mx))
    .map((l) => ({ id: l.id, nom: l.nom, mode: l.mode, bouts: boutsDeLigne(l, x, d) }))
  const existantes = (d.reseau?.lignes ?? [])
    .filter(prolongeable)
    .sort((a, b) => ORDRE_MODES.indexOf(a.mode) - ORDRE_MODES.indexOf(b.mode))
    .map((l) => ({ id: l.id, nom: l.nom, mode: l.mode, existante: l, bouts: boutsExistante(l, x, d) }))
    .filter((l) => l.bouts.length > 0)
  return [...vous, ...existantes]
}

/**
 * Ce qu'un tracé continue en fin de compte : en remontant vos lignes qu'il continue, la ligne existante dont un
 * prolongement (le vôtre ou celui du catalogue) ouvre la chaîne, ou la première de vos lignes. Rien s'il ne continue rien.
 */
export function origineDe(
  trace: { mode: ModeLigne; arrets: [number, number][]; mandat: Mandat },
  x: Omit<Decide, 'mandat'>,
  d: Pick<Contexte, 'carreaux' | 'reseau'>,
): Origine | undefined {
  const mx = d.carreaux.mx
  const existante = (id: string) => d.reseau?.lignes.find((l) => l.id === id)
  const vues = new Set<string>()
  let courant: { mode: ModeLigne; arrets: [number, number][]; mandat: Mandat } = trace
  let premiere: LigneJoueur | undefined
  let mandat: Mandat | undefined
  for (;;) {
    const avant = suiteDe(courant, x.lignes, mx)
    if (avant && !vues.has(avant.id)) {
      vues.add(avant.id)
      mandat ??= avant.mandat
      if (avant.prolonge) return { existante: existante(avant.prolonge), mandat }
      premiere = avant
      courant = avant
      continue
    }
    const projet = projetContinue(courant, x.chantiers, mx)
    if (projet) return { existante: existante(projet.ligne), mandat: mandat ?? projet.mandat }
    return premiere && mandat !== undefined ? { premiere, mandat } : undefined
  }
}

/**
 * Le nom de la première station d'un tracé qui prolonge ou continue quelque chose, que le panneau et la carte lui
 * donnent tant que le joueur ne l'a pas renommée : le terminus de la ligne prolongée, le bout de votre ligne continuée,
 * ou la dernière station du prolongement du catalogue. Rien pour une ligne qui part de rien.
 */
export function nomDuDepart(
  trace: { mode: ModeLigne; arrets: [number, number][]; mandat: Mandat; prolonge?: string },
  x: Omit<Decide, 'mandat'>,
  d: Contexte,
): string | undefined {
  const depart = trace.arrets[0]
  if (!depart) return undefined
  const mx = d.carreaux.mx
  const metres = distance(mx)
  if (trace.prolonge) {
    const prolongee = d.reseau?.lignes.find((l) => l.id === trace.prolonge)
    return prolongee ? terminusProche(prolongee, depart, mx)?.nom : undefined
  }
  const suite = suiteDe(trace, x.lignes, mx)
  if (suite) return nomDuBout(suite, metres(suite.arrets[0]!, depart) <= metres(suite.arrets.at(-1)!, depart) ? 0 : -1, d)
  const projet = projetContinue(trace, x.chantiers, mx)
  if (!projet) return undefined
  return [...(BOUTS_PROJETS[projet.id]?.bouts ?? [])].sort((a, b) => metres(a.pos, depart) - metres(b.pos, depart))[0]?.nom
}
