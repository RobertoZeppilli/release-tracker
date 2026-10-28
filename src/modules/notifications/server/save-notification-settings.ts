"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createRequestClient } from "@/lib/supabase-request";
import { localeSchema } from "@/modules/i18n";
import { NotificationChannelSchema, NotificationEventSchema } from "../domain/events";
import { canSwitch, isExternal } from "../domain/preferences";
import type { LocaleSaved, SwitchSaved } from "../domain/saving";
import { startExternalTrial, writePreference, writePreferredLocale } from "./write-notification-settings";

// ⚠️ **The first Server Actions in this project**, chosen with the user on 2026-10-23 and written
// down in `docs/DECISIONI.md`. Everything else that writes from a page either writes from the
// browser with the Developer's own session (`follows-store`, the bell) or posts a form to a route
// handler (`/auth/delete-account`). A switch is neither: issue #171 asks for a save **from the
// server**, and nine switches that each cost a redirect and a full page would be a page of settings
// that blinks. An action is the one shape that keeps the write on the server and the page still.
//
// What the route handler taught, and is kept here: the identity is read **on the server** from the
// request cookies, never taken from the form, so the row written belongs to whoever is signed in;
// and the form is validated here too, because a form can be posted without the page.
//
// The write goes through the Developer's own client, not the service role: RLS is what binds the
// row to them (`with check (user_id = auth.uid())`), so a crafted post cannot write a preference
// for somebody else even though the id travels in the statement.

// ⚠️ The two controls are **handed** these actions as props by the server component that draws
// them, rather than importing this file: a client component may not import a module's `server`
// folder (ADR 0006, the `no-server-import-in-client` rule), and the shape of the answer is a type in
// `domain/saving` for the same reason.

// ⚠️ The route pattern and not `/settings`: the page lives under `[locale]`, and the address the
// reader sees has no prefix in the default language (ADR 0008). A Server Action revalidates
// nothing by itself, so without this the press writes the row and the page keeps drawing the state
// from before it -- which is what two E2E caught on 2026-10-28.
const SETTINGS_ROUTE = "/[locale]/settings";

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

  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "failed", enabled: previous.enabled };

  try {
    // ⚠️ Switching an external channel **on** is what starts the 30 day trial (ADR 0009), and
    // nothing else does: not signing up, not saving the language. It goes first, so a trial that
    // fails to start leaves the switch off rather than an external channel running outside a trial.
    if (isExternal(parsed.data.channel) && parsed.data.enabled) {
      await startExternalTrial(supabase, data.user.id, new Date());
    }
    await writePreference(supabase, data.user.id, parsed.data);
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

  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "failed", locale: previous.locale };

  try {
    await writePreferredLocale(supabase, data.user.id, parsed.data);
  } catch {
    return { status: "failed", locale: previous.locale };
  }
  return { status: "saved", locale: parsed.data };
}

// The press that starts the thirty days, decided with the user on 2026-10-28: until the Pro plan
// can be bought (#174) something has to open the trial, and Slack is drawn only once it is open.
// ⚠️ No answer and no `useActionState`: it is a plain form in a server component, so what the
// reader sees after it is the page rendered again from the database. A write that fails leaves the
// press where it was, which is the honest state, and the platform log already holds the error.
export async function startProTrial(): Promise<void> {
  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return;
  await startExternalTrial(supabase, data.user.id, new Date());
  revalidatePath(SETTINGS_ROUTE, "page");
}
