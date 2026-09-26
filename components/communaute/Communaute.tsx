'use client'

import { clsx } from 'clsx'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { chiffresCommunaute, communauteActive, listerReseaux, reseauxDe, useProfilLocal, type ReseauPublie } from '@/lib/communaute'
import { n } from '@/lib/format'
import { NOM_COURT } from '@/lib/noms'
import { horizon } from '@/lib/catalogue'
import { mandatsDe, villeDePartie } from '@/lib/partie'
import { useJeu } from '@/lib/store'
import { adresseAccueil, adresseMethode, adresseReseaux, estVille, ID_VILLES, MARQUE, VILLES, type IdVille } from '@/lib/villes'

import { cascade } from '../anim'
import { useCouleursReseau } from '../couleurs'
import { Bouton, BoutonLien, Icone, Logo, useChoixVisible } from '../ui'
import { MiniCarte } from './MiniCarte'

type Onglet = 'populaires' | 'recents' | 'miens'

const pluriel = (nombre: number, mot: string) => `${n(nombre)} ${mot}${nombre > 1 ? 's' : ''}`

/**
 * Où mène « jouer » depuis les réseaux publiés : la partie enregistrée dans ce navigateur s'il y en a
 * une, sinon une nouvelle partie dans le réseau affiché.
 */
function useVersLaPartie(ville: IdVille) {
  const enCours = useJeu((s) => s.ecran !== 'accueil')
  const villePartie = useJeu((s) => s.ville)
  useEffect(() => {
    void useJeu.persist.rehydrate()
  }, [])
  return { enCours, href: adresseAccueil(enCours ? villePartie : ville) }
}

/**
 * L'en-tête des pages de la communauté, dans la couleur du réseau : le nom du site, qui ramène à l'accueil
 * du réseau, et les trois pages d'un réseau, jouer, les réseaux publiés et la méthode.
 */
export function EnteteCommunaute({ ville = 'lyon', children }: { ville?: IdVille; children?: React.ReactNode }) {
  const { enCours, href } = useVersLaPartie(ville)
  const lien = 'flex min-h-10 items-center rounded-full px-3.5 text-[13.5px] font-extrabold transition-colors'
  return (
    <header className="bg-rouge text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 pt-4 lg:px-8 lg:pt-5">
        <div className="flex items-center justify-between gap-3">
          <Link href={adresseAccueil(ville)} className="flex min-w-0 items-center gap-2.5">
            <Logo taille={36} inverse />
            <span className="truncate text-[15px] font-extrabold lg:text-[17px]">{MARQUE}</span>
          </Link>
          <nav aria-label="Pages du réseau" className="flex shrink-0 items-center gap-1">
            <Link href={adresseMethode(ville)} className={clsx(lien, 'hidden hover:bg-white/15 lg:flex')}>
              Comment nous calculons
            </Link>
            <Link href={adresseReseaux(ville)} aria-current="page" className={clsx(lien, 'hidden bg-white/15 lg:flex')}>
              Réseaux publiés
            </Link>
            <Link href={href} className={clsx(lien, 'gap-2 bg-white text-rouge hover:bg-rouge-pale')}>
              {enCours ? 'Reprendre ma partie' : 'Jouer'}
              <Icone nom="fleche" taille={16} epaisseur={2.4} />
            </Link>
          </nav>
        </div>
        {children ?? <div className="h-3" />}
      </div>
    </header>
  )
}

/** Les chiffres du réseau publié, en petites étiquettes. */
function Etiquettes({ reseau, clair }: { reseau: ReseauPublie; clair?: boolean }) {
  const contenu = [
    reseau.retenus - reseau.lignes > 0 ? pluriel(reseau.retenus - reseau.lignes, 'projet') : '',
    reseau.lignes > 0 ? `${n(reseau.lignes)} ligne${reseau.lignes > 1 ? 's' : ''} tracée${reseau.lignes > 1 ? 's' : ''}` : '',
  ].filter(Boolean)
  const classe = clsx(
    'rounded-full px-2.5 py-1 text-[12.5px] font-extrabold whitespace-nowrap',
    clair ? 'bg-white/18 text-white' : 'bg-sable text-encre',
  )
  return (
    <div className="chiffres flex flex-wrap gap-1.5">
      <span className={classe}>{n(reseau.investi)} M€</span>
      {contenu.map((c) => (
        <span key={c} className={classe}>
          {c}
        </span>
      ))}
    </div>
  )
}

/** Les soutiens et les reprises d'un réseau. */
function Soutiens({ reseau, clair }: { reseau: ReseauPublie; clair?: boolean }) {
  return (
    <div className={clsx('flex gap-4 text-[13px] font-extrabold', clair ? 'text-white/85' : 'text-gris')}>
      <span className="flex items-center gap-1.5">
        <Icone nom="valider" taille={15} epaisseur={2.6} />
        {pluriel(reseau.soutiens, 'soutien')}
      </span>
      <span className="flex items-center gap-1.5">
        <Icone nom="rejouer" taille={15} />
        {pluriel(reseau.reprises, 'reprise')}
      </span>
    </div>
  )
}

/**
 * Un réseau publié en vignette, sa carte dans la couleur du réseau. `rang` affiche sa place dans le
 * classement ; `avecVille` remplace le pseudo par le réseau, pour la liste de ses propres réseaux.
 */
export function CarteReseau({ reseau, rang, avecVille }: { reseau: ReseauPublie; rang?: number; avecVille?: boolean }) {
  return (
    <motion.div variants={cascade.enfant}>
      <Link
        href={`/reseau/${reseau.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_2px_10px_rgb(0_0_0/0.06),inset_0_0_0_1px_var(--color-trait)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_34px_rgb(0_0_0/0.14),inset_0_0_0_1px_var(--color-trait)]"
      >
        <div className="relative h-[180px]">
          <MiniCarte partie={reseau.partie} teinte />
          {rang ? (
            <span className="chiffres absolute top-3 left-3 grid size-9 place-items-center rounded-full bg-white text-[15px] font-black text-rouge shadow-flotte">
              {rang}
            </span>
          ) : null}
          {reseau.libre ? (
            <span className="absolute top-3 right-3 rounded-full bg-encre px-2.5 py-1 text-[11.5px] font-extrabold text-white">
              Jeu libre
            </span>
          ) : mandatsDe(reseau.partie) > 2 ? (
            // Une partie continuée a eu plus de mandats, donc plus d'argent : elle le dit.
            <span className="absolute top-3 right-3 rounded-full bg-encre px-2.5 py-1 text-[11.5px] font-extrabold text-white">
              {mandatsDe(reseau.partie)} mandats, jusqu’en {horizon(mandatsDe(reseau.partie))}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-gris">
              {avecVille ? VILLES[villeDePartie(reseau.partie) ?? 'lyon'].nom : `par ${reseau.auteur?.pseudo ?? 'un joueur'}`}
            </span>
            <span className="text-[18px] leading-tight font-black tracking-tight group-hover:underline group-hover:underline-offset-3">
              {reseau.titre}
            </span>
          </div>
          {reseau.intention ? <p className="line-clamp-2 text-[13.5px] leading-relaxed text-gris">{reseau.intention}</p> : null}
          <div className="mt-auto flex flex-col gap-2.5 pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="chiffres text-[26px] leading-none font-black tracking-tight text-rouge">+{n(reseau.voyageurs)}</span>
              <span className="text-[13px] font-extrabold">voyageurs par jour</span>
            </div>
            <Etiquettes reseau={reseau} />
            <div className="border-t border-trait pt-2.5">
              <Soutiens reseau={reseau} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/** Le réseau le plus soutenu, en grand, en tête de la page. */
function ALaUne({ reseau }: { reseau: ReseauPublie }) {
  return (
    <motion.div variants={cascade.enfant}>
      <Link
        href={`/reseau/${reseau.id}`}
        className="group grid overflow-hidden rounded-[28px] bg-encre text-white shadow-[0_18px_50px_rgb(0_0_0/0.18)] transition-transform hover:-translate-y-1 lg:grid-cols-[1.25fr_1fr]"
      >
        <div className="relative h-[240px] lg:h-auto lg:min-h-[340px]">
          <MiniCarte partie={reseau.partie} teinte />
          <span className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-black text-rouge shadow-flotte">
            <Icone nom="drapeau" taille={15} epaisseur={2.6} />
            Le plus soutenu
          </span>
        </div>
        <div className="flex flex-col gap-4 p-6 lg:p-8">
          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-bold text-white/75">par {reseau.auteur?.pseudo ?? 'un joueur'}</span>
            <span className="text-[30px] leading-[1.02] font-black tracking-tight text-balance lg:text-[38px]">{reseau.titre}</span>
          </div>
          {reseau.intention ? <p className="line-clamp-3 text-[15px] leading-relaxed text-white/85">« {reseau.intention} »</p> : null}
          <div className="mt-auto flex flex-col gap-3">
            <div className="flex flex-col">
              <span className="chiffres text-[48px] leading-none font-black tracking-tight">+{n(reseau.voyageurs)}</span>
              <span className="text-[14px] font-extrabold text-white/85">voyageurs par jour en {horizon(mandatsDe(reseau.partie))}</span>
            </div>
            <Etiquettes reseau={reseau} clair />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-3">
              <Soutiens reseau={reseau} clair />
              <span className="flex items-center gap-1.5 text-[14px] font-black">
                Voir ce réseau
                <Icone nom="fleche" taille={17} epaisseur={2.4} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/** Le choix du réseau : chaque pastille mène à la page des réseaux publiés de ce réseau. */
function ChoixReseau({ ville }: { ville: IdVille }) {
  const rangee = useChoixVisible<HTMLElement>(ville)
  return (
    <nav
      ref={rangee}
      aria-label="Réseau"
      className="-mx-5 flex snap-x gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0"
    >
      {ID_VILLES.map((id) => (
        <Link
          key={id}
          href={adresseReseaux(id)}
          aria-current={ville === id ? 'page' : undefined}
          aria-label={`${NOM_COURT[id]}, réseau ${VILLES[id].nom}`}
          className={clsx(
            'flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-[15px] font-extrabold whitespace-nowrap transition-colors',
            ville === id ? 'bg-white text-rouge' : 'shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.6)] hover:bg-white/10',
          )}
        >
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-full shadow-[0_0_0_2px_#fff]"
            style={{ background: VILLES[id].couleurs.principale }}
          />
          {NOM_COURT[id]}
        </Link>
      ))}
    </nav>
  )
}

/**
 * La page des réseaux publiés d'un réseau : son en-tête et ses chiffres, le réseau le plus soutenu à la une,
 * puis tous les autres, classés par soutiens ou par date. Les réseaux du jeu libre sont listés à part.
 */
export function Communaute({ ville }: { ville: IdVille }) {
  const router = useRouter()
  const [onglet, setOnglet] = useState<Onglet>('populaires')
  useCouleursReseau(ville)
  const [libre, setLibre] = useState(false)
  const profil = useProfilLocal()
  const versLaPartie = useVersLaPartie(ville)
  const [essai, setEssai] = useState(0)
  const demande = `${onglet}:${ville}:${libre}:${profil?.id ?? ''}:${essai}`
  const [reponse, setReponse] = useState<{ demande: string; reseaux?: ReseauPublie[]; erreur?: string } | null>(null)
  const [chiffres, setChiffres] = useState<{ cle: string; total: number; record: ReseauPublie | null } | null>(null)
  const cleChiffres = `${ville}:${libre}`

  // Les anciennes adresses (/communaute?ville=toulouse) mènent à la page rangée sous le réseau.
  useEffect(() => {
    const demandee = new URLSearchParams(window.location.search).get('ville')
    if (estVille(demandee) && demandee !== ville) router.replace(adresseReseaux(demandee))
  }, [router, ville])

  useEffect(() => {
    if (!communauteActive) return
    let actif = true
    const requete = onglet === 'miens' ? (profil ? reseauxDe(profil.id) : Promise.resolve([])) : listerReseaux(onglet, ville, libre)
    requete.then(
      (reseaux) => actif && setReponse({ demande, reseaux }),
      (e: unknown) =>
        actif &&
        setReponse({
          demande,
          erreur: e instanceof Error ? e.message : 'Nous n’arrivons pas à charger les réseaux publiés pour l’instant.',
        }),
    )
    return () => {
      actif = false
    }
  }, [onglet, ville, libre, profil, demande])

  useEffect(() => {
    if (!communauteActive) return
    let actif = true
    chiffresCommunaute(ville, libre).then(
      (c) => actif && setChiffres({ cle: cleChiffres, ...c }),
      () => {},
    )
    return () => {
      actif = false
    }
  }, [ville, libre, cleChiffres])

  const actuelle = reponse?.demande === demande ? reponse : null
  const reseaux = actuelle?.reseaux ?? null
  const erreur = actuelle?.erreur ?? null
  const stats = chiffres?.cle === cleChiffres ? chiffres : null
  const onglets: Onglet[] = profil ? ['populaires', 'recents', 'miens'] : ['populaires', 'recents']
  // En tête des plus soutenus, le premier passe à la une ; les autres suivent, numérotés.
  const aLaUne = onglet === 'populaires' && reseaux && reseaux.length > 0 ? reseaux[0]! : null
  const suite = aLaUne ? reseaux!.slice(1) : (reseaux ?? [])
  const reseauNom = VILLES[ville].nom

  return (
    <div className="min-h-dvh bg-[#faf9f7]">
      <EnteteCommunaute ville={ville}>
        <motion.div
          variants={cascade.parent}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5 pt-4 pb-7 lg:grid lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-10 lg:pt-8 lg:pb-10"
        >
          <motion.div variants={cascade.enfant} className="flex flex-col gap-4">
            <ChoixReseau ville={ville} />
            <h1 className="text-[40px] leading-[0.97] font-black tracking-[-0.035em] text-balance lg:text-[58px]">
              Les réseaux imaginés pour {reseauNom}
            </h1>
            <p className="max-w-[560px] text-[16px] leading-snug font-semibold text-white/90 lg:text-[17px]">
              Chaque réseau a été construit par un joueur avec le vrai budget {VILLES[ville].territoire}, ou sans limite en jeu libre.
              Soutenez ceux que vous aimez, comparez-les au vôtre, reprenez-les pour votre partie.
            </p>
          </motion.div>
          <motion.div variants={cascade.enfant} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1 rounded-[20px] bg-white/12 p-4">
                <span className="chiffres text-[32px] leading-none font-black">{stats ? n(stats.total) : '…'}</span>
                <span className="text-[13.5px] leading-snug font-semibold text-white/85">
                  {stats && stats.total > 1 ? 'réseaux publiés' : 'réseau publié'}
                  {libre ? ' en jeu libre' : ' avec le vrai budget'}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-[20px] bg-white/12 p-4">
                <span className="chiffres text-[32px] leading-none font-black">
                  {stats?.record ? `+${n(stats.record.voyageurs)}` : stats ? '0' : '…'}
                </span>
                <span className="text-[13.5px] leading-snug font-semibold text-white/85">
                  {stats?.record
                    ? `voyageurs par jour, le record à battre, par ${stats.record.auteur?.pseudo ?? 'un joueur'}`
                    : 'voyageurs par jour : aucun record pour l’instant, le premier réseau publié le fixera'}
                </span>
              </div>
            </div>
            <BoutonLien href={versLaPartie.href} genre="blanc" icone="fleche" taille="grand">
              {versLaPartie.enCours ? 'Reprendre ma partie pour publier' : 'Jouer et publier mon réseau'}
            </BoutonLien>
          </motion.div>
        </motion.div>
      </EnteteCommunaute>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pt-6 pb-16 lg:px-8 lg:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Listes de réseaux"
            className="flex gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1.5px_var(--color-trait)]"
          >
            {onglets.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={onglet === o}
                onClick={() => setOnglet(o)}
                className={clsx(
                  'min-h-10 rounded-full px-4 text-[14px] font-extrabold transition-colors',
                  onglet === o ? 'bg-encre text-white' : 'text-gris hover:text-encre',
                )}
              >
                {o === 'populaires' ? 'Les plus soutenus' : o === 'recents' ? 'Les plus récents' : 'Mes réseaux'}
              </button>
            ))}
          </nav>
          {onglet !== 'miens' ? (
            <div
              role="radiogroup"
              aria-label="Façon de jouer"
              className="flex rounded-full bg-white p-1 shadow-[inset_0_0_0_1.5px_var(--color-trait)]"
            >
              {[
                { valeur: false, texte: 'Avec le vrai budget' },
                { valeur: true, texte: 'Jeu libre' },
              ].map((o) => (
                <button
                  key={o.texte}
                  type="button"
                  role="radio"
                  aria-checked={libre === o.valeur}
                  onClick={() => setLibre(o.valeur)}
                  className={clsx(
                    'min-h-10 rounded-full px-4 text-[14px] font-extrabold transition-colors',
                    libre === o.valeur ? 'bg-rouge text-white' : 'text-gris hover:text-encre',
                  )}
                >
                  {o.texte}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {!communauteActive ? (
          <p className="max-w-[640px] text-[15px] leading-relaxed text-gris">
            Les réseaux publiés ne sont pas disponibles sur cette version du site.
          </p>
        ) : erreur ? (
          <div className="flex max-w-[640px] flex-col items-start gap-3">
            <p className="text-[15px] leading-relaxed text-gris">{erreur}</p>
            <Bouton genre="contour" icone="rejouer" onClick={() => setEssai((e) => e + 1)}>
              Réessayer
            </Bouton>
          </div>
        ) : reseaux === null ? (
          <p className="text-[15px] text-gris" aria-live="polite">
            Chargement des réseaux
          </p>
        ) : reseaux.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-[28px] bg-white p-7 shadow-[inset_0_0_0_1px_var(--color-trait)] lg:p-10">
            <span className="grid size-14 place-items-center rounded-2xl bg-rouge-pale text-rouge">
              <Icone nom="trace" taille={28} epaisseur={2.2} />
            </span>
            <h2 className="text-[24px] leading-tight font-black tracking-tight lg:text-[30px]">
              {onglet === 'miens' ? 'Vous n’avez encore rien publié' : `Publiez le premier réseau pour ${reseauNom}`}
            </h2>
            <p className="max-w-[560px] text-[15px] leading-relaxed text-gris">
              {onglet === 'miens'
                ? 'Les réseaux publiés depuis ce navigateur apparaîtront ici.'
                : libre
                  ? 'Choisissez « Jouer sans limite de budget » en commençant une partie, puis publiez votre réseau depuis le bilan.'
                  : 'Terminez une partie en tenant le budget, puis publiez votre réseau depuis le bilan : il apparaîtra ici.'}
            </p>
            <BoutonLien href={versLaPartie.href} icone="fleche">
              {versLaPartie.enCours ? 'Reprendre ma partie' : 'Commencer une partie'}
            </BoutonLien>
          </div>
        ) : (
          <motion.div key={demande} variants={cascade.parent} initial="hidden" animate="show" className="flex flex-col gap-6">
            {aLaUne ? <ALaUne reseau={aLaUne} /> : null}
            {suite.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {suite.map((r, i) => (
                  <CarteReseau key={r.id} reseau={r} rang={onglet === 'populaires' ? i + 2 : undefined} avecVille={onglet === 'miens'} />
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </main>
    </div>
  )
}
