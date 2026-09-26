"use client";

import Link from "next/link";
import type { PickerTechnology } from "../domain/picker";
import { FollowToggle } from "./follow-toggle";

// Name | facts | toggle, between 1px rules. Under 640px the facts drop to a second line and the
// toggle keeps the right edge, spanning both.
const ROW =
  "grid grid-cols-[16ch_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-rule py-3 first:border-t max-[640px]:grid-cols-[minmax(0,1fr)_auto] max-[640px]:gap-y-[2px]";

export function PickerRow({ technology, hidden }: { technology: PickerTechnology; hidden: boolean }) {
  const version = technology.latest;

  return (
    <li className={ROW} hidden={hidden}>
      <Link
        href={`/technologies/${technology.slug}`}
        className="font-sans text-body leading-[1.45] font-semibold tracking-[-0.01em] text-text no-underline hover:underline hover:decoration-current"
      >
        {technology.name}
      </Link>
      <span className="font-mono text-label leading-[1.6] text-text-faint tabular-nums max-[640px]:col-start-1 max-[640px]:row-start-2">
        {version && (
          <>
            {technology.retired ? "last" : "latest"} <span className="text-text-muted">{version}</span> ·{" "}
          </>
        )}
        {technology.description}
        {technology.retired && " · retired"}
      </span>
      <span className="max-[640px]:col-start-2 max-[640px]:row-span-2 max-[640px]:row-start-1 max-[640px]:self-center">
        <FollowToggle technologyId={technology.id} name={technology.name} />
      </span>
    </li>
  );
}
