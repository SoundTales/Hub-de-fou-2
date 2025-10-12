# Hub de Fou 2

Landing page for the OSRASE universe by SoundTales. The project runs on React 18 and Vite with a configuration tailored for GitHub Pages deployment.

## Features
- Responsive hero layout with safe-area handling
- Dynamic gallery grid fed by generated story cards
- Accessibility minded focus states and reduced motion fallbacks
- Production ready Vite build that targets GitHub Pages

## Prerequisites
- Node.js 18 or later
- npm 8 or later

## Installation
```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to view the development build.

## Available Scripts
- `npm run dev` – start the Vite development server
- `npm run build` – generate the static production bundle in `dist/`
- `npm run preview` – serve the production bundle locally for testing

## Deployment
1. Ensure dependencies are installed: `npm install`
2. Build the site: `npm run build`
3. Push the contents of the repository to `main`
4. Configure the GitHub repository (`SoundTales/Hub-de-fou-2`) to serve the `dist/` folder via GitHub Pages (Settings → Pages → Deploy from branch → `main` / `dist`)

The Vite config sets `base: '/Hub-de-fou-2/'`, so static assets resolve correctly when hosted from GitHub Pages.

## Project Structure
```
.
├─ src/            # React entry point, components, and styling
├─ .github/        # Issue templates and repository workflows
├─ node_modules/   # Installed dependencies (not committed)
├─ dist/           # Build output (generated)
└─ vite.config.js  # Vite configuration for dev and production
```

## License

Distributed under the MIT License. See `LICENSE` for details.
