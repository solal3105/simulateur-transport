# Simulateur Transport TCL Lyon

Un simulateur interactif moderne pour l'arbitrage budgétaire des projets de transport en commun. Conçu initialement pour Lyon et le réseau TCL, ce simulateur permet aux citoyens de comprendre les arbitrages budgétaires sur deux mandats (2026-2032 et 2032-2038).

## 🌍 Adaptabilité à d'autres villes

Ce projet est conçu pour être facilement adapté à d'autres réseaux de transport urbain. Les données des projets, les coûts et les leviers de financement sont centralisés dans `lib/data.ts`, permettant une personnalisation rapide pour votre ville.

## 🚀 Fonctionnalités

- **27 projets de transport** à sélectionner et financer (métro, tramway, téléphérique, BHNS...)
- **6 leviers de financement** ajustables en temps réel
- **Calcul budgétaire dynamique** pour deux mandats
- **Interface mobile-first** avec animations fluides
- **Visualisation des résultats** avec impact voyageurs
- **Cartographie interactive** des projets (avec support GeoJSON)

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
- 27 projets allant de 36 M€ à 6 Md€
- Impact jusqu'à 312 000 voyageurs/jour (Modernisation Ligne A)
- Durées de construction réalistes (1 à 30 ans selon les projets)

## 🔄 Adapter à votre ville

Pour adapter ce simulateur à votre réseau de transport :

1. **Modifiez les données** dans `lib/data.ts` :
   - Liste des projets (`PROJECTS`)
   - Coûts et impacts
   - Durées de construction (`PROJECT_DURATIONS`)
   - Leviers de financement (`FINANCING_IMPACTS`)

2. **Ajoutez vos tracés** (optionnel) :
   - Créez des fichiers GeoJSON pour vos projets
   - Placez-les dans `public/geojson/`
   - Nommez-les selon l'`id` du projet (ex: `metro-ligne-a.geojson`)

3. **Personnalisez l'interface** :
   - Couleurs et branding dans `tailwind.config.ts`
   - Textes d'introduction dans `app/page.tsx`

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

Ce projet est sous licence **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

Vous êtes libre de :
- **Partager** : copier et redistribuer le matériel
- **Adapter** : remixer, transformer et créer à partir du matériel pour votre propre ville

Sous les conditions suivantes :
- **Attribution** : Vous devez créditer l'œuvre originale
- **Pas d'utilisation commerciale** : Vous ne pouvez pas utiliser le matériel à des fins commerciales

Voir le fichier [LICENSE](LICENSE) pour plus de détails.
