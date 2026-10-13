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

**Da dove ripartire (2026-10-13, dopo il codice della Dashboard).** Il lavoro sta sul branch
**`142-app-visual-direction`**, **non pushato**, quattro commit avanti a `main`: la Dashboard nuova
è tutta in **`bc6c0bc`** e l'albero è pulito. Il passo seguente: **gli stati per colonna** (sotto),
poi le altre tre schermate.

**La Dashboard è riscritta sul mock ufficiale**, dominio compreso. Il dominio vecchio
(`spotlight`, `latest`, `previews`, `counts`, `inUse`) non esiste più: al suo posto
`domain/standing.ts` (**Posizione dello stack**: una riga per Tecnologia seguita, Distanza, ordine,
totali) e `domain/stream.ts` (**Flusso**: i giorni, e i Digest piegati per settimana in fondo), con
`domain/followed.ts` per i tipi letti dal server e `domain/fixtures.ts` per i test. In UI sono
spariti `dashboard-summary`, `spotlight`, `release-section` e `row-parts`; ci sono
`standing-column`, `standing-row`, `stream`, `stream-event`, `column-title`, `quota-note` e
`weekly-digest` rifatto come piega del Flusso. `BreakingList` è stata estratta in
`src/modules/releases/ui/` ed è una sola per la pagina Technology e per il Flusso.

**Il verdetto è la somma delle righe, per costruzione** (CONTEXT.md): ogni riga conta le Release
della sua Tecnologia nella finestra più quelle del Cammino di upgrade, ognuna una volta, e il
verdetto le somma, invece di essere un conto a parte che poteva smentirle.

**Gli stati per colonna sono rimandati, per scelta dell'utente (2026-10-13).** Caricamento ed
errore per colonna (`pending:`, `Try again` che ricarica una colonna sola) vogliono **due query
separate** al posto della sola `readDashboard`, con Suspense e error boundary per colonna. Si fanno
in un passo loro, perché le due query si sovrappongono molto (**circa 1.7x sul database**) e vanno
misurate senza mescolarle alla riscrittura. Finché non ci sono, la pagina arriva intera come prima
e un errore resta quello di pagina.

⚠️ **Tre cose le ha corrette la pagina vera, non il mock**, e sono scritte in `DESIGN.md` dove
servono (Page verdict, Standing Column): la frase lunga del verdetto muto misura **516px in una
colonna da 360** e quindi la copia si accorcia; una lista che scorre dentro una colonna flex deve
poter rimpicciolirsi (`min-height: 0`) o la colonna sfonda il proprio massimo; un grid item
`sticky` non viene fermato dalla sua cella e va messo dentro un div stirato all'altezza della riga.
Le prime due stampavano sopra il contenuto accanto, la terza sopra la riga in fondo.

**Due scostamenti voluti dal mock**, scritti in `DESIGN.md` con la ragione: lo **stato vuoto tiene
il contenitore da 1240px** col contenuto a 1040 dentro (il mock centrava 1040 e lasciava logo e
pannello account 100px fuori asse), e la lista ha un nome accessibile suo, perché la quota in barra
si chiama già `Followed technologies`.

**Le icone delle Tecnologie ci sono nelle righe della Posizione** (chieste dall'utente il
2026-10-13), col Technology Mark del Catalogo. **Nel Flusso no**: lì la riga si apre col glifo di
Rilevanza e due glifi attaccati litigherebbero; se le vuoi anche lì, va deciso l'ordine.

**Misurato con Playwright**, a ogni larghezza: lo spacco è **360/760 a 1440px**, una colonna sotto
i 1040 (il passo è `min-[1041px]:`, perché il mock scrive `max-width: 1040px`), la barra resta
**57px** fino a 320px, niente scorrimento laterale, **`offsetWidth - clientWidth` della lista = 0**,
e le 33 scansioni axe passano in chiaro e in scuro.

**Gli E2E della Dashboard sono riscritti**, 15 test verdi, più le patch a `a11y.spec.ts` (il
riquadro `in-use-counts` non esiste più), `current-version.spec.ts` (la dichiarazione si legge sulla
riga e nei totali) e `overflow.spec.ts` (la quota si chiede per nome esatto). ⚠️ Il giro intero fa
**186 verdi e 6 rossi, e i 6 sono timeout di `page.goto` a 30s sul dev server**, non asserzioni: le
stesse suite passano una per una (dashboard 15/15, a11y 33/33, overflow 23/23, navigation 23/23).
Va rifatto sulla build di produzione prima di dire che la suite è verde.

### Cosa resta

1. **Gli stati per colonna**, come sopra. Poi `/technologies`, Technology e Release.
2. ⚠️ **`design/mocks/direction/` non è stata cancellata**: la modalità auto la nega. E' dell'utente:
   `git rm -r design/mocks/direction`. Quella cartella non è più la fonte.
3. **Il peso delle pagine prima e dopo** (criterio della #142) non è stato misurato, e la #130
   (Core Web Vitals veri in produzione) resta senza misura di partenza.
4. **Un sistema di notifiche interno**, idea dell'utente del 2026-10-10: issue a parte, non aperta.
   Non parte da zero: le Notifiche sono già un Pro post-MVP in `docs/DECISIONI.md` (ADR 0004).
5. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic. Il `CRON_SECRET` di produzione non passa da questa chat.
6. **Docker e il dev server erano attivi** a fine sessione (la 3000 risponde, Supabase locale in
   piedi). Se la sessione nuova li trova spenti: `pnpm db:start` e `pnpm dev`, uno solo sulla 3000.
7. **Rami, ordine degli ambienti e flake di `technology.spec.ts`**: in `APERTE.md`, "Cose dell'utente".

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md e facciamo gli stati per colonna
della Dashboard`.
