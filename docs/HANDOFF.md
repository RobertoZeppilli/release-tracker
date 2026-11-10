# Handoff, release-tracker: implementazione delle issue

Parla con l'utente **in italiano**. Progetto in `C:\Users\rober\progetti\release-tracker`, repository
git con remote **pubblico** su **https://github.com/RobertoZeppilli/release-tracker** (branch `main`, `gh`
autenticato). Next.js 16 + Tailwind 4 + Vitest; comandi in `CLAUDE.md`.
Produzione: **https://release-tracker-drab.vercel.app** (diventa una vetrina statica, #215).
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

**Da dove ripartire (trentesimo giro, 2026-11-10): Verdict non si vende piu'.** L'utente ha deciso
oggi che l'app diventa **open source**, si scarica con `npx verdict-tracker` e gira sul computer di
chi la usa con la sua chiave Anthropic. Le ragioni sono sue e stanno scritte nell'**ADR 0011**: dare
una mano alla comunita' degli sviluppatori, e farsi conoscere come sviluppatore. **Niente codice e'
stato scritto oggi**: la sessione ha deciso, aperto dieci issue e aggiornato i documenti.

### Cosa cambia, in una riga per cosa

Via il Piano, i pagamenti e **l'autenticazione** (una copia e' di una persona sola). Via **Supabase**:
il database diventa un file SQLite in `~/.verdict/`, letto con `node:sqlite`, che sta dentro Node 24.
Le Sintesi passano dalla **Messages API** invece dei batch, Haiku 5.5 resta. Il Rilevamento parte
quando apri la Dashboard se i dati sono vecchi, o col bottone. Lo stato personale (Tecnologie seguite
e Versioni in uso) sta in **`verdict.json`**, non nel database, cosi' si copia su un altro computer.
Le pagine pubbliche restano indicizzate come **sito statico senza nessuna variabile d'ambiente**, e
cosi' **le scritture ISR vanno a zero**: con `revalidate = false` le faceva il deploy, 2.275 pagine
per volta. Licenza **MIT**, README e CONTRIBUTING in inglese; glossario, documenti interni e issue
restano in italiano. Le cinque lingue restano, e la revisione di francese, spagnolo e tedesco diventa
il primo contributo che si chiede.

### Le tredici issue, nell'ordine in cui il sito pubblico non si rompe mai

#219 → #215 → #209 → #210 → #211 → #212 → #213 → #217 → #214 → #218 → #221 → #222 → #216. Ogni issue porta i suoi criteri di accettazione e il suo "Blocked by".

⚠️ **La #215 sta seconda, e non e' un dettaglio di gusto**: il sito e' il progetto da portfolio
dell'utente, e la #211 toglie Supabase mettendo un file sul disco, che su Vercel fra due richieste non
esiste. Fatta statica subito, mentre Supabase e' ancora in piedi e serve i dati in build, la produzione
diventa solo file e **nessuna issue sul codice locale la puo' piu' rompere**. Le scritture ISR vanno a
zero da subito. Il contenuto nuovo della landing e' la **#221**, lo spegnimento di Supabase e delle
chiavi la **#222** (`ready-for-human`, porta a senso unico).

⚠️ **La porta a senso unico e' la #222**: Supabase si cancella **solo dopo** che i suoi dati sono nel
file distribuito e verificati. La' ci sono le Sintesi gia' pagate, e si ricomprano se si spegne prima.

### Le decisioni che sembreranno strane a chi legge dopo

- **La chiave Anthropic e' obbligatoria** anche se la Action della vetrina potrebbe servire le Sintesi
  a tutti gratis. Considerata e scartata il 2026-11-10: un'app che vive perche' il suo autore continua
  a pagare muore quando lui smette. Il file iniziale porta le Sintesi gia' fatte, quindi la prima
  apertura e' piena; la chiave serve dalle Release nuove.
- **Le Notifiche hanno due forme**: campanella e Digest mentre l'app gira, e il workflow nel
  repository di chi usa l'app per essere avvisati ad app chiusa. L'email esce dall'MVP, quindi la
  **#173 va riscritta** tenendo il Digest.
- **La #69 (import da `package.json`) cambia peso**: su un'app che gira dentro la cartella del tuo
  progetto non e' una comodita', e' il modo naturale di iniziare. Scrive in `verdict.json` (#217).
  L'utente non l'ha ancora messa in coda alla catena: va proposta.

### Cosa e' stato fatto oggi, per non rifarlo

Chiuse **#174**, **#176**, **#65** e **#206**, col motivo nel commento. Scritto l'**ADR 0011**, con una
nota di superamento appesa agli ADR **0004**, **0007**, **0009** e **0010**, che restano. Puliti
**`CLAUDE.md`** (non dice piu' "SaaS") e **`GLOSSARY.md`**: via Piano, Prova di Pro, Cancellazione
dell'account, Lista d'attesa e Iscrizione, **Sviluppatore** senza autenticazione, **Seguire** in `verdict.json`.

### Cosa resta a te

1. ⚠️ **Le PR #207 e #208 erano gia' mergiate** (2026-11-09, 21:43) e l'handoff di ieri non lo
   diceva: la lista d'attesa e' in produzione, la landing chiede un indirizzo e il callback cancella
   gli account appena nati. La smonta la **#219**, dove un passo e' tuo: **guardare se qualcuno si e'
   iscritto** prima di cancellare la tabella. Da cancellare i rami `185-dizionario-al-client`,
   `198-confine-free-pro`, `206-schema-lista-attesa`, `206-lista-attesa`; il `main` locale e' indietro.
2. **La #185** resta aperta e valida: le 121 righe di prosa stanno su una pagina che diventa statica,
   quindi il peso e' lo stesso. ⚠️ Il suo testo va ancora corretto (la misura della prosa nei props
   del client component), ed e' nel diario di novembre.
3. ⚠️ **Non e' stato scritto codice**: nessuna delle tredici issue e' cominciata.
4. **Gli accertamenti di sempre**, in `APERTE.md` e `AMBIENTE.md`. ⚠️ I tre `curl` dell'audit e gli
   header di sicurezza **diventano irrilevanti** su un sito statico senza rotte: non spendere tempo la'.
5. **Ambiente spento**: nessun server in ascolto, `db:stop` con backup, la 3000 libera.
   ⚠️ **Credito basso: non spendere senza chiedere.**
