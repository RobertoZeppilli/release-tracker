# Handoff, release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote privato **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.
Produzione: **https://release-tracker-drab.vercel.app**.

## Questo file sta sotto le 100 righe, per scelta dell'utente (2026-10-10)

Qui c'è **solo lo stato vivo**. Il resto è stato spostato parola per parola, non riassunto, in tre
file che si aprono **solo quando servono**: `docs/handoff/INDICE.md` (l'indice delle sessioni, col
diario in `docs/handoff/<anno>-<mese>.md`, **da non leggere per intero**), `docs/handoff/APERTE.md`
(strade aperte, lo stage non deciso, code e debiti, contesto della #14) e `docs/handoff/AMBIENTE.md`
(Docker e il PATH, il dev server unico sulla 3000, le due shell, i token, preferenze e skill).
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

**Da dove ripartire (2026-10-13, notte): il mock di `/technologies` è fatto e approvato, il codice
no.** Il lavoro sta sul branch **`142-handoff-dopo-il-merge`**, **non pushato**. `main` è a
`8191681` e la Dashboard è in produzione; la **#142 resta aperta** e chiede ancora tre schermate.
Il passo seguente è **`DESIGN.md`, che viene prima del codice**, e poi la pagina vera dentro la
forma del mock.

**La direzione, scelta dall'utente fra due proposte: lo spacco anche qui.** La pagina risponde a due
domande e le mescolava in una colonna sola, *cosa seguo* e *cosa posso aggiungere*. Ora sono due
colonne a 1240px, come la Dashboard: a sinistra, sticky a 72px e con la lista che scorre dentro sé,
`what you follow, by name`; a destra il Catalogo. Il mock è `design/mocks/technologies.html`, 716
righe, con il selettore **page state** in basso a destra (`six`, `none`, `full`, `rejected`,
`retired`, `nomatch`).

**L'audit che l'ha prodotta, misurato sulla pagina viva e non dedotto:** il quota stampato **tre
volte** nei primi 60px (barra, una nota a **36.8px** e il titolo di sezione), **~270px di vuoto** in
ogni riga fra descrizione e bottone (cella dei fatti 674px per ~400px di testo), **quindici**
elementi con un numero dentro, un titolo ogni tre righe (10 gruppi per 31 righe), pagina **3196px**
e **8 righe su 37** sul primo schermo.

### Le decisioni del mock, da portare in `DESIGN.md` prima di scrivere codice

1. **Il quota si conta una volta sola**, nel pannello in testa alla colonna sinistra (`followed`,
   `left on your free plan`, cifre incolonnate). Quindi **la barra non porta il quota su questa
   pagina** (altrove resta) e la nota del limite a destra nomina il muro **senza ricontarlo**.
2. **Righe del Catalogo a due righe** (nome e bottone sopra, fatti sotto): il vuoto sparisce.
3. **`rows` o `grid`**, scelta ricordata in `localStorage`: la griglia è **2562px** contro 3172px.
   Le celle di una fila sono alte uguali, o le righe di separazione restano sfalsate.
4. **Il filtro**: label sopra (`find a technology`), campo 38ch alto 42px, sotto il conto e le
   scorciatoie (`press / to find, esc to clear`). **Esc svuota** e tiene il focus.
5. **Chip delle Categorie senza numeri** (i conti stanno nei titoli di gruppo) e **ordinamento**
   `by name | by latest release`: per data **le Categorie spariscono** e la riga mostra la data,
   perché il titolo della colonna nomina sempre l'ordinamento in corso.
6. **`?filter=` e `?category=` nell'URL** con `replaceState`; **layout e ordinamento no**, stanno in
   `localStorage`: la **#72** aveva deciso che uno stato di vista non merita l'indirizzo.
7. **`unfollow` è un controllo di testo quieto** (24px, raggiungibile da tastiera), non un bottone
   bordato: dieci bordi in una colonna da 360px sono un modulo, non una lista.
8. **Le retired chiudono la colonna sinistra**, con la loro nota: sono lì solo perché seguite.
9. **Pochi pallini**: `·` resta solo nei fatti di una riga, non nei titoli né nelle note.

Verificato nel browser: **overflow orizzontale 0** in tutt'e due le viste a 320, 360, 390, 414, 640,
641, 1040 e 1240, barra 57px, scrollbar nascosta che ruba **0px** (`offsetWidth - clientWidth`).

### Cosa resta

1. **`DESIGN.md` e poi il codice di `/technologies`**, poi Technology e Release (#142). Dopo, gli
   stati per colonna della Dashboard, rimandati per scelta dell'utente: vogliono **due query
   separate** che si sovrappongono **circa 1.7x** sul database.
2. ⚠️ **Il giro intero degli E2E non è mai stato verde in una corsa sola**: le suite passano una per
   una, ma il giro intero sul dev server dava **6 timeout di `page.goto` a 30s**. Va rifatto **sulla
   build di produzione** prima di dire che la suite è verde.
3. ⚠️ **Due cancellazioni sono dell'utente** (la modalità auto le nega): `git branch -d
   142-app-visual-direction` con il suo `git push origin --delete`, e `git rm -r
   design/mocks/direction`, che non è più la fonte.
4. ⚠️ **Una volta sola, `/technologies` ha risposto con la pagina di errore in dev**, al primo colpo
   dopo l'avvio, e non si è più ripetuta nella stessa sessione. Sospetto la prima compilazione. Se
   torna, è un difetto vero e va aperta una issue.
5. **Il peso delle pagine prima e dopo** (criterio della #142) non è stato misurato, e la **#130**
   (Core Web Vitals veri in produzione) resta senza misura di partenza.
6. **Un sistema di notifiche interno**, idea dell'utente del 2026-10-10: issue a parte, non aperta.
7. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic.
8. **Docker e il dev server erano attivi** a fine sessione. Se la sessione nuova li trova spenti:
   `pnpm db:start` e `pnpm dev`, uno solo sulla 3000.
9. **Rami, ordine degli ambienti e flake di `technology.spec.ts`**: in `APERTE.md`, "Cose dell'utente".

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md e scriviamo DESIGN.md per
/technologies, poi il codice`.
