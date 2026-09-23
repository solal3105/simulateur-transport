'use client'

import { n } from '@/lib/format'
import { useJeu, useVille } from '@/lib/store'
import type { Ville } from '@/lib/villes'

import { Panneau } from './Panneau'

type Calage = { ligne: string; reel: number; ecart: number }[]

/** Lyon : écarts de la formule sur chaque ligne, quand on la prédit avec les dix autres. */
const CALAGE_LYON: Calage = [
  { ligne: 'Métro D', reel: 307000, ecart: -38 },
  { ligne: 'Métro A', reel: 271000, ecart: -15 },
  { ligne: 'Métro B', reel: 173000, ecart: 20 },
  { ligne: 'Tram T4', reel: 108000, ecart: 28 },
  { ligne: 'Tram T1', reel: 104000, ecart: 21 },
  { ligne: 'Tram T2', reel: 98000, ecart: 2 },
  { ligne: 'Tram T3', reel: 52000, ecart: -15 },
  { ligne: 'Métro C', reel: 34000, ecart: 39 },
  { ligne: 'Tram T6', reel: 29000, ecart: -14 },
  { ligne: 'Tram T5', reel: 8500, ecart: -1 },
  { ligne: 'Tram T7', reel: 2800, ecart: -7 },
]

/**
 * Toulouse : validations 2024 divisées par 265, et écarts de la formule une fois recalée sur ces
 * trois lignes (résultats de la formule lyonnaise multipliés par 1,45). Voir docs/villes.md.
 */
const CALAGE_TOULOUSE: Calage = [
  { ligne: 'Métro A', reel: 228300, ecart: -17 },
  { ligne: 'Métro B', reel: 218100, ecart: 6 },
  { ligne: 'Tram T1', reel: 48700, ecart: 13 },
]

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

function Lyon() {
  return (
    <>
      <h3 className="text-lg font-black">Le prix</h3>
      <p className="text-[15px] leading-relaxed">
        Nous multiplions la longueur de votre tracé par un coût au kilomètre tiré de chantiers récents. Pour le tramway, c’est la moyenne
        des T6 nord, T9 et T10 de Lyon, soit environ 34 M€ par kilomètre. Les prix réels varient selon les ponts, les dépôts et les rames
        achetées.
      </p>
      <h3 className="text-lg font-black">Les voyageurs</h3>
      <p className="text-[15px] leading-relaxed">
        Nous comptons les habitants et les emplois à moins de 400 m de chaque arrêt de tram ou de bus, et à moins de 600 m d’une station de
        métro. Les habitants viennent du carroyage INSEE à 200 m, les emplois du recensement 2022 répartis selon la base Sirene. Un emploi
        pèse un peu moins qu’un habitant.
      </p>
      <p className="text-[15px] leading-relaxed">
        Nous avons réglé la formule pour qu’elle retrouve la fréquentation des lignes de métro et de tram de Lyon en 2023. Voici ce qu’elle
        donne quand on retire chaque ligne du calcul pour la prédire avec les autres.
      </p>
      <Barres calage={CALAGE_LYON} max={420000} />
      <p className="text-[15px] leading-relaxed">
        Sur ces onze lignes, l’écart est de 18 % en moyenne, et de 39 % au pire. C’est pourquoi nous affichons toujours une fourchette
        plutôt qu’un chiffre exact.
      </p>
      <h3 className="text-lg font-black">Ce que nous ne savons pas faire</h3>
      <p className="text-[15px] leading-relaxed">
        La formule ne connaît ni la vitesse de la ligne, ni les correspondances, ni les grands équipements comme les hôpitaux ou les campus.
        Elle surestime les lignes de rocade qui ne passent pas par le centre : pour le T6 complet, elle donne environ le double des 55 000
        voyageurs prévus par Sytral Mobilités. Pour le bus et le téléphérique, que les lignes lyonnaises ne permettent pas de caler, nous
        retenons 70 % et 60 % de la fréquentation d’un tram au même endroit : ce sont des hypothèses.
      </p>
      <p className="text-[15px] leading-relaxed">
        Pour le score, nous ne comptons que les voyageurs qui vivent ou travaillent loin d’un tram ou d’un métro existant. Les autres
        viendraient surtout d’une ligne voisine.
      </p>
    </>
  )
}

function Toulouse({ ville }: { ville: Ville }) {
  return (
    <>
      <h3 className="text-lg font-black">Le budget</h3>
      <p className="text-[15px] leading-relaxed">
        Nous n’avons pas trouvé de programme d’investissement de Tisséo pour 2026-2038. Nous prenons donc le budget du jeu à Lyon, rapporté
        au nombre d’habitants des 114 communes de Tisséo : {n(ville.enveloppe)} M€ par mandat, dont {n(ville.entretienBus)} M€ pour
        l’entretien des bus.
      </p>
      <h3 className="text-lg font-black">Le prix</h3>
      <p className="text-[15px] leading-relaxed">
        Nous utilisons les mêmes prix au kilomètre qu’à Lyon, tirés de chantiers récents : 34 M€ pour un tramway, 150 M€ pour un métro
        automatique. Les prix réels varient selon les ponts, les tunnels et les rames achetées.
      </p>
      <h3 className="text-lg font-black">Les voyageurs</h3>
      <p className="text-[15px] leading-relaxed">
        Nous comptons les habitants et les emplois à moins de 400 m de chaque arrêt de tram ou de bus, et à moins de 600 m d’une station de
        métro, avec les mêmes données de l’INSEE qu’à Lyon. Un emploi pèse un peu moins qu’un habitant.
      </p>
      <p className="text-[15px] leading-relaxed">
        Telle quelle, notre formule lyonnaise sous-estime les lignes toulousaines d’environ un tiers. Nous l’avons donc recalée sur les
        métros A et B et le tram T1 : à Toulouse, ses résultats sont multipliés par 1,45. Voici l’écart qui reste sur chaque ligne.
      </p>
      <Barres calage={CALAGE_TOULOUSE} max={260000} />
      <p className="text-[15px] leading-relaxed">
        Quand on prédit chacune de ces trois lignes à partir des deux autres, l’écart reste sous 25 %, comme à Lyon. Nous affichons donc la
        même fourchette.
      </p>
      <h3 className="text-lg font-black">Ce que nous ne savons pas faire</h3>
      <p className="text-[15px] leading-relaxed">
        Téléo, le téléphérique, transporte environ 5 800 voyageurs par jour. Notre formule en prévoit moins de 300 : elle ne voit ni
        l’hôpital, ni l’université, ni la correspondance avec le métro. Pour un téléphérique, notre estimation n’est pas fiable.
      </p>
      <p className="text-[15px] leading-relaxed">
        La ligne C du métro ouvrira fin 2028, avant vos propres lignes. Nous la comptons donc comme une ligne existante, avec le
        prolongement de la ligne B à Labège : les habitants proches de leurs stations ne comptent pas comme nouveaux voyageurs dans votre
        score.
      </p>
      <p className="text-[13px] leading-relaxed text-gris">
        Fréquentation 2024 de Tisséo, divisée par 265 jours comme à Lyon. Habitants : carroyage Filosofi 2021 recalé sur le recensement
        2022. Emplois : recensement 2022 réparti selon la base Sirene.
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
      {ville.id === 'toulouse' ? <Toulouse ville={ville} /> : <Lyon />}
    </Panneau>
  )
}
