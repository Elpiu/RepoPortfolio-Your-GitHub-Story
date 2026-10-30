# 05 — Dati e contenuti

## Fonte di verità

| Dato | Fonte | Chi lo modifica |
| --- | --- | --- |
| Repository, stelle, topics, linguaggi, README, commit, release, pinned | GitHub API (GraphQL + REST README) | GitHub / build |
| Preview di un repository | Discovery automatica nel repository; override opzionale `.repo-story.json` | Owner, nel repository stesso |
| Nome, ruolo, bio, avatar, disponibilità, competenze, esperienze, milestone | `data/profile/{locale}.json` | Owner |
| Contatti, lingue, esclusioni, opzioni della story, dominio | `data/site.json` | Owner |
| Stringhe dell'interfaccia | `i18n/locales/{locale}.json` | Motore (contributor) |
| Configurazione tecnica | `nuxt.config.ts`, env | Maintainer |

Il racconto personale vive **solo nel JSON** (ADR-023): il profilo GitHub non
sovrascrive nome, bio o disponibilità. Ciò che esiste già nei repository
(descrizione, topics, date, linguaggi, release) non va copiato a mano.

## La cartella `data/`

Chi clona il progetto modifica **solo** questa cartella.

```text
data/
├─ site.json              # configurazione non tradotta + registry lingue
├─ profile/
│  ├─ en.json             # racconto nella lingua di default
│  └─ it.json             # una lingua aggiuntiva (opzionale)
└─ schema/                # JSON Schema generati: non modificare
   ├─ site.schema.json
   ├─ profile.schema.json
   └─ repo-story.schema.json
```

- Tutti i file sono JSON con un campo `$schema` che punta a `data/schema/`:
  gli editor offrono autocompletamento e segnalano gli errori mentre si scrive.
- Gli schemi sono generati dagli schemi zod dal modulo `validate-data` a ogni
  `dev`/`generate` e committati, così funzionano anche senza aver mai eseguito
  la build. La CI verifica che siano aggiornati.
- Nessun segreto: tutto ciò che sta in `data/` finisce nel bundle o nell'HTML.

Per aggiungere una lingua:

1. aggiungere una voce a `locales` in `data/site.json`;
2. creare `data/profile/{code}.json`;
3. (facoltativo) aggiungere `i18n/locales/{code}.json` per tradurre
   l'interfaccia; in assenza si usa l'inglese con un warning.

Nessuna modifica al codice. La validazione controlla parità di chiavi e `id`
tra le lingue.

## `data/site.json`

Esempio completo:

```json
{
  "$schema": "./schema/site.schema.json",
  "github": {
    "username": "",
    "excludedRepos": [],
    "includeForks": false,
    "includeArchived": false,
    "excludeProfileRepo": true,
    "maxRepos": 300,
    "readmeMaxBytes": 200000
  },
  "links": {
    "email": "you@example.com",
    "phone": "+39 000 000 0000",
    "linkedin": "https://www.linkedin.com/in/your-handle/",
    "website": null,
    "cvUrl": null
  },
  "career": {
    "start": "2022-07"
  },
  "story": {
    "autoEvents": true,
    "includeReleases": true,
    "maxAutoEvents": 8
  },
  "locales": [
    { "code": "en", "language": "en-US", "name": "English", "default": true },
    { "code": "it", "language": "it-IT", "name": "Italiano", "default": false }
  ],
  "deploy": {
    "customDomain": null
  },
  "seo": {
    "siteName": null,
    "twitterHandle": null
  }
}
```

Esempio minimo valido (tutto il resto prende i default):

```json
{
  "$schema": "./schema/site.schema.json",
  "links": { "email": "you@example.com" },
  "locales": [{ "code": "en", "language": "en-US", "name": "English", "default": true }]
}
```

| Campo | Default | Note |
| --- | --- | --- |
| `github.username` | `""` | Vuoto = owner del repository del portfolio (da `GITHUB_REPOSITORY` in CI o da `git remote` in locale) |
| `github.excludedRepos` | `[]` | **Nomi** dei repository, non slug |
| `github.includeForks` / `includeArchived` | `false` | |
| `github.excludeProfileRepo` | `true` | Esclude `{username}/{username}` (il README del profilo) |
| `github.maxRepos` | `300` | Limite di lettura (ordinamento per ultimo push) |
| `github.readmeMaxBytes` | `200000` | Oltre si tronca con link a GitHub |
| `links.email` | — | Pulsante `mailto:` |
| `links.phone` | `null` | Pulsante `tel:`; se `null` non viene renderizzato |
| `links.linkedin`, `links.website` | `null` | |
| `links.cvUrl` | `null` | Se `null`, il pulsante CV porta a `/cv` (F9) |
| `career.start` | `null` | `YYYY-MM`; se assente gli anni di esperienza non vengono mostrati |
| `story.autoEvents` | `true` | Pinned come nodi automatici della GitHub Story |
| `story.includeReleases` | `true` | Ultima release dei pinned come nodo |
| `story.maxAutoEvents` | `8` | |
| `locales` | — | Almeno una voce, esattamente una con `default: true` |
| `deploy.customDomain` | `null` | Es. `portfolio.example.com`: base URL `/` e file `CNAME` |
| `seo.siteName` | `null` | Default `"{fullName} — Portfolio"` |
| `seo.twitterHandle` | `null` | |

Il link a GitHub non si configura: deriva dallo username.

## Registry delle lingue

`locales` in `data/site.json` è la **single source of truth** per:

- `@nuxtjs/i18n` (`locales`, `defaultLocale`);
- switcher lingua (mostra solo le lingue presenti; sparisce se ce n'è una);
- caricamento dei profili `data/profile/{code}.json`;
- validazione di parità;
- `hreflang`, sitemap e `/{locale}/resume.json`.

## Schema del profilo

```ts
// shared/schemas/profile.ts
import { z } from 'zod'

const isoMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Formato atteso: YYYY-MM')

export const skillItemSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1).optional(), // es. "simple-icons:typescript"
})

export const skillGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  items: z.array(skillItemSchema).min(1),
})

export const experienceSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(['work', 'education']),
    title: z.string().min(1),
    organization: z.string().min(1),
    location: z.string().min(1),
    start: isoMonth,
    end: isoMonth.nullable(),
    description: z.string().min(1),
    highlights: z.array(z.string().min(1)).default([]),
  })
  .refine((e) => e.end === null || e.end >= e.start, {
    message: 'La data di fine deve essere successiva alla data di inizio',
    path: ['end'],
  })

export const milestoneSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['repo', 'release', 'milestone']),
  date: isoMonth,
  title: z.string().min(1),
  description: z.string().min(1),
  repo: z.string().min(1).optional(), // nome repository, risolto a build time
  link: z.string().url().optional(),
  tags: z.array(z.string().min(1)).default([]),
})

export const profileSchema = z.object({
  $schema: z.string().optional(),
  locale: z.string().min(2),
  meta: z.object({
    name: z.string().min(1),
    fullName: z.string().min(1),
    role: z.string().min(1),
    tagline: z.string().min(1),
    avatarUrl: z.string().url().startsWith('https://').optional(), // default: avatar GitHub
    location: z.string().min(1).optional(),
    available: z.boolean().default(false),
    availability: z.string().min(1).optional(),
  }),
  about: z.object({
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  skills: z.object({
    groups: z.array(skillGroupSchema).default([]),
  }).default({ groups: [] }),
  experiences: z.array(experienceSchema).default([]),
  milestones: z.array(milestoneSchema).default([]),
})

export type Profile = z.infer<typeof profileSchema>
```

Regole di validazione aggiuntive (non esprimibili solo con zod):

- `locale` deve corrispondere a una voce di `locales` e al nome del file.
- Tutte le lingue devono avere **la stessa struttura**: stessi `id` di
  esperienze, milestone e gruppi di competenze.
- La lingua di default deve esistere; le lingue secondarie possono omettere
  solo i campi opzionali.
- `experiences` e `milestones` non possono contenere `id` duplicati, anche tra
  loro (diventano nodi dello stesso grafo).
- **Al massimo** un'esperienza `work` con `end: null` (zero è valido: chi è in
  cerca di lavoro non deve avere la build rossa).
- I `milestones` con `repo` devono riferirsi a un repository incluso; se il
  repository sparisce, build rossa con messaggio chiaro.
- Ogni `icon` di competenza deve appartenere a una collezione installata
  (`lucide`, `simple-icons`), altrimenti warning e icona generica.
- Se `available` è `true`, `availability` diventa il testo del badge; se manca,
  si usa la stringa i18n di default.
- Se `avatarUrl` manca si usa `https://avatars.githubusercontent.com/{username}`:
  è solo un default, il JSON resta la fonte.

## Esempio di `data/profile/en.json`

```json
{
  "$schema": "../schema/profile.schema.json",
  "locale": "en",
  "meta": {
    "name": "Name",
    "fullName": "Full Name",
    "role": "full-stack developer",
    "tagline": "I build web products that are simple to use and hard to break.",
    "location": "Salerno, Italy",
    "available": true,
    "availability": "Open to full-remote opportunities"
  },
  "about": {
    "paragraphs": [
      "Full-stack developer with experience designing and building enterprise applications.",
      "I care about software quality: testing, accessibility, performance and maintainability."
    ]
  },
  "skills": {
    "groups": [
      {
        "id": "languages",
        "label": "Languages",
        "items": [
          { "name": "TypeScript", "icon": "simple-icons:typescript" },
          { "name": "Java", "icon": "simple-icons:openjdk" },
          { "name": "SQL" }
        ]
      }
    ]
  },
  "experiences": [
    {
      "id": "acme",
      "type": "work",
      "title": "Full-stack Developer",
      "organization": "Acme S.p.A.",
      "location": "Naples — Hybrid",
      "start": "2024-07",
      "end": null,
      "description": "Building custom CRM/KPI applications from backend to frontend.",
      "highlights": ["CRM and KPI applications for enterprise customers"]
    },
    {
      "id": "university",
      "type": "education",
      "title": "BSc in Computer Science",
      "organization": "University of Salerno",
      "location": "Fisciano (SA), Italy",
      "start": "2019-09",
      "end": "2022-07",
      "description": "Bachelor's degree in Computer Science.",
      "highlights": []
    }
  ],
  "milestones": [
    {
      "id": "first-release",
      "type": "release",
      "date": "2024-02",
      "title": "First enterprise release",
      "description": "Shipped an enterprise application used by real customers.",
      "tags": ["Java", "Angular"]
    }
  ]
}
```

I dati di esempio del template sono fittizi: chi clona li sostituisce, ma il
sito si genera anche con `experiences`, `skills` e `milestones` vuoti.

## `.repo-story.json` (opzionale, negli altri repository)

Il motore si adatta da solo: nessun repository ha bisogno di configurazione.
Solo se la discovery automatica sbaglia, l'owner può aggiungere nella root di un
repository un piccolo manifest:

```json
{
  "$schema": "https://raw.githubusercontent.com/Elpiu/RepoPortfolio-Your-GitHub-Story/main/data/schema/repo-story.schema.json",
  "preview": "docs/assets/hero.png",
  "hidden": false,
  "story": true
}
```

| Campo | Default | Effetto |
| --- | --- | --- |
| `preview` | — | Path relativo alla root o URL `https://` su host GitHub; vince sulla discovery |
| `hidden` | `false` | Esclude il repository dal portfolio (come il topic `portfolio-hidden`) |
| `story` | `true` | Se `false`, il repository pinned non genera eventi automatici |

- Letto nella stessa query GraphQL (nessuna chiamata in più).
- Massimo 4 KB; campi sconosciuti ignorati.
- Se non è JSON valido o non rispetta lo schema: warning con nome del
  repository e campo, file ignorato, build verde.

## Modello di dominio

```ts
// shared/types/index.ts
export type PreviewSource = 'manifest' | 'convention' | 'readme' | 'social' | 'placeholder'

export type RepoLanguage = {
  name: string
  color: string // colore GitHub; fallback deterministico se null
  percent: number
}

export type Repository = {
  id: number
  name: string
  slug: string
  description: string | null
  url: string
  homepage: string | null
  topics: string[]
  language: string | null // linguaggio principale (primo per byte)
  languages: RepoLanguage[] // massimo 5, per il dettaglio
  stars: number
  forks: number
  sizeKb: number
  license: { spdxId: string; name: string } | null
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  pushedAt: string | null // ISO 8601
  defaultBranch: string
  lastCommit: { sha: string; shortSha: string; message: string; date: string } | null
  latestRelease: { name: string; tag: string; date: string; url: string } | null
  isPinned: boolean
  pinnedOrder: number | null // 0..5 nell'ordine del profilo GitHub
  previewImage: string | null // URL assoluto; null = placeholder
  previewSource: PreviewSource
  placeholderIndex: number // id % 8 (PLACEHOLDER_COUNT, costante del motore)
}

export type LanguageStat = {
  name: string
  color: string
  bytes: number
  percent: number // 0..100, somma 100
}

export type Activity = {
  repoName: string
  repoSlug: string
  branch: string
  pushedAt: string | null
  commit: Repository['lastCommit']
}

export type StoryEvent = {
  id: string // "auto-repo-{name}" | "auto-release-{name}"
  type: 'repo' | 'release'
  date: string // YYYY-MM
  title: string
  description: string | null
  repoSlug: string
  link: string
  tags: string[]
}

export type GitHubDataset = {
  syncedAt: string // ISO, momento della build
  username: string
  repositories: Repository[]
  languageStats: LanguageStat[]
  activity: Activity | null
  storyEvents: StoryEvent[]
}

export type ProjectDetail = {
  repository: Repository
  readmeHtml: string | null
  readmeTruncated: boolean
  headings: Array<{ id: string; text: string; level: 2 | 3 | 4 }>
}
```

Note:

- Le date restano stringhe ISO. Non usare `Date` nel payload.
- `slug` è stabile e univoco.
- `previewImage` è già un URL assoluto o `null`; il componente non costruisce
  URL.
- I README **non** fanno parte di `Repository` nella lista.
- `license` è `null` se GitHub non rileva una licenza; è il criterio del tab
  `Open Source`.
- `sizeKb` è `diskUsage` di GitHub, mostrato in forma compatta (es. 1.2 MB).
- `syncedAt` alimenta l'etichetta "Last synced" e il calcolo deterministico di
  "oggi" (anni di esperienza, esperienze in corso nel grafo).

## Superficie API GitHub

| Uso | Endpoint | Quando |
| --- | --- | --- |
| Repository, linguaggi, topics, commit, release, pinned, alberi, manifest | GraphQL `POST /graphql` | Build, una query paginata |
| README | REST `GET /repos/{owner}/{repo}/readme` | Build, per repository incluso |
| Preview | `raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}` | Immagine remota nel browser |

### Query GraphQL

```graphql
query Portfolio($login: String!, $cursor: String, $firstPage: Boolean!) {
  rateLimit { cost remaining resetAt }
  user(login: $login) {
    login
    pinnedItems(first: 6, types: REPOSITORY) @include(if: $firstPage) {
      nodes { ... on Repository { name } }
    }
    repositories(
      first: 50
      after: $cursor
      ownerAffiliations: OWNER
      privacy: PUBLIC
      orderBy: { field: PUSHED_AT, direction: DESC }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        databaseId name description url homepageUrl
        isFork isArchived stargazerCount forkCount diskUsage
        createdAt updatedAt pushedAt
        licenseInfo { spdxId name }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
        repositoryTopics(first: 10) { nodes { topic { name } } }
        openGraphImageUrl
        usesCustomOpenGraphImage
        latestRelease { name tagName publishedAt url }
        defaultBranchRef {
          name
          target { ... on Commit { oid abbreviatedOid messageHeadline committedDate } }
        }
        rootTree: object(expression: "HEAD:") { ... on Tree { entries { name type path } } }
        githubTree: object(expression: "HEAD:.github") { ... on Tree { entries { name type path } } }
        docsTree: object(expression: "HEAD:docs") { ... on Tree { entries { name type path } } }
        legacyPreview: object(expression: "HEAD:.github/RepoPortfolio-Your-GitHub-Story/index.png") { oid }
        repoStory: object(expression: "HEAD:.repo-story.json") { ... on Blob { text } }
      }
    }
  }
}
```

Note:

- GraphQL **richiede sempre un token**, anche per dati pubblici. In locale:
  `GITHUB_TOKEN=$(gh auth token)`; in CI: il `GITHUB_TOKEN` del workflow.
- `rateLimit` viene loggato a ogni pagina: il costo atteso è di pochi punti per
  pagina, lontano dai limiti.
- REST è usato solo per il README, perché `/readme` risolve le varianti del
  nome file (`README.md`, `readme.markdown`, `README.rst`...). Con il
  `GITHUB_TOKEN` di Actions il limite REST è **1.000 richieste/ora per
  repository** (5.000 con un token personale): sufficiente per 300 README.
- Header REST: `Accept: application/vnd.github.raw+json`,
  `X-GitHub-Api-Version: 2022-11-28`.

## Normalizzazione GitHub

| Campo API | Campo dominio | Trasformazione |
| --- | --- | --- |
| `databaseId` | `id` | invariato |
| `name` | `name` | invariato |
| `name` | `slug` | `slugify(name)` + suffisso `-{id}` in caso di collisione |
| `description` | `description` | trim; stringa vuota → `null` |
| `url` | `url` | invariato |
| `homepageUrl` | `homepage` | stringa vuota → `null` |
| `repositoryTopics` | `topics` | dedup, lowercase, max 10 |
| `languages.edges` | `language`, `languages` | primo per byte; top 5 con percentuale |
| `stargazerCount` | `stars` | intero |
| `forkCount` | `forks` | intero |
| `diskUsage` | `sizeKb` | intero (KB), `null` → 0 |
| `licenseInfo` | `license` | `{ spdxId, name }` o `null` (`NOASSERTION` → `null`) |
| `createdAt` / `updatedAt` / `pushedAt` | idem | ISO invariato |
| `defaultBranchRef.name` | `defaultBranch` | invariato (non assumere `main`) |
| `defaultBranchRef.target` | `lastCommit` | `{ sha, shortSha, message, date }` o `null` |
| `latestRelease` | `latestRelease` | `{ name ?? tagName, tag, date, url }` o `null` |
| `pinnedItems` | `isPinned`, `pinnedOrder` | posizione nella lista pinned |
| alberi + manifest + README + `openGraphImageUrl` | `previewImage`, `previewSource` | vedi [Preview image](#preview-image) |

### Regole di esclusione

Un repository viene escluso se:

1. `isFork` e `includeForks === false`;
2. `isArchived` e `includeArchived === false`;
3. `name === username` e `excludeProfileRepo === true`;
4. `name` è in `excludedRepos`;
5. ha il topic `portfolio-hidden`;
6. il suo `.repo-story.json` ha `"hidden": true`;
7. supera il limite `maxRepos` (ordinamento per ultimo push).

L'esclusione avviene **prima** del calcolo di featured, linguaggi, activity e
story. Il log di build riporta ogni esclusione con il motivo.

### Slug

```ts
// shared/utils/repo.ts
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- Collisione (`my_repo` e `my-repo`): il primo per `id` mantiene lo slug, il
  secondo diventa `my-repo-{id}`. La scelta è deterministica.
- Lo slug è usato nella route `/projects/[slug]`; rinominare un repository
  rompe i link, quindi il nome è di fatto un contratto pubblico.

### Preview image

Nessuna configurazione richiesta. Per ogni repository si prova, in ordine:

1. **Manifest:** `preview` in `.repo-story.json`.
2. **Convenzione:** un file con nome `preview`, `screenshot`, `cover`, `hero`,
   `banner` o `social-preview` ed estensione `png`, `jpg`, `jpeg`, `webp`,
   `avif` o `gif`, cercato in quest'ordine di cartelle: `.github/`, root,
   `docs/`. Poi il path legacy `.github/RepoPortfolio-Your-GitHub-Story/index.png`.
   Gli alberi arrivano già dalla query GraphQL: nessuna chiamata in più.
3. **README:** la prima immagine del README che non sia un badge. Si scartano
   gli SVG e gli URL di servizi di badge (`img.shields.io`, `badgen.net`,
   `badge.fury.io`, `codecov.io`, `/actions/workflows/…/badge.svg`, path che
   contengono `badge`). Sono ammessi path relativi (risolti sul raw del default
   branch) e host GitHub (`raw.githubusercontent.com`,
   `user-images.githubusercontent.com`, `github.com/user-attachments`).
4. **Social image custom:** `openGraphImageUrl`, solo se
   `usesCustomOpenGraphImage` è `true` (quella generata da GitHub è una card
   testuale, non una preview).
5. **Placeholder** locale deterministico.

Regole:

- URL finale per i file nel repository:
  `https://raw.githubusercontent.com/{owner}/{repo}/{defaultBranch}/{path}`, con
  i segmenti del path encodati singolarmente.
- I candidati 2 e 4 esistono per costruzione. I candidati 1 e 3 vengono
  verificati con `HEAD` (timeout 5 s, concorrenza 5); se non rispondono 2xx si
  passa al candidato successivo.
- Le immagini restano remote: nessun download né ottimizzazione in build
  (ADR-013).
- `previewSource` viene loggato per capire, a colpo d'occhio, quanti repository
  usano il placeholder.

### Placeholder

- File in `public/repo-placeholder/placeholder-{1..8}.webp`; il numero è una
  costante del motore, non una configurazione dell'owner.
- Scelta deterministica: `id % 8`. Stesso repository, stessa immagine, in ogni
  build e in SSR/client.
- `alt` descrittivo: "Anteprima non disponibile per {nome}".
- `width`/`height` espliciti per evitare CLS.

### Language stats

- Fonte: `languages.edges` della query (byte e colore per linguaggio).
- Aggregazione: somma dei byte per linguaggio su tutti i repository inclusi.
- Percentuale: `bytes / totalBytes * 100`, arrotondata a una cifra decimale;
  correzione del residuo sull'elemento più grande, così la somma è 100.
- Oltre 8 linguaggi, il resto confluisce in "Other".
- Colore: quello di GitHub; se `null`, fallback deterministico (hash del nome →
  palette neutra) in `shared/utils/language-colors.ts`.
- Se nessun dato: `languageStats: []` e la Bento mostra uno stato vuoto.

### Activity

- Il repository con `pushedAt` più recente fornisce repo, branch e data.
- L'ultimo commit (hash corto e messaggio) arriva da `defaultBranchRef.target`,
  già nella query: nessuna chiamata extra.
- Nessun dato "in tempo reale": l'attività è quella dell'ultima build. La UI lo
  dice con l'etichetta "Last synced" e la data di `syncedAt`.

### Featured (pinned)

1. I repository pinned sul profilo GitHub, nell'ordine del profilo, esclusi
   quelli nascosti dalle regole di esclusione.
2. Se non ci sono pinned, i repository con più stelle (a parità, il più
   aggiornato), fino a 6.
3. Il primo featured è il **Top Repo** della Bento.
4. I featured hanno `isPinned`, ordinano per primi in Explore (sort
   "rilevanza") e alimentano gli eventi automatici della story.

Nessuna lista manuale: per cambiare i progetti in evidenza si cambiano i pinned
su GitHub.

## GitHub Story

### Eventi

La story è la fusione di tre sorgenti, ordinata per data decrescente:

1. `experiences` del profilo (intervalli);
2. `milestones` del profilo (punti);
3. `storyEvents` automatici (punti), se `story.autoEvents` è attivo:
   - un evento `repo` per ogni pinned, alla data di creazione, con
     descrizione e linguaggi presi da GitHub;
   - un evento `release` per l'ultima release di ogni pinned, se
     `story.includeReleases` è attivo;
   - massimo `story.maxAutoEvents`, priorità nell'ordine dei pinned;
   - esclusi i repository con `"story": false` nel manifest.

Deduplicazione: un milestone curato con `repo: X` e `type: repo` sostituisce
l'evento automatico `repo` di X; lo stesso vale per `type: release`. Il testo
degli eventi automatici arriva da GitHub e non è tradotto; l'etichetta del tipo
sì.

### Lane del grafo

Calcolate da una funzione pura (`shared/utils/story-graph.ts`), testata a parte:

1. Ogni esperienza è un intervallo `[start, end ?? mese di syncedAt]`.
2. Gli intervalli si ordinano per `start` crescente, poi `work` prima di
   `education`, poi `id`.
3. Ogni intervallo prende la lane libera più bassa. La lane 0 è il tronco,
   sempre disegnato.
4. Massimo 3 lane: oltre, gli intervalli condividono la lane 2.
5. I punti (milestone, repo, release) stanno sul tronco alla loro data.
6. Output: nodi con lane e posizione, più gli archi di fork (inizio
   intervallo) e merge (fine intervallo) verso il tronco. L'SVG è disegnato in
   build; l'ordine nel DOM è cronologico.

## Validazione a build time

```ts
// modules/validate-data.ts
import { join } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { siteSchema } from '../shared/schemas/site'
import { profileSchema } from '../shared/schemas/profile'
import {
  assertAtMostOneCurrentJob,
  assertSameShape,
  assertUniqueIds,
  parseJsonFile,
  writeJsonSchemas,
} from '../shared/utils/validation'

export default defineNuxtModule({
  meta: { name: 'validate-data' },
  setup(_options, nuxt) {
    const dataDir = join(nuxt.options.rootDir, 'data')
    const site = parseJsonFile(siteSchema, join(dataDir, 'site.json'))

    // le lingue arrivano dal registry, nessun import scritto a mano
    const profiles = Object.fromEntries(
      site.locales.map(({ code }) => [
        code,
        parseJsonFile(profileSchema, join(dataDir, 'profile', `${code}.json`)),
      ]),
    )

    assertSameShape(profiles)
    for (const profile of Object.values(profiles)) {
      assertUniqueIds([...profile.experiences, ...profile.milestones])
      assertAtMostOneCurrentJob(profile)
    }

    // JSON Schema per l'editor, rigenerati dagli schemi zod
    writeJsonSchemas(join(dataDir, 'schema'))

    // in dev, una modifica a data/ riavvia il server
    nuxt.options.watch.push(join(dataDir, '*.json'), join(dataDir, 'profile', '*.json'))
  },
})
```

- `parseJsonFile` riporta file, percorso del campo (`experiences[2].end`) e
  messaggio zod; non stampa mai l'intero JSON.
- Gira in dev e in `generate`: un errore blocca subito, prima di contattare
  GitHub.
- I controlli che dipendono dai repository (milestone con `repo` inesistente)
  girano dopo la sync, in `server/utils/story-events.ts`.
- Gli stessi controlli sono coperti da test unitari.

## Cache e resilienza

```text
.cache/github/last-good.json
{
  "syncedAt": "2026-10-30T03:12:00.000Z",
  "username": "your-handle",
  "repositories": [ ...Repository ],
  "languageStats": [ ...LanguageStat ],
  "activity": { ...Activity },
  "storyEvents": [ ...StoryEvent ],
  "readmes": { "repo-name": "...markdown..." }
}
```

- Scritto al termine di una sync valida (dataset + README grezzi).
- Riusato come fallback solo se:
  - l'API fallisce dopo i retry;
  - lo snapshot ha meno di 7 giorni;
  - lo snapshot supera la stessa validazione zod.
- In caso di fallback la build emette un warning e il deploy prosegue.
- Non va committato: è una cache di build (`.gitignore`).
- In locale persiste tra un deploy e l'altro. In GitHub Actions vive in
  `actions/cache`, che elimina le voci non usate da 7 giorni: il fallback in CI
  esiste solo se c'è stata una build nell'ultima settimana. È un limite
  accettato, coerente con la scadenza dello snapshot.
- `GITHUB_OFFLINE=1` salta la rete e usa lo snapshot (qualunque età) o, se
  manca, la fixture versionata `tests/fixtures/github.json`. È la modalità
  delle PR in CI e dello sviluppo senza token.

## Migrazione dal legacy `sharedData.json`

| Legacy | Nuovo |
| --- | --- |
| `introData.profileImage` | `profile.meta.avatarUrl` (opzionale) |
| `introData.name` / `fullName` | `profile.meta.name` / `fullName` |
| `introData.profession` | `profile.meta.role` |
| `introData.smallIntroPhrase` | `profile.meta.tagline` |
| `introData.yearExperience` | Calcolato da `site.career.start` |
| `introData.contactEmail` | `site.links.email` |
| `introData.linkToCv` | `site.links.cvUrl` (opzionale; default `/cv`) |
| `introData.linkLinkedin` | `site.links.linkedin` |
| `introData.linkGithub` | Derivato da `site.github.username` |
| `introData.telephoneNumber` | `site.links.phone` |
| `introData.emojiIconAsText` | Rimosso |
| `aboutMe[]` | `profile.about.paragraphs[]` |
| `skills[]` | `profile.skills.groups[].items[]` (da raggruppare) |
| `experiences[]` | `profile.experiences[]` (date strutturate) |
| `gitHubRepoData.orderByStars` | Fallback dei featured + sort di Explore |
| `gitHubRepoData.nameGithub` | `site.github.username` (o owner del repository) |
| `gitHubRepoData.excludedRepo` | `site.github.excludedRepos` |
| `gitHubRepoData.pathImgShowRepository` | Discovery automatica (il vecchio path resta supportato) |
| `urlApiGithub`, `rawGithub`, `gitHubLink`, `fragmentRepository` | Costanti nel client GitHub server-side |

Le esperienze legacy hanno date come testo libero (`"Dal 7/2022 – al 6/2024"`).
Vanno convertite a mano in `YYYY-MM`; non si automatizza un formato ambiguo.

Il legacy era in italiano: i suoi contenuti vanno in `data/profile/it.json`,
mentre `data/profile/en.json` è la lingua di default e va creato per primo.

## Privacy e contenuti sensibili

- Solo dati pubblici: repository pubblici e ciò che l'owner scrive in `data/`.
- Email e telefono sono dati personali: il numero è mostrato come pulsante
  `tel:` perché scelto dall'owner e sparisce impostando `links.phone` a `null`.
- Nessun cookie. In localStorage solo tema e preferenza di vista.
- I file in `data/` sono versionati: non inserire segreti, token o indirizzi
  privati.
