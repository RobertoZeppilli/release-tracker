"use client";

import { CircleX } from "lucide-react";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import type { FollowRejection } from "../domain/follow-rejection";

// What the database refused, said once for every page that can be refused: what did not happen, why,
// and the way out. The Toggle points at it with `aria-describedby`, so the id comes from the caller.
// `diagnostic` is the one measure for an error line (DESIGN.md, `field-error`): it is the same on
// the Upgrade Path form, and it lifts the error off the 13px facts of the row it sits under.
export function FollowRejectionNote({
  id,
  rejection,
  className,
}: {
  id: string;
  rejection: FollowRejection;
  className: string;
}) {
  return (
    <p id={id} className={`font-mono text-diagnostic text-breaking ${className}`}>
      <CircleX aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      error: {message(rejection)}
    </p>
  );
}

function message(rejection: FollowRejection): string {
  if (rejection === "limit") {
    return `not followed · you already follow ${FREE_FOLLOW_LIMIT} (one was added in another session) · unfollow one to follow another`;
  }
  if (rejection === "retired") {
    return "not followed · it has left the catalog · a retired technology can't be followed again";
  }
  return "not saved · the change didn't reach the database · try again";
}
