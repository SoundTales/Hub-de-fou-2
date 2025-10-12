# Copilot Instructions for Hub-de-fou-2

## Business Context & Goals
- Digital multimedia e-book reader with:
  - Hub landing page (chapitrage)
  - Reading interface (transitions + audio)
- Current focus: hub landing page aesthetics and responsiveness.

## Project Overview
- Vite + React app.
- Sources in `src/`, static output in `dist/`.
- Legacy folders `frontend/` and `scripts.broken/` are archived and ignored.

## Key Workflows
- Build static site:
  - `npm run build` (Vite build -> dist/)
- Serve locally:
  - `npm run dev` (http://localhost:5173)
- Preview dist locally:
  - `npm run preview`

## Conventions & Patterns
- Source of truth: `src/`.
- Vite config: `vite.config.js` with `root: 'src'`, `base: './'`, `build.outDir: '../dist'`.

## Integration Points
- Static frontend only; no backend/API.

## References
- Entry: `src/index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles.css`
- Build config: `vite.config.js`
- Output: `dist/`

---
Update this file if project structure or workflows change. See `README.md`.
