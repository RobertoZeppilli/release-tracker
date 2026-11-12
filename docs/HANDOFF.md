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

**Da dove ripartire (trentacinquesimo giro, 2026-11-12): la #209 è chiusa, e la porta a senso unico
è passata.** La PR #231 è mergiata in `405c87a` e `deploy-database.yml` ha fatto il suo giro: su quel
commit sono verdi sia `CI` sia `Deploy database`, quindi `public.plans`, il tipo `plan` e
`notification_settings.external_trial_started_at` **non esistono più nel database di produzione**.
Non c'è migrazione di ritorno, ed è quello che la issue chiedeva. La finestra in cui l'undicesimo
Follow veniva rifiutato con un codice che il codice non conosceva più è chiusa anche lei.

Della #209 non resta niente: la #174 era già chiusa, e le uniche occorrenze di `plan` nel codice
sono `planCatalogSync` e `plan-catalog-sync.ts` in `src/modules/catalog`, dove è il verbo
*pianificare*. Rinominarlo tocca sei file per una parola che non parla di soldi.

### Le tre PR di workflow dopo il merge

Nessuna tocca il prodotto: sono tutte la macchina che fa lavorare Cletus.

1. **#230** (`654ceae`): `--max-turns` da 60 a 400 e `timeout-minutes` da 45 a 60. Il primo giro vero
   era morto sui 60 turni con il lavoro fatto e niente consegnato.
2. **#232** (`7811699`): `allowed_bots: 'github-actions'` in `claude-review`. Le PR di Cletus le apre
   `github-actions`, e la protezione contro gli attori non umani tagliava fuori proprio quelle.
3. **#233** (`6c1ee87`): il workflow qui scende a 64 righe e chiama
   `RobertoZeppilli/Cletus/.github/workflows/cletus-lavora.yml@main`. Turni, minuti, modello e prompt
   adesso si cambiano nel repo Cletus e valgono subito su ogni progetto. ⚠️ **Il PAT non entra più
   nello step dell'agente**: lì va `${{ github.token }}`, perché questo repo è pubblico e il testo
   delle issue lo scrive chiunque. `CLETUS_PAT` resta negli step prima e dopo, dove l'agente non
   arriva; per avvisare a metà giro l'agente scrive `AVVISO.md` e lo spedisce il runner.

⚠️ **Le ultime due non sono verificate**: il prossimo giro di Cletus è la prova. Se il reusable
workflow non parte, il motivo probabile è l'accesso di Cletus (privato) agli altri repo.

### La prossima mossa

**La #210, via il login**, aperta e `ready-for-agent`: la #209 che la bloccava è chiusa, quindi si
può prendere. Poi #211 → #212 → #213 → #217 → #214 → #218 → #221 → #222 → #216, con la **#222** che
è `ready-for-human` ed è una porta a senso unico.

### Quattro rami da cancellare, e li cancelli tu

Tutti mergiati, nessuno serve più:

```
git push origin --delete 209-migrazione-via-plans cletus/alza-i-tetti cletus/chiama-invece-di-copiare cletus/review-sulle-pr-del-bot
git branch -D 209-filtro-deploy
```

### Cosa resta a te

1. ⚠️ **Gli e2e non si leggono senza il Catalogo.** Su un database appena resettato la suite dà 13
   falliti — pagine della Tecnologia, sitemap, spaziatura delle liste — e non è una regressione: è il
   Catalogo vuoto. La CI fa `pnpm catalog:sync` **prima** di `pnpm build`, perché
   `generateStaticParams` enumera le Tecnologie, e in locale va fatto uguale. ⚠️ `catalog:sync` legge
   `process.env` diretto, senza `--env-file`: vuole `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SECRET_KEY`
   esportati a mano.
2. **La #185** resta valida: la pagina è statica, ma le 121 righe di prosa pesano uguale. ⚠️ Il suo
   testo va ancora corretto, e la misura che lo smentisce è nel diario di novembre.
3. ⚠️ **`package.json` dice ancora `"name": "release-tracker"`**, e va cambiato nella **#214**, che
   è quella che pubblica. ⚠️ `verdict-tracker` su npm era libero l'11 novembre e resta libero fino
   al giorno in cui qualcuno lo pubblica: è una ragione per non far aspettare la #214.
4. ⚠️ **Gli e2e si lanciano con `E2E_PORT=3100 pnpm test:e2e`** (sulla 3000 vive `ai-intake-agent`,
   il perché in `AMBIENTE.md`); i falliti da carico passano rilanciati da soli.
5. ⚠️ **In produzione il Rilevamento è fermo** dalla #215, e il perché sta in `APERTE.md`.
6. **Gli accertamenti di sempre**, in `APERTE.md` e `AMBIENTE.md`. ⚠️ I tre `curl` dell'audit e gli
   header di sicurezza adesso **sono irrilevanti**.
7. **Ambiente**: Supabase locale **acceso**, avviato con
   `pnpm exec supabase start -x studio,inbucket`. ⚠️ **Credito basso: non spendere senza chiedere.**
