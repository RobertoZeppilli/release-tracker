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

**Da dove ripartire (diciannovesimo giro, 2026-10-26): la #172 e' fatta e verde sul ramo
`172-notifiche-slack`, e manca solo la PR**, con `Closes #172` **in inglese** nel corpo.
`main` a `c8ccd66` (la PR #186 e' stata mergiata dopo l'handoff del giro scorso, che diceva `61d99da`).

### Il canale Slack (#172)

Le tre decisioni che la issue lasciava aperte sono state prese con l'utente e **scritte prima del
codice**, in `docs/DECISIONI.md` (tre righe, #172) e in `GLOSSARY.md` (Consegna, Webhook Slack):
**un solo messaggio per giro e per Sviluppatore**, a elenco, perche' un webhook regge circa un
messaggio al secondo (⚠️ non tocca l'ADR 0009: la Notifica resta una per Release, il raggruppamento
e' della **consegna**); **il webhook in `notification_secrets`**, tabella senza alcun grant per il
client, scritta solo col service role con l'identita' presa dai cookie, e il client rilegge solo
`slack_webhook_hint`; **`notification_deliveries`**, una riga per Notifica e canale, che regge
l'email della #173 e rende provabile che un webhook rotto non ferma gli altri.

⚠️ **La prima versione dello schema era sbagliata e l'ha smascherata la pagina vera.** Con l'URL in
`notification_settings` e il `grant select` ristretto alle altre colonne, **ogni upsert** del client
dello Sviluppatore su quella tabella falliva, **il salvataggio della lingua compreso**: `insert ...
on conflict do update` richiede `select` **sull'intera tabella**, non sulle colonne che nomina
(`permission denied for table`, riprodotto in psql con `set local role authenticated`). Da qui la
tabella separata, e un test di integrazione nuovo che copre proprio quell'upsert, che prima nessuno
provava col client dello Sviluppatore.

Migrazione `20261026085450_slack_channel.sql`, applicata in locale. Codice: `domain/slack.ts` e
`domain/slack-plan.ts` (testati), `server/send-slack.ts`, `deliver-slack.ts`, `save-slack.ts`,
`ui/slack-webhook.tsx`, le righe Slack in `/settings`, diciassette stringhe **in cinque lingue**.
L'invio e' agganciato al cron della Detection, dopo `generateNotifications`.

⚠️ **Nessun ritentativo**: una consegna `failed` non si ripete, e cio' che lo Sviluppatore legge in
`/settings` e' la ragione. ⚠️ **`deliverSlack` non legge `@/env`**: il `siteUrl` glielo passa la
route, come il token GitHub della Detection, e leggerlo dal modulo **rompeva i test di integrazione**,
che non caricano `.env.local`. ⚠️ **Il trial non partiva da nessuna parte**: `savePreference` ora
chiama `startExternalTrial` quando si accende un canale esterno (ADR 0009); prima non serviva perche'
solo `in_app` era accendibile.

### La prova visiva

`/settings` aperta sulla 3000: un URL non di Slack e' rifiutato e lo dice, uno buono salva e stampa
l'indizio, il pulsante della prova si accende, e l'interruttore `featured` su Slack scrive la
preferenza **e avvia la prova di 30 giorni** (verificato in psql). Corretti due difetti che solo la
pagina mostrava: la frase diceva "i due interruttori qui sopra" mentre stanno sotto, e la riga del
raggruppamento era ripetuta identica sui due, dove serviva dire che la campanella continua a suonare.
⚠️ **`db:reset` cancella l'utente di sviluppo**: si rifa con `pnpm dev:login`.

### L'overflow della campanella, sistemato per strada

Chiesto dall'utente a meta giro. ⚠️ **Non era una regola del pannello: e' l'ereditarieta' di
`white-space`.** Il gruppo di azioni della barra porta `whitespace-nowrap` per i suoi controlli, il
pannello e' figlio di quel gruppo e lo ereditava, la frase dello stato vuoto non andava a capo e un
contenitore con `overflow-y-auto` **non resta** `overflow-x: visible`. Rimedio: `whitespace-normal`
sul pannello, `break-words` sul nome della Tecnologia; misurato in produzione, `scrollWidth` da
643px a 338px. Il pannello dell'account **non** e' toccato: ha larghezza elastica, quindi li' il
nowrap allarga invece di tagliare.

**Verifiche**: `typecheck`, `lint`, `test` (743/743), `test:integration` (98/98, con
`slack-channel.test.ts` nuovo), `build`, tutti verdi. Il database locale e' **acceso** (`pnpm db:stop`
quando serve) e dentro ha il webhook finto della prova, che non manda da nessuna parte.

### Cosa resta

1. **Aprire la PR della #172**, poi scegliere insieme: **#173** email e Digest (e chi la fa deve
   togliere il filtro `SHOWN` in `src/modules/notifications/ui/notifications-store.ts`), **#174**
   Lemon Squeezy, obbligatoria al lancio per l'ADR 0009. Non scelte: **#65**, **#130**, **#69**,
   **#176** (dentro c'e' il rate limiting, che non esiste da nessuna parte).
2. **La #185 da riscopare o chiudere** (numeri sbagliati), e la superficie indicizzata se si decide.
3. ⚠️ **Francese, spagnolo e tedesco non rivisti da madrelingua**, e questo giro ne ha aggiunti
   diciassette: l'ADR 0008 chiede la revisione **prima del lancio**.
4. **I due debiti di sempre** e i **20 rami remoti con la PR gia MERGED**: `APERTE.md` e il diario.
5. ⚠️ **Credito basso: non spendere niente senza chiedere.**
Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
