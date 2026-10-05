"use client";

import { usePathname } from "next/navigation";
import { loginPath } from "../domain/redirect";
import { useSession } from "./use-session";

// Nothing renders until the session is known: a wrong state for an instant would offer the login to
// someone already signed in.
//
// Both targets carry a 24px minimum height (WCAG 2.2 AA 2.5.8): at the Label line height they were
// 20.8px, and sitting in the top bar rather than inside a sentence, neither has the inline-link
// exemption.
export function AuthStatus() {
  const { state } = useSession();
  const pathname = usePathname();

  if (state === "unknown") return null;

  if (state === "visitor") {
    return (
      <a
        href={loginPath(pathname)}
        className="inline-flex min-h-5 items-center font-mono text-label text-text-muted no-underline hover:text-text"
      >
        sign in
      </a>
    );
  }

  return (
    <form action="/auth/sign-out" method="post">
      <button
        type="submit"
        className="inline-flex min-h-5 items-center font-mono text-label text-text-muted hover:text-text"
      >
        sign out
      </button>
    </form>
  );
}
