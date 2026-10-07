"use client";

import { useSearchParams } from "next/navigation";
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
export function UpgradePathView({ slug, name, latest, retired, releases, fallback, declaration, children }: Props) {
  const typed = useSearchParams().get("from");
  const start = chooseStart(typed, useUpgradeStart(), fallback);

  return (
    <UpgradePathBlock
      slug={slug}
      name={name}
      latest={latest}
      retired={retired}
      releases={releases}
      start={start}
      declaration={declaration}
    >
      {children}
    </UpgradePathBlock>
  );
}
