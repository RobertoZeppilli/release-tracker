# Notifiche: una per Sviluppatore e per evento, campanella gratis e canali esterni Pro

Un prodotto che traccia le **Release** e non avvisa obbliga lo **Sviluppatore** a tornare sul sito
per scoprire se è cambiato qualcosa, e il valore si perde lì. Le **Notifiche** entrano **prima del
lancio**, decise dall'utente il 2026-10-21, con tre canali: la **campanella in-app**, **Slack** e
l'**email**. Questo ADR fissa che cosa sono, che cosa le genera, quando nascono e che cosa si paga,
perché la regola del progetto è che una regola di dominio nuova si scrive prima di codificarla.

**Una Notifica è di uno Sviluppatore, non di una Release.** `Notification` nel codice, tabella
`notifications`, una riga per Sviluppatore e per evento: due Sviluppatori che seguono la stessa
Tecnologia hanno due Notifiche, non una condivisa, perché Visto, canale e lingua sono di una persona
e non di un fatto. La riga pende da `auth.users` con `on delete cascade` come `follows` e `plans`,
quindi la cancellazione dell'account la porta via senza niente da ripulire a mano. Il nome sta nel
glossario di `GLOSSARY.md` con le parole delle cinque lingue (ADR 0008): identificatore `Notification`
nel codice e nel database, dentro le frasi Notifica, notification, notificación, Benachrichtigung.

**Tre eventi la generano**: una Release `featured` o una `notable` di una Tecnologia seguita, e il
**Digest settimanale**. Le `digest` non generano una Notifica propria e arrivano dentro il Digest,
che è la stessa regola con cui non si riassumono (`docs/DECISIONI.md`); le **Anteprime** non la
generano, perché per chi non le cerca sono rumore e chi le cerca ha la Dashboard. Il job scrive con
una chiave unica su Sviluppatore, evento e tipo: **eseguito due volte non duplica niente**, che è il
criterio della #169 e vale identico per il Digest in #173.

⚠️ **La Notifica nasce quando la Sintesi è pronta, non quando la Release è rilevata.** L'ADR 0003
separa rilevamento e Sintesi, quindi al rilevamento non si sa ancora se la Release ha breaking
changes, cioè la sola cosa per cui vale la pena interrompere qualcuno. Se la Sintesi finisce
`unavailable`, `skipped` o `failed` la Notifica nasce comunque, senza verdetto: meglio un avviso
nudo che nessun avviso. Una Release produce **una sola** Notifica per Sviluppatore, perché su email e
Slack non si riscrive niente di già spedito e la variante "avvisa subito, poi aggiorna" sarebbe due
invii per la stessa Release.

**Visto sta sulla Notifica**, come `seen_at`, e il contatore della campanella conta le Notifiche con
`seen_at` nullo. Lo stato "Visto" per Release era rimandato "alle Notifiche" (`DECISIONI.md`) e qui
viene **assorbito** invece che aperto: nessuna tabella delle Release viste, nessuna seconda strada da
tenere in sincrono. ⚠️ **Il contatore non può buttare l'ISR**: la campanella sta nella barra, che
vive anche sulle pagine pubbliche statiche, quindi si legge dal browser come già fa lo stato di
accesso (`AuthStatus`), e il criterio della #170 è che `pnpm build` mostri quelle pagine ancora
statiche.

**Una Notifica si conserva 90 giorni**, poi viene cancellata. La pagina della privacy è il database
letto riga per riga, e il commento in testa a `src/modules/i18n/domain/messages/*/privacy.ts` dice
che una riga aggiunta alle tabelle va aggiunta lì in ogni lingua o il test dei dizionari cade: le
Notifiche, le impostazioni dei canali col webhook Slack e la lingua preferita sono **tre voci nuove
in cinque lingue**, e la frase sulla conservazione va scritta là dove oggi c'è scritto che tutto
resta finché resta l'account.

**La lingua preferita sta nelle impostazioni delle Notifiche**, non in `plans`, che parla di soldi, e
non in una tabella di profilo, che non esiste. Serve perché email e Slack **non hanno un URL** da cui
leggere la lingua, mentre la campanella la prende dal segmento come tutto il resto (ADR 0008). Quando
manca vale l'inglese, cioè lo stesso fallback dell'URL. **La scrive lo Sviluppatore in `/settings`**,
accanto alla lingua dell'interfaccia e agli interruttori dei canali, e nessun job la indovina: un
indirizzo che riceve l'inglese senza averlo chiesto è meno peggio di un prodotto che scrive una
preferenza al posto di chi la ha. È una colonna nuova, quindi la **migrazione precede il codice**.

**La campanella in-app è gratis per sempre, Slack e l'email sono Pro.** Il criterio dell'ADR 0004
resta e qui viene applicato invece che modificato: la campanella non ha costo marginale per utente
aggiuntivo, un invio di posta e una chiamata a un webhook sì. L'ADR 0004 diceva "Notifiche" tutte
insieme nel Pro: da qui le Notifiche in-app escono dal Pro, i canali esterni restano, e **"i
pagamenti arrivano insieme alle Notifiche" resta vero**.

⚠️ **Prova di 30 giorni per Sviluppatore, dalla prima accensione di un canale esterno**, non dalla
registrazione: così nessuno si ritrova la prova finita senza averla usata, e la campanella non la
consuma perché è gratis. La data di inizio è una colonna nelle impostazioni delle Notifiche. Alla
scadenza, senza Pro, i canali esterni **si spengono per tutti**: nessun diritto acquisito, e lo dice
l'interfaccia dal primo giorno invece di una email di scuse al trentunesimo. La campanella resta.

**Al lancio i pagamenti sono già attivi**, scelta dell'utente il 2026-10-22: la #174 e Lemon Squeezy
non sono più un "solo se" ma una fetta obbligatoria del lancio, perché una prova di 30 giorni che
scade senza che ci sia niente da comprare è una funzione spenta e una promessa rotta. La #174 non
dipende dalle fette dei canali e può andare in parallelo, ma il lancio non avviene prima che sia
chiusa.

**Si dichiara in tre posti, e la ragione è che l'abitudine al gratis non si disfa.** Le voci dei
canali esterni portano il segno `Pro` **dal primo giorno**, anche mentre sono incluse; accanto, in
`/settings`, una riga dice quanti giorni di prova restano; la **FAQ**, che esiste e è tradotta in
cinque lingue, dice che cosa è Free e che cosa è Pro. Una pagina dei prezzi non si apre prima del
lancio: sarebbe una rotta nuova e cinque traduzioni in più per dire quello che la FAQ dice già.

Il **limite Free di 10 Tecnologie** non si tocca, resta imposto dal database, e resta il confine che
lo Sviluppatore incontra comunque dal primo giorno.

## Emendamento del 2026-11-03: la tabella Free/Pro, decisa una volta sola (#198)

Questo ADR diceva due cose sole, la campanella gratis e i canali esterni Pro, e su tutto il resto
ogni schermata inventava il confine a modo suo: due schermate che lo inventano diverso sono un
prodotto che mente. Qui c'è il confine intero, riga per riga, deciso dall'utente il 2026-11-03.
**Ogni riga dice anche cosa accade alla fine della Prova senza Pro**, perché è lì che un piano si
vede, e la colonna non è un dettaglio di implementazione: è la promessa che la #174 deve far pagare.

| Voce | Free | Pro | Alla fine della Prova senza Pro |
|---|---|---|---|
| Pagine pubbliche (Release, Tecnologia, le cinque pagine documento) | Tutte, senza account | Uguale | Niente cambia: non dipendono dal Piano |
| **Sintesi** | Tutte, **senza tetto**: non a mese, non per Rilevanza | Uguale | Niente cambia |
| Dashboard, Posizione dello stack, Flusso, Digest settimanale in pagina | Sì | Uguale | Niente cambia |
| **Tecnologie seguite** | Al massimo **10**, ritirate comprese, imposto dal database | Illimitate | Il limite torna a 10 per **aggiungerne**; le Tecnologie già seguite oltre la decima **restano** e smettono di notificare |
| **Campanella in-app** | **Gratis per sempre** | Uguale | Resta accesa, con tutti i suoi eventi, Digest compreso |
| **Slack** | No | Sì | Si spegne |
| **Email** | No | Sì | Si spegne |
| **Digest settimanale come Notifica** | Sulla campanella | Su campanella, Slack ed email | Resta sulla campanella, si spegne sugli altri due |
| Lingua preferita delle Notifiche | Si imposta e vale per la campanella | Vale anche per Slack ed email | Resta salvata |
| Webhook Slack e interruttori dei canali | Non applicabile | Salvati e usati | **Restano salvati e dormienti**: niente viene cancellato |
| Scanner dei repository | Non esiste al lancio | Non esiste al lancio | Non applicabile |
| Richieste di tecnologia | Non esistono al lancio | Non esistono al lancio | Non applicabile |

**Le Sintesi non hanno tetto, ed è il criterio dell'ADR 0004 applicato e non un regalo.** Una Sintesi
è di una Release e non di un lettore: la scrive un job sul server, prima che qualcuno apra la pagina,
ed è lo stesso testo per tutti. Costa uguale con dieci lettori e con diecimila, quindi un tetto non
risparmierebbe niente e chiuderebbe il canale di acquisizione via SEO, che è l'altra metà di quel
criterio. Nessun limite a mese e nessun limite per Rilevanza.

⚠️ **La Prova di 30 giorni apre i canali esterni e nient'altro.** Non sblocca le Tecnologie
illimitate. La ragione è che così **nessuno supera il limite senza aver pagato**, e alla scadenza non
c'è nessun dato in eccesso da arbitrare: si spengono due interruttori. La colonna che la segna sta
nelle impostazioni delle Notifiche (`external_trial_started_at`) e il nome dice già questo.

**Le Tecnologie oltre la decima di chi scende da Pro restano, e smettono di notificare.** Il trigger
`enforce_follow_rules` è `before insert`: blocca la riga numero 11 e non tocca le righe che ci sono
già, quindi questa decisione è **ciò che il database fa oggi**, nominato invece che lasciato
all'interpretazione. Restano in Dashboard e mostrano le loro Release, perché cancellare il lavoro di
chi ha pagato sarebbe una punizione, non un confine; non generano Notifiche, perché la Notifica è la
funzione, e per aggiungerne una nuova si torna sotto le dieci o si torna a Pro.

**Il Digest segue il canale, non diventa un confine nuovo.** È uno dei tre eventi che generano una
Notifica, e la regola di questo ADR è già scritta sui canali: in-app gratis, Slack ed email Pro. Un
Digest Pro anche sulla campanella taglierebbe dentro l'unica cosa dichiarata gratis per sempre, e la
FAQ dovrebbe spiegare un'eccezione; un Digest gratis via email farebbe pagare a noi l'invio di posta
di chi non paga, che è esattamente il costo che l'ADR 0004 mette nel Pro.

**Chi non passa a Pro non perde niente di salvato.** Interruttori, lingua preferita e **webhook
Slack** restano dove sono: il job di consegna smette di usarli, e basta. Riaccendere dopo il
pagamento è un click invece di un altro giro OAuth, e la pagina della privacy continua a dire una
cosa sola e vera, che i dati restano finché resta l'account. Il webhook è già un segreto in
`notification_secrets`, tabella senza grant per il client (#201): custodirlo spento non aggiunge
superficie, mentre cancellarlo aggiungerebbe un lavoro da rifare proprio a chi sta per pagare.

**Due voci che l'ADR 0004 metteva nel Pro non esistono al lancio** e la tabella lo dice invece di
tacerle: lo **scanner dei repository** e le **Richieste di tecnologia** sono fuori dall'MVP
(`docs/DECISIONI.md`), e la FAQ già risponde che le Richieste non sono aperte. Restano possibilità
del dopo, non parti del confine che si paga.

**Le parole nuove.** `GLOSSARY.md` prende **Prova di Pro** come nome di dominio, con le cinque
lingue che l'interfaccia usa già (`prova di Pro`, `Pro trial`, `essai Pro`, `prueba de Pro`,
`Pro-Testzeit`): la cosa esisteva nel codice e nei dizionari ma non aveva una riga nel glossario, e
una regola di dominio senza nome si reinventa. La voce **Piano** porta il rimando a questa tabella.

---

⚠️ **Precisato dall'ADR [0011](./0011-open-source-una-copia-per-persona.md) il 2026-11-10, quando Verdict è diventato open source.** Cade **tutta
la parte economica**: senza Piano non c'è niente di Pro, quindi la campanella, Slack, Discord e i
webhook sono aperti a chiunque, e la tabella del confine Free/Pro in coda a questo ADR non descrive
più nulla. Cade anche il legame tecnico con l'autenticazione: la riga delle Notifiche non pende più da
`auth.users`, perché gli account non esistono.

**Resta** la forma del dominio, che era la parte difficile: una Notifica è di uno Sviluppatore e di un
evento, con Visto, canale e lingua suoi. Su una copia installata lo Sviluppatore è uno, quindi la
regola si legge come una riga per evento.

⚠️ **Quello che cambia davvero è quando una Notifica raggiunge qualcuno.** Non c'è più un cron nostro
che lavora di notte: la campanella e il Digest esistono mentre l'app gira e diventano il riepilogo di
cosa è cambiato da quando hai guardato l'ultima volta. Per essere avvisati ad app chiusa c'è un
workflow che si copia nel proprio repository, con la propria chiave e il proprio webhook (#218).
**L'email esce dall'MVP**: mandarla vorrebbe dire un servizio di invio, cioè una spesa, e la issue
#173 va riscritta tenendo il Digest e lasciando andare il canale email.
