import type { Catalogue, Projet } from '../types'

/**
 * Les projets sur la table dans la métropole Aix-Marseille-Provence, rassemblés le 25 septembre 2026 dans les
 * délibérations de la Métropole, ses dossiers de projet et la presse locale. Chaque projet cite ses sources ;
 * quand un chiffre manque, nous l’estimons comme pour les lignes du joueur (scripts/estimer-projets.ts) et le
 * disons dans ses précisions.
 */
const projets: Projet[] = [
  {
    id: 'amp-t3-nord-bricarde',
    nom: 'Tramway T3 jusqu’à La Bricarde',
    genre: 'Prolongement de tramway',
    description:
      'Le tramway T3 est prolongé de Gèze à La Bricarde sur 7,7 km, par la rue de Lyon, le chemin du Littoral et l’avenue André Roussin. Ses douze nouvelles stations desservent les 15e et 16e arrondissements, la mairie de secteur, la future halte TER de Saint-André et les cités de La Castellane et de La Bricarde.',
    mode: 'tram',
    cout: 453,
    voyageurs: 45000,
    duree: 4,
    trace: 'amp-t3-nord-bricarde',
    prolonge: 'tram-T3',
    parcours: [
      [
        { nom: 'Gèze', pos: [5.3663, 43.327] },
        { nom: 'Billoux Mairie 15/16', pos: [5.3644, 43.3325] },
        { nom: 'La Cabucelle', pos: [5.3586, 43.3329] },
        { nom: 'Abattoirs', pos: [5.3575, 43.3388] },
        { nom: 'Campagne-Lévêque', pos: [5.3527, 43.3424] },
        { nom: 'Lycée Saint-Exupéry', pos: [5.3553, 43.3471] },
        { nom: 'Consolat Mirabeau', pos: [5.3514, 43.3511] },
        { nom: 'Mirabeau Mourepiane', pos: [5.3458, 43.3486] },
        { nom: 'Littoral Grawitz', pos: [5.3379, 43.3527] },
        { nom: 'Roussin Condorcet', pos: [5.3378, 43.3569] },
        { nom: 'Gare de Saint-André', pos: [5.3388, 43.3609] },
        { nom: 'La Castellane', pos: [5.3434, 43.3664] },
        { nom: 'La Bricarde', pos: [5.3462, 43.369] },
      ],
    ],
    statut: 'La Métropole a approuvé le projet le 24 juin 2026 ; l’enquête publique doit s’ouvrir à l’automne 2026.',
    precisions: [
      'Le coût de 453 M€ hors taxes, publié en mai 2025, valait pour un terminus à La Castellane : les 700 m de plus jusqu’à La Bricarde, votés en juin 2026, n’ont pas encore de coût publié.',
      'Les 45 000 voyageurs par jour sont ceux annoncés en mai 2025 pour le tracé jusqu’à La Castellane.',
      'Les travaux iraient de 2027 à 2030, pour une mise en service désormais attendue vers 2031.',
    ],
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, délibération MOB-004-19495/26/CM du 24 juin 2026 : terminus déplacé à La Bricarde, 7,7 km et 12 stations, projet soumis à enquête publique',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2026/06/24/DECISION/164963.pdf',
        pages: 'p. 3 à 5',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, plan du tracé Gèze La Bricarde annexé à la délibération du 24 juin 2026 (noms et ordre des stations)',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2026/06/24/ANNEXE/164936_164939_164936_Annexe_Trace%20Extension%20Nord%20Geze-Bricarde.pdf',
        pages: 'p. 1',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, dossier Marseille en Grand « La Métropole accélère la révolution des transports », mai 2025 : 453 M€ HT, 45 000 montées par jour, calendrier',
        url: 'https://www.debatpublic.fr/sites/default/files/2025-06/MEG-Dossier-Mai2025.pdf',
        pages: 'p. 14 à 16',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, dossier de presse mobilité, juillet 2025 : montant prévisionnel de 453 M€',
        url: 'https://ampmetropole.fr/wp-content/uploads/2025/07/DP_Projets-Mobilite_VF.pdf',
        pages: 'p. 9',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, bilan de la concertation préalable des extensions nord et sud phase 2, juin 2023 : 345 M€ HT de travaux',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2023/06/29/ANNEXE/58736_TNS2_Bilan%20Concertation.pdf',
        pages: 'p. 47',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, dépliant de concertation de la phase 2, décembre 2022 : 30 000 montées par jour au nord, 6 000 au sud',
        url: 'https://ampmetropole.fr/wp-content/uploads/2022/12/Phase2_Flyer-TWNS2-Concertation-Publique_WEB_Pages.pdf',
        pages: 'p. 2',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, page du projet : enquête publique 2026 à 2027, travaux 2027 à 2030',
        url: 'https://ampmetropole.fr/grands-projets/extension-tramway-nord-2eme-phase-de-geze-a-la-bricarde/',
      },
      {
        titre: 'Made in Marseille, 24 juin 2026 : mise en service désormais estimée vers 2031',
        url: 'https://madeinmarseille.net/actualite/206379-le-tramway-des-quartiers-nord-ira-finalement-plus-loin-que-la-castellane-jusqua-la-bricarde/',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, délibération MOB-001-17304/25/BM du 27 février 2025 : la phase 2 ne porte plus que sur le nord, 7,1 km',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2025/02/27/DECISION/115536.pdf',
        pages: 'p. 2',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, Plan de mobilité 2020-2030, note financière : 256 M€ pour la phase 2',
        url: 'https://ampmetropole.fr/wp-content/uploads/2022/08/8_Plan_de_Mobilite%CC%81_Annexe_5_note_financiere.pdf',
        pages: 'p. 5 du PDF',
      },
    ],
  },
  {
    id: 'amp-t2-quatre-septembre',
    nom: 'Tramway du 4-Septembre',
    genre: 'Nouvelle branche de tramway',
    description:
      'Une branche du tramway part de la rue de Rome et rejoint la place du 4-Septembre sur 2,1 km, par le boulevard Paul Peytral, le cours Pierre Puget et le boulevard de la Corderie. Ses quatre stations desservent les 6e et 7e arrondissements, avec une correspondance avec le métro à Estrangin.',
    mode: 'tram',
    cout: 76,
    voyageurs: 22700,
    duree: 3,
    trace: 'amp-t2-quatre-septembre',
    parcours: [
      [
        { nom: 'Place de Rome', pos: [5.3807, 43.2913] },
        { nom: 'Estrangin', pos: [5.3778, 43.2902] },
        { nom: 'Corderie', pos: [5.3716, 43.2905] },
        { nom: 'Saint-Victor', pos: [5.3655, 43.2897] },
        { nom: 'Quatre Septembre', pos: [5.3593, 43.2887] },
      ],
    ],
    statut:
      'L’enquête publique s’est close en juin 2026 avec un avis favorable, et les premiers travaux de réseaux ont commencé en août 2026.',
    precisions: [
      'Le coût de 76 M€ hors taxes vient du dossier de mai 2025 et de l’étude d’impact de 2026 ; la brochure de 2023 disait 75 M€.',
      'Les 22 700 voyageurs par jour sont une prévision pour 2030, publiée en 2023.',
      'La Métropole annonce le début des travaux principaux en avril 2027 et la mise en service à l’été 2030.',
    ],
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, dossier Marseille en Grand, mai 2025 : tracé, quatre stations, 76 M€ HT, 2 à 3 ans de travaux',
        url: 'https://www.debatpublic.fr/sites/default/files/2025-06/MEG-Dossier-Mai2025.pdf',
        pages: 'p. 20 à 23',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, brochure de concertation, mars 2023 : 22 700 montées par jour en 2030, 75 M€, noms des stations',
        url: 'https://www.marseillechange.fr/wp-content/uploads/2023/03/TQS_BROCHURE_3_VOLETS_PLIS_ROULES_630x297_V11_WEB_LIGHT.pdf',
        pages: 'p. 2 et 4',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, dossier de presse mobilité, juillet 2025 : 75 M€ HT',
        url: 'https://ampmetropole.fr/wp-content/uploads/2025/07/DP_Projets-Mobilite_VF.pdf',
        pages: 'p. 12',
      },
      {
        titre:
          'TPBM, 13 mars 2026, avis de l’autorité environnementale : 76 M€ HT dont 57 M€ de travaux, environ 22 700 voyageurs par jour en 2030, quatre stations',
        url: 'https://mesinfos.fr/13000-marseille/la-mrae-globalement-favorable-a-l-extension-du-tramway-vers-la-place-du-4-septembre-a-marseille-241920.html',
      },
      {
        titre: 'Made in Marseille, 23 juillet 2026 : enquête publique du 4 mai au 10 juin 2026, avis favorable, accord de la Ville',
        url: 'https://madeinmarseille.net/actualite/207676-ville-marseille-feu-vert-realisation-tramway-catalans/',
      },
      {
        titre:
          'TPBM, 15 septembre 2026 : avis favorable du 8 juillet 2026, marché de déviation de réseaux du 17 août 2026, mise en service à l’été 2030',
        url: 'https://mesinfos.fr/13000-marseille/marseille-sade-en-action-sur-les-reseaux-du-futur-tramway-des-catalans-338688.html',
      },
      {
        titre: 'Made in Marseille, 10 septembre 2026 : début des travaux en avril 2027, mise en service à l’été 2030',
        url: 'https://madeinmarseille.net/a-la-une-marseille/210288-travaux-futur-tramway-catalans-debut-printemps/',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, Plan de mobilité 2020-2030, note financière : 83,1 M€',
        url: 'https://ampmetropole.fr/wp-content/uploads/2022/08/8_Plan_de_Mobilite%CC%81_Annexe_5_note_financiere.pdf',
        pages: 'p. 5 du PDF',
      },
    ],
  },
  {
    id: 'amp-tram-belle-de-mai',
    nom: 'Tramway de la Belle de Mai',
    genre: 'Nouvelle ligne de tramway',
    description:
      'Un tramway part de la gare d’Arenc et suit le boulevard National puis la rue Loubon, à travers la Belle de Mai, jusqu’à la place Burel. Une seconde branche descend le boulevard National jusqu’à la gare Saint-Charles et au boulevard Longchamp. Au total, 3,5 km et dix stations.',
    mode: 'tram',
    cout: 176,
    voyageurs: 40000,
    duree: 3,
    trace: 'amp-tram-belle-de-mai',
    parcours: [
      [
        { nom: 'Arenc', pos: [5.3688, 43.3139] },
        { nom: 'National', pos: [5.3733, 43.315] },
        { nom: 'National-Junot', pos: [5.3767, 43.3116] },
        { pos: [5.3787, 43.3106] },
        { nom: 'Belle Vue', pos: [5.3796, 43.3122] },
        { nom: 'Place Caffo', pos: [5.3848, 43.3128] },
        { nom: 'Place Burel', pos: [5.3893, 43.3148] },
      ],
      [
        { pos: [5.3787, 43.3106] },
        { nom: 'National-Strasbourg', pos: [5.3797, 43.3097] },
        { nom: 'National-Belle de Mai', pos: [5.3815, 43.308] },
        { nom: 'Saint-Charles-Guibal', pos: [5.3843, 43.3053] },
        { nom: 'Saint-Charles-Voltaire', pos: [5.3852, 43.3031] },
        { nom: 'Longchamp National', pos: [5.3886, 43.3015] },
      ],
    ],
    statut: 'La Métropole a approuvé le programme en décembre 2024 et l’étudie ; il n’y a encore eu ni concertation ni enquête publique.',
    precisions: [
      'Le coût de 176 M€ hors taxes, foncier compris, date de mai 2025 et couvre les deux branches.',
      'Le programme compte de l’ordre de 20 000 voyageurs par jour sur chaque branche : nous en retenons 40 000. Il annonce aussi 60 000 voyages de plus par jour sur tout le réseau de tramway, dont la moitié pris au métro.',
      'Les trois ans de chantier sont ceux de la branche de la place Burel, de 2028 à 2030. Celle de Saint-Charles dépend du chantier de la gare souterraine et n’ouvrirait qu’en 2032 ou 2033.',
    ],
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, programme de l’opération Extension National, Arenc, Belle de Mai, annexé à la délibération du 5 décembre 2024 : tracé, 3,47 km, 10 stations, phasage, fréquentation, 130 M€ HT valeur septembre 2022',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2024/12/05/ANNEXE/110783_PJ_Belle%20de%20mai_VDEF.pdf',
        pages: 'p. 29, 30, 37, 38, 50 et 68',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, dossier Marseille en Grand, mai 2025 : 176 M€ HT foncier inclus, travaux et mise en service de 2028 à 2030',
        url: 'https://www.debatpublic.fr/sites/default/files/2025-06/MEG-Dossier-Mai2025.pdf',
        pages: 'p. 24 à 26',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, dossier de presse mobilité, juillet 2025 : montant prévisionnel de 176 M€ HT',
        url: 'https://ampmetropole.fr/wp-content/uploads/2025/07/DP_Projets-Mobilite_VF.pdf',
        pages: 'p. 13',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, rapport d’orientation budgétaire 2026 : projet du tramway National poursuivi de 2026 à 2028',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2026/04/16/ANNEXE/160507_165637_160507%20Annexe%20ROB%202026%20vDEF%20v2.pdf',
        pages: 'p. 112',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, communiqué du 22 novembre 2023 : prolongement de 5 km de la place Burel à Saint-Jérôme mis à l’étude',
        url: 'https://ampmetropole.fr/wp-content/uploads/2023/11/Copil-tramway-Belle-de-mai.pdf',
        pages: 'p. 1',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, Plan de mobilité 2020-2030, note financière : 152 M€',
        url: 'https://ampmetropole.fr/wp-content/uploads/2022/08/8_Plan_de_Mobilite%CC%81_Annexe_5_note_financiere.pdf',
        pages: 'p. 5 du PDF',
      },
    ],
  },
  {
    id: 'amp-m2-saint-loup',
    nom: 'Métro 2 jusqu’à Saint-Loup',
    genre: 'Prolongement de métro',
    description:
      'La ligne 2 du métro est prolongée de Sainte-Marguerite Dromel vers l’est sur environ 5 km, en franchissant l’Huveaune puis en tunnel. Six nouvelles stations desservent La Pauline, Saint-Tronc et Saint-Loup, avec un parc relais d’environ 1 000 places au terminus.',
    mode: 'metro',
    cout: 800,
    voyageurs: 63600,
    duree: 8,
    trace: 'amp-m2-saint-loup',
    prolonge: 'metro-M2',
    parcours: [
      [
        { nom: 'Sainte-Marguerite Dromel', pos: [5.4022, 43.2707] },
        { nom: 'La Pauline', pos: [5.4104, 43.2734] },
        { nom: 'Maison Blanche', pos: [5.4151, 43.2681] },
        { nom: 'Saint-Tronc Perrin', pos: [5.4245, 43.2728] },
        { nom: 'Saint-Loup Village', pos: [5.4304, 43.2825] },
        { nom: 'Saint-Loup Pagnol', pos: [5.435, 43.2829] },
        { nom: 'Rivoire et Carret', pos: [5.4432, 43.2871] },
      ],
    ],
    statut: 'À l’étude depuis 2016, en sommeil depuis 2020, quand la Commission nationale du débat public a jugé le dossier incomplet.',
    precisions: [
      'Le coût de 800 M€ hors taxes date de 2019 et n’a jamais été actualisé.',
      'Aucune fréquentation ni durée de chantier n’a été publiée : nous les estimons comme pour les lignes que vous tracez.',
      'L’emplacement des stations n’a jamais été publié : nous les plaçons sur les lieux qui leur donnent leur nom, à quelques centaines de mètres près.',
    ],
    estime: { voyageurs: true, duree: true },
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, rapport au Conseil du 20 juin 2019 autorisant la saisine de la CNDP : 5 km, six stations, parc relais de 1 000 places, 800 M€ HT',
        url: 'https://deliberations.ampmetropole.fr/documents/ct1/deliberations/2019/06/18/RAPPORTDELACOMMISSION/C0D3N.pdf',
        pages: 'p. 1, 2 et 4',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, délibération du 15 décembre 2016 créant l’opération d’études : 4 400 ou 4 700 m, noms des stations',
        url: 'https://deliberations.ampmetropole.fr/documents/ct1/deliberations/2016/12/14/DELIBERATION/D0BLL.pdf',
        pages: 'p. 2',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, Plan de mobilité 2020-2030, note financière : Métro Est, 806 M€',
        url: 'https://ampmetropole.fr/wp-content/uploads/2022/08/8_Plan_de_Mobilite%CC%81_Annexe_5_note_financiere.pdf',
        pages: 'p. 5 du PDF',
      },
      {
        titre: 'Commission nationale du débat public, décision du 5 février 2020 déclarant la saisine incomplète (Journal officiel)',
        url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000041580006',
      },
      {
        titre:
          'Made in Marseille, octobre 2023 : la présidente de la Métropole affirme que le métro vers Saint-Loup n’est pas abandonné, faute de financement',
        url: 'https://madeinmarseille.net/urbanisme-marseille/145315-selon-martine-vassal-le-metro-vers-saint-loup-nest-pas-abandonne/',
      },
      {
        titre: 'Car & Bus News, 22 mars 2024 : point d’étape de la Métropole, prolongement de la ligne 2 jusqu’à la ZAC Vallon Régny',
        url: 'https://caretbusnews.fr/les-infos/reseau/metropole-aix-marseille-point-detape-sur-la-mobilite/',
      },
    ],
  },
  {
    id: 'amp-cable-aeroport',
    nom: 'Téléphérique de l’aéroport Marseille Provence',
    genre: 'Transport par câble',
    description:
      'Un téléphérique d’un kilomètre relie la gare de Vitrolles Aéroport Marseille Provence au terminal 1 de l’aéroport, avec une station chez Airbus Helicopters. Le trajet prend six minutes, pour 1 200 personnes par heure au plus.',
    mode: 'cable',
    cout: 43,
    voyageurs: 3600,
    duree: 3,
    trace: 'amp-cable-aeroport',
    parcours: [
      [
        { nom: 'Gare de Vitrolles Aéroport Marseille Provence', pos: [5.2371, 43.4412] },
        { nom: 'Airbus Helicopters', pos: [5.2305, 43.4402] },
        { nom: 'Aéroport Marseille Provence, terminal 1', pos: [5.223, 43.4407] },
      ],
    ],
    statut: 'À l’étude : la Métropole a lancé la concertation préalable en juin 2026.',
    precisions: [
      'Le coût de 43 M€ hors taxes date de 2025.',
      'Les 3 600 voyageurs par jour sont un potentiel calculé avant 2023, jamais mis à jour.',
      'Les trois ans mènent à la mise en service en 2029 annoncée en 2025, qui paraît difficile à tenir.',
      'L’emplacement de la station Airbus Helicopters n’est pas publié : nous la plaçons entre la gare et le terminal.',
    ],
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, délibération MOB-001-19492/26/CM du 24 juin 2026 lançant la concertation préalable : trois stations, 1 km, 43 M€',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2026/06/24/DECISION/166535.pdf',
        pages: 'p. 3',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, délibération MOB-013-13246/23/CM du 19 janvier 2023 : potentiel d’environ 3 600 usagers par jour, 31 M€ valeur 2019',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2023/01/19/DECISION/39449.pdf',
        pages: 'p. 3 et 4',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, communiqué du 10 février 2025 : 43 M€ HT, plan de financement, 1 200 personnes par heure, mise en service en 2029',
        url: 'https://ampmetropole.fr/mobilite-transports/un-telepherique-reliera-laeroport-marseille-provence-a-la-gare-de-vitrolles-dici-2029/',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, dossier Marseille en Grand, mai 2025 : projet additionnel, 43 M€ HT, trajet de 6 minutes',
        url: 'https://www.debatpublic.fr/sites/default/files/2025-06/MEG-Dossier-Mai2025.pdf',
        pages: 'p. 47',
      },
    ],
  },
  {
    id: 'amp-aixpress-val-saint-andre',
    nom: 'Aixpress jusqu’au Val Saint-André',
    genre: 'Prolongement de bus à haut niveau de service',
    description:
      'La ligne de bus rapide Aixpress est prolongée de 2,1 km depuis la station Fenouillères, le long de la rocade sud d’Aix-en-Provence, jusqu’au parc relais Malacrida et au quartier du Val Saint-André. Quatre stations sont créées.',
    mode: 'bus',
    cout: 25,
    voyageurs: 5100,
    duree: 2,
    trace: 'amp-aixpress-val-saint-andre',
    parcours: [
      [
        { nom: 'Fenouillères', pos: [5.4484, 43.5135] },
        { nom: 'Bel Ormeau', pos: [5.4584, 43.5137] },
        { nom: 'Saint-Benoît-Beausoleil', pos: [5.4625, 43.5142] },
        { nom: 'Malacrida', pos: [5.4685, 43.5153] },
        { nom: 'Magnan-Val Saint-André', pos: [5.4715, 43.5159] },
      ],
    ],
    statut: 'La Métropole a approuvé le programme en février 2024 et recrute sa maîtrise d’œuvre en 2026, pour des travaux fin 2027.',
    precisions: [
      'Le coût de 25,2 M€ hors taxes, en valeur 2022, ne comprend pas les bus électriques articulés prévus sur la ligne.',
      'Les 5 100 voyageurs par jour sont les voyageurs supplémentaires attendus sur la ligne.',
    ],
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, programme de l’extension du BHNS Aixpress jusqu’à Malacrida et au Val Saint-André, annexé à la délibération du 22 février 2024 : 2,1 km, coût, calendrier',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2024/02/22/ANNEXE/85326_2.1-85326-Programme%20AIXPRESS%20Malacrida%20fevrier2024.pdf',
        pages: 'p. 3, 7, 13, 21, 42 et 43',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, dossier Marseille en Grand, mai 2025 : 5 100 voyageurs supplémentaires par jour, 25,2 M€ HT, mise en service en 2028',
        url: 'https://www.debatpublic.fr/sites/default/files/2025-06/MEG-Dossier-Mai2025.pdf',
        pages: 'p. 38 et 39',
      },
      {
        titre:
          'TPBM, 25 mars 2026 : recrutement de la maîtrise d’œuvre, noms des quatre stations, travaux au second semestre 2027, mise en service fin 2028',
        url: 'https://mesinfos.fr/13080-aix-en-provence/aix-en-provence-la-metropole-recrute-les-maitres-d-oeuvre-de-l-extension-de-l-aixpress-243160.html',
      },
    ],
  },
  {
    id: 'amp-bhns-aix-duranne',
    nom: 'Bus rapide d’Aix jusqu’à la Duranne',
    genre: 'Bus à haut niveau de service',
    description:
      'Un bus à haut niveau de service relie la gare routière d’Aix-en-Provence au pôle d’activités des Milles puis au quartier de la Duranne, sur 18,4 km et 28 stations, avec un passage toutes les 6 à 10 minutes aux heures de pointe.',
    mode: 'bus',
    cout: 139,
    voyageurs: 11500,
    duree: 5,
    trace: 'amp-bhns-aix-duranne',
    parcours: [
      [
        { nom: 'Gare routière', pos: [5.4395, 43.5235] },
        { nom: 'Henri Mouret', pos: [5.4345, 43.52] },
        { nom: 'Ensoleillé', pos: [5.424, 43.5125] },
        { nom: 'Valcros', pos: [5.4097, 43.5105] },
        { nom: 'Centre commercial des Milles', pos: [5.3948, 43.5043] },
        { nom: 'Requier', pos: [5.3821, 43.5014] },
        { nom: 'Plan d’Aillane', pos: [5.3705, 43.4977] },
        { nom: 'Pôle d’Activités', pos: [5.3729, 43.4913] },
        { nom: 'Bessemer', pos: [5.382, 43.4844] },
        { nom: 'La Robole', pos: [5.3747, 43.478] },
        { nom: 'Pichaury', pos: [5.3673, 43.48] },
        { nom: 'Parc Club du Golf', pos: [5.3622, 43.4853] },
        { nom: 'Descartes', pos: [5.3475, 43.4955] },
        { nom: 'Archimède', pos: [5.3395, 43.4916] },
        { nom: 'Duranne École', pos: [5.3446, 43.4865] },
      ],
    ],
    statut: 'La Métropole a approuvé le programme en décembre 2025, pour une mise en service visée fin 2030.',
    precisions: [
      'Le programme ne donne aucune prévision de fréquentation : nous l’estimons comme pour les lignes que vous tracez.',
      'Le coût de 139 M€ hors taxes, en valeur 2025, ne comprend pas les bus.',
      'Le programme ne nomme pas toutes ses stations : notre tracé passe par quinze d’entre elles.',
    ],
    estime: { voyageurs: true },
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, délibération MOB-007-19154/25/CM du 15 décembre 2025 approuvant le programme : 18,4 km, 28 stations, 139 M€ HT, mise en service fin 2030',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2025/12/15/DECISION/147472.pdf',
        pages: 'p. 3 et 4',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, programme de l’opération annexé à cette délibération : tracé et noms des stations',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2025/12/15/ANNEXE/146676_153206_19-11-2025_Programme_vdef.pdf',
        pages: 'p. 20 à 23',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, Plan de mobilité 2020-2030, note financière : Gare routière, PAAP, La Duranne, 80 M€',
        url: 'https://ampmetropole.fr/wp-content/uploads/2022/08/8_Plan_de_Mobilite%CC%81_Annexe_5_note_financiere.pdf',
        pages: 'p. 5 du PDF',
      },
    ],
  },
  {
    id: 'amp-bhns-martigues-port-de-bouc',
    nom: 'Bus rapide Martigues, Port-de-Bouc',
    genre: 'Bus à haut niveau de service',
    description:
      'Un bus à haut niveau de service remplace la ligne 22, du nord de Martigues au quartier des Aigues Douces à Port-de-Bouc, sur 13,5 km et 27 stations. Il dessert les deux centres-villes, l’hôpital de Martigues et les gares de Croix-Sainte et de Port-de-Bouc.',
    mode: 'bus',
    cout: 17,
    voyageurs: 7700,
    duree: 2,
    trace: 'amp-bhns-martigues-port-de-bouc',
    parcours: [
      [
        { nom: 'Martigues Grand Parc', pos: [5.0484, 43.4336] },
        { nom: 'L’Escaillon', pos: [5.048, 43.4292] },
        { nom: 'Canto-Perdrix', pos: [5.0507, 43.4216] },
        { nom: 'Martigues, pôle d’échanges Danielle Casanova', pos: [5.0455, 43.4055] },
        { nom: 'Hôpital de Martigues', pos: [5.0406, 43.4134] },
        { nom: 'Gare de Croix-Sainte', pos: [5.0198, 43.4107] },
        { nom: 'Clément Mille', pos: [5.0005, 43.4116] },
        { nom: 'Paul Éluard', pos: [4.9937, 43.4114] },
        { nom: 'Gare de Port-de-Bouc', pos: [4.9845, 43.4066] },
        { nom: 'République', pos: [4.9817, 43.4019] },
        { nom: 'Aigues Douces', pos: [4.9757, 43.4024] },
      ],
    ],
    statut: 'À l’étude : le tracé est validé dans Martigues et discuté avec Port-de-Bouc.',
    precisions: [
      'La Métropole annonce 7 700 voyageurs, le double de la ligne 22 actuelle, sans dire sur quelle durée : nous les comptons par jour.',
      'Le coût de 17 M€ ne comprend ni les bus supplémentaires ni l’accès à la halte de Croix-Sainte.',
      'Les stations ne sont pas encore nommées : notre tracé passe par les arrêts actuels de la ligne 22.',
    ],
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, dossier Marseille en Grand, mai 2025 : 13,5 km, 27 stations, 7 700 voyageurs, 17 M€, calendrier et tracé prévisionnel',
        url: 'https://www.debatpublic.fr/sites/default/files/2025-06/MEG-Dossier-Mai2025.pdf',
        pages: 'p. 36 et 37',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, dossier de presse mobilité, juillet 2025 : 17 M€, études en cours, mise en service en 2027',
        url: 'https://ampmetropole.fr/wp-content/uploads/2025/07/DP_Projets-Mobilite_VF.pdf',
        pages: 'p. 19',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, page du projet Bus+ entre Martigues et Port-de-Bouc',
        url: 'https://ampmetropole.fr/missions/mobilite/une-mobilite-de-projets-davenir/projet-mobilite-bhns-martigues-et-port-de-bouc/',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, Plan de mobilité 2020-2030, note financière : 19 M€',
        url: 'https://ampmetropole.fr/wp-content/uploads/2022/08/8_Plan_de_Mobilite%CC%81_Annexe_5_note_financiere.pdf',
        pages: 'p. 5 du PDF',
      },
    ],
  },
  {
    id: 'amp-bhns-istres',
    nom: 'Bus rapide d’Istres',
    genre: 'Bus à haut niveau de service',
    description:
      'Un bus à haut niveau de service traverse Istres sur 10 km, de la zone du Tubé, près de la base aérienne, aux quartiers sud, par le futur quartier du Grand Bayanne, la gare et le centre-ville. Il dessert 19 stations.',
    mode: 'bus',
    cout: 16,
    voyageurs: 6400,
    duree: 4,
    trace: 'amp-bhns-istres',
    parcours: [
      [
        { nom: 'Charles Monier', pos: [4.9564, 43.5175] },
        { nom: 'Ader Sud', pos: [4.9609, 43.5219] },
        { nom: 'Ader Nord', pos: [4.9596, 43.5266] },
        { nom: 'Grand Bayanne 1', pos: [4.9639, 43.5295] },
        { nom: 'Grand Bayanne 2', pos: [4.9725, 43.5291] },
        { nom: 'Les Bellons', pos: [4.9767, 43.527] },
        { nom: 'Les Cyprès', pos: [4.9795, 43.5221] },
        { nom: 'La Gare', pos: [4.9811, 43.5152] },
        { nom: 'Les Carmes', pos: [4.9853, 43.5128] },
        { nom: 'Félix Gouin', pos: [4.9815, 43.5107] },
        { nom: 'Centre commercial des Cognets', pos: [4.9796, 43.4986] },
        { nom: 'Prédina', pos: [4.9875, 43.4935] },
        { nom: 'Quatre Vents Méditerranée', pos: [4.9919, 43.495] },
        { nom: 'CEC', pos: [4.9924, 43.5003] },
        { nom: 'La Salle', pos: [4.991, 43.5045] },
      ],
    ],
    statut: 'La Métropole a approuvé le programme en décembre 2024, pour une mise en service visée fin 2028.',
    precisions: [
      'Le programme ne donne aucune prévision de fréquentation : nous l’estimons comme pour les lignes que vous tracez.',
      'Le coût de 15,5 M€ hors taxes ne comprend pas les bus.',
      'Le programme dit ses stations indicatives : notre tracé passe par les arrêts actuels du même nom.',
    ],
    estime: { voyageurs: true },
    sources: [
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, délibération MOB-006-17201/24/CM du 5 décembre 2024 approuvant le programme modifié : 10 km, 19 stations, 15,5 M€ HT, mise en service fin 2028',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2024/12/05/DECISION/110806.pdf',
        pages: 'p. 3 et 4',
      },
      {
        titre:
          'Métropole d’Aix-Marseille-Provence, programme modifié du BHNS d’Istres, octobre 2024, annexé à cette délibération : plan et noms des stations',
        url: 'https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2024/12/05/ANNEXE/110805_110805_-BHNS%20Istres_programme-annexe.annot%20JC.pdf',
        pages: 'p. 13',
      },
      {
        titre: 'Métropole d’Aix-Marseille-Provence, Plan de mobilité 2020-2030, note financière : Istres, 6,4 M€',
        url: 'https://ampmetropole.fr/wp-content/uploads/2022/08/8_Plan_de_Mobilite%CC%81_Annexe_5_note_financiere.pdf',
        pages: 'p. 5 du PDF',
      },
    ],
  },
]

export const marseille: Catalogue = {
  projets,
  tutoriel: {
    projet: 'amp-t2-quatre-septembre',
    consigne: 'Touchez le tramway du 4-Septembre, en noir sur la carte.',
    detail:
      'Chaque pointillé est un projet réel, avec son prix écrit dessus. Cette branche du tram relierait la rue de Rome à la place du 4-Septembre pour 76 M€.',
  },
}
