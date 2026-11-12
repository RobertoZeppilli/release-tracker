import { describe, expect, it } from "vitest";
import { type PendingSlack, planSlackSend, type SlackRecipient } from "./slack-plan";

const recipient: SlackRecipient = {
  webhookUrl: "https://hooks.slack.com/services/T0/B0/one",
  locale: "en",
  // Slack is off until it is switched on (`enabledByDefault`), so the recipient of these tests
  // carries the switch: an empty list is the webhook that was pasted and left off.
  preferences: [
    { event: "featured_release", channel: "slack", enabled: true },
    { event: "notable_release", channel: "slack", enabled: true },
  ],
};

const pending: PendingSlack = {
  notificationId: "notification-1",
  event: "featured_release",
  technologyName: "React",
  slug: "react",
  version: "19.3.1",
  url: "https://example.test/en/releases/react/19.3.1",
};

describe("planSlackSend", () => {
  it("gathers a run into one message", () => {
    const send = planSlackSend(
      [pending, { ...pending, notificationId: "notification-2", technologyName: "Vue", version: "3.6.0" }],
      recipient,
    );
    expect(send?.lines).toHaveLength(2);
    expect(send?.notificationIds).toEqual(["notification-1", "notification-2"]);
    expect(send?.webhookUrl).toBe(recipient.webhookUrl);
  });

  it("leaves out the event switched off on Slack, and keeps the other", () => {
    const picky: SlackRecipient = {
      ...recipient,
      preferences: [
        { event: "featured_release", channel: "slack", enabled: false },
        { event: "notable_release", channel: "slack", enabled: true },
      ],
    };
    const send = planSlackSend([pending, { ...pending, notificationId: "n-2", event: "notable_release" }], picky);
    expect(send?.notificationIds).toEqual(["n-2"]);
  });

  it("sends nothing when the job found no webhook", () => {
    expect(planSlackSend([pending], null)).toBeNull();
  });

  it("sends nothing when the webhook was pasted and the switch left off", () => {
    expect(planSlackSend([pending], { ...recipient, preferences: [] })).toBeNull();
  });

  it("sends nothing when the run earned no line", () => {
    expect(planSlackSend([], recipient)).toBeNull();
  });
});
