# Handoff — release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.

## Leggi prima di tutto (non ripetere il contenuto qui)

- **PRD: issue #1** (user story, moduli, criteri di accettazione per fetta, test, fuori scope).
- `PRODUCT.md`, `CONTEXT.md` (glossario + nomi inglesi canonici), `docs/DECISIONI.md`, `docs/adr/0001…0007`.
- `DESIGN.md` e i mock approvati in `design/mocks/` (`release.html`, `technology.html`, `dashboard.html`,
  `technologies.html`; stati col selettore "page state", `technologies.html?state=…`).

## Stato

- PRD pubblicato (#1). Fette pubblicate come issue **#2–#26**, con Parent #1 e "Blocked by" reali.
  - Label `ready-for-agent` = AFK; `ready-for-human` = HITL: #4 deploy, #14 Anthropic reale + set di
    valutazione, #22 Catalogo ~40 Tecnologie, #26 landing page (serve il nome del prodotto).
- Fatte: #2–#12 (la #12 è sul branch, non ancora in PR). Sbloccate: #13
  (rivalidazione), #15 (cron giornaliero), #16 (login, sblocca #17 con la #9), #25, #36.
  Attenzione: il numero dell'issue è sfalsato di uno rispetto al numero della fetta nel titolo
  (issue #12 = fetta "11."). Vedi i "Blocked by" (`gh issue view N`).
- Credito API esaurito: **nessun avviso nostro**, se ne occupa la Console di Anthropic (decisione
  rivista nella #11, in `docs/DECISIONI.md` e ADR 0007).
- Differenze note tra mock da uniformare: raccolte nella #23.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Sessione del 2026-09-22 (2): #11 Credito API esaurito

- Un credito esaurito non è un fallimento: le Release tornano `pending` e la prima esecuzione dopo la
  ricarica le riprende. Prima finivano a `failed`, che è definitivo.
- Il caso attraversa la porta **tipizzato**, mai come testo di un errore: `CreditExhaustedError` da
  `submit`, variante `credit_exhausted` di `SummaryResult` da `collect`. Riconoscere la risposta vera di
  Anthropic è dell'adattatore della #14. `SubmitReport` e `CollectReport` hanno ora `pending: string[]`.
- Il job risponde 200 col report, non solleva: un cron che strilla ogni giorno finché non ricarichi è rumore.
  `errored`, `expired` e `canceled` restano `failed` senza rinvio.
- **Scopo ridotto rispetto al testo originale della #11**: tolta l'issue GitHub di avviso (un modulo, un
  token e due variabili per duplicare le email di credito basso di Anthropic). Se servirà un canale di
  avviso, va deciso una volta per tutti gli avvisi insieme alle Notifiche.
- Niente migrazioni, niente variabili d'ambiente nuove, nessun contatore dei tentativi (non c'è riprova
  con backoff nell'MVP).

## Sessione del 2026-09-22 (1): #10 Pipeline delle Sintesi con un fake della Batch API

- Dominio `summaries`: `SummaryContentSchema` (titolo ≤ 120, 3–5 punti chiave, breaking changes con migrazione),
  `parseSummaryOutput`, `prepareSummaryRequest` (prompt `v1`, modello `claude-opus-5`, soglia di 80.000 caratteri:
  oltre → `failed`, mai troncare) e la porta `SummaryBatches` (`submit` → batch id, `collect` → `null` se in corso).
- Regola nuova in `CONTEXT.md`: **Intervento richiesto = sì esattamente con almeno una breaking change**, e ogni
  breaking change dice come migrare; un output che rompe il legame è `failed`.
- Database: `summaries.batch_id` e `claim_pending_summaries(max_count)` (unico `UPDATE … RETURNING` con
  `skip locked`, solo service role). Server: `submitPendingSummaries` (se l'invio fallisce si torna a `pending`)
  e `collectSummaryBatches` (validazione, `ready`/`failed` col motivo, modello e versione del prompt salvati).
- Endpoint `GET /api/jobs/summaries/{submit,collect}` con `Authorization: Bearer <CRON_SECRET>` (`CRON_SECRET`
  opzionale nello schema env, vuoto = assente). `createSummaryBatches()` restituisce `null`: **503 finché la #14**
  non collega Anthropic. Il fake della Batch API sta in `tests/integration/fake-summary-batches.ts`.
- Pagina della Release: `SummaryView` (verdetto con conteggio, titolo, punti chiave `note:`, `breaking[n]:` con
  `help:`, backtick resi come `<code>`); una Sintesi `ready` con contenuto non valido si legge come `failed`.
- Scelta confermata nella #11: una richiesta del batch in errore o scaduta va subito a `failed`, senza rinvio.

## Ambiente

- Docker Desktop (WSL2) installato per utente in `%LOCALAPPDATA%\Programs\DockerDesktop`, RAM di WSL
  limitata a 6 GB in `~/.wslconfig`. **`docker` non è nel PATH della shell di Claude**: prima di E2E, integrazione
  o `supabase status` eseguire `export PATH="$PATH:$LOCALAPPDATA/Programs/DockerDesktop/resources/bin"`
  (senza, le fixture E2E falliscono con "docker: command not found").
- **Dev server**: l'utente tiene aperto `pnpm dev` su http://localhost:3000. Usarlo per i check in Chrome e per
  gli E2E (Playwright lo riusa); non avviare un altro `pnpm dev`, fallirebbe.
  `.env.local` contiene i valori del Supabase locale; `pnpm catalog:sync` in locale dopo `set -a; . ./.env.local`.
- Python su Windows: scrivere i file con `encoding='utf-8'` (il default cp1252 ha troncato un file).
- `pnpm-workspace.yaml`: `esbuild: false` in `allowBuilds` (il binario arriva dalle dipendenze opzionali).

## Sessione del 2026-09-23: #12 Puntatori alle righe (fetta chiusa)

**Lavoro non committato sul branch `12-puntatori-righe-note`** (creato tardi: la metà dati era stata
scritta per sbaglio su `main` e poi spostata lì). Tutto verde: 241 unitari, 30 di integrazione,
25 E2E, `typecheck`, `lint` e `build` puliti.

### Scelta di fondo: la Sintesi cita, noi calcoliamo

I numeri di riga **non** si chiedono al modello, che li conta male e sbaglia in modo invisibile. La
Sintesi restituisce una citazione **verbatim** delle Note e le righe si derivano cercandola nel testo
salvato. Una citazione che non si trova esatta è inventata: niente puntatore. Così il criterio
"riferimento fuori intervallo" e la regola "Nessuna invenzione" sono la stessa regola, e l'offset del
caret arriva gratis.

### Com'è fatto

- `summaries/domain/citations.ts`: `locateCitation(notes, quote)` → `{ fromLine, toLine, column,
  length }` o `null`, e `citationSpans(lines, citation)` → lo stratto `[start, end)` per ogni riga
  citata (una citazione su più righe porta un a capo per interruzione, contato lì). Righe 1-based come
  i numeri mostrati, `column` e gli offset 0-based.
- `SummaryContentSchema`: `quote` opzionale su punti chiave e breaking change; **i punti chiave sono
  `{ text, quote? }`**, non più stringhe. `PROMPT_VERSION` a **`v2`** (il prompt chiede la citazione e
  vieta di accorciarla). Nessuna migrazione: in produzione non esiste nessuna Sintesi (#14).
- `summaries/ui/citation-context.tsx`: `CitationProvider` client con `{ citation, severity, nonce }`.
  Il **nonce** serve a ridisegnare il caret quando si riclicca lo stesso puntatore. Il provider sta
  nella pagina della Release perché i puntatori (modulo `summaries`) e le Note (modulo `releases`)
  sono in moduli diversi; `releases` importava già da `@/modules/summaries`, la direzione è quella.
- `cite-pointer.tsx`: `release-notes:8` o `8-9`, `href="#L<n>"` vero (un indirizzo copiato funziona),
  `preventDefault` + `history.replaceState` per l'ancora nell'URL. `breaking-change-item.tsx` estratto
  da `summary-view.tsx` con le righe `-->`, quote e caret; `glyph.tsx` condiviso.
- `ReleaseNotesSource` è ora **client** e prende `lines: string[]`, non più `body`: la pagina chiama
  `noteLines` una volta sola, così le citazioni si cercano esattamente nel testo che viene mostrato.
  Apre il `<details>`, centra la riga e le sposta il focus (`tabIndex={-1}` su ogni riga); stesso
  effetto all'arrivo con un `#L<n>` nell'hash.
- `.cited-span` e `@keyframes caret` in `globals.css` (l'unico momento di movimento, `animation: none`
  sotto `prefers-reduced-motion`). Sotto i 640px la riga dei caret sparisce e lo stratto citato prende
  una sottolineatura coral dentro la quote row, come in `DESIGN.md`.
- Gutter con `font-variant-ligatures: none`, altrimenti Fragment Mono rende `-->` come `⟶`.
- E2E `tests/e2e/citations.spec.ts`: clic, tastiera, citazione inventata senza puntatore, ancora
  diretta. Le fixture E2E sono state adeguate alla nuova forma dei punti chiave.

Verificato in Chrome contro `design/mocks/release.html`, desktop e 390px: combacia.

### Resta da fare sulla fetta

Commit, PR che chiude la #12. Poi: #13 (rivalidazione), #15 (cron giornaliero), #16 (login), #25, #36.

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per la #14 (adattatore reale della Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
