import { describe, expect, it } from "vitest";
import { EMPTY_FEED, type Feed, type FeedItem, hasUnseen, seeAll, seeOne, significanceOf } from "./feed";

function item(id: string, seen = false): FeedItem {
  return {
    id,
    event: "featured_release",
    technologyName: "Vite",
    slug: "vite",
    version: "6.0.0",
    createdAt: new Date("2026-10-20T10:00:00Z"),
    seen,
  };
}

function feed(unseen: number, items: FeedItem[]): Feed {
  return { unseen, items };
}

describe("significanceOf", () => {
  it("reads the Significance the event already carries", () => {
    expect(significanceOf("featured_release")).toBe("featured");
    expect(significanceOf("notable_release")).toBe("notable");
  });
});

describe("seeOne", () => {
  it("marks the row and takes one off the number", () => {
    const next = seeOne(feed(2, [item("a"), item("b")]), "a");
    expect(next.unseen).toBe(1);
    expect(next.items.map((row) => row.seen)).toEqual([true, false]);
  });

  it("counts a second press on the same row once", () => {
    const once = seeOne(feed(1, [item("a")]), "a");
    expect(seeOne(once, "a")).toBe(once);
  });

  it("leaves the feed alone when the row is not in the page it holds", () => {
    const held = feed(3, [item("a")]);
    expect(seeOne(held, "elsewhere")).toBe(held);
  });

  it("never takes the number under zero", () => {
    expect(seeOne(feed(0, [item("a")]), "a").unseen).toBe(0);
  });
});

describe("seeAll", () => {
  it("clears the number, not only the rows the panel holds", () => {
    const next = seeAll(feed(30, [item("a"), item("b", true)]));
    expect(next.unseen).toBe(0);
    expect(next.items.every((row) => row.seen)).toBe(true);
  });
});

describe("hasUnseen", () => {
  it("is false on an empty feed and true while the number stands", () => {
    expect(hasUnseen(EMPTY_FEED)).toBe(false);
    expect(hasUnseen(feed(1, []))).toBe(true);
  });
});
