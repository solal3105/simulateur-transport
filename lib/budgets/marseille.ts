import type { BudgetVille, Source } from '../budget'

const DELIBERATIONS = 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations'

const ROB_2026: Source = {
  titre: 'Métropole d’Aix-Marseille-Provence, rapport d’orientation budgétaire 2026',
  url: `${DELIBERATIONS}/2026/04/16/ANNEXE/160507_165637_160507%20Annexe%20ROB%202026%20vDEF%20v2.pdf`,
  pages: 'p. 33, 81, 128 et 129',
}

const CA_2024: Source = {
  titre: 'Métropole d’Aix-Marseille-Provence, compte administratif 2024 du budget des transports',
  url: `${DELIBERATIONS}/2025/06/26/ANNEXE/122152_137877_Rapport%20de%20presentation%20CA%202024%20-%20buget%20annexe%20transports%20V7.pdf`,
  pages: 'p. 9 et 15',
}

export const marseille: BudgetVille = {
  payeur: 'la Métropole d’Aix-Marseille-Provence',
  total: {
    montants: { 1: 1800, 2: 1800 },
    explication:
      'La Métropole s’est engagée auprès de l’État à investir au moins 300 M€ par an dans ses transports de 2023 à 2032, et son rapport d’orientation budgétaire 2026 garde cet objectif. Nous le reprenons, soit 1 800 M€ par mandat. Ce rythme n’est pas acquis : la Métropole n’a dépensé en moyenne que 260 M€ par an de 2023 à 2025, et son budget des transports est si déséquilibré que le préfet a dû arrêter lui-même celui de 2026. Aucun document ne va au-delà de 2032 : nous gardons le même rythme au second mandat.',
    sources: [
      ROB_2026,
      {
        titre: 'Convention Marseille en Grand entre l’État et la Métropole, pour le Val’Tram',
        url: `${DELIBERATIONS}/2022/12/15/ANNEXE/38873_PJ_38873_Projet%20de%20convention%20Valtram-Vdef.pdf`,
        pages: 'p. 4',
      },
      {
        titre: 'Chambre régionale des comptes, avis n° 2026-04 sur le budget 2026',
        url: 'https://www.ccomptes.fr/sites/default/files/2026-06/PAA2026-04.pdf',
        pages: 'p. 7 et 14',
      },
      {
        titre: 'Préfecture des Bouches-du-Rhône, dossier de presse sur le budget de la Métropole, 16 juin 2026',
        url: 'https://www.bouches-du-rhone.gouv.fr/contenu/telechargement/64312/450072/file/DP%20-%20Budget%20AMP%2016.06.26.pdf',
      },
    ],
  },
  decides: {
    montants: { 1: 50, 2: 0 },
    explication:
      'L’extension du T3 ouverte en janvier 2026, le Val’Tram d’Aubagne et les bus à haut niveau de service livrés en 2025 sont déjà dessinés sur notre carte, et presque payés : 96,8 M€ ont été versés pour le T3 et 50,4 M€ pour le Val’Tram en 2024. Nous estimons à environ 50 M€ ce qui reste à régler après 2026. Les trams qui n’ont pas encore de déclaration d’utilité publique, jusqu’à La Bricarde, au 4-Septembre ou à la Belle de Mai, ne sont pas sur la carte : c’est à vous de les tracer si vous le voulez.',
    sources: [
      CA_2024,
      {
        titre: 'Métropole d’Aix-Marseille-Provence, avenant au financement de l’extension du T3, avril 2025',
        url: `${DELIBERATIONS}/2025/04/03/ANNEXE/111129_10-111129_Appro%20aven%20ETNS1_31.3.2025.pdf`,
        pages: 'p. 4',
      },
    ],
  },
  bus: {
    montants: { 1: 400, 2: 400 },
    explication:
      'Depuis janvier 2026, la Métropole paie elle-même les bus, les dépôts et le matériel que la RTM finançait jusque-là : 1,2 milliard prévu de 2026 à 2033. La RTM a 629 bus, dont 21 électriques, et doit en recevoir 60 électriques par an jusqu’en 2030, avec deux dépôts à reconstruire, à Saint-Pierre et à Arenc. En comptant 300 bus à environ 0,65 M€ et ces deux dépôts, nous arrivons à environ 400 M€ par mandat.',
    sources: [
      ROB_2026,
      {
        titre: 'RTM, chiffres clés 2024',
        url: 'https://www.rtm.fr/sites/default/files/docs/013bis%20RTM%20en%20chiffres_2024%201.pdf',
        pages: 'p. 3 et 5',
      },
      {
        titre: 'Banque des Territoires, financement des bus électriques de la RTM, juillet 2024',
        url: 'https://www.banquedesterritoires.fr/la-banque-des-territoires-accompagne-hauteur-de-14-meu-le-verdissement-de-la-flotte-de-bus-0',
      },
      {
        titre: 'TPBM, reconstruction du dépôt de bus d’Arenc, mai 2026',
        url: 'https://mesinfos.fr/13000-marseille/marseille-vinci-et-l-agence-ferrand-sigal-vont-reconstruire-le-depot-de-bus-d-arenc-245697.html',
      },
    ],
  },
  lignes: {
    montants: { 1: 650, 2: 650 },
    explication:
      'Le reste du programme repris de la RTM va au métro, au tram et aux équipements. Il faut aussi finir Neomma, le renouvellement complet du métro : 38 rames, l’automatisation des deux lignes et des façades de quai, pour 548 M€ au total, dont il reste environ 100 M€ à payer. S’y ajoutent environ 50 M€ pour les autres réseaux de la Métropole. Nous estimons l’ensemble à 650 M€ par mandat, et gardons ce montant au second mandat faute de chiffre.',
    sources: [
      ROB_2026,
      CA_2024,
      {
        titre: 'Banque de développement du Conseil de l’Europe, prêt pour Neomma, novembre 2024',
        url: 'https://coebank.org/en/news-and-publications/news/ceb-approves-additional-loan-of-150-million-euros-to-aix-marseille-provence-for-neomma-project-an-essential-investment-to-improve-mobility-in-the-region/',
      },
    ],
  },
  limites: [
    'Aucun document ne détaille le partage du 1,2 milliard repris de la RTM entre les bus et les lignes existantes : notre découpage est une estimation.',
    'Si la Métropole restait au niveau de 2026, environ 250 M€ par an, votre part tomberait vers 400 M€ par mandat.',
    'Le pacte financier de la Métropole pour 2027-2032 ne sera pas prêt avant avril 2027 : il peut changer ces montants.',
    'Le coût du dépôt d’Arenc ne vient que de la presse.',
  ],
  releve: 'septembre 2026',
}
