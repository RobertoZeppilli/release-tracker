import type { MessageDictionary } from "../index";

// The account, in Spanish: what it is made of, the way in and the way out of it. `borrar la cuenta`
// is the way out and is said with that verb everywhere, because a reader looking for it looks for
// the word the button carries.
export const account = {
  "account.intro":
    "Todo aquello de lo que está hecha esta cuenta, y la salida. Nada de aquí se comparte con nadie, y nada en las páginas públicas de las releases y de las tecnologías depende de esto.",
  "account.held.signedIn": "con acceso como",
  "account.held.noEmail": "sin dirección de correo",
  "account.held.handle": "nombre de github",
  "account.held.none": "ninguna",
  "account.held.plan": "plan",
  "account.held.followed": "seguidas",
  "account.held.quota": "{count} de {limit}",
  "account.held.declared": "versiones declaradas",
  "account.delete.title": "borrar esta cuenta",
  "account.delete.intro":
    "Se va al momento y no se puede deshacer. No hay copia desde la que restaurarla ni plazo para cambiar de opinión.",
  "account.delete.item.account":
    "la cuenta en sí, y la dirección de correo y el nombre y la imagen de GitHub que vinieron con ella",
  "account.delete.item.follows": {
    one: "{count} tecnología seguida",
    many: "{count} tecnologías seguidas",
    other: "{count} tecnologías seguidas",
  },
  "account.delete.item.declared": {
    one: "{count} versión declarada en uso",
    many: "{count} versiones declaradas en uso",
    other: "{count} versiones declaradas en uso",
  },
  "account.delete.item.plan": "el plan de la cuenta",
  "account.delete.item.session": "la sesión en este navegador",
  // `{revoke}` is a gap a link is put in (`Filled`), not a word.
  "account.delete.note":
    "Volver a entrar después crea una cuenta nueva y vacía, no la antigua de vuelta. GitHub guarda su propio registro de la autorización que diste, y es lo único que este botón no alcanza: {revoke}.",
  "account.delete.revoke": "revocarla en GitHub",
  // `{word}` is the word that has to be typed, which is a constant of the product and not a
  // translation (`DELETION_WORD`).
  "account.delete.confirm": "escribe {word} para confirmar",
  "account.delete.button": "Borrar la cuenta",
  "account.delete.error.confirm":
    "esa no es la palabra. No se ha borrado nada: escribe {word} para confirmar.",
  "account.delete.error.failed":
    "el borrado no salió adelante, y no se ha borrado nada. Vuelve a probar en un momento.",
  // The way in. Lower case openings: the message is the claim after the `error:` label, not a
  // sentence on its own (DESIGN.md, The Severity Pairing Rule).
  "account.login.intro":
    "Seguir tecnologías y el dashboard son solo tuyos, así que necesitan una cuenta. Las páginas de release y de tecnología siguen públicas y no piden entrar.",
  "account.login.deleted":
    "esa cuenta ya no está, con las tecnologías que seguía y las versiones que declaró. Entrar crea una nueva.",
  "account.login.terms":
    "Entrar acepta los {terms}. La {privacy} dice qué se guarda, y la página de la cuenta lo borra todo.",
  "account.login.terms.link": "términos",
  "account.login.privacy.link": "política de privacidad",
  "account.login.button": "Continuar con GitHub",
  "account.login.scope":
    "A GitHub solo le pide tu perfil público y tu dirección de correo. Ningún acceso a ningún repositorio.",
  "account.login.dev": "Continuar como desarrollador local",
  "account.login.devNote":
    "Solo para desarrollo local: esta entrada no existe en producción.",
  "account.login.error.denied": "el acceso se canceló. Nada ha cambiado.",
  "account.login.error.exchange": "ese enlace de acceso ya no vale. Vuelve a probar.",
  "account.login.error.provider":
    "GitHub no está localizable ahora mismo. Vuelve a probar en un momento.",
  "account.login.error.dev":
    "el desarrollador local no ha podido entrar. Ejecuta `pnpm dev:login` y vuelve a probar.",
} as const satisfies Partial<MessageDictionary>;
