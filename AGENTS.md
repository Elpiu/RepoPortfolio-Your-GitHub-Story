# AGENTS.md

Istruzioni permanenti per i coding agent che lavorano in questa repository.
Valgono per ogni task; il prompt del singolo task dice **cosa** fare, questo
file dice **come**.

## Il progetto in breve

RepoPortfolio è un portfolio statico generato dai dati GitHub dell'owner.

> Un motore a manutenzione zero che sincronizza la tua identità GitHub in una
> landing page ad alte prestazioni.

- Stack: Nuxt 4 (SSG) · Vue 3 · TypeScript strict · Tailwind 4 · Nuxt UI ·
  zod · GitHub REST pubblico (ADR-028) · `gh-pages`.
- Stile: **Engineered Minimalism** (Linear/Vercel/Raycast), dark-first, un solo
  accento emerald, Geist + Geist Mono.
- Chi clona modifica **solo** i JSON in `data/` e pubblica con
  `pnpm run deploy`. Payload alternativi con la stessa forma stanno in
  `datasets/{nome}/` e si scelgono con `PORTFOLIO_DATA_DIR` (ADR-029).

## Prima di toccare il codice

La documentazione in `docs/` (in italiano) è la specifica. Leggi sempre
`docs/README.md`, poi i documenti pertinenti al task:

| Ti serve | Leggi |
| --- | --- |
| Milestone, ADR, decisioni chiuse | `docs/09-roadmap-e-adr.md` |
| Feature e criteri di accettazione | `docs/02-feature.md` |
| Struttura cartelle, flusso dati, layer | `docs/03-architettura.md` |
| Dipendenze ammesse e configurazione | `docs/04-tech-stack.md` |
| `data/`, schemi, query GraphQL, preview, story | `docs/05-dati-e-contenuti.md` |
| Token, tipografia, componenti, a11y | `docs/06-design-system.md` |
| Deploy, workflow, base URL, runbook | `docs/07-infrastruttura-deploy.md` |
| Test, budget, convenzioni di codice | `docs/08-qualita-testing.md` |

Gerarchia delle fonti:

1. Il prompt del task.
2. Gli ADR con stato **Accettata** in `docs/09-roadmap-e-adr.md` (quelli
   **Superata** non valgono più).
3. Il documento proprietario del tema: token → 06, priorità → 02, dati → 05.
4. Gli altri documenti.

Se trovi una contraddizione, segui la fonte più alta e **segnalala** nel
report. Non inventare una terza soluzione e non cambiare un ADR accettato di tua
iniziativa.

## Struttura e confini

```text
data/      JSON dell'owner (site.json, profile/{locale}.json) + schema/ generati
datasets/  payload alternativi con la stessa forma di data/ (PORTFOLIO_DATA_DIR)
app/       presentazione: pages, layouts, components, composables
shared/    schemi zod, tipi di dominio, utility pure — nessun import da app/ o server/
server/    integrazione GitHub, normalizzazione, README, cache — solo build time
modules/   moduli Nuxt locali (validate-data, prerender-routes, icon-bundle)
scripts/   deploy, data-dir, repo-context, check-budget, serve-static (Node puro, .mjs)
i18n/      stringhe UI del motore
docs/      specifica
```

- `app/` non conosce GitHub, zod né il filesystem.
- Le forme grezze dell'API GitHub non escono da `server/`; ovunque si usa il
  modello di dominio di `shared/types`.
- I componenti importano solo tipi (`import type`) da `shared/`: zod non deve
  finire nel bundle client.

## Regole non negoziabili

- **Solo `data/` per l'owner.** Nessun dato personale, nome, link o testo
  biografico nel codice (i JSON in `datasets/` sono dati, non codice). Una
  feature che obbliga chi clona a toccare file fuori da `data/` è sbagliata.
- **Nessuna richiesta esterna a runtime**, tranne le immagini GitHub. Niente
  chiamate a `api.github.com` dal browser, font e icone self-hosted.
- **Dipendenze:** solo quelle in `docs/04-tech-stack.md`. Niente Pinia,
  `date-fns`/`dayjs`, Embla o librerie di animazione. Per aggiungerne una serve
  prima l'approvazione dell'utente.
- **Stato:** filtri nella query string, preferenze con `useStorage`, stato
  locale nei componenti. Nessuno store globale.
- **i18n:** nessuna stringa UI hardcoded; `detectBrowserLanguage: false`;
  nessun cookie; lingue lette dal registry in `data/site.json`.
- **Date:** nell'HTML statico solo date assolute (`YYYY.MM.DD`, UTC); le date
  relative si calcolano dopo il mount con `Intl`.
- **Design:** solo token semantici (`bg-surface`, `text-foreground-muted`…),
  nessun colore arbitrario, nessun `!important`, un solo accento, nessuna
  animazione di comparsa allo scroll. Nuxt UI serve per comportamento e
  accessibilità; l'aspetto segue i token di 06.
- **Accessibilità WCAG 2.2 AA:** un solo `h1`, landmark, focus visibile,
  tastiera, `prefers-reduced-motion`, nessuna informazione affidata solo al
  colore.
- **Sicurezza:** il token GitHub vive solo in variabili d'ambiente server-side
  (mai `NUXT_PUBLIC_*`), non viene mai stampato né committato. Il README dei
  repository si sanifica in build; `v-html` solo in `ReadmeContent`.
- **Determinismo:** niente `Math.random()` né `Date.now()` nel rendering; il
  "oggi" della build è `syncedAt`.

## Comandi

Gli script esistono dopo lo scaffold (M1); l'elenco completo è in
`docs/08-qualita-testing.md`.

```bash
pnpm install
pnpm dev                            # GITHUB_OFFLINE=1 per lavorare senza rete
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm generate
pnpm check:budget
pnpm exec playwright install chromium   # una volta
pnpm test:e2e                       # sull'output di pnpm generate
pnpm run deploy -- --dry-run        # genera senza pubblicare
```

- **`pnpm run deploy`, mai `pnpm deploy`**: quest'ultimo è un comando interno
  di pnpm.
- La sync GitHub usa il REST pubblico e **non richiede token** (ADR-028); un
  token in sola lettura alza solo il rate limit. Senza rete si lavora con
  `GITHUB_OFFLINE=1` (snapshot dello stesso username o
  `tests/fixtures/github.json`).
- Per un dataset diverso da `data/`: `PORTFOLIO_DATA_DIR=datasets/{nome}` in
  `.env`, oppure `pnpm run deploy -- --data datasets/{nome}`.
- L'owner lavora su **Windows**: gli script in `package.json` devono essere
  cross-platform. Niente `VAR=x cmd` né comandi Unix negli script; le variabili
  d'ambiente si passano dagli script Node in `scripts/`.

## Come lavorare

- **Un task alla volta, nel perimetro richiesto.** Non anticipare milestone
  successive; al massimo lascia punti di estensione (cartelle, tipi) senza
  logica.
- **Test insieme al codice:** la logica pura (normalizzazione, filtri, preview,
  lane della story, base URL, validazione) ha test unitari in `tests/unit/`.
- **Verifica prima di dichiarare finito:** esegui lint, typecheck, test e
  generate e riporta l'esito reale. Se un controllo non è stato eseguito o non
  passa, dillo.
- **Documentazione viva:** se una scelta di implementazione cambia una
  decisione, aggiorna il documento proprietario e il registro ADR in 09 nello
  stesso branch, e segnalalo nel report.
- **Nel dubbio, chiedi:** se un requisito è ambiguo e la scelta non è
  reversibile in modo economico, fermati e chiedi all'utente invece di
  indovinare.

## Git

- Branch: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Conventional Commits in inglese, piccoli e con una sola intenzione
  (`feat: add theme toggle`, `fix: resolve base url for user sites`).
- Committa `pnpm-lock.yaml` e `data/schema/*.json`. Non committare `.output/`,
  `.nuxt/`, `.cache/`, `.env` o artefatti di build.
- **Senza richiesta esplicita dell'utente:** niente push, niente pull request,
  niente `pnpm run deploy` senza `--dry-run`, niente scritture sul branch
  `gh-pages`.

## Definition of Done

Una modifica è finita quando:

- soddisfa i criteri di accettazione del task (in `docs/02` o `docs/09`);
- lint, typecheck, test e `pnpm generate` sono verdi;
- funziona a 320 px, da tastiera e con reduced motion;
- non introduce richieste esterne a runtime né stringhe hardcoded;
- rispetta i budget in byte;
- la documentazione è aggiornata, se serve.

## Report finale di ogni task

1. Cosa hai fatto (per commit).
2. Comandi eseguiti ed esito reale.
3. Criteri di accettazione: soddisfatti / non verificati.
4. Deviazioni dai documenti, con il motivo.
5. Contraddizioni trovate nei documenti.
6. Decisioni prese da solo, che l'utente dovrebbe confermare.
7. Cosa serve per il passo successivo.
