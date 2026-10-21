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

**Da dove ripartire (decimo giro, 2026-10-21): la #164 è mergiata in `main` (squash `6ba18ee`), e la
3b-2 è finita e committata in `49bcf13` sul ramo `131-ui-strings-landing`, non pushata, PR non
aperta.** Su `main` ci sono ora la PR 1 (ADR 0008), la PR 2 (`app/[locale]`, il proxy, i canonici),
la PR 3a (il motore del dizionario e il guscio), la pagina `/settings` col piede rifatto e la 3b-1
(le stringhe dell'app in italiano).

⚠️ **Il primo passo della sessione nuova è il push e la PR della 3b-2**, che l'utente non ha ancora
confermato. ⚠️ **Nel corpo va `Rif. #131`, non `Closes #131`**: l'handoff del nono giro diceva
`Closes` ed era sbagliato, perché la issue ha ancora due PR davanti. Le PR 162 e 163 scrivono a mano
che la issue resta aperta, ed è la riga da copiare.

Poi restano la **3b-3** (le pagine documento: `faq`, `terms`, `privacy`, `attributions`, `contact`,
557 righe di prosa, e per `terms` e `privacy` resta da decidere se l'inglese fa fede, perché se fa
fede quelle due pagine diventano una riga che lo dichiara invece di 264 righe di prosa legale) e la
**PR 4** (francese, spagnolo, tedesco, e l'overflow a 320px in tedesco).

### Cos'è entrato nella 3b-2 in questa sessione

1. **Due file `landing.ts`**, inglese e italiano, quaranta messaggi: la landing era l'unica pagina
   con le stringhe ancora dentro il codice. Più `page.landing.title` e `page.landing.description`
   nel namespace `page`, che è dove stanno i titoli di tutte le altre pagine.
2. ⚠️ **Le quattro definizioni della Rilevanza sono uscite da `domain/vocabulary.ts`**. Erano prosa
   inglese dentro TypeScript puro, cioè copia di interfaccia dove ADR 0006 vuole dominio. Il dominio
   tiene adesso l'accoppiata livello/chiave, che è la metà che il compilatore controlla: un livello
   nuovo nello schema arriva lì senza chiave e il build si ferma. Il test legge la definizione dal
   dizionario, quindi prende anche la chiave che nessuno ha scritto.
3. **Il verdetto del Proof Panel legge `release.verdict.action`** invece di una stringa propria, e la
   nota delle note non giudicabili fa lo stesso con `release.verdict.unjudged`: prima la landing e
   l'app potevano divergere sulla stessa parola.
4. ⚠️ **I quattro nomi degli stadi restano inglesi in ogni lingua** (`source`, `cite`, `verdict`,
   `help`), perché ognuno è anche l'`id` con cui la pagina è ancorata: tradurli sposterebbe l'ancora
   con la lingua e romperebbe ogni link dentro la pagina.
5. **Tre scelte di lingua**, scritte nei commenti dei due file: `Capire prima di aggiornare.`
   all'infinito e non all'imperativo (un ordine al lettore suona come una pubblicità, e l'inglese è
   una promessa); `breaking changes` inglese col plurale inglese, come fa già
   `release.verdict.actionCount`; le due affermazioni della nota prese da `CONTEXT.md` parola per
   parola, con le virgolette caporali al posto delle inglesi.
6. **Tre E2E**: la landing italiana si legge in italiano mentre le note dentro il pannello restano
   inglesi (è l'argomento del prodotto, e il test di parità non può vederlo); `/it` entra in
   `overflow.spec` a tutte le larghezze già coperte; e il commento in testa a `locales.spec` non
   dice più che le stringhe sono inglesi dappertutto, perché non è più vero da due PR.

### Dove sta il giro

`lint`, `typecheck`, `build` (`/it` resta ● SSG, ISR intatto), **680 su 680** unitari, **70 su 70**
di integrazione, **253** E2E passati con `CI=1` e il build di produzione, zero falliti. L'unico
flaky è `technology.spec:126`, il `boundingBox` del marchio che torna `undefined` quando l'elemento
non è ancora disegnato, e passa al secondo giro. ⚠️ I tre che cadevano **contro il dev server**
(`a11y:169` e `locales:35`) **passano col build di produzione**: erano l'artefatto del dev server,
come l'handoff del nono giro sospettava. Misurato nel browser: in italiano il titolo sta in **due**
righe dove l'inglese ne prende tre, quindi la landing non ha perso niente in altezza.

### Cosa resta

1. ⚠️ **Da far decidere all'utente**: sulla landing la nota dice **`note non giudicabili`**, cioè la
   forma accorciata che nella 3b-1 era imposta dai 326px del pannello. Qui lo spazio basterebbe per
   la frase piena. Ho tenuto la parola dell'app perché la landing è la pagina che **spiega** il
   vocabolario, e insegnerebbe male una parola che l'app non stampa. È una riga da cambiare.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina** e le **`max-[]`** non sono decise.
3. **Il mock disegna due righe che il modello non produce**; `groupByMajor` e `recordedHistory`
   calcolano quasi la stessa cosa.
4. ⚠️ **Credito basso: non spendere niente senza chiedere.** Le cose dell'utente in `APERTE.md`,
   l'ambiente in `AMBIENTE.md`, il peso in `PESO.md`.
5. **Cose dell'utente, verificate in questa sessione e sicure**: **dodici rami locali** da
   cancellare con `-D` (lo squash fa sì che git non li veda fusi, ma ognuno ha la sua PR mergiata),
   il ramo remoto `131-ui-strings-app-it`, e lo stash `residuo del checkout interrotto`, che non
   contiene niente di unico: `writeFollows` è a `follows-store.ts:59`, il test di integrazione
   esiste, e le due sezioni di `DESIGN.md` sono alle righe 806 e 813.
Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
