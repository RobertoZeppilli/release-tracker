"use client";

import { User, X } from "lucide-react";
import Image from "next/image";
import { LocaleLink as Link, useTranslator } from "@/modules/i18n/ui";
import { usePathname } from "next/navigation";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { loginPath } from "@/modules/auth";
import { type Developer, useSession } from "@/modules/auth/ui";
import { NotificationBell } from "@/modules/notifications/ui";
import { useSheet } from "./sheet";
import { NAV, type NavItem } from "./site-nav";
import { SkeletonBox } from "./waiting";
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
}: {
  children: ReactNode;
  quota?: ReactNode;
  section?: NavItem;
}) {
  const session = useSession();
  const t = useTranslator();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);
  // The bar is the frame: a pointer inside it does not close the panel, and the panel hangs from it
  // so it lands on the page's own gutter rather than on the button (DESIGN.md, Account panel).
  const { frame: account, panel, onKeyDown } = useSheet(open, close);

  return (
    <div
      ref={account}
      onKeyDown={onKeyDown}
      // The gap is 12px below 640px and 24px above it. With the sections gone from the line the row
      // is the wordmark, the quota and the actions, and at 320px those three plus two 24px gaps
      // come to within a couple of pixels of the screen: the row cannot wrap any more, so what it
      // would do instead is overflow. 12px leaves it 25px of slack at the narrowest width measured.
      className="relative mx-auto flex h-[56px] max-w-content items-center gap-x-3 px-4 sm:gap-x-5 sm:px-5"
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
      {/* ⚠️ 12px between the actions below 640px and 16px above, measured: with the bell in the row
            the Dashboard at 320px in German overflowed the screen by 7px, and the group's own gaps
            are what the bar had left to give. It is the same step the row outside it already takes
            (`gap-x-3 sm:gap-x-5`). */}
      <div className={`flex h-[56px] shrink-0 items-center gap-3 whitespace-nowrap sm:gap-4 ${quota ? "" : "ml-auto"}`}>
        {/* No answer is offered until the session is known: a wrong state for an instant would put
            the login in front of someone already signed in. What the box does instead of waiting
            empty is wear the shape of what is coming (DESIGN.md, The Waiting Rule, the skeleton).
            The box is the 34px of the Account button and its 6px corners, so what arrives lands on
            the shape that was already there. ⚠️ It is a **filled** block and carries no border of
            its own: the first version drew a `rule` border around a `raised` fill, and on `ground`
            that fill was invisible, so what the user saw for the whole of the wait was an empty
            outline (measured on 2026-10-15, with the fix in `globals.css`).
            ⚠️ The bar does not jump either way: measured in #114 at 1280 and 390, the wordmark, the
            slot and the toggle sit at the same pixels before and after, because this group is
            `ml-auto` and the Account arrives into space that was already empty. */}
        {session.state === "unknown" && <SkeletonBox className="size-[34px] shrink-0 rounded-md" />}
        {session.state === "visitor" && (
          <a
            href={loginPath(pathname)}
            className="inline-flex min-h-5 items-center font-mono text-label text-text-muted no-underline hover:text-text"
          >
            {t("shell.signIn")}
          </a>
        )}
        {/* The bell, for a signed-in Developer only: a visitor has none and nothing is asked for on
            their behalf (issue #170). It stands before the account because it is about the product
            and the account is about the viewer. */}
        {/* ⚠️ `key`: another Developer is another bell. The number and the rows in it belong to the
            session that was allowed to read them, and a key is what says so without the hook
            holding an effect that forgets. */}
        {session.state === "developer" && (
          <NotificationBell key={session.developerId} developerId={session.developerId} />
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
            <span className="sr-only">
              {session.handle ? t("shell.account.openAs", { handle: session.handle }) : t("shell.account.open")}
            </span>
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
}: {
  ref: React.Ref<HTMLDivElement>;
  developer: Developer;
  section?: NavItem;
  onClose: () => void;
  onFollow: () => void;
}) {
  const t = useTranslator();

  return (
    // `sm:right-5` and not `right-0`: the bar is the positioning box and carries `sm:px-5`, so a zero
    // right would align the panel to the box edge and hang 24px past the gutter every other element
    // on the page respects (DESIGN.md, Account panel).
    <div
      ref={ref}
      id={PANEL_ID}
      className="fixed inset-[0px] z-30 flex flex-col bg-ground sm:absolute sm:inset-auto sm:top-[calc(100%+8px)] sm:right-5 sm:z-20 sm:block sm:min-w-[180px] sm:rounded-md sm:border sm:border-rule sm:bg-raised sm:py-2"
    >
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-rule px-4 sm:hidden">
        <span className="font-mono text-label text-text-faint">{developer.handle ?? t("shell.account")}</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-[34px] items-center justify-center rounded-md border border-rule-strong text-text hover:border-text-faint hover:bg-raised"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
          <span className="sr-only">{t("shell.account.close")}</span>
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
      <nav aria-label={t("shell.sections")} className="sm:hidden">
        <ul>
          {NAV.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={onFollow}
                aria-current={item.key === section ? "page" : undefined}
                className={`${ITEM} ${item.key === section ? "text-text" : ""}`}
              >
                {t(item.message)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* The account's own page, the one destination that is not a section of the app: it says what
          this account holds and is the only way to delete it (issue #132). It sits with the way out
          rather than with the sections, because both are about the account and not about the
          product, and above `sign out` because signing out is still the last line of the panel. */}
      {/* The two pages that belong to the viewer and not to the product: what the account is, and
          what the reader has chosen about the app, the language among it (ADR 0008). The picker used
          to stand here with its five names; it is a line now, because the panel cannot grow a row
          per preference and `/settings` is where the next one goes. */}
      {/* ⚠️ `sm:border-t-0`: on a phone this rule separates the two pages from the sections above
          them, and above 640px the sections are `display: none`, so the same rule was drawing a
          line with nothing over it at the top of the panel. What separates them there is the
          handle's own `border-b`, when there is a handle. */}
      <div className="mt-auto border-t border-rule sm:mt-1 sm:border-t-0 sm:pt-0">
        <Link href="/account" onClick={onFollow} className={ITEM}>
          {t("shell.account")}
        </Link>
        <Link href="/settings" onClick={onFollow} className={ITEM}>
          {t("shell.settings")}
        </Link>
      </div>
      <form action="/auth/sign-out" method="post">
        <button type="submit" className={`${ITEM} w-full`}>
          {t("shell.signOut")}
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
