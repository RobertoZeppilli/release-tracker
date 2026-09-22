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
- Fatte: #2, #3, #4. Prossima: #5 Catalogo → vedi "Blocked by" di ogni issue
  (`gh issue list`, `gh issue view N`).
- Decisione recente: avviso per credito API esaurito = issue GitHub aperta dal job, una sola alla volta
  (in `docs/DECISIONI.md`).
- Differenze note tra mock da uniformare: raccolte nella #23.

## Ultima sessione (2026-09-22)

- **#2 Fondamenta** (PR #27): token in `src/app/globals.css`, env Zod in `src/env/`, moduli in
  `src/modules/` con `index.ts` + `server/index.ts`, regole ESLint in `eslint/`, CI in `.github/workflows/ci.yml`.
- **#3 Supabase locale** (PR #28): migrazione `…_initial_schema.sql` (tabelle, enum, vincolo unico
  Tecnologia + Versione, RLS: lettura pubblica, scrittura solo service role con grant revocati, `follows`
  e `plans` del solo proprietario, trigger che crea il Piano `free`). Test di integrazione in
  `tests/integration/` (helper `seedContent`, `createDeveloper` in `supabase.ts`; URL e chiavi da
  `supabase status`), smoke Playwright in `tests/e2e/`. Il limite di 10 follow resta per #16/#18.
- **#4 Deploy** (PR #29): produzione su Vercel (Hobby, `fra1`) e Supabase remoto (Free, Frankfurt,
  "expose new tables" e "automatic RLS" spenti; anteprime e produzione condividono il database).
  - Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `src/env/index.ts`;
    `SUPABASE_SECRET_KEY` solo in `src/env/server.ts` (`server-only`); prefissi `sb_publishable_`/`sb_secret_`
    validati. Migrazione `service_role_grants` con grant espliciti. Passi manuali nel `README.md`.
  - Workflow `Migrations`: `supabase link` + `db push` su push a `main` che tocca `supabase/migrations/`.
    Primo run riuscito dopo aver dato al token Supabase **sola lettura su tutte le categorie del
    progetto** (`link` legge anche chiavi API e configurazioni; con solo Projects/Database fallisce).
  - Da confermare con l'utente: dominio di produzione online con i token di `DESIGN.md`.
- **Ambiente**: Docker Desktop (WSL2) installato per utente in `%LOCALAPPDATA%\Programs\DockerDesktop`,
  RAM di WSL limitata a 6 GB in `~/.wslconfig`. Se `docker` non è nel PATH della sessione, aggiungere
  `…/DockerDesktop/resources/bin`. `.env.local` contiene già i valori del Supabase locale.

## Da fare: #5 Catalogo come codice

Branch `issue-5-catalogo` da `main`. Leggere `gh issue view 5`, ADR 0005 e 0006, il modulo `catalog` nel
PRD #1, `design/mocks/technology.html` (solo intestazione). Usare la skill `tdd` per `planCatalogSync`.

- Decisione da proporre all'utente: **dove gira il sync "a ogni deploy"**. Raccomandazione: un job su
  GitHub Actions dopo `Migrations` su push a `main`, non nella build di Vercel: le anteprime delle PR
  condividono il database di produzione e un sync nella build scriverebbe il Catalogo di un branch.
- Probabile nuova migrazione: vincolo unico sulle Fonti (es. Tecnologia + ruolo + tipo) per poter
  aggiornare invece di duplicare; `technologies.slug` è già unico.
- Pagina `/technologies/[slug]`: Server Component con ISR, lettura con la publishable key (RLS pubblica),
  404 per slug sconosciuto; leggere prima le guide di Next 16 in `node_modules/next/dist/docs/`.
- Poi: seguire i "Blocked by"; fermarsi e chiedere sulle HITL (#14, #22, #26).

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per #10 e #14 (Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
