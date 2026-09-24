# Mettre en ligne cette version

Cette version ouvre trois réseaux (Aix-Marseille-Provence, Lignes d'Azur, Île-de-France Mobilités sur toute la région), change la formule de fréquentation, donne à chaque réseau son budget, ses leviers et ses couleurs, et ajoute le jeu libre. Le site et la base doivent changer ensemble, dans cet ordre : le nouveau site lit une colonne que l'ancienne base n'a pas, et l'ancienne fonction serveur ne connaît ni le jeu libre ni les nouveaux réseaux.

La base est le projet Supabase « simulateur-transport » (organisation TCL2040), partagé par le site en ligne, les préversions et le développement local.

1. Appliquer les deux migrations, dans l'ordre de leur nom. Elles ne font qu'ajouter : le site actuel continue de fonctionner après elles.
   - `20260924080000_marseille_nice_idf.sql` ouvre les trois réseaux à la publication.
   - `20260924090000_jeu_libre.sql` ajoute la colonne `libre` et refait les deux index des listes.
2. Déployer la fonction `communaute` telle qu'elle est dans `supabase/functions/communaute/` (ses modules sont déjà recopiés par `node scripts/fonction-communaute.mjs`). Elle contient l'empreinte des nouvelles données franciliennes.
3. Déposer les données du modèle des trois réseaux, une fois chacun :

   ```sh
   node scripts/deposer-modele.mjs marseille
   node scripts/deposer-modele.mjs nice
   node scripts/deposer-modele.mjs idf
   ```

   Chaque appel doit répondre `200 {"ok":true}`. Les données de l'Île-de-France pèsent environ 2 Mo.

4. Recalculer les réseaux déjà publiés avec la nouvelle formule : exporter `select id, partie from public.reseaux` en JSON, lancer `node_modules/.bin/jiti scripts/recalculer-publies.ts reseaux.json`, relire les requêtes qu'il écrit, puis les exécuter. Au 24 septembre 2026, seul le réseau `7974ad6f-28a1-4bdf-b177-2641aa476eeb`, qui contient une ligne de métro tracée, change : de 243 100 à 235 900 voyageurs par jour. Avec le budget lyonnais ramené à 1 940 M€ par mandat, ce même réseau, publié quand Lyon avait 2 000 M€, passe en déficit de 110 M€ (35 M€ au premier mandat, 75 M€ au second) : sa page l'affichera, puisqu'elle recalcule tout avec les règles actuelles.
5. Pousser la branche, ouvrir la demande de fusion vers `main`, et vérifier la préversion Netlify : les cinq accueils, la page « Comment nous calculons le budget et les voyageurs » de chacun, une partie avec le vrai budget et une en jeu libre, les leviers d'un réseau autre que Lyon, la liste « Jeu libre » de la communauté.
6. Tester une publication depuis la préversion en jeu libre, en visibilité « lien », puis la retirer et supprimer le profil de test : la base est la même que celle du site en ligne.
7. Fusionner, sans fusion automatique. Netlify publie `main` en quelques minutes.

Avant la fusion, `npm run build`, `npm run lint`, `npm run typecheck` et `npm run budgets -- --liens` doivent passer.
