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

- PRD pubblicato (#1). Fette pubblicate come issue **#2–#26**, con Parent #1 e "Blocked by" reali.
  - Label `ready-for-agent` = AFK; `ready-for-human` = HITL: #22 Catalogo ~40 Tecnologie,
    #26 landing page (serve il nome del prodotto).
- Fatte: #2–#14. Sbloccate: **#15** (cron giornaliero), #16 (login, sblocca #17 con la #9), #25, #36.
  Attenzione: il numero dell'issue è sfalsato di uno rispetto al numero della fetta nel titolo
  (issue #12 = fetta "11."). Vedi i "Blocked by" (`gh issue view N`).
- Credito API esaurito: **nessun avviso nostro**, se ne occupa la Console di Anthropic (decisione
  rivista nella #11, in `docs/DECISIONI.md` e ADR 0007).
- Differenze note tra mock da uniformare: raccolte nella #23.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

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
- **Dev server**: l'utente tiene aperto `pnpm dev` su http://localhost:3000. Usarlo per i check in Chrome e per
  gli E2E (Playwright lo riusa); non avviare un altro `pnpm dev`, fallirebbe.
  `.env.local` contiene i valori del Supabase locale; `pnpm catalog:sync` in locale dopo `set -a; . ./.env.local`.
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

## Da dove ripartire: la #15, cron giornaliero

È la prossima, concordata con l'utente, ed è la continuazione naturale della #13: porta Rilevamento e
Sintesi dentro un cron di Vercel. `gh issue view 15` per i criteri. Tre cose già note che la
riguardano, sparse nelle sessioni qui sopra:

- **Il Rilevamento non rivalida ancora** (#13): gira solo in `scripts/sync-catalog.mts`, fuori da
  Next. Quando passa in una rotta le basta chiamare `revalidateReleasePages`, ma `importTechnology`
  oggi restituisce un conteggio: servirà fargli restituire le versioni inserite.
- Le rotte dei job esistono già e sono protette da `CRON_SECRET`
  (`/api/jobs/summaries/{submit,collect}`); il piano Hobby dà **un cron al giorno**, quindi
  Rilevamento e Sintesi vanno pianificati in sequenza (ADR 0003, `docs/DECISIONI.md`).
- Alla prima esecuzione vera in produzione nasceranno le **prime Sintesi vere**: oggi in produzione
  non ce n'è nessuna. Spende davvero, quindi avvisare l'utente prima.

Poi: **#16** (login, sblocca #17 con la #9), **#25**, **#36**, tutte `ready-for-agent`.
HITL: #22 Catalogo, #26 landing page (la #4 deploy è chiusa).

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
