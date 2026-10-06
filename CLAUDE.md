# release-tracker

SaaS che traccia le Release delle Tecnologie di un Catalogo curato e ne genera Sintesi con l'AI.
Parla con l'utente **in italiano**.

## Leggi prima

1. `docs/HANDOFF.md`: stato attuale e da dove ripartire. Il diario delle sessioni passate sta in
   `docs/handoff/<anno>-<mese>.md`, **da non leggere per intero**: l'indice è dentro `HANDOFF.md`.
   ⚠️ Prima di dare qualcosa per non deciso, cerca lì: `grep -rn "<parola>" docs/handoff/`.
2. PRD: issue GitHub #1. Lavoro: issue #2 e seguenti (`gh issue list`, `gh issue view N`).
   - `ready-for-agent` = implementabile in autonomia; `ready-for-human` = fermati e chiedi.
   - Rispetta "Blocked by" e i criteri di accettazione dell'issue.
3. Quando servono: `CONTEXT.md` (glossario), `docs/DECISIONI.md`, `docs/adr/`, `DESIGN.md`,
   mock in `design/mocks/` (fonte per l'aspetto delle schermate).

## Regole

- **Lingua**: documenti e dominio in italiano; codice, database e UI in inglese, usando solo i nomi
  della tabella in `CONTEXT.md` (es. Rilevanza = `Significance`, mai `priority`).
- **Moduli** (ADR 0006): `src/modules/<modulo>/{domain,server,ui}`, import tra moduli solo dall'indice;
  `domain` è TypeScript puro e testato.
- **Tipi** dagli schemi Zod; niente `any` né cast non validati; file sotto ~200 righe; commenti solo per
  decisioni non ovvie.
- **shadcn/ui**: solo primitivi, sempre ristilizzati sui token di `DESIGN.md`; mai card, badge, ombre o
  raggi di default.
- **Nessuna chiamata esterna dal client** (GitHub, npm, Anthropic solo dai job server).
- **Accessibilità** WCAG 2.2 AA; dark mode di default.
- Rispetta "Fuori dall'MVP" in `docs/DECISIONI.md`. Una regola di dominio nuova va fissata in
  `CONTEXT.md` o in un ADR prima di codificarla.

## Flusso

- Un branch per issue, PR che chiude l'issue: nel corpo della PR scrivi `Closes #N` **in inglese**
  (GitHub ignora "Chiude #N" e l'issue resta aperta); il resto della descrizione in italiano.
- Commit, push, PR e creazione di issue **solo dopo conferma dell'utente**.
- Dai consigli con una raccomandazione motivata.
- Se il contesto supera ~30%, proponi di aggiornare `docs/HANDOFF.md` e aprire una nuova sessione.

## Comandi

- `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test` (Vitest, unitari).
- Database (serve Docker Desktop attivo): `pnpm db:start` · `pnpm db:reset` · `pnpm db:stop`;
  nuova migrazione con `pnpm exec supabase migration new <nome>`.
- `pnpm test:integration` (Vitest su Supabase locale) · `pnpm test:e2e` (Playwright).
- Variabili d'ambiente: copia `.env.example` in `.env.local`; lo schema Zod è in `src/env/`.
- Next.js 16: leggi `AGENTS.md` e le guide in `node_modules/next/dist/docs/` prima di usare API di Next.
