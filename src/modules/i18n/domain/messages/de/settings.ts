import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Einstellungen",
  "settings.intro":
    "Wie sich die App für dich liest. Nichts davon wird mit jemandem geteilt, und nichts auf den öffentlichen Release- und Technologieseiten hängt davon ab.",
  "settings.language.note":
    "Die Sprache ist Teil der Adresse, also lässt sich eine Seite in der Sprache teilen, in der sie gelesen wurde. Release Notes und Zusammenfassungen bleiben in ihrer Originalsprache.",
} as const satisfies Partial<MessageDictionary>;
