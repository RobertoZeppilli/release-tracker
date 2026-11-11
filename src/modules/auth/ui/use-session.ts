"use client";

import { useEffect, useState } from "react";
import { STATIC_SITE } from "@/lib/static-site";
import { createSessionClient } from "@/lib/supabase-browser";
import { identityFrom } from "../domain/identity";

export type Developer = { state: "developer"; developerId: string; handle: string | null; avatarUrl: string | null };

export type Session = { state: "unknown" } | { state: "visitor" } | Developer;

function developer(user: { id: string; user_metadata: unknown }): Developer {
  return { state: "developer", developerId: user.id, ...identityFrom(user.user_metadata) };
}

// Read in the browser on purpose: a server read would make every public page dynamic and undo the
// revalidation of the Release and Technology pages. Every render starts at `unknown`, so a component
// waits for the answer instead of guessing which of the two it is talking to.
// ⚠️ On the showcase there is nobody to read: it has no login and no account (ADR 0011), so the
// answer is `visitor` from the first paint. Not an optimisation of the wait but the removal of it:
// starting at `unknown` would show every component's reserved box for the length of a round trip to
// Supabase, asking who is signed in on a site where nobody can be (issue #215).
export function useSession(): Session {
  const [session, setSession] = useState<Session>(STATIC_SITE ? { state: "visitor" } : { state: "unknown" });

  useEffect(() => {
    if (STATIC_SITE) return;
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
