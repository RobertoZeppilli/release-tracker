"use client";

import { Bell, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useSheet } from "@/components/sheet";
import { useTranslator } from "@/modules/i18n/ui";
import { NotificationRow } from "./notification-list";
import { useNotifications } from "./use-notifications";

const PANEL_ID = "notification-panel";

// The largest number the bar can print. The row has 25px of measured slack at 320px with the quota
// in it (`site-header-bar.tsx`), and two glyph widths is what that buys: the exact figure is in the
// button's accessible name and in the panel, which are the two places it can be said in full.
const MOST = 9;

// A line of the panel, the account panel's own measures: 44px on a phone, a 24px line above 640px.
const ITEM =
  "flex min-h-[44px] w-full items-center px-4 font-mono text-body text-text-muted hover:bg-sunken hover:text-text sm:min-h-[24px] sm:px-3 sm:text-label";

// The bell, and the panel that hangs from it. Rendered only for a signed-in Developer: a visitor has
// no Notifications, and a control that opens on nothing is the No Dead End Rule read backwards
// (issue #170). The number is read in the browser, so the public pages stay static (ADR 0009).
export function NotificationBell({ developerId }: { developerId: string }) {
  const t = useTranslator();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { unseen, items, counted, listed, open: load, see, seeEverything } = useNotifications(developerId);

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);
  const { frame, panel, onKeyDown } = useSheet(open, close);

  // The number is not known on the first paint, and a zero would be a guess at the one state that
  // has a word of its own (DESIGN.md, The Reserved Space Rule): until it arrives the bell is the
  // glyph alone and its name says only what it opens.
  function accessibleName(): string {
    if (!counted) return t("notification.open");
    if (unseen === 0) return t("notification.bell.none");
    return t("notification.bell.unseen", { count: unseen });
  }

  return (
    <div ref={frame} onKeyDown={onKeyDown} className="relative flex items-center">
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => {
          load();
          setOpen((was) => !was);
        }}
        className="inline-flex h-[34px] min-w-[34px] items-center justify-center gap-[4px] rounded-md border border-rule-strong px-[6px] text-text-muted hover:border-text-faint hover:bg-raised hover:text-text"
      >
        <Bell aria-hidden strokeWidth={1.75} className="size-4 flex-none" />
        {/* Typography, not a pill: a Mono figure in `text`, the register every count in this app is
            set in (DESIGN.md, The Two Registers Rule). It is `aria-hidden` because the button's own
            name already says the number, in words. */}
        {unseen > 0 && (
          <span aria-hidden className="font-mono text-label leading-[normal] text-text">
            {unseen > MOST ? `${MOST}+` : unseen}
          </span>
        )}
        <span className="sr-only">{accessibleName()}</span>
      </button>
      {open && (
        // ⚠️ `right-[0px]` and not `right-0`: this project turns the default spacing scale off, so
        // Tailwind never generates the inset utilities built from it (DESIGN.md, Layout). The panel
        // hangs from the bell's own right edge, which is what keeps it inside the page's gutter.
        <div
          ref={panel}
          id={PANEL_ID}
          className="fixed inset-[0px] z-30 flex flex-col bg-ground sm:absolute sm:inset-auto sm:top-[calc(100%+8px)] sm:right-[0px] sm:z-20 sm:w-[340px] sm:rounded-md sm:border sm:border-rule sm:bg-raised sm:py-2"
        >
          <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-rule px-4 sm:hidden">
            <span className="font-mono text-label text-text-faint">{t("notification.title")}</span>
            <button
              type="button"
              onClick={close}
              className="inline-flex size-[34px] items-center justify-center rounded-md border border-rule-strong text-text hover:border-text-faint hover:bg-raised"
            >
              <X aria-hidden strokeWidth={1.75} className="size-4" />
              <span className="sr-only">{t("notification.close")}</span>
            </button>
          </div>
          <p className="mb-1 hidden border-b border-rule px-3 pb-2 font-mono text-meta text-text-faint sm:block">
            {t("notification.title")}
          </p>
          {/* Nothing is claimed while the rows are on their way: the empty state is a sentence about
              what the Developer has, and it would be the wrong one for an instant. */}
          <div className="min-h-0 flex-1 overflow-y-auto sm:max-h-[60vh]">
            {listed && items.length === 0 && (
              <p className="px-4 py-3 font-sans text-meta text-text-muted sm:px-3">{t("notification.empty")}</p>
            )}
            {items.length > 0 && (
              <ul>
                {items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onFollow={() => setOpen(false)}
                    onSee={() => see(item.id)}
                    t={t}
                  />
                ))}
              </ul>
            )}
          </div>
          {unseen > 0 && (
            <div className="mt-auto border-t border-rule sm:mt-1 sm:border-t-0 sm:pt-0">
              <button type="button" onClick={seeEverything} className={ITEM}>
                {t("notification.markAll")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
