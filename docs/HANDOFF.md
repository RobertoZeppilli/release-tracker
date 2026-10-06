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

**Da dove ripartire (2026-10-06, sera).** **La #100 è chiusa**, con la **PR #105**, unita su `main`
(`9b91fab`): l'issue si è chiusa da sola col `Closes #100`, e il branch `a11y-upgrade-path-wait` è
cancellato in locale e su GitHub. `Deploy database` verde. **Niente da verificare in produzione**: il
lavoro tocca un solo file di test e nessuna riga di `src/`. **Le due box della Dashboard sono
verificate in produzione**, dall'utente in persona: lo stato di prima sta nel diario di ottobre.
**Non c'è più nessuna issue `ready-for-agent`**, quindi il lavoro seguente si sceglie fra le strade
aperte qui sotto e vuole il via dell'utente.

**E nella stessa sessione è caduto anche il flake sui follow**, chiesto dall'utente **senza aprire una
issue**: la causa era una sola e la spiegazione sta nella sua sezione qui sotto. Con lui **non resta
nessun flake noto** in E2E.

**Com'è stata fatta.** Il flake era nelle attese del test, non nella pagina, e `UpgradePathBlock` e
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

**Lo stato precedente (2026-10-06, sera).** **La #85 è chiusa**, con la **PR #101**, unita su `main`
(`1fc8af5`), e il branch è cancellato in locale e su GitHub. `CI` verde su `main`, `check` e
`integration` tutti e due. Prossimo lavoro: la **#86**.
⚠️ **Un push su `main` annulla la CI in corso**: committare documenti mentre gira la corsa del merge
la soppianta, ed è successo due volte il 2026-10-06. Non è un fallimento, ma lascia il merge senza
una corsa verde finché non ne parte un'altra.
⚠️ Il nodo di `library` va sciolto con l'utente **prima** di scrivere una riga di codice (vedi sotto).

**La #85 è verificata in produzione**, su tutte e due le severità:

- `/technologies/react/19.3.0` è il caso dell'issue parola per parola: `breaking[1]` cita
  `release-notes:164` dentro 186 righe di changelog quasi identiche. Seguendolo si atterra sulla 164
  e sopra c'è `<-- back to breaking[1]` in corallo, sulla lavatura dell'intervallo; seguirlo riporta
  alla diagnostica con l'URL a `#b1`, senza animazione. **Il tasto Indietro riporta alla riga 164**,
  con puntatore e lavatura ancora lì: è la gamba che l'issue diceva mancante.
- `/technologies/vite/8.0.0`: i key point leggono `note[1]:`, `note[2]:`, `note[3]:`, e la citazione
  di `note[1]` apre il pannello con `<-- back to note[1]` in cyan sopra la riga lavata, con ritorno
  a `#n1`.
- Il controllo a 390px **non è stato rifatto nel browser**, perché è quello che era già fallito con
  la #83 (il ridimensionamento non cambia il viewport). La larghezza telefono resta coperta dagli
  E2E e da uno screenshot a 390 fatto in locale prima della PR.
- ⚠️ Visto di passaggio: il titolo della Sintesi di `vite/8.0.0` contiene un **trattino lungo**
  ("ships with no inline release notes — details are only in the changelog"). È esattamente la #87.

**La #85, com'è stata fatta.** Era una issue HITL, e le due scelte di forma rimaste aperte sono state
decise con l'utente. **Da non riaprire:**

- **Un solo puntatore**, `<-- back to breaking[1]`, su una riga propria **sopra** la prima riga
  dell'intervallo attivo, nella lavatura dell'intervallo e nell'inchiostro della severità che ha
  citato. La riga tiene la gutter ma **non prende un numero suo**: i numeri di riga sono la ragione
  per cui si guarda il pannello, e nasconderne uno sarebbe stato il contrario del punto.
- **I key point sono numerati** `note[n]:`, in una colonna da 11.5ch, e ognuno è l'ancora su cui
  atterra il ritorno. Un key point è numerato per la stessa ragione per cui lo è un breaking change:
  una citazione che porta dentro le Note deve poter **nominare** la diagnostica da cui veniva.
- Il ritorno è un semplice link `#b1`: porta lo scroll **e** il focus sul titolo della diagnostica
  (che per questo ha `tabindex="-1"`), e lascia il tasto Indietro puntato alla riga citata. **Non
  disegna e non anima niente**: la sottolineatura dell'andata resta l'unico momento di moto.
- **Conseguenza da ricordare**: il puntatore precede la riga citata nell'ordine del documento e
  l'andata lascia il focus sulla riga, quindi da tastiera si raggiunge con **Shift+Tab**. È scritto
  nel test e in `DESIGN.md`. L'unico modo di avere il Tab in avanti sarebbe mettere il puntatore
  **sotto** l'intervallo, che è la forma che l'utente non ha scelto.
- La citazione attiva porta con sè chi l'ha chiamata (`CiteOrigin` in `citation-context.tsx`): è
  quello il pezzo nuovo, il resto è resa. `DESIGN.md` lo registra sotto **Source View** ("The way
  back") e **Note Lines**, e `design/mocks/release.html` lo mostra per tutte e due le severità.

**La #83 è verificata in produzione**, su `/technologies/vite`: il campo arriva precompilato con
`7.3.6` senza che nessuno abbia chiesto niente, la riga sotto dice perché, il verdetto è
`note: 3 to check`, il gruppo `v8 29 releases` comprende la `8.0.0` (il punto della regola scelta) e
in fondo c'è `--> show all 79 releases`. I due campi partono dallo stesso bordo sinistro.
⚠️ **Il controllo a 390px non è riuscito**: il ridimensionamento della finestra non ha cambiato il
viewport. La larghezza telefono resta coperta dagli E2E (`overflow.spec.ts` e `technology.spec.ts`
girano a 390px e in CI sono passati), e la colonna da 14ch è scritta per sparire sotto i 640px.

**Le decisioni già prese con l'utente, da non riaprire.** Le tre issue scelte (#85, #86, #87) sono
tutte fatte, e con loro le due box della Dashboard e la #100. **La #93 è `v6`**, non `v5`: il `v5` se
l'è preso la #87, e il titolo della issue su GitHub dice ancora "Prompt v5", da correggere prima che
qualcuno la prenda.

**Niente è più deciso in anticipo.** Il lavoro seguente si sceglie fra le strade aperte qui sotto, e
**nessuna è `ready-for-agent`**: la #100 era l'ultima.

**La #83, com'è stata fatta.** La **Versione** di partenza ricavata è **l'ultima Release stabile
della major precedente**, scelta dall'utente fra tre: è l'unica il cui Cammino contiene sempre la
Release che apre la major, cioè dove stanno i cambiamenti che rompono. Da non rifare e da non
ridiscutere:

- La regola sta in `CONTEXT.md` sotto **Cammino di upgrade** e **Versione in uso**, la resa in
  `DESIGN.md` sotto "Upgrade Path Form", e il mock `design/mocks/technology.html` ha lo stato nuovo
  nel selettore "page state".
- `defaultUpgradeStart` è dominio puro in `src/modules/releases/domain/default-upgrade-start.ts`.
  Sotto una sola major vale la stabile più vecchia; con una sola Release stabile **non c'è Cammino**
  e la pagina resta la lista, invece di un cammino vuoto o di un errore.
- **Il valore ricavato è calcolato sul server** e passato al fallback del `Suspense`, perchè il
  Cammino sta così nell'HTML della cache ISR. Prima esisteva solo dopo l'hydration, cioè proprio il
  Visitor arrivato da una ricerca non lo vedeva mai. Per questo la resa è stata spezzata in
  `ui/upgrade-path.tsx` (presentazionale, `UpgradePathBlock`) e `ui/upgrade-path-view.tsx` (il client
  che legge `?from=`): le due rese devono restare la stessa, altrimenti si vede uno sfarfallio.
- **Un `?from=` vuoto non è più un errore**: è il modo in cui il form chiede lo Storico intero, ed
  è dove porta il `--> show all 77 releases` in fondo al Cammino. Scelta deliberata: con un valore
  predefinito, svuotare il campo è come si chiede tutto, e un errore lì sarebbe ostile. Il ramo
  "valore vuoto" di `invalidMessage` resta però vivo, perchè la **Versione in uso** lo usa ancora.
- **Fuori scope di proposito**: su una Versione malformata la pagina continua a mostrare la lista
  piena, come prima, invece di ripiegare sul cammino ricavato. Meno pezzi in movimento e nessuna
  copia nuova da inventare.
- **In più, su richiesta dell'utente** (`docs/align.JPG`): `Version in use` e `Upgrade from` avevano
  etichette di lunghezza diversa e i campi partivano sfalsati. Ora condividono una colonna da 14ch,
  `VERSION_LABEL_CLASS`, registrata in `DESIGN.md` sotto Upgrade Path Form e Version in Use.

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

Tutto quello che era stato scelto è chiuso, quindi restano solo le issue aperte, e con la #100
chiusa **non ce n'è più nessuna `ready-for-agent`**: qualunque strada qui sotto vuole il via
dell'utente. Sono tutte `ready-for-human`: **#93** (prompt **v6**, con la terza uscita sulle note giudicabili) e
**#57** (Haiku invece di Opus) **spendono** su Anthropic; **#65** e **#64**, tecniche, serve solo il
via; **#80** (tocca GitHub e npm, non Anthropic, ma genera Sintesi a valle); **#26** la landing page,
ferma sul nome del prodotto; **#69** esplicitamente dopo il lancio.

Il primo comando della sessione nuova:

```
leggi docs/HANDOFF.md e dimmi che strade sono aperte, poi ne scelgo una
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
