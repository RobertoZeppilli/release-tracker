"use client";

import { Menu, X } from "lucide-react";
import { LocaleLink as Link, useTranslator } from "@/modules/i18n/ui";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { STATIC_SITE } from "@/lib/static-site";
import { NotificationBell } from "@/modules/notifications/ui";
import { useSheet } from "./sheet";
import { NAV, type NavItem } from "./site-nav";
import { ThemeToggle } from "./theme-toggle";

const PANEL_ID = "menu-panel";

// A line of the panel: a 44px row of the full-screen sheet, with a rule under it.
const ITEM =
  "flex min-h-[44px] items-center border-b border-rule px-4 font-mono text-body text-text-muted no-underline hover:bg-sunken hover:text-text";

// The one row the bar is, at every width, and the wordmark that opens it. Both shapes of the bar
// read them from here, so the showcase cannot drift a pixel from the app (DESIGN.md, Layout).
const ROW =
  "relative mx-auto flex h-[56px] max-w-content items-center gap-x-3 px-4 sm:gap-x-5 sm:px-5";
const WORDMARK =
  "flex h-[56px] shrink-0 items-center font-mono text-[16px] tracking-[-0.02em] whitespace-nowrap no-underline [font-variant-ligatures:none]";
const ACTIONS = "flex h-[56px] shrink-0 items-center gap-3 whitespace-nowrap sm:gap-4";
const CONTROL =
  "inline-flex size-[34px] items-center justify-center rounded-md border border-rule-strong text-text hover:border-text-faint hover:bg-raised";

// DESIGN.md, Brand Mark: `verdict:` with the colon, in `text`, never in a severity ink. The colon is
// the opening of a sentence the app finishes.
function Wordmark() {
  return (
    <Link href="/" className={WORDMARK}>
      verdict:
    </Link>
  );
}

// The two bars this repository builds (issue #215). `STATIC_SITE` is a build constant, so the branch
// is settled before the browser sees it and the half that is not taken is dropped from the bundle;
// each half holds its own hooks, unconditionally.
export function SiteHeaderBar(props: BarProps) {
  return STATIC_SITE ? <ShowcaseBar /> : <AppBar {...props} />;
}

// The showcase keeps the wordmark and the theme toggle, and nothing else that was in the bar.
// ⚠️ Not a tidying-up: on a site that is only files `/dashboard`, `/technologies` and `/settings` do
// not exist, so the sections row and the menu would each be a 404 in the top bar of every page.
function ShowcaseBar() {
  return (
    <div className={ROW}>
      <Wordmark />
      <div className={`${ACTIONS} ml-auto`}>
        <ThemeToggle />
      </div>
    </div>
  );
}

type BarProps = { children: ReactNode; section?: NavItem };

// The bar of the installed app. Since the login left (issue #210, ADR 0011) nobody has to be
// identified to read it: the bell, the settings and both sections are there from the first paint,
// and the skeleton that used to hold the Account button's place while the session was read is gone
// with the wait it covered.
//
// Below 640px the panel holds the two destinations, because that is where they live on a phone (see
// `SLOT` in `site-header.tsx`): the row in the bar is `display: none` there and these rows are
// `display: none` above it, so the page never has two `dashboard` links and a screen reader never
// meets two copies of the same navigation. Above 640px `settings` is a word in the bar instead, in
// the place the sign-in used to hold, and there is no panel at all: a menu that held one line would
// be a press to reach a link that fits.
function AppBar({ children, section }: BarProps) {
  const t = useTranslator();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);
  // The bar is the frame: a pointer inside it does not close the panel, and the panel hangs from it
  // so it lands on the page's own gutter rather than on the button (DESIGN.md, Account panel).
  const { frame, panel, onKeyDown } = useSheet(open, close);

  return (
    <div
      ref={frame}
      onKeyDown={onKeyDown}
      // The gap is 12px below 640px and 24px above it. It was measured when the row still carried
      // the quota between the wordmark and the actions, where three items plus two 24px gaps came
      // to within a couple of pixels of a 320px screen: the row cannot wrap, so what it would do
      // instead is overflow. The quota left with the Plan (issue #209) and the measure stays, now
      // with more slack than the 25px it was chosen for.
      className={ROW}
    >
      <Wordmark />
      {children}
      {/* ⚠️ 12px between the actions below 640px and 16px above, measured: with the bell in the row
            the Dashboard at 320px in German overflowed the screen by 7px, and the group's own gaps
            are what the bar had left to give. It is the same step the row outside it already takes
            (`gap-x-3 sm:gap-x-5`). */}
      <div className={`${ACTIONS} ml-auto`}>
        <NotificationBell />
        <Link
          href="/settings"
          className="inline-flex min-h-5 items-center font-mono text-label text-text-muted no-underline hover:text-text max-sm:hidden"
        >
          {t("shell.settings")}
        </Link>
        <button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={() => setOpen((was) => !was)}
          className={`${CONTROL} sm:hidden`}
        >
          <Menu aria-hidden strokeWidth={1.75} className="size-4" />
          <span className="sr-only">{t("shell.menu.open")}</span>
        </button>
        <ThemeToggle />
      </div>
      {open && (
        <MenuPanel ref={panel} section={section} onClose={close} onFollow={() => setOpen(false)} />
      )}
    </div>
  );
}

// The phone's menu: the two sections and the settings, over the whole screen, with its own row at
// the top to close it. It exists below 640px only, which is why it has one shape and not two: above
// that width the sections are a row in the bar and the settings a word beside the bell, so there is
// nothing left for a panel to hold.
function MenuPanel({
  ref,
  section,
  onClose,
  onFollow,
}: {
  ref: React.Ref<HTMLDivElement>;
  section?: NavItem;
  onClose: () => void;
  onFollow: () => void;
}) {
  const t = useTranslator();

  return (
    <div ref={ref} id={PANEL_ID} className="fixed inset-[0px] z-30 flex flex-col bg-ground sm:hidden">
      <div className="flex h-[56px] shrink-0 items-center justify-end border-b border-rule px-4">
        <button type="button" onClick={onClose} className={CONTROL}>
          <X aria-hidden strokeWidth={1.75} className="size-4" />
          <span className="sr-only">{t("shell.menu.close")}</span>
        </button>
      </div>
      <nav aria-label={t("shell.sections")}>
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
      {/* What the reader has chosen about the app, the language among it (ADR 0008). It sits apart
          from the sections because it is about the app and not about the product, and it is the
          last line for the same reason signing out used to be. */}
      <div className="mt-auto border-t border-rule">
        <Link href="/settings" onClick={onFollow} className={ITEM}>
          {t("shell.settings")}
        </Link>
      </div>
    </div>
  );
}
