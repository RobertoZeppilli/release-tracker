"use client";

import { User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { loginPath } from "@/modules/auth";
import { type Developer, useSession } from "@/modules/auth/ui";
import { NAV, type NavItem } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";

const PANEL_ID = "account-panel";

// The quota sits at the right of the one row the bar has, at every width. It used to come down into
// a 40px strip below 430px, because the wordmark, the sections and the actions did not fit on one
// line there and the bar grew a third row; with the sections out of the bar on a phone the line has
// room to spare, and the quota reads `N followed` under 640px anyway. A quota only ever reaches a
// page behind sign-in.
const QUOTA = "ml-auto flex h-[56px] items-center";

// A line of the panel. On a phone it is a 44px row of the full-screen sheet, with a rule under it;
// in the panel above 640px it is the compact 24px line the bar has room for.
const ITEM =
  "flex min-h-[44px] items-center border-b border-rule px-4 font-mono text-body text-text-muted no-underline hover:bg-sunken hover:text-text sm:min-h-[24px] sm:border-0 sm:px-3 sm:text-label";

const PHONE = "(max-width: 639px)";

// One element in two shapes means the panel always holds the row of the other shape, hidden by the
// breakpoint: above 640px its first `a, button` is the sheet's `Close account`, at `display: none`.
// `.focus()` on something that is not rendered does nothing, so the focus would stay on the trigger
// and the next Tab would land on the theme toggle, which sits in the bar and not in the panel.
function inside(panel: HTMLElement | null): HTMLElement[] {
  const items = [...(panel?.querySelectorAll<HTMLElement>("a, button") ?? [])];
  return items.filter((item) => item.getClientRects().length > 0);
}

// The account panel holds what belongs to the viewer rather than to the page: who is signed in and
// the way out. Below 640px it holds the two destinations as well, because that is where they live on
// a phone (see `SLOT` in `site-header.tsx`): the row in the bar is `display: none` there and these
// rows are `display: none` above it, so the page never has two `dashboard` links and a screen reader
// never meets two copies of the same navigation. The theme toggle stays in the bar: the public pages
// are readable signed out, and a visitor has no panel to find it in.
export function SiteHeaderBar({
  children,
  quota,
  section,
  wide,
}: {
  children: ReactNode;
  quota?: ReactNode;
  section?: NavItem;
  wide?: boolean;
}) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const account = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // A panel over the page closes when the page is used: anything outside it takes the click back.
  // On a phone there is no outside, since the sheet covers the page, and the close button is the way.
  useEffect(() => {
    if (!open) return;
    function onPointerDown({ target }: PointerEvent) {
      if (target instanceof Node && account.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // The sheet covers the page, so the page behind it must not scroll under it and the keyboard must
  // not walk out into what it hides: WCAG 2.2 AA 2.4.11 asks that a focused element is not buried by
  // what the author put over it. Above 640px the panel is not modal and neither applies.
  useEffect(() => {
    if (!open || !window.matchMedia(PHONE).matches) return;
    const was = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = was;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    inside(panel.current)[0]?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    button.current?.focus();
  }

  function keepTabInside(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || !window.matchMedia(PHONE).matches) return;
    const items = inside(panel.current);
    const edge = event.shiftKey ? items[0] : items[items.length - 1];
    if (document.activeElement !== edge) return;
    event.preventDefault();
    (event.shiftKey ? items[items.length - 1] : items[0])?.focus();
  }

  return (
    <div
      ref={account}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) close();
      }}
      // The gap is 12px below 640px and 24px above it. With the sections gone from the line the row
      // is the wordmark, the quota and the actions, and at 320px those three plus two 24px gaps
      // come to within a couple of pixels of the screen: the row cannot wrap any more, so what it
      // would do instead is overflow. 12px leaves it 25px of slack at the narrowest width measured.
      className={`relative mx-auto flex h-[56px] ${wide ? "max-w-wide" : "max-w-content"} items-center gap-x-3 px-4 sm:gap-x-5 sm:px-5`}
    >
      <Link
        href="/"
        className="flex h-[56px] shrink-0 items-center font-mono text-[16px] tracking-[-0.02em] whitespace-nowrap no-underline [font-variant-ligatures:none]"
      >
        {/* DESIGN.md, Brand Mark: `verdict:` with the colon, in `text`, never in a severity ink.
            The colon is the opening of a sentence the app finishes. */}
        verdict:
      </Link>
      {children}
      {quota && <span className={QUOTA}>{quota}</span>}
      <div className={`flex h-[56px] shrink-0 items-center gap-4 whitespace-nowrap ${quota ? "" : "ml-auto"}`}>
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
            className="inline-flex size-[34px] items-center justify-center overflow-hidden rounded-md border border-rule-strong text-text hover:border-text-faint hover:bg-raised"
          >
            <Portrait developer={session} />
            <span className="sr-only">Account{session.handle ? `, signed in as ${session.handle}` : ""}</span>
          </button>
        )}
        <ThemeToggle />
      </div>
      {open && session.state === "developer" && (
        <AccountPanel
          ref={panel}
          developer={session}
          section={section}
          onClose={close}
          onFollow={() => setOpen(false)}
          onTab={keepTabInside}
        />
      )}
    </div>
  );
}

// One element, two shapes. On a phone the account takes the whole screen, with its own row at the
// top carrying who is signed in and the way out of it; above 640px the same lines are the small
// panel hanging from the bar. Two copies in the DOM would mean two `sign out` buttons on the page,
// so the breakpoint does the work and the markup stays single.
function AccountPanel({
  ref,
  developer,
  section,
  onClose,
  onFollow,
  onTab,
}: {
  ref: React.Ref<HTMLDivElement>;
  developer: Developer;
  section?: NavItem;
  onClose: () => void;
  onFollow: () => void;
  onTab: (event: React.KeyboardEvent) => void;
}) {
  return (
    // `sm:right-5` and not `right-0`: the bar is the positioning box and carries `sm:px-5`, so a zero
    // right would align the panel to the box edge and hang 24px past the gutter every other element
    // on the page respects (DESIGN.md, Account panel).
    <div
      ref={ref}
      id={PANEL_ID}
      onKeyDown={onTab}
      className="fixed inset-[0px] z-30 flex flex-col bg-ground sm:absolute sm:inset-auto sm:top-[calc(100%+8px)] sm:right-5 sm:z-20 sm:block sm:min-w-[180px] sm:rounded-md sm:border sm:border-rule sm:bg-raised sm:py-2"
    >
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-rule px-4 sm:hidden">
        <span className="font-mono text-label text-text-faint">{developer.handle ?? "account"}</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-[34px] items-center justify-center rounded-md border border-rule-strong text-text hover:border-text-faint hover:bg-raised"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
          <span className="sr-only">Close account</span>
        </button>
      </div>
      {developer.handle && (
        <p className="mb-1 hidden border-b border-rule px-3 pb-2 font-mono text-meta text-text-faint sm:block">
          {developer.handle}
        </p>
      )}
      {/* The destinations, on a phone and only there: above 640px they are the row in the bar and
          this list is `display: none`, so there is one copy of each link on the page at any width.
          They come first, before the way out, because reaching the other section is what a reader
          opens this for and signing out is what they do once. */}
      <nav aria-label="Sections" className="sm:hidden">
        <ul>
          {NAV.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={onFollow}
                aria-current={item.label === section ? "page" : undefined}
                className={`${ITEM} ${item.label === section ? "text-text" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <form
        action="/auth/sign-out"
        method="post"
        className="mt-auto border-t border-rule sm:mt-1 sm:border-t sm:border-rule sm:pt-1"
      >
        <button type="submit" className={`${ITEM} w-full`}>
          sign out
        </button>
      </form>
    </div>
  );
}

// The picture GitHub has, **filling the button that holds it**, squared like every other shape on
// the page. It used to be a 24px picture with a 1px `rule` of its own inside a 34px bordered button,
// which drew the same square twice, 4px apart, and left the picture floating in the middle of a
// control it did not reach the edges of. The button's border stays, because a border is what
// identifies a button (DESIGN.md, Colors: `rule-strong` carries that duty); what goes is the second
// one. Without a picture the initial stands in, and without a handle either, the neutral mark does:
// both are glyphs inside the control rather than a surface filling it, so they keep the button's
// own padding and draw no square at all.
function Portrait({ developer }: { developer: Developer }) {
  if (developer.avatarUrl) {
    return <Image src={developer.avatarUrl} alt="" width={64} height={64} className="size-full object-cover" />;
  }
  if (developer.handle) {
    return (
      <span aria-hidden className="font-mono text-label">
        {developer.handle.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return <User aria-hidden strokeWidth={1.75} className="size-4" />;
}
