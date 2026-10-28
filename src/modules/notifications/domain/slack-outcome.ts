import { z } from "zod";
import type { MessageKey } from "@/modules/i18n";

// What the Slack callback is allowed to have put in the address, and the sentence each outcome reads
// as (#188). Anything else prints nothing at all: the address is the reader's to edit, so a value
// that is not one of these is not a state of the product.
//
// Domain and not UI since #199: the component that draws the press became a client component, and
// the page that reads `?slack=` is a server one. A pure function of a string belongs here anyway.
const OutcomeSchema = z.enum(["connected", "cancelled", "failed", "denied", "unavailable"]);

const OUTCOMES: Readonly<Record<z.infer<typeof OutcomeSchema>, MessageKey>> = {
  connected: "settings.notifications.slack.result.connected",
  cancelled: "settings.notifications.slack.result.cancelled",
  failed: "settings.notifications.slack.result.failed",
  denied: "settings.notifications.slack.result.denied",
  unavailable: "settings.notifications.slack.result.unavailable",
};

export function slackOutcomeKey(raw: string | null | undefined): MessageKey | null {
  const parsed = OutcomeSchema.safeParse(raw);
  return parsed.success ? OUTCOMES[parsed.data] : null;
}
