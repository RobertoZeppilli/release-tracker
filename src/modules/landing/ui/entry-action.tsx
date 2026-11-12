"use client";

import { LayoutDashboard } from "lucide-react";
import { LocaleLink as Link, useLocale, useTranslator } from "@/modules/i18n/ui";
import { STATIC_SITE } from "@/lib/static-site";
import { entryFace } from "./entry-copy";

// The landing's action, and the only thing on the page that is a destination rather than a claim.
// It had two faces until the login left (issue #210, ADR 0011): there is one reader of an installed
// copy, so there is one face, and nothing on this page depends on who is looking any more.
export function EntryAction() {
  // ⚠️ The Dashboard is the app's and the showcase has none: the app is installed, not signed into
  // (ADR 0011). What stands here instead is the command to copy, which is issue #221; until then the
  // landing closes on its own words rather than on a button that answers 404 (issue #215).
  if (STATIC_SITE) return null;
  return <DashboardEntry />;
}

function DashboardEntry() {
  const face = entryFace(useLocale(), useTranslator());

  return (
    <Link
      href={face.href}
      className="inline-flex h-[34px] items-center gap-2 rounded-md border border-rule-strong px-3 font-sans text-[14px] font-medium whitespace-nowrap text-text no-underline hover:border-text-faint hover:bg-raised"
    >
      <LayoutDashboard aria-hidden strokeWidth={2} className="size-4" />
      {face.label}
    </Link>
  );
}
