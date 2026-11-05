# 07 — Infrastruttura e deploy

## Obiettivo

> Chi clona modifica i JSON in `data/` e fa **commit sul branch di default**. Il
> sito è online su GitHub Pages.

Non ci sono comandi di pubblicazione né credenziali da configurare: l'unico
modo di pubblicare è la GitHub Action `deploy.yml` (ADR-030).

## Ambienti

| Ambiente | Dove | Scopo | Dati GitHub |
| --- | --- | --- | --- |
| Locale | `pnpm dev` | Sviluppo | REST pubblico (nessun token) o `GITHUB_OFFLINE=1` |
| Anteprima locale | `pnpm preview:deploy` | Il sito come verrà pubblicato, sotto il base URL | REST pubblico o `GITHUB_OFFLINE=1` |
| CI pull request | GitHub Actions `ci.yml` | Lint, typecheck, test, build, budget | Fixture, niente rete GitHub |
| Produzione | GitHub Pages, sorgente "GitHub Actions" | Sito pubblico | Generato da `deploy.yml` |

Non esiste uno staging permanente: il costo non è giustificato per un sito
statico.

## Modello di hosting

**Scelta:** GitHub Pages con sorgente **"GitHub Actions"**. `deploy.yml` genera
`.output/public`, lo carica con `actions/upload-pages-artifact` e lo pubblica con
`actions/deploy-pages` (ADR-030). Nessun branch di output.

| Aspetto | GitHub Pages |
| --- | --- |
| Costo | 0 € |
| CDN | Sì (Fastly) |
| HTTPS | Automatico |
| Header HTTP custom | No (limite) |
| Redirect server-side | No (solo `404.html`) |
| Pubblicazione | Deployment dell'artefatto, online in ~1 minuto |
| Limite sito | 1 GB (soft), 100 GB/mese (soft) |

Senza Jekyll le cartelle `_nuxt/` e `__sitemap__/` sono servite senza
`.nojekyll`, e la storia dei deployment sta nell'environment `github-pages`.

Alternative documentate:

| Hosting | Pro | Contro |
| --- | --- | --- |
| Cloudflare Pages | Header, redirect, preview PR | Configurazione separata |
| Netlify | Preview, redirect | Limiti free tier |
| Vercel | Ottimo supporto Nuxt | SSR non necessario |

L'output è `.output/public`: cambiare hosting significa cambiare solo il job di
pubblicazione di `deploy.yml`.

## La build del sito (`pnpm build:site`)

`scripts/build-site.mjs` è l'unico modo di generare il sito come verrà
pubblicato, in CI e in locale:

```text
pnpm build:site [-- --data datasets/me]
  ├─ legge .env se esiste (le variabili già nell'ambiente vincono)
  ├─ risolve la cartella dati (--data, PORTFOLIO_DATA_DIR, default data/)
  ├─ risolve owner e repository (GITHUB_REPOSITORY in CI, git remote in locale)
  ├─ calcola base URL e URL del sito (project site, user site, dominio custom)
  ├─ nuxt generate
  └─ scrive build.json (commit, data, URL) per lo smoke test
```

`pnpm preview:deploy` esegue la stessa build e serve `.output/public` sotto il base
URL su `http://localhost:4173/{repo}/`, con `404.html` e status 404 come su Pages.
Canonical, hreflang e OG puntano all'URL pubblico.

Regole:

- Il token è opzionale e alza solo il rate limit REST; in CI si usa il
  `GITHUB_TOKEN` del workflow. Non viene mai stampato.
- Il dataset si sceglie con `PORTFOLIO_DATA_DIR` (ADR-029): variabile di
  repository in Actions, `.env` o `--data` in locale.

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
- Con dominio custom, oltre a `deploy.customDomain` il dominio va inserito una
  volta in Settings → Pages → Custom domain: con la sorgente "GitHub Actions" un
  file `CNAME` nell'output verrebbe ignorato.
- Forzare HTTPS nelle impostazioni Pages.
- In `pnpm dev` il base URL è `/`.

## Variabili d'ambiente

| Variabile | Dove | Segreta | Note |
| --- | --- | --- | --- |
| `GITHUB_TOKEN` o `NUXT_GITHUB_TOKEN` | build | Sì (opzionale) | Alza il rate limit REST; la build funziona anche senza |
| `GITHUB_OFFLINE` | locale / CI PR | No | `1` = snapshot o fixture, nessuna rete |
| `GITHUB_REFRESH` | locale | No | `1` = in `pnpm dev` ignora lo snapshot < 24 h e sincronizza |
| `PORTFOLIO_DATA_DIR` | locale / deploy | No | Cartella dati alternativa (es. `datasets/me`); vuota = `data/` (ADR-029). In Actions: variabile di repository |
| `NUXT_APP_BASE_URL`, `NUXT_PUBLIC_SITE_URL` | build | No | Impostate da `scripts/deploy.mjs`; servono a mano solo per `nuxt generate` diretto |
| `NUXT_PUBLIC_PLAUSIBLE_DOMAIN` | build | No | Opzionale, vuoto di default |

Note:

- `runtimeConfig.githubToken` è **server-only**. Non usare il prefisso
  `NUXT_PUBLIC_` per il token.
- Senza token GitHub REST consente **60 richieste/ora** per IP. La pipeline usa
  solo 1–3 richieste API per la lista, quindi il limite è sufficiente. Un token
  in sola lettura alza il limite a 5.000/ora; in CI il `GITHUB_TOKEN` del
  workflow è già disponibile.
- `.env` è ignorato da git; `.env.example` documenta le chiavi.

## Primo deploy (per chi clona)

```text
1. "Use this template" o fork del repository.
2. Una sola volta: Settings → Pages → Source "GitHub Actions".
3. Modificare data/site.json e data/profile/en.json.
4. Commit e push sul branch di default (va bene anche l'editor web di GitHub).
```

Da quel momento ogni push sul branch di default ripubblica il sito tramite
`deploy.yml`, qualunque sia il suo nome. Per un refresh senza modifiche: Actions →
Deploy → Run workflow.

Con un dataset diverso da `data/`, la variabile di repository
`PORTFOLIO_DATA_DIR` va impostata **prima** del push, altrimenti il deploy
pubblica il template.

`pnpm/action-setup` non riceve una versione: la legge da `packageManager` in
`package.json`, e dichiararne una diversa (anche solo `11` contro `11.9.0`) fa
fallire il workflow. Il supporto a pnpm 11 parte dalla v6 dell'action.

## Pipeline CI (`ci.yml`)

Obiettivi: feedback rapido sulle PR, nessun segreto, build riproducibile.

```yaml
name: CI

on:
  pull_request:
  push:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    if: github.event_name == 'pull_request' || github.ref_name == github.event.repository.default_branch
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: pnpm/action-setup@v6

      - uses: actions/setup-node@v7
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

      # Report informativo, non bloccante (ADR-026).
      - name: Lighthouse CI (report)
        run: pnpm dlx @lhci/cli@0.15.1 autorun
        continue-on-error: true
```

`@lhci/cli` non è una devDependency: gira con `pnpm dlx` a versione fissata, così
non appesantisce ogni `pnpm install`. Gli E2E e Lighthouse servono l'output con
`scripts/serve-static.mjs`, che si comporta come GitHub Pages (cartelle con
`index.html`, `404.html` con status 404).

### Controlli settimanali (`weekly.yml`)

Ogni lunedì (e su dispatch manuale): `pnpm generate` con lo stesso dataset del
deploy, lychee sull'HTML generato (action pinnata a SHA) e `pnpm audit --prod`.
Non ripubblica nulla: il deploy resta legato ai push (ADR-002).

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

Il file è la fonte: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

```text
push su qualunque branch / workflow_dispatch
  job build (solo se github.ref_name == branch di default)
    checkout → pnpm → node 22 → snapshot GitHub → pnpm install --frozen-lockfile
    pnpm build:site (GITHUB_TOKEN, vars.PORTFOLIO_DATA_DIR)
    upload-pages-artifact (.output/public)
  job deploy (pages: write, id-token: write; environment github-pages)
    deploy-pages → smoke test
```

Note:

- Il confronto con `github.event.repository.default_branch` evita di scrivere il
  nome del branch nel workflow: `main`, `master` o altro funzionano senza
  configurazione. I push sugli altri branch compaiono come run saltati.
- Ogni push sul branch di default rigenera il sito e aggiorna stelle, date, README
  e anteprime. Per un refresh senza modifiche: `workflow_dispatch` dalla tab
  Actions.
- Lo smoke test aspetta (fino a 5 minuti) che Pages serva il `build.json` del
  commit appena pubblicato, poi controlla home, CV, export, sitemap e 404.
- `concurrency: pages` con `cancel-in-progress: false` evita deploy intermedi che
  si sovrascrivono.
- `deploy.yml` non dipende da `ci.yml`: il gate di qualità è sulla PR. Un push
  diretto sul branch di default pubblica anche se la CI poi fallisce.
- Le action di terze parti vanno pinnate a SHA; le action GitHub ufficiali
  possono restare a major.

## Cache

| Cosa | Chiave | Note |
| --- | --- | --- |
| pnpm store | gestita da `setup-node` (`cache: pnpm`) | Velocizza install |
| Build Nuxt | `.nuxt/cache` (opzionale) | Utile se il tempo cresce |
| Snapshot GitHub | `.cache/github` con `restore-keys` | Fallback se l'API è giù |

Lo snapshot ha una scadenza logica di 7 giorni. `actions/cache` elimina le voci
non usate da 7 giorni: con deploy rari il fallback in CI può non esserci, e in
quel caso un'API irraggiungibile fa fallire la build (si riprova con
`workflow_dispatch`).

## Sicurezza della supply chain

- Lockfile committed; `pnpm install --frozen-lockfile` in CI.
- Dependabot/Renovate settimanale; major revisionate manualmente.
- `pnpm audit --prod` in CI.
- Secret scanning e push protection attivi su GitHub.
- Permessi workflow minimi: `contents: read` ovunque; `pages: write` e
  `id-token: write` solo nel job che pubblica.
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

- **Codice e dati owner:** git. Ogni deploy corrisponde a un commit del branch di
  default e a un deployment dell'environment `github-pages`.
- **Rollback del sito:** `git revert` del commit problematico e push: il deploy
  riparte da solo.
- **Rollback dati GitHub:** i dati sono pubblici e ricostruibili con un nuovo
  deploy.

Procedura di rollback:

```text
1. Identifica il commit problematico (tab Actions o Deployments).
2. git revert <commit> e push sul branch di default.
3. Attendi deploy e smoke test, poi verifica home, un dettaglio e la 404.
4. Apri una issue per la causa e correggi su un branch.
```

## Runbook

### La build non aggiorna i dati (rate limit o API giù)

1. In locale: `pnpm build:site` funziona senza token; se il limite è stato
   esaurito, attendi il reset o imposta un token in sola lettura.
2. Per lavorare senza rete: `GITHUB_OFFLINE=1 pnpm dev`.
3. In CI: `GITHUB_OFFLINE=1` usa fixture/snapshot e non richiede segreti.

### La build fallisce per rate limit GitHub (403/429)

1. Controlla nei log `x-ratelimit-remaining` e `x-ratelimit-reset`.
2. Se lo snapshot è valido (< 7 giorni), la build prosegue con warning. Se non
   lo fa, verifica la cache.
3. Se persiste, riduci `github.maxRepos`, attendi la finestra successiva o
   imposta un token in sola lettura; non disattivare la validazione.

### Il sito mostra il README del repository invece del portfolio

1. Pages sta servendo un branch: imposta Settings → Pages → Source "GitHub
   Actions".
2. Rilancia Actions → Deploy → Run workflow.

### Asset 404 dopo il deploy

1. Verifica che la sorgente di Pages sia "GitHub Actions": un branch servito con
   Jekyll ignorerebbe `_nuxt/`.
2. Controlla il base URL calcolato (è nei log di `pnpm build:site`).
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
4. Aggiungere `scripts/build-site.mjs`, `ci.yml` e `deploy.yml`.
5. Merge sul branch di default: la sorgente di Pages è già "GitHub Actions".
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
| `/#about` | `/#about` (About) | `/it/#about` |
| `/#projects` | `/#projects` (Explore) | `/it/#projects` |
| `/#skills` | `/#skills` (Skills) | `/it/#skills` |
| `/#experience` | `/#experience` (GitHub Story) | `/it/#experience` |
| `/#contact` | `/#contact` (footer contatti) | `/it/#contact` |
| Dialog progetto | `/projects/{slug}` | `/it/projects/{slug}` |

### Checklist di cutover

- [x] Legacy rimosso dal working tree (storia in git).
- [x] `docs/` non è più output di build.
- [x] `pnpm build:site` produce `.output/public` con `build.json`.
- [ ] Pages impostato su "GitHub Actions" (già così per il legacy, da verificare).
- [ ] Variabile `PORTFOLIO_DATA_DIR` impostata, se serve un altro dataset.
- [ ] Base URL corretto (project site, user site o dominio custom).
- [ ] Smoke test su home, CV, export, sitemap, 404 (in `deploy.yml`; il dettaglio è coperto dagli E2E).
- [x] Gli `id` di sezione legacy esistono nella nuova landing (E2E).
- [ ] Dominio custom (se presente) verificato.
- [x] Vecchia workflow rimossa.
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
