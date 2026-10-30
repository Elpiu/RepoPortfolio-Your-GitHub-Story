# 06 — Design system e UX

> **Direzione approvata:** Engineered Minimalism, dark-first, accento Emerald.
> I token semantici e i principi di accessibilità sono vincolanti; i valori
> esatti vanno rifiniti in design review.

## Direzione: Engineered Minimalism

Il riferimento è il linguaggio di prodotto di **Linear, Vercel e Raycast**:
interfacce pulite, scure, costruite su griglie rigorose, con pochi elementi
firma e un'attenzione quasi ossessiva ai dettagli. Non è "minimalismo" come
assenza di carattere: è **riduzione intenzionale** al servizio dell'identità
GitHub.

Regole:

1. **Un solo accento.** Emerald richiama i commit GitHub e comunica "sistema
   online". Niente seconda palette decorativa: le stelle sono neutre
   (`foreground-muted`), non ambra. I colori dei linguaggi GitHub sono **dati**,
   non decorazione, e compaiono solo nella language bar.
2. **Dark-first, non dark-only.** Il tema scuro è il default di design; il
   chiaro è supportato e verificato con gli stessi token.
3. **Griglia visibile.** Bento asimmetrica, bordi sottili, allineamenti
   rigorosi. Le card non sono contenitori generici: hanno una gerarchia.
4. **Tocchi Git.** Monospazio per metadati, nodi a commit, language bar,
   `git:` hash, date `YYYY.MM.DD`. Il codice è parte dell'estetica, non un
   costume.
5. **Effetti subordinati al contenuto.** Spotlight, glass e pulse sono
   impercettibili finché non servono; non devono competere con i progetti.

### Elementi firma

| Elemento | Ruolo |
| --- | --- |
| **Bento Grid** | Profilo, top repo, language bar, activity: identità a colpo d'occhio |
| **Git Graph** | La GitHub Story come grafo a lane parallele (branch e merge), non come lista di pallini |
| **Spotlight hover** | Alone radiale che segue il puntatore sulle card |
| **Status dot** | Disponibilità con pulse discreto + testo, non solo colore |
| **Mono metadata** | Versioni, date, hash, path: il sito sembra uno strumento |

## Principi di design

1. **Il contenuto è l'interfaccia.** Niente decorazioni che competono con i
   progetti e il testo.
2. **Gerarchia prima della densità.** La Bento deve dire "chi" e "cosa" in
   pochi secondi; il resto è approfondimento.
3. **Editoriale, non "dashboard".** Anche con card e dati, il tono resta umano:
   tipografia curata, respiro, niente widget inutili.
4. **Scuro e chiaro equivalenti.** Non un tema principale e uno di ripiego.
5. **Movimento con uno scopo.** Pulse per lo stato, spotlight per l'hover,
   auto-animate per il riordino. Nessuna animazione di comparsa allo scroll,
   mai autoplay o scroll hijacking.
6. **Accessibile per costruzione.** Focus, contrasto e tastiera non sono un
   passaggio finale.
7. **Niente template.** Se un elemento si potrebbe trovare identico in un
   portfolio generico, va ridisegnato o rimosso.

## Identità visiva

| Elemento | Scelta |
| --- | --- |
| Font sans | **Geist** (variabile, 400–700) per titoli, testo e UI |
| Font mono | **Geist Mono** (400/500) per metadati tecnici |
| Colore primario | **Emerald** (GitHub green: azione, link, focus, stato) |
| Colori dati | Colori ufficiali dei linguaggi GitHub, solo nella language bar |
| Neutro | **Zinc** (superfici, bordi, testo) |
| Sfondo | Zinc profondo `#09090b`, mai nero puro |
| Superfici | Zinc 900/50 con vetro sottile e `border-white/10` |
| Stato disponibilità | Emerald + pallino pulse + testo |
| Radius | 0.75 rem per card, full per pillole |
| Tono | Professionale, diretto, umano |

Niente gradienti decorativi invadenti (il radial dello spotlight è un dettaglio
funzionale), niente glassmorphism esteso, niente ombre multiple. Un solo livello
di elevazione visibile per volta. Il vetro è un dettaglio, non un tema.

## Token

I token vivono in `app/assets/css/main.css` con `@theme` di Tailwind 4. I
componenti usano i nomi semantici, mai le scale grezze. Questo è l'**unico**
documento che definisce i token: gli altri vi rimandano.

```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, monospace;

  --color-surface: #ffffff;
  --color-surface-muted: #f7f7f8;
  --color-surface-raised: #ffffff;
  --color-border: #e4e4e7;
  --color-border-strong: #d4d4d8;
  --color-foreground: #18181b;
  --color-foreground-muted: #52525b;
  --color-foreground-subtle: #71717a;

  --color-accent: #059669;
  --color-accent-hover: #047857;
  --color-on-accent: #ecfdf5;

  --color-available: #059669;

  --radius-card: 0.75rem;
  --radius-control: 9999px;

  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.06);
  --shadow-card-hover: 0 2px 4px rgb(0 0 0 / 0.05), 0 16px 40px rgb(0 0 0 / 0.10);

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 150ms;
  --duration-base: 240ms;
  --duration-slow: 400ms;
}

.dark {
  --color-surface: #09090b;
  --color-surface-muted: #121216;
  --color-surface-raised: #18181b;
  --color-border: rgb(255 255 255 / 0.10);
  --color-border-strong: rgb(255 255 255 / 0.18);
  --color-foreground: #fafafa;
  --color-foreground-muted: #a1a1aa;
  --color-foreground-subtle: #71717a;

  --color-accent: #34d399;
  --color-accent-hover: #6ee7b7;
  --color-on-accent: #022c22;

  --color-available: #34d399;

  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.24), 0 8px 24px rgb(0 0 0 / 0.32);
  --shadow-card-hover: 0 2px 4px rgb(0 0 0 / 0.3), 0 16px 40px rgb(0 0 0 / 0.4);
}

html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
}
```

Regole:

- I token semantici sostituiscono i colori grezzi nei componenti:
  `bg-surface`, `text-foreground-muted`, `border-border`.
- `accent` è il token custom per gli elementi brand; i componenti Nuxt UI usano
  `primary` configurato in `app.config.ts` (**emerald**). Non sovrascrivere
  `--color-primary` di Tailwind/Nuxt UI con un colore piatto.
- Il vetro è espresso con `bg-surface/50`, `backdrop-blur` e `border-border`;
  non creare un token "glass" separato per ogni card.
- Lo spotlight usa due variabili locali sulla card, aggiornate dal puntatore:
  `--spotlight-x` e `--spotlight-y`. Se il puntatore non è disponibile, resta
  un bordo/hover statico.
- I colori di accento devono passare il contrasto AA sia su chiaro sia su scuro.
- `--color-on-accent` esiste perché il testo su emerald cambia tra i temi.
- Ogni nuovo token deve avere una controparte dark.

## Tipografia

| Ruolo | Font | Peso | Dimensione (desktop / mobile) | Line-height |
| --- | --- | --- | --- | --- |
| Display (nome/Bento) | Geist | 600, tracking -0.03em | `clamp(2.5rem, 6vw, 4.25rem)` | 1.05 |
| H1 pagina | Geist | 600, tracking -0.02em | 2.5rem / 2rem | 1.1 |
| H2 sezione | Geist | 600, tracking -0.02em | 2rem / 1.625rem | 1.15 |
| H3 card | Geist | 600 | 1.25rem | 1.3 |
| Body | Geist | 400 | 1rem | 1.7 |
| Body large | Geist | 400 | 1.125rem | 1.75 |
| Small / meta | Geist | 500 | 0.875rem | 1.5 |
| Micro / badge | Geist | 600 | 0.75rem | 1.2 |
| Mono / tecnico | Geist Mono | 400 | 0.75–0.875rem | 1.4 |

- Una sola famiglia sans: la gerarchia nasce da peso, dimensione e tracking,
  non da un secondo font.
- Massima larghezza del testo: `65ch` per i paragrafi, `75ch` per il README.
- Titoli con `text-balance`; paragrafi con `text-pretty` quando supportato.
- Nessun testo sotto 12 px.
- I numeri nelle statistiche usano `font-variant-numeric: tabular-nums`.
- Il monospazio è **solo** per metadati tecnici: versione (`v1.2.0`), data
  (`2024.10.15`), hash (`git: 4f8a2b`), path, comandi, percentuali della
  language bar. Mai per paragrafi o titoli.
- Le date tecniche usano `YYYY.MM.DD` e sono quelle scritte nell'HTML statico.
  Le date relative ("2 ore fa") compaiono solo dopo il mount, con
  `Intl.RelativeTimeFormat` nella lingua corrente; l'assoluta resta in
  `datetime` e `title`. La larghezza del contenitore è riservata in `ch` per
  evitare CLS.
- La versione del sito viene letta da `package.json` a build time e mostrata
  nel footer in mono (`v0.1.0`).

## Layout e spaziature

| Elemento | Valore |
| --- | --- |
| Container | max `72rem` (1152 px), padding 1rem mobile / 1.5rem tablet / 2rem desktop |
| Ritmo sezioni | 4rem mobile / 6rem desktop |
| Gap griglia progetti | 1rem mobile / 1.5rem desktop |
| Header | 4rem mobile, 4.5rem desktop, sticky con blur |
| Prose README | max `75ch`, padding generoso |

Breakpoint (Tailwind): `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

Comportamenti:

- **Bento Grid:** 1 colonna `< 768`, 2 colonne `768–1023`, 4 colonne `≥ 1024`.
  I quattro riquadri occupano 2 colonne ciascuno su desktop; Profile e Top Repo
  hanno la priorità visiva.
- **Explore All Repositories:** 1 colonna `< 640`, 2 colonne `≥ 640`. La
  sezione è volutamente più larga e densa della Bento.
- **GitHub Story:** grafo a sinistra (fino a 3 lane) e card a destra. Sotto `md`
  le lane si stringono (8 px di passo) e le card occupano tutta la larghezza
  rimanente.
- **Featured:** il Top Repo (primo pinned) è nella Bento; gli altri pinned
  hanno un badge `Pinned` e ordinano per primi in Explore. Nessun carousel.
- Header: logo + sezioni su desktop; menu compatto su mobile.
- Niente scroll orizzontale a 320 px.

### Bento Grid

```text
desktop (4 colonne)
┌───────────────────────┬───────────────────────┐
│ Profile (2 col)       │ Top Repo (2 col)      │
│ avatar, nome, ruolo,  │ preview, stelle,      │
│ badge, quick actions  │ linguaggio, link      │
├───────────────────────┼───────────────────────┤
│ Tech Stack (2 col)    │ Activity (2 col)      │
│ language bar + chips  │ ultimo push / commit  │
└───────────────────────┴───────────────────────┘
```

Regole:

- La Bento non è una griglia di card uguali: le dimensioni raccontano la
  priorità (profilo e top repo prima).
- Ogni riquadro ha lo stesso raggio e bordo; cambia la densità interna.
- Su mobile l'ordine è: Profile → Top Repo → Tech Stack → Activity.
- La Bento è Above the Fold: nessun carousel, nessun contenuto che richieda
  click per capire chi è la persona.

## Inventario componenti

### Layout

| Componente | Responsabilità | Base |
| --- | --- | --- |
| `AppHeader` | Navigazione, logo, tema, lingua | `<header>`, sticky |
| `AppFooter` | Copyright, crediti stack, link | `<footer>` |
| `SkipLink` | Salta al contenuto | Primo elemento focusabile |
| `ThemeToggle` | system/light/dark | `UButton` + disclosure nativo |
| `LocaleSwitcher` | Lingue supportate, mantenendo la pagina | `<select>` nativo |
| `MobileMenu` | Navigazione mobile | Disclosure nativo (`<details>`) |

### UI

| Componente | Responsabilità | Base |
| --- | --- | --- |
| `SectionShell` | Anchor, padding, larghezza, `aria-labelledby` | `<section>` |
| `SectionHeading` | Titolo di sezione coerente | `<h2>` + eventuale eyebrow |
| `AppButton` | Varianti primary/secondary/ghost | `UButton` |
| `AppLink` | Link interni/esterni con rel sicuro | `NuxtLink` / `<a>` |
| `EmptyState` | Zero risultati, azione di reset | Custom |
| `ErrorState` | Errore recuperabile | Custom + `UButton` |
| `CopyButton` | Copia negli appunti con feedback | `UButton` + `useClipboard` |
| `StatusDot` | Disponibilità con pulse + testo | Custom |
| `TechDate` | Data assoluta in mono, relativa dopo il mount | `<time>` + `useRelativeTime` |

### Bento e Story

| Componente | Responsabilità |
| --- | --- |
| `BentoGrid` | Layout asimmetrico 1/2/4 colonne |
| `ProfileCard` | Avatar, nome, ruolo, bio, status, quick actions |
| `TopRepoCard` | Primo pinned con preview e stats |
| `LanguageBar` | Percentuali multi-colore + legenda accessibile |
| `ActivityCard` | Ultimo push, branch, commit, "Last synced" |
| `GitGraph` | SVG a lane (tronco, fork, merge) calcolato in build |
| `StoryNode` | Card espandibile con data, badge, link |
| `StoryLegend` | Legenda dei tipi di nodo |

### Progetti

| Componente | Responsabilità |
| --- | --- |
| `ProjectCard` | Anteprima, nome, descrizione, topics, stats, spotlight |
| `ProjectGrid` | Griglia 2 colonne, auto-animate, "carica altri" |
| `ExploreTabs` | Tab Tutti / linguaggi / Open Source |
| `ProjectFilters` | Ricerca, linguaggio, sort, reset |
| `ProjectStats` | Stelle, fork, linguaggio, size, aggiornamento |
| `ProjectHero` | Titolo, descrizione, link repo, linguaggi, ultimo commit e release |
| `ReadmeContent` | HTML sanificato + stili prose |
| `ProjectImage` | Preview o placeholder deterministico |

### CV

| Componente | Responsabilità |
| --- | --- |
| `CvDocument` | Impaginazione del CV dagli stessi dati della home |
| `PrintButton` | "Download PDF" → `window.print()`, nascosto in stampa |

## Anatomia della card progetto

```text
┌─────────────────────────────────────┐
│  Preview 16:9 (o placeholder)       │
│  - border-bottom                    │
├─────────────────────────────────────┤
│  [lang icon] Nome progetto  Pinned ↗│
│  Descrizione su max 3 righe         │
│  [Topic] [Topic] [Topic] +2         │
│  ─────────────────────────────────  │
│  ★ 42   ⑂ 5   TypeScript   1.2 MB  │
└─────────────────────────────────────┘
```

- La card ha un link principale alla pagina dettaglio; l'icona esterna è un
  controllo separato (non annidato) solo se porta alla demo, con focus visibile.
- Header: icona del linguaggio (Simple Icons/Lucide), nome repo in grassetto,
  icona esterna per la demo live.
- Metadati compatti in mono, tutti in `foreground-muted`: stelle
  (`lucide:star`), fork (`lucide:git-fork`), linguaggio, size.
- Badge `Pinned` in mono, bordo sottile, solo per i repository pinned.
- Hover: bordo più marcato, ombra, leggero sollevamento; niente trasformazioni
  che spostano il layout.
- Focus: ring visibile sull'intera card.
- La preview ha `aspect-ratio: 16 / 9`, `object-fit: cover`, `loading="lazy"` e
  dimensioni esplicite.
- Le immagini dei repository possono essere chiare o scure: bordo sottile e
  sfondo `surface-muted` per staccarle.
- Se la descrizione manca: "Nessuna descrizione" in `foreground-subtle`.
- Se i topics mancano: nessun badge, non un contenitore vuoto.
- Il numero di stelle è formattato con `Intl.NumberFormat` (1.2k).

### Spotlight hover

- Implementazione: **un solo** listener `pointermove` delegato sul contenitore
  della griglia (`useSpotlight`). Trova la card con `closest('[data-spotlight]')`
  e scrive `--spotlight-x`/`--spotlight-y` con `style.setProperty`, al massimo
  una volta per frame (`requestAnimationFrame`). Nessuno stato reattivo Vue: un
  movimento del mouse non provoca re-render.
- Un overlay `::before` disegna un radial gradient emerald a bassa opacità.
- Attivo solo con puntatore fine (`(hover: hover) and (pointer: fine)`) e
  senza `prefers-reduced-motion`; altrimenti il listener non viene registrato e
  resta un hover statico.
- L'overlay è `pointer-events: none` e non deve mai coprire il testo.
- Costo: nessuna dipendenza extra, un listener per griglia.

### Language bar

- Barra orizzontale con segmenti proporzionali ai byte, colori GitHub.
- Legenda sotto: pallino colore + nome + percentuale in mono.
- Su hover/focus di un segmento, tooltip con nome e percentuale.
- Il colore non è l'unico indicatore: nomi e percentuali sempre visibili.
- Se i dati mancano: stato vuoto "Dati linguaggi non disponibili".

### Status dot

- Pallino emerald + testo "Available for new opportunities".
- Pulse solo se `available === true` e senza reduced motion.
- Il testo è obbligatorio; il pallino è decorativo (`aria-hidden`).
- Il pulse non deve essere l'unico segnale di stato.

### GitHub Story / Git Graph

Una linea verticale con dei pallini è esattamente la timeline generica che il
progetto sostituisce. Il differenziatore sono le **lane**:

```text
  ●            2024.07  Full-stack Developer        (work, in corso)
  │
  ○            2024.02  repo-name v1.0              (release, da GitHub)
  │
  ○            2023.05  repo-name                   (repo pinned, da GitHub)
  │
  ├──●         2022.07  BSc Computer Science        (education: merge nel tronco)
  │  │
  ◆  │         2021.03  Primo progetto open source  (milestone, sul tronco)
  │  │
  ├──╯         2019.09                              (education: fork dal tronco)
  │

  ● esperienza   ○ evento automatico   ◆ milestone
```

- Il **tronco** (lane 0) è sempre disegnato; le esperienze sovrapposte si
  staccano dal tronco (fork) all'inizio e vi rientrano (merge) alla fine.
- Massimo 3 lane; passo 16 px su desktop, 8 px sotto `md`.
- Le lane sono calcolate in build da `shared/utils/story-graph.ts` e disegnate
  come SVG inline: zero JS per il grafo. Algoritmo in
  [05](05-dati-e-contenuti.md#lane-del-grafo).
- Colori: tronco e archi in `border-strong`; il nodo corrente (esperienza in
  corso) in emerald. Nessun colore per lane: la distinzione è geometrica.
- Nodi: cerchio pieno per le esperienze (`work`, `education`), cerchio vuoto
  per gli eventi automatici (`repo`, `release` da GitHub), rombo per i
  `milestone` curati. L'icona Lucide del tipo (briefcase, graduation cap, tag,
  git-branch) accompagna la data nella card.
- L'SVG è decorativo (`aria-hidden`); l'ordine è nel DOM e nelle date.
- Ogni nodo: data in mono (`YYYY.MM`), titolo, descrizione, badge tecnologia,
  link demo/repo. Gli eventi automatici hanno l'etichetta "from GitHub".
- Card espandibili con `<details>`/`<summary>`; lo stato espanso è annunciato.
- Su mobile il grafo resta a sinistra e le card occupano tutta la larghezza.

### CV stampabile

- Layout `print`: colonna singola, larghezza A4, niente header, footer,
  spotlight o pulsanti.
- In `@media print`: tema chiaro forzato, `color-adjust: exact` solo per i
  pallini della language bar, `break-inside: avoid` su esperienze e progetti,
  URL dei link stampati dopo il testo in mono.
- Stessa tipografia del sito (Geist + Geist Mono): il CV è riconoscibile come
  parte dello stesso prodotto.

## Stati

| Stato | Comportamento |
| --- | --- |
| Loading (idratazione) | Payload già presente: nessuno skeleton. Nessun contenuto è client-only |
| Empty filtri | Messaggio + "Azzera filtri" + suggerimento |
| Empty dati | Messaggio "Nessun progetto pubblico" + link al profilo GitHub |
| Errore README | Fallback con link a GitHub |
| Immagine rotta | Placeholder deterministico + alt corretto |
| Offline | Il sito statico funziona; eventuali link esterni no |
| Reduced motion | Nessuna animazione di ingresso/riordino |

## Motion

| Interazione | Animazione | Durata |
| --- | --- | --- |
| Hover card | translateY -2px, shadow | 150 ms |
| Spotlight | radial gradient segue il puntatore | immediata |
| Filtro/riordino | auto-animate | 180 ms |
| Disclosure nodo story | altezza + opacity | 200 ms |
| Feedback copia | fade + icona check | 150 ms |
| Status dot | pulse discreto | 2 s, solo se disponibile |
| Cambio tema | transizione colori | 200 ms |

Regole:

- `@media (prefers-reduced-motion: reduce)` disattiva auto-animate, pulse,
  spotlight e transizioni non essenziali.
- Nessuna animazione di comparsa allo scroll: il contenuto è visibile dal primo
  paint, anche senza JS.
- Nessun parallax, nessuno scroll hijacking, nessun autoplay.
- Le animazioni non devono bloccare l'interazione né causare CLS.
- Lo spotlight non è un requisito funzionale: senza puntatore la card resta
  completa.

## Accessibilità (WCAG 2.2 AA)

### Struttura

- Un solo `<h1>` per pagina; gerarchia dei titoli senza salti.
- Landmark: `header`, `nav`, `main`, `footer`; le sezioni hanno
  `aria-labelledby`.
- Skip link come primo elemento focusabile.
- Lingua della pagina con `<html lang>` corretta e aggiornata al cambio lingua.
- Link esterni con indicazione visiva o testo che lo chiarisce.

### Tastiera

- Tutto raggiungibile con Tab; ordine logico.
- Focus ring visibile (2 px, offset 2 px) su ogni elemento interattivo.
- Header, tab, filtri, nodi della story e menu utilizzabili senza mouse.
- `Esc` chiude overlay e menu.
- Il focus trap è delegato a Reka UI (modale/slideover); al ritorno il focus
  torna all'elemento che ha aperto.
- Nessun `outline: none` senza sostituto.

### Bento e dati

- La Bento è una `section` con `aria-labelledby`; ogni riquadro ha un titolo
  accessibile (anche visivamente nascosto se serve).
- La language bar è accompagnata da una lista/tabella testuale con nome e
  percentuale; il colore non è l'unico dato.
- Lo stato di disponibilità è testo + `aria-hidden` sul pallino; il pulse è
  disattivato con reduced motion.
- L'activity card usa `<time datetime>` e dice esplicitamente che il dato è
  sincronizzato all'ultima build, non in tempo reale.
- Il Top Repo è un link con nome accessibile completo (non solo l'immagine).

### Git Graph

- La storia è una lista ordinata (`<ol>`) o una sequenza di `<article>` con date
  semantiche; la linea decorativa è `aria-hidden`.
- Ogni nodo ha un'intestazione e un controllo di espansione con stato
  `aria-expanded`.
- I link a repo/demo hanno testo che identifica la destinazione.
- L'ordine cronologico è leggibile anche senza la grafica del grafo.
- Le icone di tipo hanno etichetta testuale o `aria-label`.

### CV

- `/cv` ha un `h1` (nome) e sezioni con `h2`; la versione stampata conserva la
  stessa struttura.
- Il pulsante "Download PDF" spiega che apre la finestra di stampa del browser.

### Form e feedback

- Ogni input ha label visibile (non solo placeholder).
- Errori identificati con testo, non solo colore.
- Contatore risultati in `aria-live="polite"` (debounced).
- Copy email con messaggio annunciato (`aria-live`).
- Toast non devono essere l'unico canale per un'informazione critica.

### Contenuti

- `alt` descrittivo per immagini informative; `alt=""` per decorative.
- Contrasto testo ≥ 4,5:1; testo grande e componenti UI ≥ 3:1.
- Nessuna informazione trasmessa solo con il colore.
- Reflow a 320 px e zoom 200% senza perdita di contenuto.
- Touch target ≥ 44×44 px.
- Testi in tutte le lingue supportate con espansione fino al 30% senza
  troncamenti.

### Verifica

- `axe-core` in Playwright su home, dettaglio, CV, 404, tutte le lingue: zero
  violazioni `critical`/`serious` come gate.
- Test manuale da tastiera.
- Test con NVDA (Windows) o VoiceOver (macOS) almeno sui flussi principali.
- Lighthouse A11y = 100 come obiettivo, verificato nel report (non bloccante).

## Microcopy

Tono: diretto, prima persona, niente superlativo. Esempi:

| Contesto | IT | EN |
| --- | --- | --- |
| Titolo Explore | "Esplora tutti i repository" | "Explore all repositories" |
| CTA primaria | "Guarda i progetti" | "View projects" |
| CTA contatto | "Parliamone" | "Let's talk" |
| Ricerca | "Cerca per nome, topic o tecnologia" | "Search by name, topic or technology" |
| Zero risultati | "Nessun progetto con questi filtri." | "No projects match these filters." |
| Reset | "Azzera filtri" | "Clear filters" |
| Copia email | "Copia email" / "Email copiata" | "Copy email" / "Email copied" |
| Chiama | "Chiama" | "Call" |
| README assente | "README non disponibile. Aprilo su GitHub." | "README unavailable. Open it on GitHub." |
| Disponibilità | "Disponibile per nuove opportunità" | "Available for new opportunities" |
| Activity | "Ultima sincronizzazione" | "Last synced" |
| Story | "GitHub Story" | "GitHub Story" |
| Evento automatico | "da GitHub" | "from GitHub" |
| Repo in evidenza | "Pinned" | "Pinned" |
| CV | "Scarica PDF" | "Download PDF" |

Le stringhe vivono in `i18n/locales/*.json`; i contenuti editoriali in
`data/profile/*.json`. Non mischiare i due. La tabella mostra EN/IT come
esempi: ogni lingua supportata ha il proprio file.

## Immagini e OG

- OG image: `public/og/og-default.png` (1200×630) se l'owner la aggiunge;
  altrimenti l'avatar del profilo. Nessuna immagine generata in build, nessuna
  OG per progetto.
- Avatar: 192×192, `object-cover`, bordo, `alt` con il nome.
- Preview repository: 16:9, immagine remota trovata dalla discovery; se manca,
  placeholder locale.
- Le preview sono remote e non ottimizzate: il nome del repository e il testo
  della Bento devono essere l'elemento LCP, non l'immagine del Top Repo, che
  resta `loading="lazy"` con dimensioni riservate.
- Le immagini decorative non devono essere annunciate.

## Design QA checklist

- [ ] Tutti i colori usano token semantici.
- [ ] Il tema scuro è il default e il chiaro non è un ripiego.
- [ ] Chiaro e scuro hanno lo stesso livello di leggibilità.
- [ ] Focus visibile su ogni controllo.
- [ ] Nessun overflow orizzontale a 320 px.
- [ ] Le lingue supportate non rompono i layout (testi più lunghi).
- [ ] Bento, card, tab, filtri e nodi della story funzionano da tastiera.
- [ ] Il monospazio è usato solo per metadati tecnici.
- [ ] Un solo accento: niente ambra, colori dei linguaggi solo nella language bar.
- [ ] Il Git Graph mostra le lane per le esperienze sovrapposte.
- [ ] Il CV in anteprima di stampa è pulito e leggibile.
- [ ] La language bar ha legenda testuale e non solo colore.
- [ ] Lo status dot ha testo e pulse disattivabile.
- [ ] Lo spotlight non è necessario per capire la card.
- [ ] Il Git Graph è leggibile come lista anche senza la linea.
- [ ] Reduced motion rispettato.
- [ ] Empty/error/loading states progettati, non improvvisati.
- [ ] Contrasto verificato con tool (non a occhio).
- [ ] OG image e favicon presenti.
- [ ] Il risultato non sembra un template generico.
