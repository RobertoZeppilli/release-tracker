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

**Da dove ripartire (trentaduesimo giro, 2026-11-11): la vetrina è statica, e la produzione non ha
più un server.** PR #225 mergiata (`55ecebc`), deploy di produzione verde. Da qui lo stesso sorgente
costruisce due cose: `pnpm build` è l'app che si installa, `pnpm build:static` è la vetrina pubblica,
solo file, ed è quello che Vercel serve. **Nessuna issue sul codice locale può più rompere la
produzione**, che era la ragione di mettere la #215 davanti a tutte.

### Com'è fatta la vetrina, e perché così

`output: "export"` è globale: rifiuta una Server Action o un route handler **ovunque** sotto
`src/app`, anche su una pagina che non viene esportata. Le rotte non pubbliche non si possono
cancellare, perché l'app con il server è quella che si installa. Quindi `scripts/build-static.mts`
copia il sorgente in `.static-build/`, aggancia `node_modules` con una junction, taglia le rotte
elencate e costruisce da lì. ⚠️ **Se un percorso dell'elenco non esiste più lo script si ferma e lo
dice**, invece di costruire: una rotta che si sposta in silenzio è una Server Action che rientra
nell'albero, e l'errore che produce arriva pagine lontano dalla sua causa. Le prossime issue spostano
rotte: quando lo script si lamenta, l'elenco `PRIVATE_ROUTES` va aggiornato, non aggirato.

Il resto, in numeri misurati l'11: 107 Tecnologie e 1.981 Release in cinque lingue fanno **10.476
documenti** e 62.854 file, 2,0 GB; 6,3 minuti di generazione con sette worker, più 69 secondi di
compilazione a caldo e 3,4 minuti a freddo (la cache di Turbopack resta in `.static-build/`).
**Nessun indirizzo è cambiato**: l'inglese che l'export scrive sotto `en/` lo risale alla radice lo
script, e il 308 da `/en/*` lo dichiara `vercel.json` al posto del proxy.

### Verificato in produzione, e l'unica cosa che resta da guardare

200 su landing, Tecnologia, Release e le stesse in italiano, sitemap e robots; 308 da `/en/faq`;
**404 su `/login`, `/dashboard` e `/technologies`**, che su un sito di soli file non esistono. Il 404
vestito è rimasto: la rotta catch-all esporta il suo documento a `_404` e lo script lo mette al posto
del 404 nudo di Next.

⚠️ **Le scritture ISR a zero si leggono sul pannello di Vercel dopo due deploy**: è l'unico criterio
di accettazione della #215 che non si poteva chiudere dal codice. Vale la pena guardarlo, perché era
la spesa che la #215 doveva togliere.

⚠️ **In produzione il Rilevamento è fermo da adesso.** Il cron giornaliero è uscito da `vercel.json`,
perché `/api/jobs/detection` su un sito statico non esiste, e i dati della vetrina restano a quelli
dell'ultimo deploy finché la #211 e la #213 non portano il Rilevamento in locale. È l'ADR 0011, non
una perdita, e sta scritto anche nel commento sulla #215.

Noto e lasciato lì: in `404.html` il selettore della lingua punta cinque volte a sé stesso, quindi
chi è sul 404 e cambia lingua resta sul 404. Riscrivere quelle stringhe nell'HTML no: nello stesso
file c'è il payload RSC, e una sostituzione che cambia la lunghezza lo corrompe.

### Le undici issue che restano

#209 → #210 → #211 → #212 → #213 → #217 → #214 → #218 → #221 → #222 → #216. Tutte
`ready-for-agent` tranne la **#222**, che è `ready-for-human` ed è una porta a senso unico.

### Cosa resta a te

1. ⚠️ **Il ramo `209-filtro-deploy` ora si può cancellare**, e con lui l'unica cosa che restava da
   recuperare a mano. La #215 ha messo `supabase/migrations/` nel filtro dell'Ignored Build Step,
   che era metà di quel commit mai entrato (`7e40fd7`). L'altra metà, `scripts/`, **non deve
   entrare**: la build della vetrina *è* uno script, quindi uno script è esattamente una cosa che
   cambia il sito. La ragione per cui quel commit lo escludeva è spiegata dentro
   `scripts/vercel-ignore-build.mjs`, e non vale più.
2. **La #185** resta valida: la pagina è statica, ma le 121 righe di prosa pesano uguale.
   ⚠️ Il suo testo va ancora corretto, e la misura che lo smentisce è nel diario di novembre.
3. ⚠️ **`package.json` dice ancora `"name": "release-tracker"`**, e va cambiato nella **#214**, che
   è quella che pubblica. ⚠️ `verdict-tracker` su npm era libero l'11 novembre e resta libero fino
   al giorno in cui qualcuno lo pubblica: è una ragione per non far aspettare la #214.
4. ⚠️ **Gli e2e si lanciano con `E2E_PORT=3100 pnpm test:e2e`** (sulla 3000 vive `ai-intake-agent`,
   il perché in `AMBIENTE.md`). L'11 novembre erano 305 su 310: i cinque falliti passano da soli,
   erano timeout da carico.
5. **Gli accertamenti di sempre**, in `APERTE.md` e `AMBIENTE.md`. ⚠️ I tre `curl` dell'audit e gli
   header di sicurezza adesso **sono irrilevanti**.
6. **Ambiente**: Supabase locale **acceso**, avviato con
   `pnpm exec supabase start -x studio,inbucket`. ⚠️ **Credito basso: non spendere senza chiedere.**
