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
glossario di `CONTEXT.md` con le parole delle cinque lingue (ADR 0008): identificatore `Notification`
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
