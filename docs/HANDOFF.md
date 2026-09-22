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
- Fatte: #2, #3, #4, #5. Prossima: **#6** Classificazione e Importazione iniziale di Vite → poi vedi
  i "Blocked by" di ogni issue (`gh issue list`, `gh issue view N`).
- Avviso per credito API esaurito = issue GitHub aperta dal job, una sola alla volta (`docs/DECISIONI.md`).
- Differenze note tra mock da uniformare: raccolte nella #23.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Ultima sessione (2026-09-22): #5 Catalogo come codice (PR #30 e correzione #31)

- **Catalogo**: `catalog/<slug>.json` (slug = nome del file), schema Zod in
  `src/modules/catalog/domain/catalog-entry.ts`. Fonti come unione discriminata su `kind`: per ora
  `npm` (`detection`, `package`) e `github-releases` (`notes`, `repo`, `tagFormat` con `{version}`);
  #9 aggiunge `CHANGELOG.md`. Almeno una Fonte `detection`, al massimo una per ruolo + tipo.
  `ClassificationStrategySchema` è in `releases` e oggi vale solo `semver` (la #6 ci aggancia `classify`).
- `parseCatalog` raccoglie tutti gli errori con file e campo; `catalog/catalog.test.ts` valida i file reali in `pnpm test`.
- `planCatalogSync(entries, stored)` → `insert` · `update` (con `removedSourceIds`, riattiva una
  ritirata) · `retire`; nessun `delete`. Server: `syncCatalog(db, entries)`, `readCatalogDirectory()`,
  `getTechnology(db, slug)` (il client lo passa il chiamante: `catalog/server` non importa `@/env`).
- Migrazione `…_catalog_sync.sql`: unico `(technology_id, role, kind)` su `sources`;
  `release_notes.source_id` `on delete set null`. Regole nuove in `CONTEXT.md` (Fonte tolta = cancellata,
  Tecnologia che torna = riattivata) e `docs/DECISIONI.md` (dove gira il sync).
- **Deploy**: workflow `Deploy database` a ogni push su `main`: `db push`, poi `pnpm catalog:sync`
  (`tsx --conditions=react-server scripts/sync-catalog.mts`, solo `NEXT_PUBLIC_SUPABASE_URL` +
  `SUPABASE_SECRET_KEY`, dai secret GitHub `SUPABASE_URL`/`SUPABASE_SECRET_KEY`). Mai nella build Vercel.
- **CI**: `check` = lint, typecheck, unit. `integration` = Supabase locale, test di integrazione, sync del
  Catalogo con le sole due variabili del deploy, build, E2E Playwright.
- Test di integrazione in sequenza (`fileParallelism: false`, il sync legge tutte le Tecnologie);
  `server-only` ridiretto a `empty.js` nel progetto Vitest `integration`. Il test del sync ricorda e
  ripristina le Tecnologie attive di altri.
- **Pagina** `/technologies/[slug]`: `revalidate = 3600`, `generateStaticParams` → `[]` (la build non
  tocca il database), `SiteHeader` in `src/components/`, `TechnologyHeader` in `catalog/ui`. Mancano
  `latest <version>` (arriva con le Release) e Follow (#18); la nota "retired" c'è già (#9 la completa).
- Verificato in produzione: `/technologies/vite` 200 con intestazione, slug sconosciuto 404, cache Vercel MISS → HIT.
- Lezione: prima del merge verificare con `gh secret list` i secret che il workflow usa.

## Ambiente

- Docker Desktop (WSL2) installato per utente in `%LOCALAPPDATA%\Programs\DockerDesktop`, RAM di WSL
  limitata a 6 GB in `~/.wslconfig`. Se `docker` non è nel PATH, aggiungere `…/DockerDesktop/resources/bin`.
  `.env.local` contiene i valori del Supabase locale; `pnpm catalog:sync` in locale dopo `set -a; . ./.env.local`.
- Python su Windows: scrivere i file con `encoding='utf-8'` (il default cp1252 ha troncato un file).
- `pnpm-workspace.yaml`: `esbuild: false` in `allowBuilds` (il binario arriva dalle dipendenze opzionali).

## Da fare: #6 Classificazione e Importazione iniziale di Vite

Branch `issue-6-…` da `main`. Leggere `gh issue view 6`, ADR 0001 e 0003, i moduli `releases` e
`detection` nel PRD #1, `design/mocks/technology.html` (lista delle Release per major, diamanti di
Rilevanza neutri). Skill `tdd` per `classify`, Stato iniziale della Sintesi e `selectInitialImport`.

- Da proporre all'utente: **dove parte l'Importazione iniziale** "quando una Tecnologia entra nel
  Catalogo". Ipotesi: `syncCatalog` restituisce gli `insert` e lo script di sync avvia l'import per quei
  slug nello stesso job di `Deploy database` (chiamate a npm e GitHub solo dal job, mai dal client).
- Adattatori npm e GitHub Releases dietro un'interfaccia `Source`, con fake nei test di integrazione.
  Serve probabilmente un token GitHub per i limiti di rate.
- Idempotenza su Tecnologia + Versione (vincolo già presente); le Note si salvano così come sono.

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per #10 e #14 (Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
