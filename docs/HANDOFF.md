# Handoff — release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.

## Leggi prima di tutto (non ripetere il contenuto qui)

- **PRD: issue #1** (user story, moduli, criteri di accettazione per fetta, test, fuori scope).
- `PRODUCT.md`, `CONTEXT.md` (glossario + nomi inglesi canonici), `docs/DECISIONI.md`, `docs/adr/0001…0007`.
- `DESIGN.md` e i mock approvati in `design/mocks/` (`release.html`, `technology.html`, `dashboard.html`,
  `technologies.html`; stati col selettore "page state", `technologies.html?state=…`).

## Stato

**Da dove ripartire (2026-10-06, pomeriggio).** **La #83 è fatta ma non ancora unita**: branch
`default-upgrade-start`, **PR #99**, in attesa di `CI` e del merge. Primo passo della sessione nuova:
controllare che la #99 sia verde e unita (`gh pr view 99`), e solo dopo prendere la #85.

**Le decisioni già prese con l'utente, da non riaprire.** Le tre issue scelte vanno fatte in
quest'ordine, una per branch e per PR:

1. **#85** (ritorno dalla citazione alla diagnostica): **un solo puntatore**, nella gutter della
   **prima riga citata** dell'intervallo attivo, nell'inchiostro della severità che ha citato.
   Attivarlo porta **anche il focus** sul titolo della diagnostica, non solo lo scroll. Nessun
   secondo momento di moto. Una citazione sola è attiva per volta, quindi un puntatore solo.
2. **#86** (generi del Catalogo): **dieci generi a grana fine**, curati **da noi** nel file
   `catalog/<slug>.json`, non presi dalla Fonte. `language` (typescript, rust), `runtime` (nodejs,
   deno, bun), `framework` (angular, astro, next, nuxt, react, svelte, sveltekit, vue),
   `server framework` (express, fastify, nestjs, trpc), `database` (prisma, drizzle-orm),
   `build tool` (vite, webpack, turborepo, pnpm), `testing` (vitest, jest, playwright, storybook),
   `lint and formatting` (eslint, prettier, biome), `library` (axios, zod, tailwindcss, zustand,
   redux-toolkit), `platform` (electron, terraform). ⚠️ **Nodo ancora aperto**: `library`
   raccoglie cinque Technologies che non hanno in comune altro che non stare nelle altre nove
   caselle, e la issue vieta il gruppo "altro". Da sciogliere con l'utente **prima** di scrivere il
   codice: o lo si spacca (`styling`, `state management`, `validation`, `http client`), o si scrive
   in `CONTEXT.md` perchè `library` è un genere e non un residuo.
3. **#87** (trattino lungo nelle Sintesi): **solo il prompt**, cioè divieto in `title`, `keyPoints` e
   `breakingChanges` con le `quote` escluse, `PROMPT_VERSION` a **v5**, e un test unitario sul testo
   del prompt. **Zero spesa.** Il conteggio delle Sintesi già scritte **lo lancia l'utente** su
   produzione con una query che gli va preparata: `.env.local` punta al database locale, che di
   `ready` non ne ha nessuna. Che farne si decide dopo, col numero davanti. ⚠️ Se la #87 prende
   il `v5`, **la #93 diventa v6**: le due issue se lo contendono.

**Poi, e solo dopo le tre**: le **due box della Dashboard**, che l'utente ha chiesto il 2026-10-06
guardando `docs/Cattura.JPG` (fuori da git). Una box per i conteggi della finestra e una per la In
Use Line, dentro **righe etichetta a sinistra e numero a destra**, non una riga di fatti separati da
`·` che su mobile va a capo in mezzo ai numeri. Va aperta una issue sua prima di farla. Da ricordare:

- **Il "Don't" di `DESIGN.md` non va cambiato**: vieta di avvolgere le **diagnostiche** in card o
  badge, e un pannello esiste già due volte nel sistema, la Source View e il blocco diff, tutti e
  due con bordo 1px `rule` e raggio 6px. Le due box riusano quel trattamento.
- **Due cose da non perdere nel rifacimento**: ogni numero è oggi un **link** alla sua sezione
  (`#spotlight`, `#latest`, `#previews`, `#digest`), e la parentesi `(2 need action)` deve restare
  attaccata a `featured`, per la regola fissata dalla #94 (un numero di ambito più stretto dice il
  proprio ambito dove sta).
- L'utente ha chiesto attenzione esplicita a **tablet e mobile**, non solo al desktop.

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

### ⚠️ Il fallimento E2E intermittente, finalmente con un nome

L'handoff precedente chiedeva di catturare il nome se fosse ricomparso. È ricomparso, su una corsa
completa su due, e sono **due test sui follow**, non uno:

- `current-version.spec.ts:89` "is not touched by `?from=`, which is a single look"
- `technologies.spec.ts:86` "a Developer unfollows a Technology and it stays unfollowed after a reload"

Tutti e due verdi lanciati da soli, tutti e due verdi alla seconda corsa completa (145 su 145). Il
fallimento è sempre un follow che non risulta dove dovrebbe, sotto carico parallelo con quattro
worker. In CI i retry sono 2, in locale 0. **Non è causato dalla #83**, che non tocca i follow.

### Le strade aperte dopo la #83

Dopo le tre issue scelte e le box della Dashboard restano: **#93** (prompt v5, o v6, con la terza
uscita sulle note giudicabili) e **#57** (Haiku invece di Opus), tutte e due **spendono** su
Anthropic; **#65** e **#64**, tecniche, serve solo il via; **#80** (tocca GitHub e npm, non
Anthropic, ma genera Sintesi a valle); **#26** la landing page, ferma sul nome del prodotto; **#69**
esplicitamente dopo il lancio.

Il primo comando della sessione nuova:

```
leggi docs/HANDOFF.md, controlla la PR #99 e poi prendiamo la #85
```

---

**Lo stato precedente, per contesto.** **La #88 e la #94 sono chiuse**, con le PR #96 e #97, unite e
con `CI` e `Deploy database` verdi su `main`. Prima di loro erano state chiuse la #47 e la #84.
**Anche la #94 è verificata in produzione**, sulla schermata dell'utente: `warning: 3 need action` in
testa e `3 need action` sulla riga `In use`, con `0 featured` nella finestra, cioè il verdetto viene
tutto dal Cammino di upgrade, che prima non guardava. Nessuna parentesi accanto allo zero `featured`,
e nessuna contraddizione. Il `1 preview` al singolare lì non è osservabile, perché le Anteprime sono
due: quella parte è coperta dai test.

**La #88, com'è stata fatta.** Il vincolo `summaries_ready_provenance` lega la visibilità alla
provenienza: `status = 'ready'` implica `content`, `model` e `prompt_version`. Da ricordare:

- **Il conteggio chiesto dalla issue non è stato fatto con una query su produzione.** Non serviva:
  Postgres valida un `check` nuovo contro le righe esistenti, quindi il `deploy-database` verde **è**
  la prova che non c'era nessuna riga `ready` senza provenienza. In locale non ce n'era nessuna
  affatto (0 `ready`, e 128 `pending`, 84 `unavailable`, 1686 `skipped` tutte senza provenienza,
  tutte ancora ammesse).
- `getRelease` **legge** la provenienza invece di fidarsi: una riga `ready` che ne fosse priva si
  rende come `unavailable`, che la pagina sa già disegnare, invece di far fallire lo Zod e con lui la
  pagina. Scelta deliberata, non una dimenticanza.
- Il reimport della #56 guarda `model is not null and prompt_version is not null` nella sua `where`,
  perché una Release che fallisce **prima** di partire (note oltre il limite) è `failed` senza
  provenienza e il vincolo la rifiuterebbe.
- `.env.local` punta al database **locale** e le credenziali di produzione stanno su Vercel, con la
  CLI non installata: un conteggio su produzione lo deve leggere l'utente.

**La #94, com'è stata fatta, da non rifare.** Decisioni dell'utente del 2026-10-05: **prima via più
terza**, cioè il verdetto conta tutto quello che la pagina mostra e tace quando non c'è niente da
giudicare; e `1 previews` **corretto** in `1 preview`.

- La regola nuova è in `CONTEXT.md` sotto **Verdetto della Dashboard**, e lo stato in muted è
  documentato in `DESIGN.md` nel paragrafo "Page verdict (Dashboard)".
- ⚠️ **La terza via da sola non bastava**, e il consiglio dato prima di leggere il codice era
  incompleto: toglie il verdetto a insieme vuoto, ma con **una** `featured` sicura nella finestra e
  lavoro vero sul Cammino la contraddizione tornava.
- **Come è stata risolta la sovrapposizione**: `computeUpgradePath` ora espone `range`, cioè le
  Release stabili che il Cammino copre, le stesse su cui `counts` è calcolato. `buildDashboard` unisce
  `featured` della finestra e `range`, deduplica su `slug@version` e conta **Release**, non occorrenze.
- `DashboardVerdict` è `| null`, e `DashboardCounts` ha un campo nuovo `featuredNeedsAction`: la
  parentesi `(2 need action)` sta accanto a `featured` nella riga dei conteggi, quindi deve restare
  nell'ambito più stretto, altrimenti si contraddice con il numero che segue.
- Il verdetto si dà solo se **almeno una** Release dell'insieme ha un verdetto suo: le Digest e le
  Release senza Sintesi _Pronta_ o con note non giudicabili non contano, come dappertutto.
- ⚠️ **Una corsa di e2e su tre ha dato un fallimento non catturato**, le altre due 144 su 144. Non è
  stato possibile nominarlo: in locale `retries` è 0 e il run dopo era verde. In CI i retry sono 2.
  Se ricompare, catturare il nome prima di diagnosticare.

**Non fatto di proposito**: il mock `design/mocks/dashboard.html` non ha lo stato nuovo del verdetto.
`DESIGN.md` lo descrive; aggiungerlo al mock è una scelta dell'utente, non un debito nascosto.

### ⚠️ Il 2026-10-06 il token di Supabase è stato abbandonato, non sostituito

Alle **07:26** il job `migrations` di `deploy-database.yml` ha cominciato a fallire su `supabase link`
con `FGA Authentication Error. Unauthorized`. Alle **07:16** lo stesso job era passato, sul merge della
#97, con lo stesso workflow e lo stesso `project-ref`, e in mezzo nel repository era cambiato un solo
file di documentazione.

**Quello che è stato escluso, per non rifarlo:**

- **Non è il token scaduto.** Ne sono stati provati quattro: quello del 29/09, uno scoped, uno con
  **accesso pieno** all'account, e un quarto riscritto dalla clipboard per escludere spazi e newline.
  Tutti rifiutati allo stesso modo. Il controllo di formato del CLI li accettava, quindi erano
  `sbp_…` ben formati: li respingeva l'autorizzazione.
- **Non sono i permessi**, visto che l'accesso pieno fallisce uguale.
- **Non è il progetto né l'account**: `supabase projects list` dalla macchina locale risponde,
  elenca `frbddunuaetoufsivwwu` come `ACTIVE_HEALTHY`, e anche `supabase link` in locale funziona.
  Quello che funziona in locale è la **sessione** salvata da `supabase login`, non un token personale.
- **Non è un guasto dichiarato**: status.supabase.com dava tutto operativo.

**La via d'uscita, già in piedi.** `supabase link` serviva solo a risolvere dove sta il progetto, e
`db push` ha bisogno della sola stringa di connessione, che è la credenziale con cui le migrazioni
girano comunque. Il workflow ora la compone dai segreti che c'erano già, `SUPABASE_PROJECT_ID` e
`SUPABASE_DB_PASSWORD`: **nessun segreto nuovo**, e `SUPABASE_ACCESS_TOKEN` non è più usato da nessuna
parte. L'indirizzo è `postgresql://postgres.<ref>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
**porta 5432, Session pooler**: sul 6543 una migrazione non gira, perché le serve una sessione. La
password è codificata con `jq @uri` e la forma codificata è mascherata con `::add-mask::`, perché
GitHub nasconde il segreto, non una sua trasformazione.

Provato con `gh workflow run deploy-database.yml --ref fix-deploy-database-without-pat`: verde, con
`Remote database is up to date.` e il job `catalog` ripartito. ⚠️ **Il dispatch lo lancia l'utente**,
il classificatore lo blocca all'agente.

**Da ricordare per il futuro**: l'indirizzo del pooler non va cercato a mano nella dashboard. Basta
`supabase link --project-ref <ref>` in locale, leggere `supabase/.temp/pooler-url`, e poi
`supabase unlink`, che va fatto sempre, altrimenti il repository resta puntato sulla produzione e un
`supabase db push` senza flag scriverebbe là.

**Le strade aperte dopo la #94.** L'utente ha chiesto di contare anche le `ready-for-human`: le fa
l'agente, le decisioni si prendono insieme. Restano fuori solo quelle che **spendono** su Anthropic,
cioè la **#93** (prompt v5), la **#87** (divieto dell'em dash nel prompt) e la **#57** (Haiku invece
di Opus): tutte e tre rigenerano Sintesi.
Gratis e prendibili, con la decisione che chiedono: **#65** e **#64** (tecniche, serve solo il via),
**#83**, **#85** e **#86** (chiedono una scelta di prodotto o di `DESIGN.md`), **#80** (tocca GitHub e
npm, non Anthropic, ma genera Sintesi a valle: da guardare insieme), **#26** la landing page (ferma
sul nome del prodotto) e **#69** (esplicitamente dopo il lancio).

---

**Lo stato precedente, per contesto.** **La #47 è chiusa** e la **#84 pure.** I cinque interventi
della #47 sono uniti: il **P0-1** (PR #89), il **P2-9** (PR #90), il **gruppo della #64** cioè P1-3,
P1-4 e P1-5 (PR #91), e il **P0-2** (PR #92, l'unica che portava `Closes #47`). Dopo di loro la #84,
sbloccata dalla chiusura della #47, con la **PR #95**. Tutto verificato in produzione.

Il primo comando della sessione nuova, scegliendo fra le strade elencate sopra, "Le strade aperte
dopo la #94":

```
leggi docs/HANDOFF.md, prendiamo la #65
```

**Le strade che erano aperte allora** (la #88 e la #94 sono state fatte dopo; vale ancora quello che
dice della #26):

1. **Lavoro autonomo: resta una sola issue `ready-for-agent` e non è bloccata**, la **#88** (una
   Sintesi `ready` senza provenienza non viene rifiutata dal database).
2. **La #94**, aperta il 2026-10-05 e `ready-for-human`: il verdetto della Dashboard si contraddice.
   Non è lavoro da prendere da soli perché chiede prima una regola di dominio in `CONTEXT.md`.
   Vedi sotto.
3. **La #26**, la landing page, **ultima fetta del PRD**. Resta ferma sul **nome del prodotto**, che
   l'utente ha rinviato il 2026-10-03: senza di lui non chiude il primo criterio di accettazione.

### La #84, com'è stata fatta: quello che non va ricercato

La pulizia del markdown nel pozzo di citazione è **di sola resa** e sta in un posto solo,
`src/modules/summaries/domain/quote-markdown.ts`. `renderQuote(line, start, end)` prende la riga
grezza e gli offset della citazione e restituisce i pezzi da disegnare, ciascuno col suo tipo e un
flag `cited`, più la lunghezza e gli offset **in caratteri resi**.

- ⚠️ **La citazione memorizzata non si tocca**: la verifica verbatim dipende dal testo esatto, e il
  pannello delle Note continua a mostrare la riga carattere per carattere.
- **Il punto non ovvio**: la citazione arriva misurata sul markdown, mentre la sottolineatura
  corallo, la riga dei caret e il calcolo di `caretWidth` vanno misurati su quello che il lettore
  vede. Per questo gli offset viaggiano **attraverso** la pulizia invece di essere ricalcolati dopo.
- **Il token Inline Code dentro il pozzo** tiene il segno e lascia la geometria: niente `0.92em` e
  niente padding orizzontale, perché il pozzo è una griglia monospace che i caret contano in
  caratteri. È l'utility `quoted-code` in `globals.css`, e la nota sta in `DESIGN.md` sotto
  "Breaking Diagnostic". Misurato sulla pagina invece che dato per buono: span di codice **63px per
  7 caratteri**, caret **180px per 20**, cioè 9px l'uno.
- **Fuori scope di proposito**: il grassetto `**build:**` delle note di vite resta grezzo. La issue
  elencava tre pulizie e il grassetto non era fra queste; aggiungerlo vorrebbe dire inventare un
  token che `DESIGN.md` non ha per il pozzo. Se serve, è una issue sua.

### ⚠️ Una CI che non parte può essere solo una coda

Il 2026-10-05 la CI della PR #95 non è partita per oltre venti minuti: Vercel e CodeRabbit avevano
già risposto, i due job no, e `gh run list` non mostrava nessun run. Diagnosi data e **sbagliata**:
minuti di GitHub Actions esauriti. Erano **i runner in coda**, e il run è partito da solo.

Da ricordare: i workflow risultavano `active` e non c'era nessun segnale di quota. Prima di mandare
l'utente a guardare il billing, aspettare. Chiudere e riaprire la PR non serve a niente: non
accelera una coda.

### ⚠️ La #94: il verdetto della Dashboard si contraddice, e non è una regressione

Trovata il 2026-10-05 nel giro a mano, su uno screenshot della Dashboard di produzione mandato
dall'utente. In testa `ok: nothing needs action` col glifo verde, e due righe sotto
`In use on 2 of 5: 31 releases behind · 2 need action`, con React a `1 needs action` e webpack a
`1 needs action · 7 to check`.

Il perché, già diagnosticato, da non rifare: `verdictOf` in
`src/modules/dashboard/domain/build-dashboard.ts` conta **solo le Release `featured` degli ultimi 30
giorni**, e quella schermata ha `0 featured`; `inUseTotals`, invece, somma il Cammino di upgrade
dalla Versione in uso **senza finestra temporale**. Due ambiti diversi impaginati come uno solo, e
con l'insieme vuoto il verdetto afferma una cosa vera a vuoto e la presenta come rassicurazione.

**Verificato che è preesistente**: su `main` prima della #92 `verdictOf` aveva già lo stesso ambito,
il P0-2 ha cambiato solo da dove si legge `actionRequired`. Per questo la #92 è stata unita lo stesso:
tenerla ferma per un difetto già su `main` non proteggeva nessuno. Decisione dell'utente, presa su
raccomandazione motivata.

Le tre vie sono scritte nella issue. La terza, **non dare verdetto quando l'insieme è vuoto**, è
quella consigliata, perché si tiene con la regola che la #47 ha appena fissato: senza materiale per
giudicare non si giudica (CONTEXT.md, Note giudicabili). In coda alla issue c'è anche il `1 previews`
al singolare, da confermare o correggere.

### Che cosa ha mostrato il giro a mano, per non rifarlo

- **Il settimo stato è giusto** su pagina Release e su righe della pagina Technology, su **quattro**
  casi veri e non tre: `vite 8.0.0`, **`vite 8.2.0`**, `webpack 5.0.0`, `tRPC 11.0.0`.
- **Sulla Dashboard non è osservabile oggi**, e non per un difetto: `vite 8.0.0` è del 2026-03-12,
  fuori dalla finestra dei 30 giorni, e con `0 featured` nessuna riga di Spotlight porta un verdetto.
  La resa è coperta dal test in `dashboard-copy.test.ts`, che fissa `unjudged` distinto da
  `no summary · read the release notes`.
- **Le tre pagine mai disegnate, punto chiuso.** Il **404 disegnato è giusto** sul preview
  (`/test/throw` in produzione è un 404, perché esiste solo con `E2E_AUTH_SECRET`). La **pagina di
  errore disegnata funziona**: `tests/e2e/errors.spec.ts` la verifica proprio con `/test/throw`, e
  l'`error.tsx` copre il segmento. ⚠️ **Quello che si era visto il 2026-10-05 non era un boundary
  mancante**: `/technologies/[slug]` è ISR (`revalidate = 3600`, nessuna pagina costruita in
  anticipo), e quando il render **statico** della prima visita fallisce Next non passa dal boundary
  client e serve il suo fallback ("This page couldn't load"). Se si vuole la pagina disegnata anche
  lì è un lavoro a sé, non ancora aperto come issue. Resta da guardare solo il **login**.
- **Produzione verificata dopo il merge**: `/`, `/technologies/vite`, `/technologies/vite/8.0.0` e
  `/technologies/webpack/5.0.0` rispondono 200 e portano `not enough notes to judge`; `/technologies`
  e `/dashboard` rimandano a `/login?next=…`, come devono. `Deploy database` e `CI` verdi sul merge.

### ⚠️ La lezione di sequenza, che vale per ogni migrazione futura

**I preview condividono il database di produzione**, e `.github/workflows/deploy-database.yml` gira
**su push a `main`**, cioè dopo il merge. Quindi una migrazione che il codice nuovo legge va applicata
**prima**, altrimenti il preview dà 500 e, al merge, lo danno anche le pagine in produzione finché la
migrazione non atterra. Qui è successo: `/technologies/vite` dava 500 perché leggeva `body_head`, che
in produzione non c'era.

La via, usata e funzionante, da rifare uguale (prima lo schema, poi il codice che lo legge; una
colonna aggiunta è ignorata dal codice vecchio, quindi anticiparla è sicuro):

```
gh workflow run deploy-database.yml --ref <branch-della-PR>
```

⚠️ **L'agente non può lanciarlo**: il classificatore di auto mode blocca `gh workflow run` su un
workflow che scrive sul database di produzione. Lo lancia l'utente, dal terminale o col `!` nel
prompt; poi l'agente lo segue da solo, perché `gh run list` e `gh run watch` sono letture e passano.
Il job `catalog` che segue le migrazioni **non spende**: tocca GitHub e npm, non Anthropic.

### Che cosa ha deciso l'utente sul P0-2, per non ridiscuterlo

**Due risposte date il 2026-10-05, entrambe applicate nella #92.**

1. **Stato derivato ora, prompt `v5` quando c'è credito.** Il settimo stato si calcola alla resa da
   quello che è già memorizzato, quindi **nessuna Sintesi è stata rigenerata e non si è speso niente**.
   Il prompt resta a `v4`. Il bump è la **issue #93**, `ready-for-human`, "Blocked by #47": costa, e
   non si parte senza conferma esplicita.
2. **Si attiva solo quando le Note non sono giudicabili**, non "sempre su una major con 0 breaking".
   Conseguenza: il trigger non è la Rilevanza, sono le Note, quindi **nessun caso speciale per
   `major`** e la regola vale anche su una patch le cui note sono un rimando.

Il nome del dominio è **Note giudicabili** (`notesJudgeable`), approvato dall'utente, ed è in
`CONTEXT.md` con la sua voce e la sua riga nella tabella dei nomi.

### Il P0-2, com'è stato fatto: quello che non va ricercato

- **La regola sta in un posto solo**, `src/modules/summaries/domain/notes-judgement.ts`, ed **erra
  verso il silenzio**: una riga che descrive qualcosa mantiene le note giudicabili, così un modo di
  rimandare mai visto si legge come descrizione invece di spegnere un verdetto onesto. Ogni stringa
  dei suoi test è il corpo memorizzato di una Release vera: **non sostituirli con esempi inventati.**
- **Misurata su tutto il Catalogo, non a campione**: 107 note su 1821 non giudicabili, ogni singola
  non-`digest` davvero un rimando, **zero falsi positivi**. Cambiano 10 Release con un verdetto e 25
  preview. I `digest` non hanno mai verdetto (`initial-summary-status.ts` li mette `skipped`).
- ⚠️ **Il verdetto si rende in tre posti, non due**: pagina Release (`summary-view.tsx`), righe della
  pagina Technology (`release-verdict.tsx`) e Dashboard (`dashboard-copy.ts`). E **alimenta dei
  conteggi**: `safe`, `missing`, `needsAction`, le Stat Row. Per questo una Release non giudicabile
  diventa `actionRequired: null`, la forma che il sistema già legge come "né sicura né intervento
  richiesto": così i conteggi si raddrizzano da soli. Senza quello la Dashboard avrebbe continuato a
  dire `ok: nothing needs action` contando `vite 8.0.0` fra i sicuri, **lo stesso difetto un livello
  sopra**. `unjudged` viaggia accanto perché `1 not summarized` su una Release che **ha** una Sintesi
  sarebbe una bugia nuova. Un `action required` non si ritira mai così: un breaking change elencato è
  un fatto che le note hanno dichiarato.
- **Perché una colonna generata e non il corpo delle note**: `release_notes.body_head` tiene i primi
  401 caratteri. Le note lunghe descrivono qualcosa e sono giudicabili senza leggerle. Misurato: senza
  questo la pagina Technology si tirerebbe su **1,1 MB** di corpi per `pnpm` solo per decidere
  un'etichetta. Il 401 va tenuto uguale a `NOTES_HEAD_LENGTH + 1`.

### ⚠️ Lo stato dell'ambiente locale, perché l'ho cambiato io

La migrazione ha richiesto `pnpm db:reset`, che **ha svuotato il database locale** (non c'è un
`seed.sql`: i dati vengono dai job). Ripristinato subito dopo:

```
pnpm exec tsx --conditions=react-server --env-file=.env.local scripts/sync-catalog.mts
pnpm dev:login
```

⚠️ Nota: `pnpm catalog:sync` **non legge `.env.local`** e muore sulle variabili d'ambiente; serve la
forma lunga sopra. Le Sintesi `ready` in locale erano **0 prima e sono 0 adesso**, quindi in locale si
vedono solo gli stati `pending` e `skipped`. Il dev server è stato riavviato sulla 3000.

Il metodo di lavoro è rimasto quello deciso il 2026-10-03 e ha funzionato: **un branch e una PR per
ogni intervento**, non uno per tutta la #47.

**C'è di nuovo lavoro autonomo: la #88**, `ready-for-agent`, aperta dall'utente il 2026-10-04 e **non
bloccata da niente** (una Sintesi `ready` senza provenienza non viene rifiutata dal database). Dopo
la chiusura della #84 è **l'unica issue prendibile da soli** rimasta.

**La #47** (revisione del design di tutta l'app con `impeccable`) ha la **#64 dentro**, deciso con
l'utente il 2026-10-03. I suoi "Blocked by" (#21, #23, #63, #68) sono tutti chiusi.

**L'ordine è cambiato il 2026-10-03, e il motivo va tenuto.** L'ordine vecchio metteva la #24 per
ultima, dopo la landing, così il SEO passava anche su quella. È stato rovesciato: la #24 è stata
fatta subito perché era l'unica cosa autonoma rimasta, e alla landing il SEO si aggiunge dentro la
#26, che è poco lavoro. L'ordine nuovo è **#24** (fatta) → **#47** con la #64 dentro → **#26**.

L'utente ha chiesto se non fosse meglio fare la landing *prima* della revisione, così da rivedere
tutte le pagine in una passata. Risposta data e accolta, da non rifare da zero la prossima volta:
1. la #26 non parte senza il **nome del prodotto**, che l'utente ha rinviato, e la #47 invece può
   partire oggi;
2. la #47 comprende le pagine **mai disegnate** (login, 404, errore generico), che sono quelle che
   fanno emergere i buchi di "Compiler Diagnostic"; la landing ne ha altri, suoi;
3. la #26 chiede per criterio che il design della landing sia **approvato nel sistema Compiler
   Diagnostic**: approvarlo contro un sistema che sta per cambiare vuol dire rifare la landing.
Quello che **non** è vero, e che è stato riconosciuto: fare prima la #47 non evita una seconda
passata di design. La landing avrà comunque il suo giro, perché è l'unica pagina il cui compito è
convincere e non mostrare contenuto. La scelta era fra *assestare il sistema sulle sei schermate che
esistono e poi disegnare una pagina nuova dentro di esso* e *inventare il sistema sulla landing e
riportarlo indietro sull'app*.

Le altre `ready-for-human`: la **#80** (riprendere le Note di rilascio mancanti) è del 2026-10-02 e
contiene una domanda che costa, scritta sotto; la **#57** è un verdetto sulla qualità; la **#65**
(uniformare i database) e la **#69** (import di `package.json`) sono ferme per scelta dell'utente, la
prima al secondo giro a pagamento, la seconda dopo il lancio.

**Stima data all'utente il 2026-09-30**: da 8 a 14 sessioni dopo la #68. Il numero alto e quello basso
si decidono quasi tutti in due punti, quanto apre la #47 e quante issue genera il giro a mano dopo di
lei. Le due incertezze che possono allungare oltre quella forchetta non sono lavoro di codice: il nome
del prodotto e il credito Anthropic. Consiglio dato e non ancora accolto: **spostare la #57 prima del
lancio**, perché non è solo un verdetto sulla qualità, decide la voce di spesa principale a regime.

**Il nome del prodotto.** Discusso il 2026-09-30 senza concludere. L'utente vuole una parola sola
legata al tracciamento delle Release. Quattro candidati messi sul tavolo: **Caret** (il `^` di
`^6.0.3`), **Drift** (la distanza dall'ultima stabile), **Bumped**, **Cadence**. **Caret è stato
scartato dopo la verifica**: `caret.io` è un editor Markdown commerciale, `caret` è un pacchetto R
fra i più scaricati di sempre, e ci sono altri due editor e due acronimi CARET; fra i domini solo
`caret.dev` non risponde, e non risponde non vuol dire libero. **Drift** ha un problema simile e non
verificato, `drift.com` è un'azienda nota. Da fare: decidere se verificare Drift e Bumped con lo
stesso metodo, o rifare una lista pensata per essere libera invece che bella. **Il 2026-10-03
l'utente l'ha rinviato esplicitamente** ("per il nome penseremo dopo"): non riaprirlo da soli, ma
ricordare che è il primo criterio di accettazione della #26 e che senza di lui la landing non chiude.

### Code da non perdere

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

## Sessione del 2026-10-05: il P2-9 e il gruppo della #64 (PR #90 e PR #91, unite)

Due interventi della #47 in una sessione, un branch e una PR ciascuno, come il metodo prevede.

### P2-9, i due difetti misurati (PR #90, **unita**)

- `sign in` e `sign out` a **24px** di altezza, erano 64 × 20.8 (WCAG 2.2 AA 2.5.8). ⚠️ **Da sapere
  per la prossima volta: in questo progetto `min-h-6` vale 32px.** `globals.css` rimappa la scala
  numerica di Tailwind sugli otto passi di `DESIGN.md`, quindi lo step dei 24px è il **5**, non il 6.
- Le due righe di conteggi della Dashboard capped a `max-w-measure`: 633.6px invece di 992. La misura
  è i **72ch e non i 900px delle diagnostiche**: scelta dell'utente, perché è il numero che la
  revisione aveva citato.
- Il mock `dashboard.html` non portava quella misura e l'ha presa: il mock è la specifica
  dell'aspetto, lasciarlo indietro crea la discrepanza successiva.
- Due test E2E tengono fermo il difetto. Quello sui bersagli serve davvero: **axe li lasciava passare
  sull'esenzione di spaziatura**, quindi la suite della #23 non li vedeva.

### Il gruppo della #64: P1-3, P1-4, P1-5 (PR #91, **unita**)

- **P1-3**: i titoli di sezione contano dove le righe **appartengono adesso**. La regola sta nel
  dominio, in `liveSections`, e riusa `splitPicker`, così il conteggio vivo e la prossima visita non
  possono divergere. "Row Error Line" è diventata **"Row Status Line"** con due varianti (`error`
  inchiostrata, `note` no), e la riga rimasta ferma dice dove è andata, nelle due direzioni.
- **P1-4**: `spotlight (N)` conta Releases; via il glifo featured dalle righe compatte (era la
  Significance di una Release fuori dalla finestra); quando nessuna voce ha una Release featured né
  una distanza dalla Version in use, una riga muta al posto delle righe.
- **P1-5**: sotto i 430px la quota scende nella striscia da 40px. **Sopra i 430 non cambia niente**:
  il gruppo delle azioni è lo stesso di prima, e la striscia perde lo spazio fra le colonne così il
  filo resta continuo. Nove test E2E in `overflow.spec.ts` tengono ferma la regola.

### Quello che la sessione ha imparato sull'ambiente

- **`pnpm dev` continua a non funzionare** (vedi la sessione del 2026-10-04). Il giro che funziona è
  `pnpm build` + `pnpm start`, e **va rifatto a ogni modifica** prima di guardare nel browser.
- **L'estensione del browser non ridimensiona la finestra**: `resize_window` risponde bene ma
  `innerWidth` non cambia. Per misurare a 375 o 390 si usa **Playwright**, e uno script sciolto va
  eseguito **dalla radice del progetto** (`node --input-type=module -e "$(cat file)"`), altrimenti
  `@playwright/test` non si risolve.
- I mock si guardano con un server statico sulla **4321** (`python -m http.server`), perché le
  pagine `file://` non si aprono dall'estensione.
- **La flakiness delle fixture E2E è confermata e misurata tre volte**: 2 o 3 test falliscono per
  run, **cambiando a ogni run**, e passano tutti insieme isolati. Il metodo che distingue un difetto
  vero da questa: rieseguire gli stessi spec da soli. È servito: un test che sembrava flaky stava
  invece asserendo `spotlight (1)`, cioè il conteggio che il P1-4 ha corretto.

### Permessi: un muro che è bene conoscere

L'utente ha chiesto lavoro autonomo. Non è possibile senza "bypass permissions", che sul suo account
non c'è, e **l'agente non può scriversi le autorizzazioni da solo**: il tentativo di creare
`.claude/settings.local.json` è stato rifiutato come automodifica. È un gesto dell'utente, con
`/permissions` o con il comando `!` suggerito in chat. Non riproporlo come se fosse un dettaglio.

## Sessione del 2026-10-04: il P0-1 della #47, le righe della pagina Technology (PR #89)

Branch `47-p0-1-release-row-content`, **PR #89 unita il 2026-10-05**, con un riferimento alla #47 e
**senza** `Closes`. La #47 resta aperta.

### Che cosa è stato fatto, e la cosa da ricordare

**Il difetto non era la prop mancante che la diagnosi aveva individuato: era il dato mancante.**
`release-list.tsx:22` rendeva davvero `<Row />` senza `verdict`, ma passargliela non sarebbe bastato.
`listReleases` validava della Sintesi memorizzata il **solo** `actionRequired`
(`SummaryVerdictSchema`), quindi titolo e breaking change non arrivavano mai alla lista, **pur
viaggiando già dentro la stessa query** (`select ... summaries (status, content)`). Ora valida
l'intero `SummaryContentSchema` e `SummarizedRelease` porta il contenuto. **Nessuna query in più.**

- `src/modules/releases/ui/release-row-content.tsx`, nuovo: titolo della Sintesi, verdetto, elenco
  `breaking[n]:`, puntatore `--> migrate to vite 6.0.0`. Il puntatore usa lo **slug**, non il nome,
  come fa il mock.
- Il verdetto dichiara il conteggio: `warning: action required · 4 breaking changes`.
- **La lista piana e il Cammino di upgrade rendono lo stesso componente.** Prima il verdetto si
  vedeva solo dentro `?from=`, e diceva meno di quanto il mock chieda.
- **`HelpPointer` è uscito da `diagnostic-page.tsx`** in `src/components/help-pointer.tsx`. Non è
  riordino, e il motivo serve se ricapita: importarlo da `diagnostic-page` trascinava il
  `SiteHeader`, e Supabase dietro di lui, dentro il grafo dei moduli della lista, e faceva fallire
  `dashboard-copy.test.ts`, che non c'entra niente, con un errore sulle variabili d'ambiente.
- **Mock e `DESIGN.md` non toccati**, come l'ampiezza della #47 prevedeva: erano loro la specifica.

### ⚠️ Due cose dell'ambiente, da non ricercare da zero

**`pnpm dev` non funziona su questa macchina.** Turbopack non riesce a creare i processi dei suoi
loader e muore con `0xc0000142` (STATUS_DLL_INIT_FAILED) **su ogni file**, compresi quelli non
toccati; il server residuo sulla 3000 rispondeva 500 anche sulla home prima di qualunque modifica.
Non è un errore del codice. Il giro di lavoro che funziona è **`pnpm build` + `pnpm start`**, che non
usano quei worker, e Playwright se lo riprende da solo (`reuseExistingServer` in locale). Un riavvio
della macchina di solito scioglie questi casi.

**Il database locale non ha nemmeno una Sintesi `ready`**: 1691 `skipped`, 130 `pending`, 85
`unavailable`. Quindi niente verdetto vero, niente titolo, niente breaking change si vede in locale
con i dati del Catalogo. È la #65 che si fa sentire. Il modo per guardare davvero una riga: seminare
una Tecnologia a mano in SQL con due Sintesi `ready`, guardarla, e cancellarla. È stato fatto così.

### Gli E2E e come sono stati attribuiti

Aggiunto un test in `tests/e2e/technology.spec.ts` sulla lista piana, con una Tecnologia di fixture.
Verde, insieme a `upgrade-path.spec.ts`.

Sulla suite intera restano **1 o 2 test del follow** che falliscono, **cambiando da una run
all'altra** e passando isolati. **Non sono di questa PR, ed è stato provato, non supposto**: con le
modifiche messe da parte (`git stash`), `main` ricostruito e la stessa suite sullo stesso server,
fallisce **lo stesso** test, `technologies.spec.ts:86`, con
`follows_technology_id_fkey ... is still referenced`. È fragilità preesistente nella pulizia delle
fixture. **Il metodo vale la pena di riusarlo**: prima di accusare le proprie modifiche, rieseguire
su `main` con lo stesso server.

`pnpm lint`, `pnpm typecheck` e `pnpm build` puliti. `pnpm test`: **461 su 461**, contro i 447 di
prima, perché `dashboard-copy.test.ts` non si caricava nemmeno.

### Il controllo a mano

A 1440px la riga dice tutto quello che il mock chiede, e la dispersione cala per davvero: la pagina
dichiara in una schermata quello per cui prima si aprivano N pagine. A 375px l'etichetta
`breaking[n]:` passa **sopra** il suo testo invece di starci accanto: segue la pagina Release, che lì
fa già così, mentre il mock non dice niente per quella larghezza. Se nel giro a mano finale sembrerà
troppo alta, è lì che si guarda.

## Sessione del 2026-10-03 (2): la revisione del design, diagnosi (#47, nessuna PR)

Sessione di sola **diagnosi**, deciso con l'utente all'inizio: `impeccable critique` su tutte e sette
le schermate, nei due temi, a 1440px e 375px, e **nessuna modifica al codice**. Le correzioni sono
lavoro della prossima sessione. Le decisioni prese qui sotto sono dell'utente e non vanno ridiscusse.

Il rapporto intero sta in **`.impeccable/critique/2026-10-03T16-26-11Z__src-app.md`** e non va
ricopiato qui. Punteggio di partenza: **26/40**, prima run per il bersaglio `src-app`.

### L'ampiezza della #47, decisa dall'utente

Dentro la #47: i **due P0**, il **gruppo della #64** (P1-3, P1-4, P1-5) e i due difetti misurati
(P2-9).

Fuori, **aperte il 2026-10-03** con i criteri di accettazione già scritti, tutte "Blocked by #47"
tranne la #87, perché toccano gli stessi mock e lo stesso `DESIGN.md` che la #47 sta modificando:

- **#83** il Cammino di upgrade parte da un non-risultato garantito (`ready-for-human`: il valore di
  partenza è una scelta di prodotto).
- ~~**#84** markdown grezzo nel pozzo di citazione~~: era l'unica `ready-for-agent` fra queste cinque,
  **fatta il 2026-10-05** con la PR #95, appena la #47 l'ha sbloccata.
- **#85** dalla citazione non si torna al breaking change che l'ha chiamata (`ready-for-human`:
  aggiunge un componente al sistema).
- **#86** il Catalogo è 32 righe alfabetiche, raggrupparle per genere (`ready-for-human`: introduce
  una proprietà di dominio, quindi va in `CONTEXT.md` o in un ADR **prima** del codice).
- **#87** le Sintesi pubblicate contengono il trattino lungo (`ready-for-human`, **non** bloccata
  dalla #47: la correzione è nel prompt e non nella UI, e rigenerare spende).

La ragione della delimitazione: così la #47 è un'issue che si chiude, invece di diventare il
contenitore che tiene bloccata la #26.

### ⚠️ Un branch per ogni intervento, non uno per tutta la #47

**Regola confermata dal 2026-10-04, quando il P0-1 l'ha seguita.** La #47 ha dentro cinque
interventi, e due aspettano una decisione dell'utente che non è stata presa (il settimo stato
derivato oppure il prompt a `v5`; e, se si tocca il prompt, se rigenerare). Se finiscono tutti sullo
stesso branch, **la #47 non si chiude per sessioni e tiene bloccata la #26**, che è l'ultima fetta
del PRD. Nessuna delle PR intermedie scrive `Closes #47`: la #47 si chiude solo con l'ultima dei
cinque.

L'ordine consigliato, dal più autonomo al più legato a una decisione (**tutti fatti**):

1. ~~**P0-1** (verdetti sulle righe della pagina Technology)~~: **fatto il 2026-10-04**, PR #89, unita.
2. ~~**P2-9** (i due difetti misurati)~~: **fatto il 2026-10-05**, PR #90, unita.
3. ~~**Il gruppo della #64** (P1-3 i conteggi, P1-4 Spotlight, P1-5 la barra sul telefono)~~:
   **fatto il 2026-10-05**, PR #91, unita.
4. ~~**P0-2** (il settimo stato)~~: **fatto il 2026-10-05**, PR #92, unita, l'unica che portava
   `Closes #47`. Era l'unico che richiedeva una risposta dell'utente prima di scrivere codice: le due
   risposte sono in "Che cosa ha deciso l'utente sul P0-2". Non ha speso niente, perché lo stato si
   deriva alla resa da quello che era già memorizzato.

Il giro finale è stato fatto: `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm test:e2e` sulla #92,
e **il giro a mano nel browser** sul preview, che ha trovato la sequenza della migrazione e la #94.
Il criterio "nessuna regressione negli E2E né nei controlli di accessibilità della #23" è rispettato.

### P0-1, da cui si riparte: le righe della pagina Technology sono vuote

**Verificato alla riga di codice, non dedotto.** `src/modules/releases/ui/release-list.tsx:22` rende
`<Row />` **senza** la prop `verdict`; `src/modules/releases/ui/upgrade-path-view.tsx:84` la passa.
Quindi i verdetti di riga esistono già e si vedono **solo** dentro `?from=`. La Dashboard li mostra
(`dashboard/ui/release-section.tsx:50`, `dashboard/ui/spotlight.tsx:21`).

Il mock approvato `design/mocks/technology.html:310-317` e la voce **"Release Row"** di `DESIGN.md`
specificano entrambi, per riga: il titolo della Summary, il verdetto
(`warning: action required · 4 breaking changes`), l'elenco `breaking[n]:` e il puntatore
`--> migrate to vite 6.0.0`.

**Quindi mock e `DESIGN.md` non si toccano: sono loro la specifica, ed è il codice a non averla
seguita.** Si registra che il buco c'era, non si motiva nessuno scostamento.

Perché è il primo: è il massimo generatore della dispersione che la #47 deve ridurre. Il lettore
apre N pagine Release per sapere quello che una pagina sola potrebbe dichiarare, cioè esattamente il
comportamento che il prodotto esiste per sostituire, riprodotto dentro il prodotto. È anche la pagina
su cui atterra il Visitor che arriva da una ricerca, che il principio 5 chiama la porta d'ingresso.

### ⚠️ P0-2: un verdetto verde su una Release che la Sintesi ammette di non poter giudicare

**Verificato in produzione.** `https://release-tracker-drab.vercel.app/technologies/vite/8.0.0` è una
**major** le cui Note di rilascio sono una riga sola ("Please refer to CHANGELOG.md for details"), e
mostra `ok: safe to upgrade` a 3.4rem sopra un suo stesso key point che dice *"No breaking changes
are stated in these notes, so review the changelog yourself before upgrading"*.

"Non ho trovato breaking changes" e "non ci sono breaking changes" sono affermazioni diverse, e il
prodotto stampa la seconda quando intende la prima. Viola il **principio 3** di `PRODUCT.md` nel
punto di massima fiducia.

Direzione: un **settimo stato** nel vocabolario Summary States, `note: not enough notes to judge`,
con glifo info muto e un paragrafo che dice dove stanno le note vere. Si attiva quando una Summary
`ready` ha 0 breaking changes **e** le note non descrivono cambiamenti, e sempre per una major.
Qui sì: nuovo stato nel selettore di `design/mocks/release.html` e voce sotto "Summary States" in
`DESIGN.md`.

**⚠️ La causa radice è nel prompt, trovata il 2026-10-03 e da non ricercare.**
`src/modules/summaries/domain/summary-prompt.ts` (`PROMPT_VERSION = "v4"`) istruisce il modello così:

> `"actionRequired": true exactly when "breakingChanges" is not empty.`
> `Never infer a breaking change the notes do not mention […] If the notes mention none,`
> `"breakingChanges" is empty and "actionRequired" is false.`

Quella regola è giusta per quello che doveva impedire (inventare breaking changes), e **equipara due
cose diverse**: "le note non dichiarano breaking changes" e "l'upgrade è sicuro". Il verdetto verde
è la conseguenza fedele di un prompt che non ha una terza uscita.

**Perciò il settimo stato si può derivare senza spendere, e questa è la strada da provare prima.**
I dati per distinguere i due casi sono **già memorizzati**: una Sintesi `ready`, `breakingChanges`
vuoto, e Note di rilascio che non descrivono cambiamenti (`vite` 8.0.0 ne ha una riga). Se lo stato
si deriva alla resa, **nessuna Sintesi va rigenerata e il costo è zero**. Un cambio al prompt
(`v5`, con un campo che dica se le note erano giudicabili) darebbe un risultato più pulito ma
richiede di rigenerare, quindi è la seconda scelta, non la prima.

**⚠️ Da decidere con l'utente, non da soli:** se accontentarsi dello stato derivato a costo zero o
bumpare il prompt. Il credito Anthropic è basso.

### La #64 è decisa: strada 1, e il perché va tenuto

**Scelta dell'utente il 2026-10-03: la riga resta dov'è, e la pagina smette di mentire su di lei.**

Il difetto vero non era la riga ferma, era che la pagina dichiara **quattro conteggi e due mentono**.
Verificato alla fonte: `src/modules/plans/ui/technology-picker.tsx` riceve `sections` dal server e
non le ricalcola mai lato client, quindi `following (5)` e `catalog (32)` restano fermi mentre la riga
di stato e la quota in testata salgono a `6 of 10`, e **dentro `catalog (32)` siede una riga il cui
bottone dice `Following`**. È una contraddizione in parole, su un prodotto le cui parole sono lo
strumento. Chi dice "sembra rotto" sta segnalando questo, non un'animazione mancante.

I tre interventi:
1. Aggiornare subito i conteggi di sezione a `following (6)` / `catalog (31)`, sullo stesso tick della
   riga di stato.
2. Dare alla riga rimasta ferma una propria riga di stato **senza inchiostro**, nella geometria che la
   Row Error Line già occupa: glifo info + `note: following · moves to the following section on your
   next visit`, Mono 14px `text-muted`, azzerata quando la riga viene ri-toggleata.
3. Ripulire la live region: oggi la frase desktop, quella mobile e la quota stanno dentro una sola
   regione `polite`, quindi ogni toggle **annuncia tre volte**.

**Perché non la strada 2** (spostare subito): la ragione originale regge, ed è più forte su telefono
che su desktop. A 375px una riga del picker è alta tre righe di testo, e spostarla fa scorrere quasi
uno schermo di contenuto sotto il pollice a metà tocco; il modo in cui fallisce è un tocco sbagliato
su un'altra Technology, che costa uno slot su dieci.

**Perché non la strada 3** (spostare tenendo il segno): comprerebbe correttezza al prezzo dell'unica
cosa che il sistema raziona deliberatamente. Servirebbero ancoraggio dello scroll, ripristino del
focus dopo lo spostamento nel DOM e un movimento che l'occhio possa seguire, cioè **un secondo
momento di moto**, quando `DESIGN.md` ne dichiara esattamente uno e lo mette fra i "Do".

**La cosa importante da non perdere: la strada 1 non rovescia la scelta approvata, la completa.** Il
mock resta valido nella sostanza e **non c'è nessun capovolgimento da registrare**, che era il
criterio più scomodo della #64. Se dopo i conteggi onesti la lamentela sopravvive, il passo seguente è
la **strada 3, non la 2**.

Costo: un nuovo stato di riga (riusa la geometria della Row Error Line), due legature di conteggio,
una pulizia di live region. `DESIGN.md`: "Row Error Line" diventa **"Row Status Line"** con due
varianti, `note` ed `error`, più una frase sotto "Picker Sections (Technologies)" che dica che i
conteggi si aggiornano subito mentre le righe non si spostano. Mock: `technologies.html` guadagna lo
stato nuovo nel selettore.

### Il resto di quello che sta dentro la #47

- **P1-4, Spotlight.** Cinque righe `latest major · none featured in 30 days`, ognuna col diamante
  **featured pieno** accanto a una versione che la riga stessa dichiara non featured; il conteggio
  sopra dice `0 featured`, il titolo dice `spotlight (5)` e **conta Technologies** mentre ogni altra
  sezione conta Releases. Tre contraddizioni in 200px, nell'istante in cui il lettore stava per
  andarsene soddisfatto dal verdetto. Fix: riga muta quando la sezione non ha righe vere, glifo
  featured via dalle righe compatte, `spotlight (N)` che conta Releases. Tocca `dashboard.html` e le
  voci "Stack Status Row" e "Section Title with Legend".
- **P1-5, la barra a tre righe sul telefono.** Misurata **153px a 375 e 390, 97px da 429 in su**:
  la barra a due righe che `DESIGN.md` specifica (56 + 40 = 96) esiste solo sui telefoni più larghi,
  e iPhone SE, iPhone 14 e Pixel spendono il 24% dell'altezza in cromatura. Fix: sotto i 429px la
  quota va nella striscia da 40px accanto a `dashboard technologies`, dove è già abbreviata a
  `N followed`. La regola No Dead End resta intatta. Tocca i paragrafi "Responsive".
- **P2-9, i due difetti misurati.** `sign out` è **64 × 20.8 px**: fallisce WCAG 2.2 AA 2.5.8 per
  3.2px di altezza, su ogni pagina autenticata, e come submit in una barra non ha l'esenzione dei
  link in linea. E la riga di sintesi della Dashboard corre **142 caratteri su 992px**, contro la
  regola dei 72ch che `DESIGN.md:293` si è data da sola.

### Che cosa la revisione ha trovato sano, e non va rimesso in discussione

Serve per non riaprire da zero cose già verificate:

- **Contrasto: 42 coppie misurate nei due temi, nessuna sotto 4.5:1.** L'impegno WCAG di `CLAUDE.md`
  è guadagnato, non asserito. ⚠️ Due margini stretti da ricordare: `text-faint` su `raised` in scuro
  **4.61:1**, `ok` su `sunken` in chiaro **4.63:1**. Si rompono al primo schiarimento di `raised`.
- Zero overflow orizzontale e zero testo tagliato a 375px su tutte le pagine raggiungibili; skip link
  presente e primo nell'ordine di tab; **nessun `outline: none` in tutto `src/`**; nessuna pagina
  salta un livello di intestazione.
- Il sorgente spedito è di fatto pulito per il detector: **un solo rilievo, ed è un falso positivo**
  (il raggio 3px è l'anello di focus, scritto in `DESIGN.md:328`).
- Il punteggio **4 su "estetica e minimalismo"** è meritato: su sette schermate e due temi non c'è una
  card, un badge, un'ombra, un gradiente o una tinta di marca, e ogni severità è accoppiata a glifo e
  parola.
- Le tre pagine che la #47 chiamava "mai disegnate" **sono disegnate**: 404 ed errore passano da
  `DiagnosticPage` dentro il sistema, e il login **dichiara già lo scope** ("Asks GitHub only for your
  public profile and email address. No access to any repository."). Il quarto criterio di accettazione
  della #47 è soddisfatto nella sostanza: resta da giudicarlo, non da scriverlo.

### Falsi positivi del detector, da non inseguire

Il raggio 3px dell'anello di focus (documentato), la "gerarchia di tipo piatta" (è il registro
impegnato, e sulla Dashboard confronta un `h1` che è `sr-only`, quindi misura qualcosa che nessuno
vede), i pozzi di citazione a filo (l'allineamento carattere per carattere dei caret lo **richiede**),
e quattro rilievi che erano **l'estensione del browser e la barra del detector stesso**
(`dark-glow #ffba00`, `text-occlusion`, due bottoni `◉` e `×`).

### Attenzione per chi riprende

- ⚠️ **Lo stato `ready` della Release non si vede in locale**: tutte le Summary locali sono `pending`.
  La schermata firma si guarda **in produzione**, che è pubblica e **non costa niente** da leggere, o
  nei mock, che hanno il selettore di stato. Vale anche per le misure: a 375px il comportamento dei
  caret non è mai stato esercitato, ed è lì che un overflow sarebbe più probabile.
- ⚠️ **`/login` reindirizza quando si è autenticati**, quindi non si ispeziona nella stessa sessione
  di browser in cui si è fatto il login locale. La sua passata di detector e il suo layout a 375px
  **non sono misurati**.
- `pnpm dev:login` ricrea la password di `dev@local.test`; poi si entra da `/login` col bottone
  "Continue as local developer". L'account locale è a **5 su 10** follow: due sono stati provati e
  rimessi a posto.
- Il tool Bash **non regge gli apici dentro una variabile d'ambiente JSON** su una riga di comando
  lunga: la scrittura dello snapshot è fallita al primo tentativo per quello. Si scrive il corpo con
  un file e si passa la variabile con `export` su un comando a parte.
- Due difetti noti e **non nostri** da non attribuire al lavoro in corso: `1 previews` (plurale non
  concordato) e l'URL del filtro che accumula parametri estranei (`?q=...&filter=...`).

## Sessione del 2026-10-03: il SEO delle pagine pubbliche (#24, PR #82)

### La descrizione non afferma quello che la Sintesi non dice

Il criterio della issue ha deciso la forma del codice. Una Release con una Sintesi pronta è
descritta **dal titolo della Sintesi e nient'altro**; senza Sintesi la descrizione è neutra,
Versione e giorno di pubblicazione, più una riga sulle Note se ci sono e nessuno le ha sintetizzate.
Nessun prefisso attorno al titolo della Sintesi, e la ragione non è estetica: il titolo sta sotto i
140 caratteri per schema, i caratteri utili di una meta description sono circa 160, e qualunque
prefisso si sarebbe mangiato la fine della frase.

La descrizione di una Tecnologia unisce la riga del Catalogo a quello che la pagina contiene, perché
"Frontend build tool" da solo è di 17 caratteri e non si legge come risultato di ricerca. Le 37
descrizioni del Catalogo sono state controllate una per una: tutte presenti e tutte diverse.

### `/technologies$` con l'ancora, altrimenti si chiude tutto il sito

La trappola di `robots.txt`: `Disallow: /technologies` è un **prefisso**, quindi escluderebbe anche
`/technologies/vite` e ogni altra pagina di Tecnologia, cioè esattamente quello che vogliamo
indicizzare. Serve `/technologies$`. Il `$` non è nello standard originale, ma Google e Bing lo
leggono entrambi, e le pagine con login portano già un `robots: { index: false }` loro.

### La sitemap nasce nella build, e questo ha rotto i test prima della CI

**Da ricordare, è la lezione della sessione.** `/sitemap.xml` è una rotta **prerenderizzata**. In
locale Playwright usa `next dev`, che rigenera a ogni richiesta; in CI usa `pnpm start`, cioè la
build, dove la sitemap è stata scritta **prima** che i fixture esistessero. Due E2E che cercavano un
fixture dentro la sitemap passavano in locale e fallivano in CI. Il comportamento dell'app era
giusto, il livello del test era sbagliato.

Dove sta adesso: `tests/integration/sitemap.test.ts` prova `listSitemapPages`, la query vera, con una
Tecnologia normale e una **ritirata**, letta col **client anonimo** perché è quello che rende la
rotta. All'E2E resta che la rotta serva il Catalogo come indirizzi assoluti.

**Regola pratica che ne esce**: un E2E su una rotta con `revalidate` non può vedere dati seminati
dopo la build. Si verifica con `CI=1 pnpm test:e2e`, che usa `pnpm start`, non col solo giro locale
su `next dev`.

### Due query invece di una, e l'ordinamento per `id`

`listSitemapPages` fa due query e le unisce nel dominio, invece di una con le Release annidate:
PostgREST pagina **solo le righe esterne**, quindi una Tecnologia con molte Release tornerebbe
troncata in silenzio. Le Release si ordinano per `id` e non per data, perché paginare su una colonna
con pareggi può ripetere o saltare una riga, e un intero batch di importazione condivide lo stesso
`created_at`.

`publicPagesFor` aggiunge `/sitemap.xml` ai percorsi da rivalidare, ma **solo se c'è almeno una
Release cambiata**: con la lista vuota continua a restituire niente, come prima.

### Due scelte oltre la lettera della issue, approvate dall'utente

1. **La home `/` è `noindex` e fuori dalla sitemap**, finché è il campionario dei token della #2. Un
   risultato di ricerca fatto di campioni di colore è peggio di nessun risultato. **La #26 deve
   rimettere la home nell'indice e nella sitemap**: i commenti nel codice, in `src/app/page.tsx` e
   in `src/app/sitemap.ts`, lo dicono.
2. La descrizione della Tecnologia allungata, come sopra.

Tutt'e due sono in `docs/DECISIONI.md`, sotto "Esperienza utente", con quattro righe nuove sul SEO.

### Da sapere, non difetti

- La sitemap viene **prerenderizzata nella build**, quindi la build legge il database. Non è una
  dipendenza nuova: il workflow di Deploy esegue già migrazioni e `catalog:sync` sulla stessa
  produzione (ADR 0005).
- Il limite di una sitemap è **50.000 URL**. In locale sono 1.946, quindi c'è spazio, ma quando il
  Catalogo crescerà servirà `generateSitemaps` per spezzarla.
- `technologies.spec.ts` sul toggle di unfollow e `current-version.spec.ts` sulla Versione in uso
  hanno fallito una volta ciascuno e sono ripassati al retry: **intermittenze note**, non regressioni.

### Due errori di processo, da non ripetere

- **Heredoc non quotato in Bash**: `<<PY` invece di `<<'PY'` nel comando che scriveva il corpo della
  PR, così bash ha eseguito i backtick del testo (ha lanciato `pnpm test`, `lint`, `typecheck` e
  `build` da solo) e il corpo è uscito corrotto. Corretto con `gh pr edit --body-file`. Quando il
  testo contiene backtick, l'heredoc va quotato e il path si scrive letterale invece di interpolarlo.
- **Un'attesa della CI conclusa troppo presto**: il controllo guardava `gh pr checks`, e la CI non
  era ancora registrata come check, quindi "nessun check pendente" è stato letto come "finito".
  L'attesa va fatta su `gh run watch <id>` del run, non sull'elenco dei check.

---

## Sessione del 2026-10-02 (4): il formato dei tag delle Anteprime (#36, PR #81)

TypeScript pubblica `6.0.0-beta` e `6.0.1-rc` su npm e su GitHub li tagga `v6.0-beta` e `v6.0-rc`,
senza il patch. La regola nuova sta in `CONTEXT.md`, sotto **Formato dei tag**, scritta prima del
codice: un formato è un testo con segnaposto fra graffe, e i segnaposto sono solo le parti di una
Versione (`{version}`, `{major}`, `{minor}`, `{patch}`, `{prerelease}`).

Il formato di base contiene sempre `{version}` **intera**, perché il rilevamento legge la Versione
fuori dal tag e deve poterla ritrovare. Il formato delle Anteprime (`prereleaseTagFormat`) vive solo
sulle Fonti `notes` e **può perdere delle parti** proprio perché nessuno ci rilegge dentro una
Versione: `v6.0-rc` non dice il patch, e non deve. Quella asimmetria è il cuore della issue, non un
dettaglio di implementazione.

`version-template.ts` sta in **`releases`** e non in `detection`: le parti di una Versione sono roba
di `releases`, e sia `catalog` (per lo schema) sia `detection` (per scrivere il tag) ne hanno bisogno.
Metterlo in `detection` avrebbe costretto `catalog` a importare `detection`, che importa già `catalog`.

### Nessuna migrazione: la Fonte sta in un `config jsonb`

`sources.config` è jsonb e `upsertSources` fa un upsert su `(technology_id, role, kind)` **senza**
`ignoreDuplicates`, quindi un campo nuovo nella Fonte arriva nel database col primo sync, da solo.
Controllato prima di scrivere la migrazione che non serviva.

### ⚠️ Le Note di rilascio si scrivono solo quando una Release nasce

`persistReleases` inserisce le note con `ignoreDuplicates`, quindi una Release entrata **senza** note
non le riprende mai, nemmeno quando la Fonte impara a trovarle. Conseguenza: in produzione le Anteprime
di TypeScript già importate **restano senza Note** anche dopo il merge, e il sync del Deploy aggiorna
solo la Fonte (`update typescript`). È la **#80**, che pone la domanda che costa invece di risolverla:
una Sintesi `unavailable` a cui arrivano le Note deve tornare `pending`, cioè farsi generare?

### ⚠️ Il rilevamento guarda solo avanti, quindi non si riprova cancellando una Release

`selectDetected` prende le Versioni **pubblicate dopo** la Release più recente che abbiamo, non quelle
semplicemente assenti (l'importazione iniziale tiene 12 mesi, e il resto è un'omissione voluta).
Cancellare le tre Anteprime di TypeScript non le avrebbe fatte tornare, perché `7.0.2` è più recente.
La verifica è passata dall'**importazione iniziale**: svuotate tutte le Release di TypeScript in locale
(`summaries` e `release_notes` prima, perché le chiavi esterne **non** hanno `on delete cascade`), la
Tecnologia torna "awaiting import" (`count === 0`) e `catalog:sync` la rifà: `update typescript` +
`import typescript: 6 release(s)`, nient'altro toccato.

Esito: `6.0.0-beta` e `6.0.1-rc` **hanno le Note**. Effetto collaterale del solo database locale:
`5.9.3` non c'è più, perché l'importazione tiene 12 mesi e ora è fuori.

### `7.0.1-rc` resta senza Note, e non è un difetto nostro

Su npm c'è, su GitHub non esistono né la release né il tag `v7.0-rc` (verificato con
`git/matching-refs/tags/v7.0`: c'è solo `v7.0.2`). Lì `unavailable` è la risposta onesta, e non va
cercata una causa nel formato.

### Nessuna spesa, e perché

Le due Anteprime che ora hanno le Note sono `skipped`, non `pending`: l'importazione iniziale le lascia
nella storia (`skip`), e `initialSummaryStatus` ne tiene conto. Una Anteprima con le note e senza
`skip` sarebbe `pending`, quindi la prossima volta che si rifà un'importazione vale la pena guardarlo.

### ⚠️ Il tool Bash dimezza i backslash negli heredoc

`cat > file <<'EOF'` ha scritto `[\]\]` dove il sorgente diceva `[\]\\]`, e lo stesso in uno script
Python passato per heredoc (i `SyntaxWarning` su `"\]"` lo hanno rivelato). Una regex con `\\` va
scritta con Write o Edit, non con un heredoc. Un secondo inciampo della stessa famiglia:
`cat > "$X" 2>/dev/null || true` senza input si è mangiato il resto del comando, heredoc compreso, e
il processo è rimasto appeso a leggere stdin.

### Attenzione per chi riprende

- Verificati: `typecheck`, `lint`, `build`, 447 test unitari (21 nuovi), 52 di integrazione,
  `technology.spec.ts` in E2E.
- Uno script fuori dal progetto **non risolve** i pacchetti (`node_modules` isolato di pnpm): un
  controllo usa e getta va messo dentro il progetto, come file che inizia per punto, e cancellato
  subito; oppure importa solo via `@/`, che tsx risolve dal tsconfig.
- Non resta niente di `ready-for-agent`: il prossimo lavoro è la **#47**, e aspetta l'utente.

## Sessione del 2026-10-02 (3): il filtro di /technologies nell'URL (#72, PR #79)

Un hook nuovo, `src/modules/plans/ui/filter-query.ts` (26 righe), e una riga cambiata in
`technology-picker.tsx`: `useState("")` diventa `useFilterQuery()`. Niente cambia a schermo, quindi
`DESIGN.md` e il mock `technologies.html` non sono stati toccati.

### Perché qui lo stato resta in React, mentre la Dashboard legge dal server

La Dashboard legge `?week=` dal **server** e l'HTML arriva già aperto (vedi "Lo stato nell'URL: il
server apre, il browser ricorda"). Il filtro no, e la differenza è voluta: il conteggio accanto al
campo è dal vivo e il campo è controllato, quindi un giro al server per ogni tasto arriverebbe in
ritardo sul dito. Lo stato React è la fonte di quello che la pagina disegna, seminato una volta da
`useSearchParams`, e l'URL è uno specchio. Un indirizzo filtrato aperto da zero funziona comunque al
primo colpo: la pagina è dinamica, quindi `useSearchParams` ha il valore giusto già nell'HTML.

La scrittura usa `window.history.replaceState`, lo stesso gesto delle settimane della #21 e dei
puntatori della #12: Next lo integra nel router, e sostituire la voce invece di aggiungerne una è
l'unico modo perché un conteggio dal vivo non riempia il tasto indietro di un carattere per volta.

Due decisioni di dettaglio: con il filtro vuoto il parametro viene **rimosso** (come le settimane),
così l'indirizzo pulito è quello non filtrato; e gli altri parametri eventualmente presenti restano
dove sono, verificato da un test con `?stray=1`. Un parametro assurdo non ha bisogno di nessuna
guardia, perché è solo una stringa che non corrisponde a niente e finisce nella nota onesta della
user story 37: è il terzo dei test nuovi.

### `URLSearchParams.toString()` scrive lo spazio come `+`, non come `%20`

Il primo giro E2E è fallito solo per l'attesa del test, che costruiva l'URL atteso con
`encodeURIComponent` (`Fixture%20278ec4f2`) mentre il codice lo scrive con `URLSearchParams`
(`Fixture+278ec4f2`). Nella query sono equivalenti e il valore riletto è identico. Il test ora
costruisce l'atteso con `new URLSearchParams`, così non fissa una delle due forme per caso.

### ⚠️ Un flake preesistente in `technologies.spec.ts`, da non attribuire al lavoro in corso

Il test *"a Developer follows a Technology, and the follow is still there after a reload"* è fallito
una volta sul conteggio dopo il reload, e al giro dopo è passato. Non lo tocca niente di questo
lavoro. **Segnalato all'utente e nessuna issue aperta**: se si rivede, apritene una invece di
cercarlo nella modifica in corso.

### Nessun altro stato di vista merita l'URL (ultimo criterio della #72)

Controllati tutti i `useState` dei componenti client: sono form in corso
(`current-version-field`), la cache dei follow, la citazione attiva, il "già seguita" di
`technology-follow`. L'unico discutibile è l'apri/chiudi della settimana nel digest della Dashboard
(`digest-week.tsx`), che però è un gesto di lettura e non una vista da condividere, e per le
settimane l'URL ce l'ha già. Niente da aggiungere e nessuna issue nuova.

### Attenzione per chi riprende

- Verificati: `typecheck`, `lint`, `build`, 426 test unitari, e in E2E `technologies` (9, tre nuovi),
  `a11y`, `keyboard` e `navigation` (39). Nessuna regressione sull'accessibilita' del campo (#23).
- Il server di sviluppo non era in piedi e **Playwright lo avvia da sé** (`reuseExistingServer` in
  locale): non serve lanciarlo a mano prima.
- ~~La prossima piccola da sola è la #36~~: fatta nella sessione (4). La **#47** aspetta l'utente.

## Sessione del 2026-10-02 (2): la 404 e la pagina di errore (#25, PR #77)

Due pagine che sostituiscono una pagina intera invece di una sua parte, col sistema esistente e
nessun mock. Il guscio condiviso è `src/components/diagnostic-page.tsx`, che porta anche il
`HelpPointer` (il `-->` cyan tratteggiato di `DESIGN.md`, che prima non esisteva come componente).
Nuova sezione in `DESIGN.md`: *Page States (404 and error)*.

- **404**: `note: no page at this address`, glifo info muto, **senza inchiostro**. Un indirizzo che
  non nomina niente è l'assenza di una cosa, non un guasto: colorarlo sarebbe stato contro la regola
  che dice di non dare inchiostro alle righe di stato non di errore.
- **Errore**: `error: this page could not be loaded`, x-circle corallo, `Try again` accanto allo
  stesso pointer. L'unico dettaglio stampato è il digest, in Meta: `reference 2499699134`. La pagina
  non rende mai `error.message`, quindi non c'è niente di interno da far scappare nemmeno per
  sbaglio.

Entrambe montano `SiteHeader nav`, con le due sezioni nello slot: nemmeno una pagina che non c'è è
un vicolo cieco. L'utente ha controllato l'aspetto in produzione dopo il merge e lo ha approvato.

### ⚠️ Next serve la 404 e l'errore come un guscio senza layout, disegnato sul client

La scoperta che vale più delle due pagine. La risposta di queste due rotte è
`<html id="__next_error__">` con `<head>` quasi vuoto: **niente layout, niente CSS, niente font e
niente script del tema**. Il resto arriva dal payload RSC e viene disegnato sul client. Conseguenza
vista a occhio: col tema chiaro entrambe uscivano **scure**, perché lo script nel `<head>` non girava
mai e il render del root rimetteva il `data-theme="dark"` che `layout.tsx` passava come prop React.

La correzione è in due pezzi che lavorano insieme, e la regola generale è la prima:
**un attributo che React non possiede è un attributo che React non può rimettere a posto.**

1. `layout.tsx` non scrive più `data-theme`; `themeInitScript` lo scrive ora in **entrambe** le
   direzioni (prima metteva solo `light`, lasciando `dark` al markup del server).
2. Dove lo script non arriva, lo ripara al mount `ThemeToggle`, che possiede `data-theme` ed è
   l'unico client component presente su ogni pagina. Costa un lampo scuro sulla pagina di errore, e
   solo lì.

Il tema è ora **asserito** nei due scan axe nuovi, uno per pagina per tema: senza quell'asserzione la
regressione passava in silenzio, perché axe guarda il contrasto di quello che trova, non di quello
che ti aspettavi.

### ⚠️ `notFound()` imposta lo status solo finché la risposta non ha iniziato a streammare

Dopo che un confine Suspense ha reso il suo fallback, gli header sono già partiti: la pagina dice 404
e l'header dice 200, e Google la chiama soft 404. Da qui la regola: `notFound()` va chiamato **prima**
di ogni `await` che può sospendere. Le nostre pagine lo facevano già, ma non si deduce, si misura: i
test controllano `response.status()` su indirizzo inesistente, slug sconosciuto, Versione senza
Release e segmento che non è una versione. Tutti e quattro 404 veri.

### La pagina che fallisce apposta

`src/app/test/throw/page.tsx` è l'unico modo per far vedere la pagina di errore a un test. Esiste solo
con `E2E_AUTH_SECRET` impostata, esattamente come `/api/test/session`: in produzione quell'indirizzo
risponde con la 404 di una rotta mai scritta. Ha `dynamic = "force-dynamic"`, altrimenti il throw
diventa un errore di build invece che una pagina di errore.

Fuori di proposito: **niente `global-error.tsx`**, l'unico modo per coprire un errore *dentro* il root
layout. Lì Next serve una pagina tutta sua, senza i nostri stili, e il nostro layout è quasi statico
(font e Analytics): il costo sarebbe un secondo documento HTML con i token duplicati. Se un giorno il
layout cresce, questa decisione va rivista.

### ⚠️ Un secondo `pnpm start` non si lega alla 3000 e il vecchio build continua a servire

Mezz'ora persa a inseguire un fantasma. Avevo il server su di un build precedente, ho ricostruito e
lanciato `pnpm start` di nuovo: il secondo processo **non** si lega alla porta occupata, muore in
silenzio, e il browser continua a vedere il build vecchio. Le correzioni sembravano non funzionare.
Il controllo che non mente, prima di misurare qualunque cosa: uccidere chi tiene la 3000
(`netstat -ano | grep ':3000 .*LISTENING'`, poi `taskkill //PID <pid> //F`) e **ripartire da lì**.

### Attenzione per chi riprende

- Branch `feat/25-not-found-error`, due commit (le pagine, e a parte la correzione del tema),
  PR #77 unita. Cancellati i branch locali già uniti; ne restano quattro vecchi
  (`dashboard-sections-and-digest`, `fix/55-summary-claim-fence`, `issue-22-catalogo-40-tecnologie`,
  `issue-68-current-version`) da ripulire quando capita.
- Suite E2E verde: **118 test**, 7 nuovi in `tests/e2e/errors.spec.ts` e 4 scan axe in più.
- Docker era giù all'inizio, riavviato come al solito; `pnpm db:start` dopo.
- La **#72** è la prossima, già letta: vedi "Da dove ripartire".

## Sessione del 2026-10-02: la navigazione decisa e costruita (#63, PR #75)

La #63 era `ready-for-human`: prima le quattro decisioni di forma con l'utente, poi `DESIGN.md` e i
mock, poi il codice. In quest'ordine, perché il terzo criterio di accettazione chiedeva che i
documenti descrivessero la navigazione scelta.

### Le quattro decisioni, e il perché di ciascuna

- **Barra in alto, niente sidebar.** Le destinazioni dietro il login sono due e non crescono, e la
  larghezza che una sidebar prenderebbe è quella che la pagina della Release spende nei pozzi delle
  citazioni: la #62 è stata una sessione intera su quell'overflow. Una sidebar andrebbe anche spenta
  sulle pagine pubbliche, che non hanno sezioni da elencare, quindi due layout invece di uno.
- **Una navigazione sola.** Un solo `SiteHeader` con uno slot fra wordmark e azioni: cambia il
  contenuto dello slot, mai il componente. La home usa la stessa barra.
- **Sotto i 640px lo slot diventa una striscia da 40px sotto la barra**, con gli stessi link nello
  stesso ordine. Il conto che ha deciso: a 390px restano 358px, il wordmark ne prende 135 e a destra
  ci sono quota, accesso e tema, quindi **orizzontalmente non c'è spazio** ed è per questo che lo slot
  era finito `max-sm:hidden`. Le strade vere erano due, nascondere dietro un pannello o dare spazio
  verticale. Verticale: niente drawer, niente stato aperto o chiuso, niente focus trap, niente
  JavaScript, e la tastiera lo raggiunge nell'ordine del documento. Costa 40px su una pagina che già
  si scorre.
- **Il passo `technologies` del breadcrumb è un link per tutti**, e `requireDeveloper` riporta
  indietro il visitatore dopo l'accesso. Non potrebbe comunque dipendere da chi guarda: la sessione
  arriva dopo il primo paint, e un header che cambiasse forma al suo arrivo rimonterebbe la pagina
  (la lezione della #68). Il breadcrumb dice **dove sta la pagina**, non che cosa il visitatore può
  aprire.

Fissate in `DESIGN.md`: sezione *Navigation* riscritta, la regola con nome **The No Dead End Rule**,
le tre sezioni *Responsive* corrette (da "is hidden" a "moves to the navigation strip") e tre voci nei
Do's and Don'ts. I quattro mock hanno la striscia nella media query dei 640px.

### ⚠️ `--spacing: initial`: le classi di spaziatura fuori dagli otto passi cadono in silenzio

La striscia era 40px nei mock e **21,8px nell'app**, con `max-sm:h-10` scritta e applicata.
`globals.css` fa `--spacing: initial` e definisce solo gli otto passi del progetto (4, 8, 12, 16, 24,
32, 48, 72), quindi `h-10` non esiste: Tailwind la emette, il browser la butta, nessuno protesta.
Nello stesso giro è caduta una `gap-y-0` muta per la stessa ragione. **Regola**: una misura fissa fuori
dalla scala si scrive fra parentesi quadre, `h-[40px]`, come i 56px della barra già facevano. E una
classe di spaziatura nuova non si dà per buona finché non la si è vista sulla pagina vera: i mock non
la provano, perché hanno un CSS loro.

### ⚠️ La home era l'unico vicolo cieco totale, e nessuna issue lo diceva

La pagina `/`, il campionario dei token che la #26 sostituirà, aveva un header tutto suo: wordmark in
uno `<span>`, solo il toggle del tema, **zero link**. La #63 parlava di tre buchi e questo non era fra
loro, l'ha visto l'utente. Ora usa `SiteHeader nav` con entrambe le sezioni e nessuna corrente, e il
suo `main` ha finalmente l'`id="content"` che lo skip link indicava senza trovarlo. Da ricordare per
la #26: la landing eredita questo header, non se ne scrive un altro.

### Attenzione per chi riprende

- Il giro di verifica che ha trovato il difetto dei 40px: `pnpm build`, poi `pnpm start`, poi uno
  script Playwright che misura e fotografa. Le misure contano più degli screenshot, perché un errore
  di 18px si vede solo col righello.
- `CI=1 pnpm exec playwright test` **non riusa** il server esistente: la 3000 va liberata prima,
  altrimenti esce con "is already used". Succede anche con i server che si sono avviati da soli
  durante la sessione.
- Docker era giù all'inizio e l'ho riavviato come descritto nella sessione del 2026-09-30, con il
  controllo che non mente (`until [ -n "$(docker info --format '{{.ServerVersion}}' 2>/dev/null)" ]`).
- Suite E2E completa verde: 107 test, `a11y.spec` nei due temi compreso. Il nuovo
  `tests/e2e/navigation.spec.ts` ha 4 test, fra cui la risalita Release → Tecnologia → Catalogo a
  390px.
- Nella stessa PR, in un commit a parte, l'aggiornamento del piano editoriale in questo documento.

## Sessione del 2026-09-30: la Versione in uso costruita, e quattro cose imparate

La **#68** fatta e unita (PR #74). Quattro lezioni, tre di progetto e una di ambiente.

### Che cosa è stato costruito

`follows.current_version` e `follows.current_version_declared_at`, con un trigger che valida come la
Versione di partenza del Cammino di upgrade e tre SQLSTATE propri (`FVMAL`, `FVNEW`, `FVNST`). Sulla
pagina Tecnologia il controllo sotto il Seguire, che è anche la partenza predefinita del Cammino;
`?from=` scavalca senza salvare. Sulla Dashboard due righe in più, assenti per chi non dichiara.

- ⚠️ **La data di una dichiarazione la scrive il database, non il client.** Un client che potesse
  scriverla potrebbe far sembrare fresca una dichiarazione vecchia, e ogni conto costruito sopra
  diventerebbe falso in silenzio. Il trigger la tocca solo quando la Versione cambia davvero:
  ridichiarare la stessa lascia la data dov'era, perché niente si è mosso.
- ⚠️ **Il `grant update` va dato per colonna, non per tabella.** Un permesso di update sull'intera
  riga lascerebbe spostare `technology_id`, e quello scavalcherebbe `enforce_follow_rules`, che
  guarda solo l'insert. `grant update (current_version)` chiude la strada.
- ⚠️ **Un vincolo `check` non basta se un trigger gli passa davanti.** Il primo tentativo lasciava la
  forma della Versione al `check`, che il trigger non raggiungeva mai: confrontare una Versione che
  non è una Versione falliva prima, sul cast a `integer[]`, con `22P02`, uno SQLSTATE che parla di
  testo e non dice nulla della regola violata. La forma si controlla dentro il trigger, e il `check`
  resta come seconda cintura per le scritture col service role.
- Il confronto in SQL usa solo il core della Versione come `integer[]`, perché Postgres confronta gli
  array elemento per elemento. Perdere la prerelease non costa niente **per questa domanda**: a core
  uguale una prerelease sta sotto la sua Release, quindi non è mai la più recente delle due.

### ⚠️ `releases` non può importare `plans`, e la direzione si controlla prima di scrivere

`plans` importa già `releases` (`latestStableVersion` in `list-picker-technologies`), quindi far
leggere al Cammino di upgrade la Versione in uso da `plans` avrebbe creato un ciclo fra moduli. La via
d'uscita è un contesto che **`releases` possiede**: `UpgradeStartProvider` dice che qualcuno ha
dichiarato una partenza e da quando, e il Cammino non sa che a portarla è un Seguire. È `plans` a
riempirlo. Prima di appoggiare un modulo a un altro conviene sempre un `grep -rn "@/modules"` sui due:
il ciclo si vede in un colpo.

### ⚠️ Un provider che compare quando arriva la sessione rimonta tutta la pagina

`useSession` risponde **dopo** il primo paint. Il primo tentativo faceva restituire allo scope un
Fragment finché la sessione era `unknown` e un `FollowsProvider` dopo: due tipi di elemento diversi
nella stessa posizione, quindi React smonta e ricostruisce tutto quello che c'è sotto. Sulla pagina
Tecnologia "tutto quello che c'è sotto" è il corpo della pagina, e ogni `<details>` aperto si
richiudeva, a ogni refresh del token. Ora `FollowsProvider` accetta un `developerId` nullo e la forma
dell'albero non cambia mai, cambia solo per chi è. **Regola**: quando lo stato che decide un provider
arriva in asincrono, il provider c'è sempre e sono i suoi prop a cambiare.

### ⚠️ `waitUntil: "networkidle"` non arriva mai, in produzione

Il test nuovo passava in locale contro `pnpm dev` e **falliva in CI tutti e tre i tentativi**: non
instabilità, deterministico. `networkidle` chiede 500 ms di rete ferma, e una pagina con la sessione
attiva non sta mai ferma così tanto, fra analytics e refresh del token. Le attese ora sono su
condizioni vere, che è anche quello che `networkidle` stava sostituendo: il Toggle è un `button` solo
quando il browser sa che sta guardando uno Sviluppatore, e il campo contiene la dichiarazione solo
quando i follow sono arrivati.

- ⚠️ **Un test E2E nuovo si prova come lo prova la CI**, cioè contro la build di produzione:
  `pnpm build` e poi `CI=1 pnpm exec playwright test <spec>`. Con `CI=1` Playwright avvia
  `pnpm start` invece di `pnpm dev` e non riusa il server esistente, quindi serve la porta 3000
  libera. `networkidle` resta in `technology-follow.spec`, dove passa: non è stato toccato.

### Ambiente

**Docker Desktop si è piantato** a metà sessione, con l'engine giù e i processi ancora in piedi. Non
sta in `C:\Program Files`: l'eseguibile è in
`C:\Users\rober\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe`, e si riavvia con
`Start-Process`. Attenzione a come si aspetta che torni: `docker info` esce con **codice 0** anche
quando il demone non c'è, stampando l'errore, quindi un `until docker info >/dev/null` finisce subito
e mente. Va controllato che l'output non sia vuoto:
`until [ -n "$(docker info --format '{{.ServerVersion}}' 2>/dev/null)" ]`.

## Sessione del 2026-09-29 (6): il budget dei caret misurato, e la Versione in uso

Due cose, nella PR #67. E una lezione che vale per tutte e due.

### `0 su 13.496`: la #62 verificata sui dati veri

La passata sulla produzione dopo la PR #66 non ha dato zero: **6 controlli su 13.496**, tutti a 768px,
su `angular/22.0.0`, `deno/2.0.0` ed `express/5.0.0`. Le tre citavano una riga di **esattamente 79
caratteri**, cioè esattamente il limite che lo scaglione a 768px dichiarava di reggere.

Il motivo: `caret-row.ts` calcolava il budget da un avanzamento **nominale** di 0.6em. **Fragment Mono
avanza 9px a 14px**, quindi ogni scaglione prometteva da cinque a sette caratteri più del vero. La
formula invece era giusta: le larghezze che produce coincidono **al pixel** con quelle misurate nel
browser. Sbagliava solo la costante.

Ora l'avanzamento è quello misurato e ogni scaglione tiene indietro un carattere. I budget sono
**58 / 72 / 87 / 92** (erano 64 / 79 / 95 / 100). Dopo il merge la passata ha dato **0 su 13.496**.

- ⚠️ **Una costante tipografica si misura, non si assume.** 0.6em è il valore che "si sa" dei font
  monospaziati; Fragment Mono non lo rispetta, e l'errore era invisibile perché portava a soglie
  *quasi* giuste. Il test unitario ora fissa i budget misurati: se il tipo o la colonna cambiano,
  fallisce lui invece della produzione.
- ⚠️ **La guardia va provata al contrario.** La fixture E2E cita una riga lunga esattamente quanto il
  budget di ogni scaglione, e rimettendo la costante sbagliata **fallisce a 768px**, la stessa
  larghezza a cui falliva la produzione. Una guardia che non si è mai vista fallire non è una guardia.
- Lo script della passata è buttato via ogni volta, ma la forma è sempre la stessa: crawl di
  `a[href^="/technologies/<slug>/"]` da ogni pagina di Tecnologia (le 37 danno **1.687** pagine di
  Release), poi `scrollWidth` contro `clientWidth` a quattro larghezze, Note chiuse e aperte, con gli
  elementi foglia che sporgono nominati. **Dalla radice del repo**, o `@playwright/test` non si
  risolve. **Serve la produzione**: i preview di Vercel rispondono 302.

### La Versione in uso (#68), e l'import dopo il lancio (#69)

Domanda dell'utente: in base a cosa diciamo `action required`? La risposta era scomoda. **È un
giudizio sulla Release, uguale per tutti**: l'app non sa dove sta chi legge. La Versione di partenza
del **Cammino di upgrade** si scrive a mano e si perde a ogni visita, e `follows` non ha nessuna
colonna per la versione.

La regola è fissata in `CONTEXT.md` **prima di scrivere codice**: un **Seguire** può portare una
**Versione in uso** (`currentVersion`, colonna `follows.current_version`), **dichiarata, mai osservata
e mai verificata**. Nome confermato dall'utente. Il vincolo che la tiene onesta sta nella regola, non
in un mock: **una dichiarazione ferma invecchia in silenzio**, quindi ogni conto che ci si appoggia
dice da quando lo è.

Scartati: "Versione installata" (l'app non installa niente) e "Versione attuale" (suona osservata).

L'import di `package.json` resta **fuori dall'MVP**, e la #69 ne porta le domande aperte: monorepo,
`dependencies` contro `devDependencies`, manifest contro lockfile (il manifest dice `^18.2.0`, non la
versione installata), che fare delle dipendenze fuori dal Catalogo, e **dove passa il file** (caricato
sul server, o letto nel browser senza mai inviarlo). La ragione vera dell'attesa è la terza: con 37
Tecnologie un `package.json` vero verrebbe riconosciuto per circa **una riga su otto**, e l'app si
leggerebbe come incompleta invece che curata.

### Attenzione per chi riprende

- ⚠️ **La #68 va prima della #47**, ed è nei suoi "Blocked by". Cambia che cosa la Dashboard deve dire
  per prima: rivedere il design prima vuol dire rifarlo dopo.
- ⚠️ **I test non possono importare da `@/modules/<modulo>/domain`** (ESLint `no-restricted-imports`):
  `overflow.spec.ts` usa il budget dei caret, quindi `CARET_WIDTHS`, `caretWidth` e `fits` sono
  esportati dall'indice del modulo.
- ⚠️ **La tabella `CARET` in `breaking-change-item.tsx` e il mock vanno tenuti insieme.** I budget
  nuovi hanno spostato due dei quattro pozzi del mock da `data-fits="900"` a `data-fits="1024"`.

## Sessione del 2026-09-29 (5): #62, l'overflow della pagina della Release

La #62 è chiusa. Il rimedio è quello che la issue indicava, arrivato però a una regola più precisa di
"nascondere i caret sotto i 640px".

### La riga dei caret vale quanto la citazione sta su una riga

La riga dei caret è `^` una volta per carattere citato: **regge solo finché la citazione sta su una
riga sola**. Appena va a capo i caret finiscono sotto le parole sbagliate, e essendo una sequenza
senza nessun punto dove spezzarsi allargano tutta la pagina. Non è una questione di larghezza della
finestra: è la lunghezza della citazione, riga per riga.

Quindi `src/modules/summaries/domain/caret-row.ts` calcola, da quanti caratteri ha la citazione, **la
finestra più stretta in cui quella citazione ci sta ancora su una riga**. ⚠️ **I numeri scritti qui
quel giorno (64 / 79 / 95 / 100) erano sbagliati**: la sessione (6) li ha corretti in
**58 / 72 / 87 / 92** misurando il font invece di assumerlo. Oltre il budget più alto la riga dei
caret non compare mai. Sotto quella soglia la sottolineatura corallo
dentro la riga citata prende il suo posto, come `DESIGN.md` già faceva sotto i 640px: dice la stessa
cosa e resta allineata comunque la citazione vada a capo.

Il calcolo sta nel dominio ed è testato (`caret-row.test.ts`); la pagina ne ricava soltanto una coppia
di classi Tailwind letterali, perché il JIT non vede le classi costruite a runtime. La sottolineatura
è diventata `@utility cited-quote` in `globals.css`, così si può scrivere `max-[899px]:cited-quote`.

### Le due righe sono ora un solo pozzo

`QuoteWell` aveva due `div` con mezzo raggio ciascuno e lo sfondo ripetuto: nascondere quello dei
caret voleva dire correggere anche il raggio e i margini dell'altro, a ogni soglia. Ora c'è **un
contenitore solo** con sfondo, raggio e padding, e le due righe dentro. Nascondere la riga dei caret
non tocca più niente altro. Il bordo inferiore passa da 4px a 6px di padding: è la stessa misura del
superiore, ed è quello che il mock faceva già sotto i 640px.

### L'altra causa, sotto i 640px

`code` in `globals.css` prende `overflow-wrap: anywhere`, e la riga citata pure: un identificatore o
un URL più larghi della colonna vanno a capo dentro la parola invece di allargare la pagina. È la
causa che restava dove i caret erano già nascosti.

### La guardia

`tests/e2e/overflow.spec.ts` misura `scrollWidth` contro `clientWidth` su home, login, Tecnologia,
Release (Note chiuse e aperte), Dashboard e Tecnologie, a 1440, 1280, 768 e 390px, e **nomina gli
elementi foglia che sporgono**: sapere che una pagina straborda non basta per ripararla. Le fixture
sono ostili di proposito: una citazione che nessuna larghezza tiene, un identificatore più largo di un
telefono, un URL nudo. Lo spec controlla anche che la riga dei caret resti dov'è giusta e che il
pannello delle Note continui a scorrere per conto suo.

### Attenzione per chi riprende

- ⚠️ **Le classi Tailwind vanno scritte per intero.** `max-[${w}px]:hidden` non viene generata: il
  file usa una tabella di classi letterali, una riga per soglia. Se si aggiunge una soglia in
  `CARET_WIDTHS` va aggiunta anche lì, e nel mock.
- ⚠️ **Il mock è stato aggiornato** (`design/mocks/release.html`): un solo pozzo per le due righe e
  `data-fits` su ciascuno. Le sue quattro citazioni stanno fra 80 e 88 caratteri, quindi il mock
  mostra il passaggio a 900px. Senza questo aggiornamento la sessione dopo rimetterebbe le due righe
  separate.
- ⚠️ **Fixture delle Sintesi: `keyPoints` ne vuole almeno 3** (`SummaryContentSchema`). Con meno, la
  Sintesi non valida e la pagina non mostra niente, senza dire perché: due test sono falliti così.
- Le misure (0.6em di avanzamento di Fragment Mono, colonna 1040/900px, gutter 5ch) stanno nei
  commenti di `caret-row.ts`. Se il tipo o la colonna cambiano, le soglie vanno rifatte.

## Sessione del 2026-09-29 (4): quattro segnalazioni dell'utente, misurate prima di scriverle

Nessun codice cambiato. Le quattro segnalazioni sono diventate **#62**, **#63** e **#64**, dopo averle
verificate una per una. Due non erano quello che sembravano, e la verifica ha allargato il quadro.

### La lezione che vale più delle tre issue

**Misurare la produzione prima di scrivere la issue** ha cambiato tutte e tre le issue rispetto a come
sarebbero state scritte dalla sola segnalazione. L'overflow sembrava una pagina, sono metà delle
pagine di Release; la navigazione sembrava un breadcrumb, è l'assenza di qualunque navigazione sotto
i 640px. **In locale non si vedeva niente di tutto questo**, perché il database locale non ha le
Sintesi vere: è la stessa differenza fra i due ambienti che l'utente ha chiesto di sanare.

Le due passate sono state fatte con uno script `.mjs` buttato via a fine giro, lanciato **dalla
radice del repo** (fuori di lì `@playwright/test` non si risolve). La prima confronta `scrollWidth` e
`clientWidth` di `document.documentElement` a più larghezze e raccoglie gli elementi foglia il cui
`right` supera la finestra; la seconda inventaria gli `a[href^="/"]` distinguendo quelli visibili.
Valgono la pena di essere rifatte ogni volta che si tocca il layout.

### #62, overflow della pagina della Release (`ready-for-agent`)

Passata su tutte le Tecnologie del Catalogo, quattro larghezze: **74 controlli su 304** in overflow,
e sono **sempre e solo pagine di Release**. Home, login e pagine delle Tecnologie non strabordano mai.
A 1440px una pagina, a 1280px diciassette, a 768px e a 390px ventuno. Peggiore: `jest/30.0.0`,
+1734px a 768px.

Due cause distinte, ed è per questo che la issue non chiede "accorciare i caret":

- **Sopra i 640px, la riga dei caret** (`breaking-change-item.tsx:33`, `"^".repeat(end - start)`):
  su `react/19.0.0` arriva a 167 caratteri, uno `span` largo 1503px. Il guasto è strutturale: il testo
  citato va a capo sugli spazi, la sequenza di `^` non ha nessun punto dove andare a capo, e sotto una
  citazione andata a capo i caret non sarebbero comunque più allineati. **La riga dei caret funziona
  solo se la citazione sta su una riga sola.**
- **Sotto i 640px**, dove i caret sono già nascosti, resta un overflow diverso: `<code>` lunghi e URL
  Markdown interi, fuori da qualunque contenitore che scorra.

Il rimedio è già dentro il sistema: sotto i 640px `DESIGN.md` sostituisce i caret con una
sottolineatura corallo dentro la riga citata, che dice la stessa cosa e resta sempre allineata.
La issue chiede anche una **guardia negli E2E**, come la #23 ha fatto con axe: l'overflow nasce dai
dati veri e tornerà da solo appena arriveranno note di rilascio nuove.

### #63, navigazione (`ready-for-human`, blocca la #47)

Il buco grosso non era quello segnalato: in `site-header.tsx` **`SignedInNav` e `Breadcrumb` sono
tutti e due `max-sm:hidden`**, quindi **sotto i 640px non esiste nessuna navigazione**. Su telefono,
da una pagina di Release l'unico link è il wordmark. È un vicolo cieco, non una scelta di densità.

Il breadcrumb `technologies` non è cliccabile perché è passato come stringa, mentre lo slug nella
pagina della Release è un `{label, href}`. **Il nodo non è tecnico**: `/technologies` sta dietro il
login, quindi per un visitatore quel link porta all'accesso (`requireDeveloper` lo riporta poi
indietro). Va deciso se è quello che vogliamo.

La home `/` è ancora il campionario dei token della #2 e non ha nessun link interno: **non è un
problema di navigazione**, la sostituisce la #26.

### #64, la riga seguita non si sposta (`ready-for-human`, dentro la #47)

**Non è un difetto: è una scelta deliberata**, e anche il mock approvato `technologies.html` si
comporta così. Il motivo, dall'handoff della sessione che costruì la pagina: "le sezioni sono lo
scatto del momento della visita, il toggle cambia solo sé stesso e il conteggio", per non far muovere
la lista sotto il puntatore mentre si clicca. La issue riporta la ragione originale e le tre strade
(lasciare, spostare, spostare tenendo il focus), così quando la si riapre non si riparte da zero.
**Attenzione: rovesciarla richiede di aggiornare anche il mock**, altrimenti la sessione dopo la
rimette com'era.

### Attenzione per chi riprende

- ⚠️ **Prima di chiamare difetto una cosa, cercare se è una decisione.** Due segnalazioni su quattro
  erano scelte approvate e scritte (il Follow che non sposta la riga, i caret come parte dichiarata
  del sistema). Si cercano in `docs/DECISIONI.md`, negli ADR, nei mock e in questo handoff.
- ⚠️ **Un difetto guidato dai dati non si vede in locale.** Il database locale non ha le Sintesi vere:
  per l'aspetto delle pagine di Release la fonte è la produzione.

## Sessione del 2026-09-29 (3): #23, i mock uniformati e l'audit WCAG 2.2 AA

409 unitari, 44 di integrazione, **79 end-to-end**, `typecheck`, `lint` e `build` puliti. PR #61.

### Le cinque differenze, ciascuna risolta in un posto solo

La quinta non era nella issue: è stata aggiunta come commento prima di lavorarci.

1. **Righe del picker.** Non c'era niente da fare nel codice: `PickerRow` era già unico, a 16ch col
   nome come link, per il Catalogo e per la Dashboard vuota. A essere rimasto indietro era il mock
   `dashboard.html`, allineato ora. **Lezione: prima di uniformare, guardare da che parte sta già la
   verità.** Due delle quattro differenze vivevano solo nei mock.
2. **Errore di riga.** `FollowRejectionNote` passa da `label` (13px) a `diagnostic` (14px), la misura
   che il form del Cammino di upgrade usava già. In `DESIGN.md` `field-error` definiva **solo il
   colore**, ed è questo che ha lasciato divergere le due misure: ora c'è la **One Error Measure
   Rule** e `typography: diagnostic` su `field-error` e `row-error`.
3. **Riga dei conteggi.** Via il `text-[15px]` arbitrario da `summary-view.tsx`: i 15px non erano
   nella scala. Restano altri `text-[14px]` arbitrari in giro, dove serve 14px senza l'interlinea 1.7
   di `diagnostic` (pulsanti, breadcrumb): non sono stati toccati, erano fuori dalla issue.
4. **Segmento dell'anteprima.** `.b-preview` era CSS morto in `technology.html`: mai nel markup, mai
   nella legenda. Le anteprime stanno oltre il `to`, quindi fuori dall'intervallo che la barra misura,
   e l'ombra inset contraddiceva la regola delle superfici piatte. Cancellato.
5. **Follow sotto i 640px.** `latest` e le Fonti ora sono un gruppo solo in `technology-header.tsx`,
   come `.tech-facts` nel mock, quindi vanno a capo insieme e il Follow tiene una riga sua. Il test
   `technology.spec.ts` "under 640px…" è stato provato a rovescio: fallisce senza la correzione.

### L'audit, e dove ciascuna cosa è verificata

- `tests/e2e/a11y.spec.ts`: axe (`@axe-core/playwright`) con i tag `wcag2a … wcag22aa` su **dieci
  stati di pagina per tema**: home, login, picker con un follow rifiutato, picker coi toggle, pagina
  della Tecnologia e Cammino di upgrade, versione non valida, Release con Sintesi pronta (anche con
  le Note aperte), Release in attesa, Dashboard vuota e Dashboard con qualcosa da fare.
  **Nessuna violazione, in nessuno dei due temi.** Il tema si sceglie scrivendo `localStorage.theme`
  con `addInitScript`, cioè la stessa strada di un Developer che torna.
- `tests/e2e/keyboard.spec.ts`: skip link, lettura della Release fino alle Note che cita, Cammino di
  upgrade compilato e inviato, Seguire dal picker e dalla pagina della Tecnologia, Dashboard. Ogni
  fermata controlla che l'outline ci sia davvero. `tabTo` fallisce se l'elemento non arriva: è così
  che si accorge di un elemento fuori dall'ordine di tabulazione.
- `src/app/theme-contrast.test.ts` (unitario, 14 test): legge i token da `globals.css` nei due temi e
  calcola i rapporti. **Serve perché axe misura solo il testo che una pagina rende davvero**: un
  bordo, un glifo e uno stato che nessun test attraversa gli restano invisibili.

### `rule-strong`: l'unico rilievo, e perché era reale

Stava a **1,68:1** sullo scuro e **1,59:1** sul chiaro, contro il **3:1** del criterio 1.4.11. Non è
decorativo: è il bordo di ogni pulsante e di ogni campo (il solo segno che identifica il controllo),
la sottolineatura dei link e il segmento `digest` della barra, che porta un conteggio.

- Scuro `#353b45` → **`#676d77`**, chiaro `#c6c6bf` → **`#82827b`**, in `globals.css`, in `DESIGN.md`
  e nei quattro mock.
- I valori sono i minimi che tengono la stessa tinta e superano 3:1 **sul piano peggiore**, con un po'
  di margine: il piano peggiore è `raised` sullo scuro (i pulsanti ci vanno in hover) e `sunken` sul
  chiaro (i campi ci stanno sopra). Risultato 3,35:1 e 3,33:1.
- Restano lontanissimi da `text-faint` (1,37 e 1,40 rispetto a quello): i bordi si vedono senza
  diventare testo. Verificato a schermo nei due temi prima del commit.
- `rule` non è stato toccato: divide e basta, nessun dovere di contrasto. È scritto in `DESIGN.md`.

### Attenzione per chi riprende

- ⚠️ **`pnpm exec supabase status` risponde EPERM quando una run lo interroga abbastanza spesso**, e
  faceva cadere a caso `auth.spec.ts` o `dashboard.spec.ts`. Succedeva già prima; i due file nuovi
  aumentano la pressione perché `test.use` (il movimento ridotto) fa ripartire il worker, e ogni
  worker nuovo richiede lo status. Ora `tests/e2e/fixtures.ts` riprova tre volte con attesa crescente.
  **Se un test fallisce nel `beforeAll` senza una ragione, è quasi sempre questo, non il test.**
- ⚠️ **`transition-none` toglie la proprietà, non la durata.** Un test sul movimento ridotto che
  guarda `transitionDuration` fallisce anche quando tutto è a posto: guardare `transitionProperty`.
- Il `.cited-span` esiste solo dopo che un cite pointer l'ha aperto: un test che lo cerca a freddo non
  lo trova.
- `/technologies` è dietro il login: non esiste uno stato "visitatore" di quella pagina da controllare.

## Sessione del 2026-09-29 (2): #56 e #54, i due limiti della Sintesi

395 unitari, 44 di integrazione, `typecheck`, `lint` e `build` puliti. Due limiti spostati, tutti e
due misurati sul primo batch vero e sul Catalogo a 37 Tecnologie invece che a occhio.

### #56: il titolo arriva a 140 caratteri (PR #59)

Lo schema in `summary-content.ts` accetta 140, **il prompt continua a chiedere 120 e non è stato
toccato**. È la distanza a fare il lavoro: il modello punta ancora a 120 e i pochi caratteri che
sfora (al massimo 6, su 4 Sintesi su 126) finiscono nel margine invece di buttare una Sintesi pagata.
Alzare anche la richiesta del prompt avrebbe solo spostato il problema a 141, e avrebbe costretto a
bumpare `PROMPT_VERSION` da `v4`, perdendo il confronto con il set di valutazione.

- Niente potatura del titolo: un titolo mozzato è peggio di uno un po' lungo. Il titolo vive in un
  solo posto, l'`<h2>` di `summary-view.tsx:52`, con `max-width: measure` e `text-wrap: balance`:
  va semplicemente a capo. Le liste leggono `SummaryVerdictSchema`, che il titolo non ce l'ha.
- Mock verificato al nuovo massimo, backtick resi come `<code>` come fa `InlineCode`: 2 righe a
  1280px, 4 righe a 390px, nessun overflow. Chrome non scende sotto ~500px di finestra: per vedere i
  390px veri serve un iframe largo 390 dentro una pagina servita su http (il `file://` la
  navigazione lo rifiuta).
- Deciso di **non** fissare una regola sul formato del titolo (nominare la Tecnologia, niente punto
  finale): né il prompt né il mock la chiedono, e il titolo d'esempio del mock è proprio nello stile
  di quello di turborepo che sembrava sbagliato. Semmai è una issue sua, con un giro di prompt e un
  eval.

### #54: le Note arrivano a 150.000 caratteri (PR #60)

`MAX_NOTES_LENGTH` da 80.000 a **150.000**, con la regola scritta nell'**ADR 0007**: la soglia misura
quanto siamo disposti a spendere per una singola Sintesi, non quanto il modello riesce a leggere.
Sono circa 40k token e meno di 10 centesimi con lo sconto batch, molto dentro la finestra di Opus 5.
Gli 80.000 non stavano né in `CONTEXT.md` né in un ADR: solo in un commento, come difesa dal costo.

La distribuzione vera, 1814 Release con Note in locale: **4 oltre gli 80k**, 7 fra 60k e 80k, 21 fra
40k e 60k, p95 23.106, **p99 53.592**, massimo 108.842. La soglia sta molto sopra il 99° percentile e
lascia il 38% di margine sulla Release più lunga.

Oltre la soglia si **fallisce ancora**, non si tronca: il pezzo non letto potrebbe contenere proprio
il breaking change. Spezzare le Note in più richieste è stato scartato: costa uguale o di più, molto
codice per 4 Release su 1814, e lascia il modello a decidere su una vista parziale.

### I passi a mano che restano, fermi in attesa di credito

⚠️ Nessuno dei due è stato eseguito: il credito dell'utente è basso. **Un merge da solo non spende.**

1. **#56, costo zero.** `local/msgbatch_0159Vxf39GAEADUx3dQKrzFj-reimport.sql`, generato da
   `pnpm summary:reimport <risultati.json> <release-id>...`. Lo script legge i risultati salvati del
   batch, li rivalida con lo stesso `parseSummaryOutput` delle pagine e scrive gli `UPDATE`: **non
   tocca nessun database**, così applicarli resta un gesto deliberato.
2. **#54, circa 25 centesimi.** L'SQL qui sotto, poi un submit a mano. Si guarda da solo due volte:
   prende solo i fallimenti causati dal vecchio limite, e solo se le Note ora ci stanno davvero.

```sql
update summaries s
set status = 'pending', failure_reason = null, batch_id = null, updated_at = now()
from release_notes n
where n.release_id = s.release_id
  and s.status = 'failed'
  and s.failure_reason like 'release notes are % over the 80000 limit'
  and length(n.body) <= 150000;
```

### Attenzione per chi riprende

- ⚠️ **L'SQL della #56 vale solo per la produzione.** I `release_id` sono UUID generati per ambiente:
  in locale quei quattro non esistono e l'`UPDATE` passa **in silenzio senza toccare una riga**,
  perché è guardato da `status = 'failed'`. Controllare che l'SQL Editor riporti `UPDATE 1` per
  ciascuno dei quattro. È lo stesso motivo per cui l'utente ha chiesto di uniformare i due database.
- ⚠️ **In locale le tre Release della #54 sono già `pending`**: l'SQL di rimessa in coda è stato
  provato lì (`UPDATE 3`, e ha lasciato stare `astro 6.0.0`, che è la quarta oltre gli 80k ma è
  `skipped`). Non costano niente da ferme, ma **un submit locale lanciato per altri motivi le
  includerebbe e spenderebbe**. Sono state lasciate `pending` perché con la nuova soglia è lo stato
  vero: rimetterle `failed` avrebbe richiesto di scrivere un motivo non più valido.
- ⚠️ **Cambiare una regola di validazione rompe i test che si aspettano un rifiuto.** Alzato il
  limite del titolo, `tests/integration/summaries.test.ts` costruiva ancora un titolo di 121
  caratteri aspettandosi `failed`, e il CI è andato rosso dopo che la PR era già aperta. Il database
  locale è di solito già acceso: **eseguire `pnpm test:integration` prima di aprire la PR**, non solo
  unitari, `typecheck`, `lint` e `build`.
- La pagina di una Release `failed` non è muta: `summary-status-block.tsx:46` mostra già
  `error: summary unavailable` con le Note complete sotto.

## Primo batch di Sintesi vero (2026-09-28, dopo il merge della #22)

Il primo invio vero alla Batch API, deciso e lanciato dall'utente, **raccolto il 2026-09-29**.
**126 Sintesi inviate in un solo batch** (`msgbatch_0159Vxf39GAEADUx3dQKrzFj`, non 125 come diceva
prima questo documento), **3 fallite prima dell'invio** perché le Note superano gli 80.000 caratteri
(issue #54, non costano niente), **nessuna rimasta in coda**. Il batch è finito in 17 minuti con
**126 richieste su 126 riuscite e zero errori** dal lato dell'API.

- Il `CRON_SECRET` di produzione **non era più recuperabile**: su Vercel è *Sensitive* e si legge solo
  alla creazione. È stato rigenerato, rimesso su Production e seguito da un **redeploy**, senza il
  quale la funzione continua a usare la fotografia delle variabili con cui è nata. Va conservato
  fuori dal repository: quello in `.env.local` è un altro, buono solo per il locale.
- Prova gratis prima di spendere: un `GET` su `/api/jobs/summaries/collect` senza batch in corso
  risponde 200 e non tocca niente. È il modo di sapere che il segreto arriva alla funzione prima di
  chiamare `/submit`, che invece spende.
- In PowerShell `curl` è un alias di `Invoke-WebRequest` e legge `-s` come `-SessionVariable`: serve
  **`curl.exe`**, oppure `Invoke-RestMethod`.
- I due cron delle Sintesi restano **fuori** da `vercel.json`: un giro a mano resta un giro solo, e
  il lavoro quotidiano comincerà il giorno che quelle due righe tornano, con una PR sua.

### La raccolta (2026-09-29): 122 `ready`, 4 `failed`, spesa $4,16

`/api/jobs/summaries/collect` ha reso **122 `ready` e 4 `failed`**, con `stillProcessing` e `pending`
vuoti e 164 pagine marcate da rivalidare. In produzione le Sintesi si vedono. La spesa è chiusa: non
resta niente da raccogliere e il batch non serve più.

- **Costo vero: $4,16** per le 126, cioè $0,033 di media e $0,0245 di mediana. Ricavato dai token dei
  risultati (1.034.180 in input, 125.965 in output) a $5/$25 per milione con lo sconto Batch del 50%,
  non dalla Console. Sommato ai 4 batch del set di valutazione del 23/09 fa **$4,80 in tutto**, che è
  la cifra vista sulla bolletta (circa €4,40). Numeri riportati in `docs/DECISIONI.md`.
- **La stima di $2,94 era bassa di un terzo** perché il costo per Sintesi veniva misurato sul set di
  valutazione, 14 Release scelte a mano con Note più corte del Catalogo vero. La mediana vera è quasi
  identica alla stima: sbagliava sulla coda. Le 10 Sintesi più care sono il 21% della spesa.
- ⚠️ **Le 4 `failed` sono fallite solo per il titolo troppo lungo**: 121, 124, 125 e 126 caratteri
  contro il limite di 120 in `summary-content.ts`. Erano corrette in tutto il resto. È il prezzo
  previsto del fatto che `output_config.format` garantisce la forma del JSON e non il `maxLength`
  delle stringhe, cosa che `docs/DECISIONI.md` diceva già: il 3% di scarto è la sua misura.
  Risolto dalla **#56**: il limite dello schema sale a 140, il mock regge, e le 4 si **reimportano
  dal file dei risultati invece di rinviarle**, perché rinviarle costerebbe altri 12 centesimi.
  Vedi la sessione del 2026-09-29 (2).

### I risultati del batch, salvati (2026-09-29)

Tutti e **126 i risultati sono in `local/msgbatch_0159Vxf39GAEADUx3dQKrzFj.json`** (520 KB, chiave =
`release_id`), salvati prima della scadenza. `/local/` è in `.gitignore`: è la cartella dei dati locali
che non stanno nel repository. Da lì la #56 reimporta le 4 Sintesi senza rinviarle e senza spendere.

- ⚠️ **L'`expires_at` di un batch è 24 ore dalla creazione**, non i 29 giorni di conservazione dei
  risultati che dice la documentazione: questo batch, creato il 28/09 alle 19:16 UTC, scadeva il 29/09
  alla stessa ora. Un batch che serve ancora va riletto lo stesso giorno, o salvato subito.
- I 4 titoli fuori limite, tutti fra 121 e 126 caratteri, sono buoni: un limite di 140 li prende tutti.
  Una cosa in più da decidere nella #56: quello di turborepo (125) **non nomina la Tecnologia e finisce
  con un punto**, a differenza degli altri tre. Non c'entra con la lunghezza, ma se il formato del
  titolo ha una regola, quello la viola.

## Sessione del 2026-09-28 (6): #22 Catalogo a 37 Tecnologie (PR #53 in `main`)

393 unitari, 43 di integrazione, 52 E2E, `typecheck`, `lint` e `build` puliti. Catalogo da 3 a **37
Tecnologie**, importate davvero contro il database locale: **1893 Release**, zero import falliti.

### Che cosa contiene il Catalogo e che cosa no

- 32 npm e 5 rilevate da **GitHub Releases** (Node.js, Deno, Bun, Rust, Terraform).
- Deciso con l'utente di **non** aggiungere PyPI: le Versioni PyPI seguono PEP 440, le Anteprime si
  scrivono `2.3.0rc1` e il nostro parser SemVer le scarta, quindi il mondo Python avrebbe la sezione
  Anteprime vuota per sempre. Diventa una issue sua, con PEP 440 dentro.
- Escluse, verificate una per una: **Go** e **Python** (solo tag, nessuna Release su GitHub, e il tag
  non porta la data), **Django** (note in `.txt` sotto `docs/releases/`), **TanStack Query** (i tag
  sono date), **PostgreSQL** (`17.2` non è SemVer), **PHP** e **Kubernetes** (Release senza contenuto,
  solo un rimando al ChangeLog: una Sintesi da lì sarebbe vuota o inventata).

### Le due cose nuove nel dominio

- Strategia **`minor-major`** (in `CONTEXT.md`): per chi mette le novità nella minor e non cambia
  major da anni, ogni x.y.0 è _In evidenza_. La usano Rust, Terraform, **Playwright e Vue**: con
  `semver` la loro ultima Release _In evidenza_ sarebbe per sempre la x.0.0 di anni fa.
- **GitHub Releases come Rilevamento**: `SourceSchema` è ora l'unione di due unioni per ruolo, perché
  lo stesso `kind` serve entrambi. `detection/domain/tag-format.ts` legge la Versione dal tag; il
  formato da solo non basta (`vsix-22.2.0` sta in `v{version}`), decide `parseVersion`. La lista è
  paginata e **limitata a 3 pagine**: Node ha più di mille Release e il validatore sta sulla prima.

### I due difetti che solo il Catalogo vero ha fatto vedere

- ⚠️ **PostgREST tronca a 1000 righe senza dirlo.** Con 1893 Release il Rilevamento leggeva le prime
  mille e trattava le Tecnologie rimaste fuori come "in attesa di Importazione", cioè **smetteva di
  rilevarle per sempre**. Ora `src/lib/supabase-rows.ts` (`selectAllRows`) legge per pagine finché
  non ne torna una corta, e lo usano `detect-releases` e `list-releases`. Vive fuori da
  `src/lib/supabase.ts` apposta: quello importa `@/env` e i job non devono dipenderne.
- Tre Release vere hanno **Note oltre il limite di 80.000 caratteri** e la Sintesi fallisce:
  `next 16.3.0` (108.842), `biome 2.0.0` (99.660), `turborepo 2.11.0` (88.867). Sono `failed` nel
  database locale. Deciso nella #54: la soglia sale a 150.000 e le tre ci stanno. Vedi la sessione
  del 2026-09-29 (2).

### Fonti con i tag mescolati

`prisma` e `expressjs/express` usano **sia** `v8.0.0-rc.13` **sia** `7.10.0` nello stesso repository,
e un `tagFormat` solo non li prende entrambi. Prisma è passata a `{version}`, che copre tutte le
stabili e lascia fuori solo le rc di v8. Express resta `v{version}` e perde solo `4.22.0`. Le altre
Release importanti senza Note sono davvero assenti da GitHub, verificato tag per tag: `angular 21.0.0`,
`express 4.22.0`, `trpc 11.13.0`, `zod 4.0.0`.

### Costo e spesa (niente è stato speso)

**128 Sintesi in coda, circa $2,94 una tantum.** Dopo il merge il deploy ha fatto l'Importazione in
produzione (34 Tecnologie, nessun fallimento) e le Sintesi sono **In attesa**: non partono da sole,
perché in `vercel.json` l'unico cron è il Rilevamento e i job delle Sintesi si chiamano a mano con
`CRON_SECRET`. La spesa resta una decisione dell'utente, non un effetto del deploy.

> Superato: l'utente ha poi deciso di spendere. Quelle Sintesi sono state inviate il 28/09 e
> raccolte il 29/09, e sono costate $4,16 invece dei $2,94 stimati qui. Vedi la sezione
> "Primo batch di Sintesi vero" in cima al documento.

### Attenzione per chi riprende

- ⚠️ **Il `SUPABASE_ACCESS_TOKEN` del workflow `Deploy database` è stato rigenerato il 2026-09-29**:
  il vecchio dava `Unauthorized` su `supabase link`, e per un giorno nessuna migrazione è arrivata in
  produzione (l'ultimo giro riuscito era del 28/09 alle 19:19). Se il workflow torna a fallire lì, è
  di nuovo quello. Il nuovo è uno **scoped token** limitato al progetto, con **Project Settings**,
  **API Keys** e **API Key Secrets** in sola lettura: tanto `supabase db push` usa
  `SUPABASE_DB_PASSWORD` e si collega al database diretto, saltando i permessi del token.
- Dopo il merge della #55 la migrazione del recinto **è passata in produzione** (`db push` del run
  36573254145) e il `catalog:sync` ha detto `0 operation(s)`, cioè il Catalogo era già allineato.
  Lo stato delle Sintesi in produzione **non è stato riletto**: nessuno lo ha toccato, ma se serve la
  certezza sono due query nell'SQL Editor (la firma di `claim_pending_summaries` e i conteggi per
  `status`). Da qui non si arriva: `.env.local` punta al Supabase locale.
- ⚠️ **Le chiavi Anthropic devono essere legate a un workspace.** Una chiave org-level è valida ma
  risponde `400`: *"This API key is not scoped to a workspace, so this request must include the
  anthropic-workspace-id header"*, e il nostro codice quell'header non lo manda. Vale anche per la
  chiave su Vercel. Il batch è leggibile solo con una chiave del workspace che l'ha creato.
- **Gli script locali leggono `.env.local` solo se la variabile non è già nell'ambiente**: `node
  --env-file` non sovrascrive quello che trova. Una variabile utente Windows `ANTHROPIC_API_KEY`
  scaduta copriva il file e faceva sembrare invalida la chiave buona; è stata **rimossa il
  2026-09-29**. Una shell aperta prima di quel momento porta ancora dietro il vecchio valore.
- L'isolamento dei test di integrazione è a posto in tutti e due i posti dove mancava: le finte Fonti
  di `detection.test.ts` rispondono solo per le proprie Tecnologie, e i job delle Sintesi hanno il
  recinto per Tecnologia della #55. Non serve più rimettere a mano nessuna Sintesi dopo
  `pnpm test:integration`.
- **Cambiare la Strategia di una Tecnologia non riclassifica le Release già registrate**: in locale
  Playwright e Vue sono state cancellate e reimportate a mano. In produzione servirebbe lo stesso.
- Importazione locale: `GITHUB_TOKEN=$(gh auth token) pnpm exec tsx --env-file=.env.local
  --conditions=react-server scripts/sync-catalog.mts`. Circa tre minuti per 34 Tecnologie.
- Il primo giro completo di E2E dopo l'Importazione ha dato 3 rossi che al secondo giro non si sono
  ripetuti (52 su 52): compilazione a freddo con più dati, non una regressione.

## Sessione del 2026-09-28 (5): #21 Dashboard, seconda parte (Latest, Previews, Weekly Digest)

345 unitari, 43 di integrazione, **52 E2E**, `typecheck`, `lint` e `build` puliti; le pagine
pubbliche restano SSG. Guardata con Playwright a 1280px e a 390px contro `design/mocks/dashboard.html`.

### Le settimane ISO sono un modulo a parte, perché sbagliano da sole

`dashboard/domain/iso-week.ts` (puro, 10 test): `isoWeekOf`, `isoWeekKey`, `parseIsoWeekKey`,
`isoWeekRange`. Tutto in UTC e tutto derivato dal **giovedì** della settimana, che è la regola ISO:
per questo il 1 gennaio 2021 sta nella settimana 53 del 2020 e il 30 dicembre 2024 sta nella
settimana 1 del 2025. I due confini d'anno sono due test, non un commento.

`dashboard/domain/sections.ts`: `sectionRows(rows, significance)` (Latest e Previews sono la stessa
sezione con una Rilevanza diversa) e `weeklyDigest(rows)`. Le righe sono `{ technology, release }`,
perché in queste sezioni ogni riga deve dire di chi è. A parità di giorno l'ordine è per
Versione: senza, due Release dello stesso giorno si scambiavano di posto tra una visita e l'altra.

`buildDashboard` ora restituisce anche `latest`, `previews`, `digest` e `thisWeek`, che è la chiave
della settimana ISO corrente: ogni riga si marca "this week" confrontando la propria settimana con
quella, così la parola significa la stessa cosa in tutte le sezioni.

### Lo stato nell'URL: il server apre, il browser ricorda

`?week=2026-W39,2026-W38`. La pagina è già dinamica, quindi le settimane aperte le legge il
**server** dai `searchParams` e l'HTML arriva già aperto: un link condiviso funziona al primo
colpo, senza sfarfallio. Il clic invece scrive nell'URL con `history.replaceState` (come i puntatori
della #12), quindi aprire una settimana non riempie il tasto indietro. Chiudere l'ultima settimana
**toglie il parametro** invece di lasciarlo vuoto.

`readOpenWeeks` scarta tutto ciò che non è una chiave di settimana: l'URL si può scrivere a mano,
e una settimana inventata non deve aprire niente. `week-param.ts` è puro e testato.

### Il difetto che solo una fixture nuova ha fatto vedere

La riga compatta dello Spotlight chiamava "latest release" una **Anteprima**: `standingOf` prendeva
la Versione più alta per SemVer, e una beta è più alta della stabile che la precede. Ora i
candidati sono le stabili, e una Anteprima compare solo se la Tecnologia non ha mai pubblicato
altro. Veniva dalla #20 e nessun test a tavolino lo toccava.

### Attenzione per chi riprende

- Una sezione **senza righe non viene resa** (niente "latest (0)"): il mock non ha quello stato e la
  riga dei conteggi dice già zero. Per lo stesso motivo nella riga dei conteggi un numero a zero
  resta testo semplice invece di diventare un'ancora morta; `featured` fa eccezione e resta sempre
  un link, perché lo Spotlight c'è anche senza niente in evidenza.
- **Tailwind 4, di nuovo la stessa trappola della #19**: `pl-[...] max-[640px]:pl-0` lasciava le
  righe del Digest rientrate a 390px. La spinta ora si aggiunge da `sm` in su. Vale per ogni coppia
  di utility della stessa famiglia.
- Nel database **locale** sono state inserite a mano sette Release finte per guardare le sezioni
  piene, e poi **tolte**: erano un pericolo vero, perché il Rilevamento considera nuova solo una
  Versione pubblicata dopo la più recente che ha, e una finta più recente gli avrebbe nascosto le
  vere. Restano solo i dati veri e i due `significance_override` della #20.
- Nuovo scostamento dal mock per la **#23**: per una Anteprima saltata il mock scrive "only the
  first v4 preview is summarized - read 4.0.0-beta.1", noi scriviamo "no summary - read the release
  notes". Dire quale sia la prima Anteprima della major richiede di ritrovarla, e inventarla no.

## Sessione del 2026-09-28 (4): #20 Dashboard, prima parte (chiusa, PR #51 in `main`)

316 unitari, 43 di integrazione, **50 E2E**, `typecheck`, `lint` e `build` puliti; le pagine
pubbliche restano SSG. Guardata con Playwright a 1280px e a 390px contro `design/mocks/dashboard.html`.

### Il dominio decide, la pagina mostra

`buildDashboard(followed, releases, now)` (`dashboard/domain`, puro, 9 test) restituisce
`{ verdict, counts, spotlight }`. Le regole che valeva la pena fissare nei test:

- La finestra di 30 giorni si conta da `now` **iniettato**, estremi compresi.
- Una voce di Spotlight per **ogni** Tecnologia seguita: le `featured` della finestra, impilate dalla
  più recente, oppure una riga compatta.
- L'ordine è prima chi chiede intervento, poi chi è sicuro, poi le righe compatte, e dentro ogni
  gruppo la più recente. È l'ordine in cui vale la pena guardarle, non l'alfabeto.
- Una `featured` **senza Sintesi pronta compare lo stesso**, ma non conta né come sicura né come
  intervento: chiamarla sicura sarebbe una promessa che la Sintesi non ha ancora fatto.

### Il buco che solo i dati veri hanno mostrato

La riga compatta doveva dire "latest major", ma TypeScript ha 7 Release e **nessuna major
registrata** (l'Importazione si ferma a 12 mesi), e la pagina diceva "no releases recorded yet" di
una Tecnologia che di Release ne ha sette. Ora `standing` è `{ release, major }`: la major se c'è,
altrimenti la Release più recente, e la riga dice "latest release" invece di spacciarla per una
major. Si vedeva solo aprendo la pagina con il Catalogo locale, non nei test scritti a tavolino.

### Com'è fatto il resto

- `dashboard/server/read-dashboard.ts`: **una query sola** dai `follows`, letta con il client dello
  Sviluppatore (nessun `user_id`: lo impone la RLS). Tornano **tutte** le Release, non solo la
  finestra, perché la riga compatta ha bisogno della major vecchia e il Weekly Digest della #21 le
  vuole tutte comunque.
- `dashboard/ui`: `DashboardSummary` (verdetto e conteggi), `Spotlight`, `EmptyDashboard`,
  `SectionTitle`. `dashboard-copy.ts` è puro e testato come `upgrade-path-copy`: `pageVerdict` e
  `rowVerdict` sono le uniche parole che il dominio non dice.
- **La quota nella barra in alto** (`3 of 10 followed`) arriva a `SiteHeader` **come elemento**, non
  come componente, come il Follow della #19: l'intestazione non impara che cosa sia un Piano e le
  pagine pubbliche non le passano niente. Per questo la pagina avvolge **header e main** nello stesso
  `FollowsProvider`: la barra e il corpo leggono lo stesso conteggio vivo e non possono divergere.
  Portata anche su `/technologies`, dove il mock la mette.
- Lo stato vuoto riusa `PickerRow` e `FollowToggleLimitNote` di `plans/ui`: il Follow si comporta
  **esattamente** come su `/technologies` perché è lo stesso componente, non una copia.

### Scostamenti dal mock, da aggiungere alla #23

- Il mock intitola la sezione dello stato vuoto **"popular in the catalog"**, ma nel Catalogo non
  c'è nessun segnale di popolarità. Deciso con l'utente il 2026-09-28: le prime 8 in **ordine
  alfabetico** e titolo `in the catalog (8)`. Inventare una popolarità sarebbe stata una regola di
  dominio nuova, da fissare prima in `CONTEXT.md`. Se un giorno arriva un segnale vero, cambia solo
  l'ordine.
- Nella riga dei conteggi **solo `featured` è un link**: le sezioni `latest`, `previews` e `digest`
  arrivano con la #21, e un'ancora che non porta da nessuna parte è un difetto di accessibilità. I
  numeri però sono già veri.
- Il segno **"this week"** sulle date non c'è: è esplicitamente della #21.

### Attenzione per chi riprende

- `SignificanceLabel` ha ora `labelHidden`: nello Spotlight ogni riga è `featured`, e ripetere la
  parola a ogni riga era rumore. Il glifo resta, la parola resta per chi usa uno screen reader.
- L'E2E della #16 cercava l'email sulla Dashboard segnaposto. **L'email non compare più in nessuna
  schermata**: il test ora prova l'accesso dai comandi da collegato (sign out e quota).
- `FixtureRelease` accetta `publishedAt`: senza, le fixture nascono a gennaio 2026 e **cadono fuori
  dalla finestra** dei 30 giorni, quindi nessuna prova della Dashboard avrebbe visto uno Spotlight.
- Nel database **locale** ci sono dati messi a mano per guardare la pagina: `significance_override`
  a `featured` su `react 19.3.0` e `vite 8.3.0`, due Sintesi `ready` finte (una con intervento, una
  sicura) e i follow delle tre Tecnologie. `pnpm db:reset` li toglie tutti.
- ⚠️ **Un E2E che fallisce nello smontaggio lascia la sua Tecnologia nel Catalogo locale**, e da lì
  compare su `/technologies` come `Fixture <hex>`, dove sembra un errore del Catalogo e non lo è.
  È successo qui. Si trovano con `slug=like.e2e-*` sulle `technologies` e si tolgono a mano (prima
  Sintesi, Note e Release, poi follow e Fonti, infine la Tecnologia), oppure con `pnpm db:reset`.

## Sessione del 2026-09-28 (3): il login in produzione atterrava sulla radice (nessun codice toccato)

Sintomo: dopo il consenso di GitHub si finiva su `https://release-tracker-drab.vercel.app/?code=...`
invece che su `/auth/callback`, quindi nessuno scambiava il codice e la sessione non nasceva.

- Causa: su Vercel `NEXT_PUBLIC_SITE_URL` valeva `https://release-tracker.vercel.app`, cioè il
  dominio **dell'altro progetto** (manca `-drab`). Supabase scarta un `redirectTo` fuori dalla allow
  list e ripiega sul *Site URL*, che invece era giusto: da qui l'host corretto con il percorso `/`.
- **La diagnosi in un colpo, senza passare da GitHub**: `curl -i -X POST -d "next=/dashboard"` su
  `/auth/sign-in` e leggere il `Location`, che porta il `redirect_to` per intero. Essendo
  `NEXT_PUBLIC_` inlinata nel build, quel valore dice che cosa sta girando davvero in produzione,
  non che cosa c'è scritto nel pannello.
- Rimedio: valore corretto su Vercel (Production) **e redeploy senza cache di build**. La sola
  variabile non cambia niente, ed è il passo che sembra superfluo e invece è tutto: subito dopo il
  salvataggio il `redirect_to` era ancora quello vecchio.
- Verificato il 2026-09-28: `redirect_to` su `release-tracker-drab`, `/auth/callback` senza `code`
  che risponde 307 verso `/login?error=denied`, e l'accesso vero arriva alla Dashboard.
- Regola per la prossima volta: **host giusto e percorso `/`** significa sempre ripiego sul *Site
  URL*, e le cause sono due, `redirectTo` fuori dalla allow list oppure `NEXT_PUBLIC_SITE_URL`
  sbagliata. Il `Location` dice quale delle due, prima di aprire qualsiasi pannello.

## Sessione del 2026-09-28 (2): un accesso locale sulla pagina di login (PR #50 in `main`)

Fuori dalle issue, deciso in sessione. In locale il provider GitHub è spento
(`config.toml`: `[auth.external.github] enabled = false`), quindi non c'era modo di essere uno
Sviluppatore in sviluppo. La prima idea, incollare una `fetch` nella console del browser, è stata
scartata dall'utente ed è giusto così: è la forma esatta del self-XSS contro cui Chrome avvisa, e
abituarsi a scrivere `allow pasting` è il danno vero.

- `POST /auth/dev-sign-in` accede con le credenziali lette **dall'ambiente del server**: il form
  manda solo `next`, quindi la password non raggiunge mai il browser né l'HTML.
- Esiste **solo se `DEV_LOGIN_EMAIL` e `DEV_LOGIN_PASSWORD` ci sono entrambe**, come
  `/api/test/session` con la sua. Vuote in `.env.example`, presenti solo in `.env.local`, **mai su
  Vercel**. Il pulsante sul `/login` compare nello stesso caso e dice di sé che in produzione non
  esiste.
- `pnpm dev:login` crea o reimposta il Developer locale (`dev@local.test`) e **si rifiuta di girare**
  se `NEXT_PUBLIC_SUPABASE_URL` non è `127.0.0.1` o `localhost`. Dopo un `pnpm db:reset` va rilanciato.
- Provato sul **build di produzione**, non solo a ragionamento: con le due variabili vuote il
  pulsante non c'è e la rotta risponde **404**; con le variabili, pulsante e 303. Un E2E in
  `auth.spec.ts` fa il giro vero e **si salta da solo** quando le variabili mancano, cioè in CI.
- **Verificato in produzione dopo il merge** (2026-09-28): niente pulsante sul `/login` e
  `POST /auth/dev-sign-in` **404**. Che il deploy contenga davvero la fetta si legge dall'HTML del
  `/login`, che porta la classe rifattorizzata della #50: senza quel controllo un 404 direbbe solo
  "rotta assente", non "guardia che funziona".
- L'utente ha creato le due variabili su Vercel nell'ambiente **Development** (il modulo di Vercel
  obbliga a sceglierne uno). Non è un problema: Development non entra nei deployment di Production
  né di Preview, serve solo a `vercel env pull` e `vercel dev`, e la verifica qui sopra lo conferma.
  **Su Preview sarebbero pericolose**, perché i preview puntano al database di produzione.

Se un domani servisse il vero giro OAuth in locale, la strada resta quella dell'handoff della #16:
una **seconda** OAuth App con callback `http://127.0.0.1:54321/auth/v1/callback`.

## Sessione del 2026-09-28 (1): #19 Follow sulla pagina pubblica della Tecnologia (chiusa, PR #49 in `main`)

301 unitari, 43 di integrazione, **45 E2E**, `typecheck`, `lint` e `build` puliti. Guardata con
Playwright a 1280px e a 390px contro `design/mocks/technology.html`. La pagina resta **SSG/ISR** nel
`build`: era il punto della fetta.

### Chi guarda si legge nel browser, e ora una volta sola

`auth/ui/use-session.ts` è il pezzo nuovo: restituisce `unknown | visitor | developer` con l'id dello
Sviluppatore. `AuthStatus` faceva già quella lettura dentro di sé e ora la prende da lì, così la
barra e il Follow non possono raccontare due cose diverse sulla stessa pagina.

`TechnologyFollow` (`plans/ui`) ha tre stati: **unknown** mostra un segnaposto alto 34px (un "Follow"
mostrato prima di sapere chi guarda sarebbe sbagliato per chi già segue); **Visitatore** un link a
`loginPath(pathname)` con l'aspetto identico al pulsante che troverà al ritorno; **Sviluppatore** il
`FollowsProvider` **senza cache precaricata**, quindi la query carica i follow nel browser, e dentro
lo stesso `FollowToggle` del picker. Limite, `aria-disabled`, nota e rollback vengono dal provider e
non sono riscritti qui.

Il Follow arriva a `TechnologyHeader` **come elemento, non come componente**: `catalog` non deve
sapere che cosa sia un Follow.

### Che cosa prova che nella cache non c'è niente di personale

Un E2E scarica l'HTML servito **da loggato** e verifica che non contenga né `Unfollow` né
`Following`. È il criterio dell'issue provato, non dedotto. In produzione il Follow del Visitatore
punta a `/login?next=%2Ftechnologies%2Fvite`, verificato il 2026-09-28 con un browser vero (nell'HTML
non si vede, ed è proprio il punto).

### Attenzione per chi riprende

- **Tailwind 4 ordina le utility per utility, non per come sono scritte.** `ml-auto max-[640px]:ml-0`
  lasciava il pulsante a destra anche a 390px: `ml-auto` vince ovunque compaia. La spinta ora si
  **aggiunge** da `sm` in su (`sm:ml-auto`) invece di essere annullata sotto. Vale per ogni coppia di
  utility della stessa famiglia, non solo per i margini.
- Ritirate: il comando compare **solo a chi già segue**, e dopo lo unfollow resta la frase
  `unfollowed · can't be followed again` finché non si ricarica. La regola è in `CONTEXT.md` sotto
  *Seguire*, valida per ogni schermata.
- La frase dell'errore di rifiuto viveva dentro `picker-row.tsx`: ora è `FollowRejectionNote`, una
  sola per le due pagine. `FollowToggleLimitNote` accetta un `technologyId`: su una pagina con un
  Toggle solo, la nota non compare se quella Tecnologia è già seguita.

## Sessione del 2026-09-27: #18 Limite Free e ritirate imposti dal database (chiusa, PR #48 in `main`)

301 unitari, 43 di integrazione, 40 E2E, `typecheck`, `lint` e `build` puliti (le pagine pubbliche
restano SSG). Guardata in Chrome, guidata da Playwright, a 1280px e a 390px contro
`technologies.html?state=full` e `?state=rejected`.

### Il rifiuto attraversa il confine come un codice, non come un messaggio

Il trigger `enforce_follow_rules` (migrazione `20260927062545_follow_limits.sql`) solleva due
SQLSTATE nostri, `FRTRD` (ritirata) e `FLIMT` (limite del Free): PostgREST li porta fino al browser,
quindi la riga sa quale regola ha infranto senza leggere il testo di un errore. `followRejectionFor`
in `plans/domain/follow-rejection.ts` (puro, 4 test) li traduce, e tutto il resto diventa `unknown`,
che ha comunque un rimedio ("try again") invece di fallire in silenzio.

Due dettagli del trigger:

- **Un advisory lock per Developer** prima del conteggio. Senza, due sessioni che inseriscono
  insieme leggono entrambe nove e passano entrambe: proprio lo scenario "aggiunto da un'altra
  sessione" che l'issue descrive.
- Il limite vale **solo per il Piano `free`** (ADR 0004). Il trigger è `security definer`, quindi
  vale anche per il service role: per avere una ritirata seguita si segue prima e si ritira dopo,
  che è anche l'unico modo in cui il caso nasce nella realtà.

### Il difetto che solo un rifiuto vero poteva far vedere

`useFollows` creava **una `useMutation` per ogni riga**: l'errore restava dentro il componente che
aveva premuto, e la riga che doveva mostrarlo non lo vedeva mai. La mutation è salita nel provider
(`FollowsScope`), che ora costruisce un solo oggetto `Follows` e lo passa per contesto. Il conteggio,
il blocco a 10 e il rifiuto vengono tutti da lì, quindi non possono più divergere tra componenti.

### Com'è fatto il resto

- `FollowToggle`: a 10 su 10 i Follow non premuti prendono `aria-disabled` e
  `aria-describedby="limit-note"`, restando **raggiungibili col focus** (un `disabled` vero lo
  impedirebbe). L'E2E deve usare `click({ force: true })`, perché Playwright si rifiuta di cliccare
  un `aria-disabled`: è la prova che il blocco c'è.
- `limit-note.tsx`: la nota compare con il blocco e sparisce con lui; dice il rimedio e **non nomina
  il Pro** (verificato da due asserzioni negli E2E).
- `PickerRow`: riga `error:` sotto la riga rifiutata, con l'id a cui punta l'`aria-describedby` del
  toggle; una ritirata, dopo l'unfollow, perde il pulsante e mostra `unfollowed · can't be followed
  again`, e alla visita successiva non compare più.
- Fixture nuove: `seedFillers` (Tecnologie nude per riempire il limite), `addFollows` (follow scritto
  da fuori, cioè l'altra sessione) e `retireTechnology`; in integrazione `seedCatalog` e `retire`.

### Attenzione per chi riprende

- Le fixture E2E lanciavano `supabase status` a **ogni** seed, e un giro è fallito con un errore
  della CLI sul suo file di telemetria (`telemetry.json.tmp`, due processi insieme). Il client è ora
  memoizzato per worker: un processo solo, e la suite è scesa da ~1,1 min a ~44 s.
- Avviso di hydration sull'`input` del filtro, visibile **solo dopo un `reload`**: è Chrome che
  ripristina il valore del campo. Viene dalla #17 e non è stato toccato qui.
- Il **10 è scritto in due posti**, `FREE_FOLLOW_LIMIT` e il trigger. Se un giorno si volesse far
  mordere il limite (l'ipotesi delle 5, da decidere prima del lancio) vanno cambiati insieme, e il
  trigger è quello che conta.
- **In produzione il trigger c'è già**: la migrazione non va applicata a mano, la manda il workflow
  `Deploy database` a ogni push su `main` (`supabase db push`, poi il sync del Catalogo). Verde il
  2026-09-27 subito dopo il merge, come la CI.
- Il database locale è stato **ricreato** (`pnpm db:reset` per applicare la migrazione) e poi
  riempito con `pnpm catalog:sync`: le 6 Sintesi vere caricate a mano nella #14 non ci sono più.

## Sessione del 2026-09-26 (2): #17 Pagina `/technologies` con sezioni, filtro e follow ottimistico

297 unitari, 41 di integrazione, 37 E2E, `typecheck`, `lint` e `build` puliti. Guardata in Chrome a
1280px e, con Playwright, a 390px (su Windows la finestra di Chrome non scende sotto ~500px).

### Scelta di fondo: le sezioni le calcola il server, il toggle vive nel client

La pagina sta dietro `requireDeveloper()`, quindi è dinamica comunque: non c'è nessuna rivalidazione
da proteggere come sulle pagine pubbliche. I follow si leggono sul **server** con
`createRequestClient()` e le tre sezioni arrivano già giuste nell'HTML, senza sfarfallio. È anche il
modo naturale di ottenere "una riga cambiata resta nella sua sezione fino alla visita successiva":
le sezioni sono lo scatto del momento della visita, il toggle cambia solo sé stesso e il conteggio.

Le scritture vanno **da browser a Supabase**, senza una rotta nostra: le policy `insert`/`delete` su
`follows` esistono dalla migrazione iniziale ed è per questo che sono state scritte. Così il rifiuto
che la #18 aggiungerà arriva dritto nella `useMutation`, dove il rollback è già pronto.

### Com'è fatto

- `plans/domain/picker.ts` (puro, 6 test): `splitPicker` (tre sezioni in ordine alfabetico; una
  **ritirata compare solo se seguita**, perché una ritirata che nessuno segue non è più seguibile),
  `matchesQuery` su nome e descrizione, `countMatches`. `FREE_FOLLOW_LIMIT` in `plans/domain`.
- `releases/domain/latest-stable.ts` (4 test): la Versione mostrata nella riga, Anteprime escluse
  come fa già `latest` di `groupByMajor`.
- `plans/server/`: `readFollows` (nessun `user_id` nella query: lo impone la RLS) e
  `listPickerTechnologies`, **una sola query** per tutto il picker. Sta in `plans` e non in `catalog`
  perché il picker dipende dai follow, e `catalog` non deve sapere che cosa siano.
- `plans/ui/`: `FollowsProvider` (TanStack Query, prima dipendenza nuova da mesi) con la cache già
  piena dal server, quindi **nessuna richiesta all'arrivo**; `FollowToggle` su misura con
  `aria-pressed`; `TechnologyPicker` client per filtro e conteggi dal vivo.
- E2E `tests/e2e/technologies.spec.ts`: seguire, smettere di seguire, filtro con e senza
  corrispondenze.

### Attenzione per chi riprende

- **I follow sopravvivono al test**: le fixture hanno ora `developer.clearFollows()` e la suite lo
  chiama in `beforeEach`. Senza, il secondo test parte da uno stato sporco e cerca un pulsante
  "Follow" che è già "Following". È così che è saltato fuori.
- La **#18** aggiunge solo il trigger del database, l'`aria-disabled` a 10 su 10 e la riga `error:`
  del rifiuto: l'interfaccia e il rollback ottimistico ci sono già.
- Due scostamenti dal mock, decisi con l'utente e da segnare nella **#23**: la **quota nella barra in
  alto** (`7 of 10 followed`) non c'è, perché compare identica in `dashboard.html` ed è
  dell'intestazione condivisa (la porterà la #20); e accanto a `retired` non c'è il mese, perché la
  data di ritiro non è nel database e `updated_at` mentirebbe.
- Il titolo di una sezione dice `following (3 of 7)` **solo mentre il filtro è attivo**, come il mock.
- **Limite Free a 10 confermato il 2026-09-26.** L'utente ha chiesto se non fossero troppe: sì, con
  10 il limite non morderà quasi mai (lo stack tipico è di 5-8 Tecnologie), ma una Tecnologia seguita
  in più non ci costa nulla, perché il Rilevamento gira su tutto il Catalogo e ogni Sintesi è pagata
  una volta per tutti. Pro si venderà sulle Notifiche, non sulla quantità. Se un giorno si volesse
  far mordere il limite, il numero da provare è 5, ma **prima del lancio**: dopo sarebbe una promessa
  ritirata.

## Sessione del 2026-09-26 (1): #16 Login con GitHub e rotte protette (chiusa, PR #44 in `main`)

287 unitari, 41 di integrazione, 34 E2E, `typecheck`, `lint` e `build` puliti. **Il vero giro OAuth
con GitHub non è mai stato eseguito**: manca l'OAuth App (vedi sotto).

### Chi protegge che cosa: il proxy redirige, la pagina autorizza

In Next 16 il middleware si chiama **Proxy** (`src/proxy.ts`): la doc dice esplicitamente che non è
un livello di autorizzazione. Quindi il proxy fa il redirect presto e rinfresca la sessione, ma
l'autorità è `requireDeveloper()` dentro la pagina. Il matcher sono i **due percorsi esatti**
(`/dashboard`, `/technologies`): con un `:path*` di troppo, `/technologies/vite` finirebbe dietro al
login, e quella è la pagina pubblica che porta il traffico.

### Lo stato di accesso nella barra si legge nel browser, non sul server

`AuthStatus` è un componente client. Una lettura lato server avrebbe reso dinamiche tutte le pagine
pubbliche e annullato la rivalidazione della #13; il `build` infatti continua a prerenderizzarle
(`/technologies/[slug]` resta SSG). Il costo è che lo stato compare un istante dopo il primo paint.

### Com'è fatto

- Modulo nuovo **`auth`** (aggiunto a `MODULES` in `eslint.config.mjs`): `domain/redirect.ts` con
  `safeRedirectPath` (puro, 5 test: rifiuta URL assoluti, `//host`, backslash e caratteri di
  controllo, così "niente open redirect" è una regola sola), `server/session.ts`, `ui/auth-status.tsx`.
- Rotte: `/login`, `POST /auth/sign-in` (scope **`read:user user:email`**, nessun accesso ai
  repository), `GET /auth/callback`, `POST /auth/sign-out`. I redirect interni usano l'origine della
  richiesta, non `NEXT_PUBLIC_SITE_URL`: solo il `redirectTo` passato a Supabase usa il sito, perché
  deve stare nella allow list.
- `@supabase/ssr`: `src/lib/supabase-request.ts` (per richiesta, legge i cookie) e
  `supabase-browser.ts` (sessione nel browser).
- **Il Piano `free` non è codice nuovo**: lo crea il trigger `on_auth_user_created` della #3. Niente
  migrazioni, solo `tests/integration/plans.test.ts` che lo dimostra.
- `/dashboard` e `/technologies` sono **segnaposto**, li riempiono la #17 e la #20.

### Attenzione per chi riprende

- **Il login funziona in produzione dal 2026-09-26**: OAuth App creata, provider attivo su Supabase,
  accesso vero completato fino alla Dashboard, con la prima riga in `plans` (Piano `free`). Il flag
  *Allow users without an email* resta spento (motivo in `docs/DECISIONI.md`). In
  `supabase/config.toml` il blocco `[auth.external.github]` resta `enabled = false`: in locale
  servirebbe una **seconda** OAuth App (callback `http://127.0.0.1:54321/auth/v1/callback`), e gli
  E2E non passano da GitHub.
- ⚠️ **La configurazione degli URL su Supabase è il punto dove si sbaglia**, e l'errore si legge
  dall'URL di atterraggio. Al primo tentativo l'accesso finiva su `http://localhost:3000/?code=...`:
  il percorso `/` invece di `/auth/callback` è la firma del ripiego sul *Site URL*, perché il nostro
  `redirectTo` non era nella allow list. In **Authentication -> URL Configuration** servono *Site
  URL* `https://release-tracker-drab.vercel.app` e, tra i *Redirect URLs*, `.../auth/callback` (vale
  la pena tenerci anche quello di `localhost:3000`). Se invece l'host fosse giusto e sbagliato solo
  il percorso, il colpevole sarebbe `NEXT_PUBLIC_SITE_URL` su Vercel: essendo `NEXT_PUBLIC_` finisce
  dentro il build, quindi cambiarla richiede un redeploy. **È successo davvero il 2026-09-28**:
  vedi la sessione (3).
- **`site_url` in `config.toml` è passato da `127.0.0.1:3000` a `localhost:3000`** (per Auth sono due
  origini diverse): in locale serve `pnpm db:stop && pnpm db:start` perché faccia effetto.
- **`E2E_AUTH_SECRET`**: nuova variabile, già in `.env.local` e generata in CI. Abilita
  `POST /api/test/session`, che fa accedere un Developer di prova con una password perché Playwright
  non può guidare il consenso di GitHub. **Non va messa su Vercel**: senza, la rotta risponde 404.
- Nel layout radice c'è ora anche **Vercel Analytics** (`@vercel/analytics`), fuori tema rispetto
  alla #16, portato nella stessa PR per risparmiare un deploy. Va **attivato a mano** nella tab
  *Analytics* del progetto su Vercel, altrimenti non raccoglie niente. Gratis sul piano Hobby.

## Sessione del 2026-09-24: #15 Cron giornaliero di Rilevamento e Sintesi

282 unitari, 39 di integrazione, 28 E2E, `typecheck`, `lint` e `build` puliti. Rilevamento provato
dal vivo in locale contro npm e GitHub veri (gratis, nessuna chiamata AI).

### La scoperta che ha cambiato il piano: Hobby dà 100 cron, non uno

Il vincolo vero è **una esecuzione al giorno per cron**, con partenza entro l'ora indicata (±59 min);
i cron per progetto sono 100. Quindi tre cron distinti invece di una rotta orchestratrice, come
voleva ADR 0003: Rilevamento **02:00**, invio **05:00**, raccolta **11:00** UTC. Tre
ore di distacco assorbono lo slittamento e, se l'ordine salta lo stesso, ogni fase riprende al giro
dopo. Una Sintesi è pronta in giornata invece che 24 ore dopo. ADR 0003 e `docs/DECISIONI.md`
corretti: dicevano "un cron al giorno".

### Il costo del Rilevamento era il problema serio, e si vede solo misurando

Un packument npm pesa da 1 a 5 MB **compressi** (vite 4,6 MB): con ~40 Tecnologie sarebbero ~80 MB
al giorno di transfer e centinaia di MB da parsare dentro i 300 s della funzione, quasi sempre per
scoprire che non è cambiato niente. La risposta è `If-None-Match` con il validatore salvato su
**`sources.etag`** (migrazione `20260923183606_detection_etag.sql`): npm risponde **304 con 0 byte**.

Misurato dal vivo sul build di produzione, 3 Tecnologie in locale:

| | 1º giro | 2º giro |
|---|---|---|
| esito | `detected: [vite 8.3.1]`, 2 pagine rivalidate | `unchanged: 3` |
| tempo | 3,4 s | **0,8 s** |

`listVersions(source, etag?)` restituisce ora `VersionListing | "unchanged"`: esplicito, così nessuno
dei due chiamanti può confondere "nessuna versione nuova" con "non ho guardato".

### Che cosa è "nuovo" per il Rilevamento (la trappola da non ripetere)

Una Versione è nuova se è pubblicata **dopo la più recente che già abbiamo**, non se è semplicemente
assente dal database. L'Importazione iniziale si ferma a 12 mesi: con la regola ingenua il primo
Rilevamento avrebbe registrato tutta la storia che l'Importazione aveva appena escluso. Per lo stesso
motivo una Tecnologia **senza Release non viene interrogata**: è dell'Importazione iniziale, e in più
un ETag salvato dal Rilevamento le farebbe rispondere "unchanged" lasciandola vuota per sempre.

### Com'è fatto

- `releases/domain/select-detected.ts` (puro, 10 test): il filtro qui sopra e la regola delle
  Anteprime — solo la **prima** Anteprima di una major mai vista riceve una Sintesi, dentro lo stesso
  giro e tra un giro e l'altro.
- `initialSummaryStatus` prende ora `skip` invece di `history`: le due fasi hanno motivi diversi per
  non riassumere, ma lo stato è lo stesso (`skipped`, "possibile ma scelto di non farla").
- `detection/server/`: `observe-versions.ts` (ETag) e `persist-releases.ts` (Release, Note, stato
  iniziale della Sintesi) estratti e **condivisi** con l'Importazione iniziale; `detect-releases.ts`
  è la fase giornaliera, con una sola query per i conosciuti di tutto il Catalogo e una Tecnologia
  che fallisce senza fermare le altre. `importTechnology` restituisce le versioni inserite, non più
  un conteggio (serviva alla rivalidazione, come diceva l'handoff della #13).
- La **Correzione di rilevanza** sopravvive per costruzione: `ignoreDuplicates` sull'upsert, e il
  Rilevamento non scrive mai `significance` di una Release che esiste già.
- Rotta `/api/jobs/detection`: stesso `isAuthorizedJob`, poi `revalidateReleasePages(detected)`.
- `GITHUB_TOKEN` opzionale in `ServerEnvSchema` (e in `src/env/server.ts`, che elenca le variabili
  una per una: aggiungerla solo allo schema non basta).

### Un difetto latente trovato da un E2E

Le Fonti della pagina della Tecnologia arrivavano da un embed PostgREST **senza ordine garantito**:
il primo `UPDATE` dell'ETag su una Fonte è bastato a invertirle e a far fallire `technology.spec.ts`.
`toStoredTechnology` ora le ordina per ruolo e tipo. `canonical()` di `planCatalogSync` scarta
`etag` oltre a `id`: non viene dal file del Catalogo e non significa che una Fonte sia cambiata.

### Attenzione per chi riprende

- ⚠️ **In `vercel.json` c'è solo il cron del Rilevamento**: i due delle Sintesi sono tolti di
  proposito perché fino al lancio non si spende niente (decisione dell'utente del 2026-09-24). Al
  lancio vanno rimessi, ed è la cosa più facile da dimenticare di tutto il progetto:

  ```json
  { "path": "/api/jobs/summaries/submit", "schedule": "0 5 * * *" },
  { "path": "/api/jobs/summaries/collect", "schedule": "0 11 * * *" }
  ```

  Intanto le Release si accumulano `pending` e al lancio il primo batch le smaltisce; attenzione che
  `claim_pending_summaries(max_count)` ha un tetto per esecuzione, quindi un arretrato grosso si
  svuota in più giorni. Il Rilevamento gira e non spende: il Catalogo si riempie di Release vere.
- **`CRON_SECRET` va messo su Vercel** (Production, *Sensitive*): se la variabile esiste, Vercel manda
  da sé `Authorization: Bearer <valore>`. Senza, i tre cron partono e ricevono 401. È il primo
  controllo dopo il deploy. In `.env.local` ce n'è uno solo per il locale, diverso da quello di
  produzione.
- Alla prima esecuzione vera in produzione nascono le **prime Sintesi vere**: spende. Avvisare.
- Nel database locale c'è ora anche `vite 8.3.1`, rilevata davvero, e gli ETag delle tre Fonti.
- Le Note non si ripescano mai per una Release che esiste già senza Note: fuori dalla #15, ma è la
  domanda che nascerà appena una Fonte pubblicherà le Note in ritardo.

## Sessione del 2026-09-23 (4): #14 Set di valutazione delle Sintesi (chiusa, PR #42 in `main`)

271 unitari, `typecheck`, `lint` puliti. Due giri veri del set, ~50 centesimi in tutto.

### Il report è il prodotto della fetta

`pnpm summary:eval` (`--dry` per elencare i casi senza spendere) manda i 14 casi in **un solo batch**,
confronta e lascia un report in `eval/summaries/reports/`. `v3` → `v4`:

| | v3 | v4 |
|---|---|---|
| casi valutati | 13/14 | 14/14 |
| Intervento richiesto corretto | 13/13 | 14/14 |
| breaking changes mancanti | 0 | 0 |
| citazioni inventate | 1 | 0 |
| citazioni verbatim | 66 su 72 | 77 su 81 |

Le 6 patch-sonda (Note che rimandano solo al changelog) dicono tutte "nessun intervento": il modello
**non inventa** quando non c'è niente da dire. È il risultato che la #14 doveva stabilire.

### Com'è fatto il set (dettagli in `eval/summaries/README.md`)

- Le Note sono **copiate** in `eval/summaries/notes/`, non lette dal database: il Catalogo cambia, il
  set no, altrimenti due report non sono confrontabili. 8 Tecnologie, di cui 5 fuori dal Catalogo,
  prese da GitHub con `gh api`.
- `set.json` porta il giudizio umano: `actionRequired` (`true`, `false` o **`"either"`** quando le
  Note descrivono un cambio di comportamento senza chiamarlo breaking), le breaking changes
  **obbligatorie** e quelle **tollerate** (legittime ma non richieste: citarne una non è un errore).
  `match` sono parole che devono comparire nella coppia cambiamento + migrazione, così una Sintesi
  che raggruppa più rimozioni in un punto solo conta lo stesso.
- Il confronto è puro e testato: `summaries/domain/evaluation.ts`, lo script è solo I/O.

### I due difetti che solo una chiamata vera poteva trovare

1. **Fine riga**. Le Note di GitHub hanno `CRLF`, il modello cita con `LF`, la pagina cerca nel testo
   normalizzato: una citazione su più righe perdeva il puntatore **in silenzio**, in produzione.
   `locateCitation` ora normalizza entrambi i lati.
2. **Una Sintesi buttata per un sesto punto chiave**: `output_config.format` vincola la forma, mai i
   conteggi. `parseSummaryOutput` tiene i primi 5 (arrivano in ordine di importanza) invece di
   perdere una Sintesi pagata, e il prompt dichiara il limite come regola dura → **`PROMPT_VERSION`
   a `v4`**. Entrambe le scelte sono in `docs/DECISIONI.md`.

### Attenzione per chi riprende

- Il set si allarga quando il report segnala una rivendicazione **inattesa ma vera**: è il set a
  essere incompleto, non la Sintesi. Fatto due volte (react 19.0.0 e 19.2.0); le ultime tre aggiunte
  non sono ancora passate per un giro, quindi il prossimo report dovrebbe avere `unexpected: 0`.
- Il titolo di `prisma 7.10.0` è di **esattamente 120 caratteri**: il limite regge, ma senza margine.
- `effort: "medium"` e `max_tokens: 8000` restano scelte a naso: il report dice che la qualità basta,
  quindi non le ho toccate. Sono le prime leve se un giro futuro peggiora.
- Nel database **locale** ci sono 6 Sintesi vere caricate a mano dal batch `v4` (react 19.0.0, 19.2.0,
  19.2.7, vite 8.2.2, 8.3.0-beta.0, typescript 6.0.3), per guardare le pagine: `pnpm db:reset` le
  toglie. In produzione non c'è ancora nessuna Sintesi.

## Sessione del 2026-09-23 (3): #14 Adattatore Anthropic reale (PR #41 in `main`)

260 unitari, 32 di integrazione, `typecheck`, `lint` e `build` puliti. Una Release vera riassunta
davvero (`react 19.2.0`, due giri, ~8 centesimi in tutto).

### Fatto: il punto 1 e il punto 2 del piano

- `@anthropic-ai/sdk`; `ANTHROPIC_API_KEY` nello schema Zod (opzionale come `CRON_SECRET`) e in
  `.env.example`. La chiave **non** la legge il modulo: `createSummaryBatches(apiKey)` la riceve dalla
  rotta del job. Importare `@/modules/summaries/server` non deve pretendere un ambiente completo —
  è la suite di integrazione ad averlo scoperto, i tipi no.
- `summaries/server/anthropic-batches.ts`: la Message Batches API dietro la porta `SummaryBatches`,
  `custom_id` = id della Release. Credito esaurito riconosciuto in **due** punti: `billing_error`/402
  all'invio → `CreditExhaustedError`, `billing_error` dentro i risultati → `credit_exhausted` (un
  batch accettato può restare senza credito a metà). Risposta troncata (`max_tokens`), rifiutata
  (`refusal`) o senza testo → `errored`: sarebbe JSON parziale.
- Il client dell'adattatore è un tipo **strutturale ristretto** a ciò che legge; che l'SDK vero ci
  stia dentro lo dimostra `createSummaryBatches`. Così i test rispondono con oggetti semplici e il
  progetto non ha bisogno di cast (vietati da eslint).
- `pnpm summary:try <slug> <version>`: una sola Release vera dal database locale, stampa la Sintesi
  e marca `[INVENTED QUOTE: …]` ogni citazione che non si trova verbatim. È il germe del comando di
  valutazione del punto 3.

### Che cosa ha insegnato la chiamata vera (il motivo per cui si fa)

Il primo giro col prompt `v2` è **fallito due volte insieme**, con un contenuto ottimo: JSON dentro
una cornice ```` ```json ```` e titolo di 133 caratteri (limite 120). Rimedi, dal più forte:

1. **`output_config.format`** dallo schema Zod (`zodOutputFormat(SummaryContentSchema)`): il modello
   non può più rispondere in prosa o incorniciato. Attenzione: lunghezze e conteggi (`max(120)`,
   `min(3).max(5)`) **non** sono vincolati dalla decodifica, restano descrizioni — `parseSummaryOutput`
   resta l'ultima parola.
2. **Prompt `v3`**: il limite del titolo è dichiarato come regola dura ("conta i caratteri").
3. `parseSummaryOutput` toglie comunque una cornice markdown: un difetto così banale non vale una
   Sintesi già pagata.

Secondo giro: titolo 101 caratteri, 5 punti chiave, 3 breaking change, **tutte le citazioni trovate
verbatim**, nessuna inventata. Il prompt `v3` regge fuori dai test.

### Scelte dell'adattatore da rimettere in discussione col set di valutazione

`effort: "medium"` e `max_tokens: 8000` (il pensiero di Opus 5 conta lì dentro) sono scelte a naso,
non misurate: sono le prime due leve da provare se il report del punto 3 dirà che la qualità non basta.

## Sessione del 2026-09-23 (2): #13 Rivalidazione delle pagine pubbliche (chiusa, PR #40 in `main`)

247 unitari, 32 di integrazione, `typecheck`, `lint` e `build` puliti.

### Scelta di fondo: la raccolta dice *che cosa* è cambiato, la rotta *che cosa* rivalidare

`revalidatePath` gira solo in un Route Handler o in una Server Function, e `summaries` non deve
dipendere né da Next né da `releases` (la dipendenza tra i due moduli va già nell'altro verso).
Quindi `collectSummaryBatches` riporta i riferimenti e la rotta del job li rivalida; la mappatura
riferimenti → percorsi resta pura e la riuserà il cron della #15.

### Com'è fatto

- `releases/domain/revalidation.ts`: `ReleaseRef = { slug, version }` e `publicPagesFor(refs)` → i
  percorsi toccati, deduplicati: la pagina della Release (`releasePath`, quindi versione codificata)
  **e** quella della Tecnologia, i cui conteggi del Cammino di upgrade leggono le Sintesi.
- `releases/server/revalidate-pages.ts`: `revalidateReleasePages(refs)` chiama `revalidatePath` su
  ciascun percorso e restituisce l'elenco, per il report del job. Test unitario con `next/cache`
  mockato (`vi.hoisted` + `vi.mock`): il progetto `unit` non ha l'alias di `server-only`, perciò il
  file **non** importa `server-only` — quell'import sta solo negli indici dei moduli.
- `CollectReport` ha ora `changed: { slug, version }[]`: ogni Release la cui Sintesi si è *conclusa*,
  in qualunque modo — `ready`, `failed` o rimessa in coda per credito esaurito: in tutti e tre i casi
  la pagina si legge diversamente. Slug e versione arrivano dalla stessa query con un embed
  PostgREST, `releases!inner(version, technologies!inner(slug))`: nessuna query in più.
- La rotta `/api/jobs/summaries/collect` scarta `changed` e riporta `revalidated: [percorsi]`.

### Attenzione per chi riprende

- **Il Rilevamento non rivalida ancora.** Oggi gira solo in `scripts/sync-catalog.mts`, fuori da
  Next (`revalidatePath` non esiste lì) e al deploy, dove la cache si azzera da sé. Quando la #15
  porterà il Rilevamento in una rotta, le basta chiamare `revalidateReleasePages`; `importTechnology`
  restituisce oggi un conteggio, servirà fargli restituire le versioni inserite.
- Il collegamento non è mai stato provato dal vivo: `createSummaryBatches()` è `null` e la rotta
  risponde **503** finché la #14 non collega Anthropic. Verificato da tipi e test, non da una
  chiamata reale.
- Nessuna rivalidazione nella fase di invio (`pending` → `processing`): cambia poco sulla pagina.

## Sessione del 2026-09-23 (1): #12 Puntatori alle righe (chiusa, PR #39 in `main`)

241 unitari, 30 di integrazione, 25 E2E, `typecheck`, `lint` e `build` puliti. Verificato in Chrome
contro `design/mocks/release.html` a 1280px e a 390px.

### Scelta di fondo: la Sintesi cita, noi calcoliamo

I numeri di riga **non** si chiedono al modello, che li conta male e sbaglia in modo invisibile. La
Sintesi restituisce una citazione **verbatim** delle Note e le righe si derivano cercandola nel testo
salvato. Una citazione che non si trova esatta è inventata: niente puntatore. Così il criterio
"riferimento fuori intervallo" e la regola "Nessuna invenzione" sono la stessa regola, e l'offset del
caret arriva gratis.

### Com'è fatto

- `summaries/domain/citations.ts`: `locateCitation(notes, quote)` → `{ fromLine, toLine, column,
  length }` o `null`, e `citationSpans(lines, citation)` → lo stratto `[start, end)` per ogni riga
  citata (una citazione su più righe porta un a capo per interruzione, contato lì). Righe 1-based come
  i numeri mostrati, `column` e gli offset 0-based.
- `SummaryContentSchema`: `quote` opzionale su punti chiave e breaking change; **i punti chiave sono
  `{ text, quote? }`**, non più stringhe. `PROMPT_VERSION` a **`v2`** (il prompt chiede la citazione e
  vieta di accorciarla). Nessuna migrazione: in produzione non esiste nessuna Sintesi (#14).
- `summaries/ui/citation-context.tsx`: `CitationProvider` client con `{ citation, severity, nonce }`.
  Il **nonce** serve a ridisegnare il caret quando si riclicca lo stesso puntatore. Il provider sta
  nella pagina della Release perché i puntatori (modulo `summaries`) e le Note (modulo `releases`)
  sono in moduli diversi; `releases` importava già da `@/modules/summaries`, la direzione è quella.
- `cite-pointer.tsx`: `release-notes:8` o `8-9`, `href="#L<n>"` vero (un indirizzo copiato funziona),
  `preventDefault` + `history.replaceState` per l'ancora nell'URL. `breaking-change-item.tsx` estratto
  da `summary-view.tsx` con le righe `-->`, quote e caret; `glyph.tsx` condiviso.
- `ReleaseNotesSource` è ora **client** e prende `lines: string[]`, non più `body`: la pagina chiama
  `noteLines` una volta sola, così le citazioni si cercano esattamente nel testo che viene mostrato.
  Apre il `<details>`, centra la riga e le sposta il focus (`tabIndex={-1}` su ogni riga); stesso
  effetto all'arrivo con un `#L<n>` nell'hash.
- `.cited-span` e `@keyframes caret` in `globals.css` (l'unico momento di movimento, `animation: none`
  sotto `prefers-reduced-motion`). Sotto i 640px la riga dei caret sparisce e lo stratto citato prende
  una sottolineatura coral dentro la quote row, come in `DESIGN.md`.
- Gutter con `font-variant-ligatures: none`, altrimenti Fragment Mono rende `-->` come `⟶`.
- E2E `tests/e2e/citations.spec.ts`: clic, tastiera, citazione inventata senza puntatore, ancora
  diretta. Le fixture E2E sono state adeguate alla nuova forma dei punti chiave.

### Attenzione per chi riprende

La #12 ha cambiato la forma dei punti chiave (`string` → `{ text, quote? }`) e portato
`PROMPT_VERSION` a `v2`: le fixture di ogni suite vanno tenute allineate allo schema.

## Sessione del 2026-09-22 (2): #11 Credito API esaurito

- Un credito esaurito non è un fallimento: le Release tornano `pending` e la prima esecuzione dopo la
  ricarica le riprende. Prima finivano a `failed`, che è definitivo.
- Il caso attraversa la porta **tipizzato**, mai come testo di un errore: `CreditExhaustedError` da
  `submit`, variante `credit_exhausted` di `SummaryResult` da `collect`. Riconoscere la risposta vera di
  Anthropic è dell'adattatore della #14. `SubmitReport` e `CollectReport` hanno ora `pending: string[]`.
- Il job risponde 200 col report, non solleva: un cron che strilla ogni giorno finché non ricarichi è rumore.
  `errored`, `expired` e `canceled` restano `failed` senza rinvio.
- **Scopo ridotto rispetto al testo originale della #11**: tolta l'issue GitHub di avviso (un modulo, un
  token e due variabili per duplicare le email di credito basso di Anthropic). Se servirà un canale di
  avviso, va deciso una volta per tutti gli avvisi insieme alle Notifiche.
- Niente migrazioni, niente variabili d'ambiente nuove, nessun contatore dei tentativi (non c'è riprova
  con backoff nell'MVP).

## Sessione del 2026-09-22 (1): #10 Pipeline delle Sintesi con un fake della Batch API

- Dominio `summaries`: `SummaryContentSchema` (titolo ≤ 120, 3–5 punti chiave, breaking changes con migrazione),
  `parseSummaryOutput`, `prepareSummaryRequest` (prompt `v1`, modello `claude-opus-5`, soglia di 80.000 caratteri:
  oltre → `failed`, mai troncare) e la porta `SummaryBatches` (`submit` → batch id, `collect` → `null` se in corso).
- Regola nuova in `CONTEXT.md`: **Intervento richiesto = sì esattamente con almeno una breaking change**, e ogni
  breaking change dice come migrare; un output che rompe il legame è `failed`.
- Database: `summaries.batch_id` e `claim_pending_summaries(max_count)` (unico `UPDATE … RETURNING` con
  `skip locked`, solo service role). Server: `submitPendingSummaries` (se l'invio fallisce si torna a `pending`)
  e `collectSummaryBatches` (validazione, `ready`/`failed` col motivo, modello e versione del prompt salvati).
- Endpoint `GET /api/jobs/summaries/{submit,collect}` con `Authorization: Bearer <CRON_SECRET>` (`CRON_SECRET`
  opzionale nello schema env, vuoto = assente). `createSummaryBatches()` restituisce `null`: **503 finché la #14**
  non collega Anthropic. Il fake della Batch API sta in `tests/integration/fake-summary-batches.ts`.
- Pagina della Release: `SummaryView` (verdetto con conteggio, titolo, punti chiave `note:`, `breaking[n]:` con
  `help:`, backtick resi come `<code>`); una Sintesi `ready` con contenuto non valido si legge come `failed`.
- Scelta confermata nella #11: una richiesta del batch in errore o scaduta va subito a `failed`, senza rinvio.

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
   `.env.example`, poi l'adattatore vero dietro `createSummaryBatches()` — stesso contratto del fake
   in `tests/integration/fake-summary-batches.ts`. **Invocare prima la skill `claude-api`**: modello
   `claude-opus-5`, e le forme dell'API sono cambiate (niente `budget_tokens`, niente prefill).
2. **Prova su una sola Release vera**, qualche centesimo, per vedere se il prompt `v2` regge fuori
   dai test.
3. **Set di valutazione e report**, possibilmente in una sessione nuova.

### Le invenzioni si verificano da sole

Il prompt `v2` chiede già una citazione **verbatim** delle Note per ogni breaking change e
`locateCitation` (#12) dice se quella citazione esiste nel testo: il criterio "nessuna breaking
change assente dalle Note" è automatico. All'utente resta il giudizio che nessuna macchina dà —
l'**Intervento richiesto** atteso e le breaking changes **mancanti**, marcate una volta nel set
atteso e poi confrontate a ogni versione del prompt.

### Soldi

Ogni lancio spende davvero: ~15 Release da qualche migliaio di token, Opus 5 a $5/1M in ingresso,
dimezzato dalla Batch API — pochi centesimi a giro. **Nessun lancio senza avvisare prima l'utente.**

## Il primo Rilevamento in produzione è girato (verificato il 2026-09-26)

La pagina pubblica https://release-tracker-drab.vercel.app/technologies/vite arriva a **8.3.1**, la
Release che il cron delle 02:00 UTC doveva trovare: `CRON_SECRET` è arrivato alla funzione e la #15
è chiusa davvero. Il termometro è pubblico, non serve il segreto per ricontrollarlo.

Non è ancora stato guardato l'andamento dei giri successivi: nella sezione *Cron Jobs* del progetto
su Vercel il report dovrebbe dire `unchanged` quasi uguale ad `asked`, che è l'ETag che lavora. Se un
giorno tornasse un 401, `CRON_SECRET` non sta arrivando alla funzione (ambiente sbagliato o redeploy
mancato); un 500 all'avvio significa di solito un segreto sotto i 32 caratteri, che fa fallire la
validazione dell'ambiente e non solo i job.

Fino al lancio è pianificato **solo** il cron del Rilevamento, che è gratis: le Sintesi non girano
(vedi l'avviso nella sessione della #15).

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

## Com'era il 2026-09-28: stato superato, tenuto per le note che valgono ancora

⚠️ **Questo non è il punto di partenza.** Quello sta in "Da dove ripartire", in cima. Fino al
2026-09-30 questa sezione si chiamava "Da dove ripartire: la #25 e la #36" e una sessione nuova poteva
leggerla come l'indicazione buona. Le code ancora vive che c'erano dentro sono state portate in cima,
in "Code da non perdere".

1. La Dashboard è finita: #20 e #21 sono entrambe fatte. **Superato**: l'ordine di lavoro vero è in
   cima. (La #25 e la #36, che qui risultavano aperte, sono **fatte** il 2026-10-02.)
2. Il filtro di `/technologies` fuori dall'URL: diventato la **#72**, **fatta** il 2026-10-02.
3. **Web Analytics**: **attivato** dall'utente il 2026-10-03. I **cinque scostamenti dal mock** sono
   invece **fatti**: la #23 li ha risolti tutti e cinque (PR #61, sessione del 2026-09-29 (3)).
   Per entrare in locale da Sviluppatore: `pnpm dev:login`, poi "Continue as local developer"
   sul `/login`.
4. Su Vercel `NEXT_PUBLIC_SITE_URL` esiste ora in **Production e in Preview** (senza, il build di
   preview fallisce: lo schema Zod rifiuta una configurazione a metà). I preview puntano al
   database di produzione, quindi restano il posto dove non mettere mai credenziali di comodo.
5. Piano editoriale: la **tappa D** è stata pubblicata il 2026-09-28 (thread Bluesky di 10 post).
   Il resto è **portato in cima**: la bozza dev.to e l'articolo della tappa C sono ancora da fare.
6. ⚠️ Le **due Sintesi finte** che la #20 aveva messo nel database locale sono state **cancellate**
   il 2026-09-28: erano contenuto inventato attaccato a Release vere, e stavano per finire in uno
   screenshot pubblico. Se servono verdetti pieni in locale, si caricano a mano output veri dai
   report in `eval/summaries/reports/`, non testi scritti al momento.

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
