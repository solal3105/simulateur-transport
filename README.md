# Simulateur Transport TCL

Un jeu pour comprendre l'arbitrage budgétaire des transports lyonnais. Le joueur dirige les transports de la Métropole de Lyon pendant deux mandats, de 2026 à 2038, avec 2 000 M€ par mandat. Il choisit parmi 22 projets réels de métro, de tram et de bus, trouve l'argent qui manque en jouant sur les tarifs, et peut tracer sa propre ligne. Son score est le nombre de voyageurs gagnés par jour.

Le jeu se joue aussi à Toulouse (`/toulouse`), en tracé libre : il n'y a pas encore de catalogue de projets, le joueur trace toutes ses lignes, avec 1 560 M€ par mandat (le budget de Lyon rapporté au nombre d'habitants) et une formule de fréquentation recalée sur les lignes de Tisséo. Les leviers de financement n'y sont pas encore calculés.

## Lancer le site

Il faut Node.js 20.9 ou plus récent.

```bash
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:3000. `npm run build` prépare la version de production, que Netlify publie à chaque envoi sur la branche principale.

## Les règles du jeu

Chaque mandat dispose de 2 000 M€, dont 400 M€ réservés d'office à l'entretien des bus. Un projet décidé au premier mandat peut être payé en une fois ou en deux, la seconde moitié étant alors prise sur le second mandat ; ce choix reste modifiable tant que le premier mandat n'est pas terminé. L'argent non dépensé au premier mandat passe au second. Les leviers de financement (tarifs, gratuité, TVA, versement mobilité) changent l'enveloppe de chaque mandat. Un mandat ne peut pas se terminer en déficit.

À la fin de la partie, le bilan donne un lien qui contient tout le réseau, sans compte ni serveur. Qui ouvre ce lien voit le réseau se construire, peut partir de ce réseau pour sa propre partie, ou le comparer à la sienne.

Le bilan permet aussi de publier son réseau dans la communauté, sous un pseudo et sans compte. Les réseaux publiés se consultent sur `/communaute`, chacun a sa page `/reseau/<identifiant>`, et chacun peut les soutenir, les signaler ou partir d'eux pour sa partie. La communauté repose sur Supabase ; son fonctionnement est décrit dans `docs/communaute.md`. Sans les deux réglages de `.env.example`, le jeu tourne sans elle.

Le score est le nombre de voyageurs gagnés par jour. Pour une ligne tracée par le joueur, seuls comptent les voyageurs qui vivent ou travaillent loin d'un tram ou d'un métro existant.

Sur la carte, chaque mode a sa couleur (métro, tramway, bus rapide, téléphérique, bateau), une modernisation prend la couleur de la ligne modernisée, et le réseau actuel reste en gris. Les couleurs sont définies dans `lib/couleurs.ts`.

## Organisation du code

`app/` contient la page et le style global. `components/` contient l'interface : la carte (`carte/`), l'écran de jeu (`partie/`), les panneaux qui s'ouvrent au-dessus de la carte (`panneaux/`) et les écrans d'accueil, de fin de mandat et de bilan (`ecrans/`). `lib/` contient la logique sans interface : le catalogue des projets, les règles de budget, le modèle de fréquentation des lignes tracées, l'état de la partie, la lecture d'une partie partagée ou publiée, l'accès à la communauté et le dessin de l'image de partage. `components/communaute/` contient les pages de la communauté, et `supabase/` la base et la fonction serveur qui en garde l'entrée.

## Les données

Les chiffres des projets (coût, voyageurs, durée de chantier) sont dans `lib/catalogue.ts`. Les tracés sont dans `data/projets/`.

Le fond de carte ne dépend d'aucun service extérieur. `scripts/fetch-osm.mjs` télécharge depuis OpenStreetMap le Rhône et la Saône, les parcs, les plans d'eau, les grands axes, les voies ferrées, les limites de communes, les noms de quartiers et les lignes de métro et de tram actuelles, puis `npm run data` prépare les fichiers servis au navigateur dans `public/data/`. Les noms de quartiers servent aussi à nommer les arrêts des lignes tracées par le joueur (`lib/lieux.ts`). Les habitants et les emplois par carreau de 200 m viennent de l'INSEE ; leurs sources sont détaillées dans `data/insee/SOURCES.md`.

Le prix et la fréquentation d'une ligne tracée par le joueur sont calculés dans `lib/modele.ts`. Le commentaire en tête du fichier explique la formule, son calage sur les lignes lyonnaises existantes et ses limites.

## Ouvrir une autre ville

Tout ce qui change d'une ville à l'autre est décrit dans `lib/villes.ts` : la carte, le budget, le réglage de la formule de fréquentation et quelques repères pour les textes. Les données d'une ville vont dans `public/data/<ville>/` : le fond de carte et les arrêts par `scripts/fetch-osm.mjs` et `scripts/build-data.mjs` (avec le nom de la ville en argument), les habitants et les emplois par `scripts/carreaux-ville.py`. `data/toulouse/SOURCES.md` montre ce qu'il a fallu pour Toulouse, et `docs/villes.md` rassemble les recherches sur Marseille, Nice et Paris. Côté communauté, la ville doit être ouverte dans la table `villes` et ses données déposées pour la fonction serveur (voir `docs/communaute.md`).

## Licence

CC BY-NC 4.0. Voir `LICENSE`.
