'use client'

import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { dependentsOf, resolveProject } from '@/lib/budget'
import { MODE_SHORT, millions, riders } from '@/lib/format'
import { PHASES, PROJECTS_BY_ID, PROJECT_NUMBER } from '@/lib/projects'
import { useStudy } from '@/lib/store'
import type { Phase, Project, Selection } from '@/lib/types'
import { Check, ChevronDown, ModePicto } from '@/components/icons'
import { PhaseSwitch } from './PhaseSwitch'

function VariantChoice({
  project,
  selection,
}: {
  project: Project
  selection: Selection
}) {
  const setVariant = useStudy((s) => s.setVariant)
  if (!project.variants?.length) return null

  return (
    <div className="mt-3">
      <p className="sign-label text-chalk-dim">Variante retenue</p>
      <div className="mt-2 grid gap-px overflow-hidden bg-ink-rule" style={{ borderRadius: 'var(--radius-plate)' }}>
        {project.variants.map((variant) => {
          const active = (selection.variantId ?? project.variants![0].id) === variant.id
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setVariant(project.id, variant.id)}
              className={clsx(
                'flex items-start gap-3 px-3 py-2.5 text-left transition-colors duration-150',
                active ? 'bg-signal text-ink' : 'bg-ink hover:bg-ink-lift',
              )}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {active ? <Check className="h-3 w-3" aria-hidden /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold leading-tight">{variant.name}</span>
                <span
                  className={clsx(
                    'mt-0.5 block text-[12px] leading-snug',
                    active ? 'text-olive' : 'text-chalk-dim',
                  )}
                >
                  {variant.detail}
                </span>
              </span>
              <span className="shrink-0 text-right text-[12px] font-bold leading-tight lining">
                {millions(variant.cost)}
                <span className="block text-[10px] font-normal opacity-70">M€</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function OptionChoice({ project, selection }: { project: Project; selection: Selection }) {
  const setOption = useStudy((s) => s.setOption)
  if (!project.option) return null
  const taken = Boolean(selection.optionTaken)

  return (
    <button
      type="button"
      onClick={() => setOption(project.id, !taken)}
      className={clsx(
        'mt-3 flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors duration-150',
        taken ? 'bg-signal text-ink' : 'border border-ink-rule bg-ink hover:bg-ink-lift',
      )}
      style={{ borderRadius: 'var(--radius-plate)' }}
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {taken ? <Check className="h-3 w-3" aria-hidden /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold leading-tight">{project.option.name}</span>
        <span
          className={clsx(
            'mt-0.5 block text-[12px] leading-snug',
            taken ? 'text-olive' : 'text-chalk-dim',
          )}
        >
          {project.option.detail}
        </span>
      </span>
      <span className="shrink-0 text-right text-[12px] font-bold leading-tight lining">
        +{millions(project.option.extraCost)}
        <span className="block text-[10px] font-normal opacity-70">M€</span>
      </span>
    </button>
  )
}

export function ProjectRow({
  project,
  selection,
}: {
  project: Project
  selection?: Selection
}) {
  const assign = useStudy((s) => s.assign)
  const focused = useStudy((s) => s.focused)
  const hovered = useStudy((s) => s.hovered)
  const setFocused = useStudy((s) => s.setFocused)
  const setHovered = useStudy((s) => s.setHovered)
  const selections = useStudy((s) => s.selections)

  const open = focused === project.id
  const lit = hovered === project.id
  const resolved = resolveProject(project, selection)

  const requirement = project.requires ? PROJECTS_BY_ID.get(project.requires) : undefined
  const blocked = Boolean(
    project.requires && !selections.some((s) => s.projectId === project.requires),
  )

  const dependants = dependentsOf(project.id)
    .filter((id) => selections.some((s) => s.projectId === id))
    .map((id) => PROJECTS_BY_ID.get(id)?.name)
    .filter(Boolean) as string[]

  const start = selection?.phase === 'M2' ? PHASES.M2.start : PHASES.M1.start
  const opening = selection ? start + resolved.duration : null

  const setPhase = (phase: Phase | null) => assign(project.id, phase)

  return (
    <li
      className={clsx(
        'border-b border-ink-rule/70 transition-colors duration-150',
        lit && !open && 'bg-ink-lift',
        open && 'bg-ink-lift',
      )}
      onMouseEnter={() => setHovered(project.id)}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="flex items-start gap-2 px-2.5 py-2">
        <span className="mt-px flex shrink-0 items-center gap-1.5">
          <span
            className={clsx(
              'w-4 text-right font-mono text-[10px] font-bold leading-none lining',
              selection ? 'text-signal' : 'text-chalk-dim/70',
            )}
            aria-hidden
          >
            {PROJECT_NUMBER.get(project.id)}
          </span>
          <span
            className={clsx(
              'flex h-8 w-8 items-center justify-center',
              selection ? 'bg-signal text-ink' : 'bg-ink-lift text-chalk-dim',
            )}
            style={{
              borderRadius: 'var(--radius-plate)',
              ['--picto-hole' as string]: selection ? 'var(--color-signal)' : 'var(--color-ink-lift)',
            }}
          >
            <ModePicto mode={resolved.mode} className="h-[18px] w-[18px]" />
          </span>
        </span>

        <button
          type="button"
          onClick={() => setFocused(open ? null : project.id)}
          aria-expanded={open}
          className="min-w-0 flex-1 text-left"
        >
          <span className="flex items-start gap-1.5">
            <span
              className={clsx(
                'text-[13px] font-bold leading-[1.15] text-pretty',
                selection ? 'text-chalk' : 'text-chalk/85',
              )}
            >
              {project.name}
            </span>
            <ChevronDown
              className={clsx(
                'mt-1 h-3 w-3 shrink-0 text-chalk-dim transition-transform duration-200',
                open && 'rotate-180',
              )}
              aria-hidden
            />
          </span>
          <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[11px] text-chalk-dim lining">
            <span className="font-bold text-chalk/80">{millions(resolved.cost)} M€</span>
            <span>+{riders(resolved.ridership)} voy./j</span>
            {opening ? <span className="text-signal">ouvre en {opening}</span> : null}
          </span>
        </button>

        <PhaseSwitch
          value={selection?.phase ?? null}
          onChange={setPhase}
          disabled={blocked}
          disabledReason={
            requirement ? `Demande d’abord ${requirement.name}` : undefined
          }
        />
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-4 pt-1">
              <p className="text-[13px] leading-relaxed text-chalk-dim">{project.description}</p>

              <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden bg-ink-rule" style={{ borderRadius: 'var(--radius-plate)' }}>
                <div className="bg-ink px-2.5 py-2">
                  <dt className="sign-label text-chalk-dim">Mode</dt>
                  <dd className="mt-1 text-[12px] font-bold leading-tight">
                    {MODE_SHORT[resolved.mode]}
                  </dd>
                </div>
                <div className="bg-ink px-2.5 py-2">
                  <dt className="sign-label text-chalk-dim">Chantier</dt>
                  <dd className="mt-1 text-[12.5px] font-bold leading-tight lining">
                    {resolved.duration} an{resolved.duration > 1 ? 's' : ''}
                  </dd>
                </div>
                <div className="bg-ink px-2.5 py-2">
                  <dt className="sign-label text-chalk-dim">Rendement</dt>
                  <dd className="mt-1 text-[12.5px] font-bold leading-tight lining">
                    {Math.round(resolved.ridership / resolved.cost)} voy./M€
                  </dd>
                </div>
              </dl>

              {blocked && requirement ? (
                <p className="mt-3 border border-alert/45 px-3 py-2 text-[12px] leading-snug text-alert" style={{ borderRadius: 'var(--radius-plate)' }}>
                  Cet ouvrage ne tient que si «&nbsp;{requirement.name}&nbsp;» est inscrit au
                  programme. Inscrivez-le d’abord.
                </p>
              ) : null}

              {selection ? <VariantChoice project={project} selection={selection} /> : null}
              {selection ? <OptionChoice project={project} selection={selection} /> : null}

              {selection ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="min-w-0 text-[11.5px] leading-snug text-chalk-dim lining">
                    {dependants.length > 0
                      ? `Le retirer retire aussi : ${dependants.join(', ')}`
                      : `Chantier de ${start} à ${start + resolved.duration}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPhase(null)}
                    className="shrink-0 px-2.5 py-1.5 text-[12px] font-bold text-alert transition-colors duration-150 hover:bg-alert hover:text-ink"
                    style={{ borderRadius: 'var(--radius-plate)' }}
                  >
                    Retirer du programme
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}
