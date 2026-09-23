# Set di valutazione delle Sintesi

Serve a rispondere a una domanda sola: **questa versione del prompt produce Sintesi di cui ci si può
fidare?** Si rilancia con `pnpm summary:eval` (`--dry` elenca i casi senza chiamare Anthropic né
spendere), e ogni giro lascia un report in `reports/`, confrontabile con quelli delle versioni
precedenti del prompt.

## Com'è fatto

- `notes/<slug>@<versione>.md`: le Note di una Release reale, **copiate una volta**. Non si leggono dal
  database: il Catalogo cambia, il set no, altrimenti due report non sarebbero confrontabili.
- `set.json`: per ogni caso la Tecnologia, la versione, il file delle Note e le **attese**.

Le attese sono il giudizio umano, l'unica parte che nessuna macchina dà:

- `actionRequired`: `true`, `false`, oppure `"either"` quando le Note descrivono un cambio di
  comportamento senza chiamarlo breaking e i due verdetti sono entrambi difendibili.
- `breakingChanges`: le breaking changes che la Sintesi **deve** trovare. `match` sono le parole che
  devono comparire nella coppia cambiamento + migrazione perché il report la consideri trovata; così
  una Sintesi che raggruppa più rimozioni in un punto solo conta lo stesso.
- `allowed`: le breaking changes di confine, legittime ma non obbligatorie. Citarne una non è un
  errore; il report la segna come tollerata invece che come inattesa.

Un cambiamento dichiarato che non rientra in nessuna delle due liste è **inattesto**, e il report dice
se la citazione che lo accompagna sta davvero nelle Note.

## Che cosa guarda il report

Le invenzioni si verificano da sole: una `quote` che non si trova verbatim nelle Note è inventata
(`locateCitation`, la stessa regola che decide i puntatori alle righe nella pagina della Release).
Restano: corrispondenza dell'Intervento richiesto, breaking changes mancanti, inattese, e quante voci
restano senza citazione.

## Costo

Un giro sono 14 Release, ~114.000 caratteri di Note: qualche decina di centesimi con lo sconto della
Batch API. **Non lanciarlo senza avvisare l'utente.**
