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
- Fatte: #2–#8 (#8 nella PR del branch `issue-8-upgrade-path`). Sbloccate: **#9** (consigliata: Fonte
  CHANGELOG, sblocca #15 e #17), #10, #16, #25. Vedi i "Blocked by" (`gh issue view N`).
- Avviso per credito API esaurito = issue GitHub aperta dal job, una sola alla volta (`docs/DECISIONI.md`).
- Differenze note tra mock da uniformare: raccolte nella #23.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Ultima sessione (2026-09-22): #8 Cammino di upgrade con `?from=`

- Regola nuova in `CONTEXT.md` (Cammino di upgrade): una `from` ben formata ma non registrata dà comunque il Cammino,
  con una nota e le Versioni registrate più vicine (lo Storico copre 12 mesi). Errore solo per `malformed`,
  `notOlder` (più recente dell'ultima stabile) o `noStable`. Accetta `v6.0.0` e spazi.
- **releases/domain** `upgrade-path.ts`: `computeUpgradePath`, `PathRelease` (`actionRequired: boolean | null`,
  null = niente Sintesi ready), `SummarizedRelease` (+ `summaryStatus`). Helper condivisi in `version.ts`:
  `sortByVersion`, `splitByMajor`; `foldDigests` esportato da `group-by-major.ts`.
- **summaries/domain** `SummaryVerdictSchema = { actionRequired: boolean }`: schema minimo, la #10 lo estende.
  `listReleases` legge `summaries(status, content)`; contenuto non valido conta come Sintesi mancante.
- **Pagina statica + isola client**: `UpgradePathView` (`"use client"`) legge `?from` con `useSearchParams` dentro
  `Suspense` e calcola il Cammino nel browser; la pagina resta ISR (●). Form con `next/form` (GET).
- UI: `release-rows.tsx` (righe condivise con `ReleaseList`), `upgrade-form`, `upgrade-verdict` (barre in un'unica
  griglia `subgrid`), `release-verdict`, `severity-label`; testi in `upgrade-path-copy.ts` (testato).
- Major in ordine dalla più vecchia (PRD), mentre il mock `technology.html` mette la v6 prima: da aggiungere alla #23.
  Righe del Cammino senza titolo né breaking changes: arrivano con la Sintesi completa (#10).
- Fixture E2E: `status: "ready"` con `actionRequired` scrive solo `{ actionRequired }` in `content`; aggiornarla
  quando la #10 completa lo schema.

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

## Da fare: #9 React e TypeScript, Strategie, Fonte CHANGELOG, Tecnologia ritirata

Dopo il merge della PR della #8: verificare in produzione `/technologies/vite?from=7.0.0`. Poi branch `issue-9-…`
da `main`, `gh issue view 9`, mock `technology.html?state=retired`. `classify` e l'estrazione dal CHANGELOG con TDD
(skill `tdd`).

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per #10 e #14 (Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
