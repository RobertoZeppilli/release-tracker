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

**Da dove ripartire (2026-10-16, sesto giro): la #131 è aperta e la PR 3a è la #162, aperta e in
attesa della CI.** Sono su `main` la **PR 1** (ADR 0008) e la **PR 2** (`app/[locale]`, il proxy che
riscrive, i canonici). La **PR 3a** (`131-ui-strings-en`, due commit, PR #162) porta il motore del
dizionario e il **guscio** estratto, non i 92 file di UI. Restano la **PR 3b** (dizionario italiano,
e l'estrazione modulo per modulo: landing, dashboard, catalogo, release) e la **PR 4** (francese,
spagnolo, tedesco più l'overflow a 320px in tedesco).

⚠️ **Il primo controllo della sessione nuova è la CI della #162**: `gh pr checks 162`. Il primo giro
era caduto su `dashboard.spec.ts` e il secondo commit è la riparazione, non ancora verificata in CI.

### Com'è fatto il dizionario, e perché così

1. `message.ts` (una stringa o le forme di un conteggio, Zod, segnaposto `{nome}`), `translate.ts`
   (`createTranslator(locale, dictionary)`, puro, plurali da `Intl.PluralRules`), `messages/` (un
   file per spazio di nomi, e **il registro fonde la traduzione sopra l'inglese** una volta per
   lingua: il fallback sta lì e non nel traduttore, così `t` resta una lettura).
2. `getTranslator()` sul server, `useTranslator()` dal contesto. ⚠️ **Il dizionario arriva come prop
   dal layout**: un client component che importasse i dizionari porterebbe nel bundle tutte e cinque
   le lingue. L'API dei componenti non cambia se un domani si passa per spazi di nomi.
3. ⚠️ **Il test di parità** (`messages/dictionaries.test.ts`) è ciò che tiene il fallback inglese
   fuori dalla produzione: chiavi, segnaposto e le forme di plurale che quella lingua sceglie. Una
   chiave mancante sulla pagina si legge in inglese e non dice niente di sé.
4. Finché le traduzioni non ci sono **ogni lingua legge l'inglese**: cambiano indirizzo, `lang` e
   `hreflang`, non le parole (scritto in `messages/index.ts`).

### Quello che la PR 3a ha insegnato, e non è derivabile dal codice

1. ⚠️ **`usePathname()` restituisce il percorso riscritto dal proxy**: su una pagina inglese legge
   `/en/faq`. Il selettore mandava chi leggeva `/faq` su `/it/en/faq`, un 404. Di qui `barePath`,
   che toglie **anche `/en`**, mentre `stripLocale` deve lasciarlo: è il proxy a doverlo vedere.
2. ⚠️ **`SiteHeader` deve essere un client component**: `error.tsx` è un confine client e lo rende
   via `DiagnosticPage`, quindi leggere la lingua da `i18n/server` **rompeva il build** sulla pagina
   di errore (`next/root-params` non ha export in un modulo client).
3. ⚠️ **La query si scrive sull'ancora al click** (`HTMLAnchorElement.search`): `useSearchParams` in
   un piede che sta nel layout di radice avrebbe reso dinamiche tutte e 70 le pagine.
4. ⚠️ **Il piede non può crescere**: la colonna sinistra della Dashboard è sticky e in fondo al
   documento sta a distanza fissa dal bordo della finestra, quindi ogni pixel del piede è un pixel
   che quella colonna passa sopra la riga sotto di lei. Cinque lingue in colonna facevano **+46px**,
   e `dashboard.spec.ts` ne ha misurati **49 in CI** con **-120 in locale**, perché in locale la
   pagina è più alta. Ora stanno su **due sotto-colonne**: tre righe, come la cella `legal`.
   ⚠️ Debito vero: quella colonna va limitata dalla sua area di griglia invece che dalla fine della
   pagina, e finché non lo è **un piede più alto è una regressione della Dashboard**.
5. ⚠️ **Il progetto non ha prettier** (nessuna config, nessuno script, non è fra le dipendenze).
   `npx prettier --write` ha riformattato **18 file che non c'entravano** a 80 colonne, e ripulire è
   costato più del lavoro: la modalità auto nega `git checkout`. Si formatta a mano.
6. **Il glossario, deciso dall'utente il 2026-10-16**: dentro una frase si dice **Tecnologie**, non
   `Technology`. Inglesi restano i nomi **come identificatori** e la **grammatica** del prodotto
   (`featured`, `notable`, `digest`, `preview`, `note:` e i prefissi). ADR 0008 (capoverso di
   correzione), `CLAUDE.md` e `docs/DECISIONI.md` concordano. ⚠️ Per francese, spagnolo e tedesco
   `CONTEXT.md` non ha una colonna: le parole si scelgono nella PR 4 e non sono riviste.

**Verde in locale** al secondo commit: `lint`, `typecheck`, `build` (**70 pagine statiche**, l'ISR
intatto), **673 su 673** unitari, **70 su 70** di integrazione, **248 E2E** contro `pnpm start`
(`CI=1`) di cui **3 nuovi**, col solo flaky noto `technology-follow:170`. In CI passa il `check`.
⚠️ **Il dev server è spento** (chiuso per far girare gli E2E contro il build). ⚠️ **Otto rami da
cancellare** e lo stash `residuo del checkout interrotto`, che sono dell'utente: ai sette si
aggiunge `handoff-131-pr2`. ⚠️ L'utente stava modificando `.github/workflows/ci.yml` da un'altra
sessione, per non finire i minuti delle Actions: **non scartare quelle modifiche**.

### Cosa resta

1. ⚠️ **`NEXT_PUBLIC_GITHUB_CLIENT_ID` è ancora da mettere su Vercel**, su tutti gli ambienti, **e
   poi rideploy**: le `NEXT_PUBLIC_` sono murate nel bundle al build.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina** e le **`max-[]`** non sono decise.
3. **Il mock disegna due righe che il modello non produce**; `groupByMajor` e `recordedHistory`
   calcolano quasi la stessa cosa.
4. ⚠️ **Credito basso: non spendere niente senza chiedere.** Le cose dell'utente in `APERTE.md`,
   l'ambiente in `AMBIENTE.md`, il peso in `PESO.md`.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
