# La communauté et les autres villes

Ce document décrit ce qui est prévu pour permettre aux joueurs de publier leurs réseaux, de les comparer et de jouer dans d'autres villes que Lyon. Les maquettes correspondantes sont sur la planche de design, pages « Communauté, téléphone », « Communauté, ordinateur » et « Communauté, la réflexion ». Seul le partage d'un réseau par lien est déjà construit dans le site ; le reste est à faire.

## Le principe : le jeu reste le jeu

La communauté est un espace à part, qu'on rejoint quand on le souhaite. Elle ne touche le jeu qu'à trois endroits :

1. L'accueil propose de choisir sa ville et donne un lien vers les réseaux publiés.
2. Le bilan propose de publier son réseau, à côté du partage d'image qui existe déjà.
3. Une ligne tracée par le joueur peut être proposée sur la carte des envies au moment de la publication.

Pendant une partie, rien ne change : pas de fil, pas de notification, pas de compteur social.

## Ce qu'on partage

Deux objets seulement. Un réseau est le résultat complet d'une partie : les projets retenus, les lignes tracées, les choix de financement, le score et le coût. Une ligne est un tracé dessiné par un joueur, avec son mode, ses arrêts, son prix et son estimation de voyageurs.

## Les mécaniques retenues

- On peut soutenir un réseau, une fois par personne : ce sont les soutiens qui classent les réseaux populaires.
- On peut reprendre un réseau : il se charge dans le jeu comme point de départ, avec la mention « inspiré de ». C’est la mécanique qui fait circuler les idées et donne envie de publier.
- On peut comparer un réseau publié au sien, avec les deux cartes côte à côte, les voyageurs, le coût, le rendement et les projets en commun.
- On réagit à une ligne tracée avec trois réponses prédéfinies : « Je la prendrais », « Trop chère », « Déjà desservi ». Sans texte libre, il n’y a rien à modérer.
- Chaque mois, un défi pose une contrainte et ouvre un classement de quelques semaines, et la communauté vote pour le défi suivant.
- La carte des envies montre ce que la communauté construit le plus, projet par projet et couloir par couloir. Elle se télécharge en une page pour les élus.
- Chaque joueur a un profil léger : un pseudo, un quartier s’il le souhaite, ses réseaux publiés, les soutiens et les reprises qu’il a reçus.

## Ce qui est volontairement écarté au départ

- Les commentaires libres : ils demandent une modération humaine continue.
- Les abonnements entre joueurs et un fil personnalisé : trop tôt pour la taille de la communauté.
- Un classement général permanent : il pousse à chercher la faille plutôt qu'à réfléchir. Les classements n'existent que dans les défis, sur une durée limitée.

## Garde-fous

Les textes libres sont courts : 30 caractères pour le pseudo, 60 pour le titre, 200 pour la phrase d'intention. Un filtre de mots bloque les injures à la publication. Au troisième signalement, un réseau est masqué en attendant une vérification.

Le score, le coût et l'équilibre du budget ne viennent jamais du navigateur. La publication passe par une fonction côté serveur qui recalcule tout à partir des choix de la partie ; un réseau truqué ne peut donc pas apparaître au classement.

Il n'y a pas de mot de passe. La connexion anonyme de Supabase suffit pour publier sous un pseudo ; une adresse e-mail facultative permet de recevoir un lien magique pour retrouver ses réseaux sur un autre appareil. L'adresse n'est jamais affichée.

## Les autres villes

Deux niveaux, pour ouvrir vite sans rien inventer.

Le tracé libre fonctionne dans n'importe quelle ville française avec des données publiques : fond de carte et réseau actuel tirés d'OpenStreetMap, habitants par carreau de 200 m de l'INSEE, emplois du recensement répartis selon la base Sirene, prix au kilomètre des chantiers récents. Le joueur y dessine ses propres lignes dans un budget. Les chantiers déjà décidés apparaissent sur la carte et ne comptent pas dans ce budget.

Le catalogue ajoute les projets réels d'une ville, avec leurs coûts et leurs fréquentations sourcés, comme pour Lyon. Il demande un travail de recherche ville par ville.

Pour démarrer : Lyon avec son catalogue, et Paris, Marseille, Toulouse et Nice en tracé libre. `docs/villes.md` rassemble les réseaux, les projets et les budgets sourcés de ces quatre villes, et le détail des vérifications ci-dessous.

La formule de fréquentation doit être recalée dans chaque ville. Telle quelle, elle tombe juste pour le tram L1 de Nice, mais elle sous-estime les lignes de Toulouse d'un tiers et surestime le métro de Marseille de 60 à 85 %. Recalée sur les métros A et B et le tram T1, elle prédit chaque ligne toulousaine à moins de 25 % près à partir des deux autres, comme à Lyon. Elle ne sait pas estimer un téléphérique, ni à Toulouse ni à Lyon.

Le budget d'une ville vient de son objectif d'investissement publié quand il existe (300 M€ par an à Marseille), sinon de celui de Lyon rapporté au nombre d'habitants (1 560 M€ par mandat à Toulouse, 790 à Nice). L'écran dit toujours d'où vient le chiffre.

Paris est un cas à part : l'autorité est régionale (Île-de-France Mobilités), le Grand Paris Express relève d'un autre maître d'ouvrage, et les montants sont d'un autre ordre. Le budget et le périmètre de jeu devront être choisis avec soin.

Toulouse est la ville à ouvrir en premier : Tisséo publie la fréquentation de chaque ligne, la formule s'y recale bien, et la ligne C, qui ouvre fin 2028, donne un vrai sujet de partie. Les maquettes « Toulouse en tracé libre » et « Notre calcul à Toulouse » en montrent le résultat, avec des chiffres calculés sur les données toulousaines.

## Côté technique

Le schéma de base de données est dans `supabase/schema.sql` : villes, profils, réseaux, lignes, soutiens, réactions, signalements et défis, avec les règles d'accès (chacun lit ce qui est public et n'écrit que ce qui est à lui) et une vue pour la carte des envies.

Il restera à écrire la fonction de publication, qui reprendra les règles de `lib/regles.ts` et le modèle de `lib/modele.ts` pour recalculer le score. Chaque réseau publié aura sa propre adresse (par exemple `/r/<identifiant>`) avec une image d'aperçu générée à partir de sa carte, pour que les liens partagés sur les réseaux sociaux s'affichent bien.

Côté données, `scripts/build-data.mjs` doit être rendu paramétrable par ville (emprise, liste des communes de l'autorité organisatrice), pour produire les mêmes fichiers dans `public/data/<ville>/`.

## Ordre de réalisation proposé

1. Le partage par lien sans compte : un réseau encodé dans l'adresse, qu'on peut ouvrir, comparer et reprendre. L'ouverture est faite : le bilan donne une adresse qui affiche le réseau, recalculé, chez n'importe qui. Il reste la comparaison et la reprise.
2. Supabase : publication, fil « Populaires » et « Récents », soutiens, reprises, page d'un réseau.
3. Le tracé libre à Toulouse, pour valider la chaîne de données et le recalage de la formule.
4. La carte des envies et les réactions aux lignes.
5. Les défis.
6. Les trois autres villes.
