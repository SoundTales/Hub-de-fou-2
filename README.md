# Hub de Fou 2

Landing page for the OSRASE universe by SoundTales. Built with React 18 + Vite and set up for GitHub Pages deployment.

## Features
- Responsive hero section and gallery
- Accessible focus states and reduced-motion fallbacks
- Clean Vite setup for production builds

## Prerequisites
- Node.js 18+
- npm 8+

## Installation
```bash
npm install
npm run dev
```
Open `http://localhost:5173` to view the dev server.

## Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – build to `docs/`
- `npm run preview` – preview the production build locally

## Deployment
GitHub Actions (recommended):
- The workflow at `.github/workflows/deploy.yml` builds on each push to `main` and deploys to GitHub Pages.
- First time only: in GitHub, go to Settings → Pages and set Source to “GitHub Actions”.

Manual alternative (no CI):
1. `npm install`
2. `npm run build` (outputs to `docs/`)
3. Settings → Pages → Deploy from a branch → Branch `main`, Folder `docs`

Vite’s `base` is set to `/Hub-de-fou-2/` so assets resolve correctly on Pages.

## Project Structure
```
.
├─ src/            # React entry/markup/styles
├─ .github/        # Workflows and repo configs
├─ node_modules/   # Dependencies (not committed)
├─ docs/           # Build output (generated)
└─ vite.config.js  # Vite configuration
```

## License
MIT — see `LICENSE`.

