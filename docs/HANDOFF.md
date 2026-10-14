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

**Da dove ripartire (2026-10-14, sera): la PR della #142 è aperta, non è ancora stata unita.**
È la **PR #150**, `142-technology-release` su `main`, con `Closes #142` in inglese e **nove commit**,
l'ultimo `c923ce0` (i panel con un titolo solo). Il ramo ora ha un upstream suo, quindi il push è un
`git push` secco. ⚠️ **Il merge e la cancellazione del ramo sono dell'utente**: la modalità auto li
nega, i comandi vanno dati a lui.
`pnpm lint`, `pnpm typecheck`, **620 unitari** e **195 E2E verdi in una corsa sola**, axe compreso,
nei due temi. ⚠️ `release.spec.ts:100` è caduto una volta sola in una corsa piena e ripetuto due
volte passa: è un click su un `summary` che arriva prima dell'idratazione, non una regressione.
⚠️ **Le due immagini dell'utente in `docs/` sono state cancellate** su sua richiesta, mai committate.

### La riga unica del verdetto, rimessa in piedi (e cosa è costato)

1. **Il tetto di `column-verdict` scende da 1.45rem a 1.2rem**, ed è questo che compra la riga
   unica dentro un panel. La ragione è misurata: il clamp cresceva col viewport mentre la colonna
   resta 360px, così **sopra ~1340px** `ok: nothing needs action` chiedeva **346px dentro 326px** di
   panel. A 1.2rem la frase più larga che i due panel possono dire, `note: 12 without a verdict`,
   **misura 319**. Sotto ~1130px di viewport non si è mosso niente.
2. ⚠️ **Non è la scala che cede alla copia**, che è la regola scritta: la copia non è cresciuta, era
   un clamp in `vw` dentro una colonna fissa a misurare la cosa sbagliata. `DESIGN.md` lo dice così,
   in The One-Line Verdict Rule, e il limite vale **solo per i tre titoli dei panel**.
3. **Il test misura a 1600px**, dove il clamp arriva al tetto: a 1280px (il viewport di Playwright)
   non ci arrivava e **non aveva mai visto l'andata a capo**. Misura anche la coppia più lunga che
   i due panel possono dire, scambiando etichetta e frase nel DOM.
4. **Come si misura una frase** senza indovinare: uno script Playwright su `/login`, che è pubblica
   e porta i font veri, con uno `span` `inline-block` e `white-space: nowrap` dentro un box di 360px.
   Lo `scrollWidth` non serve, perché con `overflow: visible` resta incollato al contenitore.

### Il resto di questo giro

1. La Dashboard **dice cosa manca** quando nessuno ha dichiarato una versione, invece di restare un
   titolo su una scatola vuota; il panel di `/technologies` **si intitola alla stessa scala** degli
   altri due; le righe delle due liste di sinistra prendono **12px di padding su tutti i lati**.
2. La riga in fondo alla Dashboard: la colonna delle date era **fissa a 11ch** dove `weeks 38 to 40`
   sono 14 caratteri, e la dicitura si stampava sopra la frase accanto. Ora 11ch è un minimo e
   **tutta la frase è un controllo solo**, nella cornice dei chip delle Categorie.
   ⚠️ **Niente verde nei controlli**: quel verde è l'inchiostro dei link, e il `help` che c'era prima
   è il teal con cui il sistema **cita le fonti**. Regola dell'utente, vale ovunque.
3. In `sorted by` la prima voce dice `category`, come il titolo della colonna accanto; il valore
   resta `name`.

### Cosa resta

1. **Il merge della PR #150**, che chiude la #142, e la cancellazione del ramo: tutt'e due
   dell'utente.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: lavoro suo, di chunking e
   di import dai barrel, **non deciso**, e da pesare contro la regola delle Script KB.
3. ⚠️ **`DESIGN.md` va riletto col sospetto, non citato**: quattro sessioni di fila l'hanno trovato
   indietro. **La tabella dei colori è tenuta da un test**; la prosa e la tabella della tipografia
   no, e quest'ultima diceva ancora `whiteSpace: nowrap` per un token che non lo porta più.
4. ⚠️ **Le conversioni `max-[]` del resto dell'app non sono decise**: 43 `max-[640px]`, 19
   `max-[1040px]`, 7 `max-[880px]` tra Dashboard, `/technologies`, landing e barra. I file di
   Technology e di Release sono convertiti. ⚠️ **La barra usa ancora `sm:px-5`**, quindi a 640px
   esatti ha 24px di padding dove la pagina Release ne ha 16.
5. **Il mock disegna due righe che il modello non produce**, la spiegazione di cosa cambia e il fix
   diff: lo schema dà solo `change` e `migration`. Sarebbero dominio nuovo, da fissare prima in
   `CONTEXT.md`.
6. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa e la pagina
   Technology chiama entrambe. Si uniscono quando conviene, non subito.
7. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic. **Le cose dell'utente** stanno in `APERTE.md`, **l'ambiente** in
   `AMBIENTE.md`, **come si misura una pagina** in `PESO.md` e il resto di questa sessione in
   `docs/handoff/2026-10.md`. ⚠️ Per guardare la pagina Release serve una Sintesi `ready`: l'`update`
   e il `restore` sono in `PESO.md`, e **il database locale è come era** (zero Sintesi `ready`).
   Docker e il dev server sulla 3000 erano attivi a fine sessione.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`, dopo aver unito la PR #150.
