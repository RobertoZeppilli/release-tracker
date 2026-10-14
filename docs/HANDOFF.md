# Handoff, release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.
Produzione: **https://release-tracker-drab.vercel.app**.

## Questo file sta sotto le 100 righe, per scelta dell'utente (2026-10-10)

Qui c'è **solo lo stato vivo**. Il resto è stato spostato parola per parola, non riassunto, in tre
file che si aprono **solo quando servono**: `docs/handoff/INDICE.md` (l'indice delle sessioni, col
diario in `docs/handoff/<anno>-<mese>.md`, **da non leggere per intero**), `docs/handoff/APERTE.md`
(strade aperte, lo stage non deciso, code e debiti, contesto della #14) e `docs/handoff/AMBIENTE.md`
(Docker e il PATH, il dev server unico sulla 3000, le due shell, i token, preferenze e skill).
Altrove: **PRD issue #1**, `PRODUCT.md`, `CONTEXT.md`, `docs/DECISIONI.md`, `docs/adr/0001…0007`,
`DESIGN.md` e i mock in `design/mocks/`.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue sono sospese per scelta dell'utente** (2026-10-06): non proporne una come lavoro
seguente finché non lo rilancia lui.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.

## Stato

**Da dove ripartire (2026-10-14, notte fonda): i mock sono chiusi e `DESIGN.md` è scritto; tocca
al codice, una schermata per volta.** Branch **`142-technology-release`**, da `main` a **`a928e87`**,
**niente committato e niente pushato**: cinque mock, `DESIGN.md`, `globals.css`, sei file di `src/` e
l'handoff. `pnpm lint`, `pnpm typecheck` e `pnpm test` (612 test) passavano prima di questa sessione,
che ha toccato solo mock e documenti; **gli E2E non sono stati girati**.

### Il mock A di Release approvato, e allargato a 1240 su richiesta dell'utente

1. **Una larghezza sola per tutta l'app, 1240px.** La colonna di `release.html` è `--col: 1192px` più
   i due padding. ⚠️ **`technology.html` era già a 1240**: lì non c'era niente da allargare.
2. ⚠️ **La prosa non prende la larghezza**: a 1192 una riga di Grotesk è ~149 caratteri, quindi
   `--measure: 72ch` è tornata e paragrafi, help e key points misurano **648px**, il titolo della
   Sintesi 864. Non è un secondo bordo: il bug dell'audit era che quattro elementi **strutturali**
   finivano in quattro punti diversi, e quello resta risolto (righe, pozzi, Source View a 1192).
   **Questa l'ho decisa io** e l'utente l'ha lasciata passare: è il posto dove tornare se non piace.
3. **I conteggi sono un mini-panel sotto il verdetto** (voluto dall'utente), 312px, trattamento
   panel, numeri senza inchiostro. Uscendo dalla riga del verdetto hanno ridato al verdetto la scala
   del token, `clamp(1.9rem, 5.2vw, 3.4rem)`: **lo scostamento della scala e quello della prosa sono
   chiusi**, e `DESIGN.md` ora descrive 1240 e il pannello dopo il paragrafo nel settimo stato.
4. **Misurato a 1240px**: overflow orizzontale **0 su 112** (16 larghezze x 7 stati), verdetto su una
   riga, 4 caret row, primo breaking change a **483px** (era 439 col mock stretto, 811 sulla pagina
   vecchia), documento 2076px. ⚠️ **Nel settimo stato il verdetto va a due righe sotto i 1046px** di
   viewport, dove la clamp scende: a 1040 col mock stretto non succedeva.

### `DESIGN.md`, dodici punti riscritti (Technology e Release insieme)

Contenitore 1240 ovunque con la ragione ("una regola senza casi non è una regola"), i due paragrafi
nuovi *Technology, the split* e *Release, the one structural edge*, i due responsive, la **Tally
sparita e diventata Counts Panel (Release)**, il corallo che non elenca più il conteggio, la
One-Line Verdict Rule misurata sul contenitore della pagina, il settimo stato, e il budget delle
caret row riscritto con la formula. ⚠️ **Le soglie del mock (920/866/848) non cambiano** salendo da
880 a 1192: un tetto più alto del bisogno della citazione non vincola mai.

### Cosa resta

1. **Il codice, una schermata per volta** (Technology, poi Release), e poi gli E2E.
2. ⚠️ **Il peso delle pagine prima e dopo** (criterio della #142, e misura di partenza che manca
   anche alla **#130**) va preso **sulla build di produzione e prima del codice nuovo**, o il
   "prima" non esiste più: fermare il dev server, `pnpm build` e `pnpm start` sulla 3000, misurare,
   riaccendere `pnpm dev`. **Va chiesto**: tocca il server acceso dall'utente.
3. ⚠️ **Il giro intero degli E2E non è mai stato verde in una corsa sola**: va rifatto sulla stessa
   build di produzione prima di dire che la suite è verde.
4. **Il mock B** (`release-aside.html`) **non si fa più**: l'utente ha approvato il mock A e ha
   chiesto il codice. La ragione per cui sarebbe stato scartato resta scritta nel diario.
5. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic. **Le tre cancellazioni dell'utente, la pagina di errore vista una volta
   sola in dev e il giro a mano finale** sono in `APERTE.md`, "Cose dell'utente"; **come si guardano
   e si misurano i mock** sta in `AMBIENTE.md`, con la trappola di Playwright (`viewport`, non
   `viewportSize`). ⚠️ **Playwright non si importa da uno script fuori dal progetto**: node risolve
   dalla cartella dello script, quindi l'import va fatto con il `file:///` dentro
   `node_modules/.pnpm/playwright@1.63.0/`. **Docker, il dev server sulla 3000 e il server statico
   dei mock sulla 4321 erano attivi** a fine sessione.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md e partiamo con il codice della pagina Technology`.
