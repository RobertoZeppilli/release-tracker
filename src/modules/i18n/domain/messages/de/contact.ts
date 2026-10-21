import type { MessageDictionary } from "../index";

// The contact page, in German. The address itself is not here: it comes from `CONTACT_EMAIL`, so no
// language can retype it wrong.
// ⚠️ German says `du` here and everywhere, like the Italian dictionary does: this is a product a
// developer reads about their own stack, and `Sie` would address them as a company.
export const contact = {
  "contact.lede":
    "Eine Adresse, gelesen von der Person, die das hier betreibt. Kein Formular, kein Ticket und kein Bot dazwischen, und kein Versprechen, wie schnell eine Antwort kommt.",

  "contact.write.title": "schreib hierher",
  "contact.write.body":
    "Eine Zusammenfassung, die ihre Release Notes falsch liest, ein Release, das nie aufgetaucht ist, eine Seite, die bei deiner Breite bricht, eine Frage, die die {faq} nicht beantwortet: all das ist eine Nachricht wert. Wenn auf einer Seite etwas falsch ist, ist die Adresse dieser Seite die nützlichste Zeile der Nachricht.",

  "contact.noNeed.title": "zwei Dinge, für die du nicht schreiben musst",
  "contact.noNeed.delete.lead": "Deinen Account löschen.",
  "contact.noNeed.delete.body":
    "Das ist ein Button auf der {account}, und er wirkt sofort. Niemand muss es genehmigen.",
  "contact.noNeed.add.lead": "Eine Technologie hinzufügen.",
  "contact.noNeed.add.body":
    "Der Katalog ist von Hand gepflegt und es gibt keine Warteschlange für Anfragen, also ist eine Mail dazu etwas zum Wissen und nichts zum Nachverfolgen. Sag es trotzdem, wenn es dir wichtig ist.",

  "contact.security.title": "etwas, das nicht öffentlich werden soll",
  "contact.security.body":
    "Ein Sicherheitsproblem, oder alles, was die Daten einer anderen Person betrifft, geht an dieselbe Adresse und an keine öffentliche Stelle. Sag, was du gefunden hast und wie man es passieren sieht, und lass Zeit für die Behebung, bevor du es jemand anderem erzählst.",
} as const satisfies Partial<MessageDictionary>;
