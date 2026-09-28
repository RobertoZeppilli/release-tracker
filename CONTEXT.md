# Release tracker — dominio

Le parole con cui si parla del tracciamento delle release delle tecnologie che uno sviluppatore
segue, e di come vengono smistate nella sua dashboard.

## Release

**Tecnologia**:
Un linguaggio, framework o libreria che uno sviluppatore può seguire e che pubblica **Release**
versionate.
_Evitare_: pacchetto, dipendenza, tool.

**Catalogo**:
L'insieme curato delle **Tecnologie** che si possono seguire. Lo gestisce l'amministratore; gli
utenti non lo modificano.
_Evitare_: registry, lista pacchetti.

**Tecnologia ritirata**:
Una **Tecnologia** tolta dal **Catalogo**: non ha più **Rilevamento**, ma le sue **Release** e
**Sintesi** restano consultabili e chi la seguiva la vede segnalata. Una **Tecnologia** non si
cancella mai. Se il suo file torna nel **Catalogo**, torna seguibile e rilevata.
_Evitare_: eliminata, disattivata, archiviata.

**Fonte**:
Un canale esterno da cui si osservano le **Release** di una **Tecnologia** (es. repository GitHub,
pacchetto npm). Una **Tecnologia** ha una o più **Fonti**, ognuna con un ruolo: **rilevare** le
nuove **Versioni** (es. npm) o **fornire le Note di rilascio** (es. GitHub Releases, `CHANGELOG.md`).
Una **Tecnologia** ha al massimo una **Fonte** per ruolo e tipo. Una **Fonte** tolta dal **Catalogo**
si cancella: è configurazione, e le **Note di rilascio** che ha fornito restano.
_Evitare_: provider, integrazione, feed.

**Seguire**:
La scelta di uno sviluppatore di vedere nella propria dashboard le **Release** di una
**Tecnologia** del **Catalogo**. Si possono **Seguire** solo **Tecnologie** non ritirate; una
**Tecnologia ritirata** già seguita resta seguita finché lo sviluppatore non smette, e da quel momento
non si può più seguire. Il comando per **Seguire** non compare mai su una **Tecnologia ritirata** che
lo sviluppatore non segue, in nessuna schermata: offrirebbe un'azione che il database rifiuta. Le
**Tecnologie ritirate** seguite contano nel limite del **Piano**.
_Evitare_: iscriversi, abbonarsi, preferito.

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
legame è una **Sintesi** _Fallita_.
_Evitare_: breaking flag, safe to upgrade.

**Stato della sintesi**:
A che punto è la **Sintesi** di una **Release**: _In attesa_, _In corso_, _Pronta_,
_Non disponibile_ (mancano le **Note di rilascio**), _Non generata_ (possibile, ma scelto di non
farla) o _Fallita_. Una **Release** è visibile in
dashboard qualunque sia questo stato.
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
_Evitare_: parser, regola SemVer.

**Correzione di rilevanza**:
Una **Rilevanza** assegnata a mano dall'amministratore a una singola **Release**. Prevale sulla
**Strategia di classificazione** e nessun **Rilevamento** la sovrascrive.
_Evitare_: override manuale, forzatura.

## Dashboard

**Dashboard**:
La vista personale di uno sviluppatore con le **Release** delle **Tecnologie** che segue, divise
per **Rilevanza** in sezioni: **In primo piano**, **Novità**, **Anteprime** e **Digest settimanale**.
_Evitare_: home, feed (è una sola sezione).

**In primo piano**:
La sezione della **Dashboard** con le **Release** _In evidenza_ degli ultimi 30 giorni; per ogni
**Tecnologia** seguita che non ne ha, mostra in forma compatta la sua ultima major.
_Evitare_: hero, highlights, breaking.

**Digest settimanale**:
Le **Release** _Digest_ delle **Tecnologie** seguite, raggruppate per settimana ISO (UTC). È una
vista calcolata, non qualcosa che viene salvato o inviato.
_Evitare_: newsletter, riepilogo, archivio.

**Cammino di upgrade**:
Le **Release** di una **Tecnologia** comprese tra una **Versione** di partenza indicata da chi legge e
l'ultima **Release** stabile, con il conto di quelle che richiedono un **Intervento richiesto**.
È una vista calcolata, non salvata.
La **Versione** di partenza deve essere ben formata e non più recente dell'ultima **Release** stabile;
uguale all'ultima vuol dire già aggiornato. Se non è tra le **Release** registrate (lo **Storico** copre
solo gli ultimi 12 mesi), il Cammino si calcola comunque con le **Release** successive, con una nota e
le **Versioni** registrate più vicine. Le **Release** senza **Sintesi** _Pronta_ non contano né come
sicure né come **Intervento richiesto**: il Cammino dice quante sono. Le _Digest_ non si riassumono e
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

## Nomi in codice e interfaccia

Codice, database e interfaccia sono in inglese. Ogni termine ha un solo nome inglese.

| Dominio | Codice / UI | Valori |
|---|---|---|
| Tecnologia | `Technology` | |
| Catalogo | `Catalog` | |
| Fonte | `Source` | ruolo: `detection` · `notes` |
| Seguire | `follow` | |
| Richiesta di tecnologia | `TechnologyRequest` | |
| Release | `Release` | origine: `imported` · `detected` |
| Versione | `Version` | |
| Rilevanza | `Significance` | `featured` · `notable` · `digest` · `preview` |
| Anteprima | `Preview` | |
| Note di rilascio | `ReleaseNotes` | |
| Sintesi | `Summary` | |
| Intervento richiesto | `actionRequired` | UI: "Action required" · "Safe to upgrade" |
| Stato della sintesi | `SummaryStatus` | `pending` · `processing` · `ready` · `unavailable` · `skipped` · `failed` |
| Strategia di classificazione | `ClassificationStrategy` | `semver` · `node` · `typescript` · `zerover` |
| Correzione di rilevanza | `significanceOverride` | |
| Tecnologia ritirata | `retired` | |
| Rilevamento | `Detection` | |
| Importazione iniziale | `InitialImport` | |
| Storico | `History` | |
| Dashboard | `Dashboard` | |
| In primo piano | `Spotlight` | |
| Novità (sezione) | `Latest` | |
| Anteprime (sezione) | `Previews` | |
| Digest settimanale | `WeeklyDigest` | |
| Cammino di upgrade | `UpgradePath` | parametro `?from=<version>` |
| Sviluppatore | `Developer` | |
| Visitatore | `Visitor` | |
| Piano | `Plan` | `free` · `pro` · `team` |

## Ambiguità risolte

- "Novità" è il nome della sezione (`Latest`); il valore di **Rilevanza** che la alimenta è
  `notable`. Non usare `new` né come valore né come sezione.
- "Utente" copriva sia lo **Sviluppatore** sia il **Visitatore**. In codice `user` indica solo
  l'identità di autenticazione.
- "MAJOR / MINOR / PATCH" nella specifica iniziale indicavano l'importanza. L'importanza è la
  **Rilevanza**; major/minor/patch descrivono solo la forma della **Versione** e non sempre
  coincidono (TypeScript, Python, librerie 0.x).

## Esempio

> **Dev:** TypeScript 5.7 è una minor, quindi va nel feed Novità?
> **Esperto:** La Versione è una minor, ma la Strategia di classificazione di TypeScript tratta
> ogni x.y come In evidenza, perché introduce breaking changes. La Rilevanza è In evidenza.
