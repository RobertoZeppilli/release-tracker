import type { MessageDictionary } from "../index";

// The privacy notice, in French. The six rows of `what is held` are the database read row by row
// (issue #132), so each one is a label and a reason and both are translated: a row added to the
// tables is added here, in every language, or the dictionary test fails. The names of the providers
// (GitHub, Supabase, Vercel, Anthropic) are not here: they are names, and they stay in the
// component beside the prose that describes them.
export const privacy = {
  "privacy.lede":
    "Tout ce que ce produit sait de vous, écrit depuis les tables où c’est conservé. C’est une courte liste, et sa partie la plus courte est celle qui compte le plus : rien de vous n’est jamais envoyé à un modèle de langue.",

  "privacy.held.title": "ce qui est conservé",
  "privacy.held.intro":
    "Six choses, et toutes arrivent soit de la connexion GitHub, soit de quelque chose que vous avez fait dans l’app. Il n’y a pas de profil à remplir, pas de nom au-delà de celui que GitHub publie, et aucun champ qui vous demande autre chose.",
  "privacy.held.id.label": "identifiant du compte",
  "privacy.held.id.why":
    "l’identifiant que crée la connexion, et la clé de chacune des lignes ci-dessous",
  "privacy.held.email.label": "adresse e-mail",
  "privacy.held.email.why": "depuis GitHub, pour que le compte soit reconnu et joignable",
  "privacy.held.github.label": "nom et image github",
  "privacy.held.github.why": "depuis GitHub, affichés dans la barre du haut et nulle part ailleurs",
  "privacy.held.follows.label": "technologies suivies",
  "privacy.held.follows.why": "lesquelles, et le jour où chacune a été suivie",
  "privacy.held.versions.label": "versions déclarées",
  "privacy.held.versions.why": "la version que vous dites utiliser, et le jour où vous l’avez dite",
  "privacy.held.plan.label": "plan",
  "privacy.held.plan.why": "Free, pour chaque compte",
  "privacy.held.yours":
    "Vous pouvez lire votre propre copie de cette liste, remplie avec vos lignes, sur la {account}.",

  "privacy.prompt.title": "aucune donnée personnelle n’entre dans un prompt",
  "privacy.prompt.body":
    "Les synthèses sont écrites par un modèle de langue, et on ne dit jamais au modèle qui vous êtes. Le job qui les écrit tourne sur le serveur, selon son propre calendrier, et lit une seule chose : les notes de version qu’un projet a publiées. Il ne sait pas quelles technologies qui que ce soit suit, et une synthèse est le même texte pour chaque lecteur, écrite une fois et conservée.",
  "privacy.prompt.images":
    "Le navigateur ne parle pas davantage à un tiers. L’image GitHub est servie par notre propre optimiseur d’images, donc votre navigateur la demande à ce site plutôt qu’à GitHub.",

  "privacy.who.title": "qui d’autre y touche",
  "privacy.who.github":
    "authentifie la connexion et transmet votre profil public et votre adresse e-mail. Il n’a aucun accès aux données de cette app, et cette app n’a aucun accès à vos dépôts.",
  "privacy.who.supabase":
    "fait tourner la base de données et les sessions : les six lignes ci-dessus vivent là.",
  "privacy.who.vercel":
    "héberge l’app, donc il sert chaque requête et garde les journaux de requêtes qui vont avec, et il compte les pages vues avec Vercel Analytics.",
  "privacy.who.anthropic":
    "fournit le modèle qui écrit les synthèses, à partir des seules notes de version publiques, comme ci-dessus.",

  "privacy.cookies.title": "les cookies, et ce qui est dans votre navigateur",
  "privacy.cookies.body":
    "Il n’y a pas de bannière de consentement sur ce site parce qu’il n’y a rien à consentir : pas de publicité, pas de profilage, et aucun tiers qui dépose quoi que ce soit dans votre navigateur.",
  "privacy.cookies.what":
    "La connexion dépose des cookies de session, et ce sont eux qui vous gardent connecté d’une page à l’autre ; vous déconnecter ou supprimer le compte les efface. Le thème que vous choisissez est gardé dans le stockage local de votre navigateur, pas dans un cookie, et ne quitte jamais le navigateur. Vercel Analytics compte les pages vues sans cookie et sans conserver d’identifiant dans votre navigateur : ce qu’il produit, ce sont des comptes de pages, pas la trace d’une personne.",

  "privacy.keep.title": "combien de temps, et comment y mettre fin",
  "privacy.keep.body":
    "Tout ce qui est au-dessus est conservé tant que le compte existe. Supprimer le compte sur la {account} l’enlève aussitôt : la ligne du compte part, et les suivis, les versions déclarées et le plan partent avec elle, parce qu’ils y sont rattachés et supprimés avec elle. Il n’y a pas de délai de grâce, pas d’archive de notre côté, et rien pour revenir en arrière.",
  "privacy.keep.after":
    "Ce qui reste ensuite est en dehors du compte : le catalogue, les releases et les synthèses, dont rien n’a jamais été à vous ni sur vous. Les prestataires ci-dessus tiennent leurs propres sauvegardes et journaux selon leurs propres calendriers, que nous ne contrôlons pas et dans lesquels nous ne pouvons pas supprimer.",

  "privacy.reach.title": "comment nous joindre",
  "privacy.reach.body":
    "Une seule adresse, lue par la personne qui tient tout cela : {mail}. Demandez ce qui est conservé sur vous, demandez sa suppression, ou dites-nous que quelque chose ici est faux.",
} as const satisfies Partial<MessageDictionary>;
