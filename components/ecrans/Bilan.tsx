'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'

import { CATALOGUE, MANDATS, PROJETS } from '@/lib/catalogue'
import { couleurLigne, couleurOuverture, couleurProjet } from '@/lib/couleurs'
import { n } from '@/lib/format'
import { ouvertures, resoudre, resumer, totauxCatalogue } from '@/lib/regles'
import { communauteActive, compterReprise } from '@/lib/communaute'
import { lienDePartage, type PartiePartagee } from '@/lib/lien'
import { dessinerPartage } from '@/lib/partage'
import { useJeu } from '@/lib/store'
import { adresseAccueil, adresseReseaux, ID_VILLES, MARQUE, VILLES, type Ville } from '@/lib/villes'

import { useCompteur, useDefilement } from '../anim'
import { Carte } from '../carte/Carte'
import { EnTetePublication, PiedPublication, type Publication } from '../communaute/EnTetePublication'
import { Publier } from '../communaute/Publier'
import { Bouton, Icone, Logo, Surtitre } from '../ui'
import { Comparaison } from './Comparaison'

const AVEC_TRACE = CATALOGUE.filter((p) => p.trace)
const TOTAL = totauxCatalogue(AVEC_TRACE)
const MARGES_GRAND = { top: 40, left: 40, right: 40, bottom: 40 }
const lignesTracees = (nombre: number) => `${nombre} ligne${nombre > 1 ? 's' : ''} tracée${nombre > 1 ? 's' : ''}`

/**
 * Le bilan de fin de partie. Avec `partage`, il montre un réseau reçu par un lien ou publié dans la
 * communauté, en lecture seule : le visiteur peut alors partir de ce réseau pour sa propre partie, le
 * comparer au sien, ou retrouver sa partie. Avec `publication`, il montre aussi son titre, son auteur
 * et de quoi le soutenir ou le signaler.
 */
export function Bilan({ partage, quitter, publication }: { partage?: PartiePartagee; quitter?: () => void; publication?: Publication }) {
  const jeu = useJeu()
  // Un réseau reçu garde sa ville, même si la partie du visiteur est ailleurs.
  const ville = VILLES[partage?.ville ?? jeu.ville]
  const chantiers = partage?.chantiers ?? jeu.chantiers
  const lignes = partage?.lignes ?? jeu.lignes
  const leviers = partage?.leviers ?? jeu.leviers
  // Le visiteur d'un lien a peut-être déjà une partie enregistrée dans ce navigateur.
  const aUnePartie = jeu.chantiers.length + jeu.lignes.length > 0
  // On ne compare que deux réseaux de la même ville.
  const comparable = aUnePartie && jeu.ville === ville.id
  const [confirmer, setConfirmer] = useState(false)
  const [comparer, setComparer] = useState(false)
  const fermerComparaison = useCallback(() => setComparer(false), [])
  const [publier, setPublier] = useState(false)
  const fermerPublication = useCallback(() => setPublier(false), [])
  const [envoi, setEnvoi] = useState<string | null>(null)

  // On quitte le réseau reçu sans toucher à la partie enregistrée du visiteur.
  const quitterPartage = () => {
    if (!aUnePartie) jeu.commencer(ville.id)
    quitter?.()
  }
  const reprendre = () => {
    if (!partage) return
    if (publication) {
      jeu.reprendre(partage, { id: publication.id, titre: publication.titre, pseudo: publication.auteur?.pseudo ?? '' })
      // La reprise compte pour le réseau publié ; si le serveur ne répond pas, la partie commence quand même.
      void compterReprise(publication.id).catch(() => {})
    } else jeu.reprendre(partage)
    quitter?.()
  }

  const resultat = useMemo(() => {
    const faits = new Set(chantiers.map((c) => c.id))
    const laisses = ville.catalogue ? AVEC_TRACE.filter((p) => !faits.has(p.id)) : []
    const plusGros = laisses.reduce<(typeof laisses)[number] | null>((m, p) => (!m || resoudre(p).cout > resoudre(m).cout ? p : m), null)
    return {
      ...resumer(chantiers, lignes, leviers, ville),
      laisses,
      coutLaisse: laisses.reduce((t, p) => t + resoudre(p).cout, 0),
      plusGros,
      ouvertures: ouvertures(chantiers, lignes),
    }
  }, [chantiers, lignes, leviers, ville])

  // Le lien contient toute la partie : qui l'ouvre voit ce réseau se construire, sans compte ni serveur.
  const copierLien = async () => {
    const url = publication
      ? `${window.location.origin}/reseau/${publication.id}`
      : partage
        ? window.location.href
        : await lienDePartage({ ville: ville.id, chantiers, lignes, leviers })
    if (navigator.share && window.innerWidth < 1024) {
      try {
        await navigator.share({ url, title: 'Mon réseau de transport en 2038' })
        return
      } catch {
        // Partage annulé : on copie le lien.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setEnvoi('Lien copié. Qui l’ouvre verra ce réseau se construire, année par année.')
    } catch {
      setEnvoi('La copie n’a pas fonctionné. Vous pouvez copier l’adresse de la page après l’avoir ouverte.')
    }
  }

  const partager = async (format: 'story' | 'paysage') => {
    setEnvoi('Préparation de l’image')
    const traces = new Map(
      chantiers.flatMap((c) => {
        const trace = PROJETS.get(c.id)?.trace
        return trace ? [[trace, couleurProjet(c.id, c)] as [string, string]] : []
      }),
    )
    const blob = await dessinerPartage(
      {
        ville,
        voyageurs: resultat.voyageurs,
        contenu: ville.catalogue ? `${resultat.retenus} projets sur ${AVEC_TRACE.length}` : lignesTracees(lignes.length),
        equilibre: resultat.equilibre,
        traces,
        lignes: lignes.map((l) => ({ arrets: l.arrets, couleur: couleurLigne(l.mode) })),
        adresse: window.location.host,
      },
      format,
    )
    const fichier = new File([blob], `mon-reseau-${ville.id}-2038-${format}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [fichier] })) {
      try {
        await navigator.share({ files: [fichier], title: `Mon réseau ${ville.reseau} en 2038` })
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
  // Sans catalogue, il n'y a rien à quoi rapporter le réseau : seule la remarque sur les ouvertures tardives reste.
  const explication = [
    ville.catalogue ? `C’est ${partCatalogue} % de ce que le catalogue entier apporterait, pour ${partCout} % de son coût.` : '',
    resultat.ouvertures.some((o) => o.annee > MANDATS[2].fin)
      ? 'Certains de ces voyageurs n’arriveront qu’après 2038, quand les derniers chantiers seront terminés.'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main className="min-h-dvh bg-white lg:fixed lg:inset-0">
      <div className="relative h-[300px] lg:absolute lg:inset-y-0 lg:right-[620px] lg:left-0 lg:h-auto">
        <Carte marges={MARGES_GRAND} decor anneeMax={annee} partie={partage} ville={ville.id} />
        {/* Le nom du site, lisible aussi sur téléphone : on arrive souvent ici depuis un lien. Sur la page d'un
            réseau publié, il mène à l'accueil de la ville. */}
        {publication ? (
          <Link
            href={adresseAccueil(ville.id)}
            className="absolute top-4 left-4 flex items-center gap-2.5 rounded-full bg-white/95 py-1 pr-4 pl-1 shadow-flotte lg:top-7 lg:left-7"
          >
            <Logo taille={34} />
            <span className="text-[14.5px] font-black lg:text-[16px]">{MARQUE}</span>
          </Link>
        ) : (
          <div className="absolute top-4 left-4 flex items-center gap-2.5 rounded-full bg-white/95 py-1 pr-4 pl-1 shadow-flotte lg:top-7 lg:left-7">
            <Logo taille={34} />
            <span className="text-[14.5px] font-black lg:text-[16px]">{MARQUE}</span>
          </div>
        )}
        <div className="absolute right-4 bottom-10 flex flex-col items-end gap-2 lg:right-auto lg:bottom-8 lg:left-8 lg:items-start">
          <div className="rounded-2xl bg-white/90 px-4 py-2.5 shadow-flotte backdrop-blur">
            <div className="text-xs font-extrabold tracking-[0.08em] text-muet uppercase">
              {termine ? (partage ? 'Ce réseau' : 'Votre réseau') : 'Le réseau se construit'}
            </div>
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
        {publication ? (
          <>
            <Link
              href={adresseReseaux(ville.id)}
              className="-mt-1 flex min-h-10 items-center gap-2 self-start text-[14px] font-extrabold text-gris hover:text-encre"
            >
              <Icone nom="retour" taille={17} epaisseur={2.4} />
              Réseaux publiés à {ville.nom}
            </Link>
            <EnTetePublication publication={publication} />
          </>
        ) : null}

        <span
          className={`flex items-center gap-2 self-start rounded-full px-3.5 py-1.5 text-[13.5px] font-extrabold ${resultat.equilibre ? 'bg-rouge text-white' : 'bg-encre text-white'}`}
        >
          <Icone nom={resultat.equilibre ? 'valider' : 'info'} taille={16} epaisseur={2.8} />
          {resultat.equilibre ? 'Budget tenu sur les deux mandats' : `Déficit de ${n(-resultat.deficit)} M€`}
        </span>

        <div className="flex flex-col gap-2">
          {publication ? (
            <h2 className="text-[15px] font-semibold text-gris lg:text-base">Ce réseau transporte chaque jour en 2038</h2>
          ) : (
            <h1 className="text-[15px] font-semibold text-gris lg:text-base">
              {partage ? 'Ce réseau, partagé avec vous, transporte chaque jour en 2038' : 'Votre réseau en 2038 transporte chaque jour'}
            </h1>
          )}
          <div className="flex items-baseline gap-2.5">
            <span className="chiffres text-[50px] leading-none font-black tracking-[-0.04em] text-rouge lg:text-[72px]">
              +{n(voyageursAnimes)}
            </span>
            <span className="text-base font-extrabold lg:text-xl">voyageurs</span>
          </div>
          {explication ? <p className="text-[14.5px] leading-relaxed text-gris lg:text-[15px]">{explication}</p> : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            ville.catalogue
              ? [`${resultat.retenus} sur ${AVEC_TRACE.length}`, 'projets retenus']
              : [String(lignes.length), lignes.length > 1 ? 'lignes tracées' : 'ligne tracée'],
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
            <Surtitre>{partage ? 'Les ouvertures' : 'Vos ouvertures'}</Surtitre>
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
                      className="mt-1 size-3 shrink-0 rounded-full"
                      style={{ background: tard ? '#fff' : couleurOuverture(o), boxShadow: `inset 0 0 0 2.5px ${couleurOuverture(o)}` }}
                    />
                    <span className="flex-1 font-bold">{o.nom}</span>
                    <span className="chiffres font-extrabold whitespace-nowrap text-rouge">+{n(o.voyageurs)}</span>
                  </motion.li>
                )
              })}
            </ol>
          </section>
        ) : null}

        {resultat.nonDepense > 0 ? (
          <p className="text-[14.5px] leading-relaxed text-gris">
            {partage ? 'Il reste' : 'Il vous reste'} {n(resultat.nonDepense)} M€ non dépensés à la fin du second mandat : de quoi lancer{' '}
            {ville.catalogue ? 'un projet de plus' : 'une ligne de plus'}, ou un premier chantier pour le mandat suivant.
          </p>
        ) : null}

        {resultat.plusGros ? (
          <p className="rounded-2xl bg-sable px-4 py-3.5 text-[14.5px] leading-relaxed text-gris">
            {partage ? 'Ce réseau laisse' : 'Vous laissez'} {resultat.laisses.length} projets à l’étude, pour {n(resultat.coutLaisse)} M€.
            Le plus cher est {resultat.plusGros.nom}, à {n(resoudre(resultat.plusGros).cout)} M€.
          </p>
        ) : null}

        <div className="flex flex-col gap-2 lg:mt-auto">
          {partage && confirmer ? (
            <div role="group" aria-labelledby="remplacer" className="flex flex-col gap-3 rounded-2xl bg-sable p-4">
              <p id="remplacer" className="text-[14.5px] leading-relaxed">
                Votre partie en cours sera remplacée par ce réseau, et vous ne pourrez pas la récupérer.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Bouton genre="rouge" onClick={reprendre}>
                  Remplacer ma partie
                </Bouton>
                <Bouton genre="contour" onClick={() => setConfirmer(false)}>
                  Garder ma partie
                </Bouton>
              </div>
            </div>
          ) : partage ? (
            <Bouton genre="rouge" icone="fleche" taille="grand" onClick={() => (aUnePartie ? setConfirmer(true) : reprendre())}>
              Jouer à partir de ce réseau
            </Bouton>
          ) : null}
          {partage && comparable ? (
            <Bouton genre="encre" icone="carte" onClick={() => setComparer(true)}>
              Comparer avec mon réseau
            </Bouton>
          ) : null}
          {!partage && communauteActive ? (
            jeu.publie ? (
              <Link
                href={`/reseau/${jeu.publie}`}
                className="flex min-h-14 items-center justify-between gap-2.5 rounded-full bg-rouge px-6 text-base font-extrabold text-white hover:bg-rouge-fonce"
              >
                Voir mon réseau publié
                <Icone nom="fleche" taille={19} epaisseur={2.3} />
              </Link>
            ) : (
              <Bouton genre="rouge" icone="partager" taille="grand" onClick={() => setPublier(true)}>
                Publier mon réseau
              </Bouton>
            )
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <Bouton genre={partage || communauteActive ? 'contour' : 'rouge'} icone="partager" onClick={copierLien}>
              {partage ? 'Copier le lien de ce réseau' : 'Partager le lien de mon réseau'}
            </Bouton>
            <Bouton genre="contour" icone="telecharger" onClick={() => partager(window.innerWidth < 1024 ? 'story' : 'paysage')}>
              Télécharger l’image
            </Bouton>
          </div>
          <p aria-live="polite" className="min-h-5 text-center text-[13px] font-semibold text-gris">
            {envoi ?? ''}
          </p>
          {partage ? (
            <Bouton genre="contour" icone="fleche" onClick={quitterPartage}>
              {aUnePartie ? 'Reprendre ma partie' : 'Commencer ma propre partie'}
            </Bouton>
          ) : (
            <Suite ville={ville} publie={jeu.publie !== null} />
          )}
        </div>

        {publication ? <PiedPublication publication={publication} ville={ville.id} /> : null}
      </div>

      <AnimatePresence>
        {!partage && publier ? (
          <Publier
            partie={{ ville: ville.id, chantiers, lignes, leviers }}
            voyageurs={resultat.voyageurs}
            investi={resultat.investi}
            inspire={jeu.inspire}
            fermer={fermerPublication}
            publie={jeu.marquerPublie}
          />
        ) : null}
        {partage && comparer ? (
          <Comparaison
            a={
              publication
                ? { titre: publication.titre, sujet: 'ce réseau', ...partage }
                : { titre: 'Le réseau reçu', sujet: 'le réseau reçu', ...partage }
            }
            b={{
              titre: jeu.ecran === 'bilan' ? 'Votre réseau' : 'Votre partie en cours',
              sujet: 'votre réseau',
              ville: jeu.ville,
              chantiers: jeu.chantiers,
              lignes: jeu.lignes,
              leviers: jeu.leviers,
            }}
            fermer={fermerComparaison}
          />
        ) : null}
      </AnimatePresence>
    </main>
  )
}

/** Après la partie : rejouer ici ou dans une autre ville, revenir à l'accueil, voir les réseaux des autres. */
function Suite({ ville, publie }: { ville: Ville; publie: boolean }) {
  const { commencer, allerAccueil } = useJeu()
  const autres = ID_VILLES.filter((id) => id !== ville.id).map((id) => VILLES[id])
  return (
    <section aria-labelledby="suite" className="mt-3 flex flex-col gap-3 border-t border-trait pt-5">
      <h2 id="suite" className="text-[17px] font-black">
        Rejouer
      </h2>
      <p className="text-[14px] leading-relaxed text-gris">
        {publie
          ? 'Une nouvelle partie remplace ce réseau dans ce navigateur. Il reste dans les réseaux publiés.'
          : 'Une nouvelle partie remplace ce réseau dans ce navigateur : publiez-le ou partagez son lien avant, pour le garder.'}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Bouton genre="encre" iconeAGauche="rejouer" onClick={() => commencer(ville.id)}>
          Rejouer à {ville.nom}
        </Bouton>
        {autres.map((v) => (
          <Bouton key={v.id} genre="contour" icone="fleche" onClick={() => commencer(v.id)}>
            Jouer à {v.nom}
          </Bouton>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[14px] font-extrabold lg:justify-start">
        <button type="button" onClick={allerAccueil} className="min-h-10 underline underline-offset-3">
          Retour à l’accueil
        </button>
        {communauteActive ? (
          <Link href={adresseReseaux(ville.id)} className="flex min-h-10 items-center underline underline-offset-3">
            Voir les réseaux publiés
          </Link>
        ) : null}
      </div>
    </section>
  )
}
