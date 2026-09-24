# Rilevamento e Sintesi come fasi separate

Il Rilevamento (fonti → Release, Rilevanza, Note di rilascio) e le due fasi della Sintesi girano
come tre cron distinti. La Sintesi prende in carico una Release con un passaggio atomico
di stato in Postgres (`in_attesa` → `in_corso`), che garantisce una sola chiamata all'AI per
Release anche con esecuzioni sovrapposte o retry. Le Release sono visibili subito, prima che la
loro Sintesi sia pronta.

## Consequences

Il piano Vercel Hobby dà 100 cron per progetto, ma ciascuno gira **al massimo una volta al giorno**
e parte entro l'ora indicata (±59 min). Le tre fasi stanno quindi su tre cron a ore diverse
(Rilevamento 02:00, invio 05:00, raccolta 11:00 UTC): distanti abbastanza da assorbire lo
slittamento, e se l'ordine salta comunque nessuna fase perde nulla, perché ciascuna riprende il
lavoro lasciato indietro al giro successivo. Una Sintesi è quindi pronta in giornata, non il
giorno dopo.

Il Rilevamento è giornaliero per scelta consapevole dell'MVP, e ogni job deve smaltire l'arretrato
entro il limite di durata della funzione (300 s su Hobby) invece di elaborare lotti fissi piccoli.
Per il Rilevamento questo vincolo è il motivo per cui le Fonti si interrogano con l'ETag: scaricare
ogni giorno il packument di ogni Tecnologia consumerebbe il limite in trasferimento e parsing per
scoprire quasi sempre che non è cambiato niente.
