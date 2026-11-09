import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { anonClient, createDeveloper, type Developer, deleteDeveloper, serviceClient } from "./supabase";

const PERMISSION_DENIED = "42501";
const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

const email = `waitlist-${randomUUID()}@example.test`;
const developers: Developer[] = [];

afterAll(async () => {
  const { error } = await serviceClient().from("waitlist_signups").delete().eq("email", email);
  if (error) throw error;
  for (const developer of developers) await deleteDeveloper(developer);
});

// The Waitlist is the one table of this app that **nobody** reads from a client (ADR 0010): a list
// of email addresses readable from a browser would be the present for whoever collects addresses.
// RLS with no policy would already refuse it; the grants are the second lock, and this is the test
// that says both are in place, because in production only the grants are in the way of a `select`.
describe("the waitlist", () => {
  it("is neither readable nor writable by anon", async () => {
    const anon = anonClient();
    const read = await anon.from("waitlist_signups").select("email");
    expect(read.error?.code).toBe(PERMISSION_DENIED);

    const write = await anon.from("waitlist_signups").insert({ email: `anon-${email}` });
    expect(write.error?.code).toBe(PERMISSION_DENIED);
  });

  it("is neither readable nor writable by a signed in Developer", async () => {
    const developer = await createDeveloper();
    developers.push(developer);

    const read = await developer.client.from("waitlist_signups").select("email");
    expect(read.error?.code).toBe(PERMISSION_DENIED);

    const write = await developer.client.from("waitlist_signups").insert({ email: `dev-${email}` });
    expect(write.error?.code).toBe(PERMISSION_DENIED);
  });

  it("takes one Signup from the service role, and answers the second with a conflict", async () => {
    const db = serviceClient();
    const first = await db.from("waitlist_signups").insert({ email, locale: "it" });
    expect(first.error).toBeNull();

    // What the Server Action reads as `already`: the reader is told the address is on the list, and
    // never shown an error, because asking twice is not a mistake.
    const second = await db.from("waitlist_signups").insert({ email, locale: "en" });
    expect(second.error?.code).toBe(UNIQUE_VIOLATION);
  });

  // The shape is checked in `domain/email` **and** here: a form can be posted without the page, and
  // an address that reached the table unnormalized would be the same address twice.
  it("refuses an address the normalizer would have changed", async () => {
    const db = serviceClient();
    for (const bad of [`UP-${email}`.toUpperCase(), ` ${email} `, "a", "@example.test"]) {
      const { error } = await db.from("waitlist_signups").insert({ email: bad });
      expect(error?.code).toBe(CHECK_VIOLATION);
    }
  });
});
