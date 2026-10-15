# Verdict — dominio

Le parole con cui si parla del tracciamento delle release delle tecnologie che uno sviluppatore
segue, e di come vengono smistate nella sua dashboard.

**Verdict** è il nome del prodotto, deciso il 2026-10-08 (`docs/DECISIONI.md`, "Il nome: Verdict").
Si scrive con la maiuscola, senza articolo e senza traduzione: "Verdict mostra", non "il Verdict".
`release-tracker` resta soltanto il nome del repository e della cartella di lavoro.

## Release

**Tecnologia**:
Un linguaggio, framework o libreria che uno sviluppatore può seguire e che pubblica **Release**
versionate.
_Evitare_: pacchetto, dipendenza, tool.

**Catalogo**:
L'insieme curato delle **Tecnologie** che si possono seguire. Lo gestisce l'amministratore; gli
utenti non lo modificano.
_Evitare_: registry, lista pacchetti.

**Genere**:
Il mestiere che una **Tecnologia** svolge in uno stack, e il modo in cui il **Catalogo** si legge:
una **Tecnologia** ha esattamente un **Genere**. Non viene dalla **Fonte**, che non lo dichiara: lo
**curiamo noi** nel file `catalog/<slug>.json`, come curiamo il **Catalogo** stesso. I **Generi**
sono un insieme chiuso di dieci, nei nomi e nell'ordine qui sotto, e il database rifiuta un valore
che non sia uno di questi. L'ordine non è alfabetico: va dal linguaggio alla piattaforma, perché il
**Catalogo** si scorre per metterne insieme uno stack, non per cercare un nome che si sa già.

| Genere | Codice / UI | Tecnologie |
| --- | --- | --- |
| Linguaggio | `language` | typescript, rust |
| Runtime | `runtime` | nodejs, deno, bun |
| Framework | `framework` | angular, astro, next, nuxt, react, svelte, sveltekit, vue |
| Framework server | `server framework` | express, fastify, nestjs, trpc |
| Database | `database` | prisma, drizzle-orm |
| Strumento di build | `build tool` | vite, webpack, turborepo, pnpm |
| Test | `testing` | vitest, jest, playwright, storybook |
| Lint e formattazione | `lint and formatting` | eslint, prettier, biome |
| Libreria | `library` | axios, zod, tailwindcss, zustand, redux-toolkit |
| Piattaforma | `platform` | electron, terraform |

**`library` è un genere, non un residuo**: è una **Tecnologia** che si importa dentro il codice
dell'applicazione e che non detta la forma del progetto, al contrario di un `framework`, né gira da
fuori su quel codice, al contrario di un `build tool`, di `testing` o di `lint and formatting`. Si
definisce così in positivo, ed è il motivo per cui `axios` e `tailwindcss` stanno nella stessa
casella pur non somigliandosi. Non esiste e non va creato un genere "altro".
_Evitare_: categoria, tipo, tag.

**Tecnologia ritirata**:
Una **Tecnologia** tolta dal **Catalogo**: non ha più **Rilevamento**, ma le sue **Release** e
**Sintesi** restano consultabili e chi la seguiva la vede segnalata. Una **Tecnologia** non si
cancella mai. Se il suo file torna nel **Catalogo**, torna seguibile e rilevata.
_Evitare_: eliminata, disattivata, archiviata.

**Fonte**:
Un canale esterno da cui si osservano le **Release** di una **Tecnologia** (es. repository GitHub,
pacchetto npm). Una **Tecnologia** ha una o più **Fonti**, ognuna con un ruolo: **rilevare** le
nuove **Versioni** (npm, PyPI, GitHub Releases) o **fornire le Note di rilascio** (GitHub Releases,
`CHANGELOG.md`).
Una **Tecnologia** ha al massimo una **Fonte** per ruolo e tipo. Una **Fonte** tolta dal **Catalogo**
si cancella: è configurazione, e le **Note di rilascio** che ha fornito restano.
_Evitare_: provider, integrazione, feed.

**Formato dei tag**:
Come una **Fonte** `github-releases` scrive una **Versione** nei suoi tag. È un testo con segnaposto
fra graffe, e i segnaposto sono solo le parti di una **Versione**: `{version}` (la **Versione**
intera, come la scrive la fonte), `{major}`, `{minor}`, `{patch}`, `{prerelease}`. Un nome diverso è
rifiutato quando si legge il **Catalogo**: un segnaposto che nessuno sostituisce darebbe un tag che
non esiste, e le **Note di rilascio** mancherebbero senza dirlo.
Il formato di base (`tagFormat`) contiene sempre `{version}` intera, perché il **rilevamento** legge
la **Versione** fuori dal tag e deve poterla ritrovare. Una **Fonte** che **fornisce le Note di
rilascio** può dichiarare in più un **formato delle Anteprime** (`prereleaseTagFormat`), usato solo
per le **Versioni** che hanno un prerelease: serve quando una **Tecnologia** scrive l'**Anteprima**
in un altro modo, come TypeScript, che pubblica `6.0.1-rc` e la tagga `v6.0-rc`. Quel formato può
perdere delle parti, perché nessuno ci rilegge una **Versione** dentro.
Un formato copre **una sola epoca** del repository, e un progetto può cambiare convenzione: Angular
taggava `21.0.3` nel 2025 e tagga `v21.0.3` oggi, Drizzle ORM il contrario. Per questo la ricerca
delle **Note di rilascio** prova sempre **due tag** per **Versione**: il formato dichiarato e la sua
**variante**, cioè lo stesso formato con la `v` davanti alla **Versione** aggiunta o tolta, con la
precedenza al formato dichiarato. Quando la lista dei rilasci non contiene né l'uno né l'altro, i
due tag si chiedono **uno per uno**, perché un rilascio può esistere senza comparire nella lista,
come succede a Express. Non è un motivo per girare il `tagFormat` del **Catalogo**: va dichiarata la
forma che vale per la maggioranza delle **Release**, e l'altra epoca la trova la variante.
Anche il **rilevamento** legge **entrambe le forme**, perché la lettura inversa paga il cambio di
convenzione più della ricerca delle **Note di rilascio**: un tag nell'altra forma non dà una
**Release** muta, non dà nessuna **Release**. Le due forme valgono **sempre**, non solo quando la
dichiarata non trova niente: un repository in transizione tagga nelle due forme insieme, come fa
Prisma con 250 tag senza la `v` e 18 con, e un ripiego lì non scatterebbe mai. È il caso in cui la
perdita è definitiva, perché il **rilevamento** prende solo ciò che è più recente della **Release**
più recente che conosce. Quello che tiene fuori il tag di un altro pacchetto non cambia: ciò che
resta deve essere una **Versione**, quindi una forma permissiva non decide da sola.

**Seguire**:
La scelta di uno sviluppatore di vedere nella propria dashboard le **Release** di una
**Tecnologia** del **Catalogo**. Si possono **Seguire** solo **Tecnologie** non ritirate; una
**Tecnologia ritirata** già seguita resta seguita finché lo sviluppatore non smette, e da quel momento
non si può più seguire. Il comando per **Seguire** non compare mai su una **Tecnologia ritirata** che
lo sviluppatore non segue, in nessuna schermata: offrirebbe un'azione che il database rifiuta. Le
**Tecnologie ritirate** seguite contano nel limite del **Piano**.
_Evitare_: iscriversi, abbonarsi, preferito.

**Versione in uso**:
La **Versione** di una **Tecnologia** che uno **Sviluppatore** dichiara di usare, salvata sul suo
**Seguire**: una per **Tecnologia** seguita, facoltativa. È **dichiarata, non osservata**: l'app non
la verifica mai e resta com'è finché non è lo **Sviluppatore** a cambiarla, quindi ogni schermata che
ci costruisce sopra un conto dice anche **da quando** quella dichiarazione è ferma, altrimenti il
conto diventa falso in silenzio. Vale la stessa validazione della **Versione** di partenza del
**Cammino di upgrade**: ben formata e non più recente dell'ultima **Release** stabile; uguale
all'ultima vuol dire già aggiornato. Una **Tecnologia ritirata** seguita può averla come le altre.
Chi non la dichiara vede l'app come chi non l'ha mai avuta: è una dichiarazione in più, non un passo
obbligato.
Dove c'è, è la **Versione** di partenza del **Cammino di upgrade** di quella **Tecnologia**, e vince
sulla **Versione** di partenza che la pagina ricaverebbe da sola; `?from=` la scavalca per una
singola occhiata e non cambia quella salvata. E per ogni
**Tecnologia** seguita rende calcolabili le **Release** successive e quante richiedono un
**Intervento richiesto**, con le stesse regole del **Cammino di upgrade**: le **Release** senza
**Sintesi** _Pronta_ e quelle le cui note non sono **Note giudicabili** non contano né come sicure
né come **Intervento richiesto**, e le _Digest_ non entrano nel conto. Come la **Dashboard** lo mostri è design, non dominio.
_Evitare_: versione installata, versione attuale, stack, dipendenza.

**Richiesta di tecnologia**:
La segnalazione di una **Tecnologia** assente dal **Catalogo**, che l'amministratore approva o
scarta. Non fa parte dell'MVP.
_Evitare_: suggerimento, tecnologia custom.

**Release**:
Una pubblicazione di una **Tecnologia**, identificata da una **Versione** e con una **Rilevanza**.
Esiste una sola **Release** per **Versione**, qualunque sia il numero di **Fonti** che la osservano.
_Evitare_: aggiornamento, update, rilascio.

**Anteprima**:
Una **Release** beta o release candidate: il suffisso è esattamente `beta` o `rc`, eventualmente
seguito da un numero (`-beta`, `-rc.1`). Solo la prima **Anteprima** di una nuova major riceve una
**Sintesi**. Canary, nightly, experimental, alpha, le build con hash o data (`-rc.0-next-…`) e ogni
altro suffisso di pre-release non sono **Release** e non vengono registrate.
_Evitare_: pre-release, canary, preview.

**Versione**:
L'identificativo grezzo di una **Release** così come lo dichiara la fonte (es. `19.0.0`,
`v22.1.0`, `5.6-rc`). È un dato, non un giudizio.
_Evitare_: usare "major/minor/patch" come sinonimo di importanza.

**Rilevanza**:
Il peso di una **Release** per chi segue la **Tecnologia**: _In evidenza_, _Novità_, _Digest_ o
_Anteprima_ (beta e release candidate).
Si ricava dalla **Versione** con la **Strategia di classificazione** della tecnologia e può
essere corretta a mano.
I quattro livelli, detti a parole, perché è così che la landing li definisce (issue #26) e perché
dentro l'app la parola si vede sempre senza spiegazione:
- _In evidenza_ (`featured`): la **Release** in cui la **Tecnologia** cambia direzione. Quale sia
  lo dice la sua **Strategia di classificazione**: una major nuova dove vale SemVer, una x.y nuova
  per chi pubblica le novità lì. Porta il glifo pieno nel **Flusso**, e non ha più una sezione sua:
  nel **Verdetto della Dashboard** entra come ogni altra **Rilevanza** della finestra.
- _Novità_ (`notable`): lavoro nuovo senza cambio di direzione, cioè una minor dove vale SemVer e
  le major dispari di Node. Da leggere, raramente urgente.
- _Digest_ (`digest`): quello che la regola tratta come ordinario, le patch in testa. Non
  interrompe: nel **Flusso** si legge piegato per settimana ISO, nel **Digest settimanale**.
- _Anteprima_ (`preview`): una beta o una release candidate (vedi **Anteprima**). Solo la prima di
  una nuova major riceve una **Sintesi**; canary, nightly e alpha non sono **Release**.
_Evitare_: priorità, severità, tipo SemVer.

**Note di rilascio**:
Il testo originale che accompagna una **Release**, preso dalla **Fonte** che le fornisce e
conservato così com'è.
_Evitare_: changelog (è uno dei posti da cui arrivano), descrizione.

**Sintesi**:
Il riassunto generato dall'AI a partire dalle **Note di rilascio** di una **Release**, centrato su
novità e breaking changes. Senza **Note di rilascio** non esiste **Sintesi**.
_Evitare_: summary, riassunto AI, descrizione.

**Intervento richiesto**:
Il giudizio esplicito di una **Sintesi** su se aggiornare alla **Release** richiede modifiche al
codice di chi la usa. Si basa solo su ciò che dicono le **Note di rilascio**: se non citano
breaking changes, non se ne deducono. È _sì_ esattamente quando la **Sintesi** elenca almeno una
breaking change, e ogni breaking change dice come migrare: un output che non rispetta questo
legame è una **Sintesi** _Fallita_. Un _no_ vale solo se le **Note di rilascio** erano
**Note giudicabili**: senza quelle, l'**Intervento richiesto** non si pronuncia.
_Evitare_: breaking flag, safe to upgrade.

**Note giudicabili**:
**Note di rilascio** che descrivono dei cambiamenti, e quindi su cui un giudizio è possibile. Non lo
sono le note il cui contenuto rimanda soltanto altrove: un link al changelog o al confronto fra due
tag, un hash di commit, un titolo con la sola **Versione**, un rinvio a un annuncio. Note che
dichiarano di non avere cambiamenti ("no changes", "no user facing changes") **sono** giudicabili:
dicono qualcosa, e il loro _no_ all'**Intervento richiesto** vale.
Su note non giudicabili una **Sintesi** _Pronta_ non afferma né che l'upgrade è sicuro né che
richiede intervento: la **Release** si legge come una senza **Sintesi** _Pronta_, cioè da
controllare, e il prodotto dice dove stanno le note vere. "Non ho trovato breaking changes" e "non
ci sono breaking changes" sono affermazioni diverse e il prodotto non stampa la seconda al posto
della prima. In dubbio tace: una nota che descrive qualcosa resta giudicabile.
Chi lo dice: la **Sintesi** stessa, col campo `notesJudgeable` che il prompt `v7` le chiede, perché
il modello ha letto le **Note di rilascio** intere. Quando il campo manca, cioè nelle **Sintesi**
generate con un prompt precedente, risponde l'euristica di `notesJudgeable`, che legge i primi 400
caratteri e resta la rete per quelle. Un **Intervento richiesto** _sì_ non si ritira comunque: una
breaking change elencata è un fatto preso dalle note.
_Evitare_: note vuote, note povere, low quality notes.

**Stato della sintesi**:
A che punto è la **Sintesi** di una **Release**: _In attesa_, _In corso_, _Pronta_,
_Non disponibile_ (mancano le **Note di rilascio**), _Non generata_ (possibile, ma scelto di non
farla) o _Fallita_. Una **Release** è visibile in
dashboard qualunque sia questo stato.

Quando le **Note di rilascio** arrivano dopo, perché una **Fonte** ha imparato a trovarle, una
**Sintesi** _Non disponibile_ passa a _Non generata_, mai direttamente a _In attesa_: le note
diventano leggibili e nessuna **Sintesi** si genera a sorpresa. Lo stato va cambiato comunque,
perché _Non disponibile_ dichiara sulla riga che non ci sono note da riassumere e nasconde il link
alle note: lasciarlo direbbe il falso proprio sulle **Release** appena riempite. Rimettere _In
attesa_ è un gesto a parte, chiesto a mano, perché è l'unico che spende. Deciso il 2026-10-09 con la
issue #80.
_Evitare_: status job, flag summarized.

**Rilevamento**:
La fase che interroga le **Fonti**, registra le nuove **Release**, ne assegna la **Rilevanza** e ne
raccoglie le **Note di rilascio**. Non produce **Sintesi**.
_Evitare_: sync, polling, fetch.

**Importazione iniziale**:
Il primo recupero delle **Release** passate quando una **Tecnologia** entra nel **Catalogo**:
solo gli ultimi 12 mesi, più l'ultima **Release** _In evidenza_. Le **Release** così ottenute
sono **importate**; quelle trovate dai **Rilevamenti** successivi sono **rilevate**.
_Evitare_: backfill, seed, sync iniziale.

**Storico**:
Le **Release importate** che non ricevono una **Sintesi** (_Non generata_): consultabili con
**Note di rilascio** e link, ma fuori dalla coda di **Sintesi**.
_Evitare_: archivio (è il posto del Digest), legacy.

**Strategia di classificazione**:
La regola con cui una **Tecnologia** traduce una **Versione** in una **Rilevanza**. Le **Anteprime**
seguono la stessa regola in tutte le Strategie.
- `semver` (SemVer puro): x.0.0 _In evidenza_, x.y.0 _Novità_, le patch _Digest_.
- `node` (LTS pari/dispari): le major pari (x.0.0) sono _In evidenza_ perché diventeranno LTS; le
  major dispari e le x.y.0 sono _Novità_; le patch _Digest_.
- `typescript`: ogni x.y è _In evidenza_, ma la sua prima stabile non è x.y.0 (5.9.0-beta, 5.9.1-rc,
  5.9.2). È _In evidenza_ la prima **Versione** stabile di ogni x.y tra quelle osservate dalle **Fonti**;
  le successive sono _Digest_.
- `zerover` (librerie 0.x): in 0.x rompe la minor, quindi 0.y.0 è _In evidenza_ e ogni altra 0.y.z è
  _Digest_; da 1.0.0 vale `semver`.
- `minor-major` (la minor vale come una major): per le **Tecnologie** che pubblicano le novità nel
  minor e non cambiano major da anni (Rust, Terraform, Playwright, Vue), ogni x.y.0 è _In evidenza_ e
  le patch sono _Digest_. Senza, la loro ultima **Release** _In evidenza_ resterebbe per sempre la
  x.0.0 di anni fa.
_Evitare_: parser, regola SemVer.

**Correzione di rilevanza**:
Una **Rilevanza** assegnata a mano dall'amministratore a una singola **Release**. Prevale sulla
**Strategia di classificazione** e nessun **Rilevamento** la sovrascrive.
_Evitare_: override manuale, forzatura.

## Dashboard

**Dashboard**:
La vista personale di uno sviluppatore, divisa in **due parti che rispondono a due domande
diverse**: la **Posizione dello stack**, cioè dove stanno le **Tecnologie** che segue, e il
**Flusso**, cioè cos'è uscito.
Non è divisa per **Rilevanza**. Le sezioni **In primo piano**, **Novità** e **Anteprime** non
esistono più: una **Tecnologia** compariva fino a quattro volte nella stessa schermata, una volta
per sezione, e il lettore doveva ricomporre da sé dove fosse il suo stack. La **Rilevanza** resta,
sulla riga, come glifo.
_Evitare_: home, sezioni per rilevanza, feed (il **Flusso** è metà pagina, non la pagina).

**Verdetto della Dashboard**:
La riga in testa alla **Dashboard**, che risponde a una domanda sola: fra le **Release** di cui la
pagina rende conto, ce n'è qualcuna che richiede **Intervento richiesto**? L'insieme di cui rende
conto è tutto quello che la pagina mostra come lavoro possibile, e si legge **per Tecnologia
seguita**: le sue **Release** nella finestra del **Flusso**, qualunque sia la loro **Rilevanza**, e
quelle del suo **Cammino di upgrade** quando ha una **Versione in uso**. Una **Release** che sta in
entrambi conta una volta: il verdetto conta **Release**, non occorrenze.
**La somma delle righe della Posizione dello stack è il verdetto**, e lo è per costruzione: ogni
riga conta le **Release** di quella **Tecnologia** che chiedono qualcosa, in uno dei due insiemi o
in entrambi, e il verdetto le somma. Non è una coincidenza da verificare, è lo stesso conto fatto
una volta per riga e una volta in testa. Prima i due vivevano su insiemi diversi, la finestra
contro la **Versione in uso**, e la pagina arrivava a stampare `3` sopra due righe che dicevano `1`.
Contano solo le **Release** che hanno un verdetto, con le regole delle **Note giudicabili**: quelle
senza **Sintesi** _Pronta_ e quelle le cui note non sono giudicabili non contano né come sicure né
come **Intervento richiesto**. Se nessuna **Release** dell'insieme ha un verdetto, **il verdetto non
si dà**: la pagina non afferma che c'è lavoro e non afferma che non ce n'è. Un insieme vuoto non
autorizza una rassicurazione, come su note non giudicabili non autorizza un giudizio sulla
**Release**.
Da qui la regola di impaginazione: **nessun conto mostrato sotto il verdetto può smentirlo**. Un
numero che vive in un ambito più stretto, come le _In evidenza_ della finestra, dice il proprio
ambito dove sta.
_Evitare_: stato generale, riepilogo, tutto ok.

**Posizione dello stack**:
La prima delle due parti della **Dashboard**: una riga per ogni **Tecnologia** seguita, ordinata
per **Distanza**, che dice dove sta lo stack e non cos'è uscito. Ogni **Tecnologia** seguita ha
esattamente una riga, sempre, anche quando non ha niente da dire. È una vista calcolata.
_Evitare_: riepilogo, sommario, pannello, scorecard, punteggio.

**Distanza**:
Quanto una **Tecnologia** seguita è lontana da dove sta andando, misurata dalla sua **Versione in
uso**: il numero di **Release** stabili fra la **Versione in uso** e l'ultima, e a parte quelle che
richiedono un **Intervento richiesto**, con le regole del **Cammino di upgrade**.
**Senza Versione in uso dichiarata non c'è Distanza**: la riga lo dice e non ne mostra una. Una
distanza stimata su una dichiarazione che non esiste sarebbe un numero inventato sulla cosa che il
prodotto promette di non inventare.
L'ordine della **Posizione dello stack** è: prima le **Tecnologie** che chiedono un **Intervento
richiesto**, per numero; poi quelle con una **Distanza**, dalla più grande; poi quelle senza
**Versione in uso** dichiarata; infine quelle in pari.
_Evitare_: ritardo, debito, punteggio, salute, freschezza.

**Flusso**:
La seconda delle due parti della **Dashboard**: le **Release** delle **Tecnologie** seguite negli
ultimi 30 giorni, **in ordine di data e senza divisioni per Rilevanza**. La **Rilevanza** si legge
sulla riga, come glifo. È una vista calcolata.
_Evitare_: timeline, cronologia, novità, attività.

**Digest settimanale**:
Le **Release** _Digest_ delle **Tecnologie** seguite, raggruppate per settimana ISO (UTC). È una
vista calcolata, non qualcosa che viene salvato o inviato.
Non è più una sezione della **Dashboard**: è **la piega in fondo al Flusso**, dove i periodi che non
chiedono niente stanno su una riga invece che su una sezione, e da cui si aprono per settimana.
_Evitare_: newsletter, riepilogo, archivio.

**Cammino di upgrade**:
Le **Release** di una **Tecnologia** comprese tra una **Versione** di partenza e l'ultima **Release**
stabile, con il conto di quelle che richiedono un **Intervento richiesto**. La **Versione** di partenza
è quella indicata da chi legge, o la **Versione in uso** dichiarata quando c'è, o, in mancanza di
entrambe, quella che la pagina ricava da sola.
È una vista calcolata, non salvata.
La **Versione** di partenza ricavata è **l'ultima Release stabile della major precedente**: così il
Cammino contiene sempre la **Release** che apre la major, che è dove stanno i cambiamenti che
rompono. Sotto una sola major non c'è nessun salto da mostrare e al suo posto vale la **Release**
stabile più vecchia registrata; con una sola **Release** stabile non c'è Cammino e la pagina resta la
lista. È una proposta, non una dichiarazione: la pagina dice da dove parte e perché, e chi legge la
scavalca con `?from=`. Un `?from=` vuoto non è un errore, chiede lo **Storico** intero.
La **Versione** di partenza deve essere ben formata e non più recente dell'ultima **Release** stabile;
uguale all'ultima vuol dire già aggiornato. Se non è tra le **Release** registrate (lo **Storico** copre
solo gli ultimi 12 mesi), il Cammino si calcola comunque con le **Release** successive, con una nota e
le **Versioni** registrate più vicine. Le **Release** senza **Sintesi** _Pronta_ e quelle le cui note
non sono **Note giudicabili** non contano né come sicure né come **Intervento richiesto**: il Cammino
dice quante sono. Le _Digest_ non si riassumono e
non entrano in questo conto.
_Evitare_: migration path, diff di versioni, upgrade guide.

## Account e piani

**Sviluppatore**:
Una persona autenticata che **Segue** delle **Tecnologie** e ha una **Dashboard**. Chi legge le
pagine pubbliche senza login è un **Visitatore**.
_Evitare_: utente (ambiguo tra i due), user, cliente.

**Piano**:
Il livello di servizio di uno **Sviluppatore**: _Free_ o _Pro_ (in futuro _Team_, legato a un
gruppo e non alla singola persona). Il _Free_ permette di **Seguire** al massimo 10 **Tecnologie**
(ritirate comprese), limite imposto dal database: l'interfaccia lo anticipa ma non è l'autorità;
le **Sintesi** e le pagine pubbliche non dipendono mai dal **Piano**.
_Evitare_: abbonamento (è il rapporto col provider di pagamento), tier, licenza.

**Cancellazione dell'account**:
La fine del rapporto, decisa dallo **Sviluppatore** e immediata: spariscono l'account, i **Follow**
con le **Versioni in uso** dichiarate sopra, la riga del **Piano** e la sessione nel browser. Non
c'è copia da cui tornare indietro e non c'è finestra per ripensarci. Due cose non spariscono, e
vanno dette invece che nascoste: le pagine pubbliche di **Release** e **Tecnologie**, che non
contengono niente di una persona, e l'autorizzazione che GitHub tiene da parte sua, che solo GitHub
può revocare. Firmare di nuovo fa un account nuovo e vuoto, non quello di prima.
_Evitare_: disattivazione, sospensione, chiusura (promettono un ritorno che non c'è).

## Nomi in codice e interfaccia

Codice e database sono in inglese, e ogni termine ha un solo nome inglese. L'**interfaccia è
tradotta** in inglese, italiano, francese, spagnolo e tedesco (ADR
[0008](./docs/adr/0008-interfaccia-in-cinque-lingue.md)), ma i **nomi di questa tabella non si
traducono**: `featured`, `notable`, `digest`, `preview` e i prefissi `breaking[n]:`, `note:`,
`help:`, `warning:`, `ok:` sono gli stessi segni in ogni lingua, perché sono quelli che compaiono
nelle **Sintesi**, che restano in inglese. Le **Note di rilascio** restano nella lingua in cui sono
state pubblicate; dove la Sintesi è in una lingua diversa dall'interfaccia, la pagina lo dice.

| Dominio | Codice / UI | Valori |
|---|---|---|
| Tecnologia | `Technology` | |
| Catalogo | `Catalog` | |
| Genere | `category` | `language` · `runtime` · `framework` · `server framework` · `database` · `build tool` · `testing` · `lint and formatting` · `library` · `platform` |
| Fonte | `Source` | ruolo: `detection` · `notes`; tipo: `npm` · `pypi` · `github-releases` · `changelog` |
| Formato dei tag | `tagFormat` | segnaposto: `{version}` · `{major}` · `{minor}` · `{patch}` · `{prerelease}` |
| Formato delle Anteprime | `prereleaseTagFormat` | solo sulle Fonti `notes`, facoltativo |
| Seguire | `follow` | |
| Versione in uso | `currentVersion` | colonne `follows.current_version` e `follows.current_version_declared_at` |
| Richiesta di tecnologia | `TechnologyRequest` | |
| Release | `Release` | origine: `imported` · `detected` |
| Versione | `Version` | |
| Rilevanza | `Significance` | `featured` · `notable` · `digest` · `preview` |
| Anteprima | `Preview` | |
| Note di rilascio | `ReleaseNotes` | |
| Sintesi | `Summary` | |
| Intervento richiesto | `actionRequired` | UI: "Action required" · "Safe to upgrade" |
| Note giudicabili | `notesJudgeable` | UI: "not enough notes to judge" |
| Stato della sintesi | `SummaryStatus` | `pending` · `processing` · `ready` · `unavailable` · `skipped` · `failed` |
| Strategia di classificazione | `ClassificationStrategy` | `semver` · `node` · `typescript` · `zerover` · `minor-major` |
| Correzione di rilevanza | `significanceOverride` | |
| Tecnologia ritirata | `retired` | |
| Rilevamento | `Detection` | |
| Importazione iniziale | `InitialImport` | |
| Storico | `History` | |
| Dashboard | `Dashboard` | |
| Posizione dello stack | `Standing` | la colonna sinistra della Dashboard |
| Distanza | `Distance` | nulla senza una Versione in uso |
| Flusso | `Stream` | la colonna destra della Dashboard |
| Digest settimanale | `WeeklyDigest` | la piega in fondo al Flusso |
| Cammino di upgrade | `UpgradePath` | parametro `?from=<version>` |
| Sviluppatore | `Developer` | |
| Visitatore | `Visitor` | |
| Piano | `Plan` | `free` · `pro` · `team` |
| Cancellazione dell'account | `delete account` | la pagina `/account` |
| Prodotto | `Verdict` | mai tradotto, mai con l'articolo |

## Ambiguità risolte

- **Verdict** è il prodotto; il **Verdetto** è il giudizio su una **Release**, e in codice vive come
  `pageVerdict`, `rowVerdict`, `DashboardVerdict` e `SummaryVerdictSchema`. La parola "Verdict" non
  compare mai nell'interfaccia, dove il verdetto si legge come `ok:`, `warning:` o `note:`: solo il
  marchio in testa alla pagina la scrive. Nessun identificatore nuovo prende il nome del prodotto.
- "Novità" era il nome di una sezione (`Latest`) e ora è solo un valore di **Rilevanza**,
  `notable`: la **Dashboard** non ha più sezioni per **Rilevanza**. Non usare `new` né come valore
  né come sezione, e non reintrodurre `Spotlight`, `Latest` o `Previews`.
- "Utente" copriva sia lo **Sviluppatore** sia il **Visitatore**. In codice `user` indica solo
  l'identità di autenticazione.
- "MAJOR / MINOR / PATCH" nella specifica iniziale indicavano l'importanza. L'importanza è la
  **Rilevanza**; major/minor/patch descrivono solo la forma della **Versione** e non sempre
  coincidono (TypeScript, Python, librerie 0.x).

## Esempio

> **Dev:** TypeScript 5.7 è una minor, quindi nel Flusso porta il glifo di Novità?
> **Esperto:** La Versione è una minor, ma la Strategia di classificazione di TypeScript tratta
> ogni x.y come In evidenza, perché introduce breaking changes. La Rilevanza è In evidenza.
