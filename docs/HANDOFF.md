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
**Da dove ripartire (2026-10-09, notte fonda, la #141).** La landing è **ripensata e non ancora
unita**: branch `141-landing-redesign`, nessun commit ancora al momento in cui questo file è stato
scritto. La #141 era `ready-for-human` e le tre decisioni le ha prese l'utente guardando **tre
proposte vere** (mock A, B, C, costruiti e aperti nel browser): ha scelto la **A**, "asse spezzato",
più ingressi sobri per sezione e mano libera sul visivo. Le varianti B e C sono state cancellate
dopo la scelta: la fonte dell'aspetto resta un file solo, `design/mocks/landing.html`.

**Cosa c'è dentro, nell'ordine che la issue impone.** Prima `DESIGN.md`: una sezione **Motion**
nuova con due regole nominate, **The One Motion Moment Rule** (dentro l'app si muove solo il caret,
più la chevron del digest) e **The Arrival Rule** (sulla landing e **solo** lì, ogni banda arriva
una volta, 10px e una dissolvenza sulla curva del caret); il **Proof Panel**, lo **Stage Title**, la
landing nel Layout (container **1240px**, bande separate da una riga a tutta larghezza, numero nel
margine da 8ch alla scala del titolo), la **barra sticky su ogni pagina** con la larghezza che segue
quella della pagina, il **Marchio a 16px**. Poi il mock, poi il codice: `ProofPanel`, `Band`,
`Arrivals` nuovi; il banco a **due per due** senza rail; le quattro parole della Rilevanza in quattro
colonne; la contro-posizione dentro la banda di chiusura. La landing resta **statica e
prerenderizzata**, nessuna chiamata esterna nuova.

⚠️ **Un IntersectionObserver non vede un salto.** Gli arrivi erano scritti con un observer, ed è
sbagliato: un observer parla solo quando una soglia viene **attraversata**, quindi `End` o un'ancora
portano una banda da sotto la finestra a sopra senza nessuna callback, e la banda resta **invisibile
per il resto della visita**. Ora è una spazzata sullo scroll (`arrivals.tsx`), che un salto non lo
può mancare, ed è il test `settled()` di `landing.spec.ts` ad averlo scoperto.

⚠️ **`pl-0` e `mt-0` cadono in silenzio**, di nuovo: la scala delle spaziature non ha lo zero
(`--spacing: initial`), quindi su telefono le bande restavano rientrate di 8ch. Si scrive
`pl-[0px]`. La lezione era già in questo file dal 2026-10-02 e si è ripresentata identica.

⚠️ **Una scala che deve stare su una riga dentro una colonna non si misura sul viewport.** Il
verdetto del Proof Panel a Status scale andava a capo a ogni larghezza da desktop, perché la colonna
è una frazione della pagina: ha un clamp suo, `clamp(1.5rem, 2.4vw, 1.9rem)`, ed è **l'unica
eccezione** a The One-Line Verdict Rule, scritta accanto alla regola.

**I numeri**: **611 unitari**, **191 E2E** (la suite intera, verde), più `pnpm lint`, `pnpm
typecheck` e `pnpm build`. Il mobile è stato guardato a **390px** con uno script Playwright, non
ridimensionando la finestra, che qui non cambia il viewport.

### Cosa resta

1. **La #141 non è unita**: branch `141-landing-redesign`, da committare, aprire in PR con
   `Closes #141` e far passare dalla CI.
2. **Su telefono resta ferma tutta la barra, 96px**, non solo la prima riga come l'utente avrebbe
   preferito: la strip delle due destinazioni è figlia dello stesso elemento flex della riga del
   marchio, e fermarne una sola vuole o un secondo `<nav>` nel DOM (due copie degli stessi link per
   uno screen reader) o la strip **sopra** il marchio. Tocca le decisioni della #119, quindi
   l'utente ha scelto di tenere la barra intera e rivederlo con una issue sua, misurando.
3. **La #142** (`ready-for-human`, Blocked by #141), la stessa direzione portata nell'app, a mock e
   non a codice. ⚠️ Adesso ha una cosa in più da portare: la barra sticky e il Marchio a 16px sono
   già su tutte le pagine, quindi la #142 eredita un'app che la landing non contraddice più sulla
   barra, ma la contraddice ancora su tutto il resto.
4. ⚠️ **La #130**: Core Web Vitals veri in produzione e lettura dal telefono. Si incrocia con la
   #141, che ha appena cambiato la landing, e **la misura di partenza non è mai stata presa**:
   adesso la landing nuova è quella da misurare.
5. **Il dev server è stato fermato** per provare la suite in condizione CI (`pnpm build` e `CI=1
   pnpm test:e2e`, che è la lezione della #140). Va riavviato dall'utente con `pnpm dev`.
6. **La cancellazione dei rami**, locali e remoti, che resta dell'utente:
   `139-detection-tag-variants`, `140-landing-entry-action`, `137-tag-format-variants`,
   `137-coda-risparmio-chiamate`, `93-prompt-v7`, `57-haiku-summaries`, `26-landing-page`,
   `80-notes-backfill` e `120-technology-icons`, più `141-landing-redesign` quando sarà unito.
7. **Quello che resta a pagamento è sotto il centesimo**: il submit a mano della #54. Nessuna issue
   aperta tocca Anthropic.
8. **L'ordine consigliato per gli ambienti**, invariato: il **database separato per i preview**
   (oggi un `catalog:sync` da un preview scriverebbe in produzione), poi la **#65** ridotta alla
   sola strada 2 se lo stage si fa. ⚠️ La #65 **non è ancora decidibile**: dipende dallo stage.

⚠️ **Il `CRON_SECRET` di produzione non passa da questa chat**: i giri in produzione li lancia
l'utente dal suo terminale, nemmeno quando sono gratis.

Il primo comando della sessione nuova:

```
leggi docs/HANDOFF.md, controlla la CI su main e dimmi che strade sono aperte
```


**Le due sezioni qui sotto non sono uno stato**: sono vive, e restano qui finché l'utente non le
chiude. Sono nate il 2026-10-06, insieme allo stato del ritento dei transitori, che è stato spostato
in `docs/handoff/2026-10.md`.

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

### Le strade aperte

⚠️ **Le issue sono sospese per scelta dell'utente** (2026-10-06): "lasciamo perdere le issue, ci
torneremo quando avrò soldi sul conto". Non proporne una come lavoro seguente finché non lo rilancia
lui. Quello che si è fatto dopo quella frase è nato dalle sue richieste dirette, senza issue.

Tutto quello che era stato scelto è chiuso, quindi restano solo le issue aperte, e **non ce n'è
nessuna `ready-for-agent`**: qualunque strada qui sotto vuole il via dell'utente. Sono tutte
`ready-for-human`. ⚠️ **Questo capoverso è del 2026-10-06 e va letto con lo Stato davanti**: la **#137** è **chiusa** il
2026-10-09 e ha lasciato al suo posto **quattro issue nuove**, di cui la **#139** e la **#140** sono
state chiuse la notte dello stesso giorno (PR #145 e #144); delle quattro restano la **#141** e la
**#142**, entrambe `ready-for-human`, quindi "non ce n'è nessuna `ready-for-agent`" è di nuovo
vero. La **#80**
è **chiusa** il 2026-10-09 e ha lasciato al suo posto la **#137**, che è `ready-for-agent`, quindi
"non ce n'è nessuna" adesso è falso; la **#57**
è **chiusa** il 2026-10-08, e la **#93** adesso è il prompt **v7** e costa **8 centesimi**, non più
qualche dollaro, perché le Sintesi si generano con Haiku 5.5. La #93 **spende** su Anthropic, poco; **#65**, tecnica, serve solo il via, e adesso va
letta insieme allo stage (vedi lo Stato: la strada 1 potrebbe non servire più); **#26** la landing
page, ferma sul nome del prodotto; **#69** esplicitamente dopo il lancio. La **#80** è chiusa, e la
scelta fra le sue tre strade è stata la 3, scritta in `CONTEXT.md`: il backfill non genera Sintesi.

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

- Stato al 2026-10-09 (notte, dopo la #139 e la #140): la faccia dell'entry action e le due forme del tag
  - ⚠️ La sessione non arriva dalla rete, arriva dal cookie: le due facce si misurano su due contesti
  - ⚠️ Il server di sviluppo nasconde i difetti dei test E2E che dipendono dall'idratazione
  - ⚠️ Nel Rilevamento una Release saltata può non tornare più, ed è perché la #139 legge sempre le due forme
- Stato al 2026-10-09 (notte, dopo la #137): le due forme del tag per le Note, e le quattro strade nuove
  - ⚠️ `prisma` era un quarto caso che nessuno aveva diagnosticato, e il suo `tagFormat` non va girato
  - ⚠️ La stima della issue era ottimista su 7 Release, e il perché è verificato tag per tag
  - ⚠️ Il `CRON_SECRET` di produzione non passa dalla chat: il giro lo lancia l'utente
- Stato al 2026-10-09 (sera, dopo la #80): riprese le Note mancanti, e la #137 che ne è nata (PR #136)
  - ⚠️ Girare il `tagFormat` è la risposta sbagliata: un formato copre una sola epoca del repository
  - ⚠️ I numeri delle 91 Release mute, misurati prima di decidere, e il mezzo centesimo che costavano
  - ⚠️ In PowerShell `curl` non è curl, e il `CRON_SECRET` di produzione è stato ruotato
  - ⚠️ L'heredoc ha colpito un'altra volta: file con barre rovesciate, strumenti di modifica
- Stato al 2026-10-09 (dopo la #93): il modello dice da sé se le Note erano giudicabili (PR #135)
  - ⚠️ Il pavimento dei 3 punti chiave era una richiesta di inventare, e buttava una Sintesi pagata
  - ⚠️ Un batch si paga una volta e si rilegge quante si vuole: `summary:eval --results`
  - ⚠️ La stima del costo della rigenerazione era bassa del 45%, e lo stato di un batch si legge gratis
  - Come si rigenera il Catalogo, passo per passo, e il caso `bun 1.4.0` che sembra un difetto
- Stato al 2026-10-08 (dopo la #57): le Sintesi passate a Haiku 5.5 (PR #134)
  - ⚠️ Il confronto fra i giri del set non è pulito, e l'ADR lo dice: cambiano modello e prompt insieme
  - ⚠️ Il tetto dei 150.000 caratteri ha una seconda ragione: oltre i 100k token di prompt Haiku costa cinque volte
- Stato al 2026-10-08 (notte): la #26 chiusa, la landing e il nome Verdict (PR #129)
  - ⚠️ Il numero della riga citata è testo vero, non un counter CSS, quindi axe lo vede
  - ⚠️ Il disegno della caret row sta in un attributo, non in uno `useState`, o senza JS sparisce
- Stato al 2026-10-08 (pomeriggio): la #120 chiusa, i Marchi delle Tecnologie (PR #128)
  - ⚠️ Mostrare solo l'icona fallisce WCAG 2.5.3 Label in Name: il nome resta sempre scritto
  - ⚠️ Next 16 non stampa più il First Load JS: il peso si misura sommando i chunk di due build
- Stato al 2026-10-08 (mezzogiorno): la barra ripensata, le due destinazioni su ogni pagina (#119, PR #127)
  - ⚠️ Il breadcrumb ha traslocato nel contenuto, e l'header non ramifica mai sulla sessione
  - ⚠️ Sotto 430px la strip va spezzata da un elemento `BREAK`, o torna la terza riga
- Stato al 2026-10-08 (notte): la #124 unita, le scorciatoie e il glossario della Rilevanza
  - Il glossario della Rilevanza va sulla landing (#26), non nell'app: scelta fra tre strade
  - ⚠️ L'`h1` di `/technologies` è `sr-only` e non si può cliccare per spostare il fuoco
  - ⚠️ `event.target as HTMLElement` non passa il lint: va ristretto con `instanceof`
- Stato al 2026-10-08 (sera): il critique chiuso, la quota che nomina il Piano
  - ⚠️ `slots` del critique non è stata usata: in `DESIGN.md` lo slot ha già due significati
  - La riga `needs action` è allineata, e ha vinto il codice
  - L'errore React dello script del tema è chiuso come non-difetto, con le due strade già pagate
- Stato al 2026-10-08 (mattina): i cinque minori del critique uniti (PR #123)
  - ⚠️ Il bordo del Follow era `DESIGN.md` ad averlo sbagliato, non il codice
  - ⚠️ `pnpm test:e2e -- --grep` ignora il filtro: il giro corto è `pnpm exec playwright test --grep`
  - ⚠️ `getByRole("alert")` prende anche l'annunciatore di rotta di Next, e va scoped
- Stato al 2026-10-07 (sera): la #113 chiusa, il pannello unico sopra le Release (PR #122)
  - ⚠️ La Versione in uso ha traslocato: la passa la pagina al Cammino, altrimenti i due moduli fanno ciclo
  - Il controllo sulla riga del fatto che cambia, e la riga `releases` via: due scelte dell'utente
  - ⚠️ Etichette visibili corte e nomi accessibili lunghi: accorciarli rompe mezza suite E2E
  - ⚠️ `viewport` e non `viewportSize`, altrimenti ogni misura a 390px è falsa
- Stato al 2026-10-07 (pomeriggio): sei PR unite, il focus rosso e lo Stat Row
  - Il focus è rosso in entrambi i temi, con hex diversi: lo stesso valore falliva 1.4.11 nel chiaro
  - ⚠️ La legenda dello Stat Row aveva già i glifi nel mock: era il codice ad aver derivato
  - ⚠️ La barra era al 100% per costruzione, non per un errore di calcolo: ora chiede due gruppi
  - ⚠️ Due branch nati dallo stesso `main` sugli stessi file vanno riuniti prima del merge
- Stato al 2026-10-07 (mezzogiorno): tre rilievi del `critique` chiusi, le PR #114 e #115 aperte
  - ⚠️ Due dei rilievi dati per difetti non lo erano, misurati: i bersagli di tocco e la barra in alto
  - La risposta sugli skeleton è no, e ha prodotto The Reserved Space Rule
  - ⚠️ WCAG 2.5.8 si misura su tutte le coppie, e un test che non si prova contro il difetto non vale
- Stato al 2026-10-07 (notte): la rinfrescata alla UI su `main` (PR #108 e #109)
  - ⚠️ La scala delle spaziature non ha lo zero: `right-0` e `mt-0` cadono, e `size-6` vale 32px
  - Il menu del profilo, il toggle che resta nella barra e i riquadri da non allargare
- Stato al 2026-10-06 (notte fonda): la rinfrescata aperta nella PR #108, non unita
  - ⚠️ I mock del visitatore non vanno cambiati, e perché `in use` sta in due posti diversi
- Stato al 2026-10-06 (notte): il ritento dei transitori (PR #107)
  - ⚠️ La diagnosi prima era mal puntata: il buco era nelle quattro chiamate HTTP, non nello script
  - ⚠️ La here-string di PowerShell dentro Bash ha messo `@` come titolo di un commit
- Stato al 2026-10-06 (sera tardi): la #64 chiusa (PR #106), la riga che si sposta al follow
- Stato al 2026-10-06 (sera): la #100 chiusa (PR #105), e la #86 (PR #102)
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
  Aperte il 2026-10-07: **#113** (riordinare le due zone sopra le Release, `ready-for-human`: la
  zona 2 è fatta con la PR #121, la zona 1 ha la direzione nuova in un commento), **#119** (ripensare
  la barra) e **#120** (le icone delle Tecnologie). Le ultime due sono **chiuse** il 2026-10-08, con
  la PR #127 e la PR #128; resta aperta la #113.
  Aperta il 2026-10-05: **#94** (il verdetto della Dashboard si contraddice, `ready-for-human`).
  Aperta il 2026-10-02: **#80** (riprendere le Note di rilascio mancanti), **chiusa** il 2026-10-09
  con la PR #136.
  Aperta il 2026-10-09: **#137** (le Note non si trovano quando un repository cambia la convenzione
  dei tag), `ready-for-agent` e libera da blocchi, nata dal giro a vuoto della #80.
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

## Debito noto: l'output grezzo del modello non si conserva (metà pagato)

⚠️ **Metà di questo debito è stato pagato dalla #93** il 2026-10-09: il **set di valutazione adesso
conserva la risposta grezza**, in un `.results.json` accanto al report, e `pnpm summary:eval
--results <file>` la rigioca senza chiamare Anthropic. Resta aperta la metà della pipeline, cioè il
testo di una Sintesi fallita in produzione, che è il seguito di questo paragrafo.

Segnalato da un commento sul thread Bluesky della tappa B (2026-09-24), verificato nel codice.
`collect-summaries.ts:79` passa `result.text` a `parseSummaryOutput` e lo scarta: di una Sintesi
fallita resta solo il `reason`. Conseguenza: un modo di fallire nuovo e reale non è riproducibile
in un test, e i casi limite di `summary-output.test.ts` restano quelli scritti a mano (cornice
markdown, sesto punto chiave, CRLF nelle citazioni). Proprio i due difetti della #14 erano di quel
tipo, trovati solo perché c'era una chiamata vera sotto gli occhi.

Il rimedio costa poco e non spende: tenere il testo grezzo rende gratis il replay di un fallimento
che oggi richiederebbe di rilanciare un batch a pagamento. Criteri, quando diventerà una issue:
l'output grezzo conservato per ogni Sintesi fallita; un test che rigioca un output salvato
attraverso `parseSummaryOutput` senza chiamare Anthropic; nessuna chiamata esterna in più. Da
decidere: colonna sulla Sintesi o file, e per quanto si tiene il testo (le Note sono pubbliche,
quindi non ci sono dati sensibili in ballo). ⚠️ **Il metodo esiste già comunque**, ed è stato usato
due volte il 2026-10-09: i risultati di un batch si rileggono gratis con
`GET /v1/messages/batches/<id>/results` finché Anthropic li tiene, quindi anche senza questa issue
un fallimento recente è ispezionabile senza ripagare.

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
