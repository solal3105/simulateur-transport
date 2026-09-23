# Habitants et emplois par carreau de 200 m

Les deux fichiers couvrent les 58 communes de la Métropole de Lyon. Chaque ligne est le centre d'un carreau de 200 m de la grille INSEE (projection LAEA, EPSG:3035), converti en longitude et latitude.

`pop_200m.csv` donne les habitants du carroyage Filosofi 2021 (variable `ind`) : https://www.insee.fr/fr/statistiques/8735162. Filosofi ne compte que les ménages fiscaux ordinaires, soit environ 10 % de moins que le recensement. Le script `scripts/build-data.mjs` recale donc chaque carreau sur le recensement 2022 (1 433 613 habitants).

`jobs.csv` donne une estimation des emplois au lieu de travail. Le total par commune et par arrondissement est celui du recensement 2022 (variable `P22_EMPLT`) : https://www.insee.fr/fr/statistiques/8581444. Il est réparti entre les carreaux selon les effectifs salariés de la base Sirene géolocalisée de la Métropole (milieu de chaque tranche d'effectif) : https://data.grandlyon.com/portail/fr/jeux-de-donnees/base-sirene-metropole-lyon/info. Les grands employeurs publics sont rattachés à leur siège, ce qui crée des pics artificiels : le script plafonne chaque carreau à 4 000 emplois.
