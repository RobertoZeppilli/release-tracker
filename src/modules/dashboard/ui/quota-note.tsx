"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { FREE_FOLLOW_LIMIT } from "@/modules/plans";
import { useFollows } from "@/modules/plans/ui";

// DESIGN.md, Dashboard States, Quota: below the limit the Dashboard says nothing about the quota,
// since a page about the stack is not the place to be reminded how much room is left in it. At the
// wall the totals take one more Meta line, in the Limit Note's own words because it is the same
// fact, and it carries no ink: a Plan's limit is a boundary, not a failure.
export function StandingQuotaNote() {
  const { atLimit } = useFollows();
  if (!atLimit) return null;

  return (
    <p className="mt-2" role="status">
      <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      note: <span className="text-text-muted">{FREE_FOLLOW_LIMIT}</span> of {FREE_FOLLOW_LIMIT} followed ·{" "}
      <Link href="/technologies" className="text-inherit decoration-rule-strong hover:text-text hover:decoration-current">
        unfollow one to follow another
      </Link>
    </p>
  );
}
