import type { MessageDictionary } from "../index";

// The titles and the descriptions, in French. `Dashboard` and `Account` are names and stay as they
// are, the second with the French spelling `Compte` because that is the word the bar already uses.
export const page = {
  // The product name is inside this title, so this is the page where the layout's `%s · Verdict` is
  // turned off: it would say the name twice.
  "page.landing.title": "Verdict, comprendre avant de mettre à jour",
  "page.landing.description":
    "Verdict suit les releases des technologies de votre stack et donne à chacune un seul verdict : si elle vous demande quelque chose, ce qui casse et comment migrer, et chaque affirmation pointe la ligne des notes de version dont elle a été lue.",
  "page.dashboard.title": "Dashboard",
  "page.technologies.title": "Technologies",
  "page.account.title": "Compte",
  "page.login.title": "Se connecter",
  "page.login.description":
    "Connectez-vous avec GitHub pour suivre des technologies et voir votre dashboard.",
  // The five document pages. The title says the word the foot calls the page by, not a synonym:
  // `Conditions d’utilisation` is the long form of `conditions`, which the foot keeps short to fit
  // its column.
  "page.faq.title": "FAQ",
  "page.faq.description":
    "Ce que Verdict suit, à quoi sert un compte, et jusqu’où une synthèse générée peut être crue.",
  "page.terms.title": "Conditions d’utilisation",
  "page.terms.description":
    "Ce qu’est Verdict, ce que tient le plan gratuit, et pourquoi une synthèse générée montre toujours la ligne dont elle a été lue.",
  "page.privacy.title": "Confidentialité",
  "page.privacy.description":
    "Tout ce que Verdict conserve d’un développeur, qui y touche, et pourquoi aucune donnée personnelle n’entre jamais dans un prompt.",
  "page.attributions.title": "Attributions",
  "page.attributions.description":
    "D’où viennent les marques des technologies, les notes de version, les polices et les icônes de Verdict, et sous quelle licence.",
  "page.contact.title": "Contact",
  "page.contact.description":
    "Une seule adresse, à laquelle répond la personne qui fait tourner Verdict.",
  "page.technology.title": "Releases de {name}",
  "page.technology.holds":
    "Chaque release de {name}, avec une synthèse de ce qui a changé quand il y en a une.",
  "page.technology.described": "{description} {holds}",
  "page.release.title": "Release {name} {version}",
  "page.release.published": "{name} {version}, publiée le {date}.",
  "page.release.notesOnly":
    "{published} Les notes de version telles qu’elles ont été publiées, pas encore synthétisées.",
  "page.opening": "ouverture de {name}",
  "page.notFound.claim": "aucune page à cette adresse",
  "page.notFound.body":
    "Rien ne s’est mal passé. Cette adresse ne nomme aucune technologie du catalogue, ou nomme une version sans release propre : le catalogue est tenu à la main, et une release a une page dès qu’elle est détectée.",
  "page.browseCatalog": "parcourir le catalogue",
  "page.error.claim": "cette page n’a pas pu être chargée",
  "page.error.body":
    "Quelque chose de notre côté a échoué pendant la construction de cette page. Rien n’a été enregistré et rien n’a changé, donc réessayer ne risque rien.",
  "page.error.retry": "Réessayer",
  "page.error.reference": "référence {digest}",
} as const satisfies Partial<MessageDictionary>;
