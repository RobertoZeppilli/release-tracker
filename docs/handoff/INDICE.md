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
