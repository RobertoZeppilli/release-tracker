import type { MessageDictionary } from "../index";

// The attributions, in German. The names of what is credited (simple-icons, Lucide, Fragment Mono,
// Hanken Grotesk, the licences) are not here: a licence name is an identifier, and translating
// `CC0 1.0` would be translating a reference number.
export const attributions = {
  "attributions.lede":
    "Das meiste, was du hier siehst, hat jemand anderes gemacht. Diese Seite sagt wer, und unter welcher Lizenz, an einer Stelle statt in einer Fußnote auf jeder einzelnen Seite.",

  "attributions.marks.title": "die Marken der Technologien",
  "attributions.marks.body":
    "Das kleine einfarbige Zeichen neben einer Technologie kommt von {simpleIcons}, veröffentlicht unter CC0 1.0. Die Pfade liegen als Kopie in diesem Repository und werden von dieser Seite ausgeliefert, also ruft keine Seite dieser App dafür ein CDN auf.",
  "attributions.marks.trademarks":
    "Die Marken selbst bleiben die ihrer Inhaber. Sie stehen hier, um die Technologie zu benennen, um die es in einer Zeile geht, in der Form und nie in der Farbe, und sie bedeuten keine Billigung dieses Produkts und keine Beziehung zu ihm. Eine Technologie, deren Zeichen nicht in simple-icons steht, hat hier einfach keines.",

  "attributions.notes.title": "die Release Notes",
  "attributions.notes.body":
    "Jede Release-Seite ist auf den Notes gebaut, die das Projekt selbst veröffentlicht hat, und diese Notes gehören dem Projekt und werden unter seinen eigenen Bedingungen genutzt. Eine zitierte Zeile ist zitiert, damit sie geprüft werden kann, und jede Seite verlinkt die Notes an ihrer Quelle. Eine Zusammenfassung ist unsere Lesart davon, nicht das Wort des Projekts, und spricht nie für das Projekt.",

  "attributions.type.title": "die Schriften und die Icons",
  "attributions.type.body":
    "Die Monospace-Stimme ist Fragment Mono und die Prosa ist Hanken Grotesk, beide auf Google Fonts unter der SIL Open Font License veröffentlicht und beide von dieser Seite ausgeliefert statt von Google. Die Icons der Oberfläche sind {lucide}, unter der ISC-Lizenz.",

  "attributions.runs.title": "worauf das läuft",
  "attributions.runs.body":
    "Next.js und React für die App, Supabase für die Datenbank und die Anmeldung, Vercel für das Hosting, Anthropic für das Modell, das die Zusammenfassungen schreibt, und eine lange Liste von Open-Source-Paketen darunter. Welche davon etwas von dir berühren, steht in der {privacy}.",
} as const satisfies Partial<MessageDictionary>;
