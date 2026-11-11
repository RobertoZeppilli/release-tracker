// A follow is written straight from the browser, so a refusal from the database arrives in the
// mutation as it is (issue #18). The trigger of the `follow_limits` migration raises one SQLSTATE of
// its own, 'FRTRD' for a retired Technology, and the interface has a remedy for it; anything else (a
// lost connection, a session that expired) is `unknown`, where the only remedy is to try again.
//
// 'FLIMT' was the other one, the ten Technologies of the Free Plan, and it left with the Plan
// (issue #209, ADR 0011): there is no number to hit any more.
export type FollowRejection = "retired" | "unknown";

const BY_CODE: Record<string, FollowRejection> = {
  FRTRD: "retired",
};

export function followRejectionFor(code: string | undefined): FollowRejection {
  return (code && BY_CODE[code]) || "unknown";
}

export class FollowRejectedError extends Error {
  readonly rejection: FollowRejection;

  constructor(rejection: FollowRejection, message: string) {
    super(message);
    this.name = "FollowRejectedError";
    this.rejection = rejection;
  }
}

export function rejectionOf(error: unknown): FollowRejection | null {
  return error instanceof FollowRejectedError ? error.rejection : null;
}
