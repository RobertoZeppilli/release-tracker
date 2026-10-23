"use client";

import { Check } from "lucide-react";
import type { Translator } from "@/modules/i18n";
import { LocaleLink as Link } from "@/modules/i18n/ui";
import { releasePath } from "@/modules/releases";
import { isoDate, SignificanceGlyph } from "@/modules/releases/ui";
import { type FeedItem, significanceOf } from "../domain/feed";

// A row of the panel. 44px on a phone, where it is a thumb's target, and the same row above 640px
// where it only has to hold its three facts.
const ROW = "flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule px-4 py-2 sm:px-3";

// The Technology and the Version, the two things a Notification is about, then the day it was born.
// The Version is the link: it is what the Release page is named by everywhere else in the app
// (DESIGN.md, Release Row), so the pointer lands on the same word here.
export function NotificationRow({
  item,
  onFollow,
  onSee,
  t,
}: {
  item: FeedItem;
  onFollow: () => void;
  onSee: () => void;
  t: Translator;
}) {
  return (
    <li className={ROW}>
      {/* The event already says which Significance it was, so the row draws the same shape the
          Dashboard draws (DESIGN.md, The Neutral Significance Rule). Unseen is the stronger ink and
          seen the faint one: the difference between the two is weight, never a hue. */}
      <span className={`inline-flex items-center ${item.seen ? "text-text-faint" : "text-text"}`}>
        <SignificanceGlyph significance={significanceOf(item.event)} />
        {!item.seen && <span className="sr-only">{t("notification.unseen")}</span>}
      </span>
      <span className={`font-sans text-[16px] leading-[1.45] font-semibold tracking-[-0.01em] ${item.seen ? "text-text-muted" : "text-text"}`}>
        {item.technologyName}
      </span>
      <Link
        href={releasePath(item.slug, item.version)}
        onClick={() => {
          onSee();
          onFollow();
        }}
        className="font-mono text-label leading-[normal] text-text-muted no-underline hover:underline"
      >
        {item.version}
      </Link>
      <span className="ml-auto flex items-center gap-3">
        <span className="font-mono text-meta leading-[normal] text-text-faint">{isoDate(item.createdAt)}</span>
        {/* Only where there is something to mark: a row already Seen would carry a control that
            answers nothing, and Seen is set once and never taken back. */}
        {!item.seen && (
          <button
            type="button"
            onClick={onSee}
            className="inline-flex size-[24px] items-center justify-center rounded-md border border-rule-strong font-mono text-meta text-text-muted hover:border-text-faint hover:bg-sunken hover:text-text"
          >
            <Check aria-hidden strokeWidth={1.75} className="size-3" />
            <span className="sr-only">
              {t("notification.markOne", { name: item.technologyName, version: item.version })}
            </span>
          </button>
        )}
      </span>
    </li>
  );
}
