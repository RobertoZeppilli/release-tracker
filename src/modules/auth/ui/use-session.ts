"use client";

import { useEffect, useState } from "react";
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
