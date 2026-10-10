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

**Da dove ripartire (2026-10-10, dopo il dominio e la direzione scritta della #142).** Il lavoro sta
sul branch **`142-app-visual-direction`**, **non pushato**, due commit avanti a `main`: `c75969e`
(dominio e direzione) e `a961308` (il menu su telefono e la foto profilo). ⚠️ **Gli E2E non sono mai
stati eseguiti**: `typecheck`, `lint` e i 611 unitari sono verdi, ma la suite Playwright vuole il
server di sviluppo e Docker, che li avvia l'utente. **La prima cosa della sessione nuova è
`pnpm test:e2e`**, perché quattro file di test sono stati riscritti alla cieca.

**Cosa è stato deciso (2026-10-10).** Tre domande, tre risposte dell'utente:

1. **Lo stato vuoto della Dashboard resta a una colonna**, come oggi. Lo spacco separa due domande e
   con zero follow nessuna ha una risposta: metà pagina sarebbe un buco, sulla pagina che chi arriva
   vede per prima.
2. **La barra della Distanza resta**, col numero scritto accanto in parole e la barra `aria-hidden`.
3. ⚠️ **Il verdetto e le righe contano lo stesso insieme**, per Tecnologia seguita: le Release che
   chiedono qualcosa nel Cammino di upgrade **oppure** nella finestra di 30 giorni, ogni Release una
   volta. La somma delle righe **è** il verdetto, per costruzione: è la fine della contraddizione che
   ha fatto nascere lo spacco (`need action 3` sopra due righe che dicevano `1`). Il prezzo accettato:
   un `1 needs action` su una riga può venire da una Release fuori dal Cammino, e la riga non dice da
   dove.

**Cos'è scritto.** `CONTEXT.md` ha i nomi nuovi (**Posizione dello stack** `Standing`, **Distanza**
`Distance`, **Flusso** `Stream`) e ritira `Spotlight`, `Latest`, `Previews`; `docs/DECISIONI.md`
registra il rovesciamento invece di cancellarlo; `PRODUCT.md` segue. `DESIGN.md` porta The Two
Questions Rule, il token **Column verdict**, Standing Column, Stream Row e **Dashboard States**
(caricamento, errore per colonna, quota, riga sotto il pointer), e la Dashboard passa a **1240px**.

⚠️ **Tre regole scritte *contro* il mock di direzione**, che quindi è dietro a `DESIGN.md` in tre
punti e **non è più la fonte**: il glifo di Rilevanza resta neutro (la severità ha un glifo suo una
riga sotto); senza Versione in uso dichiarata non c'è Distanza, quindi nessuna barra e posto suo
nell'ordinamento; e `· you are on 15.0.0, 4 behind` perde il `4 behind`, che è un conto su un insieme
della colonna sinistra. **Quando il mock ufficiale c'è, `design/mocks/direction/` va cancellata.**

**La barra, fuori dalla #142 e chiesta dall'utente.** Su telefono le due sezioni sono righe da 44px
del foglio dell'account e **la strip da 40px non esiste più**: la barra è **una riga da 56px a ogni
larghezza**, che chiude anche il punto 4 dello stato vecchio (i 96px di arredo). Una copia sola di
ogni link, il breakpoint fa il lavoro. ⚠️ **Il gap è 12px sotto i 640px e non 24**: senza la strip la
riga non può più andare a capo, quindi sborderebbe, e a 320px i tre pezzi arrivavano a 2px dallo
schermo. La foto profilo riempie il bottone e ha perso il contorno suo; il bordo del bottone resta,
perché è quello che dice che è un bottone. `design/mocks/technologies.html` è stato allineato, gli
altri mock no.

### Cosa resta

1. **Il mock ufficiale `design/mocks/dashboard.html`**, rifatto sulla direzione e con dentro i quattro
   stati nuovi, da guardare in chiaro, a 390px e con la scrollbar **rimisurata**
   (`offsetWidth - clientWidth` deve valere 0). Poi il codice, poi le altre tre schermate.
2. **Un sistema di notifiche interno**, idea dell'utente del 2026-10-10: **issue a parte, non aperta**,
   da aprire su sua conferma. ⚠️ Non parte da zero: `docs/DECISIONI.md` ha già le **Notifiche** come
   Pro post-MVP (ADR 0004, email/Slack, pagamenti insieme) e lo **stato "Visto" per Release**
   rimandato proprio a loro. Un sistema *interno* è una cosa terza e va deciso prima di scriverlo.
3. ⚠️ **La #130**: Core Web Vitals veri in produzione e lettura dal telefono. **La misura di partenza
   non è mai stata presa**, e la barra a una riga sola l'ha appena cambiata di nuovo.
4. **La cancellazione dei rami**, locali e remoti, resta dell'utente (`git branch -D <ramo>`):
   `141-landing-redesign`, `139-detection-tag-variants`, `140-landing-entry-action`,
   `137-tag-format-variants`, `137-coda-risparmio-chiamate`, `93-prompt-v7`, `57-haiku-summaries`,
   `26-landing-page`, `80-notes-backfill`, `120-technology-icons`.
5. **L'ordine consigliato per gli ambienti**, invariato: il **database separato per i preview** (oggi
   un `catalog:sync` da un preview scriverebbe in produzione), poi la **#65** ridotta alla sola
   strada 2 se lo stage si fa. ⚠️ La #65 **non è ancora decidibile**: dipende dallo stage, che sta
   in `APERTE.md`.
6. **A pagamento resta sotto il centesimo**: il submit a mano della #54, e nessuna issue aperta tocca
   Anthropic. ⚠️ **Il credito dell'utente è basso: non spendere niente senza chiedere**, e **un merge
   da solo non spende mai**. ⚠️ **Il `CRON_SECRET` di produzione non passa da questa chat**: i giri
   in produzione li lancia l'utente dal suo terminale, nemmeno quando sono gratis.
7. **Il server di sviluppo è fermo.** Va riavviato dall'utente con `pnpm dev`, uno solo e sulla 3000.

Il primo comando della sessione nuova: `leggi docs/HANDOFF.md, lancia pnpm test:e2e e ripartiamo dal
mock ufficiale della Dashboard`.
