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

**Da dove ripartire (2026-10-07, mattina).** **Il giro impeccable è stato riaperto sull'app
intera**, e il primo rilievo è già chiuso con la **PR #110**, unita su `main` (`1f464c6`), branch
`technology-full-history` cancellato in locale e su GitHub. **`CI` e `Deploy database` sono verdi sul
merge** (run 37589555997, 6m25s). La PR non chiude nessuna issue:
nasce dal `critique`, ed è lavoro scelto in chat.

**Il `critique` nuovo è nel repository**, `.impeccable/critique/2026-10-07T07-09-23Z__src-app.md`,
fatto come vuole la skill, con due valutazioni isolate in sottoagenti che non si sono viste.
**26/40**, lo stesso numero del 2026-10-03, e il numero uguale è la cosa da capire: i **due P0 e i
cinque P1 di allora sono chiusi tutti** (anche il P1-6 con `upgrade-start.tsx`, il P1-7 con
`quote-markdown.ts` e il P2-8 con il `<-- back to`), l'estetica è scesa da 4 a 3 e il controllo da 3
a 2 per i difetti di focus. Quello che resta stava **sotto** i rilievi di prima, non accanto.

**Cosa ha fatto la #110.** `--> show all 82 releases` portava a `?from=`, dove la pagina cadeva sulla
lista nuda e prometteva 82 Release consegnandone 57. Adesso la storia intera **tiene l'orientamento e
non afferma niente**: riga `note: the whole recorded history, 57 releases in 4 majors.`, Stat Row dal
major più nuovo, ritorno `<-- back to the upgrade path`, e il link che conta le Release che la lista
stampa. **Niente verdetto, di proposito**, perché calcolato dalla Release più vecchia descriverebbe
un aggiornamento che nessuno fa: **sta scritto in `DESIGN.md`** sotto "Upgrade Path Form", quindi non
va ridiagnosticato. In codice: `recordedHistory()` nel dominio, `stat-rows.tsx` che estrae la Stat
Row **senza cambiarne la resa** (una geometria sola per verdetto e storia), `history-overview.tsx`,
e `BackPointer` accanto a `HelpPointer`. Verifiche: **544 unitari**, **156 E2E zero flaky**, lint e
typecheck puliti.

### I rilievi aperti del critique, in ordine

1. **I bersagli di tocco mancano WCAG 2.2 AA 2.5.8 su ogni lista** (P1). Sulla pagina Technology i
   link di versione sono 40 x 15.6px con passo verticale **23.0px**, cioè 1px sotto, su 28 link, da
   `release-rows.tsx:52` (`gap-y-[2px]`). Sulla Dashboard i link di versione stanno accanto al nome
   della Technology con **4.8 - 13.5px** centro-centro. Il rimedio del primo (`gap-y-1`, 4px) chiude
   anche le 54 occorrenze di 2px fuori dai token.
2. **Il pannello del profilo sopra i 640px non consegna il focus** (P1): `site-header-bar.tsx:70-73`
   prende `Close account`, che lì è `display: none`, e il primo Tab va sul toggle del tema, che sta
   fuori dal pannello. **A 390px invece è tutto corretto e misurato.**
3. **La Dashboard e la pagina Technology descrivono la stessa Release in due vocabolari** (P1):
   `dashboard-copy.ts:36` dice `no summary · read the release notes` anche per una Release che le
   note non le ha, e quel testo non e un link benché `DESIGN.md` lo voglia tale.
4. **`to check` nomina due insiemi diversi** (P2), contro il commento che sta in
   `upgrade-path-copy.ts:52-54`. Tocca il vocabolario, quindi la parola si decide prima del codice.
5. **Lo Stat Row del cammino di default è una barra sola** (P2), perché il default copre un solo
   major, e il conteggio trasversale usa lo stesso separatore della partizione invece della virgola.
6. Minori: errore del login senza glifo né parola, bordo del Follow a 1.33:1, pannello che sborda di
   24px (`sm:right-[0px]` invece di `sm:right-5`), due righe oltre i 72ch, un errore React su ogni
   caricamento da `layout.tsx:32`.

### Due cose misurate che NON sono difetti

- **I 72px sotto `latest` da 1040px in su** sono la scelta della #109 (`min-[1040px]:mt-8` in
  `dashboard/page.tsx:61`), dove il difetto era 120px al posto di 72. Sotto i 1040 il salto e 48px.
- **Raggio 3px, gerarchia piatta e padding dell'uscita nel menu**: il primo è l'anello di focus, gli
  altri due il detector non li emette nemmeno più.

### Due limiti di quella passata, da sapere prima di rifarla

- ⚠️ **`resize_window` non cambia il viewport** con la finestra massimizzata: risponde "successo" e
  `window.innerWidth` resta 1536. Il mobile si misura **dentro un iframe same-origin largo 390px**,
  dove le media query si valutano davvero su quello. Da lì vengono tutte le misure a 390px.
- ⚠️ **In locale ogni Sintesi e `pending`** (è la #65), quindi la schermata firma della Release, i
  caret e il viaggio di ritorno **non si possono vedere funzionare in locale**. Un giudizio fatto qui
  copre la cornice, non il centro.

⚠️ **La verifica dal telefono della rinfrescata di ieri resta da fare**, ed è descritta nello stato
qui sotto: nessuno di questi giri la sostituisce.

Il primo comando della sessione nuova:

```
leggi docs/HANDOFF.md, controlla la CI su main e continua con i rilievi del critique
```

**Lo stato precedente (2026-10-07, notte).** **La rinfrescata alla UI è su `main`**, in due PR unite:
la **#108** (`e900581`) e il suo seguito **#109** (`d0212a1`). Entrambi i branch sono cancellati in
locale e su GitHub. Sulla #108 CI e `Deploy database` sono verdi; sulla #109 la CI era verde sulla PR
e **la corsa su `main` era ancora in volo** a fine sessione, da guardare
(`gh run list --branch main`).

**Non è ancora verificato in produzione**, ed è la prima cosa da fare: **dal telefono**, perché le
due cose che cambiano di più non si vedono in locale. Sulla Dashboard la barra deve essere una riga
sola (le due sezioni stanno nel menu) e lo spazio sotto `latest` deve essere 48px come fra tutte le
altre sezioni; su una pagina Tecnologia il menu del profilo deve prendere tutto lo schermo e
restituirlo con la X o con Escape.

⚠️ **La scala delle spaziature ha già fatto tre vittime.** `src/app/globals.css` azzera `--spacing` e
definisce solo `--spacing-1..8`, quindi **tutte le utility con lo zero non esistono**: `right-0` ha
lasciato il pannello ancorato a sinistra, fuori dallo schermo a 390px; `mt-0` dentro
`[&>section]:mt-0` non è mai stato applicato e ha aperto **120px** di vuoto sotto `latest` al posto
di 72; e `size-6` qui vale **32px, non 24**. Nel codice nuovo si scrivono i valori espliciti
(`right-[0px]`, `mt-[0px]`, `size-[24px]`). **Strada aperta, proposta e non ancora decisa**:
aggiungere `--spacing-0: 0px` a `globals.css` fa sparire la classe di problemi, ma tocca tutta la UI,
quindi vuole la sua PR e la suite dietro.

### Cosa è stato deciso in queste due PR, e perché

- **Il menu del profilo** (foto GitHub, handle, `dashboard`, `technologies`, `sign out`) sta su ogni
  pagina, pubbliche comprese, e risolve il link alla Dashboard che mancava su `/technologies/*`.
  Sopra i 640px è un pannello appeso alla barra; **sotto, è un foglio a schermo intero** con l'uscita
  in fondo. **È un solo elemento nel DOM**, il breakpoint lo trasforma: due copie vorrebbero dire due
  link `dashboard` sulla pagina, e i test se ne accorgono.
- ⚠️ **Il toggle del tema resta nella barra**, fuori dal menu: le pagine pubbliche si leggono anche
  senza accesso e un visitatore non ha nessun menu in cui trovarlo. Non spostarlo senza risolvere
  prima quello.
- ⚠️ **Sotto i 640px la striscia con le due sezioni sparisce solo sulle pagine dietro l'accesso.**
  Home e 404 la tengono, perché lì chi legge può essere un visitatore senza menu: toglierla
  riaprirebbe il vicolo cieco della #63, e due test E2E lo sorvegliano.
- ⚠️ **I riquadri dei conteggi non vanno allargati a tutta la colonna**: il limite di 72ch è la
  correzione del difetto P2-9 della #47, un test E2E lo sorveglia, e a 992px l'etichetta e il suo
  numero finiscono a un quarto di colonna di distanza. Provato e rimesso com'era, con l'utente che
  aveva anche offerto di cambiare la regola.
- **Spotlight dice il silenzio una volta sola** (una riga `note:` per il gruppo invece della stessa
  frase su ogni riga), e la coda della pagina si chiude su una banda a due colonne da 1040px in su.
- **`DESIGN.md` è stato cambiato dove la pagina lo smentiva**, non lasciato derivare: la One Raised
  Plane Rule nomina il menu come unica superficie ammessa sopra il testo (il pannello che fluttua è
  una scelta dell'utente, presa a ragion veduta), e la No Dead End Rule chiede una destinazione
  sempre raggiungibile invece di una striscia in particolare.
- ⚠️ **I mock `release.html` e `technology.html` non vanno cambiati**: mostrano il visitatore, che il
  menu non ce l'ha. Quelli dietro l'accesso portano la barra nuova.
- Il detector di impeccable segnala `cramped-padding` sul contenitore dell'uscita nei mock: **è un
  falso positivo**, legge il padding del contenitore mentre la riga è alta 44px e centra il testo.
  Insieme al raggio 3px del focus e alla "gerarchia tipografica piatta" (l'`h1` vero è `sr-only`)
  sono le tre segnalazioni da non ridiagnosticare.

**All'inizio di tutto**, l'utente aveva chiesto se usare una skill "ispirata alle web app famose"
(tipo 21st.dev). **La risposta è stata no, e vale ancora**: quelle skill producono card, badge, ombre
e accenti di brand, cioè l'elenco dei "Don't" di `DESIGN.md`. Si è usata `impeccable`, sul mock prima
e sul codice poi.

**Lo stato precedente (2026-10-06, notte fonda).** **La rinfrescata alla UI è aperta nella PR #108**,
sul branch `dashboard-layout`, due commit, **non unita**: la CI era ancora in corso quando la sessione
si è chiusa, **va guardata prima di unire** (`gh run list --branch dashboard-layout`). La PR non chiude
nessuna issue: lavoro chiesto a voce, branch e PR comunque, come per la #107. In locale: `lint`,
`typecheck`, **538 unitari** e **154 E2E** verdi.

L'utente era partito chiedendo se usare una skill "ispirata alle web app famose" (tipo 21st.dev).
**La risposta è stata no, e vale ancora**: quelle skill producono card, badge, ombre e accenti di
brand, cioè l'elenco dei "Don't" di `DESIGN.md`. Si è usata `impeccable`, che ha la disposizione nel
suo giro, sul mock prima e sul codice poi.

### Cosa è cambiato, e cosa è stato deciso di non cambiare

- **Il silenzio di Spotlight costa una riga sola.** `latest major · none featured in 30 days` si
  ripeteva identico su ogni Tecnologia senza niente in evidenza. Ora una riga `note:` lo dice una
  volta per il gruppo e le righe tengono solo ciò che le distingue. Ogni Tecnologia resta contata
  esattamente una volta, come vuole il contratto di direzione in `.impeccable/`.
- **La coda non si spegne più**: `previews` e `weekly digest` affiancati da 1040px in su. Dentro mezza
  colonna le righe si riflettono come sul telefono, con la variante `min-[1040px]` passata solo a
  quelle due sezioni: **le soglie di `DESIGN.md` non sono state toccate**.
- ⚠️ **I riquadri dei conteggi NON vanno allargati a tutta la colonna.** È stato provato e rimesso
  com'era: il limite di 72ch è la correzione del difetto P2-9 della #47, un test E2E lo sorveglia, e a
  992px l'etichetta e il suo numero finiscono a un quarto di colonna di distanza. L'utente aveva
  offerto di cambiare la regola; la raccomandazione, motivata sul renderizzato, è stata tenerla.
- **Il pannello del profilo** (foto GitHub, handle, `dashboard`, `technologies`, `sign out`). La prima
  versione era una striscia sotto la barra, che non rompeva nessuna regola; **l'utente ha chiesto un
  pannello che fluttua**, e questa è una sua decisione presa a ragion veduta: `DESIGN.md` è stato
  aggiornato invece di restare smentito (One Raised Plane Rule e il "Don't" sulle superfici).
- **Il toggle del tema resta nella barra**, fuori dal pannello: le pagine pubbliche si leggono anche
  senza accesso e un visitatore non ha nessun pannello in cui trovarlo. Non spostarlo senza risolvere
  prima quello.
- **Sotto i 640px la striscia con le due sezioni sparisce solo sulle pagine dietro l'accesso.** Home e
  404 la tengono: lì il lettore può essere un visitatore senza pannello, e toglierla riaprirebbe il
  vicolo cieco della #63. Due test E2E lo sorvegliano. Sotto i 429px la quota si prende la striscia da
  sola, a tutta larghezza, e la barra resta le due righe della #47.

⚠️ **Due trappole della scala delle spaziature**, già pagate: `globals.css` azzera `--spacing` e
definisce solo `--spacing-1..8`, quindi **`right-0`, `top-0` e simili non esistono** (il pannello
restava ancorato a sinistra e a 390px usciva dallo schermo) e **`size-6` vale 32px, non 24**. Nei file
nuovi si scrivono i valori espliciti, `right-[0px]` e `size-[24px]`.

⚠️ **I mock `release.html` e `technology.html` non vanno cambiati**: mostrano il visitatore, che il
pannello non ce l'ha. Quelli dietro l'accesso (`dashboard.html`, `technologies.html`) portano la
barra nuova. In `dashboard.html` la riga `in use` sta sopra l'elenco dei breaking perché lì esiste il
puntatore `--> migrate`, che **la Dashboard costruita non ha**: nel codice quella riga appartiene alla
Tecnologia, che può portare due Release in evidenza, e resta dopo le celle.

**Da fare dopo il merge**: guardare la Dashboard e una pagina Tecnologia in produzione, da telefono,
perché la barra a una riga e il pannello sono esattamente ciò che non si vede in locale.

**Lo stato precedente (2026-10-06, notte).** **Il ritento dei transitori è fatto**, con la **PR #107**,
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
