import { ImageResponse } from 'next/og'
import type { ReactElement, ReactNode } from 'react'

import { libre } from './budget'
import { CATALOGUE } from './catalogue'
import { couleurLigne } from './couleurs'
import { enLettres, n } from './format'
import { FORMULE } from './formule'
import { cadreMiniature, cheminsFond, cheminsReseau } from './miniature'
import { stationsDuTrace } from './modele'
import { polices } from './og'
import type { PartieCompacte } from './partie'
import type { ModeLigne } from './types'
import { MARQUE, VILLES, type IdVille, type Ville } from './villes'
import fondLyon from '@/public/data/fond.json'
import projetsLyon from '@/public/data/projets.json'
import fondIdf from '@/public/data/idf/fond.json'
import projetsIdf from '@/public/data/idf/projets.json'
import fondMarseille from '@/public/data/marseille/fond.json'
import projetsMarseille from '@/public/data/marseille/projets.json'
import fondNice from '@/public/data/nice/fond.json'
import projetsNice from '@/public/data/nice/projets.json'
import fondToulouse from '@/public/data/toulouse/fond.json'
import projetsToulouse from '@/public/data/toulouse/projets.json'

/**
 * Les images qui accompagnent un lien vers le simulateur sur les réseaux sociaux et les messageries, une par
 * situation : l'accueil d'un réseau, sa page de méthode, les réseaux publiés, un réseau publié et une partie
 * partagée par lien. Toutes suivent la même affiche : la couleur du réseau, le texte à gauche et la carte à
 * droite, qui déborde du cadre. Les chiffres viennent du jeu lui-même, jamais écrits à la main.
 */

export const TAILLE = { width: 1200, height: 630 }

type Fond = Parameters<typeof cheminsFond>[0]
type Projets = Parameters<typeof cheminsReseau>[0]

const DONNEES: Record<IdVille, { fond: Fond; projets: Projets }> = {
  lyon: { fond: fondLyon as unknown as Fond, projets: projetsLyon as unknown as Projets },
  toulouse: { fond: fondToulouse as unknown as Fond, projets: projetsToulouse as unknown as Projets },
  marseille: { fond: fondMarseille as unknown as Fond, projets: projetsMarseille as unknown as Projets },
  nice: { fond: fondNice as unknown as Fond, projets: projetsNice as unknown as Projets },
  idf: { fond: fondIdf as unknown as Fond, projets: projetsIdf as unknown as Projets },
}

/** La police n'a pas l'espace fine insécable que le français met entre les milliers. */
export const nombre = (v: number) => n(v).replace(/ /g, ' ')

/** Une couleur « #rrggbb » avec une opacité, pour les dégradés. */
const avecOpacite = (hex: string, a: number) => {
  const v = parseInt(hex.slice(1), 16)
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${a})`
}

/** Écart entre deux couleurs « #rrggbb », pour ne pas dessiner une ligne rouge sur le rouge de TCL. */
const ecart = (a: string, b: string) => {
  const [x, y] = [parseInt(a.slice(1), 16), parseInt(b.slice(1), 16)]
  return Math.hypot(((x >> 16) & 255) - ((y >> 16) & 255), ((x >> 8) & 255) - ((y >> 8) & 255), (x & 255) - (y & 255))
}
const ENCRE = '#17171b'

/** Un tracé à mettre en valeur sur la carte, avec les arrêts d'une ligne dessinée par un joueur. */
interface Trace {
  d: string
  couleur: string
  arrets?: [number, number][]
}

/** La zone de la carte sur l'affiche : elle occupe la droite et passe sous le dégradé du texte. */
const CARTE = { x: 500, largeur: 700 }

/**
 * Le cadre de la carte : la vue de départ du réseau, ou, s'il y a des tracés, la zone qui les contient
 * avec une marge, pour qu'un réseau de trois lignes ne se perde pas dans l'agglomération.
 */
function cadre(ville: Ville, traces: Trace[]) {
  const base = cadreMiniature(ville).viewBox.split(' ').map(Number) as [number, number, number, number]
  const nombres = traces.flatMap((t) => t.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [])
  const ratio = CARTE.largeur / TAILLE.height
  if (nombres.length < 4) return { vue: base, fixe: false }
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  for (let i = 0; i + 1 < nombres.length; i += 2) {
    x0 = Math.min(x0, nombres[i]!)
    x1 = Math.max(x1, nombres[i]!)
    y0 = Math.min(y0, nombres[i + 1]!)
    y1 = Math.max(y1, nombres[i + 1]!)
  }
  let w = Math.max(x1 - x0, 240) * 1.3
  let h = Math.max(y1 - y0, 240) * 1.3
  if (w / h < ratio) w = h * ratio
  else h = w / ratio
  // Le bord gauche passe sous le dégradé : on décale un peu le centre vers la droite de la zone.
  const cx = (x0 + x1) / 2 - w * 0.06
  const cy = (y0 + y1) / 2
  return { vue: [cx - w / 2, cy - h / 2, w, h] as [number, number, number, number], fixe: true }
}

/** La carte d'un réseau, en traits blancs sur sa couleur, et ses tracés mis en valeur. */
function Carte({ ville, traces, discret }: { ville: Ville; traces: Trace[]; discret?: boolean }) {
  const fond = cheminsFond(DONNEES[ville.id].fond, ville)
  const { xy } = cadreMiniature(ville)
  const { vue, fixe } = cadre(ville, traces)
  // Les épaisseurs sont données en pixels de l'image, quelle que soit l'échelle de la carte.
  const k = vue[2] / CARTE.largeur
  const existant = traces.length > 0 || discret ? 0.35 : 0.8
  // Une ligne de la couleur du réseau se perdrait sur son fond : elle passe à l'encre, toujours cernée de blanc.
  const teinte = (couleur: string) => (ecart(couleur, ville.couleurs.principale) < 90 ? ENCRE : couleur)
  return (
    <svg
      width={CARTE.largeur}
      height={TAILLE.height}
      viewBox={vue.join(' ')}
      preserveAspectRatio={fixe ? 'xMidYMid meet' : 'xMidYMid slice'}
      style={{ position: 'absolute', left: CARTE.x, top: 0 }}
    >
      <path d={fond.mer} fill="#ffffff" fillOpacity={0.14} fillRule="evenodd" />
      <path
        d={fond.fleuves}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.2}
        strokeWidth={9 * k}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={fond.tram} fill="none" stroke="#ffffff" strokeOpacity={existant * 0.7} strokeWidth={2.5 * k} strokeLinecap="round" />
      <path d={fond.metro} fill="none" stroke="#ffffff" strokeOpacity={existant} strokeWidth={4.5 * k} strokeLinecap="round" />
      {traces.map((t, i) => (
        <path key={`b${i}`} d={t.d} fill="none" stroke="#ffffff" strokeWidth={15 * k} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {traces.map((t, i) => (
        <path
          key={`c${i}`}
          d={t.d}
          fill="none"
          stroke={teinte(t.couleur)}
          strokeWidth={9 * k}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {traces.flatMap((t, i) =>
        (t.arrets ?? []).map(([lon, lat], j) => {
          const [x, y] = xy(lon, lat)
          return <circle key={`s${i}-${j}`} cx={x} cy={y} r={5.5 * k} fill="#ffffff" stroke={teinte(t.couleur)} strokeWidth={3.5 * k} />
        }),
      )}
    </svg>
  )
}

/** Une étiquette blanche, pour un chiffre ou un statut. */
function Pastille({ ville, children }: { ville: Ville; children: string }) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '9px 18px',
        marginRight: 10,
        borderRadius: 999,
        background: '#ffffff',
        color: ville.couleurs.fonce,
        fontSize: 21,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  )
}

/** L'affiche commune : la couleur du réseau, la carte à droite, et le texte par-dessus un dégradé. */
function Affiche({ ville, traces, discret, children }: { ville: Ville; traces: Trace[]; discret?: boolean; children: ReactNode }) {
  const c = ville.couleurs.principale
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: c, fontFamily: 'Figtree' }}>
      <Carte ville={ville} traces={traces} discret={discret} />
      <div
        style={{
          position: 'absolute',
          left: CARTE.x - 1,
          top: 0,
          width: 240,
          height: TAILLE.height,
          backgroundImage: `linear-gradient(90deg, ${c} 0%, ${avecOpacite(c, 0.85)} 35%, ${avecOpacite(c, 0)} 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 720,
          height: TAILLE.height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 0 48px 56px',
          color: '#ffffff',
        }}
      >
        {children}
      </div>
    </div>
  )
}

const Surtitre = ({ children }: { children: string }) => (
  <div style={{ display: 'flex', fontSize: 25, fontWeight: 700, color: 'rgba(255,255,255,0.82)' }}>{children}</div>
)

/** Un titre qui rapetisse quand il s'allonge, pour tenir en trois lignes. */
function Titre({ children, marge = 18 }: { children: string; marge?: number }) {
  const taille = children.length > 48 ? 50 : children.length > 34 ? 58 : 68
  return (
    <div
      style={{
        display: 'flex',
        maxWidth: 610,
        fontSize: taille,
        fontWeight: 900,
        lineHeight: 1.02,
        letterSpacing: -taille / 30,
        marginTop: marge,
      }}
    >
      {children}
    </div>
  )
}

const Rangee = ({ children }: { children: ReactNode }) => <div style={{ display: 'flex', flexWrap: 'wrap' }}>{children}</div>

const rendre = async (contenu: ReactElement) => new ImageResponse(contenu, { ...TAILLE, fonts: await polices })

/** Ce qui revient au joueur sur les deux mandats, une fois payés les projets décidés, les bus et les lignes existantes. */
const pourVosLignes = (ville: Ville) => `${enLettres(libre(ville.budget, 1) + libre(ville.budget, 2))} d’euros pour vos lignes`

/** Les tracés des projets du catalogue lyonnais, pour montrer ce qu'on peut y décider. */
function tracesCatalogue(ville: Ville): Trace[] {
  if (!ville.catalogue) return []
  const partie: PartieCompacte = {
    v: 1,
    c: CATALOGUE.filter((p) => p.trace).map((p) => [p.id, 1, 0, '', 0]),
    l: [],
    f: {} as PartieCompacte['f'],
  }
  return cheminsReseau(DONNEES[ville.id].projets, partie, ville).map((t) => ({ d: t.d, couleur: t.couleur }))
}

/** L'image de l'accueil d'un réseau : ce qu'on y fait, avec l'argent disponible et le réseau actuel. */
export function imageAccueil(ville: Ville) {
  const projets = CATALOGUE.filter((p) => p.trace).length
  return rendre(
    <Affiche ville={ville} traces={[]}>
      <Surtitre>{`${MARQUE}, ${ville.nom}`}</Surtitre>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Titre marge={0}>{`Construisez le réseau ${ville.reseau} de 2038.`}</Titre>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginTop: 22, maxWidth: 540 }}>
          {ville.catalogue
            ? `Choisissez parmi ${projets} projets réels ou tracez vos propres lignes : nous calculons leur prix et leurs voyageurs.`
            : 'Tracez vos lignes de tram, de bus, de métro ou de téléphérique : nous calculons leur prix et leurs voyageurs.'}
        </div>
      </div>
      <Rangee>
        <Pastille ville={ville}>{pourVosLignes(ville)}</Pastille>
        <Pastille ville={ville}>Accès anticipé</Pastille>
      </Rangee>
    </Affiche>,
  )
}

/** L'accueil lyonnais montre en plus les projets du catalogue sur sa carte. */
export function imageAccueilLyon() {
  const ville = VILLES.lyon
  const projets = CATALOGUE.filter((p) => p.trace).length
  return rendre(
    <Affiche ville={ville} traces={tracesCatalogue(ville)}>
      <Surtitre>{`${MARQUE}, ${ville.nom}`}</Surtitre>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Titre marge={0}>{`Construisez le réseau ${ville.reseau} de 2038.`}</Titre>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginTop: 22, maxWidth: 540 }}>
          {`Deux mandats, ${projets} projets réels sur la table, et vos propres lignes à tracer. Lesquels verront le jour ?`}
        </div>
      </div>
      <Rangee>
        <Pastille ville={ville}>{pourVosLignes(ville)}</Pastille>
        <Pastille ville={ville}>Accès anticipé</Pastille>
      </Rangee>
    </Affiche>,
  )
}

/** Le chiffre qui s'affiche en grand, avec sa légende. */
const Chiffre = ({ valeur, legende }: { valeur: string; legende: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', marginRight: 22, width: 196 }}>
    <div style={{ display: 'flex', fontSize: 36, fontWeight: 900, letterSpacing: -1, whiteSpace: 'nowrap' }}>{valeur}</div>
    <div style={{ display: 'flex', fontSize: 19, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: 'rgba(255,255,255,0.88)' }}>
      {legende}
    </div>
  </div>
)

/** Le nombre de chantiers réels sur lesquels sont calés les coûts des lignes (docs/couts.md). */
const CHANTIERS_COUTS = 53

/** L'image de la page qui explique les calculs d'un réseau. */
export function imageMethode(ville: Ville) {
  const total = ville.budget.total.montants
  return rendre(
    <Affiche ville={ville} traces={[]} discret>
      <Surtitre>{`${MARQUE}, ${ville.nom}`}</Surtitre>
      <Titre marge={0}>Comment nous calculons votre budget, vos coûts et vos voyageurs</Titre>
      <Rangee>
        <Chiffre
          valeur={enLettres(total[1])
            .replace('millions', 'M€')
            .replace(/milliards?/, 'Md€')}
          legende="d’investissement au premier mandat"
        />
        <Chiffre valeur={`${CHANTIERS_COUTS} chantiers`} legende="pour estimer le coût d’une ligne" />
        <Chiffre valeur={`${FORMULE.lignes} lignes`} legende={`de ${FORMULE.villes} villes pour estimer ses voyageurs`} />
      </Rangee>
    </Affiche>,
  )
}

/** Ce qu'il faut savoir d'un réseau pour son image : publié par un joueur, ou reçu par un lien. */
export interface ReseauApercu {
  partie: PartieCompacte
  titre: string
  /** « par Solal », ou rien pour une partie partagée par lien. */
  auteur?: string
  voyageurs: number
  investi: number
  libre: boolean
  /** Le budget des deux mandats est tenu ; absent quand on ne le sait pas. */
  equilibre?: boolean
}

/** L'image d'un réseau : sa carte, son titre, les voyageurs qu'il gagne et ce qu'il coûte. */
export function imageReseau(ville: Ville, r: ReseauApercu) {
  const traces: Trace[] = [
    ...cheminsReseau(DONNEES[ville.id].projets, { ...r.partie, l: [] }, ville),
    // Les points de passage guident le tracé sans être des stations : pas de rond pour eux.
    ...r.partie.l.map((l) => ({
      d: cadreMiniature(ville).chemin([l.a]),
      couleur: couleurLigne(l.m as ModeLigne),
      arrets: l.a.filter((_, i) => stationsDuTrace(l.a.length, l.p)[i]),
    })),
  ]
  const lignes = r.partie.l.length
  const projets = r.partie.c.length
  const contenu = [
    projets ? `${projets} projet${projets > 1 ? 's' : ''}` : '',
    lignes ? `${lignes} ligne${lignes > 1 ? 's' : ''} tracée${lignes > 1 ? 's' : ''}` : '',
  ]
    .filter(Boolean)
    .join(' et ')
  return rendre(
    <Affiche ville={ville} traces={traces}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Surtitre>{`${MARQUE}, ${ville.nom} en 2038${r.libre ? ', jeu libre' : ''}`}</Surtitre>
        <Titre>{r.titre}</Titre>
        {r.auteur ? (
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, marginTop: 14, color: 'rgba(255,255,255,0.9)' }}>{r.auteur}</div>
        ) : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{ display: 'flex', fontSize: 96, fontWeight: 900, lineHeight: 1, letterSpacing: -3.5 }}
        >{`+${nombre(r.voyageurs)}`}</div>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, marginTop: 4, marginBottom: 22 }}>voyageurs par jour</div>
        <Rangee>
          <Pastille ville={ville}>{`${nombre(r.investi)} M€ investis`}</Pastille>
          {contenu ? <Pastille ville={ville}>{contenu}</Pastille> : null}
          {r.equilibre && !r.libre ? <Pastille ville={ville}>Budget tenu</Pastille> : null}
        </Rangee>
      </div>
    </Affiche>,
  )
}

/** Un réseau publié, tel que la page des réseaux publiés le montre en vitrine. */
export interface Vitrine {
  ville: IdVille
  titre: string
  voyageurs: number
  partie: PartieCompacte
}

/** Une petite carte de réseau publié, dans sa couleur, pour la vitrine des réseaux publiés. */
function CarteVitrine({ v, rotation }: { v: Vitrine; rotation: number }) {
  const ville = VILLES[v.ville]
  const traces = cheminsReseau(DONNEES[ville.id].projets, v.partie, ville)
  const fond = cheminsFond(DONNEES[ville.id].fond, ville)
  const cadreBase = cadreMiniature(ville).viewBox
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 300,
        height: 380,
        marginLeft: -40,
        borderRadius: 28,
        overflow: 'hidden',
        background: ville.couleurs.principale,
        border: '6px solid #ffffff',
        transform: `rotate(${rotation}deg)`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
      }}
    >
      <svg width={288} height={250} viewBox={cadreBase} preserveAspectRatio="xMidYMid slice">
        <path d={fond.mer} fill="#ffffff" fillOpacity={0.14} fillRule="evenodd" />
        <path d={fond.fleuves} fill="none" stroke="#ffffff" strokeOpacity={0.2} strokeWidth={9} strokeLinecap="round" />
        <path d={fond.metro} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
        {traces.map((t, i) => (
          <path key={`b${i}`} d={t.d} fill="none" stroke="#ffffff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {traces.map((t, i) => (
          <path
            key={`c${i}`}
            d={t.d}
            fill="none"
            stroke={ecart(t.couleur, ville.couleurs.principale) < 90 ? ENCRE : t.couleur}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 20px', color: '#ffffff' }}>
        <div style={{ display: 'flex', fontSize: 22, fontWeight: 900, lineHeight: 1.1, maxHeight: 50, overflow: 'hidden' }}>{v.titre}</div>
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 900, letterSpacing: -1, marginTop: 6 }}>{`+${nombre(v.voyageurs)}`}</div>
        <div style={{ display: 'flex', fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>voyageurs par jour</div>
      </div>
    </div>
  )
}

/** L'image de la page des réseaux publiés : les plus soutenus en vitrine, et combien il y en a. */
export function imageCommunaute(vitrine: Vitrine[], total: number) {
  const villes = new Set(vitrine.map((v) => v.ville)).size
  const rotations = [-7, 3, 9]
  return rendre(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: ENCRE, fontFamily: 'Figtree', color: '#ffffff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 560, padding: '52px 0 52px 56px' }}>
        <Surtitre>{MARQUE}</Surtitre>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 900, lineHeight: 1.02, letterSpacing: -2.2 }}>
            Les réseaux imaginés par les joueurs
          </div>
          <div style={{ display: 'flex', fontSize: 27, fontWeight: 700, lineHeight: 1.3, marginTop: 20, color: 'rgba(255,255,255,0.85)' }}>
            Soutenez ceux que vous aimez, comparez-les au vôtre, reprenez-les pour votre partie.
          </div>
        </div>
        {total > 0 ? (
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 900 }}>
            {`${nombre(total)} réseau${total > 1 ? 'x' : ''} publié${total > 1 ? 's' : ''}${villes > 1 ? ` sur ${villes} territoires` : ''}`}
          </div>
        ) : (
          <div style={{ display: 'flex' }} />
        )}
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', paddingRight: 30 }}>
        {vitrine.length > 0
          ? vitrine.map((v, i) => <CarteVitrine key={i} v={v} rotation={rotations[i] ?? 0} />)
          : (['lyon', 'toulouse', 'marseille'] as IdVille[]).map((id, i) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  width: 220,
                  height: 300,
                  marginLeft: -30,
                  padding: 22,
                  borderRadius: 28,
                  background: VILLES[id].couleurs.principale,
                  border: '6px solid #ffffff',
                  transform: `rotate(${rotations[i]}deg)`,
                  fontSize: 30,
                  fontWeight: 900,
                }}
              >
                {VILLES[id].nom}
              </div>
            ))}
      </div>
    </div>,
  )
}
