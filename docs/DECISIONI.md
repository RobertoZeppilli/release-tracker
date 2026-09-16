# Decisioni di progetto — MVP

Riepilogo delle decisioni prese nella sessione di progettazione del 16 settembre 2026.
I termini in grassetto sono definiti in [`CONTEXT.md`](../CONTEXT.md); le decisioni difficili da
invertire hanno un ADR in [`docs/adr/`](./adr/).

## Prodotto

Un SaaS per sviluppatori che raccoglie le **Release** delle **Tecnologie** che uno
**Sviluppatore** segue e le presenta in una **Dashboard**, con **Sintesi** generate dall'AI per le
Release che contano.

- Interfaccia, **Sintesi** e codice in **inglese**. Il glossario è in italiano con una tabella di
  nomi inglesi canonici.
- Nome del progetto ancora da decidere (`release-tracker` è provvisorio).

## Modello del dominio

| Decisione | Dettaglio | ADR |
|---|---|---|
| **Versione** e **Rilevanza** separate | La Rilevanza (`featured` · `notable` · `digest` · `preview`) viene da una **Strategia di classificazione** per Tecnologia, non dal tipo SemVer. Correggibile a mano per singola Release. | [0001](./adr/0001-rilevanza-separata-dalla-versione.md) |
| CSS/W3C fuori dall'MVP | Le spec non hanno Versioni: entreranno come nuovo tipo di **Fonte**. | 0001 |
| **Catalogo** curato | Gli Sviluppatori seguono solo Tecnologie del Catalogo. I pacchetti fuori catalogo diventeranno **Richieste di tecnologia** (post-MVP). | [0002](./adr/0002-catalogo-curato.md) |
| Una Release per Versione | Anche se più **Fonti** osservano la stessa Versione. | — |
| Ruoli delle Fonti | Una Fonte **rileva** le Versioni (npm, tag GitHub, PyPI) o **fornisce le Note di rilascio** (GitHub Releases, `CHANGELOG.md`). Formato dei tag e percorso del changelog configurati per Fonte. | — |
| Niente Sintesi senza Note | Se mancano le **Note di rilascio**, la Sintesi è _Non disponibile_; non si generano sintesi dal solo numero di versione. Niente scraping dei blog nell'MVP. | — |
| **Anteprime** nell'MVP | Beta e rc sono Release con Rilevanza `preview`; la Sintesi solo per la prima Anteprima di una nuova major. Canary, nightly ed experimental esclusi dal Rilevamento. | — |
| Catalogo come codice | Un file per Tecnologia nel repository, validato con Zod, sincronizzato su Supabase al deploy. **Correzioni di rilevanza** direttamente sul database, mai sovrascritte. | [0005](./adr/0005-catalogo-come-codice.md) |
| Ritirare, mai cancellare | Una Tecnologia tolta dal Catalogo diventa **ritirata**: niente più Rilevamento, contenuti ancora online. | 0005 |

## Pipeline dei dati

| Decisione | Dettaglio | ADR |
|---|---|---|
| Nessuna chiamata esterna dal client | GitHub, npm e Anthropic sono chiamati solo dai job server. Gli utenti leggono dati salvati. | — |
| **Rilevamento** e Sintesi separati | Due cron distinti. Il Rilevamento crea Release (idempotente su Tecnologia + Versione), assegna la Rilevanza, salva le Note. Non chiama l'AI. | [0003](./adr/0003-rilevamento-e-sintesi-separati.md) |
| "Una sola volta" garantito dal database | Presa in carico atomica `pending` → `processing` con un unico `UPDATE … RETURNING`. | 0003 |
| **Stato della sintesi** | `pending` · `processing` · `ready` · `unavailable` · `skipped` · `failed`. La Release è visibile in qualsiasi stato. | — |
| Quali Release si riassumono | `featured`, `notable` e la prima `preview` di una major. Le `digest` no. | — |
| Piano Vercel Hobby | Cron al massimo una volta al giorno: Rilevamento giornaliero, Sintesi pianificata dopo. Alternativa futura: `pg_cron` di Supabase. | 0003 |
| **Importazione iniziale** limitata | Solo gli ultimi 12 mesi + l'ultima Release `featured`. Sintesi solo per l'ultima `featured` e le `notable` degli ultimi 90 giorni; il resto va nello **Storico** (`skipped`). | — |
| Claude Opus 5 via Batch API | Invio di un batch giornaliero, raccolta dei risultati in un'esecuzione successiva. ~$0,023 per Sintesi. | [0007](./adr/0007-sintesi-con-opus-5-via-batch-api.md) |
| Output strutturato | Titolo (≤ 120 caratteri), 3–5 punti chiave, breaking changes (cosa cambia + come migrare), **Intervento richiesto** (sì/no), modello e versione del prompt. Validato con Zod; se non valido → `failed`. | — |
| Nessuna invenzione | Breaking changes e Intervento richiesto si basano solo sulle Note. | — |
| Note lunghe | Mai troncate in silenzio: oltre la soglia di sicurezza → `failed` con il motivo. | 0007 |
| Credito API esaurito | Non è un fallimento: le Release restano `pending` senza consumare tentativi, e l'amministratore viene avvisato. | 0007 |

## Esperienza utente

| Decisione | Dettaglio |
|---|---|
| Pagine pubbliche | `/technologies/[slug]` e la pagina della singola Release sono pubbliche, generate lato server con ISR e rigenerate quando cambia una Sintesi. Sono il canale SEO. |
| Login | Solo GitHub OAuth con Supabase Auth, **scope minimo**. L'accesso ai repository si chiederà a parte, con lo scanner. |
| Login richiesto per | **Seguire** e la **Dashboard**. Nessun "seguire" anonimo in localStorage. |
| Pagina `/technologies` | Solo con login. Tre sezioni: seguite, **Catalogo**, ritirate (solo se seguite). Filtro per nome e descrizione. Mock: `design/mocks/technologies.html`. |
| Limite Free nell'interfaccia | A 10 seguite i Follow si disattivano (`aria-disabled`) con una nota. L'aggiornamento è ottimistico: se il database rifiuta, il toggle torna indietro e la riga mostra l'errore con il rimedio. |
| **Tecnologie ritirate** seguite | Restano seguite e contano nei 10; si possono solo smettere di seguire, e poi non si possono più seguire. |
| Tecnologia assente dal Catalogo | Solo una nota: il Catalogo è curato e le **Richieste di tecnologia** non sono aperte. Nessun form né link nell'MVP. |
| Sezioni della Dashboard | **Spotlight** (Release `featured` degli ultimi 30 giorni; se non ce ne sono, l'ultima major in forma compatta), **Latest**, **Previews**, **Weekly Digest**. |
| Weekly Digest | Vista calcolata per settimana ISO (UTC), non salvata. Diventerà un'entità con le email. |
| Stato "Visto" per Release | Rimandato: arriva con le Notifiche. |
| Filtri e tab | Nell'URL. |
| **Cammino di upgrade** | Nell'MVP: la pagina di una Tecnologia accetta `?from=<version>` e mostra le Release fino all'ultima stabile e quante richiedono intervento. Pubblico, senza login, calcolato sulle Release salvate. |

## Piani e pagamenti

| Decisione | Dettaglio | ADR |
|---|---|---|
| Principio | Gratis ciò che costa zero per utente; Pro ciò che cresce con l'uso. Sintesi e pagine pubbliche sempre gratuite. | [0004](./adr/0004-monetizzazione-e-merchant-of-record.md) |
| Free | Dashboard, pagine pubbliche, massimo **10 Tecnologie seguite**, applicato dal database. | 0004 |
| Pro (post-MVP) | Tecnologie illimitate, Notifiche email/Slack, scanner dei repository, Richieste di tecnologia con priorità. | 0004 |
| Team (futuro) | Piano legato a un gruppo; non implementato. | 0004 |
| Pagamenti | Lemon Squeezy come Merchant of Record, integrato insieme alle Notifiche. | 0004 |

## Architettura del codice

| Decisione | Dettaglio | ADR |
|---|---|---|
| Stack | Next.js App Router, TypeScript strict, Supabase (Postgres, RLS, Auth), Tailwind, shadcn/ui, Lucide, TanStack Query v5, Zod, compatibile con React Compiler. | — |
| Moduli di dominio | `src/modules/{catalog,releases,detection,summaries,dashboard,plans}` con `domain/` (TS puro), `server/` (`server-only`), `ui/`; import tra moduli solo da `index.ts`, controllati da ESLint. | [0006](./adr/0006-moduli-di-dominio.md) |
| Tipi | Derivati dagli schemi Zod (`z.infer`); nessuna cartella `types/` parallela. | 0006 |
| TanStack Query | Solo per Dashboard e Seguire (aggiornamenti ottimistici). Le pagine pubbliche sono Server Components. | — |
| Zustand | Non installato finché non serve uno stato client globale che l'URL non può rappresentare. | 0006 |
| RLS | Catalogo, Release e Sintesi in sola lettura per `anon`; scrive solo il server con la service role. Tecnologie seguite: `user_id = auth.uid()`. | — |
| shadcn/ui | Solo primitivi accessibili (Dialog, Tooltip, menu), copiati nel progetto e sempre ristilizzati sui token di `DESIGN.md`. Mai l'aspetto di default: niente card, badge, ombre o raggi standard. I componenti del sistema (Follow Toggle, righe, note, verdetti) sono su misura. | — |
| Strumenti | pnpm; Vitest per i test unitari e di integrazione, Playwright per gli end-to-end; CI su GitHub Actions; migrazioni con Supabase CLI e Postgres locale; ultime versioni stabili al setup, fissate nel lockfile. | — |
| Qualità | Niente `any` né cast non validati; file sotto ~200 righe; commenti solo per decisioni non ovvie; WCAG (contrasto, `aria-*`, focus visibile, tastiera); dark mode di default. | — |

## Operatività Anthropic

- Credito prepagato: carica iniziale ~$20–25, ricarica automatica se disponibile, limite di spesa
  mensile.
- API key dedicata al progetto, in un workspace separato.

## Test

- Unitari sui `domain/`, in particolare le Strategie di classificazione su Versioni reali.
- Integrazione della presa in carico atomica su Postgres locale di Supabase.
- End-to-end con Playwright per Seguire e Dashboard.
- Set di valutazione di 10–15 Release reali per le Sintesi, da rilanciare a ogni cambio di prompt o
  modello.

## Ordine di sviluppo

0. **Fondamenta**: repository, Next.js strict, ESLint con confini dei moduli, env Zod, migrazioni
   Supabase, CI, deploy.
1. **Catalogo → Release visibili**: 3 Tecnologie, Importazione iniziale, classificazione, pagina
   pubblica senza Sintesi.
2. **Sintesi**: coda, Batch API, validazione, stati, pagine pubbliche con Sintesi.
3. **Rilevamento giornaliero**: cron protetto, esclusioni, Anteprime.
4. **Sviluppatore e Dashboard**: login GitHub, Seguire con limite, sezioni della Dashboard.
5. **Rifinitura per il lancio**: ~40 Tecnologie, accessibilità, SEO, landing page.

## Fuori dall'MVP

CSS/W3C · Richieste di tecnologia · Notifiche email/Slack · scanner di `package.json` ·
pagamenti · piano Team · stato "Visto" · traduzioni delle Sintesi · pannello di amministrazione ·
scraping dei blog.

## Aperto

- Nome del progetto.
- **Design**: da definire prima di PRD e issue.
