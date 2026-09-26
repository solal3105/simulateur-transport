import type { Metadata } from 'next'
import Link from 'next/link'

import { Icone, Logo } from '@/components/ui'
import { MARQUE } from '@/lib/villes'

export const metadata: Metadata = {
  title: `Nouveautés | ${MARQUE}`,
  description:
    'Ce qui change dans le Simulateur transport, mise en ligne après mise en ligne, avec les bugs corrigés grâce à vos signalements.',
}

type Groupe = { titre: 'Nouveau' | 'Amélioré' | 'Corrigé'; points: string[] }

/** Une mise en ligne : sa date, ce qu'elle apporte en une phrase, puis le détail, chaque point dit du côté du joueur. */
type Version = { iso: string; date: string; titre: string; texte: string; groupes: Groupe[] }

/**
 * Les mises en ligne, de la plus récente à la plus ancienne. Chaque point décrit ce que le joueur voit changer, en une
 * phrase, et ne promet rien que le jeu ne fasse déjà.
 */
const VERSIONS: Version[] = [
  {
    iso: '2026-09-27',
    date: '27 septembre 2026',
    titre: 'Des panneaux plus compacts et des objectifs',
    texte: 'Les panneaux laissent plus de place à la carte, et la partie gagne des objectifs et de quoi prolonger vos propres lignes.',
    groupes: [
      {
        titre: 'Nouveau',
        points: [
          'Au mandat suivant, vous pouvez prolonger une ligne que vous avez tracée : partez de son terminus, et sa station n’est pas payée une seconde fois.',
          'Des objectifs se consultent dans le menu et se jugent au bilan. Le premier consiste à tenir le budget sans augmenter le ticket ni l’abonnement.',
          'La fiche d’une ligne que vous tracez dit quelles communes elle dessert, et la compare à un chantier réel du même mode et de longueur voisine.',
        ],
      },
      {
        titre: 'Amélioré',
        points: [
          'Les panneaux sont plus compacts. Pour tracer une ligne, on choisit le mode parmi quatre tuiles, la liste des lignes à prolonger reste repliée, et les chiffres tiennent sur une seule bande : la carte reste visible.',
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
}

/** Les nouveautés du jeu, sur une seule page, dans l'ordre inverse des mises en ligne. */
export default function Page() {
  return (
    <main className="min-h-dvh bg-white">
      <header className="bg-rouge text-white">
        <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-5 pt-5 pb-9 lg:gap-8 lg:px-8 lg:pt-8 lg:pb-12">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo taille={36} inverse />
              <span className="text-[15px] font-extrabold lg:text-[17px]">{MARQUE}</span>
            </Link>
            <Link
              href="/"
              className="flex min-h-10 items-center gap-1.5 text-[14px] font-extrabold underline decoration-white/60 decoration-2 underline-offset-4"
            >
              <Icone nom="retour" taille={17} epaisseur={2.4} />
              Accueil
            </Link>
          </div>
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
