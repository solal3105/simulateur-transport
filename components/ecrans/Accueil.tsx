'use client'

import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { essayerMotDePasse, useAcces } from '@/lib/acces'
import { libre } from '@/lib/budget'
import { CATALOGUE } from '@/lib/catalogue'
import { communauteActive } from '@/lib/communaute'
import { enLettres } from '@/lib/format'
import { useJeu } from '@/lib/store'
import { adresseAccueil, adresseMethode, adresseReseaux, ID_VILLES, MARQUE, VILLES, type IdVille, type Ville } from '@/lib/villes'

import { cascade } from '../anim'
import { Carte } from '../carte/Carte'
import { useCouleursReseau } from '../couleurs'
import { ouvrirMessagerie } from '../explications/Ecrire'
import { Bouton, Icone, Logo, useChoixVisible } from '../ui'
import { Devoilement } from './Devoilement'

const NOMBRE_PROJETS = CATALOGUE.filter((p) => p.trace).length
const MARGES = { top: 20, left: 20, right: 20, bottom: 20 }
/** La carte de l'accueil montre le réseau d'aujourd'hui, jamais celui de la partie enregistrée. */
const RESEAU_ACTUEL = { chantiers: [], lignes: [] }

/** Un arrêt de la ligne du temps de l'accueil : une date du jeu, et ce qu'on y fait. */
type Arret = { quand: string; annee: string; titre: string; texte: string }

/**
 * Ce que l'accueil dit de chaque réseau : le but, puis la partie racontée comme une ligne de transport, du
 * départ en 2026 au terminus en 2038, avec les deux mandats du jeu.
 */
function textes(ville: Ville) {
  const pourLignes = libre(ville.budget, 1) + libre(ville.budget, 2)
  const arrets: Arret[] = [
    ville.catalogue
      ? {
          quand: 'Départ',
          annee: '2026',
          titre: 'Choisissez vos projets',
          texte: `${NOMBRE_PROJETS} projets réels, ou vos propres lignes.`,
        }
      : {
          quand: 'Départ',
          annee: '2026',
          titre: 'Tracez vos lignes',
          texte: 'Tram, bus, métro ou téléphérique, où vous voulez.',
        },
    {
      quand: 'Second mandat',
      annee: '2032',
      titre: 'Tenez le budget',
      texte: `${majuscule(enLettres(pourLignes))} d’euros pour vos lignes, sur deux mandats.`,
    },
    {
      quand: 'Terminus',
      annee: '2038',
      titre: 'Comptez vos voyageurs',
      texte: 'Les voyageurs gagnés chaque jour : c’est votre score.',
    },
  ]
  return {
    debutTitre: `Construisez le réseau ${ville.reseau}`,
    sousTitre: `Vous dirigez les transports ${ville.territoire} de 2026 à 2038.`,
    arrets,
    pourLignes,
  }
}

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * Comment on joue, dessiné comme le plan d'une ligne : un trait qui se trace de haut en bas, une station par
 * étape, et le terminus plus gros, comme sur les plans de ligne.
 */
function Parcours({ arrets }: { arrets: Arret[] }) {
  const reduit = useReducedMotion()
  return (
    <motion.ol variants={cascade.parent} aria-label="Comment on joue" className="relative flex flex-col gap-4 pl-11">
      <motion.span
        aria-hidden="true"
        initial={{ scaleY: reduit ? 1 : 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: reduit ? 0 : 0.9, ease: [0.3, 0.7, 0.2, 1], delay: 0.25 }}
        className="absolute top-3 bottom-6 left-[13px] w-[5px] origin-top rounded-full bg-white/40"
      />
      {arrets.map((a, i) => {
        const terminus = i === arrets.length - 1
        return (
          <motion.li variants={cascade.enfant} key={a.annee} className="relative flex flex-col gap-0.5">
            <span
              aria-hidden="true"
              className={clsx(
                'absolute top-1 rounded-full bg-white',
                terminus
                  ? '-left-[42px] size-[26px] shadow-[0_0_0_6px_rgba(255,255,255,0.25)]'
                  : '-left-[38px] size-[18px] border-[4px] border-rouge shadow-[0_0_0_3px_#fff]',
              )}
            />
            <span className="flex items-center gap-2 text-[12px] font-black tracking-[0.08em] uppercase opacity-85">
              <span>{a.quand}</span>
              <span className="chiffres rounded-full bg-white/20 px-2 py-0.5 tracking-normal">{a.annee}</span>
            </span>
            <span className="text-[18px] leading-tight font-black lg:text-[19px]">{a.titre}</span>
            <span className="text-[14px] leading-snug font-medium opacity-90 lg:text-[15px]">{a.texte}</span>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}

/**
 * La fiche posée sur la carte, sur ordinateur : ce que la carte montre, et l'argent disponible pour vos
 * lignes, avec d'où il vient.
 */
function FicheCarte({ ville, pourLignes }: { ville: Ville; pourLignes: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.5 }}
      className="absolute bottom-8 left-8 hidden w-[330px] flex-col gap-4 rounded-[26px] bg-white p-6 text-encre shadow-[0_18px_50px_rgb(0_0_0/0.18)] lg:flex"
    >
      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-black tracking-[0.08em] text-gris uppercase">Le réseau aujourd’hui</span>
        <span className="flex items-center gap-2.5 text-[14px] font-bold">
          <span className="h-[5px] w-7 rounded-full bg-[#8d877e]" />
          Métro et tram en service
        </span>
        {ville.catalogue ? (
          <span className="flex items-center gap-2.5 text-[14px] font-bold">
            <span className="h-[5px] w-7 rounded-full bg-[repeating-linear-gradient(90deg,var(--color-rouge)_0_6px,transparent_6px_10px)]" />
            {NOMBRE_PROJETS} projets sur la table
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 border-t border-trait pt-4">
        <span className="chiffres text-[34px] leading-none font-black tracking-tight text-rouge">
          {majuscule(enLettres(pourLignes))
            .replace(/ milliards?/, ' Md€')
            .replace(' millions', ' M€')}
        </span>
        <span className="text-[14px] leading-snug font-semibold text-gris">
          pour vos nouvelles lignes sur deux mandats, d’après les budgets publiés par {ville.budget.payeur}.
        </span>
      </div>
    </motion.div>
  )
}

/**
 * Le choix du réseau : il change l'accueil, ses couleurs et l'adresse de la page, sans rien toucher à une
 * partie. Sur téléphone, les réseaux défilent sur une seule rangée.
 */
/** Le nom de la ville sur le sélecteur : court et parlant, le nom du réseau est dans le titre juste dessous. */
const NOM_COURT: Record<IdVille, string> = { lyon: 'Lyon', toulouse: 'Toulouse', marseille: 'Marseille', nice: 'Nice', idf: 'Paris' }

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
          aria-label={`${NOM_COURT[id]}, réseau ${VILLES[id].nom}`}
          onClick={() => choisir(id)}
          className={clsx(
            'flex min-h-11 shrink-0 snap-start items-center rounded-full px-4 text-left transition-colors',
            ville === id ? 'bg-white text-rouge' : 'shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.6)] hover:bg-white/10',
          )}
        >
          <span className="flex items-center gap-2 text-[15px] leading-tight font-extrabold whitespace-nowrap">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full shadow-[0_0_0_2px_#fff]"
              style={{ background: VILLES[id].couleurs.principale }}
            />
            {NOM_COURT[id]}
          </span>
        </button>
      ))}
    </div>
  )
}

/**
 * Le mot de passe de l'accès anticipé, demandé au premier clic pour jouer. Celui qui ne l'a pas peut nous
 * écrire pour le demander, ou revenir à l'accueil.
 */
function FormulaireAcces({ ouvrir, annuler }: { ouvrir: () => void; annuler: () => void }) {
  const [mot, setMot] = useState('')
  const [etat, setEtat] = useState<'saisie' | 'envoi' | 'faux' | 'erreur'>('saisie')
  const [adresse, setAdresse] = useState<string | null>(null)
  const demander = () =>
    setAdresse(
      ouvrirMessagerie(
        'demande d’accès anticipé',
        'Bonjour,\n\nJ’aimerais essayer le Simulateur transport en accès anticipé. Pourriez-vous m’envoyer le mot de passe ?\n\nMerci !',
      ),
    )
  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mot.trim() || etat === 'envoi') return
    setEtat('envoi')
    const resultat = await essayerMotDePasse(mot)
    if (resultat === 'ok') ouvrir()
    else setEtat(resultat)
  }
  return (
    <form onSubmit={envoyer} aria-labelledby="acces-titre" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p id="acces-titre" className="text-[16px] font-black">
          Le jeu est en accès anticipé
        </p>
        <p className="text-[14px] leading-snug font-semibold opacity-90">
          Entrez le mot de passe pour jouer. Ce navigateur s’en souviendra ensuite.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          value={mot}
          onChange={(e) => {
            setMot(e.target.value)
            if (etat === 'faux' || etat === 'erreur') setEtat('saisie')
          }}
          aria-label="Mot de passe de l’accès anticipé"
          aria-invalid={etat === 'faux'}
          aria-describedby="acces-erreur"
          autoComplete="off"
          autoFocus
          placeholder="Mot de passe"
          className="min-h-14 flex-1 rounded-full bg-white px-5 text-[16px] font-bold text-encre outline-none placeholder:font-semibold placeholder:text-muet focus-visible:ring-4 focus-visible:ring-white/40"
        />
        <Bouton genre="blanc" icone="fleche" taille="grand" type="submit" disabled={etat === 'envoi'} className="sm:w-auto">
          {etat === 'envoi' ? 'Vérification' : 'Entrer dans le jeu'}
        </Bouton>
      </div>
      <p id="acces-erreur" aria-live="polite" className="text-[14px] leading-snug font-extrabold empty:hidden">
        {etat === 'faux'
          ? 'Ce n’est pas le bon mot de passe.'
          : etat === 'erreur'
            ? 'Nous n’avons pas pu vérifier le mot de passe. Réessayez dans un instant.'
            : ''}
      </p>
      <div className="flex flex-col gap-3 rounded-2xl bg-white/15 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-rouge">
            <Icone nom="lettre" taille={20} epaisseur={2.2} />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[15.5px] leading-tight font-black">Pas encore de mot de passe ?</span>
            <span className="text-[13.5px] leading-snug font-semibold opacity-90">
              Demandez votre accès anticipé : votre messagerie s’ouvre avec un message déjà écrit, il ne reste qu’à l’envoyer.
            </span>
          </span>
        </div>
        <Bouton genre="contourBlanc" iconeAGauche="lettre" onClick={demander} className="w-full sm:w-auto sm:self-start">
          Demander mon accès anticipé
        </Bouton>
        {adresse ? (
          <p className="text-[13px] leading-snug opacity-90" aria-live="polite">
            Si votre messagerie ne s’ouvre pas, écrivez à <span className="font-extrabold select-all">{adresse}</span>.
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={annuler}
        className="min-h-10 self-center text-[14px] font-extrabold underline decoration-white/50 underline-offset-3 hover:decoration-white lg:self-start"
      >
        Revenir
      </button>
    </form>
  )
}

/** Le bouton qui ouvre le dévoilement de tout ce que le jeu permet. */
function BoutonDevoilement({ ouvrir }: { ouvrir: () => void }) {
  return (
    <motion.button
      variants={cascade.enfant}
      type="button"
      onClick={ouvrir}
      className="group flex items-center gap-3 rounded-full py-1 pr-2 text-left"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
        <Icone nom="drapeau" taille={19} epaisseur={2.2} />
      </span>
      <span className="flex-1 text-[15.5px] leading-tight font-black underline decoration-white/40 underline-offset-4 group-hover:decoration-white">
        Voir tout ce que le jeu permet
      </span>
      <Icone nom="fleche" taille={20} epaisseur={2.3} className="transition-transform group-hover:translate-x-1" />
    </motion.button>
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
            {majuscule(enLettres(pourLignes))} d’euros pour vos lignes, en deux mandats sans déficit.
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
            Tracez le réseau dont vous rêvez, et voyez ce qu’il coûterait face au budget réel.
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
  // Tant que le jeu est en accès anticipé, toute action qui mène à une partie passe d'abord par le mot de passe.
  const acces = useAcces()
  const [enAttente, setEnAttente] = useState<(() => void) | null>(null)
  const avecAcces = (action: () => void) => (acces ? action() : setEnAttente(() => action))
  const [devoilement, setDevoilement] = useState(false)

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
        className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col gap-6 px-6 pt-5 pb-6 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[640px] lg:gap-6 lg:overflow-y-auto lg:rounded-r-[36px] lg:bg-rouge lg:px-14 lg:pt-8 lg:pb-7"
      >
        <motion.div variants={cascade.enfant} className="flex items-center gap-2.5">
          <Logo taille={36} inverse />
          <span className="text-[15px] font-extrabold lg:text-[17px]">{MARQUE}</span>
        </motion.div>

        <motion.div variants={cascade.enfant} className="flex flex-col gap-4">
          <ChoixVille ville={choix} choisir={setChoix} />
          {/* Un titre long, comme celui d'Aix-Marseille-Provence, s'écrit plus petit pour tenir en quelques lignes.
              L'année s'affiche comme la girouette d'un tram : blanche, à la couleur du réseau. */}
          <h1
            className={clsx(
              'leading-[1.02] font-black tracking-[-0.035em] text-balance lg:leading-[1]',
              t.debutTitre.length > 40 ? 'text-[36px] lg:text-[46px]' : 'text-[44px] lg:text-[54px]',
            )}
          >
            {t.debutTitre}{' '}
            <span className="whitespace-nowrap">
              de{' '}
              <motion.span
                initial={{ rotate: -6, scale: 0.6, opacity: 0 }}
                animate={{ rotate: -2.5, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.35 }}
                className="chiffres inline-block rounded-[0.16em] bg-white px-[0.14em] pb-[0.02em] text-rouge shadow-[0_0.08em_0_rgb(0_0_0/0.18)]"
              >
                2038
              </motion.span>
            </span>
          </h1>
          <p className="text-[16px] leading-snug font-semibold opacity-95 lg:text-[17px]">{t.sousTitre}</p>
        </motion.div>

        {/* Une seule carte : une vignette sur téléphone, qui grandit sur un grand écran étroit, et le fond de
            l'écran sur ordinateur. */}
        <div
          aria-hidden="true"
          className="relative min-h-[190px] flex-1 overflow-hidden rounded-[20px] bg-sable lg:fixed lg:inset-y-0 lg:right-0 lg:left-[640px] lg:h-auto lg:rounded-none"
        >
          <Carte key={choix} marges={MARGES} decor ville={choix} partie={RESEAU_ACTUEL} />
          <span className="absolute top-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-encre shadow-flotte lg:hidden">
            Le réseau aujourd’hui
          </span>
          <FicheCarte key={`fiche-${choix}`} ville={ville} pourLignes={t.pourLignes} />
        </div>

        <Parcours key={choix} arrets={t.arrets} />

        <BoutonDevoilement ouvrir={() => setDevoilement(true)} />

        {/* Sur téléphone, le bouton pour commencer reste en bas de l'écran pendant qu'on lit, et le choix du
            mode s'ouvre au même endroit. */}
        <motion.div
          variants={cascade.enfant}
          className="sticky bottom-0 z-10 -mx-6 mt-auto flex flex-col gap-4 bg-rouge px-6 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-6 before:bg-linear-to-t before:from-rouge before:to-transparent lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:before:hidden"
        >
          {enAttente && !acces ? (
            <FormulaireAcces
              ouvrir={() => {
                enAttente()
                setEnAttente(null)
              }}
              annuler={() => setEnAttente(null)}
            />
          ) : choixMode ? (
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
            <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-5">
              {/* Sur le réseau de la partie enregistrée, on la retrouve d'abord ; ailleurs, on commence d'abord.
                  L'autre choix reste discret, pour que la barre du téléphone ne cache pas la page. */}
              <Bouton
                genre="blanc"
                icone="fleche"
                taille="grand"
                onClick={() => avecAcces(ici ? enregistree.reprendre : () => setEtape({ ville: choix }))}
                className="w-full shrink-0 lg:w-[280px]"
              >
                {ici ? (enregistree.terminee ? 'Revoir mon réseau' : 'Reprendre ma partie') : 'Commencer la partie'}
              </Bouton>
              <button
                type="button"
                onClick={() => avecAcces(ici ? () => setEtape({ ville: choix }) : enregistree.reprendre)}
                className="min-h-10 self-center text-[14px] font-extrabold underline decoration-white/50 underline-offset-3 hover:decoration-white lg:self-auto lg:text-left"
              >
                {ici
                  ? 'Commencer une nouvelle partie'
                  : enregistree.terminee
                    ? `Revoir mon réseau ${reseauEnregistre.nom}`
                    : `Reprendre ma partie ${reseauEnregistre.ou}`}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
              <Bouton
                genre="blanc"
                icone="fleche"
                taille="grand"
                onClick={() => avecAcces(() => setEtape({ ville: choix }))}
                className="w-full shrink-0 lg:w-[280px]"
              >
                Commencer la partie
              </Bouton>
              {acces ? (
                <p className="text-center text-[13px] leading-snug font-semibold opacity-85 lg:text-left">
                  Sans compte : votre partie reste dans ce navigateur.
                </p>
              ) : (
                <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] leading-snug font-semibold lg:justify-start">
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-black tracking-wide uppercase">
                    Accès anticipé
                  </span>
                  <button
                    type="button"
                    onClick={() => setEnAttente(() => () => setEtape({ ville: choix }))}
                    className="min-h-8 font-extrabold underline decoration-white/50 underline-offset-3 hover:decoration-white"
                  >
                    Obtenir le mot de passe
                  </button>
                </p>
              )}
            </div>
          )}
        </motion.div>

        {choixMode || confirmer || enAttente ? null : (
          <motion.nav
            variants={cascade.enfant}
            aria-label="Pour aller plus loin"
            className="flex flex-wrap justify-center gap-x-5 gap-y-0.5 border-t border-white/25 pt-2 text-[13.5px] font-extrabold lg:justify-start"
          >
            <Link
              href={adresseMethode(choix)}
              className="flex min-h-10 items-center underline decoration-white/50 underline-offset-3 hover:decoration-white"
            >
              Comment nous calculons le budget et les voyageurs
            </Link>
            {communauteActive ? (
              <Link
                href={adresseReseaux(choix)}
                className="flex min-h-10 items-center underline decoration-white/50 underline-offset-3 hover:decoration-white"
              >
                Les réseaux publiés
              </Link>
            ) : null}
          </motion.nav>
        )}
      </motion.div>
      <Devoilement
        ouvert={devoilement}
        acces={acces}
        fermer={() => setDevoilement(false)}
        commencer={() => {
          setDevoilement(false)
          avecAcces(() => setEtape({ ville: choix }))
        }}
      />
    </main>
  )
}
