# Le budget de chaque ville

Tous les réseaux calculent le budget du joueur de la même façon, et le détaillent de la même façon. Chaque réseau a son fichier dans `lib/budgets/<réseau>.ts`, qui suit le type `BudgetVille` de `lib/budget.ts` : quatre postes, chacun avec ses montants pour les deux mandats, une phrase simple, le détail du calcul et ses sources, puis les leviers de financement, ce que nous n'avons pas pu vérifier et le mois du relevé. Le jeu en tire tout le reste sans rien écrire à la main : la jauge du mandat, l'accueil, la fin de mandat, l'écran « Trouver de l'argent », l'écran « Comment nous calculons votre budget » de la partie, et la page publique qui explique le budget et les voyageurs de chaque réseau (`/methode`, `/toulouse/methode`, etc.).

Les phrases simples sont ce que le joueur lit d'abord : une phrase courte par poste, avec un ou deux chiffres, que tout le monde comprend. Le détail et les sources sont repliés sous un bouton, pour qui veut vérifier.

## La méthode

Le calcul part de l'investissement prévu et en retire, dans l'ordre, trois postes. Ce qui reste est le budget du joueur pour ses lignes, et il doit être positif à chaque mandat.

1. L'investissement prévu (`total`) est ce que l'autorité organisatrice, et les autres financeurs quand ils paient des lignes du territoire, investiront dans les transports publics du territoire du jeu pendant chaque mandat de six ans, 2026-2032 puis 2032-2038, projets décidés compris.
2. Les projets décidés (`decides`) sont ce qui reste à payer, mandat par mandat, sur les projets décidés que la carte dessine comme des lignes existantes, et sur ceux que le joueur ne peut pas construire lui-même, comme les chantiers de RER et de trains (Eole en Île-de-France). Un projet décidé de tram, de métro ou de bus qui n'est pas dessiné reste dans le budget du joueur, qui peut le tracer lui-même : c'est le cas de la ligne 5 à Nice, du prolongement du T1 et du T8 sud en Île-de-France.
3. Les bus (`bus`) couvrent le renouvellement du parc et des dépôts. L'entretien courant, payé par l'exploitant dans son contrat, n'est pas un investissement et n'y entre pas.
4. Les lignes existantes (`lignes`) couvrent le renouvellement des rames, des voies et des équipements, la modernisation et l'accessibilité. Une opération qui augmente la capacité d'une ligne, comme un doublement, reste dans la part du joueur quand elle n'est pas décidée.

Quelques règles valent partout :

- Les montants sont en millions d'euros courants, arrondis à la dizaine ou à la centaine selon la taille du réseau.
- Quand l'autorité couvre un territoire plus large que celui du jeu, on garde ce qui est dépensé dans le territoire quand on le sait, et sinon une part proportionnelle au nombre d'habitants du recensement.
- Au-delà de la période couverte par les documents, on prolonge le rythme observé, et l'explication le dit.
- Chaque chiffre d'une explication vient d'une source citée, ou se présente comme notre estimation.
- On préfère, dans l'ordre, les budgets votés et les comptes, les programmes pluriannuels, les prospectus obligataires et les analyses de notation, les rapports d'orientation budgétaire, puis les rapports des chambres régionales des comptes. La presse ne sert qu'en dernier recours, et la liste des limites le signale.

Lyon garde les montants du jeu depuis sa première version, 2 000 M€ par mandat dont 400 M€ pour les bus, désormais sourcés : c'est à peu près ce que Sytral Mobilités a investi de 2021 à 2025, et ce qu'il peut investir sans s'endetter davantage. Sytral a programmé davantage pour 2026-2031, en empruntant ; le fichier de Lyon le dit, avec ce que le jeu ne compte pas, comme l'entretien du réseau existant.

## Les leviers de financement

Chaque réseau propose les mêmes leviers, calculés à partir de ses propres recettes, sur un mandat de six ans et sans baisse de fréquentation quand les prix montent :

- Une hausse de 1 % du prix des abonnements rapporte 1 % des recettes d'abonnements, et de même pour les tickets.
- Une hausse de 1 % du versement mobilité rapporte 1 % de son produit ; au-delà du taux maximal, il faut une loi.
- La gratuité totale coûte toutes les recettes tarifaires, et la gratuité des moins de 25 ans ce qu'ils paient aujourd'hui.
- La suppression des tarifs sociaux rapporte la différence entre ce que paient leurs bénéficiaires et le plein tarif.
- Le service de nuit le week-end coûte ce que coûtent les heures de métro ou de tram en plus, d'après une étude publiée ou le coût d'exploitation du réseau.
- La TVA à 5,5 % au lieu de 10 % laisse au réseau la différence sur ce que paient les voyageurs.

Les montants vont dans le champ `leviers` du fichier du réseau, avec leurs sources. Une mesure qu'on ne sait pas chiffrer pour un réseau est simplement absente : le jeu ne la propose pas. Un réseau sans leviers sourcés n'a pas de bouton « Trouver de l'argent ».

## Ajouter une ville

1. Lancer la recherche avec la fiche ci-dessous, en y mettant le nom de l'autorité, le territoire du jeu, les chiffres déjà connus et les lignes que la carte compte comme existantes.
2. Écrire `lib/budgets/<ville>.ts` sur le modèle des villes existantes, puis le brancher dans `lib/villes.ts` avec `budget: <ville>`. Le compilateur refuse une ville sans budget.
3. Lancer le contrôle, qui refuse un montant sans explication ou sans source, une adresse qui n'est pas en https, un tiret long, ou une part réservée plus grande que l'enveloppe. L'option `--liens` ouvre chaque adresse et signale celles qui ne répondent pas :

   ```sh
   npm run budgets -- --liens
   ```

4. Recopier les modules dans la fonction serveur avec `node scripts/fonction-communaute.mjs`, puis la redéployer : elle recalcule l'équilibre des réseaux publiés avec ce budget.

Si une adresse officielle refuse les liens directs, comme celles des PDF d'Île-de-France Mobilités, on cite la même pièce sur la plateforme qui la sert, et un commentaire le dit dans le fichier de la ville.

## La fiche de recherche

La recherche d'une nouvelle ville part de ce texte, complété entre crochets :

> Tu fais une recherche documentaire pour un jeu citoyen sur les transports publics (le « Simulateur transport »), dans lequel le joueur dirige les investissements de transport de [autorité organisatrice] sur [territoire du jeu] pendant deux mandats de six ans (2026-2032 et 2032-2038). Le budget du joueur est l'investissement prévu, moins ce qui reste à payer sur les projets décidés que la carte dessine comme existants ([liste des lignes dessinées]), moins le renouvellement des bus et des lignes existantes.
>
> Donne, avec une source officielle pour chaque chiffre (adresse et page du PDF) :
>
> 1. L'investissement total prévu dans les transports publics du territoire, au plus près de chacun des deux mandats : budgets votés et comptes récents, programme pluriannuel, prospectus obligataire, analyse de notation, rapport d'orientation budgétaire. [Chiffres déjà connus, avec leurs sources.]
> 2. La part des bus : renouvellement du parc et des dépôts, calendrier d'achat.
> 3. La part des lignes existantes : rames, voies, équipements, modernisation, accessibilité.
> 4. Pour chaque projet décidé, ce qui reste à payer après 2026, réparti entre les deux mandats, et s'il fait partie des lignes dessinées.
> 5. La situation financière qui peut faire bouger ces montants : dette, capacité de désendettement, avis de la chambre régionale des comptes.
> 6. Pour les leviers de financement : les recettes tarifaires annuelles, partagées entre abonnements et tickets ; les prix actuels de l'abonnement mensuel et du ticket ; ce que paient les moins de 25 ans ; le manque à gagner de la tarification sociale ; le taux, le plafond légal et le produit du versement mobilité ; le coût d'un métro ou d'un tram toute la nuit le week-end.
>
> Termine par un tableau qui donne, pour chaque mandat, l'investissement prévu, les projets décidés dessinés, les bus, les lignes existantes et ce qui reste au joueur, avec ton calcul en quelques phrases, puis par ce que rapporte ou coûte chaque levier sur un mandat de six ans. Dis clairement quand un chiffre est une estimation de ta part, et liste ce que tu n'as pas pu vérifier. La presse ne sert que si rien d'officiel n'existe, en le signalant. Ne modifie aucun fichier du dépôt, et rédige en français, en phrases complètes, sans tiret long.
