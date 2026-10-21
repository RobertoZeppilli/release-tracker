import type { MessageDictionary } from "../index";

// The landing, in Spanish: the argument, the four stages of the demonstration, the two thin
// specimens, the four Significance words defined, and the close.
// What is **not** here is the product's grammar: `verdict:`, `warning:`, `help:`, `breaking[n]:`,
// `note:`, `release-notes:n` and the four Significance names are identical in every language
// (ADR 0008). The figures are not here either: they come from `SPECIMEN`, from the Catalog
// directory and from the Plan, so the sentences name them as gaps.
export const landing = {
  "landing.claim": "Entender antes de actualizar.",
  // `{breaking}` is the counted phrase below, put in a `strong`, and `{propTypes}` is a `code`:
  // both are gaps a node goes in (`Filled`), so a language is free to move them.
  "landing.lede":
    "{name} {version} salió con {breaking} repartidos en {lines} líneas de notas de la versión. Uno de ellos hace que {propTypes} no haga nada, en silencio, y está en la línea {line}.",
  "landing.promise":
    "Verdict sigue las releases de las tecnologías de tu stack y le da a cada una un solo verdicto: si te pide algo, qué se rompe y cómo migrar. Cada afirmación apunta a la línea de las notas de la versión de la que se leyó, para que la compruebes en un clic en vez de creerla.",
  "landing.seeVerdict": "ver el verdicto de {name} {version}",
  // The one counted phrase of the page, read in three places: the lede, the source stage and the
  // help stage. One key, so one language cannot say it three ways.
  "landing.breakingChanges": {
    one: "{count} breaking change",
    many: "{count} breaking changes",
    other: "{count} breaking changes",
  },

  // Proof Panel.
  "landing.panel.window": "líneas {first} a {last} de {total}",
  "landing.panel.linesRead": "líneas leídas",

  // The Bench, four stages in reading order. The stage names (`source`, `cite`, `verdict`, `help`)
  // are not here on purpose: each one is also the `id` the page is anchored by.
  "landing.bench.title": "Una release, cuatro etapas",
  "landing.bench.sub":
    "La misma release que cita la primera pantalla, leída como la lee la app: lo que publicó el proyecto, la línea en la que se apoya el verdicto, el verdicto mismo, y a dónde lleva después.",
  "landing.bench.notesFrom": "notas desde {source}, {lines} líneas",
  "landing.bench.window": "líneas {first} a {last}",
  "landing.bench.source":
    "{lines} líneas, conservadas exactamente como se publicaron y numeradas para que una afirmación pueda nombrar una de ellas. Los {breaking} están listados en una sola sección, y la primera pantalla muestra {window}.",
  "landing.bench.cite":
    "Nada se parafrasea. El verdicto cita esta línea, apunta de vuelta a ella, y sería falso de una forma que podrías ver si la línea dijera otra cosa.",
  "landing.bench.verdictTitle": "propTypes dejan de comprobarse",
  "landing.bench.verdictBody":
    "Un componente que declara {propTypes} sigue compilando y sigue funcionando. Nada avisa, y ya no se comprueba nada.",
  "landing.bench.help":
    "migra a props de TypeScript, o a otra solución de comprobación de tipos.",
  "landing.bench.helpAll":
    "Todos los {breaking} están listados igual en la página de la release, cada uno con su línea citada y su línea de ayuda.",

  // Short Specimens, the honest half of the argument.
  "landing.thin.title": "Y cuando las notas no son de ese tipo",
  "landing.thin.sub":
    "La mayoría de las releases no publica {lines} líneas. Lo que Verdict hace con las escasas es la misma disciplina, y por eso está en esta página y no en una FAQ.",
  "landing.thin.vite":
    "un changelog de {lines} líneas, donde las dos que rompen están marcadas con un solo {bang} y están entre un {chore} y un {perf}. {link}",
  "landing.thin.viteLink": "leerlas aparte",
  "landing.thin.typescript":
    "una release cuyo cuerpo es {blog}. Aquí no hay nada que juzgar, así que Verdict dice exactamente eso y señala dónde viven las notas de verdad. {link}",
  "landing.thin.typescriptBlog": "un enlace a una entrada de blog",
  "landing.thin.typescriptLink": "ver ese estado",
  // The quotation marks are part of the sentence and not added by the component, so each language
  // uses its own pair: Spanish uses the angular ones.
  "landing.thin.note":
    "Esta es la frase que Verdict imprime en lugar de un verdicto cuando las notas solo remiten a otro sitio. «No he encontrado breaking changes» y «no hay breaking changes» son afirmaciones distintas, y la segunda nunca se imprime en lugar de la primera.",

  // Vocabulary Legend. The four definitions are CONTEXT.md's own sentences in the interface's
  // language.
  "landing.words.title": "Cuatro palabras en cada release",
  "landing.words.sub":
    "La relevancia es una forma al lado de la versión, nunca un tono: el color en este producto significa gravedad y nada más. Una release no es urgente porque sea roja, es urgente porque lo dicen sus notas, en una línea que puedes leer.",
  "landing.words.featured":
    "La release en la que una tecnología cambia de dirección: una major nueva donde SemVer se cumple, una minor nueva para los proyectos que entregan ahí sus cambios de verdad. Son las que abren tu dashboard, y las que cuenta el verdicto de la página.",
  "landing.words.notable":
    "Trabajo nuevo, sin cambio de dirección: una minor nueva bajo SemVer, una major impar de Node. Vale leerlas, rara vez urgentes.",
  "landing.words.digest":
    "Lo que la regla trata como rutina, los parches primero. Nunca interrumpen: las lees agrupadas por semana ISO, de una pasada.",
  "landing.words.preview":
    "Una beta o una release candidate. Solo se sintetiza la primera preview de una major nueva, y las canary, nightly y alpha no son releases aquí en absoluto.",

  // The close, and the counter-position beside it.
  "landing.close.claim": {
    one: "Sigue la única tecnología que decide tu semana.",
    many: "Sigue las {count} tecnologías que deciden tu semana.",
    other: "Sigue las {count} tecnologías que deciden tu semana.",
  },
  "landing.close.plan":
    "El plan gratuito sigue hasta {limit} tecnologías de un catálogo curado a mano de {size}. El acceso es con GitHub, y las páginas de release siguen legibles sin él.",
  "landing.close.browse": {
    one: "explorar la única tecnología",
    many: "explorar las {count} tecnologías",
    other: "explorar las {count} tecnologías",
  },
  "landing.close.note.claim": "no abre pull requests",
  "landing.close.note.body":
    "Dependabot y Renovate lo hacen bien, y te dicen que una versión se movió. Una newsletter te dice que una release era interesante. Verdict responde a la pregunta que esos dejan abierta: ¿esta release me pide algo, y dónde lo dice? Solo lee las notas de la versión, nunca adivina, y cuando las notas no dicen nada él no dice nada.",

  // The foot of the page, under the rule.
  "landing.foot.read": "contenido leído de notas de la versión públicas",
  "landing.foot.notes": "notas de {name} {version}",

  // The entry action, in its two faces. `Continuar con GitHub` is the login page's own button
  // (`account.login.button`) and this is the landing's invitation, which is why the two differ.
  "landing.entry.visitor": "Entrar con GitHub",
  "landing.entry.developer": "Ir a tu dashboard",
} as const satisfies Partial<MessageDictionary>;
