import type { MessageDictionary } from "../index";

// The frame, in Spanish. `dashboard` stays as it is: it is the word a Spanish-speaking developer
// uses for this screen, and `panel de control` would name something the reader does not call it.
// `tecnologías` does translate, because the rule is that a glossary name reads with that language's
// word inside a sentence (ADR 0008).
export const shell = {
  "shell.skipToContent": "Ir al contenido",
  "shell.sections": "Secciones",
  "shell.nav.dashboard": "dashboard",
  "shell.nav.technologies": "tecnologías",
  "shell.signIn": "entrar",
  "shell.signOut": "salir",
  "shell.account": "cuenta",
  "shell.settings": "ajustes",
  "shell.account.open": "Cuenta",
  "shell.account.openAs": "Cuenta, con acceso como {handle}",
  // Not `cerrar la cuenta`: a button that closes a panel must not be read as the one that ends the
  // account.
  "shell.account.close": "Cerrar el panel de la cuenta",
  "shell.breadcrumb": "Ruta de navegación",
  "shell.backToTop": "Volver arriba",
  "shell.theme.toDark": "Cambiar al tema oscuro",
  "shell.theme.toLight": "Cambiar al tema claro",
  "shell.foot.product": "producto",
  "shell.foot.legal": "aviso legal",
  "shell.foot.faq": "faq",
  "shell.foot.contact": "contacto",
  "shell.foot.terms": "términos",
  "shell.foot.privacy": "privacidad",
  "shell.foot.attributions": "atribuciones",
  "shell.language": "idioma",
} as const satisfies Partial<MessageDictionary>;
