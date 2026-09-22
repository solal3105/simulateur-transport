# Simulateur Transport TCL Lyon

Un jeu d'arbitrage budgétaire sur les transports de la Métropole de Lyon. On dispose de deux mandats, 2026-2032 et 2032-2038, d'environ 2 000 M€ d'investissement par mandat, et d'un catalogue de 22 ouvrages réels dont le total dépasse de très loin ce que deux enveloppes permettent de payer. Le joueur inscrit chaque ouvrage sur une phase, ajuste les leviers de financement, et voit le réseau qu'il laisse en 2038.

Les coûts, les gains de fréquentation et les durées de chantier viennent de documents publics. Ce sont des estimations, pas des devis signés, et le produit le dit à l'écran.

## Ce que le simulateur contient

Le catalogue compte 22 ouvrages, du métro à la navette fluviale. Trois d'entre eux ont des variantes exclusives qui changent le coût, la fréquentation et la durée de chantier : la Ligne du Nord se fait en tram de surface, en tram enterré ou en métro ; la Ligne de l'Ouest en bus à haut niveau de service ou en tramway ; la Rive Droite pareillement. Le tramway de l'ouest peut être enterré en totalité pour 300 M€ de plus. Deux ouvrages dépendent d'un autre : le métro E vers Part-Dieu exige la section Bellecour, l'extension du tramway de l'ouest exige le tramway de l'ouest.

Les leviers de financement modifient l'enveloppe de chaque phase : gratuité totale ou ciblée, tarification sociale, métro de nuit, prix des abonnements et des tickets, versement mobilité, taux de TVA. Deux d'entre eux, le versement mobilité et la TVA, ne relèvent pas de la Métropole mais d'une loi nationale, et l'interface le signale par un pictogramme.

L'entretien du parc de bus et son électrification forment un poste distinct, réparti lui aussi entre les phases.

Chaque ouvrage porte une durée de chantier, ce qui donne une année de mise en service et un calendrier. Un chantier financé sur les deux mandats peut très bien n'ouvrir qu'après 2038, et le tableau le dit en orange.

## Stack

Next.js 15 en App Router, React 19, TypeScript strict, Tailwind CSS v4, MapLibre GL JS pour le plan en WebGL, Zustand pour l'état, Motion pour les animations. Le fond de carte vient de CARTO, gratuit et sans clé d'API, et il est repeint dans la palette du produit avant d'être remis à la carte.

## Lancer le projet

```bash
npm install
npm run dev
```

Le simulateur s'ouvre sur http://localhost:3000.

```bash
npm run build      # compilation de production
npm run typecheck  # vérification des types sans émission
npm run lint
```

## Où vivent les données

Tout le contenu métier tient dans trois fichiers :

- `lib/projects.ts` porte les ouvrages, leurs variantes, les programmes du parc de bus, les leviers de financement et les enveloppes. C'est le seul fichier à toucher pour changer un coût ou ajouter un projet.
- `lib/budget.ts` contient le calcul, sans aucune dépendance à React : répartition par phase, effet des leviers, bilan, années de mise en service.
- `lib/types.ts` décrit le modèle.

Les tracés sont des fichiers GeoJSON dans `public/geojson/`. Ils sont fusionnés en un seul jeu de données servi à la carte, avec pour chaque ouvrage une ancre de cartouche et une emprise :

```bash
node scripts/build-geo.mjs
```

À relancer après toute modification d'un tracé. La correspondance entre un identifiant d'ouvrage et son fichier se trouve en tête du script.

## Adapter à un autre réseau

Remplacez le contenu de `lib/projects.ts` par vos ouvrages et vos leviers, déposez vos tracés dans `public/geojson/`, déclarez-les dans `scripts/build-geo.mjs`, puis ajustez l'emprise de départ dans `components/plan/basemap.ts`. Le reste de l'interface suit les données.

## Design

Le système visuel est décrit dans `DESIGN.md`, la vérité produit dans `PRODUCT.md`.

## Licence

CC BY-NC 4.0. Voir `LICENSE`.
