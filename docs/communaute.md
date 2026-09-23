# La communauté et les autres villes

Ce document décrit ce qui est prévu pour permettre aux joueurs de publier leurs réseaux, de les comparer et de jouer dans d'autres villes que Lyon. Les maquettes correspondantes sont sur la planche de design, pages « Communauté, téléphone », « Communauté, ordinateur » et « Communauté, la réflexion ». Le site sait déjà partager un réseau par lien, le reprendre et le comparer au sien. La communauté elle-même fonctionne aussi : publication depuis le bilan, réseaux populaires et récents, page de chaque réseau, soutiens, reprises, signalements et retrait par son auteur. Restent à faire la carte des envies, les réactions aux lignes, les défis et les autres villes.

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

Il n'y a ni compte ni mot de passe. Chaque navigateur tire au hasard une clé secrète qu'il garde, et la base n'en conserve qu'une empreinte. Cette clé suffit pour publier sous un pseudo, soutenir un réseau une seule fois et retirer ses propres réseaux. Elle ne suit pas le joueur d'un appareil à l'autre : un lien de récupération par e-mail pourra s'ajouter plus tard, si le besoin s'en fait sentir.

## Les autres villes

Deux niveaux, pour ouvrir vite sans rien inventer.

Le tracé libre fonctionne dans n'importe quelle ville française avec des données publiques : fond de carte et réseau actuel tirés d'OpenStreetMap, habitants par carreau de 200 m de l'INSEE, emplois du recensement répartis selon la base Sirene, prix au kilomètre des chantiers récents. Le joueur y dessine ses propres lignes dans un budget. Les chantiers déjà décidés apparaissent sur la carte et ne comptent pas dans ce budget.

Le catalogue ajoute les projets réels d'une ville, avec leurs coûts et leurs fréquentations sourcés, comme pour Lyon. Il demande un travail de recherche ville par ville.

Pour démarrer : Lyon avec son catalogue, et Paris, Marseille, Toulouse et Nice en tracé libre. `docs/villes.md` rassemble les réseaux, les projets et les budgets sourcés de ces quatre villes. Toulouse est ouverte en tracé libre depuis le 23 septembre 2026, Marseille, Nice et Paris depuis le 24 septembre.

Toutes les villes partagent la même formule de fréquentation, choisie par un moteur sur plus d'une centaine de lignes de près de trente villes françaises, chaque ville gardant son propre niveau (`docs/modele.md`).

Le budget d'une ville est l'investissement prévu par son autorité, moins les projets décidés déjà dessinés, les bus et les lignes existantes, selon la méthode de `docs/budgets.md`. Le jeu en montre le calcul et chaque source.

Paris est un cas à part : l'autorité est régionale (Île-de-France Mobilités) et le Grand Paris Express relève d'un autre maître d'ouvrage. Le jeu s'y limite à Paris et à la petite couronne, et compte les lignes 15 à 18 du Grand Paris Express comme existantes.

Toulouse a été ouverte en premier : Tisséo publie la fréquentation de chaque ligne, la formule s'y recale bien, et la ligne C, qui ouvre fin 2028, donne un vrai sujet de partie. On y joue depuis `/toulouse`, et ses réseaux publiés ont leur propre liste dans la communauté.

## Côté technique

La base est un projet Supabase dédié, « simulateur-transport », hébergé à Paris dans l'organisation gratuite TCL2040. Les tables et les règles d'accès sont dans `supabase/migrations/`. Le site lit directement les réseaux publiés et les pseudos, avec la clé publique déclarée dans `.env.example` et `netlify.toml`. Il n'écrit jamais lui-même : les règles d'accès refusent toute écriture venue du navigateur.

Toutes les écritures passent par la fonction serveur `communaute` (`supabase/functions/communaute/`). Elle reçoit la clé du navigateur, en calcule l'empreinte, puis publie, soutient, compte une reprise, enregistre un signalement ou retire un réseau. Avant de publier, elle relit la partie avec le code même du jeu (`lib/partie.ts`, `lib/regles.ts`, `lib/modele.ts`, copiés par `scripts/fonction-communaute.mjs`), recalcule les lignes tracées, le score, le coût et l'équilibre du budget, et refuse un réseau en déficit. Les compteurs de soutiens, de reprises et de signalements sont tenus par la base elle-même.

Pour recalculer les lignes, la fonction a besoin des habitants et des emplois par carreau. Ils sont rangés dans la table privée `modele`, déposés une seule fois par l'action `deposer`, qui n'accepte que les données exactes du modèle, reconnues par leur empreinte. Si ces données changent, il faut vider cette table, mettre à jour l'empreinte dans la fonction, la redéployer et redéposer les données.

Une modification de `lib/partie.ts`, `lib/regles.ts`, `lib/modele.ts` ou du catalogue doit être suivie de `node scripts/fonction-communaute.mjs`, puis d'un nouveau déploiement de la fonction, sinon le serveur et le jeu ne compteraient plus de la même façon.

Une partie porte sa ville : la forme compacte a un champ `w` (absent pour Lyon, pour que les liens et les réseaux publiés avant Toulouse restent lisibles), et la table `reseaux` une colonne `ville`, qui sert aux listes de la communauté. La fonction serveur recalcule chaque réseau avec les habitants, les emplois et le budget de sa ville. Elle garde les données de chaque ville dans la table `modele`, une ligne par ville, déposées une fois par l'action `deposer` avec la ville en paramètre et vérifiées par leur empreinte. Une ville ne peut être publiée que si la table `villes` la dit ouverte.

Chaque réseau publié a sa propre adresse, `/reseau/<identifiant>`, dont le titre et la description reprennent ceux du réseau pour l'aperçu sur les réseaux sociaux. L'image d'aperçu (`app/reseau/[id]/opengraph-image.tsx`) est dessinée à la demande : la carte du réseau en miniature, avec les mêmes tracés que les cartes de la communauté (`lib/miniature.ts`), son titre, son auteur et ses voyageurs. Elle utilise la police Figtree, rangée dans `assets/polices/` avec sa licence libre, parce que le moteur d'image ne lit que les fichiers TTF. Un réseau retiré ou masqué donne l'image générique du jeu.

Côté données, `scripts/build-data.mjs` doit être rendu paramétrable par ville (emprise, liste des communes de l'autorité organisatrice), pour produire les mêmes fichiers dans `public/data/<ville>/`.

## Ordre de réalisation proposé

1. Le partage par lien sans compte : un réseau encodé dans l'adresse, qu'on peut ouvrir, comparer et reprendre. C'est fait. Le bilan donne une adresse qui affiche le réseau, recalculé, chez n'importe qui. Le visiteur peut partir de ce réseau pour sa propre partie : les choix du premier mandat sont chargés tout de suite, ceux du second s'ajoutent quand ce mandat commence, et une confirmation protège une partie en cours. S'il a déjà une partie, il peut aussi la comparer au réseau reçu, cartes côte à côte.
2. Supabase : publication, fil « Populaires » et « Récents », soutiens, reprises, page d'un réseau. C'est fait, avec les signalements, le retrait d'un réseau par son auteur et l'image d'aperçu des liens. En ligne depuis le 23 septembre 2026.
3. Le tracé libre à Toulouse, pour valider la chaîne de données et le recalage de la formule. C'est fait.
4. La carte des envies et les réactions aux lignes.
5. Les défis.
6. Les trois autres villes. C'est fait : Marseille, Nice et Paris sont ouvertes en tracé libre, avec une formule de fréquentation commune.
