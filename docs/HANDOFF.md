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

**Da dove ripartire (tredicesimo giro, 2026-10-21): la #131 è chiusa, e il prossimo lavoro non è
ancora scelto.** La **PR 167** è mergiata in `main` con lo squash `86bad89`, e la **#131 si è chiusa
da sé** alle 11:31 per la parola chiave nel corpo di quella PR: stavolta scritta nell'unico posto
dove vada scritta, e mai in un messaggio di commit. Con lei la traduzione dell'interfaccia è
**finita per intero**, dall'ADR 0008 fino all'audit axe nelle cinque lingue: nessuna delle quattro
PR ha lasciato codice indietro.

⚠️ **La prossima issue si sceglie con l'utente, non si prende da soli**: la regola di chiedere prima
di passare a una issue nuova vale ancora, e `gh issue list` è il punto di partenza.

### Cos'è su `main` adesso

Le quattro PR della #131, in ordine: la 1 (ADR 0008), la 2 (`app/[locale]`, il proxy, i canonici),
la 3a (il motore del dizionario e il guscio) con `/settings` e il piede rifatto, la 3b-1 (le stringhe
dell'app), la 3b-2 (la landing), la 3b-3 (le cinque pagine documento) e la 4 (francese, spagnolo e
tedesco, le parole del glossario per le tre lingue, l'audit axe fuori dall'inglese). Il **fallback
inglese di `dictionaryFor` non copre più niente**, e il commento lì dice perché resta: non far
spedire con dei buchi una **sesta** lingua.

### Cosa resta

1. ⚠️ **Francese, spagnolo e tedesco non sono rivisti da madrelingua**, e l'ADR 0008 chiede quella
   revisione **prima del lancio**, non prima del merge. La riga che lo dice sta nei tre indici e in
   `CONTEXT.md`, così non passano per verificati. È l'unico pezzo della #131 che sopravvive al merge.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina** e le **`max-[]`** non sono decise.
3. **Il mock disegna due righe che il modello non produce**; `groupByMajor` e `recordedHistory`
   calcolano quasi la stessa cosa.
4. ⚠️ **Credito basso: non spendere niente senza chiedere.** Utente in `APERTE.md`, ambiente in
   `AMBIENTE.md`, peso in `PESO.md`.
5. **Cose dell'utente, verificate e sicure**: **quindici rami locali e quindici sul remote**,
   `ui-french-spanish-german` compreso, che la PR 167 non ha cancellato come nessuna prima di lei.
   I locali vanno via con `-D` perché lo squash fa sì che git non li veda fusi, ma ognuno ha la sua
   PR mergiata (`gh pr list --state merged`). E lo stash `residuo del checkout interrotto`, senza
   niente di unico.
Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
