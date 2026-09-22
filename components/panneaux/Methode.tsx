'use client'

import { useJeu } from '@/lib/store'

import { Panneau } from './Panneau'

/** Écarts de la formule sur chaque ligne, quand on la prédit avec les dix autres. */
const CALAGE: { ligne: string; reel: number; ecart: number }[] = [
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

export function Methode() {
  const { brouillon, ouvrir, fermer } = useJeu()
  const max = 420000
  return (
    <Panneau titre="Comment nous estimons une ligne" hauteurTelephone="pleine" onFermer={() => (brouillon ? ouvrir({ type: 'ligne' }) : fermer())}>
      <h3 className="text-lg font-black">Le prix</h3>
      <p className="text-[15px] leading-relaxed">
        Nous multiplions la longueur de votre tracé par un coût au kilomètre tiré de chantiers récents. Pour le tramway, c’est la moyenne des T6
        nord, T9 et T10 de Lyon, soit environ 34 M€ par kilomètre. Les prix réels varient selon les ponts, les dépôts et les rames achetées.
      </p>
      <h3 className="text-lg font-black">Les voyageurs</h3>
      <p className="text-[15px] leading-relaxed">
        Nous comptons les habitants et les emplois à moins de 400 m de chaque arrêt de tram ou de bus, et à moins de 600 m d’une station de métro.
        Les habitants viennent du carroyage INSEE à 200 m, les emplois du recensement 2022 répartis selon la base Sirene. Un emploi pèse un peu
        moins qu’un habitant.
      </p>
      <p className="text-[15px] leading-relaxed">
        Nous avons réglé la formule pour qu’elle retrouve la fréquentation des lignes de métro et de tram de Lyon en 2023. Voici ce qu’elle donne
        quand on retire chaque ligne du calcul pour la prédire avec les autres.
      </p>
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
        {CALAGE.map((c) => (
          <div key={c.ligne} role="listitem" className="grid grid-cols-[64px_1fr_48px] items-center gap-2.5 text-[12.5px]">
            <span className="font-extrabold">{c.ligne}</span>
            <span className="flex flex-col gap-0.5" aria-hidden="true">
              <span className="h-1.5 rounded-full bg-encre" style={{ width: `${Math.max(1, (c.reel / max) * 100)}%` }} />
              <span className="h-1.5 rounded-full bg-rouge" style={{ width: `${Math.max(1, ((c.reel * (1 + c.ecart / 100)) / max) * 100)}%` }} />
            </span>
            <span className="chiffres text-right font-extrabold text-gris">
              {c.ecart > 0 ? '+' : ''}
              {c.ecart} %
            </span>
          </div>
        ))}
      </div>
      <p className="text-[15px] leading-relaxed">
        Sur ces onze lignes, l’écart est de 18 % en moyenne, et de 39 % au pire. C’est pourquoi nous affichons toujours une fourchette plutôt
        qu’un chiffre exact.
      </p>
      <h3 className="text-lg font-black">Ce que nous ne savons pas faire</h3>
      <p className="text-[15px] leading-relaxed">
        La formule ne connaît ni la vitesse de la ligne, ni les correspondances, ni les grands équipements comme les hôpitaux ou les campus. Elle
        surestime les lignes de rocade qui ne passent pas par le centre : pour le T6 complet, elle donne environ le double des 55 000 voyageurs
        prévus par Sytral Mobilités. Pour le bus et le téléphérique, que les lignes lyonnaises ne permettent pas de caler, nous retenons 70 % et
        60 % de la fréquentation d’un tram au même endroit : ce sont des hypothèses.
      </p>
      <p className="text-[15px] leading-relaxed">
        Pour le score, nous ne comptons que les voyageurs qui vivent ou travaillent loin d’un tram ou d’un métro existant. Les autres viendraient
        surtout d’une ligne voisine.
      </p>
    </Panneau>
  )
}
