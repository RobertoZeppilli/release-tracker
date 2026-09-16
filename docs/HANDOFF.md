# Handoff — release-tracker: scelta delle Technologies da seguire

Parla con l'utente **in italiano**. Il progetto è in `C:\Users\rober\progetti\release-tracker` e non
contiene ancora codice applicativo: solo documentazione e mock HTML statici. Non è un repository git.

## Leggi prima di tutto (non ripetere il contenuto qui)

- `PRODUCT.md`, `CONTEXT.md` (glossario e **tabella dei nomi inglesi canonici**: `Catalog`, `follow`,
  `Plan` `free`…), `docs/DECISIONI.md`, `docs/adr/0001…0007` (in particolare 0002 Catalogo curato e
  0004 limite Free applicato dal database).
- `DESIGN.md` e `.impeccable/design.json`: sistema visivo **"Compiler Diagnostic"**, ora esteso con la
  Dashboard (Stack Status Row, Help Pointer Link `-->`, Follow Toggle con `aria-pressed`, quota
  `N of 10 followed`, stato vuoto della Dashboard).
- Mock approvati (esito **ship** della revisione impeccable), da tenere coerenti:
  - `design/mocks/release.html`, `design/mocks/technology.html`;
  - `design/mocks/dashboard.html` (nuovo): verdetto di pagina, Spotlight una riga per Tecnologia
    seguita, Latest, Previews, Weekly Digest chiuso per settimana ISO, stato vuoto con mini-picker del
    Catalogo (selettore "page state" in basso a destra, non fa parte del prodotto).
- Brief e contratti: `.impeccable/surfaces/design-mocks-{release,technology,dashboard}-html.md`.
- Screenshot: `.impeccable/review/`, `.impeccable/review/technology/`, `.impeccable/review/dashboard/`.
- Script Playwright: `.impeccable/shoot-dash.mjs`, `.impeccable/shoot-evidence.mjs`,
  `.impeccable/shoot-tech.mjs`, `.impeccable/find-overflow.mjs` (trova elementi che sforano la
  larghezza). Playwright da `C:/Users/rober/progetti/test-roberto-zep/node_modules/playwright`.
  Uno screenshot a volte fallisce con "Unable to capture screenshot": basta rilanciare.

## Stato

- Dashboard fatta e documentata. Seed `4fd8ec7e` salvato in `.impeccable/seed-dashboard.txt`.
- Decisioni dell'utente sulla Dashboard: finestra fissa di 30 giorni con data su ogni riga; segno
  `this week` = **settimana ISO corrente (UTC)**, confermato; verdetto di pagina; stato vuoto con
  scelta inline dal Catalogo.
- Allineate nei tre mock le differenze del vecchio handoff: breakpoint 640px (più 880px intermedio
  solo in `technology.html`), focus 3px, verdetti neutri `text-muted`, rombi SVG, link cyan con `-->`.
- Differenze note **non corrette** (segnalate dal documentatore, l'utente ne è informato):
  riga dei conteggi 15px in `release.html` e 14px in `dashboard.html`; segmento preview della barra
  in `technology.html` disegnato con `box-shadow` inset (il sistema dice niente ombre).

## Da fare, in ordine

1. **Scelta delle Technologies da seguire** (probabile `/technologies`, Mode: Operate), nuovo mock
   `design/mocks/technologies.html`:
   - Catalogo curato (~40 Tecnologie al lancio), Follow/Following, conteggio `N of 10 followed`;
   - limite Free di 10 **applicato lato server**: messaggio quando si raggiunge (e cosa succede
     all'11°: bottone disabilitato? errore dal server dopo l'aggiornamento ottimistico?);
   - Tecnologie ritirate (restano seguite e segnalate, non si possono più seguire?);
   - la "Richiesta di tecnologia" è fuori dall'MVP: decidere se e come mostrare l'assenza di una voce.
   Riusa il Follow Toggle e le righe del mini-picker della Dashboard. Possibili nuovi concetti di
   dominio (regole del limite, ritirate seguite) → valuta `grill-with-docs`.
2. Landing page (bassa priorità, fetta 5).
3. `to-prd` e `to-issues` a fette verticali, come in `docs/DECISIONI.md`.

## Flusso impeccable collaudato (nuova schermata nel sistema fissato)

1. `impeccable context --target <mock>` una volta; leggi `reference/new-work.md` e `craft-floor.md`.
2. 2–3 domande con AskUserQuestion, ognuna con opzione "(Recommended)" motivata.
3. `concept-seed --scope surface --mode operate`: salva l'output in `.impeccable/seed-<surface>.txt`.
   Ordina 5–7 strutture, presenta le tre indicate dal seed con `serve-question --start --payload`
   (card con `wireframe`, senza `followup`), apri l'URL con `Start-Process`, poi `--wait --key`.
   Dopo la scelta: `concept-seed --kind assigned --from <key> --scope surface --mode operate`.
4. `surface-brief write <mock> <body>` con i sei blocchi del contratto; build code-led.
5. Screenshot 1440 e 390 (più gli stati), controlla `scrollWidth`, `detect --json` una volta.
6. `impeccable-finish-reviewer` con pacchetto completo; correzioni in un blocco; verifica via
   SendMessage allo stesso revisore. Dagli **catture che mostrino ogni correzione** (dettagli aperti,
   focus, stati), altrimenti la segna "unresolved on the evidence".
7. `impeccable-documenter` per estendere `DESIGN.md` e `design.json`.

Errori già colti dal revisore: colore di gravità senza glifo ed etichetta (anche nei conteggi);
`<details>` aperti che contraddicono "folded"; testo di razionale di design nella UI; nomi in minuscolo
diversi dal resto; `nowrap` che causa overflow; cambi di breakpoint che rompono le larghezze
intermedie; valori fuori da `DESIGN.md`.

## Preferenze dell'utente

- Vuole consigli motivati; approva spesso le raccomandazioni. Dati facili da capire.
- Contenuti dei mock di esempio e segnati come tali (date fittizie attorno al 2024-12-06).
- Attento al contesto: oltre ~35% chiede handoff e nuova sessione.
- Domini in italiano nei documenti; UI e codice in inglese.

## Skill suggerite

- `impeccable`: design della pagina di scelta delle Technologies (seguendo il flusso sopra).
- `grill-with-docs`: se emergono regole nuove sul limite Free o sulle Tecnologie ritirate seguite,
  da fissare in `CONTEXT.md` o in un ADR.
- `to-prd`, poi `to-issues`: dopo il design.
- `claude-api`: solo se PRD/issue toccano Sintesi e Batch API.
