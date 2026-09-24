'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'

import { CATALOGUE } from '@/lib/catalogue'
import { FORMULE } from '@/lib/formule'
import { ID_VILLES, VILLES } from '@/lib/villes'

import { Bouton, BoutonRond, Icone, type NomIcone } from '../ui'

const NOMBRE_PROJETS = CATALOGUE.filter((p) => p.trace).length
const noms = ID_VILLES.map((id) => VILLES[id].nom)
const RESEAUX = `${noms.slice(0, -1).join(', ')} et ${noms.at(-1)}`

/** Tout ce que le jeu contient, dit sans détour : chaque phrase décrit une chose qu'on peut vraiment y faire. */
const DECOUVERTES: { icone: NomIcone; titre: string; texte: string }[] = [
  {
    icone: 'carte',
    titre: `${noms.length} réseaux à redessiner`,
    texte: `${RESEAUX} : chacun sur son vrai territoire, avec son vrai budget et ses couleurs.`,
  },
  {
    icone: 'trace',
    titre: 'Vos propres lignes, arrêt par arrêt',
    texte:
      'Posez vos arrêts où vous voulez, en tram, en bus rapide, en métro ou en téléphérique. La carte vous montre où les gens vivent et travaillent.',
  },
  {
    icone: 'voyageurs',
    titre: 'Des voyageurs calculés, pas inventés',
    texte: `Chaque ligne est estimée avec une formule vérifiée sur ${FORMULE.lignes} lignes réelles de ${FORMULE.villes} villes françaises, avec sa marge d’erreur.`,
  },
  {
    icone: 'liste',
    titre: 'Les grands projets lyonnais sur la table',
    texte: `À Lyon, ${NOMBRE_PROJETS} projets réels vous attendent, du métro E au tramway express de l’ouest, certains en plusieurs versions.`,
  },
  {
    icone: 'pieces',
    titre: 'Douze ans, deux mandats, un budget réel',
    texte:
      'De 2026 à 2038, vous décidez en deux temps. Payez un chantier en une fois ou en deux, gardez de l’argent pour la suite : le budget vient des comptes de chaque réseau.',
  },
  {
    icone: 'loi',
    titre: 'L’argent qui manque, c’est vous qui le trouvez',
    texte:
      'Augmentez les tarifs, offrez la gratuité aux jeunes, faites rouler le métro toute la nuit, ou voyez ce que changerait une loi sur la TVA.',
  },
  {
    icone: 'drapeau',
    titre: 'Le jeu libre, sans limite de budget',
    texte: 'Dessinez le réseau dont vous rêvez, puis découvrez ce qu’il coûterait face au budget réel.',
  },
  {
    icone: 'horloge',
    titre: '2038 en accéléré',
    texte: 'À la fin, regardez vos lignes ouvrir une à une, année après année, et le compteur de voyageurs grimper.',
  },
  {
    icone: 'partager',
    titre: 'Publiez, comparez, reprenez',
    texte: 'Publiez votre réseau, soutenez ceux des autres, repartez de l’un d’eux ou comparez deux réseaux côte à côte.',
  },
]

/**
 * Le dévoilement du jeu, ouvert depuis l'accueil : tout ce qu'une partie permet, pour donner envie de la
 * commencer. Il se ferme avec Échap, le bouton rond ou le bouton pour commencer.
 */
export function Devoilement({
  ouvert,
  acces,
  fermer,
  commencer,
}: {
  ouvert: boolean
  acces: boolean
  fermer: () => void
  commencer: () => void
}) {
  useEffect(() => {
    if (!ouvert) return
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && fermer()
    window.addEventListener('keydown', touche)
    const defilement = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', touche)
      document.body.style.overflow = defilement
    }
  }, [ouvert, fermer])

  return (
    <AnimatePresence>
      {ouvert ? (
        <motion.div
          key="devoilement"
          role="dialog"
          aria-modal="true"
          aria-labelledby="devoilement-titre"
          className="fixed inset-0 z-50 flex items-end justify-center bg-encre/50 lg:items-center lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={fermer}
        >
          <motion.div
            className="flex max-h-[92dvh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-[28px] bg-white text-encre lg:rounded-[28px]"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 bg-rouge px-6 pt-6 pb-5 text-white lg:px-9 lg:pt-8">
              <div className="flex flex-col gap-1.5">
                <h2 id="devoilement-titre" className="text-[28px] leading-[1.02] font-black tracking-[-0.03em] lg:text-[38px]">
                  Ce que vous pourrez faire
                </h2>
                <p className="text-[15px] leading-snug font-semibold opacity-90">
                  Le jeu est en accès anticipé. Voici tout ce qu’il contient déjà.
                </p>
              </div>
              <BoutonRond label="Fermer" icone="fermer" onClick={fermer} className="bg-white/15 text-white hover:bg-white/25" />
            </div>
            <ol className="grid gap-x-8 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2 lg:px-9 lg:py-8">
              {DECOUVERTES.map((d, i) => (
                <motion.li
                  key={d.titre}
                  className="flex gap-3.5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rouge-pale text-rouge">
                    <Icone nom={d.icone} taille={22} epaisseur={2.2} />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[16.5px] leading-tight font-black">{d.titre}</span>
                    <span className="text-[14.5px] leading-snug text-gris">{d.texte}</span>
                  </span>
                </motion.li>
              ))}
            </ol>
            <div className="flex flex-col items-stretch gap-2 border-t border-trait px-6 py-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:flex-row lg:items-center lg:px-9">
              <Bouton genre="rouge" icone="fleche" taille="grand" onClick={commencer} className="lg:w-[300px]">
                Commencer la partie
              </Bouton>
              {acces ? null : (
                <p className="text-center text-[13px] leading-snug text-gris lg:text-left">
                  Il vous faudra le mot de passe de l’accès anticipé.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
