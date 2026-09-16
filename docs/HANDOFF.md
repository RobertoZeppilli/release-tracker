# Handoff — release-tracker: PRD e issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, ora repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Nessun codice applicativo: solo documentazione e mock HTML statici.

## Leggi prima di tutto (non ripetere il contenuto qui)

- `PRODUCT.md`, `CONTEXT.md` (glossario + tabella dei nomi inglesi canonici), `docs/DECISIONI.md`
  (decisioni MVP, **ordine di sviluppo a fette 0–5**, "Fuori dall'MVP", "Aperto"), `docs/adr/0001…0007`.
- `DESIGN.md` e `.impeccable/design.json`: sistema visivo "Compiler Diagnostic", documentato per tutte
  le schermate.
- Mock approvati (esito **ship** della revisione), fonte per i criteri di accettazione UI:
  `design/mocks/release.html`, `technology.html`, `dashboard.html`, `technologies.html`. Gli stati si
  provano col selettore "page state" in basso a destra (non è prodotto); `technologies.html` accetta
  anche `?state=seven|full|rejected|retired|nomatch`.
- Brief per schermata con contratto di direzione: `.impeccable/surfaces/design-mocks-*-html.md`.

## Stato

- Design MVP chiuso per le quattro schermate dello Sviluppatore/Visitatore. Landing page non fatta
  (fetta 5, dipende dal nome del prodotto, ancora aperto).
- Decisioni di questa sessione, già scritte in `CONTEXT.md` (Seguire, Piano) e `docs/DECISIONI.md`
  (Esperienza utente): `/technologies` **solo con login**; al limite Free i Follow sono `aria-disabled`
  con nota, aggiornamento ottimistico con rollback ed errore di riga se il database rifiuta;
  Tecnologie ritirate seguite restano seguite, contano nei 10, non si riseguono dopo l'unfollow;
  Tecnologia assente dal Catalogo → solo una nota, nessun form.
- Differenze note tra mock, **non corrette** (da allineare in implementazione): righe picker 14ch
  senza link in `dashboard.html` vs 16ch con link in `technologies.html`; errore di riga 13px vs
  errore del form Upgrade Path 14px; riga conteggi 15px in `release.html` vs 14px in `dashboard.html`;
  segmento preview in `technology.html` con `box-shadow` inset.
- Stack completo in `docs/DECISIONI.md` (Architettura del codice), inclusi gli strumenti della fetta 0
  (pnpm, Vitest, Playwright, GitHub Actions, Supabase CLI) e la regola su shadcn/ui: solo primitivi,
  sempre ristilizzati sui token. Il PRD deve riportare questa regola.
- Pagine non disegnate ma banali col sistema esistente: login GitHub, 404, errore generico.

## Da fare, in ordine

1. **`to-prd`**: PRD dell'MVP pubblicato come issue su GitHub (repo sopra). Deve raccogliere, non
   rifare: rimanda a `docs/DECISIONI.md`, ADR e mock per i dettagli; aggiunge criteri di accettazione
   verificabili per fetta. Rispetta "Fuori dall'MVP". Termini del dominio dal glossario, nomi in
   codice/UI dalla tabella inglese.
2. **`to-issues`**: fette verticali nell'ordine di `docs/DECISIONI.md` (0 Fondamenta → 5 Rifinitura),
   ciascuna dimostrabile end-to-end; il limite Free applicato dal database e il rollback ottimistico
   stanno nella fetta 4. Landing page nella fetta 5.
3. Poi si parte con la fetta 0 (Fondamenta).

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: oltre ~35% chiede handoff e nuova sessione.
- Commit e azioni verso l'esterno (issue, push) solo dopo conferma.

## Skill suggerite

- `to-prd`, poi `to-issues` (scopo della prossima sessione).
- `grill-with-docs`: solo se durante il PRD emergono regole nuove da fissare in `CONTEXT.md` o ADR.
- `claude-api`: se PRD/issue toccano Sintesi e Message Batches API (ADR 0007).
- `impeccable`: solo per la landing page (fetta 5) o per le pagine login/404.
