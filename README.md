# aydenjenson.com

Portfolio website for Ayden Jenson, videographer and cinematographer in Mankato, MN.

- **Ayden:** start with [docs/GUIDE.md](docs/GUIDE.md). It covers launching the site, pointing the domain at it and updating it.
- **Anyone working on the code (including Claude):** read [CLAUDE.md](CLAUDE.md).

Build: `node build.js` (no dependencies). Preview: `node dev.js`, then open http://localhost:4321.
On a fresh copy of the project, run `node tools/fonts.js` once first: it downloads the heading font, which is licensed for use on the site but may not be kept in this public repository.
Publishing is automatic: every push to `main` is built and deployed to GitHub Pages by `.github/workflows/deploy.yml`.
