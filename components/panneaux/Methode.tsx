'use client'

import { n } from '@/lib/format'
import { FORMULE } from '@/lib/formule'
import { FOURCHETTE } from '@/lib/modele'
import { useJeu, useVille } from '@/lib/store'
import type { IdVille, Ville } from '@/lib/villes'

import { Panneau } from './Panneau'

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
const LIGNES_DECIDEES: Partial<Record<IdVille, string>> = {
  toulouse:
    'La ligne C du métro ouvrira fin 2028, avant vos propres lignes. Nous la comptons donc comme une ligne existante, avec le prolongement de la ligne B à Labège : les habitants proches de leurs stations ne comptent pas comme nouveaux voyageurs dans votre score.',
  paris:
    'Les lignes 15, 16, 17 et 18 du Grand Paris Express ouvriront entre 2026 et 2031, avant vos propres lignes. Nous les comptons donc comme des lignes existantes : les habitants proches de leurs gares ne comptent pas comme nouveaux voyageurs dans votre score.',
  nice: 'La ligne 5 du tram, de Nice à Drap par L’Ariane, a été décidée en 2026 mais n’est pas encore sur notre carte : vous pouvez la tracer vous-même.',
}

function Contenu({ ville }: { ville: Ville }) {
  const c = FORMULE.coefficients
  const calage = FORMULE.calage[ville.id]
  const max = Math.max(...calage.map((l) => Math.max(l.reel, l.reel * (1 + l.ecart / 100)))) * 1.05
  const perteConcurrence = 1 - Math.exp(c.concurrence ?? 0)
  const gainMetro = Math.exp(FORMULE.modes.metro) - 1
  const perteBus = 1 - Math.exp(FORMULE.modes.bus)
  return (
    <>
      {ville.catalogue ? null : (
        <>
          <h3 className="text-lg font-black">Le budget</h3>
          <p className="text-[15px] leading-relaxed">{ville.budget}</p>
        </>
      )}
      <h3 className="text-lg font-black">Le prix</h3>
      <p className="text-[15px] leading-relaxed">
        Nous multiplions la longueur de votre tracé par un coût au kilomètre tiré de chantiers lyonnais récents : 34 M€ pour un tramway,
        comme la moyenne des T6 nord, T9 et T10, 15 M€ pour un bus à haut niveau de service et 150 M€ pour un métro automatique. Les prix
        réels varient selon les ponts, les tunnels, les dépôts et les rames achetées.
      </p>
      <h3 className="text-lg font-black">Les voyageurs</h3>
      <p className="text-[15px] leading-relaxed">
        Nous comptons les habitants et les emplois à moins de {metres(FORMULE.rayonMetro)} d’une station de métro, et à moins de{' '}
        {metres(FORMULE.rayonAutres)} d’un arrêt de tram, de bus ou de téléphérique
        {FORMULE.poidsCouronne ? `, plus ${pourcent(FORMULE.poidsCouronne)} de ceux qui vivent ou travaillent un peu plus loin, jusqu’à 1 km` : ''}.
        Un emploi compte pour {String(FORMULE.poidsEmplois).replace('.', ',')} habitant. Les habitants viennent du carroyage de l’INSEE à
        200 m, les emplois du recensement 2022 répartis selon la base Sirene.
      </p>
      <p className="text-[15px] leading-relaxed">
        Les voyageurs croissent {rythme(c.bassin ?? 1)} ces habitants et emplois.
        {c.distanceCentre ? ' Ils baissent quand la ligne s’éloigne du centre de la ville.' : ''}
        {c.concurrence
          ? ` Ils baissent aussi quand la ligne double des lignes existantes : si tous ses arrêts sont déjà à moins de 400 m d’une station, elle perd ${pourcent(perteConcurrence)} de ses voyageurs.`
          : ''}{' '}
        À bassin égal, un métro attire {pourcent(gainMetro)} de voyageurs de plus qu’un tram, et un bus à haut niveau de service{' '}
        {pourcent(perteBus)} de moins. Chaque ville a enfin son propre niveau, tiré de ses lignes actuelles{niveauDeVille()}.
      </p>
      {FORMULE.ajustements[ville.id]?.metro ? (
        <p className="text-[15px] leading-relaxed">
          À {ville.nom}, le métro compte ses voyageurs aux entrées, sans les correspondances d’une ligne à l’autre. Nous estimons vos lignes
          de métro de la même façon, pour qu’elles se comparent aux lignes existantes.
        </p>
      ) : null}
      <p className="text-[15px] leading-relaxed">
        Pour arriver à cette formule, nous en avons essayé {n(FORMULE.formules)}, avec ou sans les correspondances, les gares, la distance au
        centre, le bassin de vie ou le bassin d’emploi de la ville, sur {FORMULE.lignes} lignes de métro, de tram et de bus de{' '}
        {FORMULE.villes} villes françaises. Chacune a été jugée sur des lignes qu’elle n’avait pas vues. Celle que nous gardons s’écarte du
        réel de {FORMULE.ecartVilleConnue} % en moyenne sur une ligne qu’elle ne connaît pas, et de {FORMULE.ecartVilleInconnue} % quand elle ne
        connaît aucune ligne de la ville.
      </p>
      {calage.length ? (
        <>
          <p className="text-[15px] leading-relaxed">
            Voici ce qu’elle donne pour {calage.length > 1 ? `les lignes de ${ville.nom}` : `la ligne de ${ville.nom}`} dont nous connaissons la
            fréquentation, chacune prédite sans elle.
          </p>
          <Barres calage={calage.slice(0, 10)} max={max} />
        </>
      ) : null}
      <p className="text-[15px] leading-relaxed">
        C’est pourquoi nous affichons toujours une fourchette, de {String(FOURCHETTE.bas).replace('.', ',')} à{' '}
        {String(FOURCHETTE.haut).replace('.', ',')} fois notre estimation : sur les lignes que nous connaissons, le réel s’y trouve huit fois
        sur dix.
      </p>
      <h3 className="text-lg font-black">Ce que nous ne savons pas faire</h3>
      <p className="text-[15px] leading-relaxed">
        La formule ne connaît ni la vitesse ni la fréquence de la ligne, ni les grands équipements comme les hôpitaux ou les campus. Les
        correspondances ne l’améliorent pas : une fois comptés les habitants autour des arrêts et les lignes voisines, elles n’apportent rien
        de mesurable. Pour le téléphérique, aucune ligne dont nous connaissons la fréquentation ne permet de la caler : nous nous appuyons sur
        Téléo à Toulouse et sur le téléphérique de Brest, ce qui reste fragile.
      </p>
      {LIGNES_DECIDEES[ville.id] ? <p className="text-[15px] leading-relaxed">{LIGNES_DECIDEES[ville.id]}</p> : null}
      <p className="text-[15px] leading-relaxed">
        Pour le score, nous ne comptons que les voyageurs qui vivent ou travaillent loin d’un tram ou d’un métro existant. Les autres
        viendraient surtout d’une ligne voisine.
      </p>
      <p className="text-[13px] leading-relaxed text-gris">
        Fréquentation par ligne : rapports d’activité des réseaux, données ouvertes et observatoire Omnil, de 2019 à 2026, ramenée à un jour
        de semaine. Habitants : carroyage Filosofi 2021 recalé sur le recensement 2022. Emplois : recensement 2022 réparti selon la base
        Sirene. Lignes et arrêts : OpenStreetMap.
      </p>
    </>
  )
}

export function Methode() {
  const { brouillon, ouvrir, fermer } = useJeu()
  const ville = useVille()
  return (
    <Panneau
      titre="Comment nous estimons une ligne"
      hauteurTelephone="pleine"
      onFermer={() => (brouillon ? ouvrir({ type: 'ligne' }) : fermer())}
    >
      <Contenu ville={ville} />
    </Panneau>
  )
}
