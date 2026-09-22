import type { SummaryBatches } from "../domain/summary-batches";

// The real Message Batches adapter arrives with the Anthropic connection (issue #14).
// Until then the job endpoints answer that summaries are not configured.
export function createSummaryBatches(): SummaryBatches | null {
  return null;
}
