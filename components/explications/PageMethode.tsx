'use client'

import { clsx } from 'clsx'
import Link from 'next/link'

import { de } from '@/lib/format'
import { communauteActive } from '@/lib/communaute'
import { adresseAccueil, adresseMethode, adresseReseaux, ID_VILLES, MARQUE, VILLES, type IdVille } from '@/lib/villes'

import { useCouleursReseau } from '../couleurs'
import { Icone, Logo, useChoixVisible } from '../ui'
import { EcrireBudget, ExplicationBudget, ExplicationLeviers } from './Budget'
import { EcrireVoyageurs, ExplicationVoyageurs } from './Voyageurs'

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
          <div className="flex items-center justify-between gap-4">
            <Link href={adresseAccueil(id)} className="flex items-center gap-2.5">
              <Logo taille={36} inverse />
              <span className="text-[15px] font-extrabold lg:text-[17px]">{MARQUE}</span>
            </Link>
            <nav aria-label="Pages du réseau" className="flex items-center gap-4">
              {communauteActive ? (
                <Link
                  href={adresseReseaux(id)}
                  className="hidden min-h-10 items-center text-[14px] font-extrabold underline decoration-white/60 decoration-2 underline-offset-4 sm:flex"
                >
                  Réseaux publiés
                </Link>
              ) : null}
              <Link
                href={adresseAccueil(id)}
                className="flex min-h-10 items-center gap-1.5 text-[14px] font-extrabold underline decoration-white/60 decoration-2 underline-offset-4"
              >
                <Icone nom="retour" taille={17} epaisseur={2.4} />
                Accueil
              </Link>
            </nav>
          </div>
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
