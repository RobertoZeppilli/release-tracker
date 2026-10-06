# Handoff, release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.

## Leggi prima di tutto (non ripetere il contenuto qui)

- Questo file è **lo stato vivo**: leggilo tutto. Il diario delle sessioni passate sta in
  `docs/handoff/`, un file per mese, e **non va letto per intero**: l'indice è in "Archivio delle
  sessioni" qui sotto, e si apre un file solo per la voce che serve.
- **PRD: issue #1** (user story, moduli, criteri di accettazione per fetta, test, fuori scope).
- `PRODUCT.md`, `CONTEXT.md` (glossario + nomi inglesi canonici), `docs/DECISIONI.md`, `docs/adr/0001…0007`.
- `DESIGN.md` e i mock approvati in `design/mocks/` (`release.html`, `technology.html`, `dashboard.html`,
  `technologies.html`; stati col selettore "page state", `technologies.html?state=…`).

## Stato

**Da dove ripartire (2026-10-06, notte).** **Il ritento dei transitori è fatto**, con la **PR #107**,
unita su `main` (`9b0fe58`), e il branch `catalog-sync-transient-retry` è cancellato in locale e su
GitHub. **`CI` e `Deploy database` verdi** sul merge (run 37520785712, `integration` in 6m24s):
**151 E2E, 1 saltato, zero flaky**.
**Niente da verificare in produzione**: il lavoro tocca solo gli adattatori usati dai job server, e
il suo effetto si vede unicamente quando una Fonte fa i capricci. La prima occasione in cui gira per
davvero è il `catalog:sync` del prossimo deploy.

**Chiesto dall'utente senza aprire una issue**, come già per il flake sui follow: `CLAUDE.md` chiede
un branch e una PR, e questa volta li ha avuti tutti e due, quindi **non è un'eccezione come la
#104 o `4645504`**. La PR non chiude niente e il corpo lo dice.

**Non c'è nessuna issue `ready-for-agent`**, quindi il lavoro seguente si sceglie fra le strade
aperte qui sotto e vuole il via dell'utente. **Le issue non si prendono per ora, per scelta
dell'utente**: ci si torna quando avrà credito sul conto.

### Il ritento dei transitori, e perché la diagnosi prima era mal puntata

La CI su `main` è caduta sul commit dei documenti `ff92122`, e **la causa non era il commit**: GitHub
ha risposto **504** alla terza pagina delle release di `electron`, `catalog:sync` è uscito con codice
1 e si è portato via `build` e gli E2E, che non sono mai partiti. `check` e `test:integration` erano
verdi. Rilanciato il solo job fallito (`gh run rerun <id> --failed`) è passato: **151 E2E, 1 saltato,
zero flaky**.

⚠️ **Da non ridiagnosticare da zero**: `sync-catalog.mts` **già** tollerava la Tecnologia che cade e
tirava avanti con le altre, il suo commento lo dice da sempre. Il buco stava un livello sotto:
**nessuna delle quattro chiamate HTTP** degli adattatori ritentava mai, quindi un transitorio era
definitivo. Misurato a mano: quella pagina di `electron` risponde **200 in 4,5 secondi**, cioè sta sul
bordo del timeout di GitHub, ed è per questo che un ritento è la cura giusta e non un cerotto.

- **`retrying.ts`** (25 righe) avvolge un `fetch` e riprova secondo un calendario di attese,
  `[1s, 4s]` per difetto. **Il calendario è la politica**: un test lo mette a zero e non aspetta
  niente, che è il motivo per cui è un parametro e non una costante nascosta.
- `createSourceAdapters` avvolge **una volta** il `fetch` che riceve per iniezione, e le quattro
  chiamate (npm, le due di GitHub, il CHANGELOG) ritentano senza sapere di farlo. Nessuna logica di
  nessun adattatore è stata toccata.
- **Si ritenta un 5xx o una connessione che non si è mai aperta. Non un 4xx**, perché è una risposta,
  **e nemmeno il 429**: il limite di GitHub si azzera in minuti o in un'ora, quindi riprovare dopo 4
  secondi lo ripeterebbe soltanto e nasconderebbe perché la corsa è tornata vuota. È una scelta, non
  una dimenticanza.
- I quattro test nuovi passano per `createSourceAdapters` e non per la funzione nuda, così provano
  anche che il ritento sia arrivato davvero agli adattatori.

**Verifiche**: `lint` e `typecheck` puliti, **537 unitari** (533 più 4). File a 187 e 25 righe: il
ritento è uscito da `source-adapters.ts` perché lo portava a 208 righe, oltre il limite di ~200, e la
separazione è comunque quella giusta (la politica del trasporto non è la grammatica delle Fonti).

**Decisione lasciata aperta di proposito, non un difetto.** Se dopo i tre tentativi una Tecnologia
resta fuori, lo script esce ancora con **codice 1**, e in CI questo continua a portarsi via `build` e
gli E2E. È un segnale voluto, ma vuol dire che una Fonte giù per davvero blocca una suite che non
c'entra niente. È una riga da cambiare, e l'utente non l'ha ancora decisa.

⚠️ **Trappola pagata in questa sessione**: il primo commit ha preso il titolo `@`, perché la sintassi
PowerShell (`@'...'@`) è finita nel tool Bash. Il controllo del messaggio **prima** del push l'ha
intercettata e l'`--amend` l'ha corretta. Le due shell vogliono due sintassi: heredoc in Bash.

### Lo stage, pensato con l'utente e non ancora deciso

L'utente ha proposto, **a lancio avvenuto**, un ambiente di stage su cui provare prima di mandare in
produzione, da fare **dopo** la #65. Di stage non si era mai parlato prima: cercato in
`docs/handoff/`, `DECISIONI.md` e `docs/adr/`, non c'è niente. La mia raccomandazione, **che gira
l'ordine** e che l'utente non ha ancora accettato:

1. **Lo stage copre metà della #65.** La strada 1 (dump di produzione in locale) serve a due cose,
   gli stessi UUID per provare un SQL e **Sintesi vere** sotto gli occhi: sono esattamente quelle che
   dà uno stage, e le dà meglio, perché i dati di produzione non finiscono sul disco dello
   sviluppatore. Con lo stage la **strada 1 diventa inutile** e in locale resta solo la **strada 2**,
   la più economica, che vale comunque da sola.
2. **Il pericolo vero non è il locale, è il preview**: oggi i preview puntano al database di
   produzione, e `catalog:sync` di un preview scriverebbe in produzione il Catalogo di quel branch.
   Costa meno aggiustarlo **prima** del lancio, perché dopo ogni errore cade su dati di utenti veri.
   Qui sono in disaccordo col "una volta lanciata l'app" dell'utente, almeno per la parte minima.

**Ordine raccomandato**: strada 2 della #65, poi un database non di produzione per i preview, e solo
dopo il lancio lo stage completo con una copia fresca e un passo di promozione.

**Da verificare prima di decidere, non dato per certo**: quanti progetti regge il piano gratuito di
Supabase e dopo quanto mette in pausa un progetto inattivo (uno stage è inattivo per definizione); e
se gli ambienti personalizzati di Vercel chiedano un piano a pagamento. La versione gratuita e sicura
è un **secondo progetto Vercel** che punta al Supabase di stage e si distribuisce da un branch.

**Tre cose che lo stage non deve ereditare**, ed è dove batte la regola sulla spesa: **nessuna
`ANTHROPIC_API_KEY`** (lo schema Zod la tiene opzionale proprio per questo: senza chiave i job
rispondono 503, e uno stage non deve poter generare Sintesi nemmeno per sbaglio); **nessun cron di
Rilevamento** (due ambienti alle 02:00 raddoppiano il traffico verso GitHub e npm per niente); un
**`CRON_SECRET` suo**. Quando si farà è roba da **ADR**, non solo da issue: rovescia una riga
dell'ADR 0005, cioè che i preview condividono il database di produzione.

**Lo stato precedente (2026-10-06, sera tardi).** **La #64 è chiusa**, con la **PR #106**, unita su
`main` (`a3ca8c4`): l'issue si è chiusa da sola col `Closes #64`, e il branch
`64-follow-moves-the-row` è cancellato in locale e su GitHub. `Deploy database` verde.
**È verificata in produzione, dall'utente in persona**: su `/technologies` la riga passa fra le
seguite alla pressione, senza aggiornare. La issue era `ready-for-human` e la scelta è stata presa
con lui in chat, sulla **strada 3**: la riga si sposta subito, il focus la segue, **niente
animazione**.

**Non c'è più nessuna issue `ready-for-agent`**, quindi il lavoro seguente si sceglie fra le strade
aperte qui sotto e vuole il via dell'utente.

**Perché la strada 3 adesso.** Il 2026-10-03 era stata scelta la **strada 1** (lasciare la riga dov'è
e rendere onesti i conteggi), fatta con la PR #91 dentro la #47. Quella sessione aveva scritto il
criterio per il passo dopo: *se dopo i conteggi onesti la lamentela sopravvive, il passo seguente è
la strada 3, non la 2*. La lamentela è sopravvissuta, con queste parole dell'utente: "si ma devo
comunque aggiornare per vederla nei seguiti". Quindi il criterio era già deciso e non è stato
ridiscusso: si è discussa solo **la forma**, perché la strada 3 tocca una regola di sistema
(`DESIGN.md` dichiara **un solo momento di moto**, la sottolineatura dei caret, e lo mette fra i
"Do"). L'utente ha scelto lo **spostamento istantaneo senza moto**, scartando la variante col
richiamo che si accende sulla riga arrivata.

**Il capovolgimento è registrato dove stava la decisione di prima**: `DESIGN.md`, "Picker Sections
(Technologies)", che adesso racconta i due passi e il perché del secondo. Era il criterio più scomodo
della issue, e la strada 1 lo aveva evitato perché non rovesciava niente.

**Com'è stata fatta.** Il dominio non è stato toccato: `liveSections` sapeva già dove ogni riga
appartiene, e serviva solo passarlo alla resa invece che ai soli conteggi.

- `technology-picker.tsx` rende `live.following` e `live.catalog`. **`retired` resta lo scatto del
  server**: una ritirata lasciata andare non appartiene più a nessuna sezione e deve restare lì a
  dirlo, quindi è l'unica riga che ancora non si muove (e l'unica che passa ancora `belong`).
- **Il focus è quello che paga lo spostamento.** Il toggle è un nodo nuovo nella sezione nuova, e il
  browser lascia il focus sul body: `pressedAt` nel provider (un **tick**, non un flag, perché
  premere due volte la stessa riga deve contare due volte) dice al toggle che la pressione era sua, e
  lui se lo riprende. Se lo riprende anche **quando il database rifiuta** e la riga torna indietro,
  che era un buco della forma vecchia. Non ruba niente a un focus che sta ancora da qualche parte,
  quindi la pagina Technology e la scorciatoia della Dashboard vuota non cambiano.
- **La nota "si sposta alla prossima visita" è sparita**, con tutta la variante `note` della Row
  Status Line: diceva una cosa che adesso fa la riga stessa. Restava una sola variante, quindi la
  geometria è rientrata in `follow-rejection-note.tsx` e `row-status-line.tsx` è cancellato. In
  `DESIGN.md` il titolo torna **"Row Error Line"**, con scritto perché la variante è uscita.
- Il mock `technologies.html` si comporta come la pagina: dipinge le liste dai follow invece di
  rattoppare le righe dove stanno, e rimette il focus. Lo stato `moved` del selettore "page state"
  **non esiste più**: non c'è più niente di statico da mostrare, lo si vede premendo un toggle.
- Il diff è **-41 righe**: lo spostamento ha tolto più codice di quanto ne abbia aggiunto, perché
  conteggi e righe non devono più essere tenuti d'accordo a mano.

**Verifiche fatte**: `lint` e `typecheck` puliti, **533 unitari**, **63 di integrazione**, **152 E2E**
(151 prima, più quello nuovo) **con zero flaky**. Nel browser, mock e app nei **due temi**: la riga
passa in `following`, `following (6)` / `catalog (31)` / `framework (5)` d'accordo fra loro, il focus
resta sul toggle spostato e il giro di ritorno rimette tutto com'era. Il database locale è stato
lasciato com'era (5 follow).

**Tre test E2E in `technologies.spec.ts`** tengono fermo il comportamento: la riga si sposta al
follow, torna all'unfollow, e **"the press keeps its place when the row moves, in both directions"**,
che preme da tastiera e pretende il focus sul toggle nella sezione nuova.

**Il giro in produzione è fatto e funziona**, ed era il posto dove la lamentela era nata. Con lui la
segnalazione che aveva aperto la #64 il 2026-09-29 è chiusa per davvero: la strada 1 l'aveva solo
resa onesta, questa le risponde.

**Lo stato precedente (2026-10-06, sera).** **La #100 è chiusa**, con la **PR #105**, unita su `main`
(`9b91fab`): l'issue si è chiusa da sola col `Closes #100`, e il branch `a11y-upgrade-path-wait` è
cancellato in locale e su GitHub. `Deploy database` verde. **Niente da verificare in produzione**: il
lavoro tocca un solo file di test e nessuna riga di `src/`. **Le due box della Dashboard sono
verificate in produzione**, dall'utente in persona: lo stato di prima sta nel diario di ottobre.
**Non c'è più nessuna issue `ready-for-agent`**, quindi il lavoro seguente si sceglie fra le strade
aperte qui sotto e vuole il via dell'utente.

**E nella stessa sessione è caduto anche il flake sui follow**, chiesto dall'utente **senza aprire una
issue**: la causa era una sola e la spiegazione sta nella sua sezione qui sotto. Con lui **non resta
nessun flake noto** in E2E.

**Dove sta `main` e come ci è arrivato.** La punta è **`4645504`**, e sopra la PR #105 ci sono due
commit andati **diretti su `main`, senza branch nè PR**: `32700e5`, i documenti, che è la via normale,
e `4645504`, il lavoro sul flake, che sono cinque file di test. Il secondo è **un'eccezione concessa a
voce dall'utente** ("va bene così, lascia su main") dopo che gliel'ho fatto notare: `CLAUDE.md` chiede
un branch e una PR anche per i test, quindi **non è la regola nuova**, come già per la PR #104. Le
corse di tutti e due sono **verdi**, e quella di `4645504` (run 37488338400) è la prova che si voleva:
è la prima che gira le attese nuove contro il build di produzione, e il riassunto di Playwright legge
**150 passati, 1 saltato, zero flaky**, dove la corsa del merge della #100 ne contava **2** (sempre i
due test sui follow). I retry in CI restano 2, ma qui non sono serviti.

**Com'è stata fatta la #100.** Il flake era nelle attese del test, non nella pagina, e `UpgradePathBlock` e
`UpgradePathView` **non sono stati toccati**: il diff è di 7 righe in `tests/e2e/a11y.spec.ts`. Le
due attese ora nominano un fatto che solo la resa risolta può portare, perché la partenza del
fallback è quella ricavata:

1. `?from=1.8.9`: la frase che apre il Cammino, `Between 1.8.9 and 2.0.0 there are 2 releases`. Il
   fallback scrive `Between 1.9.0 and 2.0.0 there is 1 release`, perché la sua partenza è `1.9.0`,
   l'ultima stabile della major precedente. **Il verdetto non bastava**: il testo dell'`h2` è
   `warning: 1 needs action` in tutte e due le rese, quindi la strada del `getByRole("heading")`
   suggerita dalla issue non distingueva niente.
2. `?from=9.9.9`: il rifiuto che nomina la Versione rifiutata,
   `9.9.9 is newer than 2.0.0, the latest stable release.`. Lì il fallback scrive la nota della
   partenza ricavata. **Era lo stesso difetto latente nel test accanto**, stesso file e stessa causa,
   e l'ho corretto insieme.

Fuori da `a11y.spec.ts` il doppione non si presenta: in `keyboard.spec.ts:126` e nei giri di
`upgrade-path.spec.ts` il Cammino arriva da un submit del form, cioè da una navigazione del client
senza fallback. **Non sono stati toccati**, ed è il motivo per cui `#path-verdict` vive ancora là.

**Verifiche fatte prima del merge**: `lint` e `typecheck` puliti e **undici giri di fila** di
`pnpm test:e2e a11y.spec.ts`, 30 su 30 ciascuno, l'ultimo a `.next` cancellata. Cancellare `.next`
mentre il `pnpm dev` dell'utente gira sulla 3000 **non lo ha incartato**: ha ricompilato da solo e
ha risposto 200.

⚠️ **La CI del merge è stata cancellata una seconda volta, ma la causa non è quella di prima.**
Nessuno ha pushato niente su `main` durante la corsa: la richiesta che l'ha soppiantata (sempre
`Canceling since a higher priority waiting request for ci-refs/heads/main exists`) è **la corsa
`pull_request` della PR #105**, che era rimasta in coda e si è messa in moto alle 14:52, cioè
**sette minuti dopo il merge**, sullo stesso sha `cbd17dd`. Da ricordare per il prossimo merge:
**prima di unire, guardare se la corsa della PR è finita** (`gh pr checks <N>`), perché una corsa in
coda che arriva dopo il merge si porta via la corsa del merge. La buona notizia è che la corsa
cancellata **aveva già fatto tutto**: `check` verde, e dentro `integration` i passi
`test:integration`, `build` e `test:e2e` tutti riusciti (148 passati, 2 flaky ritentati, 1 saltato);
la cancellazione ha preso solo i passi di chiusura.

**La domanda lasciata aperta dallo stato di prima è chiusa**, e vale come rimedio: la corsa
rilanciata a mano (37475231634) era stata cancellata anche lei, ma la corsa nata dal **commit dei
documenti** su `main` subito dopo (37476164810) è **verde**, quindi `ac4732d` aveva la sua corsa. È
la via più economica di un `gh run rerun`: un commit di documenti su `main` fa partire una corsa sua,
e questa sessione si chiude così.

**Lo stato precedente (2026-10-06, notte).** **La #86 è chiusa**, con la **PR #102**, unita su `main`
(`d048447`), e il branch è cancellato in locale e su GitHub. `CI` e `Deploy database` verdi su `main`.
Prossimo lavoro: la **#87** (il trattino lungo nelle Sintesi), poi le due box della Dashboard.

**La #86 è verificata in produzione**, su `/technologies`: il Catalogo è `catalog (31)` diviso nei
dieci generi, e la somma dei gruppi fa 31 (`language 1`, `runtime 3`, `framework 6`, `server framework 4`,
`database 2`, `build tool 2`, `testing 4`, `lint and formatting 3`, `library 4`, `platform 2`: i sei
seguiti mancano perché stanno in `following`, che non è raggruppata). Con `?filter=test` legge
`3 of 37 match`, `catalog (3 of 31)` e lascia il solo gruppo `testing (3 of 4)`.
⚠️ **La migrazione è andata in produzione prima del merge**, col dispatch di `deploy-database.yml`
sul branch della PR (run 37463104730, lanciato dall'utente: il classificatore lo blocca all'agente).
È la via da riusare per ogni migrazione futura, e funziona perché il workflow fa il checkout del ref
che gli si dà. La dashboard di Supabase non serve.

**Chiesto dall'utente a cose fatte e scartato: i generi a fisarmonica.** Non è stato scritto niente.
Le tre ragioni, per non ridiscuterle da zero: un accordion vuole uno **stato** per gruppo (aperto o
chiuso, se ricordarlo fra le visite, come si arriva sulla pagina); **collide col filtro**, che è la
trappola che la issue segnalava già, perché cercare `zod` con `library` chiuso fa dire alla pagina
`1 of 37 match` senza mostrare niente, e l'unica uscita è aprire d'ufficio i gruppi con
corrispondenze, cioè disfare il collasso proprio quando serve; e **spegne il Ctrl+F del browser** su
una pagina che è un elenco di nomi. In più nell'app non esiste nessun disclosure, quindi sarebbe un
pattern nuovo per tutto il sistema. **L'alternativa raccomandata, se la pagina sembra lunga**: un
indice dei generi in cima, dieci link ancora su una riga sotto il filtro, senza stato e senza
toccare il filtro. Non è stata scelta: se si fa, è una issue sua.

**I quattro nodi HITL della #86, decisi con l'utente. Da non riaprire:**

1. **`library` resta un genere**, definito in positivo in `CONTEXT.md` (si importa nel codice, non
   detta la forma del progetto come un `framework`, non gira da fuori come un `build tool`). Niente
   gruppo "altro", niente spacchettamento in `styling`/`state management`/`validation`/`http client`.
2. Nome inglese canonico: **`category`** (`kind` era già preso da `Source.kind`).
3. Il genere compare **solo su `/technologies`**: non sulla pagina Technology, non sulla Dashboard.
4. Col filtro, **un gruppo senza corrispondenze si nasconde**, come già fa una sezione; il titolo
   `catalog` continua a contare su tutto il Catalogo.

In più, deciso da me con la ragione scritta in `DESIGN.md`: la sezione `catalog` **tiene il suo
titolo e il suo conteggio** (e la Limit Note sotto), e i dieci generi sono `<h3>` con lo stesso
Section Title un livello più in basso; l'ordine dei generi non è alfabetico ma quello di
`CONTEXT.md`, dal linguaggio alla piattaforma.

**Com'è stata fatta**: `category.ts` tiene l'insieme chiuso dei dieci generi e il loro ordine, la
migrazione `20261006112355_catalog_categories.sql` ha enum, backfill per slug e un `DO` che si ferma
con un messaggio leggibile se una Technology resterebbe senza genere, `groupByCategory` sta nel
dominio del picker e la resa in `plans/ui/picker-section.tsx`. Le fixture di E2E e di integrazione
dichiarano una `category` (il fixture principale è una `library`, i filler un `platform`). Alla
chiusura: 528 unitari, 63 di integrazione, 150 E2E, nessun flake in quella corsa.

### Il flake sui follow è chiuso, e la causa era una sola

Era il flake che tornava da sessioni, su una corsa completa su due, in due test:
`current-version.spec.ts:89` ("is not touched by `?from=`") e `technologies.spec.ts:86` ("a Developer
unfollows a Technology and it stays unfollowed after a reload"), e una volta anche
`current-version.spec.ts:65`. **Chiuso il 2026-10-06 senza una issue**, su richiesta dell'utente.
Nessuna riga di `src/` toccata.

**La causa**: il Follow Toggle risponde **prima** del database (la mutazione ottimistica in
`follows-provider.tsx`), e i test premevano e poi chiedevano al server, con un `reload`, un `goto` o
una dichiarazione scritta sulla follow, mentre la scrittura era ancora in volo. Sotto quattro worker
la finestra si allarga, e usciva in due modi che sembravano difetti diversi:

- la dichiarazione arriva prima della follow, aggiorna zero righe e la pagina legge
  `error: The version in use was not saved. Try again.`;
- il `reload` legge lo stato vecchio, oppure la scrittura atterra **dopo la fine del test** e lascia
  una follow addosso alla Technology, che in `afterAll` diventa `follows_technology_id_fkey`.

**Un secondo difetto, vero e indipendente**: `seedTechnology().remove()` cancellava releases, sources
e technologies **ma non le follows**, mentre `seedFillers().remove()` le cancella da sempre. Bastava
una follow rimasta per far fallire la pulizia. Ora le cancella per prime.

**La forma dell'attesa, da riusare**: il prodotto ha già il suo segnale, **`aria-busy` sul Toggle**,
vivo finché la mutazione è in volo. `followWritten(toggle)` in `tests/e2e/fixtures.ts` aspetta che
sparisca, ed è chiamato dove un test chiede al server quello che ha appena premuto
(`current-version.spec.ts` nella sua `follow()`, `technologies.spec.ts`, `technology-follow.spec.ts`,
`keyboard.spec.ts` prima del salto alla Dashboard). Dove il Toggle sparisce con la follow, cioè sulla
Technology ritirata, l'attesa è sulla pagina: `[aria-busy=true]` a zero. **Non aspettare il bottone**:
quello ha già cambiato idea, ed è il motivo per cui il test mentiva.

**Verifiche**: `lint` e `typecheck` puliti e **tre corse E2E complete di fila**, 151 su 151 ciascuna,
con i retry locali a 0, cioè senza la rete di sicurezza che in CI mascherava il difetto.

### Le strade aperte

⚠️ **Le issue sono sospese per scelta dell'utente** (2026-10-06): "lasciamo perdere le issue, ci
torneremo quando avrò soldi sul conto". Non proporne una come lavoro seguente finché non lo rilancia
lui. Quello che si è fatto dopo quella frase è nato dalle sue richieste dirette, senza issue.

Tutto quello che era stato scelto è chiuso, quindi restano solo le issue aperte, e **non ce n'è
nessuna `ready-for-agent`**: qualunque strada qui sotto vuole il via dell'utente. Sono tutte
`ready-for-human`: **#93** (prompt **v6**, con la terza uscita sulle note giudicabili) e **#57**
(Haiku invece di Opus) **spendono** su Anthropic; **#65**, tecnica, serve solo il via, e adesso va
letta insieme allo stage (vedi lo Stato: la strada 1 potrebbe non servire più); **#80** (tocca GitHub
e npm, non Anthropic, ma genera Sintesi a valle, quindi **a costo zero solo scegliendo la strada 1 o
la 3** della issue); **#26** la landing page, ferma sul nome del prodotto; **#69** esplicitamente
dopo il lancio.

**Fuori dalle issue, due cose vive e non decise**, nate in chat il 2026-10-06 e scritte nello Stato:
l'**exit code di `catalog:sync`** quando una Fonte è giù per davvero, e l'**ordine stage / #65** con
l'ADR da scrivere quando ci si arriverà.

**Chiesto e fermato dall'utente: l'audit visivo dell'app.** Aveva chiesto di lanciare una taste skill
per vedere se l'app potesse diventare più bella senza intaccare il funzionamento, poi ha detto
"fermati" a lettura appena iniziata. **Non è stata scritta nessuna proposta e nessun file è stato
toccato.** Due cose da sapere se si riprende: quelle skill sono scritte per landing page e portfolio
e dichiarano **fuori scope** le UI di prodotto come questa, quindi serve solo la loro parte di
*audit* (modalità redesign-preserve) e **`DESIGN.md` resta la legge**; e il dev server va chiuso a
fine giro, perché quello avviato per guardare le pagine era rimasto vivo.

Il primo comando della sessione nuova:

```
leggi docs/HANDOFF.md, controlla la CI su main e dimmi che strade sono aperte
```

---

## Archivio delle sessioni

Il diario delle sessioni sta in `docs/handoff/`, un file per mese, spostato lì parola per parola il
2026-10-06. **Non va letto per intero a ogni sessione**: questo indice elenca i titoli, e si apre il
file solo quando serve la voce. ⚠️ **Prima di dare qualcosa per non deciso, cerca lì dentro**
(`grep -rn "<parola>" docs/handoff/`): una decisione presa in una sessione vecchia resta valida anche
se questo file non la ripete. Le voci marcate ⚠️ sono trappole già pagate una volta.

**Come si tiene.** Lo stato nuovo si scrive in "Stato", qui sopra. Quando quello di prima diventa
storia, **si sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e
si aggiunge la riga qui sotto. Niente riassunti: un riassunto è dove si perde la ragione per cui una
cosa era stata decisa.

### Ottobre 2026 (`docs/handoff/2026-10.md`)

- Stato al 2026-10-06 (pomeriggio): le due box della Dashboard (PR #104)
  - ⚠️ La CI del merge si fa cancellare da una richiesta che aspetta, e si rimedia con `gh run rerun`
- Stato al 2026-10-06 (notte sul 07): la #87 chiusa (PR #103)
  - ⚠️ Le pagine della Release restano vecchie un'ora: sono ISR e la cache ignora l'antichache
  - ⚠️ `curl | python` decodifica in cp1252 e fa sparire il conteggio dei trattini lunghi
  - ⚠️ `workflow_dispatch` si risolve solo dal branch di default
- Stato al 2026-10-06 (sera): la #85 e la #83 verificate in produzione (PR #101)
  - ⚠️ Un push su `main` annulla la CI in corso
  - ⚠️ Il controllo a 390px non riesce ridimensionando la finestra: il viewport non cambia
  - La Versione di partenza ricavata e le scelte di forma della #85, da non riaprire
- Stato al 2026-10-06: la #88 e la #94 chiuse (PR #96 e #97)
  - ⚠️ Il 2026-10-06 il token di Supabase è stato abbandonato, non sostituito
- Stato al 2026-10-03: la #47 e la #84 chiuse
  - ⚠️ Una CI che non parte può essere solo una coda
  - ⚠️ La #94: il verdetto della Dashboard si contraddice, e non è una regressione
  - ⚠️ La lezione di sequenza, che vale per ogni migrazione futura
  - ⚠️ Lo stato dell'ambiente locale, perché l'ho cambiato io
- Sessione del 2026-10-05: il P2-9 e il gruppo della #64 (PR #90 e PR #91, unite)
- Sessione del 2026-10-04: il P0-1 della #47, le righe della pagina Technology (PR #89)
  - ⚠️ Due cose dell'ambiente, da non ricercare da zero
- Sessione del 2026-10-03 (2): la revisione del design, diagnosi (#47, nessuna PR)
  - ⚠️ Un branch per ogni intervento, non uno per tutta la #47
  - ⚠️ P0-2: un verdetto verde su una Release che la Sintesi ammette di non poter giudicare
- Sessione del 2026-10-03: il SEO delle pagine pubbliche (#24, PR #82)
- Sessione del 2026-10-02 (4): il formato dei tag delle Anteprime (#36, PR #81)
  - ⚠️ Le Note di rilascio si scrivono solo quando una Release nasce
  - ⚠️ Il rilevamento guarda solo avanti, quindi non si riprova cancellando una Release
  - ⚠️ Il tool Bash dimezza i backslash negli heredoc
- Sessione del 2026-10-02 (3): il filtro di /technologies nell'URL (#72, PR #79)
  - ⚠️ Un flake preesistente in `technologies.spec.ts`, da non attribuire al lavoro in corso
- Sessione del 2026-10-02 (2): la 404 e la pagina di errore (#25, PR #77)
  - ⚠️ Next serve la 404 e l'errore come un guscio senza layout, disegnato sul client
  - ⚠️ `notFound()` imposta lo status solo finché la risposta non ha iniziato a streammare
  - ⚠️ Un secondo `pnpm start` non si lega alla 3000 e il vecchio build continua a servire
- Sessione del 2026-10-02: la navigazione decisa e costruita (#63, PR #75)
  - ⚠️ `--spacing: initial`: le classi di spaziatura fuori dagli otto passi cadono in silenzio
  - ⚠️ La home era l'unico vicolo cieco totale, e nessuna issue lo diceva

### Settembre 2026 (`docs/handoff/2026-09.md`)

- Sessione del 2026-09-30: la Versione in uso costruita, e quattro cose imparate
  - ⚠️ `releases` non può importare `plans`, e la direzione si controlla prima di scrivere
  - ⚠️ Un provider che compare quando arriva la sessione rimonta tutta la pagina
  - ⚠️ `waitUntil: "networkidle"` non arriva mai, in produzione
- Sessione del 2026-09-29 (6): il budget dei caret misurato, e la Versione in uso
- Sessione del 2026-09-29 (5): #62, l'overflow della pagina della Release
- Sessione del 2026-09-29 (4): quattro segnalazioni dell'utente, misurate prima di scriverle
- Sessione del 2026-09-29 (3): #23, i mock uniformati e l'audit WCAG 2.2 AA
- Sessione del 2026-09-29 (2): #56 e #54, i due limiti della Sintesi
- Primo batch di Sintesi vero (2026-09-28, dopo il merge della #22)
- Sessione del 2026-09-28 (6): #22 Catalogo a 37 Tecnologie (PR #53 in `main`)
- Sessione del 2026-09-28 (5): #21 Dashboard, seconda parte (Latest, Previews, Weekly Digest)
- Sessione del 2026-09-28 (4): #20 Dashboard, prima parte (chiusa, PR #51 in `main`)
- Sessione del 2026-09-28 (3): il login in produzione atterrava sulla radice (nessun codice toccato)
- Sessione del 2026-09-28 (2): un accesso locale sulla pagina di login (PR #50 in `main`)
- Sessione del 2026-09-28 (1): #19 Follow sulla pagina pubblica della Tecnologia (chiusa, PR #49 in `main`)
- Sessione del 2026-09-27: #18 Limite Free e ritirate imposti dal database (chiusa, PR #48 in `main`)
- Sessione del 2026-09-26 (2): #17 Pagina `/technologies` con sezioni, filtro e follow ottimistico
- Sessione del 2026-09-26 (1): #16 Login con GitHub e rotte protette (chiusa, PR #44 in `main`)
- Sessione del 2026-09-24: #15 Cron giornaliero di Rilevamento e Sintesi
- Sessione del 2026-09-23 (4): #14 Set di valutazione delle Sintesi (chiusa, PR #42 in `main`)
- Sessione del 2026-09-23 (3): #14 Adattatore Anthropic reale (PR #41 in `main`)
- Sessione del 2026-09-23 (2): #13 Rivalidazione delle pagine pubbliche (chiusa, PR #40 in `main`)
- Sessione del 2026-09-23 (1): #12 Puntatori alle righe (chiusa, PR #39 in `main`)
- Sessione del 2026-09-22 (2): #11 Credito API esaurito
- Sessione del 2026-09-22 (1): #10 Pipeline delle Sintesi con un fake della Batch API
- Il primo Rilevamento in produzione è girato (verificato il 2026-09-26)
- Com'era il 2026-09-28: stato superato, tenuto per le note che valgono ancora

## Code da non perdere

Tre cose vive che fino al 2026-09-30 stavano **solo** in fondo a questo documento, sotto un titolo
vecchio che sembrava l'indicazione buona. La prima è diventata una issue; le altre due restano
dell'utente e di nessun altro.

- ~~Il filtro di `/technologies` fuori dall'URL~~: diventato la **#72** il 2026-09-30, **fatta** il
  2026-10-02 con la PR #79. Era l'unico pezzo di PRD che nessuna issue copriva, e con lei la user
  story 49 ("filtri e tab nell'URL") è chiusa per davvero: le sezioni di `/technologies` e della
  Dashboard non sono tab e il Cammino di upgrade era già nell'URL con `?from=`.
- ~~Web Analytics da attivare~~: **attivo**, confermato dall'utente il 2026-10-03.
- **Piano editoriale**: l'articolo dev.to della tappa D ("Enforce your free-plan limit in the
  database, not in the UI") è **pubblicato** dal 2026-09-28 (slug `-330p`) e al 2026-10-01 ha 4
  commenti e 1 reazione, il primo con discussione. Verificato il 2026-10-01: **3 articoli dev.to
  pubblicati e 0 bozze, 31 post su Bluesky**. In coda resta l'articolo della tappa C
  ("Exactly-once AI jobs"), **non scritto**, in attesa di giri di cron in produzione da citare.
  Materiale nuovo pronto e non pubblicato (il primo batch vero, le 4 fallite per il titolo, i caret
  misurati, le Sintesi visibili in produzione): sta nel vault, in
  `release-tracker-comunicazione.md`, sotto "Tappa D-bis".

**Dopo la #47, prima di dire che l'app è pronta**: un giro a mano nel browser su tutta l'app,
funzione per funzione, per capire se la percezione d'uso regge. La stella polare, detta dall'utente,
è la **facilità d'uso**: è uno strumento che rischia di risultare dispersivo (versioni ovunque,
sezioni, Cammino di upgrade, Catalogo), e la revisione deve ridurre quella dispersione, non solo
rifinire l'aspetto. Quello che ne esce diventa issue sue.

⚠️ **Il credito Anthropic dell'utente è basso e non può ricaricarlo per ora: non spendere niente senza
chiedere.** Due passi a mano restano fermi per questo, descritti in "Sessione del 2026-09-29 (2)":
l'SQL della #56 (reimportazione di 4 Sintesi, **costo zero**) e quello della #54 seguito da un submit
(**circa 25 centesimi**). Da ricordare per stare tranquilli: **un merge da solo non spende mai**,
perché i due cron delle Sintesi restano fuori da `vercel.json` e il submit si chiama a mano.

**Tema aperto, chiesto dall'utente**: uniformare il database locale e quello di produzione. È
diventato la **#65** il 2026-09-29, con le due strade scritte (dump vero, oppure Release
identificabili in modo stabile fra ambienti con Tecnologia + Versione, già unica in
`releases_technology_id_version_key`). Nessuna delle due è scelta, e l'utente l'ha messa **nel secondo
giro a pagamento**: non è lavoro da prendere adesso.

La `ANTHROPIC_API_KEY` è stata aggiornata su Vercel il 2026-09-29 e la produzione **è stata
ridistribuita** subito dopo, col push di questo documento: le funzioni hanno la chiave nuova. Da
ricordare per la prossima volta: una funzione porta con sé la fotografia delle variabili con cui è
nata, quindi cambiare una variabile su Vercel non basta, serve un redeploy.

Il **`GITHUB_TOKEN` c'è** dal 2026-09-30, in `.env.local` e su Vercel. Senza, GitHub concede 60
richieste all'ora e `pnpm catalog:sync` non arriva in fondo all'alfabeto: le Tecnologie in testa si
mangiano il budget e `vite` resta senza Release, che fa fallire `technology.spec` in modo del tutto
scollegato dal lavoro in corso. In locale è un token classico senza nessuno scope e senza scadenza; su
Vercel è un fine-grained con `Public Repositories (read-only)` e l'utente lo ha marcato **Sensitive**.
Conseguenza pratica da ricordare: il valore su Vercel **non si rilegge**, né dalla dashboard né con
`vercel env pull`, si può solo sostituire. Quindi che ci sia si controlla dal comportamento e non
guardando la variabile.

**Verificato il 2026-10-03: il token arriva davvero alla funzione.** Niente più da fare qui. Il
metodo, da riusare se il dubbio torna: `vite` 8.3.2 è stata pubblicata su npm il 2026-10-01 alle
10:17 UTC, in produzione c'è, e la sua pagina mostra le **Note di rilascio intere prese da
`github.com/vitejs/vite`**, 39 righe. `vite` sta in fondo all'alfabeto, quindi se il budget di 60
richieste si fosse esaurito sarebbe stata lei a restare a secco. Anche `zod` (4.6.5) e `zustand`
(5.0.15), le ultime del Catalogo, sono allineate a npm. La prova sta nelle **Note**, non nelle
Versioni: le Versioni vengono da npm, che non chiede nessun token, le Note da GitHub.

**Il `CRON_SECRET` di produzione non è quello in `.env.local`**: la chiamata a mano a
`/api/jobs/detection` con quello locale risponde **401**. Per chiamare i job a mano serve il CLI
Vercel (`npm i -g vercel`, poi `vercel env pull`), che **non è installato**, oppure leggerlo dalla
dashboard. La chiamata in sé **non spende**, tocca solo GitHub e npm.

- PRD pubblicato (#1). Fette pubblicate come issue **#2–#26**, con Parent #1 e "Blocked by" reali.
  - Label `ready-for-agent` = AFK; `ready-for-human` = HITL: #22 Catalogo ~40 Tecnologie,
    #26 landing page (serve il nome del prodotto).
- Fatte: **#2–#22** (la #22 con la PR #53, unita il 2026-09-28), la **#55** (PR #58), la **#56**
  (PR #59), la **#54** (PR #60) e la **#23** (PR #61), tutte unite il 2026-09-29; la **#62** (PR #66
  e #67) e la **#68** (PR #74) il 2026-09-30; la **#63** (PR #75), la **#25** (PR #77), la **#72**
  (PR #79) e la **#36** (PR #81) il 2026-10-02; la **#24** (PR #82) il 2026-10-03.
  La **#47** è **chiusa il 2026-10-05** con la PR #92, che la portava a termine dopo le PR #89, #90
  e #91; la **#84** è chiusa lo stesso giorno con la **PR #95**. Resta la **#26** come ultima fetta
  del PRD.
  Aperta il 2026-10-05: **#94** (il verdetto della Dashboard si contraddice, `ready-for-human`).
  Aperta il 2026-10-02: **#80** (riprendere le Note di rilascio mancanti, `ready-for-human`).
  Aperta dall'utente il 2026-10-04: **#88** (una Sintesi `ready` senza provenienza non viene
  rifiutata dal database), `ready-for-agent` e libera da blocchi.
  Le Sintesi dell'arretrato sono **pubblicate** dal 2026-09-29 (122 su 126): vedi la sezione del batch.
  Aperte in quel giro: **#54** (Note oltre gli 80.000 caratteri) e **#55** (i test di integrazione
  delle Sintesi prendono anche le Sintesi che non sono loro). Aperte il 2026-09-29: **#56** (titolo della
  Sintesi oltre i 120 caratteri) e **#57** (generare le Sintesi con Haiku 4.5 invece di Opus 5,
  `ready-for-human`: l'eval spende e il verdetto sulla qualità è dell'utente).
  Attenzione: il numero dell'issue è sfalsato di uno rispetto al numero della fetta nel titolo
  (issue #12 = fetta "11."). Vedi i "Blocked by" (`gh issue view N`).
- Credito API esaurito: **nessun avviso nostro**, se ne occupa la Console di Anthropic (decisione
  rivista nella #11, in `docs/DECISIONI.md` e ADR 0007).
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Ambiente

- Docker Desktop (WSL2) installato per utente in `%LOCALAPPDATA%\Programs\DockerDesktop`, RAM di WSL
  limitata a 6 GB in `~/.wslconfig`. **`docker` non è nel PATH della shell di Claude**: prima di E2E, integrazione
  o `supabase status` eseguire `export PATH="$PATH:$LOCALAPPDATA/Programs/DockerDesktop/resources/bin"`
  (senza, le fixture E2E falliscono con "docker: command not found").
- **Dev server: uno solo, sulla 3000.** L'utente tiene aperto `pnpm dev` lì; usarlo per i check in Chrome e
  per gli E2E (Playwright lo riusa) e non avviarne un altro, fallirebbe ("Another next dev server is already
  running"). **Prima di cominciare, due controlli da un secondo**: `curl -s localhost:3000 | head` dice se
  risponde ed è questo progetto (il 2026-09-24 sulla 3000 c'era un altro progetto, rispondeva Vite), e
  `netstat -ano | grep -E ':300[0-9].*LISTENING'` scopre i server residui. Il 2026-09-26 ce n'erano cinque:
  un `pnpm dev` rotto sulla 3001, un `next start` del 24 settembre sulla 3002 che serviva un build vecchio
  (rispondeva 404 alle rotte nuove e faceva sembrare rotto il codice), e tre di un altro progetto sulle
  3005-3007. Sono stati chiusi tutti: regola dell'utente, sempre lo stesso server.
  `.env.local` contiene i valori del Supabase locale; `pnpm catalog:sync` in locale dopo `set -a; . ./.env.local`.
- **Heredoc della shell di Claude: le sequenze con la barra rovesciata vengono mangiate** anche con
  `<<'EOF'`. Una classe di caratteri come quella dei controlli nelle regex arriva nel file con una barra
  in meno e il test fallisce con un errore incomprensibile. Per file con barre rovesciate usare gli
  strumenti di modifica, non l'heredoc.
- ⚠️ **Due shell, due sintassi.** Bash e PowerShell sono due strumenti distinti: la here-string di
  PowerShell (`@'...'@`) dentro Bash non è una citazione, e il 2026-10-06 ha messo `@` come titolo di
  un commit. Per un messaggio su più righe: heredoc in Bash (`-F - <<'EOF'`), here-string in
  PowerShell. E **guardare il messaggio prima del push** (`git log -1 --format=%B`): lì si rimedia con
  un `--amend`, dopo no.
- Python su Windows: scrivere i file con `encoding='utf-8'` (il default cp1252 ha troncato un file).
- `pnpm-workspace.yaml`: `esbuild: false` in `allowBuilds` (il binario arriva dalle dipendenze opzionali).

## Contesto della #14 (deciso con l'utente il 2026-09-23)

La chiave API **esiste già**: creata in un'area di lavoro dedicata (limite di spesa, limiti di
frequenza e report d'uso separati dal resto dell'organizzazione), messa su Vercel come
`ANTHROPIC_API_KEY`, **solo Production**, marcata *Sensitive*. Non è una Admin key (`sk-ant-admin…`,
rifiutata dalla Messages API). **Da verificare a inizio sessione**: che l'utente l'abbia messa anche
in `.env.local`, perché il comando di valutazione gira in locale.

**Federazione delle identità (WIF): scartata**, non riproporla senza che l'utente la rilanci. Era
allettante (nessun segreto da conservare: un JWT OIDC di breve durata scambiato con un token legato a
un service account, GA, gestita dagli SDK con quattro variabili d'ambiente). Scartata perché i
nostri job girano **su Vercel, non in GitHub Actions**: l'emittente da registrare sarebbe quello di
Vercel (`https://oidc.vercel.com/<team>`), il token nelle Function arriva **per richiesta**
nell'header `x-vercel-oidc-token` e non come variabile d'ambiente, l'SDK TypeScript non documenta
come passarlo via codice, e non è confermato che l'invocazione da cron porti quell'header. Tre
incognite dentro la fetta che deve invece dimostrare la qualità delle Sintesi. Issuer e rule si
creano comunque solo con un token `org:admin`, cioè a mano in Console.

### L'ordine concordato (tutto fatto: adattatore, prova, set di valutazione)

1. ~~**Adattatore** (autonomo)~~: `pnpm add @anthropic-ai/sdk`, `ANTHROPIC_API_KEY` nello schema Zod di
   `src/env/parse-env.ts` (`ServerEnvSchema`, `startsWith("sk-ant-")`, **opzionale** come
   `CRON_SECRET`: senza chiave i job restano 503 invece di impedire l'avvio dell'app), riga in
   `.env.example`, poi l'adattatore vero dietro `createSummaryBatches()`, con lo stesso contratto del fake
   in `tests/integration/fake-summary-batches.ts`. **Invocare prima la skill `claude-api`**: modello
   `claude-opus-5`, e le forme dell'API sono cambiate (niente `budget_tokens`, niente prefill).
2. **Prova su una sola Release vera**, qualche centesimo, per vedere se il prompt `v2` regge fuori
   dai test.
3. **Set di valutazione e report**, possibilmente in una sessione nuova.

### Le invenzioni si verificano da sole

Il prompt `v2` chiede già una citazione **verbatim** delle Note per ogni breaking change e
`locateCitation` (#12) dice se quella citazione esiste nel testo: il criterio "nessuna breaking
change assente dalle Note" è automatico. All'utente resta il giudizio che nessuna macchina dà:
l'**Intervento richiesto** atteso e le breaking changes **mancanti**, marcate una volta nel set
atteso e poi confrontate a ogni versione del prompt.

### Soldi

Ogni lancio spende davvero: ~15 Release da qualche migliaio di token, Opus 5 a $5/1M in ingresso,
dimezzato dalla Batch API, pochi centesimi a giro. **Nessun lancio senza avvisare prima l'utente.**

## Debito noto: l'output grezzo del modello non si conserva

Segnalato da un commento sul thread Bluesky della tappa B (2026-09-24), verificato nel codice.
`collect-summaries.ts:79` passa `result.text` a `parseSummaryOutput` e lo scarta: di una Sintesi
fallita resta solo il `reason`. Anche i report in `eval/summaries/reports/` contengono il risultato
già decodificato, non la risposta. Conseguenza: un modo di fallire nuovo e reale non è riproducibile
in un test, e i casi limite di `summary-output.test.ts` restano quelli scritti a mano (cornice
markdown, sesto punto chiave, CRLF nelle citazioni). Proprio i due difetti della #14 erano di quel
tipo, trovati solo perché c'era una chiamata vera sotto gli occhi.

Il rimedio costa poco e non spende: tenere il testo grezzo rende gratis il replay di un fallimento
che oggi richiederebbe di rilanciare un batch a pagamento. Criteri, quando diventerà una issue:
l'output grezzo conservato per ogni Sintesi fallita e per ogni caso dell'eval; un test che rigioca un
output salvato attraverso `parseSummaryOutput` senza chiamare Anthropic; nessuna chiamata esterna in
più. Da decidere: colonna sulla Sintesi o solo file nell'eval, e per quanto si tiene il testo (le
Note sono pubbliche, quindi non ci sono dati sensibili in ballo).

**Non è ancora una issue**: l'utente ha scelto di segnarlo qui e basta (2026-09-24).

## Preferenze dell'utente

- Vuole consigli motivati con una raccomandazione; approva spesso le raccomandazioni.
- Domini in italiano nei documenti; UI e codice in inglese.
- Attento al contesto: al ~30% fermarsi, aggiornare questo handoff e ripartire in una nuova sessione.
- Commit, push, PR e issue solo dopo conferma.
- Nel corpo della PR va `Closes #N` **in inglese**: con "Chiude #N" l'issue resta aperta (successo
  alla #14). Regola fissata in `CLAUDE.md`.

## Skill suggerite

- `tdd` per i moduli `domain` (classificazione, `buildDashboard`, `computeUpgradePath`).
- `claude-api` per la #14 (adattatore reale della Message Batches API, ADR 0007).
- `impeccable` solo per landing, login, 404.
