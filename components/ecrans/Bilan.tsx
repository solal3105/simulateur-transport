'use client'

import { motion } from 'motion/react'
import { useMemo, useState } from 'react'

import { CATALOGUE, MANDATS, PROJETS } from '@/lib/catalogue'
import { n } from '@/lib/format'
import { bilanMandat, ouvertures, resoudre, score, totauxCatalogue } from '@/lib/regles'
import { dessinerPartage } from '@/lib/partage'
import { useJeu } from '@/lib/store'

import { useCompteur, useDefilement } from '../anim'
import { Carte } from '../carte/Carte'
import { Bouton, Icone, Logo, Surtitre } from '../ui'

const AVEC_TRACE = CATALOGUE.filter((p) => p.trace)
const TOTAL = totauxCatalogue(AVEC_TRACE)
const MARGES_GRAND = { top: 40, left: 40, right: 40, bottom: 40 }

export function Bilan() {
  const { chantiers, lignes, leviers, rejouer } = useJeu()
  const [envoi, setEnvoi] = useState<string | null>(null)

  const resultat = useMemo(() => {
    const b1 = bilanMandat(1, chantiers, lignes, leviers[1])
    const b2 = bilanMandat(2, chantiers, lignes, leviers[2])
    const investi = chantiers.reduce((t, c) => t + resoudre(PROJETS.get(c.id)!, c).cout, 0) + lignes.reduce((t, l) => t + l.estimation.cout, 0)
    const faits = new Set(chantiers.map((c) => c.id))
    const laisses = AVEC_TRACE.filter((p) => !faits.has(p.id))
    const plusGros = laisses.reduce<(typeof laisses)[number] | null>((m, p) => (!m || resoudre(p).cout > resoudre(m).cout ? p : m), null)
    return {
      voyageurs: score(chantiers, lignes),
      equilibre: b1.reste >= 0 && b2.reste >= 0,
      deficit: Math.min(0, b1.reste) + Math.min(0, b2.reste),
      investi,
      retenus: chantiers.filter((c) => PROJETS.get(c.id)?.trace).length + lignes.length,
      laisses,
      coutLaisse: laisses.reduce((t, p) => t + resoudre(p).cout, 0),
      plusGros,
      ouvertures: ouvertures(chantiers, lignes),
    }
  }, [chantiers, lignes, leviers])

  const partager = async (format: 'story' | 'paysage') => {
    setEnvoi('Préparation de l’image')
    const traces = new Set(chantiers.map((c) => PROJETS.get(c.id)?.trace).filter(Boolean) as string[])
    const blob = await dessinerPartage(
      {
        voyageurs: resultat.voyageurs,
        retenus: resultat.retenus,
        total: AVEC_TRACE.length,
        equilibre: resultat.equilibre,
        traces,
        lignes: lignes.map((l) => l.arrets),
        adresse: window.location.host,
      },
      format,
    )
    const fichier = new File([blob], `mon-reseau-tcl-2038-${format}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [fichier] })) {
      try {
        await navigator.share({ files: [fichier], title: 'Mon réseau TCL en 2038' })
        setEnvoi(null)
        return
      } catch {
        // Partage annulé : on propose le téléchargement.
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fichier.name
    a.click()
    URL.revokeObjectURL(url)
    setEnvoi('Image téléchargée')
  }

  // Le réseau se construit sous les yeux du joueur, de 2026 à la dernière ouverture.
  const derniere = Math.max(MANDATS[2].fin, ...resultat.ouvertures.map((o) => o.annee))
  const { annee, termine, relancer } = useDefilement(MANDATS[1].debut, derniere, Math.min(6, (derniere - MANDATS[1].debut) * 0.3))
  // Le score monte au rythme des ouvertures.
  const cumul = termine ? resultat.voyageurs : resultat.ouvertures.filter((o) => o.annee <= annee).reduce((t, o) => t + o.voyageurs, 0)
  const voyageursAnimes = useCompteur(cumul, 0.6, 0)

  const partCatalogue = TOTAL.voyageurs > 0 ? Math.round((resultat.voyageurs / TOTAL.voyageurs) * 100) : 0
  const partCout = TOTAL.cout > 0 ? Math.round((resultat.investi / TOTAL.cout) * 100) : 0

  return (
    <main className="min-h-dvh bg-white lg:fixed lg:inset-0">
      <div className="relative h-[300px] lg:absolute lg:inset-y-0 lg:right-[620px] lg:left-0 lg:h-auto">
        <Carte marges={MARGES_GRAND} decor anneeMax={annee} />
        <div className="absolute top-4 left-4 flex items-center gap-2.5 lg:top-7 lg:left-7">
          <Logo taille={40} />
          <span className="hidden text-[17px] font-black lg:inline">Simulateur TCL</span>
        </div>
        <div className="absolute right-4 bottom-10 flex flex-col items-end gap-2 lg:right-auto lg:bottom-8 lg:left-8 lg:items-start">
          <div className="rounded-2xl bg-white/90 px-4 py-2.5 shadow-flotte backdrop-blur">
            <div className="text-xs font-extrabold tracking-[0.08em] text-muet uppercase">{termine ? 'Votre réseau' : 'Le réseau se construit'}</div>
            <div className="chiffres text-[34px] leading-none font-black tracking-tight lg:text-[52px]" aria-live="off">
              {annee}
            </div>
          </div>
          {termine ? (
            <button
              type="button"
              onClick={relancer}
              className="flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-extrabold shadow-flotte"
            >
              <Icone nom="rejouer" taille={16} />
              Revoir la construction
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative -mt-6 flex flex-col gap-5 rounded-t-[26px] bg-white px-5 pt-6 pb-8 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[620px] lg:gap-6 lg:overflow-y-auto lg:rounded-l-[32px] lg:rounded-tr-none lg:px-12 lg:py-10 lg:shadow-[-8px_0_30px_rgb(0_0_0/0.08)]">
        <span
          className={`flex items-center gap-2 self-start rounded-full px-3.5 py-1.5 text-[13.5px] font-extrabold ${resultat.equilibre ? 'bg-rouge text-white' : 'bg-encre text-white'}`}
        >
          <Icone nom={resultat.equilibre ? 'valider' : 'info'} taille={16} epaisseur={2.8} />
          {resultat.equilibre ? 'Budget tenu sur les deux mandats' : `Déficit de ${n(-resultat.deficit)} M€`}
        </span>

        <div className="flex flex-col gap-2">
          <h1 className="text-[15px] font-semibold text-gris lg:text-base">Votre réseau en 2038 transporte chaque jour</h1>
          <div className="flex items-baseline gap-2.5">
            <span className="chiffres text-[50px] leading-none font-black tracking-[-0.04em] text-rouge lg:text-[72px]">
              +{n(voyageursAnimes)}
            </span>
            <span className="text-base font-extrabold lg:text-xl">voyageurs</span>
          </div>
          <p className="text-[14.5px] leading-relaxed text-gris lg:text-[15px]">
            C’est {partCatalogue} % de ce que le catalogue entier apporterait, pour {partCout} % de son coût.
            {resultat.ouvertures.some((o) => o.annee > MANDATS[2].fin)
              ? ' Certains de ces voyageurs n’arriveront qu’après 2038, quand les derniers chantiers seront terminés.'
              : ''}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            [`${resultat.retenus} sur ${AVEC_TRACE.length}`, 'projets retenus'],
            [n(resultat.investi), 'M€ investis'],
            [resultat.equilibre ? '0' : n(-resultat.deficit), resultat.equilibre ? '€ de déficit' : 'M€ de déficit'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-sable p-3.5">
              <div className="chiffres text-xl font-black lg:text-2xl">{v}</div>
              <div className="mt-1 text-[12.5px] text-gris">{l}</div>
            </div>
          ))}
        </div>

        {resultat.ouvertures.length > 0 ? (
          <section className="flex flex-col gap-2.5">
            <Surtitre>Vos ouvertures</Surtitre>
            <ol className="flex flex-col gap-2.5">
              {resultat.ouvertures.map((o) => {
                const tard = o.annee > MANDATS[2].fin
                const ouverte = o.annee <= annee
                return (
                  <motion.li
                    key={o.id}
                    animate={{ opacity: ouverte ? 1 : 0.35, x: ouverte ? 0 : 6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    className="flex items-start gap-3 text-[14.5px]"
                  >
                    <span className={`chiffres w-10 shrink-0 font-black ${tard ? 'text-muet' : ''}`}>{o.annee}</span>
                    <span
                      aria-hidden="true"
                      className={`mt-1 size-3 shrink-0 rounded-full shadow-[inset_0_0_0_2.5px_var(--color-rouge)] ${tard ? 'bg-white' : 'bg-rouge'}`}
                    />
                    <span className="flex-1 font-bold">{o.nom}</span>
                    <span className="chiffres font-extrabold whitespace-nowrap text-rouge">+{n(o.voyageurs)}</span>
                  </motion.li>
                )
              })}
            </ol>
          </section>
        ) : null}

        {resultat.plusGros ? (
          <p className="rounded-2xl bg-sable px-4 py-3.5 text-[14.5px] leading-relaxed text-gris">
            Vous laissez {resultat.laisses.length} projets à l’étude, pour {n(resultat.coutLaisse)} M€. Le plus cher est {resultat.plusGros.nom}, à{' '}
            {n(resoudre(resultat.plusGros).cout)} M€.
          </p>
        ) : null}

        <div className="flex flex-col gap-2 lg:mt-auto">
          <div className="grid gap-2 sm:grid-cols-2">
            <Bouton genre="rouge" icone="partager" onClick={() => partager('story')}>
              Partager mon réseau
            </Bouton>
            <Bouton genre="contour" icone="telecharger" onClick={() => partager('paysage')}>
              Image au format paysage
            </Bouton>
          </div>
          <p aria-live="polite" className="min-h-5 text-center text-[13px] font-semibold text-gris">
            {envoi ?? ''}
          </p>
          <Bouton genre="contour" icone="rejouer" onClick={rejouer}>
            Rejouer une partie
          </Bouton>
        </div>
      </div>
    </main>
  )
}
