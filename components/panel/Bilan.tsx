'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { deliveries, resolveProject } from '@/lib/budget'
import { millions, riders, signedMillions } from '@/lib/format'
import { PHASES, PROJECTS } from '@/lib/projects'
import { useStudy } from '@/lib/store'
import type { Assessment } from '@/lib/types'
import { ArrowLeft, Download, ModePicto, Restart } from '@/components/icons'
import { ScaleRule, SignButton } from './parts'
import { drawShareCard } from './shareCard'

/**
 * Une lecture mesurée : le nombre ne flotte pas, il se lit contre une échelle
 * dont la borne est elle-même un fait du catalogue.
 */
function Reading({
  name,
  value,
  unit,
  amount,
  span,
  spanUnit,
  caption,
}: {
  name: string
  value: string
  unit: string
  amount: number
  span: number
  spanUnit: string
  caption: string
}) {
  return (
    <div className="min-w-0 px-4 py-4 sm:px-5">
      <p className="sign-label text-olive">{name}</p>
      <p className="mt-1.5 flex items-baseline gap-1.5">
        <span className="wide lining text-[clamp(1.8rem,4.6vw,3.1rem)] font-bold leading-[0.85] tracking-[-0.035em]">
          {value}
        </span>
        <span className="text-[13px] font-bold">{unit}</span>
      </p>
      <div className="mt-3">
        <ScaleRule ceiling={span} spent={amount} span={span} unit={spanUnit} />
      </div>
      <p className="mt-2 max-w-[30ch] text-[12.5px] leading-snug text-olive">{caption}</p>
    </div>
  )
}

function LedgerLine({ label, value, tone }: { label: string; value: string; tone?: 'alert' }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-[12.5px] leading-snug text-chalk-dim">{label}</span>
      <span
        className={clsx(
          'shrink-0 font-mono text-[13px] font-bold lining',
          tone === 'alert' ? 'text-alert' : 'text-chalk',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/** Le détail de chaque enveloppe, pour que le verdict soit vérifiable ligne à ligne. */
function Ledger({ assessment }: { assessment: Assessment }) {
  const phases = [
    { name: PHASES.M1.label, span: `${PHASES.M1.start}–${PHASES.M1.end}`, balance: assessment.m1 },
    { name: PHASES.M2.label, span: `${PHASES.M2.start}–${PHASES.M2.end}`, balance: assessment.m2 },
  ]

  return (
    <div
      className="on-plate mt-6 grid gap-px overflow-hidden bg-ink-rule sm:grid-cols-2"
      style={{ borderRadius: 'var(--radius-inset)' }}
    >
      {phases.map((phase) => (
        <div key={phase.name} className="bg-ink px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="sign-label text-signal">{phase.name}</span>
            <span className="font-mono text-[11px] text-chalk-dim lining">{phase.span}</span>
          </div>
          <div className="mt-2 divide-y divide-ink-rule/70">
            <LedgerLine label="Enveloppe d’investissement" value={`${millions(phase.balance.base)} M€`} />
            <LedgerLine
              label="Effet des leviers de financement"
              value={`${signedMillions(phase.balance.levers)} M€`}
              tone={phase.balance.levers < 0 ? 'alert' : undefined}
            />
            <LedgerLine label="Investissement engagé" value={`${millions(phase.balance.spend)} M€`} />
            <LedgerLine
              label={phase.balance.left < 0 ? 'Il manque' : 'Il reste'}
              value={`${millions(Math.abs(phase.balance.left))} M€`}
              tone={phase.balance.left < 0 ? 'alert' : undefined}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Bilan({ assessment }: { assessment: Assessment }) {
  const selections = useStudy((s) => s.selections)
  const setStage = useStudy((s) => s.setStage)
  const setFocused = useStudy((s) => s.setFocused)
  const reset = useStudy((s) => s.reset)
  const [saving, setSaving] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panel.current?.focus({ preventScroll: true })
  }, [])

  const built = useMemo(() => deliveries(selections), [selections])

  const skipped = useMemo(() => {
    const chosen = new Set(selections.map((s) => s.projectId))
    return PROJECTS.filter((project) => !chosen.has(project.id))
      .map((project) => resolveProject(project))
      .sort((a, b) => b.ridership - a.ridership)
  }, [selections])

  /** Les bornes contre lesquelles les trois lectures se comparent, toutes issues du catalogue. */
  const reference = useMemo(() => {
    const resolved = PROJECTS.map((project) => resolveProject(project))
    return {
      ridership: resolved.reduce((total, item) => total + item.ridership, 0),
      budget: Math.max(
        1,
        assessment.m1.base + assessment.m1.levers + assessment.m2.base + assessment.m2.levers,
      ),
      bestYield: Math.max(...resolved.map((item) => item.ridership / item.cost)),
    }
  }, [assessment])

  const skippedCost = skipped.reduce((total, item) => total + item.cost, 0)
  const skippedRiders = skipped.reduce((total, item) => total + item.ridership, 0)

  const overshoot = Math.abs(Math.min(0, assessment.m1.left) + Math.min(0, assessment.m2.left))
  const empty = selections.length === 0

  const save = useCallback(async () => {
    setSaving(true)
    try {
      await drawShareCard({ assessment, built: built.length, skipped: skipped.length })
    } finally {
      setSaving(false)
    }
  }, [assessment, built.length, skipped.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Bilan du programme"
      className="on-panel fixed inset-0 z-50 overflow-y-auto bg-signal focus:outline-none"
    >
      <div className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8 lg:px-10 lg:py-12">
        <div className="flex items-start justify-between gap-4">
          <h1 className="max-w-[18ch] text-[clamp(1.8rem,4.6vw,3.2rem)] font-bold leading-[0.95] tracking-[-0.035em] text-balance">
            Le réseau que vous laissez en {PHASES.M2.end}
          </h1>
          <SignButton tone="ghost" size="sm" onClick={() => setStage('plan')}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Revenir au plan
          </SignButton>
        </div>

        {empty ? (
          <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-ink/85">
            Vous n’avez encore inscrit aucun ouvrage. Revenez au plan et donnez une phase à au
            moins un projet : le bilan se remplira tout seul.
          </p>
        ) : assessment.balanced ? (
          <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-ink/85">
            Votre programme tient dans les deux enveloppes. Il reste{' '}
            {millions(assessment.m1.left)} millions d’euros sur la première phase et{' '}
            {millions(assessment.m2.left)} sur la seconde.
          </p>
        ) : (
          <div
            className="on-plate mt-6 max-w-[62ch] bg-ink px-4 py-3.5"
            style={{ borderRadius: 'var(--radius-inset)' }}
          >
            <p className="text-[15px] leading-relaxed text-chalk">
              Votre programme dépasse de{' '}
              <span className="font-bold text-alert">{millions(overshoot)} millions d’euros</span>.
              Un mandat ne peut pas engager une dépense qu’il ne finance pas : il faut retirer des
              ouvrages, les étaler sur les deux phases, ou trouver la recette qui manque.
            </p>
          </div>
        )}

        <Ledger assessment={assessment} />

        <div
          className="mt-8 grid gap-px overflow-hidden bg-ink/20 sm:grid-cols-3"
          style={{ borderRadius: 'var(--radius-inset)' }}
        >
          <div className="bg-signal">
            <Reading
              name="Fréquentation gagnée"
              value={`+${riders(assessment.ridership)}`}
              unit="voy./jour"
              amount={assessment.ridership}
              span={reference.ridership}
              spanUnit="voy./jour"
              caption={`Sur les ${riders(reference.ridership)} voyageurs par jour que le catalogue entier permettrait de gagner.`}
            />
          </div>
          <div className="bg-signal">
            <Reading
              name="Argent engagé"
              value={millions(assessment.spend)}
              unit="M€"
              amount={assessment.spend}
              span={reference.budget}
              spanUnit="M€"
              caption={`Sur les ${millions(reference.budget)} millions d’euros que vos deux enveloppes autorisent, leviers compris.`}
            />
          </div>
          <div className="bg-signal">
            <Reading
              name="Rendement"
              value={assessment.spend > 0 ? String(Math.round(assessment.yield)) : '0'}
              unit="voy./M€"
              amount={assessment.spend > 0 ? assessment.yield : 0}
              span={reference.bestYield}
              spanUnit="voy./M€"
              caption={`L’ouvrage le mieux placé du catalogue en rend ${Math.round(reference.bestYield)} à lui seul.`}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-[15px] font-bold">Ce que vous construisez</h2>
            {built.length === 0 ? (
              <p className="mt-2 text-[13px] leading-relaxed text-olive">
                Rien pour l’instant.
              </p>
            ) : (
              <ul
                className="on-plate mt-3 flex flex-col gap-px overflow-hidden bg-ink-rule"
                style={{ borderRadius: 'var(--radius-inset)' }}
              >
                {built.map((row) => (
                  <li key={row.projectId}>
                    <button
                      type="button"
                      onClick={() => {
                        setFocused(row.projectId)
                        setStage('plan')
                      }}
                      className="flex w-full items-center gap-3 bg-ink px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-ink-lift"
                    >
                      <span
                        className={clsx(
                          'w-12 shrink-0 font-mono text-[14px] font-bold lining',
                          row.year > PHASES.M2.end ? 'text-alert' : 'text-signal',
                        )}
                      >
                        {row.year}
                      </span>
                      <ModePicto
                        mode={row.mode}
                        className="h-4 w-4 shrink-0 text-chalk-dim"
                        style={{ ['--picto-hole' as string]: 'var(--color-ink)' }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-chalk">
                        {row.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-[15px] font-bold">Ce que vous laissez de côté</h2>
            <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-olive">
              {skipped.length === 0
                ? 'Rien : vous avez inscrit la totalité du catalogue.'
                : `${skipped.length} ouvrages restent à l’étude. Les financer demanderait ${millions(skippedCost)} millions d’euros de plus et apporterait ${riders(skippedRiders)} voyageurs par jour.`}
            </p>
            {skipped.length > 0 ? (
              <ul
                className="on-plate mt-3 flex max-h-[42vh] flex-col gap-px overflow-y-auto bg-ink-rule"
                style={{ borderRadius: 'var(--radius-inset)' }}
              >
                {skipped.map((item) => (
                  <li key={item.project.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setFocused(item.project.id)
                        setStage('plan')
                      }}
                      className="flex w-full items-center gap-3 bg-ink px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-ink-lift"
                    >
                      <ModePicto
                        mode={item.mode}
                        className="h-4 w-4 shrink-0 text-chalk-dim"
                        style={{ ['--picto-hole' as string]: 'var(--color-ink)' }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-chalk/80">
                        {item.project.name}
                      </span>
                      <span className="shrink-0 text-[12px] font-bold text-chalk-dim lining">
                        {millions(item.cost)} M€
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-ink/20 pt-6">
          <SignButton tone="ink" onClick={() => setStage('plan')}>
            Reprendre l’arbitrage
          </SignButton>
          <SignButton tone="ghost" onClick={save} disabled={saving || empty}>
            <Download className="h-4 w-4" aria-hidden />
            {saving ? 'Préparation…' : 'Télécharger l’image'}
          </SignButton>
          <SignButton tone="ghost" onClick={reset} disabled={empty}>
            <Restart className="h-4 w-4" aria-hidden />
            Tout effacer
          </SignButton>
        </div>
      </div>
    </motion.div>
  )
}
