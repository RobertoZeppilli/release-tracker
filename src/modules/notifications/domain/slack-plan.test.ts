import { describe, expect, it } from "vitest";
import { externalChannelOpen, type PendingSlack, planSlackSends, type SlackRecipient } from "./slack-plan";

const now = new Date("2026-10-26T10:00:00Z");

const recipient: SlackRecipient = {
  userId: "dev-1",
  webhookUrl: "https://hooks.slack.com/services/T0/B0/one",
  locale: "en",
  pro: false,
  trialStartedAt: new Date("2026-10-20T10:00:00Z"),
  // Slack is off until a Developer switches it on (`enabledByDefault`), so every recipient of these
  // tests carries the switch: an empty list is the Developer who pasted a webhook and left it off.
  preferences: [
    { event: "featured_release", channel: "slack", enabled: true },
    { event: "notable_release", channel: "slack", enabled: true },
  ],
};

const pending: PendingSlack = {
  notificationId: "notification-1",
  userId: "dev-1",
  event: "featured_release",
  technologyName: "React",
  slug: "react",
  version: "19.3.1",
  url: "https://example.test/en/releases/react/19.3.1",
};

describe("externalChannelOpen", () => {
  it("is open on Pro, trial or not", () => {
    expect(externalChannelOpen(true, { kind: "ended" })).toBe(true);
  });

  it("is shut when the trial ended and no Plan was bought: no acquired rights (ADR 0009)", () => {
    expect(externalChannelOpen(false, { kind: "ended" })).toBe(false);
  });

  it("is open before the row that records the first switch is read back", () => {
    expect(externalChannelOpen(false, { kind: "not-started" })).toBe(true);
  });
});

describe("planSlackSends", () => {
  it("gathers a run into one message per Developer", () => {
    const sends = planSlackSends(
      [pending, { ...pending, notificationId: "notification-2", technologyName: "Vue", version: "3.6.0" }],
      [recipient],
      now,
    );
    expect(sends).toHaveLength(1);
    expect(sends[0]?.lines).toHaveLength(2);
    expect(sends[0]?.notificationIds).toEqual(["notification-1", "notification-2"]);
  });

  it("gives two Developers two messages, each to their own webhook", () => {
    const other = { ...recipient, userId: "dev-2", webhookUrl: "https://hooks.slack.com/services/T0/B0/two" };
    const sends = planSlackSends([pending, { ...pending, notificationId: "n-2", userId: "dev-2" }], [recipient, other], now);
    expect(sends.map((send) => send.webhookUrl)).toEqual([recipient.webhookUrl, other.webhookUrl]);
  });

  it("leaves out the event the Developer switched off on Slack, and keeps the other", () => {
    const picky: SlackRecipient = {
      ...recipient,
      preferences: [
        { event: "featured_release", channel: "slack", enabled: false },
        { event: "notable_release", channel: "slack", enabled: true },
      ],
    };
    const sends = planSlackSends([pending, { ...pending, notificationId: "n-2", event: "notable_release" }], [picky], now);
    expect(sends[0]?.notificationIds).toEqual(["n-2"]);
  });

  it("sends nothing to a Developer whose trial ended without Pro", () => {
    const expired = { ...recipient, trialStartedAt: new Date("2026-09-01T10:00:00Z") };
    expect(planSlackSends([pending], [expired], now)).toEqual([]);
  });

  it("sends nothing to a Developer the job found no webhook for", () => {
    expect(planSlackSends([pending], [], now)).toEqual([]);
  });

  it("sends nothing to a Developer who pasted a webhook and left the switch off", () => {
    expect(planSlackSends([pending], [{ ...recipient, preferences: [] }], now)).toEqual([]);
  });
});
