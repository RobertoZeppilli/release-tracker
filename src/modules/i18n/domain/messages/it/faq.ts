import type { MessageDictionary } from "../index";

// Le FAQ, in italiano. Le domande sono quelle che un lettore si fa, quindi sono scritte con il `tu`
// come il resto dell'app, e la risposta comincia con il `No.` o il `Sì.` dove l'inglese lo fa: è la
// parola che il lettore cerca per prima, e in fondo a una frase non la troverebbe.
export const faq = {
  "faq.lede":
    "Le domande che a questo prodotto vengono fatte davvero, con la risposta che gli viene da quello che fa, non da quello che vorrebbe fare.",

  "faq.section.product": "il prodotto",
  "faq.does.q": "Cosa fa Verdict?",
  "faq.does.a":
    "Segue le release delle tecnologie del suo catalogo e dà a ognuna un verdetto solo: se ti chiede qualcosa, cosa si rompe e come migrare. Ogni affermazione punta alla riga delle note di rilascio da cui è stata letta.",
  "faq.add.q": "Posso chiedere che venga aggiunta una tecnologia?",
  "faq.add.a":
    "No. Il catalogo è curato: una tecnologia ci entra quando le sue release si possono seguire come si deve, ed è una decisione, non una coda. Puoi scrivere e dire cosa ti manca, ma non c'è una richiesta da presentare né niente da tracciare.",
  "faq.when.q": "Quanto ci mette a comparire una release nuova?",
  "faq.when.a":
    "Il job che cerca le release nuove gira una volta al giorno. La pagina di una release mostra le note appena la release è registrata; il verdetto compare quando la sintesi è stata scritta, che è un job a parte e può restare indietro.",
  "faq.read.q": "Serve un account per leggere una release?",
  "faq.read.a":
    "No. Le pagine delle release e delle tecnologie sono pubbliche. L'account serve solo per la parte che è tua: seguire le tecnologie, dichiarare la versione in uso, e la Dashboard costruita sulle due cose.",

  "faq.section.summaries": "le sintesi",
  "faq.who.q": "Chi scrive le sintesi?",
  "faq.who.a":
    "Un modello linguistico, a partire dalle note di rilascio che il progetto ha pubblicato e da niente altro. Non riceve altre fonti, altre pagine, né dati su chi legge.",
  "faq.wrong.q": "Una sintesi può sbagliare?",
  "faq.wrong.a":
    "Sì, e la pagina è costruita dando per scontato che possa. È per questo che sotto un'affermazione c'è la riga citata, ed è per questo che ogni pagina linka le note alla fonte: la sintesi è lì per risparmiarti la lettura, non per essere creduta da sola. Quando sbagliare costa caro, controlla la riga citata.",
  "faq.prompt.q": "Finisce qualcosa di mio dentro un prompt?",
  "faq.prompt.a":
    "No. Le sintesi le scrive un job sul server, prima che qualcuno apra la pagina, e quel job non sa niente degli account. Una sintesi è lo stesso testo per chiunque legga. Il resto sta nell'{privacy}.",

  "faq.section.notifications": "le notifiche, gratis e Pro",
  "faq.notify.q": "Quando qualcosa mi avvisa?",
  "faq.notify.a":
    "Quando una release featured o notable di una tecnologia che segui ha la sua sintesi pronta. La campanella nella barra in alto è gratis per sempre, ed è l'unico canale costruito finora.",
  "faq.pro.q": "Cosa è Free e cosa è Pro?",
  "faq.pro.a":
    "Free tiene tutto quello che il sito è: ogni pagina di release, ogni sintesi, {limit} tecnologie seguite e la campanella. Pro sono i canali esterni delle notifiche, Slack e l'email, con una prova di 30 giorni che parte la prima volta che ne accendi uno e non dal giorno in cui ti sei registrato. Quando la prova finisce senza Pro quei due si spengono, per tutti, e la campanella resta.",

  "faq.section.account": "l'account",
  "faq.scope.q": "Cosa chiede l'accesso con GitHub?",
  "faq.scope.a":
    "Il tuo profilo pubblico e il tuo indirizzo email. Nessun accesso a nessun repository, privato o pubblico, e sul tuo account GitHub non viene scritto mai niente.",
  "faq.limit.q": "Perché {limit} tecnologie?",
  "faq.limit.a":
    "Perché è quello che tiene il piano Free. È uno stack, non un catalogo: il limite è quello che tiene la Dashboard una pagina che si legge in un colpo d'occhio.",
  "faq.delete.q": "Come cancello il mio account?",
  "faq.delete.a":
    "Dalla {account}. Scrivi una parola per confermare, e l'account va via subito, con le tecnologie che seguivi e le versioni che avevi dichiarato. Non c'è un periodo di grazia e non c'è niente con cui tornare indietro.",
  "faq.cookies.q": "C'è un banner dei cookie?",
  "faq.cookies.a":
    "No, perché non c'è niente da chiedere: nessuna pubblicità, nessuna profilazione, e nessun terzo che metta qualcosa nel tuo browser. L'accesso imposta i cookie di sessione che ti tengono dentro, e il tema che scegli resta nel tuo browser.",
} as const satisfies Partial<MessageDictionary>;
