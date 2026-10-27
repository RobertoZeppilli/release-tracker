import { z } from "zod";
import { isSlackWebhook } from "./slack";

// "Add to Slack" (#188): Verdict owns the Slack app, so the Developer creates nothing and never
// sees a URL. The scope is the one that matters here and nothing else: `incoming-webhook` is what
// makes Slack show the **channel picker** on the consent screen, and the URL it hands back is the
// same one that used to be pasted by hand, so `deliverSlack` and the schema do not change.
export const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
export const SLACK_ACCESS_URL = "https://slack.com/api/oauth.v2.access";
export const SLACK_SCOPE = "incoming-webhook";

export function authorizeUrl({
  clientId,
  redirectUri,
  state,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(SLACK_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", SLACK_SCOPE);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

// What `oauth.v2.access` answers. Slack reports a failure with HTTP 200 and `ok: false`, so the
// status code is not the answer and the body has to be read either way.
//
// ⚠️ `channel_id` appears in the SDK but not in every example of the documentation, so it is
// optional; `channel` carries the name and is what `/settings` then prints. The URL is checked
// against the one host it may have, the same check the manual field and the database already make.
export const SlackAccessSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    incoming_webhook: z.object({
      url: z.string().refine(isSlackWebhook),
      channel: z.string().min(1),
      channel_id: z.string().min(1).optional(),
    }),
  }),
  z.object({ ok: z.literal(false), error: z.string().min(1) }),
]);

export type SlackAccess = z.infer<typeof SlackAccessSchema>;

// The hint of a webhook that arrived by OAuth is the **channel name**, because Slack told us what it
// is: "Sending to #releases" instead of `hooks.slack.com/…4321`, which was all the pasted URL could
// say about itself (#172). Slack writes the name with its `#` already, but not for a direct message,
// so the mark is added only when it is missing and never doubled.
export function channelHint(channel: string): string {
  const name = channel.trim();
  return name.startsWith("#") || name.startsWith("@") ? name : `#${name}`;
}
