"use client";

import { LayoutDashboard, LogIn } from "lucide-react";
import { LocaleLink as Link, useLocale, useTranslator } from "@/modules/i18n/ui";
import { useSession } from "@/modules/auth/ui";
import { STATIC_SITE } from "@/lib/static-site";
import { AUDIENCES, type Audience, audienceFor, entryFaces } from "./entry-copy";

// The glyphs the rest of the app already uses for the two destinations: `LogIn` is the login page's
// own button, and this icon set has no GitHub mark, so the word carries the provider.
const ICONS = { visitor: LogIn, developer: LayoutDashboard } as const satisfies Record<Audience, unknown>;

// One of the landing's two actions, and the only element of the page that depends on who is reading
// it. Both faces are in the markup, stacked in one grid cell: the face that is not the reader's is
// `visibility: hidden`, so it holds the width without being read aloud or reached by the keyboard.
export function EntryAction() {
  // ⚠️ Both faces lead where the showcase has nothing: the login and the Dashboard are the app's,
  // and the app is installed and not signed into (ADR 0011). What stands here instead is the command
  // to copy, which is issue #221: until then the landing closes on its own words rather than on a
  // button that answers 404 (issue #215).
  if (STATIC_SITE) return null;
  return <SessionEntryAction />;
}

function SessionEntryAction() {
  const audience = audienceFor(useSession().state);
  const faces = entryFaces(useLocale(), useTranslator());

  return (
    <Link
      href={faces[audience].href}
      className="inline-grid h-[34px] items-center rounded-md border border-rule-strong px-3 font-sans text-[14px] font-medium whitespace-nowrap text-text no-underline hover:border-text-faint hover:bg-raised"
    >
      {AUDIENCES.map((who) => {
        const Icon = ICONS[who];
        return (
          <span
            key={who}
            className={`col-start-1 row-start-1 inline-flex items-center gap-2 ${who === audience ? "" : "invisible"}`}
          >
            <Icon aria-hidden strokeWidth={2} className="size-4" />
            {faces[who].label}
          </span>
        );
      })}
    </Link>
  );
}
