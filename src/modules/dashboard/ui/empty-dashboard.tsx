"use client";

import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { LocaleLink as Link, useTranslator } from "@/modules/i18n/ui";
import { FREE_FOLLOW_LIMIT, type PickerTechnology } from "@/modules/plans";
import { WINDOW_DAYS } from "../domain/build-dashboard";
import { CatalogRow, FollowToggleLimitNote, useFollows } from "@/modules/plans/ui";
import { SectionTitle } from "./section-title";

// The Catalog has no measure of popularity, so the shortlist is simply the first Technologies in
// alphabetical order and says so: the pointer below carries anyone who wants the whole Catalog.
export function EmptyDashboard({ shortlist, total }: { shortlist: readonly PickerTechnology[]; total: number }) {
  const t = useTranslator();
  const { count } = useFollows();
  const router = useRouter();
  // The claim counts what the viewer has done since the page arrived: the first follow makes the
  // sentence about a stack instead of about an absence.
  const claim =
    count === 0 ? t("dashboard.empty.none") : t("dashboard.empty.some", { count });

  return (
    <>
      <section aria-labelledby="empty-status">
        <p id="empty-status" className="font-mono text-status text-text-muted">
          <Info aria-hidden className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />
          note: <span className="text-text">{claim}</span>
        </p>
        <p className="mt-3 max-w-measure text-text-muted">
          {t("dashboard.empty.what", { days: WINDOW_DAYS, limit: FREE_FOLLOW_LIMIT })}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-4 font-mono text-diagnostic text-text-muted tabular-nums">
          {/* The count used to be a span of its own in `text-text` inside a muted line. A
              sentence that lives in the dictionary cannot carry an element inside it (ADR 0008,
              `message.ts`), so the ink is the line's: one step louder than before, and the same in
              every language. */}
          <span aria-live="polite" className="text-text">
            {t("dashboard.quota.followed", { count, limit: FREE_FOLLOW_LIMIT })}
          </span>
          {/* The way on, and only once there is somewhere to go: with nothing followed the split
              has no answer to either of its two questions (DESIGN.md, Empty State). */}
          {count > 0 && (
            <button
              type="button"
              onClick={() => router.refresh()}
              className="rounded-md border border-rule-strong px-3 py-[6px] font-mono text-label text-text hover:border-text-faint"
            >
              {t("dashboard.empty.open")}
            </button>
          )}
        </p>
      </section>

      <section className="mt-7" aria-labelledby="catalog-title">
        <SectionTitle id="catalog-title" title={t("dashboard.empty.catalog", { count: shortlist.length })} />
        <ul className="border-t border-rule">
          {shortlist.map((technology) => (
            <CatalogRow key={technology.id} technology={technology} hidden={false} />
          ))}
        </ul>
        <FollowToggleLimitNote counted />
        <p className="mt-4 font-mono text-diagnostic">
          <Link href="/technologies" className="text-link no-underline hover:underline">
            <span aria-hidden className="mr-[1ch] text-text-faint [font-variant-ligatures:none]">
              --&gt;
            </span>
            {t("dashboard.empty.browse", { count: total })}
          </Link>
        </p>
      </section>
    </>
  );
}
