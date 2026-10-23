"use client";

import { z } from "zod";
import { createSessionClient } from "@/lib/supabase-browser";
import { type FeedItem } from "../domain/feed";

// How many the panel holds. The number on the bell counts every unseen Notification, so a Developer
// with more than this reads the latest here and clears the rest with one press (see `seeAll`).
export const PAGE = 20;

// The bell lists the two Release events and counts the same two. The weekly Digest is a row of the
// same table (ADR 0009) and arrives with #173, which is what gives it a line to be printed on: a
// number that counted it before then would stand over a panel that could not show it.
const SHOWN = ["featured_release", "notable_release"] as const;

const RowSchema = z.object({
  id: z.uuid(),
  event: z.enum(SHOWN),
  created_at: z.iso.datetime({ offset: true }),
  seen_at: z.iso.datetime({ offset: true }).nullable(),
  // Shares the Release's primary key, so PostgREST embeds one object and not an array. A Release
  // event always has a Release, and that Release always has a Technology.
  releases: z.object({ version: z.string(), technologies: z.object({ name: z.string(), slug: z.string() }) }),
});

const COLUMNS = "id, event, created_at, seen_at, releases (version, technologies (name, slug))";

// Read in the browser, as the session is (`useSession`): a server read would make every public page
// dynamic and the bell lives in the bar of all of them, so the counter would be what bought the ISR
// back (ADR 0009, and the same reasoning `docs/DECISIONI.md` applied to the theme cookie). RLS keeps
// the rows to the Developer asking, and `seen_at` is the one column a client may write.
export async function fetchUnseen(): Promise<number> {
  const { count, error } = await createSessionClient()
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .in("event", SHOWN)
    .is("seen_at", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function fetchFeed(): Promise<FeedItem[]> {
  const { data, error } = await createSessionClient()
    .from("notifications")
    .select(COLUMNS)
    .in("event", SHOWN)
    .order("created_at", { ascending: false })
    .limit(PAGE);
  if (error) throw new Error(error.message);
  return z
    .array(RowSchema)
    .parse(data)
    .map((row) => ({
      id: row.id,
      event: row.event,
      technologyName: row.releases.technologies.name,
      slug: row.releases.technologies.slug,
      version: row.releases.version,
      createdAt: new Date(row.created_at),
      seen: row.seen_at !== null,
    }));
}

// `is("seen_at", null)` on both writes, so the day a Notification was first Seen is never rewritten
// by a second press: `seen_at` is the only column the grant allows, and it is allowed once.
export async function writeSeen(id: string): Promise<void> {
  const { error } = await createSessionClient()
    .from("notifications")
    .update({ seen_at: new Date().toISOString() })
    .eq("id", id)
    .is("seen_at", null);
  if (error) throw new Error(error.message);
}

// Every unseen row of the Developer, not only the page the panel holds: RLS is what bounds the
// statement to their own, so the number the bell shows is the number this clears.
export async function writeAllSeen(): Promise<void> {
  const { error } = await createSessionClient()
    .from("notifications")
    .update({ seen_at: new Date().toISOString() })
    .in("event", SHOWN)
    .is("seen_at", null);
  if (error) throw new Error(error.message);
}
