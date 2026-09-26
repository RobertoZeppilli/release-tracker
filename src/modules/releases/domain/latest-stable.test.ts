import { describe, expect, it } from "vitest";
import { latestStableVersion } from "./latest-stable";

describe("latestStableVersion", () => {
  it("takes the highest stable Version, not the highest string", () => {
    expect(latestStableVersion(["8.10.0", "8.9.0", "7.2.1"])).toBe("8.10.0");
  });

  it("ignores the Previews that come after it", () => {
    expect(latestStableVersion(["8.2.2", "8.3.0-beta.0"])).toBe("8.2.2");
  });

  it("has nothing to show for a Technology without stable Releases", () => {
    expect(latestStableVersion([])).toBe(null);
    expect(latestStableVersion(["1.0.0-rc.1"])).toBe(null);
  });

  it("leaves out a Version that is not SemVer", () => {
    expect(latestStableVersion(["not-a-version", "1.2.3"])).toBe("1.2.3");
  });
});
