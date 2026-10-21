"use client";

import { Info } from "lucide-react";
import { useTranslator } from "@/modules/i18n/ui";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { LIMIT_NOTE_ID } from "./follow-toggle";
import { useFollows } from "./follows-provider";

// The note the blocked toggles are described by: it appears with them and says the remedy, which is
// always in the Developer's hands. What a paid Plan would allow is not part of this page.
// It names the wall and does not recount it: on `/technologies` the figure is in the panel across
// the split, so a counted note would be the quota's third appearance in one screen (DESIGN.md,
// Limit Note). `counted` is the Dashboard, which has no panel of this kind to point at.
// With a `technologyId` the note belongs to that one Toggle: a Technology already followed is not
// blocked at the limit, so on its own page there is nothing to explain.
export function FollowToggleLimitNote({
  technologyId,
  counted = false,
  className = "mb-3 max-w-[900px]",
}: {
  technologyId?: string;
  counted?: boolean;
  className?: string;
}) {
  const t = useTranslator();
  const { atLimit, isFollowing } = useFollows();
  if (!atLimit) return null;
  if (technologyId !== undefined && isFollowing(technologyId)) return null;

  return (
    <p id={LIMIT_NOTE_ID} className={`font-mono text-diagnostic text-text-muted ${className}`} role="status">
      <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      note:{" "}
      {counted
        ? `${t("stack.quota.followed", { count: FREE_FOLLOW_LIMIT, limit: FREE_FOLLOW_LIMIT })} · ${t("stack.quota.swap")}`
        : t("stack.limit.full")}
    </p>
  );
}
