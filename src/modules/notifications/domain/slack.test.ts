import { describe, expect, it } from "vitest";
import { createTranslator, dictionaryFor } from "@/modules/i18n";
import { isSlackWebhook, MAX_LINES, type SlackLine, slackMessage, webhookHint } from "./slack";

const t = createTranslator("en", dictionaryFor("en"));

const line: SlackLine = {
  event: "featured_release",
  technologyName: "React",
  version: "19.3.1",
  url: "https://example.test/en/releases/react/19.3.1",
};

function lines(count: number): SlackLine[] {
  return Array.from({ length: count }, (_, index) => ({ ...line, version: `19.3.${index}` }));
}

describe("isSlackWebhook", () => {
  it("takes a Slack webhook", () => {
    expect(isSlackWebhook("https://hooks.slack.com/services/T0/B0/xxxx")).toBe(true);
  });

  it("refuses another host, which would be this Developer's secret posted elsewhere", () => {
    expect(isSlackWebhook("https://hooks.slack.com.evil.test/services/T0")).toBe(false);
    expect(isSlackWebhook("http://hooks.slack.com/services/T0")).toBe(false);
  });

  it("refuses the bare prefix, which is a channel that looks on and sends nowhere", () => {
    expect(isSlackWebhook("https://hooks.slack.com/services/")).toBe(false);
  });
});

describe("webhookHint", () => {
  it("says the host and the last four characters, never the path that is the secret", () => {
    const hint = webhookHint("https://hooks.slack.com/services/T0/B0/sEcReT1234");
    expect(hint).toBe("hooks.slack.com/…1234");
    expect(hint).not.toContain("sEcReT");
  });
});

describe("slackMessage", () => {
  it("names the Significance in English, which is the product's grammar in every language", () => {
    const message = slackMessage(createTranslator("it", dictionaryFor("it")), [line]);
    expect(message).toContain("featured · React 19.3.1");
    expect(message).toContain("Release");
  });

  it("writes one message with a line per Release, not one message per Release", () => {
    const message = slackMessage(t, lines(3));
    expect(message.split("\n")).toHaveLength(4);
    expect(message).toContain("3 new releases");
  });

  it("stops at twenty lines and counts what it left out", () => {
    const message = slackMessage(t, lines(MAX_LINES + 5));
    expect(message.split("\n")).toHaveLength(MAX_LINES + 2);
    expect(message).toContain("and 5 more");
  });
});
