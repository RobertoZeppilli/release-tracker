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
- Fatte: #2–#9 (#9 nella PR #35, verificata in produzione: React e TypeScript importati). Sbloccate: **#10**
  (Sintesi completa, consigliata: sblocca #15), #16 (login, sblocca #17 con la #9), #25, #36. Vedi i "Blocked by" (`gh issue view N`).
- Avviso per credito API esaurito = issue GitHub aperta dal job, una sola alla volta (`docs/DECISIONI.md`).
- Differenze note tra mock da uniformare: raccolte nella #23.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Ultima sessione (2026-09-22): #9 Strategie, Fonte CHANGELOG, React e TypeScript

- Regole nuove in `CONTEXT.md` (Strategia di classificazione, Anteprima): `semver`, `node` (major pari featured,
  dispari notable), `typescript` (la prima stabile di ogni x.y è featured: 5.9.2, non 5.9.0), `zerover` (0.y.0
  featured). Anteprima = solo `beta`/`rc` con al massimo un numero; build con hash o data escluse.
- `classify(version, strategy, observed)`: il terzo argomento sono le Versioni osservate dalle Fonti di rilevamento
  (serve a TypeScript). Chi chiama il Rilevamento (#11 e seguenti) deve passarle tutte.
- Fonte `notes` di tipo `changelog` (`repo`, `path`): `detection/domain/changelog.ts` (`extractChangelogSection`,
  `headingAnchor`), file letto da `raw.githubusercontent.com/<repo>/HEAD/<path>`, link con l'àncora GitHub.
  `githubRepo(sources)` in `catalog` per i link "View on GitHub".
- `RetiredNote` (catalog/ui) su pagina Tecnologia e Release; E2E `retired.spec.ts`; `seedTechnology(…, { retired })`.
- Aperte: #36 (tag GitHub delle Anteprime di TypeScript `v6.0-rc`, oggi `unavailable`); commento su #23 per la nota
  di ritiro sulla Release, che nel mock manca. Le Note GitHub di TypeScript sono quasi solo link al blog: da tenere
  presente nella #14.

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

## Da fare: #10 Sintesi completa

`gh issue view 10`, skill `claude-api` (Message Batches API, ADR 0007). Estende `SummaryVerdictSchema`
(oggi solo `{ actionRequired }`) e la fixture E2E che scrive `content`. Alternative già sbloccate: #16, #25, #36.

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per #10 e #14 (Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
