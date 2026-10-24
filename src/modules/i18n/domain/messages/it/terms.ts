import type { MessageDictionary } from "../index";

// I termini, in italiano. Ogni affermazione è una che il codice rende vera (issue #132), quindi la
// traduzione è tenuta piatta come l'inglese: una frase italiana più morbida prometterebbe qualcosa
// che l'app non fa, ed è l'unico modo in cui questa pagina può sbagliare.
// `Free` resta `Free`: è il nome del Piano (GLOSSARY.md), non l'aggettivo.
export const terms = {
  "terms.lede":
    "Cos'è il servizio, a cosa ti impegna e cosa non promette. È corto perché il prodotto è piccolo, e qui sotto non c'è niente che descriva una cosa che l'app non fa.",

  "terms.service.title": "il servizio",
  "terms.service.body":
    "Verdict segue le release delle tecnologie del suo catalogo e dà a ognuna un verdetto: se ti chiede qualcosa, cosa si rompe e come migrare. Le pagine delle release e delle tecnologie sono pubbliche e non vogliono un account. Seguire una tecnologia, dichiarare la versione in uso e la Dashboard sono soltanto tuoi, e quelli un account lo vogliono.",

  "terms.catalog.title": "il catalogo è curato",
  "terms.catalog.body":
    "Il catalogo lo scegliamo e lo manteniamo noi. Non c'è un modulo per aggiungerci una tecnologia e non c'è una coda dietro: una tecnologia entra quando riusciamo a seguire le sue release come si deve, e può essere ritirata quando non ci riusciamo più. Una tecnologia ritirata resta leggibile, e resta tua se la seguivi.",

  "terms.plan.title": "il piano",
  "terms.plan.body":
    "C'è un piano solo, Free. Segue fino a {limit} tecnologie e non costa niente. L'app non chiede mai dati di pagamento, e non c'è niente da disdire.",

  "terms.summaries.title": "le sintesi sono generate, e possono sbagliare",
  "terms.summaries.body":
    "Ogni sintesi è scritta da un modello linguistico che legge una cosa sola: le note di rilascio che il progetto stesso ha pubblicato per quella release. Non riceve altre fonti, e nessun dato su di te.",
  "terms.summaries.check":
    "Un modello può leggere male. È per questo che una sintesi non è l'ultima parola della pagina: le sue affermazioni portano la riga delle note di rilascio da cui sono state lette, e la pagina linka le note alla fonte. La citazione è lì perché tu possa controllare invece di fidarti. Quando sbagliare costa caro, leggi la riga citata prima di agire sul verdetto.",

  "terms.account.title": "il tuo account",
  "terms.account.body":
    "Accedi con GitHub, a cui vengono chiesti il tuo profilo pubblico e il tuo indirizzo email e niente altro: nessun accesso a nessun repository. Puoi cancellare l'account quando vuoi dalla {account}, e cancellandolo se ne vanno con lui le tecnologie che segui e le versioni che hai dichiarato. Cosa viene tenuto, e da chi, sta nell'{privacy}.",

  "terms.conduct.title": "cosa chiediamo a te",
  "terms.conduct.body":
    "Leggerlo, seguire quello che usi, e lasciare stare il resto: niente traffico automatico oltre a quello che fa un lettore, nessun tentativo di arrivare ai dati di un altro account, nessun tentativo di rompere l'app o i servizi che ci stanno dietro. Un account che faccia una di queste cose può essere chiuso senza preavviso.",

  "terms.warranty.title": "nessuna garanzia",
  "terms.warranty.body":
    "Il servizio è fornito così com'è. Può cambiare, può non essere disponibile, e può finire. Le sintesi possono sbagliare, le note di rilascio che leggono possono essere a loro volta sbagliate o incomplete, e un aggiornamento resta una tua decisione e una tua responsabilità. Qui dentro non c'è nessun consiglio, e non ci si assume nessuna responsabilità per quello che segue a un aggiornamento.",

  "terms.changes.title": "i cambiamenti, e come scriverci",
  "terms.changes.body":
    "Questi termini possono cambiare. La data in cima alla pagina è il giorno in cui il suo testo è cambiato l'ultima volta, ed è l'unica traccia che ce ne sia. Domande, errori che noti, qualunque altra cosa: {mail}.",
} as const satisfies Partial<MessageDictionary>;
