import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Ajustes",
  "settings.intro":
    "Cómo se lee la app para ti. Nada de aquí se comparte con nadie, y nada en las páginas públicas de las releases y de las tecnologías depende de esto.",
  "settings.language.note":
    "El idioma es parte de la dirección, así una página se puede compartir en el idioma en que se leyó. Las notas de la versión y las síntesis siguen en su idioma original.",
} as const satisfies Partial<MessageDictionary>;
