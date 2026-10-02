'use client'

import { clsx } from 'clsx'
import Link from 'next/link'

import { de } from '@/lib/format'
import { adresseAccueil, adresseMethode, ID_VILLES, VILLES, type IdVille } from '@/lib/villes'

import { useCouleursReseau } from '../couleurs'
import { Icone, useChoixVisible } from '../ui'
import { EcrireBudget, ExplicationBudget, ExplicationLeviers } from './Budget'
import { EcrireVoyageurs, ExplicationVoyageurs } from './Voyageurs'
import { BarreSite } from '../BarreSite'

/**
 * La page qui explique, sans commencer de partie, comment nous calculons le budget d'un réseau, ce que
 * rapportent ses leviers et combien de voyageurs attire une ligne. Une page par réseau, dans ses couleurs.
 */
export function PageMethode({ ville: id }: { ville: IdVille }) {
  const ville = VILLES[id]
  useCouleursReseau(id)
  const rangee = useChoixVisible<HTMLElement>(id)
  const sections = [
    { id: 'budget', titre: 'Le budget' },
    ...(ville.budget.leviers ? [{ id: 'leviers', titre: 'Trouver de l’argent' }] : []),
    { id: 'voyageurs', titre: 'Les voyageurs' },
  ]
  return (
    <main className="min-h-dvh bg-white">
      <header className="bg-rouge text-white">
        <div className="mx-auto flex max-w-[880px] flex-col gap-6 px-5 pt-5 pb-9 lg:gap-8 lg:px-8 lg:pt-8 lg:pb-12">
          <BarreSite ville={id} page="methode" />
          <h1 className="max-w-[720px] text-[38px] leading-[0.97] font-black tracking-[-0.03em] text-balance lg:text-[60px] lg:leading-[0.95]">
            Comment nous calculons le budget et les voyageurs
          </h1>
          <nav
            ref={rangee}
            aria-label="Réseau"
            className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0"
          >
            {ID_VILLES.map((autre) => (
              <Link
                key={autre}
                href={adresseMethode(autre)}
                aria-current={autre === id ? 'page' : undefined}
                className={clsx(
                  'flex shrink-0 flex-col items-start rounded-2xl px-3.5 py-2 transition-colors',
                  autre === id ? 'bg-white text-rouge' : 'shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.6)] hover:bg-white/10',
                )}
              >
                <span className="text-[14px] leading-tight font-extrabold whitespace-nowrap">{VILLES[autre].nom}</span>
                <span
                  className={clsx('text-[11.5px] leading-tight font-semibold whitespace-nowrap', autre === id ? 'text-gris' : 'opacity-85')}
                >
                  {VILLES[autre].lieu}
                </span>
              </Link>
            ))}
          </nav>
          <nav aria-label="Sur cette page" className="flex flex-wrap gap-x-5 gap-y-1 text-[14.5px] font-extrabold">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="flex min-h-10 items-center underline decoration-white/50 underline-offset-4">
                {s.titre}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-[880px] flex-col gap-14 px-5 pt-10 pb-16 lg:px-8 lg:pt-14">
        <section id="budget" aria-labelledby="titre-budget" className="flex scroll-mt-6 flex-col gap-5">
          <h2 id="titre-budget" className="text-[28px] leading-tight font-black tracking-[-0.02em] lg:text-[36px]">
            Le budget {de(ville.nom)}
          </h2>
          <ExplicationBudget ville={ville} />
          <p className="text-[16px] leading-relaxed lg:text-[17px]">
            Nous comptons une inflation de 2 % par an, l’objectif de la Banque centrale européenne. Les montants du premier mandat sont ceux
            d’aujourd’hui. À chaque mandat suivant, ils montent d’environ 12,6 % : le coût des projets et des lignes que vous lancez, votre
            budget, ce que rapportent les tarifs et l’argent que vous n’avez pas dépensé.
            {ville.budget.leviers
              ? ' Dans « Trouver de l’argent », une case fait suivre l’inflation au ticket et à l’abonnement, sans rien rapporter de plus. Décochée, vous fixez vous-même leur prix par rapport à 2026 : au-dessus de l’inflation, ils rapportent davantage ; en dessous, moins.'
              : ''}
          </p>
          {ville.budget.leviers ? null : <EcrireBudget ville={ville} />}
        </section>

        {ville.budget.leviers ? (
          <section id="leviers" aria-labelledby="titre-leviers" className="flex scroll-mt-6 flex-col gap-5">
            <h2 id="titre-leviers" className="text-[28px] leading-tight font-black tracking-[-0.02em] lg:text-[36px]">
              Trouver de l’argent
            </h2>
            <ExplicationLeviers ville={ville} />
            <EcrireBudget ville={ville} />
          </section>
        ) : null}

        <section id="voyageurs" aria-labelledby="titre-voyageurs" className="flex scroll-mt-6 flex-col gap-5">
          <h2 id="titre-voyageurs" className="text-[28px] leading-tight font-black tracking-[-0.02em] lg:text-[36px]">
            Les voyageurs d’une ligne
          </h2>
          <ExplicationVoyageurs ville={ville} />
          <EcrireVoyageurs ville={ville} />
        </section>

        <div className="flex flex-col items-start gap-3 border-t border-trait pt-8">
          <p className="text-[15px] leading-relaxed text-gris">Ce sont les calculs que le jeu applique à chacune de vos lignes.</p>
          <Link
            href={adresseAccueil(id)}
            className="flex min-h-14 items-center gap-2.5 rounded-full bg-rouge px-6 text-base font-extrabold text-white hover:bg-rouge-fonce"
          >
            Jouer {ville.ou}
            <Icone nom="fleche" taille={19} epaisseur={2.3} />
          </Link>
          <p className="pt-4 text-[13px] leading-relaxed text-gris">
            La carte vient d’OpenStreetMap et de Wikidata, les habitants et les emplois de l’INSEE. Les coûts et les voyageurs sont des
            estimations, pas des devis signés. Projet citoyen, sous licence CC BY-NC 4.0.
          </p>
        </div>
      </div>
    </main>
  )
}
