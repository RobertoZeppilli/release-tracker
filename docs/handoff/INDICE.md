# Indice delle sessioni passate

Spostato qui da `docs/HANDOFF.md` il 2026-10-10, parola per parola, per tenere lo stato vivo sotto
le 100 righe.

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

- Stato del nono giro: la 3b-1 chiusa e committata, la PR non ancora aperta (2026-10-21)
  - ⚠️ I quattro verdetti accorciati perché l'italiano non stava nei 326px del pannello, con
    la misura: 26 caratteri, etichetta compresa
- Stato dell'ottavo giro: la #163 mergiata, e la 3b-1 ferma a metà strada (2026-10-16)
  - Le sei cose che la 3b-1 ha imparato: `i18n/server` dietro un indice `ui`, `UpgradePathBlock`
    reso da due lati, `messageParts` e `Filled`, i tre punti dove la cifra ha perso l'inchiostro
- Stato del settimo giro: la 3a su main, e la lingua in una pagina sua (2026-10-16)
- Stato del sesto giro: la PR 3a aperta, e il piede che la Dashboard misura (2026-10-16)
  - Com'è fatto il dizionario: `message.ts`, `translate.ts`, il registro che fonde sopra l'inglese,
    il test di parità che tiene il fallback fuori dalla produzione
  - ⚠️ `usePathname()` dà il percorso riscritto dal proxy, `SiteHeader` deve essere client,
    la query si scrive sull'ancora al click
  - ⚠️ Il piede non poteva crescere: la colonna sticky della Dashboard misurata in CI
  - ⚠️ Niente prettier nel repository, e il glossario deciso il 2026-10-16
- Stato del quinto giro: la #131 in quattro PR, le prime due su `main` (2026-10-15)
  - Le sei cose che la PR 2 ha insegnato: query nella riscrittura, matcher senza punto,
    catch-all dentro la lingua, `next typegen` in CI, `next/link` in un posto solo
  - ⚠️ `NEXT_PUBLIC_GITHUB_CLIENT_ID` ancora da mettere su Vercel, i 14 KB e le `max-[]`
- Le cinque decisioni della #131, prese dall'utente il 2026-10-15
  - Cinque lingue, Note di rilascio e Sintesi non tradotte, pagina Release dichiarata mista
  - Vocabolario di dominio in inglese in ogni lingua, legenda della landing tradotta
  - Lingua nell'URL e non in un cookie, selettore nel piede e nel menu profilo, modulo nostro
  - ⚠️ Francese, spagnolo e tedesco non rivisti da madrelingua: da rivedere prima del lancio

- Stato al 2026-10-15 (la #132 chiusa, le cinque pagine pubbliche su `main`)
  - Le cinque decisioni della PR 2 della #132: contatto, `body` flex, breadcrumb, wordmark nel piede
  - ⚠️ `body` è una colonna flex alta `100dvh`, e serve `body > main, body > footer { width: 100% }`
  - ⚠️ Playwright lancia `pnpm dev` in locale e `pnpm start` in CI: i difetti si vedono solo nel secondo

- Stato al 2026-10-15 (la PR 1 della #132 su `main`, prima della PR 2)
  - Le quattro decisioni della #132 prese dall'utente, e l'ordine delle due PR invertito
  - ⚠️ Playwright lancia `pnpm dev` in locale e `pnpm start` in CI: i difetti si vedono solo nel secondo
  - ⚠️ `NEXT_PUBLIC_GITHUB_CLIENT_ID` ancora da mettere su Vercel

- La PR 1 della #132, com'è fatta dentro (2026-10-15)
  - L'ordine dei tre passi della cancellazione, e perché la sessione si legge prima del form
  - ⚠️ Niente dialog e niente bottone spento: la parola scritta è la guardia, già deciso
  - ⚠️ `a.text-link` non era sottolineato in tutta l'app: il preflight di Tailwind
  - ⚠️ Il build di produzione porta un secondo `role="alert"`, il route announcer di Next

- Stato al 2026-10-15 (la #126 chiusa e su `main`, prima della #132)
  - Le tre decisioni della #126 prese dall'utente, e le due trappole che ha pagato
  - ⚠️ `sticky top-0` non si incolla in questo progetto: `--spacing: initial` non genera `top-0`
  - L'insert multiriga è atomico: `none followed`, mai "alcune"

- Stato al 2026-10-15 (la #133 e le attese chiuse, prima della #126)
  - ⚠️ Le forme di attesa già rifiutate, da non riproporre, e il divieto su `animation: none`
  - ⚠️ Lo skeleton dura decine di millisecondi: per vederlo serve fermare la risposta
  - La lista di quel che restava aperto, da cui la #126 ha preso il suo pezzo

- Perché un confine di loading fa cadere i test che misurano (2026-10-15)
  - ⚠️ In locale la suite gira sul dev server, in CI sul build di produzione: `CI=1 pnpm exec playwright test`
  - ⚠️ Per un istante il documento ha lo skeleton visibile e la pagina vera nascosta: `arrived(page)` aspetta

- Stato al 2026-10-15 (la #133 scritta e non committata, prima che le attese fossero rifatte)
  - ⚠️ La barra in alto non era mai stata fixed, in produzione nemmeno: `--spacing: initial` non genera `top-0`
  - ⚠️ Un `loading.tsx` vale per tutte le rotte sotto la sua cartella, e una pagina 404 pubblica passa a 200
  - La barra Zig-Zag fra le pagine, scelta e poi tolta il giorno dopo: la voce dice perché era stata scelta

- Stato al 2026-10-14 (la #142 chiusa, i rami puliti, niente in sospeso): 620 unitari e 195 E2E verdi, solo `main`
  - ⚠️ `git branch --merged` mente in un repository che unisce in squash: si controlla il tip contro la PR
- I panel con un titolo solo (2026-10-14), e la regola rimessa in piedi: il tetto di `column-verdict` da 1.45rem a 1.2rem
  - ⚠️ Non è la scala che cede alla copia: era un clamp in `vw` dentro una colonna fissa a 360px
  - ⚠️ Il test misurava a 1280px, dove il clamp non arriva al tetto: non aveva mai visto l'andata a capo
  - ⚠️ Niente verde nei controlli, e il `help` teal è l'inchiostro delle citazioni
- Stato al 2026-10-14 (le due pagine finite, prima della PR): i panel, e la regola che hanno piegato
  - ⚠️ La riga unica del verdetto ceduta dentro un panel, e rimessa in piedi lo stesso giorno abbassando il tetto del token
  - ⚠️ Le due immagini dell'utente in `docs/`, mai committate: cancellate il 2026-10-14 su sua richiesta
- Il tema chiaro delle due pagine (2026-10-14), guardato e misurato: le misure di quello che axe non guarda
  - ⚠️ `DESIGN.md` indietro per la terza sessione di fila, la tabella dei token ora è tenuta da un test
- Stato al 2026-10-14 (il peso misurato prima e dopo, prima dei panel): le due pagine non pesano, ma `/login` porta 14 KB di Release
  - ⚠️ `Script KB` +1.2 KB su ogni rotta, da un chunk solo, trovato al byte
  - ⚠️ Il "prima" ripreso ricostruendo `28bc49e`: a quel commit `pnpm page:weight` non esiste ancora
- Gli E2E delle due pagine (2026-10-14), com'è andata: da quale fatto nel markup legge ogni asserzione
  - ⚠️ axe bocciava il link della riga di verdetto, 2,1:1 contro il 3:1 di `link-in-text-block`
  - ⚠️ `DESIGN.md` si contraddiceva: Help Pointer Link contro Neutral row verdicts, vince il secondo
- Stato al 2026-10-14 (le due pagine in codice e misurate, prima degli E2E): il Counts Panel, l'ordine invertito, il budget delle caret row rifatto
  - ⚠️ Il budget delle caret row era sbagliato in due modi: mancava il padding di 1.5ch e il cap era ancora 900
  - ⚠️ Il codice commuta sui cinque passi, il mock sulla larghezza della singola citazione
  - ⚠️ `DESIGN.md` indietro sul mock in tre punti, la seconda sessione di fila
- Stato al 2026-10-14 (Technology in codice e misurata, prima del codice della Release): lo spacco, il contenitore unico a 1240, la Stat Row dentro il titolo
  - ⚠️ `max-[Npx]:` di Tailwind è esclusivo: a 1040px esatti il pannello correva 992px
  - ⚠️ Le misure di Technology su 18 larghezze: prima Release a 158px contro i 646 della pagina viva
  - ⚠️ I 43 `max-[640px]` del resto dell'app non erano ancora convertiti
- Stato al 2026-10-14 (il peso "prima" preso e il codice di Technology iniziato): i mock chiusi, le misure del mock A di Release
  - ⚠️ Le quattro misure del mock A sono il metro del codice della pagina Release
  - ⚠️ La prosa a 72ch dentro il bordo unico a 1192: decisa dall'agente, lasciata passare dall'utente
- Stato al 2026-10-14 (notte, il mock A di Release scritto e misurato): il bordo destro unico a 880 e il verde interattivo
  - ⚠️ 880 è misurato e non scelto: una citazione da 88 caratteri vuole 871,5px di colonna
  - ⚠️ Le misure di quel mock sono il "prima" dell'allargamento a 1240 deciso subito dopo
- Il verde interattivo, com'è finito (2026-10-14): lo stesso verde per l'anello di focus e per i link nel testo
  - ⚠️ Il verde del tema scuro misura 1.24:1 nel chiaro: due colori, non lo stesso a due luminosità
  - ⚠️ Il `-->` diceva due cose in un colore solo: destinazione verde, citazione ciano
  - ⚠️ Il verde vuol dire due cose, e la Severity-Only Colour Rule ora dichiara l'eccezione
- Stato al 2026-10-14 (sera, il mock di Technology chiuso): Release misurata e il piano dei due mock
  - ⚠️ Due righe di conteggio visibili insieme, e la regola di base che viene scavalcata
- Il mock di Technology, com'è finito (2026-10-14): il nome dentro la colonna sticky, la lista che è il cammino, la barra misurata su quello che la lista contiene
  - ⚠️ Un grid item sticky non si ferma in fondo alla propria riga: 24px stampati sopra il footer
  - ⚠️ `newPage({ viewportSize })` non esiste e viene ignorato: si misura a 1280 credendo di essere a 390
- Stato al 2026-10-14 (il mock di Technology, da approvare): l'audit misurato sulle pagine vive, e lo spacco scelto per Technology
  - ⚠️ In locale non c'è nessun Summary `ready`: gli stati pieni si seminano con `seedTechnology`
- Stato al 2026-10-14 (il codice di `/technologies`, nella PR #149): lo spacco in codice, misurato, e le tre cose decise mentre si scriveva
  - ⚠️ Il bottone che si accavallava in `grid` era un layer: le utility di Tailwind vincono su `globals.css` qualunque sia la specificità
  - ⚠️ A 320px una prova in iframe dava 11px di overflow: era la scrollbar dell'iframe, non la pagina
- Stato al 2026-10-13 (notte, il mock di `/technologies`): lo spacco scelto fra due proposte, e l'audit che lo ha prodotto
  - ⚠️ Il quota stampato tre volte nei primi 60px, e ~270px di vuoto in ogni riga: misurato sulla pagina viva
  - ⚠️ `/technologies` ha risposto una volta sola con la pagina di errore in dev, al primo colpo dopo l'avvio
- Stato al 2026-10-13 (sera, la Dashboard su `main`): i totali diventano un pannello, e tre scostamenti trovati dalla misura
  - ⚠️ Sul `main` locale non si committa, nemmeno un documento: `git pull --ff-only` si ferma e il ramo diverge
  - ⚠️ Prima di giudicare la tipografia, controlla i font: `next/font` in cache serviva Arial
- Stato al 2026-10-13 (dopo il codice della Dashboard): la Dashboard riscritta sul mock, il verdetto come somma delle righe
  - ⚠️ La frase lunga del verdetto muto misura 516px in una colonna da 360: la copia si accorcia, non la scala
  - ⚠️ Una lista che scorre dentro una colonna flex vuole `min-height: 0`, o la colonna sfonda il proprio massimo
  - ⚠️ Un grid item `sticky` non è fermato dalla sua cella: va dentro un div stirato all'altezza della riga
  - ⚠️ Gli stati per colonna vogliono due query separate, che si sovrappongono circa 1.7x sul database
- Stato al 2026-10-10 (sera, dopo il mock ufficiale della Dashboard): il mock rifatto da `DESIGN.md`, misurato con Playwright
  - ⚠️ Il browser rifiuta `file://`: un mock si rivede servendolo via http
  - ⚠️ Lo schermo dell'utente ha `devicePixelRatio` 2.5: le larghezze vere si guardano con Playwright, non ridimensionando Chrome
  - ⚠️ `technology.spec.ts:72` è un flake che vive già su `main`, non della #142
- Stato al 2026-10-10 (pomeriggio, dopo il dominio e la direzione scritta della #142): i nomi nuovi e le tre regole scritte contro il mock di direzione
  - ⚠️ Il verdetto e le righe contano lo stesso insieme, ogni Release una volta: è la fine della contraddizione che ha fatto nascere lo spacco
  - ⚠️ Tre regole di `DESIGN.md` nate *contro* il mock di direzione, che da lì non è più la fonte
  - ⚠️ Sotto i 640px il gap della barra è 12px e non 24: senza la strip la riga non può più andare a capo
- Stato al 2026-10-10 (mattina, dopo la direzione scelta per la #142): lo spacco scelto fra quattro proposte
  - ⚠️ La dissolvenza di una lista che scorre va fatta cadere sul vuoto, alta quanto il padding in fondo
  - ⚠️ La scrollbar nascosta è misurata e non sperata: `offsetWidth - clientWidth` deve valere 0
  - ⚠️ A 390px un mock nuovo non eredita le soluzioni responsive del prodotto: 144px di overflow trovati a misura
- Stato al 2026-10-10 (notte fonda, dopo la #141): la landing ripensata e unita
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
