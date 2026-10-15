"use client";

import { LayoutDashboard, LogIn } from "lucide-react";
import { LocaleLink as Link, useLocale } from "@/modules/i18n/ui";
import { useSession } from "@/modules/auth/ui";
import { AUDIENCES, type Audience, audienceFor, entryFaces } from "./entry-copy";

// The glyphs the rest of the app already uses for the two destinations: `LogIn` is the login page's
// own button, and this icon set has no GitHub mark, so the word carries the provider.
const ICONS = { visitor: LogIn, developer: LayoutDashboard } as const satisfies Record<Audience, unknown>;

// One of the landing's two actions, and the only element of the page that depends on who is reading
// it. Both faces are in the markup, stacked in one grid cell: the face that is not the reader's is
// `visibility: hidden`, so it holds the width without being read aloud or reached by the keyboard.
export function EntryAction() {
  const audience = audienceFor(useSession().state);
  const faces = entryFaces(useLocale());

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
