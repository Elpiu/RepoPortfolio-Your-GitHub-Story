# RepoPortfolio — Your GitHub Story

> **A zero-maintenance engine that syncs your GitHub identity into a
> high-performance landing page.**

RepoPortfolio is **not another portfolio template**. It turns repositories,
pinned projects, languages and activity into a deliberate product experience: a
Bento profile, a GitHub Story drawn as a Git graph with parallel lanes, an
explorable project archive and a printable CV generated from the same data.

The visual direction is **Engineered Minimalism**: dark-first, rigorous grids,
a single Emerald accent, Geist + Geist Mono and Git-native details, inspired by
Linear, Vercel and Raycast.

## Status

**Pre-scaffold / design phase.** The legacy Next.js application has been removed
from the working tree; Git history keeps it as an archive. There is no
application code yet, so the commands below describe the target workflow.
Product and technical decisions live in [`docs/`](docs/README.md).

## How it will work

1. Clone the repository (or use it as a template).
2. Edit the JSON files in `data/`. Nothing else.
3. Run one command to publish to GitHub Pages.

```text
data/
├─ site.json          # contacts, languages, exclusions, story options
└─ profile/
   ├─ en.json         # your story in the default language
   └─ it.json         # optional extra languages
```

Every JSON file points to a generated JSON Schema, so your editor autocompletes
fields and flags mistakes as you type.

### Quick start (target)

```bash
pnpm install
```

```bash
GITHUB_TOKEN=$(gh auth token) pnpm run deploy
```

Then, once: **Settings → Pages → Deploy from a branch → `gh-pages` / `(root)`**.

After that, every push to `main` republishes the site through the included
GitHub Action. Use `pnpm run deploy` (with `run`: `pnpm deploy` is a different,
built-in pnpm command) whenever you want an immediate refresh.

The base URL is detected automatically for project sites
(`{owner}.github.io/{repo}`), user sites (`{owner}.github.io`) and custom
domains (`deploy.customDomain` in `data/site.json`).

### What syncs from GitHub

- **Repositories** via a single paginated GraphQL query: stars, topics,
  languages with official colors, last commit, latest release, license.
- **Pinned repositories** become your featured projects and the Top Repo of the
  Bento grid. To change what is highlighted, change your pins on GitHub.
- **Preview images** are discovered automatically: a `preview`, `screenshot`,
  `cover`, `hero`, `banner` or `social-preview` image in `.github/`, the repo
  root or `docs/`; otherwise the first non-badge image of the README; otherwise
  the repository's custom social image; otherwise a local placeholder.
- **Story events**: pinned repositories and their latest releases appear in the
  GitHub Story on their own.

Need to override something for a single repository? Add an optional
`.repo-story.json` to its root:

```json
{ "preview": "docs/hero.png", "hidden": false, "story": true }
```

You can also hide a repository with the `portfolio-hidden` topic.

## Features

- Bento grid: profile, availability, Top Repo, language bar, latest activity.
- GitHub Story: work, education, milestones, pinned repos and releases as a
  Git graph with lanes for overlapping experiences.
- Explore all repositories: tabs, search, language filter, sort, shareable URLs.
- Static, SEO-friendly detail page per project with a sanitized README.
- `/cv` print-ready page (save as PDF from the browser) and `/resume.json` in
  JSON Resume format.
- English by default, extra languages by adding a JSON file.
- No runtime calls to the GitHub API, no cookies, no backend, free to host.

## Stack

Nuxt 4 (SSG) · Vue 3 · TypeScript strict · Tailwind CSS 4 · Nuxt UI · Nuxt Icon ·
Nuxt Fonts · Nuxt i18n · VueUse · Zod · AutoAnimate · GitHub GraphQL API ·
`gh-pages`

Build-time only: `markdown-it` + Shiki + `sanitize-html`. Quality: Vitest,
Playwright + axe, byte budgets, Lighthouse CI (report).

## Documentation

| Doc | Content |
| --- | --- |
| [docs/README.md](docs/README.md) | Index, golden rule, review rules |
| [01 — Vision](docs/01-visione-e-obiettivi.md) | Problem, positioning, users, metrics |
| [02 — Features](docs/02-feature.md) | Pillars, acceptance criteria, backlog |
| [03 — Architecture](docs/03-architettura.md) | Rendering, GraphQL data flow, layers |
| [04 — Tech stack](docs/04-tech-stack.md) | Libraries and configuration |
| [05 — Data](docs/05-dati-e-contenuti.md) | `data/`, schemas, preview discovery, story |
| [06 — Design](docs/06-design-system.md) | Engineered Minimalism, tokens, Git graph, a11y |
| [07 — Deploy](docs/07-infrastruttura-deploy.md) | `pnpm run deploy`, GitHub Pages, runbook |
| [08 — Quality](docs/08-qualita-testing.md) | Tests, budgets, conventions |
| [09 — Roadmap & ADRs](docs/09-roadmap-e-adr.md) | Milestones, decisions, coherence review |

The documentation is written in Italian; code, file names and commit messages
are in English.

## Repository layout (today)

```text
docs/                                  documentation (Italian)
public/repo-placeholder/               deterministic project placeholders
public/favicon.ico
.github/RepoPortfolio-.../index.png    repository preview (legacy path, still detected)
```

## Roadmap snapshot

1. **M1** — Nuxt scaffold, `data/`, dark-first tokens, i18n, one-command deploy.
2. **M2** — GraphQL engine, preview discovery, Explore.
3. **M3** — Project detail + README.
4. **M4** — Bento grid + GitHub Story with lanes and automatic events.
5. **M5** — CV & export.
6. **M6** — Quality gates and cutover.

## Previous version

The legacy demo is still online for reference:
[elpiu.github.io/RepoPortfolio-Your-GitHub-Story](https://elpiu.github.io/RepoPortfolio-Your-GitHub-Story/).

## License

[MIT](LICENSE)
