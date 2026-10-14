# Ambiente, preferenze e skill

Spostato qui da `docs/HANDOFF.md` il 2026-10-10, parola per parola. Sono riferimenti permanenti,
non stato: si aprono quando servono.

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
