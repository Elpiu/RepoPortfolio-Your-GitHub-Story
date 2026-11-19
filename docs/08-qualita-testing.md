# 08 — Qualità e testing

## Strategia

La piramide è sbilanciata verso i test veloci, perché la maggior parte della
logica critica (normalizzazione, filtri, contenuti) è pura e testabile senza
browser.

```text
        ┌─────────────────────┐
        │ E2E + a11y + budget │  poche, sui flussi critici
        ├─────────────────────┤
        │ Component test      │  interazioni isolate
        ├─────────────────────┤
        │ Unit test           │  logica pura, schemi, markdown
        └─────────────────────┘
```

Regola: **nessun test contro l'API GitHub reale** in CI. Si usano fixture
versionate; l'integrazione reale è verificata dal deploy su push e dallo smoke
test.

## Tooling

| Strumento | Ruolo |
| --- | --- |
| `vitest` | Unit test |
| `@nuxt/test-utils` | Setup Nuxt nei test |
| `@vue/test-utils` | Montaggio componenti |
| `happy-dom` | DOM veloce per unit/component |
| `@playwright/test` | E2E su output statico |
| `@axe-core/playwright` | Accessibilità automatica |
| `scripts/check-budget.mjs` | Budget in byte (gate deterministico) |
| `scripts/serve-static.mjs` | Serve `.output/public` come GitHub Pages per E2E e Lighthouse |
| `@lhci/cli` | Report Lighthouse (informativo, non bloccante; via `pnpm dlx`) |
| `lychee` | Link rotti (settimanale) |
| `eslint` + `prettier` | Stile e qualità statica |
| `vue-tsc` (`nuxt typecheck`) | Tipi |

## Script

```jsonc
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "build:site": "node scripts/build-site.mjs",
    "check:budget": "node scripts/check-budget.mjs",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "nuxt typecheck",
    "test:unit": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test --grep @a11y",
    "test": "pnpm lint && pnpm typecheck && pnpm test:unit"
  }
}
```

Non esiste un comando di pubblicazione: si pubblica con un push sul branch di
default (ADR-030). I JSON Schema in `data/schema/` vengono riscritti dal modulo
`validate-data` a ogni `dev`/`generate`; la CI verifica che siano committati
aggiornati con `git diff --exit-code data/schema`.

## Matrice dei test

| Area | Unit | Component | E2E | Note |
| --- | :---: | :---: | :---: | --- |
| Normalizzazione GitHub (REST) | ✓ | | | Fixture con edge case |
| Esclusioni (fork, archived, profilo, topic, manifest) | ✓ | | | Motivo loggato |
| Featured per stelle | ✓ | | | Ordine stelle/aggiornamento |
| Slug e collisioni | ✓ | | | |
| Discovery preview / placeholder | ✓ | | | Ordine delle sorgenti, badge scartati, determinismo |
| `.repo-story.json` | ✓ | | | Valido, invalido, troppo grande |
| Language stats | ✓ | | | Conteggi per linguaggio principale, colori, "Other" |
| Activity | ✓ | | | Solo `pushedAt`, commit null |
| Story events + deduplicazione | ✓ | | | Curato vince su automatico; featured per stelle |
| Lane del grafo | ✓ | ✓ | | Sovrapposizioni, massimo 3 lane |
| Filtri/ricerca/sort | ✓ | ✓ | ✓ | Tab + URL |
| Validazione `data/` (tutte le lingue) | ✓ | | | Parità chiavi, errori leggibili |
| Base URL / repo context | ✓ | | | Project site, user site, dominio custom |
| Date tecniche e relative | ✓ | ✓ | | UTC, nessun relativo in SSR |
| Markdown + sanitizzazione | ✓ | | | XSS |
| Export JSON Resume | ✓ | | ✓ | Schema JSON Resume |
| Bento Grid | | ✓ | ✓ | Ordine, stati |
| LanguageBar | | ✓ | | Legenda, percentuali |
| GitGraph | | ✓ | ✓ | Nodi, lane, disclosure |
| StatusDot | | ✓ | | Testo, reduced motion |
| ProjectCard | | ✓ | | Stati vuoti, spotlight, topic overflow |
| ProjectFilters | | ✓ | ✓ | Reset, tastiera |
| ExploreTabs | | ✓ | ✓ | Pattern ARIA tabs |
| CV | | ✓ | ✓ | Stampa, struttura |
| Tema | | ✓ | ✓ | Persistenza, nessun flash |
| Lingua | | ✓ | ✓ | URL, nessun redirect, nessun cookie |
| SEO | | | ✓ | Meta, canonical, hreflang |
| A11y | | | ✓ | axe |
| Performance | | | ✓ | Budget in byte (gate), LHCI (report) |
| 404 | | | ✓ | Status |
| No richieste GitHub | | | ✓ | Network |

## Unit test

### Normalizzazione

```ts
// tests/unit/normalize.spec.ts
import { describe, expect, it } from 'vitest'
import { normalizeRepositories } from '~~/server/utils/normalize'

const config = {
  username: 'me',
  excludedRepos: ['hidden'],
  includeForks: false,
  includeArchived: false,
  excludeProfileRepo: true,
}

// node REST ridotti; il resto dei campi viene dalla fixture
const nodes = [
  repoNode({ id: 1, name: 'alpha', default_branch: 'develop' }),
  repoNode({ id: 2, name: 'forked', fork: true }),
  repoNode({ id: 3, name: 'old', archived: true }),
  repoNode({ id: 4, name: 'hidden' }),
  repoNode({ id: 5, name: 'me' }), // repository profilo
  repoNode({ id: 6, name: 'secret', topics: ['portfolio-hidden'] }),
  repoNode({ id: 7, name: 'quiet' }),
]

describe('normalizeRepositories', () => {
  it('applica tutte le regole di esclusione', () => {
    const result = normalizeRepositories(nodes, config).repositories
    expect(result.map((r) => r.name)).toEqual(['alpha'])
  })

  it('non assume il branch main', () => {
    const result = normalizeRepositories(nodes, config).repositories
    expect(result[0]?.defaultBranch).toBe('develop')
  })

  it('esclude il manifest hidden', () => {
    const result = normalizeRepositories(nodes, {
      ...config,
      manifests: new Map([['alpha', { hidden: true, story: true }]]),
    }).repositories
    expect(result).toHaveLength(0)
  })
})
```

### Preview

```ts
// tests/unit/preview.spec.ts
import { describe, expect, it } from 'vitest'
import { resolvePreview } from '~~/server/utils/preview'

describe('resolvePreview', () => {
  it('trova un file per convenzione in .github per i featured', async () => {
    const result = await resolvePreview(repoNode({}), {
      featured: true,
      head: async (url) => url.endsWith('/.github/preview.png'),
    })
    expect(result.previewSource).toBe('convention')
    expect(result.previewImage).toMatch(/\/\.github\/preview\.png$/)
  })

  it('scarta i badge del README', async () => {
    const readme = '![ci](https://img.shields.io/badge/x.svg)\n![shot](docs/shot.png)'
    const result = await resolvePreview(repoNode({}), {
      readme,
      head: async () => true,
    })
    expect(result.previewImage).toMatch(/docs\/shot\.png$/)
  })

  it('ricade sul placeholder deterministico', async () => {
    const result = await resolvePreview(repoNode({}), {
      head: async () => false,
    })
    expect(result).toMatchObject({ previewSource: 'placeholder', previewImage: null })
  })
})
```

### Lane della story

```ts
// tests/unit/story-graph.spec.ts
import { describe, expect, it } from 'vitest'
import { layoutStory } from '~~/shared/utils/story-graph'

describe('layoutStory', () => {
  it('mette due esperienze sovrapposte su lane diverse', () => {
    const { nodes } = layoutStory([
      { id: 'job', type: 'work', start: '2021-01', end: null },
      { id: 'uni', type: 'education', start: '2019-09', end: '2022-07' },
    ], { now: '2026-10' })
    const lanes = new Set(nodes.map((n) => n.lane))
    expect(lanes.size).toBe(2)
  })

  it('non supera 3 lane', () => {
    const overlapping = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i}`, type: 'work' as const, start: '2020-01', end: '2021-01',
    }))
    const { nodes } = layoutStory(overlapping, { now: '2026-10' })
    expect(Math.max(...nodes.map((n) => n.lane))).toBeLessThanOrEqual(2)
  })
})
```

### Base URL

```ts
// tests/unit/repo-context.spec.ts
import { describe, expect, it } from 'vitest'
import { resolveSiteUrls } from '~~/scripts/repo-context.mjs'

describe('resolveSiteUrls', () => {
  it('project site', () => {
    expect(resolveSiteUrls({ owner: 'me', repo: 'portfolio' }, null).baseURL).toBe('/portfolio/')
  })

  it('user site', () => {
    expect(resolveSiteUrls({ owner: 'Me', repo: 'me.github.io' }, null).baseURL).toBe('/')
  })

  it('dominio custom', () => {
    const urls = resolveSiteUrls({ owner: 'me', repo: 'portfolio' }, 'cv.example.com')
    expect(urls).toEqual({ baseURL: '/', siteUrl: 'https://cv.example.com/' })
  })
})
```

### Filtri

```ts
// tests/unit/filters.spec.ts
import { describe, expect, it } from 'vitest'
import { filterProjects } from '~~/app/composables/useProjectFilters'

const projects = [
  { name: 'nuxt-portfolio', topics: ['nuxt', 'vue'], language: 'TypeScript', stars: 10, updatedAt: '2026-01-01T00:00:00Z' },
  { name: 'java-api', topics: ['spring'], language: 'Java', stars: 50, updatedAt: '2025-01-01T00:00:00Z' },
]

describe('filterProjects', () => {
  it('cerca in nome e topics, case-insensitive', () => {
    expect(filterProjects(projects, { q: 'NUXT' })).toHaveLength(1)
    expect(filterProjects(projects, { q: 'spring' })).toHaveLength(1)
  })

  it('combina filtri in AND', () => {
    expect(filterProjects(projects, { q: 'nuxt', language: 'Java' })).toHaveLength(0)
  })

  it('ordina per stelle desc', () => {
    const result = filterProjects(projects, { sort: 'stars' })
    expect(result[0]?.name).toBe('java-api')
  })
})
```

### Dati owner

```ts
// tests/unit/data.spec.ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import site from '~~/data/site.json'
import { profileSchema } from '~~/shared/schemas/profile'
import { siteSchema } from '~~/shared/schemas/site'

const profiles = Object.fromEntries(
  site.locales.map(({ code }) => [
    code,
    profileSchema.parse(JSON.parse(readFileSync(`data/profile/${code}.json`, 'utf8'))),
  ]),
)

describe('data/', () => {
  it('site.json è valido e ha esattamente una lingua di default', () => {
    const parsed = siteSchema.parse(site)
    expect(parsed.locales.filter((l) => l.default)).toHaveLength(1)
  })

  it('tutte le lingue hanno la stessa struttura di esperienze', () => {
    const ids = Object.values(profiles).map((p) => p.experiences.map((e) => e.id).sort())
    for (const list of ids) expect(list).toEqual(ids[0])
  })

  it('hanno al massimo un lavoro corrente', () => {
    for (const profile of Object.values(profiles)) {
      const current = profile.experiences.filter((e) => e.type === 'work' && e.end === null)
      expect(current.length).toBeLessThanOrEqual(1)
    }
  })

  it('un profilo minimo è valido', () => {
    const minimal = {
      locale: 'en',
      meta: { name: 'A', fullName: 'A B', role: 'dev', tagline: 'x' },
      about: { paragraphs: ['x'] },
    }
    expect(() => profileSchema.parse(minimal)).not.toThrow()
  })
})
```

### Markdown e XSS

```ts
// tests/unit/readme.spec.ts
import { describe, expect, it } from 'vitest'
import { renderReadme } from '~~/server/utils/readme'
import { fixtureRepositories } from '../helpers/repositories'

const repository = fixtureRepositories().find((repo) => repo.name === 'alpha')!

describe('renderReadme', () => {
  it('rimuove script e handler', async () => {
    const { html } = await renderReadme(
      '<script>alert(1)</script><img src=x onerror=alert(1)>',
      repository,
      'Elpiu',
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })

  it('risolve le immagini relative', async () => {
    const { html } = await renderReadme('![x](img/a.png)', repository, 'Elpiu')
    expect(html).toContain('https://raw.githubusercontent.com/Elpiu/alpha/develop/img/a.png')
  })

  it('rende i link esterni sicuri', async () => {
    const { html } = await renderReadme('[x](https://example.com)', repository, 'Elpiu')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})
```

## Component test

Casi minimi:

- `ProjectCard`: descrizione assente, topics > 5, preview null, stelle
  formattate, link principale e link demo separati.
- `ProjectFilters`: ricerca debounced, reset, stato vuoto, label accessibili.
- `ExploreTabs`: roving tabindex, cambio tab, stato selezionato.
- `LanguageBar`: percentuali sommano a 100, legenda testuale, stato vuoto.
- `GitGraph`: nodi nell'ordine corretto, lane per esperienze sovrapposte,
  SVG `aria-hidden`, disclosure accessibile, link.
- `StatusDot`: testo obbligatorio, pulse assente con reduced motion.
- `BentoGrid`: ordine mobile, Top Repo (più stellato), Activity con "Last
  synced", quick actions.
- `TechDate`: in SSR solo data assoluta; dopo il mount relativa, assoluta in
  `datetime` e `title`.
- `CopyButton`: feedback "copiato" annunciato.
- `ThemeToggle`: ciclo dark/light/system e persistenza.
- `LocaleSwitcher`: mantiene il path corrente; non renderizzato con una lingua.
- `PrintButton`: chiama `window.print()`, nascosto in `@media print`.

## E2E

Gli E2E girano sull'output di `pnpm generate` (in CI offline, con la fixture),
serviti da `scripts/serve-static.mjs` su `localhost:4173`. Le richieste fuori da
localhost vengono registrate e bloccate (fixture `externalRequests`), quindi i
test sono ermetici e verificano che a runtime partano solo immagini GitHub. I
dati attesi si leggono dalla stessa cartella dati della build:
`PORTFOLIO_DATA_DIR=datasets/me pnpm test:e2e` verifica un dataset alternativo.

In locale di norma si usa lo snapshot reale, in CI la fixture: per riprodurre la CI
si sposta `.cache` e si lancia con `CI=1` e `GITHUB_OFFLINE=1` (fixture con
README con codice, che lo snapshot può non avere). `goto` e `reload` della fixture
E2E aspettano la fine dell'idratazione; axe gira con le transizioni disattivate.

Implementati (`tests/e2e/*.spec.ts`, 52 test; `E2E_PORT` se la 4173 è
occupata): offset delle ancore sotto l'header, filtri che non spostano la
pagina, home/Bento, nessuna richiesta
esterna, id legacy e hash, date assolute nell'HTML, story espandibile e filtri
per tipo (default Lavoro, `?story=`), ricerca
con URL e reload, stato vuoto, tab ARIA da tastiera, filtro linguaggio,
dettaglio e ritorno, README senza script, 404 (status, `noindex`), lingua senza
redirect e switch sulla pagina equivalente senza cookie, tema persistito, copia
email annunciata, motion ridotto, CV in stampa, `/resume.json` e
`/{locale}/resume.json`, SEO (canonical, hreflang, OG, JSON-LD), sitemap e
robots, axe in tema chiaro e scuro su home, CV, dettaglio, 404 e lingue
aggiuntive, 320 px senza scroll orizzontale, skip link.

Scenari Playwright (`tests/e2e/`):

1. **Home / Bento** — 200, un solo `h1`, Bento con profilo, top repo, language
   bar e activity; nessuna richiesta di **dati** a `api.github.com` (le immagini
   preview su `raw.githubusercontent.com` sono ammesse).
2. **GitHub Story** — i nodi sono nell'ordine cronologico, si espandono e
   collassano, i link repo/demo sono corretti.
3. **Filtri** — seleziona un tab e un linguaggio, cerca, verifica contatore;
   reload mantiene la query; reset pulisce.
4. **Dettaglio** — click su una card, README visibile, link GitHub corretto,
   back alla home.
5. **Lingua** — con `Accept-Language: it` la root resta in inglese (nessun
   redirect); switch su IT da un dettaglio, resta sul dettaglio
   (`/it/projects/...`), `<html lang>` cambia, canonical aggiornato; nessun
   cookie scritto.
6. **Tema** — default scuro, cambio tema, reload, preferenza mantenuta senza
   flash.
7. **Copia email** — permesso clipboard, feedback visibile.
8. **404** — URL inesistente restituisce 404 e pagina localizzata.
9. **Responsive** — 320 px senza scroll orizzontale; Bento in colonna singola;
   Git Graph leggibile.
10. **Reduced motion** — `emulateMedia({ reducedMotion: 'reduce' })`, nessun
    pulse, nessun riordino animato, nessuno spotlight.
11. **Spotlight** — con mouse la card resta leggibile; senza mouse non manca
    nulla.
12. **CV** — `/cv` e `/it/cv` mostrano gli stessi dati della home;
    `emulateMedia({ media: 'print' })` nasconde header, footer e pulsanti.
13. **Export** — `/resume.json` risponde 200 ed è valido rispetto allo schema
    JSON Resume.
14. **A11y** — axe su home, dettaglio, CV, 404, tutte le lingue (tag `@a11y`).
15. **SEO** — title/description unici, canonical, hreflang, OG, JSON-LD valido.
16. **Sitemap** — contiene tutte le rotte generate (incluso `/cv`), nessun 404.

```ts
// tests/e2e/home.spec.ts
import { expect, test } from '@playwright/test'

test('la home non chiama le API GitHub', async ({ page }) => {
  const calls: string[] = []
  page.on('request', (req) => {
    if (/api\.github\.com/.test(req.url())) {
      calls.push(req.url())
    }
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('[data-testid="project-card"]').first()).toBeVisible()
  expect(calls).toEqual([])
})
```

## Accessibilità

Automatico:

- axe su ogni pagina e locale, con `@axe-core/playwright`.
- Zero violazioni `critical`/`serious` come gate.

Manuale, prima della release:

- Navigazione completa da tastiera (header, tab, filtri, story, dettaglio,
  contatti, CV).
- Focus visibile e ordine logico.
- `Esc` su menu/overlay e ritorno del focus.
- Screen reader: NVDA o VoiceOver sui flussi home → filtro → dettaglio →
  contatto.
- Zoom 200% e viewport 320 px.
- Contrasto con tool (non a occhio).
- Reduced motion.

## Performance

### Budget in byte (gate)

Verificati da `scripts/check-budget.mjs` sull'output di `pnpm generate`:
deterministici, quindi bloccanti.

| Voce | Target |
| --- | --- |
| JS iniziale route `/` (script e `modulepreload`; i `prefetch` di altre pagine sono riportati a parte) | < 180 KB gzip |
| CSS iniziale | < 40 KB gzip |
| Font totali | < 100 KB |
| Payload home (`_payload.json`) | < 80 KB gzip |
| Payload dettaglio | < 80 KB gzip |

### Obiettivi di esperienza (report)

Misurati da Lighthouse CI e riportati nella PR, **non bloccanti**: su runner
condivisi i punteggi variano da un run all'altro.

| Metrica | Target |
| --- | --- |
| Lighthouse Performance (mobile) | ≥ 95 |
| Lighthouse Accessibility | 100 |
| LCP | < 2,5 s |
| CLS | < 0,1 |
| TBT | < 200 ms |

```jsonc
// lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "node scripts/serve-static.mjs --port 4180",
      "startServerReadyPattern": "serve-static",
      "url": ["http://localhost:4180/", "http://localhost:4180/it/", "http://localhost:4180/cv"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.95 }],
        "categories:accessibility": ["warn", { "minScore": 1 }],
        "categories:best-practices": ["warn", { "minScore": 0.95 }],
        "categories:seo": ["warn", { "minScore": 1 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 200 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

### Controlli specifici

- Nessuna richiesta a `fonts.googleapis.com`, `fonts.gstatic.com`,
  `api.iconify.design`.
- Nessun font `preload` inutile.
- Immagini con `width`/`height` o `aspect-ratio`.
- Nessun layout shift da filtri o dal passaggio data assoluta → relativa.
- Nessuna data relativa nell'HTML statico (test sull'output generato).

## SEO

- Title e description unici per pagina e locale.
- Un solo `h1` per pagina.
- Canonical assoluto con baseURL corretto.
- `hreflang` per tutte le lingue supportate + `x-default` sull'inglese.
- `sitemap.xml` con tutte le rotte, generato dal dataset.
- `robots.txt` con `Sitemap:` assoluto.
- 404 con `noindex` e status 404.
- JSON-LD valido (`Person` su home e CV, `SoftwareSourceCode` sul dettaglio).
- OG/Twitter card con `og-default.png` o, in assenza, l'avatar.
- Nessun contenuto utile solo dopo interazione client (i progetti sono in HTML).

## Quality gate

### Su ogni PR

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test:unit`
- [ ] `pnpm generate` (offline)
- [ ] `git diff --exit-code data/schema` (JSON Schema aggiornati)
- [ ] `pnpm check:budget`
- [ ] E2E Chromium
- [ ] axe (`@a11y`)
- [ ] Lighthouse CI (report, non bloccante)
- [ ] Build senza warning critici

### Su `main`

- [ ] Tutto quanto sopra
- [ ] `deploy.yml`: `pnpm build:site` e `actions/deploy-pages`
- [ ] Smoke test (`build.json` del run e del commit, sitemap, 404)
- [ ] Deploy su push, schedule settimanale e dispatch manuale verdi

### Settimanale

- [ ] lychee sui link
- [ ] `pnpm audit --prod`
- [ ] Dependabot/Renovate review

## Gestione errori

| Livello | Comportamento |
| --- | --- |
| Build — rate limit REST | Snapshot < 7 giorni + warning; altrimenti errore con reset del limite |
| Build — schema GitHub | Errore bloccante, messaggio con repo/campo |
| Build — `data/` | Errore bloccante, messaggio con file e percorso del campo |
| Build — `.repo-story.json` invalido | Warning con repo/campo, file ignorato |
| Build — README | Warning, fallback, deploy prosegue |
| Build — API down | Snapshot < 7 giorni + warning; altrimenti errore |
| Runtime — pagina | `error.vue` con messaggio e link home |
| Runtime — dettaglio | 404 localizzata |
| Runtime — clipboard | Toast di errore, selezione manuale dell'email |
| Runtime — immagine | Placeholder deterministico, nessun loop di `onerror` |

Non usare `catch {}` vuoti. Ogni catch o gestisce, o rilancia con contesto, o
logga con un identificativo utile.

## Convenzioni di codice

### Naming

| Elemento | Convenzione | Esempio |
| --- | --- | --- |
| Componenti | PascalCase | `ProjectCard.vue` |
| Composables | `use` + camelCase | `useProjectFilters.ts` |
| Tipi | PascalCase | `Repository` |
| Costanti | SCREAMING_SNAKE | `MAX_README_BYTES` |
| File utility | kebab-case | `normalize-repo.ts` |
| Rotte | kebab-case | `/projects/[slug]` |

### Vue

- `<script setup lang="ts">` sempre.
- Ordine: import, `defineProps`/`defineEmits`, composable, stato, computed,
  metodi, lifecycle.
- Props ed emit tipizzati con soli tipi TypeScript.
- Nessun `any`; `unknown` + zod ai confini.
- Niente logica di business nei template.
- `v-html` solo per `ReadmeContent`, con HTML già sanificato e un commento che
  lo motiva.

### TypeScript

- `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`.
- `import type` per i tipi.
- Union string literal invece di `enum`.
- Le date sono stringhe ISO nel dominio.
- Nessun cast non motivato.

### Stile

- Utility Tailwind con token semantici.
- `@apply` solo per pattern davvero ripetuti.
- Stili scoped solo per prose/README e animazioni complesse.
- Nessun colore arbitrario (`bg-[#123456]`) nei componenti.
- Nessun `!important`.

### i18n

- Nessuna stringa UI nei componenti: solo chiavi `t('...')`.
- Chiavi semantiche e annidate (`projects.filters.search`).
- Le stringhe UI di tutte le lingue fornite dal motore (oggi EN e IT) si
  aggiornano nello stesso commit.
- I contenuti editoriali non vanno in `i18n/`: stanno in `data/profile/`.

### Git

- Branch: `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- Conventional Commits: `feat: add project filters`, `fix: resolve base url`,
  `docs: define architecture`.
- PR piccole e con una sola intenzione.
- Nessun commit di segreti, `.env`, snapshot o artefatti di build. Un push sul
  branch di default pubblica il sito (ADR-030).

## Definition of Done

Una feature è conclusa quando:

- [ ] Ha criteri di accettazione soddisfatti.
- [ ] Ha test unit/component/E2E appropriati.
- [ ] Passa lint, typecheck e quality gate.
- [ ] È accessibile da tastiera e con axe pulito.
- [ ] È tradotta in tutte le lingue fornite dal motore.
- [ ] Non richiede a chi clona di toccare file fuori da `data/`.
- [ ] Funziona a 320 px e con reduced motion.
- [ ] Non introduce richieste esterne a runtime.
- [ ] Rispetta i budget di performance.
- [ ] Rafforza la regola d'oro e non sembra un template generico.
- [ ] La documentazione è aggiornata (se cambia architettura o dati).
- [ ] Il deploy di prova è verde.
