import { describe, expect, it } from "vitest";
import { InvalidEnvError, parseEnv } from "./parse-env";

describe("parseEnv", () => {
  it("returns the validated variables", () => {
    expect(parseEnv({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" })).toEqual({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
  });

  it("names a missing variable in the error", () => {
    expect(() => parseEnv({})).toThrow(InvalidEnvError);
    expect(() => parseEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects an invalid value", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
