import type { MessageDictionary } from "../index";

// The attributions, in Spanish. The names of what is credited (simple-icons, Lucide, Fragment Mono,
// Hanken Grotesk, the licences) are not here: a licence name is an identifier, and translating
// `CC0 1.0` would be translating a reference number.
export const attributions = {
  "attributions.lede":
    "Casi todo lo que ves aquí lo hizo alguien más. Esta página dice quién, y bajo qué licencia, en un solo sitio en vez de en una nota al pie de cada página.",

  "attributions.marks.title": "las marcas de las tecnologías",
  "attributions.marks.body":
    "La marca pequeña y monocroma que acompaña a una tecnología viene de {simpleIcons}, publicada bajo CC0 1.0. Los trazados están copiados en este repositorio y se sirven desde este sitio, así que ninguna página de esta app llama a un CDN para pedirlos.",
  "attributions.marks.trademarks":
    "Las marcas en sí siguen siendo de sus dueños. Aquí se usan para nombrar la tecnología de la que habla una fila, en la forma y nunca en el color, y no implican ningún respaldo a este producto ni ninguna relación con él. Una tecnología cuya marca no está en simple-icons simplemente no tiene ninguna aquí.",

  "attributions.notes.title": "las notas de la versión",
  "attributions.notes.body":
    "Cada página de release se construye sobre las notas que el propio proyecto publicó, y esas notas son del proyecto y se usan según sus propios términos. Una línea citada se cita para poder comprobarla, y cada página enlaza las notas en su origen. Una síntesis es nuestra lectura de ellas, no las palabras del proyecto, y nunca habla en su nombre.",

  "attributions.type.title": "las tipografías y los iconos",
  "attributions.type.body":
    "La voz monoespaciada es Fragment Mono y la prosa es Hanken Grotesk, ambas publicadas en Google Fonts bajo la SIL Open Font License, y ambas servidas desde este sitio y no desde Google. Los iconos de la interfaz son {lucide}, bajo licencia ISC.",

  "attributions.runs.title": "sobre qué funciona",
  "attributions.runs.body":
    "Next.js y React para la app, Supabase para la base de datos y el acceso, Vercel para el alojamiento, Anthropic para el modelo que escribe las síntesis, y una lista larga de paquetes open source por debajo. Cuáles de ellos tocan algo tuyo está en la {privacy}.",
} as const satisfies Partial<MessageDictionary>;
