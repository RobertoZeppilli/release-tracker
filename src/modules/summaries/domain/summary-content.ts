import { z } from "zod";
import { SummaryVerdictSchema } from "./summary-verdict";

const Text = z.string().trim().min(1);

// A verbatim stretch of the release notes backing the claim. The line numbers are derived from it
// (see `locateCitation`), never asked of the model; absent when the notes back nothing precise.
const Quote = { quote: Text.optional() };

export const KeyPointSchema = z.object({ text: Text, ...Quote });

export const BreakingChangeSchema = z.object({
  change: Text,
  migration: Text,
  ...Quote,
});

// The Summary as stored in `summaries.content`. GLOSSARY.md: Action required is yes exactly when
// there is a breaking change, and every breaking change says how to migrate.
export const SummaryContentSchema = SummaryVerdictSchema.extend({
  // The prompt asks for 120 characters, the schema allows 140. Constrained decoding grants the shape
  // of the JSON, never the `maxLength` of a string: on the first real batch the model went over 120
  // by at most 6 characters, on 4 Summaries out of 126. The margin absorbs that overshoot instead of
  // throwing away a Summary that has been paid for (issue #56).
  title: Text.max(140),
  // At least 3 key points, except on notes the model itself called unjudgeable: there the floor was
  // asking it to invent, and on `vite 8.2.2` the `v7` answered with the one point those notes hold
  // and lost a Summary that had been paid for (issue #93). The prompt still asks for 3, as it still
  // asks for a title of 120 characters the schema allows at 140: the prompt sets the target, the
  // schema refuses only what cannot be published.
  keyPoints: z.array(KeyPointSchema).min(1).max(5),
  breakingChanges: z.array(BreakingChangeSchema),
})
  .refine((content) => content.actionRequired === content.breakingChanges.length > 0, {
    message: "must be true exactly when there are breaking changes",
    path: ["actionRequired"],
  })
  .refine((content) => content.notesJudgeable === false || content.keyPoints.length >= 3, {
    message: "must have at least 3 items unless the notes could not be judged",
    path: ["keyPoints"],
  });

export type KeyPoint = z.infer<typeof KeyPointSchema>;
export type BreakingChange = z.infer<typeof BreakingChangeSchema>;
export type SummaryContent = z.infer<typeof SummaryContentSchema>;

// A ready Summary as the pages read it. Provenance is never optional here: the database refuses a
// ready row without it (summaries_ready_provenance), so the pages can always say where it came from.
export type StoredSummary = { content: SummaryContent; model: string; promptVersion: string };
