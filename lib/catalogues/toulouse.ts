import type { Catalogue, Projet } from '../types'

/**
 * Les projets de Toulouse. Tisséo n’en a pas décidé d’autres que la ligne C, la connexion de la ligne B et la
 * ligne Aéroport, déjà sur la carte : sa programmation 2026-2038, présentée le 20 mai 2026, ne nomme aucune
 * nouvelle ligne, et les projets encore à l’étude n’ont ni coût ni fréquentation publiés. Restent deux projets
 * étudiés et chiffrés par Tisséo en 2013, puis abandonnés. Recherche du 25 septembre 2026.
 */
const projets: Projet[] = [
  {
    id: 'tls-bhns-ouest',
    nom: 'Bus rapide de l’Ouest',
    genre: 'Bus à haut niveau de service',
    description:
      'Une ligne de bus presque entièrement en site propre, de Plaisance-du-Touch à la gare Matabiau, par Tournefeuille, Lardenne, les Arènes, le pont des Catalans et les boulevards : 18,5 km, 25 stations et deux parkings relais.',
    mode: 'bus',
    cout: 180,
    voyageurs: 35000,
    duree: 2,
    trace: 'tls-bhns-ouest',
    parcours: [
      [
        { nom: 'Plaisance-du-Touch, route de Lombez', pos: [1.2894, 43.56265] },
        { nom: 'Plaisance-du-Touch, route de Toulouse', pos: [1.31246, 43.57188] },
        { nom: 'Tournefeuille, rue du Petit-Train', pos: [1.32737, 43.57962] },
        { nom: 'Tournefeuille, boulevard Vincent-Auriol', pos: [1.34527, 43.58507] },
        { nom: 'Lardenne', pos: [1.38151, 43.59062] },
        { nom: 'La Cépière', pos: [1.40453, 43.59296] },
        { nom: 'Arènes', pos: [1.41855, 43.59345] },
        { nom: 'Patte d’Oie', pos: [1.42301, 43.59639] },
        { nom: 'Allées Charles-de-Fitte', pos: [1.4302, 43.59865] },
        { nom: 'Pont des Catalans', pos: [1.428, 43.60374] },
        { nom: 'Boulevard Lascrosses', pos: [1.4299, 43.60878] },
        { nom: 'Compans-Caffarelli', pos: [1.43561, 43.61047] },
        { nom: 'Jeanne d’Arc', pos: [1.44513, 43.60911] },
        { nom: 'Gare Matabiau', pos: [1.45332, 43.61073] },
      ],
    ],
    statut:
      'Étudié par Tisséo jusqu’en 2013, puis abandonné en 2014. Le Linéo 3 reprend depuis 2019 une partie du trajet, sans site propre à Lardenne.',
    precisions: [
      'Le budget de 180 M€ date de 2012 et 2013 et n’a jamais été actualisé.',
      'Les 35 000 voyageurs par jour étaient attendus en 2017 ; ils comprennent ceux des bus que la ligne remplaçait, dont le Linéo 3 d’aujourd’hui, qui en transporte 7 500.',
      'L’emplacement des stations n’a pas été publié : notre tracé suit l’itinéraire décrit en 2015.',
    ],
    sources: [
      {
        titre:
          'Jean-Pierre Wolff et Florence Laumière, « Projets d’infrastructures de transports collectifs et enjeux électoraux dans une métropole française. Le projet de BHNS de l’ouest toulousain », Sud-Ouest européen n° 40, 2015 : 18,5 km, 25 stations, 180 M€, 35 000 voyageurs par jour en 2017 puis 42 000 en 2020, itinéraire, parcs relais, remplacement par une ligne Linéo en mars 2015',
        url: 'https://journals.openedition.org/soe/2236',
        pages: 'parties I, III et IV',
      },
      {
        titre:
          'Toulouse Infos, « BHNS à Lardenne : plus personne ne s’arrêtera ici, ce projet va tuer le commerce », 22 février 2013 : budget de 180 M€, deux ans de travaux',
        url: 'https://www.toulouseinfos.fr/actualites/une/7467-bhns-a-lardenne-plus-personne-ne-sarretera-ici-ce-projet-va-tuer-le-commerce.html',
      },
      {
        titre:
          'Tisséo Collectivités, délibération D.2014.09.24.7.2, rapport des administrateurs de la SMAT sur l’exercice 2013 : études préliminaires et concertation du BHNS Ouest en 2013, phase opérationnelle non affermie en 2014',
        url: 'https://tisseo-collectivites.fr/sites/default/files/media/pdfs/deliberations/2014/CS.2014.09.24/D.2014.09.24.7.2.pdf',
        pages: 'p. 59 et 73',
      },
      {
        titre:
          'Tisséo Collectivités, point d’information I.2019.10.16.5.23, bilan d’étape Linéo : le Linéo 3 Plaisance, Tournefeuille, Arènes, 12,1 km, 43 M€ HT, 7 500 voyageurs par jour',
        url: 'https://tisseo-collectivites.fr/sites/default/files/media/pdfs/deliberations/2019/CS.2019.10.16/I.2019.10.16.5.23.pdf',
        pages: 'p. 1 et 24',
      },
    ],
  },
  {
    id: 'tls-tram-canal',
    nom: 'Tram Canal',
    genre: 'Nouvelle ligne de tramway',
    description:
      'Un tramway part du Palais de Justice, longe le canal du Midi jusqu’à la gare Matabiau puis aux Ponts-Jumeaux, et franchit la Garonne sur un nouveau pont pour rejoindre la ligne T1 à Purpan. Il relie la gare et le nord du centre-ville à la ligne T1 vers Blagnac.',
    mode: 'tram',
    cout: 300,
    voyageurs: 34200,
    duree: 2,
    trace: 'tls-tram-canal',
    parcours: [
      [
        { nom: 'Palais de Justice', pos: [1.44405, 43.59273] },
        { nom: 'Grand Rond', pos: [1.4531, 43.59445] },
        { nom: 'Port Saint-Sauveur', pos: [1.4563, 43.59525] },
        { nom: 'Pont Guilhemery', pos: [1.45634, 43.60081] },
        { nom: 'Gare Matabiau', pos: [1.45332, 43.61073] },
        { nom: 'Pont Matabiau', pos: [1.45072, 43.61394] },
        { nom: 'Pont des Minimes', pos: [1.43727, 43.61606] },
        { nom: 'Ponts-Jumeaux', pos: [1.41738, 43.61071] },
        { nom: 'Purpan', pos: [1.40199, 43.60911] },
      ],
    ],
    statut: 'Étudié par Tisséo en 2013, abandonné en avril 2014.',
    precisions: [
      'Le coût de 300 M€, nouveau pont sur la Garonne compris, date de 2013 et n’a jamais été actualisé.',
      'Aucune fréquentation propre à la ligne n’a été publiée : nous l’estimons comme pour les lignes que vous tracez.',
      'Aucune liste de stations n’a été publiée : notre tracé passe par les lieux cités par la presse en 2013.',
      'La ligne C du métro, qui ouvre fin 2028, dessert aussi Matabiau et le nord-ouest.',
    ],
    estime: { voyageurs: true },
    sources: [
      {
        titre:
          'Ville, Rail & Transports, « Toulouse : le tram Canal pour relier la gare à l’aéroport », 6 juin 2013 : 300 M€ dont 1 M€ d’études, 7 à 9 km, travaux de 2017 à 2019, mise en service vers 2020',
        url: 'https://www.ville-rail-transports.com/mobilite-douces/18426-toulouse-le-tram-canal-pour-relier-la-gare-a-laeroport/',
      },
      {
        titre:
          'La Dépêche du Midi, « De quel côté passera le tram Canal ? », 1er juin 2013 : tracés envisagés, 300 M€, deux ans de travaux, 100 000 voyageurs par jour visés pour tout le réseau de tram en 2020',
        url: 'https://www.ladepeche.fr/article/2013/06/01/1639743-de-quel-cote-passera-le-tram-canal.html',
        pages: 'questions 2 et 5, encadré « Le chiffre »',
      },
      {
        titre:
          'Tisséo Collectivités, délibération D.2014.09.24.7.2, rapport des administrateurs de la SMAT sur l’exercice 2013 : études de l’opération Canal commencées en septembre 2013, études Tram Canal arrêtées en avril 2014',
        url: 'https://tisseo-collectivites.fr/sites/default/files/media/pdfs/deliberations/2014/CS.2014.09.24/D.2014.09.24.7.2.pdf',
        pages: 'p. 59 et 73',
      },
    ],
  },
]

export const toulouse: Catalogue = {
  projets,
  tutoriel: {
    projet: 'tls-bhns-ouest',
    consigne: 'Touchez le bus rapide de l’Ouest, en noir sur la carte.',
    detail:
      'Chaque pointillé est un projet réel, avec son prix écrit dessus. Ce bus relierait Plaisance-du-Touch à la gare Matabiau pour 180 M€.',
  },
}
