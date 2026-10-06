"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { createSessionClient } from "@/lib/supabase-browser";

// What GitHub hands Supabase about the person signing in. Everything in it is optional: the account
// may have no picture, and a Developer seeded by a test has no GitHub behind it at all, so the menu
// is written to stand without either.
const IdentitySchema = z
  .object({
    avatar_url: z.string().url(),
    user_name: z.string().min(1),
    preferred_username: z.string().min(1),
  })
  .partial();

export type Developer = { state: "developer"; developerId: string; handle: string | null; avatarUrl: string | null };

export type Session = { state: "unknown" } | { state: "visitor" } | Developer;

function developer(user: { id: string; user_metadata: unknown }): Developer {
  const identity = IdentitySchema.safeParse(user.user_metadata);
  const metadata = identity.success ? identity.data : {};
  return {
    state: "developer",
    developerId: user.id,
    handle: metadata.user_name ?? metadata.preferred_username ?? null,
    avatarUrl: metadata.avatar_url ?? null,
  };
}

// Read in the browser on purpose: a server read would make every public page dynamic and undo the
// revalidation of the Release and Technology pages. Every render starts at `unknown`, so a component
// waits for the answer instead of guessing which of the two it is talking to.
export function useSession(): Session {
  const [session, setSession] = useState<Session>({ state: "unknown" });

  useEffect(() => {
    const supabase = createSessionClient();
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setSession(data.user ? developer(data.user) : { state: "visitor" });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ? developer(next.user) : { state: "visitor" });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return session;
}
