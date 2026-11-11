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

**Da dove ripartire (trentatreesimo giro, 2026-11-11): la #209 e' aperta in PR #228, e vuole una
seconda PR per chiudersi.** Il ramo `209-via-il-piano` e' pushato: 136 file, +468 -1482. Dentro c'e'
tutto il codice della issue (il modulo `plans` rinominato `follows`, via limite, quota, Limit Note,
muro del gruppo, trial e segno `Pro`, le cinque lingue, i test e `DECISIONI.md`, `PRODUCT.md`,
`DESIGN.md`). ⚠️ **La migrazione non e' dentro**, ed e' una scelta, non una dimenticanza.

### Perche' qui il codice va prima dello schema

La regola "schema prima, codice dopo" vale per le migrazioni che **aggiungono**, perche' i preview
girano sul database di produzione. Una che **cancella** si rovescia: la CI applica le migrazioni da
zero e poi gira integration ed e2e, quindi una PR di sola migrazione sarebbe rossa su due check
obbligatori su due. E' l'ordine della lista d'attesa: #223 il codice, #224 la tabella.

⚠️ **La migrazione e' gia' scritta e parcheggiata fuori dal ramo**, in
`C:/Users/rober/AppData/Local/Temp/claude/0621240ac62cc06f/fb916036-67e8-454b-8ae4-9425f73aad32/scratchpad/drop_plans.sql`.
Va rimessa in `supabase/migrations/` con un timestamp nuovo: `enforce_follow_rules()` riscritta col
solo controllo `FRTRD` (via il lock e il ramo Free), poi `drop trigger on_auth_user_created`, `drop
function create_free_plan()`, `drop table public.plans`, `drop type public.plan`, `alter table
notification_settings drop column external_trial_started_at`. Se il file non c'e' piu' (la cartella
muore con la sessione) si riscrive dal diff della PR #228.

### Cosa manca alla #209

1. **La PR 2**: la migrazione sopra, piu' il test di integrazione che prova che **seguire piu' di
   dieci Tecnologie funziona**, che e' un criterio di accettazione e nella PR 1 non si puo' scrivere
   perche' il trigger e' ancora al suo posto.
2. **Chiudere la #174** (Lemon Squeezy) spiegando perche': non c'e' niente da comprare, ADR 0011.
3. ⚠️ Finche' la migrazione non e' applicata l'undicesimo Follow e' rifiutato con un codice che
   il codice non conosce piu': la riga dice "non salvata, riprova". E' la finestra fra i due deploy.

Verde in locale sul ramo: lint, typecheck, `pnpm test` (776), build, `i18n:client-keys --check`,
`pnpm test:integration` (96) e la suite e2e intera, 301 su 306. ⚠️ **I falliti in locale sono
timeout da carico** (`toHaveURL` a 5s contro una navigazione che il dev server compila al volo):
girati da soli passano. Un secondo commit ha corretto cinque e2e che leggevano ancora la quota del
Piano in file che la issue non nomina.

⚠️ **In produzione il Rilevamento e' fermo.** Il cron giornaliero e' uscito da `vercel.json`, perche'
`/api/jobs/detection` su un sito statico non esiste, e i dati della vetrina restano a quelli
dell'ultimo deploy finche' la #211 e la #213 non portano il Rilevamento in locale. E' l'ADR 0011, non
una perdita.

⚠️ **La CI di `main` sul commit `6e0eea2` e' rossa per il DNS del runner**, non per il codice:
e' caduta `playwright install --with-deps`, il job `check` e' verde e nessun test e' fallito. Si
risolve con `gh run rerun 43033974945 --failed`, non fatto.

### Le undici issue che restano

#209 → #210 → #211 → #212 → #213 → #217 → #214 → #218 → #221 → #222 → #216. Tutte
`ready-for-agent` tranne la **#222**, che è `ready-for-human` ed è una porta a senso unico.

### Cosa resta a te

1. ⚠️ **Due rami si possono cancellare**, `209-filtro-deploy` e `215-vetrina-statica`, e con il
   primo l'unica cosa che restava da recuperare a mano. La #215 ha messo `supabase/migrations/` nel filtro dell'Ignored Build Step,
   che era metà di quel commit mai entrato (`7e40fd7`). L'altra metà, `scripts/`, **non deve
   entrare**: la build della vetrina *è* uno script, quindi uno script è esattamente una cosa che
   cambia il sito. La ragione per cui quel commit lo escludeva è spiegata dentro
   `scripts/vercel-ignore-build.mjs`, e non vale più.
2. **La #185** resta valida: la pagina è statica, ma le 121 righe di prosa pesano uguale. ⚠️ Il suo
   testo va ancora corretto, e la misura che lo smentisce è nel diario di novembre.
3. ⚠️ **`package.json` dice ancora `"name": "release-tracker"`**, e va cambiato nella **#214**, che
   è quella che pubblica. ⚠️ `verdict-tracker` su npm era libero l'11 novembre e resta libero fino
   al giorno in cui qualcuno lo pubblica: è una ragione per non far aspettare la #214.
4. ⚠️ **Gli e2e si lanciano con `E2E_PORT=3100 pnpm test:e2e`** (sulla 3000 vive `ai-intake-agent`,
   il perché in `AMBIENTE.md`); i falliti da carico passano rilanciati da soli.
5. **Gli accertamenti di sempre**, in `APERTE.md` e `AMBIENTE.md`. ⚠️ I tre `curl` dell'audit e gli
   header di sicurezza adesso **sono irrilevanti**.
6. **Ambiente**: Supabase locale **acceso**, avviato con
   `pnpm exec supabase start -x studio,inbucket`. ⚠️ **Credito basso: non spendere senza chiedere.**
