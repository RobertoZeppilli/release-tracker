"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase-server";
import { DEFAULT_LOCALE, localeSchema } from "@/modules/i18n";
import { type Attempts, forgetOld, recordAttempt } from "../domain/attempts";
import { normalizeEmail } from "../domain/email";
import { EMAIL_FIELD, type Joined, LOCALE_FIELD, TRAP_FIELD } from "../domain/joining";

// Postgres: a unique violation, which here means the address is already on the list.
const UNIQUE_VIOLATION = "23505";

// The attempts of this process, which is all the rate limiting there is until the #176 decides about
// Redis (ADR 0010). It is a module level map on purpose: a Server Action is a function, and the only
// place to keep anything between two calls of it is the module around it. One instance counts what
// reached that instance, and the unique index counts the rest.
const attempts: Attempts = new Map();

// Joining the Waitlist: the one write a Visitor can make in this whole app, so it is also the one
// that has to assume the worst. In order, and the order is the point:
//
// 1. the trap field, which a person leaves empty and a robot fills. A filled trap is answered with
//    `joined`, because a robot told "no" comes back and a robot told "yes" is done;
// 2. the address, normalized and judged in `domain`: a form can be posted without the page, so the
//    field is never trusted and the database holds the same shape as a check;
// 3. the limit per caller, before the write and not after it;
// 4. the insert with the service role, because no client is granted anything on that table.
//
// ⚠️ Nothing is sent to the address, now or on confirmation: the one message goes out on the day of
// the launch (#173). So there is nothing here to abuse into sending mail to somebody else.
export async function joinWaitlist(_previous: Joined, form: FormData): Promise<Joined> {
  const trap = form.get(TRAP_FIELD);
  if (typeof trap === "string" && trap.trim() !== "") return { status: "joined" };

  const email = normalizeEmail(form.get(EMAIL_FIELD));
  if (email === null) return { status: "invalid" };

  const now = Date.now();
  forgetOld(attempts, now);
  if (!recordAttempt(attempts, await callerKey(), now)) return { status: "failed" };

  // The language the landing was being read in, stated by the form because an action cannot read a
  // root parameter (`domain/joining`). Anything else than one of the five reads as English.
  const locale = localeSchema.safeParse(form.get(LOCALE_FIELD));

  const { error } = await createServiceClient()
    .from("waitlist_signups")
    .insert({
      email,
      locale: locale.success ? locale.data : DEFAULT_LOCALE,
      // One page collects addresses today. The column is written anyway, so the question "where do
      // they come from" does not need a deploy the day it is asked.
      source: "landing",
    });

  if (error === null) return { status: "joined" };
  // Already there is not an error to show: the address is on the list, which is what was wanted.
  return error.code === UNIQUE_VIOLATION ? { status: "already" } : { status: "failed" };
}

// Who is knocking, as far as a request behind a proxy can say: the first hop of
// `x-forwarded-for`, which is what Vercel puts the client address in. Absent, every caller counts as
// one key, which is the strict reading rather than the loose one.
async function callerKey(): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first === undefined || first === "" ? "unknown" : first;
}
