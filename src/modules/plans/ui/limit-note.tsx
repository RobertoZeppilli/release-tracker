"use client";

import { Info } from "lucide-react";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { LIMIT_NOTE_ID } from "./follow-toggle";
import { useFollows } from "./follows-provider";

// The note the blocked toggles are described by: it appears with them and says the remedy, which is
// always in the Developer's hands. What a paid Plan would allow is not part of this page.
// With a `technologyId` the note belongs to that one Toggle: a Technology already followed is not
// blocked at the limit, so on its own page there is nothing to explain.
export function FollowToggleLimitNote({
  technologyId,
  className = "mb-3 max-w-[900px]",
}: {
  technologyId?: string;
  className?: string;
}) {
  const { atLimit, isFollowing } = useFollows();
  if (!atLimit) return null;
  if (technologyId !== undefined && isFollowing(technologyId)) return null;

  return (
    <p id={LIMIT_NOTE_ID} className={`font-mono text-diagnostic text-text-muted ${className}`} role="status">
      <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      note: <span className="text-text">{FREE_FOLLOW_LIMIT}</span> of {FREE_FOLLOW_LIMIT} followed ·
      unfollow one to follow another
    </p>
  );
}
