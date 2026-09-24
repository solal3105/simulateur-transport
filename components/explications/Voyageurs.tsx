'use client'

import { de, n } from '@/lib/format'
import { FORMULE } from '@/lib/formule'
import { COEFFICIENT_RESEAU, prixReseau } from '@/lib/couts'
import { FOURCHETTE } from '@/lib/modele'
import type { IdVille, Ville } from '@/lib/villes'

import { Deplier } from './Deplier'
import { Ecrire } from './Ecrire'

type Calage = { ligne: string; reel: number; ecart: number }[]

function Barres({ calage, max }: { calage: Calage; max: number }) {
  return (
    <>
      <div className="flex gap-4 text-xs font-bold text-gris">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3.5 rounded-sm bg-encre" />
          Réel, jour de semaine estimé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3.5 rounded-sm bg-rouge" />
          Notre estimation
        </span>
      </div>
      <div className="flex flex-col gap-2" role="list">
        {calage.map((c) => (
          <div key={c.ligne} role="listitem" className="grid grid-cols-[64px_1fr_48px] items-center gap-2.5 text-[12.5px]">
            <span className="font-extrabold">{c.ligne}</span>
            <span className="flex flex-col gap-0.5" aria-hidden="true">
              <span className="h-1.5 rounded-full bg-encre" style={{ width: `${Math.max(1, (c.reel / max) * 100)}%` }} />
              <span
                className="h-1.5 rounded-full bg-rouge"
                style={{ width: `${Math.max(1, ((c.reel * (1 + c.ecart / 100)) / max) * 100)}%` }}
              />
            </span>
            <span className="chiffres text-right font-extrabold text-gris">
              {c.ecart > 0 ? '+' : ''}
              {c.ecart} %
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

/** Un pourcentage entier, avec son signe quand il en faut un. */
const pourcent = (x: number) => `${Math.round(x * 100)} %`
/** 1000 m s'écrit « 1 km ». */
const metres = (m: number) => (m >= 1000 ? `${String(m / 1000).replace('.', ',')} km` : `${m} m`)

/** Ce que la formule dit du métro : son avantage vient surtout de la distance où l'on compte ses voyageurs. */
const phraseMetro = (gain: number) => {
  const loin = `Un métro compte les habitants et les emplois jusqu’à ${metres(FORMULE.rayonMetro)}, contre ${metres(FORMULE.rayonAutres)} pour les autres modes : c’est surtout par là qu’il attire plus de monde.`
  if (Math.abs(gain) < 0.1) return `${loin} À bassin égal, il fait à peu près comme un tram.`
  return gain > 0
    ? `${loin} À bassin égal, il attire encore ${pourcent(gain)} de voyageurs de plus qu’un tram.`
    : `${loin} À bassin égal, il en attire ${pourcent(-gain)} de moins qu’un tram.`
}

/** Comment les voyageurs suivent le bassin, selon son exposant dans la formule. */
const rythme = (b: number) => (b > 1.15 ? 'plus vite que' : b < 0.85 ? 'moins vite que' : 'presque en proportion de')

/** Ce qui fait le niveau propre de chaque ville, en plus de ses lignes actuelles. */
const niveauDeVille = () => {
  const v = FORMULE.variablesDeVille
  const parts = [
    v.includes('bassinVie') || v.includes('bassinVieProche') ? 'du nombre d’habitants de son agglomération' : '',
    v.includes('bassinEmploi') || v.includes('emploisCentre') ? 'de ses emplois' : '',
    v.includes('reseau') ? 'de la taille de son réseau' : '',
  ].filter(Boolean)
  return parts.length ? ` et ${parts.join(', ').replace(/, ([^,]*)$/, ' et $1')}` : ''
}

/** Ce que les lignes déjà décidées changent dans chaque ville, quand il y en a. */
export const LIGNES_DECIDEES: Partial<Record<IdVille, string>> = {
  toulouse:
    'La ligne C du métro ouvrira fin 2028, avant vos propres lignes. Nous la comptons donc comme une ligne existante, avec le prolongement de la ligne B à Labège : les habitants proches de leurs stations ne comptent pas comme nouveaux voyageurs dans votre score.',
  idf: 'Les lignes 15, 16, 17 et 18 du Grand Paris Express ouvriront entre 2026 et 2031, avant vos propres lignes. Nous les comptons donc comme des lignes existantes : les habitants proches de leurs gares ne comptent pas comme nouveaux voyageurs dans votre score.',
  nice: 'La ligne 5 du tram, de Nice à Drap par L’Ariane, a été décidée en 2026 mais n’est pas encore sur notre carte : vous pouvez la tracer vous-même.',
}

/** Le calcul des voyageurs d'une ligne, expliqué simplement, puis en détail pour qui veut vérifier. */
export function ExplicationVoyageurs({ ville }: { ville: Ville }) {
  const c = FORMULE.coefficients
  const calage = FORMULE.calage[ville.id]
  const max = Math.max(...calage.map((l) => Math.max(l.reel, l.reel * (1 + l.ecart / 100)))) * 1.05
  const perteConcurrence = 1 - Math.exp(c.concurrence ?? 0)
  const gainMetro = Math.exp(FORMULE.modes.metro) - 1
  const perteBus = 1 - Math.exp(FORMULE.modes.bus)
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[16px] leading-relaxed lg:text-[17px]">
        Nous comptons les habitants et les emplois autour de vos arrêts : à moins de {metres(FORMULE.rayonAutres)} d’un arrêt de tram, de
        bus ou de téléphérique, et à moins de {metres(FORMULE.rayonMetro)} d’une station de métro. Plus il y en a, plus votre ligne attire
        de voyageurs.
      </p>
      <p className="text-[15px] leading-relaxed">
        Une ligne qui passe près d’un tram ou d’un métro existant en attire moins, car une partie de ses voyageurs les prenaient déjà. Dans
        votre score, seuls comptent les voyageurs nouveaux pour le réseau.
      </p>
      <p className="text-[15px] leading-relaxed">
        Nous avons vérifié cette règle sur {FORMULE.lignes} lignes de {FORMULE.villes} villes françaises. Sur une ligne qu’elle ne connaît
        pas, elle se trompe en moyenne de {FORMULE.ecartVilleConnue} % : c’est pourquoi nous affichons toujours une fourchette.
      </p>
      {calage.length ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-sable p-4">
          <p className="text-[14.5px] leading-relaxed font-semibold">
            Ce qu’elle donne pour {calage.length > 1 ? 'les lignes' : 'la ligne'} {ville.territoire} dont nous connaissons la fréquentation,
            chacune estimée sans la connaître :
          </p>
          <Barres calage={calage.slice(0, 10)} max={max} />
        </div>
      ) : null}
      <p className="text-[15px] leading-relaxed">
        Le prix d’une ligne additionne sa voie, {prixReseau('tram', ville.id).km} M€ par km pour un tramway et{' '}
        {prixReseau('metro', ville.id).km} M€ pour un métro, ses stations, et ce que le terrain impose : un tunnel quand la pente est trop
        forte pour le mode, un pont pour chaque grand fleuve, une station de métro creusée plus profond sous une colline. Ces prix viennent
        de 53 chantiers français récents
        {COEFFICIENT_RESEAU[ville.id] > 1
          ? `, et nous les majorons de ${Math.round((COEFFICIENT_RESEAU[ville.id] - 1) * 100)} % ${ville.territoire.replace(/^de /, 'dans ').replace(/^d’/, 'en ')}, où l’on construit plus cher qu’ailleurs.`
          : '.'}
      </p>
      <Deplier titre="Voir le détail de la formule">
        <p className="text-[14.5px] leading-relaxed">
          Nous comptons les habitants et les emplois à moins de {metres(FORMULE.rayonMetro)} d’une station de métro, et à moins de{' '}
          {metres(FORMULE.rayonAutres)} d’un arrêt de tram, de bus ou de téléphérique
          {FORMULE.poidsCouronne
            ? `, plus ${pourcent(FORMULE.poidsCouronne)} de ceux qui vivent ou travaillent un peu plus loin, jusqu’à 1 km`
            : ''}
          . Un emploi compte pour {String(FORMULE.poidsEmplois).replace('.', ',')} habitant. Les habitants viennent du carroyage de l’INSEE
          à 200 m, les emplois du recensement 2022 répartis selon la base Sirene.
        </p>
        <p className="text-[14.5px] leading-relaxed">
          Les voyageurs croissent {rythme(c.bassin ?? 1)} ces habitants et emplois.
          {c.distanceCentre ? ' Ils baissent quand la ligne s’éloigne du centre.' : ''}
          {c.concurrence
            ? ` Ils baissent aussi quand la ligne double des lignes existantes : si tous ses arrêts sont déjà à moins de 400 m d’une station, elle perd ${pourcent(perteConcurrence)} de ses voyageurs.`
            : ''}{' '}
          {phraseMetro(gainMetro)} Un bus à haut niveau de service attire {pourcent(perteBus)} de voyageurs de moins qu’un tram sur les
          mêmes arrêts. Chaque réseau a enfin son propre niveau, tiré de ses lignes actuelles{niveauDeVille()}.
        </p>
        {FORMULE.ajustements[ville.id]?.metro ? (
          <p className="text-[14.5px] leading-relaxed">
            Le métro {ville.territoire} compte ses voyageurs aux entrées, sans les correspondances d’une ligne à l’autre. Nous estimons vos
            lignes de métro de la même façon, pour qu’elles se comparent aux lignes existantes.
          </p>
        ) : null}
        <p className="text-[14.5px] leading-relaxed">
          Pour arriver à cette formule, nous en avons essayé {n(FORMULE.formules)}, avec ou sans les correspondances, les gares, la distance
          au centre, le bassin de vie ou le bassin d’emploi, sur {FORMULE.lignes} lignes de métro, de tram et de bus de {FORMULE.villes}{' '}
          villes françaises. Chacune a été jugée sur des lignes qu’elle n’avait pas vues. Celle que nous gardons s’écarte du réel de{' '}
          {FORMULE.ecartVilleConnue} % en moyenne sur une ligne qu’elle ne connaît pas, et de {FORMULE.ecartVilleInconnue} % quand elle ne
          connaît aucune ligne du réseau. La fourchette affichée va de {String(FOURCHETTE.bas).replace('.', ',')} à{' '}
          {String(FOURCHETTE.haut).replace('.', ',')} fois notre estimation : sur les lignes que nous connaissons, le réel s’y trouve huit
          fois sur dix.
        </p>
        <p className="text-[14.5px] leading-relaxed">
          La formule ne connaît ni la vitesse ni la fréquence de la ligne, ni les grands équipements comme les hôpitaux ou les campus. Pour
          le téléphérique, aucune ligne dont nous connaissons la fréquentation ne permet de la caler : nous nous appuyons sur Téléo à
          Toulouse et sur le téléphérique de Brest, ce qui reste fragile. Les prix réels varient selon les ponts, les tunnels, les dépôts et
          les rames achetées.
        </p>
        {LIGNES_DECIDEES[ville.id] ? <p className="text-[14.5px] leading-relaxed">{LIGNES_DECIDEES[ville.id]}</p> : null}
        <p className="text-[13px] leading-relaxed text-gris">
          Fréquentation par ligne : rapports d’activité des réseaux, données ouvertes et observatoire Omnil, de 2019 à 2026, ramenée à un
          jour de semaine. Habitants : carroyage Filosofi 2021 recalé sur le recensement 2022. Emplois : recensement 2022 réparti selon la
          base Sirene. Lignes et arrêts : OpenStreetMap.
        </p>
      </Deplier>
    </div>
  )
}

/** L'invitation à corriger une estimation ou à signaler une fréquentation. */
export function EcrireVoyageurs({ ville, compact }: { ville: Ville; compact?: boolean }) {
  return (
    <Ecrire
      compact={compact}
      sujet={`les voyageurs ${de(ville.nom)}`}
      texte="Vous connaissez la fréquentation d’une ligne qui nous manque, ou une estimation vous semble fausse ? Écrivez-nous."
    />
  )
}
