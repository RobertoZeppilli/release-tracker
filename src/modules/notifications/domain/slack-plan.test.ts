import { describe, expect, it } from "vitest";
import { type PendingSlack, planSlackSends, type SlackRecipient } from "./slack-plan";

const recipient: SlackRecipient = {
  userId: "dev-1",
  webhookUrl: "https://hooks.slack.com/services/T0/B0/one",
  locale: "en",
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

describe("planSlackSends", () => {
  it("gathers a run into one message per Developer", () => {
    const sends = planSlackSends(
      [pending, { ...pending, notificationId: "notification-2", technologyName: "Vue", version: "3.6.0" }],
      [recipient],
    );
    expect(sends).toHaveLength(1);
    expect(sends[0]?.lines).toHaveLength(2);
    expect(sends[0]?.notificationIds).toEqual(["notification-1", "notification-2"]);
  });

  it("gives two Developers two messages, each to their own webhook", () => {
    const other = { ...recipient, userId: "dev-2", webhookUrl: "https://hooks.slack.com/services/T0/B0/two" };
    const sends = planSlackSends([pending, { ...pending, notificationId: "n-2", userId: "dev-2" }], [recipient, other]);
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
    const sends = planSlackSends([pending, { ...pending, notificationId: "n-2", event: "notable_release" }], [picky]);
    expect(sends[0]?.notificationIds).toEqual(["n-2"]);
  });

  it("sends nothing to a Developer the job found no webhook for", () => {
    expect(planSlackSends([pending], [])).toEqual([]);
  });

  it("sends nothing to a Developer who pasted a webhook and left the switch off", () => {
    expect(planSlackSends([pending], [{ ...recipient, preferences: [] }])).toEqual([]);
  });
});
