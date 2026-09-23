// Copie de lib/budgets/nice.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { BudgetVille, Source } from '../budget.ts'

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
    explication:
      'La Métropole n’a publié aucun programme d’investissement pour 2026-2032. De 2020 à 2025, son budget des transports a investi 157,8 M€ en dehors des lignes nouvelles, et sa régie Ligne d’Azur environ 22 M€ par an, surtout en bus : cela fait environ 290 M€ par mandat. Au premier mandat s’ajoutent les 435 M€ inscrits pour la ligne 5 du tram, de Nice à Drap. Elle n’est pas encore sur notre carte : cet argent reste dans votre budget, pour que vous puissiez la tracer vous-même ou en faire autre chose. Au second mandat, nous ne vous rendons pas sa place : payée presque entièrement par l’emprunt, elle laissera la Métropole plus endettée.',
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
    explication:
      'La ligne 5 est le seul grand projet décidé, et elle n’est pas sur notre carte : nous ne retirons rien. Le parc-relais Tzarewitch, qui ouvre en 2026, est soldé la même année.',
    sources: [
      {
        titre: 'Préfecture des Alpes-Maritimes, déclaration d’utilité publique de la ligne 5, 27 juillet 2026',
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/60244/459448/file/Arr%C3%AAt%C3%A9%20pr%C3%A9fectoral.pdf',
      },
    ],
  },
  bus: {
    montants: { 1: 160, 2: 160 },
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
  limites: [
    'Les comptes 2025 de la régie Ligne d’Azur ne sont pas encore publiés.',
    'Aucun document ne chiffre le renouvellement des rames et des voies du tram : la part des lignes existantes est sans doute trop basse pour le second mandat, quand la ligne 1 aura plus de 25 ans.',
    'Le financement de la ligne 5 n’est pas bouclé : seuls 4,2 M€ de subventions sont acquis, et la Métropole annonce qu’elle paiera le reste elle-même.',
    'L’abandon de la ligne 4 vers Cagnes-sur-Mer n’est connu que par la presse.',
  ],
  releve: 'septembre 2026',
}
