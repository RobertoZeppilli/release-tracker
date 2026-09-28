"use client";

import { Check, Plus } from "lucide-react";
import { useFollows } from "./follows-provider";

const BASE =
  "inline-flex h-[34px] items-center gap-2 rounded-md border px-3 font-sans text-body whitespace-nowrap";
const OFF = "border-rule-strong text-text hover:border-text-faint hover:bg-raised";
const ON = "border-rule text-text-muted hover:text-text hover:bg-raised";
const BLOCKED = "border-rule text-text-faint cursor-not-allowed";

export const LIMIT_NOTE_ID = "limit-note";

// The look of an unpressed Follow, for the one place that cannot be a button: a Visitor is offered a
// link to the login, and it has to be the same control they will find once they are back.
export const FOLLOW_LINK_CLASS = `${BASE} ${OFF} no-underline`;

// The Follow Toggle is one button in two states, not two buttons: `aria-pressed` carries the state
// and the label says what a press does next. At the limit the button stays focusable and keeps its
// label, with `aria-disabled` and the note that says why: a Developer can still read it and reach it
// by keyboard, which a `disabled` button would not allow.
export function FollowToggle({
  technologyId,
  name,
  errorId,
}: {
  technologyId: string;
  name: string;
  errorId?: string;
}) {
  const follows = useFollows();
  const following = follows.isFollowing(technologyId);
  const pending = follows.isPending(technologyId);
  const blocked = !following && follows.atLimit;
  const describedBy = [blocked ? LIMIT_NOTE_ID : null, errorId].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={`${following ? "Unfollow" : "Follow"} ${name}`}
      aria-busy={pending || undefined}
      aria-disabled={blocked || undefined}
      aria-describedby={describedBy === "" ? undefined : describedBy}
      onClick={() => {
        if (!pending && !blocked) follows.toggle(technologyId);
      }}
      className={`${BASE} ${blocked ? BLOCKED : following ? ON : OFF}`}
    >
      {following ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
      {following ? "Following" : "Follow"}
    </button>
  );
}
