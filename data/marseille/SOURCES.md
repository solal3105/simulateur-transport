# Les données de Marseille

Marseille se joue en tracé libre, sur le territoire de la Métropole d'Aix-Marseille-Provence, autorité organisatrice des transports de ses 92 communes. Il n'y a pas de catalogue de projets, seulement le réseau actuel, les habitants et les emplois.

`communes.json` liste les 92 communes de la Métropole (EPCI 200054807), tirées de geo.api.gouv.fr le 23 septembre 2026. Leurs contours viennent du même service, par `node scripts/fetch-osm.mjs marseille contours`.

Les habitants et les emplois par carreau de 200 m (`public/data/marseille/carreaux.json`) sont calculés par `python3 scripts/carreaux-ville.py marseille`, avec la méthode de Lyon : carroyage Filosofi 2021 recalé sur le recensement 2022 (facteur 1,085, soit 1 922 626 habitants), emplois du recensement 2022 répartis selon les établissements de la base Sirene, plafonnés à 4 000 par carreau.

Le fond de carte vient d'OpenStreetMap par `node scripts/fetch-osm.mjs marseille`, puis `node scripts/build-data.mjs marseille` prépare les fichiers de `public/data/marseille/`. La mer n'existe dans OpenStreetMap que comme trait de côte : le script de préparation la reconstruit en surface dans le cadre de la carte, les îles du Frioul et de Riou restant des terres. Le territoire étant grand et boisé, les bois de moins de 20 hectares et ce qui sort du cadre sont écartés du décor.

Le tram d'Aubagne et le Val'Tram, en essais depuis décembre 2025, sont dessinés avec le réseau existant. Les projets qui n'ont pas de déclaration d'utilité publique (prolongement du T2 au 4-Septembre, T3 jusqu'à La Bricarde, tram de la Belle de Mai) ne le sont pas : le joueur peut les tracer lui-même.

Le budget reprend l'objectif de 300 M€ d'investissement par an de la Métropole : 1 800 M€ par mandat, dont 360 M€ pour l'entretien des bus. Les sources sont dans `docs/villes.md`.

Si `carreaux.json` ou `arrets.json` changent, leur empreinte doit être mise à jour dans la fonction serveur `communaute`, et les données redéposées (voir `docs/communaute.md`).
