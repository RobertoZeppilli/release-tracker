import type { MessageDictionary } from "../index";

// The account, in Italian. The openings of the error messages stay lower case: the message is the
// claim after the `error:` label, not a sentence of its own (DESIGN.md).
export const account = {
  "account.intro":
    "Tutto ciò di cui è fatto questo account, e la via per uscirne. Niente di qui è condiviso con nessuno, e niente nelle pagine pubbliche delle release e delle tecnologie dipende da questo.",
  "account.held.signedIn": "accesso come",
  "account.held.noEmail": "nessun indirizzo email",
  "account.held.handle": "nome github",
  "account.held.none": "nessuno",
  "account.held.plan": "piano",
  "account.held.followed": "seguite",
  "account.held.quota": "{count} di {limit}",
  "account.held.declared": "versioni dichiarate",
  "account.delete.title": "elimina questo account",
  "account.delete.intro":
    "Va via subito e non si può annullare. Non c'è nessuna copia da cui recuperarlo e nessuna finestra per ripensarci.",
  "account.delete.item.account":
    "l'account stesso, con l'indirizzo email, il nome GitHub e l'immagine che sono arrivati con lui",
  "account.delete.item.follows": {
    one: "{count} tecnologia seguita",
    many: "{count} tecnologie seguite",
    other: "{count} tecnologie seguite",
  },
  "account.delete.item.declared": {
    one: "{count} versione in uso dichiarata",
    many: "{count} versioni in uso dichiarate",
    other: "{count} versioni in uso dichiarate",
  },
  "account.delete.item.plan": "il piano su cui sta l'account",
  "account.delete.item.session": "la sessione in questo browser",
  "account.delete.note":
    "Accedere di nuovo fa un account nuovo e vuoto, non quello di prima. GitHub tiene da parte sua il registro dell'autorizzazione che gli hai dato, ed è l'unica cosa che questo pulsante non raggiunge: {revoke}.",
  "account.delete.revoke": "revocala su GitHub",
  "account.delete.confirm": "scrivi {word} per confermare",
  "account.delete.button": "Elimina l'account",
  "account.delete.error.confirm":
    "non è quella la parola. Niente è stato eliminato: scrivi {word} per confermare.",
  "account.delete.error.failed":
    "l'eliminazione non è andata a buon fine, e niente è stato eliminato. Riprova tra un momento.",
  "account.login.intro":
    "Seguire le tecnologie e la Dashboard sono solo tuoi, quindi richiedono un account. Le pagine delle release e delle tecnologie restano pubbliche e non richiedono l'accesso.",
  "account.login.deleted":
    "quell'account non c'è più, con le tecnologie che seguiva e le versioni che dichiarava. Accedere ne fa uno nuovo.",
  "account.login.terms":
    "Accedendo accetti i {terms}. L'{privacy} dice cosa viene conservato, e la pagina dell'account elimina tutto.",
  "account.login.terms.link": "termini",
  "account.login.privacy.link": "informativa sulla privacy",
  "account.login.button": "Continua con GitHub",
  "account.login.scope":
    "Chiede a GitHub solo il tuo profilo pubblico e il tuo indirizzo email. Nessun accesso a nessun repository.",
  "account.login.dev": "Continua come sviluppatore locale",
  "account.login.devNote":
    "Solo per lo sviluppo locale: questa via d'accesso non esiste in produzione.",
  "account.login.error.denied": "l'accesso è stato annullato. Niente è cambiato.",
  "account.login.error.exchange": "quel link di accesso non è più valido. Riprova.",
  "account.login.error.provider":
    "GitHub è irraggiungibile in questo momento. Riprova tra un momento.",
  "account.login.error.dev":
    "lo sviluppatore locale non è riuscito ad accedere. Esegui `pnpm dev:login` e riprova.",
} as const satisfies Partial<MessageDictionary>;
