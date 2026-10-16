// The strings of the Release page that are interface rather than content. What is on this page and
// is **not** here is the point of the product: the Release Notes and the Summary keep the language
// they were written in (ADR 0008).
export const release = {
  // Named in the language the sentence is written in, not through `LOCALE_NAMES`: a reader of
  // Italian is told `in inglese`, and `in English` is what `LOCALE_NAMES.en` would have given them.
  "release.originalLanguage":
    "the summary and the release notes are in English",
} as const;
