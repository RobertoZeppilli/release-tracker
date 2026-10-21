import type { MessageDictionary } from "../index";

// L'informativa sulla privacy, in italiano. Le sei righe di `cosa viene tenuto` sono il database
// letto riga per riga (issue #132): l'etichetta resta minuscola e corta come in inglese, perché è
// una colonna di una tabella e non un titolo. `account id` resta così: è il nome della colonna.
export const privacy = {
  "privacy.lede":
    "Tutto quello che questo prodotto sa di te, scritto a partire dalle tabelle in cui è tenuto. È un elenco corto, e la parte più corta è quella che conta di più: di te al modello linguistico non va mai niente.",

  "privacy.held.title": "cosa viene tenuto",
  "privacy.held.intro":
    "Sei cose, e arrivano tutte o dall'accesso con GitHub o da qualcosa che hai fatto nell'app. Non c'è un profilo da compilare, non c'è un nome oltre a quello che GitHub pubblica, e non c'è un campo che ti chieda altro.",
  "privacy.held.id.label": "account id",
  "privacy.held.id.why": "l'identificatore che crea l'accesso, con cui è indicizzata ogni riga qui sotto",
  "privacy.held.email.label": "indirizzo email",
  "privacy.held.email.why": "da GitHub, perché l'account possa essere riconosciuto e raggiunto",
  "privacy.held.github.label": "nome e foto github",
  "privacy.held.github.why": "da GitHub, mostrati nella barra in alto e in nessun altro posto",
  "privacy.held.follows.label": "tecnologie seguite",
  "privacy.held.follows.why": "quali, e il giorno in cui hai cominciato a seguire ognuna",
  "privacy.held.versions.label": "versioni dichiarate",
  "privacy.held.versions.why": "la versione che dici di usare, e il giorno in cui l'hai detto",
  "privacy.held.plan.label": "piano",
  "privacy.held.plan.why": "Free, per ogni account",
  "privacy.held.yours": "La tua copia di quell'elenco, riempita con le tue righe, la leggi nella {account}.",

  "privacy.prompt.title": "nessun dato personale entra in un prompt",
  "privacy.prompt.body":
    "Le sintesi le scrive un modello linguistico, e al modello non viene mai detto chi sei. Il job che le scrive gira sul server, su una sua pianificazione, e legge una cosa sola: le note di rilascio che un progetto ha pubblicato. Non sa quali tecnologie segua nessuno, e una sintesi è lo stesso testo per chiunque legga, scritta una volta e salvata.",
  "privacy.prompt.images":
    "Nemmeno il browser parla con un terzo. La foto di GitHub è servita attraverso il nostro ottimizzatore di immagini, quindi il tuo browser la chiede a questo sito invece che a GitHub.",

  "privacy.who.title": "chi altro ci mette le mani",
  "privacy.who.github":
    "autentica l'accesso e consegna il tuo profilo pubblico e il tuo indirizzo email. Non ha accesso ai dati di quest'app, e quest'app non ha accesso ai tuoi repository.",
  "privacy.who.supabase": "fa girare il database e le sessioni: le sei righe qui sopra stanno lì.",
  "privacy.who.vercel":
    "ospita l'app, quindi serve ogni richiesta e tiene i log delle richieste che ne vengono, e conta le visualizzazioni delle pagine con Vercel Analytics.",
  "privacy.who.anthropic":
    "fornisce il modello che scrive le sintesi, a partire dalle sole note di rilascio pubbliche, come sopra.",

  "privacy.cookies.title": "i cookie, e cosa c'è nel tuo browser",
  "privacy.cookies.body":
    "Su questo sito non c'è un banner di consenso perché non c'è niente a cui acconsentire: nessuna pubblicità, nessuna profilazione, e nessun terzo che metta qualcosa nel tuo browser.",
  "privacy.cookies.what":
    "L'accesso imposta i cookie di sessione, che sono quelli che ti tengono dentro da una pagina all'altra; uscire o cancellare l'account li cancella. Il tema che scegli è tenuto nel local storage del tuo browser, non in un cookie, e dal browser non esce mai. Vercel Analytics conta le visualizzazioni senza un cookie e senza salvare un identificatore nel tuo browser: quello che produce sono conteggi di pagine, non la traccia di una persona.",

  "privacy.keep.title": "per quanto, e come farla finire",
  "privacy.keep.body":
    "Tutto quello che c'è qui sopra è tenuto finché l'account esiste. Cancellare l'account dalla {account} lo toglie subito: la riga dell'account va via, e con lei vanno le tecnologie seguite, le versioni dichiarate e il piano, perché sono indicizzate su di lei e cancellate con lei. Non c'è un periodo di grazia, non c'è un nostro archivio, e non c'è niente con cui tornare indietro.",
  "privacy.keep.after":
    "Quello che resta dopo è fuori dall'account: il catalogo, le release e le sintesi, che non sono mai stati tuoi né su di te. I fornitori qui sopra fanno i loro backup e i loro log su pianificazioni loro, che non controlliamo e da cui non possiamo cancellare.",

  "privacy.reach.title": "come scriverci",
  "privacy.reach.body":
    "Un indirizzo solo, a cui risponde la persona che manda avanti tutto questo: {mail}. Chiedi cosa viene tenuto di te, chiedi che venga cancellato, o dicci che qui c'è qualcosa di sbagliato.",
} as const satisfies Partial<MessageDictionary>;
