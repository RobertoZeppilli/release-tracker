"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSessionClient } from "@/lib/supabase-browser";
import { loginPath } from "../domain/redirect";

type State = "unknown" | "visitor" | "developer";

// Read in the browser on purpose: a server read would make every public page dynamic and undo the
// revalidation of the Release and Technology pages. Nothing renders until the session is known.
export function AuthStatus() {
  const [state, setState] = useState<State>("unknown");
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createSessionClient();
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setState(data.user ? "developer" : "visitor");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "developer" : "visitor");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (state === "unknown") return null;

  if (state === "visitor") {
    return (
      <a href={loginPath(pathname)} className="font-mono text-label text-text-muted no-underline hover:text-text">
        sign in
      </a>
    );
  }

  return (
    <form action="/auth/sign-out" method="post">
      <button type="submit" className="font-mono text-label text-text-muted hover:text-text">
        sign out
      </button>
    </form>
  );
}
