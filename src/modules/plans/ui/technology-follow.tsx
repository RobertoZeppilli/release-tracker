"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { loginPath } from "@/modules/auth";
import { useSession } from "@/modules/auth/ui";
import { FollowRejectionNote } from "./follow-rejection-note";
import { FOLLOW_LINK_CLASS, FollowToggle } from "./follow-toggle";
import { useFollows } from "./follows-provider";
import { FollowToggleLimitNote } from "./limit-note";

const ERROR_ID = "follow-error";
// Pushed to the end of the header line, and left where it falls under 640px, as in the mock. The
// push is added from `sm` up rather than undone below it: two `ml-` utilities on one element are
// sorted by Tailwind, not by the order they are written in, and `ml-auto` wins wherever it appears.
const PLACE = "sm:ml-auto";
const NOTE = "mt-2 basis-full";
// The box the control will fill, carrying nothing: the space is reserved so what arrives lands where
// it was always going to (DESIGN.md, The Reserved Space Rule).
const RESERVED = `${PLACE} block h-[34px]`;

// A Visitor is offered the login with this page as the way back; a Developer gets the picker's own
// Toggle, limit and refusal included, because both come from the same provider, which the page's
// `TechnologyScope` holds. Nothing shows until the session is known, rather than a Follow that might
// be wrong.
export function TechnologyFollow({ technologyId, name, retired }: { technologyId: string; name: string; retired: boolean }) {
  const session = useSession();
  const pathname = usePathname();

  if (session.state === "unknown") return <span aria-hidden className={RESERVED} />;

  if (session.state === "visitor") {
    // Nobody can follow a retired Technology, so the login would lead to a button that is not there.
    if (retired) return null;
    return (
      <a href={loginPath(pathname)} aria-label={`Follow ${name}`} className={`${FOLLOW_LINK_CLASS} ${PLACE}`}>
        <Plus aria-hidden className="size-4" />
        Follow
      </a>
    );
  }

  return <FollowControl technologyId={technologyId} name={name} retired={retired} />;
}

// The provider has no follows from the server here: the query loads them, and until it answers
// `isFollowing` is false for every Technology. That is not the first state of the Toggle, it is no
// state at all, and rendering it would put `Follow` on a Technology this Developer already follows.
// So the reserved box waits instead, the same one the unknown session shows, and the control arrives
// once it has something true to say. On `/technologies` the server hands the follows over, so the
// provider starts knowing and no row there ever waits.
function FollowControl({ technologyId, name, retired }: { technologyId: string; name: string; retired: boolean }) {
  const follows = useFollows();
  const following = follows.isFollowing(technologyId);
  const rejection = follows.rejectionOn(technologyId);
  // A retired Technology is followed by whoever already did: for them the Toggle stays, and letting
  // it go is the last thing that can happen to it. Only a control that was there needs a word when
  // it leaves, so whoever never followed this one keeps seeing nothing. The latch is set while
  // rendering, the way React adjusts state on a changed input: no effect, no second paint.
  const [wasFollowed, setWasFollowed] = useState(false);
  if (retired && following && !wasFollowed) setWasFollowed(true);

  if (!follows.known) return <span aria-hidden className={RESERVED} />;

  if (retired && !following) {
    if (!wasFollowed) return null;
    return (
      <span role="status" className={`${PLACE} font-mono text-label leading-[1.6] text-text-muted`}>
        unfollowed · can&apos;t be followed again
      </span>
    );
  }

  return (
    <>
      <span className={PLACE}>
        <FollowToggle technologyId={technologyId} name={name} errorId={rejection ? ERROR_ID : undefined} />
      </span>
      <FollowToggleLimitNote technologyId={technologyId} counted className={NOTE} />
      {rejection && <FollowRejectionNote id={ERROR_ID} rejection={rejection} className={NOTE} />}
    </>
  );
}
