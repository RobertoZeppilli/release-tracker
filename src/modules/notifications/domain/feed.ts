import type { Significance } from "@/modules/releases";
import type { ReleaseEvent } from "./events";

// One Notification as the bell shows it: which Release it is about, named the way every other list
// in the app names one, and whether it has been Seen.
export type FeedItem = {
  id: string;
  event: ReleaseEvent;
  technologyName: string;
  slug: string;
  version: string;
  createdAt: Date;
  seen: boolean;
};

// The bell holds two figures that are allowed to disagree: the number, which counts every unseen
// Notification the Developer has, and the list, which is the latest page of them. Thirty unseen
// behind a panel of twenty is the ordinary case, so neither is derived from the other and the
// number is read from the database (ADR 0009: the counter counts `seen_at is null`).
export type Feed = { unseen: number; items: readonly FeedItem[] };

export const EMPTY_FEED: Feed = { unseen: 0, items: [] };

// What the two Release events are about. The event already carries the Significance, so the panel
// draws the same glyph the Dashboard and the Catalog draw instead of reading the Release again
// (DESIGN.md, The Neutral Significance Rule).
export function significanceOf(event: ReleaseEvent): Significance {
  return event === "featured_release" ? "featured" : "notable";
}

// Seen is set once and never taken back, so a second press on the same row counts once: a number
// that went under zero would be the only trace left of the one that was pressed twice.
export function seeOne(feed: Feed, id: string): Feed {
  const seen = feed.items.find((item) => item.id === id);
  if (!seen || seen.seen) return feed;
  return {
    unseen: Math.max(0, feed.unseen - 1),
    items: feed.items.map((item) => (item.id === id ? { ...item, seen: true } : item)),
  };
}

// Everything, including the unseen Notifications older than the page the panel holds: the write
// behind this marks every row of the Developer, so the number goes to zero and not to the
// difference between the two.
export function seeAll(feed: Feed): Feed {
  return { unseen: 0, items: feed.items.map((item) => (item.seen ? item : { ...item, seen: true })) };
}

export function hasUnseen(feed: Feed): boolean {
  return feed.unseen > 0;
}
