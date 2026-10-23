import type { MessageDictionary } from "../index";

// The privacy notice, in Spanish. The six rows of `what is held` are the database read row by row
// (issue #132), so each one is a label and a reason and both are translated: a row added to the
// tables is added here, in every language, or the dictionary test fails. The names of the providers
// (GitHub, Supabase, Vercel, Anthropic) are not here: they are names, and they stay in the
// component beside the prose that describes them.
export const privacy = {
  "privacy.lede":
    "Todo lo que este producto sabe de ti, escrito desde las tablas en que se guarda. Es una lista corta, y su parte más corta es la que más importa: nada sobre ti se envía nunca a un modelo de lenguaje.",

  "privacy.held.title": "qué se guarda",
  "privacy.held.intro":
    "Nueve cosas, y todas llegan o del acceso con GitHub o de algo que hiciste en la app. No hay perfil que rellenar, ni nombre más allá del que GitHub publica, ni ningún campo que te pregunte nada más.",
  "privacy.held.id.label": "id de la cuenta",
  "privacy.held.id.why":
    "el identificador que crea el acceso, y la clave de cada una de las filas de abajo",
  "privacy.held.email.label": "dirección de correo",
  "privacy.held.email.why": "de GitHub, para que la cuenta se reconozca y se pueda localizar",
  "privacy.held.github.label": "nombre e imagen de github",
  "privacy.held.github.why": "de GitHub, se muestran en la barra superior y en ningún otro sitio",
  "privacy.held.follows.label": "tecnologías seguidas",
  "privacy.held.follows.why": "cuáles, y el día en que empezaste a seguir cada una",
  "privacy.held.versions.label": "versiones declaradas",
  "privacy.held.versions.why": "la versión que dices usar, y el día en que lo dijiste",
  "privacy.held.plan.label": "plan",
  "privacy.held.plan.why": "Free, para todas las cuentas",
  "privacy.held.notifications.label": "notificaciones",
  "privacy.held.notifications.why":
    "de qué release te avisamos, el día en que se escribió, y si la has visto",
  "privacy.held.channels.label": "canales de las notificaciones",
  "privacy.held.channels.why":
    "qué eventos te llegan por qué canal, y la dirección de slack que le des, si le das una",
  "privacy.held.sendLocale.label": "idioma del correo y de slack",
  "privacy.held.sendLocale.why":
    "el idioma en que se escriben esos dos, que fijas en los ajustes",
  "privacy.held.yours":
    "Puedes leer tu propia copia de esa lista, rellena con tus filas, en la {account}.",

  "privacy.prompt.title": "ningún dato personal entra en un prompt",
  "privacy.prompt.body":
    "Las síntesis las escribe un modelo de lenguaje, y al modelo nunca se le dice quién eres. El job que las escribe corre en el servidor, con su propio horario, y lee una sola cosa: las notas de la versión que publicó un proyecto. No sabe qué tecnologías sigue nadie, y una síntesis es el mismo texto para todos los lectores, escrita una vez y guardada.",
  "privacy.prompt.images":
    "El navegador tampoco habla con ningún tercero. La imagen de GitHub se sirve a través de nuestro propio optimizador de imágenes, así que tu navegador se la pide a este sitio y no a GitHub.",

  "privacy.who.title": "quién más lo toca",
  "privacy.who.github":
    "autentica el acceso y entrega tu perfil público y tu dirección de correo. No tiene acceso a los datos de esta app, y esta app no tiene acceso a tus repositorios.",
  "privacy.who.supabase":
    "lleva la base de datos y las sesiones: las nueve filas de arriba viven ahí.",
  "privacy.who.vercel":
    "aloja la app, así que sirve cada petición y guarda los registros de peticiones que eso conlleva, y cuenta las páginas vistas con Vercel Analytics.",
  "privacy.who.anthropic":
    "proporciona el modelo que escribe las síntesis, solo a partir de notas de la versión públicas, como se dice arriba.",

  "privacy.cookies.title": "cookies, y qué hay en tu navegador",
  "privacy.cookies.body":
    "En este sitio no hay banner de consentimiento porque no hay nada que consentir: ni publicidad, ni perfilado, ni ningún tercero que ponga nada en tu navegador.",
  "privacy.cookies.what":
    "Entrar deja cookies de sesión, que son las que te mantienen dentro de una página a la siguiente; salir o borrar la cuenta las limpia. El tema que eliges se guarda en el almacenamiento local de tu navegador, no en una cookie, y nunca sale del navegador. Vercel Analytics cuenta las páginas vistas sin cookie y sin guardar ningún identificador en tu navegador: lo que produce son cuentas de páginas, no el rastro de una persona.",

  "privacy.keep.title": "cuánto tiempo, y cómo terminarlo",
  "privacy.keep.body":
    "Todo lo de arriba se guarda mientras exista la cuenta. Borrar la cuenta en la {account} lo quita al momento: la fila de la cuenta se va, y los seguimientos, las versiones declaradas y el plan se van con ella, porque están ligados a ella y se borran con ella. No hay periodo de gracia, ni archivo nuestro, ni nada con lo que deshacerlo.",
  "privacy.keep.notifications":
    "Las notificaciones son la única fila con un reloj propio: cada una se borra 90 días después de haberse escrito, vista o no, y después no queda nada de ella.",
  "privacy.keep.after":
    "Lo que queda después está fuera de la cuenta: el catálogo, las releases y las síntesis, y nada de eso fue nunca tuyo ni sobre ti. Los proveedores de arriba llevan sus propias copias de seguridad y registros con sus propios plazos, que no controlamos y de los que no podemos borrar.",

  "privacy.reach.title": "cómo localizarnos",
  "privacy.reach.body":
    "Una sola dirección, atendida por la persona que lleva esto: {mail}. Pregunta qué se guarda sobre ti, pide que se borre, o dinos que algo de aquí está mal.",
} as const satisfies Partial<MessageDictionary>;
