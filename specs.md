# Spécifications Fonctionnelles - Simulateur de Transport TCL Lyon

## Objectif
Simulateur interactif pour l'arbitrage budgétaire des projets de transport TCL sur deux mandats (2026-2032 et 2032-2038).

## Parcours Utilisateur

### Étape 1 : Accueil
- Introduction au contexte du financement des transports
- Bouton "Commencer la simulation"

### Étape 2 : Interface de Simulation
**Zone Projets (gauche) :**
- Liste des 25 projets avec informations :
  - Nom du projet
  - Coût (en M€ ou Md€)
  - Impact voyageurs/jour
  - 3 options de sélection : M1 | M2 | M1+M2

**Zone Financement (droite) :**
- Affichage budget disponible par mandat
- 6 leviers de financement ajustables :
  - Gratuité Totale (ON/OFF) : -1 925 M€/mandat
  - Gratuité Conditionnée (ON/OFF) : -300 M€/mandat  
  - Tarif Abonnements (slider) : Base 74.10€, +1% = +12 M€
  - Tarif Tickets (slider) : Base 2.10€, +1% = +8 M€
  - Versement Mobilité (sélecteur) : -25% (-700 M€), Actuel, +25% (+700 M€), +50% (+1 400 M€)
  - TVA 5.5% (ON/OFF) : +96 M€/mandat
- Bouton "Réinitialiser"

**Indicateurs supérieurs :**
- Total voyageurs gagnés cumulés
- Budget restant Mandat 1
- Budget restant Mandat 2
- Bouton "Valider" (actif uniquement si budgets équilibrés)

### Étape 3 : Résultats
- Synthèse des choix effectués
- Impact total en voyageurs/jour
- Répartition des coûts par mandat

## Logique Métier

### Règles de Sélection des Projets
- Un projet ne peut être assigné qu'à une seule période (M1, M2, ou M1+M2)
- Option M1+M2 : coût divisé par 2 pour chaque mandat
- Impact voyageurs toujours compté en totalité
- Projets avec contraintes spéciales (ex: entretien bus) uniquement en M1+M2

### Calcul Budgétaire
- Budget de base : 2 000 M€ par mandat
- Budget ajusté = 2 000 M€ + somme(impacts leviers) - somme(coûts projets sélectionnés)
- Validation possible uniquement si budget ajusté ≥ 0 pour les deux mandats

### États du Système
- **Simulation valide** : Tous projets financés, budgets équilibrés
- **Simulation invalide** : Budget négatif sur au moins un mandat

## Données de Référence

### Liste des Projets (25 projets)
- Extension Ligne B Nord : 3,3 Md€ / +71 500 voyageurs/jour
- Métro E Part-Dieu : 2,4 Md€ / +102 000 voyageurs/jour
- Extension Ligne A Est : 2 Md€ / +48 500 voyageurs/jour
- Métro E Bellecour : 1,8 Md€ / +64 000 voyageurs/jour
- Extension Ligne D : 1,4 Md€ / +40 000 voyageurs/jour
- T13 C2 en T13 Souterrain : 1,2 Md€ / +60 000 voyageurs/jour
- TEOL Enterré : 1,1 Md€ / +55 000 voyageurs/jour
- TEOL Semi-enterré : 800 M€ / +55 000 voyageurs/jour
- Entretiens flotte bus : 800 M€ (M1+M2 uniquement)
- Modernisation Ligne A : 686 M€ / +312 000 voyageurs/jour
- T10 C6 Tramway : 600 M€ / +25 000 voyageurs/jour
- T12 C3 Tramway : 540 M€ / +75 000 voyageurs/jour
- T9 C2 Tramway Surface : 480 M€ / +45 000 voyageurs/jour
- Électrification Bus : 460 M€
- Modernisation Ligne D : 338 M€ / +220 500 voyageurs/jour
- T8 Tram T8 : 245 M€ / +30 000 voyageurs/jour
- C6 BHNS : 240 M€ / +20 000 voyageurs/jour
- C2 BHNS : 240 M€ / +25 000 voyageurs/jour
- Modernisation Ligne C : 239 M€ / +28 000 voyageurs/jour
- T3 Renforcement : 220 M€ / +65 000 voyageurs/jour
- T11 Tram T11 : 120 M€ / +25 000 voyageurs/jour
- T9/T10 Finalisation : 100 M€
- BHNS Parilly : 80 M€ / +25 000 voyageurs/jour
- Navette Fluviale : 40 M€ / +1 500 voyageurs/jour
- BHNS Rive Droite : 36 M€ / +20 000 voyageurs/jour

### Impacts des Leviers de Financement
- Gratuité Totale : -1 925 M€/mandat
- Gratuité Conditionnée : -300 M€/mandat
- Tarif Abonnements : +12 M€ par +1%
- Tarif Tickets : +8 M€ par +1%
- Versement Mobilité : -700 M€ (-25%), 0 (actuel), +700 M€ (+25%), +1 400 M€ (+50%)
- TVA 5.5% : +96 M€/mandat

## Fonctionnalités Annexes
- Réinitialisation complète de la simulation
- Information contextuelle sur les contraintes légales (leviers nécessitant une loi)
- Calcul en temps réel des impacts
- Historique des sélections (optionnel)
