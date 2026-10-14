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

**Da dove ripartire (2026-10-14, sera): la #142 è chiusa, tutto è su `main`, i rami sono puliti,
non c'è niente in sospeso.** Le PR **#150** (le tre schermate) e **#151** (l'handoff) sono state
unite in squash dall'utente, `main` è a **`15edc10`** ed è in produzione. ⚠️ **Sul `main` locale
non si committa**, nemmeno un documento: ogni cosa passa da un ramo e da una PR.
`pnpm lint`, `pnpm typecheck`, **620 unitari** e **195 E2E verdi in una corsa sola**, axe compreso,
nei due temi. ⚠️ `release.spec.ts:100` è caduto una volta sola in una corsa piena e ripetuto due
volte passa: è un click su un `summary` che arriva prima dell'idratazione, non una regressione.
⚠️ **Le due immagini dell'utente in `docs/` sono state cancellate** su sua richiesta, mai committate.

### I rami morti, e come si è controllato che fossero morti

**Resta solo `main`**, in locale e su `origin`: dodici rami locali e dieci remoti cancellati
(2026-10-14, su richiesta dell'utente). ⚠️ **`git branch --merged` qui mente**: questo repository
unisce **in squash**, quindi git non vede come unito nemmeno un ramo che lo è, e `git branch -d` lo
rifiuta. Il controllo che vale è un altro: `gh pr list --state all --json headRefName,headRefOid`
e il **tip di ogni ramo confrontato col commit di testa della sua PR unita**. Coincidevano tutti,
quindi nessun ramo portava un commit arrivato dopo il merge. ⚠️ **Il merge non cancella il ramo
remoto** se non glielo si chiede (`--delete-branch`): `origin/142-technology-release` è
sopravvissuto al merge e anche a un `fetch --prune`, perché era ancora vivo su GitHub.

⚠️ **La riga unica del verdetto, il tetto del token che l'ha comprata e il resto di questo
giro** stanno in `docs/handoff/2026-10.md`, "I panel con un titolo solo (2026-10-14)": lì c'è
**perché non è la scala che cede alla copia**, le misure, e **come si misura una frase** senza
indovinare.

### Cosa resta

1. ⚠️ **I 14 KB di UI delle Release su ogni pagina**, `/login` compresa: lavoro suo, di chunking e
   di import dai barrel, **non deciso**, e da pesare contro la regola delle Script KB.
2. ⚠️ **`DESIGN.md` va riletto col sospetto, non citato**: quattro sessioni di fila l'hanno trovato
   indietro. **Le due tabelle, i colori e la tipografia, sono ora tenute da un test**
   (`src/app/design-tokens.test.ts`): il 2026-10-14 la seconda è stata legata al CSS e controllata,
   e diceva ancora `whiteSpace: nowrap` per un token la cui riga unica è comprata dal tetto. Il test
   guarda misura, interlinea e spaziatura, che è quello che i token portano; **peso e famiglia sono
   classi, non token, e stanno nella prosa**. ⚠️ **La prosa non è tenuta da niente**: lì il sospetto
   serve ancora.
3. ⚠️ **Le conversioni `max-[]` del resto dell'app non sono decise**: 43 `max-[640px]`, 19
   `max-[1040px]`, 7 `max-[880px]` tra Dashboard, `/technologies`, landing e barra. I file di
   Technology e di Release sono convertiti. ⚠️ **La barra usa ancora `sm:px-5`**, quindi a 640px
   esatti ha 24px di padding dove la pagina Release ne ha 16.
4. **Il mock disegna due righe che il modello non produce**, la spiegazione di cosa cambia e il fix
   diff: lo schema dà solo `change` e `migration`. Sarebbero dominio nuovo, da fissare prima in
   `CONTEXT.md`.
5. Debito piccolo: `groupByMajor` e `recordedHistory` calcolano quasi la stessa cosa e la pagina
   Technology chiama entrambe. Si uniscono quando conviene, non subito.
6. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere.** Niente di questo
   lavoro tocca Anthropic. **Le cose dell'utente** stanno in `APERTE.md`, **l'ambiente** in
   `AMBIENTE.md`, **come si misura una pagina** in `PESO.md` e il resto di questa sessione in
   `docs/handoff/2026-10.md`. ⚠️ Per guardare la pagina Release serve una Sintesi `ready`: l'`update`
   e il `restore` sono in `PESO.md`, e **il database locale è come era** (zero Sintesi `ready`).
   Docker e il dev server sulla 3000 erano attivi a fine sessione.

⚠️ **Le issue restano sospese per scelta dell'utente**: il lavoro seguente lo rilancia lui.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md`.
