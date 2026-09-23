'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { PROJETS } from './catalogue'
import { approx } from './format'
import type { PartiePartagee } from './lien'
import { LEVIERS_NEUTRES } from './regles'
import type { Chantier, Estimation, Leviers, LigneJoueur, Mandat, ModeLigne } from './types'
import { VILLES, type IdVille } from './villes'

export type Ecran = 'accueil' | 'tuto' | 'jeu' | 'fin-mandat' | 'bilan'

export type Panneau =
  { type: 'projet'; id: string } | { type: 'liste' } | { type: 'leviers' } | { type: 'trace' } | { type: 'ligne' } | { type: 'methode' }

export interface Brouillon {
  mode: ModeLigne
  arrets: [number, number][]
}

/** Les choix du second mandat d'un réseau repris, qui s'ajoutent quand ce mandat commence. */
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

  /** Commence une partie dans une ville : le tutoriel à Lyon, le traceur ouvert là où il n'y a pas de catalogue. */
  commencer: (ville: IdVille) => void
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
  commencerMandat2: () => void
  rejouer: () => void
  /** Remplace la partie par un réseau reçu : ses choix du premier mandat tout de suite, ceux du second plus tard. */
  reprendre: (p: PartiePartagee, inspire?: Inspiration) => void
  marquerPublie: (id: string) => void
  tracer: (mode?: ModeLigne) => void
  changerMode: (mode: ModeLigne) => void
  ajouterArret: (p: [number, number]) => void
  retirerArret: () => void
  abandonnerTrace: () => void
  construireLigne: (nom: string, estimation: Estimation, etale: boolean) => void
  effacerMessage: () => void
  setApercu: (v: number) => void
}

const DEPART = {
  ville: 'lyon' as IdVille,
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
}

export const useJeu = create<Etat>()(
  persist(
    (set, get) => ({
      ...DEPART,
      commencer: (ville) =>
        set(
          VILLES[ville].catalogue
            ? { ...DEPART, ville, ecran: 'tuto', tuto: 0 }
            : { ...DEPART, ville, ecran: 'jeu', brouillon: { mode: 'tram', arrets: [] }, panneau: { type: 'trace' } },
        ),
      etapeTuto: (tuto) => set({ tuto }),
      finirTuto: () => set({ ecran: 'jeu', panneau: null }),
      // Le tutoriel avance avec les gestes du joueur : ouvrir un projet, puis le lancer.
      ouvrir: (panneau) =>
        set((s) => ({ panneau, apercu: 0, tuto: s.ecran === 'tuto' && s.tuto === 0 && panneau.type === 'projet' ? 1 : s.tuto })),
      fermer: () => set((s) => ({ panneau: null, apercu: 0, tuto: s.ecran === 'tuto' && s.tuto === 1 ? 0 : s.tuto })),
      construire: (c, message = null) =>
        set((s) => ({
          chantiers: [...s.chantiers.filter((x) => x.id !== c.id), { ...c, mandat: s.mandat }],
          panneau: null,
          apercu: 0,
          message: s.ecran === 'tuto' ? null : message,
          tuto: s.ecran === 'tuto' ? 2 : s.tuto,
        })),
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
      levier: (cle, valeur) => set((s) => ({ leviers: { ...s.leviers, [s.mandat]: { ...s.leviers[s.mandat], [cle]: valeur } } })),
      finirMandat: () => set({ ecran: get().mandat === 1 ? 'fin-mandat' : 'bilan', panneau: null, brouillon: null, message: null }),
      commencerMandat2: () =>
        set((s) => {
          const suite = {
            ecran: 'jeu' as Ecran,
            mandat: 2 as Mandat,
            leviers: { ...s.leviers, 2: { ...s.leviers[1] } },
            panneau: null,
            aVenir: null,
          }
          if (!s.aVenir) return suite
          // Les choix repris s'ajoutent, sauf un projet déjà décidé ou un projet qui dépend d'un projet retiré.
          const decides = new Set(s.chantiers.map((c) => c.id))
          const repris = s.aVenir.chantiers.filter((c) => !decides.has(c.id))
          const tous = new Set([...decides, ...repris.map((c) => c.id)])
          const chantiers = repris.filter((c) => {
            const requis = PROJETS.get(c.id)?.requiert
            return !requis || tous.has(requis)
          })
          const nombre = chantiers.length + s.aVenir.lignes.length
          return {
            ...suite,
            chantiers: [...s.chantiers, ...chantiers],
            lignes: [...s.lignes, ...s.aVenir.lignes],
            message: nombre
              ? {
                  titre: `${nombre} choix du réseau repris ${nombre > 1 ? 'sont ajoutés' : 'est ajouté'}.`,
                  texte: 'Vous pouvez les garder ou les retirer avant de finir la partie.',
                }
              : null,
          }
        }),
      // L'accueil propose ensuite la même ville.
      rejouer: () => set((s) => ({ ...DEPART, ville: s.ville })),
      reprendre: (p, inspire) => {
        const renommer = (l: LigneJoueur, i: number): LigneJoueur => ({ ...l, id: `ligne-${Date.now().toString(36)}-${i}` })
        const lignes = p.lignes.map(renommer)
        set({
          ...DEPART,
          ville: p.ville,
          ecran: 'jeu',
          chantiers: p.chantiers.filter((c) => c.mandat === 1),
          lignes: lignes.filter((l) => l.mandat === 1),
          leviers: { 1: { ...p.leviers[1] }, 2: { ...p.leviers[1] } },
          aVenir: { chantiers: p.chantiers.filter((c) => c.mandat === 2), lignes: lignes.filter((l) => l.mandat === 2) },
          inspire: inspire ?? null,
          message: {
            titre: 'Vous partez de ce réseau.',
            texte: 'Ses choix du premier mandat sont en place, ceux du second s’ajouteront au mandat suivant. Vous pouvez tout modifier.',
          },
        })
      },
      marquerPublie: (publie) => set({ publie }),
      tracer: (mode = 'tram') => set({ brouillon: { mode, arrets: [] }, panneau: { type: 'trace' }, apercu: 0 }),
      changerMode: (mode) => set((s) => ({ brouillon: s.brouillon ? { ...s.brouillon, mode } : { mode, arrets: [] } })),
      ajouterArret: (p) => set((s) => (s.brouillon ? { brouillon: { ...s.brouillon, arrets: [...s.brouillon.arrets, p] } } : {})),
      retirerArret: () => set((s) => (s.brouillon ? { brouillon: { ...s.brouillon, arrets: s.brouillon.arrets.slice(0, -1) } } : {})),
      abandonnerTrace: () => set({ brouillon: null, panneau: null, apercu: 0 }),
      construireLigne: (nom, estimation, etale) =>
        set((s) => {
          if (!s.brouillon) return {}
          const ligne: LigneJoueur = {
            id: `ligne-${Date.now().toString(36)}`,
            nom,
            mode: s.brouillon.mode,
            arrets: s.brouillon.arrets,
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
      effacerMessage: () => set({ message: null }),
      setApercu: (apercu) => set({ apercu }),
    }),
    {
      name: 'simulateur-tcl-partie',
      version: 3,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      // Une partie enregistrée avant l'ouverture de Toulouse n'a pas de ville : elle reste à Lyon, valeur de départ.
      partialize: (s) => ({
        ville: s.ville,
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
