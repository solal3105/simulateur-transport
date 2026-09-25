import type { BudgetVille, Source } from '../budget'

const NCA = 'https://www.nicecotedazur.org/wp-content/uploads'
/** Les délibérations de la Métropole n'ont pas d'adresse directe : on choisit la séance dans le menu de ce site. */
const WEBDELIB = 'https://webdelib.nicecotedazur.org/WebDelib/'

/** Les comptes de 2020 à 2025, d'où viennent les investissements réalisés. */
const COMPTES: Source[] = [
  {
    titre: 'Métropole Nice Côte d’Azur, compte administratif 2020',
    url: `${NCA}/2023/10/Rapport-de-presentation-CA-2020.pdf`,
    pages: 'p. 35 et 36',
  },
  {
    titre: 'Métropole Nice Côte d’Azur, compte administratif 2021',
    url: `${NCA}/2023/10/Rapport-presenataion-CA-2021.pdf`,
    pages: 'p. 34',
  },
  { titre: 'Métropole Nice Côte d’Azur, compte financier 2022', url: `${NCA}/2023/10/Rapport-presentation-CFU-2022.pdf`, pages: 'p. 33' },
  {
    titre: 'Métropole Nice Côte d’Azur, compte financier 2023',
    url: `${NCA}/2024/07/mnca-compte-financier-unique-11-07-24.pdf`,
    pages: 'p. 35',
  },
  {
    titre: 'Métropole Nice Côte d’Azur, compte financier 2024',
    url: `${NCA}/2025/06/Rapport-Compte-Financier-Unique-2024.pdf`,
    pages: 'p. 38',
  },
  { titre: 'Métropole Nice Côte d’Azur, compte financier 2025', url: `${NCA}/2026/06/MNCA-Rapport-CFU-2025-vf.pdf`, pages: 'p. 25 et 33' },
]

const ENVELOPPES_2026: Source = {
  titre: 'Métropole Nice Côte d’Azur, séance du 22 juin 2026, délibération n° 21.5, annexe 2 des autorisations de programme',
  url: WEBDELIB,
  pages: 'p. 1',
}

export const nice: BudgetVille = {
  payeur: 'la Métropole Nice Côte d’Azur',
  total: {
    montants: { 1: 725, 2: 290 },
    simple:
      'La Métropole investit environ 290 millions d’euros par mandat dans ses transports, plus 435 millions pour étendre le tramway au premier mandat.',
    explication:
      'La Métropole n’a publié aucun programme d’investissement pour 2026-2032. De 2020 à 2025, son budget des transports a investi 157,8 M€ en dehors des lignes nouvelles, et sa régie Ligne d’Azur environ 22 M€ par an, surtout en bus : cela fait environ 290 M€ par mandat. Au premier mandat s’ajoutent les 435 M€ qui restent inscrits pour étendre le tramway, sur une enveloppe de 500 M€ votée en 2021 pour les lignes 4 et 5. Aucune des deux n’est dessinée sur notre carte : cet argent reste dans votre budget, et les deux lignes sont dans le catalogue, à construire ou non. Au second mandat, nous ne vous rendons pas cette somme : payées presque entièrement par l’emprunt, ces lignes laisseront la Métropole plus endettée.',
    sources: [
      ...COMPTES,
      {
        titre:
          'Métropole Nice Côte d’Azur, séance du 5 décembre 2025, délibération n° 20.3, rapport d’activité 2024 de la régie Ligne d’Azur',
        url: WEBDELIB,
        pages: 'p. 77 à 79',
      },
      ENVELOPPES_2026,
    ],
  },
  decides: {
    montants: { 1: 0, 2: 0 },
    simple: 'Les lignes 4 et 5 du tramway ne sont pas encore construites : elles sont dans le catalogue, et leur argent reste dans votre budget.',
    explication:
      'La ligne 5 est le seul grand projet décidé. Elle est dans le catalogue avec la ligne 4, dont l’avenir est incertain, et aucune des deux n’est dessinée sur notre carte : nous ne retirons rien. Le parc-relais Tzarewitch, qui ouvre en 2026, est soldé la même année.',
    sources: [
      {
        titre: 'Préfecture des Alpes-Maritimes, déclaration d’utilité publique de la ligne 5, 27 juillet 2026',
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/60244/459448/file/Arr%C3%AAt%C3%A9%20pr%C3%A9fectoral.pdf',
      },
    ],
  },
  bus: {
    montants: { 1: 160, 2: 160 },
    simple: 'Renouveler les bus et leurs dépôts coûte environ 160 millions par mandat.',
    explication:
      'La régie Ligne d’Azur achète les bus de la Métropole et les paie avec ce que la Métropole lui verse : environ 130 M€ par mandat au rythme de 2023 à 2026. S’y ajoutent les 30 M€ encore inscrits pour les dépôts de bus et les parcs-relais, alors qu’un nouveau dépôt est à l’étude à l’ouest de Nice. La Métropole prévoyait un parc entièrement décarboné au début de 2026 : il ne resterait ensuite qu’à le renouveler.',
    sources: [
      {
        titre:
          'Métropole Nice Côte d’Azur, séance du 5 décembre 2025, délibération n° 20.4, avenant 13 au contrat de la régie, annexes 6 et 15',
        url: WEBDELIB,
        pages: 'annexe 6, p. 2 et 3',
      },
      ENVELOPPES_2026,
      {
        titre: 'Métropole Nice Côte d’Azur, rapport d’orientation budgétaire 2026',
        url: `${NCA}/2026/01/NCA-Rapport-sur-les-orientations-budgetaires-2026.pdf`,
        pages: 'p. 57 et 58',
      },
    ],
  },
  lignes: {
    montants: { 1: 35, 2: 35 },
    simple: 'Entretenir le tram et le reste du réseau coûte environ 35 millions par mandat.',
    explication:
      'L’entretien et la modernisation du réseau existant ont coûté 33,8 M€ de 2020 à 2025 : nous gardons ce rythme. Le rallongement des rames de la ligne 1 sera payé en 2026, et aucun gros renouvellement n’est chiffré ensuite.',
    sources: [
      ...COMPTES,
      {
        titre: 'Métropole Nice Côte d’Azur, rallongement des rames de la ligne 1',
        url: 'https://www.nicecotedazur.org/projets/rallongement-des-rames-de-la-ligne-1-du-tramway/',
      },
    ],
  },
  leviers: {
    tarifs: { abonnement: 45, ticket: 1.7 },
    rendement: { abonnements: 1.3, tickets: 2.8, versementMobilite: 6.1 },
    tauxVersement: 2,
    fixes: { gratuiteTotale: -424, gratuiteMoins25: -51, metroNuit: -6, tva: 18 },
    textes: {
      metroNuit: {
        titre: 'Tram toute la nuit le week-end',
        detail: 'Les vendredis et samedis, sur les trois lignes, avec deux agents par rame.',
      },
    },
    simple:
      'Les billets et les abonnements rapportent environ 71 millions d’euros par an, et le versement mobilité des entreprises 101 millions. Les tickets pèsent deux fois plus que les abonnements.',
    explication:
      'La billetterie a rapporté 73,7 M€ hors taxes en 2025. Nous en retirons environ 3 M€ par an pour les gratuités votées en 2026, dont celle des 65 ans et plus, ce qui laisse 70,7 M€ : d’après la régie, environ 46 M€ de tickets et 21 M€ d’abonnements. Le versement mobilité est déjà à son taux maximal, 2 % de la masse salariale, et a rapporté 101,5 M€ en 2025. La gratuité des moins de 25 ans coûterait ce qu’ils paient aujourd’hui, environ 8,5 M€ par an ; celle des moins de 11 ans existe déjà. L’abonnement social coûte déjà la moitié du plein tarif, le minimum que la loi impose aux plus modestes : il n’y a rien à reprendre de ce côté. Un tram toute la nuit le week-end, avec une rame toutes les 30 minutes et deux agents par rame, coûterait environ 1 M€ par an, d’après le coût d’exploitation que la Métropole retient pour la ligne 5. Les hausses de prix supposent que la fréquentation ne baisse pas.',
    sources: [
      {
        titre: 'Métropole Nice Côte d’Azur, compte financier 2025',
        url: `${NCA}/2026/06/MNCA-Rapport-CFU-2025-vf.pdf`,
        pages: 'p. 7 et 13',
      },
      {
        titre:
          'Métropole Nice Côte d’Azur, séance du 5 décembre 2025, délibération n° 20.3, rapport d’activité 2024 de la régie Ligne d’Azur et ses annexes',
        url: WEBDELIB,
        pages: 'rapport p. 40 à 44 et 49, annexes p. 59, 63 et 65',
      },
      {
        titre: 'Lignes d’Azur, guide des tarifs, septembre 2026',
        url: 'https://www.lignesdazur.com/uploads/Guide_des_tarifs_Septembre_2026_compressed_1_4e2d1aa321.pdf',
        pages: 'p. 6, 10, 11 et 13',
      },
      {
        titre: 'Urssaf, taux du versement mobilité, septembre 2026',
        url: 'https://open.urssaf.fr/explore/dataset/table_taux_vmrr/',
      },
      {
        titre: 'Métropole Nice Côte d’Azur, séance du 8 juin 2026, délibération n° 9.1, évaluation de la ligne 5',
        url: WEBDELIB,
        pages: 'annexe 1, p. 40',
      },
      {
        titre: 'Lignes d’Azur, le réseau de soirée',
        url: 'https://www.lignesdazur.com/fr/reseau-soiree',
      },
    ],
  },
  limites: [
    'Les comptes 2025 de la régie Ligne d’Azur ne sont pas encore publiés.',
    'Aucun document ne chiffre le renouvellement des rames et des voies du tram : la part des lignes existantes est sans doute trop basse pour le second mandat, quand la ligne 1 aura plus de 25 ans.',
    'Le financement de la ligne 5 n’est pas bouclé : seuls 4,2 M€ de subventions sont acquis, et la Métropole annonce qu’elle paiera le reste elle-même.',
    'L’abandon de la ligne 4 vers Cagnes-sur-Mer n’est connu que par la presse.',
  ],
  releve: 'septembre 2026',
}
