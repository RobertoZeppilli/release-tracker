import { describe, expect, it } from "vitest";
import { enabledByDefault, isEnabled, type Preference, wantsEvent } from "./preferences";

describe("enabledByDefault", () => {
  it("has the bell on and the external channels off", () => {
    expect(enabledByDefault("in_app")).toBe(true);
    expect(enabledByDefault("slack")).toBe(false);
    expect(enabledByDefault("email")).toBe(false);
  });
});

describe("isEnabled", () => {
  it("reads the starting point when nothing was saved", () => {
    expect(isEnabled([], "featured_release", "in_app")).toBe(true);
    expect(isEnabled([], "featured_release", "email")).toBe(false);
  });

  it("lets a saved row win over the starting point, in both directions", () => {
    const off: Preference = { event: "featured_release", channel: "in_app", enabled: false };
    const on: Preference = { event: "featured_release", channel: "email", enabled: true };
    expect(isEnabled([off, on], "featured_release", "in_app")).toBe(false);
    expect(isEnabled([off, on], "featured_release", "email")).toBe(true);
  });

  it("keeps the events apart: one switched off does not switch off another", () => {
    const off: Preference = { event: "notable_release", channel: "in_app", enabled: false };
    expect(isEnabled([off], "featured_release", "in_app")).toBe(true);
  });
});

describe("wantsEvent", () => {
  it("wants an event nobody has touched, because the bell starts on", () => {
    expect(wantsEvent([], "featured_release")).toBe(true);
  });

  it("still wants it with the bell off and the email on, because the email has to be sent", () => {
    expect(
      wantsEvent(
        [
          { event: "featured_release", channel: "in_app", enabled: false },
          { event: "featured_release", channel: "email", enabled: true },
        ],
        "featured_release",
      ),
    ).toBe(true);
  });

  it("does not want it when every channel is off", () => {
    expect(
      wantsEvent(
        [
          { event: "featured_release", channel: "in_app", enabled: false },
          { event: "featured_release", channel: "slack", enabled: false },
          { event: "featured_release", channel: "email", enabled: false },
        ],
        "featured_release",
      ),
    ).toBe(false);
  });
});
