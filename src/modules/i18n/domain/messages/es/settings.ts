import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Ajustes",
  "settings.intro":
    "Cómo se lee la app para ti. Nada de aquí se comparte con nadie, y nada en las páginas públicas de las releases y de las tecnologías depende de esto.",
  "settings.language.title": "Idioma",
  "settings.language.interface": "idioma de la interfaz",
  "settings.language.note":
    "El idioma es parte de la dirección, así una página se puede compartir en el idioma en que se leyó. Las notas de la versión y las síntesis siguen en su idioma original.",
  // La sección de las Notificaciones (issue #171, ADR 0009). `featured`, `notable`, `digest` y `Pro`
  // son la gramática del producto y siguen en inglés; los nombres del glosario se traducen dentro de
  // las frases (ADR 0008).
  "settings.notifications.title": "Notificaciones",
  "settings.notifications.intro":
    "Qué release te llegan, y por dónde. La campana es gratis para siempre; Slack es Pro.",
  "settings.notifications.bell.title": "la campana",
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
  "settings.notifications.pro": "Pro",
  "settings.notifications.trial.start": "empezar la prueba de 30 días de Pro",
  "settings.notifications.trial.note": "30 días, gratis. Después, Slack pide Pro; la campana sigue gratis.",
  "settings.notifications.trial.left": {
    one: "Queda un día de prueba de Pro.",
    many: "Quedan {count} días de prueba de Pro.",
    other: "Quedan {count} días de prueba de Pro.",
  },
  "settings.notifications.trial.ended": "La prueba de Pro ha terminado. Slack pide Pro; la campana sigue gratis.",
  "settings.notifications.switch.slack": "{name} en Slack",
  "settings.notifications.slack.title": "slack",
  "settings.notifications.slack.connect": "Add to Slack",
  "settings.notifications.slack.dialog.title": "Añadir Verdict a Slack",
  "settings.notifications.slack.dialog.asks": "Slack pide un workspace y un canal.",
  "settings.notifications.slack.dialog.continue": "continuar en Slack",
  "settings.notifications.slack.dialog.cancel": "cancelar",
  "settings.notifications.slack.result.connected": "Slack está conectado.",
  "settings.notifications.slack.result.cancelled": "No ha cambiado nada: no se dio la autorización.",
  "settings.notifications.slack.result.failed":
    "Slack no terminó la autorización, así que no se guardó nada. Inténtalo otra vez.",
  "settings.notifications.slack.result.denied":
    "Ese regreso no pertenece a una autorización empezada aquí, así que se rechazó. Empieza otra vez desde esta página.",
  "settings.notifications.slack.result.unavailable":
    "Add to Slack no está disponible aquí, así que pega un webhook aquí abajo.",
  "settings.notifications.slack.manual": "o pega un webhook tú mismo",
  "settings.notifications.slack.manualNote":
    "La otra vía, y la única en desarrollo: crea un incoming webhook en tu workspace, elige el canal y pega la URL. Es un secreto, así que una vez guardado solo vuelves a leer adónde apunta, nunca la URL entera.",
  "settings.notifications.slack.label": "URL del incoming webhook",
  "settings.notifications.slack.save": "guardar",
  "settings.notifications.slack.remove": "quitar",
  "settings.notifications.slack.current": "Envía a {hint}. Deja el campo vacío y guarda para quitarlo.",
  "settings.notifications.slack.none": "Todavía no hay webhook, así que los dos interruptores de abajo no envían nada.",
  "settings.notifications.slack.invalid":
    "No guardado. La URL de un webhook empieza por https://hooks.slack.com/services/ y viene de tu propio workspace.",
  "settings.notifications.slack.featured.off":
    "Apagado, las releases featured siguen llegando a la campana y dejan de llegar a Slack.",
  "settings.notifications.slack.notable.off":
    "Apagado, las releases notable dejan de llegar a Slack. Las featured tienen su propio interruptor y pueden seguir llegando.",
  "settings.notifications.slack.grouping":
    "Un mensaje por ronda, con una línea por release: diez releases en una ronda llegan como un solo mensaje, no diez.",
  "settings.notifications.slack.test": "enviar un mensaje de prueba",
  "settings.notifications.slack.testOk": "El mensaje de prueba salió. El canal funciona.",
  "settings.notifications.slack.testFailed": "Slack no lo aceptó: {error}",
  "settings.notifications.slack.testEmpty": "Todavía no hay nada que probar: guarda antes un webhook.",
  "settings.notifications.locale.title": "idioma de slack",
  "settings.notifications.locale.note":
    "Slack no tiene una dirección de la que leer un idioma, así que se escribe en este. No cambia el idioma del sitio, que sigue siendo el de la dirección, y las notas de la versión y las síntesis se quedan en su idioma original.",
  "settings.notifications.locale.choose": "Escribir Slack en {name}",
  "settings.notifications.locale.error":
    "No se guardó. El idioma sigue siendo el marcado aquí, que es el que tiene la base de datos: púlsalo otra vez.",
} as const satisfies Partial<MessageDictionary>;
