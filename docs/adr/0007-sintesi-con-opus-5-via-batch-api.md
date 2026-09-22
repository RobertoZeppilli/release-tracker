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
sicurezza non si troncano: la Sintesi va in stato Fallita con il motivo.
