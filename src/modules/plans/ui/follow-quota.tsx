"use client";

import { LocaleLink as Link, useTranslator } from "@/modules/i18n/ui";
import { FREE_FOLLOW_LIMIT } from "../domain/follow-limit";
import { useFollows } from "./follows-provider";

// The quota in the top bar, on every signed-in page. It reads the same live count as the picker, so
// the bar and the page can never disagree about how many Technologies the Developer follows.
export function FollowQuota() {
  const t = useTranslator();
  const { count } = useFollows();

  return (
    <Link
      href="/technologies"
      aria-label={t("stack.quota.label")}
      className="font-mono text-label text-text-muted no-underline tabular-nums hover:text-text"
    >
      {/* Two whole sentences and not one with a piece hidden: the short one is the phone's, and a
          sentence a language writes in another order cannot be cut in the middle (ADR 0008). */}
      <span className="sm:hidden">{t("stack.quota.short", { count })}</span>
      <span className="max-sm:hidden">{t("stack.quota.followed", { count, limit: FREE_FOLLOW_LIMIT })}</span>
    </Link>
  );
}
