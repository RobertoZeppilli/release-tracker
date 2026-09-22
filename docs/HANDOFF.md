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
- Fatte: #2–#10 (#10 nella PR #37). Sbloccate: **#15** (cron giornaliero, consigliata: mette in moto
  Rilevamento e Sintesi), #11 (credito esaurito), #12 (puntatori alle righe), #13 (rivalidazione),
  #16 (login, sblocca #17 con la #9), #25, #36. Vedi i "Blocked by" (`gh issue view N`).
- Avviso per credito API esaurito = issue GitHub aperta dal job, una sola alla volta (`docs/DECISIONI.md`).
- Differenze note tra mock da uniformare: raccolte nella #23.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Ultima sessione (2026-09-22): #10 Pipeline delle Sintesi con un fake della Batch API

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
- Scelta da rivedere nella #11: una richiesta del batch in errore o scaduta va subito a `failed`, senza rinvio.

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

## Da fare: #15 Cron giornaliero di Rilevamento e Sintesi

`gh issue view 15`. Il Rilevamento vero (Fonti `detection`, idempotente, `significanceOverride` rispettata,
Anteprime) più la pianificazione su Vercel delle due fasi della Sintesi, che esistono già. `CRON_SECRET` va
impostato su Vercel. Alternative sbloccate: #11, #12, #13, #16, #25, #36.

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per la #14 (adattatore reale della Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
