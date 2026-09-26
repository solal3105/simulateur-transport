'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { finMandat, PROJETS } from './catalogue'
import { approx, n } from './format'
import { mesurer } from './mesure'
import { estimer, type Carreaux } from './modele'
import type { PartiePartagee } from './lien'
import { nomArret } from './partie'
import { bilanMandat, LEVIERS_NEUTRES, leviersDu } from './regles'
import type { Chantier, Estimation, Leviers, LigneJoueur, Mandat, ModeLigne } from './types'
import { estVille, VILLES, type IdVille } from './villes'

export type Ecran = 'accueil' | 'tuto' | 'jeu' | 'fin-mandat' | 'bilan'

export type Panneau =
  | { type: 'projet'; id: string }
  | { type: 'liste' }
  | { type: 'leviers' }
  | { type: 'trace' }
  | { type: 'ligne' }
  /** Une ligne déjà construite par le joueur, ouverte depuis la carte ou le programme. */
  | { type: 'ligne-joueur'; id: string }
  | { type: 'methode' }
  | { type: 'budget' }
  | { type: 'menu' }

export interface Brouillon {
  mode: ModeLigne
  arrets: [number, number][]
  /** Les rangs des points de passage : la ligne y passe sans s'arrêter. */
  passages?: number[]
  /** Ce que pose le prochain clic sur la carte : une station, ou un point de passage. */
  outil?: 'station' | 'passage'
  /** La ligne existante prolongée depuis son terminus, qui est alors le premier point du tracé. */
  prolonge?: string
  /** La ligne construite qu'on est en train de modifier, s'il ne s'agit pas d'une nouvelle ligne. */
  edition?: string
  /** Les noms choisis par le joueur, rang par rang comme `arrets` ; null garde le nom que nous proposons. */
  noms?: (string | null)[]
  /** Le rang de la station dont on change le nom, touchée sur la carte ou dans la liste. */
  renomme?: number
}

/** Les points de passage à garder : jamais un terminus, qui reste toujours une station. */
const nettoyer = (passages: number[] = [], nombre: number) => {
  const gardes = passages.filter((k) => k > 0 && k < nombre - 1)
  return gardes.length ? gardes : undefined
}

/** Les rangs des points de passage après avoir retiré le point i. */
const sansPoint = (passages: number[] = [], i: number) => passages.filter((k) => k !== i).map((k) => (k > i ? k - 1 : k))
/** Les rangs des points de passage après avoir inséré un point au rang i, qui est un passage ou non. */
const avecPoint = (passages: number[] = [], i: number, passage: boolean) => [
  ...passages.map((k) => (k >= i ? k + 1 : k)),
  ...(passage ? [i] : []),
]

/** Les noms choisis après avoir retiré le point i, ou inséré au rang i un point qui n'a pas encore de nom. */
const nomsSans = (noms: Brouillon['noms'], i: number) => noms?.filter((_, k) => k !== i)
const nomsAvec = (noms: Brouillon['noms'], i: number) => noms && [...noms.slice(0, i), null, ...noms.slice(i)]

/** Les noms que garde la ligne construite : ceux de ses stations, et rien du tout si aucune n'est renommée. */
function nomsGardes(b: Brouillon) {
  const passages = nettoyer(b.passages, b.arrets.length) ?? []
  const noms = b.arrets.map((_, k) => (passages.includes(k) ? null : (b.noms?.[k] ?? null)))
  return noms.some(Boolean) ? noms : undefined
}

/** Les choix des mandats suivants d'un réseau repris, qui s'ajoutent chacun quand son mandat commence. */
export interface AVenir {
  chantiers: Chantier[]
  lignes: LigneJoueur[]
}

/** Le réseau publié dont la partie est partie, cité quand on publie la sienne. */
export interface Inspiration {
  id: string
  titre: string
  pseudo: string
}

interface Etat {
  /** La ville de la partie ; à l'accueil, celle qui est proposée. */
  ville: IdVille
  /** Jeu libre : pas de budget à tenir, une seule étape de 2026 à 2038, et un réseau signalé comme tel. */
  libre: boolean
  ecran: Ecran
  tuto: number
  mandat: Mandat
  chantiers: Chantier[]
  lignes: LigneJoueur[]
  leviers: Record<Mandat, Leviers>
  aVenir: AVenir | null
  inspire: Inspiration | null
  /** Identifiant du réseau publié depuis ce bilan, pour ne pas le publier deux fois. */
  publie: string | null
  panneau: Panneau | null
  brouillon: Brouillon | null
  message: { titre: string; texte: string } | null
  /** Coût du projet en cours d'examen, affiché en aperçu sur la jauge. */
  apercu: number
  /** L'accueil est affiché par-dessus la partie enregistrée, qui reste intacte jusqu'à une nouvelle partie. */
  pause: boolean

  /**
   * Commence une partie : le tutoriel à Lyon, le traceur ouvert là où il n'y a pas de catalogue. Le jeu
   * libre saute le tutoriel, qui explique surtout le budget.
   */
  commencer: (ville: IdVille, libre?: boolean) => void
  etapeTuto: (n: number) => void
  finirTuto: () => void
  ouvrir: (p: Panneau) => void
  fermer: () => void
  construire: (c: Omit<Chantier, 'mandat'>, message?: Etat['message']) => void
  retirer: (id: string) => void
  /** Paie un projet déjà décidé en une ou deux fois, sans avoir à l'annuler. */
  changerPaiement: (id: string, etale: boolean) => void
  levier: <K extends keyof Leviers>(cle: K, valeur: Leviers[K]) => void
  finirMandat: () => void
  /**
   * Commence le mandat suivant, avec les leviers du précédent : après le premier, c'est le second mandat de la partie
   * de base ; depuis le bilan, c'est continuer la partie au-delà.
   */
  mandatSuivant: () => void
  /** Remplace la partie par un réseau reçu : ses choix du premier mandat tout de suite, ceux du second plus tard. */
  reprendre: (p: PartiePartagee, inspire?: Inspiration) => void
  marquerPublie: (id: string) => void
  /** Montre l'accueil sans rien effacer : la partie, finie ou non, attend qu'on la reprenne ou qu'on en commence une autre. */
  allerAccueil: () => void
  quitterAccueil: () => void
  tracer: (mode?: ModeLigne) => void
  changerMode: (mode: ModeLigne) => void
  /** Ajoute un point au bout du tracé ; un arrêt choisi par son nom est une station, même avec l'outil des points de passage. */
  ajouterArret: (p: [number, number], options?: { station?: boolean }) => void
  retirerArret: () => void
  /** Retire un arrêt précis du tracé, où qu'il soit. */
  enleverArret: (i: number) => void
  /** Déplace un arrêt du tracé, quand on le fait glisser sur la carte. */
  deplacerArret: (i: number, p: [number, number]) => void
  /** Insère un arrêt à la position i, quand on touche la ligne entre deux arrêts. */
  insererArret: (i: number, p: [number, number]) => void
  /** Rouvre le traceur sur une ligne déjà construite, pour changer son tracé ou son mode. */
  modifierLigne: (id: string) => void
  /** Fait d'un point une station, ou d'une station un point de passage. Les terminus restent des stations. */
  basculerPassage: (i: number) => void
  /** Ouvre le champ du nom d'une station du tracé, ou le referme sans rien changer. */
  renommer: (i?: number) => void
  /** Donne son nom à une station du tracé et referme le champ ; un nom vide lui rend celui que nous proposons. */
  nommerArret: (i: number, nom: string) => void
  /** Choisit ce que pose le prochain clic : une station ou un point de passage. */
  choisirOutil: (outil: 'station' | 'passage') => void
  /** Commence le prolongement d'une ligne existante depuis l'un de ses terminus. */
  prolonger: (ligne: string, mode: ModeLigne, terminus: [number, number]) => void
  /** Fait du prolongement en cours une ligne à part entière, qui ne prolonge plus rien. */
  detacher: () => void
  /** Fait du tracé en cours, qui part déjà du terminus d'une ligne, le prolongement de cette ligne. */
  /** Fait d'un tracé le prolongement d'une ligne existante ; son premier point se pose alors sur le terminus. */
  rattacher: (ligne: string, terminus?: [number, number]) => void
  abandonnerTrace: () => void
  construireLigne: (nom: string, estimation: Estimation, etale: boolean) => void
  /** Recalcule le coût et les voyageurs des lignes tracées avec le modèle actuel, quand il a changé. */
  actualiserLignes: (carreaux: Carreaux) => void
  effacerMessage: () => void
  setApercu: (v: number) => void
}

const DEPART = {
  ville: 'lyon' as IdVille,
  libre: false,
  ecran: 'accueil' as Ecran,
  tuto: 0,
  mandat: 1 as Mandat,
  chantiers: [] as Chantier[],
  lignes: [] as LigneJoueur[],
  leviers: { 1: LEVIERS_NEUTRES, 2: LEVIERS_NEUTRES },
  aVenir: null as AVenir | null,
  inspire: null as Inspiration | null,
  publie: null as string | null,
  panneau: null,
  brouillon: null,
  message: null,
  apercu: 0,
  pause: false,
}

export const useJeu = create<Etat>()(
  persist(
    (set, get) => ({
      ...DEPART,
      commencer: (ville, libre = false) => {
        mesurer('partie commencée', { reseau: ville, libre })
        set(
          VILLES[ville].catalogue
            ? { ...DEPART, ville, libre, ecran: libre ? 'jeu' : 'tuto', tuto: 0 }
            : { ...DEPART, ville, libre, ecran: 'jeu', brouillon: { mode: 'tram', arrets: [] }, panneau: { type: 'trace' } },
        )
      },
      etapeTuto: (tuto) => set({ tuto }),
      finirTuto: () => set({ ecran: 'jeu', panneau: null }),
      // Le tutoriel avance avec les gestes du joueur : ouvrir un projet, puis le lancer.
      ouvrir: (panneau) =>
        set((s) => ({ panneau, apercu: 0, tuto: s.ecran === 'tuto' && s.tuto === 0 && panneau.type === 'projet' ? 1 : s.tuto })),
      fermer: () => set((s) => ({ panneau: null, apercu: 0, tuto: s.ecran === 'tuto' && s.tuto === 1 ? 0 : s.tuto })),
      construire: (c, message = null) => {
        mesurer('projet décidé', { projet: c.id })
        set((s) => ({
          chantiers: [...s.chantiers.filter((x) => x.id !== c.id), { ...c, mandat: s.mandat }],
          panneau: null,
          apercu: 0,
          message: s.ecran === 'tuto' ? null : message,
          tuto: s.ecran === 'tuto' ? 2 : s.tuto,
        }))
      },
      retirer: (id) =>
        set((s) => ({
          chantiers: s.chantiers.filter((c) => !(c.id === id && c.mandat === s.mandat)),
          lignes: s.lignes.filter((l) => !(l.id === id && l.mandat === s.mandat)),
        })),
      changerPaiement: (id, etale) =>
        set((s) => ({
          chantiers: s.chantiers.map((c) => (c.id === id && c.mandat === s.mandat && s.mandat === 1 ? { ...c, etale } : c)),
          lignes: s.lignes.map((l) => (l.id === id && l.mandat === s.mandat && s.mandat === 1 ? { ...l, etale } : l)),
        })),
      levier: (cle, valeur) =>
        set((s) => ({ leviers: { ...s.leviers, [s.mandat]: { ...leviersDu(s.leviers, s.mandat), [cle]: valeur } } })),
      // Le jeu libre n'a qu'une étape : il passe directement au bilan.
      finirMandat: () => {
        mesurer(get().mandat === 1 && !get().libre ? 'premier mandat fini' : 'partie finie', { reseau: get().ville, mandat: get().mandat })
        set({ ecran: get().mandat === 1 && !get().libre ? 'fin-mandat' : 'bilan', panneau: null, brouillon: null, message: null })
      },
      mandatSuivant: () => {
        // En jeu libre, il n'y a pas de mandat : continuer, c'est revenir à la carte pour ajouter des lignes.
        if (get().libre) {
          mesurer('partie continuée', { reseau: get().ville, libre: true })
          return set({ ecran: 'jeu', panneau: null, brouillon: null, publie: null })
        }
        if (get().mandat >= 2) mesurer('partie continuée', { reseau: get().ville, mandat: get().mandat + 1 })
        set((s) => {
          const mandat = s.mandat + 1
          const leviers = { ...s.leviers, [mandat]: { ...leviersDu(s.leviers, s.mandat) } }
          // Un réseau continué change : il pourra être publié à nouveau.
          const suite = { ecran: 'jeu' as Ecran, mandat, leviers, panneau: null, brouillon: null, publie: null }
          // Au-delà de la partie de base, un mot dit ce que le nouveau mandat apporte.
          const annonce = (reste: number) =>
            mandat > 2
              ? {
                  titre: `Mandat ${mandat}, de ${finMandat(s.mandat)} à ${finMandat(mandat)}.`,
                  texte: `Vous disposez de ${n(reste)} M€. Faute de budget publié au-delà de 2038, chaque mandat reprend celui du second.`,
                }
              : null
          // Les choix repris pour ce mandat s'ajoutent, sauf un projet déjà décidé ou un projet qui dépend d'un projet retiré.
          const decides = new Set(s.chantiers.map((c) => c.id))
          const repris = (s.aVenir?.chantiers ?? []).filter((c) => c.mandat === mandat && !decides.has(c.id))
          const tous = new Set([...decides, ...repris.map((c) => c.id)])
          const chantiers = [
            ...s.chantiers,
            ...repris.filter((c) => {
              const requis = PROJETS.get(c.id)?.requiert
              return !requis || tous.has(requis)
            }),
          ]
          const lignes = [...s.lignes, ...(s.aVenir?.lignes ?? []).filter((l) => l.mandat === mandat)]
          const nombre = chantiers.length - s.chantiers.length + lignes.length - s.lignes.length
          const plusTard = {
            chantiers: (s.aVenir?.chantiers ?? []).filter((c) => c.mandat > mandat),
            lignes: (s.aVenir?.lignes ?? []).filter((l) => l.mandat > mandat),
          }
          const reste = bilanMandat(mandat, chantiers, lignes, leviers, VILLES[s.ville]).reste
          return {
            ...suite,
            chantiers,
            lignes,
            aVenir: plusTard.chantiers.length + plusTard.lignes.length ? plusTard : null,
            message: nombre
              ? {
                  titre: `${nombre} choix du réseau repris ${nombre > 1 ? 'sont ajoutés' : 'est ajouté'}.`,
                  texte: `Vous pouvez ${nombre > 1 ? 'les garder ou les retirer' : 'le garder ou le retirer'} avant de finir le mandat.`,
                }
              : annonce(reste),
          }
        })
      },
      reprendre: (p, inspire) => {
        const renommer = (l: LigneJoueur, i: number): LigneJoueur => ({ ...l, id: `ligne-${Date.now().toString(36)}-${i}` })
        const lignes = p.lignes.map(renommer)
        set({
          ...DEPART,
          ville: p.ville,
          libre: p.libre,
          ecran: 'jeu',
          chantiers: p.chantiers.filter((c) => c.mandat === 1),
          lignes: lignes.filter((l) => l.mandat === 1),
          leviers: { 1: { ...leviersDu(p.leviers, 1) } },
          aVenir: { chantiers: p.chantiers.filter((c) => c.mandat > 1), lignes: lignes.filter((l) => l.mandat > 1) },
          inspire: inspire ?? null,
          message: {
            titre: 'Vous partez de ce réseau.',
            texte: p.libre
              ? 'C’est un réseau fait en jeu libre : vous continuez sans budget à tenir. Vous pouvez tout modifier.'
              : 'Ses choix du premier mandat sont en place, ceux des suivants s’ajouteront au fil des mandats. Vous pouvez tout modifier.',
          },
        })
      },
      marquerPublie: (publie) => {
        mesurer('réseau publié', { reseau: get().ville })
        set({ publie })
      },
      allerAccueil: () => set({ pause: true, panneau: null, brouillon: null, message: null, apercu: 0 }),
      quitterAccueil: () => set({ pause: false }),
      tracer: (mode = 'tram') => set({ brouillon: { mode, arrets: [] }, panneau: { type: 'trace' }, apercu: 0 }),
      // Un prolongement garde le mode de la ligne qu'il prolonge : changer de mode en fait une ligne à part.
      changerMode: (mode) =>
        set((s) => ({
          brouillon: s.brouillon
            ? { ...s.brouillon, mode, prolonge: s.brouillon.mode === mode ? s.brouillon.prolonge : undefined }
            : { mode, arrets: [] },
        })),
      ajouterArret: (p, options) =>
        set((s) => {
          const b = s.brouillon
          if (!b) return {}
          const passage = !options?.station && b.outil === 'passage' && b.arrets.length > 0
          return { brouillon: { ...b, arrets: [...b.arrets, p], passages: avecPoint(b.passages, b.arrets.length, passage) } }
        }),
      retirerArret: () =>
        set((s) => {
          const b = s.brouillon
          if (!b || !b.arrets.length) return {}
          const dernier = b.arrets.length - 1
          // Retirer le terminus d'un prolongement, c'est ne plus rien prolonger.
          return {
            brouillon: {
              ...b,
              arrets: b.arrets.slice(0, -1),
              passages: sansPoint(b.passages, dernier),
              noms: b.noms?.slice(0, dernier),
              prolonge: dernier === 0 ? undefined : b.prolonge,
            },
          }
        }),
      enleverArret: (i) =>
        set((s) => {
          const b = s.brouillon
          if (!b) return {}
          return {
            brouillon: {
              ...b,
              arrets: b.arrets.filter((_, k) => k !== i),
              passages: sansPoint(b.passages, i),
              noms: nomsSans(b.noms, i),
              renomme: undefined,
              prolonge: i === 0 ? undefined : b.prolonge,
            },
          }
        }),
      deplacerArret: (i, p) =>
        set((s) => {
          const b = s.brouillon
          if (!b) return {}
          // Déplacer le terminus d'un prolongement le détache de la ligne existante.
          return { brouillon: { ...b, arrets: b.arrets.map((a, k) => (k === i ? p : a)), prolonge: i === 0 ? undefined : b.prolonge } }
        }),
      insererArret: (i, p) =>
        set((s) => {
          const b = s.brouillon
          if (!b) return {}
          return {
            brouillon: {
              ...b,
              arrets: [...b.arrets.slice(0, i), p, ...b.arrets.slice(i)],
              passages: avecPoint(b.passages, i, b.outil === 'passage'),
              noms: nomsAvec(b.noms, i),
              renomme: undefined,
            },
          }
        }),
      basculerPassage: (i) =>
        set((s) => {
          const b = s.brouillon
          if (!b || i <= 0 || i >= b.arrets.length - 1) return {}
          const passages = b.passages ?? []
          return {
            brouillon: { ...b, passages: passages.includes(i) ? passages.filter((k) => k !== i) : [...passages, i].sort((x, y) => x - y) },
          }
        }),
      choisirOutil: (outil) => set((s) => (s.brouillon ? { brouillon: { ...s.brouillon, outil } } : {})),
      renommer: (renomme) => set((s) => (s.brouillon ? { brouillon: { ...s.brouillon, renomme } } : {})),
      nommerArret: (i, nom) =>
        set((s) => {
          const b = s.brouillon
          if (!b || i < 0 || i >= b.arrets.length) return {}
          const noms = b.arrets.map((_, k) => (k === i ? nomArret(nom) || null : (b.noms?.[k] ?? null)))
          return { brouillon: { ...b, noms: noms.some(Boolean) ? noms : undefined, renomme: undefined } }
        }),
      prolonger: (ligne, mode, terminus) =>
        set((s) => ({
          brouillon: { mode, arrets: [terminus], passages: [], prolonge: ligne, outil: 'station', edition: s.brouillon?.edition },
          panneau: { type: 'trace' },
          apercu: 0,
        })),
      detacher: () => set((s) => (s.brouillon ? { brouillon: { ...s.brouillon, prolonge: undefined } } : {})),
      rattacher: (ligne, terminus) =>
        set((s) =>
          s.brouillon
            ? {
                brouillon: {
                  ...s.brouillon,
                  prolonge: ligne,
                  arrets: terminus ? [terminus, ...s.brouillon.arrets.slice(1)] : s.brouillon.arrets,
                  // Le premier point devient le terminus de la ligne prolongée : il en prend le nom.
                  noms: terminus && s.brouillon.noms ? [null, ...s.brouillon.noms.slice(1)] : s.brouillon.noms,
                },
              }
            : {},
        ),
      modifierLigne: (id) =>
        set((s) => {
          const l = s.lignes.find((x) => x.id === id && x.mandat === s.mandat)
          return l
            ? {
                brouillon: {
                  mode: l.mode,
                  arrets: [...l.arrets],
                  passages: [...(l.passages ?? [])],
                  noms: l.noms ? [...l.noms] : undefined,
                  prolonge: l.prolonge,
                  edition: l.id,
                },
                panneau: { type: 'trace' },
                apercu: 0,
              }
            : {}
        }),
      // Abandonner la modification d'une ligne ramène à sa fiche, sans rien changer.
      abandonnerTrace: () =>
        set((s) => ({
          brouillon: null,
          panneau: s.brouillon?.edition ? { type: 'ligne-joueur', id: s.brouillon.edition } : null,
          apercu: 0,
        })),
      construireLigne: (nom, estimation, etale) =>
        set((s) => {
          if (!s.brouillon) return {}
          const ancienne = s.brouillon.edition ? s.lignes.find((l) => l.id === s.brouillon!.edition) : undefined
          if (ancienne) {
            // Une ligne modifiée garde sa place dans le programme, son mandat et son paiement.
            mesurer('ligne modifiée', { reseau: s.ville, mode: s.brouillon.mode, arrets: s.brouillon.arrets.length })
            const modifiee: LigneJoueur = {
              ...ancienne,
              nom,
              mode: s.brouillon.mode,
              arrets: s.brouillon.arrets,
              passages: nettoyer(s.brouillon.passages, s.brouillon.arrets.length),
              noms: nomsGardes(s.brouillon),
              prolonge: s.brouillon.prolonge,
              estimation: { ...estimation, nouveaux: Math.round(estimation.nouveaux / 100) * 100 },
            }
            return {
              lignes: s.lignes.map((l) => (l.id === ancienne.id ? modifiee : l)),
              brouillon: null,
              panneau: { type: 'ligne-joueur', id: ancienne.id },
              message: {
                titre: `${nom} modifiée.`,
                texte: `Environ ${approx(estimation.nouveaux)} nouveaux voyageurs par jour pour le réseau.`,
              },
            }
          }
          mesurer('ligne construite', { reseau: s.ville, mode: s.brouillon.mode, arrets: s.brouillon.arrets.length })
          const ligne: LigneJoueur = {
            id: `ligne-${Date.now().toString(36)}`,
            nom,
            mode: s.brouillon.mode,
            arrets: s.brouillon.arrets,
            passages: nettoyer(s.brouillon.passages, s.brouillon.arrets.length),
            noms: nomsGardes(s.brouillon),
            prolonge: s.brouillon.prolonge,
            mandat: s.mandat,
            etale,
            // Une estimation ne mérite pas plus de précision que la centaine.
            estimation: { ...estimation, nouveaux: Math.round(estimation.nouveaux / 100) * 100 },
          }
          return {
            lignes: [...s.lignes, ligne],
            brouillon: null,
            panneau: null,
            message: {
              titre: `${nom} ajoutée.`,
              texte: `Environ ${approx(estimation.nouveaux)} nouveaux voyageurs par jour pour le réseau.`,
            },
          }
        }),
      actualiserLignes: (carreaux) =>
        set((s) => {
          if (carreaux.ville !== s.ville || s.lignes.length === 0) return {}
          let change = false
          const lignes = s.lignes.map((l) => {
            const e = estimer(l.mode, l.arrets, carreaux, { passages: l.passages, prolonge: Boolean(l.prolonge) })
            const estimation = { ...e, nouveaux: Math.round(e.nouveaux / 100) * 100 }
            if (estimation.cout === l.estimation.cout && estimation.nouveaux === l.estimation.nouveaux && l.estimation.detail) return l
            change = true
            return { ...l, estimation }
          })
          return change ? { lignes } : {}
        }),
      effacerMessage: () => set({ message: null }),
      setApercu: (apercu) => set({ apercu }),
    }),
    {
      name: 'simulateur-tcl-partie',
      version: 4,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      // Une partie enregistrée avant le jeu libre se joue avec le budget.
      migrate: (etat) => ({ libre: false, ...(etat as object) }),
      // Une partie d'un réseau qui n'existe plus (l'ancien « paris ») repart de zéro plutôt que de casser la page.
      merge: (enregistre, actuel) => {
        const e = enregistre as Partial<Etat> | undefined
        return e && estVille(e.ville) ? { ...actuel, ...e } : actuel
      },
      // Une partie enregistrée avant l'ouverture de Toulouse n'a pas de ville : elle reste à Lyon, valeur de départ.
      partialize: (s) => ({
        ville: s.ville,
        libre: s.libre,
        ecran: s.ecran === 'tuto' ? 'jeu' : s.ecran,
        mandat: s.mandat,
        chantiers: s.chantiers,
        lignes: s.lignes,
        leviers: s.leviers,
        aVenir: s.aVenir,
        inspire: s.inspire,
        publie: s.publie,
      }),
    },
  ),
)

/** La ville de la partie en cours. */
export const useVille = () => VILLES[useJeu((s) => s.ville)]
