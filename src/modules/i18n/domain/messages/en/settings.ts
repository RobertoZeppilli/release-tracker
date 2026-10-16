// The strings of the Settings page: the one place a signed-in reader changes how the app behaves for
// them. Today it holds the language and nothing else, and it exists as a page rather than as a row of
// the account panel because the next preference will land beside the language instead of making that
// panel taller (decided with the user on 2026-10-16).
export const settings = {
  "settings.title": "Settings",
  "settings.intro":
    "How the app reads for you. Nothing here is shared with anyone, and nothing on the public release and technology pages depends on it.",
  // The language is chosen by following a link, not by saving a form: the language is in the address
  // (ADR 0008), so the choice is the page it leads to.
  "settings.language.note":
    "The language is part of the address, so a page can be shared in the language it was read in. Release notes and summaries stay in their original language.",
} as const;
