"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslator } from "@/modules/i18n/ui";
import { useFollows } from "./follows-provider";

const BASE =
  "inline-flex h-[34px] items-center gap-2 rounded-md border px-3 font-sans text-body whitespace-nowrap";
// Every state keeps `border-rule-strong`: the border is the only thing that identifies this control,
// so it answers to SC 1.4.11 whether the button is pressed or at the limit, where it stays focusable.
// What drops between off and on is the text, not the outline.
const OFF = "border-rule-strong text-text hover:border-text-faint hover:bg-raised";
const ON = "border-rule-strong text-text-muted hover:text-text hover:bg-raised";
const BLOCKED = "border-rule-strong text-text-faint cursor-not-allowed";

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
  const t = useTranslator();
  const follows = useFollows();
  const button = useRef<HTMLButtonElement>(null);
  const following = follows.isFollowing(technologyId);
  const pending = follows.isPending(technologyId);
  const blocked = !following && follows.atLimit;
  const describedBy = [blocked ? LIMIT_NOTE_ID : null, errorId].filter(Boolean).join(" ");

  // A press moves the row to another section, so this button is torn down and built again there and
  // the browser drops the focus on the body. Taking it back is what keeps the place of the press
  // (issue #64): the keyboard lands where it was and the page scrolls to where the row went, which
  // is the whole reason the row is allowed to move. It runs again when the database refuses and the
  // row comes back. Nothing is taken from a focus that is still somewhere, so the Technology page
  // and the Dashboard shortlist, where no row moves, are untouched.
  const press = follows.pressedAt(technologyId);
  useEffect(() => {
    if (press === null) return;
    const active = document.activeElement;
    if (active === null || active === document.body) button.current?.focus();
  }, [press, following]);

  return (
    <button
      ref={button}
      type="button"
      aria-pressed={following}
      aria-label={t(following ? "stack.unfollowName" : "stack.followName", { name })}
      aria-busy={pending || undefined}
      aria-disabled={blocked || undefined}
      aria-describedby={describedBy === "" ? undefined : describedBy}
      onClick={() => {
        if (!pending && !blocked) follows.toggle(technologyId);
      }}
      className={`${BASE} ${blocked ? BLOCKED : following ? ON : OFF}`}
    >
      {following ? <Check aria-hidden className="size-4" /> : <Plus aria-hidden className="size-4" />}
      {t(following ? "stack.following" : "stack.follow")}
    </button>
  );
}
