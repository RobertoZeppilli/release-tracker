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

**Da dove ripartire (2026-10-15, secondo giro): la #126 è scritta e provata sul ramo
`126-follow-many`, non ancora in PR al momento in cui questa riga è scritta.** Seguire più
Tecnologie insieme da `/technologies`: un toggle `select many` nei controlli del Catalogo, i segni
`[ ]` / `[x]` sulle righe, una barra appiccicata con `Follow n`, una sola scrittura verso il
database.
⚠️ **Il dev server sulla 3000 è spento**, chiuso per far girare la suite contro `pnpm start`.
⚠️ **Restano tre rami da cancellare** dopo il merge, in locale e su `origin`: la cancellazione è
dell'utente. `git push origin --delete 133-back-to-top-and-waits attese-e-handoff 126-follow-many`
e `git branch -d 133-back-to-top-and-waits attese-e-handoff 126-follow-many`.

**Verde**: `lint`, `typecheck`, `build`, **631 su 631** unitari (`boundaries` compreso, che stavolta
passa), **70 su 70** di integrazione e **208 passati** in E2E con `CI=1 pnpm exec playwright test`,
cioè contro il build di produzione. ⚠️ **Un flaky, e non è di questo lavoro**:
`upgrade-path.spec.ts:64` legge `?from=1.1.1` dove aspetta `1.0.0` e rientra al ritentativo.

⚠️ **LA COSA DA SAPERE PRIMA DI DIRE CHE LA SUITE È VERDE** resta quella di prima, e la #126 l'ha
usata: `playwright.config.ts` lancia `pnpm dev` in locale e `pnpm start` in CI, quindi prima di
dichiarare verde qualunque cosa tocchi attese o geometria si lancia **`CI=1 pnpm exec playwright
test`**. Il perché sta in `docs/handoff/2026-10.md`, sotto "Perché un confine di loading fa cadere
i test che misurano", e la chiave è `arrived(page)` fra la navigazione e la prima misura.

### Le tre decisioni della #126, prese dall'utente e non derivabili dal codice

1. **La selezione è una modalità, non una colonna fissa.** La prima risposta era la casella sempre
   visibile; l'utente l'ha cambiata a metà lavoro: niente caselle in mezzo finché non si chiedono.
   Spento il toggle, la pagina è esattamente quella di prima.
2. **Niente checkbox nativa**, per decisione esplicita: il segno è tipografico, `[ ]` e `[x]` in
   Fragment Mono, stessa larghezza nei due stati. ⚠️ **Non riproporre la casella del browser né una
   casella disegnata**: entrambe sono già state scartate, la seconda in favore della tipografica.
3. **La selezione è effimera e muore al ricaricamento**, non va nell'URL: un'intenzione non ancora
   eseguita non è un indirizzo da mandare a qualcuno.

Deciso dall'agente e dichiarato: **dentro la modalità il Follow di riga resta**, perché toglierlo
cambierebbe la larghezza di ogni riga e leverebbe la via per seguirne una sola.

### Le due trappole pagate dalla #126, da non ripagare

1. ⚠️ **`sticky top-0` non si incolla in questo progetto.** `--spacing: initial` non genera `top-0`,
   quindi `top` resta `auto`. È la stessa trappola che aveva tenuto la top bar non fixed il
   2026-10-15. La barra usa `top-[56px]`, l'altezza della top bar, e **c'è un E2E che misura la
   geometria** invece di guardare la classe.
2. ⚠️ **Dopo un rifiuto del database non si cita la cifra che la pagina credeva.** Un gruppo è
   rifiutato esattamente quando pagina e database non sono d'accordo su quanto è pieno il Piano:
   `onError` rilegge i follow (`invalidateQueries`) e solo dopo la barra stampa il numero.

### Quello che il database ha detto, provato e non assunto

L'insert multiriga **è atomico**: il trigger `enforce_follow_rules` è `for each row`, ma una riga
che sfonda il limite annulla l'intera istruzione. Tre test in `tests/integration/follows.test.ts`
lo provano, per il limite e per una Tecnologia ritirata dentro il gruppo. Da qui la frase della
pagina: **`none followed`**, mai "alcune". ⚠️ Il criterio dell'issue chiedeva un ritorno indietro
**parziale**: non esiste, e non è un taglio, è che con una sola istruzione non c'è un parziale.

### Cosa resta (dalla lista di prima, non toccata)

1. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: non deciso.
2. ⚠️ **`DESIGN.md` va riletto col sospetto**: la prosa non è tenuta da niente, e la #126 lo conferma
   una terza volta (la Selection Bar è stata scritta "senza bordo" e poi corretta a schermo).
3. ⚠️ **Le conversioni `max-[]` non sono decise**: 43 `max-[640px]`, 19 `max-[1040px]`, 7 `max-[880px]`.
4. **Il mock disegna due righe che il modello non produce**: dominio nuovo, da fissare in
   `CONTEXT.md`. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa.
5. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente della #126 tocca
   Anthropic. Le cose dell'utente in `APERTE.md`, l'ambiente in `AMBIENTE.md`, il peso in `PESO.md`.

⚠️ **Fuori dalla #126, non approvate**: il follow multiplo dalla Dashboard vuota e dalla pagina
Technology (poche righe, niente da accelerare), e le comodità della #133 già in lista (il `-->`
dalla cima delle Note al Verdetto, il link alla fonte, il salto da tastiera).

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
