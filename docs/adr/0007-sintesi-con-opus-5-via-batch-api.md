# Sintesi con Claude Opus 5 tramite Batch API

Le Sintesi si generano con Claude Opus 5 attraverso la Message Batches API: il cron giornaliero
prende in carico le Release in attesa e invia un unico batch, un'esecuzione successiva ne raccoglie
i risultati e li valida con Zod. Ai volumi previsti (~150 Sintesi/mese) il modello più capace costa
pochi dollari al mese con lo sconto batch, e la qualità di breaking changes e Intervento richiesto
è il valore del prodotto. Il batch elimina anche il rischio di timeout sul piano Vercel Hobby, al
prezzo di qualche ora di ritardo sulle Sintesi, irrilevante con un Rilevamento giornaliero.

## Consequences

Un credito API esaurito non è un errore della Sintesi: le Release restano in attesa e la prima
esecuzione dopo la ricarica le riprende. Avvisare l'amministratore è compito della Console di
Anthropic, che manda le email di credito basso e può ricaricare da sola; un canale di avviso nostro
costerebbe un modulo e un token per duplicare quella notifica. Note di rilascio oltre la soglia di
sicurezza non si troncano: la Sintesi va in stato Fallita con il motivo. La soglia è di **150.000
caratteri** e misura quanto siamo disposti a spendere per una singola Sintesi, non quanto il modello
riesce a leggere: sono circa 40k token e meno di 10 centesimi con lo sconto batch, molto dentro la
finestra di Opus 5. Sul Catalogo a 37 Tecnologie il 99° percentile delle Note sta a 53.592 caratteri
e la Release più lunga in assoluto a 108.842, quindi la soglia lascia fuori solo ciò che sarebbe
fuori scala. Una Release che la supera resta Fallita e la sua pagina lo dice mostrando le Note
intere: meglio nessuna Sintesi che una fondata su un pezzo di Note, perché il pezzo non letto
potrebbe contenere proprio il breaking change.
