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
- Ordine: #2 Fondamenta → #3 Supabase locale → (#4 deploy, #5 Catalogo) → … vedi "Blocked by" di ogni issue
  (`gh issue list`, `gh issue view N`).
- Decisione recente: avviso per credito API esaurito = issue GitHub aperta dal job, una sola alla volta
  (in `docs/DECISIONI.md`).
- Differenze note tra mock da uniformare: raccolte nella #23.

## Ultima sessione (2026-09-22)

- **#2 Fondamenta**: mergiata (PR #27). Token in `src/app/globals.css`, env Zod in `src/env/`, moduli in
  `src/modules/` con `index.ts` + `server/index.ts`, regole ESLint in `eslint/`, CI in `.github/workflows/ci.yml`.
- **#3 Supabase locale**: implementata sul branch `issue-3-supabase-locale`, PR aperta (`gh pr list`).
  - Docker Desktop (WSL2) installato per l'utente in `%LOCALAPPDATA%\Programs\DockerDesktop`; RAM di WSL
    limitata a 6 GB in `~/.wslconfig`. Si resta su Supabase (valutate e scartate Neon e PGlite).
  - Migrazione `supabase/migrations/…_initial_schema.sql`: tabelle, enum, vincolo unico Tecnologia +
    Versione, RLS (lettura pubblica, scrittura solo service role con grant revocati; follow e `plans` del
    solo proprietario), trigger che crea il Piano `free` a ogni nuovo utente.
  - Test di integrazione in `tests/integration/` (URL e chiavi da `supabase status`, nessun env), smoke
    Playwright in `tests/e2e/`; progetti Vitest `unit` e `integration`; job CI `integration`.
  - Non incluso (fette successive): limite di 10 follow e divieto di seguire Tecnologie ritirate
    (#16/#18), variabili Supabase nello schema env dell'app.

## Da fare

1. Verificare la CI della PR della #3 e farla mergiare; poi la prossima issue sbloccata (#4 deploy è HITL,
   #5 Catalogo è AFK). Una issue per volta, branch dedicato, PR che chiude la issue.
2. Rispettare i criteri di accettazione dell'issue; fermarsi e chiedere sulle HITL.

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per #10 e #14 (Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
