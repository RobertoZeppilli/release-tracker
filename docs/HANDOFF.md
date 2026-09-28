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
- Fatte: **#2–#19** (la #19 unita con la PR #49, CI verde e viva in produzione). Sbloccate: **#20**,
  più #25 e #36.
  Attenzione: il numero dell'issue è sfalsato di uno rispetto al numero della fetta nel titolo
  (issue #12 = fetta "11."). Vedi i "Blocked by" (`gh issue view N`).
- Credito API esaurito: **nessun avviso nostro**, se ne occupa la Console di Anthropic (decisione
  rivista nella #11, in `docs/DECISIONI.md` e ADR 0007).
- Differenze note tra mock da uniformare: raccolte nella #23. **Da aggiungerci** (2026-09-28): sotto
  i 640px il mock mette il Follow della pagina della Tecnologia su una riga tutta sua, da noi finisce
  in fondo alla riga delle Fonti, perché il `latest` è un `<p>` a parte invece di stare dentro
  `.tech-facts`. Non è ancora scritto nella issue.
- Produzione: **https://release-tracker-drab.vercel.app** (`release-tracker.vercel.app` è di un altro
  progetto). Gli URL dei singoli deployment sono protetti da Vercel (302).

## Sessione del 2026-09-28 (4): #20 Dashboard, prima parte (branch `dashboard-first-part`)

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

## Da dove ripartire: la #21, Dashboard (seconda parte)

1. `gh issue view 21`: Latest, Previews, Weekly Digest per settimana ISO in UTC, "this week" e lo
   stato di filtri e sezioni aperte nell'URL. Il terreno è pronto: `readDashboard` porta già **tutte**
   le Release, e i conteggi di `notable`, `previews` e `digest` sono già calcolati e mostrati, gli
   mancano solo le sezioni a cui puntare (vedi gli scostamenti qui sopra).
2. Poi **#25** e **#36**. HITL: #22 Catalogo ~40 Tecnologie, #26 landing page (serve il nome del
   prodotto).
3. In sospeso: **Web Analytics da attivare** nella tab *Analytics* del progetto su Vercel; la
   differenza dal mock della #19 da scrivere nella **#23**. Per entrare in locale da Sviluppatore:
   `pnpm dev:login`, poi "Continue as local developer" sul `/login`.

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
