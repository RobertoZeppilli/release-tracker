# Interfaccia in cinque lingue, contenuto nella lingua in cui è stato pubblicato

L'interfaccia si legge in **inglese, italiano, francese, spagnolo e tedesco**; l'inglese resta la
base e la lingua in cui le stringhe nascono. Questo cambia la regola di `CLAUDE.md` e di
`CONTEXT.md` "codice, database e interfaccia in inglese", che da qui vale per **codice e database**:
l'interfaccia è tradotta, i **nomi** del glossario no.

Il contenuto non si traduce, e la distinzione è l'argomento del prodotto, non una scorciatoia. Le
**Note di rilascio** sono il testo originale del progetto, conservato carattere per carattere perché
ogni affermazione di una **Sintesi** punta alla riga da cui è stata letta (`locateCitation`):
tradurle romperebbe il controllo verbatim. Le **Sintesi** restano in inglese perché le traduzioni
delle Sintesi sono fuori dall'MVP in `docs/DECISIONI.md`, e ogni lingua in più sarebbe una chiamata
ad Anthropic in più per Release, cioè l'unica cosa che spende. Conseguenza da dire, non da nascondere:
con l'interfaccia in italiano e la Sintesi in inglese **una pagina Release è mista, e lo dichiara**.

Il **vocabolario di dominio resta in inglese** in ogni lingua: `featured`, `notable`, `digest`,
`preview` e i prefissi `breaking[n]:`, `note:`, `help:`, `warning:`, `ok:` sono grammatica del
prodotto (`DESIGN.md`), gli stessi segni che compaiono dentro le Sintesi, che in inglese restano.
Tradurli spezzerebbe l'identità fra interfaccia, Sintesi e Note. La **legenda della landing** (#26)
si traduce comunque: è il posto dove quelle parole vengono spiegate, e spiegarle è esattamente ciò
che una legenda fa.

La lingua sta **nell'URL, e l'inglese non ha prefisso**: `/technologies/vite` è l'inglese canonico,
`/it/technologies/vite` l'italiano, e così `fr`, `es`, `de`. Un **cookie di lingua è escluso**:
leggerlo nella radice renderebbe dinamico tutto il sito e butterebbe l'ISR (`revalidate = 3600`),
che è il prezzo che il tema ha già rifiutato. Il prefisso lo evita, dà `hreflang`, canonici per
lingua e sitemap che le elenca tutte come conseguenze naturali, rende i link condivisibili nella
lingua in cui sono stati letti, **non cambia nessun URL già indicizzato** e lascia verdi i 239 E2E
che cercano stringhe inglesi. Il `lang` sull'`html`, oggi fisso a `en`, lo dice il segmento.

Si traduce con un **modulo di dominio nostro**, `src/modules/i18n`, non con una libreria: dizionari
per lingua validati con Zod e tipi derivati, `Intl.PluralRules` per i plurali, e nessun proxy sulle
rotte pubbliche, che oggi non pagano un giro di rete per scelta (`src/proxy.ts` gira solo su
`/account`, `/dashboard`, `/technologies`). Il prezzo accettato è scrivere noi interpolazione e
plurali.

Il **selettore sta nel piede e nel menu profilo**. Il piede c'è su ogni pagina (#132), quindi la
scelta è raggiungibile **da un visitatore** su una pagina pubblica a 390px, che è la No Dead End
Rule: una scelta che un visitatore non può raggiungere è una scelta che non ha. Nel menu profilo è
ripetuta perché da firmati la lingua si cerca con le altre impostazioni.

Le traduzioni sono **stringhe di prodotto scritte una volta e versionate nel repository**, mai
generate a runtime: niente chiamate AI, nessuna spesa. ⚠️ Italiano e inglese li rivede l'utente;
**francese, spagnolo e tedesco entrano non rivisti da madrelingua e vanno rivisti prima del
lancio**, e questa riga sta qui perché lo dica l'ADR invece di farli passare per verificati. Il
tedesco è il caso peggiore per la lunghezza delle parole: il limite tenuto è nessun overflow a 320px.
