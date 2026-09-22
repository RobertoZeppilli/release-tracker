// One Message Batches request per Release; `releaseId` is its custom id.
export type SummaryRequest = { releaseId: string; model: string; system: string; prompt: string };

export type SummaryResult =
  | { type: "succeeded"; text: string }
  | { type: "errored" | "expired" | "canceled"; message: string };

// The Message Batches API as the summaries job sees it (ADR 0007); tests pass a fake.
export interface SummaryBatches {
  // Returns the batch id.
  submit(requests: readonly SummaryRequest[]): Promise<string>;
  // `null` while the batch is still processing; otherwise the results by Release id.
  collect(batchId: string): Promise<Map<string, SummaryResult> | null>;
}
