# Handoff, release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote **pubblico** su **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.
Produzione: **https://release-tracker-drab.vercel.app**.

## Questo file sta sotto le 100 righe, per scelta dell'utente (2026-10-10)

Qui c'è **solo lo stato vivo**. Il resto è stato spostato parola per parola, non riassunto, in quattro
file che si aprono **solo quando servono**: `docs/handoff/INDICE.md` (l'indice delle sessioni, col
diario in `docs/handoff/<anno>-<mese>.md`, **da non leggere per intero**), `docs/handoff/APERTE.md`
(strade aperte, lo stage non deciso, code e debiti, contesto della #14) e `docs/handoff/AMBIENTE.md`
(Docker e il PATH, il dev server unico sulla 3000, le due shell, i token, preferenze e skill).
Il peso delle pagine misurato prima del codice, con la procedura per il "dopo", sta in
`docs/handoff/PESO.md`.
Altrove: **PRD issue #1**, `PRODUCT.md`, `GLOSSARY.md`, `docs/DECISIONI.md`, `docs/adr/0001…0007`,
`DESIGN.md` e i mock in `design/mocks/`, **ADR 0008** per le cinque lingue.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue erano sospese e l'utente le ha rilanciate il 2026-10-15** chiedendo la #131: la
sospensione è finita, ma vale sempre la regola di chiedere prima di passare a una issue nuova.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.


## Stato

**Da dove ripartire (diciottesimo giro, 2026-10-25): la #178 e' chiusa e la prossima issue si sceglie
insieme.** Niente lavoro di prodotto in corso: il giro e' andato su un avviso di Vercel e sulla
manutenzione del repository. `main` a `61d99da` (PR #183, squash), CI verde, tree pulito.

### L'avviso di Vercel al 75% delle scritture ISR

⚠️ **Le misure, i tre errori da non rifare e la strada giusta stanno in `docs/handoff/PESO.md`**,
sezione *Le scritture ISR*. In due righe: una scrittura e' un'unita da **8 KB compressi**, non una
pagina; rigenerare contenuto identico **costa zero**; e la leva e' **il numero di percorsi** (10.535
indirizzi nel sitemap, ~63.000 unita per scaldarli tutti), **non il peso di ognuno** (8 unita la
pagina Tecnologia, 6 la pagina Release).

Fatto: `revalidate = false` sulle due pagine Technology e `86400` sul sitemap (PR #183). **Non e' il
rimedio all'avviso** — le scritture su contenuto identico erano gia gratis — ma taglia le letture ISR
e le invocazioni, e il modello su evento era gia quello giusto: `revalidateReleasePages` faceva il
lavoro. **Da non riproporre come rimedio.**

⚠️ **La #185 e' aperta con i numeri sbagliati**: etichetta portata a `ready-for-human` e un commento
in testa che la smonta, perche' il suo criterio ("sotto le 12 unita") e' gia soddisfatto oggi, a 8.
Va riscopata o chiusa, **non presa cosi' com'e'**.

### Manutenzione del repository fatta questo giro

- **PR #184 chiusa senza mergiare** e ramo cancellato: il contenuto era gia su `main` con la #183,
  provato a vuoto (`git merge --no-commit --no-ff` poi `git diff --cached` vuoto). ⚠️ Un ramo riusato
  dopo uno squash merge fa si' che git non riconosca i suoi commit come applicati: GitHub mostra il
  diff dalla base comune e offre una PR che non ha niente da portare.
- Rinomino `CONTEXT.md` in `GLOSSARY.md` chiuso negli ultimi tre file. ⚠️ `docs/handoff/2026-10.md`
  **non riscritto** (39 occorrenze): dichiara di essere copiato parola per parola, quindi una riga
  d'intestazione dice che quel nome e' cambiato.
- ⚠️ **20 rami remoti con la PR gia MERGED** sono ancora li. Il criterio buono e' lo stato della PR,
  non `git diff` contro `main`, che mostra solo che `main` e' andato avanti. Cancellarli e' dell'utente.
- ⚠️ Un fallimento CI **unico in 15 fallimenti storici**: `supabase start` morto su
  `failed to bind host port 54322: address already in use`, prima di ogni test, su `ubuntu-latest`
  (VM nuova per job, quindi non e' collisione fra run). Causa radice non trovata. Se torna, vale una
  issue accanto alla #178.

### Le verifiche

`typecheck`, `lint`, `test` (727/727), `build` verdi sul contenuto mergiato. CI della #183 verde
(`check` 35s, `integration` 7m21s).

### Cosa resta

1. **La prossima issue si sceglie insieme.** Le Notifiche: **#172** Slack, **#173** email e Digest
   come entita (e chi la fa deve togliere il filtro `SHOWN` in
   `src/modules/notifications/ui/notifications-store.ts`, o le sue Notifiche resteranno invisibili),
   **#174** Lemon Squeezy, obbligatoria al lancio per l'ADR 0009 e da aprire presto per i tempi del
   Merchant of Record. Non scelte: **#65**, **#130**, **#69**, **#176** (Redis: non adesso, ma dentro
   c'e' il rate limiting, che non esiste da nessuna parte).
2. **La #185 da riscopare o chiudere**, e la superficie indicizzata da aprire come issue se si decide.
3. ⚠️ **Francese, spagnolo e tedesco non sono rivisti da madrelingua**, e l'ADR 0008 chiede quella
   revisione **prima del lancio**, non prima del merge.
4. **I due debiti di sempre** (i 14 KB con le `max-[]`, il mock con `groupByMajor`) stanno in
   `APERTE.md`, coi rami arretrati: cancellarli e' dell'utente.
5. ⚠️ **Credito basso: non spendere niente senza chiedere.**
Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
