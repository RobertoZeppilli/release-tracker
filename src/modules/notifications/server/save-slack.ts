"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase-server";
import { createRequestClient } from "@/lib/supabase-request";
import { createTranslator, DEFAULT_LOCALE, dictionaryFor, localeSchema } from "@/modules/i18n";
import type { TestSent, WebhookSaved } from "../domain/saving";
import { isSlackWebhook, webhookHint } from "../domain/slack";
import { sendToSlack } from "./send-slack";
import { writeSlackWebhook } from "./write-notification-settings";

// The webhook of `/settings`, in the shape #171 settled for the switches: the identity is read on
// the server from the request cookies and never taken from the form, and the form is validated here
// too, because a form can be posted without the page.
//
// ⚠️ The answer carries the **hint** and never the URL: the Developer writes their webhook and from
// then on reads only where it points (#172, and the read grant that makes it true).
export async function saveSlackWebhook(previous: WebhookSaved, form: FormData): Promise<WebhookSaved> {
  const raw = form.get("webhook");
  if (typeof raw !== "string") return { status: "failed", hint: previous.hint };
  const url = raw.trim();

  // The identity is read on the server from the cookies; the write itself goes through the service
  // role, because the secrets table grants a client nothing (see `writeSlackWebhook`).
  const { data, error } = await (await createRequestClient()).auth.getUser();
  if (error || !data.user) return { status: "failed", hint: previous.hint };
  const service = createServiceClient();

  // An empty field is "remove it", which is the way back out: a Developer who pasted the wrong
  // webhook must not have to find a right one to stop sending to the wrong one.
  if (url === "") {
    try {
      await writeSlackWebhook(service, data.user.id, null);
    } catch {
      return { status: "failed", hint: previous.hint };
    }
    // The page draws things that depend on there being a channel -- the language Slack is written
    // in (#194) -- so the route is revalidated: the answer below moves the hint, not the page.
    revalidatePath("/[locale]/settings", "page");
    return { status: "saved", hint: null };
  }

  // Another host would be this Developer's secret posted to somebody else's server. The database
  // refuses it as well, because this check is not the only door to the row.
  if (!isSlackWebhook(url)) return { status: "failed", hint: previous.hint };

  const hint = webhookHint(url);
  try {
    await writeSlackWebhook(service, data.user.id, { url, hint });
  } catch {
    return { status: "failed", hint: previous.hint };
  }
  revalidatePath("/[locale]/settings", "page");
  return { status: "saved", hint };
}

// The proof of delivery (#172): a wrong webhook is otherwise discovered the day it was needed.
//
// ⚠️ Service role, and it is the one place a page reads a webhook: the Developer's own client cannot
// read `slack_webhook_url` by design, so the row is read for the id that was read **from the
// cookies**, never one named by the form.
// It takes no arguments although `SendTest` is called with two: the previous state and the form say
// nothing here, and a parameter that is read by nobody is a parameter somebody will try to trust.
export async function sendSlackTest(): Promise<TestSent> {
  const supabase = await createRequestClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "failed", error: null };

  const service = createServiceClient();
  const [secret, settings] = await Promise.all([
    service.from("notification_secrets").select("slack_webhook_url").eq("user_id", data.user.id).maybeSingle(),
    service.from("notification_settings").select("preferred_locale").eq("user_id", data.user.id).maybeSingle(),
  ]);
  const webhook = secret.data?.slack_webhook_url;
  if (secret.error || typeof webhook !== "string") return { status: "failed", error: null };

  const locale = localeSchema.safeParse(settings.data?.preferred_locale);
  const t = createTranslator(locale.success ? locale.data : DEFAULT_LOCALE, dictionaryFor(locale.success ? locale.data : DEFAULT_LOCALE));
  const result = await sendToSlack(webhook, t("notification.slack.test"));
  return result.ok ? { status: "sent", error: null } : { status: "failed", error: result.error };
}
