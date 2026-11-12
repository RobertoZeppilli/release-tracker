import type { MessageDictionary } from "../index";

// The frame, in Italian. `dashboard` stays as it is: the glossary's own column says the name is
// `Dashboard` in Italian too (GLOSSARY.md), and a word a language already uses is not translated for
// the sake of it. `technologies` is the other kind of name and does become `tecnologie`, because the
// rule is that a glossary name reads with that language's word inside a sentence (ADR 0008).
export const shell = {
  "shell.skipToContent": "Vai al contenuto",
  "shell.sections": "Sezioni",
  "shell.nav.dashboard": "dashboard",
  "shell.nav.technologies": "tecnologie",
  "shell.settings": "impostazioni",
  "shell.menu.open": "Menu",
  "shell.menu.close": "Chiudi il menu",
  "shell.breadcrumb": "Percorso di navigazione",
  "shell.backToTop": "Torna all'inizio",
  "shell.theme.toDark": "Passa al tema scuro",
  "shell.theme.toLight": "Passa al tema chiaro",
  "shell.foot.product": "prodotto",
  "shell.foot.legal": "note legali",
  "shell.foot.faq": "faq",
  "shell.foot.contact": "contatti",
  "shell.foot.terms": "termini",
  "shell.foot.privacy": "privacy",
  "shell.foot.attributions": "attribuzioni",
  "shell.language": "lingua",
} as const satisfies Partial<MessageDictionary>;
