"use client";

import Link from "next/link";
import type { PickerSections, PickerTechnology } from "../domain/picker";
import { FollowRejectionNote } from "./follow-rejection-note";
import { FollowToggle } from "./follow-toggle";
import { useFollows } from "./follows-provider";
import { RowStatusLine } from "./row-status-line";

// Name | facts | toggle, between 1px rules. Under 640px the facts drop to a second line and the
// toggle keeps the right edge, spanning both.
const ROW =
  "grid grid-cols-[16ch_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-rule py-3 first:border-t max-[640px]:grid-cols-[minmax(0,1fr)_auto] max-[640px]:gap-y-[2px]";

export function PickerRow({
  technology,
  section,
  hidden,
}: {
  technology: PickerTechnology;
  section: keyof PickerSections | null;
  hidden: boolean;
}) {
  const follows = useFollows();
  const version = technology.latest;
  const rejection = follows.rejectionOn(technology.id);
  const errorId = `err-${technology.slug}`;
  // A retired Technology is only here because it is followed: letting it go is the last thing that
  // can happen to it, so the toggle leaves instead of offering a follow the database would refuse.
  const gone = technology.retired && !follows.isFollowing(technology.id);
  // The row keeps its place for the whole visit, so when a toggle sends it to another section the
  // row has to say so itself: the counts above have already moved without it.
  const moved = movedNote(section, follows.isFollowing(technology.id));

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
        {gone ? (
          <span
            role="status"
            className="font-mono text-label leading-[1.6] whitespace-nowrap text-text-muted max-[640px]:block max-[640px]:max-w-[16ch] max-[640px]:text-right max-[640px]:whitespace-normal"
          >
            unfollowed · can&apos;t be followed again
          </span>
        ) : (
          <FollowToggle
            technologyId={technology.id}
            name={technology.name}
            errorId={rejection ? errorId : undefined}
          />
        )}
      </span>
      {rejection ? (
        <FollowRejectionNote id={errorId} rejection={rejection} className={STATUS_LINE} />
      ) : (
        moved && (
          <RowStatusLine tone="note" className={STATUS_LINE}>
            {moved}
          </RowStatusLine>
        )
      )}
    </li>
  );
}

const STATUS_LINE = "col-start-2 col-end-[-1] mt-2 max-[640px]:col-start-1 max-[640px]:row-start-3";

// Only the two moves that leave a row sitting under the wrong title. A retired row that was let go
// says its own, final thing where the toggle used to be, and belongs to no section at all; a row in
// the shortlist of the empty Dashboard (`section` null) has no sections to move between, and that
// page answers the follow by offering the Dashboard itself.
function movedNote(section: keyof PickerSections | null, following: boolean): string | null {
  if (section === "catalog" && following) {
    return "following · moves to the following section on your next visit";
  }
  if (section === "following" && !following) {
    return "unfollowed · leaves this section on your next visit";
  }
  return null;
}
