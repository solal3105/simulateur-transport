# Le moteur de fréquentation

Le jeu estime les voyageurs d'une ligne tracée par le joueur avec une formule. Cette formule n'est pas réglée à la main : un moteur en essaie des dizaines de milliers sur toutes les lignes françaises dont nous avons trouvé la fréquentation, juge chacune sur des lignes qu'elle n'a pas vues, et retient la meilleure. Ce document décrit les données, la façon de juger, la formule retenue et ses limites. Les scripts sont dans `scripts/modele/`, les données et les résultats dans `data/modele/`.

## Les lignes dont on connaît la fréquentation

`data/modele/frequentation.csv` rassemble 165 lignes de 31 villes, relevées les 23 et 24 septembre 2026 : métro, tram et bus à haut niveau de service. Chaque ligne donne sa valeur telle que publiée, son unité, son année et sa source, puis la valeur ramenée à un jour de semaine. Une valeur annuelle est divisée par 265, comme pour le calage lyonnais d'origine ; une valeur par jour de semaine est gardée telle quelle. Les sources sont les rapports d'activité des réseaux et des autorités organisatrices, leurs données ouvertes, l'observatoire Omnil pour l'Île-de-France, les rapports des chambres régionales des comptes, les rapports de l'État sur les tramways (STRMTG) et de la DREAL Pays de la Loire, et, pour quelques villes, la presse ou Wikipédia citant un rapport qu'on n'a pas pu ouvrir ; la colonne `remarque` le dit alors.

137 lignes sont retenues pour le calage ; deux d'entre elles, la C4 de Mulhouse et la Liane L7 de Dijon, sont introuvables dans OpenStreetMap, et le calage porte donc sur 135 lignes de 29 villes. Les 28 autres sont écartées pour une raison écrite dans la base : un tracé qui a changé depuis l'année du chiffre (lignes A et C de Bordeaux, T6 de Lyon, T3 de Marseille, D de Grenoble, T4 de Rouen), un réseau redessiné depuis (tram A d'Angers), une navette atypique (3 bis et 7 bis à Paris, T7 de Lyon), un comptage incertain (Valenciennes, gratuit jusqu'à 25 ans), une ligne qui en double d'autres sur presque tout son parcours (ligne 3 de Mulhouse), un métro à crémaillère (C à Lyon), une ligne trop récente pour avoir trouvé ses voyageurs (ligne 5 de Montpellier, Linéo L7 et L12 de Toulouse), ou une liaison interurbaine.

Les unités ne sont pas partout les mêmes : voyages, validations, montées d'enquête. Deux cas sont traités à part. Le métro parisien compte ses entrées, sans les correspondances d'une ligne de métro à l'autre : il a son propre niveau dans la formule. Les bus sont de deux sortes, les bus en site propre (busway de Nantes, Mettis de Metz, TEOR de Rouen, Tempo de Tours et du Mans, BHNS de Marseille, Bordeaux, Strasbourg, Nîmes et Pau) et les lignes de bus renforcées sans site propre continu (Linéo de Toulouse, Chronostar de Rennes, Lianes de Lille et de Dijon, Chronobus de Nantes), notées dans la colonne `bus`.

Quand une ville ne publie qu'un chiffre pour deux lignes (le tram de Lille, R et T ; les deux trams du Havre ; le Mettis de Metz), les deux lignes sont réunies en une seule pour le calcul. La ligne 4 de Montpellier, circulaire, est découpée par OpenStreetMap en deux sens, réunis de la même façon.

## Les lignes sur la carte

`scripts/modele/lignes.py` télécharge d'OpenStreetMap, par Overpass, les relations de métro, de tram et de téléphérique de 33 villes, les lignes de bus dont on connaît la fréquentation, et les gares ferroviaires de toute la France. `scripts/modele/variables.py` en tire les stations de chaque ligne : les arrêts ou les quais, le jeu le plus complet des deux, fusionnés à 150 m près. Deux relations de même nom qui ne se touchent pas restent deux lignes, comme la T1 de Marseille et celle d'Aubagne ; une relation sans numéro le prend dans son nom, comme le tram B de Bordeaux.

## Les habitants et les emplois

`scripts/modele/grille.py` construit une grille nationale de carreaux de 200 m : 2,3 millions de carreaux, 65,9 millions d'habitants et 26,6 millions d'emplois. Les habitants viennent du carroyage Filosofi 2021, recalé commune par commune sur le recensement 2022. Les emplois sont ceux du recensement 2022 par commune, répartis entre les carreaux selon les effectifs des établissements employeurs de la base Sirene (`scripts/modele/sirene.py`), plafonnés à 4 000 par carreau.

## Les variables

Pour chaque ligne, `variables.py` calcule :

- les habitants et les emplois à 300, 400, 500, 600, 800 et 1 000 m des stations, chaque carreau compté une fois, et la même chose en partageant chaque carreau entre les lignes qui le desservent (le bassin « propre ») ;
- les habitants et les emplois à 2 et 5 km de la ligne ;
- le bassin de vie et le bassin d'emploi de la ville, habitants et emplois à 10 et 20 km du centre, et les emplois à moins de 1 km du centre ;
- les correspondances, autres lignes à moins de 250 m de chaque station, et les gares à moins de 300 m ;
- la distance du centre de l'arrêt le plus proche, et la part des stations à moins de 1,5 km du centre ;
- la concurrence, part des habitants et emplois à 400 m qui sont aussi à 400 m d'une autre ligne ;
- le nombre de stations, la longueur de la ligne et le nombre de lignes de métro et de tram de la ville.

## Comment une formule est jugée

Une formule prédit le logarithme des voyageurs par jour comme une somme pondérée de variables. `scripts/modele/moteur.py` en essaie 23 980. Un premier tour choisit, avec le seul bassin, la distance de comptage autour des stations de métro et des autres modes, le poids d'un emploi par rapport à un habitant et la part comptée des habitants un peu plus éloignés. Un second tour essaie, autour des quatre meilleurs réglages, toutes les combinaisons d'au plus sept groupes de variables.

Chaque formule est jugée sur des lignes absentes de son calage, de deux façons :

- ville connue : chaque ville a son propre niveau, tiré vers la moyenne quand elle a peu de lignes, et on prédit chaque ligne sans elle. C'est la situation du jeu, qui connaît les lignes existantes de la ville ;
- ville inconnue : on retire une ville entière et on prédit ses lignes, comme pour une ville qu'on ouvrirait sans aucun chiffre.

Le score est la moyenne des deux écarts, mesurés en logarithme. Chaque ligne pèse 1 sur la racine du nombre de lignes de sa ville, sinon les 26 lignes de Paris dicteraient la formule aux villes qui n'en ont qu'une ou deux. Les écarts sans une ligne ou sans une ville se calculent par des formules exactes, vérifiées contre un recalage complet (écart de l'ordre de 10⁻¹² sur le logarithme) : les 23 980 formules sont jugées en moins d'une minute.

Deux règles viennent ensuite. Le moteur n'accepte que des formules où chaque variable agit dans le sens attendu pour un joueur : plus d'habitants ou de gares, plus de voyageurs ; plus de concurrence ou d'éloignement du centre, moins ; un bus en site propre, moins qu'un tram sur les mêmes arrêts. Le métro n'a pas de sens imposé : on lui compte les habitants plus loin que pour le tram, et c'est surtout par là qu'il gagne. Une formule qui ferait perdre des voyageurs à une ligne parce qu'elle a des correspondances colle un peu mieux aux chiffres, par un effet de double compte des bassins, mais elle apprendrait au joueur une règle fausse. Ensuite, beaucoup de formules font presque aussi bien que la meilleure et leur ordre change dès qu'on ajoute quelques lignes : le moteur réunit celles qu'on ne peut pas distinguer de la meilleure (l'écart ne dépasse pas son erreur type, mesurée ligne par ligne) et retient les variables présentes dans plus de la moitié d'entre elles.

## La formule retenue

Sur 135 lignes de 29 villes, la formule retenue est :

    voyageurs par jour = exp(constante de la ville + mode + 1,075 × bassin − 0,503 × concurrence)

Le bassin est le logarithme de 1 plus les habitants et les emplois, comptés à égalité, à moins de 1 000 m d'une station de métro ou à moins de 400 m d'un arrêt des autres modes. Doubler le bassin multiplie les voyageurs par 2,1. Une ligne dont tous les arrêts sont déjà à moins de 400 m d'une station existante garde 60 % des voyageurs qu'elle aurait seule. Le mode retire 0,062 pour un métro, dont l'avantage passe par sa distance de comptage plus grande, et 0,823 pour un bus en site propre, soit 56 % de voyageurs de moins qu'un tram sur les mêmes arrêts ; une ligne de bus renforcée sans site propre perd encore 0,484. La constante de chaque ville réunit une constante commune et le niveau propre de la ville.

Parmi les 46 formules indiscernables de la meilleure, la concurrence est présente dans 78 %. Les autres ingrédients sont dans moins d'un tiers d'entre elles : les habitants à 10 km du centre dans 28 %, le bassin d'emploi de la ville dans 24 %, la taille du réseau dans 20 %, les correspondances et la distance au centre dans 11 %, les gares dans aucune. Leur effet, quand il existe, est déjà porté par les habitants autour des arrêts ou par le niveau propre de chaque ville.

Sur une ligne absente du calage, l'estimation s'écarte du réel de 32 % en moyenne quand la ville est connue, et de 39 % quand elle ne l'est pas. Le réel se situe entre 0,64 et 1,59 fois l'estimation pour huit lignes sur dix : c'est la fourchette affichée dans le jeu.

Le téléphérique n'a aucune ligne dans le calage. Son écart au tram est estimé sur les deux téléphériques dont on connaît la fréquentation, Téléo à Toulouse et celui de Brest, prédits comme des trams : −0,13, soit 12 % de voyageurs de moins qu'un tram. C'est fragile : les deux lignes s'en écartent dans des sens opposés, Téléo au-dessus, Brest en dessous.

## Du moteur au jeu

Le moteur écrit `lib/formule.ts`, que le jeu et la fonction serveur lisent tels quels : les distances, les coefficients, la constante de chaque ville, la fourchette, et pour l'écran « Comment nous estimons une ligne » l'écart de l'estimation sur chaque ligne connue de la ville. `lib/modele.ts` ne fait que calculer la formule, sans aucun chiffre en dur.

Le jeu ne calcule pas avec la grille nationale mais avec les carreaux de chaque ville (`public/data`), faits à des dates et parfois par des chaînes différentes : à Lyon, ils comptent un peu plus de monde près des arrêts de tram. `scripts/modele/recaler-jeu.ts` fait estimer par le code du jeu les lignes réelles de chaque ville et ajoute à la constante de la ville l'écart médian avec le moteur : −0,072 à Lyon, +0,059 à Toulouse, +0,026 à Marseille, +0,030 à Nice, −0,023 à Paris. Avant ce recalage, le jeu retrouvait les chiffres du moteur à 8 % près en moyenne ; les plus gros écarts restants viennent de lignes qui sortent du territoire du jeu, comme les trams T5 et T6 à Paris.

À Paris, le métro compte ses voyageurs aux entrées, sans les correspondances : le jeu estime les lignes de métro du joueur de la même façon, pour qu'elles se comparent aux lignes existantes (ajustement de −0,697, soit deux fois moins de voyageurs).

## Ce que la formule ne voit pas

La formule ne connaît ni la vitesse ni la fréquence des lignes, ni les grands équipements comme les hôpitaux, les campus ou les stades. Elle se trompe le plus sur des lignes à part : le T5 de Lyon vers Eurexpo, qu'elle surestime de 92 %, ou le busway de Nantes, bien meilleur que la moyenne des bus en site propre, qu'elle sous-estime de 63 %. Les unités de fréquentation diffèrent d'un réseau à l'autre ; le niveau propre de chaque ville absorbe l'essentiel de ces écarts, pas les différences entre modes d'une même ville.

## Relancer

Les téléchargements et la grille ne se refont que si les sources changent. Les fichiers de l'INSEE (`f21.zip`, `pop22.zip`, `emploi22.zip`) vont dans `data/insee-france/`, qui n'est pas versionné ; la grille et les réponses d'OpenStreetMap non plus.

    python3 scripts/modele/sirene.py            # établissements de la base Sirene, par département
    python3 scripts/modele/grille.py            # grille nationale, data/modele/grille.npz
    python3 scripts/modele/lignes.py            # lignes de 33 villes, data/modele/osm/
    python3 scripts/modele/lignes.py gares      # gares de France
    python3 scripts/modele/lignes.py bus rennes C1 C2    # des lignes de bus d'une ville
    python3 scripts/modele/variables.py         # data/modele/variables.csv et stations.json
    python3 scripts/modele/moteur.py            # data/modele/resultats.json, lib/formule.ts
    node_modules/.bin/jiti scripts/modele/recaler-jeu.ts # recalage sur les carreaux du jeu
    node scripts/fonction-communaute.mjs        # copie pour la fonction serveur, à redéployer

Après une nouvelle formule, la fonction serveur `communaute` doit être redéployée, et les réseaux publiés qui contiennent des lignes tracées recalculés, sinon le site afficherait pour eux les voyageurs de l'ancienne formule.
