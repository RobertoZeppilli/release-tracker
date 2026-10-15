"use client";

import { LocaleLink as Link } from "@/modules/i18n/ui";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { useFollows } from "./follows-provider";

// The quota in the top bar, on every signed-in page. It reads the same live count as the picker, so
// the bar and the page can never disagree about how many Technologies the Developer follows.
export function FollowQuota() {
  const { count } = useFollows();

  return (
    <Link
      href="/technologies"
      aria-label="Followed technologies"
      className="font-mono text-label text-text-muted no-underline tabular-nums hover:text-text"
    >
      <span className="text-text">{count}</span>
      <span className="max-sm:hidden"> of {FREE_FOLLOW_LIMIT}</span> followed
    </Link>
  );
}
