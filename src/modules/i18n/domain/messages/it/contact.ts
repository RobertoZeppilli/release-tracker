import type { MessageDictionary } from "../index";

// I contatti, in italiano. L'indirizzo non è qui: viene da `CONTACT_EMAIL`, così nessuna lingua può
// ribatterlo sbagliato.
export const contact = {
  "contact.lede":
    "Un indirizzo solo, letto dalla persona che manda avanti tutto questo. Non c'è un modulo, non c'è un ticket e non c'è un bot in mezzo, e non c'è nessuna promessa su quanto in fretta arrivi una risposta.",

  "contact.write.title": "scrivi qui",
  "contact.write.body":
    "Una sintesi che legge male le sue note di rilascio, una release che non è mai comparsa, una pagina che si rompe alla tua larghezza, una domanda a cui le {faq} non rispondono: vale la pena scrivere di tutto questo. Se su una pagina c'è qualcosa che non va, l'indirizzo di quella pagina è la riga più utile del messaggio.",

  "contact.noNeed.title": "due cose per cui non devi scrivere",
  "contact.noNeed.delete.lead": "Cancellare il tuo account.",
  "contact.noNeed.delete.body": "È un pulsante nella {account} e funziona subito. Non deve approvarlo nessuno.",
  "contact.noNeed.add.lead": "Aggiungere una tecnologia.",
  "contact.noNeed.add.body":
    "Il catalogo è curato e non c'è una coda di richieste, quindi una mail al riguardo è una cosa da sapere e non una cosa da tracciare. Dillo lo stesso, se ci tieni.",

  "contact.security.title": "qualcosa che non dovrebbe essere pubblico",
  "contact.security.body":
    "Un problema di sicurezza, o qualunque cosa riguardi i dati di un'altra persona, va allo stesso indirizzo e in nessun posto pubblico. Di' cosa hai trovato e come si fa a vederlo succedere, e dagli il tempo di essere sistemato prima di dirlo a qualcun altro.",
} as const satisfies Partial<MessageDictionary>;
