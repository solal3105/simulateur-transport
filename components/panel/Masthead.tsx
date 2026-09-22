'use client'

import { clsx } from 'clsx'
import { millions, signedMillions } from '@/lib/format'
import { PHASES } from '@/lib/projects'
import { useStudy } from '@/lib/store'
import type { Assessment, PhaseBalance } from '@/lib/types'
import { ArrowRight, Restart, TramPicto } from '@/components/icons'
import { ScaleRule, SignButton } from './parts'

function Envelope({
  name,
  span,
  balance,
  scale,
}: {
  name: string
  span: string
  balance: PhaseBalance
  scale: number
}) {
  const over = balance.left < 0
  const ceiling = balance.base + balance.levers

  return (
    <div
      className={clsx(
        'min-w-0 flex-1 px-2.5 py-2 sm:px-4 sm:py-3',
        over && 'on-plate bg-ink text-chalk',
      )}
      style={over ? { borderRadius: 'var(--radius-inset)' } : undefined}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className={clsx('sign-label', over ? 'text-alert' : 'text-ink')}>{name}</span>
        <span
          className={clsx(
            'shrink-0 text-[11px] font-bold lining sm:text-[12px]',
            over ? 'text-chalk-dim' : 'text-olive',
          )}
        >
          {span}
        </span>
      </div>

      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span
          className={clsx(
            'wide lining truncate font-bold leading-[0.84] tracking-[-0.035em]',
            'text-[clamp(1.9rem,6.4vw,4.4rem)]',
            over && 'text-alert',
          )}
        >
          {millions(balance.left)}
        </span>
        <span className={clsx('shrink-0 text-xs font-bold sm:text-sm', over && 'text-alert')}>
          M€
        </span>
      </div>

      <div className="mt-2">
        <ScaleRule ceiling={ceiling} spent={balance.spend} span={scale} tone={over ? 'plate' : 'panel'} />
      </div>

      <p
        className={clsx(
          'mt-1.5 text-[11.5px] leading-relaxed lining',
          over ? 'text-alert' : 'text-olive',
        )}
      >
        <span className="font-bold">{over ? 'de trop' : 'à placer'}</span>
        <span className="hidden sm:inline">
          {' '}
          · {millions(balance.base)} d’enveloppe,{' '}
          {balance.levers === 0 ? 'aucun levier' : `${signedMillions(balance.levers)} de leviers`},{' '}
          {millions(balance.spend)} engagés
        </span>
      </p>
    </div>
  )
}

export function Masthead({ assessment }: { assessment: Assessment }) {
  const setStage = useStudy((s) => s.setStage)
  const reset = useStudy((s) => s.reset)
  const count = useStudy((s) => s.selections.length)

  // Les deux enveloppes se lisent contre la même graduation, sinon on ne peut
  // plus les comparer d'un coup d'œil.
  const scale = Math.max(
    2000,
    assessment.m1.base + assessment.m1.levers,
    assessment.m2.base + assessment.m2.levers,
    assessment.m1.spend,
    assessment.m2.spend,
  )

  return (
    <header className="shrink-0">
      <div className="flex items-stretch gap-2 lg:gap-4">
        <div className="hidden shrink-0 items-center gap-3 pl-1 pr-2 lg:flex">
          <span
            className="flex h-11 w-11 items-center justify-center bg-ink text-signal"
            style={{ borderRadius: 'var(--radius-plate)' }}
          >
            <TramPicto className="h-6 w-6" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-[-0.01em]">Simulateur TCL</span>
            <span className="block text-[11px] text-olive lining">
              2026 → 2038 · {count} inscrit{count > 1 ? 's' : ''}
            </span>
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-stretch">
          <Envelope
            name={PHASES.M1.label}
            span={`${PHASES.M1.start}–${PHASES.M1.end}`}
            balance={assessment.m1}
            scale={scale}
          />
          <span className="my-2 w-px shrink-0 bg-ink/20" aria-hidden />
          <Envelope
            name={PHASES.M2.label}
            span={`${PHASES.M2.start}–${PHASES.M2.end}`}
            balance={assessment.m2}
            scale={scale}
          />
        </div>

        <div className="hidden shrink-0 flex-col justify-center gap-1.5 pr-1 lg:flex">
          <SignButton onClick={() => setStage('bilan')} tone="ink">
            Voir le bilan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </SignButton>
          <SignButton
            tone="ghost"
            size="sm"
            onClick={reset}
            disabled={count === 0}
            title="Vider le programme et repartir de zéro"
          >
            <Restart className="h-3.5 w-3.5" aria-hidden />
            Tout effacer
          </SignButton>
        </div>
      </div>
    </header>
  )
}
