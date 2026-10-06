type Fetch = typeof fetch;

export const DEFAULT_RETRY_DELAYS_MS = [1_000, 4_000] as const;

// Asking again is the only cure for a Source that failed for a moment: on 2026-10-06 GitHub
// answered 504 to the third page of electron's releases and took the whole Catalog import with it.
// A transient is a 5xx or a connection that never opened. A 4xx is an answer, and 429 is an answer
// too: GitHub's limit resets in minutes or in an hour, so asking again inside seconds would only
// repeat it and hide why the run came back empty.
//
// One delay per retry, so the schedule is the whole policy and a test can set it to nothing.
export function retrying(fetch: Fetch, delaysMs: readonly number[]): Fetch {
  return async (input, init) => {
    for (let attempt = 0; ; attempt++) {
      const delayMs = delaysMs[attempt];
      try {
        const response = await fetch(input, init);
        if (response.status < 500 || delayMs === undefined) return response;
      } catch (error) {
        if (delayMs === undefined) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  };
}
