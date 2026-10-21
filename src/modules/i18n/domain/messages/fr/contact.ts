import type { MessageDictionary } from "../index";

// The contact page, in French. The address itself is not here: it comes from `CONTACT_EMAIL`, so no
// language can retype it wrong.
export const contact = {
  "contact.lede":
    "Une seule adresse, lue par la personne qui tient tout cela. Aucun formulaire, aucun ticket et aucun bot entre les deux, et aucune promesse sur le délai d’une réponse.",

  "contact.write.title": "écrivez ici",
  "contact.write.body":
    "Une synthèse qui lit mal ses notes de version, une release qui n’est jamais apparue, une page qui casse à votre largeur, une question à laquelle la {faq} ne répond pas : tout cela vaut un message. Si quelque chose ne va pas sur une page, l’adresse de cette page est la ligne la plus utile du message.",

  "contact.noNeed.title": "deux choses pour lesquelles vous n’avez pas à écrire",
  "contact.noNeed.delete.lead": "Supprimer votre compte.",
  "contact.noNeed.delete.body":
    "C’est un bouton sur la {account} et il agit tout de suite. Personne n’a à l’approuver.",
  "contact.noNeed.add.lead": "Ajouter une technologie.",
  "contact.noNeed.add.body":
    "Le catalogue est tenu à la main et il n’y a pas de file de demandes, donc un courriel à ce sujet est une chose à savoir et non une chose à suivre. Dites-le quand même si cela compte pour vous.",

  "contact.security.title": "quelque chose qui ne devrait pas être public",
  "contact.security.body":
    "Un problème de sécurité, ou quoi que ce soit touchant aux données d’une autre personne, va à la même adresse et nulle part en public. Dites ce que vous avez trouvé et comment le voir se produire, et laissez le temps de le corriger avant d’en parler à quelqu’un d’autre.",
} as const satisfies Partial<MessageDictionary>;
