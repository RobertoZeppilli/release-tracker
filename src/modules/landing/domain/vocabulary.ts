// The four Significance levels said in words. The app shows these four words on every Release and
// defines them nowhere, which is why the help axis of the 2026-10-07 critique scores 1 out of 5;
// by decision (docs/DECISIONI.md) the definition lives on the landing, under the id `significance`,
// and inside the app the word stays paired with its glyph. The sentences are CONTEXT.md's own
// (Rilevanza), in the UI's language, and `vocabulary.test.ts` holds this list to the four levels.

import { SignificanceSchema, type Significance } from "@/modules/releases";

export type VocabularyEntry = { significance: Significance; definition: string };

export const VOCABULARY: VocabularyEntry[] = [
  {
    significance: "featured",
    definition:
      "The release where a technology changes direction: a new major where SemVer holds, a new minor for the projects that ship their real changes there. These open your dashboard, and they are the ones the page verdict counts.",
  },
  {
    significance: "notable",
    definition:
      "New work, no change of direction: a new minor under SemVer, an odd-numbered Node major. Worth reading, rarely urgent.",
  },
  {
    significance: "digest",
    definition:
      "What the rule treats as routine, patches first. They never interrupt: you read them grouped by ISO week, in one pass.",
  },
  {
    significance: "preview",
    definition:
      "A beta or a release candidate. Only the first preview of a new major is summarized, and canaries, nightlies and alphas are not releases here at all.",
  },
];

// The levels in the order the schema declares them, which is the order the app reads them in.
export const SIGNIFICANCE_ORDER = SignificanceSchema.options;
