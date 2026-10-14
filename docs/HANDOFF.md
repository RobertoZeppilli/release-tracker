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

**Da dove ripartire (2026-10-14): la pagina Technology è in codice e misurata; tocca alla pagina
Release, poi agli E2E.** Branch **`142-technology-release`**: `28bc49e` committato e non pushato, e
sopra **tutto il lavoro di questa sessione ancora da committare** (26 file: `DESIGN.md`,
`globals.css`, la pagina e i suoi componenti, `docs/handoff/PESO.md`, `scripts/page-weight.mts`, la
riga `page:weight` in `package.json`). ⚠️ **Il ramo non ha un upstream suo**: traccia `origin/main`,
quindi il push è `git push -u origin 142-technology-release`, non un `git push` secco.
`pnpm lint`, `pnpm typecheck` e `pnpm test` (612) passano. **Gli E2E non sono stati toccati né
girati, e si romperanno in blocco**: il verdetto è un `<p id="path-verdict">` e non più un `<h2>`, i
titoli di gruppo sono `h3` sotto il `<h2>` della colonna, e la Stat Row non è più una lista.

### Technology in codice: lo spacco, e il contenitore unico a 1240

1. **Due colonne, `360px | 1fr` a 72px**, la forma di Dashboard e `/technologies`. A sinistra il
   blocco sticky a 72px: breadcrumb, nome, fonti, Follow, pannello, verdetto, frase e
   `show all N releases`. A destra l'unica colonna che scorre. **Il nome sta dentro la colonna
   sinistra**, non in una fascia sopra lo spacco.
2. **`--container-wide` non esiste più**: `--container-content` è 1240 e la prop `wide` dell'header è
   sparita, perché la barra prende la larghezza della pagina e la pagina è una sola larghezza.
   Login, 404, errore e **la pagina Release prendono 1240 da subito**, prima del loro codice.
   `--container-column` (1040) è il tetto della Dashboard vuota, l'unico caso rimasto.
3. **La Stat Row è il titolo del suo gruppo** (`stat-rows.tsx` sparito, `major-bar.tsx` al suo
   posto: barra, legenda, parole). La legenda sta in testa alla colonna destra. Il verdetto è a scala
   **Column verdict** come quello della Dashboard: in 360px quella grande andava a tre righe.
4. **Misurato su 18 larghezze da 320 a 1680**: overflow orizzontale **0 ovunque**, barra a 57px,
   verdetto **su una riga a ogni larghezza**, prima Release a **158px** a 1240 (era **646** sulla
   pagina viva, il mock prometteva 181), 180 a 1041, e a 1040 la pagina torna una colonna sola.

### ⚠️ Un pixel di troppo: `max-[Npx]:` di Tailwind è esclusivo

`max-[1040px]:` compila in `@media not (min-width: 1040px)`, cioè **sotto** 1040 e non "1040 e
sotto", che è quello che `DESIGN.md` dice in ogni gradino. Misurato: a esattamente 1040px il pannello
correva **992px** dentro una pagina a una colonna. In `globals.css` ci sono quattro varianti
nominate e inclusive (`split`, `stacked`, `narrow`, `phone`) e **i file di Technology sono
convertiti**. ⚠️ **Il resto dell'app no**: 43 `max-[640px]`, 19 `max-[1040px]`, 7 `max-[880px]` tra
Dashboard, `/technologies`, landing e Release. I quattro budget delle caret row (`max-[767px]`,
`max-[899px]`, `max-[1023px]`) sbagliano nella direzione opposta, cioè mostrano la caret row a un
pixel dove non ci sta: lì il pixel giusto va deciso uno per uno. **L'utente non ha ancora detto se
convertirli ora o dopo la Release.** Stessa famiglia: `sm:` è 640 **incluso**, quindi a 640px il
padding della pagina è 24px dove il mock ne vuole 16.

### Cosa resta

1. **Il codice della pagina Release**, poi gli E2E, poi il "dopo" del peso.
2. ⚠️ **`DESIGN.md` era rimasto indietro sul mock approvato** in due punti (la stat list "capped at
   820px" e il pannello "capped at the 72ch measure" con etichetta 9ch): riscritti su quello che il
   mock disegna. **Prima di scrivere la Release, rileggere i suoi paragrafi con lo stesso sospetto.**
3. **Due scelte di copy fatte dall'agente**: la frase del cammino resta quella sotto test e prende
   solo lo stile Mono 14 del mock (il mock ne mostra una più corta e coi numeri in grassetto), e il
   titolo della colonna destra dice l'ordinamento vero, `in the order you upgrade` su un cammino e
   `newest major first` sulla storia intera. Sono i posti dove tornare se non piacciono.
4. ⚠️ **Il giro intero degli E2E non è mai stato verde in una corsa sola**: va rifatto sulla stessa
   build di produzione prima di dire che la suite è verde.
5. **Il peso "prima" è preso**: tabelle e procedura in `docs/handoff/PESO.md`, `pnpm page:weight` su
   `next start`. ⚠️ **La regola che ne esce: `Script KB` non deve salire.** ⚠️ Technology e Release
   sono **SSG prerenderizzate**: un dato nuovo nel database non si vede senza una build nuova.
6. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa e la pagina
   chiama entrambe. Si uniscono quando conviene, non subito.
7. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo lavoro
   tocca Anthropic. **Le cose dell'utente** stanno in `APERTE.md`; **come si misura una pagina** in
   `AMBIENTE.md` e in `PESO.md`, con la trappola di Playwright (`viewport`, non `viewportSize`) e
   l'import col `file:///` dentro `node_modules/.pnpm/playwright@1.63.0/`. **Docker e il dev server
   sulla 3000 erano attivi** a fine sessione. Tema chiaro non ancora guardato su Technology.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md e partiamo con il codice della pagina Release`.
