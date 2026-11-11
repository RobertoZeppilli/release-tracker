import type { Translator } from "@/modules/i18n";
import type { FollowRejection } from "./follow-rejection";

// What the Selection Bar says after the database refuses. The write is one statement, so both of
// these open with `none` rather than with some: there is no halfway state to describe. The remedy is
// the Developer's in either case, which is why each names one.
//
// The wall this file used to name before the press -- the room left on the Free Plan, counted
// against the size of the selection -- went with the Plan (issue #209, ADR 0011). A selection has no
// size to fit inside any more, so the bar has nothing to say until something is refused.
export function groupFollowError(rejection: FollowRejection, t: Translator): string {
  if (rejection === "retired") return t("stack.group.retired");
  return t("stack.group.failed");
}
