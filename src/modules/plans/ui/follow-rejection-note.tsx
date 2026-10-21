"use client";

import { CircleX } from "lucide-react";
import type { Translator } from "@/modules/i18n";
import { useTranslator } from "@/modules/i18n/ui";
import type { FollowRejection } from "../domain/follow-rejection";

// What the database refused, said once for every page that can be refused: what did not happen, why,
// and the way out. The Toggle points at it with `aria-describedby`, so the id comes from the caller.
// `diagnostic` is the one measure for an error line (DESIGN.md, `field-error`): it is the same on
// the Upgrade Path form, and it lifts the error off the 13px facts of the row it sits under.
//
// It is the only thing a row says about itself now. The note that told a row where it was going
// (issue #64) left with the row's old habit of staying put, so the geometry it shared with this
// line lives here, where it is used.
export function FollowRejectionNote({
  id,
  rejection,
  className,
}: {
  id: string;
  rejection: FollowRejection;
  className: string;
}) {
  const t = useTranslator();

  return (
    <p id={id} className={`font-mono text-diagnostic text-breaking ${className}`}>
      <CircleX aria-hidden strokeWidth={1.75} className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
      error: {message(rejection, t)}
    </p>
  );
}

function message(rejection: FollowRejection, t: Translator): string {
  if (rejection === "limit") {
    // It says what happened and the way out, and it does not recount the quota: the figure is in
    // the Stack Panel on `/technologies` and in the Limit Note everywhere else (DESIGN.md, Row
    // Error Line).
    return t("stack.rejected.limit");
  }
  if (rejection === "retired") return t("stack.rejected.retired");
  return t("stack.rejected.failed");
}
