import type { MessageDictionary } from "../index";

// The terms, in French. Every claim here is one the code makes true (issue #132), so a translation
// that softens one of them makes the page say something the app does not do: the sentences are
// deliberately flat, and French keeps them flat. The follow limit is a gap and never a digit,
// because the Plan is what decides it.
export const terms = {
  "terms.lede":
    "Ce qu’est le service, ce à quoi il vous engage, et ce qu’il ne promet pas. C’est court parce que le produit est petit, et rien ci-dessous ne décrit quelque chose que l’app ne fait pas.",

  "terms.service.title": "le service",
  "terms.service.body":
    "Verdict suit les releases des technologies de son catalogue et donne à chacune un verdict : si elle demande quelque chose de vous, ce qui casse, et comment migrer. Les pages de release et de technologie sont publiques et ne demandent aucun compte. Suivre une technologie, déclarer la version que vous utilisez et le dashboard n’appartiennent qu’à vous, et demandent un compte.",

  "terms.catalog.title": "le catalogue est tenu à la main",
  "terms.catalog.body":
    "Le catalogue est choisi et maintenu par nous. Il n’y a pas de formulaire pour y ajouter une technologie et pas de file derrière : une technologie y entre quand nous pouvons suivre ses releases correctement, et elle peut être retirée quand nous ne pouvons plus. Une technologie retirée reste consultable, et elle reste la vôtre si vous la suiviez.",

  "terms.plan.title": "le plan",
  "terms.plan.body":
    "Il y a un seul plan, Free. Il suit jusqu’à {limit} technologies et ne coûte rien. L’app ne demande jamais de coordonnées de paiement, et il n’y a rien à résilier.",

  "terms.summaries.title": "les synthèses sont générées, et peuvent se tromper",
  "terms.summaries.body":
    "Chaque synthèse est écrite par un modèle de langue qui lit une seule chose : les notes de version que le projet a lui-même publiées pour cette release. Aucune autre source ne lui est donnée, et aucune donnée sur vous.",
  "terms.summaries.check":
    "Un modèle peut mal lire. C’est pour cela qu’une synthèse n’est pas le dernier mot de la page : ses affirmations portent la ligne des notes de version dont elles ont été lues, et la page renvoie aux notes à leur source. La citation est là pour que vous puissiez vérifier au lieu de croire. Quand une erreur coûterait cher, lisez la ligne citée avant d’agir sur le verdict.",

  "terms.account.title": "votre compte",
  "terms.account.body":
    "Vous vous connectez avec GitHub, à qui l’on demande votre profil public et votre adresse e-mail et rien d’autre : aucun accès à un dépôt. Vous pouvez supprimer le compte à tout moment depuis la {account}, et le supprimer emporte avec lui les technologies que vous suivez et les versions que vous avez déclarées. Ce qui est conservé, et par qui, est dans la {privacy}.",

  "terms.conduct.title": "ce que nous vous demandons",
  "terms.conduct.body":
    "Lisez-le, suivez ce que vous utilisez, et laissez le reste tranquille : pas de trafic automatisé au-delà de ce qu’un lecteur produit, aucune tentative d’atteindre les données d’un autre compte, aucune tentative de casser l’app ou les services derrière elle. Un compte qui fait l’une de ces choses peut être fermé sans préavis.",

  "terms.warranty.title": "aucune garantie",
  "terms.warranty.body":
    "Le service est fourni tel qu’il est. Il peut changer, il peut être indisponible, et il peut s’arrêter. Les synthèses peuvent se tromper, les notes de version qu’elles lisent peuvent elles-mêmes être fausses ou incomplètes, et une mise à jour reste votre décision et votre responsabilité. Rien ici n’est un conseil, et aucune responsabilité n’est acceptée pour ce qui découle d’une mise à jour.",

  "terms.changes.title": "les changements, et comment nous joindre",
  "terms.changes.body":
    "Ces conditions peuvent changer. La date en haut de cette page est le jour où son texte a changé pour la dernière fois, et c’est le seul relevé qui en existe. Questions, erreurs que vous repérez, quoi que ce soit d’autre : {mail}.",
} as const satisfies Partial<MessageDictionary>;
