# Rilevamento e Sintesi come fasi separate

Il Rilevamento (fonti → Release, Rilevanza, Note di rilascio) e la generazione delle Sintesi
girano come due cron distinti. La Sintesi prende in carico una Release con un passaggio atomico
di stato in Postgres (`in_attesa` → `in_corso`), che garantisce una sola chiamata all'AI per
Release anche con esecuzioni sovrapposte o retry. Le Release sono visibili subito, prima che la
loro Sintesi sia pronta.

## Consequences

Sul piano Vercel Hobby i cron girano al massimo una volta al giorno: il Rilevamento è giornaliero
per scelta consapevole dell'MVP, e il job di Sintesi deve smaltire l'arretrato entro il limite di
durata della funzione invece di elaborare lotti fissi piccoli.
