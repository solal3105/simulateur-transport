# Procédure de déploiement

## Prérequis
- Compte Netlify configuré
- Accès au projet `simulateur-transport-tcl` (ID: `b370524f-1c7e-4641-bebc-fc736370e8b0`)
- Framework: Next.js

## Méthode 1 : Déploiement via Cascade (recommandé)

### Étape 1 : Vérifier les modifications
```bash
npx tsc --noEmit
```
S'assurer qu'il n'y a pas d'erreurs TypeScript.

### Étape 2 : Déployer
Utiliser l'outil MCP Netlify dans Cascade :
```
mcp2_netlify-deploy-services-updater
```
Avec les paramètres :
- `operation`: "deploy-site"
- `siteId`: "b370524f-1c7e-4641-bebc-fc736370e8b0"
- `deployDirectory`: "/Users/solal/CascadeProjects/simulateur-transport"

### Étape 3 : Suivre le déploiement
Le déploiement retourne une URL de monitoring :
```
https://app.netlify.com/sites/b370524f-1c7e-4641-bebc-fc736370e8b0/deploys/[DEPLOY_ID]
```

### Étape 4 : Vérifier le site
Une fois le build terminé (2-3 minutes), le site est accessible sur :
```
https://simulateur-transport-tcl.netlify.app
```

## Méthode 2 : Déploiement via CLI Netlify

### Installation
```bash
npm install -g netlify-cli
netlify login
```

### Déploiement
```bash
cd /Users/solal/CascadeProjects/simulateur-transport
netlify deploy --prod --site b370524f-1c7e-4641-bebc-fc736370e8b0
```

## Méthode 3 : Déploiement via Git (automatique)

Si le projet est connecté à un repo Git sur Netlify :
1. Commit et push les modifications
2. Netlify détecte automatiquement les changements
3. Le build se lance automatiquement

## Configuration du site

### Build settings
- **Build command**: `npm run build` (Next.js)
- **Publish directory**: `.next`
- **Node version**: 18.x ou supérieur

### Variables d'environnement
Aucune variable d'environnement requise pour le moment.

## Historique des déploiements récents

- **2026-01-22 18:41** : Ajout upgrade Tram Rive Droite (Deploy ID: 697261e7b0fb0e125b5a46db)
- **2026-01-22 18:38** : Écriture inclusive + retrait objectif métro (Deploy ID: 6972613e0f4d230ad7e8b825)
- **2026-01-22 18:30** : Logos + bouton valider mobile (Deploy ID: 69726047fc679a0855892b13)

## Troubleshooting

### Build échoue
- Vérifier `npx tsc --noEmit` localement
- Vérifier les dépendances dans `package.json`
- Consulter les logs de build sur Netlify

### Site ne se met pas à jour
- Vider le cache du navigateur (Cmd+Shift+R)
- Vérifier que le deploy est bien en "Published" sur Netlify
- Attendre 1-2 minutes pour la propagation CDN

### Erreurs TypeScript
- Lancer `npm run build` localement pour reproduire
- Corriger les erreurs avant de redéployer
