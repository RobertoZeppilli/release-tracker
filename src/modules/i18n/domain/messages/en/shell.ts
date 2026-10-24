// The strings of the frame every page is read inside: the bar, the account panel, the breadcrumb and
// the foot. They are written in English because English is where the strings are born and every
// other language is a translation of this file (ADR 0008).
// ⚠️ The names of the glossary are here too, with their English value, and a translation keeps them
// in English rather than leaving them out: `Dashboard` and `Technology` are names, not text
// (`GLOSSARY.md`), and a word that is the same in five languages should still be one key, so the one
// place that decides it is a dictionary instead of a component nobody thought to look at.
export const shell = {
  "shell.skipToContent": "Skip to content",
  "shell.sections": "Sections",
  "shell.nav.dashboard": "dashboard",
  "shell.nav.technologies": "technologies",
  "shell.signIn": "sign in",
  "shell.signOut": "sign out",
  "shell.account": "account",
  "shell.settings": "settings",
  // The accessible name of the button that opens the panel, in its two cases: a handle is who the
  // reader is signed in as, and without one the button is still the account.
  "shell.account.open": "Account",
  "shell.account.openAs": "Account, signed in as {handle}",
  "shell.account.close": "Close account",
  "shell.breadcrumb": "Breadcrumb",
  "shell.backToTop": "Back to top",
  "shell.theme.toDark": "Switch to dark theme",
  "shell.theme.toLight": "Switch to light theme",
  "shell.foot.product": "product",
  "shell.foot.legal": "legal",
  "shell.foot.faq": "faq",
  "shell.foot.contact": "contact",
  "shell.foot.terms": "terms",
  "shell.foot.privacy": "privacy",
  "shell.foot.attributions": "attributions",
  // The picker. `language` is its label in the foot and its accessible name in the panel, and each
  // language names itself in itself (`LOCALE_NAMES`), so no entry here is a language's name.
  "shell.language": "language",
} as const;
