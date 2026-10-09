# Set di valutazione delle Sintesi

Serve a rispondere a una domanda sola: **questa versione del prompt, su questo modello, produce
Sintesi di cui ci si può fidare?** Si rilancia con `pnpm summary:eval` (`--dry` elenca i casi senza
chiamare Anthropic né spendere), e ogni giro lascia un report in `reports/`, confrontabile con
quelli dei giri precedenti.

`--model <id>` lancia il set su un modello diverso da quello dell'app, che è il modo di confrontare
due modelli sullo stesso prompt (#57). `--results <file>` **rilegge un giro già pagato** dal file
`.results.json` che ogni giro salva accanto al suo report, senza mandare niente e senza spendere: una
correzione al nostro schema o al report non vale un secondo batch (#93). Il report porta prompt e modello nel nome, quindi i giri
stanno uno accanto all'altro invece di sovrascriversi, e registra anche i **token fatturati**, così
il costo si calcola sui numeri veri. **Toccare `SUMMARY_MODEL` senza aver lanciato il set è vietato**
dall'ADR 0007: i due requisiti che il set misura, le citazioni verbatim e l'Intervento richiesto, non
fanno fallire niente quando il modello li sbaglia.

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
- `notesJudgeable`: se le Note descrivevano dei cambiamenti o rimandavano soltanto altrove. Prende
  `"either"` come `actionRequired`, per i casi in cui le due letture reggono entrambe (una lista
  secca di messaggi di commit). Il report lo conta come l'Intervento richiesto, e dice **non chiesto**
  per un giro con un prompt precedente al `v7`, che la domanda non la faceva.

Un cambiamento dichiarato che non rientra in nessuna delle due liste è **inattesto**, e il report dice
se la citazione che lo accompagna sta davvero nelle Note.

## Che cosa guarda il report

Le invenzioni si verificano da sole: una `quote` che non si trova verbatim nelle Note è inventata
(`locateCitation`, la stessa regola che decide i puntatori alle righe nella pagina della Release).
Restano: corrispondenza dell'Intervento richiesto, breaking changes mancanti, inattese, e quante voci
restano senza citazione.

## Costo

Un giro sono 14 Release, ~114.000 caratteri di Note, cioè attorno a 73.000 token in ingresso e
24.000 in uscita. Con lo sconto della Batch API: **circa 1 centesimo su Haiku 5.5**, misurato il
2026-10-08, e 49 centesimi se si rilancia su Opus 5. **Non lanciarlo senza avvisare l'utente.**
