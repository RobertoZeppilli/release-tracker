import type { MessageDictionary } from "../index";

// The frame, in German. `Dashboard` and `Account` stay as they are: they are the words a German
// developer uses, and `Übersicht` and `Konto` would name things the reader does not call them.
// `technologien` does translate, because the rule is that a glossary name reads with that
// language's word inside a sentence (ADR 0008).
// ⚠️ The navigation and the foot keep the lower case the design gives them in every language
// (DESIGN.md), German nouns included: this is the typography of a label, the same decision the bar
// already makes in the other four languages, and a capital here would make German the one language
// whose bar shouts. Inside a sentence the nouns are capitalised normally, as everywhere else in
// this dictionary.
export const shell = {
  "shell.skipToContent": "Zum Inhalt springen",
  "shell.sections": "Bereiche",
  "shell.nav.dashboard": "dashboard",
  "shell.nav.technologies": "technologien",
  "shell.signIn": "anmelden",
  "shell.signOut": "abmelden",
  "shell.account": "account",
  "shell.settings": "einstellungen",
  "shell.account.open": "Account",
  "shell.account.openAs": "Account, angemeldet als {handle}",
  // Not `Account schließen`: a button that closes a panel must not be read as the one that ends the
  // account.
  "shell.account.close": "Account-Panel schließen",
  "shell.breadcrumb": "Pfadnavigation",
  "shell.backToTop": "Zurück nach oben",
  "shell.theme.toDark": "Zum dunklen Theme wechseln",
  "shell.theme.toLight": "Zum hellen Theme wechseln",
  "shell.foot.product": "produkt",
  "shell.foot.legal": "rechtliches",
  "shell.foot.faq": "faq",
  "shell.foot.contact": "kontakt",
  // `bedingungen` and not `nutzungsbedingungen`: the foot is two columns at 320px, and the longer
  // compound is the word that would push the column past the window.
  "shell.foot.terms": "bedingungen",
  "shell.foot.privacy": "datenschutz",
  "shell.foot.attributions": "attributionen",
  "shell.language": "sprache",
} as const satisfies Partial<MessageDictionary>;
