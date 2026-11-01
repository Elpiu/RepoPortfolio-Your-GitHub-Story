# 03 — Architettura

## Driver architetturali

| Driver | Conseguenza |
| --- | --- |
| Deve essere ospitabile gratuitamente e senza server | Generazione statica (`nuxt generate`) |
| I dati devono essere SEO-friendly e indicizzabili | Contenuto nel payload/HTML di build, non fetch client-side |
| GitHub REST pubblico ha rate limit; il token è opzionale | Integrazione GitHub solo a build time, lato Nitro |
| Chi clona deve poter ripubblicare senza toccare il codice | Dati owner solo in `data/*.json`; deploy con un comando |
| I dati si aggiornano a ogni push | Deploy su push + dispatch manuale + snapshot di fallback |
| Inglese default + lingue estensibili, tema chiaro/scuro | Rotte localizzate, color mode con script anti-flash |
| Poche centinaia di repository | Filtro e ricerca client-side sul dataset incorporato |
| Il portfolio è esso stesso una vetrina tecnica | TypeScript strict, schema validation, budget in CI |

## Decisione di rendering: SSG

Il sito è una **Single Page Application generata staticamente**, con pagine
multiple (landing, dettaglio progetto, CV) prerenderizzate.

```text
Build time (locale o GitHub Actions: `pnpm run deploy`)
┌──────────────────────────────────────────────────────────────┐
│ scripts/deploy.mjs                                           │
│   risolve owner/repo/baseURL ──► nuxt generate ──► gh-pages  │
│                                                              │
│ nuxt generate                                                │
│  modules/validate-data ──► data/*.json (zod)                 │
│                                                              │
│  Nitro ──► /api/repositories ──► GitHub REST pubblico      │
│    │            │                  (/users/{username}/repos)│
│    │            ├─ zod validation                            │
│    │            ├─ normalizzazione + discovery preview       │
│    │            ├─ featured per stelle, linguaggi, activity  │
│    │            └─ snapshot .cache/github/last-good.json     │
│    │                                                         │
│    ├──► prerender "/" , "/cv"                                │
│    ├──► prerender "/projects/:slug" ──► raw README (M3)      │
│    ├──► prerender "/resume.json"                             │
│    └──► prerender "/{locale}/..." per ogni lingua            │
│                                                              │
│  Output: .output/public  (HTML + payload JSON + asset)       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
            branch gh-pages ──► GitHub Pages (CDN statica)

Runtime (browser)
HTML + payload già presenti
        │
        ├─ idratazione Vue
        ├─ filtri letti dalla query string
        └─ filtro/ricerca client-side sul dataset incorporato
           (nessuna chiamata a GitHub)
```

**Perché non SSR runtime:** un portfolio non ha dati per-utente. Un server
sempre acceso aggiungerebbe costo, superficie d'attacco e complessità senza
benefici. La freschezza si ottiene con un nuovo deploy (push o dispatch
manuale).

**Perché non fetch client-side:** il contenuto non sarebbe indicizzabile, il
visitatore vedrebbe skeleton e rate limit, e servirebbe un token esposto.

**Perché un solo step di build:** sync dei dati e rendering restano nella stessa
build Nuxt (Nitro). Uno script di sync separato è stato valutato e scartato per
semplicità (ADR-023): l'owner ha un solo comando e una sola cartella da toccare.

## Flusso dati in dettaglio

### 1. Build — dati owner

```text
data/site.json, data/profile/{locale}.json
(oppure la cartella indicata da PORTFOLIO_DATA_DIR, es. datasets/me/ — ADR-029)
        ▼
modules/validate-data.ts   (Nuxt module, gira in dev e in generate)
  - risolve la cartella dati con scripts/data-dir.mjs
  - legge i file dal registry `locales` di site.json (nessun import a mano)
  - valida con gli schemi zod di shared/schemas
  - controlla parità tra lingue, id univoci, al massimo un lavoro corrente
  - fallisce con file + percorso del campo + messaggio
  - riscrive data/schema/*.schema.json dagli schemi zod (z.toJSONSchema)
```

### 2. Build — repository (REST pubblico)

```text
GitHub REST API  GET https://api.github.com/users/{username}/repos
  per_page=100&page=N&sort=pushed&direction=desc&type=owner
  Authorization opzionale: Bearer ${GITHUB_TOKEN} (solo rate limit)

        ▼

server/utils/github-rest.ts
  - paginazione fino a maxRepos
  - retry con backoff su 5xx, 429 e rate limit secondario
  - timeout per richiesta
  - log di x-ratelimit-remaining / reset

        ▼

shared/schemas/github.ts  (zod)
  - valida la risposta grezza
  - errore esplicito con repository e campo

        ▼

server/utils/normalize.ts
  - esclude fork / archived / profilo / excludedRepos /
    topic portfolio-hidden / .repo-story.json hidden
  - slug, size, license, pushedAt, defaultBranch
  - produce Repository[] (modello di dominio)
  - isPinned=false, lastCommit=null, latestRelease=null

        ▼

server/utils/preview.ts
  - discovery della preview (manifest → convenzione per i featured →
    prima immagine del README → placeholder)

server/utils/languages.ts
  - distribuzione per linguaggio principale, colori noti/fallback

server/utils/activity.ts
  - ultimo push dal repository aggiornato più di recente (commit null)

server/utils/story-events.ts
  - nodi automatici dai repository featured per stelle

        ▼

server/api/repositories.get.ts
  - memoizza per build
  - salva snapshot in .cache/github/last-good.json
  - restituisce JSON serializzabile
    (repositories + languageStats + activity + storyEvents + syncedAt)
```

### 3. Build — README (M3)

```text
Per ogni repository incluso (M3):
  GET raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md
  (varianti README.md, readme.md, README.markdown, README.rst)

        ▼

server/utils/readme.ts  (memoizzato per build: serve anche alla preview)
  - limite dimensione (200 KB)
  - markdown-it + plugin GFM
  - risoluzione immagini e link relativi → raw/blob sul default branch
  - code highlight con Shiki (a build time)
  - sanitizzazione HTML (allowlist)
  - estrazione headings per eventuale TOC

        ▼

server/api/repositories/[slug].get.ts
  - restituisce metadati + html già sanificato
```

Il markdown **non viene parsato nel browser**: il client riceve HTML sicuro e
leggero. `markdown-it`, Shiki e il sanitizer restano dipendenze di build.

### 4. Runtime — filtro

```text
Payload della pagina
  └─ projects: Repository[]  (senza README)
  └─ languageStats: LanguageStat[]
  └─ activity: Activity
  └─ storyEvents: StoryEvent[]

useProjectFilters(projects)
  ├─ legge q / lang / tab / sort / page da useRoute().query
  ├─ scrive con router.replace({ query }) (nessuno store)
  ├─ applica tab (Tutti / linguaggio / Open Source), query e linguaggio
  ├─ ordina (rilevanza, stelle, aggiornamento, nome)
  └─ restituisce computed + contatori

ProjectGrid
  └─ renderizza solo i risultati visibili (12 + "carica altri")

useStory(profile, storyEvents, syncedAt)
  └─ unisce esperienze, milestone ed eventi automatici;
     shared/utils/story-graph.ts calcola le lane (funzione pura)
```

Nessuna rete, nessun loading state dopo l'idratazione. Il dataset è piccolo e
immutabile per tutta la vita della pagina.

### 5. Navigazione verso il dettaglio

Nuxt genera per ogni pagina un file `_payload.json`. Al click su una card, il
router carica il payload statico della pagina di dettaglio: i dati sono già
presenti, non viene interrogata alcuna API.

## Layer e confini

```text
┌──────────────────────────────────────────────────────────────┐
│ data/ — dati dell'owner (solo JSON)                          │
│  L'unica cartella che chi clona deve modificare.             │
└──────────────────────────────┬───────────────────────────────┘
                               │ validato da modules/ + shared/
┌──────────────────────────────▼───────────────────────────────┐
│ app/ — presentazione                                         │
│  pages, layouts, components, composables                     │
│  Non conosce GitHub, zod o il filesystem.                    │
└──────────────────────────────┬───────────────────────────────┘
                               │ payload / props / composable
┌──────────────────────────────▼───────────────────────────────┐
│ shared/ — contratto condiviso                                │
│  schemi zod, tipi di dominio, utility pure (slug, format,    │
│  story-graph). Nessun import da app/ o server/.              │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│ server/ — integrazione e build                               │
│  API routes, client REST, normalizzazione, markdown, │
│  cache. Può usare shared/. Non può importare componenti Vue. │
└──────────────────────────────────────────────────────────────┘

i18n/    — stringhe UI (del motore, non dell'owner)
scripts/ — deploy, risoluzione repository, budget
docs/    — questa documentazione
```

Regole:

- **Un solo modello di dominio**: `Repository` è definito in `shared/` e usato
  ovunque. Le forme grezze dell'API GitHub non escono da `server/`.
- **Validazione ai confini**: zod valida l'API GitHub e i JSON in `data/`. I
  componenti si fidano dei tipi.
- **Nessun `any`**: se un dato è sconosciuto, si modella con zod o con un tipo
  esplicito.
- **Nessuna logica di filtro nei componenti**: vive in un composable testabile.
- **Nessuna stringa UI nei componenti**: vive in `i18n/`.
- **Nessun contenuto personale nel codice**: vive solo in `data/`.

## Struttura delle cartelle (Nuxt 4)

```text
.
├─ data/                         # ← modificata da chi clona
│  ├─ site.json
│  ├─ profile/
│  │  ├─ en.json
│  │  └─ it.json
│  └─ schema/                    # JSON Schema generati (autocompletamento)
│     ├─ site.schema.json
│     ├─ profile.schema.json
│     └─ repo-story.schema.json
├─ datasets/                     # payload alternativi, stessa forma di data/ (ADR-029)
│  └─ {nome}/site.json, profile/{locale}.json
├─ app/
│  ├─ app.vue
│  ├─ app.config.ts
│  ├─ error.vue
│  ├─ assets/css/main.css
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppHeader.vue
│  │  │  ├─ AppFooter.vue
│  │  │  ├─ LocaleSwitcher.vue
│  │  │  ├─ ThemeToggle.vue
│  │  │  └─ SkipLink.vue
│  │  ├─ section/
│  │  │  ├─ BentoSection.vue
│  │  │  ├─ StorySection.vue
│  │  │  └─ ExploreSection.vue
│  │  ├─ bento/
│  │  │  ├─ BentoGrid.vue
│  │  │  ├─ ProfileCard.vue
│  │  │  ├─ TopRepoCard.vue
│  │  │  ├─ LanguageBar.vue
│  │  │  └─ ActivityCard.vue
│  │  ├─ story/
│  │  │  ├─ StorySection.vue
│  │  │  ├─ StoryNode.vue        # nodo + segmento SVG del grafo a lane
│  │  │  └─ StoryLegend.vue
│  │  ├─ project/
│  │  │  ├─ ProjectCard.vue
│  │  │  ├─ ProjectGrid.vue
│  │  │  ├─ ExploreTabs.vue
│  │  │  ├─ ProjectFilters.vue
│  │  │  ├─ ProjectStats.vue
│  │  │  ├─ ProjectHero.vue
│  │  │  ├─ ReadmeContent.vue
│  │  │  └─ ProjectImage.vue
│  │  ├─ cv/
│  │  │  ├─ CvDocument.vue
│  │  │  └─ PrintButton.vue
│  │  └─ ui/
│  │     ├─ SectionHeading.vue
│  │     ├─ SectionShell.vue
│  │     ├─ EmptyState.vue
│  │     ├─ ErrorState.vue
│  │     ├─ StatusDot.vue
│  │     ├─ CopyButton.vue
│  │     ├─ TechDate.vue
│  │     ├─ DataIcon.vue          # icone dei dati dal payload, senza v-html
│  │     └─ AppLink.vue
│  ├─ composables/
│  │  ├─ useSiteData.ts
│  │  ├─ useProjects.ts
│  │  ├─ useProjectFilters.ts
│  │  ├─ useStory.ts
│  │  ├─ useSpotlight.ts
│  │  ├─ useActiveSection.ts
│  │  ├─ useRelativeTime.ts
│  │  └─ usePageSeo.ts
│  ├─ layouts/
│  │  ├─ default.vue
│  │  └─ print.vue
│  ├─ pages/
│  │  ├─ index.vue
│  │  ├─ cv.vue
│  │  └─ projects/[slug].vue
├─ modules/
│  ├─ validate-data.ts
│  ├─ prerender-routes.ts
│  └─ icon-bundle.ts             # bundle icone client limitato a quelle usate in app/
├─ server/
│  ├─ api/
│  │  ├─ repositories.get.ts
│  │  ├─ repositories/[slug].get.ts
│  │  ├─ data-icons.get.ts       # icone delle competenze → payload della home
│  │  └─ __sitemap__/urls.ts
│  ├─ routes/
│  │  ├─ resume.json.ts
│  │  └─ [locale]/resume.json.ts
│  └─ utils/
│     ├─ github-rest.ts
│     ├─ http.ts
│     ├─ concurrency.ts
│     ├─ normalize.ts
│     ├─ preview.ts
│     ├─ languages.ts
│     ├─ activity.ts
│     ├─ story-events.ts
│     ├─ dataset.ts
│     ├─ readme.ts
│     ├─ data-icons.ts
│     └─ resume.ts
├─ shared/
│  ├─ schemas/
│  │  ├─ github.ts
│  │  ├─ repository.ts
│  │  ├─ profile.ts
│  │  ├─ site.ts
│  │  └─ repo-story.ts
│  ├─ types/
│  │  └─ index.ts
│  └─ utils/
│     ├─ placeholder.ts
│     ├─ language-colors.ts      # colori noti + fallback deterministico
│     ├─ repo.ts
│     ├─ preview.ts
│     ├─ project-filters.ts
│     ├─ format.ts
│     ├─ profile.ts              # avatar e URL GitHub del profilo
│     ├─ svg-icon.ts             # body Iconify → nodi SVG con allowlist
│     ├─ validation.ts           # loadDataDir: validazione di una cartella dati
│     └─ story-graph.ts
├─ scripts/
│  ├─ deploy.mjs
│  ├─ data-dir.mjs               # PORTFOLIO_DATA_DIR / --data
│  ├─ repo-context.mjs
│  ├─ serve-static.mjs           # output statico come GitHub Pages (E2E, Lighthouse)
│  └─ check-budget.mjs
├─ i18n/locales/
│  ├─ en.json
│  └─ it.json
├─ public/
│  ├─ favicon.ico
│  └─ repo-placeholder/
├─ tests/
│  ├─ unit/
│  ├─ e2e/                       # Playwright + axe sull'output generato
│  ├─ helpers/
│  └─ fixtures/                  # github.json, readmes.json
├─ docs/
├─ nuxt.config.ts
├─ playwright.config.ts
├─ lighthouserc.json
├─ package.json
├─ tsconfig.json
└─ .github/workflows/
   ├─ ci.yml
   ├─ deploy.yml
   └─ weekly.yml                 # lychee + pnpm audit
```

> Nessuna `og-default.png`: l'immagine Open Graph è l'avatar del profilo (Q17).

> Nuxt 4 usa `app/` come `srcDir`. Il codice condiviso tra client e server vive
> in `shared/` ed è auto-importato per tipi e utility pure. Gli schemi zod
> vanno importati esplicitamente per non finire nel bundle client per errore.

## Rotte

| Rotta | Contenuto | Rendering |
| --- | --- | --- |
| `/` | Landing (lingua default): Bento Grid, GitHub Story, Explore | Prerender |
| `/{locale}/` | Stessa landing nelle altre lingue | Prerender |
| `/projects/[slug]`, `/{locale}/projects/[slug]` | Dettaglio progetto | Prerender, uno per repo e lingua |
| `/cv`, `/{locale}/cv` | CV stampabile | Prerender |
| `/resume.json`, `/{locale}/resume.json` | Export JSON Resume | Prerender (server route) |
| `/404` | Pagina non trovata | Statico (`404.html`) |

Le rotte dei dettagli vengono aggiunte a `nitro.prerender.routes` da un hook
`prerender:routes` che legge il dataset memoizzato, così non dipendono dal
crawling dei link (la griglia mostra solo i primi 12). Lo stesso hook genera le
rotte per **tutte** le lingue in `data/site.json`. Per GitHub Pages non serve un
fallback SPA: ogni URL è un file reale.

## Gestione dello stato

Nessuno store globale (ADR-018).

| Stato | Dove | Persistenza |
| --- | --- | --- |
| Repository, linguaggi, activity, story | Payload della pagina (immutabile) | Build |
| Filtri, ricerca, tab, sort, pagina | Query string (`useRoute` + `router.replace`) | URL (condivisibile) |
| Preferenza vista (griglia/lista) | `useStorage` con `initOnMounted` | localStorage |
| Tema | `@nuxtjs/color-mode` (integrato in Nuxt UI) | localStorage + script anti-flash |
| Lingua | Prefisso dell'URL (`@nuxtjs/i18n`) | URL, nessun cookie |
| Menu mobile, disclosure | Stato locale del componente | Nessuna |

Regole:

- Lo stato dei filtri è **derivato e idempotente**: stesso URL = stesso
  risultato, anche dopo un reload.
- Le preferenze persistite vengono lette solo dopo il mount, per evitare
  hydration mismatch. Il tema è l'eccezione, gestita da script prima del paint.
- Le date relative ("2 giorni fa") non vengono mai renderizzate in SSR:
  l'HTML contiene la data assoluta, il relativo arriva dopo il mount
  (`useRelativeTime`).

## SEO e indicizzazione

- `useSeoMeta` per title, description, OG, Twitter.
- Canonical costruito da `runtimeConfig.public.siteUrl` + path.
- `hreflang` per tutte le lingue supportate e `x-default` sulla lingua di
  default.
- JSON-LD: `Person` sulla landing e sul CV, `SoftwareSourceCode` sul dettaglio
  progetto.
- OG image: `public/og/og-default.png` se presente, altrimenti l'avatar del
  profilo. Nessuna immagine generata in build.
- `sitemap.xml` e `robots.txt` generati a build time. La sorgente dinamica\n  `/api/__sitemap__/urls` aggiunge i dettagli progetto per tutte le lingue.
- La 404 è servita come `404.html` con status 404.

## Sicurezza

| Superficie | Misura |
| --- | --- |
| Token GitHub (opzionale) | Solo variabile d'ambiente della build; mai `NUXT_PUBLIC_*` |
| README HTML | Sanitizzazione con allowlist a build time; niente script/iframe/event handler |
| `.repo-story.json` di altri repository | Validato con zod; campi sconosciuti ignorati; se invalido, warning e ignorato |
| Link esterni | `rel="noopener noreferrer"`, `target="_blank"` |
| URL immagini | Solo `https:` e host GitHub consentiti |
| Dipendenze | Dependabot/Renovate, lockfile committed, `pnpm audit` in CI |
| Header | CSP via `<meta>` (limiti in [07](07-infrastruttura-deploy.md#header-di-sicurezza)) |
| Dati owner | Nessun segreto in `data/`; telefono opzionale |
| Errori di build | Messaggi senza token né header di autorizzazione |

## Failure mode

| Scenario | Comportamento |
| --- | --- |
| Token assente | Normale: usa REST pubblico (60 richieste/ora); `GITHUB_OFFLINE=1` usa snapshot o fixture |
| GitHub 5xx/429 durante la build | Retry con backoff; poi snapshot `.cache` se valido; altrimenti build rossa |
| Schema GitHub cambiato | Build rossa con campo e repo; niente deploy silenzioso |
| `.repo-story.json` invalido | Warning con repository e campo; file ignorato |
| README > 200 KB | Troncamento con avviso e link a GitHub (M3) |
| Nessuna preview trovata | Placeholder locale deterministico |
| JSON in `data/` invalido | Build rossa con file e percorso del campo |
| Stringhe UI mancanti per una lingua | Fallback inglese + warning |
| Icona non trovata | Fallback icona generica + warning in build |
| Font non scaricabile | Fallback di sistema; warning, non blocco |
| Rotta dettaglio non generata | Test E2E che confronta numero repo e numero pagine |

## Osservabilità

- Log di build strutturati (`consola`) con conteggi: repository letti, esclusi
  (con motivo), preview per sorgente (manifest, convenzione, README,
  placeholder), README recuperati, fallback usati.
- In GitHub Actions gli stessi numeri finiscono nel job summary
  (`$GITHUB_STEP_SUMMARY`).
- Report Lighthouse CI informativo.
- Nessun logging lato client in produzione, salvo errori critici.

## Alternative considerate

| Alternativa | Perché scartata |
| --- | --- |
| SSR Nuxt su Vercel/Netlify | Costo e complessità inutili per dati uguali per tutti |
| Fetch client-side come il legacy | SEO assente, rate limit, token impossibile |
| Script di sync separato dal sito | Un passaggio in più per l'owner; tutto resta nella build Nuxt |
| GitHub GraphQL | Richiede un token e pinned/release; scartato perché l'owner vuole funzionare senza token |
| `@nuxt/content` per i contenuti | Overkill per pochi file JSON |
| Pinia | Lo stato vive nell'URL e in localStorage; uno store lo duplicherebbe |
| Database/CMS headless | Contro il principio content-as-code e zero backend |
| Next.js (legacy) | Stack scelto: Nuxt/Vue; il legacy resta come riferimento storico |

## Decisioni

Il registro completo delle decisioni (ADR) vive solo in
[09 — Roadmap e decisioni](09-roadmap-e-adr.md#registro-adr). Se una decisione
cambia, aggiornare 09 e poi i documenti che la descrivono.
