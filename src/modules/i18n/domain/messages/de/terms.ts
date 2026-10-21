import type { MessageDictionary } from "../index";

// The terms, in German. Every claim here is one the code makes true (issue #132), so a translation
// that softens one of them makes the page say something the app does not do: the sentences are
// deliberately flat, and German keeps them flat. The follow limit is a gap and never a digit,
// because the Plan is what decides it.
export const terms = {
  "terms.lede":
    "Was der Dienst ist, worauf er dich verpflichtet und was er nicht verspricht. Es ist kurz, weil das Produkt klein ist, und nichts hier unten beschreibt etwas, das die App nicht tut.",

  "terms.service.title": "der Dienst",
  "terms.service.body":
    "Verdict verfolgt die Releases der Technologien in seinem Katalog und gibt jedem ein Urteil: ob es etwas von dir verlangt, was bricht und wie man migriert. Release- und Technologieseiten sind öffentlich und brauchen keinen Account. Einer Technologie zu folgen, die Version anzugeben, die du einsetzt, und das Dashboard gehören dir allein, und die brauchen einen.",

  "terms.catalog.title": "der Katalog ist von Hand gepflegt",
  "terms.catalog.body":
    "Den Katalog wählen und pflegen wir. Es gibt kein Formular, um eine Technologie hinzuzufügen, und keine Warteschlange dahinter: eine Technologie kommt hinein, wenn wir ihre Releases ordentlich verfolgen können, und sie kann herausgenommen werden, wenn wir das nicht mehr können. Eine herausgenommene Technologie bleibt lesbar, und sie bleibt deine, wenn du ihr gefolgt bist.",

  "terms.plan.title": "der Plan",
  "terms.plan.body":
    "Es gibt einen Plan, Free. Er folgt bis zu {limit} Technologien und kostet nichts. Die App fragt nie nach Zahlungsdaten, und es gibt nichts zu kündigen.",

  "terms.summaries.title": "die Zusammenfassungen sind generiert und können falsch sein",
  "terms.summaries.body":
    "Jede Zusammenfassung schreibt ein Sprachmodell, das eine einzige Sache liest: die Release Notes, die das Projekt selbst für dieses Release veröffentlicht hat. Es bekommt keine andere Quelle und keine Daten über dich.",
  "terms.summaries.check":
    "Ein Modell kann falsch lesen. Darum ist eine Zusammenfassung nicht das letzte Wort der Seite: ihre Aussagen tragen die Zeile der Release Notes, aus der sie gelesen wurden, und die Seite verlinkt die Notes an ihrer Quelle. Das Zitat steht da, damit du prüfen kannst statt zu glauben. Wenn ein Fehler teuer wäre, lies die zitierte Zeile, bevor du nach dem Urteil handelst.",

  "terms.account.title": "dein Account",
  "terms.account.body":
    "Du meldest dich mit GitHub an, das nach deinem öffentlichen Profil und deiner E-Mail-Adresse gefragt wird und nach nichts weiter: kein Zugriff auf irgendein Repository. Du kannst den Account jederzeit auf der {account} löschen, und das Löschen nimmt die Technologien mit, denen du folgst, und die Versionen, die du angegeben hast. Was gespeichert wird, und von wem, steht in der {privacy}.",

  "terms.conduct.title": "was wir von dir erwarten",
  "terms.conduct.body":
    "Lies es, folge dem, was du einsetzt, und lass den Rest in Ruhe: kein automatisierter Verkehr über das hinaus, was ein Leser erzeugt, kein Versuch, an die Daten eines anderen Accounts zu kommen, kein Versuch, die App oder die Dienste dahinter zu brechen. Ein Account, der eines davon tut, kann ohne Vorwarnung beendet werden.",

  "terms.warranty.title": "keine Gewährleistung",
  "terms.warranty.body":
    "Der Dienst wird so bereitgestellt, wie er ist. Er kann sich ändern, er kann nicht verfügbar sein, und er kann aufhören. Die Zusammenfassungen können falsch sein, die Release Notes, die sie lesen, können selbst falsch oder unvollständig sein, und ein Upgrade bleibt deine Entscheidung und deine Verantwortung. Nichts hier ist eine Beratung, und für die Folgen eines Upgrades wird keine Haftung übernommen.",

  "terms.changes.title": "Änderungen, und wie du uns erreichst",
  "terms.changes.body":
    "Diese Bedingungen können sich ändern. Das Datum oben auf dieser Seite ist der Tag, an dem ihr Text zuletzt geändert wurde, und es ist der einzige Nachweis darüber. Fragen, Fehler, die dir auffallen, alles andere: {mail}.",
} as const satisfies Partial<MessageDictionary>;
