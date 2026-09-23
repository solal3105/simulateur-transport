# Les données de Toulouse

Toulouse se joue en tracé libre : il n'y a pas de catalogue de projets, seulement le réseau actuel, les habitants et les emplois, et les lignes qui ouvrent avant celles du joueur.

`communes.json` liste les 114 communes des cinq intercommunalités membres de Tisséo Collectivités (Toulouse Métropole, Muretain Agglo, Sicoval, Grand Ouest Toulousain et Coteaux Bellevue), tirées de geo.api.gouv.fr le 23 septembre 2026. Leurs contours viennent du même service, par `node scripts/fetch-osm.mjs toulouse contours`.

`stations-futures.json` donne les 21 stations de la ligne C du métro, qui ouvre fin 2028, et les deux stations de la connexion de la ligne B à Labège, qui ouvre en 2027. Les positions viennent de Wikidata (ligne C : Q110876443, ligne B : Q3239063). OpenStreetMap ne connaît que 13 stations de la ligne C. Ces stations comptent comme déjà desservies dans le calcul des nouveaux voyageurs, et la ligne est dessinée d'après les tronçons en chantier d'OpenStreetMap, ou en ligne droite entre ses stations s'ils manquent.

Les habitants et les emplois par carreau de 200 m (`public/data/toulouse/carreaux.json`) sont calculés par `python3 scripts/carreaux-ville.py toulouse`, avec la méthode de Lyon décrite dans `data/insee/SOURCES.md` : carroyage Filosofi 2021 recalé sur le recensement 2022 (facteur 1,105, soit 1 115 836 habitants), emplois du recensement 2022 répartis selon les établissements de la base Sirene, plafonnés à 4 000 par carreau. Les fichiers de l'INSEE sont à placer dans `data/insee-france/`, qui n'est pas versionné ; l'en-tête du script dit lesquels.

Le fond de carte (Garonne, métro, tram, Téléo, parcs, eau, grands axes, quartiers, arrêts) vient d'OpenStreetMap par `node scripts/fetch-osm.mjs toulouse`, puis `node scripts/build-data.mjs toulouse` prépare les fichiers de `public/data/toulouse/`. Au 23 septembre 2026, la couche des voies ferrées manque : les serveurs Overpass refusaient la requête. Il suffira de relancer `node scripts/fetch-osm.mjs toulouse rail` puis le script de préparation.

Le budget, ses sources et ses limites sont dans `lib/budgets/toulouse.ts`, calculés selon la méthode de `docs/budgets.md`.

Si `carreaux.json` ou `arrets.json` changent, leur empreinte doit être mise à jour dans la fonction serveur `communaute`, et les données redéposées (voir `docs/communaute.md`).
