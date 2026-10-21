import type { MessageDictionary } from "../index";

// The titles and the descriptions, in Italian. `Dashboard` and `Account` are names and stay as they
// are (CONTEXT.md); `Technologies` is the other kind and becomes `Tecnologie`.
export const page = {
  // Il nome del prodotto sta dentro il titolo, quindi questa è la pagina dove il `%s · Verdict`
  // del layout è spento: lo direbbe due volte.
  "page.landing.title": "Verdict, capire prima di aggiornare",
  "page.landing.description":
    "Verdict segue le release delle tecnologie del tuo stack e dà a ognuna un verdetto solo: se ti chiede qualcosa, cosa si rompe e come migrare, e ogni affermazione punta alla riga delle note di rilascio da cui è stata letta.",
  "page.dashboard.title": "Dashboard",
  "page.technologies.title": "Tecnologie",
  "page.account.title": "Account",
  "page.login.title": "Accedi",
  "page.login.description":
    "Accedi con GitHub per seguire le tecnologie e vedere la tua Dashboard.",
  "page.technology.title": "Release di {name}",
  "page.technology.holds":
    "Ogni release di {name}, con una sintesi di cosa è cambiato quando c'è.",
  "page.technology.described": "{description} {holds}",
  "page.release.title": "Release {name} {version}",
  "page.release.published": "{name} {version}, pubblicata il {date}.",
  "page.release.notesOnly":
    "{published} Le note di rilascio come sono state pubblicate, non ancora sintetizzate.",
  "page.opening": "apertura di {name}",
  "page.notFound.claim": "nessuna pagina a questo indirizzo",
  "page.notFound.body":
    "Non è andato storto niente. Questo indirizzo non nomina nessuna tecnologia del catalogo, o nomina una versione senza una release propria: il catalogo è curato, e una release ha una pagina da quando viene rilevata.",
  "page.browseCatalog": "sfoglia il catalogo",
  "page.error.claim": "questa pagina non è stata caricata",
  "page.error.body":
    "Qualcosa dalla nostra parte non ha funzionato mentre costruiva questa pagina. Niente è stato salvato e niente è cambiato, quindi riprovare è sicuro.",
  "page.error.retry": "Riprova",
  "page.error.reference": "riferimento {digest}",
} as const satisfies Partial<MessageDictionary>;
