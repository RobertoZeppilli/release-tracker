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

**Da dove ripartire (2026-10-15, terzo giro): la #132 è spezzata in due PR e la prima è chiusa e
su `main` (`b4d4acd`, PR #156), niente in sospeso.** La #132 resta **aperta** per la PR 2 ed è
`ready-for-human`: le quattro decisioni qui sotto sono dell'utente, prese in apertura di sessione.
⚠️ **L'ordine delle due PR è invertito rispetto a quello scelto**, e il motivo va tenuto: il piede
punta a `terms`, `privacy`, `attributions`, `faq`, `contact`, e un piede con cinque link che danno
404 è la stessa promessa falsa dell'informativa senza il bottone. Quindi la cancellazione prima, e
**la PR 2 porta le cinque pagine e il piede insieme**.

**Verde**: prima del merge `lint`, `typecheck`, `build`, **640 su 640** unitari, **70 su 70** di
integrazione e **215 passati** in E2E con `CI=1 pnpm exec playwright test` (il build di produzione);
dopo, su `main`, **`CI` e `Deploy database` sono finiti verdi**.
⚠️ **Un flaky estraneo**: `select-many.spec.ts:163`, rientrato al ritentativo (il giro prima era
toccato a `upgrade-path.spec.ts:64`: due flaky diversi, non uno che si sposta).
⚠️ **Il dev server sulla 3000 è spento.** ⚠️ **Quattro rami da cancellare** e lo stash `residuo del
checkout interrotto`, che sono dell'utente: ai tre di prima si aggiunge `132-account-deletion`, già
mergiato. `git push origin --delete <rami>`, `git branch -d <rami>`, `git stash drop`.

⚠️ **LA COSA DA SAPERE PRIMA DI DIRE CHE LA SUITE È VERDE** resta quella di prima, e la #132 l'ha
pagata: `playwright.config.ts` lancia `pnpm dev` in locale e `pnpm start` in CI. In dev la PR 1 era
verde; contro il build di produzione sono caduti **quattro** test, e nessuno dei tre difetti sotto
si vedeva in dev. Il resto in `docs/handoff/2026-10.md`, "Perché un confine di loading fa cadere i
test che misurano".

### Le quattro decisioni della #132, prese dall'utente e non derivabili dal codice

1. **Due PR**: prima il codice, poi le pagine (poi invertite, vedi sopra).
2. **Il piede è a due colonne con titoli** (`product`: faq, contact · `legal`: terms, privacy,
   attributions), non la riga sola etichettata: Mono 12px `text-faint` su una riga `rule`, nessuna
   superficie, nel container della pagina. ⚠️ **Da costruire nella PR 2, non è ancora scritto.**
3. **Nei termini sta solo il nome del prodotto e l'email**, senza nome della persona né paese.
4. **La cancellazione è `/account` con conferma scritta** (fatta). ⚠️ Il **contatto è un
   placeholder** finché l'utente non decide l'indirizzo: prerequisito della PR 2.

### Quello che la PR 1 ha lasciato in piedi

Com'è fatta dentro (l'ordine dei tre passi della route, le tre cose dette dal solo build di
produzione) sta in `docs/handoff/2026-10.md`, "La PR 1 della #132, com'è fatta dentro". Due cose
non vanno perse qui: ⚠️ **niente dialog e niente bottone spento** nella cancellazione, la parola
scritta è la guardia e sono scelte già pagate; e ⚠️ **`NEXT_PUBLIC_GITHUB_CLIENT_ID` è ancora da
mettere su Vercel**, preso dal provider GitHub su Supabase, o il link di revoca resta quello
all'elenco delle applicazioni invece che alla pagina di Verdict.

### Cosa resta

1. **La PR 2 della #132**: terms, privacy, attributions, faq, contact e il piede a due colonne. Il
   contenuto accertato nel codice sta nel corpo della issue.
2. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: non deciso.
3. ⚠️ **Le `max-[]` non sono decise**: 43 `max-[640px]`, 19 `max-[1040px]`, 7 `max-[880px]`.
4. **Il mock disegna due righe che il modello non produce**: dominio nuovo, da fissare in
   `CONTEXT.md`. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa.
5. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Le cose dell'utente in
   `APERTE.md`, l'ambiente in `AMBIENTE.md`, il peso in `PESO.md`.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
