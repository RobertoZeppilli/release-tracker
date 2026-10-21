// What the five document pages (faq, terms, privacy, attributions, contact) share: the line that
// dates the text, the sentence that says which language governs, and the names the pages link each
// other by. The names are here and not repeated in each page's namespace because `privacy notice`
// is one phrase of the product wherever it is read, and five copies of it are four chances to
// translate it five ways.
export const doc = {
  "doc.updated": "last updated: {date}",
  // ⚠️ Only `terms` and `privacy` print this, and they print it in English too: on the English page
  // it tells the reader their page is the one that holds, which is worth knowing there as well.
  // The reader reaches the English text from the language picker in the foot, so the sentence
  // carries no link of its own.
  "doc.governing":
    "This page is published in five languages. Where they differ, the English text is the one that holds.",
  "doc.link.privacy": "privacy notice",
  "doc.link.account": "account page",
  "doc.link.faq": "FAQ",
} as const;
