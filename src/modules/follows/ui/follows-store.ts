"use client";

import { z } from "zod";
import { createSessionClient } from "@/lib/supabase-browser";
import {
  type CurrentVersion,
  CurrentVersionRejectedError,
  declineFor,
  type Follow,
} from "../domain/current-version";
import { FollowRejectedError, followRejectionFor } from "../domain/follow-rejection";

// Follows are the one thing a Developer writes, and the browser talks to the database directly, so
// a rejection (issue #18) arrives as it is. No row carries whose it is any more: an installed copy
// belongs to one person, so every follow in the table is theirs (issue #210, ADR 0011).
export const FOLLOWS_KEY = ["follows"] as const;

const DeclarationSchema = z.object({
  current_version: z.string().nullable(),
  current_version_declared_at: z.iso.datetime({ offset: true }).nullable(),
});

const FollowRowSchema = DeclarationSchema.extend({ technology_id: z.uuid() });

const COLUMNS = "technology_id, current_version, current_version_declared_at";

// The database keeps the two columns together (a check constraint says so), so one being set is
// enough to read the pair.
function declarationOf(row: z.infer<typeof DeclarationSchema>): CurrentVersion | null {
  return row.current_version && row.current_version_declared_at
    ? { version: row.current_version, declaredAt: new Date(row.current_version_declared_at) }
    : null;
}

// Unpaged, as `readFollows` is: the table holds one person's follows, bounded by the Catalog, which
// is sixty Technologies (issue #190).
export async function fetchFollows(): Promise<Follow[]> {
  const { data, error } = await createSessionClient().from("follows").select(COLUMNS);
  if (error) throw new Error(error.message);
  return z
    .array(FollowRowSchema)
    .parse(data)
    .map((row) => ({ technologyId: row.technology_id, currentVersion: declarationOf(row) }));
}

export async function writeFollow(technologyId: string, follow: boolean): Promise<void> {
  const follows = createSessionClient().from("follows");
  const { error } = follow
    ? await follows.insert({ technology_id: technologyId })
    : await follows.delete().eq("technology_id", technologyId);
  // The code carries which rule the database refused; the message is for the console, not the page.
  if (error) throw new FollowRejectedError(followRejectionFor(error.code), error.message);
}

// Several follows in one statement, which is what makes a refusal a fact about the group: the
// trigger runs for each row, so one retired Technology raises inside the statement and Postgres
// takes the whole insert back. Nothing is followed halfway, and the browser gets the one SQLSTATE.
export async function writeFollows(technologyIds: string[]): Promise<void> {
  const { error } = await createSessionClient()
    .from("follows")
    .insert(technologyIds.map((technologyId) => ({ technology_id: technologyId })));
  if (error) throw new FollowRejectedError(followRejectionFor(error.code), error.message);
}

// `null` takes the declaration away. The row comes back because the day it was declared is written
// by the database, not by the browser: only an answer can say when the declaration now stands from.
export async function writeCurrentVersion(
  technologyId: string,
  version: string | null,
): Promise<CurrentVersion | null> {
  const { data, error } = await createSessionClient()
    .from("follows")
    .update({ current_version: version })
    .eq("technology_id", technologyId)
    .select("current_version, current_version_declared_at")
    .single();
  if (error) throw new CurrentVersionRejectedError(declineFor(error.code), error.message);
  return declarationOf(DeclarationSchema.parse(data));
}
