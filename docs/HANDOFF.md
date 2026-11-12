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

**Da dove ripartire (trentottesimo giro, 2026-11-12): la prima fetta della #211 è finita e verde, e
la PR è pronta da guardare.** Branch `211-sqlite-fondamenta`, che il giro prima si era fermato a
metà. Dentro c'è `src/modules/db`: dove vive il file dei dati, il runner che applica le migrazioni
con una tabella di versione, e lo schema tradotto nel dialetto SQLite. **I 59 file che leggono via
`supabase-js` non sono toccati**: sono la fetta dopo.

Suite girate **sul runner**, con Supabase locale (serve ancora, finché il codice legge da lì):
`lint` e `typecheck` puliti, `test` 785/785, `test:integration` 92/92, `build` e `i18n:client-keys`
verdi, `test:e2e` 279 passati e 1 saltato (`slack-dialog`, che si salta da sé senza le credenziali
Slack). ⚠️ **Ma due e2e del menu sono flaky**, e vengono dalla #210, non da questa PR: il clic
arriva prima dell'idratazione, il retry le salva e in CI non si vedono. Il dettaglio in
`AMBIENTE.md`.

### Le tre cose che il giro ha scoperto, e che nel codice non si vedono

1. ⚠️ **`MIGRATIONS_DIRECTORY` non è provata dopo il bundle.** La trova con `import.meta.url`, che
   regge finché il modulo si legge come sorgente — i test, `tsx`, `next dev` — ma in una build
   quel file diventa un chunk sotto `.next/` e `../migrations/` punta altrove.
   `outputFileTracingIncludes` in `next.config.ts` è **metà** della risposta: spedisce i `.sql`, non
   dice dove il modulo andrà a cercarli. **Nessuna rotta apre ancora il database**, quindi non c'è
   niente su cui provarlo: la prima che lo farà deve verificarlo per prima cosa.
2. ⚠️ **Lo schema è un file solo, non diciotto tradotte una per una**, e il commento in testa a
   `0001_initial_schema.sql` dice perché: nessun database SQLite di quest'app esiste ancora, quindi
   non c'è niente da portare avanti, e replicare la storia vorrebbe dire tradurre dei `drop column`
   su colonne che nessuno ha mai creato, in un dialetto che non sa togliere una colonna con un
   vincolo sopra. Il meccanismo resta: file numerati, `schema_migrations`, e sono i file **dopo**
   questo a portare righe vere.
3. ⚠️ **Tre cose di Postgres non sono passate, e una è una regola senza casa.** RLS, policy, grant e
   i tre ruoli non hanno più una seconda risposta da dare (#210). `claim_pending_summaries` era un
   recinto che adesso è il lock di scrittura di SQLite. Ma **`enforce_current_version` è scomparso**:
   voleva una regex SemVer e un confronto fra array, e SQLite non ha né l'una né l'altro. **Finché
   la fetta dopo non lo rimette nella funzione di scrittura dei `follows`, nessuno controlla che la
   Versione in uso non sia più nuova dell'ultima Release stabile.** Lo schema tiene i due vincoli
   che sa dire: le due colonne vere o nulle insieme, e la forma che `glob` sa descrivere, più larga
   di `is_semver` ma abbastanza da rifiutare `not-a-version` e `16.x`.

⚠️ **Il runner ha Node 22, e `node:sqlite` c'è ma stampa `ExperimentalWarning`**: la issue dice
Node 24. Tutto gira, ma in `package.json` non c'è nessun `engines` che lo imponga — da decidere
nella **#214**, che è quella che pubblica.

### La prossima mossa

**La seconda fetta della #211**: lo strato di lettura e scrittura che sostituisce `supabase-js`,
tabella per tabella, con dentro la regola della Versione in uso. È il pezzo grosso, ed è quello che
sblocca i tre criteri di accettazione ancora aperti — niente import di `@supabase/*`,
`test:integration` senza servizi esterni, i comandi verdi senza Docker. Poi lo script che esporta la
produzione nel file iniziale (**le Sintesi sono già pagate e non si ricomprano**), e infine via la
cartella `supabase/` e `deploy-database.yml`. Dopo la #211: #212 → #213 → #217 → #214 → #218 →
#221 → #222 → #216, con la **#222** `ready-for-human` e una porta a senso unico.

⚠️ **I quattro file che il workflow scarica nella radice** — `REGOLE-CLETUS.md`, `REGOLE-STACK.md`,
`giro-configurazione.json`, `giro-prompt.md` — erano finiti in un commit di questo branch. Tolti, e
messi in `.gitignore` perché non tornino.

### Cosa resta a te

1. ⚠️ **La decisione sui cinque documenti, ancora da prendere**: `terms` nomina l'accesso con
   GitHub, `privacy` e `faq` spiegano come si cancella l'account, `contact` dice che è un bottone.
   È prosa in cinque lingue, legale due volte su cinque, e **nessuna issue aperta la copre**: la
   #221 è la landing, la #216 i contributi. Serve una issue sua, e il testo lo decidi tu.
2. ⚠️ **Quello che la migrazione della #210 ha aperto in produzione fino alla #222**: il dettaglio è
   nel diario di novembre, sotto il trentaseiesimo giro, e vale parola per parola.
3. ⚠️ **Le suite in locale vogliono un ordine preciso**, e girarle nell'altro verso dà due rossi che
   non sono regressioni: l'`integration` dopo un `catalog:sync`, e gli e2e della sitemap senza
   buttare `.next`. Il perché e l'ordine giusto stanno in `AMBIENTE.md`, spostati lì da questo giro.
4. **La #185** resta valida, col suo testo ancora da correggere. ⚠️ **`package.json` dice ancora
   `"name": "release-tracker"`**, da cambiare nella **#214**.
5. **Gli accertamenti di sempre**, in `APERTE.md` e `AMBIENTE.md`. ⚠️ In produzione il Rilevamento è
   fermo dalla #215. ⚠️ **Credito basso: non spendere senza chiedere.**
