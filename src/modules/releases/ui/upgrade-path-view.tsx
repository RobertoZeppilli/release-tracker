"use client";

import { useSearchParams } from "next/navigation";
import { useTranslator } from "@/modules/i18n/ui";
import type { ReactNode } from "react";
import type { DefaultStart } from "../domain/default-upgrade-start";
import type { SummarizedRelease } from "../domain/upgrade-path";
import { type PathStart, UpgradePathBlock } from "./upgrade-path";
import { useUpgradeStart } from "./upgrade-start";

type Props = {
  slug: string;
  name: string;
  latest: string;
  retired: boolean;
  releases: SummarizedRelease[];
  // The start the page derived, already drawn on the server: without `?from=` and without a
  // declaration it is what stays on the screen, so the two renders agree.
  fallback: DefaultStart | null;
  // The head of the left column, and the declaration row of the panel: both arrive as elements, so
  // this view passes them through without knowing what either one is.
  head?: ReactNode;
  declaration?: ReactNode;
  children: ReactNode;
};

// `?from=` is a single look and wins over everything, without touching what is saved. Emptied, it is
// how the form asks for the whole history back, so it turns the path off instead of being refused.
function chooseStart(typed: string | null, declared: { version: string; declaredAt: Date } | null, fallback: DefaultStart | null): PathStart {
  if (typed !== null) return typed.trim() === "" ? { kind: "none" } : { kind: "typed", version: typed };
  if (declared) return { kind: "declared", version: declared.version };
  return fallback ? { kind: "default", ...fallback } : { kind: "none" };
}

// Reads `?from` on the client so the Technology page itself stays cached (ISR).
export function UpgradePathView({ slug, name, latest, retired, releases, fallback, head, declaration, children }: Props) {
  const typed = useSearchParams().get("from");
  const start = chooseStart(typed, useUpgradeStart(), fallback);
  // The one place the path reads its own translator: this view is a client component, and the block
  // under it is rendered by the server page too, so it takes `t` as a prop from both sides.
  const t = useTranslator();

  return (
    <UpgradePathBlock
      slug={slug}
      name={name}
      latest={latest}
      retired={retired}
      releases={releases}
      start={start}
      head={head}
      declaration={declaration}
      t={t}
    >
      {children}
    </UpgradePathBlock>
  );
}
