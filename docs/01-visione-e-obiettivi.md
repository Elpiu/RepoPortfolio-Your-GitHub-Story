# 01 — Visione e obiettivi

## Regola d'oro

> **Un motore a manutenzione zero che sincronizza la tua identità GitHub in una
> landing page ad alte prestazioni.**

Ogni decisione di prodotto, dati o design risponde a questa frase. Se una feature
non rende l'identità GitHub più leggibile, non riduce la manutenzione o non
migliora le prestazioni, non appartiene al progetto.

## Posizionamento

RepoPortfolio **non è l'ennesimo template di portfolio**. È un'identità GitHub
sincronizzata e presentata come un prodotto editoriale, con la direzione visiva
**Engineered Minimalism**: pulito, scuro, griglie rigorose, dettagli da strumento
per sviluppatori (Linear, Vercel, Raycast). Il valore non è "avere una pagina",
ma avere **un motore** che trasforma repository, linguaggi e attività in una
narrazione credibile e sempre coerente.

## Il problema

Uno sviluppatore ha già la propria storia professionale distribuita su GitHub:
repository, linguaggi, topics, README, attività. Raccontarla richiede oggi di
costruire e mantenere un sito a parte, con un CMS, un database o almeno un
processo di deploy separato. Il risultato tipico è un portfolio che invecchia
più velocemente del profilo GitHub che dovrebbe rappresentare.

RepoPortfolio riduce il divario: **GitHub è la fonte di verità per i
progetti** (repository, stelle, linguaggio principale, date), un JSON validato lo è per
il racconto personale. Il sito viene rigenerato a ogni push e ripubblicato con
un solo comando.

## Value proposition

> Usi il template, modifichi i JSON in `data/`, fai commit:
> ottieni una landing page statica, multilingua (inglese default), accessibile
> e veloce, che sincronizza la tua identità GitHub: Bento profile, GitHub Story
> a forma di git graph, repository esplorabili e un CV esportabile.

## Utenti e bisogni

### Visitatore (recruiter, cliente, collega)

- Capire in **meno di 30 secondi** chi è la persona e cosa sa fare.
- Esplorare progetti reali con contesto (descrizione, tecnologie, README).
- Fidarsi della qualità tecnica del portfolio stesso: velocità, accessibilità,
  link funzionanti.
- Trovare un contatto o il CV senza attrito.

### Owner (lo sviluppatore)

- Personalizzare il sito modificando solo file JSON, senza imparare un
  framework o un CMS.
- Ripubblicare con un comando, da locale o tramite push.
- Aggiungere un progetto semplicemente creandolo su GitHub; metterlo in
  evidenza pinnandolo sul profilo.
- Non configurare nulla nei singoli repository (le preview vengono trovate da
  sole).
- Evitare di aggiornare a mano stelle, date, descrizioni e CV.
- Avere un sito che non si rompe e non espone segreti.
- Poterlo ospitare gratuitamente.

### Contributor

- Capire l'architettura dai documenti prima di toccare il codice.
- Avere test e quality gate chiari.
- Non dover indovinare dove vive un dato o una stringa.

## Obiettivi misurabili

| Obiettivo | Target | Come si verifica |
| --- | --- | --- |
| Performance | Lighthouse Performance ≥ 95 (mobile) | Report Lighthouse CI su ogni PR |
| Core Web Vitals | LCP < 2,5 s; CLS < 0,1; INP < 200 ms | Lighthouse CI / CrUX dopo il deploy |
| Accessibilità | WCAG 2.2 AA; Lighthouse A11y = 100 | axe (gate) + test manuale da tastiera |
| SEO | Ogni progetto e ogni locale ha title, description, canonical, OG | Test E2E + controllo HTML generato |
| Freschezza dati | Repository aggiornati a ogni deploy, al massimo dopo una settimana | Deploy su push, rebuild settimanale, dispatch manuale |
| Semplicità di personalizzazione | Solo file JSON in `data/`; nessun file di codice da toccare | Validazione + JSON Schema nell'editor |
| Rideploy | Un commit, base URL dedotto | Push sul branch di default da un template pulito |
| Build | `generate` < 3 minuti con 100 repository | Timing della CI |
| Zero runtime esterni | Nessuna richiesta a GitHub API/Google Fonts/icon API dal browser (le immagini GitHub sono l'eccezione) | Network tab + test E2E |
| Bundle iniziale | JS < 180 KB gzip (route `/`) | Budget in byte in CI (bloccante) |
| Distintività | Elementi firma riconoscibili: Bento, Git Graph a lane, spotlight | Design review |
| Costo | 0 €/mese su hosting statico | Fatturazione GitHub/Cloudflare |

I target sono volontariamente aggressivi: il portfolio è anche una vetrina
delle capacità tecniche di chi lo possiede.

## Non-obiettivi (MVP)

- Autenticazione, account utente, area riservata.
- CMS visuale o pannello di amministrazione.
- Supporto a repository privati (richiederebbe un backend e un token runtime).
- Commenti, like, newsletter.
- Blog, testimonianze o pagine editoriali.
- Marketplace di temi o white-label.
- Chatbot o AI generativa nel sito.
- Analytics invasivi o profilazione.
- Form di contatto o invio email dal sito (solo pulsanti `mailto:`/`tel:`).
- Multi-tenant o white-label per più utenti.
- Editor di contenuti nel browser.
- Generazione di immagini in build (OG per progetto, screenshot, ottimizzazione
  delle preview).

Questi punti possono diventare feature secondarie, ma non devono condizionare
l'architettura statica.

## User journey

### Visitatore — primo contatto

1. Arriva da LinkedIn o da un link diretto.
2. Vede un **Bento Grid** con profilo, disponibilità, top repo, language bar e
   ultima attività GitHub: capisce chi è e cosa sa fare a colpo d'occhio.
3. Scorre la **GitHub Story**: un git graph con lane parallele, in cui
   esperienze, milestone e repository featured sono nodi/commit.
4. Arriva a **Explore All Repositories**, filtra per linguaggio o cerca una
   tecnologia.
5. Apre il dettaglio di un progetto e legge il README.
6. Torna al profilo, usa `mailto:` o `tel:`, oppure apre il CV (`/cv`) e lo
   salva in PDF.
7. Cambia lingua verso una delle lingue supportate; la lingua resta nell'URL.

### Owner — primo deploy

1. Clona il progetto (o usa il template).
2. Modifica `data/site.json` e `data/profile/en.json`; l'editor suggerisce i
   campi grazie al JSON Schema.
3. Imposta una volta GitHub Pages su sorgente "GitHub Actions".
4. Fa commit e push sul branch di default (nessun token da configurare).

### Owner — aggiornare il portfolio

1. Crea o aggiorna un repository su GitHub; la preview viene trovata da sola.
2. Se vuole metterlo in evidenza, lo pinna sul profilo GitHub: diventa featured
   e compare nella GitHub Story.
3. Se deve cambiare il racconto personale, modifica il JSON della lingua.
4. Fa commit e push sul branch di default.
5. La build valida i dati, genera il sito e lo pubblica.
6. Ogni deploy aggiorna stelle, date, README e anteprime; tra un deploy e
   l'altro il sito mostra la data dell'ultima sincronizzazione.

## Metriche di prodotto

- **Time to first value:** un nuovo owner pubblica il sito in < 15 minuti
  (template, `data/`, commit).
- **Time to understanding:** un visitatore identifica ruolo e stack in < 30 s.
- **Content drift:** 0 informazioni duplicate tra GitHub e `data/`; il CV è
  generato dagli stessi dati.
- **Broken links:** 0 link interni/esterni rotti al deploy.
- **Bounce qualitativo:** visitatori che raggiungono almeno un dettaglio
  progetto (misurabile solo con analytics opzionali, mai obbligatorio).

## Rischi di prodotto

| Rischio | Impatto | Mitigazione |
| --- | --- | --- |
| GitHub API rate limit o down durante la build | Deploy bloccato | REST pubblico (1–3 richieste), snapshot dell'ultimo dato valido, retry con dispatch o deploy locale |
| README troppo grandi o con HTML malevolo | Build lenta / XSS | Limite dimensione, sanitizzazione, allowlist di tag |
| Progetti senza descrizione o immagine | Card povere | Discovery automatica delle preview, copy di default, placeholder locali |
| Primo deploy che non va online | Abbandono di chi clona | Base URL dedotto, guida nel README, runbook "sorgente GitHub Actions" |
| Contenuti delle lingue supportate divergenti | Esperienza incoerente | Schema condiviso + test di parità delle chiavi |
| Over-engineering del portfolio | Tempo speso, valore basso | Backlog MoSCoW, MVP prima delle feature "cool" |
| Dipendenza da un solo hosting | Indisponibilità | Build statica portabile; adapter alternativo documentato |

## Criterio di successo della fase 0

La fase 0 è conclusa quando:

- le feature pilastro sono approvate e hanno criteri di accettazione;
- stack e architettura sono documentati e non hanno contraddizioni;
- le decisioni aperte sono poche, esplicite e assegnate;
- esiste una roadmap con una prima milestone implementabile.
