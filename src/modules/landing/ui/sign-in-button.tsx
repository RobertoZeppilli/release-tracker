import { LogIn } from "lucide-react";
import Link from "next/link";
import { loginPath } from "@/modules/auth";

// One of the landing's two actions. `next` is the Dashboard and not `/`: a visitor who signs in from
// here is asking for the thing sign-in gets them. The glyph is `LogIn`, the one the login page
// already uses for the same button; this icon set has no GitHub mark, and the word carries the
// provider.
export function SignInButton() {
  return (
    <Link
      href={loginPath(null)}
      className="inline-flex h-[34px] items-center gap-2 rounded-md border border-rule-strong px-3 font-sans text-[14px] font-medium whitespace-nowrap text-text no-underline hover:border-text-faint hover:bg-raised"
    >
      <LogIn aria-hidden strokeWidth={2} className="size-4" />
      Sign in with GitHub
    </Link>
  );
}
