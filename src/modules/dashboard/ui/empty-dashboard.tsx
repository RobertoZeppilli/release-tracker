"use client";

import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FREE_FOLLOW_LIMIT, type PickerTechnology } from "@/modules/plans";
import { FollowToggleLimitNote, PickerRow, useFollows } from "@/modules/plans/ui";
import { SectionTitle } from "./section-title";

// The Catalog has no measure of popularity, so the shortlist is simply the first Technologies in
// alphabetical order and says so: the pointer below carries anyone who wants the whole Catalog.
export function EmptyDashboard({ shortlist, total }: { shortlist: readonly PickerTechnology[]; total: number }) {
  const { count } = useFollows();
  const router = useRouter();

  return (
    <>
      <section aria-labelledby="empty-status">
        <p id="empty-status" className="font-mono text-status text-text-muted">
          <Info aria-hidden className="mr-[0.35em] inline size-[0.8em] align-[-0.08em]" />
          note: <span className="text-text">you follow no technologies yet</span>
        </p>
        <p className="mt-3 max-w-measure text-text-muted">
          Follow the tools in your stack. This page then shows, for each one, the releases that matter from
          the last 30 days and whether upgrading needs action. The Free plan follows up to {FREE_FOLLOW_LIMIT}.
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-4 font-mono text-diagnostic text-text-muted tabular-nums">
          <span aria-live="polite">
            <span className="text-text">{count}</span> of {FREE_FOLLOW_LIMIT} followed
          </span>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-md border border-rule-strong px-3 py-[6px] font-mono text-label text-text hover:border-text-faint"
          >
            Open dashboard
          </button>
        </p>
      </section>

      <section className="mt-7" aria-labelledby="catalog-title">
        <SectionTitle id="catalog-title" title={`in the catalog (${shortlist.length})`} />
        <ul className="border-t border-rule">
          {shortlist.map((technology) => (
            <PickerRow key={technology.id} technology={technology} section={null} hidden={false} />
          ))}
        </ul>
        <FollowToggleLimitNote />
        <p className="mt-4 font-mono text-diagnostic">
          <Link href="/technologies" className="text-text no-underline hover:underline">
            <span aria-hidden className="mr-[1ch] text-text-faint [font-variant-ligatures:none]">
              --&gt;
            </span>
            browse all {total} technologies
          </Link>
        </p>
      </section>
    </>
  );
}
