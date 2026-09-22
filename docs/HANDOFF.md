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
- Fatte: #2, #3, #4, #5, #6. Prossima: **#7** Pagina pubblica della Release senza Sintesi → poi vedi
  i "Blocked by" di ogni issue (`gh issue list`, `gh issue view N`).
- Avviso per credito API esaurito = issue GitHub aperta dal job, una sola alla volta (`docs/DECISIONI.md`).
- Differenze note tra mock da uniformare: raccolte nella #23.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Ultima sessione (2026-09-22): #6 Classificazione e Importazione iniziale di Vite

- **releases/domain** (TDD): `classify(version, strategy)` (SemVer: x.0.0 `featured`, x.y.0 `notable`,
  x.y.z `digest`, beta/rc `preview`, alpha/canary/nightly/altro suffisso o non-SemVer `excluded`; regola in
  `CONTEXT.md`), `selectInitialImport(releases, now)` → aggiunge `history`, `initialSummaryStatus`
  (`unavailable` senza Note prevale, poi `skipped` per Storico e `digest`, altrimenti `pending`; manca ancora
  "prima Anteprima di una major", serve al Rilevamento), `groupByMajor` (major decrescenti, ordine di
  Versione, `digest` consecutive ripiegate, Anteprime solo oltre l'ultima stabile), `version.ts` (parse e confronto SemVer).
- **releases/server** `listReleases(db, technologyId)` (applica `significance_override`); **releases/ui**
  `ReleaseList`, `SignificanceLabel` (SVG 12px neutri). `TechnologyHeader` ora riceve `latest`.
- **detection**: interfaccia `SourceAdapters` (`listVersions`, `findNotes`) in `domain`; adattatori reali in
  `server/source-adapters.ts` con `fetch` iniettato (npm: documento completo del pacchetto, nome scoped
  codificato; GitHub Releases: pagine da 100 finché trova tutti i tag via `tagFormat`, salta draft e body vuoti).
  `importTechnology(db, technology, adapters, now)` idempotente (upsert `ignoreDuplicates` su releases,
  release_notes, summaries); `technologiesAwaitingImport(db)` = Tecnologie attive senza Release.
  `catalog/server` esporta `listActiveTechnologies`.
- **Script** `pnpm catalog:sync`: sync, poi import delle Tecnologie in attesa (un errore non ferma le altre,
  exit code 1). `GITHUB_TOKEN` opzionale: nel workflow `Deploy database` è il token del job
  (`permissions: contents: read`); anche la CI lo passa, quindi l'E2E gira su dati reali di npm/GitHub.
- Vite reale in locale: 77 Release, 3 `pending` (8.0.0, 8.3.0, 8.2.0). In produzione l'import parte al
  primo deploy dopo il merge: **verificare** `/technologies/vite` e il log del job `catalog`.
- Differenze note col mock: niente "no action needed" nelle digest (nessuna Sintesi a sostenerlo), niente link
  alla Release (#7), niente riga dello Stato della sintesi.
- **ADR 0006 aggiornato**: `index.ts` di un modulo = solo domain; i componenti stanno in `ui/index.ts`
  (`@/modules/<m>/ui`, consentito da ESLint, vietato da `domain`). Motivo: la CI si è rotta perché lo script
  di sync (`tsx --conditions=react-server`) importava `@/modules/releases` e con esso `lucide-react`
  (`react.createContext is not a function`). Mai rimettere componenti nell'indice del dominio.
- Tailwind: `--spacing` è azzerato nel tema, quindi `pl-0` non esiste: usare `pl-[0]`; le chiavi nominate
  (`mb-3`, `size-3` = 12px) funzionano.
- Lezione: aprire un `<details>` via JS prima dell'idratazione causa un falso errore di hydration negli screenshot;
  cliccare dopo `networkidle`.

## Ambiente

- Docker Desktop (WSL2) installato per utente in `%LOCALAPPDATA%\Programs\DockerDesktop`, RAM di WSL
  limitata a 6 GB in `~/.wslconfig`. Se `docker` non è nel PATH, aggiungere `…/DockerDesktop/resources/bin`.
  `.env.local` contiene i valori del Supabase locale; `pnpm catalog:sync` in locale dopo `set -a; . ./.env.local`.
- Python su Windows: scrivere i file con `encoding='utf-8'` (il default cp1252 ha troncato un file).
- `pnpm-workspace.yaml`: `esbuild: false` in `allowBuilds` (il binario arriva dalle dipendenze opzionali).

## Da fare: #7 Pagina pubblica della Release senza Sintesi

Branch `issue-7-…` da `main`. Leggere `gh issue view 7` e `design/mocks/release.html` (stati `pending`,
`processing`, `unavailable`, `skipped`; `.impeccable/brief-release.md`). Rotta `/technologies/[slug]/[version]`
con ISR come la pagina della Tecnologia; 404 per Versione sconosciuta; Note come sorgente numerata ripiegata,
apribile da tastiera; E2E sui quattro stati con **dati di fixture** (non i dati reali di Vite).
Collegare le Versioni di `ReleaseList` (righe e digest) alla nuova pagina. Attenzione alle Versioni con `+`
nell'URL (codifica).

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per #10 e #14 (Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
