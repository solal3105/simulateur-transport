# Les données de l'Île-de-France

Le réseau d'Île-de-France Mobilités se joue en tracé libre, sur toute la région, le territoire de l'autorité organisatrice : Paris et les sept autres départements. L'identifiant du réseau dans le code est `idf`, et sa page `/ile-de-france`.

`communes.json` liste les communes des huit départements, tirées de geo.api.gouv.fr le 24 septembre 2026. Pierrefitte-sur-Seine, réunie à Saint-Denis le 1er janvier 2025, y est ajoutée à part, parce que les fichiers de l'INSEE de 2022 la comptent encore séparément.

Les habitants et les emplois par carreau de 200 m (`public/data/idf/carreaux.json`) sont calculés par `python3 scripts/carreaux-ville.py idf`, avec la méthode de Lyon : carroyage Filosofi 2021 recalé sur le recensement 2022 (facteur 1,046, soit 12 380 964 habitants), emplois du recensement 2022 répartis selon la base Sirene, plafonnés à 4 000 par carreau. Cela fait 77 802 carreaux.

Le fond de carte vient d'OpenStreetMap par `node scripts/fetch-osm.mjs idf`, puis `node scripts/build-data.mjs idf`. Sur un territoire aussi grand, le décor ne garde que les bois qui ont un nom et font plus de 20 hectares, les routes principales autour de l'agglomération parisienne, et les routes secondaires de son cœur. Le RER et les trains apparaissent en fond, parmi les voies ferrées ; le joueur ne peut pas en construire.

Les lignes 15, 16, 17 et 18 du Grand Paris Express ouvrent entre 2026 et 2031, avant les lignes du joueur : elles sont dessinées d'après leurs tronçons en chantier dans OpenStreetMap et comptent comme existantes. `stations-futures.json` donne leurs gares, d'après Wikidata (ligne 15 : Q3240151, 16 : Q16655715, 17 : Q16655720, 18 : Q3240157) et la liste de la Société des grands projets.

Le budget, ses sources et ses limites sont dans `lib/budgets/idf.ts`, calculés selon la méthode de `docs/budgets.md`.

Le métro francilien compte ses voyageurs aux entrées, sans les correspondances d'une ligne à l'autre : le jeu estime les lignes de métro du joueur de la même façon (voir `docs/modele.md`). La formule est recalée sur les carreaux de toute la région par `scripts/modele/recaler-jeu.ts`, avec les lignes de métro et de tram connues, y compris celles de grande couronne comme les trams T5 et T11.

Si `carreaux.json` ou `arrets.json` changent, leur empreinte doit être mise à jour dans la fonction serveur `communaute`, et les données redéposées.
