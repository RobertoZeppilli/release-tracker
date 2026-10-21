import type { MessageDictionary } from "../index";

// The FAQ, in French. A question is a key ending in `.q` and its answer the matching `.a`, so a
// question translated without its answer is visible by reading down the file. The order here is the
// order on the page, which is the order a reader scans.
export const faq = {
  "faq.lede":
    "Les questions que ce produit reçoit vraiment, répondues par ce qu’il fait plutôt que par ce qu’il aimerait faire.",

  "faq.section.product": "le produit",
  "faq.does.q": "Que fait Verdict ?",
  "faq.does.a":
    "Il suit les releases des technologies de son catalogue et donne à chaque release un seul verdict : si elle demande quelque chose de vous, ce qui casse, et comment migrer. Chaque affirmation pointe la ligne des notes de version dont elle a été lue.",
  "faq.add.q": "Puis-je demander l’ajout d’une technologie ?",
  "faq.add.a":
    "Non. Le catalogue est tenu à la main : une technologie y entre quand ses releases peuvent être suivies correctement, et c’est une décision plutôt qu’une file d’attente. Vous pouvez écrire et dire ce qui vous manque, mais il n’y a pas de demande à déposer et rien à suivre.",
  "faq.when.q": "Au bout de combien de temps une nouvelle release apparaît-elle ?",
  "faq.when.a":
    "Le job qui cherche les nouvelles releases tourne une fois par jour. Une page de release montre les notes dès que la release est enregistrée ; son verdict arrive quand la synthèse a été écrite, ce qui est un autre job et peut prendre du retard.",
  "faq.read.q": "Faut-il un compte pour lire une release ?",
  "faq.read.a":
    "Non. Les pages de release et de technologie sont publiques. Un compte ne sert qu’à la part qui est la vôtre : suivre des technologies, déclarer la version que vous utilisez, et le dashboard construit à partir des deux.",

  "faq.section.summaries": "les synthèses",
  "faq.who.q": "Qui écrit les synthèses ?",
  "faq.who.a":
    "Un modèle de langue, à partir des notes de version que le projet a publiées et de rien d’autre. Aucune autre source, aucune autre page et aucune donnée sur un lecteur ne lui sont données.",
  "faq.wrong.q": "Une synthèse peut-elle se tromper ?",
  "faq.wrong.a":
    "Oui, et la page est construite en partant du principe qu’elle peut. C’est à cela que sert la ligne citée sous une affirmation, et c’est pourquoi chaque page renvoie aux notes à leur source : la synthèse est là pour vous épargner la lecture, pas pour être crue toute seule. Quand une erreur coûterait cher, vérifiez la ligne citée.",
  "faq.prompt.q": "Est-ce que quelque chose me concernant entre dans un prompt ?",
  // `{privacy}` is the link to the privacy notice, named in `doc`.
  "faq.prompt.a":
    "Non. Les synthèses sont écrites par un job sur le serveur, avant que quiconque ouvre la page, et ce job ne sait rien des comptes. Une synthèse est le même texte pour chaque lecteur. Le reste est dans la {privacy}.",

  "faq.section.account": "le compte",
  "faq.scope.q": "Que demande la connexion GitHub ?",
  "faq.scope.a":
    "Votre profil public et votre adresse e-mail. Aucun accès à un dépôt, privé ou public, et rien n’est jamais écrit dans votre compte GitHub.",
  // `{limit}` and not `{count}`: the number comes from the Plan and the sentence has one form, so
  // naming it `count` would hand it to the plural rules for nothing.
  "faq.limit.q": "Pourquoi {limit} technologies ?",
  "faq.limit.a":
    "Parce que c’est ce que tient le plan Free, et Free est le seul plan qui existe. C’est une stack, pas un catalogue : la limite est ce qui garde le dashboard lisible d’un coup d’œil.",
  "faq.delete.q": "Comment supprimer mon compte ?",
  "faq.delete.a":
    "Sur la {account}. Vous tapez un mot pour confirmer, et le compte part aussitôt, avec les technologies que vous suiviez et les versions que vous avez déclarées. Il n’y a pas de délai de grâce et rien pour revenir en arrière.",
  "faq.cookies.q": "Y a-t-il une bannière de cookies ?",
  "faq.cookies.a":
    "Non, parce qu’il n’y a rien à demander : pas de publicité, pas de profilage, et aucun tiers qui dépose quoi que ce soit dans votre navigateur. La connexion dépose les cookies de session qui vous gardent connecté, et le thème que vous choisissez reste dans votre propre navigateur.",
} as const satisfies Partial<MessageDictionary>;
