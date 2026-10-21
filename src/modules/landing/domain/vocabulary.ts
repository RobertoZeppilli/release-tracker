// The four Significance levels said in words. The app shows these four words on every Release and
// defines them nowhere, which is why the help axis of the 2026-10-07 critique scores 1 out of 5;
// by decision (docs/DECISIONI.md) the definition lives on the landing, under the id `significance`,
// and inside the app the word stays paired with its glyph.
// ⚠️ The sentences themselves are **not** here any more (ADR 0008): a definition is interface copy,
// so it lives in `i18n` with the rest of the landing's prose and exists in every language. What
// stays here is the pairing of a level with the key that defines it, which is the half the compiler
// can check: a level the schema gains arrives here with no key and the build stops.

import { type MessageKey } from "@/modules/i18n";
import { SignificanceSchema, type Significance } from "@/modules/releases";

export type VocabularyEntry = { significance: Significance; definition: MessageKey };

export const VOCABULARY: VocabularyEntry[] = [
  { significance: "featured", definition: "landing.words.featured" },
  { significance: "notable", definition: "landing.words.notable" },
  { significance: "digest", definition: "landing.words.digest" },
  { significance: "preview", definition: "landing.words.preview" },
];

// The levels in the order the schema declares them, which is the order the app reads them in.
export const SIGNIFICANCE_ORDER = SignificanceSchema.options;
