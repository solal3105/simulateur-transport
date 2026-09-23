'use client'

import { clsx } from 'clsx'
import Link from 'next/link'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { communauteActive, listerReseaux, reseauxDe, useProfilLocal, type ReseauPublie } from '@/lib/communaute'
import { n } from '@/lib/format'
import { villeDePartie } from '@/lib/partie'
import { useJeu } from '@/lib/store'
import { adresseAccueil, adresseReseaux, estVille, ID_VILLES, VILLES, type IdVille } from '@/lib/villes'

import { useCouleursReseau } from '../couleurs'
import { Bouton, BoutonLien, Icone, Logo, useChoixVisible } from '../ui'
import { MiniCarte } from './MiniCarte'

type Onglet = 'populaires' | 'recents' | 'miens'

const titre = (onglet: Onglet, ville: IdVille, libre: boolean) =>
  onglet === 'miens'
    ? 'Vos réseaux publiés'
    : `${onglet === 'populaires' ? `Les réseaux les plus soutenus pour ${VILLES[ville].nom}` : `Les derniers réseaux publiés pour ${VILLES[ville].nom}`}${
        libre ? ', en jeu libre' : ''
      }`

/** La ville demandée dans l'adresse (?ville=toulouse), lue sans décalage entre le serveur et le navigateur. */
function useVilleAdresse() {
  const brut = useSyncExternalStore(
    (changer) => {
      window.addEventListener('popstate', changer)
      return () => window.removeEventListener('popstate', changer)
    },
    () => new URLSearchParams(window.location.search).get('ville'),
    () => null,
  )
  return estVille(brut) ? brut : 'lyon'
}

const pluriel = (nombre: number, mot: string) => `${n(nombre)} ${mot}${nombre > 1 ? 's' : ''}`

/**
 * Où mène « jouer » depuis les réseaux publiés : la partie enregistrée dans ce navigateur s'il y en a
 * une, sinon une nouvelle partie dans la ville affichée.
 */
function useVersLaPartie(ville: IdVille) {
  const enCours = useJeu((s) => s.ecran !== 'accueil')
  const villePartie = useJeu((s) => s.ville)
  useEffect(() => {
    void useJeu.persist.rehydrate()
  }, [])
  return { enCours, href: adresseAccueil(enCours ? villePartie : ville) }
}

/** L'en-tête des réseaux publiés : leur nom, et un bouton qui dit où il mène. */
export function EnteteCommunaute({ ville = 'lyon', children }: { ville?: IdVille; children?: React.ReactNode }) {
  const { enCours, href } = useVersLaPartie(ville)
  return (
    <header className="bg-rouge text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 pt-4 lg:px-8 lg:pt-5">
        <div className="flex items-center justify-between gap-3">
          <Link href={adresseReseaux(ville)} className="flex items-center gap-2.5">
            <Logo taille={36} inverse />
            <span className="text-[20px] leading-tight font-black tracking-tight lg:text-[24px]">Réseaux publiés</span>
          </Link>
          <Link
            href={href}
            className="flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-white/18 px-4 text-[13.5px] font-extrabold transition-colors hover:bg-white/28"
          >
            {/* Sur téléphone, un libellé court laisse le titre sur une ligne. */}
            <span className="lg:hidden">{enCours ? 'Ma partie' : 'Jouer'}</span>
            <span className="hidden lg:inline">{enCours ? 'Reprendre ma partie' : 'Commencer une partie'}</span>
            <Icone nom="fleche" taille={16} epaisseur={2.4} />
          </Link>
        </div>
        {children ?? <div className="h-3" />}
      </div>
    </header>
  )
}

/** Un réseau publié en vignette. `avecVille` remplace le pseudo par la ville, pour la liste de ses propres réseaux. */
export function CarteReseau({ reseau, avecVille }: { reseau: ReseauPublie; avecVille?: boolean }) {
  return (
    <Link
      href={`/reseau/${reseau.id}`}
      className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_10px_rgb(0_0_0/0.07),inset_0_0_0_1px_var(--color-trait)] transition-shadow hover:shadow-[0_6px_20px_rgb(0_0_0/0.12),inset_0_0_0_1px_var(--color-trait)]"
    >
      <div className="h-[170px]">
        <MiniCarte partie={reseau.partie} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="flex items-center justify-between gap-2 text-[13px] font-bold text-gris">
          {avecVille ? VILLES[villeDePartie(reseau.partie) ?? 'lyon'].nom : (reseau.auteur?.pseudo ?? 'Anonyme')}
          {reseau.libre ? (
            <span className="shrink-0 rounded-full bg-encre px-2 py-0.5 text-[11.5px] font-extrabold text-white">Jeu libre</span>
          ) : null}
        </span>
        <span className="text-[17px] leading-tight font-black">{reseau.titre}</span>
        {reseau.intention ? <p className="line-clamp-3 text-[13.5px] leading-relaxed text-gris">{reseau.intention}</p> : null}
        <div className="chiffres mt-auto flex flex-wrap gap-x-3.5 gap-y-1 pt-1 text-[13px] font-extrabold">
          <span className="text-rouge">+{n(reseau.voyageurs)} voy./jour</span>
          <span>{n(reseau.investi)} M€</span>
        </div>
        <div className="flex gap-4 border-t border-trait pt-2 text-[13px] font-extrabold text-gris">
          <span className="flex items-center gap-1.5">
            <Icone nom="valider" taille={15} epaisseur={2.6} />
            {pluriel(reseau.soutiens, 'soutien')}
          </span>
          <span className="flex items-center gap-1.5">
            <Icone nom="rejouer" taille={15} />
            {pluriel(reseau.reprises, 'reprise')}
          </span>
        </div>
      </div>
    </Link>
  )
}

/** La page de la communauté : les réseaux publiés dans une ville, les plus soutenus ou les plus récents. */
export function Communaute() {
  const [onglet, setOnglet] = useState<Onglet>('populaires')
  const villeAdresse = useVilleAdresse()
  const [choix, setChoix] = useState<IdVille | null>(null)
  const ville = choix ?? villeAdresse
  useCouleursReseau(ville)
  const rangee = useChoixVisible<HTMLDivElement>(ville)
  // Les réseaux du jeu libre, sans budget à tenir, ne sont jamais classés avec les autres.
  const [libre, setLibre] = useState(false)
  const profil = useProfilLocal()
  const versLaPartie = useVersLaPartie(ville)
  // Chaque réponse porte la clé de sa demande : un changement d'onglet affiche le chargement sans effacer d'état.
  const [essai, setEssai] = useState(0)
  const demande = `${onglet}:${ville}:${libre}:${profil?.id ?? ''}:${essai}`
  const [reponse, setReponse] = useState<{ demande: string; reseaux?: ReseauPublie[]; erreur?: string } | null>(null)

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

  const actuelle = reponse?.demande === demande ? reponse : null
  const reseaux = actuelle?.reseaux ?? null
  const erreur = actuelle?.erreur ?? null

  const onglets: Onglet[] = profil ? ['populaires', 'recents', 'miens'] : ['populaires', 'recents']
  const choisir = (id: IdVille) => {
    setChoix(id)
    window.history.replaceState(null, '', id === 'lyon' ? '/communaute' : `/communaute?ville=${id}`)
  }

  return (
    <div className="min-h-dvh bg-[#faf9f7]">
      <EnteteCommunaute ville={ville}>
        <nav aria-label="Listes de réseaux" className="-mb-px flex gap-6">
          {onglets.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={onglet === o}
              onClick={() => setOnglet(o)}
              className={clsx(
                'border-b-3 pt-1 pb-2.5 text-[14.5px] font-extrabold transition-opacity',
                onglet === o ? 'border-white' : 'border-transparent opacity-80 hover:opacity-100',
              )}
            >
              {o === 'populaires' ? 'Populaires' : o === 'recents' ? 'Récents' : 'Mes réseaux'}
            </button>
          ))}
        </nav>
      </EnteteCommunaute>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 pt-6 pb-16 lg:px-8 lg:pt-8">
        {onglet !== 'miens' ? (
          <div className="flex flex-col gap-3">
            <div
              ref={rangee}
              role="radiogroup"
              aria-label="Réseau"
              className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0"
            >
              {ID_VILLES.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={ville === id}
                  onClick={() => choisir(id)}
                  className={clsx(
                    'flex shrink-0 flex-col items-start rounded-2xl px-3.5 py-2 text-left transition-colors',
                    ville === id ? 'bg-encre text-white' : 'bg-white shadow-[inset_0_0_0_1.5px_var(--color-trait)] hover:bg-sable',
                  )}
                >
                  <span className="text-[14px] leading-tight font-extrabold whitespace-nowrap">{VILLES[id].nom}</span>
                  <span
                    className={clsx(
                      'text-[11.5px] leading-tight font-semibold whitespace-nowrap',
                      ville === id ? 'opacity-80' : 'text-gris',
                    )}
                  >
                    {VILLES[id].lieu}
                  </span>
                </button>
              ))}
            </div>
            <div
              role="radiogroup"
              aria-label="Façon de jouer"
              className="flex self-start rounded-full bg-white p-1 shadow-[inset_0_0_0_1.5px_var(--color-trait)]"
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
                    'min-h-9 rounded-full px-3.5 text-[13.5px] font-extrabold transition-colors',
                    libre === o.valeur ? 'bg-rouge text-white' : 'text-gris hover:text-encre',
                  )}
                >
                  {o.texte}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <h1 className="text-[24px] leading-tight font-black tracking-tight lg:text-[28px]">{titre(onglet, ville, libre)}</h1>

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
          <div className="flex max-w-[640px] flex-col items-start gap-4">
            <p className="text-[15px] leading-relaxed text-gris">
              {onglet === 'miens'
                ? 'Vous n’avez encore rien publié depuis ce navigateur.'
                : libre
                  ? 'Aucun réseau en jeu libre n’a encore été publié ici. Choisissez « Jouer sans limite de budget » en commençant une partie, puis publiez votre réseau depuis le bilan.'
                  : 'Aucun réseau n’a encore été publié. Terminez une partie, puis publiez votre réseau depuis le bilan : il apparaîtra ici.'}
            </p>
            <BoutonLien href={versLaPartie.href} icone="fleche">
              {versLaPartie.enCours ? 'Reprendre ma partie' : 'Commencer une partie'}
            </BoutonLien>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {reseaux.map((r) => (
              <CarteReseau key={r.id} reseau={r} avecVille={onglet === 'miens'} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
