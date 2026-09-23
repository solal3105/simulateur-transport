# Les données de Paris

Paris se joue en tracé libre, sur Paris et les trois départements de la petite couronne (Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne). L'autorité organisatrice, Île-de-France Mobilités, couvre toute la région : ce périmètre de jeu est un choix, pris pour garder une carte lisible autour du métro.

`communes.json` liste Paris et les communes des trois départements, tirées de geo.api.gouv.fr le 23 septembre 2026. Pierrefitte-sur-Seine, réunie à Saint-Denis le 1er janvier 2025, y est ajoutée à part, parce que les fichiers de l'INSEE de 2022 la comptent encore séparément.

Les habitants et les emplois par carreau de 200 m (`public/data/paris/carreaux.json`) sont calculés par `python3 scripts/carreaux-ville.py paris`, avec la méthode de Lyon : carroyage Filosofi 2021 recalé sur le recensement 2022 (facteur 1,065, soit 6 862 396 habitants), emplois du recensement 2022 répartis selon la base Sirene, plafonnés à 4 000 par carreau.

Le fond de carte vient d'OpenStreetMap par `node scripts/fetch-osm.mjs paris`, puis `node scripts/build-data.mjs paris`. Les routes, découpées en milliers de tronçons dans OpenStreetMap, sont raccordées bout à bout pour alléger le décor.

Les lignes 15, 16, 17 et 18 du Grand Paris Express ouvrent entre 2026 et 2031, avant les lignes du joueur : elles sont dessinées d'après leurs tronçons en chantier dans OpenStreetMap et comptent comme existantes. `stations-futures.json` donne leurs gares, d'après Wikidata (ligne 15 : Q3240151, 16 : Q16655715, 17 : Q16655720, 18 : Q3240157) et la liste de la Société des grands projets.

Le budget est celui de Lyon rapporté au nombre d'habitants : 9 570 M€ par mandat, dont 1 910 M€ pour l'entretien des bus. Les sources sont dans `docs/villes.md`.

Le métro parisien compte ses voyageurs aux entrées, sans les correspondances d'une ligne à l'autre : le jeu estime les lignes de métro du joueur de la même façon (voir `docs/modele.md`).

Si `carreaux.json` ou `arrets.json` changent, leur empreinte doit être mise à jour dans la fonction serveur `communaute`, et les données redéposées.
