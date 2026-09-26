"use client";

import { z } from "zod";
import { createSessionClient } from "@/lib/supabase-browser";

// Follows are the one thing a Developer writes, and RLS limits every row to `user_id = auth.uid()`:
// the browser talks to the database directly, so a rejection (issue #18) arrives as it is.
export const FOLLOWS_KEY = ["follows"] as const;

const FollowRowSchema = z.object({ technology_id: z.uuid() });

export async function fetchFollows(): Promise<string[]> {
  const { data, error } = await createSessionClient().from("follows").select("technology_id");
  if (error) throw new Error(error.message);
  return z.array(FollowRowSchema).parse(data).map((row) => row.technology_id);
}

export async function writeFollow(
  developerId: string,
  technologyId: string,
  follow: boolean,
): Promise<void> {
  const follows = createSessionClient().from("follows");
  const { error } = follow
    ? await follows.insert({ user_id: developerId, technology_id: technologyId })
    : await follows.delete().eq("technology_id", technologyId);
  if (error) throw new Error(error.message);
}
