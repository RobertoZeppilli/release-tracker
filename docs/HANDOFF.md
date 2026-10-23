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

**Da dove ripartire (sedicesimo giro, 2026-10-23): la #170 è scritta, committata e verificata, e il
push è da fare a mano.** Commit `5d3bf7c` sul ramo `170-notifiche-campanella`, 23 file: la modalità
auto ha negato il `git push`, quindi il ramo **non è su GitHub e la PR non è aperta**. Servono
`git push -u origin 170-notifiche-campanella` e poi `gh pr create`, col corpo che chiude la #170 in
inglese (`Closes #170`). Questo file non va pushato finché la PR è aperta: un push riavvia la CI.

### Cosa ha portato la #170

La campanella col numero, il pannello che elenca le Notifiche, il Visto che fa scendere quel numero
senza ricaricare, in cinque lingue. Il numero si legge **dal browser**, come lo stato di accesso, e
`pnpm build` mostra le cinque pagine della landing ancora `●` SSG: era il criterio della issue.

Il comportamento accessibile del pannello (Esc, il focus che torna al grilletto, la trappola del Tab
sul telefono, lo scroll bloccato dietro la sheet) è stato **estratto in `src/components/sheet.ts`** e
lo usano sia la campanella sia il pannello account: `site-header-bar.tsx` è scesa da 295 a 250 righe.
`DESIGN.md` ha la sezione *Notification Bell*.

⚠️ **Il Digest settimanale non è nella lista né nel conteggio**, di proposito: la riga su cui
stamparlo arriva con la **#173**, e chi la fa deve togliere il filtro `SHOWN` in
`src/modules/notifications/ui/notifications-store.ts` o le sue Notifiche resteranno invisibili.

⚠️ **La voce `notifications` nella pagina privacy è ancora da scrivere**, in cinque lingue (ADR 0009).
È stata lasciata alla **#171**, che aggiunge i canali e la lingua preferita: la prosa conta le voci a
parole ("Six things"), quindi si passa da sei a nove **una volta sola** invece di due.

### Le due misure della campanella, che non sono due gusti

1. **A 320px in tedesco la barra sforava lo schermo di 7px** con la campanella dentro. Rimedio: il
   gap delle azioni scende a 12px sotto i 640 e resta 16 sopra, lo stesso passo che la riga fuori dal
   gruppo prendeva già. Il test che lo tiene è in `tests/e2e/notifications.spec.ts`.
2. **Il numero visibile si ferma a `9+`**: la barra ha 25px di slack misurati e due glifi è quello
   che comprano, e la cifra esatta sta nel nome accessibile e nel pannello.

### ⚠️ Il dev server riusato si impunta, e un rosso locale non è un rosso

In **dev** fallivano cinque test di `account`, `keyboard`, `navigation` e `overflow`, e **tutti
passano contro il build di produzione**, quello che gira in CI; lo stesso server ha anche risposto
**404 su `/api/test/session`**, una rotta che esiste. Ucciderlo è tutto il rimedio, quindi un rosso
locale si rigira con `CI=1 pnpm test:e2e <suite>` prima di crederci, e somiglia al tema della **#178**.
⚠️ Il build va rifatto prima di un giro `CI=1`: la prima volta il 320px è fallito contro un
`pnpm start` che serviva un build anteriore alla correzione.

### Le verifiche

`lint`, `typecheck`, `test` (729), `test:integration` (82), `build`, e contro il build di produzione
`notifications` 8/8, il gruppo `account keyboard top-bar overflow navigation notifications` 61/61,
`a11y` 61 col pannello scansionato da axe nei due temi in inglese e nelle altre quattro lingue.

⚠️ **Resta rosso `a11y › the folded digest list of a Technology page`, e non c'entra con la #170**: il
database locale ha **zero Tecnologie**, quindi `/technologies/vite` non esiste e il test non ha niente
da misurare. Serve il Catalogo importato in locale.

### Cosa resta

1. **Push e PR della #170**, i comandi sopra. Poi `merge` e cancellazione del ramo, che sono
   dell'utente: la modalità auto li nega.
2. **La prossima issue si sceglie insieme.** Le Notifiche dopo la #170: **#171** `/settings` col segno
   `Pro`, i giorni di prova e le due voci della privacy, **#172** Slack, **#173** email e Digest come
   entità, **#174** Lemon Squeezy, obbligatoria al lancio per l'ADR 0009 e da aprire presto per i
   tempi del Merchant of Record. C'è anche la **#178** (E2E di misura instabili e il
   `timeout-minutes` che la CI non ha). Non scelte: **#65**, **#130**, **#69**, **#176** (Redis: la
   risposta è non adesso, ma dentro c'è il rate limiting, che non esiste da nessuna parte).
3. ⚠️ **Francese, spagnolo e tedesco non sono rivisti da madrelingua**, e l'ADR 0008 chiede quella
   revisione **prima del lancio**, non prima del merge.
4. **I due debiti di sempre** (i 14 KB con le `max-[]`, il mock con `groupByMajor`) stanno in
   `APERTE.md`, coi rami arretrati: cancellarli è dell'utente.
5. ⚠️ **Credito basso: non spendere niente senza chiedere.**
Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
