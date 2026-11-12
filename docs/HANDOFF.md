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

**Da dove ripartire (trentasettesimo giro, 2026-11-12): la #210 è finita e verde, e la PR #235 è
pronta da guardare.** Branch `210-via-il-login`, non più in bozza. Il giro prima si era fermato a
metà per il limite d'uso, con `integration` rosso; questo giro ha fatto passare tutto e ha girato le
suite **sul runner**, con Supabase locale, Catalogo sincronizzato e build di produzione: `lint` e
`typecheck` puliti, `test` 755/755, `test:integration` 92/92, `test:e2e` 281 passati e 1 saltato
(`slack-dialog`, che si salta da sé senza le credenziali Slack), `build` e `i18n:client-keys` verdi.

⚠️ **I check della CI su quei commit sono in `action_required`**: i workflow aperti da
`github-actions` aspettano la tua approvazione, quindi sulla PR non si sono ancora riaccesi. Vanno
approvati prima del merge — l'output nel corpo della PR è il mio, non il loro.

### Le quattro cose rotte che il giro ha trovato, e che nel codice non si vedevano

1. **`a11y.spec.ts` aveva due test «the settings page»**: Playwright si ferma in **fase di
   raccolta** su un titolo duplicato, quindi non girava *niente*, non solo quel file. Quello di
   troppo era il vecchio test dell'account rinominato.
2. ⚠️ **Gli e2e adesso vogliono un worker solo** (`playwright.config.ts`, `workers: 1`). Follows e
   Notifications appartenevano a uno Sviluppatore e ogni file ne seminava uno suo: era **quello** a
   isolare due file in parallelo. Ora le righe sono una tabella sola e il numero sulla campanella le
   conta tutte, quindi due file insieme si cancellano le righe a vicenda. Restringere i `clear` alla
   Tecnologia del test non basta: il conteggio resta globale. Misurato: 2,9 minuti in serie, **gli
   stessi** di prima in parallelo — il tempo se ne va ad aspettare le pagine.
3. ⚠️ **Con la tendina delle Notifiche aperta, axe misura quello che resta scoperto.** Il link di
   versione della prima riga finisce sotto il pannello e ne restano 4px su 50: `target-size`,
   `serious`. Si vedeva solo in spagnolo perché il verdetto tradotto è più alto e spinge la riga
   proprio lì. La seconda scansione di quel test ora guarda `#notification-panel`, che è quello che
   deve auditare; la pagina intera la guarda il passaggio prima che il pannello si apra.
4. **Il menu del telefono non tornava indietro**: pannello e bottone sono `sm:hidden`, sopra i 640px
   sparivano tutti e due con `open` ancora vero, e lo scorrimento del `body` restava bloccato senza
   niente da premere. Basta girare il telefono. Corretto, con un e2e in `navigation.spec.ts`.

### La prossima mossa

**La #211, SQLite al posto di Supabase**, dopo il merge della #235: prossima della catena dell'ADR
0011 e la più grossa (59 file leggono i dati con `supabase-js`). Poi #212 → #213 → #217 → #214 →
#218 → #221 → #222 → #216, con la **#222** `ready-for-human` e una porta a senso unico.

⚠️ **Prima serve una decisione tua**: i cinque documenti parlano ancora di account — `terms` nomina
l'accesso con GitHub, `privacy` e `faq` spiegano come si cancella l'account, `contact` dice che è un
bottone. Il nome ha smesso di essere un link (puntava a `/account`, 404 anche nell'app installata),
ma il testo è prosa in cinque lingue, legale due volte su cinque, e **nessuna issue aperta la
copre**: la #221 è la landing, la #216 i contributi. Serve una issue sua, e il testo lo decidi tu.

### Le due deviazioni dalla issue #210, da confermare al merge

1. **La migrazione sta nella stessa PR del codice.** La CI applica le migrazioni da zero e **poi**
   gira `integration` ed `e2e` sullo stesso commit: *smettere di usare* una tabella è sicuro in
   entrambi gli ordini (#219, #209), *togliere la colonna che ogni scrittura porta* non lo è.
2. **`E2E_AUTH_SECRET` resta**: non è il login, è la guardia di `/api/test/revalidate` e
   `/test/throw`. ⚠️ Rinominarla costa una riga di `ci.yml`, e **il token di Cletus non può toccare i
   workflow**: provato, respinto dal remoto.

### Cosa resta a te

1. ⚠️ **Quello che la migrazione apre in produzione fino alla #222**, e ⚠️ **le `add primary key`
   che possono fermare il deploy** se ci sono follow di più account: il dettaglio è nel diario di
   novembre, sotto il trentaseiesimo giro, e vale parola per parola.
2. ⚠️ **Gli e2e non si leggono senza il Catalogo** (`pnpm catalog:sync` prima di `pnpm build`, con
   `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SECRET_KEY` esportati a mano); lo stesso per
   `pnpm build:static`. ⚠️ In locale si lanciano con `E2E_PORT=3100 pnpm test:e2e`.
3. **La #185** resta valida, col suo testo ancora da correggere. ⚠️ **`package.json` dice ancora
   `"name": "release-tracker"`**, da cambiare nella **#214**, che è quella che pubblica.
4. **Gli accertamenti di sempre**, in `APERTE.md` e `AMBIENTE.md`. ⚠️ In produzione il Rilevamento è
   fermo dalla #215. ⚠️ **Credito basso: non spendere senza chiedere.**
