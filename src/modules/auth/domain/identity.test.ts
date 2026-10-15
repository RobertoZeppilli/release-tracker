import { describe, expect, it } from "vitest";
import { identityFrom } from "./identity";

describe("identityFrom", () => {
  it("reads the handle and the picture GitHub sends", () => {
    expect(identityFrom({ user_name: "octocat", avatar_url: "https://avatars.githubusercontent.com/u/1" })).toEqual({
      handle: "octocat",
      avatarUrl: "https://avatars.githubusercontent.com/u/1",
    });
  });

  it("falls back to the other name GitHub may send", () => {
    expect(identityFrom({ preferred_username: "octocat" }).handle).toBe("octocat");
  });

  it("stands without an identity at all: a Developer seeded by a test has none", () => {
    for (const metadata of [{}, null, undefined, "nonsense", { avatar_url: "not-a-url" }]) {
      expect(identityFrom(metadata)).toEqual({ handle: null, avatarUrl: null });
    }
  });
});
