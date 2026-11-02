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

**Da dove ripartire (venticinquesimo giro, 2026-10-29): la #194 e la #199 sono chiuse e mergiate
(PR **#200**, squash), CI verde, e il prossimo lavoro si sceglie dalla lista qui sotto.** `main`
remoto a `648db0c`; ⚠️ **il `main` locale e' indietro e il ramo in uso e' ancora
`settings-riordinata`**: la modalita' auto nega `git pull`, li rimette in pari l'utente. Albero
pulito a parte i file del diario. **#197 chiusa** misurando: zero 404 sotto
`/technologies` nei Runtime Logs, quindi nessun rimedio (strada 3, le misure restano nella issue).
⚠️ **Quattro rami da cancellare**, in remoto e in locale: `settings-riordinata` (mergiato ora),
`sitemap-una-lingua`, `letture-senza-pagina`, `grant-notifiche-service-role`: sono dell'utente.

### La pagina Settings riordinata (#194)

Due zone, `h2` a 18px sul token `--text-title` e con l'iniziale maiuscola (**Language**,
**Notifications**), dentro solo `h3`: `h4` e `h5` spariti, perche' la struttura dei titoli e'
lettura assistiva (WCAG 2.2 AA, 1.3.1). `settings.notifications.external.title` cancellata nelle
cinque lingue: i canali esterni sono un concetto, non un titolo, e il segno `Pro` col conteggio
stanno sull'`h3` di Slack. Campo manuale del webhook **solo quando `slackOauth` e' falso**, cioe' in
sviluppo e in CI. Le due scelte della lingua stanno nella stessa zona, e **"language of slack"
compare solo a canale aggiunto** (chiesto dall'utente): vive in `preferred-locale-section.tsx`, nel
modulo Notifiche perche' l'azione che salva e' sua e l'indice `server` e' `server-only`.
⚠️ **I riferimenti all'email sono tolti da tutte le parole visibili**, cinque lingue, perche' la
#173 non e' sviluppata. Il canale `email` resta nel dominio e nel database.

### Il modal, e il tasto che apre la prova (#199)

**Primo dialog dell'app**: `@radix-ui/react-dialog`, `src/components/ui/dialog.tsx` ristilizzato sui
token. Deciso e registrato in `docs/DECISIONI.md` (riga Dialog), e le due frasi che dicevano "in
quest'app non se ne apre nessuno" sono corrette qui e in `DESIGN.md`: **un dialog spiega un passo che
porta fuori dall'app, e non e' mai la guardia di un atto distruttivo**, che resta la parola scritta
controllata sul server.
⚠️ **L'apertura e' tenuta a mano con `useState`, non dal `Trigger` di Radix**: `composeEventHandlers`
salta il suo handler quando il figlio ha fermato il default, quindi un link dentro al `Trigger` o
naviga via o non apre niente. Il bottone resta un link: senza JavaScript deve raggiungere
`/slack/install`.

**Le spiegazioni del piano Pro sono tagliate** su richiesta dell'utente (tre paragrafi nella pagina,
cinque righe nel modal). Restano una riga nel modal, la riga accanto al tasto e il conteggio. **Il
tasto `start the 30 day Pro trial`** e' l'unica porta in produzione finche' la #174 non vende Pro, e
**Slack si disegna solo a prova aperta**; in sviluppo sempre, per poterci lavorare (`devPreview`).
⚠️ **Una Server Action non revalida da sola**: il tasto scriveva la riga e la pagina restava quella
di prima. `revalidatePath("/[locale]/settings", "page")` sta ora in `startProTrial` e in
`saveSlackWebhook`, col **pattern della rotta** e non `/settings`, che sotto `[locale]` non esiste.
⚠️ **Due cose non hanno prova automatica, dichiarate dentro gli e2e**: la disposizione di produzione
senza campo manuale, e il modal; servono le credenziali Slack, che la CI non ha.
`tests/e2e/slack-dialog.spec.ts` **si salta da solo** senza di esse e gira cosi':
`SLACK_CLIENT_ID=0000000000.1111111111 SLACK_CLIENT_SECRET=finto pnpm dev`, poi
`pnpm test:e2e slack-dialog`. ⚠️ In locale "procedi su Slack" dara' sempre `Invalid client_id`:
Slack rifiuta `localhost` come `redirect_uri`, quindi la sua meta' del giro si prova in produzione.

### Lo stato dell'ambiente, lasciato cosi'

Database locale col Catalogo vero: **1945 Release e 60 Tecnologie**. ⚠️ Lo stato Slack del database
locale e' stato **azzerato** (segreto, hint, inizio della prova). ⚠️ `db:reset` cancella l'utente di
sviluppo: `pnpm dev:login`. Resta uno `stash@{0}` non nostro. **Nessun server sulla 3000.**

### Cosa resta

1. **#198** cosa include Pro e cosa resta gratis, `ready-for-human`: sblocca la #174 e le parole di
   `/settings`. Senza, il tasto della prova dice solo quello che ADR 0009 ha gia' deciso, cioe' che
   senza Pro Slack tace e la campanella resta.
2. **I due accertamenti della #190 che solo l'utente puo' fare**, in coda alla PR #195: le Release
   in **produzione** con `created_at` negli ultimi trenta giorni, e **Max rows** su Supabase.
3. ⚠️ **Le scritture ISR hanno toccato il 100% il 2026-10-23**: misure in `docs/handoff/PESO.md`. La
   leva che resta non e' codice: **accorpare i deploy di produzione**.
4. Poi si sceglie insieme: **#173** email e Digest, **#174** Lemon Squeezy (obbligatoria al lancio); non scelte **#65**, **#130**, **#69**, **#176**, e **la #185** va riscopata o chiusa.
5. ⚠️ **Tre cose vive stanno in `APERTE.md` e `AMBIENTE.md`**: le due misure su `max_rows`, le due
   cose non viste di Slack (che un messaggio **arrivi**, e la distribuzione pubblica della app
   Verdict), e la e2e che nomina una fixture nel sitemap e cade solo in CI.
6. ⚠️ **Francese, spagnolo e tedesco non rivisti da madrelingua** (ADR 0008, prima del lancio): le
   parole nuove di questo giro sono tante.
7. **I due debiti di sempre**: `APERTE.md` e il diario. ⚠️ **Credito basso: non spendere senza chiedere.**
