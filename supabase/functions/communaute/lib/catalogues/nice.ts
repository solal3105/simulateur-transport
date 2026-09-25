// Copie de lib/catalogues/nice.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import type { Catalogue, Projet } from '../types.ts'

/**
 * Les projets sur la table dans la métropole Nice Côte d’Azur, rassemblés le 25 septembre 2026 dans les arrêtés de
 * la préfecture, les délibérations de la Métropole et la presse locale. Chaque projet cite ses sources.
 */
const projets: Projet[] = [
  {
    id: 'nca-tram-ligne-5',
    nom: 'Ligne 5 du tramway',
    genre: 'Nouvelle ligne de tramway',
    description:
      'La ligne relie le Palais des Expositions, à Nice, futur Palais des Arts et de la Culture, au centre de Drap en longeant le Paillon par Bon Voyage, l’Ariane et La Trinité : quinze stations sur 7,5 km, en correspondance avec la ligne 1 à Pont-Michel et au Palais des Expositions, et quatre parkings relais.',
    mode: 'tram',
    cout: 376,
    voyageurs: 45900,
    duree: 5,
    feminin: true,
    trace: 'nca-tram-ligne-5',
    parcours: [
      [
        { nom: 'Palais des Arts et de la Culture', pos: [7.28345, 43.70845] },
        { nom: 'Vauban / La Passerelle', pos: [7.28411, 43.71207] },
        { nom: 'Lycée Guillaume-Apollinaire', pos: [7.28254, 43.7159] },
        { nom: 'Le 109', pos: [7.28565, 43.7193] },
        { nom: 'Pont-Michel', pos: [7.28955, 43.72195] },
        { nom: 'Bon Voyage', pos: [7.28659, 43.72617] },
        { pos: [7.2839, 43.7288] },
        { nom: 'Ponts Garigliano', pos: [7.28479, 43.73053] },
        { nom: 'Val de Banquière / Hôpital Sainte-Marie', pos: [7.28614, 43.73218] },
        { nom: 'Ariane / Chênes Blancs', pos: [7.2966, 43.73454] },
        { nom: 'Ariane / Liberté', pos: [7.30035, 43.73505] },
        { nom: 'Ariane / Place des Sitelles', pos: [7.30731, 43.738] },
        { nom: 'Pont Anatole-France', pos: [7.31025, 43.74113] },
        { nom: 'La Trinité / Hôtel de Ville', pos: [7.31131, 43.74279] },
        { nom: 'Les Chênes Verts', pos: [7.31812, 43.75001] },
        { nom: 'Drap / Hôtel de Ville', pos: [7.32006, 43.75557] },
      ],
    ],
    statut: 'Déclarée d’utilité publique le 27 juillet 2026 ; les travaux doivent commencer fin 2026.',
    precisions: [
      'Le coût de 376 M€ hors taxes, en valeur mai 2023, comprend les études, le foncier, les travaux, dix rames, les parkings relais et le centre de maintenance.',
      'Les 45 900 voyageurs par jour sont attendus en 2031.',
      'La Métropole ouvrirait la ligne par étapes : de Pont-Michel à l’Ariane en 2028, jusqu’à La Trinité et au Palais des Expositions en 2030, jusqu’à Drap en 2031.',
    ],
    sources: [
      {
        titre: "Préfecture des Alpes-Maritimes, arrêté du 27 juillet 2026 déclarant d'utilité publique la ligne 5 du tramway (statut)",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/60244/459448/file/Arr%C3%AAt%C3%A9%20pr%C3%A9fectoral.pdf',
        pages: 'p. 4 à 6',
      },
      {
        titre:
          "Préfecture des Alpes-Maritimes, annexe 3 de l'arrêté DUP, exposé des motifs : 45 000 voyageurs par jour dont 4 600 venus de la voiture, coût global de 376 M€ valeur mai 2023, VAN-SE de 38,2 M€",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/60248/459468/file/Annexe%203%20EMC.pdf',
        pages: 'p. 5 et 6',
      },
      {
        titre:
          "Métropole Nice Côte d'Azur, délibération n° 9.1 du conseil métropolitain du 8 juin 2026, déclaration de projet (coût prévisionnel de 376 M€ HT valeur mai 2023), portail des délibérations, séance du 08 juin 2026, délibération 09.01",
        url: 'https://webdelib.nicecotedazur.org/WebDelib/',
        pages: 'p. 4',
      },
      {
        titre:
          "Métropole Nice Côte d'Azur, délibération n° 0.2 du 10 juillet 2024 approuvant le projet de référence (376 M€ HT valeur mai 2023 et périmètre du coût)",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/57371/440077/file/D%C3%A9lib%C3%A9ration%20MNCA%2010%2007%2024%20approbation%20projet.pdf',
        pages: 'p. 6',
      },
      {
        titre:
          "Mission régionale d'autorité environnementale PACA, avis du 26 septembre 2025 : 45 900 voyageurs attendus par jour en 2031, mise en service complète en 2031",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/57438/440430/file/Avis%20MRAe%2026%2009%2025.pdf',
        pages: 'p. 7 et 11',
      },
      {
        titre:
          "Commission d'enquête publique, rapport du 20 janvier 2026 : coût détaillé de 375,9 M€ HT aux conditions de 2023, travaux phasés de 2026 à fin 2031, premier tronçon Pont-Michel à Ariane en 2028",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/58721/448864/file/Rapport%20enqu%C3%AAte%20partie%20n%C2%B01.pdf',
        pages: 'p. 33, 34 et 39 sur 109',
      },
      {
        titre:
          "Commission d'enquête publique, conclusions motivées sur la DUP (montants approximatifs : environ 375 M€, environ 50 000 passagers par jour, 328 M€ de 2022 cité dans les observations)",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/58723/448874/file/Conclusions%20DUP.pdf',
        pages: 'p. 11 et 18',
      },
      {
        titre:
          "Métropole Nice Côte d'Azur, site des projets de transport, page de la ligne 5 : 15 stations, 7,5 km, mises en service en 2028 (Pont-Michel, Ariane), 2030 (La Trinité, Palais des Arts) et 2031 (Drap)",
        url: 'https://projets-transports.nicecotedazur.org/ligne-5/le-projet-de-la-ligne-5-de-tramway-nice-la-trinite-drap/',
      },
      {
        titre:
          'ICI Azur, « La future ligne 5 du tramway de Nice sur de bons rails », 10 juin 2026 : début des travaux fin 2026, fin de chantier en 2031, prix estimé à 355 M€',
        url: 'https://www.ici.fr/emissions/l-info-d-ici-ici-azur/la-future-ligne-5-du-tramway-nicois-est-sur-de-bons-rails-7282444',
      },
      {
        titre:
          "Métropole Nice Côte d'Azur, délibération n° 21.05 du 22 juin 2026, mise à jour des autorisations de programme, budget annexe des transports (AP 4605 « Extension du réseau de tramway » de 500 M€, 65,3 M€ payés fin 2025), portail des délibérations, séance du 22 juin 2026",
        url: 'https://webdelib.nicecotedazur.org/WebDelib/',
        pages: 'annexe, p. 1',
      },
      {
        titre: "Préfecture des Alpes-Maritimes, annexe 1 de l'arrêté DUP, plan général des travaux : nom et position des 15 stations",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/60245/459453/file/Annexe%201%20PGT.pdf',
        pages: 'p. 2 à 7',
      },
      {
        titre: 'OpenStreetMap, tracé cartographié du projet de ligne 5 (voies 1190620208 et 1134641708), utilisé pour caler les stations',
        url: 'https://www.openstreetmap.org/way/1134641708',
      },
    ],
  },
  {
    id: 'nca-tram-ligne-4',
    nom: 'Ligne 4 du tramway',
    genre: 'Nouvelle ligne de tramway',
    description:
      'La ligne part du pôle d’échanges du Grand Arénas, près de l’aéroport, franchit le Var par le pont Napoléon III et rejoint le centre de Cagnes-sur-Mer. Elle dessert la gare de Saint-Laurent-du-Var, l’institut Arnault-Tzanck, le Cros-de-Cagnes et l’hippodrome, avec quatre parkings relais.',
    mode: 'tram',
    cout: 328,
    voyageurs: 40000,
    duree: 6,
    feminin: true,
    trace: 'nca-tram-ligne-4',
    parcours: [
      [
        { nom: 'Grand Arénas', pos: [7.21124, 43.67029] },
        { pos: [7.2114, 43.6664] },
        { nom: 'Parc des Expositions et des Congrès', pos: [7.20485, 43.66567] },
        { nom: 'Gare de Saint-Laurent-du-Var', pos: [7.19464, 43.66228] },
        { nom: 'Institut Arnault-Tzanck', pos: [7.1887, 43.6602] },
        { nom: 'Chaillon', pos: [7.18406, 43.65998] },
        { nom: 'Vauban', pos: [7.17828, 43.66063] },
        { nom: 'Val Fleuri', pos: [7.17275, 43.66012] },
        { nom: 'Le Cros', pos: [7.16694, 43.65932] },
        { nom: 'Besset', pos: [7.16235, 43.65886] },
        { nom: 'La Pinède', pos: [7.15766, 43.6573] },
        { nom: 'Hippodrome', pos: [7.15198, 43.65533] },
        { nom: 'Maréchal Juin', pos: [7.15094, 43.65803] },
        { nom: 'Villette', pos: [7.15065, 43.66174] },
        { nom: 'Square Bourdet', pos: [7.15116, 43.66509] },
        { nom: 'Lycées', pos: [7.15054, 43.67027] },
      ],
    ],
    statut:
      'Déclarée d’utilité publique en 2023, ce que la justice a confirmé en juillet 2026, mais le nouveau maire de Cagnes-sur-Mer a annoncé en avril 2026 qu’il n’en voulait pas.',
    precisions: [
      'Le coût de 328 M€ hors taxes date de l’avant-projet d’avril 2022.',
      'Les 40 000 voyageurs par jour viennent du dossier d’utilité publique.',
      'La Métropole n’a voté aucun abandon : en juin 2026, l’enveloppe commune aux lignes 4 et 5 reste de 500 M€.',
    ],
    sources: [
      {
        titre:
          "Préfecture des Alpes-Maritimes, arrêté du 26 octobre 2023 déclarant d'utilité publique la ligne 4 du tramway (statut, acquisitions autorisées pendant cinq ans)",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/48705/380724/file/Arr%C3%AAt%C3%A9%20DUP.pdf',
        pages: 'p. 4 et 5',
      },
      {
        titre:
          "Préfecture des Alpes-Maritimes, annexe 3 de l'arrêté DUP de la ligne 4, exposé des motifs : plus de 40 000 voyageurs par jour dont 7 700 venus de la voiture, coût global de 328 M€ (avant-projet avril 2022), tranches vers Saint-Laurent-du-Var puis Cagnes-sur-Mer",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/48709/380744/file/Annexe%203%20EMC.pdf',
        pages: 'p. 2 et 4',
      },
      {
        titre:
          "Métropole Nice Côte d'Azur, pièce H, complément à l'évaluation socio-économique sur le financement de la ligne 4, juillet 2025 : coût de 328 M€ HT, échéancier de dépenses de 2026 à 2032, autorisation de programme de 500 M€ commune aux extensions du tramway",
        url: 'https://www.nicecotedazur.org/wp-content/uploads/2025/07/PIECE-H_Complement_evaluation_socio-eco-Modalites_financement-Tramway_Ligne_4.pdf',
        pages: 'p. 2',
      },
      {
        titre:
          "Métropole Nice Côte d'Azur, page du projet de ligne 4 : budget prévisionnel de 328 M€ HT, calendrier (travaux préparatoires 2026, infrastructure 2027 à 2029, Val Fleuri 2030, centre de Cagnes-sur-Mer fin 2031)",
        url: 'https://www.nicecotedazur.org/projets/ligne-4-de-tramway/',
      },
      {
        titre:
          "Métropole Nice Côte d'Azur, délibération n° 1.2 du 11 mars 2022 : 7,3 km, 285 M€ HT valeur novembre 2021 et périmètre du coût",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/47113/369915/file/D%C3%A9lib%C3%A9ration%2011%2003%2022.pdf',
        pages: 'p. 4 et 6',
      },
      {
        titre:
          "Nice Premium, « Tramway : après les municipales, l'avenir des lignes T4 et T5 en question », 29 mars 2026 : Éric Ciotti conditionne la ligne 4 à l'accord du maire de Cagnes-sur-Mer",
        url: 'https://www.nicepremium.fr/actualites/tramway-apres-les-municipales-lavenir-des-lignes-t4-et-t5-en-question/',
      },
      {
        titre: "Nice Premium, « Bryan Masson acte l'abandon de la T4 du tramway entre Cagnes-sur-Mer et Nice », 6 avril 2026",
        url: 'https://www.nicepremium.fr/actualites/bryan-masson-acte-labandon-de-la-t4-du-tramway-entre-cagnes-sur-mer-et-nice/',
      },
      {
        titre:
          "Nice Premium, article du 7 juillet 2026 sur le rejet par le tribunal administratif de Nice du recours contre la DUP de la ligne 4 (mise en service évoquée à l'horizon 2040)",
        url: 'https://www.nicepremium.fr/actualites/ligne-4-du-tramway-nice-cagnes-sur-mer-le-tribunal-administratif-rejette-le-recours-des-riverains/',
      },
      {
        titre:
          "Petites Affiches des Alpes-Maritimes, 15 juin 2026, les élus de gauche demandent la ligne au moins jusqu'à Saint-Laurent-du-Var",
        url: 'https://www.petitesaffiches.fr/politique,104/tramway-ligne-4-la-gauche-et-les,43352.html?lang=fr',
      },
      {
        titre:
          "Préfecture des Alpes-Maritimes, annexe 1 de l'arrêté DUP de la ligne 4, plan général des travaux : nom et position des stations",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/48706/380729/file/Annexe%201%20plan%20g%C3%A9n%C3%A9ral%20des%20travaux.pdf',
        pages: 'p. 2 à 6',
      },
      {
        titre: 'OpenStreetMap, tracé cartographié du projet de ligne 4 (voie 1443522614), utilisé pour caler les stations',
        url: 'https://www.openstreetmap.org/way/1443522614',
      },
    ],
  },
  {
    id: 'nca-telepherique-nice-saint-laurent',
    nom: 'Téléphérique de Saint-Laurent-du-Var',
    genre: 'Téléphérique urbain',
    description:
      'Le téléphérique franchit le Var sur 800 m, de l’arrêt CADAM de la ligne 2 du tramway, à Nice, jusqu’à la mairie de Saint-Laurent-du-Var, en moins de trois minutes. Il compte deux stations et un parking relais côté Saint-Laurent.',
    mode: 'cable',
    cout: 40,
    voyageurs: 3400,
    duree: 3,
    trace: 'nca-telepherique-nice-saint-laurent',
    parcours: [
      [
        { nom: 'CADAM (Nice)', pos: [7.1994, 43.6766] },
        { nom: 'Mairie de Saint-Laurent-du-Var', pos: [7.1905, 43.6736] },
      ],
    ],
    statut: 'Reporté fin 2023, quand la Métropole a donné la priorité à la ligne 4 ; son site annonce toujours une livraison en 2028.',
    precisions: [
      'Le coût de 40 M€ date de la concertation de 2021, parking relais compris. La presse parle depuis 2023 de plus de 55 M€, sans confirmation de la Métropole.',
      'Les 3 400 voyageurs par jour sont attendus en 2035.',
    ],
    sources: [
      {
        titre:
          "Métropole Nice Côte d'Azur, déclaration d'intention du téléphérique publiée par la préfecture des Alpes-Maritimes en juillet 2022 : 3 400 voyageurs par jour attendus en 2035, travaux prévus de 2023 à 2025, 800 m en 2 minutes 45, position des deux stations",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/43704/322654/file/MNCA%20-%20D%C3%A9claration%20d%27intention.pdf',
        pages: 'p. 11 et 19',
      },
      {
        titre:
          "Métropole Nice Côte d'Azur, bilan de la concertation préalable du téléphérique : 40 M€ présentés au dossier, environ 30 M€ pour le téléphérique seul",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/43703/322650/file/MNCA%20-%20Bilan%20de%20la%20concertation%20prealable.pdf',
        pages: 'p. 14',
      },
      {
        titre: "Métropole Nice Côte d'Azur, délibération n° 2.26 du 9 avril 2021 : ligne d'environ 800 m, trajet de moins de 3 minutes",
        url: 'https://www.alpes-maritimes.gouv.fr/contenu/telechargement/43701/322642/file/MNCA%20D%C3%A9lib%C3%A9ration%202-26%20du%209%20avril%202021.pdf',
        pages: 'p. 3 et 5',
      },
      {
        titre:
          'Nice-Presse, 15 janvier 2024 : la Métropole confirme que le projet est décalé et que la ligne 4 est prioritaire ; le journal chiffre le nouveau coût à plus de 55 M€',
        url: 'https://nicepresse.com/pays-de-nice-le-telepherique-vers-saint-laurent-du-var-abandonne-la-metropole-sexprime/',
      },
      {
        titre: 'Nice-Presse, 11 septembre 2023 : travaux estimés à 12 ou 18 mois, livraison repoussée à 2028',
        url: 'https://nicepresse.com/nice-metropole-quand-le-nouveau-telepherique-vers-saint-laurent-du-var-sera-t-il-utilisable/',
      },
      {
        titre: "Métropole Nice Côte d'Azur, site des projets de transport, page du téléphérique : livraison affichée en 2028",
        url: 'https://projets-transports.nicecotedazur.org/telepherique-nice-saint-laurent-du-var-2/le-projet-de-la-ligne-de-telepherique/',
      },
      {
        titre: "TPBM (mesinfos.fr), 25 août 2022 : fréquentation attendue de l'ordre de 2 300 voyageurs par jour, coût d'environ 40 M€",
        url: 'https://mesinfos.fr/mobilites-de-demain-nice-cote-azur-lourds-investissements-112392.html',
      },
    ],
  },
]

export const nice: Catalogue = {
  projets,
  tutoriel: {
    projet: 'nca-tram-ligne-5',
    consigne: 'Touchez la ligne 5 du tramway, en noir sur la carte.',
    detail:
      'Chaque pointillé est un projet réel, avec son prix écrit dessus. La ligne 5 relierait le Palais des Expositions à Drap, le long du Paillon, pour 376 M€.',
  },
}
