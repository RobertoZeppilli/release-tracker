import type { InvalidFrom } from "@/modules/releases";

// The Version in use lives on a follow, with the day it was declared: the app never observes it, so
// a count built on it is only readable next to that day (CONTEXT.md, Versione in uso).
export type CurrentVersion = { version: string; declaredAt: Date };

export type Follow = { technologyId: string; currentVersion: CurrentVersion | null };

// Why the database refused a declaration. The three version reasons are the ones the start of an
// Upgrade Path already has, so the page can reuse its words; `denied` is anything else, which the
// interface cannot explain and should not pretend to.
export type Decline = InvalidFrom | "denied";

// The SQLSTATEs the `current_version` migration raises. They arrive through PostgREST as they are,
// the way the follow rules do.
export function declineFor(code: string | undefined): Decline {
  switch (code) {
    case "FVMAL":
      return "malformed";
    case "FVNEW":
      return "notOlder";
    case "FVNST":
      return "noStable";
    default:
      return "denied";
  }
}

export class CurrentVersionRejectedError extends Error {
  readonly decline: Decline;

  constructor(decline: Decline, message: string) {
    super(message);
    this.name = "CurrentVersionRejectedError";
    this.decline = decline;
  }
}

export function declineOf(error: unknown): Decline | null {
  return error instanceof CurrentVersionRejectedError ? error.decline : null;
}
