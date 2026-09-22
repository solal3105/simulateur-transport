import { FARE_YIELD, FLEET_PROGRAMMES, PHASE_BUDGET, PHASES, PROJECTS_BY_ID, TOGGLE_LEVERS } from './projects'
import type { Assessment, Delivery, LeverState, Mode, Phase, PhaseBalance, Project, Selection } from './types'

/** Ce qu'un ouvrage coûte, rapporte et met de temps, une fois ses options tranchées. */
export interface ResolvedProject {
  project: Project
  mode: Mode
  cost: number
  ridership: number
  duration: number
  variantName?: string
}

export function resolveProject(project: Project, selection?: Selection): ResolvedProject {
  if (project.variants?.length) {
    const variant =
      project.variants.find((v) => v.id === selection?.variantId) ?? project.variants[0]
    return {
      project,
      mode: variant.mode,
      cost: variant.cost,
      ridership: variant.ridership,
      duration: variant.duration,
      variantName: variant.name,
    }
  }

  if (project.option && selection?.optionTaken) {
    return {
      project,
      mode: project.mode,
      cost: project.cost + project.option.extraCost,
      ridership: project.ridership + project.option.extraRidership,
      duration: project.option.duration,
      variantName: project.option.name,
    }
  }

  return {
    project,
    mode: project.mode,
    cost: project.cost,
    ridership: project.ridership,
    duration: project.duration,
  }
}

export const PHASE_LABELS: Record<Phase, string> = {
  M1: 'Phase 1',
  M2: 'Phase 2',
  M1M2: 'Les deux',
}

export function coversPhase(assigned: Phase | null | undefined, phase: 'M1' | 'M2'): boolean {
  return assigned === phase || assigned === 'M1M2'
}

/** Part d'un coût total imputée à une phase donnée. */
function share(total: number, assigned: Phase, phase: 'M1' | 'M2'): number {
  if (assigned === 'M1M2') return total / 2
  return assigned === phase ? total : 0
}

function leverEffect(levers: LeverState, phase: 'M1' | 'M2'): number {
  const freeTravel = coversPhase(levers.gratuiteTotale, phase)
  let effect = 0

  for (const lever of TOGGLE_LEVERS) {
    if (!coversPhase(levers[lever.id], phase)) continue
    if (lever.voidedByFreeTravel && freeTravel) continue
    effect += lever.perPhase
  }

  if (!freeTravel) {
    effect += levers.tarifAbonnements * FARE_YIELD.abonnements
    effect += levers.tarifTickets * FARE_YIELD.tickets
  }

  effect += levers.versementMobilite * FARE_YIELD.versementMobilite

  return Math.round(effect)
}

function investment(selections: Selection[], levers: LeverState, phase: 'M1' | 'M2'): number {
  let total = 0

  for (const selection of selections) {
    const project = PROJECTS_BY_ID.get(selection.projectId)
    if (!project) continue
    total += share(resolveProject(project, selection).cost, selection.phase, phase)
  }

  for (const programme of FLEET_PROGRAMMES) {
    const assigned = levers[programme.id]
    if (assigned) total += share(programme.cost, assigned, phase)
  }

  return Math.round(total)
}

function balanceFor(selections: Selection[], levers: LeverState, phase: 'M1' | 'M2'): PhaseBalance {
  const effect = leverEffect(levers, phase)
  const spend = investment(selections, levers, phase)
  return { base: PHASE_BUDGET, levers: effect, spend, left: PHASE_BUDGET + effect - spend }
}

export function assess(selections: Selection[], levers: LeverState): Assessment {
  const m1 = balanceFor(selections, levers, 'M1')
  const m2 = balanceFor(selections, levers, 'M2')

  let ridership = 0
  for (const selection of selections) {
    const project = PROJECTS_BY_ID.get(selection.projectId)
    if (!project) continue
    ridership += resolveProject(project, selection).ridership
  }

  const spend = m1.spend + m2.spend

  return {
    m1,
    m2,
    ridership,
    yield: spend > 0 ? ridership / spend : 0,
    spend,
    balanced: m1.left >= 0 && m2.left >= 0,
  }
}

/** L'année où chaque ouvrage retenu ouvre au public, chantier terminé. */
export function deliveries(selections: Selection[]): Delivery[] {
  return selections
    .map<Delivery | null>((selection) => {
      const project = PROJECTS_BY_ID.get(selection.projectId)
      if (!project) return null
      const resolved = resolveProject(project, selection)
      const start = selection.phase === 'M2' ? PHASES.M2.start : PHASES.M1.start
      return {
        projectId: project.id,
        name: project.name,
        mode: resolved.mode,
        phase: selection.phase,
        start,
        year: start + resolved.duration,
      }
    })
    .filter((d): d is Delivery => d !== null)
    .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name, 'fr'))
}

/**
 * Ce que la sélection empêche : un ouvrage dont le prérequis n'est pas retenu
 * ne peut pas être inscrit, et retirer un prérequis emporte ce qui en dépend.
 */
export function dependentsOf(projectId: string): string[] {
  const dependents: string[] = []
  for (const project of PROJECTS_BY_ID.values()) {
    if (project.requires === projectId) dependents.push(project.id)
  }
  return dependents
}
