'use client'

import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { deliveries } from '@/lib/budget'
import { PHASES, PROJECT_NUMBER } from '@/lib/projects'
import { useStudy } from '@/lib/store'
import { ModePicto } from '@/components/icons'

const PHASE_GLYPH = { M1: '1', M2: '2', M1M2: '1·2' } as const

/**
 * L'année posée dans sa cellule à palette : le chiffre bascule autour de la
 * charnière au moment où l'ouvrage entre au programme, comme un afficheur de quai.
 */
function Flap({ year, late }: { year: number; late: boolean }) {
  return (
    <span className="relative flex h-8 w-[60px] shrink-0 items-center justify-center overflow-hidden bg-plate">
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-ink" aria-hidden />
      <motion.span
        key={year}
        initial={{ rotateX: -90 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'center center' }}
        className={clsx(
          'relative font-mono text-[15px] font-bold leading-none lining',
          late ? 'text-alert' : 'text-signal',
        )}
      >
        {year}
      </motion.span>
    </span>
  )
}

/**
 * Le tableau des mises en service, tenu comme l'afficheur d'un quai :
 * une année, un ouvrage, une phase. Il dit quand ce qu'on vote ouvrira vraiment.
 */
export function Board() {
  const selections = useStudy((s) => s.selections)
  const setFocused = useStudy((s) => s.setFocused)
  const setHovered = useStudy((s) => s.setHovered)

  const rows = useMemo(() => deliveries(selections), [selections])
  const last = rows.length > 0 ? rows[rows.length - 1].year : null

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 bg-signal px-3 py-1.5 text-ink">
        <span className="sign-label">Mises en service</span>
        <span className="font-mono text-[10px] font-bold lining">
          {rows.length > 0 && last
            ? `${rows.length} ouvrage${rows.length > 1 ? 's' : ''} · dernier en ${last}`
            : 'aucune'}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-[13px] leading-relaxed text-chalk-dim">
          Rien n’ouvre encore. Inscrivez un ouvrage au programme et son année d’ouverture
          s’affichera ici, chantier compris.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-ink-lift">
          <AnimatePresence initial={false}>
            {rows.map((row) => {
              const late = row.year > PHASES.M2.end
              return (
                <motion.li
                  key={row.projectId}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setFocused(row.projectId)}
                    onMouseEnter={() => setHovered(row.projectId)}
                    onMouseLeave={() => setHovered(null)}
                    className="mb-px flex w-full items-center gap-3 bg-ink px-2 py-1.5 text-left transition-colors duration-150 hover:bg-ink-lift"
                  >
                    <Flap year={row.year} late={late} />
                    <span
                      className="w-4 shrink-0 text-right font-mono text-[10px] font-bold text-chalk-dim lining"
                      aria-hidden
                    >
                      {PROJECT_NUMBER.get(row.projectId)}
                    </span>
                    <ModePicto
                      mode={row.mode}
                      className="h-4 w-4 shrink-0 text-chalk-dim"
                      style={{ ['--picto-hole' as string]: 'var(--color-ink)' }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-chalk">
                      {row.name}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-chalk-dim lining">
                      phase {PHASE_GLYPH[row.phase]}
                    </span>
                  </button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}

      {rows.some((row) => row.year > PHASES.M2.end) ? (
        <p className="shrink-0 border-t border-ink-rule px-3 py-2 text-[11.5px] leading-snug text-alert">
          Les années en orange tombent après {PHASES.M2.end} : le chantier est financé sur vos deux
          mandats, mais il ouvrira sous les suivants.
        </p>
      ) : null}
    </div>
  )
}
