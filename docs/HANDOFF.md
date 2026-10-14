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
`DESIGN.md` e i mock in `design/mocks/`.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue sono sospese per scelta dell'utente** (2026-10-06): non proporne una come lavoro
seguente finché non lo rilancia lui.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.

## Stato

**Da dove ripartire (2026-10-14): le due pagine sono in codice e misurate; tocca agli E2E, poi al
"dopo" del peso.** Branch **`142-technology-release`**, albero pulito e **tre commit in coda**:
`28bc49e` (mock e DESIGN.md), `a954300` (Technology) e **`f6749b9` (Release)**. ⚠️ **Il ramo non ha
un upstream suo**: traccia `origin/main`, quindi il push è `git push -u origin 142-technology-release`,
non un `git push` secco. `pnpm lint`, `pnpm typecheck` e `pnpm test` (612) passano. **Gli E2E non
sono stati toccati né girati, e si romperanno in blocco**, su tutte e due le pagine: il verdetto di
Technology è un `<p id="path-verdict">` e non più un `<h2>`, i titoli di gruppo sono `h3`, la Stat
Row non è più una lista, e sulla Release i key point ora vengono **dopo** le breaking change, la loro
`ul` è `aria-labelledby="key-points"` invece che `aria-label`, e sopra ognuna delle due sezioni c'è
un `h2` che prima non esisteva.

### Release in codice: il pannello dei conteggi e il lavoro per primo

1. **Counts Panel** (1px `rule` su `raised`, 6px, 8/12px, Mono 14): i due conteggi escono dalla riga
   del verdetto, che così torna alla scala piena del token. Misurato **312px**, il numero che
   `DESIGN.md` dichiara. Nel settimo stato segue il paragrafo che ritira il verdetto, non la riga.
2. **L'ordine si inverte**: prima le breaking change, poi i key point. Primo breaking change a
   **508px** contro gli 811 della pagina vecchia.
3. **`SectionTitle`** nuovo in `summaries/ui`: niente conteggio nel titolo (lo stampa il pannello),
   regola fino all'aside, e a telefono la regola sparisce e l'aside prende una riga sua. L'aside dice
   `all cited, each with a fix` **solo dove ogni breaking change ha davvero una citazione**: lo
   schema richiede la `migration`, mai la `quote`.
4. **Il bordo unico**: via il `max-w-[900px]` dai pozzi e il cap dalla lista dei key point, così
   regole, pozzi e Source View arrivano a 1192 e la prosa resta a 72ch.
5. **Misurato su 17 larghezze da 320 a 1680**: overflow orizzontale **0 ovunque**, padding 16px fino
   a 640 **incluso** e 24px da 641, verdetto su una riga da 640 in su, documento 1427px a 1240.

### ⚠️ Il budget delle caret row era sbagliato in due modi

`floor((col - 70.5) / 9) - 1` su `min(1192, 100vw - 48)`: mancava **il padding di 1.5ch del gutter**
e il cap era ancora **900**. I passi diventano 57/71/85/99/123 e il gradino 1240 è nuovo. La verifica
che dice che è la formula giusta: invertita, ridà esattamente i `data-fits` del mock (920, 866, 848).
Secondo errore, lo stesso pixel di Technology: le classi erano `max-[899px]`, cioè **disegnavano il
caret a 899px dentro una colonna misurata per 900**. ⚠️ **Il codice commuta sui cinque passi, il mock
sulla larghezza della singola citazione**, perché Tailwind non compila una media query nota solo al
render: una citazione da 82 caratteri perde il caret a 900 invece che a 866. Anticipato, mai in
ritardo. La mappa delle classi sta ora in un posto solo, `summaries/ui/caret-classes.ts`, condivisa
con la landing.

### Cosa resta

1. **Gli E2E**, poi il "dopo" del peso (`pnpm page:weight` su `next start`, procedura e tabelle in
   `docs/handoff/PESO.md`). ⚠️ La regola che ne esce: **`Script KB` non deve salire**.
2. ⚠️ **`DESIGN.md` era indietro sul mock in altri tre punti**, ora riscritti: il budget diceva 58 e
   72 dove sono 57 e 71, il Counts Panel diceva 24px dove il mock ne mette 16, e Section Title
   mostrava ancora `breaking changes (4)` contro la regola del pannello che vieta il numero ripetuto.
   **È la seconda sessione di fila che lo trova indietro**: va riletto col sospetto, non citato.
3. **Il mock disegna due righe che il modello non produce**, la spiegazione di cosa cambia e il fix
   diff: lo schema dà solo `change` e `migration`, quindi non sono state scritte. Sarebbero dominio
   nuovo, da fissare prima in `CONTEXT.md`.
4. ⚠️ **Le conversioni `max-[]` del resto dell'app non sono decise**: 43 `max-[640px]`, 19
   `max-[1040px]`, 7 `max-[880px]` tra Dashboard, `/technologies`, landing e barra. I file di
   Technology e di Release sono convertiti. ⚠️ **La barra usa ancora `sm:px-5`**, quindi a 640px
   esatti ha 24px di padding dove la pagina Release ne ha 16: un pixel di disallineamento, l'unico
   posto dove le due conversioni si incontrano.
5. ⚠️ **Il giro intero degli E2E non è mai stato verde in una corsa sola**: va rifatto sulla stessa
   build di produzione prima di dire che la suite è verde.
6. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa e la pagina
   Technology chiama entrambe. Si uniscono quando conviene, non subito.
7. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo lavoro
   tocca Anthropic. **Le cose dell'utente** stanno in `APERTE.md`; **come si misura una pagina** in
   `AMBIENTE.md` e in `PESO.md`. ⚠️ Per misurare la Release serve una Sintesi `ready`: l'`update` e
   il `restore` sono in `PESO.md` e **il database locale è stato rimesso come era**. In `pnpm dev`
   basta l'`update`, la build nuova serve solo a `next start`. ⚠️ Uno script fuori dal progetto non
   risolve i pacchetti: Playwright si importa col `file:///` dentro
   `node_modules/.pnpm/playwright@1.63.0/`. **Docker e il dev server sulla 3000 erano attivi** a fine
   sessione. Tema chiaro non ancora guardato né su Technology né su Release.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md e partiamo con gli E2E delle due pagine`.
