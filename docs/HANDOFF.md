# Handoff, release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote **pubblico** su **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
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

**Da dove ripartire (quindicesimo giro, 2026-10-22): la #169 è chiusa e lo schema delle Notifiche è
in produzione, quindi la prossima issue si sceglie insieme.** Squash `a822f89`, PR 177, e il
workflow *Deploy database* ha applicato `20261022170939_notifications.sql` alle 19:15 UTC: la
**#170 è sbloccata**, perché la regola dei preview che leggono il database di produzione è
soddisfatta. Il `main` locale è indietro: la modalità auto nega `git pull`, lo rimette in pari
l'utente.

### Il difetto che ha trovato il test mai girato, e perché vale ricordarlo

Il commit `7091a2f` era stato scritto con Docker spento, quindi `pnpm test:integration` non era mai
girato. Girato in questa sessione, ha mostrato che la fetta **duplicava le Notifiche alla seconda
esecuzione**, cioè il criterio di accettazione che la issue dichiarava di rispettare, e che il
messaggio del commit affermava come "idempotenza per costruzione".

La causa, che vale per ogni upsert futuro di questo progetto: **`upsert` con `ignoreDuplicates` e
senza `onConflict` non produce un `on conflict do nothing` nudo.** PostgREST inferisce la chiave
primaria, che qui è un uuid nuovo e non collide mai, e l'indice unico esplode. E un indice
**parziale non è inferibile** nemmeno nominandone le colonne, quindi i due indici parziali del
primo commit non potevano servire allo scopo per cui erano stati scritti. Rimedio: una colonna
generata `subject` (`coalesce(release_id::text, digest_week)`) e **un solo** indice unico normale su
`(user_id, event, subject)`, che l'insert nomina. Vale anche per il Digest della #173.

Due trappole delle fixture, trovate con lo stesso giro: una Sintesi `ready` senza provenienza viola
`summaries_ready_provenance` (ADR della #88), e **in un insert multiplo PostgREST riempie con `null`
la chiave assente da una riga** invece di usare il default della colonna.

⚠️ **La lezione**: una fetta col test di integrazione mai girato non è una fetta finita, e il commit
che la descrive può affermare il falso in buona fede. Docker si accende prima, non dopo.

### Le tre scelte del quattordicesimo giro, chiuse

1. **Eventi come enum a tre valori**: passata com'era, così `/settings` spegne `featured` e
   `notable` separatamente.
2. **Nessun trigger crea le preferenze**: passata com'era, una riga che manca è il valore di
   partenza, che sta nel dominio.
3. **Finestra del job allargata da 7 a 30 giorni**, gli stessi della Dashboard
   (`src/modules/dashboard/domain/build-dashboard.ts:25`): la Notifica nasce quando la Sintesi si
   settla e le fasi delle Sintesi si lanciano a mano, quindi con sette giorni **una Sintesi tardiva
   non avrebbe notificato nessuno**. Scelta dell'utente fra tre strade.

### Tre E2E di misura instabili, e perché non era la #169

La PR 177 è fallita una volta e **è passata al rilancio senza cambiare una riga**, che elenca flaky
`dashboard.spec.ts:267`, `technology.spec.ts:126` e `technology-follow.spec.ts:174`: tre test che
*misurano la pagina*, quindi una causa sola, e la più probabile è in `AMBIENTE.md`, i font che non
scaricano. ⚠️ **Non era GitHub.** È la **#178** (`bug`, `ready-for-agent`), che porta dentro anche
il `timeout-minutes` che la CI non ha. Il racconto intero sta in `APERTE.md`, "Code da non perdere".

### Cosa resta

1. **La prossima issue non è scelta**, e c'è anche la **#178** di sopra. Le Notifiche dopo la #169:
   **#170** campanella (il contatore
   non può buttare l'ISR), **#171** `/settings` col segno `Pro` e i giorni di prova, **#172** Slack,
   **#173** email e Digest come entità, **#174** Lemon Squeezy, che l'ADR 0009 rende obbligatoria al
   lancio e conviene aprire presto per i tempi del Merchant of Record. Non scelte: **#65**, **#130**,
   **#69**, e la **#176** (Redis: la risposta è non adesso, ma dentro c'è il rate limiting, che non
   esiste da nessuna parte ed è l'unico rischio di oggi).
2. ⚠️ **Francese, spagnolo e tedesco non sono rivisti da madrelingua**, e l'ADR 0008 chiede quella
   revisione **prima del lancio**, non prima del merge.
3. **I due debiti di sempre** (i 14 KB con le `max-[]`, il mock con `groupByMajor`) stanno in
   `APERTE.md`, coi rami arretrati e il come si cancellano. Cancellarli è dell'utente.
4. Un **server Next residuo sulla 3001** (pid 24028 il 2026-10-22), da chiudere: la regola è uno
   solo, sulla 3000.
5. ⚠️ **Credito basso: non spendere niente senza chiedere.**
Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
