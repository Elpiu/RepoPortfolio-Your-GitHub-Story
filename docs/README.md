# RepoPortfolio — Documentazione di progetto

> **Stato:** Fase 1 — M6 (qualità e cutover): implementato e verificato in locale; restano CI reale, primo deploy e rollback
> **Ultimo aggiornamento:** 1 novembre 2026
> **Destinatari:** maintainer, contributor, reviewer

RepoPortfolio è un portfolio statico che racconta la storia professionale di uno
sviluppatore partendo dai suoi repository GitHub. Chi lo clona modifica solo i
JSON in `data/` e pubblica con un commit: a ogni push sul branch di default una
GitHub Action genera il sito e lo mette su GitHub Pages. Nessun database,
nessun backend, nessuna API key esposta al browser.

> **Regola d'oro**
>
> *Un motore a manutenzione zero che sincronizza la tua identità GitHub in una
> landing page ad alte prestazioni.*

> **Posizionamento**
>
> Questo **non è l'ennesimo template di portfolio**. È un'identità GitHub
> trasformata in un prodotto editoriale: un motore che legge repository,
> linguaggi e attività, e li presenta con la direzione visiva
> **Engineered Minimalism** (Linear, Vercel, Raycast). Ogni scelta grafica deve
> sembrare deliberata, non decorativa. Se una feature o un effetto non rafforza
> "identità GitHub + alte prestazioni + manutenzione zero", non entra.

Questa cartella contiene le decisioni di prodotto e tecniche della riscrittura
Nuxt ed è la specifica del codice. Il progetto legacy (Next.js) è stato rimosso
e resta solo nella storia git.

---

## Indice

| Documento | Contenuto |
| --- | --- |
| [01 — Visione e obiettivi](01-visione-e-obiettivi.md) | Regola d'oro, posizionamento, utenti, obiettivi misurabili, rischi |
| [02 — Feature](02-feature.md) | Feature pilastro, Bento, GitHub Story, Explore, CV, criteri di accettazione |
| [03 — Architettura](03-architettura.md) | Rendering, flusso dati REST pubblico, layer, struttura cartelle |
| [04 — Tech stack](04-tech-stack.md) | Ogni libreria, ruolo, configurazione |
| [05 — Dati e contenuti](05-dati-e-contenuti.md) | `data/`, schemi, API REST pubblica, discovery preview, story |
| [06 — Design system e UX](06-design-system.md) | Engineered Minimalism, token, Bento, Git graph a lane, accessibilità |
| [07 — Infrastruttura e deploy](07-infrastruttura-deploy.md) | Pubblicazione da GitHub Actions, GitHub Pages, sicurezza, runbook |
| [08 — Qualità e testing](08-qualita-testing.md) | Test, quality gate, budget, convenzioni |
| [09 — Roadmap e decisioni](09-roadmap-e-adr.md) | Milestone, backlog, registro ADR (unico), domande aperte |

Fonti uniche, per evitare che i documenti divergano: i token CSS vivono solo in
06, le decisioni (ADR) solo in 09, le priorità delle feature solo in 02.

---

## Principi guida

1. **Engineered Minimalism.** Pulito, scuro, griglie rigorose, tocchi Git. Ogni
   elemento deve avere una funzione; il minimalismo non è assenza di carattere.
2. **Static-first.** Tutto ciò che il visitatore vede esiste già come HTML al
   momento del deploy. Il JavaScript aggiunge interattività, non contenuto.
3. **Content-as-data.** Personalizzare il portfolio significa modificare i JSON
   in `data/` e pubblicare. Nessun CMS, nessun pannello admin, nessun file di
   codice da toccare.
4. **Zero backend.** Nessun server sempre acceso, nessuna API key nel browser.
   L'unica integrazione esterna (GitHub) avviene durante la build.
5. **i18n-first.** Inglese default, altre lingue supportate tramite registry e
   file di contenuto. Nessuna stringa hardcoded nei componenti.
6. **Accessibile per default.** WCAG 2.2 AA come requisito, non come rifinitura.
   Focus visibile, navigazione da tastiera, contrasto, motion riducibile.
7. **Veloce per contratto.** Budget in byte verificati in CI, non solo
   sperati. Niente font o icone caricati da CDN a runtime.
8. **Privacy by default.** Nessun cookie, nessun analytics invasivo. Solo
   preferenze locali (tema, vista); lingua e filtri vivono nell'URL.
9. **DX sostenibile.** TypeScript strict, schema unico per i dati, test sui
   confini, CI che fallisce presto e con messaggi utili.

## Regola di revisione

Prima di approvare una feature, un componente o un effetto, rispondere a queste
domande:

1. **Manutenzione zero:** aumenta il lavoro manuale o le dipendenze? Chiede a
   chi clona di toccare qualcosa fuori da `data/`? Se sì, probabilmente è fuori
   perimetro.
2. **Identità GitHub:** rende più chiaro chi è la persona e cosa ha costruito?
3. **Prestazioni:** aggiunge JS, richieste o layout shift? Deve stare nel budget.
4. **Distintività:** si potrebbe trovare identico in un portfolio generico? Se
   sì, va ridisegnato o rimosso.
5. **Accessibilità:** funziona da tastiera, con screen reader e con motion
   ridotto?

## Legenda delle decisioni

Ogni scelta architetturale ha un ID (`ADR-xxx`) e uno stato:

| Stato | Significato |
| --- | --- |
| **Accettata** | Vincolante per l'implementazione |
| **Proposta** | Raccomandata, in attesa di conferma del maintainer |
| **Da decidere** | Blocca una parte del lavoro finché non viene risolta |
| **Superata** | Sostituita da un'altra decisione |

Le decisioni sono raccolte in [09 — Roadmap e decisioni](09-roadmap-e-adr.md).

## Convenzioni della documentazione

- Lingua dei documenti: italiano. Identificatori di codice, nomi dei file e
  messaggi di commit: inglese.
- Ogni feature ha un ID (`F1`, `F2`, ...) e criteri di accettazione verificabili.
- Ogni modifica architetturale aggiorna il registro ADR e la data in testa a
  questo file.
- I diagrammi sono in ASCII/Mermaid e devono restare versionabili nel repo.
- Le regole operative per i coding agent (fonti, vincoli, comandi, git, report)
  sono in [`AGENTS.md`](../AGENTS.md) alla root; `CLAUDE.md` lo importa.

## Stato del repository

L'applicazione Nuxt 4 implementa M1–M6 (dettaglio e cose ancora da fare in
[09 — Stato dell'implementazione](09-roadmap-e-adr.md#stato-dellimplementazione-01112026)):

- `data/` — template per chi clona; `datasets/` — payload alternativi
  selezionabili con `PORTFOLIO_DATA_DIR` (ADR-029), incluso quello dell'owner;
- `app/`, `server/`, `shared/`, `modules/`, `scripts/` — il motore;
- `tests/unit` (Vitest) e `tests/e2e` (Playwright + axe);
- `.github/workflows` — CI, deploy su push, controlli settimanali;
- `.github/RepoPortfolio-Your-GitHub-Story/index.png` — preview del repository
  (path legacy, riconosciuto dalla discovery automatica).

Il legacy Next.js resta solo nella storia git. Il cutover è descritto in
[07 — Infrastruttura e deploy](07-infrastruttura-deploy.md#cutover-dal-legacy).
