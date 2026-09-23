# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router), React 19, TypeScript 6, Tailwind CSS 4, MapLibre GL JS 6 pour la carte, Zustand pour l'état, Motion pour les animations. Le fond de carte est construit à partir d'OpenStreetMap et des carreaux INSEE, sans service extérieur. Refonte complète de septembre 2026, repartie de zéro.

## Users

Des habitantes et habitants de la Métropole de Lyon, sans expertise en transport ni en finances publiques, qui veulent comprendre pourquoi tel projet de métro ou de tramway n'avance pas. Ils arrivent souvent depuis un lien partagé sur les réseaux sociaux, majoritairement sur téléphone, et restent quelques minutes. Un second public plus restreint, composé de journalistes locaux, d'élus et de militants associatifs, s'en sert comme support d'argumentation.

## Product Purpose

Le simulateur transforme l'arbitrage budgétaire des transports lyonnais en un jeu jouable en quelques minutes. On dispose de deux mandats, 2026-2032 et 2032-2038, d'environ 2 000 M€ de capacité d'investissement par mandat, d'un catalogue de projets réels avec leur coût et leur gain de fréquentation, et de leviers de financement qui font bouger cette enveloppe. Le joueur réussit quand il comprend, en le vivant, qu'on ne peut pas tout financer, et que chaque choix de tarif ou de gratuité se paie en kilomètres de ligne non construits.

## Positioning

Les chiffres viennent de documents publics réels sur le réseau TCL : coûts d'investissement, gains de fréquentation estimés, durées de chantier. Le simulateur ne produit pas un avis, il produit une contrainte, et laisse chacun arriver à sa propre conclusion. C'est ce qu'un éditorial ou une infographie ne peuvent pas faire.

## Operating Context

L'usage type est mobile, debout, en une seule session, sans compte et sans sauvegarde côté serveur. L'état de la simulation persiste dans le navigateur pour qu'un retour sur la page ne réduise pas les choix à néant. La lecture se fait d'abord sur la carte : les tracés des projets sont des données GeoJSON réelles superposées à la Métropole. Le simulateur doit rester adaptable à un autre réseau urbain en ne touchant qu'aux fichiers de données.

## Capabilities and Constraints

Le catalogue compte 22 projets. Chacun porte un coût en millions d'euros et un gain de fréquentation en voyageurs par jour. Trois familles de règles s'appliquent :

- Un projet est affecté à un mandat, au second, ou étalé sur les deux, auquel cas son coût se partage à parts égales et son gain de fréquentation compte en entier.
- Certains projets ont des variantes exclusives qui changent le coût, le gain et la durée de chantier : la Ligne du Nord se fait en tram de surface, en tram enterré ou en métro ; la Ligne de l'Ouest en BHNS ou en tram ; la Rive Droite en BHNS ou en tram ; le TEOL peut passer en version complètement enterrée pour 300 M€ de plus.
- Deux projets dépendent d'un autre : l'extension du métro E vers Part-Dieu exige la section Bellecour, l'extension du TEOL à Craponne exige le TEOL.

Les leviers de financement modifient la capacité annuelle de chaque mandat. La gratuité totale coûte 1 925 M€ par mandat et annule toute recette tarifaire ; la gratuité des moins de 25 ans coûte 240 M€ ; la gratuité des 11-18 ans enfants d'abonnés 48 M€ ; le métro ouvert la nuit le week-end 24 M€ ; supprimer la tarification sociale rapporte 240 M€ ; chaque point de hausse du prix des abonnements rapporte 12 M€ et chaque point sur les tickets 8 M€ ; chaque point de versement mobilité vaut 28 M€ ; la TVA ramenée à 5,5 % rapporte 96 M€. Deux de ces leviers, le versement mobilité et la TVA, ne relèvent pas de la Métropole mais d'une loi nationale, et l'interface doit le dire.

L'offre bus est un poste distinct : l'entretien et le renouvellement de la flotte coûtent 800 M€ au total et l'électrification 460 M€, tous deux répartissables entre les mandats.

Chaque projet porte une durée de chantier, de 1 à 30 ans, qui permet d'afficher une année de mise en service et une frise.

La simulation est valide quand les deux mandats restent à l'équilibre ou en excédent.

Les programmes préchargés des listes candidates, présents dans la version précédente, sont retirés : les élections métropolitaines de mars 2026 ont eu lieu, la comparaison de programmes n'a plus d'objet.

## Brand Commitments

Le produit s'appelle le Simulateur Transport TCL Lyon et appartient à la famille des projets de veille citoyenne de Solal Gendrin sur les mobilités lyonnaises. Licence CC BY-NC 4.0. Les logos existants sont dans public/. Le ton s'adresse à un adulte intelligent qui n'est pas spécialiste : des phrases entières, pas de jargon interne, pas de slogan, et jamais une promesse que le produit ne tient pas.

## Evidence on Hand

Les tracés réels de 22 projets en GeoJSON dans public/geojson/. Les coûts, gains de fréquentation et durées de chantier consolidés dans les données du dépôt. Aucun témoignage, aucun chiffre de fréquentation du site, aucune validation institutionnelle : rien de tel ne doit être inventé à l'écran.

## Product Principles

1. La contrainte est le message. Tout ce que l'interface montre doit ramener le joueur à l'arbitrage : ce qu'il vient de gagner, ce qu'il vient de renoncer à faire.
2. La carte avant le tableau. On comprend un réseau en le voyant, pas en lisant une liste de lignes budgétaires.
3. Chaque chiffre affiché est vérifiable ou n'est pas affiché. Les estimations sont annoncées comme telles.
4. Jouable en trois minutes sur un téléphone dans le métro, approfondissable en vingt sur un ordinateur.
5. Neutre sur le fond, exigeant sur la forme : le simulateur ne dit pas quoi penser, il rend le choix coûteux.

## Accessibility & Inclusion

Le public est grand public et majoritairement mobile. Contraste suffisant en plein soleil, cibles tactiles confortables, navigation au clavier fonctionnelle, et aucune information portée par la seule couleur, notamment sur la carte où la sélection doit rester lisible pour un daltonien.
