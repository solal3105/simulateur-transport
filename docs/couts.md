# Le coût d'une ligne tracée

Le coût d'une ligne additionne quatre parts, calculées dans `lib/couts.ts` à partir du terrain de `lib/terrain.ts` :

- la voie, au kilomètre de tracé, matériel roulant et dépôt compris ;
- chaque station ;
- un tunnel ou une tranchée couverte là où le terrain monte plus vite que le mode ne sait gravir, avec des stations souterraines quand le tram ou le bus passe sous la colline ;
- un pont pour chaque grand cours d'eau franchi en tram ou en bus, un passage dessous pour le métro ;
- pour le métro, le tunnel creusé à plus de 30 m sous une colline et les stations creusées au-delà de 25 m.

Le tout est multiplié par un coefficient propre au réseau, parce qu'on ne construit pas au même prix partout.

## Les prix

En millions d'euros 2025, pour une ville moyenne :

| Mode | Voie par km | Station | Tunnel en plus, par km | Fleuve | Station sous la colline |
| --- | --- | --- | --- | --- | --- |
| Tram | 32 | 1,5 | 160 (pente au-delà de 6 %, rampes de 250 m comprises) | 20 (pont) | 40 par station souterraine |
| Bus à haut niveau de service | 15 | 0,6 | 100 (pente au-delà de 10 %, rampes comprises) | 15 (pont) | 30 par station souterraine |
| Métro automatique | 100 | 40 | 250 (tunnel à plus de 30 m) | 30 (passage dessous) | 7 par mètre au-delà de 25 m |
| Téléphérique | 10 | 9 | | | |

Les coefficients des réseaux : Lyon 1,2, Tisséo 1, Aix-Marseille-Provence 1,4, Lignes d'Azur 1,45, Île-de-France 1,85. Ils viennent du coût au kilomètre des trams récents (Lyon 39 à 46 M€, Nice 51, Marseille 56, Île-de-France 54 à 78, contre 35 dans les villes moyennes) et des métros (196 à 295 M€ par km en Île-de-France, 113 à 125 à Rennes et à Toulouse).

Les pentes maximales sans ouvrage : 6 % pour le tram (le référentiel du Cerema admet 8 % par exception, mais les directives des tramways de Genève n'admettent 5 à 6 % que sur de courtes rampes), 10 % pour un métro sur pneus (le Sytral étudiait 10 à 12 % pour la ligne E), 10 % pour le bus (notre estimation, aucune source ne la fixe). Le tram et le bus suivent le terrain tant que leur pente le permet et passent dessous sinon ; le tunnel du métro reste au plus près de la surface que sa pente permet, avec 12 m de couverture.

`scripts/caler-couts.ts` cherche ces prix : la voie et les stations sur 27 chantiers en terrain plat (écart moyen de 15 % pour le tram, 11 % pour le bus, 14 % pour le métro, sans biais d'ensemble), puis les ouvrages sur les chantiers lyonnais sous une colline, recalculés avec le relief sur des tracés approchés. TEOL est retrouvé à 5 % près, la ligne E à 10 % près (286 M€ par km contre 316), le métro B à Saint-Genis-Laval à 3 % près. La recherche la plus serrée collait à 1 % près avec des montants extrêmes (200 M€ de tunnel de tram par km, 10 M€ par mètre de profondeur) : nous avons retenu des valeurs intermédiaires, plus proches des sources, plutôt que de caler deux chantiers au plus juste. Le téléphérique ne craint pas la pente. Les grands cours d'eau sont le Rhône, la Saône, la Garonne, la Seine, la Marne, l'Oise, le Var et la Durance ; les petites rivières se franchissent sans ouvrage notable.

## D'où viennent ces prix

Une recherche du 24 septembre 2026 a réuni 53 chantiers français, dont 45 chiffrés par des documents officiels (avis de l'autorité environnementale, rapports de commission d'enquête, bilans LOTI de l'IGEDD, rapports de la Cour des comptes sur la Société du Grand Paris, contre-expertises du SGPI, publications du Cerema et du CETU). Les montants sont convertis en euros 2025 avec l'index TP01 de l'INSEE en moyenne annuelle.

Quelques repères :

- Tram : Lyon T6 nord 222 M€ 2025 pour 5,4 km ([MRAe](https://www.mrae.developpement-durable.gouv.fr/IMG/pdf/2022apara62_tramwayt6n_metropole-de-lyon_69.pdf), p. 5-6), T9 346 M€ pour 8,8 km ([MRAe](https://www.mrae.developpement-durable.gouv.fr/IMG/pdf/2023apara64_tramwayt9_lyonvaulxenvelinvilleurbanne_69.pdf), p. 6), T10 352 M€ pour 7,6 km ([MRAe](https://www.mrae.developpement-durable.gouv.fr/IMG/pdf/2022apara133_tramwayt10_saint-fonsvenissieuxlyon_69.pdf), p. 6), Tours ligne A 531 M€ pour 14,8 km (bilan LOTI de l'IGEDD). Une station de tram coûte de 0,5 à 1,1 M€.
- Tram en tunnel : TEOL, 812 M€ pour 6 km dont 2,9 en tunnel ([IGEDD](https://www.igedd.developpement-durable.gouv.fr/IMG/pdf/08_-_projet_de_ligne_de_tramway_express_de_l_ouest_lyonnais_cle045292.pdf), p. 6-7) ; Nice L2, 878 M€ pour 11,3 km dont 3,2 en tunnel.
- Ponts de tram : environ 90 à 120 k€ par mètre (pont Raymond-Barre sur le Rhône, pont sur le Rhin à Kehl, pont des Arts et Métiers à Angers, chiffrés par la presse), soit 20 à 35 M€ pour un grand fleuve.
- Métro : Toulouse ligne C, 3 380 M€ pour 27 km et 21 stations ([commission d'enquête](https://www.haute-garonne.gouv.fr/content/download/31477/209671/file/Rapport%20d%C3%A9finitif.pdf), p. 23-33) ; Île-de-France M14 sud, 2 744 M€ pour 14 km ; Grand Paris Express, 125 à 295 M€ par km ([Cour des comptes, 2024](https://www.ccomptes.fr/sites/default/files/2024-04/20240425-S2024-0234-Societe-Grand-Paris_0.pdf), annexe 10). Une gare de prolongement parisien coûte 74 à 122 M€ selon les contre-expertises. Au métro B de Lyon, descendre la station Oullins de 5 m coûtait 10 M€ de plus.
- Tunnel au tunnelier : 65 M€ 2025 par km de génie civil seul, viaduc 32 M€ par km ([fiche de la Société du Grand Paris, 2021](https://www.enquetes-publiques.com/docs/EP21116/Fiche%20co%C3%BBts%20compar%C3%A9s%20GC%2022-07-2021.pdf), p. 2).
- Téléphérique : 11 à 42 M€ par km selon le Cerema ; Téléo 104 M€ pour 3 km ([commission d'enquête](https://www.haute-garonne.gouv.fr/contenu/telechargement/29843/200662/file/Rapport%20et%20conclusions%20enqu%C3%AAte%20TUS.pdf), p. 21).

`scripts/verifier-couts.ts` compare notre calcul à 34 de ces chantiers. Sur les 26 qui n'ont pas d'ouvrage particulier, l'écart médian est de 13 %. Les grands écarts restants viennent de ce que le calcul ne sait pas deviner : un tram mis en tunnel pour des raisons urbaines sur un terrain plat (Nice L2), le grand gabarit du Grand Paris Express, un téléphérique tricâble (Téléo).

## Ce que nous n'avons pas pu vérifier

- Aucune source officielle ne donne le coût d'une station de bus, d'une gare de téléphérique ou d'une gare aérienne de métro, ni la façon dont le coût d'une station varie avec la profondeur, en dehors du repère d'Oullins.
- Les coûts des ponts de tram ne viennent que de la presse.
- Le métro B à Saint-Genis-Laval n'a pas de source primaire.
- Le tunnel d'un bus et sa pente maximale sont nos estimations, comme le coût d'une station de tram ou de bus souterraine, tiré d'une seule note de consultant (30 à 60 M€).
- Les surcoûts du métro sous une colline reposent sur une seule estimation, celle de la ligne E.
