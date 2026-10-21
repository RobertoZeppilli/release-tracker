import type { MessageDictionary } from "../index";

// The FAQ, in Spanish. A question is a key ending in `.q` and its answer the matching `.a`, so a
// question translated without its answer is visible by reading down the file. The order here is the
// order on the page, which is the order a reader scans.
export const faq = {
  "faq.lede":
    "Las preguntas que este producto recibe de verdad, respondidas con lo que hace y no con lo que le gustaría hacer.",

  "faq.section.product": "el producto",
  "faq.does.q": "¿Qué hace Verdict?",
  "faq.does.a":
    "Sigue las releases de las tecnologías de su catálogo y le da a cada release un solo verdicto: si pide algo de ti, qué rompe y cómo migrar. Cada afirmación apunta a la línea de las notas de la versión de la que se leyó.",
  "faq.add.q": "¿Puedo pedir que se añada una tecnología?",
  "faq.add.a":
    "No. El catálogo está curado a mano: una tecnología entra cuando sus releases se pueden seguir como es debido, y eso es una decisión y no una cola. Puedes escribir y decir qué echas en falta, pero no hay petición que presentar ni nada que seguir.",
  "faq.when.q": "¿Cuánto tarda en aparecer una release nueva?",
  "faq.when.a":
    "El job que busca releases nuevas corre una vez al día. Una página de release muestra las notas en cuanto la release queda registrada; su verdicto aparece cuando la síntesis está escrita, que es otro job y puede ir con retraso.",
  "faq.read.q": "¿Necesito cuenta para leer una release?",
  "faq.read.a":
    "No. Las páginas de release y de tecnología son públicas. La cuenta solo es para la parte que es tuya: seguir tecnologías, declarar la versión que usas, y el dashboard construido con las dos cosas.",

  "faq.section.summaries": "las síntesis",
  "faq.who.q": "¿Quién escribe las síntesis?",
  "faq.who.a":
    "Un modelo de lenguaje, a partir de las notas de la versión que publicó el proyecto y de nada más. No se le da ninguna otra fuente, ninguna otra página ni ningún dato sobre ningún lector.",
  "faq.wrong.q": "¿Puede equivocarse una síntesis?",
  "faq.wrong.a":
    "Sí, y la página está construida dando por hecho que puede. Para eso está la línea citada bajo una afirmación, y por eso cada página enlaza las notas en su origen: la síntesis está para ahorrarte la lectura, no para que se la crea sola. Cuando equivocarse sale caro, comprueba la línea citada.",
  "faq.prompt.q": "¿Entra algo sobre mí en un prompt?",
  // `{privacy}` is the link to the privacy notice, named in `doc`.
  "faq.prompt.a":
    "No. Las síntesis las escribe un job en el servidor, antes de que nadie abra la página, y ese job no sabe nada de cuentas. Una síntesis es el mismo texto para todos los lectores. El resto está en la {privacy}.",

  "faq.section.account": "la cuenta",
  "faq.scope.q": "¿Qué pide el acceso con GitHub?",
  "faq.scope.a":
    "Tu perfil público y tu dirección de correo. Ningún acceso a ningún repositorio, privado o público, y nunca se escribe nada en tu cuenta de GitHub.",
  // `{limit}` and not `{count}`: the number comes from the Plan and the sentence has one form, so
  // naming it `count` would hand it to the plural rules for nothing.
  "faq.limit.q": "¿Por qué {limit} tecnologías?",
  "faq.limit.a":
    "Porque es lo que tiene el plan Free, y Free es el único plan que hay. Es una stack, no un catálogo: el límite es lo que mantiene el dashboard en una página que se lee de un vistazo.",
  "faq.delete.q": "¿Cómo borro mi cuenta?",
  "faq.delete.a":
    "En la {account}. Escribes una palabra para confirmar, y la cuenta se va al momento, con las tecnologías que seguías y las versiones que declaraste. No hay periodo de gracia ni nada con lo que deshacerlo.",
  "faq.cookies.q": "¿Hay banner de cookies?",
  "faq.cookies.a":
    "No, porque no hay nada que preguntar: ni publicidad, ni perfilado, ni ningún tercero que ponga nada en tu navegador. Entrar deja las cookies de sesión que te mantienen dentro, y el tema que eliges se queda en tu propio navegador.",
} as const satisfies Partial<MessageDictionary>;
