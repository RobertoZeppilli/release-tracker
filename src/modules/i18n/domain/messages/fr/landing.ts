import type { MessageDictionary } from "../index";

// The landing, in French: the argument, the four stages of the demonstration, the two thin
// specimens, the four Significance words defined, and the close.
// What is **not** here is the product's grammar: `verdict:`, `warning:`, `help:`, `breaking[n]:`,
// `note:`, `release-notes:n` and the four Significance names are identical in every language
// (ADR 0008). The figures are not here either: they come from `SPECIMEN`, from the Catalog
// directory and from the Plan, so the sentences name them as gaps.
export const landing = {
  "landing.claim": "Comprendre avant de mettre à jour.",
  // `{breaking}` is the counted phrase below, put in a `strong`, and `{propTypes}` is a `code`:
  // both are gaps a node goes in (`Filled`), so a language is free to move them.
  "landing.lede":
    "{name} {version} est sortie avec {breaking} répartis sur {lines} lignes de notes de version. L’un d’eux fait que {propTypes} ne fait plus rien, en silence, et il est à la ligne {line}.",
  "landing.promise":
    "Verdict suit les releases des technologies de votre stack et donne à chacune un seul verdict : si elle vous demande quelque chose, ce qui casse et comment migrer. Chaque affirmation pointe la ligne des notes de version dont elle a été lue, pour que vous puissiez la vérifier en un clic au lieu de la croire.",
  "landing.seeVerdict": "voir le verdict de {name} {version}",
  // The one counted phrase of the page, read in three places: the lede, the source stage and the
  // help stage. One key, so one language cannot say it three ways.
  "landing.breakingChanges": {
    one: "{count} breaking change",
    many: "{count} breaking changes",
    other: "{count} breaking changes",
  },

  // Proof Panel.
  "landing.panel.window": "lignes {first} à {last} sur {total}",
  "landing.panel.linesRead": "lignes lues",

  // The Bench, four stages in reading order. The stage names (`source`, `cite`, `verdict`, `help`)
  // are not here on purpose: each one is also the `id` the page is anchored by.
  "landing.bench.title": "Une release, quatre étapes",
  "landing.bench.sub":
    "La même release que cite le premier écran, lue comme l’app la lit : ce que le projet a publié, la ligne sur laquelle repose le verdict, le verdict lui-même, et où cela mène ensuite.",
  "landing.bench.notesFrom": "notes depuis {source}, {lines} lignes",
  "landing.bench.window": "lignes {first} à {last}",
  "landing.bench.source":
    "{lines} lignes, gardées exactement comme publiées et numérotées pour qu’une affirmation puisse en nommer une. Les {breaking} sont listés dans une seule section, et le premier écran montre {window}.",
  "landing.bench.cite":
    "Rien n’est paraphrasé. Le verdict cite cette ligne, y renvoie, et serait faux d’une manière que vous pourriez voir si la ligne disait autre chose.",
  "landing.bench.verdictTitle": "propTypes ne sont plus vérifiés",
  "landing.bench.verdictBody":
    "Un composant qui déclare {propTypes} compile toujours et tourne toujours. Rien n’avertit, et plus rien n’est vérifié.",
  "landing.bench.help":
    "migrez vers des props TypeScript, ou vers une autre solution de vérification de types.",
  "landing.bench.helpAll":
    "Tous les {breaking} sont listés de la même façon sur la page de release, chacun avec sa ligne citée et sa ligne d’aide.",

  // Short Specimens, the honest half of the argument.
  "landing.thin.title": "Et quand les notes ne sont pas de ce genre",
  "landing.thin.sub":
    "La plupart des releases ne publient pas {lines} lignes. Ce que Verdict fait des maigres est la même discipline, et c’est pourquoi c’est sur cette page et pas dans une FAQ.",
  "landing.thin.vite":
    "un changelog de {lines} lignes, où les deux lignes qui cassent sont marquées par un seul {bang} et se trouvent entre un {chore} et un {perf}. {link}",
  "landing.thin.viteLink": "les lire à part",
  "landing.thin.typescript":
    "une release dont le corps est {blog}. Il n’y a rien ici à juger, donc Verdict dit exactement cela et montre où vivent les vraies notes. {link}",
  "landing.thin.typescriptBlog": "un lien vers un billet de blog",
  "landing.thin.typescriptLink": "voir cet état",
  // The quotation marks are part of the sentence and not added by the component, so each language
  // uses its own pair: French uses the guillemets.
  "landing.thin.note":
    "C’est la phrase que Verdict imprime au lieu d’un verdict quand les notes ne font que renvoyer ailleurs. « Je n’ai trouvé aucun breaking change » et « il n’y a aucun breaking change » sont deux affirmations différentes, et la seconde n’est jamais imprimée à la place de la première.",

  // Vocabulary Legend. The four definitions are GLOSSARY.md's own sentences in the interface's
  // language.
  "landing.words.title": "Quatre mots sur chaque release",
  "landing.words.sub":
    "La pertinence est une forme à côté de la version, jamais une teinte : la couleur dans ce produit veut dire gravité et rien d’autre. Une release n’est pas urgente parce qu’elle est rouge, elle est urgente parce que ses notes le disent, sur une ligne que vous pouvez lire.",
  "landing.words.featured":
    "La release où une technologie change de direction : une nouvelle major là où SemVer tient, une nouvelle minor pour les projets qui y livrent leurs vrais changements. Ce sont elles qui ouvrent votre dashboard, et celles que compte le verdict de la page.",
  "landing.words.notable":
    "Du travail nouveau, sans changement de direction : une nouvelle minor sous SemVer, une major Node de numéro impair. À lire, rarement urgent.",
  "landing.words.digest":
    "Ce que la règle traite comme de la routine, les patchs d’abord. Elles n’interrompent jamais : vous les lisez groupées par semaine ISO, en une seule passe.",
  "landing.words.preview":
    "Une beta ou une release candidate. Seule la première preview d’une nouvelle major est synthétisée, et les canaries, nightlies et alphas ne sont pas des releases ici du tout.",

  // The close, and the counter-position beside it.
  "landing.close.claim": {
    one: "Suivez la seule technologie qui décide de votre semaine.",
    many: "Suivez les {count} technologies qui décident de votre semaine.",
    other: "Suivez les {count} technologies qui décident de votre semaine.",
  },
  "landing.close.plan":
    "Le plan gratuit suit jusqu’à {limit} technologies d’un catalogue tenu à la main de {size}. La connexion passe par GitHub, et les pages de release restent lisibles sans elle.",
  "landing.close.browse": {
    one: "parcourir la seule technologie",
    many: "parcourir les {count} technologies",
    other: "parcourir les {count} technologies",
  },
  "landing.close.note.claim": "il n’ouvre pas de pull requests",
  "landing.close.note.body":
    "Dependabot et Renovate le font bien, et ils vous disent qu’une version a bougé. Une newsletter vous dit qu’une release était intéressante. Verdict répond à la question que ceux-là laissent ouverte : cette release me demande-t-elle quelque chose, et où le dit-elle. Il ne lit que les notes de version, il ne devine jamais, et quand les notes ne disent rien il ne dit rien.",

  // The foot of the page, under the rule.
  "landing.foot.read": "contenu lu depuis des notes de version publiques",
  "landing.foot.notes": "notes de {name} {version}",

  // The entry action, in its two faces. `Continuer avec GitHub` is the login page's own button
  // (`account.login.button`) and this is the landing's invitation, which is why the two differ.
  "landing.entry.visitor": "Se connecter avec GitHub",
  "landing.entry.developer": "Aller à votre dashboard",
} as const satisfies Partial<MessageDictionary>;
