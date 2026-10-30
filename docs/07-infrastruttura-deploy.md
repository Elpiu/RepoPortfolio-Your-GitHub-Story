# 07 — Infrastruttura e deploy

## Obiettivo

> Chi clona modifica i JSON in `data/` e lancia **un comando**. Il sito è
> online su GitHub Pages.

Lo stesso comando (`pnpm run deploy`) gira in locale e nella GitHub Action a
ogni push su `main`: non esistono due modi diversi di pubblicare.

## Ambienti

| Ambiente | Dove | Scopo | Dati GitHub |
| --- | --- | --- | --- |
| Locale | `pnpm dev` | Sviluppo | API reale con token (`gh auth token`) o `GITHUB_OFFLINE=1` |
| Deploy locale | `pnpm run deploy` | Pubblicazione manuale | API reale con token |
| CI pull request | GitHub Actions `ci.yml` | Lint, typecheck, test, build, budget | Fixture, niente segreti |
| Produzione | GitHub Pages, branch `gh-pages` | Sito pubblico | Generato da `deploy.yml` o da un deploy locale |

Non esiste uno staging permanente: il costo non è giustificato per un sito
statico. `pnpm run deploy -- --dry-run` genera il sito senza pubblicarlo.

## Modello di hosting

**Scelta:** GitHub Pages con sorgente **"Deploy from a branch" → `gh-pages` /
`(root)`**. Il branch viene scritto dalla libreria
[`gh-pages`](https://www.npmjs.com/package/gh-pages) (ADR-019).

| Aspetto | GitHub Pages |
| --- | --- |
| Costo | 0 € |
| CDN | Sì (Fastly) |
| HTTPS | Automatico |
| Header HTTP custom | No (limite) |
| Redirect server-side | No (solo `404.html`) |
| Pubblicazione | Commit sul branch `gh-pages`; Pages lo serve in ~1 minuto |
| Limite sito | 1 GB (soft), 100 GB/mese (soft) |

Perché un branch e non `actions/deploy-pages`: con un branch il deploy è un
comando che funziona identico da un portatile e da una Action, e la storia del
branch `gh-pages` è anche lo storico dei deploy (utile per il rollback).

Alternative documentate:

| Hosting | Pro | Contro |
| --- | --- | --- |
| Cloudflare Pages | Header, redirect, preview PR | Configurazione separata |
| Netlify | Preview, redirect | Limiti free tier |
| Vercel | Ottimo supporto Nuxt | SSR non necessario |

L'output è `.output/public`: cambiare hosting significa cambiare solo lo step
di pubblicazione di `scripts/deploy.mjs`.

## Il comando `pnpm run deploy`

> Va lanciato come `pnpm run deploy`: `pnpm deploy` (senza `run`) è un comando
> interno di pnpm per i workspace e fa un'altra cosa.

```text
pnpm run deploy
  1. scripts/repo-context.mjs
       owner e repository da GITHUB_REPOSITORY (CI) o da `git remote get-url origin`
  2. legge data/site.json
       username (vuoto = owner), deploy.customDomain
  3. risolve base URL e site URL (tabella sotto)
  4. nuxt generate
       con NUXT_APP_BASE_URL, NUXT_PUBLIC_SITE_URL, NUXT_GITHUB_TOKEN
  5. scrive .output/public/build.json  { sha, syncedAt, siteUrl }
  6. gh-pages.publish('.output/public')
       branch gh-pages, .nojekyll, CNAME se c'è un dominio custom
```

```js
// scripts/deploy.mjs (estratto)
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import ghpages from 'gh-pages'
import { resolveRepoContext, resolveSiteUrls } from './repo-context.mjs'

const dryRun = process.argv.includes('--dry-run')
const site = JSON.parse(readFileSync('data/site.json', 'utf8'))
const ctx = resolveRepoContext() // { owner, repo }
const domain = site.deploy?.customDomain ?? null
const { baseURL, siteUrl } = resolveSiteUrls(ctx, domain)
const token = process.env.NUXT_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN

execSync('nuxt generate', {
  stdio: 'inherit',
  env: {
    ...process.env,
    NUXT_APP_BASE_URL: baseURL,
    NUXT_PUBLIC_SITE_URL: siteUrl,
    NUXT_PUBLIC_GITHUB_USERNAME: site.github?.username || ctx.owner,
    NUXT_GITHUB_TOKEN: token,
  },
})

writeFileSync('.output/public/build.json', JSON.stringify({
  sha: process.env.GITHUB_SHA ?? execSync('git rev-parse HEAD').toString().trim(),
  siteUrl,
}))

if (!dryRun) {
  await ghpages.publish('.output/public', {
    branch: 'gh-pages',
    dotfiles: true,
    nojekyll: true, // senza, Pages ignora le cartelle _nuxt/ e i _payload.json
    cname: domain ?? undefined,
    message: `deploy: ${ctx.owner}/${ctx.repo}`,
    ...(process.env.CI && {
      repo: `https://x-access-token:${token}@github.com/${ctx.owner}/${ctx.repo}.git`,
      user: {
        name: 'github-actions[bot]',
        email: '41898282+github-actions[bot]@users.noreply.github.com',
      },
    }),
  })
}
```

Regole:

- In locale la pubblicazione usa le credenziali git dell'utente; il token
  serve solo per leggere GitHub (GraphQL).
- In CI la pubblicazione usa il `GITHUB_TOKEN` del workflow
  (`contents: write`).
- Il token non viene mai stampato; gli errori di `gh-pages` vengono ripuliti
  dall'URL con credenziali prima di essere loggati.
- La storia del branch `gh-pages` viene mantenuta (default della libreria):
  serve al rollback.

## Base URL e dominio

Nessuna variabile d'ambiente da impostare a mano: lo script deduce tutto.

| Caso | Condizione | `NUXT_APP_BASE_URL` | `NUXT_PUBLIC_SITE_URL` |
| --- | --- | --- | --- |
| Project site | repository qualsiasi | `/{repo}/` | `https://{owner}.github.io/{repo}/` |
| User site | repository `{owner}.github.io` | `/` | `https://{owner}.github.io/` |
| Dominio custom | `deploy.customDomain` valorizzato | `/` | `https://{customDomain}/` |

Regole:

- Tutti gli asset in `public/` vanno referenziati con
  `joinURL(useRuntimeConfig().app.baseURL, 'path')`, non con `/path` assoluto.
  Un path assoluto ignora il base URL e produce 404 su project site.
- `NUXT_PUBLIC_SITE_URL` alimenta canonical, hreflang, sitemap e OG.
- Con dominio custom, lo script scrive `CNAME` nell'output: non configurarlo
  anche a mano in modo diverso nelle impostazioni Pages.
- Forzare HTTPS nelle impostazioni Pages.
- In `pnpm dev` il base URL è `/`.

## Variabili d'ambiente

| Variabile | Dove | Segreta | Note |
| --- | --- | --- | --- |
| `GITHUB_TOKEN` o `NUXT_GITHUB_TOKEN` | build | Sì | Lettura GitHub. In locale `$(gh auth token)`; in CI `secrets.GITHUB_TOKEN` |
| `GITHUB_OFFLINE` | locale / CI PR | No | `1` = snapshot o fixture, nessuna rete |
| `NUXT_APP_BASE_URL`, `NUXT_PUBLIC_SITE_URL` | build | No | Impostate da `scripts/deploy.mjs`; servono a mano solo per `nuxt generate` diretto |
| `NUXT_PUBLIC_PLAUSIBLE_DOMAIN` | build | No | Opzionale, vuoto di default |

Note:

- `runtimeConfig.githubToken` è **server-only**. Non usare il prefisso
  `NUXT_PUBLIC_` per il token.
- Il `GITHUB_TOKEN` di Actions basta per leggere dati pubblici via GraphQL e
  REST (limite REST: 1.000 richieste/ora per repository). Un token personale
  serve solo per deploy locali o per limiti più alti; se usato, deve avere solo
  accesso in lettura ai repository pubblici.
- `.env` è ignorato da git; `.env.example` documenta le chiavi.

## Primo deploy (per chi clona)

```text
1. Fork o clone del repository (o "Use this template").
2. Modificare data/site.json e data/profile/en.json.
3. pnpm install
4. GITHUB_TOKEN=$(gh auth token) pnpm run deploy
5. Una sola volta: Settings → Pages → Source "Deploy from a branch",
   branch gh-pages, cartella / (root).
```

Da quel momento ogni push su `main` ripubblica il sito tramite `deploy.yml`;
il deploy locale resta disponibile per un refresh immediato.

## Pipeline CI (`ci.yml`)

Obiettivi: feedback rapido sulle PR, nessun segreto, build riproducibile.

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 11

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:unit

      - run: pnpm generate
        env:
          NUXT_APP_BASE_URL: /
          NUXT_PUBLIC_SITE_URL: http://localhost:3000/
          GITHUB_OFFLINE: "1"

      - run: git diff --exit-code data/schema
      - run: pnpm check:budget

      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e

      - run: pnpm exec lhci autorun
        continue-on-error: true
```

Scelte:

- Le PR non usano la rete GitHub: `GITHUB_OFFLINE=1` + fixture versionata.
  Questo evita rate limit, flakiness ed esposizione di segreti ai fork.
- `git diff --exit-code data/schema` fallisce se i JSON Schema rigenerati dalla
  build non coincidono con quelli committati.
- `pnpm generate` in CI valida anche `data/`, schema e prerender.
- I budget in byte (`check:budget`) sono il gate di performance: sono
  deterministici.
- Lighthouse CI produce un report ma non blocca: i punteggi su runner condivisi
  variano da un run all'altro.

## Pipeline di deploy (`deploy.yml`)

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: deploy
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 11

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Restore GitHub snapshot
        uses: actions/cache@v4
        with:
          path: .cache/github
          key: github-${{ github.repository }}-${{ github.run_id }}
          restore-keys: |
            github-${{ github.repository }}-

      - run: pnpm install --frozen-lockfile

      - name: Generate and publish
        run: pnpm run deploy
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Smoke test
        run: |
          set -e
          base="$(node -p "require('./.output/public/build.json').siteUrl")"
          for i in $(seq 1 30); do
            if curl -fsS "${base}build.json" | grep -q "$GITHUB_SHA"; then break; fi
            sleep 10
          done
          curl -fsS "${base}build.json" | grep -q "$GITHUB_SHA"
          curl -fsS "${base}sitemap.xml" > /dev/null
          test "$(curl -s -o /dev/null -w '%{http_code}' "${base}this-does-not-exist")" = "404"
```

Note:

- Ogni push su `main` rigenera il sito e aggiorna stelle, date, README e
  anteprime. Per un refresh senza modifiche: `workflow_dispatch` dalla tab
  Actions oppure `pnpm run deploy` in locale.
- Lo smoke test aspetta (fino a 5 minuti) che Pages serva il `build.json` del
  commit appena pubblicato, poi controlla sitemap e 404.
- `concurrency: deploy` con `cancel-in-progress: false` evita deploy intermedi
  che si sovrascrivono.
- Il job summary riporta i conteggi della sync (repository, esclusi, preview per
  sorgente, fallback).
- Le action di terze parti vanno pinnate a SHA; le action GitHub ufficiali
  possono restare a major.

## Cache

| Cosa | Chiave | Note |
| --- | --- | --- |
| pnpm store | gestita da `setup-node` (`cache: pnpm`) | Velocizza install |
| Build Nuxt | `.nuxt/cache` (opzionale) | Utile se il tempo cresce |
| Snapshot GitHub | `.cache/github` con `restore-keys` | Fallback se l'API è giù |
| Clone di `gh-pages` | `node_modules/.cache/gh-pages` | Gestita dalla libreria |

Lo snapshot ha una scadenza logica di 7 giorni. `actions/cache` elimina le voci
non usate da 7 giorni: con deploy rari il fallback in CI può non esserci, e in
quel caso un'API irraggiungibile fa fallire la build (si riprova con
`workflow_dispatch`).

## Sicurezza della supply chain

- Lockfile committed; `pnpm install --frozen-lockfile` in CI.
- Dependabot/Renovate settimanale; major revisionate manualmente.
- `pnpm audit --prod` in CI.
- Secret scanning e push protection attivi su GitHub.
- Permessi workflow minimi: `contents: read` in CI, `contents: write` solo nel
  deploy.
- Nessun `pull_request_target` con checkout di codice non fidato.
- Nessun segreto in `NUXT_PUBLIC_*`, log o messaggi di errore.
- Action di terze parti pinnate a commit SHA.

## Header di sicurezza

GitHub Pages non permette header HTTP personalizzati. Opzioni:

1. **Meta tag** in `nuxt.config.ts` (`app.head.meta`): CSP e referrer policy.
   Utile ma parziale.
2. **Cloudflare** davanti al dominio custom: header completi, HSTS, CSP,
   `frame-ancestors`, `Permissions-Policy`.
3. **Accettare i limiti** di GitHub Pages per l'MVP, con una CSP meta
   restrittiva.

CSP minima compatibile con Nuxt statico, via `<meta http-equiv>`:

```text
default-src 'self';
img-src 'self' data: https://raw.githubusercontent.com https://avatars.githubusercontent.com
        https://repository-images.githubusercontent.com https://user-images.githubusercontent.com
        https://github.com https://private-user-images.githubusercontent.com;
style-src 'self' 'unsafe-inline';
font-src 'self';
script-src 'self' 'unsafe-inline';
connect-src 'self';
base-uri 'self';
form-action 'self' mailto:;
```

Limiti noti:

- `frame-ancestors`, `report-uri` e `sandbox` **vengono ignorati** dai browser
  in una CSP via `<meta>`: la protezione da clickjacking richiede un header,
  quindi Cloudflare o un altro hosting.
- `'unsafe-inline'` per script e style è un compromesso dovuto agli script
  inline di idratazione e agli stili di Nuxt UI. Il README è comunque
  sanificato a build time.
- `X-Content-Type-Options` non è esprimibile via meta.

## Monitoraggio

| Cosa | Strumento | Frequenza |
| --- | --- | --- |
| Deploy riuscito | Smoke test in `deploy.yml` + notifica Actions | Ogni deploy |
| Performance e a11y | Lighthouse CI (report) + budget in byte (gate) | Ogni PR |
| Link rotti | lychee | Settimanale |
| Vulnerabilità | Dependabot + `pnpm audit` | Continua |
| Web Vitals reali | Analytics opzionale (Plausible/Umami) | Se approvato |

Nessun uptime monitor: la disponibilità di GitHub Pages non è qualcosa su cui
l'owner possa intervenire. Nessun analytics è attivo di default; se aggiunto,
deve essere cookieless e documentato.

## Backup e rollback

- **Codice e dati owner:** git. Ogni deploy corrisponde a un commit di `main` e
  a un commit di `gh-pages`.
- **Rollback rapido del sito:** riportare il branch `gh-pages` al commit del
  deploy precedente.
- **Rollback del codice:** `git revert` del commit problematico su `main` e
  push, oppure `workflow_dispatch` su un ref precedente.
- **Rollback dati GitHub:** i dati sono pubblici e ricostruibili con un nuovo
  deploy.

Procedura di rollback:

```text
1. Identifica l'ultimo deploy buono nella storia del branch gh-pages.
2. Ripubblica quello stato: workflow_dispatch sul commit buono di main
   (oppure git revert su main e push).
3. Se serve subito, riporta gh-pages al commit buono (operazione distruttiva
   sul branch di deploy: da fare consapevolmente).
4. Verifica home, un dettaglio e la 404.
5. Apri una issue per la causa e correggi su un branch.
```

## Runbook

### La build fallisce per token mancante

1. In locale: `GITHUB_TOKEN=$(gh auth token) pnpm run deploy` (serve la GitHub
   CLI autenticata) oppure un token personale in sola lettura.
2. Per lavorare senza rete: `GITHUB_OFFLINE=1 pnpm dev`.
3. In CI: verifica che lo step passi `secrets.GITHUB_TOKEN`.

### La build fallisce per rate limit GitHub (403/429)

1. Controlla nei log il `rateLimit` della query GraphQL e il numero di README
   richiesti.
2. Se lo snapshot è valido (< 7 giorni), la build prosegue con warning. Se non
   lo fa, verifica la cache.
3. Se persiste, riduci `github.maxRepos` o attendi la finestra successiva; non
   disattivare la validazione.

### Il sito mostra il README del repository invece del portfolio

1. Pages sta servendo `main`: imposta Settings → Pages → branch `gh-pages`,
   cartella `/ (root)`.
2. Verifica che il branch `gh-pages` esista e contenga `index.html`.

### Asset 404 dopo il deploy

1. Verifica che l'output contenga `.nojekyll`: senza, Pages ignora `_nuxt/`.
2. Controlla il base URL calcolato (è nei log di `pnpm run deploy`).
3. Verifica che gli asset in `public/` usino `joinURL(baseURL, path)`.

### Schema GitHub non valido

1. Il log indica repository e campo.
2. Verifica la risposta API per quel repository.
3. Aggiorna lo schema **solo** se il cambiamento è legittimo e documentato.
4. Aggiungi un test con il payload reale (anonimizzato se necessario).

### JSON in `data/` non valido

1. Il messaggio riporta file e percorso del campo.
2. L'editor segnala lo stesso errore grazie a `$schema`.
3. Correggi il JSON; non aggiungere fallback silenziosi.

### Preview sbagliata o mancante per un repository

1. Nei log, cerca `previewSource` del repository.
2. Aggiungi un file per convenzione (es. `.github/preview.png`) nel repository
   oppure un `.repo-story.json` con `preview`.
3. Ripubblica.

### README non visualizzato

1. Verifica che il repository abbia un README sul branch di default.
2. Controlla dimensione (limite `readmeMaxBytes`) e risposta API.
3. Il fallback deve mostrare il link a GitHub, non una pagina bianca.

## Cutover dal legacy

Il legacy Next.js è stato rimosso dal working tree. La storia git resta come
archivio, ma non esiste più codice Next.js nel repository: niente `src/`,
`context/`, `actions/`, `email/`, `react-email-starter/`, `next.config.mjs` o
vecchia workflow.

### Cosa resta

- `docs/` — documentazione.
- `public/repo-placeholder/` — asset placeholder.
- `public/favicon.ico` — favicon.
- `.github/RepoPortfolio-Your-GitHub-Story/index.png` — preview del repository
  (path legacy, ancora riconosciuto dalla discovery).
- file minimi (`.gitignore`, `.editorconfig`, `LICENSE`, ecc.).
- la storia git.

Ordine di lavoro:

1. Scaffold Nuxt 4 in una cartella temporanea e unione con i file rimasti.
2. Installare i moduli del tech stack.
3. Creare `data/` con i contenuti migrati dal legacy.
4. Aggiungere `scripts/deploy.mjs`, `ci.yml` e `deploy.yml`.
5. Primo `pnpm run deploy`, poi impostare Pages sul branch `gh-pages`.
6. Verificare base URL, smoke test e URL legacy.

### Compatibilità URL

Il legacy era una one-page **in italiano** con hash (`/#about`, `/#projects`,
`/#skills`, `/#experience`, `/#contact`). La nuova landing mantiene gli stessi
`id` di sezione, quindi i vecchi link continuano ad atterrare sulla sezione
giusta, nella lingua di default. Non c'è redirect automatico verso `/it/`
(nessun rilevamento della lingua).

| Legacy | Nuovo (lingua default) | Nuovo (IT) |
| --- | --- | --- |
| `/#home` | `/` (Bento con `id="home"`) | `/it/` |
| `/#about` | `/#about` (Profile/Bento) | `/it/#about` |
| `/#projects` | `/#projects` (Explore) | `/it/#projects` |
| `/#skills` | `/#skills` (Tech Stack) | `/it/#skills` |
| `/#experience` | `/#experience` (GitHub Story) | `/it/#experience` |
| `/#contact` | `/#contact` (quick actions) | `/it/#contact` |
| Dialog progetto | `/projects/{slug}` | `/it/projects/{slug}` |

### Checklist di cutover

- [x] Legacy rimosso dal working tree (storia in git).
- [x] `docs/` non è più output di build.
- [ ] `pnpm run deploy -- --dry-run` produce `.output/public` con `.nojekyll`.
- [ ] Pages impostato su "Deploy from a branch" → `gh-pages`.
- [ ] Base URL corretto (project site, user site o dominio custom).
- [ ] Smoke test su home, dettaglio, sitemap, 404.
- [ ] Gli `id` di sezione legacy esistono nella nuova landing.
- [ ] Dominio custom (se presente) verificato.
- [ ] Vecchia workflow rimossa.
- [ ] Badge e link nel README aggiornati.

## Costi e quote

| Voce | Costo |
| --- | --- |
| GitHub Pages | 0 € |
| GitHub Actions (repo pubblico) | 0 € (minuti inclusi) |
| Dominio custom | ~10–15 €/anno (opzionale) |
| Analytics privacy-friendly | 0 € (free tier) o ~5 €/mese |

Il progetto deve restare utilizzabile a costo zero. Ogni servizio opzionale va
progettato per essere rimosso senza rompere il sito.
