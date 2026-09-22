'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { approx } from './format'
import { LEVIERS_NEUTRES } from './regles'
import type { Chantier, Estimation, Leviers, LigneJoueur, Mandat, ModeLigne } from './types'

export type Ecran = 'accueil' | 'tuto' | 'jeu' | 'fin-mandat' | 'bilan'

export type Panneau =
  | { type: 'projet'; id: string }
  | { type: 'liste' }
  | { type: 'leviers' }
  | { type: 'trace' }
  | { type: 'ligne' }
  | { type: 'methode' }

export interface Brouillon {
  mode: ModeLigne
  arrets: [number, number][]
}

interface Etat {
  ecran: Ecran
  tuto: number
  mandat: Mandat
  chantiers: Chantier[]
  lignes: LigneJoueur[]
  leviers: Record<Mandat, Leviers>
  panneau: Panneau | null
  brouillon: Brouillon | null
  message: { titre: string; texte: string } | null
  /** Coût du projet en cours d'examen, affiché en aperçu sur la jauge. */
  apercu: number

  commencer: () => void
  etapeTuto: (n: number) => void
  finirTuto: () => void
  ouvrir: (p: Panneau) => void
  fermer: () => void
  construire: (c: Omit<Chantier, 'mandat'>, message?: Etat['message']) => void
  retirer: (id: string) => void
  levier: <K extends keyof Leviers>(cle: K, valeur: Leviers[K]) => void
  finirMandat: () => void
  commencerMandat2: () => void
  rejouer: () => void
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
  ecran: 'accueil' as Ecran,
  tuto: 0,
  mandat: 1 as Mandat,
  chantiers: [] as Chantier[],
  lignes: [] as LigneJoueur[],
  leviers: { 1: LEVIERS_NEUTRES, 2: LEVIERS_NEUTRES },
  panneau: null,
  brouillon: null,
  message: null,
  apercu: 0,
}

export const useJeu = create<Etat>()(
  persist(
    (set, get) => ({
      ...DEPART,
      commencer: () => set({ ecran: 'tuto', tuto: 0 }),
      etapeTuto: (tuto) => set({ tuto }),
      finirTuto: () => set({ ecran: 'jeu', panneau: null }),
      ouvrir: (panneau) => set({ panneau, apercu: 0 }),
      fermer: () => set({ panneau: null, apercu: 0 }),
      construire: (c, message = null) =>
        set((s) => ({
          chantiers: [...s.chantiers.filter((x) => x.id !== c.id), { ...c, mandat: s.mandat }],
          panneau: null,
          apercu: 0,
          message,
        })),
      retirer: (id) =>
        set((s) => ({
          chantiers: s.chantiers.filter((c) => !(c.id === id && c.mandat === s.mandat)),
          lignes: s.lignes.filter((l) => !(l.id === id && l.mandat === s.mandat)),
        })),
      levier: (cle, valeur) =>
        set((s) => ({ leviers: { ...s.leviers, [s.mandat]: { ...s.leviers[s.mandat], [cle]: valeur } } })),
      finirMandat: () => set({ ecran: get().mandat === 1 ? 'fin-mandat' : 'bilan', panneau: null, brouillon: null }),
      commencerMandat2: () =>
        set((s) => ({ ecran: 'jeu', mandat: 2, leviers: { ...s.leviers, 2: { ...s.leviers[1] } }, panneau: null })),
      rejouer: () => set({ ...DEPART }),
      tracer: (mode = 'tram') => set({ brouillon: { mode, arrets: [] }, panneau: { type: 'trace' }, apercu: 0 }),
      changerMode: (mode) => set((s) => ({ brouillon: s.brouillon ? { ...s.brouillon, mode } : { mode, arrets: [] } })),
      ajouterArret: (p) =>
        set((s) => (s.brouillon ? { brouillon: { ...s.brouillon, arrets: [...s.brouillon.arrets, p] } } : {})),
      retirerArret: () =>
        set((s) => (s.brouillon ? { brouillon: { ...s.brouillon, arrets: s.brouillon.arrets.slice(0, -1) } } : {})),
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
            message: { titre: `${nom} ajoutée.`, texte: `Environ ${approx(estimation.nouveaux)} nouveaux voyageurs par jour pour le réseau.` },
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
      partialize: (s) => ({
        ecran: s.ecran === 'tuto' ? 'jeu' : s.ecran,
        mandat: s.mandat,
        chantiers: s.chantiers,
        lignes: s.lignes,
        leviers: s.leviers,
      }),
    },
  ),
)
