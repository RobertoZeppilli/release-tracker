# Verdict diventa open source: una copia per persona, il database sul disco, nessun account

Deciso dall'utente il **2026-11-10**, due mesi prima del lancio e con nessun utente da far migrare.
Verdict non si vende: si scarica da GitHub e gira sul computer di chi lo usa, con la sua chiave
Anthropic. La ragione non è tecnica ed è giusto che resti scritta: dare una mano alla comunità degli
sviluppatori, e farsi conoscere come sviluppatore. Il prezzo è il fatturato, che era ipotetico; il
guadagno è la reputazione e il fatto che qualcuno lo usi davvero.

Questo ADR fissa la forma nuova. Il lavoro sta in tredici issue, in quest'ordine:
#219 → #215 → #209 → #210 → #211 → #212 → #213 → #217 → #214 → #218 → #221 → #222 → #216.

⚠️ **La #215 viene seconda perché il sito pubblico non deve rompersi un giorno solo**: è il progetto
da portfolio di chi lo scrive. La #211 toglie Supabase e mette un file sul disco, che su Vercel non
esiste fra due richieste; reso statico prima, mentre il database è ancora in piedi e serve i dati in
fase di build, il sito diventa solo file e smette di dipendere da qualunque cosa succeda dopo.

⚠️ La prima della catena, la **#219**, esiste per un incidente di tempi: la Lista d'attesa dell'ADR
[0010](./0010-lista-attesa-e-porta-chiusa.md) è stata mergiata in `main` la sera del 2026-11-09,
poche ore prima di questa decisione, quindi va smontata invece di non essere mai fatta.

## Cosa cade

**Il Piano, i pagamenti e l'autenticazione.** Una copia installata appartiene a una persona sola,
quindi non c'è nessuno da distinguere e nulla da vendere: via il Piano _Free_ e _Pro_, la Prova di
Pro, il limite di dieci Tecnologie, Lemon Squeezy, il login con GitHub, il callback OAuth, la RLS e
la colonna utente di ogni tabella. Gli ADR [0004](./0004-monetizzazione-e-merchant-of-record.md) e
[0010](./0010-lista-attesa-e-porta-chiusa.md) sono superati da qui, e la parte Free/Pro
dell'[0009](./0009-notifiche-campanella-gratis-canali-pro.md) con loro.

**Supabase.** Il database esce dalla rete e diventa un file SQLite in `~/.verdict/`, letto con
`node:sqlite`, che sta dentro Node 24 e non aggiunge nemmeno una dipendenza. Le migrazioni restano
file `.sql` applicati all'avvio. Senza un database condiviso cadono anche la cache distribuita, il
rate limiting e il problema di tenere allineati due ambienti.

## Cosa resta uguale

Il prodotto. Catalogo curato come codice (ADR [0002](./0002-catalogo-curato.md) e
[0005](./0005-catalogo-come-codice.md)), Rilevamento e Sintesi separati (ADR
[0003](./0003-rilevamento-e-sintesi-separati.md)), la Rilevanza staccata dalla Versione (ADR
[0001](./0001-rilevanza-separata-dalla-versione.md)), i moduli di dominio (ADR
[0006](./0006-moduli-di-dominio.md)), l'interfaccia in cinque lingue (ADR
[0008](./0008-interfaccia-in-cinque-lingue.md)). Chi usa Verdict vede le stesse schermate di prima,
tranne il login e le impostazioni del piano.

## Le quattro decisioni che un lettore futuro troverebbe strane

**La chiave Anthropic è obbligatoria, e non serviamo noi le Sintesi alle copie installate.** È la
scelta meno ovvia di tutte, perché una Sintesi è per Tecnologia e non per utente: la GitHub Action
che tiene aggiornata la vetrina potrebbe pubblicare le Sintesi di tutto il Catalogo e nessuno avrebbe
bisogno di una chiave. È stata considerata e scartata il 2026-11-10: un'app che dipende dal fatto che
il suo autore continui a pagare è un'app che muore quando lui smette, e questo progetto è un regalo,
non un servizio. Il file iniziale distribuito porta le Sintesi già generate fino a quel giorno, quindi
la prima apertura è piena di contenuto; la chiave serve dalle Release successive.

**Lo stato personale non sta nel database ma in `verdict.json`.** Le Tecnologie seguite e le Versioni
in uso sono l'unica cosa che non si può ricostruire, e sono pochi byte: messe in un file di testo si
portano su un altro computer copiandole, si tengono nei dotfiles e si versionano. Il database diventa
una cache cancellabile. Senza account non esiste sincronizzazione, e questa è la forma che ci somiglia
più di un account: è anche il posto dove scriverà l'import da `package.json` (#69).

**La Messages API al posto della Batch API.** L'ADR [0007](./0007-sintesi-con-haiku-5-5-via-batch-api.md)
scelse i batch per metà prezzo, e aveva ragione quando un cron notturno pagava per tutti. Chi clicca
Aggiorna sul suo computer non aspetta ventiquattro ore, e lo sconto del 50% su qualche centesimo non
compra quell'attesa. Il modello resta Haiku 5.5.

**La vetrina è HTML statico senza una sola variabile d'ambiente.** Le 2.275 pagine pubbliche restano
indicizzate, generate da una GitHub Action e servite come file. Non è solo risparmio: con
`revalidate = false` le scritture della cache ISR le faceva il deploy, 2.275 pagine per volta, e il
2026-10-23 avevano toccato il 100% della quota. Un export statico non ha cache ISR, quindi quel
problema non si gestisce: smette di esistere.

## Conseguenze non ovvie

- **Le Notifiche hanno due forme.** La campanella e il Digest esistono solo mentre l'app gira, e
  diventano il riepilogo di cosa è cambiato da quando hai guardato l'ultima volta. Per essere avvisati
  ad app chiusa c'è un workflow che chi usa Verdict copia nel **suo** repository, con la sua chiave e
  il suo webhook, e che gira gratis sui runner di GitHub (#218). Non esiste nessun server nostro che
  manda niente, e l'email esce dall'MVP.
- **Docker non serve più**, né in sviluppo né in CI: i test di integrazione girano su un file
  temporaneo.
- **Licenza MIT**, README e CONTRIBUTING in inglese; i documenti interni, il glossario e le issue
  restano in italiano. Le traduzioni francese, spagnola e tedesca, che non ha mai letto un
  madrelingua, diventano il primo contributo che chiediamo.
- ⚠️ **Una porta a senso unico**: il progetto Supabase si cancella **solo dopo** che i suoi dati sono
  dentro il file distribuito e verificati. Dentro ci sono le Sintesi già pagate, e si ricomprano se si
  spegne prima.

## Le strade scartate

- **SaaS gratuito per tutti**: una bolletta Anthropic e Supabase che cresce con utenti sconosciuti,
  senza tetto e senza nessuno che paghi.
- **"Deploy il tuo" su Vercel e Supabase**: zero codice da riscrivere, ma chiede due account e un
  quarto d'ora, e chi prova uno strumento nuovo non li spende.
- **Immagine Docker**: un comando solo, ma reintroduce l'attrito che SQLite ha appena tolto.
- **Account con email e password**, per restare multiutente: difende dati che su un computer solo
  nessuno attacca, e tiene in vita tutto il codice di autenticazione per niente.
