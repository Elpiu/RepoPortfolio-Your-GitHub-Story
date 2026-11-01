# 02 — Feature

## Come è stata fatta la selezione

Le feature sono state scelte in base a tre criteri:

1. **Raccontano il portfolio** senza dipendere da un backend.
2. **Sfruttano il vantaggio unico del progetto**: i dati GitHub come fonte di
   verità per i progetti, un JSON come fonte di verità per il racconto.
3. **Sono verificabili**: ogni feature ha criteri di accettazione che si possono
   trasformare in test.

La proposta è di **6 feature pilastro di prodotto** più **3 capacità
abilitanti** (fondamenta, preferenze, delivery statica). Le altre idee sono nel
backlog e non entrano nell'MVP.

## Scope MVP approvato (revisione del 30/10/2026)

| Feature | Priorità | Nota |
| --- | --- | --- |
| F1 Project Engine | Must | REST pubblico, featured per stelle, discovery delle preview, linguaggi, attività |
| F2 Explore All Repositories | Must | Tab + ricerca + linguaggio + sort; filtro topic rinviato |
| F3 Project Detail | Must | Pagina dedicata con README |
| F5 GitHub Identity & Story | Must | Bento Grid + Git Graph a lane + eventi automatici |
| F6 Contact | Must | Quick actions `mailto:` + `tel:` + link CV, nessun form |
| F9 CV & Export | Should | `/cv` stampabile e `/resume.json` dagli stessi dati |
| F0/F7/F8 | Must | Fondamenta, preferenze, delivery con un comando |

**Rimossa nella revisione:** F4 Featured Carousel (il Top Repo e i featured
coprono già la gerarchia; Embla esce dallo stack). L'ID `F4` non viene
riutilizzato.

Se servirà ridurre ancora, l'ordine di taglio è: `/resume.json` → eventi
automatici della story → activity card.

## Mappa delle dipendenze

```text
F0 Fondamenta (Engineered Minimalism, shell, data/, validazione)
   |
   +--> F1 Project Engine (REST pubblico)
   |       |
   |       +--> F2 Explore All Repositories --> F3 Project Detail
   |       |
   |       +--> F5 GitHub Identity & Story (Bento + Git Graph)
   |                |
   |                +--> F6 Contact (quick actions nel profilo)
   |                |
   |                +--> F9 CV & Export (/cv, /resume.json)
   |
F7 Preferenze (tema, lingua, filtri)        -- attraversa tutte
F8 Delivery statica (SEO, budget, deploy)   -- attraversa tutte
```

---

## F0 — Fondamenta del sito (abilitante)

**Cosa:** shell dell'applicazione, layout, header con navigazione, footer,
design token, componenti base, cartella `data/` con schema e validazione,
pagina 404 ed errore.

**Perché è pilastro:** ogni altra feature dipende da una base coerente. Senza
questa, si costruiscono componenti duplicati e stringhe sparse.

**Scope MVP**

- Layout `default` con header sticky, main e footer.
- Navigazione a sezioni con stato attivo basato su IntersectionObserver. Il
  link porta la sezione subito sotto l'header (offset unico:
  `scroll-padding-top` = altezza dell'header) e funziona anche ricliccando la
  sezione già nell'URL. Filtri, tab e "carica altri" aggiornano la query string
  senza spostare la pagina.
- Ordine della home: Home (Bento) → About → Skills → Experience (GitHub Story)
  → Projects (Explore) → Contact (footer).
- Container e ritmo verticale delle sezioni.
- Token colore/tipografia (Geist Sans + Geist Mono)/spaziature in Tailwind 4,
  dark-first.
- Componenti base: `SectionHeading`, `AppButton` (wrapper Nuxt UI), `AppLink`,
  `EmptyState`, `ErrorState`.
- Cartella `data/` con i soli file JSON modificati dall'owner, JSON Schema per
  l'autocompletamento nell'editor e validazione zod all'avvio della build.
- Pagina 404 localizzata.
- Skip link e landmark semantici.

**Criteri di accettazione**

- [ ] Tutte le pagine condividono lo stesso layout e la stessa larghezza massima.
- [ ] La navigazione funziona da tastiera e indica la sezione attiva.
- [ ] Non esistono colori o font hardcoded nei componenti: solo token.
- [ ] La 404 è raggiungibile e localizzata in tutte le lingue supportate.
- [ ] Skip link visibile al focus e funzionante.
- [ ] Un JSON in `data/` non valido fa fallire `pnpm dev` e `pnpm generate` con
      file, percorso del campo e messaggio leggibile.
- [ ] Il sito si genera con un `data/site.json` minimo e un profilo nella
      lingua di default (esperienze, competenze e milestone vuote ammesse).

---

## F1 — Project Engine (GitHub come fonte di verità)

**Cosa:** pipeline di build che legge i repository pubblici da GitHub tramite
**REST pubblico**, li valida, li normalizza e li rende disponibili al sito senza
chiamate API dal browser. Il token è opzionale e serve solo ad alzare il rate
limit.

**Perché è pilastro:** è il cuore del prodotto. Senza questa pipeline il sito è
un portfolio statico qualunque.

**Scope MVP**

- `GET /users/{username}/repos` paginata (100 repository per pagina, limite
  configurabile, default 300) con metadati, topics, licenza, linguaggio
  principale, stelle, fork, size, branch di default e date.
- Esclusione di fork, archiviati, repository profilo (`{username}/{username}`),
  nomi in `excludedRepos`, repository con topic `portfolio-hidden` o con
  `"hidden": true` nel proprio `.repo-story.json`.
- **Featured = repository con più stelle** (a parità, il più aggiornato). I
  pinned del profilo richiedono GraphQL e non sono disponibili in modalità
  pubblica.
- **Discovery della preview:** `.repo-story.json` → file per convenzione
  (`preview`, `screenshot`, `cover`, `hero`, `banner`, `social-preview`) per i
  repository featured → prima immagine non badge del README → placeholder
  deterministico. Dettaglio in [05](05-dati-e-contenuti.md#preview-image).
- Normalizzazione in un modello stabile e tipizzato; validazione zod al confine
  con l'API.
- Language bar derivata dal **linguaggio principale** dei repository inclusi,
  con colori noti o fallback deterministico; percentuali normalizzate.
- Activity: repository con `pushedAt` più recente. Hash e messaggio dell'ultimo
  commit non sono disponibili nella lista REST pubblica.
- Snapshot dell'ultimo dato valido per i rebuild in caso di API irraggiungibile.
- Nessuna richiesta a `api.github.com` dal browser.

**Criteri di accettazione**

- [ ] Con un username valido, senza token, la build produce un dataset di
      repository normalizzati e validati.
- [ ] Un token opzionale in sola lettura alza il rate limit senza cambiare il
      modello dati.
- [ ] Fork, archiviati, repository profilo, `excludedRepos`, topic
      `portfolio-hidden` e `hidden: true` non compaiono.
- [ ] I featured sono ordinati per stelle; a parità vince il repository più
      aggiornato.
- [ ] Il branch di default viene letto dall'API, non assunto come `main`.
- [ ] Un payload API non conforme allo schema fa fallire la build con un
      messaggio che indica il repository e il campo.
- [ ] Con API GitHub non raggiungibile, la build usa lo snapshot precedente se
      presente; altrimenti fallisce in modo esplicito.
- [ ] Un repository featured con `.github/preview.png` ottiene quella preview
      senza configurazione; uno senza immagini ottiene il placeholder.
- [ ] Il placeholder è deterministico (`id % 8`), mai `Math.random()`.
- [ ] Le percentuali dei linguaggi sommano a 100 (o 0 se non ci sono dati) e
      sono calcolate solo dai repository inclusi.
- [ ] L'activity card mostra repo, branch e data coerenti con `pushedAt`; il
      commit è `null` in modalità pubblica.
- [ ] Il rate limit REST viene loggato e non esaurito dalla pipeline.

**Fuori scope**

- Repository privati.
- Pinned, release e ultimo commit (richiedono GraphQL o chiamate REST per repo).
- Webhook o aggiornamento in tempo reale.
- Contributi, issue, pull request.

**Decisioni collegate:** ADR-002, ADR-012, ADR-022, ADR-028.

---

## F2 — Explore All Repositories (griglia, tab, ricerca, ordinamento)

**Cosa:** la sezione "Explore All Repositories": una griglia filtrabile con tab
rapidi (Tutti, linguaggi principali, Open Source), ricerca testuale, ordinamento
e caricamento progressivo. Lo stato è condivisibile via URL.

**Perché è pilastro:** è il modo in cui il visitatore trova il progetto rilevante
per lui. Con molti repository, una lista non filtrata è inutile.

**Scope MVP**

- Card progetto: icona del linguaggio, nome repo, link esterno alla demo,
  descrizione breve, fino a 5 topics, stelle, fork, linguaggio, size, data di
  aggiornamento, preview image.
- Tab quick filter: `Tutti`, i 3 linguaggi più usati, `Open Source` (repository
  con licenza riconosciuta). I tab sono derivati dai dati, non hardcoded.
- Ricerca su nome, descrizione e topics (case-insensitive, debounce 200 ms).
- Filtro per linguaggio (valori derivati dai dati) sincronizzato con i tab.
- Ordinamento: rilevanza (stelle, poi aggiornamento), stelle, ultimo
  aggiornamento, nome.
- Contatore risultati e stato vuoto con azione "azzera filtri".
- Griglia a 2 colonne su desktop, 1 su mobile.
- "Carica altri" a blocchi di 12 (o "mostra tutti" se il dataset è piccolo).
- Stato in query string (`q`, `lang`, `tab`, `sort`, `page`) come **unica fonte
  di verità**: nessuno store globale.
- Il riordino è immediato e senza dipendenze di animazione, per rispettare il
  budget JS; con `prefers-reduced-motion` non cambia nulla.
- Rendering SSR della lista di default (senza filtri) per SEO e assenza di CLS.

**Criteri di accettazione**

- [ ] La pagina `/` contiene già in HTML la griglia di default.
- [ ] I tab filtrano senza ricaricare la pagina e sono navigabili da tastiera
      (pattern ARIA tabs).
- [ ] Digitando nella ricerca, i risultati si aggiornano senza ricaricare la
      pagina e senza chiamate di rete.
- [ ] Il filtro linguaggio si combina con la ricerca e il contatore riflette il
      risultato.
- [ ] Un URL con query string ripristina gli stessi filtri al caricamento.
- [ ] Il pulsante di reset riporta allo stato iniziale e pulisce la query.
- [ ] Con zero risultati compare uno stato vuoto accessibile, non una griglia
      vuota.
- [ ] Il riordino non causa salti di layout misurabili (CLS < 0,1).
- [ ] Con motion ridotto, le card non si animano.
- [ ] La card ha un link principale; l'eventuale link demo è un controllo
      separato, non annidato, con focus visibile.

**Fuori scope**

- Filtro per topic (Could: la ricerca copre già i topics).
- Ricerca full-text nel README (backlog).
- Ricerca server-side (non necessaria sotto i 300 repository).

**Decisioni collegate:** ADR-005, ADR-018.

---

## F3 — Project Detail (README come pagina)

**Cosa:** una pagina dedicata per ogni repository, generata staticamente, che
mostra metadati del progetto e il README renderizzato.

**Perché è pilastro:** la card racconta il "cosa"; il README racconta il "come" e
il "perché". È anche la pagina che dà valore SEO e link condivisibili.

**Scope MVP**

- Route localizzate `/projects/[slug]` e `/{locale}/projects/[slug]`,
  prerenderizzate per ogni repository incluso e per ogni lingua supportata.
- Metadati: nome, descrizione, breakdown dei linguaggi del repository, stelle,
  fork, date di creazione/aggiornamento/push, topics, link a GitHub e alla
  homepage se presente. Commit e release non sono disponibili in REST pubblico.
- README letto dal branch di default tramite `raw.githubusercontent.com` (varianti del nome file).
- Rendering markdown con GitHub Flavored Markdown, code highlighting e immagini.
- Risoluzione delle immagini e dei link relativi del README verso URL assoluti.
- Sanitizzazione dell'HTML: niente script, iframe o attributi pericolosi.
- Link esterni con `target="_blank"` e `rel="noopener noreferrer"`.
- Fallback se il README manca o supera il limite di dimensione.
- Breadcrumb/back link alla sezione Explore.
- `404` localizzata per slug inesistente.

**Criteri di accettazione**

- [ ] Ogni repository incluso ha una pagina HTML statica raggiungibile
      direttamente.
- [ ] Il README viene renderizzato con titoli, liste, tabelle, link e blocchi di
      codice.
- [ ] Le immagini relative del README puntano al raw corretto del branch di
      default.
- [ ] Un README con `<script>` o `onerror=` non esegue codice nel browser.
- [ ] Un README mancante produce uno stato "README non disponibile", non una
      pagina rotta.
- [ ] La pagina ha title, description, canonical e hreflang corretti.
- [ ] Il link "Apri su GitHub" porta al repository giusto.

**Fuori scope**

- Rendering di README da branch diversi dal default.
- Commenti o reazioni.
- Modale di dettaglio. Vedi ADR-004.

---

## F5 — GitHub Identity & Story (Bento Grid + Git Graph)

**Cosa:** il cuore narrativo del sito in due blocchi:

1. **Bento Grid** in cima: profilo, disponibilità, top repo, language bar e
   ultima attività GitHub.
2. **GitHub Story** al centro: un git graph con lane parallele, in cui
   esperienze, milestone e repository featured sono nodi/commit.

**Perché è pilastro:** è ciò che distingue RepoPortfolio da un template. Unisce
identità umana e identità GitHub in un'unica narrazione visiva.

**Scope MVP**

- Bento asimmetrica (4 riquadri):
  - **Profile (2 colonne):** avatar, nome, ruolo, anni di esperienza calcolati,
    bio breve, badge di disponibilità con pallino, quick actions (`mailto:`,
    `tel:`, copia email, GitHub, LinkedIn e CV (`/cv` o `links.cvUrl`).\n    Tutto letto da `data/profile/{locale}.json`
    e `data/site.json`.
  - **Top Repo:** il repository con più stelle, con preview, stelle, linguaggio
    e link al dettaglio.
  - **Tech Stack:** language bar orizzontale con colori noti/fallback,
    percentuali e legenda accessibile. Le chip delle competenze vivono nella
    sezione Skills.
  - **Activity:** ultimo push con repo, branch e data; etichetta "Last synced"
    con la data della build. Hash e messaggio non sono disponibili in REST
    pubblico.
- Bento responsive: 1 colonna mobile, 2 tablet, 4 desktop con riquadri che
  occupano 2 colonne.
- GitHub Story:
  - **Lane parallele**: le esperienze che si sovrappongono nel tempo (studio
    mentre lavori, due ruoli) diventano branch paralleli che si staccano e
    fanno merge; massimo 3 lane, calcolate dalle date.
  - Eventi curati nel JSON (lavoro, studio, milestone) più **eventi
    automatici**: ogni repository featured (per stelle) diventa un nodo `repo`
    alla data di creazione. Le release non sono disponibili via REST pubblico.
    Un evento curato che cita lo stesso repository vince su quello automatico.
  - Ogni nodo è una card espandibile con descrizione, badge tecnologie, link
    demo/repo.
  - Icone/nodi distinti per tipo (work, education, release, repo, milestone).
  - **Viste per tipo, una alla volta** (Lavoro, Formazione, Progetti,
    Traguardi, Tutto) al posto della legenda: tab ARIA con le stesse icone dei
    nodi e il conteggio; i tipi senza nodi non compaiono. **Default: Lavoro**
    (se non ci sono esperienze di lavoro, Tutto). La scelta è singola: la
    selezione cumulativa si è rivelata confusa in revisione (01/11/2026). Le
    lane si ricalcolano sui soli tipi visibili. Stato in query string
    (`?story=education`, il default non viene scritto); senza JavaScript si
    vede la storia del lavoro.
  - Grafo SVG calcolato in build, nessun JS necessario per disegnarlo.
- Anni di esperienza calcolati da `career.start`, mai hardcoded.

**Criteri di accettazione**

- [ ] La Bento contiene profilo, top repo, language bar e activity, con
      gerarchia visiva chiara.
- [ ] Il Top Repo è il repository con più stelle.
- [ ] Il badge di disponibilità è testo + indicatore, non solo un pallino
      animato; con reduced motion il pulse è disattivato.
- [ ] La language bar ha percentuali verificabili e una legenda accessibile
      (non solo colore).
- [ ] L'activity card mostra un dato reale del dataset e la data dell'ultima
      sincronizzazione.
- [ ] Due esperienze sovrapposte sono disegnate su lane diverse; mai più di 3
      lane.
- [ ] I featured compaiono come nodi automatici senza modificare il JSON; un
      milestone curato sullo stesso repository sostituisce il nodo automatico.
- [ ] La GitHub Story è leggibile a 320 px senza scroll orizzontale.
- [ ] Ogni nodo ha data semantica (`time`) e stato espanso/collassato
      accessibile.
- [ ] Il grafo è decorativo (`aria-hidden`) e non è l'unico modo per capire
      l'ordine.
- [ ] Le lingue supportate mostrano la stessa struttura e tutte le voci curate
      tradotte.

**Fuori scope**

- Grafo interattivo con zoom/pan.
- Heatmap dei contributi (scartata: generata solo in build, resterebbe ferma
  tra un deploy e l'altro).
- Contributi/issue/PR nel grafo.

**Decisioni collegate:** ADR-020, ADR-024, ADR-028.

---

## F6 — Contact (quick actions nel profilo)

**Cosa:** il punto di contatto vive nel riquadro Profile della Bento Grid e nel
footer: pulsanti rapidi `mailto:` e `tel:`, link social e CV. Nessun form,
nessun backend.

**Perché è pilastro:** senza una conversione il portfolio è solo una vetrina.
Nella direzione "Engineered Minimalism" il contatto è un'azione, non una
sezione separata.

**Scope MVP**

- Pulsante `mailto:` con l'email configurata.
- Pulsante `tel:` con il numero configurato.
- Copia email negli appunti con feedback accessibile (`aria-live`), tramite
  Clipboard API nativa, con messaggio `aria-live`.
- Link a LinkedIn, GitHub (derivato dallo username) e CV: per default la pagina
  `/cv` (F9); se `links.cvUrl` è valorizzato, il link punta a quel file.
- Email e telefono visibili direttamente.
- Microcopy in tutte le lingue supportate.

**Criteri di accettazione**

- [ ] Le quick actions sono nel riquadro Profile, non in una sezione separata.
- [ ] Il pulsante email apre il client mail con l'indirizzo corretto.
- [ ] Il pulsante telefono apre il dialer con il numero corretto.
- [ ] L'eventuale copia email è annunciata dagli screen reader.
- [ ] Tutti i link esterni si aprono in nuova scheda con `rel` sicuro.
- [ ] Se il telefono non è configurato, il pulsante non viene renderizzato.
- [ ] La Bento funziona senza JavaScript (mailto, tel e link visibili).
- [ ] Non esiste alcun form o invio lato server.

**Fuori scope**

- Form di contatto con invio email.
- Chat o calendario di prenotazione.

---

## F7 — Preferenze: tema, lingua, stato dei filtri (abilitante)

**Cosa:** tema chiaro/scuro, **inglese come lingua default**, lingue supportate
configurabili da `data/site.json`, persistenza delle preferenze.

**Perché è pilastro:** attraversa ogni pagina. Se improvvisata dopo, produce
flash, stringhe duplicate e hydration mismatch.

**Scope MVP**

- Tema: `dark` / `light` / `system`, default **dark** (scelta di design, non
  dipende da `prefers-color-scheme`); persistito in localStorage, senza flash al
  primo paint. `system` segue il sistema operativo solo se scelto.
- Registry `locales` in `data/site.json`; ogni voce ha codice, `language`, nome
  e flag `default`.
- Contenuti editoriali in `data/profile/{code}.json`; stringhe UI fornite dal
  motore in `i18n/locales/{code}.json`, con fallback all'inglese se una lingua
  non ha ancora le stringhe UI.
- **Nessun rilevamento automatico della lingua**: su un sito statico avverrebbe
  lato client (flash + redirect). La lingua è nell'URL; lo switcher porta alla
  pagina equivalente.
- Una sola lingua è un caso valido: nessun prefisso e nessuno switcher.
- Rotte localizzate con `prefix_except_default` (`/` = EN, `/it/...` = IT).
- `<html lang>`, canonical e `hreflang` per **tutte** le lingue supportate,
  `x-default` sulla lingua di default.
- Filtri in query string; preferenza di vista in localStorage.
- Tutte le stringhe UI in file di traduzione; nessun testo hardcoded nei
  componenti.
- Rispetto di `prefers-reduced-motion`.

**Criteri di accettazione**

- [ ] Un visitatore su `/` vede la lingua di default, senza redirect.
- [ ] Il cambio lingua mantiene la pagina equivalente, non riporta alla home.
- [ ] Lo switcher elenca solo le lingue in `data/site.json` e sparisce se ce n'è
      una sola.
- [ ] Aggiungere una lingua richiede solo una voce in `data/site.json` e un file
      `data/profile/{code}.json`; nessuna modifica al codice.
- [ ] Una lingua supportata con contenuti obbligatori mancanti fa fallire la
      build.
- [ ] Il tema scuro è il default e non produce flash al reload.
- [ ] Non esistono stringhe UI hardcoded nei componenti.
- [ ] Ogni pagina ha `lang`, `canonical` e `hreflang` corretti.
- [ ] Nessun cookie viene scritto.

**Decisioni collegate:** ADR-010, ADR-018.

---

## F8 — Delivery statica: SEO, performance, deploy con un comando (abilitante)

**Cosa:** il sito è generato staticamente e pubblicato sul branch `gh-pages` con
**un solo comando** (`pnpm run deploy`, libreria `gh-pages`), identico in locale
e nella GitHub Action che gira a ogni push su `main`.

**Perché è pilastro:** è il modello di distribuzione e la promessa "facile da
rideployare": chi clona modifica i JSON in `data/` e lancia un comando.

**Scope MVP**

- `pnpm run deploy`: risolve owner, repository e base URL (project site, user
  site `{owner}.github.io` o dominio custom), esegue `nuxt generate` e pubblica
  `.output/public` su `gh-pages` con `.nojekyll` e `CNAME` se serve.
- Workflow `deploy.yml` su push su `main` e dispatch manuale che esegue lo
  stesso comando.
- Sitemap, `robots.txt`, pagina 404, canonical, hreflang, Open Graph e JSON-LD.
- Nessuna richiesta runtime a font, icone o API esterne.
- Budget deterministici (byte di JS, CSS, payload) come gate; Lighthouse CI
  come report informativo.
- Rollback documentato.

**Criteri di accettazione**

- [ ] Da un clone pulito: modificare `data/`, `pnpm install`,
      `pnpm run deploy` pubblica il sito; l'unico passaggio manuale è
      impostare una volta Pages sul branch `gh-pages`.
- [ ] Il base URL è corretto per project site, user site e dominio custom senza
      variabili d'ambiente manuali.
- [ ] L'output contiene `.nojekyll` (le cartelle `_nuxt/` vengono servite).
- [ ] Tutte le rotte generate restituiscono 200 e la 404 restituisce 404.
- [ ] `sitemap.xml` elenca home, dettagli e `/cv` in tutte le lingue.
- [ ] Il browser non carica font da Google Fonts né icone da API esterne.
- [ ] Una PR che supera i budget in byte viene bloccata.
- [ ] Un push su `main` aggiorna stelle, date e README con una nuova build.

**Decisioni collegate:** ADR-002, ADR-019, ADR-026.

---

## F9 — CV & Export (Should)

**Cosa:** il sito si può "esportare": una pagina `/cv` pensata per la stampa e
un `/resume.json` in formato JSON Resume, entrambi generati dagli stessi dati
del portfolio.

**Perché:** un PDF del CV mantenuto a parte duplica esperienze e competenze e
diverge dal sito. Generarlo dagli stessi JSON elimina il drift.

**Scope**

- Rotte `/cv` e `/{locale}/cv` prerenderizzate: nome, ruolo, contatti, about,
  esperienze, competenze, progetti featured.
- Stylesheet `@media print` per A4: colori chiari forzati, niente navigazione,
  interruzioni di pagina controllate, URL dei link visibili.
- Pulsante "Download PDF" che apre la stampa del browser (`window.print()`):
  nessuna generazione di PDF in build.
- `/resume.json` (lingua di default) e `/{locale}/resume.json` per le altre
  lingue, conformi allo schema JSON Resume, generati in build.
- Se `links.cvUrl` è valorizzato, il CV esterno resta raggiungibile dal profilo
  e `/cv` continua a esistere.

**Criteri di accettazione**

- [ ] `/cv` mostra gli stessi dati della home, senza campi duplicati in `data/`.
- [ ] In anteprima di stampa il CV sta in pagine A4 leggibili, senza header,
      footer o pulsanti.
- [ ] `/resume.json` è valido rispetto allo schema JSON Resume.
- [ ] La pagina è accessibile e localizzata come le altre.

**Decisioni collegate:** ADR-025.

---

## Prioritizzazione

### MoSCoW

| Feature | Must | Should | Could | Won't (MVP) |
| --- | :---: | :---: | :---: | :---: |
| F0 Fondamenta | ✓ | | | |
| F1 Project Engine | ✓ | | | |
| F2 Explore All Repositories | ✓ | | | |
| F3 Project Detail | ✓ | | | |
| F5 GitHub Identity & Story | ✓ | | | |
| F6 Contact | ✓ | | | |
| F7 Preferenze | ✓ | | | |
| F8 Delivery statica | ✓ | | | |
| F9 CV & Export | | ✓ | | |
| Filtro per topic | | | ✓ | |
| Command palette | | | ✓ | |
| Auto-rebuild cross-repo | | | ✓ | |
| Analytics privacy-friendly | | | ✓ | |
| Featured carousel | | | | ✓ |
| Contribution heatmap | | | | ✓ |
| OG image per progetto | | | | ✓ |
| Blog / note | | | | ✓ |
| PWA / offline | | | | ✓ |
| Supporto repo privati | | | | ✓ |

### Milestone

| Milestone | Feature incluse | Risultato |
| --- | --- | --- |
| M1 — Scheletro | F0, F7 (base), F8 (deploy con un comando) | Shell dark-first, multilingua, già pubblicabile |
| M2 — Engine & Explore | F1, F2 | Repository reali via REST pubblico e griglia filtrabile |
| M3 — Dettaglio | F3 | README come pagina |
| M4 — Identità & Story | F5, F6 | Bento Grid, Git Graph a lane, quick actions |
| M5 — CV & Export | F9 | `/cv` stampabile e `/resume.json` |
| M6 — Qualità e cutover | SEO, a11y, budget, E2E | Produzione |

---

## Backlog delle feature secondarie

Queste feature non entrano nell'MVP ma l'architettura deve poterle accogliere.

### Racconto e dati GitHub

- **Repo health badges:** ultimo commit, licenza, open issues.
- **Statistiche estese:** stelle totali, fork, anni di attività.
- **Progetti correlati** per linguaggio/topic.

### Scoperta e navigazione

- **Command palette** (`Ctrl+K`) per sezioni, progetti e link.
- **Filtro per topic** (la ricerca testuale copre già i topics).
- **Ricerca full-text nel README** (indice generato in build).
- **Vista tabella/lista** alternativa alla griglia.

### Piattaforma

- **Auto-rebuild cross-repo:** `repository_dispatch` da altri repository per
  rigenerare il portfolio. Opzionale: il modello resta "deploy su push".
- **Schema version + migrazioni dei JSON in `data/`:** aggiornamenti del motore
  senza rompere i dati di chi ha clonato.
- Analytics privacy-friendly (Plausible/Umami) senza cookie.
- View Transitions API.
- RTL readiness con proprietà logiche CSS.

### Scartate (revisione del 30/10/2026)

| Idea | Motivo |
| --- | --- |
| Featured carousel (ex F4) | Ridondante con Top Repo e featured; JS e rumore in più |
| Contribution heatmap | Calcolata solo in build: resterebbe ferma tra un deploy e l'altro |
| OG image per progetto | Nessuna generazione di immagini in build |
| Download e ottimizzazione delle immagini in build | Le preview restano remote (ADR-013) |
| Identità letta dal profilo GitHub | Il racconto personale vive nel JSON (ADR-023) |
| Rebuild programmato | Il deploy segue i push (ADR-002) |
| Separare motore e sito in due step | Una sola build Nuxt; i dati owner stanno in `data/` (ADR-023) |
| Rilevamento automatico della lingua | Redirect lato client su sito statico |
| Reveal on scroll | Effetto da template, nasconde contenuto prima dell'idratazione |
| Form contatto, blog, commenti, testimonianze | Fuori dalla visione |
