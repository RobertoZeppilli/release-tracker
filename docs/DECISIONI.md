# Decisioni di progetto — MVP

Riepilogo delle decisioni prese nella sessione di progettazione del 16 settembre 2026.
I termini in grassetto sono definiti in [`CONTEXT.md`](../CONTEXT.md); le decisioni difficili da
invertire hanno un ADR in [`docs/adr/`](./adr/).

## Prodotto

Un SaaS per sviluppatori che raccoglie le **Release** delle **Tecnologie** che uno
**Sviluppatore** segue e le presenta in una **Dashboard**, con **Sintesi** generate dall'AI per le
Release che contano.

- Interfaccia, **Sintesi** e codice in **inglese**. Il glossario è in italiano con una tabella di
  nomi inglesi canonici.
- Il prodotto si chiama **Verdict**. Deciso il 2026-10-08, chiudendo la #26. `release-tracker`
  resta il nome del repository e della cartella, e non va più letto come un nome provvisorio del
  prodotto.

### Il nome: Verdict

Il prodotto fa una cosa sola, dare un verdetto su una **Release**, e il nome dice quella cosa. Non
nomina il mezzo (il monitoraggio) né la materia prima (le note di rilascio): nomina l'uscita.
Risuona con il centro del design system, dove il componente di firma è la `Verdict Line`, e con la
voce dell'interfaccia, che parla per `ok:`, `warning:` e `breaking[n]:`.

**Scartato VeriLog**, l'altro nome in lizza, e non per gusto: **Verilog è un linguaggio di
descrizione hardware, standard IEEE 1364**, noto al pubblico esatto di questo prodotto. La ricerca
sarebbe persa in partenza contro decenni di documentazione e corsi, la prima frase di ogni
presentazione si spenderebbe a negare l'omonimia, e il suffisso `...Log` promette l'aggregazione di
log, che non è il mestiere di qui.

**La collisione col dominio è reale, ed è nostra, non dell'utente.** La parola "Verdict" non compare
mai nell'interfaccia: a schermo si leggono `ok:`, `warning:` e `note:`, mai l'etichetta. Vive invece
nel codice (`SummaryVerdictSchema`, `DashboardVerdict`, `pageVerdict`, `rowVerdict`) e in
`DESIGN.md` (`Verdict Line`). Da qui la convenzione, fissata in `CONTEXT.md`: **Verdict** con la
maiuscola e senza articolo è il prodotto, il **Verdetto** è il giudizio su una Release. Nessun
identificatore del codice cambia, e nessuno nuovo prende il nome del prodotto.

**Il dominio non è deciso e non si compra adesso.** Verificato il 2026-10-08 via RDAP e DNS:
`verdict.dev`, `verdict.io`, `verdict.sh`, `verdict.app`, `verdict.tools`, `verdict.run`,
`verdict.cloud`, `verdict.tech`, `getverdict.com` e `useverdict.com` sono registrati; `verdict.co`
è parcheggiato su Efty, cioè in vendita a un prezzo da trattare. Liberi quel giorno:
`verdict.build`, `verdict.codes`, `verdict.page` e `verdictdev.com`. La scelta aspetta il lancio,
perché un dominio è una spesa: il nome del prodotto non dipende dal dominio esatto, e il repository
resta dov'è. Esiste un pacchetto npm `verdict` e un utente GitHub `Verdict`: nessuno dei due
interferisce, perché qui non si pubblica un pacchetto e il repository sta sotto l'account personale.

## Modello del dominio

| Decisione | Dettaglio | ADR |
|---|---|---|
| **Versione** e **Rilevanza** separate | La Rilevanza (`featured` · `notable` · `digest` · `preview`) viene da una **Strategia di classificazione** per Tecnologia, non dal tipo SemVer. Correggibile a mano per singola Release. | [0001](./adr/0001-rilevanza-separata-dalla-versione.md) |
| CSS/W3C fuori dall'MVP | Le spec non hanno Versioni: entreranno come nuovo tipo di **Fonte**. | 0001 |
| **Catalogo** curato | Gli Sviluppatori seguono solo Tecnologie del Catalogo. I pacchetti fuori catalogo diventeranno **Richieste di tecnologia** (post-MVP). | [0002](./adr/0002-catalogo-curato.md) |
| Una Release per Versione | Anche se più **Fonti** osservano la stessa Versione. | — |
| **Versione in uso** dichiarata a mano | Decisa il 2026-09-29. Lo Sviluppatore dichiara, per ogni Tecnologia che segue, la Versione che usa; l'app non la osserva e non la verifica mai. È quello che rende il giudizio **Intervento richiesto** una risposta alla domanda vera ("io sono indietro di quanto?") invece di un'etichetta uguale per tutti: oggi la Versione di partenza si scrive a mano nel **Cammino di upgrade** e si perde a ogni visita. Entra nell'MVP **prima della revisione del design**, perché cambia che cosa la Dashboard deve dire per prima. Una dichiarazione ferma invecchia in silenzio: ogni conto che ci si appoggia dice da quando lo è. | — |
| Import di `package.json` dopo il lancio | Decisa il 2026-09-29, e conferma la riga "Fuori dall'MVP". Non aggiunge nessuna regola: è solo un modo più veloce di riempire la **Versione in uso**, quindi è additivo e non blocca niente. Aspetta per tre ragioni: è una fetta vera (mappatura nome del pacchetto → Tecnologia, monorepo, `dependencies` contro `devDependencies`, manifest contro lockfile); va deciso che fare delle dipendenze fuori dal **Catalogo**; e con un Catalogo di 37 Tecnologie un `package.json` vero verrebbe riconosciuto per una riga su otto, facendo leggere l'app come incompleta invece che curata. Diventa convincente quando il Catalogo è grande. | — |
| Ruoli delle Fonti | Una Fonte **rileva** le Versioni (npm, tag GitHub, PyPI) o **fornisce le Note di rilascio** (GitHub Releases, `CHANGELOG.md`). Formato dei tag e percorso del changelog configurati per Fonte. | — |
| Niente Sintesi senza Note | Se mancano le **Note di rilascio**, la Sintesi è _Non disponibile_; non si generano sintesi dal solo numero di versione. Niente scraping dei blog nell'MVP. | — |
| **Anteprime** nell'MVP | Beta e rc sono Release con Rilevanza `preview`; la Sintesi solo per la prima Anteprima di una nuova major. Canary, nightly ed experimental esclusi dal Rilevamento. | — |
| Catalogo come codice | Un file per Tecnologia nel repository, validato con Zod, sincronizzato su Supabase al deploy. **Correzioni di rilevanza** direttamente sul database, mai sovrascritte. | [0005](./adr/0005-catalogo-come-codice.md) |
| Sync del Catalogo | File `catalog/<slug>.json`; il workflow GitHub `Deploy database` applica le migrazioni e poi il sync a ogni push su `main`. Mai nella build di Vercel: le anteprime condividono il database di produzione. | 0005 |
| Ritirare, mai cancellare | Una Tecnologia tolta dal Catalogo diventa **ritirata**: niente più Rilevamento, contenuti ancora online. | 0005 |

## Pipeline dei dati

| Decisione | Dettaglio | ADR |
|---|---|---|
| Nessuna chiamata esterna dal client | GitHub, npm e Anthropic sono chiamati solo dai job server. Gli utenti leggono dati salvati. | — |
| **Rilevamento** e Sintesi separati | Tre cron distinti. Il Rilevamento crea Release (idempotente su Tecnologia + Versione), assegna la Rilevanza, salva le Note. Non chiama l'AI. | [0003](./adr/0003-rilevamento-e-sintesi-separati.md) |
| "Una sola volta" garantito dal database | Presa in carico atomica `pending` → `processing` con un unico `UPDATE … RETURNING`. | 0003 |
| **Stato della sintesi** | `pending` · `processing` · `ready` · `unavailable` · `skipped` · `failed`. La Release è visibile in qualsiasi stato. | — |
| Quali Release si riassumono | `featured`, `notable` e la prima `preview` di una major. Le `digest` no. | — |
| Che cosa è "nuovo" per il Rilevamento | Una Versione pubblicata **dopo** la più recente che già abbiamo, non semplicemente assente: l'Importazione iniziale si ferma a 12 mesi, e senza questa regola il primo Rilevamento registrerebbe tutta la storia che aveva appena escluso. Una Tecnologia senza Release non viene interrogata: è dell'Importazione iniziale. | — |
| Nessuna spesa fino al lancio | In `vercel.json` è pianificato **solo** il cron del Rilevamento, che è gratis: i due delle Sintesi sono tolti finché non si lancia. Le Release si accumulano `pending` e al lancio bastano un batch e il ripristino delle due righe. L'unica cosa che spende è Anthropic. | — |
| Piano Vercel Hobby | 100 cron per progetto, ciascuno al massimo **una volta al giorno**, con precisione all'ora (±59 min): tre cron distinti, Rilevamento 02:00, invio 05:00, raccolta 11:00 UTC. Le tre ore di distacco coprono lo slittamento; se l'ordine salta lo stesso, il giro dopo recupera da sé. Durata massima della funzione 300 s, che è già il default. | 0003 |
| Dove parte l'Importazione iniziale | Nello stesso job del sync del Catalogo, dopo il sync: si importa ogni Tecnologia attiva senza Release, così un import interrotto riparte al deploy successivo. Il job usa il proprio `GITHUB_TOKEN` per i limiti di GitHub. | 0005 |
| **Importazione iniziale** limitata | Solo gli ultimi 12 mesi + l'ultima Release `featured`. Sintesi solo per l'ultima `featured` e le `notable` degli ultimi 90 giorni; il resto va nello **Storico** (`skipped`). | — |
| Claude Haiku 5.5 via Batch API | Invio di un batch giornaliero, raccolta dei risultati in un'esecuzione successiva. **$0,00066 per Sintesi in media, mediana $0,00049**: sono i token veri del primo batch (2026-09-28) alle tariffe di Haiku 5.5, che sono esattamente **un cinquantesimo** di quelle di Opus 5 su entrambi i lati ($0,10 e $0,50 per milione contro $5 e $25, dimezzate dallo sconto batch). Il profilo di token non cambia col modello: misurato sul set di valutazione, il prompt `v6` sta entro il 2% del `v5` (72.827 token in ingresso e 24.228 in uscita per 14 Sintesi, cioè $0,0097 il giro). La media sta sopra la mediana perché poche Release con Note enormi pesano molto: le 10 Sintesi più care sono il 21% della spesa del batch. **Prima era Opus 5** ($0,033 in media), cambiato il 2026-10-08 con la #57 misurando la qualità, non a occhio. | [0007](./adr/0007-sintesi-con-haiku-5-5-via-batch-api.md) |
| Quanto costa, misurato sul Catalogo a 37 Tecnologie | **Arretrato: 126 Sintesi, $0,08**, cioè 12 mesi di storia importati tutti insieme; su Opus 5 lo stesso arretrato era costato **$4,16, spesi davvero** il 2026-09-28. **Regime: circa 40 Sintesi al mese, attorno a $0,03**, cioè un decimo di centesimo al giorno; su Opus erano $1,30 al mese. Negli ultimi 30 giorni il Catalogo ha prodotto 36 Release `featured` o `notable`, 14 `preview` (di cui si riassume solo la prima di ogni major) e 99 `digest`, che non costano niente. Il costo è per Release, non per Sviluppatore: mille lettori della stessa Sintesi costano quanto uno, e a farlo crescere è solo il numero di Tecnologie. Due cose da ricordare sul metodo. Il conto dell'arretrato scala i token veri misurati su Opus, perché l'arretrato non è stato rigenerato: è una proiezione, non una spesa. E un costo per Sintesi preso dal set di valutazione sottostima: la stima di partenza diceva $2,94 e $0,90 ed era bassa di un terzo, perché le 14 Release del set hanno Note più corte del Catalogo vero (4.950 token di input in media contro 8.208). | 0007 |
| Output strutturato | Titolo (≤ 140 caratteri nello schema, 120 chiesti dal prompt), 3–5 punti chiave, breaking changes (cosa cambia + come migrare), **Intervento richiesto** (sì/no), modello e versione del prompt. Validato con Zod; se non valido → `failed`. | — |
| Nessuna invenzione | Breaking changes e Intervento richiesto si basano solo sulle Note. | — |
| Sintesi pagata, non buttata | Un difetto di forma che non tocca il contenuto si corregge leggendo, non facendo fallire la Sintesi: si toglie la cornice markdown e si tengono i primi 5 punti chiave se il modello ne manda sei. Restano `failed` gli output che rompono il contenuto o il legame breaking changes / Intervento richiesto. | — |
| Niente trattino lungo nelle Sintesi | Il trattino lungo e' vietato in ogni testo pubblicato, e il prompt non lo diceva: dal `v5` (2026-10-06, issue #87) e' vietato in `title`, nel `text` di un punto chiave e in `change` e `migration` di un breaking change. Le `quote` restano fuori dal divieto: sono copiate carattere per carattere dalle Note, quindi un trattino la' dentro e' dell'autore delle Note e toglierlo romperebbe il controllo verbatim di `locateCitation`. | — |
| Le tre Sintesi corrette a mano | Il conteggio su produzione (2026-10-06): **122 Sintesi `ready`, 3 col trattino lungo** in un campo scritto dal modello (`vite 8.0.0` e `vite 8.2.0` nel titolo, `pnpm 11.22.0` nella `migration` di un breaking change) e 9 che ce l'hanno solo dentro una `quote`, che non si toccano. Rigenerare le tre al `v5` costava circa 6 centesimi e **l'utente ha deciso di non spendere**: i tre campi sono corretti in posto, lo spazio-trattino-spazio diventa due punti piu' spazio perche' in tutti e tre i casi unisce due frasi indipendenti. `prompt_version` **resta `v4`**, che e' il prompt che ha prodotto il resto di quelle Sintesi: il testo pubblicato non e' piu' quello del `v4` solo per quel carattere, ed e' questa riga a dirlo invece di lasciarlo scoprire. | — |
| Fine riga normalizzati | Le Note arrivano da GitHub con `CRLF` e la pagina le mostra normalizzate a `LF`: `locateCitation` normalizza entrambi i lati, altrimenti una citazione su più righe perde il puntatore senza che nessuno se ne accorga. | — |
| Formato imposto dall'API | La richiesta porta lo schema Zod della Sintesi come `output_config.format`: il modello non può rispondere in prosa o dentro un blocco markdown. Lunghezze e conteggi restano solo suggerimenti, quindi la validazione Zod resta l'ultima parola. | — |
| Quanto costa che le lunghezze siano suggerimenti | **4 Sintesi su 126, il 3%, sono `failed` per il solo titolo troppo lungo** (121, 124, 125 e 126 caratteri contro il limite di 120), misurato sul primo batch vero. Erano corrette in tutto il resto, `keyPoints` e legame breaking changes / Intervento richiesto compresi. È il prezzo previsto della riga sopra: la decodifica vincolata garantisce la forma del JSON, non il `maxLength` di una stringa, e contare i caratteri non è una cosa che il modello faccia in modo affidabile, nemmeno quando il prompt glielo chiede. Erano Sintesi pagate e buttate: dal 2026-09-29 il limite dello schema sale a **140** mentre il prompt continua a chiedere 120, così i pochi caratteri che il modello sfora finiscono nel margine invece di far fallire la Sintesi. Le 4 sono state reimportate dai risultati salvati del batch, senza rinviarle e senza spendere. | — |
| Note lunghe | Mai troncate in silenzio: oltre la soglia di sicurezza → `failed` con il motivo. La soglia è **150.000 caratteri** dal 2026-09-29, alzata dagli 80.000 iniziali che lasciavano fuori `next 16.3.0` (108.842), `biome 2.0.0` (99.660) e `turborepo 2.11.0` (88.867), cioè Release _In evidenza_ di Tecnologie molto seguite. Misura una spesa (circa 40k token, sotto i 10 centesimi), non la finestra del modello: sul Catalogo a 37 Tecnologie il 99° percentile delle Note sta a 53.592 caratteri. | 0007 |
| Credito API esaurito | Non è un fallimento: le Release restano `pending` e si riprendono da sole all'esecuzione successiva. L'avviso all'amministratore resta alla Console di Anthropic (email di credito basso e ricarica automatica); nessun canale di avviso nostro nell'MVP. | 0007 |
| Sorgenti interrogate con l'ETag | Il Rilevamento manda `If-None-Match` con il validatore salvato su `sources.etag` e si ferma sul 304. Un packument npm pesa da 1 a 5 MB compressi e quasi ogni giorno è identico: senza, con ~40 Tecnologie sarebbero ~80 MB al giorno e il rischio di sforare la durata della funzione. Misurato in locale: secondo giro 0,8 s invece di 3,4 s, zero byte. | — |
| Endpoint dei job | `GET /api/jobs/detection`, `/api/jobs/summaries/submit` e `/collect`, solo con `Authorization: Bearer <CRON_SECRET>` (l'header di Vercel Cron); senza segreto configurato rifiutano tutto. Il batch inviato si ritrova da `summaries.batch_id`. | 0007 |

## Esperienza utente

| Decisione | Dettaglio |
|---|---|
| Pagine pubbliche | `/technologies/[slug]` e la pagina della singola Release sono pubbliche, generate lato server con ISR e rigenerate quando cambia una Sintesi. Sono il canale SEO. |
| Login | Solo GitHub OAuth con Supabase Auth, **scope minimo**: `read:user user:email`, chiesti dall'app in `src/app/auth/sign-in/route.ts`. L'accesso ai repository si chiederà a parte, con lo scanner. |
| Chi protegge le rotte | Il proxy di Next (`src/proxy.ts`, solo `/dashboard` e `/technologies` esatti) redirige presto e rinfresca la sessione; l'autorità è `requireDeveloper()` nella pagina, come chiede la doc di Next. Le pagine pubbliche non passano dal proxy: restano in cache. |
| Stato di accesso nella barra | Letto nel browser (`AuthStatus`), non lato server: una lettura server renderebbe dinamiche le pagine pubbliche e annullerebbe la rivalidazione della #13. |
| Ritorno dopo il login | `?next=<percorso>` accettato solo se interno (`safeRedirectPath`): niente URL assoluti, `//host`, backslash o caratteri di controllo. Altrimenti si torna alla Dashboard. |
| Login negli E2E | Playwright non può guidare il consenso di GitHub: `POST /api/test/session` fa accedere un Developer di prova con una password, e la rotta esiste solo se `E2E_AUTH_SECRET` è nell'ambiente (in produzione risponde 404). |
| Sviluppatori senza email | Il flag *Allow users without an email* del provider GitHub resta **spento**: con lo scope `user:email` l'indirizzo verificato arriva anche se privato, e uno Sviluppatore senza indirizzo non potrebbe ricevere Notifiche né Digest. Meglio un accesso che fallisce subito di un account inutilizzabile. |
| Login richiesto per | **Seguire** e la **Dashboard**. Nessun "seguire" anonimo in localStorage. |
| Pagina `/technologies` | Solo con login. Tre sezioni: seguite, **Catalogo**, ritirate (solo se seguite). Filtro per nome e descrizione. Mock: `design/mocks/technologies.html`. |
| Limite Free nell'interfaccia | A 10 seguite i Follow si disattivano (`aria-disabled`) con una nota. L'aggiornamento è ottimistico: se il database rifiuta, il toggle torna indietro e la riga mostra l'errore con il rimedio. |
| **Tecnologie ritirate** seguite | Restano seguite e contano nei 10; si possono solo smettere di seguire, e poi non si possono più seguire. |
| Tecnologia assente dal Catalogo | Solo una nota: il Catalogo è curato e le **Richieste di tecnologia** non sono aperte. Nessun form né link nell'MVP. |
| Sezioni della Dashboard | **Spotlight** (Release `featured` degli ultimi 30 giorni; se non ce ne sono, l'ultima major in forma compatta), **Latest**, **Previews**, **Weekly Digest**. |
| Weekly Digest | Vista calcolata per settimana ISO (UTC), non salvata. Diventerà un'entità con le email. |
| Stato "Visto" per Release | Rimandato: arriva con le Notifiche. |
| Filtri e tab | Nell'URL. |
| Glossario della **Rilevanza** | `featured` · `notable` · `digest` · `preview` sono mostrati in tutta l'interfaccia e **non sono definiti a parole da nessuna parte** (il critique del 2026-10-07 le dà 1 su 5 su "Aiuto e documentazione"). La definizione la darà la **landing** (#26), non una pagina dell'app: è la pagina che deve dire cos'è il prodotto, e il vocabolario è parte di quella risposta. Dentro l'app la parola resta accoppiata al suo glifo, che è il minimo di WCAG, e non alla sua definizione. ⚠️ Scelta dell'utente il 2026-10-08, fra questa, un blocco con ancora su `/technologies` e una definizione in ogni intestazione di sezione. |
| Scorciatoia del filtro | **`/` mette a fuoco il filtro** di `/technologies` e seleziona quello che c'è già. È l'unico tasto che l'app si prende, e solo mentre nessun altro ascolta: dentro un campo, o con un modificatore premuto, il tasto resta di chi ha il fuoco. Annunciata con `aria-keyshortcuts` sul campo e con `press / to filter` in Meta faint accanto al conteggio (vedi `DESIGN.md`, Follow Status and Filter). |
| Seguire più Tecnologie insieme | **Rimandato a una issue**, non all'MVP di questa sessione: vuole un modello di selezione, una scrittura in blocco, il limite Free applicato al gruppo invece che alla singola riga e una cache ottimistica di gruppo. È una fetta, non un acceleratore da aggiungere al Follow Toggle. |
| Sezioni della Dashboard richiudibili | **Rifiutato.** Richiuderle vuole uno stato per lettore che oggi non esiste (localStorage o URL), e la Dashboard ha già il **Count Box**, che porta a ogni sezione con un ancoraggio: aggiungerebbe stato senza togliere niente. Chi vuole meno pagina ha già il salto, non il sipario. |
| Anteprime nella pagina della Tecnologia | Solo quelle successive all'ultima Versione stabile, in una sezione a parte; quelle già seguite dalla loro stabile non si elencano. |
| **Cammino di upgrade** | Nell'MVP: la pagina di una Tecnologia accetta `?from=<version>` e mostra le Release fino all'ultima stabile e quante richiedono intervento. Pubblico, senza login, calcolato sulle Release salvate. |
| Descrizione di una pagina pubblica | La Release con una Sintesi pronta usa **il titolo della Sintesi e nient'altro**: la descrizione non può affermare quello che la Sintesi non dice. Senza Sintesi è neutra, Versione e giorno di pubblicazione, più una riga sulle Note se ci sono. La Tecnologia unisce la descrizione del Catalogo a quello che la pagina contiene. |
| URL canonico | Il percorso della rotta, senza query: `?from=` è una lettura della stessa pagina, non una pagina sua. |
| Sitemap | Generata dal Catalogo e dalle Release, **Tecnologie ritirate comprese**, perché le loro pagine restano raggiungibili. Rigenerata con ISR e marcata stale insieme alle pagine da `revalidateReleasePages`. |
| `robots.txt` | Esclude le pagine con login. `/technologies$` con l'ancora, altrimenti un prefisso nudo escluderebbe anche tutte le pagine delle Tecnologie sotto di lui. |
| Icone delle Tecnologie (#120) | Un **Marchio** monocromatico di 16px accanto al nome nella riga del Catalogo e di 24px accanto al titolo della pagina Technology. I glifi arrivano da [simple-icons](https://github.com/simple-icons/simple-icons) (licenza **CC0**), sono copiati nel repository da `pnpm icons:sync` e serviti dall'app: **nessuna chiamata a un CDN dal client**. I **marchi restano dei loro proprietari** e l'uso qui è nominativo e descrittivo: identificano la Tecnologia di cui la riga parla, nella forma e non nel colore, senza suggerire nessun rapporto con noi. Fuori: i loghi a colori (vietati da `DESIGN.md`) e le righe di Release, dove un glifo vuol già dire Rilevanza. Una Tecnologia senza glifo lascia il suo spazio vuoto. |
| Home `/` | È la **landing** (#26), indicizzata e prima voce della sitemap. Lo era stata `noindex` e fuori dalla sitemap finché è stata il campionario dei token (#2): un risultato di ricerca fatto di campioni di colore è peggio di nessun risultato. La pagina è **prerenderizzata una volta per deploy**, senza `revalidate` e senza API dinamiche, ed è il modo più economico di tenere i Core Web Vitals nella fascia buona; l'unico numero che legge, la taglia del Catalogo, viene dalla cartella `catalog/`, cioè dal file su cui lavora `catalog:sync`. |
| Titolo delle pagine | Il layout porta `%s · Verdict`, così ogni pagina dice il prodotto; la landing è l'unica con `absolute`, perché il suo titolo il nome ce l'ha già. |
| Favicon | La **caret row** `^^^` come `src/app/icon.svg`, inchiostri fissi e non legati al tema, perché la barra del browser non è nostra (vedi Brand Mark in `DESIGN.md`). Il `favicon.ico` arrivato con l'impalcatura di Next è stato **cancellato**: era il logo di Next e in molti browser vince sull'SVG. |

## Piani e pagamenti

| Decisione | Dettaglio | ADR |
|---|---|---|
| Principio | Gratis ciò che costa zero per utente; Pro ciò che cresce con l'uso. Sintesi e pagine pubbliche sempre gratuite. | [0004](./adr/0004-monetizzazione-e-merchant-of-record.md) |
| Free | Dashboard, pagine pubbliche, massimo **10 Tecnologie seguite**, applicato dal database. | 0004 |
| Pro (post-MVP) | Tecnologie illimitate, Notifiche email/Slack, scanner dei repository, Richieste di tecnologia con priorità. | 0004 |
| Team (futuro) | Piano legato a un gruppo; non implementato. | 0004 |
| Pagamenti | Lemon Squeezy come Merchant of Record, integrato insieme alle Notifiche. | 0004 |

## Architettura del codice

| Decisione | Dettaglio | ADR |
|---|---|---|
| Stack | Next.js App Router, TypeScript strict, Supabase (Postgres, RLS, Auth), Tailwind, shadcn/ui, Lucide, TanStack Query v5, Zod, compatibile con React Compiler. | — |
| Moduli di dominio | `src/modules/{catalog,releases,detection,summaries,dashboard,plans}` con `domain/` (TS puro), `server/` (`server-only`), `ui/`; import tra moduli solo dagli indici (`index.ts` per il dominio, `ui/index.ts`, `server/index.ts`), controllati da ESLint. | [0006](./adr/0006-moduli-di-dominio.md) |
| Tipi | Derivati dagli schemi Zod (`z.infer`); nessuna cartella `types/` parallela. | 0006 |
| TanStack Query | Solo per Dashboard e Seguire (aggiornamenti ottimistici). Le pagine pubbliche sono Server Components. | — |
| Zustand | Non installato finché non serve uno stato client globale che l'URL non può rappresentare. | 0006 |
| RLS | Catalogo, Release e Sintesi in sola lettura per `anon`; scrive solo il server con la service role. Tecnologie seguite: `user_id = auth.uid()`. | — |
| shadcn/ui | Solo primitivi accessibili (Dialog, Tooltip, menu), copiati nel progetto e sempre ristilizzati sui token di `DESIGN.md`. Mai l'aspetto di default: niente card, badge, ombre o raggi standard. I componenti del sistema (Follow Toggle, righe, note, verdetti) sono su misura. | — |
| Strumenti | pnpm; Vitest per i test unitari e di integrazione, Playwright per gli end-to-end; CI su GitHub Actions; migrazioni con Supabase CLI e Postgres locale; ultime versioni stabili al setup, fissate nel lockfile. | — |
| Qualità | Niente `any` né cast non validati; file sotto ~200 righe; commenti solo per decisioni non ovvie; WCAG (contrasto, `aria-*`, focus visibile, tastiera); dark mode di default. | — |
| Avviso React dello script del tema | Lo script inline di `layout.tsx` che scrive `data-theme` prima del primo paint **resta com'è**, e l'avviso di sviluppo *"Encountered a script tag while rendering React component"* è accettato. Misurato il 2026-10-08: la console è pulita su `/`, `/login`, `/technologies`, su una pagina Technology e sulla 404; l'avviso arriva **solo sulla pagina d'errore**, una volta per caricamento e una per `Try again`, cioè dove un boundary rirende la radice sul client, e in produzione non si vede. ⚠️ Le due strade per chiuderlo sono già state pagate e non vanno rifatte: `next/script` con `strategy="beforeInteractive"` **non mette lo script nella `head`** dell'HTML servito con l'App Router (provato su un build di produzione: finisce in `self.__next_s`, dopo `</head>`), quindi scambierebbe un avviso di sola console con un lampo scuro su un tema chiaro salvato; e il tema letto da cookie nella radice renderebbe dinamico tutto il sito e butterebbe l'ISR (`revalidate = 3600`), cioè è una decisione da ADR e non un fix. | — |

## Operatività Anthropic

- Credito prepagato: carica iniziale ~$20–25, ricarica automatica se disponibile, limite di spesa
  mensile.
- API key dedicata al progetto, in un workspace separato.

## Test

- Unitari sui `domain/`, in particolare le Strategie di classificazione su Versioni reali.
- Integrazione della presa in carico atomica su Postgres locale di Supabase.
- End-to-end con Playwright per Seguire e Dashboard.
- Set di valutazione di 14 Release reali in `eval/summaries/` (`pnpm summary:eval`), da rilanciare a
  ogni cambio di prompt o modello; ogni giro lascia un report confrontabile in
  `eval/summaries/reports/`. Le Note sono copiate nel set, non lette dal database: il Catalogo cambia,
  il set no. Il giudizio umano sta nelle attese del set (**Intervento richiesto** e breaking changes
  obbligatorie o solo tollerate); le invenzioni si verificano da sole con `locateCitation`.

## Ordine di sviluppo

0. **Fondamenta**: repository, Next.js strict, ESLint con confini dei moduli, env Zod, migrazioni
   Supabase, CI, deploy.
1. **Catalogo → Release visibili**: 3 Tecnologie, Importazione iniziale, classificazione, pagina
   pubblica senza Sintesi.
2. **Sintesi**: coda, Batch API, validazione, stati, pagine pubbliche con Sintesi.
3. **Rilevamento giornaliero**: cron protetto, esclusioni, Anteprime.
4. **Sviluppatore e Dashboard**: login GitHub, Seguire con limite, sezioni della Dashboard.
5. **Rifinitura per il lancio**: ~40 Tecnologie, accessibilità, SEO, landing page.

## Fuori dall'MVP

CSS/W3C · Richieste di tecnologia · Notifiche email/Slack · scanner di `package.json` ·
pagamenti · piano Team · stato "Visto" · traduzioni delle Sintesi · pannello di amministrazione ·
scraping dei blog.

## Aperto

- Il dominio di **Verdict**, che si sceglierà al lancio (vedi "Il nome: Verdict").

Il design dell'MVP è chiuso: fanno fede `DESIGN.md` e i mock approvati in `design/mocks/`. PRD
pubblicato come issue [#1](https://github.com/RobertoZeppilli/release-tracker/issues/1).
