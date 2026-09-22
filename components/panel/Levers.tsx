'use client'

import { clsx } from 'clsx'
import { coversPhase } from '@/lib/budget'
import { CURRENT_FARES, FARE_YIELD, FLEET_PROGRAMMES, TOGGLE_LEVERS } from '@/lib/projects'
import { fare, millions, percent, signedMillions } from '@/lib/format'
import { useStudy } from '@/lib/store'
import type { LeverState, Phase } from '@/lib/types'
import { Gavel } from '@/components/icons'
import { PhaseSwitch } from './PhaseSwitch'
import { SignSlider } from './parts'

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <h3 className="text-[13px] font-bold leading-tight">{title}</h3>
      {note ? (
        <p className="mt-1 text-[11.5px] leading-snug text-chalk-dim">{note}</p>
      ) : null}
      <div className="mt-2.5 flex flex-col gap-px overflow-hidden bg-ink-rule" style={{ borderRadius: 'var(--radius-plate)' }}>
        {children}
      </div>
    </section>
  )
}

function PhaseRow({
  name,
  detail,
  effect,
  value,
  onChange,
  muted,
  law,
}: {
  name: string
  detail: string
  effect: string
  value: Phase | null
  onChange: (phase: Phase | null) => void
  muted?: boolean
  law?: boolean
}) {
  return (
    <div className={clsx('bg-ink px-3 py-2.5', muted && 'opacity-45')}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[12.5px] font-bold leading-tight">
            {law ? <Gavel className="h-3.5 w-3.5 shrink-0 text-signal" aria-hidden /> : null}
            <span className="min-w-0">{name}</span>
          </p>
          <p className="mt-1 text-[11.5px] leading-snug text-chalk-dim">{detail}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={clsx(
              'text-[12px] font-bold lining',
              effect.startsWith('+') ? 'text-signal' : 'text-alert',
            )}
          >
            {effect}
          </span>
          <PhaseSwitch value={value} onChange={onChange} size="sm" />
        </div>
      </div>
    </div>
  )
}

function FareRow({
  name,
  detail,
  value,
  onChange,
  currentPrice,
  perPoint,
  id,
  muted,
  law,
}: {
  name: string
  detail: string
  value: number
  onChange: (next: number) => void
  currentPrice?: number
  perPoint: number
  id: string
  muted?: boolean
  law?: boolean
}) {
  return (
    <div className={clsx('bg-ink px-3 py-2.5', muted && 'opacity-45')}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="flex items-center gap-1.5 text-[12.5px] font-bold leading-tight">
          {law ? <Gavel className="h-3.5 w-3.5 shrink-0 text-signal" aria-hidden /> : null}
          {name}
        </label>
        <span
          className={clsx(
            'shrink-0 text-[12px] font-bold lining',
            value * perPoint > 0 ? 'text-signal' : value === 0 ? 'text-chalk-dim' : 'text-alert',
          )}
        >
          {signedMillions(value * perPoint)} M€
        </span>
      </div>

      <div className="mt-1.5">
        <SignSlider
          id={id}
          label={name}
          value={value}
          min={law ? -25 : -20}
          max={50}
          step={law ? 5 : 1}
          onChange={onChange}
        />
      </div>

      <p className="mt-1 text-[11.5px] leading-snug text-chalk-dim lining">
        {percent(value)}
        {currentPrice !== undefined
          ? ` · ${fare(currentPrice * (1 + value / 100))} € au lieu de ${fare(currentPrice)} €`
          : ` · ${detail}`}
      </p>
    </div>
  )
}

export function Levers() {
  const levers = useStudy((s) => s.levers)
  const setLever = useStudy((s) => s.setLever)
  const set = <K extends keyof LeverState>(key: K) => (value: LeverState[K]) => setLever(key, value)

  const freeTravel = levers.gratuiteTotale !== null

  return (
    <div className="grid min-h-0 gap-5 overflow-y-auto overscroll-contain p-3 sm:grid-cols-2 2xl:grid-cols-4">
      <Block
        title="Le parc de bus"
        note="Ces deux programmes ne construisent aucune ligne. Sans eux, l’offre de bus se dégrade toute seule."
      >
        {FLEET_PROGRAMMES.map((programme) => (
          <PhaseRow
            key={programme.id}
            name={programme.name}
            detail={programme.description}
            effect={`−${millions(programme.cost)} M€`}
            value={levers[programme.id]}
            onChange={set(programme.id)}
          />
        ))}
      </Block>

      <Block
        title="Les tarifs"
        note="Chaque point de hausse rapporte à chaque phase, et se paie sur le budget des voyageurs."
      >
        <FareRow
          id="tarif-abonnements"
          name="Prix des abonnements"
          detail="par phase"
          value={levers.tarifAbonnements}
          onChange={set('tarifAbonnements')}
          currentPrice={CURRENT_FARES.abonnement}
          perPoint={FARE_YIELD.abonnements}
          muted={freeTravel}
        />
        <FareRow
          id="tarif-tickets"
          name="Prix des tickets"
          detail="par phase"
          value={levers.tarifTickets}
          onChange={set('tarifTickets')}
          currentPrice={CURRENT_FARES.ticket}
          perPoint={FARE_YIELD.tickets}
          muted={freeTravel}
        />
        {freeTravel ? (
          <p className="bg-ink px-3 py-2 text-[11.5px] leading-snug text-alert">
            La gratuité totale supprime toute recette tarifaire : ces deux curseurs ne rapportent
            plus rien.
          </p>
        ) : null}
      </Block>

      <Block
        title="La gratuité et le service"
        note="Des mesures que la Métropole peut décider seule, et qui se paient sur la même enveloppe que les lignes."
      >
        {TOGGLE_LEVERS.filter((lever) => !lever.requiresLaw).map((lever) => (
          <PhaseRow
            key={lever.id}
            name={lever.name}
            detail={lever.detail}
            effect={`${signedMillions(lever.perPhase)} M€`}
            value={levers[lever.id]}
            onChange={set(lever.id)}
            muted={
              lever.voidedByFreeTravel &&
              (coversPhase(levers.gratuiteTotale, 'M1') || coversPhase(levers.gratuiteTotale, 'M2'))
            }
          />
        ))}
      </Block>

      <Block
        title="Ce qui demande une loi"
        note="Ces deux leviers ne relèvent pas de la Métropole. Les inscrire, c’est parier sur un vote au Parlement."
      >
        <FareRow
          id="versement-mobilite"
          name="Taux du versement mobilité"
          detail="contribution des employeurs"
          value={levers.versementMobilite}
          onChange={set('versementMobilite')}
          perPoint={FARE_YIELD.versementMobilite}
          law
        />
        {TOGGLE_LEVERS.filter((lever) => lever.requiresLaw).map((lever) => (
          <PhaseRow
            key={lever.id}
            name={lever.name}
            detail={lever.detail}
            effect={`${signedMillions(lever.perPhase)} M€`}
            value={levers[lever.id]}
            onChange={set(lever.id)}
            law
          />
        ))}
      </Block>
    </div>
  )
}
