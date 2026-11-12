"use server";

import { z } from "zod";
import { createRequestClient } from "@/lib/supabase-request";
import { localeSchema } from "@/modules/i18n";
import { NotificationChannelSchema, NotificationEventSchema } from "../domain/events";
import { canSwitch } from "../domain/preferences";
import type { LocaleSaved, SwitchSaved } from "../domain/saving";
import { writePreference, writePreferredLocale } from "./write-notification-settings";

// ⚠️ **The first Server Actions in this project**, chosen with the user on 2026-10-23 and written
// down in `docs/DECISIONI.md`. Everything else that writes from a page writes from the browser
// (`follows-store`, the bell). A switch is neither: issue #171 asks for a save **from the server**,
// and nine switches that each cost a redirect and a full page would be a page of settings that
// blinks. An action is the one shape that keeps the write on the server and the page still.
//
// The form is still validated here, because a form can be posted without the page. What is no
// longer validated is who is asking: there is nobody to be (issue #210, ADR 0011), so the action
// reads no identity and the statement carries none.

// ⚠️ The two controls are **handed** these actions as props by the server component that draws
// them, rather than importing this file: a client component may not import a module's `server`
// folder (ADR 0006, the `no-server-import-in-client` rule), and the shape of the answer is a type in
// `domain/saving` for the same reason.

const SwitchSchema = z.object({
  event: NotificationEventSchema,
  channel: NotificationChannelSchema,
  // The state the press asks for, and not "flip what you find": two presses racing would otherwise
  // settle on whichever arrived last having read whichever arrived first.
  enabled: z.enum(["true", "false"]).transform((asked) => asked === "true"),
});

export async function savePreference(previous: SwitchSaved, form: FormData): Promise<SwitchSaved> {
  const parsed = SwitchSchema.safeParse({
    event: form.get("event"),
    channel: form.get("channel"),
    enabled: form.get("enabled"),
  });
  // A channel that sends nothing yet cannot be switched on from a crafted post either: `canSwitch`
  // is the same rule the page draws itself from (#172 and #173 widen it).
  if (!parsed.success || !canSwitch(parsed.data.event, parsed.data.channel)) {
    return { status: "failed", enabled: previous.enabled };
  }

  try {
    await writePreference(await createRequestClient(), parsed.data);
  } catch {
    // The reason is not shown to the reader: what they can do about it is press again, and the line
    // that says so is in the dictionary (`settings.notifications.error`). Nothing is logged here
    // either, because a failed write is already an error in the platform's log.
    return { status: "failed", enabled: previous.enabled };
  }
  return { status: "saved", enabled: parsed.data.enabled };
}

export async function savePreferredLocale(previous: LocaleSaved, form: FormData): Promise<LocaleSaved> {
  const parsed = localeSchema.safeParse(form.get("locale"));
  if (!parsed.success) return { status: "failed", locale: previous.locale };

  try {
    await writePreferredLocale(await createRequestClient(), parsed.data);
  } catch {
    return { status: "failed", locale: previous.locale };
  }
  return { status: "saved", locale: parsed.data };
}
