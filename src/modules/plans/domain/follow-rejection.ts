// A follow is written straight from the browser, so a refusal from the database arrives in the
// mutation as it is (issue #18). The trigger of the `follow_limits` migration raises two SQLSTATEs
// of its own, and the interface has a remedy for each; anything else (a lost connection, a session
// that expired) is `unknown`, where the only remedy is to try again.
export type FollowRejection = "limit" | "retired" | "unknown";

const BY_CODE: Record<string, FollowRejection> = {
  FLIMT: "limit",
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
