import type { MessageDictionary } from "../index";

// The account, in French: what it is made of, the way in and the way out of it. `supprimer le
// compte` is the way out and is said with that verb everywhere, because a reader looking for it
// looks for the word the button carries.
export const account = {
  "account.intro":
    "Tout ce dont ce compte est fait, et la sortie. Rien ici n’est partagé avec personne, et rien sur les pages publiques des releases et des technologies n’en dépend.",
  "account.held.signedIn": "connecté en tant que",
  "account.held.noEmail": "aucune adresse e-mail",
  "account.held.handle": "nom github",
  "account.held.none": "aucune",
  "account.held.plan": "plan",
  "account.held.followed": "suivies",
  "account.held.quota": "{count} sur {limit}",
  "account.held.declared": "versions déclarées",
  "account.delete.title": "supprimer ce compte",
  "account.delete.intro":
    "Cela part aussitôt et ne peut pas être annulé. Il n’y a pas de copie pour le restaurer et pas de délai pour changer d’avis.",
  "account.delete.item.account":
    "le compte lui-même, et l’adresse e-mail, le nom et l’image GitHub venus avec lui",
  "account.delete.item.follows": {
    one: "{count} technologie suivie",
    many: "{count} technologies suivies",
    other: "{count} technologies suivies",
  },
  "account.delete.item.declared": {
    one: "{count} version déclarée en usage",
    many: "{count} versions déclarées en usage",
    other: "{count} versions déclarées en usage",
  },
  "account.delete.item.plan": "le plan du compte",
  "account.delete.item.session": "la session dans ce navigateur",
  // `{revoke}` is a gap a link is put in (`Filled`), not a word.
  "account.delete.note":
    "Se reconnecter ensuite crée un nouveau compte vide, pas l’ancien de retour. GitHub garde sa propre trace de l’autorisation que vous avez donnée, et c’est la seule chose que ce bouton ne peut pas atteindre : {revoke}.",
  "account.delete.revoke": "la révoquer sur GitHub",
  // `{word}` is the word that has to be typed, which is a constant of the product and not a
  // translation (`DELETION_WORD`).
  "account.delete.confirm": "tapez {word} pour confirmer",
  "account.delete.button": "Supprimer le compte",
  "account.delete.error.confirm":
    "ce n’est pas le mot. Rien n’a été supprimé : tapez {word} pour confirmer.",
  "account.delete.error.failed":
    "la suppression n’est pas passée, et rien n’a été supprimé. Réessayez dans un instant.",
  // The way in. Lower case openings: the message is the claim after the `error:` label, not a
  // sentence on its own (DESIGN.md, The Severity Pairing Rule).
  "account.login.intro":
    "Suivre des technologies et le dashboard n’appartiennent qu’à vous, donc ils demandent un compte. Les pages de release et de technologie restent publiques et ne demandent aucune connexion.",
  "account.login.deleted":
    "ce compte est parti, avec les technologies qu’il suivait et les versions qu’il avait déclarées. Se connecter en crée un nouveau.",
  "account.login.terms":
    "Se connecter accepte les {terms}. La {privacy} dit ce qui est conservé, et la page du compte supprime tout.",
  "account.login.terms.link": "conditions",
  "account.login.privacy.link": "politique de confidentialité",
  "account.login.button": "Continuer avec GitHub",
  "account.login.scope":
    "Ne demande à GitHub que votre profil public et votre adresse e-mail. Aucun accès à un dépôt.",
  "account.login.dev": "Continuer comme développeur local",
  "account.login.devNote":
    "Développement local uniquement : cette entrée n’existe pas en production.",
  "account.login.error.denied": "la connexion a été annulée. Rien n’a changé.",
  "account.login.error.exchange": "ce lien de connexion n’est plus valide. Réessayez.",
  "account.login.error.provider":
    "GitHub est injoignable en ce moment. Réessayez dans un instant.",
  "account.login.error.dev":
    "le développeur local n’a pas pu se connecter. Lancez `pnpm dev:login` et réessayez.",
} as const satisfies Partial<MessageDictionary>;
