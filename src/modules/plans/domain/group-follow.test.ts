import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor } from "@/modules/i18n";
import { groupFollowError, groupWallFor, groupWallNote, wallNow } from "./group-follow";

// The English words these notes are read in; the four translations are held by the parity test.
const t = createTranslator("en", dictionaryFor("en"));

describe("groupWallFor", () => {
  it("lets a selection that fits the free plan through", () => {
    expect(groupWallFor(3, 7)).toBeNull();
  });

  it("stops the selection that is one over the room left", () => {
    expect(groupWallFor(4, 7)).toEqual({ room: 3, selected: 4 });
  });

  // A follow written in another session can put a Developer over the limit, and the wall has to
  // read as a wall rather than as a debt (see `freeFollowsLeft`).
  it("never reports negative room", () => {
    expect(groupWallFor(1, 12)).toEqual({ room: 0, selected: 1 });
  });
});

describe("the words of the wall", () => {
  it("counts in the plural", () => {
    expect(groupWallNote({ room: 2, selected: 5 }, t)).toBe(
      "your free plan has room for 2 more, and 5 are selected.",
    );
  });

  it("counts in the singular on both sides", () => {
    expect(groupWallNote({ room: 1, selected: 1 }, t)).toBe(
      "your free plan has room for 1 more, and 1 is selected.",
    );
  });

  it("names a full plan instead of counting down to zero", () => {
    expect(groupWallNote({ room: 0, selected: 3 }, t)).toBe(
      "your free plan is full, and 3 are selected.",
    );
  });

  it("says none were followed, because the write is one statement", () => {
    expect(groupFollowError("limit", { room: 2, selected: 5 }, t)).toBe(
      "none followed. your free plan has room for 2 more, and 5 are selected.",
    );
  });

  it("opens with none for the other two refusals as well", () => {
    const wall = { room: 2, selected: 5 };
    expect(groupFollowError("retired", wall, t)).toMatch(/^none followed\. one of them has left/);
    expect(groupFollowError("unknown", wall, t)).toMatch(/^none followed\. the change didn't reach/);
  });

  it("reads the wall from the follows as they stand now", () => {
    expect(wallNow(3, 9)).toEqual({ room: 1, selected: 3 });
  });
});
