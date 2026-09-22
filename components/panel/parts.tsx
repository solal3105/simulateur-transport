'use client'

import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { millions } from '@/lib/format'

/** Plaque encastrée : le noir du système, jamais une carte flottante. */
export function Plate({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'aside' | 'header' | 'nav'
}) {
  return (
    <Tag
      className={clsx('on-plate bg-ink text-chalk', className)}
      style={{ borderRadius: 'var(--radius-inset)' }}
    >
      {children}
    </Tag>
  )
}

type SignButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'ink' | 'signal' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function SignButton({
  tone = 'ink',
  size = 'md',
  className,
  children,
  ...props
}: SignButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40',
        size === 'sm' && 'h-8 px-3 text-[12px]',
        size === 'md' && 'h-11 px-4 text-[14px]',
        size === 'lg' && 'h-14 px-6 text-[16px]',
        tone === 'ink' && 'bg-ink text-signal hover:bg-ink-lift',
        tone === 'signal' && 'bg-signal text-ink hover:bg-signal-lift',
        tone === 'ghost' &&
          'border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-signal',
        className,
      )}
      style={{ borderRadius: 'var(--radius-plate)' }}
    >
      {children}
    </button>
  )
}

/**
 * La réglette graduée. Chaque montant du panneau se lit contre une échelle
 * visible, jamais en chiffre flottant : la graduation est le repère.
 */
/** Une graduation lisible quel que soit l'ordre de grandeur : cinq crans environ. */
function niceStep(span: number) {
  const raw = span / 5
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))))
  const normalised = raw / magnitude
  const factor = normalised >= 5 ? 5 : normalised >= 2 ? 2 : 1
  return factor * magnitude
}

export function ScaleRule({
  ceiling,
  spent,
  span: imposed,
  unit = 'M€',
  tone = 'panel',
}: {
  ceiling: number
  spent: number
  /** Graduation imposée, pour que deux réglettes restent comparables. */
  span?: number
  unit?: string
  tone?: 'panel' | 'plate'
}) {
  const span = Math.max(imposed ?? 0, ceiling, spent, 1)
  const step = niceStep(span)
  const ticks: number[] = []
  for (let value = step; value < span && ticks.length < 12; value += step) ticks.push(value)

  const overflow = Math.max(0, spent - ceiling)
  const onPanel = tone === 'panel'

  return (
    <div className="w-full">
      <div
        className={clsx(
          'relative h-2.5 w-full',
          onPanel ? 'bg-ink/12' : 'bg-chalk/12',
        )}
      >
        <div
          className={clsx('absolute inset-y-0 left-0', onPanel ? 'bg-ink' : 'bg-signal')}
          style={{ width: `${(Math.min(spent, ceiling) / span) * 100}%` }}
        />
        {overflow > 0 ? (
          <div
            className="hatched absolute inset-y-0"
            style={{
              left: `${(Math.max(ceiling, 0) / span) * 100}%`,
              width: `${(overflow / span) * 100}%`,
            }}
          />
        ) : null}

        {/* Le plafond de l'enveloppe, une fois les leviers appliqués. */}
        {ceiling > 0 && ceiling < span ? (
          <div
            className={clsx('absolute -top-1 bottom-[-4px] w-0.5', onPanel ? 'bg-ink' : 'bg-chalk')}
            style={{ left: `${(ceiling / span) * 100}%` }}
          />
        ) : null}

        {ticks.map((tick) => (
          <div
            key={tick}
            className={clsx(
              'absolute top-0 h-1.5 w-px',
              onPanel ? 'bg-ink/35' : 'bg-chalk/30',
            )}
            style={{ left: `${(tick / span) * 100}%` }}
          />
        ))}
      </div>

      <div
        className={clsx(
          'mt-1 flex justify-between font-mono text-[9px] lining',
          onPanel ? 'text-olive' : 'text-chalk-dim',
        )}
      >
        <span>0</span>
        <span>
          {millions(span)} {unit}
        </span>
      </div>
    </div>
  )
}

/** Curseur de panneau : rail droit, poignée carrée, valeur en chiffres alignés. */
export function SignSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  id,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (next: number) => void
  label: string
  id: string
}) {
  const ratio = (value - min) / (max - min)
  const zero = (0 - min) / (max - min)

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-[9px] h-1.5 bg-chalk/12" />
      <div
        className="pointer-events-none absolute top-[9px] h-1.5 bg-signal"
        style={{
          left: `${Math.min(ratio, zero) * 100}%`,
          width: `${Math.abs(ratio - zero) * 100}%`,
        }}
      />
      {min < 0 ? (
        <div
          className="pointer-events-none absolute top-[5px] h-[14px] w-px bg-chalk-dim"
          style={{ left: `${zero * 100}%` }}
        />
      ) : null}
      <input
        id={id}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="relative h-6 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-[1px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-chalk [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slider-thumb]:mt-[2px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-[1px] [&::-webkit-slider-thumb]:bg-chalk [&:focus-visible::-webkit-slider-thumb]:bg-signal [&:focus-visible::-moz-range-thumb]:bg-signal"
      />
    </div>
  )
}
