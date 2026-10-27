import { describe, expect, it } from "vitest";
import { authorizeUrl, channelHint, SLACK_AUTHORIZE_URL, SlackAccessSchema } from "./slack-oauth";

const WEBHOOK = "https://hooks.slack.com/services/T000/B000/abcd1234";

describe("authorizeUrl", () => {
  const url = new URL(
    authorizeUrl({ clientId: "123.456", redirectUri: "https://verdict.example/slack/callback", state: "s.t" }),
  );

  it("asks for the one scope that makes Slack show the channel picker", () => {
    expect(url.searchParams.get("scope")).toBe("incoming-webhook");
  });

  it("is Slack's v2 authorisation address, with the client id, the redirect and the state", () => {
    expect(`${url.origin}${url.pathname}`).toBe(SLACK_AUTHORIZE_URL);
    expect(url.searchParams.get("client_id")).toBe("123.456");
    expect(url.searchParams.get("redirect_uri")).toBe("https://verdict.example/slack/callback");
    expect(url.searchParams.get("state")).toBe("s.t");
  });

  it("asks for no user scope, so the consent screen reads as the channel and nothing else", () => {
    expect(url.searchParams.get("user_scope")).toBeNull();
  });
});

describe("SlackAccessSchema", () => {
  it("reads the webhook, the channel and the optional channel id", () => {
    const parsed = SlackAccessSchema.parse({
      ok: true,
      incoming_webhook: { url: WEBHOOK, channel: "#releases", channel_id: "C123" },
    });
    expect(parsed).toEqual({
      ok: true,
      incoming_webhook: { url: WEBHOOK, channel: "#releases", channel_id: "C123" },
    });
  });

  it("takes an answer without the channel id, which not every example of Slack's carries", () => {
    const parsed = SlackAccessSchema.safeParse({
      ok: true,
      incoming_webhook: { url: WEBHOOK, channel: "#releases" },
    });
    expect(parsed.success).toBe(true);
  });

  it("reads the failure Slack reports with HTTP 200 and ok false", () => {
    expect(SlackAccessSchema.parse({ ok: false, error: "invalid_code" })).toEqual({
      ok: false,
      error: "invalid_code",
    });
  });

  it("refuses a webhook pointing anywhere but Slack, which the pasted field refuses too", () => {
    const parsed = SlackAccessSchema.safeParse({
      ok: true,
      incoming_webhook: { url: "https://example.com/services/T000/B000/abcd", channel: "#releases" },
    });
    expect(parsed.success).toBe(false);
  });

  it("refuses an answer with a webhook and no channel, which would have nothing to print", () => {
    expect(SlackAccessSchema.safeParse({ ok: true, incoming_webhook: { url: WEBHOOK, channel: "" } }).success).toBe(
      false,
    );
  });

  it("refuses an answer that is neither of the two shapes", () => {
    expect(SlackAccessSchema.safeParse({ ok: true }).success).toBe(false);
    expect(SlackAccessSchema.safeParse({ ok: false }).success).toBe(false);
    expect(SlackAccessSchema.safeParse({}).success).toBe(false);
  });
});

describe("channelHint", () => {
  it("is the channel by name, which is what the page prints instead of the host and four characters", () => {
    expect(channelHint("#releases")).toBe("#releases");
    expect(channelHint("releases")).toBe("#releases");
  });

  it("never doubles the mark, and leaves a direct message as Slack wrote it", () => {
    expect(channelHint("##releases")).toBe("##releases");
    expect(channelHint("@roberto")).toBe("@roberto");
  });

  it("drops the space a channel name cannot have anyway", () => {
    expect(channelHint("  #releases  ")).toBe("#releases");
  });
});
