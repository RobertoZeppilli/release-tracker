import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Ajustes",
  "settings.intro":
    "Cómo se lee la app para ti. Nada de aquí se comparte con nadie, y nada en las páginas públicas de las releases y de las tecnologías depende de esto.",
  "settings.language.note":
    "El idioma es parte de la dirección, así una página se puede compartir en el idioma en que se leyó. Las notas de la versión y las síntesis siguen en su idioma original.",
  // La sección de las Notificaciones (issue #171, ADR 0009). `featured`, `notable`, `digest` y `Pro`
  // son la gramática del producto y siguen en inglés; los nombres del glosario se traducen dentro de
  // las frases (ADR 0008).
  "settings.notifications.title": "notificaciones",
  "settings.notifications.intro":
    "Qué release te llegan, y por dónde. La campana es gratis para siempre; Slack y el correo son Pro.",
  "settings.notifications.featured.label": "release featured",
  "settings.notifications.featured.off":
    "Apagado, una release featured de una tecnología que sigues no escribe ninguna notificación: nada en la campana, y nada en un canal añadido después.",
  "settings.notifications.notable.label": "release notable",
  "settings.notifications.notable.off":
    "Apagado, una release notable no escribe ninguna notificación. Las featured tienen su propio interruptor, así las release por las que vale la pena interrumpirte siguen encendidas mientras estas callan.",
  "settings.notifications.switch": "{name} en la campana",
  "settings.notifications.error":
    "No se guardó. El interruptor volvió a como lo tiene la base de datos, así que lo que ves es lo que tienes: púlsalo otra vez.",
  "settings.notifications.digest":
    "El resumen semanal traerá su propio interruptor, el día en que llegue el resumen mismo.",
  "settings.notifications.external.title": "slack y correo",
  "settings.notifications.external.body":
    "Los dos canales están en construcción, y cada uno traerá aquí su interruptor cuando llegue. Llevan la marca Pro desde el primer día, prueba incluida: cuando la prueba termina sin Pro se apagan, y nada sigue encendido por costumbre. La campana se queda, gratis.",
  "settings.notifications.pro": "Pro",
  "settings.notifications.trial.waiting":
    "Tu prueba de {count} días de Slack y del correo empieza la primera vez que enciendes uno de ellos, no el día en que te registraste.",
  "settings.notifications.trial.left": {
    one: "Queda un día de prueba de Slack y del correo.",
    many: "Quedan {count} días de prueba de Slack y del correo.",
    other: "Quedan {count} días de prueba de Slack y del correo.",
  },
  "settings.notifications.trial.ended":
    "Tu prueba de Slack y del correo ha terminado. La campana es gratis para siempre; los dos canales externos piden Pro.",
  "settings.notifications.locale.title": "idioma del correo y de slack",
  "settings.notifications.locale.note":
    "El correo y Slack no tienen una dirección de la que leer un idioma, así que se escriben en este. No cambia el idioma del sitio, que sigue siendo el de la dirección, y las notas de la versión y las síntesis se quedan en su idioma original.",
  "settings.notifications.locale.choose": "Escribir el correo y Slack en {name}",
  "settings.notifications.locale.error":
    "No se guardó. El idioma sigue siendo el marcado aquí, que es el que tiene la base de datos: púlsalo otra vez.",
} as const satisfies Partial<MessageDictionary>;
