# Ambiente, preferenze e skill

Spostato qui da `docs/HANDOFF.md` il 2026-10-10, parola per parola. Sono riferimenti permanenti,
non stato: si aprono quando servono.

## Ambiente

- Docker Desktop (WSL2) installato per utente in `%LOCALAPPDATA%\Programs\DockerDesktop`, RAM di WSL
  limitata a 6 GB in `~/.wslconfig`. **`docker` non è nel PATH della shell di Claude**: prima di E2E, integrazione
  o `supabase status` eseguire `export PATH="$PATH:$LOCALAPPDATA/Programs/DockerDesktop/resources/bin"`
  (senza, le fixture E2E falliscono con "docker: command not found").
- ⚠️ **Docker Desktop può morire lasciando le porte di Supabase occupate da un proxy zombie**
  (visto il 2026-10-21): la 54321 e la 54322 rispondono, i container non ci sono, e l'E2E va in
  crollo con `page.goto: net::ERR_ABORTED` sul primo test di ognuno dei 28 file. Si riconosce da
  `docker ps` che risponde "Docker Desktop is unable to start" e dalla distribuzione WSL
  `docker-desktop` in `Stopped`, mentre restano tre `Docker Desktop.exe` da pochi MB. Un `taskkill`
  a metà non basta: serve **Quit Docker Desktop** dal tray, e poi riaprirlo.
- **Dev server: uno solo, sulla 3000.** L'utente tiene aperto `pnpm dev` lì; usarlo per i check in Chrome e
  per gli E2E (Playwright lo riusa) e non avviarne un altro, fallirebbe ("Another next dev server is already
  running"). **Prima di cominciare, due controlli da un secondo**: `curl -s localhost:3000 | head` dice se
  risponde ed è questo progetto (il 2026-09-24 sulla 3000 c'era un altro progetto, rispondeva Vite), e
  `netstat -ano | grep -E ':300[0-9].*LISTENING'` scopre i server residui. Il 2026-09-26 ce n'erano cinque:
  un `pnpm dev` rotto sulla 3001, un `next start` del 24 settembre sulla 3002 che serviva un build vecchio
  (rispondeva 404 alle rotte nuove e faceva sembrare rotto il codice), e tre di un altro progetto sulle
  3005-3007. Sono stati chiusi tutti: regola dell'utente, sempre lo stesso server.
  `.env.local` contiene i valori del Supabase locale; `pnpm catalog:sync` in locale dopo `set -a; . ./.env.local`.
- ⚠️ **Gli e2e vogliono una porta loro: `E2E_PORT=3100 pnpm test:e2e`** (la variabile esiste in
  `playwright.config.ts` dalla PR #223, e senza di lei il default resta 3000). `reuseExistingServer`
  si fida di qualunque cosa risponda sulla porta e **non sa distinguere questa app da un'altra**: il
  2026-11-10 il dev server di `ai-intake-agent` si è ripreso la 3000 a run avviato, e la suite ha
  interrogato quell'altra app per nove minuti, 17 test passati e 66 mai partiti, senza un messaggio
  che lo dicesse. Le asserzioni sui canonical e sul sitemap continuano a dire `localhost:3000` anche
  dalla 3100, perché leggono `NEXT_PUBLIC_SITE_URL` da `.env.local` e non la porta vera.
  ⚠️ A server freddo 6 test cadono sulla prima compilazione delle rotte in dev (`toHaveURL` scade in
  5 secondi, e `/api/jobs/detection` risponde 500 invece di 401) e passano tutti a caldo: in CI non
  succede, perché là gira `pnpm start` sul build di produzione.
- **Heredoc della shell di Claude: le sequenze con la barra rovesciata vengono mangiate** anche con
  `<<'EOF'`. Una classe di caratteri come quella dei controlli nelle regex arriva nel file con una barra
  in meno e il test fallisce con un errore incomprensibile. Per file con barre rovesciate usare gli
  strumenti di modifica, non l'heredoc.
- ⚠️ **Due shell, due sintassi.** Bash e PowerShell sono due strumenti distinti: la here-string di
  PowerShell (`@'...'@`) dentro Bash non è una citazione, e il 2026-10-06 ha messo `@` come titolo di
  un commit. Per un messaggio su più righe: heredoc in Bash (`-F - <<'EOF'`), here-string in
  PowerShell. E **guardare il messaggio prima del push** (`git log -1 --format=%B`): lì si rimedia con
  un `--amend`, dopo no.
- ⚠️ **Il dev server può servire la pagina in Arial, e sembra un errore di font-size.** Il 2026-10-13
  la Dashboard non somigliava al mock: Fragment Mono e Hanken Grotesk non erano in pagina, c'era solo
  il loro fallback metrico (`local(Arial)`), quindi le dimensioni erano giuste e il carattere no. Il CSS
  servito conteneva i soli `@font-face` di fallback, mentre il chunk della build e la produzione avevano
  quelli veri: `next/font/google` non era riuscito a scaricare i font e Turbopack aveva messo in cache
  quel risultato. **La verifica**: `curl -s localhost:3000/login | grep -o '/_next/static/[^"\]*\.css'`
  e poi `grep "font-face" -A 3` sul foglio, oppure in pagina `Array.from(document.fonts)`, che elencava
  solo `Fragment Mono Fallback` e `Hanken Grotesk Fallback`. **Il rimedio**: fermare il dev server,
  `rm -rf .next`, riavviare. Prima di giudicare la tipografia di una schermata, controllare questo.
- Python su Windows: scrivere i file con `encoding='utf-8'` (il default cp1252 ha troncato un file).
- `pnpm-workspace.yaml`: `esbuild: false` in `allowBuilds` (il binario arriva dalle dipendenze opzionali).

## ⚠️ Una `NEXT_PUBLIC_*` cambia solo con un deploy, e il 2026-11-11 l'ha dimostrato

Spostato qui da `../HANDOFF.md` parola per parola, perché è ambiente e non stato.

⚠️ **`NEXT_PUBLIC_SITE_URL` è una variabile `NEXT_PUBLIC_*`, quindi finisce nel bundle a build
time.** L'utente ha cambiato il dominio in `verdict-tracker.vercel.app` e per un po' la produzione ha
servito pagine nuove che dichiaravano `canonical` sul dominio vecchio, con 3.678 indirizzi del
sitemap e la riga `Sitemap:` di `robots.txt` a dire il nome di prima. Cambiare la variabile non
sposta niente: serve un **deploy**. L'ha prodotto il merge della #224, e adesso canonical, robots e
sitemap dicono tutti e tre il dominio nuovo, misurato con `curl`. Il dominio vecchio redirige col
**308**, permanente, e conserva il percorso: `/technologies/react` arriva alla sua pagina.

**Come si verifica**, in tre `curl` che non costano niente:
`curl -s <sito>/ | grep -o '<link rel="canonical" href="[^"]*"'`,
`curl -s <sito>/robots.txt | grep -i '^sitemap'` e
`curl -s <sito>/sitemap.xml | grep -c '<dominio vecchio>'`. Il terzo è quello che conta: contava
3.678 indirizzi col nome di prima e zero col nome nuovo, e dopo il deploy esattamente il contrario.

## Come si guardano e si misurano i mock

Spostato qui da `docs/HANDOFF.md` il 2026-10-14, parola per parola, per tenere lo stato
vivo sotto le 100 righe.

⚠️ **Il `file://` è rifiutato dall'estensione Chrome**: per farlo vedere all'utente si serve la
cartella `design/mocks` su una porta sua (un server statico di venti righe in `node`, la 4321 in
questa sessione, **non** il dev server della 3000). Per misurare invece si usa Playwright sul
`file://`, come faceva già settembre: `page.setViewportSize` per ogni larghezza, il selettore
`#state-select` per ogni stato. ⚠️ **`newPage({ viewportSize })` non esiste** e viene ignorato in
silenzio: la chiave è `viewport`, altrimenti si misura tutto a 1280 credendo di essere a 390. Gli
script sono rimasti nello scratchpad della sessione, cioè sono da riscrivere.

## Lo squash di una PR mentre un ramo e' aperto

Spostato qui da `docs/HANDOFF.md` il 2026-10-14, parola per parola, per tenere lo stato vivo sotto
le 100 righe.

⚠️ **La #149 ha trovato conflitti perché `main` ha preso lo squash della #148** (`207b4b9`), lo
stesso contenuto che sul ramo era già un commit suo: l'handoff arrivava due volte. Risolti con un
**merge di `origin/main` dentro il ramo**, tenendo lo stato del ramo, perché quello di `main` era lo
stato di prima, già sceso parola per parola in `docs/handoff/2026-10.md`. Niente rebase e niente
force push su un ramo già pushato.

### Come si prova che un ramo e' entrato, e i 45 cancellati

Spostato qui da `docs/HANDOFF.md` il 2026-10-28, parola per parola, per la stessa ragione.

Cancellati tutti i rami locali e remoti tranne `main`. ⚠️ **Con lo squash merge
`git branch --merged` e un rimerge di prova non dicono niente**: conflittano sempre, e il conflitto
non e' lavoro unico. La prova e' la PR (`gh pr list --state all --json headRefName,mergedAt`), piu' il
confronto tra tip del ramo e data del merge **in secondi**: confrontare `+02:00` con `Z` come stringhe
da falsi allarmi. L'unico commit mai entrato in `main` era una nota di diario di tredici giorni prima.

## ⚠️ Una e2e che nomina una fixture nel sitemap cade solo in CI

Le due prove nuove del sitemap passavano in locale e cadevano in CI, **e non per il codice**: in
locale girano contro `pnpm dev`, che il sitemap lo ricalcola; in CI contro `pnpm start`, dove il
sitemap e' **quello che la build ha prerenderizzato**, e una Tecnologia seminata nel `beforeAll` non
ci sta dentro. Lo dicevano gia' `tests/integration/sitemap.test.ts` e la riga di `INDICE.md` del
ventesimo giro, e sono state trovate dopo. Ora le due prove verificano la **forma** degli indirizzi
sul Catalogo che CI sincronizza: un percorso Release ha **due** segmenti sotto `/technologies`, e di
quelli non ne esiste nessuno sotto `/it`, `/fr`, `/es`, `/de`.

## ⚠️ L'ordine in cui si girano le suite in locale, che la CI tiene separando i lavori

Spostato qui da `../HANDOFF.md` dal trentottesimo giro, 2026-11-12.

- **Gli e2e non si leggono senza il Catalogo**: `pnpm catalog:sync` prima di `pnpm build`, con
  `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SECRET_KEY` esportati **a mano**, perché quello script non
  legge `.env.local`. Lo stesso vale per `pnpm build:static`. In locale gli e2e si lanciano con
  `E2E_PORT=3100 pnpm test:e2e`.
- ⚠️ **Ma il Catalogo sincronizzato fa cadere l'`integration`**: `paged-reads` conta 1201 invece di
  1200, perché conta tutto il database e non solo le righe che si è seminato. Non è una
  regressione, è l'ordine sbagliato. Quello che funziona è quello della CI, due lavori separati:
  `pnpm db:reset` e `pnpm test:integration` **prima**, `pnpm catalog:sync` e `pnpm build` e
  `pnpm test:e2e` **dopo**.
- ⚠️ **Dopo un `catalog:sync` va buttato `.next`.** La sitemap resta quella presa quando il Catalogo
  era vuoto — la cache ISR sopravvive a una build nuova — e tre test se ne accorgono:
  `seo.spec.ts:79` e le due di `locales.spec.ts` sulla sitemap. Con `rm -rf .next` passano.

## ⚠️ Due e2e del menu sono flaky: il clic arriva prima dell'idratazione

Visto dal trentottesimo giro, 2026-11-12, su una corsa completa sul runner.

`navigation.spec.ts:137` ("at 390px the sections are in the menu") e `:192` ("the menu hands the
keyboard its first line") non trovano `#menu-panel` dopo il clic sul bottone Menu, e cadono con
`element(s) not found` dopo 5 secondi. **Passano al secondo tentativo**, quindi in CI il retry le
nasconde e la check resta verde. Il bottone e' reso dal server ma il suo `onClick` esiste solo dopo
l'idratazione: un clic che arriva prima non fa scattare `open`, e Playwright aspetta un pannello che
non verra'. Vengono dalla #210 e sono gia' su `main`, non da una PR in volo. La correzione vera e'
aspettare che il bottone sia idratato invece del solo `toBeVisible`.

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
