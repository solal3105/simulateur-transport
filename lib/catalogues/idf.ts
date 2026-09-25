import type { Catalogue, Projet } from '../types'

/**
 * Les projets sur la table en Île-de-France, en dehors du Grand Paris Express, déjà dessiné sur la carte, rassemblés le
 * 25 septembre 2026 dans les dossiers d’Île-de-France Mobilités, les délibérations et les arrêtés d’utilité publique.
 * Chaque projet cite ses sources. Le coût comprend les rames ou les bus quand la source les chiffre avec le projet.
 */
const projets: Projet[] = [
  {
    id: 'idf-metro-1-val-de-fontenay',
    nom: 'Métro 1 jusqu’à Val de Fontenay',
    genre: 'Prolongement de métro',
    description:
      'La ligne 1 du métro est prolongée en souterrain de Château de Vincennes à Val de Fontenay, sur environ 5 km, avec trois nouvelles stations : Les Rigollots, Grands Pêchers et Val de Fontenay. Elle dessert Vincennes, Fontenay-sous-Bois et le sud-est de Montreuil, avec des correspondances vers les RER A et E, la ligne 15 et le tram T1 à Val de Fontenay.',
    mode: 'metro',
    // 1 710 M€ HT de travaux (janvier 2026) et 130 M€ de rames.
    cout: 1840,
    voyageurs: 81000,
    duree: 14,
    trace: 'idf-metro-1-val-de-fontenay',
    prolonge: 'metro-1',
    parcours: [
      [
        { nom: 'Château de Vincennes', pos: [2.43891, 48.84458] },
        { nom: 'Les Rigollots', pos: [2.45638, 48.84963] },
        { nom: 'Grands Pêchers', pos: [2.46621, 48.85874] },
        { nom: 'Val de Fontenay', pos: [2.48888, 48.85421] },
      ],
    ],
    statut:
      'À l’étude : une nouvelle concertation se tient du 5 octobre au 11 décembre 2026, avant une enquête publique prévue en 2028. Les études sont financées, pas la construction.',
    precisions: [
      'Le coût comprend 1 710 M€ hors taxes de travaux, aux conditions de janvier 2026, et 130 M€ de rames. En euros courants, avec l’inflation prévue jusqu’en 2040, le dossier de 2026 annonçait 2,5 milliards.',
      'Les 81 000 voyageurs par jour sont attendus en 2040.',
      'Île-de-France Mobilités vise des travaux à partir de 2033 et une mise en service vers 2040 : décidée en 2026, la ligne n’ouvre qu’après la fin de la partie.',
      'Une première enquête publique, en 2022, n’a pas abouti ; le projet a été revu depuis.',
    ],
    sources: [
      {
        titre:
          'Île-de-France Mobilités et RATP, dossier de concertation préalable 2026, chapitre 5 (calendrier, coût, prévisions de trafic)',
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/WkgzDq-AuCjNEpZi_ProlongementM1-DossierConcertation-Chap5.pdf',
        pages: 'p. 98 et 99 (calendrier), p. 100 et 101 (coût), p. 143 (81 000 voyageurs par jour)',
      },
      {
        titre: 'Île-de-France Mobilités et RATP, synthèse du dossier de concertation 2026',
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/Qwk7Lb48UnXIVWJp_ProlongementM1-Synthese-DossierConcertation.pdf',
        pages: 'p. 3',
      },
      {
        titre:
          "Île-de-France Mobilités, communiqué du 7 juillet 2026 sur le conseil d'administration du 2 juillet 2026 (métro 1, T10, T7, Bus EVE)",
        url: 'https://presse.iledefrance-mobilites.fr/ile-de-france-mobilites-poursuit-lagrandissement-du-reseau-francilien/',
      },
      {
        titre: 'Île-de-France Mobilités, page du projet Métro 1, prolongement à Val-de-Fontenay (chiffres clés et calendrier)',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/metro1-valdefontenay',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 13 du PDF (page 9 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-t1-val-de-fontenay',
    nom: 'Tram T1 jusqu’à Val de Fontenay',
    genre: 'Prolongement de tramway en chantier',
    description:
      'Le tram T1 est prolongé de la gare de Noisy-le-Sec à Val de Fontenay sur 7,7 km, avec quinze nouvelles stations à Noisy-le-Sec, Romainville, Montreuil, Rosny-sous-Bois et Fontenay-sous-Bois, en grande partie sur l’ancienne autoroute A186 devenue avenue. Il rejoint la ligne 11 place Carnot et les RER A et E à Val de Fontenay.',
    mode: 'tram',
    // 485,4 M€ HT d’infrastructure (janvier 2011) et 78,5 M€ de rames.
    cout: 564,
    voyageurs: 70400,
    duree: 4,
    trace: 'idf-t1-val-de-fontenay',
    prolonge: 'tram-T1',
    parcours: [
      [
        { nom: 'Gare de Noisy-le-Sec', pos: [2.46035, 48.89603] },
        { nom: 'Saint-Jean', pos: [2.45701, 48.89344] },
        { nom: "Place Jeanne d'Arc", pos: [2.45313, 48.89034] },
        { nom: 'Rue Hélène', pos: [2.45081, 48.88853] },
        { nom: 'Carrefour de la Vierge', pos: [2.44491, 48.88604] },
        { nom: 'Place Carnot', pos: [2.44079, 48.8833] },
        { nom: 'Courbet', pos: [2.44132, 48.87833] },
        { nom: 'Libre Pensée', pos: [2.44374, 48.8751] },
        { nom: 'Route de Romainville', pos: [2.44725, 48.87306] },
        { nom: 'Aristide Briand', pos: [2.45224, 48.87081] },
        { nom: 'Rue de Rosny', pos: [2.45789, 48.8673] },
        { nom: 'Théophile Sueur', pos: [2.46439, 48.86367] },
        { nom: 'Côte du Nord', pos: [2.47204, 48.8623] },
        { nom: 'Victor Hugo', pos: [2.48103, 48.86137] },
        { nom: 'Faidherbe', pos: [2.48888, 48.86032] },
        { nom: 'Val de Fontenay', pos: [2.49212, 48.85638] },
      ],
    ],
    statut:
      'Déclaré d’utilité publique en 2014 et en travaux depuis 2019 : il doit atteindre la rue de Rosny, à Montreuil, mi-2028, puis Val de Fontenay mi-2030.',
    precisions: [
      'Le coût comprend 485,4 M€ d’infrastructure, aux conditions de janvier 2011, et les 78,5 M€ de rames qu’affiche Île-de-France Mobilités. Une partie est déjà payée depuis le début des travaux, mais ce qui reste à payer n’est pas publié : nous comptons le coût total.',
      'Les 70 400 voyageurs par jour portent sur tout l’arc de Bobigny à Val de Fontenay, y compris la section déjà ouverte jusqu’à Noisy-le-Sec.',
      'Les quatre ans sont ceux qui restent avant l’ouverture complète, mi-2030.',
    ],
    sources: [
      {
        titre:
          'Département de la Seine-Saint-Denis et RATP, avant-projet modificatif du prolongement du T1 Bobigny Val de Fontenay, juin 2020',
        url: 'https://www.t1bobigny-valdefontenay.fr/files/t1-bobigny-val-de-fontenay-avp-modificatif-juin2020_b74e61ce6ab31785ffbf039397cfed81.pdf',
        pages: 'p. 52 et 53 (coût), p. 55 (trafic journalier)',
      },
      {
        titre: 'Site du projet T1 Bobigny Val de Fontenay, calendrier et acteurs (coût total, phases de mise en service)',
        url: 'https://www.t1bobigny-valdefontenay.fr/fr/calendrier-et-acteurs',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          "Île-de-France Mobilités, page du projet Tram T1, prolongement à Val-de-Fontenay (calendrier, déclaration d'utilité publique)",
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t1-valdefontenay',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-t1-colombes',
    nom: 'Tram T1 jusqu’à Petit Colombes',
    genre: 'Prolongement de tramway',
    description:
      'Le tram T1 est prolongé d’Asnières Quatre-Routes à Petit Colombes sur 5,5 km, avec onze nouvelles stations, toutes à Colombes. Il dessert la gare du Stade, le stade Yves-du-Manoir et l’hôpital Louis-Mourier, et rejoint le tram T2 au parc Pierre-Lagravère.',
    mode: 'tram',
    // 279,2 M€ d’infrastructure et 46 M€ de rames, en euros de 2013, pour les deux phases.
    cout: 325,
    voyageurs: 60000,
    duree: 5,
    trace: 'idf-t1-colombes',
    prolonge: 'tram-T1',
    parcours: [
      [
        { nom: 'Asnières Quatre-Routes', pos: [2.27456, 48.92728] },
        { nom: 'Champarons', pos: [2.2703, 48.9283] },
        { nom: 'Caillebotte', pos: [2.26671, 48.93172] },
        { nom: 'Gare du Stade', pos: [2.2627, 48.9347] },
        { nom: 'Valmy', pos: [2.25532, 48.93229] },
        { nom: 'Pierre de Coubertin', pos: [2.25335, 48.92877] },
        { nom: 'Stade Yves du Manoir', pos: [2.2462, 48.9271] },
        { nom: 'Île Marante', pos: [2.2418, 48.9257] },
        { nom: 'Hôpital Louis Mourier', pos: [2.2357, 48.9234] },
        { nom: 'Rue de Seine', pos: [2.2303, 48.9212] },
        { nom: 'Parc Pierre Lagravère', pos: [2.22431, 48.91804] },
        { nom: 'Petit Colombes', pos: [2.2265, 48.9134] },
      ],
    ],
    statut:
      'Déclaré d’utilité publique en 2015. La première phase a ouvert en 2019 jusqu’à Asnières Quatre-Routes ; la seconde est en études et en travaux préparatoires, sans date de mise en service.',
    precisions: [
      'Le coût de 325 M€, en euros de 2013, comprend 279,2 M€ d’infrastructure et 46 M€ de rames, pour les deux phases : celui de la seule seconde phase n’est pas publié.',
      'Les 60 000 voyageurs par jour portent sur tout le prolongement de 6,4 km, y compris les 900 m ouverts en 2019.',
      'Aucune date d’ouverture n’est fixée : nous comptons cinq ans de chantier, comme pour les trams que vous tracez.',
      'Les positions des stations sont estimées à environ 100 m près.',
    ],
    estime: { duree: true },
    sources: [
      {
        titre: 'Île-de-France Mobilités, page Tram T1, prolongement à Colombes, financement et acteurs',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t1-colombes/financement-et-acteurs-tram-t1-colombes',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Île-de-France Mobilités, fiche projet Tram T1 prolongement ouest Asnières Colombes (2018)',
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/ZDA5MWE2YjktNTMyZi00NDJiLTlmZDEtMjY5MzU4NmNmYzZj_4073716d-c60e-4de5-9a82-91c9e815c45e_fp-2018_tram-1-colombes_mel.pdf',
        pages: 'p. 1 (60 000 voyageurs quotidiens, 6,4 km, 12 stations) et p. 2 (financement)',
      },
      {
        titre:
          "Département des Hauts-de-Seine et RATP, site du projet T1 Asnières Colombes, page le projet (DUP, phases, état d'avancement)",
        url: 'https://www.t1asnierescolombes.fr/projet/',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-t1-rueil-malmaison',
    nom: 'Tram T1 jusqu’à Rueil-Malmaison',
    genre: 'Prolongement de tramway',
    description:
      'Le tram T1 est prolongé de Petit Colombes au château de Malmaison sur 7,5 km, avec quinze stations à Nanterre et Rueil-Malmaison. Il dessert le Petit Nanterre, l’université, la préfecture et les deux centres-villes, avec des correspondances vers le RER A et la ligne L à Nanterre Université, et vers la ligne 15 à Nanterre La Boule.',
    mode: 'tram',
    // 430,8 M€ HT (janvier 2017), dont 51 M€ de rames.
    cout: 431,
    voyageurs: 64000,
    duree: 5,
    requiert: 'idf-t1-colombes',
    trace: 'idf-t1-rueil-malmaison',
    parcours: [
      [
        { nom: 'Petit Colombes', pos: [2.2265, 48.9134] },
        { nom: 'Max Fourestier', pos: [2.2205, 48.9109] },
        { nom: 'Petit Nanterre', pos: [2.2142, 48.9082] },
        { nom: 'Archéologie', pos: [2.2099, 48.9055] },
        { nom: 'Anatole France', pos: [2.20613, 48.903] },
        { nom: 'Nanterre Université', pos: [2.213, 48.9011] },
        { nom: "Droits de l'Homme", pos: [2.21599, 48.89587] },
        { nom: 'Les Amandiers', pos: [2.21205, 48.8938] },
        { nom: 'Nanterre Mairie', pos: [2.20789, 48.89145] },
        { nom: 'Nanterre La Boule', pos: [2.20032, 48.88713] },
        { nom: 'Sainte-Geneviève', pos: [2.19587, 48.88537] },
        { nom: 'Auguste Neveu', pos: [2.1894, 48.88309] },
        { nom: 'Caserne des Suisses', pos: [2.1846, 48.8813] },
        { nom: 'Rueil-Malmaison Mairie', pos: [2.1795, 48.8793] },
        { nom: 'Bois Préau', pos: [2.17361, 48.87725] },
        { nom: 'Château de Malmaison', pos: [2.1686, 48.875] },
      ],
    ],
    statut: 'Déclaré d’utilité publique le 8 octobre 2020 ; les études et les déviations de réseaux sont en cours en 2026.',
    precisions: [
      'Le coût de 430,8 M€ hors taxes, aux conditions de janvier 2017, comprend 51 M€ de rames.',
      'Les 64 000 voyageurs par jour sont une première estimation.',
      'Ce prolongement part de Petit Colombes : il faut d’abord construire le tram T1 jusqu’à Petit Colombes.',
      'Île-de-France Mobilités ne publie pas de calendrier à jour : la ville de Nanterre attend la première phase en 2031, la ville de Rueil-Malmaison en 2030.',
      'Les noms des stations sont provisoires, et leurs positions estimées à environ 100 m près.',
    ],
    sources: [
      {
        titre: 'Île-de-France Mobilités, page Tram T1, prolongement à Rueil-Malmaison, le coût et les acteurs',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t1-nanterre-rueil/le-cout-et-les-acteurs',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          "Île-de-France Mobilités et Département des Hauts-de-Seine, dossier d'enquête publique 2019, pièce F, appréciation sommaire des dépenses",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/0f4b3250-aae6-41c0-8cda-6fb16b606379_F.pdf',
        pages: 'p. 8',
      },
      {
        titre:
          'Île-de-France Mobilités, page Tram T1, prolongement à Rueil-Malmaison (64 000 voyageurs par jour, DUP du 8 octobre 2020, calendrier)',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t1-nanterre-rueil',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: "Dossier d'enquête publique 2019, pièce B, notice explicative (bandeau des 15 stations)",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/57bc6cad-e78b-44dc-9af8-f2015f15ecbc_B.pdf',
        pages: 'p. 29',
      },
      {
        titre: 'Ville de Nanterre, page le prolongement du T1 (mise en service de la phase 1 estimée à 2031)',
        url: 'https://www.nanterre.fr/annuaires/projets/detail/le-prolongement-du-t1',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Ville de Rueil-Malmaison, page prolongement de la ligne de tramway T1 (mise à jour le 21 juillet 2026)',
        url: 'https://www.villederueil.fr/votre-mairie/grands-projets/ligne-de-tram-t1/',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-t8-sud',
    nom: 'Tram T8 jusqu’à Paris Rosa Parks',
    genre: 'Prolongement de tramway',
    description:
      'Le tram T8 est prolongé vers le sud, de Saint-Denis Porte de Paris à la gare Rosa Parks, à Paris, sur 5,5 km avec dix nouvelles stations. Il traverse Saint-Denis, Aubervilliers et les 18e et 19e arrondissements, avec des correspondances vers le RER B et la ligne 15 à La Plaine Stade de France, la ligne 12 à Front Populaire, le RER E et le tram T3b à Rosa Parks.',
    mode: 'tram',
    // 224 M€ HT d’infrastructure et 48 M€ pour seize rames (janvier 2023).
    cout: 272,
    voyageurs: 98000,
    duree: 5,
    trace: 'idf-t8-sud',
    prolonge: 'tram-T8',
    parcours: [
      [
        { nom: 'Saint-Denis Porte de Paris', pos: [2.35751, 48.9298] },
        { nom: 'Lycée Suger', pos: [2.36578, 48.92963] },
        { nom: 'Le Franc-Moisin', pos: [2.36687, 48.92697] },
        { nom: 'Casanova-Pressensé', pos: [2.36951, 48.92367] },
        { nom: 'La Plaine Stade de France', pos: [2.36279, 48.91924] },
        { nom: 'Lycée Angela Davis', pos: [2.36669, 48.91505] },
        { nom: 'Campus Condorcet', pos: [2.36602, 48.91098] },
        { nom: 'Front Populaire', pos: [2.366, 48.90675] },
        { nom: 'EMGP', pos: [2.36641, 48.90303] },
        { nom: "Porte d'Aubervilliers Place Skanderbeg", pos: [2.37118, 48.90225] },
        { nom: 'Rosa Parks', pos: [2.37464, 48.89863] },
      ],
    ],
    statut:
      'Déclaré d’utilité publique en mars 2025 ; les études détaillées se poursuivent en 2026 et 2027, avant des travaux de 2027 à 2031.',
    precisions: [
      'Le coût de 272 M€ hors taxes, aux conditions de janvier 2023, comprend 48 M€ pour seize rames ; il est estimé à 10 % près.',
      'Les 98 000 voyageurs par jour portent sur le seul prolongement, en 2030 ; toute la ligne en compterait 167 000.',
      'Les noms des stations sont provisoires.',
    ],
    sources: [
      {
        titre: "Île-de-France Mobilités, dossier d'enquête d'utilité publique 2024, pièce I, appréciation sommaire des dépenses",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/ZpaHGB5LeNNTxNHp_I_Appreciation_sommaire_des_depenses.pdf',
        pages: 'p. 4',
      },
      {
        titre: "Île-de-France Mobilités, dossier d'enquête d'utilité publique 2024, pièce H, évaluation socio-économique",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/ZpaHFx5LeNNTxNHn_H_Evaluation_socio_economique.pdf',
        pages: 'p. 6 (synthèse) et p. 12 (98 000 voyageurs par jour)',
      },
      {
        titre:
          "Île-de-France Mobilités, page Tram T8, prolongement à Paris Rosa Parks (DUP 2025, travaux 2027 à 2031, mise en service à l'horizon 2031)",
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t8-prolongement',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          "Préfectures de la Seine-Saint-Denis et de la région Île-de-France, arrêté inter-préfectoral de déclaration d'utilité publique du T8 Sud, mars 2025",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/Z-F4bXdAxsiBv0Xi_2025-03-20_T8S_APDUP_1241.pdf',
        pages: 'document entier',
      },
      {
        titre: "Dossier d'enquête d'utilité publique 2024, pièce B, notice explicative (tracé et stations)",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/ZpaHIR5LeNNTxNH3_B_Notice_explicative.pdf',
        pages: 'p. 20',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-t10-clamart',
    nom: 'Tram T10 jusqu’à la gare de Clamart',
    genre: 'Prolongement de tramway',
    description:
      'Le tram T10 est prolongé en souterrain de Jardin Parisien à la gare de Clamart, sur environ 3,5 km, avec trois nouvelles stations : Mairie de Clamart, Victor Hugo et Gare de Clamart. Il relie le sud des Hauts-de-Seine à la ligne 15 et au train N, et doit soulager les bus 189 et 191.',
    mode: 'tram',
    // 728,6 M€ HT (juillet 2024) et 40,5 M€ de rames.
    cout: 769,
    voyageurs: 55000,
    duree: 12,
    trace: 'idf-t10-clamart',
    prolonge: 'tram-T10',
    parcours: [
      [
        { nom: 'Jardin Parisien', pos: [2.25277, 48.79022] },
        { nom: 'Mairie de Clamart', pos: [2.26355, 48.79862] },
        { nom: 'Victor Hugo', pos: [2.26843, 48.80539] },
        { nom: 'Gare de Clamart', pos: [2.2724, 48.8134] },
      ],
    ],
    statut: 'Île-de-France Mobilités a approuvé le schéma de principe le 2 juillet 2026 ; l’enquête publique est prévue début 2027.',
    precisions: [
      'Le coût comprend 728,6 M€ hors taxes, aux conditions de juillet 2024, et 40,5 M€ de rames. Le tunnel explique ce prix, élevé pour un tram.',
      'Les 55 000 voyageurs par jour portent sur le seul prolongement ; toute la ligne en compterait 81 000, contre 38 000 sans lui.',
      'Les travaux iraient de 2031 à 2038, pour une mise en service à la toute fin de la partie.',
    ],
    sources: [
      {
        titre: 'Île-de-France Mobilités, schéma de principe du prolongement du T10, 2026',
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/XHWoIzHBXqF3voOu_T10_SDP_publi.pdf',
        pages: 'p. 55 (fréquentation) et p. 202 (coût)',
      },
      {
        titre:
          "Île-de-France Mobilités, communiqué du 7 juillet 2026 sur le conseil d'administration du 2 juillet 2026 (métro 1, T10, T7, Bus EVE)",
        url: 'https://presse.iledefrance-mobilites.fr/ile-de-france-mobilites-poursuit-lagrandissement-du-reseau-francilien/',
      },
      {
        titre: 'Île-de-France Mobilités, support de la réunion publique du 6 juillet 2026 à Clamart',
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/7vZsjXKNHEFts1-8_T10-RPJuillet2026-PPT.V06.07.26.pdf',
        pages: "p. 47 (fréquentation) et p. 52 (calendrier jusqu'en 2038)",
      },
      {
        titre:
          'Île-de-France Mobilités, page Tram T10, prolongement à Gare de Clamart (chiffres clés, mise en service envisagée à partir de 2038)',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t10-prolongement',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 13 et 14 du PDF (pages 9 et 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-t7-juvisy',
    nom: 'Tram T7 jusqu’à Juvisy-sur-Orge',
    genre: 'Prolongement de tramway en chantier',
    description:
      'Le tram T7 est prolongé d’Athis-Mons Porte de l’Essonne à la gare de Juvisy-sur-Orge, sur 3,7 km avec six nouvelles stations, dont une souterraine à l’Observatoire. Il suit la RN7 à Athis-Mons et Paray-Vieille-Poste, puis rejoint les RER C et D à Juvisy.',
    mode: 'tram',
    // 223,5 M€ d’infrastructure (euros de 2011) et 29 M€ de rames (euros de 2018).
    cout: 253,
    voyageurs: 22400,
    duree: 6,
    trace: 'idf-t7-juvisy',
    prolonge: 'tram-T7',
    parcours: [
      [
        { nom: "Athis-Mons Porte de l'Essonne", pos: [2.37181, 48.71452] },
        { nom: 'Le Contin', pos: [2.3714, 48.70882] },
        { nom: 'Stade Delaune', pos: [2.37168, 48.70364] },
        { nom: 'Pyramide', pos: [2.3716, 48.6977] },
        { nom: 'Observatoire', pos: [2.37092, 48.69325] },
        { nom: 'Maréchal Leclerc', pos: [2.37711, 48.69115] },
        { nom: 'Pôle intermodal de Juvisy', pos: [2.3812, 48.6903] },
      ],
    ],
    statut:
      'Déclaré d’utilité publique en 2013 et en travaux : les réseaux depuis 2023, la RN7 depuis 2025, le tunnel à partir de fin 2026, pour une mise en service vers 2032.',
    precisions: [
      'Le coût comprend 223,5 M€ d’infrastructure, en euros de 2011, et 29 M€ de rames, en euros de 2018. Une partie est déjà engagée depuis le début des travaux, mais ce qui reste à payer n’est pas publié : nous comptons le coût total.',
      'Les 22 400 voyageurs par jour sur le seul prolongement viennent de l’étude de 2013 ; Île-de-France Mobilités annonce aujourd’hui 60 000 voyageurs par jour sur toute la ligne, sans chiffre récent pour le prolongement.',
    ],
    sources: [
      {
        titre: 'Île-de-France Mobilités, page Tram T7, Athis-Mons Juvisy-sur-Orge, le financement et les acteurs',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t7-prolongement/demarche-environnementale-t7',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          "STIF, dossier d'enquête préalable à la déclaration d'utilité publique 2013, pièces A à F et H (prévisions de fréquentation et coût)",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/451e5cf7-f666-4a45-980f-9228adb21402_8-DEUP-Pi%C3%A8ces-A-%C3%A0-F-et-H.pdf',
        pages: 'p. 683 du dossier (page 223 du PDF) pour le trafic, p. 687 (page 227 du PDF) pour le coût',
      },
      {
        titre: "Île-de-France Mobilités, page Tram T7, le projet (grandes étapes, mise en service à l'horizon 2032)",
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t7-prolongement/le-projet-t7',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Île-de-France Mobilités, dépliant du prolongement du tram T7, août 2026 (stations et calendrier)',
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/Jee30Ah3GUBnvAO0_SE26000479_IDFM_T7_depliant_A5.pdf',
        pages: 'p. 2',
      },
      {
        titre: "Préfecture de l'Essonne, arrêté de déclaration d'utilité publique du prolongement du T7, 27 novembre 2013",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/b35fb890-385f-433b-86f6-42556d06024c_3-20131127_declaration_utilite_publique_prolongement_T7_web.pdf',
        pages: 'document entier',
      },
      {
        titre:
          "Île-de-France Mobilités, communiqué du 7 juillet 2026 sur le conseil d'administration du 2 juillet 2026 (métro 1, T10, T7, Bus EVE)",
        url: 'https://presse.iledefrance-mobilites.fr/ile-de-france-mobilites-poursuit-lagrandissement-du-reseau-francilien/',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-t13-acheres',
    nom: 'Tram T13 jusqu’à Achères',
    genre: 'Nouvelle branche de tram-train en chantier',
    description:
      'Le tram-train T13, qui relie Saint-Cyr-l’École à Saint-Germain-en-Laye, reçoit une seconde branche d’environ 10 km : partie de Lisière Pereire, elle traverse la forêt de Saint-Germain sur l’ancienne Grande Ceinture, parcourt Poissy en tramway, puis longe les voies ferrées jusqu’à la gare d’Achères-Ville. Ses quatre nouvelles stations desservent le centre de Poissy et sa gare, l’écoquartier Rouget-de-Lisle et la gare d’Achères-Ville, sur le RER A.',
    mode: 'tram',
    // 361,2 M€ HT d’infrastructure (janvier 2013) et 84,6 M€ de rames.
    cout: 446,
    voyageurs: 17000,
    duree: 2,
    trace: 'idf-t13-acheres',
    parcours: [
      [
        { nom: 'Lisière Pereire', pos: [2.07298, 48.90309] },
        { nom: 'Poissy Gambetta', pos: [2.05023, 48.92735] },
        { nom: 'Poissy RER', pos: [2.04394, 48.93259] },
        { nom: 'Poissy ZAC', pos: [2.05632, 48.93978] },
        { nom: 'Achères-Ville RER', pos: [2.07735, 48.9684] },
      ],
    ],
    statut:
      'Déclaré d’utilité publique en 2018 et en travaux depuis fin 2024 : Île-de-France Mobilités prévoit la mise en service en 2028.',
    precisions: [
      'Le coût additionne 361,2 M€ hors taxes d’infrastructure, aux conditions de janvier 2013, et 84,6 M€ de rames. En euros courants, l’État annonce 502 M€ pour l’infrastructure seule. Une partie est déjà engagée depuis le début des travaux, mais ce qui reste à payer n’est pas publié : nous comptons le coût total.',
      'Les 17 000 voyageurs par jour portent sur le seul prolongement ; toute la ligne en compterait 33 000.',
      'Les trams pour Achères partiront de Saint-Cyr-l’École : aucun ne partira de la gare de Saint-Germain-en-Laye.',
      'Les noms des stations sont provisoires.',
    ],
    sources: [
      {
        titre:
          'Île-de-France Mobilités, page du projet Tram T13, prolongement à Achères : 17 000 voyageurs quotidiens attendus, 10 km, quatre stations créées, calendrier',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t13-prolongement',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Île-de-France Mobilités, page Les travaux : travaux d’infrastructure de 2026 à 2028, essais et marche à blanc en 2028 avant la mise en service',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t13-prolongement/travaux-t13',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Île-de-France Mobilités, page Les stations et le tram : Lisière Pereire, Poissy Gambetta, Poissy RER, Poissy ZAC et Achères-Ville RER (noms provisoires), rames supplémentaires pour le prolongement',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t13-prolongement/cinq-stations-entre-saint-germain-en-laye-et-acheres',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Île-de-France Mobilités, page Le tracé : parcours dans la forêt de Saint-Germain, à Poissy et à Achères, emplacement des stations',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t13-prolongement/parcourir-le-trace',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Île-de-France Mobilités, page Poissy, les zones desservies : Poissy Gambetta sur l’avenue de Versailles au square Erard Prieur, Poissy RER au sud de la place de l’Europe, passage vers Poissy ZAC depuis la piscine Saint-Exupéry',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t13-prolongement/les-zones-desservies',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Île-de-France Mobilités, page du secteur Saint-Exupéry : rampe depuis la RD30 et accès depuis la piscine vers la future station Poissy ZAC, utilisés pour placer la station',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t13-prolongement/st-exupery-bolland',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Île-de-France Mobilités, info travaux du 17 octobre 2025 sur le futur terminus avenue de Conflans à Achères, avec le plan de la zone de travaux utilisé pour placer la station Achères-Ville RER',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t13-prolongement/actualites/t13-it-travaux-prepa-acheres-oct2025',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Île-de-France Mobilités, page La démarche environnementale : autorisation environnementale accordée le 27 novembre 2024',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tram-t13-prolongement/la-demarche-environnementale',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Île-de-France Mobilités, communiqué du 16 juin 2025, coup d’envoi des travaux : fin des travaux prévue fin 2027, ligne opérationnelle courant 2028, 33 000 voyageurs par jour sur la ligne, financement par l’État (21 %), la Région (49 %) et le Département des Yvelines (30 %)',
        url: 'https://presse.iledefrance-mobilites.fr/prolongement-du-tram-t13-jusqua-acheres-coup-denvoi-des-travaux-damenagement/?lang=fr',
      },
      {
        titre:
          'DRIEAT Île-de-France, Prolongement du Tram T13 : les travaux vers Achères sont officiellement lancés, 27 novembre 2025 : 10,5 km, 33 000 voyageurs par jour à terme, coût de 502 M€, mise en service prévue à l’été 2028',
        url: 'https://www.drieat.ile-de-france.developpement-durable.gouv.fr/prolongement-du-tram-t13-les-travaux-vers-acheres-a13251.html',
      },
      {
        titre:
          'Autorité environnementale (IGEDD), avis délibéré n° 2024-18 du 25 avril 2024 sur le tram T13 phase 2 : 9,92 km et quatre stations, 361,2 M€ HT d’infrastructure aux conditions de janvier 2013 et 84,6 M€ HT de rames, DUP du 6 décembre 2018 prorogée le 9 juin 2023, 38 000 voyageurs par jour ouvrable sur la ligne dont 24 000 vers Achères, fréquentation de la première phase',
        url: 'https://www.igedd.developpement-durable.gouv.fr/IMG/pdf/01__240425_tramway_t13_phase_2_delibere_cle0ddabe.pdf',
        pages: 'p. 5 (tracé et stations), p. 8 (coût et calendrier), p. 10 (DUP et prorogation), p. 23 (trafic)',
      },
      {
        titre:
          'Région Île-de-France, rapport CP 2024-224 du 27 septembre 2024 : avance de 30 M€ par la Région à la place du Département, et annexe 3, protocole de financement du T13 phase 2 (coût d’objectif de 361,24 M€ aux conditions de janvier 2013, 461,8 M€ courants pour les travaux et le foncier, 63,6 M€ courants déjà engagés pour les études)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CP2024-224RAP.pdf',
        pages: 'p. 3, puis p. 70 à 73 du PDF',
      },
      {
        titre:
          'Commission d’enquête E24000029/78, rapport et conclusions de l’enquête publique environnementale de l’été 2024 : mise en service à la mi-2028, 21 000 voyageurs par jour sur le tronc commun et 38 000 sur les deux branches, 361,2 M€ HT hors rames, pas de trajet direct entre Achères et Saint-Germain-en-Laye',
        url: 'https://www.cnce.fr/upload/enquiry/e24000029-78-1-rapport-et-conclusions-66ec6c747e98f365879557.pdf',
        pages: 'p. 8 sur 168',
      },
      {
        titre:
          'Département des Yvelines, page Tram 13 Express, modifiée le 25 octobre 2024 : phase 2 estimée à 363 M€ valeur 2013, soit 502 M€ courants au stade des études de projet, dont 30 % pour le Département',
        url: 'https://www.yvelines.fr/cadre-de-vie/deplacements/transports/tram-13-express/',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Communauté urbaine Grand Paris Seine & Oise, convention avec Île-de-France Mobilités annexée à la délibération du 10 avril 2025 : arrêté de DUP n° 78-2018-12-06-013 du 6 décembre 2018, prorogation n° 78-2023-06-09-00003 du 9 juin 2023, tracé à Poissy et Achères',
        url: 'https://gpseo.fr/sites/gpseo/files/document/2025-04/cc_2025-04-10_23.1_annexe-1.pdf',
        pages: 'p. 2',
      },
      {
        titre:
          'Ville, Rail & Transports, 16 juillet 2026 : Île-de-France Mobilités commande à CAF quinze tram-trains pour le prolongement du T13, commande approuvée le 2 juillet 2026',
        url: 'https://www.ville-rail-transports.com/ferroviaire/idfm-commande-a-caf-15-trams-trains-pour-lextension-du-t13/',
      },
      {
        titre: 'Le Rail, 27 août 2026 : CAF fournira quinze tram-trains pour la ligne T13, contrat de plus de 150 M€',
        url: 'https://lerail.com/news/114065-caf-fournira-15-tram-trains-pour-la-ligne-t13-en-%C3%AEle-de-france',
      },
      {
        titre: 'OpenStreetMap, nœud de la station existante Lisière Pereire (2315855073)',
        url: 'https://www.openstreetmap.org/node/2315855073',
      },
      {
        titre: 'OpenStreetMap, nœud en chantier de la station Poissy Gambetta (3263983289)',
        url: 'https://www.openstreetmap.org/node/3263983289',
      },
      {
        titre: 'OpenStreetMap, nœud en chantier de la station Poissy RER (257399905)',
        url: 'https://www.openstreetmap.org/node/257399905',
      },
    ],
  },
  {
    id: 'idf-tzen-5',
    nom: 'Tzen 5, de Paris à Choisy-le-Roi',
    genre: 'Bus à haut niveau de service',
    description:
      'Ce bus à haut niveau de service roule sur voies réservées sur 9,5 km, avec 19 stations, de la Bibliothèque François-Mitterrand, dans le 13e arrondissement, à Choisy-le-Roi. Il longe la Seine à Ivry-sur-Seine et Vitry-sur-Seine, dessert Ivry Confluences et les Ardoines, et rejoint le RER C et les lignes 14 et 15.',
    mode: 'bus',
    // 117 M€ HT d’infrastructure (août 2014) et 25,5 M€ de bus.
    cout: 143,
    voyageurs: 37000,
    duree: 2,
    trace: 'idf-tzen-5',
    parcours: [
      [
        { nom: 'Grands Moulins', pos: [2.37879, 48.8285] },
        { nom: 'Porte de France', pos: [2.3811, 48.82597] },
        { nom: 'Marcel Boyer', pos: [2.393, 48.8222] },
        { nom: 'Paul Vaillant-Couturier Vanzuppe', pos: [2.39505, 48.82042] },
        { nom: 'Gambetta', pos: [2.40223, 48.81468] },
        { nom: 'Gunsbourg', pos: [2.40645, 48.8133] },
        { nom: "Port-à-l'Anglais", pos: [2.41203, 48.80142] },
        { nom: 'Berthie Albrecht', pos: [2.40887, 48.79863] },
        { nom: 'Fusillés', pos: [2.41674, 48.78767] },
        { nom: 'Gare Ardoines', pos: [2.40768, 48.78223] },
        { nom: 'Voltaire', pos: [2.40829, 48.77942] },
        { nom: 'Docteur Roux', pos: [2.407, 48.7715] },
        { nom: 'Régnier-Marcailloux', pos: [2.4079, 48.7686] },
      ],
    ],
    statut: 'Déclaré d’utilité publique en 2016 ; les travaux de la ligne ont commencé à l’automne 2026, pour des essais fin 2027.',
    precisions: [
      'Le coût comprend 117 M€ hors taxes d’infrastructure, aux conditions d’août 2014, et 25,5 M€ de bus. Île-de-France Mobilités publie aussi 139,6 M€ d’infrastructure, sans expliquer l’écart.',
      'Les 37 000 voyageurs par jour sont attendus à terme, vers 2032 ou 2035.',
      'Les noms des stations sont provisoires ; notre tracé passe par treize des dix-neuf, à environ 100 m près.',
    ],
    sources: [
      {
        titre: 'Île-de-France Mobilités, page Tzen 5, le financement et les acteurs',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tzen5/acteurs-et-financement-tzen5',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Île-de-France Mobilités, page Tzen 5 (chiffres clés et calendrier)',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tzen5',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Île-de-France Mobilités, dépliant Tzen 5, juin 2026 (coût, fréquentation, stations)',
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/ajJIao1P9HI4UmgP_Tzen5_d%C3%A9pliantg%C3%A9n%C3%A9rique_Vdef_WEB.pdf',
        pages: 'p. 1 et 2',
      },
      {
        titre: 'Île-de-France Mobilités, foire aux questions Tzen 5 : coût et calendrier (mise à jour du 22 avril 2026)',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tzen5/questions/tzen5-faq-q11',
        pages: 'page web consultée le 25 septembre 2026 (voir aussi la question 9 sur le coût)',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-tzen-3',
    nom: 'Tzen 3, de Paris aux Pavillons-sous-Bois',
    genre: 'Bus à haut niveau de service',
    description:
      'Ce bus à haut niveau de service roule sur voies réservées le long de l’ex-RN3, sur environ 10 km avec 21 stations, de la Porte de Pantin à Gargan, aux Pavillons-sous-Bois. Il traverse Pantin, Bobigny, Romainville, Noisy-le-Sec et Bondy, reprend l’essentiel du trajet du bus 147 et rejoint la ligne 5 et les trams T1, T3b et T4.',
    mode: 'bus',
    // 187,7 M€ HT d’infrastructure (2010) et 16 M€ de bus.
    cout: 204,
    voyageurs: 42000,
    duree: 4,
    trace: 'idf-tzen-3',
    parcours: [
      [
        { nom: 'Porte de Pantin', pos: [2.39268, 48.88866] },
        { nom: 'Hoche', pos: [2.40251, 48.89129] },
        { nom: 'Église de Pantin', pos: [2.4131, 48.89309] },
        { nom: 'Raymond Queneau', pos: [2.425, 48.89513] },
        { nom: 'Commune de Paris', pos: [2.433, 48.8969] },
        { nom: 'La Folie', pos: [2.44203, 48.89908] },
        { nom: 'Pont de Bondy', pos: [2.46926, 48.90555] },
        { nom: 'Polissard', pos: [2.48141, 48.90586] },
        { nom: 'La Fourche', pos: [2.49367, 48.90793] },
        { nom: 'Gargan', pos: [2.51621, 48.90904] },
      ],
    ],
    statut:
      'Enquête publique en 2016 ; revu et soumis à une nouvelle concertation en 2025, le projet doit repasser en enquête publique avant des travaux visés à partir de 2027.',
    precisions: [
      'Le coût comprend 187,7 M€ hors taxes d’infrastructure, aux conditions de 2010, avant la refonte du projet, et 16 M€ de bus : aucun coût actualisé n’est publié.',
      'Les 42 000 voyageurs par jour viennent des études antérieures ; en 2025, l’équipe du projet parlait de près de 40 000, contre 23 000 sur le bus 147.',
      'Le terminus de Gargan et trois ou quatre stations ne sont pas arrêtés : notre tracé passe par les arrêts de bus actuels.',
    ],
    sources: [
      {
        titre: 'Département de la Seine-Saint-Denis, site du Tzen 3, découvrir le projet (coût)',
        url: 'https://tzen3.fr/fr/decouvrir-le-projet',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Ville de Romainville, page TZen 3 (42 000 voyageurs attendus par jour, calendrier)',
        url: 'https://www.ville-romainville.fr/1063-tzen-3.htm',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Département de la Seine-Saint-Denis, actualité du 18 avril 2026 : en 2026, les études se poursuivent',
        url: 'https://tzen3.fr/fr/actualites/les-etudes-se-poursuivent',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Département de la Seine-Saint-Denis, compte rendu de la réunion publique du 12 juin 2025 aux Pavillons-sous-Bois',
        url: 'https://www.tzen3.fr/api/documents/683/download',
        pages: 'p. 3 (horizon 2030) et p. 8 (trois ans de travaux)',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-tzen-2',
    nom: 'Tzen 2, de Lieusaint à Melun',
    genre: 'Bus à haut niveau de service en chantier',
    description:
      'Ce bus à haut niveau de service relie le Carré Sénart, à Lieusaint, à la gare de Melun sur voies réservées, avec 26 stations. Il dessert Savigny-le-Temple, Cesson, Vert-Saint-Denis et Melun, avec des correspondances vers le RER D, la ligne R et le Tzen 1.',
    mode: 'bus',
    // 179,1 M€ d’infrastructure (2016), sans les bus.
    cout: 179,
    voyageurs: 27000,
    duree: 5,
    trace: 'idf-tzen-2',
    parcours: [
      [
        { nom: "Carré Trait d'Union", pos: [2.54451, 48.61569] },
        { nom: '8 Mai 1945', pos: [2.55933, 48.6039] },
        { nom: 'Le Parc', pos: [2.57517, 48.60099] },
        { nom: 'Les Lycées', pos: [2.57712, 48.59637] },
        { nom: 'Gare de Savigny-le-Temple Nandy', pos: [2.58295, 48.59529] },
        { nom: 'Les Routoires', pos: [2.58533, 48.5978] },
        { nom: 'Bois Sénart', pos: [2.60192, 48.58566] },
        { nom: 'Moulin à Vent', pos: [2.60567, 48.58154] },
        { nom: 'Aimé Césaire', pos: [2.609, 48.5692] },
        { nom: 'Haies Fleuries', pos: [2.61422, 48.56896] },
        { nom: 'Adenauer', pos: [2.6328, 48.56197] },
        { nom: 'Hôpital', pos: [2.642, 48.5565] },
        { nom: 'Trois Horloges', pos: [2.65735, 48.55059] },
        { nom: 'Saint-Jean', pos: [2.66275, 48.53938] },
        { nom: 'Gare de Melun', pos: [2.65528, 48.52784] },
      ],
    ],
    statut: 'Déclaré d’utilité publique en 2014 et en travaux par secteurs depuis 2019, pour une mise en service complète visée en 2031.',
    precisions: [
      'Le coût de 179,1 M€, aux conditions de 2016, ne comprend que l’infrastructure : le prix des bus n’est pas publié. Une partie est déjà engagée depuis 2019 : nous comptons le coût total.',
      'La ligne Citalien utilise déjà une partie de la voie réservée depuis 2021.',
      'Les noms des stations sont provisoires ; notre tracé passe par quinze des vingt-six.',
    ],
    sources: [
      {
        titre: 'Île-de-France Mobilités, page Tzen 2, Lieusaint Melun (27 000 voyageurs quotidiens, DUP 2014, travaux 2019 à 2031)',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tzen2',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Île-de-France Mobilités, page Tzen 2, financement et acteurs (179,1 M€, conditions économiques de 2016)',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/tzen2/financement-et-acteurs-tzen2',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Département de Seine-et-Marne, site du Tzen 2, découvrir le Tzen 2 (objectif de mise en service en 2031)',
        url: 'https://www.tzen2.com/decouvrir-le-tzen-2',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre: 'Département de Seine-et-Marne, plaquette générique du Tzen 2, 2026 (parcours et calendrier des travaux)',
        url: 'https://www.tzen2.com/sites/default/files/2026-08/Plaquette%20g%C3%A9n%C3%A9rique%20du%20Tzen%202.pdf',
        pages: 'p. 3 et 4',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-bus-bords-de-marne',
    nom: 'Bus Bords de Marne',
    genre: 'Bus à haut niveau de service',
    description:
      'Cette nouvelle ligne de bus relie la gare de Val de Fontenay à celle de Chelles-Gournay sur 8,5 km, dont 85 % en voies réservées, avec 17 stations le long de l’ex-RN34 et de la Marne. Elle rejoint les RER A et E, la ligne P et les futures lignes 15 et 16.',
    mode: 'bus',
    // 274 M€ HT (juin 2023), dont 37 M€ de bus.
    cout: 274,
    voyageurs: 33000,
    duree: 4,
    trace: 'idf-bus-bords-de-marne',
    parcours: [
      [
        { nom: 'Val de Fontenay', pos: [2.48888, 48.85421] },
        { nom: 'Avron', pos: [2.49955, 48.8499] },
        { nom: 'Neuilly-Plaisance RER', pos: [2.51367, 48.85282] },
        { nom: 'Aristide Briand', pos: [2.52, 48.8543] },
        { nom: 'Foch De Gaulle', pos: [2.52668, 48.85557] },
        { nom: 'Place de la Résistance', pos: [2.53116, 48.85681] },
        { nom: 'Verdun', pos: [2.536, 48.859] },
        { nom: 'Blancheville Ville-Évrard', pos: [2.54543, 48.86241] },
        { nom: 'Maison Blanche', pos: [2.54892, 48.86381] },
        { nom: 'Pointe de Gournay', pos: [2.56382, 48.86581] },
        { nom: 'Rue du Port', pos: [2.57296, 48.86749] },
        { nom: 'Foch', pos: [2.57722, 48.87133] },
        { nom: 'Chelles-Gournay', pos: [2.58479, 48.87444] },
      ],
    ],
    statut: 'Déclaré d’utilité publique en août 2025 ; les études d’avant-projet sont en cours, pour une mise en service fin 2030.',
    precisions: [
      'Le coût de 274 M€ hors taxes, aux conditions de juin 2023, comprend 37 M€ de bus et un centre opérationnel de 29,6 M€.',
      'Les 33 000 voyageurs par jour sont attendus en 2032 ; en 2030, avec un terminus provisoire à Fontenay-sous-Bois, le dossier en prévoit 29 000.',
      'Les noms des stations sont provisoires ; notre tracé passe par treize des dix-sept.',
    ],
    sources: [
      {
        titre: "Île-de-France Mobilités, dossier d'enquête d'utilité publique 2024, pièce H, appréciation sommaire des dépenses",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/Z3gJXpbqstJ99Bpf_H_Appreciation_sommaire_des_depenses.pdf',
        pages: 'p. 4',
      },
      {
        titre: "Île-de-France Mobilités, dossier d'enquête d'utilité publique 2024, pièce G, évaluation socio-économique",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/Z3gJPpbqstJ99Bpc_G_Evaluation_socio_economique.pdf',
        pages: 'p. 16',
      },
      {
        titre:
          "Île-de-France Mobilités, dossier d'enquête d'utilité publique 2024, pièce B, notice explicative (carte, caractéristiques, calendrier)",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/Z3gGG5bqstJ99BnH_B_Notice_explicative.pdf',
        pages: 'p. 6 et 7, p. 92 (calendrier)',
      },
      {
        titre: 'Île-de-France Mobilités, page Bus Bords de Marne (DUP 2025, mise en service 2030)',
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/bus-bordsdemarne',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
  {
    id: 'idf-bus-eve',
    nom: 'Bus EVE, d’Esbly au Val d’Europe',
    genre: 'Bus à haut niveau de service',
    description:
      'Cette nouvelle ligne de bus roule sur 8,4 km de voies réservées entre la gare d’Esbly et le Grand Hôpital de l’Est francilien, à Jossigny, avec 12 stations. Elle passe par les gares de Marne-la-Vallée Chessy et du Val d’Europe et dessert les nouveaux quartiers de Coupvray, Chessy, Magny-le-Hongre et Serris.',
    mode: 'bus',
    // 124 M€ HT (janvier 2020) et 6,7 M€ de bus.
    cout: 131,
    voyageurs: 11600,
    duree: 6,
    trace: 'idf-bus-eve',
    parcours: [
      [
        { nom: "Gare d'Esbly", pos: [2.81163, 48.90359] },
        { nom: 'Collège Louis Braille', pos: [2.80497, 48.89677] },
        { nom: 'Cent Arpents', pos: [2.8035, 48.8858] },
        { nom: 'Trois Ormes', pos: [2.803, 48.88] },
        { nom: 'Hôtels du Val de France', pos: [2.80558, 48.87707] },
        { nom: 'René Goscinny', pos: [2.7876, 48.87191] },
        { nom: 'Marne-la-Vallée Chessy', pos: [2.78264, 48.87029] },
        { nom: 'Ariane', pos: [2.776, 48.8595] },
        { nom: "Val d'Europe", pos: [2.77343, 48.85513] },
        { nom: 'Grand Hôpital de Marne-la-Vallée', pos: [2.77217, 48.84847] },
      ],
    ],
    statut:
      'À l’étude : une nouvelle concertation se tient du 14 septembre au 15 octobre 2026, avant une enquête publique au second semestre 2027.',
    precisions: [
      'Le coût comprend 124 M€ hors taxes, aux conditions de janvier 2020, pour la ligne et sa part du centre opérationnel, et 6,7 M€ de bus.',
      'Les 11 600 voyageurs par jour sont attendus en 2032.',
      'Les noms des stations sont provisoires ; notre tracé passe par dix des douze.',
    ],
    sources: [
      {
        titre: 'Île-de-France Mobilités, dossier de concertation du Bus EVE, 2026',
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/7G0NK_1MCJI8g0o4_IDFM-BusEVE-Dossierdeconcertation.pdf',
        pages: 'p. 176 (calendrier), p. 178 (coût), p. 187 (fréquentation)',
      },
      {
        titre:
          "Île-de-France Mobilités, communiqué du 7 juillet 2026 sur le conseil d'administration du 2 juillet 2026 (métro 1, T10, T7, Bus EVE)",
        url: 'https://presse.iledefrance-mobilites.fr/ile-de-france-mobilites-poursuit-lagrandissement-du-reseau-francilien/',
      },
      {
        titre: "Île-de-France Mobilités, lettre d'information n° 2 du Bus EVE, septembre 2026 (tracé et stations)",
        url: 'https://portail-idfm-projets.cdn.prismic.io/portail-idfm-projets/B5i4TMNqWzg0poxP_SE26000542_IDFM_EVE_Depliant_3volets_A4_web.pdf',
        pages: 'p. 3 et 4',
      },
      {
        titre: "Île-de-France Mobilités, page Bus EVE, Esbly Val d'Europe",
        url: 'https://www.iledefrance-mobilites.fr/le-reseau/projets/bus-eve',
        pages: 'page web consultée le 25 septembre 2026',
      },
      {
        titre:
          'Région Île-de-France, délibération CR 2024-038, avenant mobilités 2023-2027 du contrat de plan État-Région (liste des projets inscrits)',
        url: 'https://www.iledefrance.fr/actes/deliberations/CR2024-038DEL.pdf',
        pages: "p. 14 du PDF (page 10 de l'avenant)",
      },
    ],
  },
]

export const idf: Catalogue = {
  projets,
  tutoriel: {
    projet: 'idf-t8-sud',
    consigne: 'Touchez le tram T8 prolongé jusqu’à Paris, en noir sur la carte.',
    detail:
      'Chaque pointillé est un projet réel, avec son prix écrit dessus. Le T8 relierait Saint-Denis à la gare Rosa Parks, à Paris, pour 272 M€.',
  },
}
