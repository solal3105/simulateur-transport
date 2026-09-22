'use client'

import { motion } from 'motion/react'

import { MANDATS } from '@/lib/catalogue'
import { n } from '@/lib/format'
import { bilanMandat, ouvertures } from '@/lib/regles'
import { useJeu } from '@/lib/store'

import { cascade, useCompteur } from '../anim'
import { segmentsBudget, useBilan } from '../partie/budget'
import { Bouton, EtapesMandat, Jauge, Surtitre } from '../ui'

export function FinMandat() {
  const { chantiers, lignes, leviers, commencerMandat2 } = useJeu()
  const bilan1 = useBilan(1)
  const liste = ouvertures(chantiers, lignes)
  const ouverts = liste.filter((o) => o.annee <= MANDATS[1].fin)
  const enChantier = liste.filter((o) => o.annee > MANDATS[1].fin)
  const reportes = [...chantiers, ...lignes].filter((x) => x.mandat === 1 && x.etale)
  // Le second mandat démarre avec les mêmes leviers que le premier.
  const bilan2 = bilanMandat(2, chantiers, lignes, leviers[1])
  const { segments, total } = segmentsBudget(bilan2)
  // L'année défile de 2026 à 2032 : six ans passent.
  const annee = useCompteur(MANDATS[1].fin, 1.6, MANDATS[1].debut)
  const libres = useCompteur(bilan2.reste, 1.4, 0)

  return (
    <main className="min-h-dvh bg-rouge text-white">
      <motion.div
        variants={cascade.parent}
        initial="hidden"
        animate="show"
        className="mx-auto grid min-h-dvh max-w-[1300px] gap-8 px-6 pt-6 pb-8 lg:grid-cols-2 lg:gap-18 lg:px-18 lg:py-12"
      >
        <motion.div variants={cascade.parent} className="flex flex-col gap-5 lg:gap-7">
          <EtapesMandat mandat={1} />
          <div className="chiffres text-[84px] leading-[0.85] font-black tracking-[-0.05em] lg:text-[180px]" aria-label={String(MANDATS[1].fin)}>
            {Math.round(annee)}
          </div>
          <motion.h1 variants={cascade.enfant} className="text-[27px] leading-[1.08] font-black tracking-tight lg:text-[40px]">
            {bilan1.reste > 0
              ? `Votre premier mandat s’achève sans déficit. ${n(bilan1.reste)} M€ n’ont pas été dépensés et sont perdus.`
              : 'Votre premier mandat s’achève sans déficit.'}
          </motion.h1>
          <motion.section variants={cascade.enfant} className="flex flex-col">
            <Surtitre className="text-white/85">Ce qui a ouvert pendant le mandat</Surtitre>
            {ouverts.length === 0 ? (
              <p className="border-b border-white/30 py-3 text-[15px] font-semibold">Rien encore : les chantiers lancés ouvriront plus tard.</p>
            ) : (
              ouverts.map((o) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + ouverts.indexOf(o) * 0.15, type: 'spring', stiffness: 260, damping: 24 }}
                  className="flex items-center gap-4 border-b border-white/30 py-3"
                >
                  <span className="chiffres text-[15px] font-black lg:text-[17px]">{o.annee}</span>
                  <span className="flex-1 text-[15px] font-bold lg:text-[17px]">{o.nom}</span>
                  <span className="chiffres text-[13px] font-extrabold lg:text-[15px]">+{n(o.voyageurs)}</span>
                </motion.div>
              ))
            )}
          </motion.section>
        </motion.div>

        <motion.div variants={cascade.enfant} className="flex flex-col gap-5 lg:gap-6">
          {enChantier.length > 0 ? (
            <section className="flex flex-col gap-2 rounded-[20px] bg-white p-5 text-encre">
              <Surtitre className="text-rouge">Toujours en chantier</Surtitre>
              {enChantier.map((o) => (
                <div key={o.id} className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-black">{o.nom}</span>
                  <span className="chiffres text-sm font-bold text-gris">ouverture en {o.annee}</span>
                </div>
              ))}
            </section>
          ) : null}

          <section className="flex flex-col gap-2.5">
            <Surtitre className="text-white/85">Votre second mandat commence avec</Surtitre>
            <div className="flex items-baseline gap-2">
              <span className="chiffres text-[44px] leading-none font-black tracking-tight lg:text-[56px]">{n(libres)}</span>
              <span className="text-base font-extrabold lg:text-lg">M€ libres</span>
            </div>
            <Jauge segments={segments} total={total} surRouge hauteur={16} label={`${n(bilan2.reste)} millions d’euros libres pour le second mandat.`} />
            <p className="text-[13.5px] leading-relaxed font-medium lg:text-[15px]">
              Sur {n(bilan2.enveloppe + bilan2.leviers)} M€, une fois retirés l’entretien des bus
              {bilan2.reports > 0 ? ` et les ${n(bilan2.reports)} M€ ${reportes.length > 1 ? `des ${reportes.length} projets payés` : 'du projet payé'} en deux fois` : ''}. Vos
              choix de tarifs restent en place, et vous pourrez les revoir.
            </p>
          </section>

          <Bouton genre="blanc" icone="fleche" taille="grand" onClick={commencerMandat2} className="mt-auto w-full lg:w-[360px] lg:self-end">
            Commencer le second mandat
          </Bouton>
        </motion.div>
      </motion.div>
    </main>
  )
}
