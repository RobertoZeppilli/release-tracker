# Handoff, release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.
Produzione: **https://release-tracker-drab.vercel.app**.

## Questo file sta sotto le 100 righe, per scelta dell'utente (2026-10-10)

Qui c'è **solo lo stato vivo**. Il resto è stato spostato parola per parola, non riassunto, in quattro
file che si aprono **solo quando servono**: `docs/handoff/INDICE.md` (l'indice delle sessioni, col
diario in `docs/handoff/<anno>-<mese>.md`, **da non leggere per intero**), `docs/handoff/APERTE.md`
(strade aperte, lo stage non deciso, code e debiti, contesto della #14) e `docs/handoff/AMBIENTE.md`
(Docker e il PATH, il dev server unico sulla 3000, le due shell, i token, preferenze e skill).
Il peso delle pagine misurato prima del codice, con la procedura per il "dopo", sta in
`docs/handoff/PESO.md`.
Altrove: **PRD issue #1**, `PRODUCT.md`, `CONTEXT.md`, `docs/DECISIONI.md`, `docs/adr/0001…0007`,
`DESIGN.md` e i mock in `design/mocks/`, **ADR 0008** per le cinque lingue.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue erano sospese e l'utente le ha rilanciate il 2026-10-15** chiedendo la #131: la
sospensione è finita, ma vale sempre la regola di chiedere prima di passare a una issue nuova.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.

## Stato

**Da dove ripartire (2026-10-16, settimo giro): la PR 3a è su `main` e la PR #163 è aperta, in
attesa della CI.** `main` ha la **PR 1** (ADR 0008), la **PR 2** (`app/[locale]`, il proxy, i
canonici) e la **PR 3a** (il motore del dizionario e il guscio, senza i 92 file di UI, merge in
`c297ccb`). La **PR #163** (ramo `131-settings-e-piede`) porta la pagina `/settings` e il piede
rifatto, che non erano in programma: li ha chiesti l'utente in questa sessione.

⚠️ **Il primo controllo della sessione nuova è la CI della #163**: `gh pr checks 163`. In locale il
giro completo è verde, compresa la suite E2E **contro il build**: 251 passati, coi due flaky noti
(`a11y` technologies refused, `technology:126`) rientrati al retry.

**Quello che resta della #131**: la **PR 3b** (dizionario italiano, ed estrazione modulo per modulo:
landing, dashboard, catalogo, release) e la **PR 4** (francese, spagnolo, tedesco più l'overflow a
320px in tedesco). ⚠️ L'utente ha detto di **aprire una sessione nuova per la 3b**.

### Quello che questa sessione ha deciso, e non è derivabile dal codice

1. **La lingua esce dal pannello, e nasce `/settings`** (deciso dall'utente il 2026-10-16). Il menu
   profilo porta `account`, `settings`, `sign out`; la scelta della lingua sta nella pagina. La
   ragione è che **il pannello non può crescere di una riga per preferenza**, mentre una pagina sì:
   la prossima impostazione si aggiunge lì. `/settings` è protetta come `/account` e un visitatore
   non ci perde niente, perché il piede gli dà la lingua su ogni pagina pubblica. ADR 0008 ha il
   capoverso di correzione datato; la riga vecchia diceva "nel menu profilo".
2. ⚠️ **È caduto il debito della colonna sticky**, quello che l'handoff del sesto giro segnalava:
   ora è limitata da `min(100%, …)`, cioè dalla sua area di griglia oltre che dalla finestra. In
   fondo a un documento corto era alta una finestra mentre lo split sotto di lei non lo era.
   **Da qui in poi il piede può crescere senza che la Dashboard paghi**, e il legame invisibile fra
   i due non c'è più (resta misurato da `dashboard.spec.ts`, "the columns apart").
3. **Il piede è il marchio più tre colonne in frazioni** (`product`, `legal`, `language`), larghe
   quanto la pagina: le tracce fisse da 160px lo schiacciavano nel primo terzo a 1280. Sul telefono
   il marchio prende una riga sua e la lingua si sdraia in una riga che va a capo. Le due
   sotto-colonne della lingua non esistono più: erano il rimedio all'altezza, e l'altezza non è più
   un vincolo.
4. ⚠️ **In locale la suite E2E va fatta girare contro il build** (`CI=1 pnpm test:e2e`, col dev
   server spento), non contro il dev server. In dev l'overlay di Next aggiunge un **secondo
   `<footer>`** alla pagina e i due test del piede in `legal.spec.ts` cadono su strict mode, e una
   modifica ai file **durante** il giro fa fallire una ventina di test per ricompilazione. Nessuno
   dei due è una regressione.
5. ⚠️ **Il test `eslint/boundaries.test.ts` va in timeout** (40s) se la macchina sta facendo girare
   anche gli E2E: da solo passa, 10 su 10. Non è un fallimento vero.

**Verde in locale** al commit `8ee2333`: `lint`, `typecheck`, `build` (`/settings` è dinamica, ISR
intatto), **673 su 673** unitari, **251 E2E** contro il build. ⚠️ Il **dev server è acceso** sulla
3000 (riavviato alla fine della verifica). ⚠️ **Otto rami da cancellare** e lo stash `residuo del
checkout interrotto`, che sono dell'utente; a questi si aggiunge `131-ui-strings-en`, ormai mergiato.
⚠️ L'utente stava modificando `.github/workflows/ci.yml` da un'altra sessione: **non scartare quelle
modifiche**.

### Cosa resta

1. ⚠️ **`NEXT_PUBLIC_GITHUB_CLIENT_ID` è ancora da mettere su Vercel**, su tutti gli ambienti, **e
   poi rideploy**: le `NEXT_PUBLIC_` sono murate nel bundle al build.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina** e le **`max-[]`** non sono decise.
3. **Il mock disegna due righe che il modello non produce**; `groupByMajor` e `recordedHistory`
   calcolano quasi la stessa cosa.
4. ⚠️ **Credito basso: non spendere niente senza chiedere.** Le cose dell'utente in `APERTE.md`,
   l'ambiente in `AMBIENTE.md`, il peso in `PESO.md`.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
