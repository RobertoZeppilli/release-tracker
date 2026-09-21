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

## Ultima sessione (2026-09-21): #2 Fondamenta

- Implementata sul branch `issue-2-fondamenta`: scaffold Next.js, token `DESIGN.md` in `src/app/globals.css`
  (palette, raggi e ombre di Tailwind azzerati), env Zod in `src/env/` (validata da `next.config.ts`),
  moduli in `src/modules/`, regole ESLint con test in `eslint/`, shadcn (`components.json`, nessun
  componente), tema chiaro/scuro con `ThemeToggle`, pagina dei token in `/`, CI `.github/workflows/ci.yml`.
- Lint, typecheck, test (17) e build verdi in locale; temi verificati nel browser.
- **Se il branch non è ancora su GitHub**: commit, push e PR (che chiude #2) attendono la conferma
  dell'utente; poi verificare la CI verde sulla PR.

## Da fare

1. Dopo il merge della #2, **#3 (Supabase locale)**, poi seguire le dipendenze. Una issue per volta, su un branch dedicato,
   PR che chiude la issue.
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
