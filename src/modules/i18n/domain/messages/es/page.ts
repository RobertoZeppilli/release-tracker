import type { MessageDictionary } from "../index";

// The titles and the descriptions, in Spanish. `Dashboard` is a name and stays as it is;
// `Technologies` is the other kind and becomes `Tecnologías`.
export const page = {
  // The product name is inside this title, so this is the page where the layout's `%s · Verdict` is
  // turned off: it would say the name twice.
  "page.landing.title": "Verdict, entender antes de actualizar",
  "page.landing.description":
    "Verdict sigue las releases de las tecnologías de tu stack y le da a cada una un solo verdicto: si te pide algo, qué se rompe y cómo migrar, y cada afirmación apunta a la línea de las notas de la versión de la que se leyó.",
  "page.dashboard.title": "Dashboard",
  "page.technologies.title": "Tecnologías",
  "page.account.title": "Cuenta",
  "page.login.title": "Entrar",
  "page.login.description":
    "Entra con GitHub para seguir tecnologías y ver tu dashboard.",
  // The five document pages. The title says the word the foot calls the page by, not a synonym:
  // `Términos del servicio` is the long form of `términos`, which the foot keeps short to fit its
  // column.
  "page.faq.title": "FAQ",
  "page.faq.description":
    "Qué sigue Verdict, para qué sirve una cuenta, y hasta qué punto se puede confiar en una síntesis generada.",
  "page.terms.title": "Términos del servicio",
  "page.terms.description":
    "Qué es Verdict, qué tiene el plan gratuito, y por qué una síntesis generada muestra siempre la línea de la que se leyó.",
  "page.privacy.title": "Privacidad",
  "page.privacy.description":
    "Todo lo que Verdict guarda de un desarrollador, quién lo toca, y por qué ningún dato personal entra nunca en un prompt.",
  "page.attributions.title": "Atribuciones",
  "page.attributions.description":
    "De dónde vienen las marcas de las tecnologías, las notas de la versión, las tipografías y los iconos de Verdict, y bajo qué licencia.",
  "page.contact.title": "Contacto",
  "page.contact.description":
    "Una sola dirección, atendida por la persona que lleva Verdict.",
  "page.technology.title": "Releases de {name}",
  "page.technology.holds":
    "Cada release de {name}, con una síntesis de qué cambió cuando la hay.",
  "page.technology.described": "{description} {holds}",
  "page.release.title": "Release {name} {version}",
  "page.release.published": "{name} {version}, publicada el {date}.",
  "page.release.notesOnly":
    "{published} Las notas de la versión tal como se publicaron, aún sin sintetizar.",
  "page.opening": "abriendo {name}",
  "page.notFound.claim": "no hay página en esta dirección",
  "page.notFound.body":
    "No ha fallado nada. Esta dirección no nombra ninguna tecnología del catálogo, o nombra una versión sin release propia: el catálogo está curado a mano, y una release tiene página desde que se detecta.",
  "page.browseCatalog": "explorar el catálogo",
  "page.error.claim": "esta página no se ha podido cargar",
  "page.error.body":
    "Algo de nuestro lado falló mientras construía esta página. No se guardó nada y nada cambió, así que volver a probar es seguro.",
  "page.error.retry": "Volver a probar",
  "page.error.reference": "referencia {digest}",
} as const satisfies Partial<MessageDictionary>;
