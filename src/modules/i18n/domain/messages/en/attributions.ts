// The attributions, one namespace because it is one page. The names of what is credited
// (simple-icons, Lucide, Fragment Mono, Hanken Grotesk, the licences) are not here: a licence name
// is an identifier and translating `CC0 1.0` would be translating a reference number.
export const attributions = {
  "attributions.lede":
    "Most of what you see here was made by someone else. This page says who, and under which licence, in one place instead of in a footnote on each page.",

  "attributions.marks.title": "the technology marks",
  "attributions.marks.body":
    "The small monochrome mark beside a technology comes from {simpleIcons}, released under CC0 1.0. The paths are copied into this repository and served from this site, so no page of this app calls a CDN for them.",
  "attributions.marks.trademarks":
    "The marks themselves remain the trademarks of their owners. They are used here to name the technology a row is about, in shape and never in colour, and they imply no endorsement of this product and no relationship with it. A technology whose mark is not in simple-icons simply has none here.",

  "attributions.notes.title": "the release notes",
  "attributions.notes.body":
    "Every release page is built on the notes the project itself published, and those notes belong to that project and are used under its own terms. A quoted line is quoted so it can be checked, and each page links the notes at their source. A summary is our reading of them, not the project’s words, and never speaks for the project.",

  "attributions.type.title": "the typefaces and the icons",
  "attributions.type.body":
    "The monospace voice is Fragment Mono and the prose is Hanken Grotesk, both published on Google Fonts under the SIL Open Font License, and both served from this site rather than from Google. The interface icons are {lucide}, under the ISC licence.",

  "attributions.runs.title": "what it runs on",
  "attributions.runs.body":
    "Next.js and React for the app, Supabase for the database and the sign-in, Vercel for the hosting, Anthropic for the model that writes the summaries, and a long list of open source packages under each one. Which of them touch anything of yours is in the {privacy}.",
} as const;
