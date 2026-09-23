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

// The Summary as stored in `summaries.content`. CONTEXT.md: Action required is yes exactly when
// there is a breaking change, and every breaking change says how to migrate.
export const SummaryContentSchema = SummaryVerdictSchema.extend({
  title: Text.max(120),
  keyPoints: z.array(KeyPointSchema).min(3).max(5),
  breakingChanges: z.array(BreakingChangeSchema),
}).refine((content) => content.actionRequired === content.breakingChanges.length > 0, {
  message: "must be true exactly when there are breaking changes",
  path: ["actionRequired"],
});

export type KeyPoint = z.infer<typeof KeyPointSchema>;
export type BreakingChange = z.infer<typeof BreakingChangeSchema>;
export type SummaryContent = z.infer<typeof SummaryContentSchema>;

// A ready Summary as the pages read it.
export type StoredSummary = { content: SummaryContent; model: string | null; promptVersion: string | null };
