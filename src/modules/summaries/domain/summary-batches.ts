// One Message Batches request per Release; `releaseId` is its custom id.
export type SummaryRequest = { releaseId: string; model: string; system: string; prompt: string };

// What the batch billed for one Release. Optional because only the real API reports it, and
// nothing in the pipeline decides anything on it: it is there to price a model on measured tokens
// instead of an estimate (#57).
export type SummaryUsage = { inputTokens: number; outputTokens: number };

export type SummaryResult =
  | { type: "succeeded"; text: string; usage?: SummaryUsage }
  | { type: "errored" | "expired" | "canceled"; message: string }
  // The credit ran out while the batch was running: see CreditExhaustedError.
  | { type: "credit_exhausted"; message: string };

// Not a failure of the Summary (ADR 0007): the Release goes back in the queue and the next run,
// once the credit is topped up, takes it again. Telling this apart from a real API error is the
// adapter's job, so the pipeline never has to read an error message to decide.
export class CreditExhaustedError extends Error {
  constructor(message = "the Anthropic credit balance is exhausted") {
    super(message);
    this.name = "CreditExhaustedError";
  }
}

// The Message Batches API as the summaries job sees it (ADR 0007); tests pass a fake.
export interface SummaryBatches {
  // Returns the batch id.
  submit(requests: readonly SummaryRequest[]): Promise<string>;
  // `null` while the batch is still processing; otherwise the results by Release id.
  collect(batchId: string): Promise<Map<string, SummaryResult> | null>;
}
