# Handoff, verdict-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote **pubblico** su **https://github.com/RobertoZeppilli/verdict-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.
Produzione: **https://verdict-tracker.vercel.app**, una **vetrina statica** senza server (#215).
⚠️ **Dal 2026-11-10 il prodotto non si vende**: open source e self-hosted, ADR 0011.

## Questo file sta sotto le 100 righe, per scelta dell'utente (2026-10-10)

Qui c'è **solo lo stato vivo**. Il resto è stato spostato parola per parola, non riassunto, in quattro
file che si aprono **solo quando servono**: `docs/handoff/INDICE.md` (l'indice delle sessioni, col
diario in `docs/handoff/<anno>-<mese>.md`, **da non leggere per intero**), `docs/handoff/APERTE.md`
(strade aperte, lo stage non deciso, code e debiti, contesto della #14) e `docs/handoff/AMBIENTE.md`
(Docker e il PATH, il dev server unico sulla 3000, le due shell, i token, preferenze e skill).
Il peso delle pagine misurato prima del codice, con la procedura per il "dopo", sta in
`docs/handoff/PESO.md`.
Altrove: **PRD issue #1**, `PRODUCT.md`, `GLOSSARY.md`, `docs/DECISIONI.md`, `docs/adr/0001…0011`,
`DESIGN.md` e i mock in `design/mocks/`, **ADR 0008** per le cinque lingue e **ADR 0011** per la
svolta open source, che supera 0004, 0009 e 0010 e cambia il canale dell'0007.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue erano sospese e l'utente le ha rilanciate il 2026-10-15** chiedendo la #131: la
sospensione è finita, ma vale sempre la regola di chiedere prima di passare a una issue nuova.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.## Stato

**Da dove ripartire (trentaseiesimo giro, 2026-11-12): la #210 è fatta e aspetta il merge nella PR
#235.** Branch `210-via-il-login`. Non c'è più login: via `src/modules/auth`, `/login`, `/auth/*`,
`/account`, `/api/test/session`, `use-session`, `pnpm dev:login`, `images.remotePatterns` e le cinque
`account.*`; `20261112140000_drop_user_id.sql` toglie `user_id` da `follows` e dalle quattro
`notification_*`, con le policy RLS e i grant per utente.

### ⚠️ La migrazione sta nella **stessa** PR del codice, al contrario della #219 e della #209

La issue chiedeva una PR a sé, e la casa lo aveva già fatto due volte (#223 → #224, #228 → #231). Il
commento in testa a `20261112072500_drop_plans.sql` dice perché lì si poteva e qui no: la CI applica
le migrazioni da zero e **poi** gira `integration` ed `e2e` su ogni PR, quindi le due metà non possono
discordare sullo stesso commit. *Smettere di usare* una tabella è sicuro in entrambi gli ordini;
*togliere la colonna che ogni scrittura porta* non lo è in nessuno dei due. **Se preferisci lo split,
è da rifare a mano e una delle due check resta rossa.**

### ⚠️ Quello che la migrazione apre in produzione, fino alla #222

Il browser parla con Postgres direttamente (`follows-store`, la campanella) e senza sessione è
`anon`. I grant nuovi fanno funzionare la copia installata — **e lasciano anche chiunque abbia la
chiave publishable, che viaggia in chiaro, leggere e scrivere quelle cinque tabelle sul progetto di
produzione**. La vetrina non le legge dalla #215 e la #211 porta i dati su un file: è una ragione per
non far aspettare la #222. Catalogo, Release, Note e Sintesi restano in sola lettura;
`notification_secrets` e `notification_deliveries` restano chiuse due volte (RLS **e** grant).

### ⚠️ La migrazione non cancella niente, e può fermare il deploy

Se in produzione esistono follow di più di un account, o più di una riga di impostazioni, le
`add primary key` falliscono su chiave duplicata e `deploy-database.yml` diventa rosso: quale riga
sopravvive non è una decisione da prendere in silenzio dentro una migrazione.

### Cosa cambia nell'interfaccia

Il pannello account della barra diventa **il menu del telefono**: sotto i 640px apre sezioni e
`settings`, sopra non esiste e `settings` è una parola accanto alla campanella (chiavi nuove
`shell.menu.open/close` in cinque lingue). La landing ha una faccia sola (`entryFace`) e
`STATIC_SITE` è quello che resta del "non so chi legge" nei provider dei Follow.

### Due cose che la issue chiedeva e che non ho fatto

1. **`E2E_AUTH_SECRET` resta**, col suo nome: non è il login, è la guardia di
   `/api/test/revalidate` e `/test/throw`, e toglierla le lascerebbe rispondere in produzione.
   Rinominarla costa una riga di `.github/workflows/ci.yml`, e ⚠️ **il token di Cletus non può
   toccare i workflow**: provato, respinto dal remoto (`refusing to allow a GitHub App…`).
2. **La prosa di `/faq`, `/terms` e `/privacy` parla ancora di account**: è testo per persone, e la
   #216 e la #221 ci passano sopra comunque.

### La prossima mossa

**La #211, SQLite al posto di Supabase**, dopo il merge della #235: prossima della catena dell'ADR
0011 e la più grossa (59 file leggono i dati con `supabase-js`). Poi #212 → #213 → #217 → #214 →
#218 → #221 → #222 → #216, con la **#222** `ready-for-human` e una porta a senso unico.

### Cosa resta a te

1. ⚠️ **Gli e2e non si leggono senza il Catalogo.** Su un database appena resettato la suite dà 13
   falliti — Tecnologia, sitemap, spaziatura delle liste — e non è una regressione: è il Catalogo
   vuoto. La CI fa `pnpm catalog:sync` **prima** di `pnpm build`, e in locale va fatto uguale.
   ⚠️ `catalog:sync` legge `process.env` diretto: vuole `NEXT_PUBLIC_SUPABASE_URL` e
   `SUPABASE_SECRET_KEY` esportati a mano. ⚠️ Lo stesso per `pnpm build:static`: col Catalogo vuoto
   `generateStaticParams` torna vuoto e `output: "export"` rifiuta la build.
2. **La #185** resta valida: la pagina è statica, ma le 121 righe di prosa pesano uguale. ⚠️ Il suo
   testo va ancora corretto, e la misura che lo smentisce è nel diario di novembre.
3. ⚠️ **`package.json` dice ancora `"name": "release-tracker"`**, da cambiare nella **#214**, che è
   quella che pubblica; `verdict-tracker` su npm era libero l'11 novembre.
4. ⚠️ **Gli e2e si lanciano con `E2E_PORT=3100 pnpm test:e2e`** (`AMBIENTE.md`); i falliti da carico
   passano rilanciati da soli. ⚠️ **In produzione il Rilevamento è fermo** dalla #215 (`APERTE.md`).
5. **Gli accertamenti di sempre**, in `APERTE.md` e `AMBIENTE.md`. ⚠️ I tre `curl` dell'audit sono
   **irrilevanti**, e i due su `/api/test/session` e `/auth/dev-sign-in` non hanno più un indirizzo.
6. **Ambiente**: Supabase locale **acceso**, avviato con
   `pnpm exec supabase start -x studio,inbucket`. ⚠️ **Credito basso: non spendere senza chiedere.**
