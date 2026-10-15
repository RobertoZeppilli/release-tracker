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
`DESIGN.md` e i mock in `design/mocks/`.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue sono sospese per scelta dell'utente** (2026-10-06): non proporne una come lavoro
seguente finché non lo rilancia lui.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.

## Stato

**Da dove ripartire (2026-10-15, quarto giro): la #132 è chiusa, tutte e due le PR sono su `main`
(`b4d4acd` e `1f4155e`, PR #156 e #158), niente in sospeso.** Con la PR 2 l'app ha le cinque pagine
pubbliche (`terms`, `privacy`, `attributions`, `faq`, `contact`), statiche e nella sitemap, e un
piede su ogni pagina. ⚠️ **Le issue restano sospese per scelta dell'utente**: non proporne una come
lavoro seguente finché non lo rilancia lui.

**Verde**: prima del merge `lint`, `typecheck`, `build`, **640 su 640** unitari, **70 su 70** di
integrazione e **239 passati** in E2E con `CI=1 pnpm exec playwright test`, nessun flaky stavolta.
⚠️ **Il dev server sulla 3000 è acceso** (riavviato dopo gli E2E, che vogliono la porta).
⚠️ **Sei rami da cancellare** e lo stash `residuo del checkout interrotto`, che sono dell'utente:
ai cinque di prima si aggiunge `132-legal-pages`. `git push origin --delete <rami>`,
`git branch -d <rami>`, `git stash drop`.

### Quello che la PR 2 ha deciso, e non è derivabile dal codice

1. **Il contatto è `robertozeppilli@proton.me`**, in `src/lib/contact.ts`, scelto dall'utente il
   2026-10-15 con la ragione: il dominio proprio si compra **al lancio**, e fino ad allora cambia
   **quella riga sola**. ⚠️ La variabile sta **solo su Vercel**, non in `.env.local`: in locale si
   entra col dev login e l'unico effetto sarebbe il link `Revoke access` su `/account`.
2. ⚠️ **`body` è una colonna flex alta `100dvh`** perché il piede stia in fondo alla finestra sulle
   pagine corte, e il prezzo è in `globals.css`: **un elemento flex con `margin-inline: auto` non
   viene steso ma stretto al contenuto**, e ogni `main` si centra con `mx-auto`. Senza
   `body > main, body > footer { width: 100% }` la colonna della Dashboard misura 1055px dentro
   1280 e il pannello dell'account sporge di 181px (lo prende `navigation.spec.ts`, il test del
   gutter). I due figli sono nominati e non `body > *`, che prenderebbe anche il bottone "torna in
   cima" e lo skip link, fuori dal flusso.
3. **Niente breadcrumb dove il percorso è un passo solo** (sign in, account, le cinque pagine):
   ripeteva la parola dell'`h1` sotto. Resta su Technology e Release, dove il percorso esiste.
4. **Il wordmark sta anche nel piede**, in Meta, come `DESIGN.md` già prescriveva. ⚠️ Un test che
   cerca `verdict:` ora va legato alla barra (`getByRole("banner")`): i link sono due.
5. **Il contenuto delle pagine è accertato nel codice**, e i numeri sono importati
   (`FREE_FOLLOW_LIMIT`, `CONTACT_EMAIL`): una pagina non può promettere quello che il codice non
   applica. Tutto registrato in `DESIGN.md` (Footer, Document Pages, la regola del breadcrumb) e in
   tre righe di `docs/DECISIONI.md`.

⚠️ **LA COSA DA SAPERE PRIMA DI DIRE CHE LA SUITE È VERDE**: `playwright.config.ts` lancia
`pnpm dev` in locale e `pnpm start` in CI, e i difetti che contano si sono visti solo contro il
build di produzione. Il resto in `docs/handoff/2026-10.md`, "Perché un confine di loading fa cadere
i test che misurano".

### Cosa resta

1. ⚠️ **`NEXT_PUBLIC_GITHUB_CLIENT_ID` è ancora da mettere su Vercel**, preso da Supabase →
   Authentication → Providers → GitHub (campo *Client ID*), su tutti gli ambienti, **e poi
   rideploy**: le `NEXT_PUBLIC_` sono murate nel bundle al build. Senza, il link di revoca su
   `/account` porta all'elenco delle applicazioni invece che alla pagina di Verdict. Non va marcata
   Sensitive: viaggia già in chiaro nel bundle e nell'URL di consenso.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: non deciso.
3. ⚠️ **Le `max-[]` non sono decise**: 43 `max-[640px]`, 19 `max-[1040px]`, 7 `max-[880px]`.
4. **Il mock disegna due righe che il modello non produce**: dominio nuovo, da fissare in
   `CONTEXT.md`. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa.
5. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Le cose dell'utente in
   `APERTE.md`, l'ambiente in `AMBIENTE.md`, il peso in `PESO.md`.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
