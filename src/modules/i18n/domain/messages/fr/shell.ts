import type { MessageDictionary } from "../index";

// The frame, in French. `dashboard` stays as it is: it is the word a French developer uses for this
// screen, and `tableau de bord` would name something the reader does not call it. `technologies`
// does translate, because the rule is that a glossary name reads with that language's word inside a
// sentence (ADR 0008), and in French the word happens to be spelled the same.
export const shell = {
  "shell.skipToContent": "Aller au contenu",
  "shell.sections": "Sections",
  "shell.nav.dashboard": "dashboard",
  "shell.nav.technologies": "technologies",
  "shell.signIn": "se connecter",
  "shell.signOut": "se déconnecter",
  "shell.account": "compte",
  "shell.settings": "paramètres",
  "shell.account.open": "Compte",
  "shell.account.openAs": "Compte, connecté en tant que {handle}",
  // Not `fermer le compte`: a button that closes a panel must not be read as the one that ends the
  // account.
  "shell.account.close": "Fermer le panneau du compte",
  "shell.breadcrumb": "Fil d’Ariane",
  "shell.backToTop": "Retour en haut",
  "shell.theme.toDark": "Passer au thème sombre",
  "shell.theme.toLight": "Passer au thème clair",
  "shell.foot.product": "produit",
  "shell.foot.legal": "mentions légales",
  "shell.foot.faq": "faq",
  "shell.foot.contact": "contact",
  "shell.foot.terms": "conditions",
  "shell.foot.privacy": "confidentialité",
  "shell.foot.attributions": "attributions",
  "shell.language": "langue",
} as const satisfies Partial<MessageDictionary>;
