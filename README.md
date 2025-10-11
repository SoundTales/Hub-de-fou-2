# OSRASE Landing Page Hub

This repository hosts the OSRASE landing page that was iteratively refined in the previous tasks.

## Exporter vers GitHub

1. Vérifiez l'absence de marqueurs de conflit :
   ```bash
   npm run lint:conflicts
   ```
2. Construisez le paquet statique. La commande exécute automatiquement la vérification précédente avant de copier les fichiers :
   ```bash
   npm run build
   ```
3. Publiez le contenu du dossier `dist/` dans l'export GitHub.

Les scripts `serve.mjs` et `build.mjs` détectent automatiquement si vos fichiers sources se trouvent à la racine du projet (`./index.html`, `./styles.css`) ou dans `./src/`. Vous pouvez passer un dossier source explicite en argument si besoin :

```bash
node scripts/serve.mjs src
node scripts/build.mjs src
```

## Développement local

Servez l'interface avec le serveur statique :

```bash
npm run dev
```

Le serveur écoute par défaut sur `http://localhost:5173` et diffuse automatiquement le bon répertoire de travail.
