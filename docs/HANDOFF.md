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

**Da dove ripartire (2026-10-14, sera): le due pagine sono finite e i verdetti stanno in un panel
uguale sulle due pagine; manca la PR.** Branch **`142-technology-release`**, albero pulito e **otto
commit in coda** su `origin/main`, gli ultimi due `900968a` (il peso misurato dopo) e **`95688ef`
(i panel)**. ⚠️ **Il ramo non ha un upstream suo**: traccia `origin/main`, quindi il push è
`git push -u origin 142-technology-release`, non un `git push` secco.
`pnpm lint`, `pnpm typecheck`, **620 unitari** e **195 E2E verdi in una corsa sola**, axe compreso,
nei due temi.

⚠️ **Il peso prima e dopo** (le due pagine non pesano, ma `/login` porta 14 KB di UI delle Release)
sta in `docs/handoff/PESO.md` e, per come è stato trovato, in `docs/handoff/2026-10.md`.

### I panel, e la regola che hanno piegato

1. **I verdetti sono il titolo di un panel**, sulla Technology e sulla Dashboard, e i conteggi dietro
   di loro sono righe della stessa forma: **nome a sinistra, numero a destra incolonnato**, che è la
   disposizione con cui lo Standing Panel contava già i suoi totali. Decisione dell'utente: le due
   pagine devono essere la stessa scatola. Niente `·` nelle righe.
2. Sulla Dashboard sono spariti **la didascalia `where your stack stands · by distance`**, la
   funzione che la scriveva e **lo slot vuoto riservato** sopra il panel. L'`aside` prende ora il
   nome dal verdetto (`aria-labelledby="page-verdict"`).
3. **`read the release notes` prende una riga sua** e il `·` se n'è andato con lui: sulla riga
   condivisa le sue quattro parole si rompevano in un punto diverso a ogni larghezza. Vale anche per
   la riga del flusso in Dashboard, stesso componente.
4. ⚠️ **La regola della riga unica del verdetto è stata piegata, non ignorata**: nel panel
   `ok: nothing needs action` ha **328px e ne misura 365**, e per stare su una riga le tre frasi
   dovrebbero scendere a **21 caratteri**. Cede la riga, non la scala, e `DESIGN.md` ora dice che la
   riga unica è una regola del contenitore della pagina, non di un panel. Il test E2E è passato da
   1,5 a 2,5 righe tenendo le altre tre misure. **Se l'utente la rivuole, il prezzo è la copy.**
5. ⚠️ Il `whitespace-nowrap` dei verdetti è andato via con la cornice: fuori da una scatola una
   frase lunga sconfinava nel margine senza che nessuno se ne accorgesse, dentro stampava 16px oltre
   il bordo.

⚠️ **Il tema chiaro è stato guardato e misurato** sulle due pagine, e le misure di quello che axe
non guarda stanno in `docs/handoff/2026-10.md`, "Il tema chiaro delle due pagine (2026-10-14)".

### Cosa resta

1. **La PR che chiude la #142** (`Closes #142` in inglese): è la prossima cosa, non resta altro
   lavoro di codice sulle due pagine. ⚠️ In `docs/` ci sono **due immagini dell'utente**,
   `INFO IN LINEA.JPG` e `INFO IN BASSO A SINISTRA.JPG`, mai committate: sono le due schermate da cui
   sono nati i panel, da cancellare o da spostare, **lo decide l'utente**.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: lavoro suo, di chunking e
   di import dai barrel, **non deciso**, e da pesare contro la regola delle Script KB prima di dire
   che la #142 è chiusa bene.
3. ⚠️ **`DESIGN.md` va riletto col sospetto, non citato**: tre sessioni di fila l'hanno trovato
   indietro. **La tabella dei token ora è tenuta da un test**; la prosa no, e l'ultima volta diceva
   58 e 72 dove sono 57 e 71, il Counts Panel 24px dove il mock ne mette 16, e Help Pointer Link si
   contraddiceva con Neutral row verdicts.
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
7. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic. **Le cose dell'utente** stanno in `APERTE.md`, **l'ambiente** in
   `AMBIENTE.md` e **come si misura una pagina** in `PESO.md`. ⚠️ Per guardare la pagina Release
   serve una Sintesi `ready`: l'`update` e il `restore` sono in `PESO.md`, in `pnpm dev` basta
   l'`update`, e **il database locale è stato rimesso come era** (zero Sintesi `ready`). Docker e il
   dev server sulla 3000 erano attivi a fine sessione.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md e apriamo la PR della #142`.
