import type { MessageDictionary } from "../index";

// The terms, in Spanish. Every claim here is one the code makes true (issue #132), so a translation
// that softens one of them makes the page say something the app does not do: the sentences are
// deliberately flat, and Spanish keeps them flat. The follow limit is a gap and never a digit,
// because the Plan is what decides it.
export const terms = {
  "terms.lede":
    "Qué es el servicio, a qué te obliga y qué no promete. Es corto porque el producto es pequeño, y nada de lo que sigue describe algo que la app no haga.",

  "terms.service.title": "el servicio",
  "terms.service.body":
    "Verdict sigue las releases de las tecnologías de su catálogo y le da a cada una un verdicto: si pide algo de ti, qué rompe y cómo migrar. Las páginas de release y de tecnología son públicas y no necesitan cuenta. Seguir una tecnología, declarar la versión que usas y el dashboard son solo tuyos, y esos sí la necesitan.",

  "terms.catalog.title": "el catálogo está curado a mano",
  "terms.catalog.body":
    "El catálogo lo elegimos y lo mantenemos nosotros. No hay formulario para añadir una tecnología ni cola detrás de uno: una tecnología entra cuando podemos seguir sus releases como es debido, y puede retirarse cuando ya no podemos. Una tecnología retirada sigue consultable, y sigue siendo tuya si la seguías.",

  "terms.plan.title": "el plan",
  "terms.plan.body":
    "Hay un solo plan, Free. Sigue hasta {limit} tecnologías y no cuesta nada. La app nunca pide datos de pago, y no hay nada que cancelar.",

  "terms.summaries.title": "las síntesis se generan, y pueden equivocarse",
  "terms.summaries.body":
    "Cada síntesis la escribe un modelo de lenguaje que lee una sola cosa: las notas de la versión que el propio proyecto publicó para esa release. No se le da ninguna otra fuente, ni ningún dato sobre ti.",
  "terms.summaries.check":
    "Un modelo puede leer mal. Por eso una síntesis no es la última palabra de la página: sus afirmaciones llevan la línea de las notas de la versión de la que se leyeron, y la página enlaza las notas en su origen. La cita está ahí para que puedas comprobar en vez de creer. Cuando equivocarse sale caro, lee la línea citada antes de actuar según el verdicto.",

  "terms.account.title": "tu cuenta",
  "terms.account.body":
    "Entras con GitHub, al que se le piden tu perfil público y tu dirección de correo y nada más: ningún acceso a ningún repositorio. Puedes borrar la cuenta en cualquier momento desde la {account}, y borrarla se lleva consigo las tecnologías que sigues y las versiones que declaraste. Qué se guarda, y quién lo toca, está en la {privacy}.",

  "terms.conduct.title": "lo que te pedimos",
  "terms.conduct.body":
    "Léelo, sigue lo que usas y deja el resto en paz: nada de tráfico automatizado más allá del que genera un lector, ningún intento de llegar a los datos de otra cuenta, ningún intento de romper la app ni los servicios que hay detrás. Una cuenta que haga cualquiera de esas cosas puede cerrarse sin avisar.",

  "terms.warranty.title": "sin garantía",
  "terms.warranty.body":
    "El servicio se ofrece tal como está. Puede cambiar, puede no estar disponible y puede terminar. Las síntesis pueden equivocarse, las notas de la versión que leen pueden ser erróneas o incompletas por sí mismas, y una actualización sigue siendo tu decisión y tu responsabilidad. Nada de aquí es un consejo, y no se acepta ninguna responsabilidad por lo que se derive de una actualización.",

  "terms.changes.title": "los cambios, y cómo localizarnos",
  "terms.changes.body":
    "Estos términos pueden cambiar. La fecha de arriba de esta página es el día en que su texto cambió por última vez, y es el único registro que hay de eso. Preguntas, errores que veas, cualquier otra cosa: {mail}.",
} as const satisfies Partial<MessageDictionary>;
