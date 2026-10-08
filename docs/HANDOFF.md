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
**Da dove ripartire (2026-10-08, notte).** Siamo ancora **dentro la #26**, sul ramo
`26-landing-page`, e **il codice della landing è scritto**. Due commit locali, `5261aa6` (documenti
e mock, del giro prima) e quello di questo giro, **non pushati e senza PR**: il ramo esiste solo in
locale. ⚠️ **Push e PR aspettano la conferma dell'utente.**

**Cos'è stato scritto.** Un modulo nuovo, `src/modules/landing/`, con il `domain` che tiene il
contenuto reale e la `ui` che tiene i quattro componenti di `DESIGN.md`:

1. **`domain/specimen.ts`**: le righe 43-50 delle note di React 19.0.0 ai loro numeri veri, la
   citazione (riga 47, il virgolettato e il tratto citato) e i conti. `citedSpan` dice dove cade il
   tratto citato dentro il virgolettato, in caratteri, che è quello con cui la caret row si impagina.
   **`domain/vocabulary.ts`**: i quattro livelli di Rilevanza detti a parole, presi da `CONTEXT.md`.
2. **`ui/`**: `heading-block`, `bench` (con `source-view`, `cite-well`, `caret-draw`, `stage-rail`),
   `short-specimens`, `vocabulary-legend` (id `significance`), `closing-block`, `landing-note`
   (il `note:` + prosa, che serve a tre blocchi), `sign-in-button`.
3. **`src/app/page.tsx`**: la landing, **senza `revalidate` e senza API dinamiche**, cioè
   prerenderizzata una volta per deploy. L'unico numero che legge, la taglia del Catalogo, viene da
   `readCatalogDirectory()`, cioè dalla cartella `catalog/`: letta a build time, niente database.

**Il marchio e i metadati**: `verdict:` nella barra (era `release-tracker`), `SITE_NAME = "Verdict"`
in `src/lib/metadata.ts`, il titolo del layout è un **template `%s · Verdict`** e la landing è
l'unica con `absolute`. **`src/app/icon.svg`** è la caret row `^^^` come path, inchiostri fissi;
⚠️ **il `favicon.ico` di Next è stato cancellato**, era il logo di Next e in molti browser vince
sull'SVG. La home è **dentro la sitemap** come prima voce e il `noindex` è sparito.

⚠️ **Tre cose già risolte, da non ripagare.**
1. **Il numero di riga della riga citata** era `text-faint` sopra il `breaking-wash`, e axe lo boccia
   in tema scuro. La pagina Release non se l'era mai posto perché lì i numeri sono un **counter CSS**,
   che axe non vede; qui sono testo vero, quindi la riga citata alza anche il suo numero.
2. **Il disegno della caret row non sta in uno `useState`**: lo stato è un attributo `data-draw`
   scritto sull'elemento da `CaretDraw` (`armed` → `drawn`). Il markup che arriva dal server non ne
   ha nessuno, quindi **senza JavaScript i caret ci sono già**; tenerlo in React vorrebbe dire
   renderizzare il clip prima di poterlo animare, cioè l'unico ordine che li nasconde per sempre.
   La regola di lint `react-hooks/immutability` vieta anche di scriverlo dentro un hook che riceve
   la ref: per questo `CaretDraw` è un fratello del pozzetto e lo trova per id.
3. **URL canonico e sitemap**: Next risolve `/` su `metadataBase` **senza barra finale**, e la
   sitemap adesso scrive lo stesso indirizzo (`new URL(...).origin`), non una seconda grafia.

**`DESIGN.md` corretto in due punti** che il mock aveva già smentito: il Brand Mark **non** si ripete
a 20px sopra l'`h1` (sarebbe un kicker), e le due azioni stanno in **tre** posti, non due: blocco di
testa, fondo del banco, chiusura. `docs/DECISIONI.md` ha tre righe nuove: Home `/`, Titolo delle
pagine, Favicon.

**I numeri**: **562 unitari** (8 nuovi, tutti sul dominio della landing: il virgolettato è davvero un
pezzo della riga 47, il tratto citato è un pezzo del virgolettato, la caret row è disegnabile a ogni
larghezza in cui viene mostrata, e la legenda copre tutti i livelli dello schema), **186 E2E verdi**,
cioè tutta la suite, `pnpm lint`, `pnpm typecheck` e `pnpm build` verdi. **Nessun overflow
orizzontale** a 320, 390, 640, 1024 e 1440. **Core Web Vitals misurati in laboratorio** sulla build
di produzione: LCP 1240 ms desktop e 188 ms mobile, **CLS 0 e 0,0015**, cioè dentro la fascia buona;
⚠️ è localhost senza throttling, **la misura vera è quella in produzione**, e resta da fare.

**Gli scatti del codice** stanno in `.impeccable/review/app-landing-*.png` (desktop, light, mobile,
cite, fold) e **non sono ancora in git**: l'utente decide se committarli accanto a quelli del mock.

### Cosa resta della #26

1. **La verifica in produzione**: Core Web Vitals veri e una lettura dal telefono.
2. Il commit, il push e la PR, che aspettano la conferma dell'utente.

Il primo comando della sessione nuova:

```
leggi docs/HANDOFF.md e chiudi la #26
```

**Lo stato di partenza di questo giro (2026-10-08, sera).** Siamo **dentro la #26**, sul ramo `26-landing-page`.
Tutto quello che segue è in **un commit solo**, `5261aa6`, **non pushato** e senza PR: il ramo esiste
solo in locale. La CI del giro precedente è finita **verde** e `f8dcdfc` è stato pushato, quindi su
`main` locale e remoto combaciano.

**Il prodotto ha un nome: Verdict.** Scelto fra i due che piacevano all'utente, con **VeriLog
scartato** perché Verilog è un linguaggio di descrizione hardware (IEEE 1364) noto al pubblico esatto
del prodotto: ricerca persa in partenza e prima frase spesa a negare l'omonimia. Registrato in
`docs/DECISIONI.md` ("Il nome: Verdict", con le ragioni e le alternative), `PRODUCT.md` (nome e
**Brand Commitments**) e `CONTEXT.md` (titolo, riga nella tabella dei nomi, ambiguità risolta).
⚠️ **La convenzione è vincolante**: **Verdict** senza articolo è il prodotto, il **Verdetto** è il
giudizio su una Release, e nessun identificatore nuovo prende il nome del prodotto (`pageVerdict`,
`rowVerdict`, `DashboardVerdict`, `SummaryVerdictSchema` restano quelli). `release-tracker` è solo il
repository.

⚠️ **Il dominio non è deciso e non si compra adesso** (regola della spesa). Verificato il 2026-10-08
con RDAP e DNS: presi `verdict.dev`, `.io`, `.sh`, `.app`, `.tools`, `.run`, `.cloud`, `.tech`,
`getverdict.com`, `useverdict.com`; `verdict.co` è parcheggiato su Efty, cioè in vendita. **Liberi
quel giorno**: `verdict.build`, `verdict.codes`, `verdict.page`, `verdictdev.com`. ⚠️ Attenzione al
metodo: `rdap.org` **non copre** `.sh`, `.io`, `.co`, `.so`, quindi lì un 404 non vuol dire libero e
va controllato con `nslookup -type=NS`.

**La struttura della landing è scelta con l'utente, fra tre tirate dal `concept-seed`**
(`--scope surface --mode persuade`, chiave `48f9f1bc`, mani 4-2-1): ha vinto **il banco di esame**.
Una sola Release vera esaminata per stadi (`source` → `cite` → `verdict` → `help`) che restano tutti
nel DOM; lo scroll non rivela niente, muove solo il lettore, e l'unico moto è la caret che si disegna.
⚠️ **Scartata "la pagina che si diagnostica"** per una ragione da non riaprire: usava `breaking[n]:`
per accusare lo stato dell'arte, e questo insegna al primo contatto un vocabolario che l'app poi
smentisce (l'inchiostro `breaking` significa gravità, Severity-Only Colour Rule).

**Prima del codice, i documenti, come chiede il criterio della issue:**
1. **`DESIGN.md`**: la sezione **Brand Mark** (logotipo `verdict:` in Fragment Mono, mai in un
   inchiostro di severità, icona = la caret row `^^^` come path SVG su quadrato `ground`), quattro
   componenti nuovi (**The Bench**, **Short Specimen**, **Vocabulary Legend**, **Counter-Position
   Note**), due righe nei Do e due nei Don't, un paragrafo in Overview che spiega perché la landing
   sta **dentro** il registro di lavoro, e i token dei componenti nel frontmatter. Titolo e `name:`
   adesso dicono **Verdict**.
2. **`CONTEXT.md`**: i **quattro livelli di Rilevanza detti a parole** sotto la voce Rilevanza,
   perché è da lì che la landing li copia e perché il critique dà 1 su 5 ad "Aiuto e documentazione"
   proprio per questo.

**Il mock è scritto e verificato**: `design/mocks/landing.html`, ed è la fonte dell'aspetto come gli
altri quattro. **Nessun contenuto inventato**, e ogni numero è contabile in un file pubblico:
React 19.0.0 (2024-12-05) ha **13 breaking changes** e **8 notable** in **271 righe** di note, e la
riga citata è davvero la **47** (`Removed: propTypes`); Vite 6.0.0 ha un changelog di **28 righe**
dove le due breaking sono marcate solo da un `!`; **TypeScript 5.7.2** ha un corpo di release che è
**solo un link a un blog**, cioè il caso di "note non giudicabili" di `CONTEXT.md`. Le due Release
magre non sono decorazione: sono la metà onesta dell'argomento.

⚠️ **Due difetti già trovati e corretti nel mock, da non ripagare**: il marchio a 20px sopra l'`h1`
era un **kicker**, che la craft floor della skill vieta esplicitamente (il marchio sta nell'header e
basta); e la citazione **andava a capo** con la caret row ancora visibile, cioè carets sotto le
parole sbagliate. La regola di `DESIGN.md` è che il testo citato deve stare su una riga sola: si è
accorciato il quote a `Using propTypes will now be silently ignored.` e quote e caret row stanno
**in un solo pozzetto**. Misurato a 320, 390, 640, 1024 e 1440: **nessun overflow orizzontale**
(`node .impeccable/shoot-landing.mjs`, che scrive in `.impeccable/review/landing-*.png`).
⚠️ Quello script importa Playwright **per percorso dentro `node_modules/.pnpm`**: un `from
"playwright"` non risolve dalla cartella `.impeccable/`.

**I quattro mock esistenti** hanno il wordmark nuovo (`verdict:`, che punta a `landing.html`).

### Quello che questo giro chiedeva, e che adesso è fatto

La pagina al posto del provino dei token, il marchio nell'app, la favicon, i metadati, i test
unitari e E2E, i Core Web Vitals e il controllo di accessibilità: tutto nello stato in testa.


**Lo stato precedente (2026-10-08, pomeriggio).** La **#120 è chiusa**: **PR #128 unita** in
`bdc712a`, e la issue si è chiusa da sola col `Closes`. **Non c'è niente in sospeso.** I rami sono
stati **cancellati tutti**, locali e remoti: restano `main` e nient'altro (erano 17 locali e 38
remoti). ⚠️ **La cancellazione resta dell'utente**: la modalità auto la nega all'agente
(`Irreversible Local Destruction`) **anche quando l'utente la chiede a parole** dentro la sessione.
Quello che l'agente può fare è preparare la lista verificata e passargli i due comandi.

**Cos'è cambiato**: le Tecnologie hanno un **Marchio**, e la issue chiedeva prima di tutto una
risposta di prodotto.

1. **La risposta è sì, ma solo dove il soggetto è la Tecnologia**: 16px nella riga del Catalogo
   (quindi anche nel picker della Dashboard vuota, che è lo stesso componente) e 24px accanto al
   titolo della pagina Technology. **Niente sulle righe di Release**, dove un glifo monocromatico
   vuol già dire Rilevanza. ⚠️ **Scelta dell'utente fra quattro strade**: aveva chiesto anche la
   riga della Dashboard, poi l'ha lasciata fuori.
2. ⚠️ **Il nome resta sempre scritto, ed è un rifiuto motivato.** L'utente ha proposto di mostrare
   **solo l'icona** dove c'è e il nome solo dove manca. Rifiutato per iscritto e per tre ragioni, la
   prima delle quali non è di gusto: il link e il Toggle annunciano "React" mentre a schermo non
   c'è nessuna parola "React", e questo **fallisce WCAG 2.5.3 Label in Name**, che il progetto
   dichiara; il filtro cerca per nome, quindi mostrerebbe righe senza la stringa digitata; e una
   lista mista (34 glifi e 3 parole nella stessa colonna) si scorre più piano di una omogenea.
   L'utente ha accettato la strada consigliata.
3. **La provenienza è `pnpm icons:sync`** (`scripts/sync-technology-marks.mts`): legge
   `simple-icons`, **devDependency**, e genera due file, `src/modules/catalog/ui/technology-marks.ts`
   per l'app e `design/mocks/technology-marks.js` per i mock, che sono chiavati **per nome** perché i
   mock costruiscono le righe dai nomi. Una sola fonte, così un mock non può divergere. Le eccezioni
   di slug stanno nello script: `next`→`nextdotjs`, `nodejs`→`nodedotjs`, `vue`→`vuedotjs`,
   `drizzle-orm`→`drizzle`, `redux-toolkit`→`redux`.
4. **34 Marchi su 37.** Playwright e Zustand non ce l'hanno in simple-icons; ⚠️ **SvelteKit è senza
   di proposito**, perché l'unico che esiste per lei è quello di Svelte, e due righe della stessa
   lista con la stessa forma togliono proprio quello che il Marchio doveva dare. Le tre righe tengono
   il box **vuoto**: ogni nome parte dalla stessa x e nessuna riga cambia altezza.
5. **`DESIGN.md` scritto prima del codice**, come chiedeva il criterio: la sezione **Technology
   Mark**, la colonna del nome in Layout (`calc(16ch + 24px)`), le due descrizioni dei componenti e
   una riga per ciascuna lista Do / Don't. `docs/DECISIONI.md` registra la licenza **CC0** e che i
   **marchi restano dei loro proprietari**, con uso nominativo e descrittivo.

**I numeri**: **554 unitari** (3 nuovi, sui dati generati: copertura del Catalogo, nessun path
orfano, e un path che contiene **solo geometria** e niente da scaricare), **180 E2E verdi**, cioè
tutta la suite. `pnpm typecheck` e `pnpm lint` verdi. Su `main` il **`Deploy database` è verde** due
volte (nessuna migrazione da applicare). ⚠️ **La `CI` del merge è stata annullata** dal push di
questo documento, ed è la trappola già scritta qui sotto: un push su `main` annulla la CI in corso.
Il giro che la sostituisce gira sullo stesso albero, **ma non era ancora chiuso** quando questa riga
è stata scritta: **il primo controllo della sessione nuova è il suo esito** (`gh run list --branch
main --limit 3`). La PR #128 era verde su tutto prima del merge, CodeRabbit compreso. **Peso misurato su due build vere**, come chiedeva il criterio: **+39,4 KB raw
e +18,3 KB gzip** sui chunk client (1.391.332 → 1.430.738 e 390.506 → 408.853). Sta in un chunk
cacheato, e la pagina Technology non paga niente lato client, perché lì il Marchio è reso dal server.
⚠️ **Next 16 non stampa più il First Load JS** nella tabella del build: il peso si misura sommando
`.next/static/chunks/**/*.js`, gzip compreso, su due build.

**Provato rimettendo il difetto**, coi due file sorgente riportati a `HEAD`: **cadono tutti e 4** i
test nuovi. ⚠️ Due inciampi della misura, da non ripagare: il quarto test, al primo giro, **passava
anche senza il Marchio** (due righe hanno la stessa altezza comunque), e va riscritto finché non
distingue il difetto, confrontando il Marchio col **centro verticale** del nome; e `.locator("svg")`
dentro una riga del picker prende **anche i due svg del Toggle**, quindi il Marchio è
`.locator("svg").first()`.

### Cosa resta

1. ⚠️ **La verifica dal telefono in produzione**, l'unica cosa aperta del giro del critique, ed è
   dell'utente. Ora comprende anche il Marchio nella riga a 390px.
2. Nel mock della Dashboard c'è una riga **`Python`, che non è nel Catalogo**: discrepanza
   preesistente, non toccata. Ora mostra lo spazio vuoto, e illustra bene la regola.
3. Le strade di "Le strade aperte", tutte in attesa del via dell'utente.

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
