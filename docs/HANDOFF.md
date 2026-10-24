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
Altrove: **PRD issue #1**, `PRODUCT.md`, `GLOSSARY.md`, `docs/DECISIONI.md`, `docs/adr/0001…0007`,
`DESIGN.md` e i mock in `design/mocks/`, **ADR 0008** per le cinque lingue.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue erano sospese e l'utente le ha rilanciate il 2026-10-15** chiedendo la #131: la
sospensione è finita, ma vale sempre la regola di chiedere prima di passare a una issue nuova.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.


## Stato

**Da dove ripartire (diciassettesimo giro, 2026-10-23): la #171 è chiusa, quindi la prossima issue si
sceglie insieme.** Squash `a031c36`, PR 180, mergiata dall'utente: niente migrazione, perché lo schema
era già quello della #169. Il ramo locale `171-settings-notifiche` è ancora lì, e cancellarlo è
dell'utente.

### Cosa ha portato la #171

La sezione `notifications` in `/settings`: un interruttore per le Release `featured` e uno per le
`notable` sulla campanella, ognuno con sotto che cosa si perde a spegnerlo, il blocco di Slack e
dell'email col segno `Pro` e la riga dei giorni di prova, e la lingua con cui quei due canali saranno
scritti. Cinque lingue, e `DESIGN.md` ha la sezione *Notification Settings (Settings)*.

La privacy è passata **da sei voci a nove in una volta sola**, con la frase dei 90 giorni accanto a
quella che dice che tutto resta finché resta l'account; la FAQ dice che cosa è Free e che cosa è Pro,
il terzo posto che l'ADR 0009 chiede, e `faq.limit.a` non dice più che "Free è l'unico piano che c'è".

### Le prime Server Action del progetto, e le quattro regole che le tengono

Scelte dall'utente il 2026-10-23 e scritte in `docs/DECISIONI.md`.

1. L'identità si legge **dai cookie della richiesta**, mai dal form.
2. Il form si valida **dentro l'azione**: si può postare senza la pagina.
3. Scrive il client dello Sviluppatore, e la **RLS** è quello che lega la riga a lui.
4. L'SQL vive a parte in `write-notification-settings.ts`, così il test di integrazione lo gira
   contro il database vero: l'azione è solo identità più validazione.

⚠️ **Un client component non può importare l'azione**: la regola ESLint `no-server-import-in-client`
guarda il percorso e non il contenuto, ed è rimasta com'era. Il server component passa l'azione
**come prop**, e i tipi della risposta stanno in `src/modules/notifications/domain/saving.ts`.

⚠️ **`canSwitch` è la regola unica** di che cosa si accende oggi: la disegna la pagina e la fa
rispettare l'azione, quindi un post costruito a mano non accende Slack, l'email o il Digest. La #172
e la #173 la allargano, ognuna col proprio canale, e l'interruttore è il mark tipografico di Select
Many con `role="checkbox"`, non un oggetto nuovo.

### ⚠️ Tre trappole già pagate

1. **Un messaggio con `{count}` vuole la forma `many`** in italiano, francese e spagnolo, o il test
   dei dizionari cade: vale anche per un numero che non arriverà mai a un milione.
2. **Il dev server rimasto sulla 3000 va chiuso prima di un giro `CI=1`**, che vuole la porta libera
   per `pnpm start`. Resta la lezione del giro scorso: un rosso locale si rigira lì prima di crederci.
3. **`trialOf` non dice mai "0 giorni"** mentre i canali funzionano: l'ultimo giorno è un giorno, e
   allo scadere dei trenta lo stato è `ended`. Era il criterio della issue sulla riga che deve dire
   il vero il giorno della scadenza.

### Le verifiche

`lint`, `typecheck`, `test` (727), `test:integration` (89), `build`, e contro il build di produzione
`notification-settings` 7/7, il gruppo `account overflow keyboard navigation locales notifications`
70/70, `a11y legal` 84 passati.
⚠️ **Resta rosso in locale `a11y › the folded digest list of a Technology page`**, come il giro
scorso e per la stessa ragione: il database locale ha **zero Tecnologie**, quindi `/technologies/vite`
non esiste. Serve il Catalogo importato in locale.

### Cosa resta

1. **La prossima issue si sceglie insieme.** Le Notifiche dopo la #171: **#172** Slack, **#173** email
   e Digest come entità (e chi la fa deve togliere il filtro `SHOWN` in
   `src/modules/notifications/ui/notifications-store.ts`, o le sue Notifiche resteranno invisibili),
   **#174** Lemon Squeezy, obbligatoria al lancio per l'ADR 0009 e da aprire presto per i tempi del
   Merchant of Record. C'è anche la **#178** (E2E di misura instabili e il `timeout-minutes` che la CI
   non ha). Non scelte: **#65**, **#130**, **#69**, **#176** (Redis: non adesso, ma dentro c'è il rate
   limiting, che non esiste da nessuna parte).
2. ⚠️ **Francese, spagnolo e tedesco non sono rivisti da madrelingua**, e l'ADR 0008 chiede quella
   revisione **prima del lancio**, non prima del merge.
3. **I due debiti di sempre** (i 14 KB con le `max-[]`, il mock con `groupByMajor`) stanno in
   `APERTE.md`, coi rami arretrati: cancellarli è dell'utente.
4. ⚠️ **Credito basso: non spendere niente senza chiedere.**
Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
