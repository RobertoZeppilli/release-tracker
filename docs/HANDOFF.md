# Handoff — release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Ancora nessun codice applicativo: solo documentazione e mock HTML statici.

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

## Da fare

1. Partire dalla **#2 (Fondamenta)**, poi seguire le dipendenze. Una issue per volta, su un branch dedicato,
   PR che chiude la issue.
2. Rispettare i criteri di accettazione dell'issue; fermarsi e chiedere sulle HITL.

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: oltre ~35% chiede handoff e nuova sessione.
- Commit, push, PR e issue solo dopo conferma.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per #10 e #14 (Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
