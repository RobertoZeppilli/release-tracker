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

**Da dove ripartire (2026-10-13, sera, con la PR aperta).** Il branch
**`142-app-visual-direction`** è **pushato**, otto commit avanti a `main`, e la **PR #147** è
aperta: <https://github.com/RobertoZeppilli/release-tracker/pull/147>. ⚠️ **Non chiude la #142**: la
issue chiede quattro schermate e lì dentro c'è solo la Dashboard, quindi il corpo cita la issue
senza la parola chiave. **Merge e cancellazione del ramo sono dell'utente** (la modalità auto li
nega): `gh pr merge 147 --squash --delete-branch`.

**La Dashboard è finita, tranne gli stati per colonna.** Per com'è fatta (il dominio nuovo
`standing.ts` e `stream.ts`, il verdetto come somma delle righe per costruzione, i componenti che
sono spariti e quelli nuovi, le tre cose corrette dalla pagina vera e i due scostamenti voluti dal
mock) **non si riparte da qui**: sta tutto, parola per parola, in `docs/handoff/2026-10.md`,
"Stato al 2026-10-13", e le regole stanno in `DESIGN.md`.

**Quello che la sessione del 13 sera ha aggiunto.** I totali della Posizione sono ora un **panel**
in testa alla colonna, sul piano `raised`, col titolo della colonna e le cifre incolonnate
(`totalsLines` è diventata `totalsRows`): prima erano una frase sola che a 360px andava a capo tre
volte. Tre scostamenti dal mock li ha trovati la **misura e non l'occhio**: la riga della settimana
del Digest era 14px invece di 13, la sua riga di separazione stava sotto invece che sopra, e il
chevron era un SVG a mano senza la curva. Le righe a una riga sola (titoli di colonna, le due
versioni, Help Pointer, piede) prendono `line-height: normal` come nei mock, e la regola sta in
`DESIGN.md` sotto la scala tipografica.

⚠️ **Prima di giudicare la tipografia di una schermata, controlla i font.** Il 2026-10-13 la pagina
sembrava sbagliata nei font-size ed era in **Arial**: `next/font` non era riuscito a scaricare i
font e Turbopack aveva messo in cache quel risultato, quindi il CSS servito aveva i soli `@font-face`
di fallback mentre build e produzione avevano quelli veri. La verifica in due comandi e il rimedio
(`rm -rf .next`) stanno in `docs/handoff/AMBIENTE.md`.

**Gli stati per colonna restano rimandati, per scelta dell'utente (2026-10-13).** Caricamento ed
errore per colonna (`pending:`, `Try again` che ricarica una colonna sola) vogliono **due query
separate** al posto della sola `readDashboard`, con Suspense e error boundary per colonna. Si fanno
in un passo loro, perché le due query si sovrappongono molto (**circa 1.7x sul database**) e vanno
misurate senza mescolarle alla riscrittura. Finché non ci sono, la pagina arriva intera come prima
e un errore resta quello di pagina.

### Cosa resta

1. **Le altre tre schermate della #142**: `/technologies`, Technology, Release. Poi gli stati per
   colonna, come sopra.
2. ⚠️ **Il giro intero degli E2E non è mai stato verde in una corsa sola.** Le suite passano una
   per una (unitari 604; dashboard 19, current-version 5, a11y 33, overflow 23, navigation +
   keyboard + release + technologies 43), ma il giro intero sul dev server dava **6 timeout di
   `page.goto` a 30s**, non asserzioni. Va rifatto **sulla build di produzione** prima di dire che
   la suite è verde.
3. ⚠️ **`design/mocks/direction/` non è stata cancellata**: la modalità auto la nega. È dell'utente:
   `git rm -r design/mocks/direction`. Quella cartella non è più la fonte.
4. **Il peso delle pagine prima e dopo** (criterio della #142) non è stato misurato, e la #130
   (Core Web Vitals veri in produzione) resta senza misura di partenza.
5. **Un sistema di notifiche interno**, idea dell'utente del 2026-10-10: issue a parte, non aperta.
   Non parte da zero: le Notifiche sono già un Pro post-MVP in `docs/DECISIONI.md` (ADR 0004).
6. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic. Il `CRON_SECRET` di produzione non passa da questa chat.
7. **Docker e il dev server erano attivi** a fine sessione, con la cache di `.next` ripulita e i font
   veri in pagina. Se la sessione nuova li trova spenti: `pnpm db:start` e `pnpm dev`, uno solo sulla 3000.
8. **Rami, ordine degli ambienti e flake di `technology.spec.ts`**: in `APERTE.md`, "Cose dell'utente".

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md e facciamo /technologies della #142`.
