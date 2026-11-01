# 09 — Roadmap e decisioni

## Stato della fase 0

La fase 0 (design e pianificazione) è quasi conclusa. Prima dello scaffold
servono:

- [x] conferma delle feature pilastro (documento 02);
- [x] decisione su ADR-010 (inglese default, lingue estensibili);
- [x] conferma della direzione visiva e palette (documento 06);
- [x] rimozione completa del legacy Next.js;
- [x] revisione di coerenza con la visione (30/10/2026, sezione in fondo);
- [ ] conferma finale delle dipendenze di build e sviluppo (documento 04).

## Roadmap

Le stime sono indicative e non includono imprevisti. Ogni milestone termina con
una demo funzionante e i quality gate verdi.

### M0 — Documentazione e decisioni

**Obiettivo:** allineare prodotto e architettura prima di scrivere codice.

Deliverable:

- Questa cartella `docs/`.
- Selezione feature pilastro approvata.
- ADR chiave risolti.
- Legacy Next.js rimosso dal working tree (storia in git).

Accettazione:

- [x] Nessuna decisione bloccante aperta.
- [x] Il perimetro dell'MVP è chiaro.
- [ ] I documenti non si contraddicono (verifica a ogni modifica).

---

### M1 — Scaffold, fondamenta e deploy

**Obiettivo:** sito navigabile, multilingua, con tema, design token e **già
pubblicabile con un comando**. Il deploy entra subito perché "facile da
rideployare" è parte della visione, non una rifinitura finale.

Attività:

- `nuxi init` con Nuxt 4, TypeScript strict.
- Moduli: UI, icon, fonts (Geist + Geist Mono), i18n, vueuse, sitemap, robots,
  eslint.
- Tailwind 4 + token dark-first in `main.css` + `app.config.ts`.
- Cartella `data/` (`site.json`, `profile/en.json`, `profile/it.json`) e modulo
  `validate-data` con generazione dei JSON Schema.
- Layout default, header, footer, skip link, 404.
- Theme toggle (default dark) e locale switcher dal registry.
- Struttura `shared/`, `server/`, `i18n/`, `scripts/`.
- `scripts/repo-context.mjs` + `scripts/deploy.mjs` con `gh-pages`.
- CI `ci.yml` (lint, typecheck, unit, generate offline, budget) e `deploy.yml`.
- `.env.example`, `.nvmrc`, `packageManager`.

Accettazione:

- [ ] `pnpm dev` e `pnpm generate` funzionano.
- [ ] `pnpm run deploy` pubblica su `gh-pages` con base URL corretto e
      `.nojekyll`.
- [x] Home EN e `/it/` renderizzano con header/footer; con una sola lingua lo
      switcher sparisce.
- [x] Un JSON in `data/` invalido produce un errore con file e campo.
- [x] Il tema scuro è il default; chiaro e scuro sono leggibili.
- [x] Font self-hosted, nessuna richiesta a Google a runtime.
- [ ] Nessuna stringa hardcoded nei componenti.
- [ ] CI verde su una PR di prova.

Stima: 4–6 giorni.

---

### M2 — Project Engine & Explore

**Obiettivo:** dati GitHub reali via REST pubblico, validati, e sezione
Explore filtrabile.

Attività:

- `server/utils/github-rest.ts` con paginazione, retry, timeout, token
  opzionale, log di `x-ratelimit-remaining`.
- Schema `githubRestRepoNodeSchema`, `repositorySchema`, `repoStorySchema`.
- `normalize.ts`: esclusioni (fork, archived, profilo, topic, manifest), slug,
  size, license; `lastCommit`/`latestRelease` null.
- `preview.ts`: discovery (manifest → convenzione per i featured → README →
  placeholder).
- `languages.ts`, `activity.ts`.
- Cache `.cache/github/last-good.json` e modalità `GITHUB_OFFLINE`.
- Fixture `tests/fixtures/github.json`.
- `server/api/repositories.get.ts` e hook `prerender:routes`.
- `ProjectCard`, `ProjectGrid`, `ProjectStats`, `ProjectImage`, `ExploreTabs`,
  `ProjectFilters`.
- `useProjectFilters` sulla query string, ricerca debounced, linguaggio, sort,
  reset, tab Open Source, "carica altri".
- Spotlight delegato (`useSpotlight`), `TechDate`.
- Test unit/component/E2E; stringhe UI in tutte le lingue fornite.

Accettazione:

- [ ] Build con API reale produce repository, featured per stelle, language
      stats e activity.
- [x] Build offline usa snapshot o fixture.
- [ ] Un payload invalido fa fallire la build con messaggio utile.
- [ ] La preview viene trovata senza configurazione nei casi di convenzione e
      README; il log riporta la sorgente.
- [x] Il browser non chiama GitHub.
- [x] Tab e filtri sono reattivi, accessibili e condivisibili via URL.
- [ ] CLS < 0,1 sul filtro.

Stima: 6–8 giorni.

---

### M3 — Project Detail

**Obiettivo:** README come pagina.

Attività:

- `server/utils/readme.ts` con markdown-it, Shiki, sanitize-html (memoizzato,
  condiviso con la discovery).
- `server/api/repositories/[slug].get.ts`.
- Pagina `/projects/[slug]` per ogni lingua supportata.
- `ReadmeContent`, `ProjectHero` (linguaggio principale, push, licenza, topics;
  commit e release non disponibili in REST pubblico), breadcrumb.
- Gestione README mancante/troncato e immagini relative.
- `server/plugins/prerender-routes.ts` per le rotte dei dettagli e
  `server/api/__sitemap__/urls.ts` per la sitemap dinamica.
- Fixture README (`tests/fixtures/readmes.json`) per la modalità offline.
- Sitemap, canonical, hreflang, JSON-LD.
- Test sanitizzazione, E2E dettaglio.

Accettazione:

- [x] Ogni repository ha una pagina statica.
- [ ] README sicuro e leggibile in chiaro/scuro.
- [ ] SEO del dettaglio corretta.

Stima: 3–5 giorni.

---

### M4 — GitHub Identity & Story

**Obiettivo:** Bento Grid e Git Graph a lane, il cuore distintivo del prodotto.

Attività:

- `BentoGrid`, `ProfileCard`, `TopRepoCard`, `LanguageBar`, `ActivityCard`.
- Top Repo = repository con più stelle.
- Status dot di disponibilità con testo e reduced motion.
- Quick actions `mailto:`, `tel:`, copia email, GitHub, LinkedIn; CV se\n  `links.cvUrl` è valorizzato (`/cv` arriva in M5).
- `story-events.ts`: eventi automatici dai featured (stelle), deduplicazione
  con i milestone curati.
- `shared/utils/story-graph.ts`: lane, fork, merge (funzione pura).
- `GitGraph` (SVG in build), `StoryNode`, `StoryLegend`.
- Calcolo anni di esperienza da `career.start` e `syncedAt`.
- Test unitari di lane/anni; component/E2E e a11y in M6.

Accettazione:

- [x] La Bento contiene profilo, top repo, language bar e activity.
- [x] Il Top Repo è il repository con più stelle.
- [x] La language bar ha percentuali e legenda accessibile.
- [x] Esperienze sovrapposte su lane diverse; massimo 3 lane.
- [x] I featured compaiono come nodi automatici senza toccare il JSON.
- [x] Il Git Graph è leggibile come lista e da tastiera.
- [x] Quick actions funzionanti; telefono solo se configurato.

Stima: 6–8 giorni.

---

### M5 — CV & Export

**Obiettivo:** esportare il portfolio dagli stessi dati.

Attività:

- Pagina `/cv` localizzata con layout `print` e `CvDocument`.
- `PrintButton` (`window.print()`).
- `server/utils/resume.ts` e server route `/resume.json`,
  `/{locale}/resume.json` (JSON Resume).
- Test unitario dell'export JSON Resume; E2E di stampa ed export in M6.

Accettazione:

- [x] `/cv` mostra gli stessi dati della home, senza duplicazioni in `data/`.
- [ ] L'anteprima di stampa è pulita su A4.
- [ ] `/resume.json` è valido rispetto allo schema JSON Resume.

Stima: 2–3 giorni.

---

### M6 — Qualità e cutover

**Obiettivo:** produzione stabile e aggiornata a ogni push.

Attività:

- Audit a11y completo e fix.
- Budget in byte definitivi; Lighthouse CI come report.
- Smoke test post-deploy su `build.json`, sitemap e 404.
- Link checker settimanale.
- Runbook e rollback provati.
- Cutover legacy: Pages su `gh-pages`, base URL, id di sezione legacy.
- README del progetto con la guida per chi clona.

Accettazione:

- [ ] Deploy su push verde e smoke test verde.
- [ ] Budget rispettati (verificato in locale); report Lighthouse ≥ 95 / a11y 100
      (da leggere in CI).
- [ ] Sito raggiungibile all'URL pubblico con base URL corretto.
- [x] Vecchi hash URL atterrano sulle sezioni giuste.
- [ ] Rollback provato.
- [ ] Un clone pulito va online seguendo solo il README.

Stima: 3–5 giorni.

---

## Backlog prioritizzato

| Priorità | Feature | Valore | Sforzo | Dipendenze |
| --- | --- | --- | --- | --- |
| P1 | Schema version + migrazioni dei JSON in `data/` | Alto (aggiornare il motore senza rompere i cloni) | M | M1 |
| P2 | Command palette (`Ctrl+K`) | Medio | M | M3 |
| P2 | Repo health badges | Medio | S | M2 |
| P2 | Ricerca full-text nel README | Medio | M | M3 |
| P2 | Auto-rebuild cross-repo (`repository_dispatch`) | Medio | S | M6 |
| P2 | Analytics privacy-friendly | Basso/Medio | S | — |
| P3 | Filtro per topic | Basso | S | M2 |
| P3 | Vista tabella/lista | Basso | S | M2 |
| P3 | Progetti correlati | Basso | S | M4 |
| P3 | View Transitions | Basso | S | M3 |
| P4 | Supporto repo privati | Fuori modello | XL | Backend |

## Registro ADR

Questo è l'**unico** registro delle decisioni: gli altri documenti vi
rimandano.

### ADR-001 — Generazione statica con `nuxt generate`

**Stato:** Accettata
**Contesto:** dati uguali per tutti, hosting gratuito, SEO.
**Decisione:** SSG con prerender di tutte le rotte; nessun server runtime.
**Conseguenze:** deploy semplice, costi zero; la freschezza richiede rebuild.
**Alternative:** SSR su Vercel, ISR (non disponibile su Pages), SPA pura.

### ADR-002 — Dati GitHub a build time, deploy su push

**Stato:** Accettata (confermata il 30/10/2026)
**Contesto:** il token non può stare nel browser; servono SEO e stabilità.
**Decisione:** fetch durante la build, validazione zod, snapshot di fallback;
deploy a ogni push su `main`, dispatch manuale o `pnpm run deploy` per un
refresh. Il legame con i push è **intenzionale**: per aggiornare la GitHub Story
si modifica il JSON e si pubblica.
**Conseguenze:** tra un deploy e l'altro stelle, README e activity restano
quelli dell'ultima build. La UI lo dichiara con "Last synced" e la data della
build.
**Alternative:** rebuild programmato (scartato: il refresh deve seguire le
modifiche dell'owner, non un timer; inoltre GitHub disattiva i workflow
programmati nei repository inattivi da 60 giorni), fetch client-side (SEO e
rate limit), webhook + backend (fuori modello).

### ADR-003 — Dati owner come JSON validati con zod

**Stato:** Accettata (rivista il 30/10/2026)
**Contesto:** personalizzazione semplice, niente CMS, chi clona deve toccare il
meno possibile.
**Decisione:** JSON in `data/` (`site.json`, `profile/{locale}.json`), validati
con zod all'avvio della build; JSON Schema generati per l'editor.
**Conseguenze:** modifica = commit; errori bloccanti ma espliciti; nessun file
TypeScript da modificare per l'owner.
**Alternative:** `site.config.ts` (scartato: richiede di toccare TypeScript),
`@nuxt/content`, CMS headless, database.

### ADR-004 — Dettaglio progetto come pagina, non modale

**Stato:** Accettata
**Contesto:** il legacy usava un `<dialog>`; SEO e condivisione erano assenti.
**Decisione:** route statica `/projects/[slug]` localizzata.
**Conseguenze:** URL condivisibili, indicizzazione, più pagine da generare.
**Alternative:** modale come nel legacy, drawer unico.

### ADR-005 — Filtro client-side sul dataset incorporato

**Stato:** Accettata
**Contesto:** meno di 300 repository, dataset piccolo.
**Decisione:** filtro, ricerca e sort nel browser sul payload; nessuna API.
**Conseguenze:** interazioni istantanee e offline; il payload cresce con i repo.
**Soglia di revisione:** > 300 repository o payload > 100 KB → rivalutare.

### ADR-006 — Pinia + URL/VueUse per le preferenze

**Stato:** Superata da ADR-018

### ADR-007 — Tailwind 4 CSS-first + Nuxt UI

**Stato:** Accettata (rivista il 30/10/2026)
**Contesto:** componenti accessibili e token coerenti.
**Decisione:** Tailwind 4 con token in `@theme`; Nuxt UI + Reka UI per
**comportamento e accessibilità**; l'aspetto è riallineato ai token del progetto,
non quello di default di Nuxt UI.
**Conseguenze:** meno CSS custom; serve disciplina per non ereditare il look
"template Nuxt UI".
**Alternative:** daisyUI, Vuetify, Reka UI senza Nuxt UI.

### ADR-008 — Markdown renderizzato e sanificato a build time

**Stato:** Accettata
**Contesto:** README non fidati, bundle client, sicurezza.
**Decisione:** `markdown-it` + Shiki + `sanitize-html` a build time; il client
riceve HTML sanificato.
**Conseguenze:** zero parser nel browser; serve un limite di dimensione e una
allowlist rigorosa.
**Alternative:** rendering runtime, `@nuxt/content`.

### ADR-009 — GitHub Pages + `actions/deploy-pages`

**Stato:** Superata da ADR-019

### ADR-010 — i18n `prefix_except_default`, lingue da `data/site.json`

**Stato:** Accettata (rivista il 30/10/2026)
**Contesto:** inglese di default; l'owner deve poter aggiungere lingue senza
toccare il codice.
**Decisione:** lingua di default su `/`, le altre con il proprio prefisso;
registry `locales` in `data/site.json`; **nessun rilevamento della lingua del
browser e nessun cookie**; una sola lingua è un caso valido (niente switcher);
stringhe UI del motore con fallback inglese.
**Conseguenze:** URL puliti; nessun redirect lato client; hreflang
obbligatorio; aggiungere una lingua = una voce nel registry + un JSON.
**Alternative:** rilevamento su root con cookie (scartato: redirect lato client
su sito statico, flash del contenuto), `no_prefix` (meno SEO), lingue hardcoded.

### ADR-011 — Nessun form, contatto rapido via mailto e telefono

**Stato:** Accettata
**Contesto:** sito statico, spam, manutenzione.
**Decisione:** nessun form di contatto. Pulsanti `mailto:` e `tel:`, link
social e CV.
**Conseguenze:** zero backend e zero spam.
**Alternative:** Formspree/Web3Forms, funzione serverless.

### ADR-012 — Placeholder immagini deterministici

**Stato:** Accettata
**Contesto:** il legacy usava `Math.random()` e causava mismatch SSR/client.
**Decisione:** `id % 8` su immagini locali.
**Conseguenze:** stesso repository = stessa immagine.

### ADR-013 — Nessuna richiesta esterna a runtime, tranne le immagini GitHub

**Stato:** Accettata (rivista il 30/10/2026)
**Contesto:** privacy, performance, affidabilità.
**Decisione:** font self-hosted, icone bundled, dati nel payload. Le immagini
GitHub (avatar, preview, immagini dei README, social image) restano **remote**:
nessun download né ottimizzazione in build.
**Conseguenze:** build più semplice; le preview non sono ottimizzate, quindi non
devono essere l'elemento LCP; CSP `img-src` include gli host GitHub.
**Alternative:** download e conversione AVIF/WebP in build (scartato).

### ADR-014 — Featured manuale con fallback automatico

**Stato:** Superata da ADR-020

### ADR-015 — Node 22 LTS e pnpm

**Stato:** Accettata
**Decisione:** Node 22 LTS, pnpm con Corepack, lockfile committed.
**Conseguenze:** richiede Corepack. Il deploy si lancia con `pnpm run deploy`
(`pnpm deploy` è un comando interno di pnpm).

### ADR-016 — Telefono come azione rapida

**Stato:** Accettata
**Decisione:** il telefono configurato è un pulsante `tel:`; se `null`, il
pulsante non viene renderizzato.
**Conseguenze:** numero pubblico e soggetto a scraping; rimovibile in ogni
momento.

### ADR-017 — Engineered Minimalism, dark-first, accento Emerald

**Stato:** Accettata (rivista il 30/10/2026)
**Contesto:** il progetto non deve sembrare "un altro template di portfolio".
**Decisione:** direzione Engineered Minimalism (Linear/Vercel/Raycast), tema
scuro di default, **un solo accento** (Emerald; stelle neutre, colori dei
linguaggi solo nella language bar), **Geist + Geist Mono** (due famiglie),
Bento Grid + Git Graph a lane + spotlight come elementi firma, nessuna
animazione di comparsa allo scroll.
**Conseguenze:** palette ridotta; ogni nuovo elemento deve giustificare la
propria presenza.
**Alternative:** Inter + Outfit + JetBrains Mono (scartato: tre famiglie, tono
meno "engineered"), indigo enterprise, portfolio editoriale chiaro.

### ADR-018 — Stato UI senza store globale

**Stato:** Accettata (30/10/2026) — sostituisce ADR-006
**Contesto:** i filtri devono essere condivisibili via URL; le preferenze sono
poche.
**Decisione:** filtri nella query string (`useRoute` + `router.replace`),
preferenza di vista con `useStorage`, stato locale nei componenti. Nessun Pinia.
**Conseguenze:** una sola fonte di verità per ogni stato; una dipendenza in
meno.
**Alternative:** Pinia (scartato: duplicherebbe lo stato dell'URL).

### ADR-019 — Deploy con un comando tramite `gh-pages`

**Stato:** Accettata (30/10/2026) — sostituisce ADR-009
**Contesto:** chi clona deve poter ripubblicare cambiando solo i JSON.
**Decisione:** `pnpm run deploy` risolve owner, repository e base URL (project
site, user site, dominio custom), esegue `nuxt generate` e pubblica
`.output/public` sul branch `gh-pages` con la libreria `gh-pages` (`.nojekyll`,
`CNAME`). La stessa GitHub Action lo esegue a ogni push su `main`.
**Conseguenze:** un solo modo di pubblicare, in locale e in CI; Pages va
impostato una volta su "Deploy from a branch"; la storia di `gh-pages` serve al
rollback.
**Alternative:** `actions/deploy-pages` (scartato: funziona solo in Actions).

### ADR-020 — Featured = pinned del profilo GitHub

**Stato:** Superata da ADR-028 (30/10/2026)
**Contesto:** la gerarchia dei progetti deve seguire l'identità GitHub senza
configurazione.
**Decisione originale:** featured = pinned nell'ordine del profilo; fallback per
stelle; il primo è il Top Repo; nessuna lista manuale.
**Motivo della revisione:** senza token GraphQL non è possibile leggere i
pinned; la modalità pubblica usa le stelle come unica gerarchia.
**Alternative:** lista `featured` in config (scartata).

### ADR-021 — GraphQL come fonte primaria

**Stato:** Superata da ADR-028 (30/10/2026)
**Contesto:** con REST servivano circa 2N+3 chiamate; pinned e colori dei
linguaggi non erano disponibili.
**Decisione originale:** una query GraphQL paginata per repository, linguaggi
con colori, topics, ultimo commit, ultima release, pinned, alberi dei file e
manifest; REST solo per `/readme`.
**Motivo della revisione:** GraphQL richiede sempre un token, anche per dati
pubblici. L'owner ha scelto di funzionare senza token con REST pubblico.
**Alternative:** solo REST (ora scelta), GraphQL con token.

### ADR-022 — Discovery automatica delle preview

**Stato:** Accettata (rivista il 30/10/2026 per REST pubblico)
**Contesto:** il path fisso `previewImagePath` obbligava a mettere un'immagine in
un posto preciso di ogni repository.
**Decisione:** discovery in ordine: `.repo-story.json` → file per convenzione in
`.github/`, root, `docs/` (più il path legacy) per i repository featured → prima
immagine non badge del README → placeholder. La social image custom non è
disponibile via REST pubblico. Il manifest `.repo-story.json` è **opzionale**: il
motore deve adattarsi senza.
**Conseguenze:** zero configurazione nel caso comune; un'euristica può
sbagliare, e il manifest esiste per quei casi. La convenzione si applica solo ai
featured per contenere le richieste raw.
**Alternative:** path fisso (scartato), screenshot automatici (fuori scope).

### ADR-023 — Dati owner solo in `data/`, una sola build

**Stato:** Accettata (30/10/2026)
**Contesto:** chi clona non deve cercare cosa modificare.
**Decisione:** tutti i file dell'owner stanno in `data/` (solo JSON); il
racconto personale si legge dal JSON e non dal profilo GitHub; sync dei dati e
rendering restano nella stessa build Nuxt.
**Conseguenze:** confine netto tra motore e dati; aggiornare il motore non
tocca `data/`.
**Alternative:** script di sync separato dal sito (scartato: un passaggio in
più), identità letta dal profilo GitHub (scartato: il JSON è la fonte), motore
come Nuxt Layer su npm (rimandato).

### ADR-024 — GitHub Story con lane ed eventi automatici

**Stato:** Accettata (30/10/2026)
**Contesto:** una linea verticale con pallini è la timeline generica che il
progetto sostituisce; la story non deve richiedere manutenzione per ogni nuovo
progetto.
**Decisione:** grafo a lane (esperienze sovrapposte come branch, massimo 3),
calcolato in build e disegnato in SVG; eventi automatici dai repository
featured (per stelle), con il curato che vince sull'automatico.
**Conseguenze:** la story cresce da sola con i featured; il testo degli eventi
automatici non è tradotto. Le release non sono disponibili in REST pubblico.
**Alternative:** solo eventi curati, timeline lineare.

### ADR-025 — CV ed export dagli stessi dati

**Stato:** Accettata (30/10/2026)
**Contesto:** un PDF del CV mantenuto a parte diverge dal sito.
**Decisione:** pagina `/cv` stampabile (PDF tramite la stampa del browser) e
`/resume.json` in formato JSON Resume, generati dai JSON in `data/` e dai
repository featured. `links.cvUrl` resta opzionale.
**Conseguenze:** nessun PDF da aggiornare a mano; nessuna generazione di PDF in
build.
**Alternative:** PDF generato con Playwright in build (scartato), solo link
esterno.

### ADR-026 — Gate di performance deterministici

**Stato:** Accettata (30/10/2026)
**Contesto:** i punteggi Lighthouse su runner condivisi variano tra un run e
l'altro e rendono la CI instabile.
**Decisione:** i budget in byte (JS, CSS, font, payload) bloccano la PR;
Lighthouse CI produce un report non bloccante.
**Conseguenze:** CI stabile; le metriche di esperienza restano visibili.
**Alternative:** Lighthouse bloccante.

### ADR-027 — Date assolute in SSR, relative dopo il mount

**Stato:** Accettata (30/10/2026)
**Contesto:** una data relativa scritta nell'HTML statico è sbagliata pochi
giorni dopo il deploy e causa hydration mismatch.
**Decisione:** l'HTML contiene la data assoluta (`YYYY.MM.DD`, UTC); dopo il
mount `useRelativeTime` mostra il relativo con `Intl.RelativeTimeFormat`.
Nessuna libreria di date.
**Conseguenze:** nessun mismatch, una dipendenza in meno.
**Alternative:** `date-fns` (scartato).

### ADR-028 — REST pubblico senza token

**Stato:** Accettata (30/10/2026) — sostituisce ADR-020 e ADR-021
**Contesto:** GraphQL richiede sempre un token, anche per repository pubblici;
l'owner vuole che il portfolio funzioni senza configurare credenziali. La lista
REST pubblica restituisce metadati, topics, licenza, linguaggio principale,
stelle e date con 1–3 richieste.
**Decisione:** usare `GET /users/{username}/repos` senza token; un token in sola
lettura è opzionale e serve solo ad alzare il rate limit. Featured = repository
con più stelle. Pinned, release, ultimo commit e breakdown per byte non sono
disponibili e restano fuori scope finché non si aggiunge una fonte autenticata.
Le preview usano manifest, convenzione per i featured e prima immagine del
README; altrimenti placeholder.
**Conseguenze:** zero credenziali obbligatorie, build semplice e portabile;
i dati sono meno ricchi di GraphQL e il limite non autenticato è 60 richieste/ora
(la pipeline usa 1–3 richieste API per la lista).
**Alternative:** GraphQL con token (scartato dall'owner), REST autenticato
(possible evoluzione).

### ADR-029 — Dataset alternativi selezionabili (`PORTFOLIO_DATA_DIR`)

**Stato:** Proposta (01/11/2026) — da confermare dal maintainer
**Contesto:** il repository è insieme il motore/template per chi clona e il
portfolio reale dell'owner. `data/` deve restare un template generico, ma
l'owner vuole pubblicare i propri dati senza un fork.
**Decisione:** `data/` resta il payload di default. Payload alternativi con la
stessa forma stanno in `datasets/{nome}/` e si selezionano con
`PORTFOLIO_DATA_DIR` (`.env`, variabile di repository in Actions) o con
`pnpm run deploy -- --data <dir>`. Gli schemi restano in `data/schema/`. I test
validano tutte le cartelle. Lo snapshot GitHub è legato allo username.
**Conseguenze:** nessun codice da toccare per cambiare dataset; ADR-023 resta
valido (i dati owner sono solo JSON, fuori dal codice). La CI di qualità usa
sempre `data/`; il deploy usa la variabile di repository.
**Alternative:** sostituire `data/` con i dati reali (scartato: si perde il
template), branch separato per i dati (scartato: due storie da mantenere).

## Decisioni chiuse

| # | Domanda | Decisione | Data |
| --- | --- | --- | --- |
| Q1 | Feature pilastro | F1–F3, F5–F6 + F0/F7/F8 Must; F9 CV & Export Should; F4 carousel rimosso | 2026-10-30 |
| Q2 | Dati GitHub a build time o runtime? | Build su push + dispatch manuale o deploy locale | 2026-10-30 |
| Q3 | Dettaglio progetto | Pagina dedicata `/projects/[slug]` | 2026-10-30 |
| Q4 | Hosting | GitHub Pages, branch `gh-pages` pubblicato con `gh-pages` | 2026-10-30 |
| Q5 | Contatto | Nessun form; pulsanti `mailto:` e `tel:` + social/CV | 2026-10-30 |
| Q6 | Lingua default | Inglese; altre lingue dal registry in `data/site.json`; nessun rilevamento | 2026-10-30 |
| Q7 | Palette e direzione | Engineered Minimalism, dark-first, Emerald, Geist + Geist Mono | 2026-10-30 |
| Q9 | Legacy | Rimosso completamente; storia preservata in git | 2026-10-30 |
| Q10 | Package manager | pnpm | 2026-10-30 |
| Q11 | Rebuild programmato? | No: il refresh segue i push e il deploy manuale | 2026-10-30 |
| Q12 | Identità dal profilo GitHub? | No: il racconto personale si legge dal JSON | 2026-10-30 |
| Q13 | Separare motore e sito? | No: una sola build; dati owner in `data/` | 2026-10-30 |
| Q14 | GraphQL? | No: REST pubblico senza token (ADR-028) | 2026-10-30 |
| Q15 | Scaricare le immagini in build? | No: restano remote | 2026-10-30 |
| Q16 | Contribution heatmap? | No: sarebbe ferma tra un deploy e l'altro | 2026-10-30 |
| Q17 | OG image per progetto? | No: nessuna generazione di immagini in build | 2026-10-30 |
| Q18 | Featured | Stelle (REST pubblico); pinned/release richiedono GraphQL | 2026-10-30 |

## Domande aperte

| # | Domanda | Opzioni | Raccomandazione | Impatto |
| --- | --- | --- | --- | --- |
| Q8 | Analytics | nessuno / Plausible / Umami | Nessuno nell'MVP | Privacy |

## Revisione di coerenza con la visione (30/10/2026)

Criteri: **manutenzione zero**, **identità GitHub**, **prestazioni**,
**distintività**, **facile da rideployare**. Una feature che non migliora almeno
due criteri non entra.

| Elemento | Verdetto | Motivo |
| --- | --- | --- |
| Sync REST (repo, stelle, linguaggio principale, activity) | **Core** | È la regola d'oro |
| Featured per stelle | **Core** | Zero configurazione, niente token |
| Discovery delle preview | **Core** | Nessuna immagine da mettere in un path fisso |
| Bento Grid | **Core** | Identità in pochi secondi; elemento firma |
| Git Graph a lane + eventi automatici | **Core** | Differenziatore; cresce da solo |
| Explore con tab e search | **Core** | Scoperta senza backend |
| Detail + README | **Core** | SEO e profondità |
| Contatti `mailto`/`tel` | **Core** | Conversione senza backend |
| Deploy con un comando | **Core** | "Facile da rideployare" |
| i18n dal registry | **Core** | Requisito esplicito; nessun codice da toccare |
| CV & Export | **Should** | Elimina il drift del PDF; il sito diventa esportabile |
| Featured carousel | **Rimosso** | Ridondante con Top Repo e featured |
| Heatmap contributi | **Rimossa** | Statica tra i deploy |
| OG per progetto, immagini ottimizzate in build | **Rimosse** | Nessuna generazione di immagini in build |
| Pinia, date-fns, Embla | **Rimosse** | Dipendenze senza bisogno reale |
| Reveal on scroll, rilevamento lingua, uptime monitor | **Rimossi** | Template-ish, flash lato client, rumore |
| Analytics | **Rimandare** | Opzionale e privacy-first |
| Blog, commenti, testimonianze | **Fuori** | Trasformano il prodotto in un altro template |
| Temi/white-label | **Fuori** | Contraddicono "non è un template" |

### Cosa non costruire

- Blog, commenti, newsletter, testimonianze.
- Login, area riservata, repository privati.
- CMS visuale o editor nel browser.
- Marketplace di temi o white-label.
- Chatbot o AI generativa nel sito.

Queste cose possono essere progetti separati, non parti di questo motore.

## Rischi e mitigazioni

| Rischio | Probabilità | Impatto | Mitigazione |
| --- | --- | --- | --- |
| Rate limit REST raggiunto | Media | Dati non aggiornati | Snapshot < 7 giorni, `GITHUB_OFFLINE`, token opzionale |
| GitHub API down | Bassa | Build rossa | REST pubblico, snapshot, retry, deploy locale |
| Cambio schema API | Bassa | Build rossa | zod, fixture, messaggi precisi |
| XSS da README | Bassa | Alto | Sanitizzazione allowlist, test |
| Discovery preview sbagliata | Media | Basso | Ordine di sorgenti documentato, log `previewSource`, `.repo-story.json` |
| Pages non impostato su `gh-pages` | Media | Alto (sito non visibile) | Guida al primo deploy, runbook, smoke test |
| `.nojekyll` mancante | Bassa | Alto (asset 404) | Opzione della libreria, test sull'output |
| Base URL errato | Bassa | Alto | Calcolo automatico testato, smoke test |
| Dati fermi tra un deploy e l'altro | Alta | Basso | Accettato (ADR-002); "Last synced" visibile |
| Snapshot non disponibile in CI | Media | Medio | Retry con `workflow_dispatch`; deploy locale |
| Divergenza tra lingue | Media | Medio | Schema + test di parità + registry |
| Sembrare un template generico | Media | Alto | Elementi firma, un accento, Nuxt UI riallineato, design review |
| Activity percepita come "real-time" | Media | Basso | Etichetta "Last synced" e data della build |
| Preview remote pesanti | Media | Medio | Non sono LCP, `loading="lazy"`, dimensioni riservate |
| Scope creep | Alta | Medio | MoSCoW, MVP prima |
| Hydration mismatch | Media | Medio | Date assolute in SSR, placeholder deterministici, storage letto dopo il mount |
| Dipendenze che cambiano | Media | Basso/Medio | Poche dipendenze, lockfile, Renovate |
| Aggiornare il motore rompe i JSON dei cloni | Media | Medio | Schema version + migrazioni (backlog P1) |

## Stato dell'implementazione (01/11/2026)

M1–M5 sono implementati; M6 è implementato per tutto ciò che si verifica in
locale. Verificato in locale (Windows, Node 24): lint, typecheck, 77 test
unitari, `pnpm generate` offline, budget in byte, 44 test E2E Playwright + axe
(tema chiaro e scuro, 320 px, motion ridotto) sia con `data/` sia con
`datasets/elpiu/`.

Restano da fare, perché richiedono push o accesso al repository remoto:

- [ ] CI verde su una PR reale (`ci.yml` con E2E e Lighthouse).
- [ ] Primo `pnpm run deploy` e Pages impostato su `gh-pages`.
- [ ] Smoke test di `deploy.yml` verde all'URL pubblico.
- [ ] Rollback provato sul branch `gh-pages`.
- [ ] Variabile di repository `PORTFOLIO_DATA_DIR` se il sito pubblico deve
      usare un dataset diverso da `data/` (ADR-029).
- [ ] Report Lighthouse letto (≥ 95 / a11y 100).

Correzioni emerse in M6: contrasto di `foreground-subtle` (scuro) e
dell'accento (chiaro) portato ad AA, primary di Nuxt UI riallineato ai token,
filtri da query string applicati dopo l'idratazione, overflow a 320 px,
icone delle competenze spostate dal bundle JS al payload, nessun fallback
all'API Iconify a runtime.

## Prossimo passo

Dopo la revisione dell'owner: commit per intenzione su `feat/m1-scaffold`, PR
verso `main`, CI verde, primo deploy (`pnpm run deploy`) e checklist di cutover
in [07](07-infrastruttura-deploy.md#checklist-di-cutover).
