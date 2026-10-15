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

**Da dove ripartire (2026-10-15): la #133 e' scritta tutta sul ramo `133-back-to-top-and-waits`,
verde, e **non e' committata**. Nessun file e' stato aggiunto all'indice: `git status` mostra tutto il
lavoro come modifiche in corso. La sessione si e' fermata al 35% di contesto, per scelta dell'utente.
Il primo passo della sessione nuova e' **decidere se committare e aprire la PR** (`Closes #133`).

**Verde al momento dello stop**: `pnpm lint`, `pnpm typecheck`, **622 unitari**, `pnpm build`, e la
suite E2E a **200 su 203**. ⚠️ **I tre caduti erano ambientali, non del codice**: giravano spec di
prova contro lo stesso dev server (uno e' un `page.goto` abortito), e **rilanciati da soli sono
verdi** (`errors`, `overflow`, `release.spec`, 38 passati).

### Cosa c'e' dentro, e le decisioni che l'utente ha preso per arrivarci

1. **Il ritorno in cima** (`src/components/back-to-top.tsx`), su landing, `/technologies` e pagina
   Release: compare sotto la seconda schermata, 44px, `ground`, in basso a sinistra sotto i 640px e
   a destra sopra; e' un `<a href="#content">` e porta **scroll e fuoco insieme**. ⚠️ **Scelto
   dall'utente il bottone ancorato** e non il ritorno tipografico col `BackPointer`: costa una
   **deroga a The One Raised Plane Rule**, argomentata dentro la regola in `DESIGN.md`.
2. **Le attese, in due forme, dopo tre giri di proposte rifiutate**: skeleton della forma del
   controllo (misura, raggio, bordo 1px, `raised`) nelle scatole riservate; fra una pagina e l'altra
   la **barra Zig-Zag**, il **#12 di `css-loaders.com/progress`** scelto dall'utente, **al centro**
   dello schermo sotto la barra. ⚠️ Le forme che aveva gia' rifiutato: la riga verde da 1px sotto la
   barra, la caret row tipografica, e l'attesa silenziosa della #114. **Non riproporle.**
   `The Reserved Space Rule` e' stata **riaperta** e riscritta (seconda versione), con il limite:
   skeleton **solo a misura di controllo**, mai di una riga o di un paragrafo.
3. ⚠️ **La barra in alto non era mai stata fixed, in produzione nemmeno.** `globals.css` spegne la
   scala di default (`--spacing: initial`), Tailwind 4 costruisce le utility di inset da quella
   scala, e **`top-0` non viene generata**: `position: sticky` con `top: auto` non si attacca a
   niente. Misurato anche sul sito in produzione. Ora e' `top-[0px]`, e
   `tests/e2e/top-bar.spec.ts` lo tiene. Lo stesso buco uccide `right-0`, `left-0`, `bottom-0`,
   `inset-0` e `gap-0` (l'altro uso vivo era `phone:gap-0` in `summary-view.tsx`, corretto);
   `m-0`, `p-0`, `min-w-0` e `min-h-0` sono vive, misurate una per una.
4. ⚠️ **Un `loading.tsx` vale anche per tutte le rotte sotto la sua cartella**, e con un confine di
   loading **una pagina pubblica che rispondeva 404 passa a 200**: 15 E2E caduti (i 404 e le
   descrizioni SEO). Per questo l'attesa sta **solo** sulle due pagine con login, e `/technologies`
   tiene il suo dentro il gruppo di rotte `(catalog)`, dove e' stata spostata `page.tsx`.

### Da sapere prima di guardare qualunque cosa a schermo

⚠️ **Il Chrome dell'utente chiede moto ridotto** (`prefers-reduced-motion: reduce`, misurato): per la
regola, da lui **non si muove niente**, skeleton e barra compresi. E lo **skeleton dura quanto
l'attesa**, cioe' decine di millisecondi in locale: c'e' nell'HTML del server (tre occorrenze su
`/technologies/react`), e per vederlo bisogna fermare la risposta della sessione
(`page.route("**/auth/v1/user**")`). La pagina di prova fuori dal progetto, con le due forme ferme e
in movimento, sta in `%TMP%\prova-loader.html`; gli screenshot dell'app vera in `test-results/`.

### Cosa resta (dalla lista di prima, non toccata)

1. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: non deciso.
2. ⚠️ **`DESIGN.md` va riletto col sospetto**: la prosa non e' tenuta da niente, e questa sessione ne
   e' la prova (diceva che la barra era fixed, e non lo era).
3. ⚠️ **Le conversioni `max-[]` del resto dell'app non sono decise**: 43 `max-[640px]`, 19
   `max-[1040px]`, 7 `max-[880px]`. La barra usa ancora `sm:px-5`.
4. **Il mock disegna due righe che il modello non produce**: sarebbe dominio nuovo, da fissare prima
   in `CONTEXT.md`.
5. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa.
6. ⚠️ **Il credito dell'utente e' basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic. Le cose dell'utente stanno in `APERTE.md`, l'ambiente in `AMBIENTE.md`,
   il peso delle pagine in `PESO.md`. Docker e il dev server sulla 3000 erano attivi allo stop.

⚠️ **Le altre comodita' della #133 restano candidate non approvate**: il `-->` dalla cima delle Note
al Verdetto, il link alla fonte in fondo alle note, il salto da tastiera alle sezioni.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
