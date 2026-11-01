# 04 — Tech stack

## Principi di selezione

- **Un solo strumento per problema.** Niente due librerie che fanno la stessa
  cosa.
- **Ogni dipendenza è manutenzione.** Anche per chi clona: ogni pacchetto in più
  è una PR di aggiornamento in più. Se la piattaforma (Nuxt, Vue, `Intl`, CSS)
  copre il bisogno, non si aggiunge una libreria.
- **Build-time quando possibile.** Markdown, sintassi, validazione e fetch dei
  dati non devono pesare sul browser.
- **Nessuna chiamata esterna a runtime.** Font, icone e dati sono locali; le
  sole eccezioni sono le immagini GitHub (ADR-013).
- **Compatibilità con l'ecosistema Nuxt.** Moduli ufficiali o mantenuti, non
  integrazioni artigianali.
- **Versioni pinnate.** Major bloccati, minor aggiornati da Renovate/Dependabot.

Versioni indicate come major di riferimento; le versioni esatte vengono
bloccate al momento dello scaffold con il lockfile.

## Framework e core

| Pacchetto | Versione | Ruolo | Note |
| --- | --- | --- | --- |
| `nuxt` | 4.x | Framework Vue 3, routing, SSG, Nitro, auto-import | `nuxt generate` → `.output/public` |
| `vue` | 3.5+ | Runtime UI | Composition API + `<script setup lang="ts">` |
| `typescript` | 5.x | Tipizzazione | `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` |
| `vite` | incluso in Nuxt | Build/dev server | Configurazione minima |
| `nitro` | incluso in Nuxt | Server di build e prerender | Usato solo a build time |
| `tailwindcss` | 4.x | Utility CSS, design token CSS-first | Nessun `tailwind.config.js` |

### TypeScript

`tsconfig.json` estende il generato da Nuxt e aggiunge:

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true
  }
}
```

Il typecheck gira in CI con `nuxt typecheck` (vue-tsc). Nessun `any` implicito;
le eccezioni vanno motivate con un commento e un tipo più preciso quando
possibile.

## Moduli Nuxt

| Modulo | Ruolo | Configurazione chiave |
| --- | --- | --- |
| `@nuxt/ui` | Componenti accessibili su Tailwind 4 + Reka UI | Colori in `app.config.ts`, stile riallineato ai token |
| `@nuxt/icon` | Icone Lucide + Simple Icons | `clientBundle.scan`, `serverBundle: 'local'` |
| `@nuxt/fonts` | Self-hosting di Geist e Geist Mono | Provider Google solo a build time |
| `@nuxtjs/i18n` | Lingue da `data/site.json`, rotte localizzate | `prefix_except_default`, nessun rilevamento |
| `@vueuse/nuxt` | Composable per storage, intersection, media query | Auto-import |
| `@nuxtjs/sitemap` + `@nuxtjs/robots` | Sitemap e robots dal set di rotte prerenderizzate | `site.url` da `NUXT_PUBLIC_SITE_URL` |
| `@nuxt/eslint` | Lint e regole Nuxt/Vue/TS | Flat config generata |

Più un modulo locale, `modules/validate-data.ts`, che valida `data/` all'avvio
di `dev` e `generate`, rigenera i JSON Schema in `data/schema/` e registra
l'hook `prerender:routes`.

### `@nuxt/ui`

- Usato per **comportamento e accessibilità**, non come estetica: il look di
  default di Nuxt UI è riconoscibile e contraddice il criterio di distintività.
  Raggi, bordi, superfici e tipografia vengono riallineati ai token di
  [06 — Design system](06-design-system.md) tramite `app.config.ts`.
- Componenti usati: `UButton`, `UBadge`, `UAvatar`, `UTabs`, `UInput`,
  `USelect`, `UTooltip`.
- Menu e switcher usano disclosure nativi (`<details>`, `<select>`): evitano il
  peso runtime di `UDropdownMenu`/`USlideover` e restano accessibili senza JS.
- Accessibilità delegata a Reka UI (focus trap, ARIA, tastiera).
- I componenti non vanno reimplementati: si wrappano solo quando serve una
  variante di progetto (`AppButton`).

```ts
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc',
    },
  },
})
```

### `@nuxt/icon`

Obiettivo: **zero richieste a Iconify a runtime**. Le icone usate vengono
scansionate dal codice e incluse nel bundle; le collezioni sono installate
localmente.

```ts
// nuxt.config.ts (estratto)
icon: {
  mode: 'css',
  clientBundle: {
    scan: true,
    sizeLimitKb: 256,
  },
  serverBundle: 'local',
},
```

Dipendenze: `@iconify-json/lucide`, `@iconify-json/simple-icons`.

Convenzioni:

- Icone Lucide per UI e azioni.
- Simple Icons per loghi di tecnologie.
- Icone decorative: `aria-hidden="true"`. Icone con significato: label testuale
  o `aria-label`.
- Nessuna icona caricata tramite URL remoto.

### `@nuxt/fonts`

Due famiglie: un sans e un mono, come Linear e Vercel.

```ts
fonts: {
  families: [
    { name: 'Geist', provider: 'google', weights: ['400 700'], subsets: ['latin'] },
    { name: 'Geist Mono', provider: 'google', weights: [400], subsets: ['latin'] },
  ],
  defaults: {
    fallbacks: {
      'sans-serif': ['system-ui', 'sans-serif'],
      'monospace': ['ui-monospace', 'monospace'],
    },
  },
},
```

- `provider: 'google'` viene contattato **solo durante la build**; i file
  vengono scaricati e serviti dal dominio del sito.
- Geist è un font variabile: un file per il range di pesi.
- `font-display: swap` e fallback metrics per limitare il CLS.
- Un solo peso per Geist Mono (400): con il peso 500 incluso i file font
  superavano il budget di 100 KB totali. Il mono enfatizzato usa il colore, non
  un secondo file.
- Nessun `<link>` a `fonts.googleapis.com` nel markup finale: va verificato in
  CI.

### `@nuxtjs/i18n`

Le lingue arrivano da `data/site.json`; nessuna lingua è scritta nel codice.

```ts
import site from './data/site.json'

const defaultLocale = site.locales.find((l) => l.default)?.code ?? 'en'

i18n: {
  strategy: 'prefix_except_default',
  defaultLocale,
  locales: site.locales.map(({ code, language, name }) => ({
    code,
    language,
    name,
    file: uiStringsFileFor(code), // i18n/locales/{code}.json se esiste, altrimenti en.json
  })),
  langDir: 'locales',
  detectBrowserLanguage: false,
  baseUrl: new URL(process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000/').origin,
},
```

- Stringhe UI del motore in `i18n/locales/en.json` e `i18n/locales/it.json`.
- Lingua di default senza prefisso (`/`), le altre con prefisso (`/it`).
- **Nessun rilevamento della lingua del browser** e nessun cookie: su un sito
  statico il redirect avverrebbe lato client, con flash del contenuto. La
  lingua è nell'URL.
- Se una lingua non ha un file di stringhe UI, si usa quello inglese e la build
  emette un warning.
- Le stringhe UI usano chiavi semantiche (`contact.copyEmail`).
- I contenuti editoriali **non** stanno qui: stanno in `data/profile/`.

### `@vueuse/nuxt`

Composable effettivamente previsti:

| Composable | Uso |
| --- | --- |
| `useStorage` | Preferenza vista (con `initOnMounted: true`) |
| `useIntersectionObserver` | Sezione attiva nell'header |
| `useMediaQuery` | `prefers-reduced-motion`, puntatore fine |
| `useDebounceFn` | Ricerca progetti |
| `useEventListener` | Spotlight delegato, scorciatoie tastiera |

Non usare VueUse per cose già risolte da Nuxt (es. `useFetch`, `useHead`).

## Librerie runtime e utility

| Pacchetto | Versione | Ruolo | Dove vive |
| --- | --- | --- | --- |
| `zod` | 4.x | Validazione, inferenza tipi, generazione JSON Schema | Build/server |

### `zod`

Uso previsto:

1. Validare la risposta GitHub (`shared/schemas/github.ts`).
2. Validare i JSON in `data/` (`shared/schemas/site.ts`,
   `shared/schemas/profile.ts`).
3. Validare i `.repo-story.json` letti dagli altri repository.
4. Derivare i tipi TypeScript con `z.infer`.
5. Generare i JSON Schema in `data/schema/` con `z.toJSONSchema()` (lo fa il
   modulo `validate-data` a ogni `dev`/`generate`), così chi modifica i JSON ha
   autocompletamento e validazione nell'editor.

Regola di bundle: gli schemi **non** vengono importati dai componenti. I
componenti importano solo tipi (`import type`) dal modello di dominio, così zod
non entra nel bundle client.

Esempio (forma grezza REST pubblica, estratto):

```ts
// shared/schemas/github.ts
import { z } from 'zod'

export const githubRestRepoNodeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  full_name: z.string(),
  owner: z.object({ login: z.string() }),
  description: z.string().nullable(),
  html_url: z.string().url(),
  homepage: z.string().nullable(),
  fork: z.boolean(),
  archived: z.boolean(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  size: z.number(),
  language: z.string().nullable(),
  topics: z.array(z.string()).default([]),
  license: z
    .object({ spdx_id: z.string().nullable(), name: z.string().nullable() })
    .nullable(),
  default_branch: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  pushed_at: z.string().datetime().nullable(),
})

export type GitHubRestRepoNode = z.infer<typeof githubRestRepoNodeSchema>
```

### Date: `Intl`, nessuna libreria

- Nessuna libreria di date: `Intl.DateTimeFormat` e `Intl.RelativeTimeFormat`
  coprono tutti i casi.
- Le date nel modello sono **stringhe ISO**, non oggetti `Date`.
- Le date tecniche (`YYYY.MM.DD`, `YYYY.MM`) sono formattate da una funzione
  pura in `shared/utils/format.ts`, in UTC, quindi identiche in build e nel
  browser.
- Le date **relative** non vengono mai scritte nell'HTML statico: sarebbero
  sbagliate pochi giorni dopo il deploy e causerebbero hydration mismatch.
  `TechDate` renderizza la data assoluta; dopo il mount `useRelativeTime` la
  sostituisce con il relativo nella lingua corrente, lasciando l'assoluta in
  `datetime` e `title`.

## Dipendenze di build e sviluppo

| Pacchetto | Necessità | Perché |
| --- | --- | --- |
| `markdown-it` + `@shikijs/markdown-it` + `sanitize-html` | **Necessario** | Rendering README e code highlighting a build time |
| `gh-pages` | **Necessario** | Pubblica `.output/public` sul branch `gh-pages` (`pnpm run deploy`) |
| `@iconify-json/lucide` + `@iconify-json/simple-icons` | **Necessario** | Collezioni locali per `@nuxt/icon` e per le icone dei dati (`/api/data-icons`) |
| `@nuxt/eslint` | **Necessario** | Qualità del codice in CI |
| `prettier` + `eslint-config-prettier` | **Necessario** | Formattazione coerente |
| `vue-tsc` | **Necessario** | `nuxt typecheck` |
| `vitest` + `@nuxt/test-utils` + `happy-dom` | **Necessario** | Unit e component test |
| `@playwright/test` + `@axe-core/playwright` | **Raccomandato** (installati in M6) | E2E, accessibilità |
| `@lhci/cli` | **Opzionale** | Report Lighthouse informativo, non bloccante; eseguito con `pnpm dlx` in CI, non installato |

La verifica dei budget in byte è uno script locale (`scripts/check-budget.mjs`,
solo `node:zlib` e `node:fs`): nessuna dipendenza in più.

## Cosa non usiamo (e perché)

| Tecnologia legacy / alternativa | Sostituita da | Motivo |
| --- | --- | --- |
| Next.js + React | Nuxt 4 + Vue 3 | Stack scelto |
| GitHub GraphQL | REST pubblico | Richiede sempre un token; l'owner vuole zero credenziali (ADR-028) |
| daisyUI | Nuxt UI | Design system unico, accessibile |
| Framer Motion | CSS transitions | Meno JS, stesse necessità |
| `react-vertical-timeline-component` | Git Graph SVG a lane, calcolato in build | La timeline è un grafo, non una lista di pallini |
| `react-hot-toast` | `useToast` di Nuxt UI | Già nel design system |
| `axios` | `$fetch` / `ofetch` | Incluso in Nuxt |
| `react-markdown` + `remark-gfm` | `markdown-it` + Shiki + sanitize | Build-time, HTML sanificato |
| `aws-amplify`, `resend`, `react-email` | Rimosse | Nessun backend |
| `pinia` | URL + `useStorage` + stato locale | Lo stato esiste già altrove; uno store lo duplicherebbe |
| `date-fns` / `dayjs` | `Intl` | La piattaforma basta |
| `embla-carousel-vue` | — | Carousel rimosso |
| `@nuxt/content` | JSON + zod | Overkill per pochi file |
| `@nuxtjs/seo` (bundle completo) | `@nuxtjs/sitemap` + `@nuxtjs/robots` | Niente generazione di OG image; meno moduli |
| `actions/deploy-pages` | `gh-pages` | Lo stesso comando funziona in locale e in CI |
| Inter + Outfit + JetBrains Mono | Geist + Geist Mono | Due famiglie, più coerenti con la direzione |

## Configurazione Nuxt di riferimento

```ts
// nuxt.config.ts
import site from './data/site.json'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    storage: 'localStorage',
    storageKey: 'rp-color-mode',
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    './modules/validate-data',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    // valorizzato da scripts/deploy.mjs; '/' in dev
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },

  runtimeConfig: {
    githubToken: '', // opzionale: alza solo il rate limit REST
    public: {
      siteUrl: '',
      githubUsername: '', // risolto da scripts/repo-context.mjs se vuoto in data/site.json
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/cv', '/resume.json'],
    },
  },

  experimental: {
    payloadExtraction: true,
  },
})
```

I token CSS (`main.css`) sono definiti **solo** in
[06 — Design system](06-design-system.md#token).

## Gestione versioni e dipendenze

- **Node:** 22 LTS (allineato in `.nvmrc`, `package.json#engines`, CI).
- **Package manager:** pnpm (Corepack), lockfile committed.
- **Aggiornamenti:** Renovate o Dependabot settimanale, PR separate per major.
- **Audit:** `pnpm audit --prod` in CI; nessuna dipendenza con vulnerabilità
  note in produzione.
- **Licenze:** verificare compatibilità MIT/Apache-2.0/OFL con la licenza del
  progetto (MIT).

## Budget di bundle

| Voce | Target |
| --- | --- |
| JS iniziale route `/` | < 180 KB gzip |
| CSS iniziale | < 40 KB gzip |
| Font | 2 famiglie, < 100 KB totali |
| Icone | Solo quelle usate, < 30 KB |
| Payload lista progetti | < 80 KB gzip (100 repo + language stats + activity + story events) |
| Payload dettaglio | < 80 KB gzip (README incluso) |
| markdown-it/Shiki/zod | 0 KB nel client |

Il budget viene verificato in CI da `scripts/check-budget.mjs`; una PR che lo
supera deve giustificare l'aumento o ridurre il peso altrove.
