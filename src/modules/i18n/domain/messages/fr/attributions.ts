import type { MessageDictionary } from "../index";

// The attributions, in French. The names of what is credited (simple-icons, Lucide, Fragment Mono,
// Hanken Grotesk, the licences) are not here: a licence name is an identifier, and translating
// `CC0 1.0` would be translating a reference number.
export const attributions = {
  "attributions.lede":
    "L’essentiel de ce que vous voyez ici a été fait par quelqu’un d’autre. Cette page dit par qui, et sous quelle licence, en un seul endroit plutôt qu’en note de bas de page sur chacune.",

  "attributions.marks.title": "les marques des technologies",
  "attributions.marks.body":
    "La petite marque monochrome à côté d’une technologie vient de {simpleIcons}, publiée sous CC0 1.0. Les tracés sont copiés dans ce dépôt et servis depuis ce site, donc aucune page de cette app n’appelle de CDN pour les obtenir.",
  "attributions.marks.trademarks":
    "Les marques elles-mêmes restent celles de leurs détenteurs. Elles servent ici à nommer la technologie dont parle une ligne, en forme et jamais en couleur, et elles n’impliquent ni approbation de ce produit ni relation avec lui. Une technologie dont la marque n’est pas dans simple-icons n’en a simplement pas ici.",

  "attributions.notes.title": "les notes de version",
  "attributions.notes.body":
    "Chaque page de release est construite sur les notes que le projet a lui-même publiées, et ces notes appartiennent à ce projet et sont utilisées selon ses propres conditions. Une ligne citée l’est pour pouvoir être vérifiée, et chaque page renvoie aux notes à leur source. Une synthèse est notre lecture de ces notes, pas les mots du projet, et elle ne parle jamais en son nom.",

  "attributions.type.title": "les polices et les icônes",
  "attributions.type.body":
    "La voix monospace est Fragment Mono et la prose est Hanken Grotesk, toutes deux publiées sur Google Fonts sous la SIL Open Font License, et toutes deux servies depuis ce site plutôt que depuis Google. Les icônes de l’interface sont {lucide}, sous licence ISC.",

  "attributions.runs.title": "ce sur quoi tout cela tourne",
  "attributions.runs.body":
    "Next.js et React pour l’app, Supabase pour la base de données et la connexion, Vercel pour l’hébergement, Anthropic pour le modèle qui écrit les synthèses, et une longue liste de paquets open source en dessous. Lesquels touchent quelque chose qui vous appartient est dit dans la {privacy}.",
} as const satisfies Partial<MessageDictionary>;
