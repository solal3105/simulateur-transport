'use client'

import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import { assess } from '@/lib/budget'
import { millions } from '@/lib/format'
import { useStudy, type Deck } from '@/lib/store'
import { ArrowRight, ChevronDown, Cross } from '@/components/icons'
import { Bilan } from '@/components/panel/Bilan'
import { Board } from '@/components/panel/Board'
import { Briefing } from '@/components/panel/Briefing'
import { Levers } from '@/components/panel/Levers'
import { Masthead } from '@/components/panel/Masthead'
import { Nomenclature } from '@/components/panel/Nomenclature'
import { Plate } from '@/components/panel/parts'
import { NetworkPlan } from '@/components/plan/NetworkPlan'

const DECKS: { id: Deck; label: string; short: string }[] = [
  { id: 'ouvrages', label: 'Ouvrages', short: 'Ouvrages' },
  { id: 'leviers', label: 'Financement', short: 'Financement' },
  { id: 'mises-en-service', label: 'Mises en service', short: 'Calendrier' },
]

function DeckBody({ deck }: { deck: Deck }) {
  if (deck === 'ouvrages') return <Nomenclature className="h-full" />
  if (deck === 'leviers') return <Levers />
  return <Board />
}

function TabBand({
  decks,
  value,
  onSelect,
  trailing,
}: {
  decks: { id: Deck; label: string; short: string }[]
  value: Deck
  onSelect: (deck: Deck) => void
  trailing?: React.ReactNode
}) {
  return (
    <div className="flex h-10 shrink-0 items-stretch border-b border-ink-rule" role="tablist">
      {decks.map((deck) => (
        <button
          key={deck.id}
          type="button"
          role="tab"
          aria-selected={value === deck.id}
          onClick={() => onSelect(deck.id)}
          className={clsx(
            'px-3.5 text-[12px] font-bold transition-colors duration-150',
            value === deck.id ? 'bg-signal text-ink' : 'text-chalk-dim hover:text-chalk',
          )}
        >
          {deck.label}
        </button>
      ))}
      {trailing ? <div className="ml-auto flex items-center pr-1.5">{trailing}</div> : null}
    </div>
  )
}

export default function Page() {
  const stage = useStudy((s) => s.stage)
  const deck = useStudy((s) => s.deck)
  const setDeck = useStudy((s) => s.setDeck)
  const setStage = useStudy((s) => s.setStage)
  const selections = useStudy((s) => s.selections)
  const levers = useStudy((s) => s.levers)

  const [mounted, setMounted] = useState(false)
  const [deskOpen, setDeskOpen] = useState(true)
  const [sheet, setSheet] = useState<Deck | null>(null)

  useEffect(() => setMounted(true), [])

  const assessment = useMemo(() => assess(selections, levers), [selections, levers])
  const missing = Math.abs(
    Math.min(0, assessment.m1.left) + Math.min(0, assessment.m2.left),
  )

  useEffect(() => {
    if (!sheet) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheet(null)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [sheet])

  const covered = stage !== 'plan' || sheet !== null

  return (
    <main className="on-panel h-dvh overflow-hidden bg-signal">
      <div
        className="flex h-full flex-col gap-[var(--panel-gutter)] p-[var(--panel-gutter)]"
        inert={covered ? true : undefined}
      >
        <Masthead assessment={assessment} />

        <AnimatePresence initial={false}>
          {!assessment.balanced ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0 overflow-hidden"
              role="status"
            >
              <div
                className="flex items-stretch overflow-hidden bg-ink"
                style={{ borderRadius: 'var(--radius-inset)' }}
              >
                <span className="hatched w-8 shrink-0 sm:w-16" aria-hidden />
                <p className="flex-1 px-3 py-1.5 text-center text-[12.5px] font-bold leading-snug text-alert">
                  Ce programme n’est pas finançable : il manque {millions(missing)} millions d’euros
                  pour le boucler.
                </p>
                <span className="hatched w-8 shrink-0 sm:w-16" aria-hidden />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex min-h-0 flex-1 gap-[var(--panel-gutter)]">
          <Plate className="hidden w-[358px] shrink-0 flex-col lg:flex xl:w-[398px]">
            <Nomenclature className="h-full" />
          </Plate>

          <div className="flex min-h-0 flex-1 flex-col gap-[var(--panel-gutter)]">
            <div className="min-h-0 flex-1">
              <NetworkPlan />
            </div>

            <Plate className="hidden shrink-0 flex-col overflow-hidden lg:flex">
              <TabBand
                decks={DECKS.slice(1)}
                value={deck === 'ouvrages' ? 'leviers' : deck}
                onSelect={(next) => {
                  setDeck(next)
                  setDeskOpen(true)
                }}
                trailing={
                  <button
                    type="button"
                    onClick={() => setDeskOpen((open) => !open)}
                    aria-expanded={deskOpen}
                    className="flex h-7 items-center gap-1.5 px-2 text-[11px] font-bold text-chalk-dim transition-colors duration-150 hover:text-chalk"
                  >
                    {deskOpen ? 'Replier' : 'Déplier'}
                    <ChevronDown
                      className={clsx('h-3 w-3 transition-transform duration-200', !deskOpen && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                }
              />
              <motion.div
                animate={{ height: deskOpen ? 240 : 0 }}
                initial={false}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-0 overflow-hidden"
              >
                <div className="h-[240px]">
                  <DeckBody deck={deck === 'ouvrages' ? 'leviers' : deck} />
                </div>
              </motion.div>
            </Plate>
          </div>
        </div>

        {/* Sous 1024 px, le plan garde l'écran et les tiroirs remontent par-dessus. */}
        <nav className="flex shrink-0 items-stretch gap-1.5 lg:hidden">
          {DECKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setDeck(item.id)
                setSheet(item.id)
              }}
              className="flex h-11 flex-1 items-center justify-center bg-ink px-2 text-[12px] font-bold text-signal transition-colors duration-150 hover:bg-ink-lift"
              style={{ borderRadius: 'var(--radius-plate)' }}
            >
              {item.short}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStage('bilan')}
            aria-label="Voir le bilan"
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-ink text-signal transition-colors duration-150 hover:bg-ink-lift"
            style={{ borderRadius: 'var(--radius-plate)' }}
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </nav>

      </div>

      <AnimatePresence>
        {sheet ? (
          <>
            <motion.button
              type="button"
              aria-label="Fermer le tiroir"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet(null)}
              className="fixed inset-0 z-30 bg-ink/70 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="on-plate fixed inset-x-[var(--panel-gutter)] bottom-[var(--panel-gutter)] z-30 flex max-h-[76dvh] flex-col overflow-hidden bg-ink text-chalk lg:hidden"
              style={{ borderRadius: 'var(--radius-inset)' }}
              role="dialog"
              aria-modal="true"
            >
              <TabBand
                decks={DECKS}
                value={sheet}
                onSelect={(next) => {
                  setDeck(next)
                  setSheet(next)
                }}
                trailing={
                  <button
                    type="button"
                    onClick={() => setSheet(null)}
                    aria-label="Fermer"
                    className="flex h-7 w-7 items-center justify-center text-chalk-dim transition-colors duration-150 hover:text-chalk"
                  >
                    <Cross className="h-3.5 w-3.5" aria-hidden />
                  </button>
                }
              />
              <div className="min-h-0 flex-1">
                <DeckBody deck={sheet} />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mounted && stage === 'briefing' ? <Briefing key="briefing" /> : null}
      </AnimatePresence>

      <AnimatePresence>
        {mounted && stage === 'bilan' ? (
          <Bilan key="bilan" assessment={assessment} />
        ) : null}
      </AnimatePresence>

    </main>
  )
}
