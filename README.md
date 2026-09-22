# Simulateur Transport TCL

Un jeu pour comprendre l'arbitrage budgétaire des transports lyonnais. Le joueur dirige les transports de la Métropole de Lyon pendant deux mandats, de 2026 à 2038, avec 2 000 M€ par mandat. Il choisit parmi 22 projets réels de métro, de tram et de bus, trouve l'argent qui manque en jouant sur les tarifs, et peut tracer sa propre ligne. Son score est le nombre de voyageurs gagnés par jour.

## Lancer le site

Il faut Node.js 20.9 ou plus récent.

```bash
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:3000. `npm run build` prépare la version de production, que Netlify publie à chaque envoi sur la branche principale.

## Les règles du jeu

Chaque mandat dispose de 2 000 M€, dont 400 M€ réservés d'office à l'entretien des bus. Un projet décidé au premier mandat peut être payé en une fois ou en deux, la seconde moitié étant alors prise sur le second mandat ; ce choix reste modifiable tant que le premier mandat n'est pas terminé. L'argent non dépensé au premier mandat passe au second. Les leviers de financement (tarifs, gratuité, TVA, versement mobilité) changent l'enveloppe de chaque mandat. Un mandat ne peut pas se terminer en déficit.

Le score est le nombre de voyageurs gagnés par jour. Pour une ligne tracée par le joueur, seuls comptent les voyageurs qui vivent ou travaillent loin d'un tram ou d'un métro existant.

Sur la carte, chaque mode a sa couleur (métro, tramway, bus rapide, téléphérique, bateau), une modernisation prend la couleur de la ligne modernisée, et le réseau actuel reste en gris. Les couleurs sont définies dans `lib/couleurs.ts`.

## Organisation du code

`app/` contient la page et le style global. `components/` contient l'interface : la carte (`carte/`), l'écran de jeu (`partie/`), les panneaux qui s'ouvrent au-dessus de la carte (`panneaux/`) et les écrans d'accueil, de fin de mandat et de bilan (`ecrans/`). `lib/` contient la logique sans interface : le catalogue des projets, les règles de budget, le modèle de fréquentation des lignes tracées, l'état de la partie et le dessin de l'image de partage.

## Les données

Les chiffres des projets (coût, voyageurs, durée de chantier) sont dans `lib/catalogue.ts`. Les tracés sont dans `data/projets/`.

Le fond de carte ne dépend d'aucun service extérieur. `scripts/fetch-osm.mjs` télécharge depuis OpenStreetMap le Rhône et la Saône, les parcs, les plans d'eau, les grands axes, les voies ferrées, les limites de communes, les noms de quartiers et les lignes de métro et de tram actuelles, puis `npm run data` prépare les fichiers servis au navigateur dans `public/data/`. Les noms de quartiers servent aussi à nommer les arrêts des lignes tracées par le joueur (`lib/lieux.ts`). Les habitants et les emplois par carreau de 200 m viennent de l'INSEE ; leurs sources sont détaillées dans `data/insee/SOURCES.md`.

Le prix et la fréquentation d'une ligne tracée par le joueur sont calculés dans `lib/modele.ts`. Le commentaire en tête du fichier explique la formule, son calage sur les lignes lyonnaises existantes et ses limites.

## Adapter le simulateur à un autre réseau

Il suffit de remplacer le catalogue, les tracés, les extractions OpenStreetMap et les carreaux INSEE, puis de recaler le modèle de fréquentation sur les lignes du nouveau réseau.

## Licence

CC BY-NC 4.0. Voir `LICENSE`.
