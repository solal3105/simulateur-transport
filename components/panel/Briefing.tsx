'use client'

import { motion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { resolveProject } from '@/lib/budget'
import { millions } from '@/lib/format'
import { FLEET_PROGRAMMES, PHASE_BUDGET, PROJECTS, PROJECT_NUMBER } from '@/lib/projects'
import { useStudy } from '@/lib/store'
import { ArrowRight, ModePicto, TramPicto } from '@/components/icons'
import { SignButton } from './parts'

export function Briefing() {
  const setStage = useStudy((s) => s.setStage)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panel.current?.focus({ preventScroll: true })
  }, [])

  const catalogue = useMemo(() => {
    const works = PROJECTS.map((project) => ({
      project,
      figures: resolveProject(project),
    }))
    const worksTotal = works.reduce((total, row) => total + row.figures.cost, 0)
    const fleet = FLEET_PROGRAMMES.reduce((total, programme) => total + programme.cost, 0)
    return { works, total: worksTotal + fleet }
  }, [])

  return (
    <motion.div
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Règle du jeu"
      className="on-panel fixed inset-0 z-40 overflow-y-auto bg-signal focus:outline-none"
    >
      <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-8 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:px-12 lg:py-12">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center bg-ink text-signal"
              style={{ borderRadius: 'var(--radius-plate)' }}
            >
              <TramPicto className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-[15px] font-bold">Simulateur Transport TCL</span>
          </div>

          <h1 className="mt-10 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-balance lg:mt-14">
            Vous avez deux mandats pour bâtir le réseau, et pas assez d’argent pour tout faire.
          </h1>

          <div className="mt-8 max-w-[62ch] space-y-4 text-[15px] leading-relaxed text-ink/85">
            <p>
              La Métropole de Lyon peut engager de l’ordre de {millions(PHASE_BUDGET)} millions
              d’euros dans ses transports par mandat de six ans. En face, {PROJECTS.length} ouvrages
              attendent : des métros, des tramways, des bus à haut niveau de service, un téléphérique
              et une navette fluviale. Les financer tous coûterait {millions(catalogue.total)}{' '}
              millions d’euros, soit plus de quatre fois vos deux enveloppes.
            </p>
            <p>
              Inscrivez chaque ouvrage sur la première phase, sur la seconde, ou étalez-le sur les
              deux pour en partager le coût. Les leviers de financement changent la taille de
              l’enveloppe : la gratuité la vide, une hausse de tarif la remplit, et deux d’entre eux
              demandent une loi que la Métropole ne vote pas elle-même.
            </p>
            <p>
              Les coûts, les gains de fréquentation et les durées de chantier viennent de documents
              publics. Ce sont des estimations, pas des devis signés.
            </p>
          </div>

          <div className="mt-10">
            <SignButton size="lg" onClick={() => setStage('plan')} tone="ink">
              Ouvrir le plan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </SignButton>
            <p className="mt-4 max-w-[62ch] text-[12.5px] leading-relaxed text-olive">
              Votre programme reste dans ce navigateur. Il n’est enregistré sur aucun serveur et
              vous pouvez le vider à tout moment.
            </p>
          </div>
        </div>

        {/* Le catalogue lui-même : l'ampleur du problème se voit avant d'être expliquée. */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-2">
            <h2 className="sign-label">Le catalogue</h2>
            <span className="font-mono text-[11px] font-bold lining">
              {millions(catalogue.total)} M€
            </span>
          </div>

          <ul className="mt-1">
            {catalogue.works.map(({ project, figures }) => (
              <li
                key={project.id}
                className="flex items-center gap-2.5 border-b border-ink/15 py-1.5"
              >
                <span
                  className="w-5 shrink-0 text-right font-mono text-[10px] font-bold text-olive lining"
                  aria-hidden
                >
                  {PROJECT_NUMBER.get(project.id)}
                </span>
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center bg-ink text-signal"
                  style={{
                    borderRadius: 'var(--radius-plate)',
                    ['--picto-hole' as string]: 'var(--color-ink)',
                  }}
                >
                  <ModePicto mode={figures.mode} className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{project.name}</span>
                <span className="shrink-0 text-[12.5px] font-bold lining">
                  {millions(figures.cost)}
                </span>
              </li>
            ))}
            {FLEET_PROGRAMMES.map((programme) => (
              <li
                key={programme.id}
                className="flex items-center gap-2.5 border-b border-ink/15 py-1.5"
              >
                <span className="w-5 shrink-0" aria-hidden />
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center bg-ink text-signal"
                  style={{
                    borderRadius: 'var(--radius-plate)',
                    ['--picto-hole' as string]: 'var(--color-ink)',
                  }}
                >
                  <ModePicto mode="bus" className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold">
                  {programme.name}
                </span>
                <span className="shrink-0 text-[12.5px] font-bold lining">
                  {millions(programme.cost)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[12px] leading-relaxed text-olive">
            Montants en millions d’euros. Les ouvrages à variantes sont comptés dans leur version la
            moins chère.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
