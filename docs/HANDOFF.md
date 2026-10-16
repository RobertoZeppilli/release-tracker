# Handoff, release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
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
Altrove: **PRD issue #1**, `PRODUCT.md`, `CONTEXT.md`, `docs/DECISIONI.md`, `docs/adr/0001…0007`,
`DESIGN.md` e i mock in `design/mocks/`, **ADR 0008** per le cinque lingue.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue erano sospese e l'utente le ha rilanciate il 2026-10-15** chiedendo la #131: la
sospensione è finita, ma vale sempre la regola di chiedere prima di passare a una issue nuova.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.

## Stato

**Da dove ripartire (2026-10-15, quinto giro): la #131 è aperta e la sta facendo in quattro PR, e le
prime due sono su `main`.** La **PR 1** (`6cb9494`, PR #159) porta l'**ADR 0008**, che fissa le
cinque lingue, con `CLAUDE.md`, `CONTEXT.md` e `docs/DECISIONI.md` (quattro righe in "Esperienza
utente") che concordano con lui. La **PR 2** (`f403267`, PR #160) porta l'impianto: `app/[locale]`,
il proxy che riscrive, `src/modules/i18n`, i canonici e gli `hreflang` per lingua, e **nessuna
stringa tradotta**. ⚠️ La #159 era entrata in squash, quindi portare `main` nel ramo della #160 ha
chiesto di risolvere un conflitto **add/add** sull'ADR: vinceva la versione del ramo, la stessa più
tre capoversi. Restano la **PR 3** (estrazione delle stringhe, inglese e italiano, selettore, avviso
di lingua mista) e la **PR 4** (francese, spagnolo, tedesco più l'overflow a 320px in tedesco, che è
il caso peggiore).

⚠️ **Le cinque decisioni della #131, prese dall'utente il 2026-10-15, stanno per esteso in
`docs/adr/0008-interfaccia-in-cinque-lingue.md`** e in quattro righe di `docs/DECISIONI.md`, e sono
copiate anche in `docs/handoff/2026-10.md`: cinque lingue con le Note e le Sintesi non tradotte,
vocabolario di dominio in inglese, lingua nell'URL, selettore nel piede e nel menu profilo, modulo
nostro con un albero solo sotto `app/[locale]`. ⚠️ **Francese, spagnolo e tedesco li scrivo io e non
sono rivisti da madrelingua**: va fatto prima del lancio.

### Quello che la PR 2 ha insegnato, e non è derivabile dal codice

1. ⚠️ **La riscrittura del proxy si costruisce clonando l'URL in arrivo.** Costruita dal solo
   percorso butta la **query**: `?next=` del login, `?week=` del Digest, i filtri del Catalogo.
   **Sei E2E caduti** l'hanno trovata, nessun typecheck l'avrebbe vista.
2. ⚠️ **Il matcher del proxy non può escludere i percorsi col punto**: `.*\..*` escludeva
   `/technologies/vite/7.1.0`, cioè tutte le Release. I file dell'app si elencano uno per uno.
3. ⚠️ **Un indirizzo sconosciuto va tenuto dentro la lingua** con un catch-all `[...rest]` che
   chiama `notFound()`: senza, cade fuori da `app/[locale]` e Next risponde con la sua 404 nuda
   (niente guscio, niente tema, niente piede). `global-not-found.tsx` è stato **rifiutato**: è un
   secondo guscio con i suoi font e il suo piede.
4. ⚠️ **`pnpm typecheck` ora lancia `next typegen` prima di `tsc`**: `LayoutProps<"/[locale]">` e
   `next/root-params` hanno i tipi in `.next/types`, che in locale ci sono perché gira il dev server
   e in CI no. Il check della #160 è caduto lì **tre volte**, ogni volta per una ragione diversa:
   mancavano i tipi, poi `next typegen` ha chiesto l'ambiente pubblico (carica `next.config.ts`, che
   lo valida con Zod), poi **anche quello server**, perché `next.config.ts` chiama `parseServerEnv`.
   Ora il job `check` ha **quattro segnaposto che niente legge**, cioè le sole obbligatorie dei due
   schemi, coi prefissi che pretendono: `sb_publishable_` e `sb_secret_`.
   ⚠️ **In locale non si riproduce** nemmeno cancellando `.next`, perché `.env.local` c'è: il guasto
   si legge solo nel log del job (`gh api repos/<repo>/actions/jobs/<id>/logs`), e `gh run view
   --log-failed` non lo dà finché l'altro job è in corso.
5. **`next/link` è importato in un posto solo**, dentro `LocaleLink`, e `stripLocale` lo rende
   idempotente: un href che porta già il prefisso non viene prefissato due volte.
6. Il **`LocaleProvider` non disegna nessun elemento**, quindi `main` e `footer` restano figli
   diretti di `body`, come `globals.css` ha bisogno che siano.

**Verde** prima del merge della #160, e la CI passa: `lint`, `typecheck`, `build` (**70 pagine
statiche**, cioè quelle di prima per cinque: l'ISR non è stato buttato), **651 su 651** unitari,
**70 su 70** di integrazione e **245 E2E** contro `pnpm start` (`CI=1`), di cui **7 nuovi** in
`tests/e2e/locales.spec.ts`. Un flaky noto (`technology-follow:170`), passato 3 volte su 3 da
solo.
⚠️ **Il dev server sulla 3000 è acceso.** ⚠️ **Sette rami da cancellare** e lo stash
`residuo del checkout interrotto`, che sono dell'utente: ai sei di prima si aggiunge
`131-ui-five-languages`, mergiato. `git push origin --delete <rami>`, `git branch -d <rami>`,
`git stash drop`.

### Cosa resta

1. ⚠️ **`NEXT_PUBLIC_GITHUB_CLIENT_ID` è ancora da mettere su Vercel**, preso da Supabase →
   Authentication → Providers → GitHub (campo *Client ID*), su tutti gli ambienti, **e poi
   rideploy**: le `NEXT_PUBLIC_` sono murate nel bundle al build. Senza, il link di revoca su
   `/account` porta all'elenco delle applicazioni invece che alla pagina di Verdict.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: non deciso.
3. ⚠️ **Le `max-[]` non sono decise**: 43 `max-[640px]`, 19 `max-[1040px]`, 7 `max-[880px]`.
4. **Il mock disegna due righe che il modello non produce**: dominio nuovo, da fissare in
   `CONTEXT.md`. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa.
5. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Le cose dell'utente in
   `APERTE.md`, l'ambiente in `AMBIENTE.md`, il peso in `PESO.md`.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
