# RepoPortfolio — Your GitHub Story

> **A zero-maintenance engine that syncs your GitHub identity into a
> high-performance landing page.**

RepoPortfolio is **not another portfolio template**. It turns repositories,
starred projects, primary languages and activity into a deliberate product experience: a
Bento profile, a GitHub Story drawn as a Git graph with parallel lanes, an
explorable project archive and a printable CV generated from the same data.

The visual direction is **Engineered Minimalism**: dark-first, rigorous grids,
a single Emerald accent, Geist + Geist Mono and Git-native details, inspired by
Linear, Vercel and Raycast.

## Status

**M6 — Quality and cutover.** The full feature set is in place: dark-first
design tokens, localized routes, validated `data/` JSON, a public REST sync (no
token required), the Bento grid, the GitHub Story with lanes, the explorable
repository grid, static project pages with sanitized READMEs, a printable CV and
a JSON Resume export. Quality gates run locally and in CI: lint, typecheck,
unit tests, byte budgets, Playwright E2E with axe (light and dark themes, 320
px, reduced motion) and a Lighthouse report. The first public deploy is the
remaining step. Product and technical decisions live in
[`docs/`](docs/README.md).

## How it works

1. Use this repository as a template (or fork it).
2. Edit the JSON files in `data/`. Nothing else.
3. Commit to your default branch. GitHub Actions publishes the site.

### Publish on GitHub Pages

1. **Once:** in your repository open **Settings → Pages** and set **Source** to
   **GitHub Actions**.
2. Edit `data/site.json` and `data/profile/en.json`, then commit and push to your
   default branch. You can do it from the GitHub web editor too:

   ```bash
   git add data
   git commit -m "docs: update my profile"
   git push
   ```

That's it. Every push to the default branch rebuilds and publishes the site
(follow it in the **Actions** tab; it takes a few minutes), and the workflow then
checks that the new version is online. Your site is at
`https://{owner}.github.io/{repo}/`.

- **No token and no secrets to configure.** The build reads public repositories
  through the REST API with the token GitHub Actions already provides.
- **Refresh without committing** (new stars, READMEs, repositories): **Actions →
  Deploy → Run workflow**.
- **Base URL:** detected automatically for project sites and user sites
  (`{owner}.github.io`).
- **Custom domain:** set `deploy.customDomain` in `data/site.json` and enter the
  same domain once in **Settings → Pages → Custom domain**.

If the first run fails with a permissions error on the `github-pages`
environment, check that **Source** is set to **GitHub Actions** and re-run it.

### Your data

```text
data/
├─ site.json          # contacts, languages, exclusions, story options
└─ profile/
   ├─ en.json         # your story in the default language
   └─ it.json         # optional extra languages
```

Every JSON file points to a generated JSON Schema, so your editor autocompletes
fields and flags mistakes as you type. An invalid file stops `pnpm dev` and
`pnpm generate` with the file, the field path and a readable message.

### Work locally (optional)

Publishing needs nothing on your machine. To preview changes first:

```bash
pnpm install
pnpm dev
```

No network? `GITHUB_OFFLINE=1 pnpm dev` uses the last GitHub snapshot or the
bundled fixture. In dev a snapshot younger than 24 hours is reused, so the
server starts fast; set `GITHUB_REFRESH=1` to sync again.

To see the site exactly as it will be published (same base URL, same data,
real 404), without publishing:

```bash
pnpm preview:deploy
```

### More than one dataset

`data/` is the default payload. You can keep other payloads with the same shape
in `datasets/{name}/` (this repository ships the owner's own in
`datasets/elpiu/`) and pick one without touching any code:

- **On GitHub Pages:** add the repository variable `PORTFOLIO_DATA_DIR` =
  `datasets/elpiu` in **Settings → Secrets and variables → Actions → Variables**,
  before the push that should publish it.
- **Locally:** put `PORTFOLIO_DATA_DIR=datasets/elpiu` in `.env`, or run
  `pnpm preview:deploy -- --data datasets/elpiu`.

Unit tests validate `data/` and every folder in `datasets/`. If you cloned this
repository for yourself, delete `datasets/`.

### What syncs from GitHub

- **Repositories** via the public REST API (no token required, optional token
  for a higher rate limit): stars, forks, topics, license, primary language,
  size and dates.
- **Featured projects** are the repositories with the most stars. Pinned
  repositories are a GraphQL-only feature and are not read in public mode.
- **Preview images** are discovered automatically: an optional
  `.repo-story.json`, known preview files for the featured repositories, the
  first non-badge image of the README, otherwise a local placeholder.
- **Story events**: the featured repositories appear in the GitHub Story on
  their own. Latest releases are not available through the public REST list.
- **Activity**: the most recently pushed repository, without the last commit
  hash or message.

Need to override something for a single repository? Add an optional
`.repo-story.json` to its root:

```json
{ "preview": "docs/hero.png", "hidden": false, "story": true }
```

You can also hide a repository with the `portfolio-hidden` topic.

### Quality checks

```bash
pnpm lint && pnpm typecheck && pnpm test:unit
pnpm generate && pnpm check:budget
pnpm exec playwright install chromium   # once
pnpm test:e2e                           # E2E + axe on the generated site
```

## Features

- Bento grid: profile, availability, Top Repo, language bar, latest activity.
- GitHub Story: work, education, featured repositories and milestones as a Git
  graph with lanes for overlapping experiences.
- Explore all repositories: tabs, search, language filter, sort, shareable URLs.
- Static, SEO-friendly detail page per project with a sanitized README.
- Optional reading list: add `books` to your profile and a Reading section
  appears; leave it empty and it does not exist.
- `/cv` print-ready page (save as PDF from the browser) and `/resume.json` in
  JSON Resume format.
- English by default, extra languages by adding a JSON file.
- No runtime calls to the GitHub API, no cookies, no backend, free to host.

## Stack

Nuxt 4 (SSG) · Vue 3 · TypeScript strict · Tailwind CSS 4 · Nuxt UI · Nuxt Icon ·
Nuxt Fonts · Nuxt i18n · VueUse · Zod · GitHub REST API ·
GitHub Actions + Pages

Build-time only: `markdown-it` + Shiki + `sanitize-html`. Quality: Vitest,
Playwright + axe, byte budgets, Lighthouse CI (report).

## Documentation

| Doc | Content |
| --- | --- |
| [docs/README.md](docs/README.md) | Index, golden rule, review rules |
| [01 — Vision](docs/01-visione-e-obiettivi.md) | Problem, positioning, users, metrics |
| [02 — Features](docs/02-feature.md) | Pillars, acceptance criteria, backlog |
| [03 — Architecture](docs/03-architettura.md) | Rendering, public REST data flow, layers |
| [04 — Tech stack](docs/04-tech-stack.md) | Libraries and configuration |
| [05 — Data](docs/05-dati-e-contenuti.md) | `data/`, schemas, preview discovery, story |
| [06 — Design](docs/06-design-system.md) | Engineered Minimalism, tokens, Git graph, a11y |
| [07 — Deploy](docs/07-infrastruttura-deploy.md) | Publishing from GitHub Actions, GitHub Pages, runbook |
| [08 — Quality](docs/08-qualita-testing.md) | Tests, budgets, conventions |
| [09 — Roadmap & ADRs](docs/09-roadmap-e-adr.md) | Milestones, decisions, coherence review |

The documentation is written in Italian; code, file names and commit messages
are in English.

## Repository layout

```text
app/                                   Nuxt pages, layouts, components, composables
data/                                  default owner JSON + generated JSON Schemas
datasets/                              alternative payloads (PORTFOLIO_DATA_DIR)
modules/                               data validation, prerender routes, icon bundle
server/                                build-time GitHub sync, README rendering, exports
shared/                                zod schemas, domain types, pure utilities
i18n/locales/                          UI strings supplied by the engine
scripts/                               deploy, data dir, repo context, budgets, static server
tests/unit/                            fast tests for data and pure logic
tests/e2e/                             Playwright + axe on the generated site
docs/                                  documentation (Italian)
public/repo-placeholder/               deterministic project placeholders
.github/RepoPortfolio-.../index.png    repository preview (legacy path, still detected)
```

## Roadmap snapshot

1. **M1** — Nuxt scaffold, `data/`, dark-first tokens, i18n, one-command deploy.
2. **M2** — Public REST engine, preview discovery, Explore.
3. **M3** — Project detail + README.
4. **M4** — Bento grid + GitHub Story with lanes and automatic events.
5. **M5** — CV & export.
6. **M6** — Quality gates and cutover.

## Previous version

The legacy demo is still online for reference:
[elpiu.github.io/RepoPortfolio-Your-GitHub-Story](https://elpiu.github.io/RepoPortfolio-Your-GitHub-Story/).

## License

[MIT](LICENSE)
