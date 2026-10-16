# Interfaccia in cinque lingue, contenuto nella lingua in cui è stato pubblicato

L'interfaccia si legge in **inglese, italiano, francese, spagnolo e tedesco**; l'inglese resta la
base e la lingua in cui le stringhe nascono. Questo cambia la regola di `CLAUDE.md` e di
`CONTEXT.md` "codice, database e interfaccia in inglese", che da qui vale per **codice e database**:
l'interfaccia è tradotta, i **nomi del glossario in quanto identificatori** no.

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

⚠️ **Correzione del 2026-10-16, decisa dall'utente.** La prima stesura di questo ADR diceva "i nomi
del glossario non si traducono", e letta alla lettera dava "le **Release** delle **Technology** che
segui", che non è italiano. Quello che non si traduce è il **nome in quanto identificatore**: la
colonna "Codice / UI" di `CONTEXT.md` resta la verità per codice, database, chiavi e valori. Dentro
una frase dell'interfaccia vale invece la colonna "Dominio" della stessa tabella, cioè la parola che
quella lingua usa: in italiano **Tecnologia** e **Tecnologie**, non `Technology`, e così `Catalog` →
Catalogo, `Significance` → Rilevanza, `ReleaseNotes` → Note di rilascio, `Summary` → Sintesi. Dove
l'italiano tiene la parola inglese perché è quella che si usa, come **Release** e **Dashboard**, la
tiene: è la colonna "Dominio" a dirlo, non una regola nuova.
Resta fuori da questa correzione la **grammatica** del capoverso qui sopra: `featured`, `notable`,
`digest`, `preview` e i prefissi non sono nomi di cose, sono segni che compaiono identici dentro le
Sintesi, e quelli non si traducono in nessuna lingua.
⚠️ Per **francese, spagnolo e tedesco** `CONTEXT.md` non ha una colonna: le parole si scelgono nella
PR delle tre lingue e sono fra quelle **non riviste da madrelingua**.

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
`/account`, `/settings`, `/dashboard`, `/technologies`). Il prezzo accettato è scrivere noi
l'interpolazione e i plurali.

Il **selettore sta nel piede e nella pagina Settings**. Il piede c'è su ogni pagina (#132), quindi
la scelta è raggiungibile **da un visitatore** su una pagina pubblica a 390px, che è la No Dead End
Rule: una scelta che un visitatore non può raggiungere è una scelta che non ha. Da firmati la lingua
si cerca con le altre impostazioni, e quel posto è `/settings`.

⚠️ **Correzione del 2026-10-16, decisa dall'utente.** Prima qui c'era scritto "nel menu profilo", e
i cinque nomi stavano davvero dentro il pannello. Ora il pannello porta una **voce `settings`**
accanto a `account` e `sign out`, e la scelta della lingua sta nella **pagina `/settings`**, che
nasce con una sola impostazione perché le prossime si aggiungono lì invece di allungare un pannello
che non può crescere di una riga per preferenza. `/settings` è protetta come `/account`: un
visitatore non ci ha niente da tenere, e la lingua gliela dà il piede.

Le traduzioni sono **stringhe di prodotto scritte una volta e versionate nel repository**, mai
generate a runtime: niente chiamate AI, nessuna spesa. ⚠️ Italiano e inglese li rivede l'utente;
**francese, spagnolo e tedesco entrano non rivisti da madrelingua e vanno rivisti prima del
lancio**, e questa riga sta qui perché lo dica l'ADR invece di farli passare per verificati. Il
tedesco è il caso peggiore per la lunghezza delle parole: il limite tenuto è nessun overflow a 320px.

**Un albero solo, e il proxy che riscrive.** Ogni rotta sta sotto `src/app/[locale]`, e il proxy
riscrive `/technologies/vite` in `/en/technologies/vite` senza che l'indirizzo visto cambi. Così la
lingua è un **root param** e qualunque componente server la legge con `next/root-params` invece di
riceverla di mano in mano, e non esistono due file di rotta per pagina da tenere in sincrono. Il
prezzo, scelto dall'utente il 2026-10-15: il proxy gira su **ogni** richiesta di pagina, mentre
prima ne vedeva tre. ⚠️ Quello che le pagine pubbliche continuano a non pagare è il **giro di auth
a Supabase**, che era il costo vero: resta sulle rotte protette.
⚠️ **La riscrittura si costruisce clonando l'URL in arrivo**, non dal percorso: un URL costruito dal
solo percorso butta la query, cioè `?next=` del login, `?week=` del Digest e i filtri del Catalogo.
Lo hanno misurato sei E2E caduti.
⚠️ **Un indirizzo sconosciuto resta dentro la lingua** grazie a un catch-all `[...rest]` che chiama
`notFound()`: senza, un percorso che non combacia cadrebbe fuori da `app/[locale]` e Next
risponderebbe con la sua 404 nuda, senza guscio, senza tema e senza piede. `global-not-found.tsx`
era l'altra strada ed è stata rifiutata: è un secondo guscio con i suoi font, il suo script del tema
e il suo piede, e un piede incollato due volte è un piede che divergerà.
