# Simulateur Transport TCL Lyon

Un simulateur interactif moderne pour l'arbitrage budgétaire des projets de transport TCL sur deux mandats (2026-2032 et 2032-2038).

## 🚀 Fonctionnalités

- **25 projets de transport** à sélectionner et financer
- **6 leviers de financement** ajustables en temps réel
- **Calcul budgétaire dynamique** pour deux mandats
- **Interface mobile-first** avec animations fluides
- **Visualisation des résultats** avec impact voyageurs

## 🛠️ Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎯 Utilisation

1. **Page d'accueil** : Introduction au contexte et aux objectifs
2. **Simulateur** : 
   - Sélectionnez les projets pour M1, M2 ou M1+M2
   - Ajustez les leviers de financement
   - Visualisez l'impact budgétaire en temps réel
3. **Résultats** : Synthèse complète de vos choix avec impact voyageurs

## 📊 Données

- Budget de base : 2 000 M€ par mandat
- 25 projets allant de 36 M€ à 3,3 Md€
- Impact jusqu'à 312 000 voyageurs/jour (Modernisation Ligne A)

## 🏗️ Structure du Projet

```
simulateur-transport/
├── app/                    # Pages Next.js
│   ├── page.tsx           # Page d'accueil
│   ├── simulator/         # Interface de simulation
│   └── results/           # Page de résultats
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   ├── ProjectCard.tsx   # Carte de projet
│   ├── FinancingPanel.tsx # Panneau de financement
│   └── BudgetIndicators.tsx # Indicateurs budgétaires
├── lib/                   # Utilitaires et logique
│   ├── data.ts           # Données des projets
│   ├── store.ts          # State management (Zustand)
│   ├── types.ts          # Types TypeScript
│   └── utils.ts          # Fonctions utilitaires
└── specs.md              # Spécifications fonctionnelles
```

## 🎨 Design

- Design moderne avec gradients et animations
- Mobile-first avec breakpoints responsive
- Palette de couleurs cohérente (bleu primaire)
- Composants accessibles (Radix UI)

## 📝 Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # Linting
```

## 🔧 Configuration

Le projet utilise :
- TypeScript strict mode
- ESLint avec config Next.js
- TailwindCSS avec variables CSS personnalisées
- Path aliases (`@/*`)

## 📄 Licence

Projet de démonstration pour la simulation budgétaire TCL Lyon.
