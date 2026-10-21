import type { MessageDictionary } from "../index";

// The account, in German: what it is made of, the way in and the way out of it. `Account löschen`
// is the way out and is said with that verb everywhere, because a reader looking for it looks for
// the word the button carries.
export const account = {
  "account.intro":
    "Alles, woraus dieser Account besteht, und der Weg hinaus. Nichts davon wird mit jemandem geteilt, und nichts auf den öffentlichen Release- und Technologieseiten hängt davon ab.",
  "account.held.signedIn": "angemeldet als",
  "account.held.noEmail": "keine E-Mail-Adresse",
  "account.held.handle": "github-name",
  "account.held.none": "keine",
  "account.held.plan": "plan",
  "account.held.followed": "verfolgt",
  "account.held.quota": "{count} von {limit}",
  "account.held.declared": "angegebene versionen",
  "account.delete.title": "diesen Account löschen",
  "account.delete.intro":
    "Es geht sofort und lässt sich nicht zurücknehmen. Es gibt keine Kopie, aus der man ihn wiederherstellt, und keine Frist, in der man es sich anders überlegt.",
  "account.delete.item.account":
    "den Account selbst, und die E-Mail-Adresse, den GitHub-Namen und das Bild, die mit ihm kamen",
  "account.delete.item.follows": {
    one: "{count} verfolgte Technologie",
    other: "{count} verfolgte Technologien",
  },
  "account.delete.item.declared": {
    one: "{count} angegebene Version im Einsatz",
    other: "{count} angegebene Versionen im Einsatz",
  },
  "account.delete.item.plan": "den Plan des Accounts",
  "account.delete.item.session": "die Session in diesem Browser",
  // `{revoke}` is a gap a link is put in (`Filled`), not a word.
  "account.delete.note":
    "Sich danach wieder anzumelden macht einen neuen, leeren Account und nicht den alten zurück. GitHub führt seinen eigenen Eintrag über die Berechtigung, die du gegeben hast, und das ist das Einzige, was dieser Button nicht erreicht: {revoke}.",
  "account.delete.revoke": "sie auf GitHub widerrufen",
  // `{word}` is the word that has to be typed, which is a constant of the product and not a
  // translation (`DELETION_WORD`).
  "account.delete.confirm": "tippe {word} zur Bestätigung",
  "account.delete.button": "Account löschen",
  "account.delete.error.confirm":
    "das ist nicht das Wort. Es wurde nichts gelöscht: tippe {word} zur Bestätigung.",
  "account.delete.error.failed":
    "das Löschen ist nicht durchgegangen, und es wurde nichts gelöscht. Versuch es gleich noch einmal.",
  // The way in. Lower case openings: the message is the claim after the `error:` label, not a
  // sentence on its own (DESIGN.md, The Severity Pairing Rule).
  "account.login.intro":
    "Technologien zu folgen und das Dashboard gehören dir allein, also brauchen sie einen Account. Release- und Technologieseiten bleiben öffentlich und brauchen keine Anmeldung.",
  "account.login.deleted":
    "dieser Account ist weg, mit den Technologien, denen er gefolgt ist, und den Versionen, die er angegeben hat. Eine Anmeldung macht einen neuen.",
  "account.login.terms":
    "Mit der Anmeldung nimmst du die {terms} an. Die {privacy} sagt, was gespeichert wird, und die Account-Seite löscht alles davon.",
  "account.login.terms.link": "bedingungen",
  "account.login.privacy.link": "Datenschutzerklärung",
  "account.login.button": "Mit GitHub weiter",
  "account.login.scope":
    "Fragt GitHub nur nach deinem öffentlichen Profil und deiner E-Mail-Adresse. Kein Zugriff auf irgendein Repository.",
  "account.login.dev": "Als lokaler Entwickler weiter",
  "account.login.devNote":
    "Nur lokale Entwicklung: diesen Weg hinein gibt es in der Produktion nicht.",
  "account.login.error.denied": "die Anmeldung wurde abgebrochen. Nichts hat sich geändert.",
  "account.login.error.exchange": "dieser Anmeldelink gilt nicht mehr. Versuch es noch einmal.",
  "account.login.error.provider":
    "GitHub ist gerade nicht erreichbar. Versuch es gleich noch einmal.",
  "account.login.error.dev":
    "der lokale Entwickler konnte sich nicht anmelden. Führe `pnpm dev:login` aus und versuch es noch einmal.",
} as const satisfies Partial<MessageDictionary>;
