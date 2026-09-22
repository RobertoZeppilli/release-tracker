import { randomUUID } from "node:crypto";
import type { SummaryBatches, SummaryRequest, SummaryResult } from "@/modules/summaries";

export type FakeSummaryBatches = SummaryBatches & {
  // Every batch sent, in order.
  sent: SummaryRequest[][];
  // While true, `collect` reports every batch as still processing.
  processing: boolean;
};

// An in-memory Message Batches API: each request is answered by `respond` when it is sent.
export function fakeSummaryBatches(respond: (request: SummaryRequest) => SummaryResult): FakeSummaryBatches {
  const results = new Map<string, Map<string, SummaryResult>>();
  const fake: FakeSummaryBatches = {
    sent: [],
    processing: false,
    async submit(requests) {
      const batchId = `msgbatch_fake_${randomUUID()}`;
      fake.sent.push([...requests]);
      results.set(batchId, new Map(requests.map((request) => [request.releaseId, respond(request)])));
      return batchId;
    },
    // Batches of other fakes, left by earlier runs, are unknown here and stay processing.
    async collect(batchId) {
      return fake.processing ? null : (results.get(batchId) ?? null);
    },
  };
  return fake;
}

export function succeeded(content: unknown): SummaryResult {
  return { type: "succeeded", text: JSON.stringify(content) };
}
