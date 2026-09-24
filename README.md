# Simulateur transport

Un jeu pour comprendre l'arbitrage budgétaire des transports publics, né à Lyon sous le nom de Simulateur TCL. Le joueur dirige les transports de la Métropole de Lyon pendant deux mandats, de 2026 à 2038, avec 1 940 M€ par mandat. Il choisit parmi 22 projets réels de métro, de tram et de bus, trouve l'argent qui manque en jouant sur les tarifs, et peut tracer sa propre ligne. Son score est le nombre de voyageurs gagnés par jour.

Le jeu se joue sur cinq réseaux, chacun sur le territoire de son autorité organisatrice et dans ses couleurs : TCL (Métropole de Lyon, `/`), Tisséo (agglomération toulousaine, `/toulouse`), Aix-Marseille-Provence (`/marseille`), Lignes d'Azur (métropole Nice Côte d'Azur, `/nice`) et Île-de-France Mobilités (toute l'Île-de-France, `/ile-de-france`). Hors de Lyon, il n'y a pas encore de catalogue de projets : le joueur trace toutes ses lignes. Son budget est l'investissement prévu, moins ce que demandent les projets déjà décidés, les bus et les lignes existantes, avec une source pour chaque chiffre, et ses leviers de financement sont calculés à partir des recettes réelles de son réseau : voir `docs/budgets.md`.

Chaque réseau a une page qui explique simplement ces calculs, sans commencer de partie (`/methode`, `/toulouse/methode`, etc.). Elle invite aussi à écrire si un chiffre doit être corrigé ; l'adresse n'est assemblée qu'au clic, pour la cacher aux robots.

En commençant une partie, le joueur choisit entre le vrai budget et le jeu libre, sans limite de budget : il trace alors le réseau dont il rêve, et le bilan compare son coût au budget réel. Un réseau fait en jeu libre peut être publié, marqué comme tel et listé à part.

Les voyageurs d'une ligne tracée viennent d'une formule choisie par un moteur parmi des dizaines de milliers, calées sur plus d'une centaine de lignes de près de trente villes françaises : voir `docs/modele.md`.

## Lancer le site

Il faut Node.js 20.9 ou plus récent.

```bash
npm install
npm run dev
```

Le site s'ouvre sur http://localhost:3000. `npm run build` prépare la version de production, que Netlify publie à chaque envoi sur la branche principale.

## Les règles du jeu

Le budget de chaque mandat vient de `lib/budgets/<réseau>.ts`, avec ses sources : à Lyon, 1 940 M€ par mandat, ce que Sytral Mobilités a investi de 2021 à 2025, dont 400 M€ réservés d'office au renouvellement des bus. Un projet décidé au premier mandat peut être payé en une fois ou en deux, la seconde moitié étant alors prise sur le second mandat ; ce choix reste modifiable tant que le premier mandat n'est pas terminé. L'argent non dépensé au premier mandat passe au second. Les leviers de financement (tarifs, gratuité, TVA, versement mobilité) changent l'enveloppe de chaque mandat. Un mandat ne peut pas se terminer en déficit, sauf en jeu libre, qui n'a qu'une étape de 2026 à 2038 et pas de budget à tenir.

À la fin de la partie, le bilan donne un lien qui contient tout le réseau, sans compte ni serveur. Qui ouvre ce lien voit le réseau se construire, peut partir de ce réseau pour sa propre partie, ou le comparer à la sienne.

Le bilan permet aussi de publier son réseau dans la communauté, sous un pseudo et sans compte. Les réseaux publiés se consultent sur `/communaute`, chacun a sa page `/reseau/<identifiant>`, et chacun peut les soutenir, les signaler ou partir d'eux pour sa partie. La communauté repose sur Supabase ; son fonctionnement est décrit dans `docs/communaute.md`. Sans les deux réglages de `.env.example`, le jeu tourne sans elle.

Le score est le nombre de voyageurs gagnés par jour. Pour une ligne tracée par le joueur, seuls comptent les voyageurs qui vivent ou travaillent loin d'un tram ou d'un métro existant.

Sur la carte, chaque mode a sa couleur (métro, tramway, bus rapide, téléphérique, bateau), une modernisation prend la couleur de la ligne modernisée, et le réseau actuel reste en gris. Les couleurs sont définies dans `lib/couleurs.ts`.

## Organisation du code

`app/` contient la page et le style global. `components/` contient l'interface : la carte (`carte/`), l'écran de jeu (`partie/`), les panneaux qui s'ouvrent au-dessus de la carte (`panneaux/`) et les écrans d'accueil, de fin de mandat et de bilan (`ecrans/`). `lib/` contient la logique sans interface : le catalogue des projets, les règles de budget, le modèle de fréquentation des lignes tracées, l'état de la partie, la lecture d'une partie partagée ou publiée, l'accès à la communauté et le dessin de l'image de partage. `components/communaute/` contient les pages de la communauté, et `supabase/` la base et la fonction serveur qui en garde l'entrée.

## Les données

Les chiffres des projets (coût, voyageurs, durée de chantier) sont dans `lib/catalogue.ts`. Les tracés sont dans `data/projets/`.

Le fond de carte ne dépend d'aucun service extérieur. `scripts/fetch-osm.mjs` télécharge depuis OpenStreetMap le Rhône et la Saône, les parcs, les plans d'eau, les grands axes, les voies ferrées, les limites de communes, les noms de quartiers et les lignes de métro et de tram actuelles, puis `npm run data` prépare les fichiers servis au navigateur dans `public/data/`. Les noms de quartiers servent aussi à nommer les arrêts des lignes tracées par le joueur (`lib/lieux.ts`). Les habitants et les emplois par carreau de 200 m viennent de l'INSEE ; leurs sources sont détaillées dans `data/insee/SOURCES.md`.

Le prix et la fréquentation d'une ligne tracée par le joueur sont calculés dans `lib/modele.ts`, avec la formule de `lib/formule.ts`, écrite par le moteur de fréquentation. `docs/modele.md` explique comment cette formule a été choisie, ce qu'elle vaut ligne par ligne et comment la recalculer.

## Ouvrir un autre réseau

Tout ce qui change d'un réseau à l'autre est décrit dans `lib/villes.ts` : son nom, son territoire, ses couleurs, la carte, le centre d'où se mesure la distance au centre, et quelques repères pour les textes. Son budget et ses leviers de financement sont dans `lib/budgets/<réseau>.ts`, établis et contrôlés selon `docs/budgets.md`. La constante de la formule de fréquentation de chaque ville est dans `lib/formule.ts`. Les données d'une ville vont dans `public/data/<ville>/` : le fond de carte et les arrêts par `scripts/fetch-osm.mjs` et `scripts/build-data.mjs` (avec le nom de la ville en argument), les habitants et les emplois par `scripts/carreaux-ville.py`. `data/<ville>/SOURCES.md` décrit les données de chaque ville, et `docs/villes.md` rassemble les recherches sur les réseaux, les projets et les budgets. Côté communauté, la ville doit être ouverte dans la table `villes` et ses données déposées pour la fonction serveur (voir `docs/communaute.md`).

## Licence

CC BY-NC 4.0. Voir `LICENSE`.
