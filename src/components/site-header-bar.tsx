"use client";

import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { loginPath } from "@/modules/auth";
import { type Developer, useSession } from "@/modules/auth/ui";
import { ThemeToggle } from "./theme-toggle";

const PANEL_ID = "account-panel";

// The quota in the bar at 430px and up, in a strip of its own below it under that, where the three
// items did not fit on one line. It carries the strip's rule with it, and it takes the whole width
// so the row forms at 429px rather than wherever the wordmark happens to stop: the sections left the
// strip for the account panel, and without the width the quota would sit in the bar wearing the
// strip's height and rule. A quota only ever reaches a page behind sign-in.
const QUOTA =
  "ml-auto flex h-[56px] items-center max-[429px]:order-3 max-[429px]:ml-0 max-[429px]:h-[40px] max-[429px]:w-full max-[429px]:border-t max-[429px]:border-rule";

const ITEM =
  "flex min-h-[24px] items-center px-3 font-mono text-label text-text-muted no-underline hover:bg-sunken hover:text-text";

// The account panel holds what belongs to the viewer rather than to the page: who is signed in, the
// two destinations, and the way out. The destinations are in it because a public Technology or
// Release page gives the bar's slot to the breadcrumb, and without them a signed-in reader has no
// way back from there. The theme toggle stays in the bar: those pages are readable signed out, and a
// visitor has no panel to find it in.
export function SiteHeaderBar({ children, quota }: { children: ReactNode; quota?: ReactNode }) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const account = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // A panel over the page closes when the page is used: anything outside it takes the click back.
  useEffect(() => {
    if (!open) return;
    function onPointerDown({ target }: PointerEvent) {
      if (target instanceof Node && account.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close() {
    setOpen(false);
    button.current?.focus();
  }

  return (
    <div
      ref={account}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) close();
      }}
      className="relative mx-auto flex max-w-content flex-wrap items-center gap-x-5 px-4 max-[429px]:gap-x-0 sm:h-[56px] sm:flex-nowrap sm:px-5"
    >
      <Link
        href="/"
        className="flex h-[56px] shrink-0 items-center font-mono text-[14px] whitespace-nowrap no-underline [font-variant-ligatures:none]"
      >
        release-tracker
      </Link>
      {children}
      {quota && <span className={QUOTA}>{quota}</span>}
      <div
        className={`flex h-[56px] shrink-0 items-center gap-4 whitespace-nowrap ${quota ? "max-[429px]:ml-auto" : "ml-auto"}`}
      >
        {/* Nothing renders until the session is known: a wrong state for an instant would offer the
            login to someone already signed in. */}
        {session.state === "visitor" && (
          <a
            href={loginPath(pathname)}
            className="inline-flex min-h-5 items-center font-mono text-label text-text-muted no-underline hover:text-text"
          >
            sign in
          </a>
        )}
        {session.state === "developer" && (
          <button
            ref={button}
            type="button"
            aria-expanded={open}
            aria-controls={PANEL_ID}
            onClick={() => setOpen((was) => !was)}
            className="inline-flex size-[34px] items-center justify-center rounded-md border border-rule-strong text-text hover:border-text-faint hover:bg-raised"
          >
            <Portrait developer={session} />
            <span className="sr-only">Account{session.handle ? `, signed in as ${session.handle}` : ""}</span>
          </button>
        )}
        <ThemeToggle />
      </div>
      {open && session.state === "developer" && <AccountPanel developer={session} onLeave={() => setOpen(false)} />}
    </div>
  );
}

function AccountPanel({ developer, onLeave }: { developer: Developer; onLeave: () => void }) {
  return (
    <div
      id={PANEL_ID}
      className="absolute top-[calc(100%+8px)] right-[0px] z-20 min-w-[180px] rounded-md border border-rule bg-raised py-2 max-sm:left-[0px] max-sm:top-[calc(100%+4px)]"
    >
      {developer.handle && (
        <p className="mb-1 border-b border-rule px-3 pb-2 font-mono text-meta text-text-faint">{developer.handle}</p>
      )}
      <Link href="/dashboard" className={ITEM} onClick={onLeave}>
        dashboard
      </Link>
      <Link href="/technologies" className={ITEM} onClick={onLeave}>
        technologies
      </Link>
      <form action="/auth/sign-out" method="post" className="mt-1 border-t border-rule pt-1">
        <button type="submit" className={`${ITEM} w-full`}>
          sign out
        </button>
      </form>
    </div>
  );
}

// The picture GitHub has, at the size of the button that holds it, squared like every other shape on
// the page. Without one the initial stands in, and without a handle either, the neutral mark does.
function Portrait({ developer }: { developer: Developer }) {
  if (developer.avatarUrl) {
    return (
      <Image src={developer.avatarUrl} alt="" width={24} height={24} className="size-[24px] rounded-[4px] border border-rule" />
    );
  }
  if (developer.handle) {
    return (
      <span aria-hidden className="flex size-[24px] items-center justify-center rounded-[4px] border border-rule font-mono text-meta">
        {developer.handle.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return <User aria-hidden strokeWidth={1.75} className="size-4" />;
}
