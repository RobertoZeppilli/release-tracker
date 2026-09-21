import { describe, expect, it } from "vitest";
import { SignificanceSchema } from "./significance";

describe("SignificanceSchema", () => {
  it.each(["featured", "notable", "digest", "preview"])("accepts %s", (value) => {
    expect(SignificanceSchema.parse(value)).toBe(value);
  });

  it("rejects a SemVer type used as significance", () => {
    expect(SignificanceSchema.safeParse("major").success).toBe(false);
  });
});
