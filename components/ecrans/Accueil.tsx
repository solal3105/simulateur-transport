'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { enveloppe, libre, nomReserve } from '@/lib/budget'
import { CATALOGUE } from '@/lib/catalogue'
import { communauteActive } from '@/lib/communaute'
import { enLettres, n } from '@/lib/format'
import { FORMULE } from '@/lib/formule'
import { totauxCatalogue } from '@/lib/regles'
import { useJeu } from '@/lib/store'
import { adresseAccueil, adresseMethode, adresseReseaux, ID_VILLES, MARQUE, VILLES, type IdVille, type Ville } from '@/lib/villes'

import { cascade } from '../anim'
import { Carte } from '../carte/Carte'
import { useCouleursReseau } from '../couleurs'
import { Bouton, Icone, Logo, useChoixVisible } from '../ui'

const TOTAL = totauxCatalogue(CATALOGUE.filter((p) => p.trace))
const NOMBRE_PROJETS = CATALOGUE.filter((p) => p.trace).length
const MARGES = { top: 20, left: 20, right: 20, bottom: 20 }
/** La carte de l'accueil montre le réseau d'aujourd'hui, jamais celui de la partie enregistrée. */
const RESEAU_ACTUEL = { chantiers: [], lignes: [] }

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Ce que l'accueil dit de chaque réseau. */
function textes(ville: Ville) {
  const b = ville.budget
  const budget = enLettres(enveloppe(b, 1) + enveloppe(b, 2))
  const pourLignes = libre(b, 1) + libre(b, 2)
  if (ville.catalogue)
    return {
      titre: `Construisez le réseau ${ville.reseau} de 2038.`,
      intro: `Vous dirigez les transports ${ville.territoire} pendant deux mandats, avec ${budget} d’euros. Les ${NOMBRE_PROJETS} projets sur la table en coûtent plus de ${Math.floor(TOTAL.cout / 1000)}. Vous choisissez ceux qui verront le jour.`,
      pastilles: [`${NOMBRE_PROJETS} projets réels`, `${n(TOTAL.cout)} M€ au total`],
      etapes: [
        'Vous choisissez des lignes sur la carte.',
        'Vous finissez chaque mandat sans déficit.',
        'Votre score est le nombre de voyageurs gagnés.',
      ],
      pourLignes,
      sources:
        'Les coûts, les voyageurs et les durées de chantier viennent d’études et de délibérations publiques ; ce sont des estimations, pas des devis signés. La carte utilise OpenStreetMap, et le traceur de ligne les données de population et d’emploi de l’INSEE. Projet citoyen, sous licence CC BY-NC 4.0.',
    }
  return {
    titre: `Construisez le réseau ${ville.reseau} de 2038.`,
    intro: `Vous dirigez les transports ${ville.territoire} pendant deux mandats. ${majuscule(nomReserve(b).payes)}, il vous reste ${enLettres(pourLignes)} d’euros pour de nouvelles lignes. Vous tracez vos lignes de tram, de bus ou de métro, et nous calculons leur prix et leurs voyageurs.`,
    pastilles: ['Tracé libre', `${n(pourLignes)} M€ pour vos lignes`],
    etapes: [
      'Vous tracez vos lignes sur la carte.',
      'Vous finissez chaque mandat sans déficit.',
      'Votre score est le nombre de voyageurs gagnés.',
    ],
    pourLignes,
    sources: `Les prix au kilomètre viennent de chantiers lyonnais récents, et les voyageurs d’une formule calée sur plus d’une centaine de lignes de ${FORMULE.villes} villes françaises ; ce sont des estimations, pas des devis signés. La carte utilise OpenStreetMap et Wikidata, et le traceur les données de population et d’emploi de l’INSEE. Projet citoyen, sous licence CC BY-NC 4.0.`,
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

/**
 * Le choix du réseau : il change l'accueil, ses couleurs et l'adresse de la page, sans rien toucher à une
 * partie. Sur téléphone, les réseaux défilent sur une seule rangée.
 */
function ChoixVille({ ville, choisir }: { ville: IdVille; choisir: (v: IdVille) => void }) {
  const rangee = useChoixVisible<HTMLDivElement>(ville)
  return (
    <div
      ref={rangee}
      role="radiogroup"
      aria-label="Réseau"
      className="-mx-6 flex snap-x gap-1.5 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
    >
      {ID_VILLES.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={ville === id}
          onClick={() => choisir(id)}
          className={clsx(
            'flex shrink-0 snap-start flex-col items-start rounded-2xl px-3.5 py-2 text-left transition-colors',
            ville === id ? 'bg-white text-rouge' : 'shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.6)] hover:bg-white/10',
          )}
        >
          <span className="text-[14px] leading-tight font-extrabold whitespace-nowrap">{VILLES[id].nom}</span>
          <span className={clsx('text-[11.5px] leading-tight font-semibold whitespace-nowrap', ville === id ? 'text-gris' : 'opacity-85')}>
            {VILLES[id].lieu}
          </span>
        </button>
      ))}
    </div>
  )
}

/** Les deux façons de jouer, proposées quand on commence une partie. */
function ChoixMode({ pourLignes, choisir, annuler }: { pourLignes: number; choisir: (libre: boolean) => void; annuler: () => void }) {
  const carte =
    'flex w-full flex-col items-start gap-1.5 rounded-2xl p-4 text-left transition-transform active:scale-[0.99] lg:min-h-[150px]'
  return (
    <div role="group" aria-labelledby="choix-mode" className="flex flex-col gap-3">
      <p id="choix-mode" className="text-[15px] font-extrabold">
        Comment voulez-vous jouer ?
      </p>
      <div className="grid gap-2.5 lg:grid-cols-2">
        <button type="button" onClick={() => choisir(false)} className={clsx(carte, 'bg-white text-encre hover:bg-white/95')}>
          <span className="flex w-full items-center justify-between gap-2 text-[17px] font-black text-rouge">
            Jouer avec le vrai budget
            <Icone nom="fleche" taille={19} epaisseur={2.4} />
          </span>
          <span className="text-[14px] leading-snug text-gris">
            Deux mandats de six ans, {enLettres(pourLignes)} d’euros pour vos lignes, et pas de déficit à la fin de chaque mandat.
          </span>
        </button>
        <button
          type="button"
          onClick={() => choisir(true)}
          className={clsx(carte, 'shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.75)] hover:bg-white/10')}
        >
          <span className="flex w-full items-center justify-between gap-2 text-[17px] font-black">
            Jouer sans limite de budget
            <Icone nom="fleche" taille={19} epaisseur={2.4} />
          </span>
          <span className="text-[14px] leading-snug opacity-90">
            Tracez le réseau dont vous rêvez. Nous calculons son coût et ses voyageurs, et le comparons au budget réel. Il sera marqué « jeu
            libre » si vous le publiez.
          </span>
        </button>
      </div>
      <button
        type="button"
        onClick={annuler}
        className="min-h-10 self-center text-[14px] font-extrabold underline underline-offset-3 lg:self-start"
      >
        Revenir
      </button>
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
  useCouleursReseau(choix)
  // Commencer propose d'abord les deux modes ; une nouvelle partie remplace celle qui est enregistrée :
  // on le dit ensuite, avant d'effacer quoi que ce soit.
  const [etape, setEtape] = useState<{ ville: IdVille; libre?: boolean } | null>(null)
  const choixMode = etape?.ville === choix && etape.libre === undefined
  const confirmer = etape?.ville === choix && etape.libre !== undefined
  const enregistree = partieEnCours ?? null
  const ici = enregistree?.ville === choix
  const reseauEnregistre = enregistree ? VILLES[enregistree.ville] : null
  const choisirMode = (libre: boolean) => (enregistree ? setEtape({ ville: choix, libre }) : commencer(choix, libre))

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
        <motion.div variants={cascade.enfant} className="flex items-center gap-2.5">
          <Logo taille={38} inverse />
          <span className="text-[15px] font-extrabold lg:text-[17px]">{MARQUE}</span>
        </motion.div>

        <motion.div variants={cascade.enfant} className="flex flex-col gap-3 lg:mt-2 lg:gap-5">
          <ChoixVille ville={choix} choisir={setChoix} />
          {/* Un titre long, comme celui d'Aix-Marseille-Provence, s'écrit plus petit pour tenir en quelques lignes. */}
          <h1
            className={clsx(
              'leading-[0.95] font-black tracking-[-0.035em] text-balance lg:leading-[0.93]',
              t.titre.length > 50 ? 'text-[36px] lg:text-[54px]' : 'text-[44px] lg:text-[72px]',
            )}
          >
            {t.titre}
          </h1>
          <p className="max-w-[500px] text-base leading-relaxed font-medium lg:text-[19px]">{t.intro}</p>
          <Link
            href={adresseMethode(choix)}
            className="flex min-h-10 items-center gap-2 self-start text-[14.5px] font-extrabold underline decoration-white/60 decoration-2 underline-offset-4 hover:decoration-white lg:text-[15px]"
          >
            Comment nous calculons le budget et les voyageurs
            <Icone nom="fleche" taille={17} epaisseur={2.4} />
          </Link>
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
          {choixMode ? (
            <ChoixMode pourLignes={t.pourLignes} choisir={choisirMode} annuler={() => setEtape(null)} />
          ) : confirmer && enregistree && reseauEnregistre ? (
            <div role="group" aria-labelledby="remplacer-partie" className="flex flex-col gap-3 rounded-2xl bg-white/12 p-4">
              <p id="remplacer-partie" className="text-[15px] leading-relaxed font-semibold">
                {!enregistree.terminee
                  ? `Votre partie en cours ${reseauEnregistre.ou} sera effacée.`
                  : enregistree.publiee
                    ? `Votre réseau ${reseauEnregistre.nom} sera effacé de ce navigateur. Il reste dans les réseaux publiés.`
                    : `Votre réseau ${reseauEnregistre.nom} sera effacé de ce navigateur. Pour le garder, revoyez-le d’abord et publiez-le ou copiez son lien.`}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Bouton genre="blanc" onClick={() => commencer(choix, etape?.libre)}>
                  Effacer et commencer
                </Bouton>
                <Bouton genre="contourBlanc" onClick={() => setEtape(null)}>
                  {enregistree.terminee ? 'Garder mon réseau' : 'Garder ma partie'}
                </Bouton>
              </div>
            </div>
          ) : enregistree && reseauEnregistre ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
              {/* Sur le réseau de la partie enregistrée, on la retrouve d'abord ; ailleurs, on commence d'abord. */}
              {ici ? (
                <>
                  <Bouton genre="blanc" icone="fleche" taille="grand" onClick={enregistree.reprendre} className="w-full lg:w-[250px]">
                    {enregistree.terminee ? 'Revoir mon réseau' : 'Reprendre ma partie'}
                  </Bouton>
                  <Bouton genre="contourBlanc" taille="grand" onClick={() => setEtape({ ville: choix })} className="whitespace-nowrap">
                    Nouvelle partie
                  </Bouton>
                </>
              ) : (
                <>
                  <Bouton
                    genre="blanc"
                    icone="fleche"
                    taille="grand"
                    onClick={() => setEtape({ ville: choix })}
                    className="w-full lg:w-[250px]"
                  >
                    Commencer la partie
                  </Bouton>
                  <Bouton genre="contourBlanc" taille="grand" onClick={enregistree.reprendre} className="lg:whitespace-nowrap">
                    {enregistree.terminee ? `Revoir mon réseau ${reseauEnregistre.nom}` : `Reprendre ma partie ${reseauEnregistre.ou}`}
                  </Bouton>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
              <Bouton
                genre="blanc"
                icone="fleche"
                taille="grand"
                onClick={() => setEtape({ ville: choix })}
                className="w-full lg:w-[250px]"
              >
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
          {choixMode ? null : enregistree ? (
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
