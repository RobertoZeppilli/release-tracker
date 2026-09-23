import Anthropic from "@anthropic-ai/sdk";
import type { SummaryBatches } from "../domain/summary-batches";
import { anthropicSummaryBatches } from "./anthropic-batches";

// The key comes from the caller, not from `@/env/server`: importing the module must not require
// an environment. Without a key the job endpoints answer that summaries are not configured.
export function createSummaryBatches(apiKey: string | undefined): SummaryBatches | null {
  if (apiKey === undefined) return null;
  return anthropicSummaryBatches(new Anthropic({ apiKey }).messages.batches);
}
