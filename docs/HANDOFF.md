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

**Da dove ripartire (2026-10-10, dopo la direzione scelta per la #142).** La #141 è **chiusa** (PR
#146 in `26214c3`) e il suo stato sta in `docs/handoff/2026-10.md`, con le sue tre trappole. La CI su
`main` è **tutta verde**. Non c'è niente in sospeso e niente di rotto.

⚠️ **Il presupposto della #142 è sbagliato.** Dice "portare la direzione della landing nell'app", ma
`DESIGN.md` dichiara la landing **dentro lo stesso registro** dell'app, e le sue differenze (1240
contro 1040, le bande, The Arrival Rule che si ferma "alla porta dell'app") sono scelte scritte e
motivate. Barra sticky e Marchio a 16px, le due che divergevano, la #141 le ha già portate ovunque.
Quello che resta è la richiesta vera del 2026-10-09, "migliorare di molto il design dell'app".

**Le decisioni dell'utente (2026-10-10).** Cercare una **direzione nuova** e non rifinire, sapendo
che rifà `DESIGN.md` e rompe gli E2E in blocco; cercarla sulla **Dashboard**; e, guardando quattro
proposte vere nel browser (A coda, B registro, C spacco, D fusione), ha scelto la **C**, "lo spacco",
con una modifica sua: **la colonna di sinistra scorre dentro se stessa, con la scrollbar nascosta**.
Il mock è **`design/mocks/direction/dashboard.html`** più `tokens.css`; le altre tre sono state
cancellate dopo la scelta, perché la fonte dell'aspetto resti un file solo.

**Cos'è la C.** La pagina smette di mescolare due domande. A sinistra, e non scorre via, **dove sta
il tuo stack**: una riga per Tecnologia seguita con la distanza dalla Versione dichiarata, ordinate
**per distanza**. A destra **il flusso**, per data e **senza sezioni per categoria**. I due Count Box
spariscono: la colonna sinistra *è* quei numeri, scritti come le cose che contavano. L'audit aveva
trovato sei difetti misurati sulla pagina viva, fra cui due conteggi che si contraddicono a vista
(`need action 3` contro `2 need action`: la finestra contro la Versione in uso, famiglia della #94) e
**la stessa Tecnologia fino a quattro volte** nella stessa schermata.

⚠️ **Tre trappole già pagate sul mock**, da non ritrovare da zero nel codice:

- **La dissolvenza in fondo a una lista che scorre va fatta cadere sul vuoto.** Con la scrollbar
  nascosta serve un indizio, ma la maschera sfumava l'ultima riga anche a lista finita. Il
  contenitore finisce su 18px di padding e la maschera è alta 18px. **Niente animazioni e niente
  ombre**, vietate da `DESIGN.md`: non riproporre scroll-driven animations né scroll shadows.
- ⚠️ **La scrollbar nascosta è misurata, non sperata**: `offsetWidth - clientWidth` vale **0**,
  quindi non ruba larghezza. Da rimisurare nel codice, perché Tailwind non la nasconde da solo.
- ⚠️ **A 390px il mock aveva 144px di overflow orizzontale**, trovato con Playwright e non a occhio:
  la sua barra non andava a due righe come quella vera dalla #119. Ora è **0**. Un mock nuovo non
  eredita le soluzioni responsive del prodotto.

Il mock è stato guardato **in chiaro e a 390px** e regge; non lo sono ancora gli altri stati (vuoto,
caricamento, errore, quota) e le altre tre schermate. ⚠️ **La stella polare resta la facilità
d'uso**: un lavoro che rende l'app più bella e più dispersiva **ha fallito**. L'intera issue **non
entra in una sessione**.

### Cosa resta

1. **La #142, il passo seguente è `DESIGN.md`**, e l'ordine lo impone la issue: prima la direzione
   scritta con gli stati che solo l'app ha (vuoto, caricamento, errore, quota, riga sotto il
   pointer), **poi** il mock ufficiale `design/mocks/dashboard.html` rifatto, **poi** il codice e
   gli E2E aggiornati con intenzione. Le altre tre schermate vengono dopo. Il lavoro sta sul branch
   **`142-app-visual-direction`**, che va ripreso con `git checkout 142-app-visual-direction`.
2. **Il dev server è fermo** (verificato: niente sulle 3000-3009). Va riavviato dall'utente con
   `pnpm dev`, uno solo e sulla 3000.
3. ⚠️ **La #130**: Core Web Vitals veri in produzione e lettura dal telefono. **La misura di partenza
   non è mai stata presa**, e in produzione c'è già la landing nuova: un confronto con la vecchia
   non esiste più. Che non peggiori è **ragionato e non misurato**.
4. **Su telefono resta ferma tutta la barra, 96px**, non solo la prima riga: fermarne una sola vuole
   o un secondo `<nav>` nel DOM (due copie degli stessi link per uno screen reader) o la strip
   **sopra** il marchio. Tocca la #119, quindi l'utente la rivedrà con una issue sua, misurando.
5. **La cancellazione dei rami**, locali e remoti, resta dell'utente (`git branch -D <ramo>`):
   `141-landing-redesign`, `139-detection-tag-variants`, `140-landing-entry-action`,
   `137-tag-format-variants`, `137-coda-risparmio-chiamate`, `93-prompt-v7`, `57-haiku-summaries`,
   `26-landing-page`, `80-notes-backfill`, `120-technology-icons`.
6. **L'ordine consigliato per gli ambienti**, invariato: il **database separato per i preview** (oggi
   un `catalog:sync` da un preview scriverebbe in produzione), poi la **#65** ridotta alla sola
   strada 2 se lo stage si fa. ⚠️ La #65 **non è ancora decidibile**: dipende dallo stage, che sta
   in `APERTE.md`.
7. **A pagamento resta sotto il centesimo**: il submit a mano della #54, e nessuna issue aperta tocca
   Anthropic. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere**, e **un merge
   da solo non spende mai**. ⚠️ **Il `CRON_SECRET` di produzione non passa da questa chat**: i giri
   in produzione li lancia l'utente dal suo terminale, nemmeno quando sono gratis.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md, controlla la CI su main e ripartiamo
dalla #142`.
