// Copie de lib/budgets/paris.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { BudgetVille, Source } from '../budget.ts'

const CONTRAT_DE_PLAN: Source = {
  titre: 'Région Île-de-France, délibération CR 2024-038, avenant mobilités du contrat de plan 2023-2027',
  url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
  pages: 'p. 12, 28 et 29',
}

const IDFM_2026: Source = {
  titre: 'Île-de-France Mobilités, second supplément au prospectus, budget 2026, juillet 2026',
  // Le site d'Île-de-France Mobilités refuse les liens directs vers ses PDF ; sa plateforme de contenu sert le même fichier.
  url: 'https://portail-idfm.cdn.prismic.io/portail-idfm/DLXhLILE_v7mwnIc_IDFM-2%C3%A8mesuppl%C3%A9mentauPB2025-versionfinaleavecnum%C3%A9rod%27approbation-41381514.1--41397812.1-.pdf',
  pages: 'p. 24 et 25',
}

const RATP_2025: Source = {
  titre: 'RATP, rapport financier et de durabilité 2025',
  url: 'https://ratpgroup.com/api/media/rapport-financier-et-de-durabilite-annuel-2025---groupe-ratp.pdf',
  pages: 'p. 23, 86 et 88',
}

export const paris: BudgetVille = {
  payeur: 'Île-de-France Mobilités, la RATP, l’État et la Région',
  total: {
    montants: { 1: 17360, 2: 17050 },
    explication:
      'Aucun document ne dit ce que l’on investit dans les seuls Paris et petite couronne : Île-de-France Mobilités, la RATP, l’État et la Région paient pour toute la région. Nous gardons pour la zone du jeu ce qui y est dépensé quand on le sait, et une part proportionnelle aux habitants sinon, 55 %. Pour les lignes nouvelles, le contrat de plan 2023-2027 consacre environ 2 275 M€ à des projets de la zone, en comptant une part des opérations qui la dépassent, soit 455 M€ par an. En ajoutant les rames qu’Île-de-France Mobilités achète à chaque prolongement, cela fait de 2,7 à 3,2 milliards par mandat si les prochains contrats gardent ce rythme. Nous retenons 3,1 milliards au premier mandat et 2,75 au second, pour qu’il vous reste 2,7 milliards à chacun une fois retirés les projets décidés. Ce rythme reste incertain : fin 2025, les contrats de plan n’étaient exécutés qu’à 47 % dans toute la France. S’y ajoutent les bus et les lignes existantes, détaillés plus bas. Le Grand Paris Express, payé à part par la Société des grands projets, n’y est pas.',
    sources: [
      CONTRAT_DE_PLAN,
      IDFM_2026,
      {
        titre: 'Insee, populations légales 2022',
        url: 'https://www.insee.fr/fr/statistiques/8647014',
      },
      {
        titre: 'Sénat, rapport n° 139 sur le projet de loi de finances pour 2026, exécution des contrats de plan',
        url: 'https://www.senat.fr/rap/l25-139-310-2/l25-139-310-21.pdf',
        pages: 'p. 45',
      },
    ],
  },
  decides: {
    montants: { 1: 360, 2: 50 },
    explication:
      'Les lignes 15, 16, 17 et 18 du Grand Paris Express sont dessinées sur notre carte. La Société des grands projets paie leur construction et Île-de-France Mobilités leurs rames, à part : elles n’ont jamais été dans ce budget. Il reste en revanche quatre opérations du contrat de plan liées à leurs gares : l’adaptation des gares existantes en correspondance, la gare de Bry-Villiers-Champigny sur le RER E, l’arrêt de la ligne H à Saint-Denis Pleyel et le franchissement urbain de Pleyel. Nous les estimons à 410 M€, dont 360 M€ au premier mandat. Les autres projets décidés, comme le prolongement du T1 à Val de Fontenay ou le T8 sud, ne sont pas sur notre carte : leur argent reste dans votre budget, pour que vous puissiez les tracer.',
    sources: [
      CONTRAT_DE_PLAN,
      {
        titre: 'Cour des comptes, la Société du Grand Paris, avril 2024',
        url: 'https://www.ccomptes.fr/sites/default/files/2024-04/20240425-S2024-0234-Societe-Grand-Paris_0.pdf',
        pages: 'p. 6 et 14',
      },
    ],
  },
  bus: {
    montants: { 1: 1300, 2: 1300 },
    explication:
      'Île-de-France Mobilités achète elle-même les bus et les centres bus de toute la région, environ 510 M€ par an. Paris et la petite couronne comptent 4 630 des 10 500 bus franciliens : nous leur attribuons 220 M€ par an, soit 1 300 M€ par mandat.',
    sources: [
      IDFM_2026,
      {
        titre: 'Chambre régionale des comptes d’Île-de-France, rapport sur Île-de-France Mobilités, décembre 2025',
        url: 'https://www.ccomptes.fr/sites/default/files/2025-12/IDR2025-60.pdf',
        pages: 'p. 22, 23, 109 et 110',
      },
      RATP_2025,
      {
        titre: 'Île-de-France Mobilités, nouveau plan bus, 9 juin 2026',
        url: 'https://presse.iledefrance-mobilites.fr/valerie-pecresse-lance-un-nouveau-plan-pour-developper-encore-le-bus-sur-toute-la-region/',
      },
    ],
  },
  lignes: {
    montants: { 1: 13000, 2: 13000 },
    explication:
      'C’est là que part l’essentiel de l’argent. La RATP investit 2,1 milliards par an dans son contrat 2025-2029, surtout pour entretenir et moderniser ses lignes et acheter les nouvelles rames du métro : nous en comptons 90 % dans la zone. Île-de-France Mobilités et le contrat de plan mettent 1,7 milliard par an dans le réseau SNCF et la qualité de service, dont nous comptons 55 %. Cela fait 2,7 milliards par an au rythme de 2026, que nous ramenons à 13 milliards par mandat parce qu’Île-de-France Mobilités annonce une baisse de ses investissements après 2030.',
    sources: [
      {
        titre: 'Île-de-France Mobilités, nouveau contrat avec la RATP, 9 juillet 2025',
        url: 'https://presse.iledefrance-mobilites.fr/plus-de-qualite-de-service-pour-les-voyageurs-au-coeur-du-nouveau-contrat-entre-ile-de-france-mobilites-et-la-ratp/',
      },
      RATP_2025,
      IDFM_2026,
      {
        titre: 'Île-de-France Mobilités, budget 2026, 10 décembre 2025',
        url: 'https://presse.iledefrance-mobilites.fr/ile-de-france-mobilites-vote-un-budget-ambitieux-pour-continuer-la-modernisation-du-reseau/',
      },
    ],
  },
  limites: [
    'Aucun document ne découpe les budgets régionaux par département : nos montants sont des estimations, à 30 % près.',
    'Le contrat de plan ne chiffre les opérations liées aux gares du Grand Paris Express que pour toute la région : les 410 M€ que nous retirons sont notre estimation.',
    'La rénovation des voies que SNCF Réseau paie sur ses propres fonds n’est pas comptée.',
    'Selon la chambre régionale des comptes, Île-de-France Mobilités ne réalise en moyenne que 69 % des investissements qu’elle prévoit.',
  ],
  releve: 'septembre 2026',
}
