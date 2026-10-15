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

**Da dove ripartire (2026-10-15): la #133 è chiusa e tutto è su `main` (`d584d47`, PR #153).**
Non c'è niente in sospeso. ⚠️ **Il ramo `133-back-to-top-and-waits` è ancora lì**, in locale e su
`origin`: la cancellazione è dell'utente (`git push origin --delete 133-back-to-top-and-waits` e
`git branch -d 133-back-to-top-and-waits`).

**Verde**: `pnpm lint`, `pnpm typecheck`, `pnpm build`, **621 su 622** unitari e **203 su 203** E2E
contro il build di produzione, con `--retries=0`. ⚠️ L'unico unitario caduto è
`eslint/boundaries.test.ts`, che fa girare ESLint e cade per tempo sotto carico parallelo (da solo,
10 su 10): **non è una regressione, non rincorrerlo.**

⚠️ **LA COSA DA SAPERE PRIMA DI DIRE CHE LA SUITE È VERDE.** `playwright.config.ts` lancia
`pnpm dev` in locale e `pnpm start` in CI: **la suite in locale gira sul dev server, CI sul build di
produzione**, e con un confine di loading i due si comportano **diversamente**. Il 2026-10-15 la
#153 è passata sul ramo e ha fatto **rossa `main`**: 7 E2E caduti in produzione, deterministici,
tre tentativi a testa, mentre in locale erano verdi. Prima di dichiarare verde qualunque cosa tocchi
le attese, lanciare **`CI=1 pnpm exec playwright test`**.

**Perché accade, quali 7 erano e com'è stata corretta**: in `docs/handoff/2026-10.md`, sotto
"Perché un confine di loading fa cadere i test che misurano". In breve: la correzione è
`data-waiting="page"` su `PageSkeleton` e `arrived(page)` in `tests/e2e/fixtures.ts`, da chiamare
fra la navigazione e la prima misura. **La copia doppia è nascosta**: non è una seconda barra a
schermo né un secondo landmark, quindi non è un difetto che vede l'utente.

### Le attese sono state rifatte il giorno stesso, e la ragione va letta prima di ritoccarle

L'utente non vedeva né lo skeleton né la barra fra le pagine. Due errori misurati, non di gusto:

1. ⚠️ **Il riempimento era invisibile**: `raised` (#161a20) dentro un bordo `rule`, su una pagina
   `ground` (#0f1115). Tre punti di differenza dalla pagina dietro, quindi arrivava il solo bordo,
   che si legge come un controllo rotto. Ora il blocco è **pieno** di `rule` e **senza bordo**.
2. ⚠️ **Il Chrome dell'utente chiede `prefers-reduced-motion: reduce`** (misurato), e il CSS
   spegneva l'animazione. **Un loader non è decorazione**: fermo è indistinguibile da un prodotto
   piantato. Sotto `reduce` il riflesso diventa una dissolvenza fra 0.6 e 1 opacità (WCAG 2.2
   2.3.3). **Non rimettere `animation: none` su `.skeleton-box`**: c'è un E2E che lo impedisce.
3. **La barra Zig-Zag non c'è più**, per scelta dell'utente: una forma sola, lo skeleton, dentro i
   controlli e su una pagina che non è arrivata (`PageSkeleton`). ⚠️ Le forme già rifiutate prima:
   la riga verde da 1px sotto la barra, la caret row tipografica, l'attesa silenziosa della #114, e
   ora anche la barra Zig-Zag e il loader verde. **Non riproporle.** Lo skeleton resta senza hue:
   `--focus` è l'interattivo e `--ok` è il verdetto, e un'attesa colorata direbbe altro.
4. `DESIGN.md`: The Waiting Rule è alla **terza versione** e il limite di The Reserved Space Rule è
   stato spostato (lo skeleton può avere la misura del telaio di una pagina, non solo di un
   controllo). Resta vietato lo skeleton di una riga, di una frase o di un numero.

### Da sapere prima di guardare qualunque cosa a schermo

⚠️ Lo **skeleton dura quanto l'attesa**, cioè decine di millisecondi in locale, e la sessione nel
browser impiega un paio di secondi (quella sì si vede, nel pulsante Account). Per vedere
`PageSkeleton` bisogna fermare la risposta (`page.route`) o iniettarne il markup nella pagina viva.
⚠️ **L'account Supabase locale non ha né foto né handle GitHub**, quindi il pulsante Account mostra
la sagoma neutra: è corretto, non è un bug dello skeleton.

### Cosa resta (dalla lista di prima, non toccata)

1. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: non deciso.
2. ⚠️ **`DESIGN.md` va riletto col sospetto**: la prosa non è tenuta da niente, e la #133 ne è la
   prova due volte (diceva che la barra era fixed e non lo era, e descriveva attese che non si
   vedevano).
3. ⚠️ **Le conversioni `max-[]` del resto dell'app non sono decise**: 43 `max-[640px]`, 19
   `max-[1040px]`, 7 `max-[880px]`. La barra usa ancora `sm:px-5`.
4. **Il mock disegna due righe che il modello non produce**: sarebbe dominio nuovo, da fissare prima
   in `CONTEXT.md`.
5. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa.
6. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic. Le cose dell'utente stanno in `APERTE.md`, l'ambiente in `AMBIENTE.md`,
   il peso delle pagine in `PESO.md`. Docker e il dev server sulla 3000 erano attivi allo stop.

⚠️ **Le altre comodità della #133 restano candidate non approvate**: il `-->` dalla cima delle Note
al Verdetto, il link alla fonte in fondo alle note, il salto da tastiera alle sezioni.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
