'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { CATALOGUE } from '@/lib/catalogue'
import { communauteActive } from '@/lib/communaute'
import { n } from '@/lib/format'
import { totauxCatalogue } from '@/lib/regles'
import { useJeu } from '@/lib/store'
import { adresseAccueil, adresseReseaux, ID_VILLES, MARQUE, VILLES, type IdVille, type Ville } from '@/lib/villes'

import { cascade } from '../anim'
import { Carte } from '../carte/Carte'
import { Bouton, Icone, Logo } from '../ui'

const TOTAL = totauxCatalogue(CATALOGUE.filter((p) => p.trace))
const NOMBRE_PROJETS = CATALOGUE.filter((p) => p.trace).length
const MARGES = { top: 20, left: 20, right: 20, bottom: 20 }
/** La carte de l'accueil montre le réseau d'aujourd'hui, jamais celui de la partie enregistrée. */
const RESEAU_ACTUEL = { chantiers: [], lignes: [] }

/** 4 000 M€ donne « 4 », 3 120 M€ donne « 3,1 ». */
const milliards = (v: number) => (Math.round(v / 100) / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 })

/** Ce que l'accueil dit de chaque ville. */
function textes(ville: Ville) {
  const budget = milliards(ville.enveloppe * 2)
  if (ville.catalogue)
    return {
      titre: `Construisez le réseau ${ville.reseau} de 2038.`,
      intro: `Vous dirigez les transports ${ville.territoire} pendant deux mandats, avec ${budget} milliards d’euros. Les ${NOMBRE_PROJETS} projets sur la table en coûtent plus de ${Math.floor(TOTAL.cout / 1000)}. Vous choisissez ceux qui verront le jour.`,
      pastilles: [`${NOMBRE_PROJETS} projets réels`, `${n(TOTAL.cout)} M€ au total`],
      etapes: [
        'Vous choisissez des lignes sur la carte.',
        'Vous finissez chaque mandat sans déficit.',
        'Votre score est le nombre de voyageurs gagnés.',
      ],
      sources:
        'Les coûts, les voyageurs et les durées de chantier viennent d’études et de délibérations publiques ; ce sont des estimations, pas des devis signés. La carte utilise OpenStreetMap, et le traceur de ligne les données de population et d’emploi de l’INSEE. Projet citoyen, sous licence CC BY-NC 4.0.',
    }
  return {
    titre: `Construisez le réseau ${ville.reseau} de 2038.`,
    intro: `Vous dirigez les transports ${ville.territoire} pendant deux mandats, avec ${budget} milliards d’euros. Il n’y a pas encore de catalogue de projets à ${ville.nom} : vous tracez vos propres lignes de tram, de bus ou de métro, et nous calculons leur prix et leurs voyageurs.`,
    pastilles: ['Tracé libre', `${n(ville.enveloppe * 2)} M€ sur deux mandats`],
    etapes: [
      'Vous tracez vos lignes sur la carte.',
      'Vous finissez chaque mandat sans déficit.',
      'Votre score est le nombre de voyageurs gagnés.',
    ],
    sources: `Le budget est celui du jeu à Lyon, rapporté au nombre d’habitants. Les prix au kilomètre viennent de chantiers lyonnais récents, et les voyageurs d’une formule recalée sur les lignes de ${ville.reseau} ; ce sont des estimations, pas des devis signés. La carte utilise OpenStreetMap et Wikidata, et le traceur les données de population et d’emploi de l’INSEE. Projet citoyen, sous licence CC BY-NC 4.0.`,
  }
}

function Etapes({ etapes }: { etapes: string[] }) {
  return (
    <motion.ol variants={cascade.parent} className="flex flex-col gap-2.5 lg:gap-3">
      {etapes.map((e, i) => (
        <motion.li
          variants={cascade.enfant}
          key={e}
          className="flex items-center gap-3 text-[15px] leading-snug font-semibold lg:text-[17px]"
        >
          <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-white text-[13px] font-black text-rouge lg:size-7.5">
            {i + 1}
          </span>
          {e}
        </motion.li>
      ))}
    </motion.ol>
  )
}

/** Le choix de la ville : il change l'accueil et l'adresse de la page, sans rien toucher à une partie. */
function ChoixVille({ ville, choisir }: { ville: IdVille; choisir: (v: IdVille) => void }) {
  return (
    <div role="radiogroup" aria-label="Ville" className="flex gap-1.5">
      {ID_VILLES.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={ville === id}
          onClick={() => choisir(id)}
          className={clsx(
            'min-h-10 rounded-full px-4 text-[14px] font-extrabold transition-colors',
            ville === id ? 'bg-white text-rouge' : 'shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.6)] hover:bg-white/10',
          )}
        >
          {VILLES[id].nom}
        </button>
      ))}
    </div>
  )
}

/** La partie enregistrée dans ce navigateur, finie ou non, quand l'accueil s'affiche par-dessus. */
export interface PartieEnregistree {
  ville: IdVille
  /** La partie est finie : on revoit son bilan au lieu de la reprendre. */
  terminee: boolean
  /** Son réseau est publié : il reste en ligne même si une nouvelle partie le remplace ici. */
  publiee: boolean
  reprendre: () => void
}

/**
 * L'accueil d'une ville. Avec `partieEnCours`, il propose de retrouver la partie enregistrée ou d'en
 * commencer une autre, ici ou dans une autre ville, après avoir dit ce qui sera effacé.
 */
export function Accueil({ villeInitiale = 'lyon', partieEnCours }: { villeInitiale?: IdVille; partieEnCours?: PartieEnregistree }) {
  const commencer = useJeu((s) => s.commencer)
  const [choix, setChoix] = useState<IdVille>(villeInitiale)
  // La ville proposée peut arriver après la lecture de la partie enregistrée : elle remplace alors le choix.
  const [initiale, setInitiale] = useState(villeInitiale)
  if (initiale !== villeInitiale) {
    setInitiale(villeInitiale)
    setChoix(villeInitiale)
  }
  const ville = VILLES[choix]
  const t = textes(ville)
  // Une nouvelle partie remplace celle qui est enregistrée : on le dit avant, pour la ville affichée.
  const [confirmerPour, setConfirmerPour] = useState<IdVille | null>(null)
  const confirmer = confirmerPour === choix
  const enregistree = partieEnCours ?? null
  const ici = enregistree?.ville === choix
  const villeEnregistree = enregistree ? VILLES[enregistree.ville].nom : ''

  // L'adresse et le titre de l'onglet suivent la ville affichée. Le routeur remet le titre de la page
  // d'origine après un changement d'adresse : le titre est corrigé juste après.
  useEffect(() => {
    const titre = VILLES[choix].titrePage
    const adresse = adresseAccueil(choix)
    if (window.location.pathname === adresse) {
      document.title = titre
      return
    }
    window.history.replaceState(null, '', adresse)
    const t = window.setTimeout(() => (document.title = titre), 50)
    return () => window.clearTimeout(t)
  }, [choix])

  return (
    <main className="min-h-dvh bg-rouge text-white lg:fixed lg:inset-0 lg:bg-sable">
      <motion.div
        variants={cascade.parent}
        initial="hidden"
        animate="show"
        className="flex min-h-dvh flex-col gap-5 px-6 pt-5 pb-7 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[640px] lg:gap-7 lg:overflow-y-auto lg:rounded-r-[36px] lg:bg-rouge lg:px-14 lg:pt-10 lg:pb-12"
      >
        <motion.div variants={cascade.enfant} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo taille={38} inverse />
            <span className="text-[15px] font-extrabold lg:text-[17px]">{MARQUE}</span>
          </div>
          {/* Sur ordinateur, les sources restent affichées en bas à droite : le lien ne sert que sur téléphone. */}
          <a href="#sources" className="text-[13px] font-bold underline underline-offset-3 lg:hidden">
            D’où viennent les chiffres
          </a>
        </motion.div>

        <motion.div variants={cascade.enfant} className="flex flex-col gap-3 lg:mt-2 lg:gap-5">
          <ChoixVille ville={choix} choisir={setChoix} />
          <h1 className="text-[44px] leading-[0.95] font-black tracking-[-0.035em] text-balance lg:text-[72px] lg:leading-[0.93]">
            {t.titre}
          </h1>
          <p className="max-w-[500px] text-base leading-relaxed font-medium lg:text-[19px]">{t.intro}</p>
        </motion.div>

        {/* Une seule carte : une vignette sur téléphone, le fond de l'écran sur ordinateur. */}
        <div
          aria-hidden="true"
          className="relative h-[230px] shrink-0 overflow-hidden rounded-[20px] bg-sable lg:fixed lg:inset-y-0 lg:right-0 lg:left-[640px] lg:h-auto lg:rounded-none"
        >
          <Carte key={choix} marges={MARGES} decor ville={choix} partie={RESEAU_ACTUEL} />
          <div className="absolute top-2.5 left-2.5 flex gap-1.5 lg:hidden">
            <span className="rounded-full bg-encre px-2.5 py-1 text-xs font-extrabold text-white">{t.pastilles[0]}</span>
            <span className="chiffres rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-encre shadow-[inset_0_0_0_1.5px_var(--color-encre)]">
              {t.pastilles[1]}
            </span>
          </div>
        </div>

        <Etapes key={choix} etapes={t.etapes} />

        <motion.div variants={cascade.enfant} className="mt-auto flex flex-col gap-3">
          {confirmer && enregistree ? (
            <div role="group" aria-labelledby="remplacer-partie" className="flex flex-col gap-3 rounded-2xl bg-white/12 p-4">
              <p id="remplacer-partie" className="text-[15px] leading-relaxed font-semibold">
                {!enregistree.terminee
                  ? `Votre partie en cours à ${villeEnregistree} sera effacée.`
                  : enregistree.publiee
                    ? `Votre réseau de ${villeEnregistree} sera effacé de ce navigateur. Il reste dans les réseaux publiés.`
                    : `Votre réseau de ${villeEnregistree} sera effacé de ce navigateur. Pour le garder, revoyez-le d’abord et publiez-le ou copiez son lien.`}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Bouton genre="blanc" onClick={() => commencer(choix)}>
                  Effacer et commencer
                </Bouton>
                <Bouton genre="contourBlanc" onClick={() => setConfirmerPour(null)}>
                  {enregistree.terminee ? 'Garder mon réseau' : 'Garder ma partie'}
                </Bouton>
              </div>
            </div>
          ) : enregistree ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
              {/* Dans la ville de la partie enregistrée, on la retrouve d'abord ; ailleurs, on commence d'abord. */}
              {ici ? (
                <>
                  <Bouton genre="blanc" icone="fleche" taille="grand" onClick={enregistree.reprendre} className="w-full lg:w-[250px]">
                    {enregistree.terminee ? 'Revoir mon réseau' : 'Reprendre ma partie'}
                  </Bouton>
                  <Bouton genre="contourBlanc" taille="grand" onClick={() => setConfirmerPour(choix)} className="whitespace-nowrap">
                    Nouvelle partie à {ville.nom}
                  </Bouton>
                </>
              ) : (
                <>
                  <Bouton
                    genre="blanc"
                    icone="fleche"
                    taille="grand"
                    onClick={() => setConfirmerPour(choix)}
                    className="w-full lg:w-[250px]"
                  >
                    Commencer à {ville.nom}
                  </Bouton>
                  <Bouton genre="contourBlanc" taille="grand" onClick={enregistree.reprendre} className="whitespace-nowrap">
                    {enregistree.terminee ? `Revoir mon réseau de ${villeEnregistree}` : `Reprendre ma partie à ${villeEnregistree}`}
                  </Bouton>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
              <Bouton genre="blanc" icone="fleche" taille="grand" onClick={() => commencer(choix)} className="w-full lg:w-[250px]">
                Commencer la partie
              </Bouton>
              {communauteActive ? (
                <Link
                  href={adresseReseaux(choix)}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-full px-4 text-[15px] font-extrabold whitespace-nowrap shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.6)] transition-colors hover:bg-white/10"
                >
                  <Icone nom="voyageurs" taille={19} />
                  Voir les réseaux publiés
                </Link>
              ) : null}
            </div>
          )}
          {enregistree ? (
            communauteActive && !confirmer ? (
              <Link
                href={adresseReseaux(choix)}
                className="self-center text-[14px] font-extrabold underline underline-offset-3 lg:self-start"
              >
                Voir les réseaux publiés
              </Link>
            ) : null
          ) : (
            <p className="text-center text-[13px] leading-snug font-semibold opacity-90 lg:text-left lg:text-sm">
              Sans compte. Votre partie reste dans ce navigateur.
            </p>
          )}
        </motion.div>

        <section
          id="sources"
          className="flex flex-col gap-2 border-t border-white/30 pt-5 text-[13px] leading-relaxed opacity-95 lg:hidden"
        >
          <p>{t.sources}</p>
        </section>
      </motion.div>
      <section className="sr-only lg:not-sr-only lg:absolute lg:right-6 lg:bottom-6 lg:w-[420px] lg:rounded-2xl lg:bg-white lg:p-4 lg:text-[12.5px] lg:leading-relaxed lg:text-gris lg:shadow-flotte">
        <p>{t.sources}</p>
      </section>
    </main>
  )
}
