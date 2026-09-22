---
name: Simulateur Transport TCL Lyon
description: Un panneau de signalétique vert signal dans lequel une plaque noire porte le plan du réseau.
colors:
  signal: "#a3d900"
  signal-lift: "#b6ec12"
  signal-press: "#8fbe00"
  signal-rule: "#7aa300"
  ink: "#0b0e07"
  ink-lift: "#171c10"
  ink-rule: "#2f3822"
  plate: "#060803"
  chalk: "#f2f5ea"
  chalk-dim: "#99a489"
  olive: "#3e4d0b"
  alert: "#ff5a1f"
  plan-study: "#76856a"
  plan-ground: "rgb(10, 14, 7)"
  plan-ramp-top: "rgb(78, 92, 66)"
  plan-water: "rgb(18, 36, 30)"
  plan-greenspace: "rgb(17, 25, 10)"
  plan-label: "#8a9578"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 6.4vw, 4.4rem)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 112"
    fontFeature: "'tnum' 1, lining-nums"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  dense:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "normal"
  meta:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.35
    fontFeature: "'tnum' 1, lining-nums"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
  board:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "'tnum' 1, lining-nums"
  ledger:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "'tnum' 1, lining-nums"
rounded:
  plate: "2px"
  inset: "2px"
spacing:
  hair: "1px"
  gutter: "10px"
  gutter-wide: "14px"
  row-x: "10px"
  row-y: "8px"
  block: "12px"
  section: "24px"
  page: "40px"
components:
  plate:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.inset}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "44px"
  button-ink-hover:
    backgroundColor: "{colors.ink-lift}"
    textColor: "{colors.signal}"
  button-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "44px"
  button-signal-hover:
    backgroundColor: "{colors.signal-lift}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "0 12px"
    height: "32px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal}"
  phase-cell:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.plate}"
    height: "32px"
    width: "36px"
    typography: "{typography.meta}"
  phase-cell-active:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
  phase-cell-active-hover:
    backgroundColor: "{colors.alert}"
    textColor: "{colors.chalk}"
  mode-badge:
    backgroundColor: "{colors.ink-lift}"
    textColor: "{colors.chalk-dim}"
    rounded: "{rounded.plate}"
    size: "32px"
  mode-badge-active:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-dim}"
    rounded: "0"
    padding: "0 14px"
    height: "40px"
  tab-active:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
  plan-marker:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal}"
    rounded: "{rounded.plate}"
    size: "32px"
  plan-marker-phase-2:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
  board-flap:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.signal}"
    rounded: "0"
    height: "32px"
    width: "60px"
    typography: "{typography.board}"
  board-flap-late:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.alert}"
  alert-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.alert}"
    rounded: "{rounded.inset}"
    padding: "6px 12px"
---

# Design System: Simulateur Transport TCL Lyon

## Overview

**Creative North Star : « Le Plan de Réseau Mural »**

Le simulateur se présente comme un panneau de signalétique de quai accroché au mur : un aplat de vert signal occupe tout le viewport et porte le châssis entier, et c'est dans cet aplat qu'une plaque noire est encastrée pour recevoir le plan du réseau. La carte n'est jamais une fenêtre posée par-dessus une interface, elle est un creux dans le panneau. Ce renversement est la décision qui tient tout le reste : il interdit d'emblée le vocabulaire habituel de la civic-tech, la carte sombre plein écran surmontée de cartes de verre flottantes et de compteurs animés.

La densité est celle d'un document d'exploitation plutôt que celle d'une page marketing. Les 22 ouvrages tiennent dans un rail continu où chaque rang porte son numéro de plaque, son pictogramme de mode, son coût, son gain de fréquentation et ses trois cases de phase, sans respiration décorative entre eux. Rien n'est là pour le plaisir de l'œil : une surface qui ne porte pas une valeur réelle n'existe pas. Le produit s'adresse à quelqu'un qui lit des chiffres en plein soleil sur un téléphone, et la forme suit cette contrainte avant toute autre.

L'aplat est la seule matière. Le système ne connaît ni dégradé tonal, ni ombre portée, ni flou de verre, ni carte flottante : il ne connaît que des aplats, des filets d'un pixel, des carrés encastrés à 2 px de rayon et des hachures. La profondeur se lit par encastrement, jamais par élévation. Quand une valeur passe en dépassement, ce n'est pas un badge rouge qui apparaît, c'est la plaque entière qui s'inverse en noir pour que l'orange d'alerte ait un fond où vivre.

**Key Characteristics :**

- Le vert signal en aplat sur tout le châssis, et le noir signalétique en typographie comme en plaques encastrées.
- Aucun dégradé tonal, aucune ombre portée, aucun verre : des aplats et des filets, avec un rayon plafonné à 2 px.
- Chaque chiffre est posé contre une graduation visible plutôt que laissé flotter.
- Une seule famille de caractères, Archivo, de la graisse de labeur aux chiffres monumentaux en chasse élargie, et Martian Mono en usage strictement réservé.
- Le texte secondaire est une teinte de son propre fond, jamais un gris emprunté ailleurs.
- L'état d'un tracé se lit à la fois à sa couleur et à son motif, pour rester lisible sans la couleur.

## Colors

La palette compte trois rôles et une alerte : un vert signal qui porte le châssis, un noir signalétique qui sert à la fois d'encre et de plaque, un blanc crayeux qui sert de pictogramme et de seconde phase, et un orange qui ne se pose jamais sur le vert.

### Primary

- **Vert signal** (`signal`) : l'aplat unique du châssis. Il couvre le fond du `main`, l'écran d'entrée, l'écran de bilan et la carte de partage exportée. Sur la plaque noire, il change de rôle et devient la couleur de l'état retenu : onglet actif, case de phase inscrite, pictogramme de mode sélectionné, tracé de phase 1 sur le plan.
- **Vert éclairci** (`signal-lift`) : l'unique survol d'un bouton posé sur vert. Il ne sert à rien d'autre.
- **Vert enfoncé** (`signal-press`) : l'état pressé du même bouton.
- **Vert de filet** (`signal-rule`) : la poignée d'ascenseur des zones vertes, déclarée sous `.on-panel`.

### Secondary

- **Blanc crayeux** (`chalk`) : le texte courant de toute surface noire, l'évidement des pictogrammes quand ils sont peints sur vert, et surtout la couleur de la phase 2 sur le plan. Le blanc n'est pas un gris clair de repli, c'est une valeur porteuse de sens.
- **Orange d'alerte** (`alert`) : le dépassement, la mise en service tardive, le retrait d'un ouvrage, le levier qui coûte. Il ne se pose jamais directement sur le vert signal, faute de contraste tenable.

### Neutral

- **Noir signalétique** (`ink`) : la typographie sur vert et la matière des plaques encastrées. La même valeur dans les deux emplois, ce qui fait tenir l'idée d'un panneau découpé plutôt que superposé.
- **Noir relevé** (`ink-lift`) : le rang survolé ou ouvert du rail, le fond d'un pictogramme non retenu, le survol d'un bouton d'encre.
- **Filet d'encre** (`ink-rule`) : le trait d'un pixel qui sépare deux rangs, deux cellules d'une grille en `gap-px`, ou borde la plaque d'un marqueur.
- **Noir de plaque** (`plate`) : un cran plus profond que l'encre, réservé au fond du plan WebGL, au halo des toponymes et à la cellule à palette du tableau des mises en service.
- **Blanc éteint** (`chalk-dim`) : le texte secondaire sur noir.
- **Olive** (`olive`) : le texte secondaire sur vert.

### Tertiary

Le plan a sa propre sous-palette, dérivée du noir de plaque et jamais employée hors WebGL. La trame viaire monte du sol (`plan-ground`) vers un plafond de valeur (`plan-ramp-top`) par une racine appliquée à la luminance d'origine, l'eau et les espaces verts reçoivent leurs propres cibles (`plan-water`, `plan-greenspace`), les toponymes prennent une teinte sourde (`plan-label`) avec un halo en noir de plaque, et les tracés non retenus se lisent dans un gris d'étude (`plan-study`).

### Named Rules

**La règle des trois rôles.** Le vert porte le châssis, le noir porte le texte et la plaque, le blanc crayeux porte le pictogramme et la seconde phase. Une quatrième couleur d'interface ne s'invente pas : on prend une teinte de l'un des trois.

**La règle du secondaire teinté.** Un texte secondaire est une teinte de son propre fond, jamais un gris neutre : olive sur vert, blanc éteint sur noir. Un `#888` posé indifféremment sur les deux fonds casse le système.

**La règle de l'inversion avant l'alerte.** L'orange ne se pose jamais sur le vert signal. Quand une enveloppe passe en dépassement, la cellule concernée s'inverse d'abord en plaque d'encre, et l'orange se pose sur ce noir. Test : si vous voyez de l'orange sur du vert, l'inversion a été oubliée.

## Typography

**Display Font :** Archivo variable, axe `wdth` exposé (avec `ui-sans-serif, system-ui, sans-serif` en repli)
**Body Font :** Archivo, la même famille
**Label/Mono Font :** Martian Mono (avec `ui-monospace, monospace` en repli)

**Character :** une seule voix, exploitée d'un bout à l'autre de son registre. Archivo en graisse 700 fait le travail de labeur à 11 px comme le travail monumental à 70 px, et la différence entre les deux se joue sur la chasse plus que sur la taille. Martian Mono n'est pas une seconde voix mais un signe d'appareil : quand elle apparaît, c'est qu'un chiffre est posé comme une donnée de quai.

### Hierarchy

- **Display** (700, `clamp(1.9rem, 6.4vw, 4.4rem)`, interligne 0.84, approche -0.035em, `wdth` 112, chiffres tabulaires) : le montant restant de chaque enveloppe dans le bandeau supérieur, et les trois lectures du bilan. C'est le seul emploi de la chasse élargie.
- **Headline** (700, `clamp(2rem, 5vw, 3.5rem)`, interligne 0.95, approche -0.035em) : le titre de l'écran d'entrée et celui du bilan, en chasse normale.
- **Title** (700, 15 px) : le nom du produit dans le bandeau, les têtes de section du bilan.
- **Body** (400, 15 px, interligne 1.625, mesure plafonnée à 62ch) : les paragraphes d'explication de l'écran d'entrée et du bilan.
- **Dense** (700, 13 px, interligne 1.15) : le nom d'un ouvrage dans le rail, dans le tableau et dans le catalogue. C'est la taille de travail du produit.
- **Meta** (400, 11,5 px, chiffres tabulaires) : les coûts, les gains de fréquentation, les détails d'un levier, les notes de bas de bloc.
- **Label** (700, 0,6875 rem, interligne 1, interlettrage 0.1em, capitales) : l'étiquette de champ du panneau, utilitaire `sign-label`. Elle nomme une zone ou une donnée, à l'intérieur ou au-dessus de son propre bloc.
- **Board** (Martian Mono 700, 15 px) : l'année dans la cellule à palette du tableau des mises en service.
- **Ledger** (Martian Mono 500 à 700, 9 à 13 px) : les bornes de réglette, le numéro de plaque d'un ouvrage, les lignes de compte du bilan, la mention de phase du tableau.

### Named Rules

**La règle de la chasse réservée.** L'axe `wdth` d'Archivo n'est pas un réglage libre. La chasse élargie à 112 (`wide`) est réservée aux nombres monumentaux, la chasse resserrée à 82 (`narrow`) reste disponible pour un cas de place. Un texte courant reste à la chasse normale.

**La règle du monospace d'appareil.** Martian Mono ne sert que là où le produit imite un appareil : le tableau des mises en service, les bornes des réglettes, les lignes du grand livre du bilan et les numéros de plaque. Elle ne sert jamais de police de texte, ni de titre, ni de bouton.

**La règle des chiffres alignés.** Le corps du document désactive volontairement `tnum`, et l'utilitaire `lining` le réactive partout où un chiffre doit s'aligner en colonne ou changer sans faire bouger ses voisins. Tout nombre qui varie porte `lining`. Les milliers sont séparés par une espace fine insécable.

## Layout

La page est une fenêtre pleine hauteur (`h-dvh`) qui ne défile jamais : c'est le rail et les tiroirs qui défilent à l'intérieur. Le châssis vert entoure ses plaques d'une gouttière unique, tenue par `--panel-gutter`, qui vaut 10 px et passe à 14 px au-delà de 900 px. Cette même valeur sert de marge extérieure au panneau et d'écart entre toutes les plaques, ce qui donne au vert l'épaisseur régulière d'un cadre.

Au-delà de 1024 px, la composition est en trois zones. Le bandeau supérieur porte à gauche l'identité et à droite les deux enveloppes, chacune en chiffres monumentaux lue contre sa réglette, avec les actions principales en bout de ligne. Le rail gauche est une plaque de 358 px, portée à 398 px au-delà de 1280 px, qui contient la nomenclature des 22 ouvrages. Le reste de la largeur revient au plan, qui prend toute la hauteur disponible, avec sous lui une plaque de pont à onglets dont le corps s'ouvre et se referme sur une hauteur fixe de 240 px.

Sous 1024 px, le plan garde l'écran. Le rail, le financement et le calendrier disparaissent derrière une barre basse de quatre plaques d'encre de 44 px, et reviennent dans un tiroir qui remonte du bas, plafonné à 76 % de la hauteur, bordé par la même gouttière que le reste du panneau et fermé par un voile d'encre à 70 %. Le bandeau supérieur se réduit alors aux deux enveloppes et à leurs réglettes : le nom du produit et les boutons d'action passent sous le seuil.

Le rythme d'espacement est court et régulier. Un rang du rail tient en 10 px horizontaux et 8 px verticaux, un bloc du pont en 12 px, une section d'écran plein en 24 à 40 px selon la largeur. Les séparations internes ne sont presque jamais des bordures mais des grilles en `gap-px` posées sur un fond de filet d'encre, ce qui donne des traits d'exactement un pixel quel que soit le zoom.

## Elevation & Depth

Le système n'a aucune ombre portée, aucun flou d'arrière-plan et aucune élévation. La profondeur se lit par encastrement : une plaque d'encre posée sur le vert est comprise comme un creux dans le panneau, pas comme une carte qui lévite. Les seules variations d'altitude sont des variations de valeur, du vert au noir d'encre, puis du noir d'encre au noir de plaque pour ce qui est le plus profond, c'est-à-dire le plan et les cellules à palette.

Deux effets lumineux existent, tous deux à l'intérieur du plan WebGL et nulle part ailleurs dans l'interface. Le tracé survolé ou ouvert reçoit un halo vert flou (`line-blur` 10, opacité 0.4) qui le détache de la trame viaire, et le tracé qui entre au programme s'écrit d'un terminus à l'autre par un `line-gradient` en marche d'escalier. Ce sont des outils de carte, au même titre que le casing noir posé sous chaque tracé retenu pour le décoller du fond ; ils ne descendent jamais sur une plaque, un bouton ou un rang du rail.

### Named Rules

**La règle du creux.** Une surface n'est jamais au-dessus, elle est en dessous. Si vous vous surprenez à chercher une ombre pour détacher un élément, c'est qu'il devrait être une plaque encastrée ou un filet d'un pixel.

**La règle du halo cartographique.** Le flou et le dégradé de ligne sont admis dans le plan, où ils servent à distinguer un tracé de la trame, et interdits partout ailleurs.

## Shapes

Le rayon est plafonné à 2 px, valeur unique portée par `--radius-plate` pour ce qui s'attrape et `--radius-inset` pour ce qui se creuse. Ce n'est pas un arrondi décoratif, c'est l'adoucissement mécanique d'un angle découpé : à cette taille, une plaque reste un carré. Rien dans le système n'est circulaire, à l'exception des points de terminus sur le plan, qui sont des cercles parce qu'un terminus de réseau s'écrit ainsi depuis toujours.

Les bordures existent en deux épaisseurs seulement. Un filet d'un pixel sépare et encadre, obtenu soit par `border`, soit par une grille en `gap-px` sur fond de filet. Un trait de 2 px sert de cerne à un marqueur de plan et de soulignement à une tête de colonne. Il n'y a pas de troisième épaisseur.

La hachure est la seule texture du système : un motif à 45 degrés de traits d'alerte de 2 px espacés de 9 px, appliqué à la portion dépassée d'une réglette et aux deux joues de la bande d'avertissement. Elle existe pour que le dépassement reste lisible sans la couleur, et c'est un motif à bords francs, pas une transition tonale.

Les pictogrammes sont dessinés pour ce panneau : aplats pleins, une seule graisse, grille de 24, et les évidements peints dans la couleur du fond de la plaque par la variable `--picto-hole`. Aucun d'eux n'est un trait ouvert et aucun ne vient d'une bibliothèque tierce. Six familles de mode, métro, modernisation, tramway, bus, téléphérique et navette fluviale, plus une série de signes de service tracés sur la même grille.

### Named Rules

**La règle du carré à 2 px.** Aucun rayon ne dépasse 2 px, aucun élément n'est un cercle ou une pastille, à l'exception des terminus sur le plan.

**La règle de l'évidement peint.** Un pictogramme ne se troue pas, il se peint : les parties creuses reçoivent `--picto-hole`, réglée sur la couleur du fond qui le porte. Poser un pictogramme sur un fond nouveau sans régler cette variable fait apparaître du noir sur du vert.

## Components

### Buttons

- **Shape :** un carré adouci (rayon 2 px), jamais de pastille. Trois hauteurs seulement, 32, 44 et 56 px.
- **Ink (par défaut) :** plaque noire, texte vert signal, réservée à l'action principale posée sur le vert.
- **Signal :** aplat vert, texte noir, pour une action posée sur une plaque noire.
- **Ghost :** fond transparent, filet d'encre à 25 %, texte noir. Au survol, il se remplit d'encre et son texte passe au vert : le fantôme devient plaque.
- **Hover / Focus :** une seule transition, la couleur, sur 150 ms. Aucun déplacement, aucune mise à l'échelle, aucune ombre. Le focus clavier est un contour de 2 px à 2 px de distance, noir sur le panneau et vert sur les plaques.
- **Disabled :** opacité 40 % et curseur interdit, sans changement de teinte.

### Cards / Containers

Le seul conteneur du système est la plaque. Elle est en noir d'encre, porte le texte en blanc crayeux, adopte le rayon d'encastrement de 2 px, n'a ni ombre ni bordure extérieure, et se signale par la classe `on-plate` qui bascule la sélection, le contour de focus et l'ascenseur dans le registre inverse. Ses divisions internes se font par grille en `gap-px` sur fond de filet d'encre plutôt que par bordures. Le padding intérieur courant est de 10 à 16 px selon la densité du contenu.

### Inputs / Fields

Le seul champ de saisie du produit est le curseur de levier. Il est dessiné comme une réglette de panneau : rail de 6 px en blanc crayeux à 12 %, plage parcourue en vert signal tracée depuis le zéro et non depuis la borne basse, repère de zéro en blanc éteint quand la plage est signée, poignée rectangulaire de 12 sur 20 px en blanc crayeux avec un rayon de 1 px. Au focus clavier, la poignée passe au vert signal plutôt que de recevoir un contour. La valeur du levier est affichée à côté du champ, en vert quand elle rapporte et en orange quand elle coûte.

### Navigation

Le pont inférieur porte une bande d'onglets de 40 px bordée en bas d'un filet d'encre. L'onglet actif est un aplat vert à texte noir, les autres sont en blanc éteint et passent au blanc crayeux au survol, sans soulignement ni indicateur mobile. Sous 1024 px, la navigation devient une rangée de plaques d'encre de 44 px à texte vert, occupant toute la largeur, suivie d'une plaque carrée à flèche qui ouvre le bilan.

### La réglette graduée

Le composant signature du système. Toute valeur affichée en grand est posée au-dessus d'une réglette de 10 px de haut : un fond sourd, une barre pleine pour la part consommée, des crans d'échelle placés sur un pas arrondi à un, deux ou cinq fois une puissance de dix, un repère plein hauteur pour le plafond de l'enveloppe, et une portion hachurée d'alerte pour le dépassement. Les bornes sont écrites en Martian Mono sous les extrémités. Deux réglettes comparables reçoivent la même graduation imposée, sans quoi elles ne se lisent plus l'une contre l'autre.

### La case de phase

Trois cellules jointives séparées d'un pixel, portant les glyphes 1, 2 et 1·2, qui constituent l'action principale du produit. Non inscrite, une cellule est un filet de blanc éteint à 35 % qui vire au vert au survol. Inscrite, elle est un aplat vert à texte noir, et son survol passe à l'orange d'alerte pour annoncer le retrait. Bloquée par une dépendance, elle garde son filet mais tombe à 20 % d'opacité de trait et porte la raison en infobulle.

### Le plan de réseau

Le plan encode l'état par la couleur et par le motif simultanément, pour rester lisible sans la couleur. Un ouvrage non retenu est un trait fin pointillé en gris d'étude à 55 % d'épaisseur. Un ouvrage de phase 1 est un trait plein en vert signal, un ouvrage de phase 2 un trait plein en blanc crayeux, et un ouvrage étalé sur les deux phases porte un tiret blanc surimposé à son trait vert. Le mode se lit à l'épaisseur du trait et non à la teinte : 7 pour le métro et la modernisation, 5 pour le tramway, 3,5 pour le bus, le câble et le fluvial, le tout multiplié par un facteur de zoom. Chaque tracé retenu reçoit un casing en noir de plaque de 5 px pour se détacher de la trame, et ses terminus sont des cercles cernés de la couleur de leur phase. Le fond de carte est repeint dans la palette avant d'être remis à la carte, et les toponymes y restent à 80 % d'opacité pour ne jamais l'emporter sur le réseau.

### Le marqueur d'ouvrage

Sur le plan, chaque ouvrage inscrit porte une plaque de 32 px en noir d'encre cernée de 2 px dans la couleur de sa phase, contenant son pictogramme de mode, avec en coin supérieur droit son numéro de plaque en Martian Mono sur pastille carrée. Survolé, le marqueur grandit de 25 % sur la courbe `--ease-sign` et fait apparaître son cartouche en dessous. Le numéro est le même dans le rail, sur le marqueur et dans le tableau des mises en service : c'est lui qui relie les trois lectures.

### Le tableau des mises en service

Un afficheur de quai. Chaque rang commence par une cellule à palette de 60 sur 32 px en noir de plaque, traversée d'une charnière d'un pixel, dans laquelle l'année bascule autour de son axe horizontal sur 420 ms quand elle change. L'année est verte tant qu'elle tombe dans les deux mandats et orange quand elle les déborde, et le rang porte ensuite le numéro de plaque, le pictogramme de mode, le nom de l'ouvrage et sa phase en monospace.

### Named Rules

**La règle de la valeur mesurée.** Aucun chiffre ne flotte. Un nombre mis en avant se lit contre une graduation visible dont la borne est elle-même un fait du catalogue, jamais un maximum choisi pour flatter le résultat.

**La règle du numéro de plaque.** Un ouvrage porte un numéro stable qui apparaît à l'identique dans le rail, sur le plan et dans le tableau. Une nouvelle surface qui montre des ouvrages montre ce numéro.

**La règle de la double clé.** Sur le plan, tout état se lit par la couleur et par le motif : pointillé pour l'étude, plein pour le retenu, tiret surimposé pour le partagé. Une distinction portée par la seule teinte n'est pas admise.

## Do's and Don'ts

### Do :

- **Do** garder une seule gouttière autour et entre toutes les plaques, en passant par `--panel-gutter` plutôt que par une marge écrite en dur.
- **Do** poser toute valeur mise en avant contre une réglette graduée, et imposer la même graduation à deux valeurs destinées à être comparées.
- **Do** teinter le texte secondaire depuis son fond, en olive sur le vert et en blanc éteint sur le noir.
- **Do** inverser la surface en plaque d'encre avant d'y poser de l'orange d'alerte.
- **Do** régler `--picto-hole` sur la couleur du fond chaque fois qu'un pictogramme change de support.
- **Do** appliquer `lining` à tout nombre susceptible de varier, et séparer les milliers par une espace fine insécable.
- **Do** doubler toute distinction de couleur par une distinction de motif ou d'épaisseur sur le plan.
- **Do** dessiner les nouveaux pictogrammes sur la grille de 24 existante, en aplats pleins et en une seule graisse.

### Don't :

- **Don't** poser d'ombre portée, de dégradé tonal ou de flou de verre sur une surface d'interface ; le halo et le dégradé de ligne restent à l'intérieur du plan WebGL.
- **Don't** dépasser un rayon de 2 px, ni introduire de pastille ou de bouton circulaire hors des terminus du plan.
- **Don't** poser de l'orange d'alerte directement sur le vert signal.
- **Don't** utiliser Martian Mono ailleurs que dans le tableau des mises en service, les bornes de réglette, les lignes du grand livre et les numéros de plaque.
- **Don't** élargir la chasse d'Archivo en dehors des nombres monumentaux.
- **Don't** introduire un gris neutre de texte secondaire qui servirait indifféremment sur les deux fonds.
- **Don't** animer un bouton autrement que par sa couleur : pas de translation, pas de mise à l'échelle, pas d'ombre au survol.
- **Don't** faire de la carte une fenêtre posée par-dessus l'interface, avec des panneaux flottants au-dessus d'elle.
- **Don't** importer un jeu d'icônes tiers ou un glyphe typographique en guise de pictogramme.
