import type { Metadata } from 'next'

import { BarreSite } from '@/components/BarreSite'
import { MARQUE } from '@/lib/villes'

export const metadata: Metadata = {
  title: `Nouveautés | ${MARQUE}`,
  description:
    'Ce qui change dans le Simulateur transport, mise en ligne après mise en ligne, avec les bugs corrigés grâce à vos signalements.',
}

type Groupe = { titre: 'Nouveau' | 'Amélioré' | 'Corrigé' | 'Retiré'; points: string[] }

/** Une mise en ligne : sa date, ce qu'elle apporte en une phrase, puis le détail, chaque point dit du côté du joueur. */
type Version = { iso: string; date: string; titre: string; texte: string; groupes: Groupe[] }

/**
 * Les mises en ligne, de la plus récente à la plus ancienne. Chaque point décrit ce que le joueur voit changer, en une
 * phrase, et ne promet rien que le jeu ne fasse déjà.
 */
const VERSIONS: Version[] = [
  {
    iso: '2026-10-02',
    date: '2 octobre 2026',
    titre: 'Un filtre pour la carte',
    texte: 'Un seul bouton règle maintenant la carte : le fond, les lignes affichées et la densité de population.',
    groupes: [
      {
        titre: 'Nouveau',
        points: [
          'Le bouton « Affichage », en haut à droite de la carte, remplace celui de la vue aérienne. Il choisit le fond de carte, cache les lignes d’un mode de transport, par exemple tous les bus rapides, et montre la densité de population à tout moment, plus seulement pendant le tracé d’une ligne.',
        ],
      },
      {
        titre: 'Corrigé',
        points: [
          'Un prolongement n’ouvre plus avant la ligne qu’il prolonge : le métro E jusqu’à Part-Dieu attend l’ouverture du tronçon jusqu’à Bellecour.',
          'La fiche d’un projet payé en deux fois dit, au mandat suivant, que la seconde moitié est déjà retirée du budget et qu’il n’y a rien d’autre à payer.',
          'Le bilan ne laisse plus croire que le projet le plus cher du catalogue fait partie de votre réseau : il le cite comme un projet que vous n’avez pas retenu.',
        ],
      },
    ],
  },
  {
    iso: '2026-10-01',
    date: '1er octobre 2026',
    titre: 'Lignes en boucle',
    texte: 'Une ligne peut maintenant revenir à sa première station, et le tutoriel montre comment créer la vôtre.',
    groupes: [
      {
        titre: 'Nouveau',
        points: [
          'Une ligne de trois stations au moins peut revenir à son départ. Dans le traceur, le bouton qui propose de revenir en boucle à la première station ajoute le tronçon qui referme la ligne, compté dans le prix et la longueur, sans station de plus. « Rouvrir la boucle » le retire. Une boucle ne se prolonge pas, et un prolongement ne se referme pas.',
          'La dernière étape du tutoriel présente le bouton « Créer ma ligne », qui sert à tracer ce que le catalogue ne propose pas, et permet de commencer votre ligne tout de suite.',
        ],
      },
      {
        titre: 'Corrigé',
        points: [
          'Au survol d’une station, son nom et ses lignes s’affichent l’un sous l’autre, et non plus collés.',
          'Après « Terminer la ligne » ou « Voir le résultat », un clic sur la carte ne pose plus d’arrêt.',
          'Dans le plan vertical d’une ligne, le trait de couleur ne s’interrompt plus entre les stations.',
          'Dans la liste des projets, le tri choisi reste le même quand on revient à la liste après avoir ouvert ou décidé un projet.',
          'Sur téléphone, quand le navigateur interrompt le déplacement d’un arrêt, par exemple si un deuxième doigt se pose, l’arrêt est relâché et la carte glisse de nouveau.',
          'La fiche du Tram du Centre parle du Trambus TB11, l’ancienne ligne C3.',
        ],
      },
      {
        titre: 'Retiré',
        points: [
          'La grande dorsale est-ouest quitte le catalogue de Lyon : aucune étude ni délibération ne la porte. Une partie qui l’avait lancée la perd, et son coût revient dans le budget.',
        ],
      },
    ],
  },
  {
    iso: '2026-09-30',
    date: '30 septembre 2026',
    titre: 'Ponts routiers, lignes à part et couleurs',
    texte:
      'Un bus rapide passe sur les ponts routiers existants, une nouvelle ligne peut partir du bout d’une autre sans la prolonger, et chaque ligne peut prendre sa couleur.',
    groupes: [
      {
        titre: 'Nouveau',
        points: [
          'Un bus à haut niveau de service qui franchit un grand fleuve près d’un pont routier l’emprunte, sans payer de pont neuf. Un point de passage posé sur le pont suffit à y faire passer la ligne.',
          'Chaque ligne que vous tracez peut prendre une couleur parmi quatorze, les mêmes dans tous les réseaux. Elle la garde sur la carte, dans votre programme et sur les images que vous partagez.',
          'La fiche d’une ligne montre ses stations en plan vertical, avec sous chacune les lignes que l’on y retrouve en correspondance.',
        ],
      },
      {
        titre: 'Corrigé',
        points: [
          'Une nouvelle ligne qui part du bout d’une de vos lignes, ou d’un prolongement du catalogue, n’en est plus forcément la suite : « En faire une ligne à part » la rend indépendante, et elle paie alors sa première station.',
          'Une correspondance se mesure depuis chaque bout des grandes gares : un arrêt posé au sud des quais de Laplace, sur le RER B, est bien en correspondance.',
        ],
      },
    ],
  },
  {
    iso: '2026-09-28',
    date: '28 septembre 2026',
    titre: 'Prolonger un prolongement, et la vue aérienne',
    texte:
      'Une ligne prolongée au premier mandat se prolonge encore au second, les bus rapides et les téléphériques se prolongent aussi, et la carte peut passer en photographies aériennes.',
    groupes: [
      {
        titre: 'Nouveau',
        points: [
          'Le bouton « Vue aérienne » remplace le plan par les photographies aériennes de l’IGN, pour suivre les rues et voir les quartiers pendant que vous tracez. Le choix reste le même d’une partie à l’autre.',
          'Les bus à haut niveau de service et les téléphériques se prolongent comme le métro et le tram : un Linéo, un TramBus, le TVM ou Téléo repartent de leur terminus, dont la station n’est pas payée une seconde fois.',
          'Dans la liste de vos arrêts, vous changez l’ordre des stations en les faisant glisser par leur poignée, ou avec les flèches du clavier. Le + entre deux stations en ajoute une à mi-chemin, que vous placez ensuite sur la carte.',
        ],
      },
      {
        titre: 'Amélioré',
        points: [
          'Quand vous commencez une ligne, « Prolonger une ligne existante » s’affiche en tête du panneau, avec vos propres lignes des mandats précédents en premier.',
          'La fiche d’une ligne décidée à un mandat précédent propose de la prolonger depuis l’un de ses bouts.',
          'Tout ce qui se déplie a la même forme : le choix de la ligne à prolonger, l’ajout d’un arrêt par son nom, la liste de vos arrêts, le détail des fiches et des explications.',
        ],
      },
      {
        titre: 'Corrigé',
        points: [
          'Au second mandat, une ligne déjà prolongée au premier, par un projet du catalogue comme le T10 jusqu’à la gare de Clamart ou par votre propre tracé, repart du bout de ce prolongement et plus de son ancien terminus.',
        ],
      },
    ],
  },
  {
    iso: '2026-09-27',
    date: '27 septembre 2026',
    titre: 'Des objectifs et une interface plus compacte',
    texte:
      'La carte gagne de la place, sur ordinateur comme sur téléphone, et la partie gagne des objectifs et de quoi prolonger vos propres lignes.',
    groupes: [
      {
        titre: 'Nouveau',
        points: [
          'Au mandat suivant, vous pouvez prolonger une ligne que vous avez tracée : partez de son terminus, et sa station n’est pas payée une seconde fois.',
          'Des objectifs se consultent dans le menu et se jugent au bilan : tenir le budget sans augmenter le ticket ni l’abonnement, et, à Lyon, en Île-de-France, à Aix-Marseille et à Nice, gagner plus de voyageurs que le programme réellement voté par l’autorité.',
          'La fiche d’une ligne que vous tracez dit quelles communes elle dessert, et la compare à un chantier réel du même mode et de longueur voisine.',
          'Tous les bus que leur réseau présente comme à haut niveau de service apparaissent sur la carte : les TramBus de Lyon, les Linéo de Toulouse, les lignes B1 à B5 de Marseille, l’Aixpress et le BAM de Miramas. Ils ne changent pas le calcul des voyageurs.',
          'À Lyon, la fiche de chaque projet raconte son histoire en quelques dates, résume ce qu’en ont dit les habitants lors de la concertation et cite des articles de presse, chaque fois avec le document d’origine.',
        ],
      },
      {
        titre: 'Amélioré',
        points: [
          'Les panneaux sont plus compacts. Pour tracer une ligne, on choisit le mode parmi quatre tuiles, la liste des lignes à prolonger reste repliée, et les chiffres tiennent sur une seule bande : la carte reste visible.',
          'Sur téléphone, la barre du haut tient en deux lignes, la légende en une, et les boutons comme les prix sur la carte sont plus petits : la carte prend l’essentiel de l’écran.',
          'Toutes les pages hors de la partie ont la même barre en haut : les réseaux publiés, la façon dont nous calculons, et de quoi jouer ou reprendre sa partie.',
          'Sur la page d’un réseau publié, la phrase de son auteur s’affiche en citation, signée de son pseudo.',
          'L’accueil va à l’essentiel : l’écran de présentation et les liens répétés en bas de page sont retirés.',
        ],
      },
      {
        titre: 'Corrigé',
        points: [
          'Dans la liste des lignes, vos propres lignes suivent le tri choisi, comme les projets du catalogue.',
          'Parmi les réseaux publiés, ceux qui n’ont pas encore de soutien se classent par le nombre de joueurs partis d’eux, puis par leurs voyageurs : « Les plus soutenus » ne reprend plus l’ordre des plus récents.',
        ],
      },
    ],
  },
  {
    iso: '2026-09-26',
    date: '26 septembre 2026',
    titre: 'Le réseau en couleurs et vos premiers signalements',
    texte: 'Les lignes existantes prennent leurs couleurs, et nous corrigeons ce que vous nous avez signalé depuis l’ouverture.',
    groupes: [
      {
        titre: 'Nouveau',
        points: [
          'Les lignes de métro, de tram, de RER et de train sont dessinées dans leurs couleurs, et leur nom est répété le long du tracé.',
          'La partie ne s’arrête plus forcément en 2038 : au bilan, vous pouvez la continuer, mandat après mandat. Faute de budget publié au-delà, chaque nouveau mandat reprend celui du second.',
          'Vous renommez une station de votre tracé en la touchant, sur la carte ou dans la liste de vos arrêts, et son nom la suit jusque dans le lien que vous partagez.',
          'Les bus qui roulent surtout sur des voies réservées, comme le TVM, le 393 et les Tzen en Île-de-France, le L6 à Toulouse, le B3 à Marseille, apparaissent parmi les lignes existantes, avec leurs arrêts et leurs correspondances. Ils ne changent pas le calcul des voyageurs.',
        ],
      },
      {
        titre: 'Amélioré',
        points: [
          'La liste des projets et des lignes se classe d’abord par voyageurs attendus, et montre à côté le prix de chacun et ses voyageurs par million investi.',
          'Une ligne que vous tracez montre ses voyageurs par million investi, comparés au meilleur projet du catalogue, comme un projet.',
        ],
      },
      {
        titre: 'Corrigé',
        points: [
          'Le T11 se prolonge aussi depuis Le Bourget et le T14 depuis Esbly, et Orlyval, le métro 13 aux Courtilles et le Rhônexpress à l’aéroport peuvent être prolongés : ces stations manquaient à notre calcul. Près de Pont de Neuilly ou de Créteil-Préfecture, une nouvelle ligne gagne donc moins de nouveaux voyageurs, puisque ces quartiers sont déjà desservis.',
          'Activer une mesure dans « Trouver de l’argent » ne fige plus l’écran sur téléphone et ne vide plus la moitié du panneau sur ordinateur.',
          'Partir du terminus d’une ligne, sur la carte ou par son nom, propose bien de la prolonger, comme le T3b à Porte Dauphine, et propose toutes les lignes quand plusieurs y finissent.',
          'La recherche d’un arrêt par son nom trouve les stations et les gares, comme Châtelet ou Nation, même sans accents ou abrégées en « St », et ne mène plus à une commune lointaine du même nom.',
          'Le nom d’une ligne se tape d’un trait, sans recliquer dans le champ après chaque lettre.',
          'L’image à partager montre tout votre réseau, son titre ne déborde plus sur la carte, et le bilan compte à part vos projets retenus et vos lignes tracées.',
          'Sur la carte, le prix d’un projet se décale le long de son tracé quand un autre le recouvre, et devient un point qu’on peut toucher s’il ne trouve aucune place, au lieu de disparaître.',
          'À Lyon, la ligne en pointillés noirs vers Rillieux, qui ne menait à aucun projet, a disparu, et la Ligne du Nord s’ouvre partout où on la touche.',
          'Sur grand écran, la légende du budget passe à la ligne au lieu de glisser sous le compteur de voyageurs.',
          'Le tutoriel nomme le bouton qui termine le mandat par ce qui est écrit dessus, au lieu de parler d’un bouton rouge qui ne l’est pas sur tous les réseaux, et ses repères animés prennent la couleur du réseau.',
        ],
      },
    ],
  },
]

/** La couleur de la pastille de chaque groupe : les nouveautés prennent celle du site, les corrections restent sobres. */
const PASTILLE: Record<Groupe['titre'], string> = {
  Nouveau: 'bg-rouge text-white',
  Amélioré: 'bg-encre text-white',
  Corrigé: 'bg-sable text-encre shadow-[inset_0_0_0_1.5px_var(--color-trait)]',
  Retiré: 'bg-white text-gris shadow-[inset_0_0_0_1.5px_var(--color-trait)]',
}

/** Les nouveautés du jeu, sur une seule page, dans l'ordre inverse des mises en ligne. */
export default function Page() {
  return (
    <main className="min-h-dvh bg-white">
      <header className="bg-rouge text-white">
        <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-5 pt-5 pb-9 lg:gap-8 lg:px-8 lg:pt-8 lg:pb-12">
          <BarreSite page="autre" />
          <div className="flex flex-col gap-3">
            <h1 className="text-[38px] leading-[0.97] font-black tracking-[-0.03em] text-balance lg:text-[56px] lg:leading-[0.95]">
              Nouveautés
            </h1>
            <p className="max-w-[60ch] text-[16px] leading-relaxed font-medium text-white/90 lg:text-[17px]">
              Ce qui change dans le jeu, de la mise en ligne la plus récente à la plus ancienne. Les corrections viennent pour la plupart
              des signalements que vous envoyez avec le bouton « Bug ou amélioration ».
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[860px] flex-col px-5 py-10 lg:px-8 lg:py-14">
        {VERSIONS.map((v) => (
          <article
            key={v.iso}
            aria-labelledby={`version-${v.iso}`}
            className="grid gap-3 border-t border-trait py-8 first:border-t-0 first:pt-0 lg:grid-cols-[170px_1fr] lg:gap-8"
          >
            <time
              dateTime={v.iso}
              className="text-[13px] font-extrabold tracking-[0.06em] text-muet uppercase lg:sticky lg:top-8 lg:self-start lg:pt-1.5"
            >
              {v.date}
            </time>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 id={`version-${v.iso}`} className="text-[24px] leading-tight font-black tracking-tight text-balance lg:text-[28px]">
                  {v.titre}
                </h2>
                <p className="max-w-[62ch] text-[16px] leading-relaxed text-gris">{v.texte}</p>
              </div>
              {v.groupes.map((g) => (
                <section key={g.titre} aria-label={g.titre} className="flex flex-col gap-2.5">
                  <span
                    className={`self-start rounded-full px-2.5 py-0.5 text-[12px] font-black tracking-[0.04em] uppercase ${PASTILLE[g.titre]}`}
                  >
                    {g.titre}
                  </span>
                  <ul className="flex flex-col gap-2.5">
                    {g.points.map((p) => (
                      <li key={p} className="flex max-w-[66ch] gap-3 text-[15.5px] leading-relaxed">
                        <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-encre" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
