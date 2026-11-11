import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor } from "@/modules/i18n";
import { groupFollowError } from "./group-follow";

// The English words these notes are read in; the four translations are held by the parity test.
const t = createTranslator("en", dictionaryFor("en"));

describe("groupFollowError", () => {
  it("says none were followed, because the write is one statement", () => {
    expect(groupFollowError("retired", t)).toMatch(/^none followed\. one of them has left/);
    expect(groupFollowError("unknown", t)).toMatch(/^none followed\. the change didn't reach/);
  });
});
