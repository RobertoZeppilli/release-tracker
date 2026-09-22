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
- Fatte: #2, #3, #4, #5, #6, #7 (PR #33). Prossima: **#8** Cammino di upgrade con `?from=` → poi vedi
  i "Blocked by" di ogni issue (`gh issue list`, `gh issue view N`).
- Avviso per credito API esaurito = issue GitHub aperta dal job, una sola alla volta (`docs/DECISIONI.md`).
- Differenze note tra mock da uniformare: raccolte nella #23.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Ultima sessione (2026-09-22): #7 Pagina pubblica della Release senza Sintesi

- Rotta `src/app/technologies/[slug]/[version]/page.tsx` (ISR 1h, `generateStaticParams` vuoto, 404 per Versione
  o Tecnologia sconosciuta). **Next 16 passa il parametro ancora codificato**: `releasePath` codifica
  (`+` → `%2B`), `versionFromPath` decodifica e restituisce `null` su segmento malformato.
- **releases/domain** `release-page.ts`: `ReleaseDetail`, `releasePath`, `versionFromPath`, `noteLines`.
  **releases/server** `getRelease(db, technologyId, version)` (embed 1:1 di `release_notes` e `summaries`).
  **releases/ui**: `ReleaseHeader`, `OpenNotesLink` (client: apre il `<details>` prima dello scroll),
  `ReleaseNotesSource` (`<details id="release-notes">`, righe `#L1…` con contatore CSS), `SummaryStatusBlock`.
- Stati: `pending`/`processing` (date assolute, niente "today" per via della cache), `unavailable` (niente Note,
  pulsante "View on GitHub" verso i commit), `skipped` (testo diverso per digest e Storico), `failed`. `ready` non
  mostra ancora nulla: la Sintesi arriva con la #9.
- `ReleaseList` riceve `slug` e collega ogni Versione; `SiteHeader` accetta voci `{ label, href }`.
- **E2E con fixture**: `tests/e2e/fixtures.ts` crea una Tecnologia `e2e-…` col service role (chiavi da
  `supabase status`) e la cancella a fine file. Da riusare per le prossime pagine.
- Da sapere per #8/#9: le Note GitHub di Vite dicono solo "Please refer to CHANGELOG.md": una Sintesi su quel
  testo è inutile, serve la Fonte CHANGELOG.
- "technologies" nel percorso non è un link finché non esiste `/technologies` (#16).
- Verificare in produzione dopo il merge: `/technologies/vite/8.0.0` e un link da `/technologies/vite`.

## Ambiente

- Docker Desktop (WSL2) installato per utente in `%LOCALAPPDATA%\Programs\DockerDesktop`, RAM di WSL
  limitata a 6 GB in `~/.wslconfig`. Se `docker` non è nel PATH, aggiungere `…/DockerDesktop/resources/bin`.
  `.env.local` contiene i valori del Supabase locale; `pnpm catalog:sync` in locale dopo `set -a; . ./.env.local`.
- Python su Windows: scrivere i file con `encoding='utf-8'` (il default cp1252 ha troncato un file).
- `pnpm-workspace.yaml`: `esbuild: false` in `allowBuilds` (il binario arriva dalle dipendenze opzionali).

## Da fare: #8 Cammino di upgrade con `?from=`

Branch `issue-8-…` da `main`. Leggere `gh issue view 8` e i mock. Dominio `computeUpgradePath` con TDD
(skill `tdd`); E2E con le fixture di `tests/e2e/fixtures.ts`.

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per #10 e #14 (Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
