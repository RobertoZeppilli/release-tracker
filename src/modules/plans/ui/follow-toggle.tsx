"use client";

import { Check, Plus } from "lucide-react";
import { useFollows } from "./follows-provider";

const BASE =
  "inline-flex h-[34px] items-center gap-2 rounded-md border px-3 font-sans text-body whitespace-nowrap";
const OFF = "border-rule-strong text-text hover:border-text-faint hover:bg-raised";
const ON = "border-rule text-text-muted hover:text-text hover:bg-raised";

// The Follow Toggle is one button in two states, not two buttons: `aria-pressed` carries the state
// and the label says what a press does next.
export function FollowToggle({ technologyId, name }: { technologyId: string; name: string }) {
  const follows = useFollows();
  const following = follows.isFollowing(technologyId);
  const pending = follows.isPending(technologyId);

  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={`${following ? "Unfollow" : "Follow"} ${name}`}
      aria-busy={pending || undefined}
      onClick={() => {
        if (!pending) follows.toggle(technologyId);
      }}
      className={`${BASE} ${following ? ON : OFF}`}
    >
      {following ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
