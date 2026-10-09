# Sintesi con Claude Haiku 5.5 tramite Batch API

Le Sintesi si generano con **Claude Haiku 5.5** attraverso la Message Batches API: il cron
giornaliero prende in carico le Release in attesa e invia un unico batch, un'esecuzione successiva
ne raccoglie i risultati e li valida con Zod. Il batch elimina il rischio di timeout sul piano
Vercel Hobby, al prezzo di qualche ora di ritardo sulle Sintesi, irrilevante con un Rilevamento
giornaliero.

**Il modello è il più economico, non il più capace, e la ragione è misurata** (issue #57,
2026-10-08). Fino a quel giorno si usava Claude Opus 5, motivato dal fatto che il modello più
capace costava pochi dollari al mese. La motivazione cadeva su due lati: quello che la Sintesi fa
davvero è leggere delle Note e riportarne i punti con le citazioni, cioè estrazione e non ricerca;
e il set di valutazione (14 Release reali, le attese scritte a mano, `pnpm summary:eval`) dice che
sulle due cose che contano Haiku 5.5 col prompt `v6` non perde niente:

| | Opus 5, prompt v4 | Haiku 5.5, prompt v6 | Haiku 5.5, prompt v7 |
|---|---|---|---|
| Intervento richiesto azzeccato | 14 su 14 | 14 su 14 | 14 su 14 |
| Note giudicabili azzeccate | non chiesto | non chiesto | 14 su 14 |
| Breaking changes mancanti | 0 | 0 | 0 |
| Breaking changes inattese | 3 | 0 | 0 |
| Citazioni inventate | 0 | 0 | 0 |
| Voci senza puntatore alle righe | 4 su 81 | 3 su 76 | 3 su 73 |
| Costo del giro | $0,486 | $0,0097 | $0,0096 |

Il confronto **non è pulito e non va letto come "Haiku batte Opus"**: fra le due colonne sono
cambiati sia il modello sia il prompt, e Opus col `v6` non è stato misurato, perché costa 50 volte
tanto per rispondere a una domanda che non cambia la decisione. Quello che le due colonne dicono è
l'unica cosa che serviva: il modello economico, col prompt di oggi, fa un lavoro almeno pari a
quello che si pagava prima.

**Le citazioni dipendono dal prompt, non solo dal modello.** Con il prompt `v5`, scritto per un
modello che le dava comunque, Haiku lasciava **20 voci su 79 senza puntatore**, una su quattro: le
Sintesi restavano giuste e diventavano poco verificabili. Il `v6` chiede la citazione per ogni voce
che le Note enunciano in un punto solo, dice al modello perché (una voce senza puntatore non si può
controllare) e aggiunge un passo di ricontrollo prima della risposta. Le 3 voci rimaste scoperte
sono il pavimento della forma, non un difetto del modello: stanno su `vite 8.2.2` e
`tailwindcss 4.2.4`, due Release le cui Note sono un rimando al changelog, mentre lo schema chiede
comunque almeno 3 punti chiave.

**Il `v7` ha tolto metà di quel pavimento, e l'ha fatto scoprendolo** (issue #93, 2026-10-09). Il
prompt chiede adesso alla Sintesi se le Note erano giudicabili, invece di lasciarlo dedurre a
un'euristica; su `vite 8.2.2` il modello ha risposto che non lo erano e ha dato **l'unico punto che
quelle Note contengono**, e lo schema, che ne chiedeva tre, ha buttato una Sintesi già pagata. Il
pavimento era quindi una richiesta di inventare, e dal `v7` **il minimo è 1 quando il modello
dichiara le Note non giudicabili**, come il titolo che il prompt chiede a 120 caratteri e lo schema
accetta a 140. Le 3 voci scoperte che restano sono una su `vite 8.2.2`, un punto che parla delle
Note stesse e non ha niente da citare per costruzione, e due su `tailwindcss 4.2.4`, dove le Note
sono una riga di fix vera e il pavimento dei 3 punti vale ancora.

⚠️ **Il giro del `v7` è stato pagato una volta e letto due.** Il primo report
(`v7-…T07-38-02-044Z`) è quello col difetto dello schema, 13 casi su 14. Il secondo
(`…T07-58-42-486Z`, con `"replayed": true`) è **lo stesso batch** riletto gratis dopo la correzione,
ed è la misura che conta. Da qui l'opzione `--results` di `pnpm summary:eval`, e il fatto che ogni
giro salva accanto al report quello che il modello ha risposto: una correzione al nostro schema non
deve costare un secondo batch.

**Non si cerca lo zero**, ed è una scelta: `locateCitation` verifica che la citazione esista
verbatim nelle Note, non che quella riga enunci la voce a cui è attaccata. Una citazione inventata
viene scartata e si vede; una riga vera attaccata alla voce sbagliata passa e porta il lettore al
posto sbagliato. Chiedere un puntatore anche dove non esiste trasformerebbe un'assenza visibile in
un errore invisibile.

## Consequences

Un credito API esaurito non è un errore della Sintesi: le Release restano in attesa e la prima
esecuzione dopo la ricarica le riprende. Avvisare l'amministratore è compito della Console di
Anthropic, che manda le email di credito basso e può ricaricare da sola; un canale di avviso nostro
costerebbe un modulo e un token per duplicare quella notifica.

Note di rilascio oltre la soglia di sicurezza non si troncano: la Sintesi va in stato Fallita con il
motivo. La soglia è di **150.000 caratteri** e misura quanto siamo disposti a spendere per una
singola Sintesi, non quanto il modello riesce a leggere: sono circa 40k token, cioè meno di un
centesimo con lo sconto batch, e la finestra di Haiku 5.5 è di 1M token. Sul Catalogo a 37
Tecnologie il 99° percentile delle Note sta a 53.592 caratteri e la Release più lunga in assoluto a
108.842, quindi la soglia lascia fuori solo ciò che sarebbe fuori scala. Una Release che la supera
resta Fallita e la sua pagina lo dice mostrando le Note intere: meglio nessuna Sintesi che una
fondata su un pezzo di Note, perché il pezzo non letto potrebbe contenere proprio il breaking
change. La soglia ha adesso una seconda ragione: **Haiku 5.5 costa $0,10 per milione di token in
ingresso fino a 100k token di prompt e cinque volte tanto oltre**, e 150.000 caratteri stanno
comodamente sotto quel gradino, quindi nessuna Sintesi può finire nella fascia cara.

**Un cambio di modello si misura prima, mai a occhio.** I due requisiti della Sintesi che nessuno
schema sa imporre, le citazioni verbatim e l'Intervento richiesto vero esattamente quando ci sono
breaking changes, non fanno fallire niente quando il modello li sbaglia: producono Sintesi povere di
puntatori, o una Sintesi Fallita dopo averla pagata. Per questo il set di valutazione va lanciato
prima di toccare `SUMMARY_MODEL`, e adesso non ci sono scuse: un giro costa un centesimo.
`pnpm summary:eval --model <id>` lancia il set su un modello diverso da quello dell'app, e il report
in `eval/summaries/reports/` porta il modello nel nome, così i giri si confrontano.

**Le Sintesi scritte da Opus 5 restano leggibili per quello che sono**: `summaries.model` registra
chi le ha scritte e `summaries.prompt_version` con quale prompt, quindi due generazioni convivono
senza ambiguità nella pagina della Release.

**L'arretrato non si è rigenerato qui**, ed è stata una scelta dell'utente del 2026-10-08: si è
rigenerato **una volta sola** dentro la #93, che cambiava a sua volta il prompt. Rigenerarlo due
volte sarebbe costato il doppio senza che la prima volta servisse a niente, perché le Sintesi di
Opus non erano peggiori di quelle che la #57 avrebbe prodotto: erano quelle che si leggevano.

**La rigenerazione è avvenuta il 2026-10-09**, dopo il merge della #93, e tutto il Catalogo porta
adesso Sintesi `claude-haiku-5-5` a prompt `v7`. **142 Sintesi, non 126**: alle 122 `ready` si sono
aggiunte 7 `failed` e le 13 `pending` che erano già in coda, e mandarle tutte nello stesso batch è
costato un centesimo in più che lasciarle a un giro successivo. Nessuna fallita, né all'invio né
alla validazione.

⚠️ **Il costo vero è stato $0,1362, contro gli $0,08 proiettati**, cioè il 45% in più, e la
differenza è tutta nel metodo: la proiezione scalava i token misurati su Opus su 126 Sintesi, mentre
il Catalogo nel frattempo era cresciuto e le Note vere sono più lunghe di quanto la proiezione
assumesse. **La media misurata è $0,00096 per Sintesi** (9.648 token in ingresso e 1.906 in uscita),
contro i $0,00066 proiettati. È la prima misura su dati veri col modello nuovo, e sostituisce la
stima ovunque.
