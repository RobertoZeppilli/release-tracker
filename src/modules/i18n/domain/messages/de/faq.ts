import type { MessageDictionary } from "../index";

// The FAQ, in German. A question is a key ending in `.q` and its answer the matching `.a`, so a
// question translated without its answer is visible by reading down the file. The order here is the
// order on the page, which is the order a reader scans.
export const faq = {
  "faq.lede":
    "Die Fragen, die dieses Produkt wirklich bekommt, beantwortet mit dem, was es tut, und nicht mit dem, was es gern täte.",

  "faq.section.product": "das Produkt",
  "faq.does.q": "Was macht Verdict?",
  "faq.does.a":
    "Es verfolgt die Releases der Technologien in seinem Katalog und gibt jedem Release ein einziges Urteil: ob es etwas von dir verlangt, was bricht und wie man migriert. Jede Aussage zeigt auf die Zeile der Release Notes, aus der sie gelesen wurde.",
  "faq.add.q": "Kann ich darum bitten, eine Technologie aufzunehmen?",
  "faq.add.a":
    "Nein. Der Katalog ist von Hand gepflegt: eine Technologie kommt hinein, wenn ihre Releases ordentlich verfolgt werden können, und das ist eine Entscheidung und keine Warteschlange. Du kannst schreiben und sagen, was dir fehlt, aber es gibt keine Anfrage einzureichen und nichts nachzuverfolgen.",
  "faq.when.q": "Wie schnell erscheint ein neues Release?",
  "faq.when.a":
    "Der Job, der nach neuen Releases sucht, läuft einmal am Tag. Eine Release-Seite zeigt die Notes, sobald das Release erfasst ist; ihr Urteil erscheint, wenn die Zusammenfassung geschrieben ist, und das ist ein eigener Job, der zurückbleiben kann.",
  "faq.read.q": "Brauche ich einen Account, um ein Release zu lesen?",
  "faq.read.a":
    "Nein. Release- und Technologieseiten sind öffentlich. Ein Account ist nur für den Teil, der dir gehört: Technologien zu folgen, die Version anzugeben, die du einsetzt, und das Dashboard, das aus beidem gebaut ist.",

  "faq.section.summaries": "die Zusammenfassungen",
  "faq.who.q": "Wer schreibt die Zusammenfassungen?",
  "faq.who.a":
    "Ein Sprachmodell, aus den Release Notes, die das Projekt veröffentlicht hat, und aus nichts sonst. Es bekommt keine andere Quelle, keine andere Seite und keine Daten über irgendeinen Leser.",
  "faq.wrong.q": "Kann eine Zusammenfassung falsch sein?",
  "faq.wrong.a":
    "Ja, und die Seite ist unter der Annahme gebaut, dass sie es sein kann. Dafür ist die zitierte Zeile unter einer Aussage da, und darum verlinkt jede Seite die Notes an ihrer Quelle: die Zusammenfassung soll dir das Lesen ersparen, nicht für sich allein geglaubt werden. Wenn ein Fehler teuer wäre, prüfe die zitierte Zeile.",
  "faq.prompt.q": "Kommt irgendetwas über mich in einen Prompt?",
  // `{privacy}` is the link to the privacy notice, named in `doc`.
  "faq.prompt.a":
    "Nein. Die Zusammenfassungen schreibt ein Job auf dem Server, bevor irgendwer die Seite öffnet, und dieser Job weiß nichts über Accounts. Eine Zusammenfassung ist für jeden Leser derselbe Text. Der Rest davon steht in der {privacy}.",

  "faq.section.account": "der Account",
  "faq.scope.q": "Was verlangt die Anmeldung mit GitHub?",
  "faq.scope.a":
    "Dein öffentliches Profil und deine E-Mail-Adresse. Keinen Zugriff auf irgendein Repository, privat oder öffentlich, und in deinen GitHub-Account wird nie etwas geschrieben.",
  // `{limit}` and not `{count}`: the number comes from the Plan and the sentence has one form, so
  // naming it `count` would hand it to the plural rules for nothing.
  "faq.limit.q": "Warum {limit} Technologien?",
  "faq.limit.a":
    "Weil das ist, was der Free-Plan hält, und Free ist der einzige Plan, den es gibt. Das ist ein Stack und kein Katalog: das Limit ist das, was das Dashboard eine Seite bleiben lässt, die man mit einem Blick liest.",
  "faq.delete.q": "Wie lösche ich meinen Account?",
  "faq.delete.a":
    "Auf der {account}. Du tippst ein Wort zur Bestätigung, und der Account geht sofort, mit den Technologien, denen du gefolgt bist, und den Versionen, die du angegeben hast. Es gibt keine Schonfrist und nichts, womit man es zurücknimmt.",
  "faq.cookies.q": "Gibt es ein Cookie-Banner?",
  "faq.cookies.a":
    "Nein, weil es nichts zu fragen gibt: keine Werbung, kein Profiling, und kein Dritter, der etwas in deinem Browser ablegt. Die Anmeldung setzt die Session-Cookies, die dich angemeldet halten, und das Theme, das du wählst, bleibt in deinem eigenen Browser.",
} as const satisfies Partial<MessageDictionary>;
