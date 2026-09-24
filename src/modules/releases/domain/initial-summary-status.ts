import { z } from "zod";
import type { Significance } from "./significance";

export const SummaryStatusSchema = z.enum(["pending", "processing", "ready", "unavailable", "skipped", "failed"]);

export type SummaryStatus = z.infer<typeof SummaryStatusSchema>;

export type InitialSummaryInput = { significance: Significance; hasNotes: boolean; skip: boolean };

// `skip` is the phase saying it chose not to summarize this Release: the Initial Import leaves it in
// History, the Detection found a Preview of a major it already knows.
// No notes, no Summary: `unavailable` wins so the page never offers notes that do not exist.
export function initialSummaryStatus({ significance, hasNotes, skip }: InitialSummaryInput): SummaryStatus {
  if (!hasNotes) return "unavailable";
  if (skip || significance === "digest") return "skipped";
  return "pending";
}
