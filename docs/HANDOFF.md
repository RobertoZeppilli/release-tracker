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

**Da dove ripartire (2026-10-14, pomeriggio): le due pagine sono finite, con gli E2E verdi e il peso
misurato prima e dopo; manca il tema chiaro, poi la PR.** Branch **`142-technology-release`**,
albero pulito e **sei commit in coda** su `origin/main`: `28bc49e` (mock e DESIGN.md), `a954300` (Technology), `f6749b9`
(Release), `9632c46` (handoff), `a4dfe9e` (il link del verdetto) e **`a8b9a52` (gli E2E)**.
⚠️ **Il ramo non ha un upstream suo**: traccia `origin/main`, quindi il push è
`git push -u origin 142-technology-release`, non un `git push` secco.
`pnpm lint`, `pnpm typecheck` e `pnpm test` (612) passano, e **gli E2E hanno fatto il giro intero
verde in una corsa sola: 195 su 195, axe compreso, nei due temi.**

⚠️ **Il come e il perché dei diciassette test riallineati** (e il link del verdetto che axe
bocciava) stanno in `docs/handoff/2026-10.md`, "Gli E2E delle due pagine (2026-10-14)", e nei
commit `a4dfe9e` e `a8b9a52`.

### Il peso, com'è andato (tabelle e dettaglio in `docs/handoff/PESO.md`)

1. **La pagina Release non è peggiorata**, ed era quella da cui si temeva il peggio: nel settimo
   stato il totale scende da 499.3 a **499.2 KB**, `Document` da 104.0 a 103.9, i nodi salgono di
   quattro (3412 → 3416) e la pagina si accorcia da 1454 a **1427px**, il numero che `DESIGN.md`
   dichiara per il mock a 1240. **La pagina Technology si accorcia di 437px** (1339 → 902).
2. ⚠️ **`Script KB` è salito di 1.2 KB su ogni rotta**, `/login` compresa, quindi la regola del
   "prima" è formalmente rotta. Causa trovata al byte: **un chunk solo**, 40.743 → 43.921 non
   compressi, +1345 sul filo identico su `/` e su `/login`. Dentro: **`BarLegend` e `ColumnTitle`
   entrati, `StatRows` uscito**, cioè la Stat Row diventata titolo di gruppo, che sta sotto
   `UpgradePathView` ed è `"use client"`.
3. ⚠️ **La scoperta vera**: `/login` scarica **14 KB compressi** di UI delle Release
   (`BreakingList`, `UpgradeForm`, `computeUpgradePath`, le icone). La UI delle Release viaggia su
   ogni pagina dell'app, **da prima di questo redesign**. L'1.2 KB è lo 0.4% e non è il problema; i
   14 KB sì. Separarli è un lavoro suo, di chunking e di import dai barrel: **non deciso**.
4. **Il "prima" è stato ripreso ricostruendo `28bc49e`**, non letto dalle tabelle: le Script KB sono
   tornate identiche, quindi la procedura è ripetibile. ⚠️ A `28bc49e` **`pnpm page:weight` non
   esiste ancora** (arriva con `a954300`): si esegue lo script del ramo sulla build vecchia.
   ⚠️ Il database locale è **rimesso come era** (`pending`, `content` nullo, zero Sintesi `ready`),
   e il dev server è di nuovo `pnpm dev` sulla 3000.

### Cosa resta

1. **Tema chiaro** non ancora guardato né su Technology né su Release. È l'ultima cosa prima della
   PR, che chiude la **#142** (`Closes #142` in inglese).
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina** (vedi sopra): lavoro suo, **non deciso**, e
   da pesare contro la regola delle Script KB prima di dire che la #142 è chiusa bene.
3. ⚠️ **`DESIGN.md` va riletto col sospetto, non citato**: due sessioni di fila l'hanno trovato
   indietro sul mock (il budget diceva 58 e 72 dove sono 57 e 71, il Counts Panel 24px dove il mock
   ne mette 16, Section Title mostrava ancora `breaking changes (4)`, e Help Pointer Link si
   contraddiceva con Neutral row verdicts).
4. ⚠️ **Le conversioni `max-[]` del resto dell'app non sono decise**: 43 `max-[640px]`, 19
   `max-[1040px]`, 7 `max-[880px]` tra Dashboard, `/technologies`, landing e barra. I file di
   Technology e di Release sono convertiti. ⚠️ **La barra usa ancora `sm:px-5`**, quindi a 640px
   esatti ha 24px di padding dove la pagina Release ne ha 16: un pixel di disallineamento, l'unico
   posto dove le due conversioni si incontrano.
5. **Il mock disegna due righe che il modello non produce**, la spiegazione di cosa cambia e il fix
   diff: lo schema dà solo `change` e `migration`, quindi non sono state scritte. Sarebbero dominio
   nuovo, da fissare prima in `CONTEXT.md`.
6. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa e la pagina
   Technology chiama entrambe. Si uniscono quando conviene, non subito.
7. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo lavoro
   tocca Anthropic. **Le cose dell'utente** stanno in `APERTE.md`; **come si misura una pagina** in
   `AMBIENTE.md` e in `PESO.md`. ⚠️ Uno script fuori dal progetto non risolve i pacchetti: Playwright
   si importa col `file:///` dentro `node_modules/.pnpm/playwright@1.63.0/`. **Docker e il dev server
   sulla 3000 erano attivi** a fine sessione.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md e guardiamo le due pagine in tema chiaro`.
