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
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.
## Stato

**Da dove ripartire (trentaquattresimo giro, 2026-11-12): la #209 e' finita, ed e' tutta nella PR
#231 che aspetta il merge.** Branch `209-migrazione-via-plans`, quattro commit, sei file. La
migrazione parcheggiata e' entrata in `supabase/migrations/20261112072500_drop_plans.sql` e
`docs/pending/` non esiste piu'; i due test dell'undicesimo Follow — una Tecnologia alla volta, e
tutte in un gruppo solo — fallivano con `FLIMT` prima della migrazione e passano dopo.

### Il merge di quella PR cancella una tabella in produzione

⚠️ **`deploy-database.yml` gira a ogni push su `main` e fa `supabase db push` sul database remoto**,
quindi il merge della #231 e' il momento in cui `public.plans`, il tipo `plan` e
`notification_settings.external_trial_started_at` se ne vanno **dalla produzione**, senza migrazione
di ritorno. Sono righe di Piano Free, che dopo l'ADR 0011 non dicono niente, ed e' esattamente
quello che la #209 chiede: ma e' una porta a senso unico, e la apre il merge.

⚠️ **La CI della PR e' `action_required`**: i workflow aperti da `claude[bot]` aspettano un
`Approve and run` tuo. Finche' non lo clicchi quella PR **non ha nessun check autorevole**, solo
quello che ho girato io in locale.

### Cosa manca alla #209: niente

La #174 (Lemon Squeezy) risulta gia' chiusa. Il criterio "nessuna occorrenza di `plan`, `pro`,
`trial` nel codice" e' rispettato a meno di `planCatalogSync` e `plan-catalog-sync.ts` in
`src/modules/catalog`, dove `plan` e' il verbo (*pianificare* la sincronizzazione) e non il Piano:
l'ho lasciato, rinominarlo tocca sei file per una parola che non parla di soldi.

### Due resti della #228 che nessuna issue nominava

1. `MODULES` di `eslint.config.mjs` elencava ancora `plans`, quindi **dal merge della #228 il
   confine dei moduli dell'ADR 0006 non copriva `follows`**. Adesso l'elenco e' tutti e dieci i
   moduli: mancavano da sempre anche `landing` e `notifications`, e `pnpm lint` resta pulito.
2. `docs/DECISIONI.md` elencava `plans` fra i moduli, e il commento della pagina dei termini
   spiegava il limite dei Follow al presente.

### La prossima mossa

**La #210, via il login**, `ready-for-agent` e `Blocked by #209`: **si apre quando la #231 e'
mergiata**, non prima. Poi #211 → #212 → #213 → #217 → #214 → #218 → #221 → #222 → #216, con la
**#222** che e' `ready-for-human` ed e' una porta a senso unico.

### Cosa ho scoperto che non sta nel codice

1. ⚠️ **Gli e2e non si leggono senza il Catalogo.** Su un database appena resettato la suite da' 13
   falliti — pagine della Tecnologia, sitemap, spaziatura delle liste — e non e' una regressione:
   e' il Catalogo vuoto. La CI fa `pnpm catalog:sync` **prima** di `pnpm build`, perche'
   `generateStaticParams` enumera le Tecnologie, e in locale va fatto uguale. ⚠️ `catalog:sync` legge
   `process.env` diretto, senza `--env-file`: vuole `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SECRET_KEY`
   esportati a mano.
2. ✅ **La CI rossa per il DNS non c'e' piu'.** Su `main` a `654ceae` sono verdi sia `CI` sia
   `Deploy database` (2026-11-12, 06:38 UTC): il `gh run rerun` che il giro prima lasciava da fare
   non serve.
3. ✅ **I due rami da cancellare sono gia' spariti**: su `origin` restano solo `main` e
   `cletus/alza-i-tetti`, che e' la #230 mergiata e si puo' cancellare.

### Cosa resta a te

1. **La #185** resta valida: la pagina e' statica, ma le 121 righe di prosa pesano uguale. ⚠️ Il suo
   testo va ancora corretto, e la misura che lo smentisce e' nel diario di novembre.
2. ⚠️ **`package.json` dice ancora `"name": "release-tracker"`**, e va cambiato nella **#214**, che
   e' quella che pubblica. ⚠️ `verdict-tracker` su npm era libero l'11 novembre e resta libero fino
   al giorno in cui qualcuno lo pubblica: e' una ragione per non far aspettare la #214.
3. ⚠️ **Gli e2e si lanciano con `E2E_PORT=3100 pnpm test:e2e`** (sulla 3000 vive `ai-intake-agent`,
   il perche' in `AMBIENTE.md`); i falliti da carico passano rilanciati da soli.
4. ⚠️ **In produzione il Rilevamento e' fermo** dalla #215, e il perche' sta in `APERTE.md`.
5. **Gli accertamenti di sempre**, in `APERTE.md` e `AMBIENTE.md`. ⚠️ I tre `curl` dell'audit e gli
   header di sicurezza adesso **sono irrilevanti**.
6. **Ambiente**: Supabase locale **acceso**, avviato con
   `pnpm exec supabase start -x studio,inbucket`. ⚠️ **Credito basso: non spendere senza chiedere.**
