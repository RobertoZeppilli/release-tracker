import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor } from "@/modules/i18n";
import type { PathCounts } from "../domain/upgrade-path";
import {
  defaultStartNote,
  historySentence,
  invalidMessage,
  barHasAction,
  legendLevels,
  majorWords,
  pathRows,
  pathSentence,
  pathVerdict,
} from "./upgrade-path-copy";

const none: PathCounts = { total: 0, featured: 0, notable: 0, digest: 0, actionRequired: 0, safe: 0, missing: 0, unjudged: 0 };

// The English words, which is what these choices are read in; the other four languages are held
// by `messages/dictionaries.test.ts`.
const t = createTranslator("en", dictionaryFor("en"));

describe("upgrade path copy", () => {
  // The page verdict counts all of `missing`, the Stat Row splits it: one number under two names is
  // what `without a verdict` keeps apart, leaving `to check` to `unjudged` alone.
  it("does not call a Release unsummarized when it has a Summary that could not judge its notes", () => {
    const counts = { ...none, total: 2, featured: 1, notable: 1, safe: 1, missing: 1, unjudged: 1 };
    expect(pathVerdict(counts, t)).toEqual({ tone: "muted", label: "note:", claim: "1 without a verdict" });
    expect(pathSentence("6.0.0", "6.2.0", counts, t)).toBe(
      "Between 6.0.0 and 6.2.0 there are 2 releases: 1 is safe to upgrade and 1 has notes too thin to judge.",
    );
    expect(majorWords(counts, t).missing).toBe("1 to check");
  });

  it("tells the two silences apart in the words beside a bar", () => {
    expect(majorWords({ ...none, total: 2, notable: 2, missing: 2, unjudged: 1 }, t).missing).toBe("1 not summarized · 1 to check");
  });

  it("leads with the Releases that need action", () => {
    const counts = { ...none, total: 36, featured: 1, notable: 2, digest: 33, actionRequired: 1, safe: 1, missing: 1 };
    expect(pathVerdict(counts, t)).toEqual({ tone: "action", label: "warning:", claim: "1 needs action" });
    expect(pathSentence("5.2.0", "6.0.3", counts, t)).toBe(
      "Between 5.2.0 and 6.0.3 there are 36 releases: 1 needs action, 1 is safe to upgrade, 1 has no summary yet (check its notes) and 33 are digest fixes you can skip.",
    );
  });

  it("never calls a path safe while some Releases have no Summary", () => {
    expect(pathVerdict({ ...none, total: 3, notable: 2, digest: 1, safe: 1, missing: 1 }, t)).toEqual({
      tone: "muted",
      label: "note:",
      claim: "1 without a verdict",
    });
  });

  it("calls a fully summarized path without action safe, and an empty one up to date", () => {
    expect(pathVerdict({ ...none, total: 2, notable: 1, digest: 1, safe: 1 }, t).claim).toBe("safe to upgrade");
    expect(pathVerdict(none, t).claim).toBe("up to date");
    expect(pathSentence("6.0.3", "6.0.3", none, t)).toBe("6.0.3 is already the latest stable release.");
  });

  // The panel holding the verdict reads the same counts as the sentence, one number per line. The
  // total is the only row that stays at zero, because a path with nothing in it has no rows at all.
  it("lays the same reading out as panel rows, in the order of the sentence", () => {
    const counts = { ...none, total: 36, featured: 1, notable: 2, digest: 33, actionRequired: 1, safe: 1, missing: 1 };
    expect(pathRows("5.2.0", "6.0.3", counts, t)).toEqual([
      { count: 36, words: "releases, 5.2.0 to 6.0.3" },
      { count: 1, words: "needs action" },
      { count: 1, words: "safe to upgrade" },
      { count: 1, words: "no summary yet" },
      { count: 33, words: "digest fixes you can skip" },
    ]);
  });

  it("splits the two silences in the rows, and counts one release in the singular", () => {
    const counts = { ...none, total: 1, notable: 1, missing: 1, unjudged: 1 };
    expect(pathRows("6.0.0", "6.0.1", counts, t)).toEqual([
      { count: 1, words: "release, 6.0.0 to 6.0.1" },
      { count: 1, words: "notes too thin to judge" },
    ]);
  });

  // A path with nothing in it has nothing to count: the panel falls back to the sentence, which says
  // the one thing worth saying there.
  it("gives no rows for an empty path", () => {
    expect(pathRows("6.0.3", "6.0.3", none, t)).toEqual([]);
  });

  // DESIGN.md, Upgrade Panel: a `·` separates facts on one line, and these facts are lines.
  it("puts no separator dot in a row", () => {
    const counts = { ...none, total: 4, featured: 1, digest: 3, actionRequired: 1, missing: 1, unjudged: 1 };
    for (const row of pathRows("1.0.0", "1.1.0", counts, t)) expect(row.words).not.toContain("·");
  });

  it("writes the counts of a major in words, leaving out the zeros", () => {
    expect(majorWords({ ...none, total: 4, featured: 1, digest: 3, actionRequired: 1 }, t)).toEqual({
      kinds: "4 releases · 1 featured · 3 digest",
      action: "1 needs action",
      missing: null,
    });
  });

  it("explains how to fix an invalid starting Version", () => {
    expect(invalidMessage("malformed", "abc", "6.0.3", t)).toBe("abc is not a version. Write it as major.minor.patch, for example 6.0.3.");
    expect(invalidMessage("notOlder", "7.0.0", "6.0.3", t)).toBe("7.0.0 is newer than 6.0.3, the latest stable release.");
  });
});

describe("defaultStartNote", () => {
  // The reader asked for nothing, so the note has to say both which Release and why that one.
  it("says where a start nobody gave comes from", () => {
    expect(defaultStartNote("7.1.9", "previousMajor", t)).toBe(
      "starting from 7.1.9, the last release of the previous major, because no version was given.",
    );
    expect(defaultStartNote("8.1.0", "oldest", t)).toBe(
      "starting from 8.1.0, the oldest release recorded, because no version was given.",
    );
  });
});

describe("the note over the whole recorded history", () => {
  const major = { major: 8, counts: none, rows: [] };

  // It never says action required or safe: this view has no start, so there is no upgrade to judge.
  it("names what is on the screen, and claims nothing about an upgrade", () => {
    expect(historySentence({ listed: 57, stable: 57, previews: 0, majors: [major, major, major, major] }, t)).toBe(
      "the whole recorded history, 57 releases in 4 majors.",
    );
  });

  it("counts the upcoming Previews apart, because the list prints them apart", () => {
    expect(historySentence({ listed: 33, stable: 32, previews: 1, majors: [major] }, t)).toBe(
      "the whole recorded history, 32 releases in 1 major, and 1 upcoming preview.",
    );
  });

  it("says the silence when there is nothing recorded", () => {
    expect(historySentence({ listed: 0, stable: 0, previews: 0, majors: [] }, t)).toBe("nothing recorded yet.");
  });
});

// DESIGN.md, Stat Row: the legend explains the fills of the bars, so it may not name a fill the
// reader cannot see anywhere in them.
describe("legendLevels", () => {
  it("names the levels in the order the bar fills them, not in the order they were counted", () => {
    expect(legendLevels([{ ...none, total: 2, digest: 1, featured: 1 }])).toEqual(["featured", "digest"]);
  });

  it("leaves out a level no group has", () => {
    expect(legendLevels([{ ...none, total: 1, notable: 1 }])).toEqual(["notable"]);
  });

  it("takes a level that only one group has", () => {
    expect(legendLevels([
      { ...none, total: 1, digest: 1 },
      { ...none, total: 2, featured: 1, digest: 1 },
    ])).toEqual(["featured", "digest"]);
  });

  it("names nothing when there is nothing in the bars", () => {
    expect(legendLevels([])).toEqual([]);
    expect(legendLevels([none])).toEqual([]);
  });
});

describe("barHasAction", () => {
  it("is true when any group carries a Release that needs action", () => {
    expect(barHasAction([{ ...none, total: 1, featured: 1 }, { ...none, total: 2, digest: 2, actionRequired: 1 }])).toBe(true);
  });

  it("is false when no group does, so the legend never explains a lane that is not drawn", () => {
    expect(barHasAction([{ ...none, total: 1, featured: 1 }])).toBe(false);
    expect(barHasAction([])).toBe(false);
  });
});
