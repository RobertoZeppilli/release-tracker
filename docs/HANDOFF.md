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

**Da dove ripartire (2026-10-14): `/technologies` è scritta in `DESIGN.md` e implementata, e il
giro E2E della pagina è verde.** Il lavoro sta sul branch **`142-handoff-dopo-il-merge`**, pushato,
nella **PR #149**, che non chiude la #142: la issue chiede ancora **Technology e Release**. `main` è
a **`207b4b9`**. Il passo seguente è il merge della #149, e poi quelle due schermate, nello stesso
ordine: mock, `DESIGN.md`, codice.

⚠️ **La #149 ha trovato conflitti perché `main` ha preso lo squash della #148** (`207b4b9`), lo
stesso contenuto che sul ramo era già un commit suo: l'handoff arrivava due volte. Risolti con un
**merge di `origin/main` dentro il ramo**, tenendo lo stato del ramo, perché quello di `main` era lo
stato di prima, già sceso parola per parola in `docs/handoff/2026-10.md`. Niente rebase e niente
force push su un ramo già pushato.

**Che pagina è adesso.** Due colonne a 1240px, come la Dashboard: a sinistra `what you follow, by
name`, sticky a 72px con la lista che scorre dentro sé, a destra il Catalogo per Categoria. Il
quota si conta **una volta sola**, nel pannello in testa alla colonna sinistra, e perciò **la barra
non lo porta su questa pagina** (altrove sì) e la nota del limite nomina il muro senza numeri. Le
righe del Catalogo sono a due righe; `rows | grid` e `by name | by latest release` stanno in
`localStorage`, `?filter=` e `?category=` nell'indirizzo (The Address Rule, in `DESIGN.md`).

### Le tre cose decise dall'utente mentre si scriveva il codice

1. **In `grid` la cella è un pannello, non una riga**: contorno 1px, raggio 6px, 16px d'aria, e la
   riga sotto sparisce. Affiancate, le righe diventavano una dentellatura di trattini che non
   chiudono niente. **Non è una card**: niente fondo, niente ombra, nessun hover.
2. **Dentro il pannello versione e descrizione vanno su due righe**, e il `·` sparisce: il pallino
   separa fatti sulla stessa riga, mai righe diverse.
3. **Le punte di colore**: ce n'era margine per **una sola**, il Help Pointer `--> see them on your
   dashboard` in fondo al pannello (freccia faint, etichetta `help` ciano). Il resto no, ed è
   scritto in `DESIGN.md`: questa pagina non giudica niente, quindi colorare Categorie, chip o Mark
   spenderebbe per decorazione l'unico canale riservato alla severità, che è ciò che fa leggere il
   rosso della Dashboard come un verdetto.

⚠️ **Il bottone che si accavallava sul testo in `grid` era un problema di layer**: le differenze
della griglia stavano in `globals.css`, e **le utility di Tailwind stanno in un layer successivo**,
quindi vincevano loro qualunque fosse la specificità. Ora la vista sta nelle classi del componente.

**Misurato sulla pagina viva, non dedotto**: overflow orizzontale **0** a 320, 360, 390, 414, 640,
641, 1040 e 1240, barra **56.8px**, scrollbar nascosta che ruba **0px**, e il documento è **3020px**
in griglia contro **3231px** a righe (31 righe di Catalogo, container 1240). ⚠️ A 320px una prova
in iframe dava 11px di overflow: era **la scrollbar dell'iframe**, non la pagina.

### Cosa resta

1. **PR di `/technologies`**, poi Technology e Release (#142). Dopo, gli stati per colonna della
   Dashboard, rimandati per scelta dell'utente: vogliono **due query separate** che si sovrappongono
   **circa 1.7x** sul database.
2. ⚠️ **Il giro intero degli E2E non è mai stato verde in una corsa sola**: qui sono passati
   `technologies` (19) più a11y, keyboard, overflow, navigation, retired e technology-follow (84),
   ma il giro intero sul dev server dava **6 timeout di `page.goto` a 30s**. Va rifatto **sulla
   build di produzione** prima di dire che la suite è verde.
3. ⚠️ **Due cancellazioni sono dell'utente** (la modalità auto le nega): `git branch -d
   142-app-visual-direction` con il suo `git push origin --delete`, e `git rm -r
   design/mocks/direction`, che non è più la fonte.
4. ⚠️ **Una volta sola, `/technologies` ha risposto con la pagina di errore in dev**, al primo
   colpo dopo l'avvio, nella sessione del mock. Non si è ripetuta in questa. Se torna, è un difetto
   vero e va aperta una issue.
5. **Il peso delle pagine prima e dopo** (criterio della #142) non è stato misurato, e la **#130**
   (Core Web Vitals veri in produzione) resta senza misura di partenza.
6. **Un sistema di notifiche interno**, idea dell'utente del 2026-10-10: issue a parte, non aperta.
7. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic.
8. **Docker e il dev server erano attivi** a fine sessione. Se la sessione nuova li trova spenti:
   `pnpm db:start` e `pnpm dev`, uno solo sulla 3000.
9. **Rami, ordine degli ambienti e flake di `technology.spec.ts`**: in `APERTE.md`, "Cose dell'utente".
