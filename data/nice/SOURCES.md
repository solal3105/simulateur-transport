# Les données de Nice

Nice se joue en tracé libre, sur le territoire de la Métropole Nice Côte d'Azur, autorité organisatrice des transports de ses 51 communes, de la mer aux vallées de la Tinée et de la Vésubie. Il n'y a pas de catalogue de projets.

`communes.json` liste les 51 communes de la Métropole (EPCI 200030195), tirées de geo.api.gouv.fr le 23 septembre 2026. Leurs contours viennent du même service.

Les habitants et les emplois par carreau de 200 m (`public/data/nice/carreaux.json`) sont calculés par `python3 scripts/carreaux-ville.py nice`, avec la méthode de Lyon : carroyage Filosofi 2021 recalé sur le recensement 2022 (facteur 1,036, soit 568 596 habitants), emplois du recensement 2022 répartis selon la base Sirene, plafonnés à 4 000 par carreau.

Le fond de carte vient d'OpenStreetMap par `node scripts/fetch-osm.mjs nice`, puis `node scripts/build-data.mjs nice`. La mer est reconstruite à partir du trait de côte, comme à Marseille. Les bois de moins de 25 hectares sont écartés du décor.

La ligne 5 du tram, de Nice à Drap, déclarée d'utilité publique le 27 juillet 2026, n'est pas encore dans OpenStreetMap et n'est donc pas dessinée : le joueur peut la tracer lui-même, et l'écran « Comment nous estimons une ligne » le dit. La ligne 4 vers Cagnes-sur-Mer, dont l'abandon a été annoncé en avril 2026, ne l'est pas non plus.

Le budget, ses sources et ses limites sont dans `lib/budgets/nice.ts`, calculés selon la méthode de `docs/budgets.md`. L'argent prévu pour la ligne 5 reste au joueur au premier mandat, puisqu'elle n'est pas dessinée.

Si `carreaux.json` ou `arrets.json` changent, leur empreinte doit être mise à jour dans la fonction serveur `communaute`, et les données redéposées.
