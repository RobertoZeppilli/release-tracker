import { z } from "zod";
import type { Significance } from "./significance";

export const SummaryStatusSchema = z.enum(["pending", "processing", "ready", "unavailable", "skipped", "failed"]);

export type SummaryStatus = z.infer<typeof SummaryStatusSchema>;

export type InitialSummaryInput = { significance: Significance; hasNotes: boolean; history: boolean };

// No notes, no Summary: `unavailable` wins so the page never offers notes that do not exist.
export function initialSummaryStatus({ significance, hasNotes, history }: InitialSummaryInput): SummaryStatus {
  if (!hasNotes) return "unavailable";
  if (history || significance === "digest") return "skipped";
  return "pending";
}
