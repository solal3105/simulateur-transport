'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dependentsOf } from './budget'
import { PROJECTS_BY_ID } from './projects'
import type { LeverState, Phase, Selection } from './types'

export type Stage = 'briefing' | 'plan' | 'bilan'
export type Deck = 'ouvrages' | 'leviers' | 'mises-en-service'

const EMPTY_LEVERS: LeverState = {
  gratuiteTotale: null,
  gratuiteMoins25: null,
  gratuiteJeunesAbonnes: null,
  suppressionTarifSocial: null,
  metroNuitWeekend: null,
  tva55: null,
  tarifAbonnements: 0,
  tarifTickets: 0,
  versementMobilite: 0,
  maintenance: 'M1M2',
  electrification: null,
}

interface StudyState {
  stage: Stage
  deck: Deck
  selections: Selection[]
  levers: LeverState
  /** Ouvrage dont la fiche est ouverte, sur le plan comme dans la nomenclature. */
  focused: string | null
  /** Ouvrage survolé, mis en évidence sur le plan. */
  hovered: string | null
  /** Ouvrage dont le tracé est en train de s'écrire sur le plan. */
  drawing: string | null

  setStage: (stage: Stage) => void
  setDeck: (deck: Deck) => void
  setFocused: (id: string | null) => void
  setHovered: (id: string | null) => void
  clearDrawing: (id: string) => void
  assign: (projectId: string, phase: Phase | null) => void
  setVariant: (projectId: string, variantId: string) => void
  setOption: (projectId: string, taken: boolean) => void
  setLever: <K extends keyof LeverState>(key: K, value: LeverState[K]) => void
  reset: () => void
}

export const useStudy = create<StudyState>()(
  persist(
    (set, get) => ({
      stage: 'briefing',
      deck: 'ouvrages',
      selections: [],
      levers: EMPTY_LEVERS,
      focused: null,
      hovered: null,
      drawing: null,

      setStage: (stage) => set({ stage }),
      setDeck: (deck) => set({ deck }),
      setFocused: (focused) => set({ focused }),
      setHovered: (hovered) => set({ hovered }),
      clearDrawing: (id) => set((s) => (s.drawing === id ? { drawing: null } : s)),

      assign: (projectId, phase) => {
        const project = PROJECTS_BY_ID.get(projectId)
        if (!project) return
        const { selections } = get()

        if (phase === null) {
          // Retirer un prérequis emporte tout ce qui en dépend.
          const doomed = new Set([projectId, ...dependentsOf(projectId)])
          set({ selections: selections.filter((s) => !doomed.has(s.projectId)), drawing: null })
          return
        }

        // Un ouvrage dont le prérequis n'est pas retenu ne peut pas être inscrit.
        if (project.requires && !selections.some((s) => s.projectId === project.requires)) return

        const existing = selections.find((s) => s.projectId === projectId)
        if (existing) {
          set({
            selections: selections.map((s) => (s.projectId === projectId ? { ...s, phase } : s)),
          })
          return
        }

        const entry: Selection = { projectId, phase }
        if (project.variants?.length) entry.variantId = project.variants[0].id
        set({ selections: [...selections, entry], drawing: projectId })
      },

      setVariant: (projectId, variantId) =>
        set((s) => ({
          selections: s.selections.map((sel) =>
            sel.projectId === projectId ? { ...sel, variantId } : sel,
          ),
          drawing: projectId,
        })),

      setOption: (projectId, optionTaken) =>
        set((s) => ({
          selections: s.selections.map((sel) =>
            sel.projectId === projectId ? { ...sel, optionTaken } : sel,
          ),
        })),

      setLever: (key, value) => set((s) => ({ levers: { ...s.levers, [key]: value } })),

      reset: () =>
        set({
          selections: [],
          levers: EMPTY_LEVERS,
          focused: null,
          hovered: null,
          drawing: null,
          stage: 'plan',
          deck: 'ouvrages',
        }),
    }),
    {
      name: 'tcl-etude',
      version: 2,
      partialize: (state) => ({
        selections: state.selections,
        levers: state.levers,
        stage: state.stage === 'briefing' ? 'briefing' : 'plan',
      }),
    },
  ),
)

export { EMPTY_LEVERS }
