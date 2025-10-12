# Contributing

Thank you for your interest in improving the Hub de Fou 2 landing page. The guidelines below explain how to set up your environment and submit changes.

## Getting Started
1. Fork the repository and clone your fork.
2. Create a feature branch: `git checkout -b feature/my-change`.
3. Install dependencies with `npm install`.
4. Run the dev server (`npm run dev`) while you work.
5. Execute `npm run build` to validate the production bundle before opening a pull request.

## Pull Request Checklist
- Keep each pull request focused on a single change.
- Update documentation when you introduce new behaviour.
- Run `npm run build` locally and ensure there are no console errors in the browser.
- Provide screenshots or short notes for UI changes.
- Make sure your branch is up to date with `main` before submitting the PR.

## Code Style Notes
- Use modern ES modules and React functional components.
- Prefer descriptive variable names and small, reusable functions.
- Keep CSS in `src/styles.css` unless a component specific override is required.
- Respect accessibility best practices (semantic HTML, focus handling, reduced motion).

## Reporting Issues
When filing a bug report, include:
- Expected versus actual behaviour
- Steps to reproduce
- Browser and device details
- Any relevant screenshots or logs

Thank you for helping us keep the experience polished for readers!
