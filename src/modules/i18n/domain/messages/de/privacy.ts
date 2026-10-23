import type { MessageDictionary } from "../index";

// The privacy notice, in German. The six rows of `what is held` are the database read row by row
// (issue #132), so each one is a label and a reason and both are translated: a row added to the
// tables is added here, in every language, or the dictionary test fails. The names of the providers
// (GitHub, Supabase, Vercel, Anthropic) are not here: they are names, and they stay in the
// component beside the prose that describes them.
// ⚠️ The six labels sit in a narrow column, and German compounds are the longest of the five
// languages: each one is kept to two words at most, which is what holds the table at 320px.
export const privacy = {
  "privacy.lede":
    "Alles, was dieses Produkt über dich weiß, geschrieben aus den Tabellen, in denen es liegt. Es ist eine kurze Liste, und ihr kürzester Teil ist der wichtigste: nichts über dich geht jemals an ein Sprachmodell.",

  "privacy.held.title": "was gespeichert wird",
  "privacy.held.intro":
    "Neun Dinge, und sie kommen alle entweder aus der Anmeldung mit GitHub oder aus etwas, das du in der App getan hast. Es gibt kein Profil zum Ausfüllen, keinen Namen über den hinaus, den GitHub veröffentlicht, und kein Feld, das dich nach etwas anderem fragt.",
  "privacy.held.id.label": "account-id",
  "privacy.held.id.why":
    "die Kennung, die die Anmeldung anlegt, und der Schlüssel jeder Zeile hier unten",
  "privacy.held.email.label": "e-mail-adresse",
  "privacy.held.email.why": "von GitHub, damit der Account erkannt und erreicht werden kann",
  "privacy.held.github.label": "github-name und -bild",
  "privacy.held.github.why": "von GitHub, in der oberen Leiste gezeigt und nirgends sonst",
  "privacy.held.follows.label": "verfolgte technologien",
  "privacy.held.follows.why": "welche, und der Tag, an dem du jeder gefolgt bist",
  "privacy.held.versions.label": "angegebene versionen",
  "privacy.held.versions.why": "die Version, die du einsetzt, und der Tag, an dem du es gesagt hast",
  "privacy.held.plan.label": "plan",
  "privacy.held.plan.why": "Free, für jeden Account",
  "privacy.held.notifications.label": "benachrichtigungen",
  "privacy.held.notifications.why":
    "von welchem Release du erfahren hast, der Tag, an dem sie geschrieben wurde, und ob du sie gesehen hast",
  "privacy.held.channels.label": "kanäle der benachrichtigungen",
  "privacy.held.channels.why":
    "welche Ereignisse dich über welchen Kanal erreichen, und die Slack-Adresse, die du ihm gibst, falls du eine gibst",
  "privacy.held.sendLocale.label": "sprache von e-mail und slack",
  "privacy.held.sendLocale.why":
    "die Sprache, in der diese zwei geschrieben werden, die du in den Einstellungen festlegst",
  "privacy.held.yours":
    "Deine eigene Kopie dieser Liste, mit deinen Zeilen gefüllt, kannst du auf der {account} lesen.",

  "privacy.prompt.title": "keine persönlichen Daten kommen in einen Prompt",
  "privacy.prompt.body":
    "Die Zusammenfassungen schreibt ein Sprachmodell, und dem Modell wird nie gesagt, wer du bist. Der Job, der sie schreibt, läuft auf dem Server nach seinem eigenen Zeitplan und liest eine einzige Sache: die Release Notes, die ein Projekt veröffentlicht hat. Er weiß nicht, welchen Technologien irgendwer folgt, und eine Zusammenfassung ist für jeden Leser derselbe Text, einmal geschrieben und gespeichert.",
  "privacy.prompt.images":
    "Der Browser spricht auch mit keinem Dritten. Das GitHub-Bild wird über unseren eigenen Bildoptimierer ausgeliefert, also fragt dein Browser dafür diese Seite und nicht GitHub.",

  "privacy.who.title": "wer es außerdem berührt",
  "privacy.who.github":
    "authentifiziert die Anmeldung und übergibt dein öffentliches Profil und deine E-Mail-Adresse. Es hat keinen Zugriff auf die Daten dieser App, und diese App hat keinen Zugriff auf deine Repositories.",
  "privacy.who.supabase":
    "betreibt die Datenbank und die Sessions: die neun Zeilen von oben liegen dort.",
  "privacy.who.vercel":
    "hostet die App, bedient also jede Anfrage und führt die Anfrage-Logs, die dazugehören, und zählt die Seitenaufrufe über Vercel Analytics.",
  "privacy.who.anthropic":
    "stellt das Modell, das die Zusammenfassungen schreibt, allein aus öffentlichen Release Notes, wie oben.",

  "privacy.cookies.title": "Cookies, und was in deinem Browser liegt",
  "privacy.cookies.body":
    "Auf dieser Seite gibt es kein Consent-Banner, weil es nichts zu bewilligen gibt: keine Werbung, kein Profiling, und keinen Dritten, der etwas in deinem Browser ablegt.",
  "privacy.cookies.what":
    "Die Anmeldung setzt Session-Cookies, und sie sind es, die dich von einer Seite zur nächsten angemeldet halten; abmelden oder den Account löschen räumt sie weg. Das Theme, das du wählst, liegt im Local Storage deines Browsers, nicht in einem Cookie, und verlässt den Browser nie. Vercel Analytics zählt Seitenaufrufe ohne Cookie und ohne eine Kennung in deinem Browser zu speichern: heraus kommen Zahlen über Seiten, nicht die Spur einer Person.",

  "privacy.keep.title": "wie lange, und wie man es beendet",
  "privacy.keep.body":
    "Alles von oben wird gespeichert, solange der Account existiert. Den Account auf der {account} zu löschen nimmt es sofort weg: die Zeile des Accounts geht, und die Folgen, die angegebenen Versionen und der Plan gehen mit ihr, weil sie an sie geschlüsselt sind und mit ihr gelöscht werden. Es gibt keine Schonfrist, kein Archiv bei uns und nichts, womit man es zurücknimmt.",
  "privacy.keep.notifications":
    "Die Benachrichtigungen sind die eine Zeile mit einer eigenen Uhr: jede wird 90 Tage nach dem Schreiben gelöscht, gesehen oder nicht, und danach bleibt nichts von ihr.",
  "privacy.keep.after":
    "Was danach bleibt, liegt außerhalb des Accounts: der Katalog, die Releases und die Zusammenfassungen, und nichts davon war je deins oder über dich. Die Anbieter von oben führen ihre eigenen Backups und Logs nach ihren eigenen Zeitplänen, die wir weder steuern noch aus denen wir löschen können.",

  "privacy.reach.title": "wie du uns erreichst",
  "privacy.reach.body":
    "Eine Adresse, beantwortet von der Person, die das hier betreibt: {mail}. Frag, was über dich gespeichert ist, bitte darum, es zu löschen, oder sag uns, dass hier etwas falsch ist.",
} as const satisfies Partial<MessageDictionary>;
