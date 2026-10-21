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
`DESIGN.md` e i mock in `design/mocks/`, **ADR 0008** per le cinque lingue.

⚠️ **Prima di dare qualcosa per non deciso, cercalo là**: `grep -rn "<parola>" docs/handoff/`.
⚠️ **Le issue erano sospese e l'utente le ha rilanciate il 2026-10-15** chiedendo la #131: la
sospensione è finita, ma vale sempre la regola di chiedere prima di passare a una issue nuova.

**Come si tiene.** Lo stato nuovo si scrive qui sotto; quando quello di prima diventa storia, **si
sposta parola per parola** in cima al file del suo mese, con un titolo `##` proprio, e si aggiunge la
riga in `INDICE.md`. Niente riassunti: un riassunto è dove si perde la ragione per cui una cosa era
stata decisa. Se questo file supera le 100 righe, **si sposta, non si taglia**.

## Stato

**Da dove ripartire (nono giro, lavorato il 2026-10-16 e chiuso il 2026-10-21): la 3b-1 è finita
e committata in `8796e6f`, non pushata, PR non aperta.** Il ramo
`131-ui-strings-app-it` ha l'estrazione delle stringhe dell'app (sessione di prima) **e il dizionario
italiano**, scritto in questa sessione. Su `main` (squash `da0a6d1`) ci sono la PR 1 (ADR 0008), la
PR 2 (`app/[locale]`, il proxy, i canonici), la PR 3a (il motore del dizionario e il guscio) e la
pagina `/settings` col piede rifatto.

⚠️ **Il primo passo della sessione nuova è il push e la PR della 3b-1** (`Closes #131` in inglese
nel corpo, il resto in italiano), che l'utente non ha ancora confermato. Poi restano la **3b-2**
(la landing, dove la prosa italiana va letta con calma e le frasi con markup dentro vanno
ricomposte), la **3b-3** (le pagine documento: `faq`, `terms`,
`privacy`, `attributions`, `contact`, 557 righe di prosa, e per terms e privacy resta da decidere se
l'inglese fa fede) e la **PR 4** (francese, spagnolo, tedesco, e l'overflow a 320px in tedesco).

### Cos'è entrato nella 3b-1 in questa sessione

1. **Dieci file `messages/it/*.ts`**, uno per spazio di nomi come l'inglese, e `TRANSLATIONS` in
   `messages/index.ts` che ora è `{ it: IT }`. Da qui il test di parità **controlla davvero**
   qualcosa: 680 unitari contro i 675 di prima, e i cinque nuovi sono le asserzioni su `it`.
2. **Ogni messaggio contato ha anche la forma `many`**, che `Intl.PluralRules` dà all'italiano (e
   al francese e allo spagnolo, mai al tedesco) per le cifre tipo 1000000: il testo è lo stesso di
   `other`, ma il test lo pretende scritto, perché un `many` mancante sarebbe la mezza traduzione
   silenziosa.
3. **Tre parole decise con l'utente**, e scritte in `CONTEXT.md` invece che solo nel dizionario:
   `breaking changes` **resta inglese**, `safe to upgrade` è **"aggiornamento sicuro"**, `key
   points` è **"punti chiave"**. In tabella sono finite anche le righe `UI` per lingua di
   `actionRequired` e `notesJudgeable`.
4. ⚠️ **Quattro verdetti sono stati accorciati perché l'italiano non ci stava**, ed è la regola
   che lo impone (DESIGN.md, The One-Line Verdict Rule: la copia cede, la scala no). Misurato nel
   browser: a 1.2rem dentro i 326px del pannello la riga tiene **26 caratteri, etichetta compresa**
   (`note: 3 senza un verdetto` misura 309px). Perciò `richiedono un intervento` è diventato
   **`interventi`** (`warning: 2 interventi`), `niente richiede un intervento` è **`nessun
   intervento`**, e `not enough notes to judge` è **`note non giudicabili`**, che per di più è il
   nome che il glossario già dà a quelle note. ⚠️ **Da far vedere all'utente**: è il punto dove
   l'italiano dice meno dell'inglese.
5. **Tre E2E aggiornati**, e due di loro sono la metà che il test di parità non può vedere: il
   selettore nel piede si cerca per **`lingua`** dentro una pagina italiana, e la riga che dice che
   la pagina è mista si legge **in italiano**. Il terzo è un debito della sessione di prima:
   `expect(html).not.toContain("Unfollow")` falliva perché **la pagina ora si porta dietro il
   proprio dizionario**, dove `Unfollow {name}` è una voce; ora guarda lo stato reso
   (`aria-pressed="true"` e l'etichetta col nome dentro), che è quello che il test voleva dire.

### Dove sta il giro

`lint`, `typecheck`, `build` (ISR intatto), **680 su 680** unitari, **70 su 70** di integrazione.
L'E2E **contro il dev server** fa 250 su 253, e i tre che cadono **non sono dell'italiano**: due
sono `a11y:169` "technologies, with a follow the database refused", il flaky che l'handoff del
settimo giro già elencava (`target-size` su un Follow della pagina inglese, e un timeout sull'altro
tema); il terzo è `locales:35`, che è **l'artefatto del dev server** già scritto lì: l'overlay di
Next aggiunge un secondo `<footer>` e la strict mode cade. ⚠️ **Resta da fare il giro buono**,
`CI=1 pnpm test:e2e` col dev server spento, che non ho lanciato perché il server sulla 3000 è
dell'utente. Nei giri parziali anche `account.spec:51` e `legal.spec:72` sono caduti una volta e
poi passati da soli: flaky, non regressioni.

### Cosa resta

1. ⚠️ **I 14 KB di UI delle Release su ogni pagina** e le **`max-[]`** non sono decise.
2. **Il mock disegna due righe che il modello non produce**; `groupByMajor` e `recordedHistory`
   calcolano quasi la stessa cosa.
3. ⚠️ **Credito basso: non spendere niente senza chiedere.** Le cose dell'utente in `APERTE.md`,
   l'ambiente in `AMBIENTE.md`, il peso in `PESO.md`.
4. **Committato su richiesta dell'utente**, in un commit solo (`8796e6f`, 97 file): l'estrazione
   della sessione precedente e il dizionario insieme, perché separandoli il primo dei due sarebbe
   uno stato mai girato da solo, e nella PR finiscono squashati comunque. L'handoff è nel commit
   dopo. ⚠️ **Niente è pushato.** ⚠️ **Otto rami da cancellare** e lo stash
   `residuo del checkout interrotto`, che sono dell'utente.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
