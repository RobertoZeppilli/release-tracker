"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslator } from "@/modules/i18n/ui";
import { loginPath } from "@/modules/auth";
import { useSession } from "@/modules/auth/ui";
import { SkeletonBox } from "@/components/waiting";
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
// The box the control will fill, wearing its shape while it is on its way: the skeleton is the size
// and the radius of the Follow, so what arrives lands on the shape that was already there (DESIGN.md,
// The Reserved Space Rule, and The Waiting Rule). The width is the `Follow` button's own, **measured
// at 95px** and not guessed, because a box with no content would be 0 wide and reserve nothing.
const RESERVED = `${PLACE} h-[34px] w-[95px] rounded-md`;

// A Visitor is offered the login with this page as the way back; a Developer gets the picker's own
// Toggle, limit and refusal included, because both come from the same provider, which the page's
// `TechnologyScope` holds. Nothing shows until the session is known, rather than a Follow that might
// be wrong.
export function TechnologyFollow({ technologyId, name, retired }: { technologyId: string; name: string; retired: boolean }) {
  const t = useTranslator();
  const session = useSession();
  const pathname = usePathname();

  if (session.state === "unknown") return <ReservedBox />;

  if (session.state === "visitor") {
    // Nobody can follow a retired Technology, so the login would lead to a button that is not there.
    if (retired) return null;
    return (
      <a
        href={loginPath(pathname)}
        aria-label={t("stack.followName", { name })}
        className={`${FOLLOW_LINK_CLASS} ${PLACE}`}
      >
        <Plus aria-hidden className="size-4" />
        {t("stack.follow")}
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
  const t = useTranslator();
  const follows = useFollows();
  const following = follows.isFollowing(technologyId);
  const rejection = follows.rejectionOn(technologyId);
  // A retired Technology is followed by whoever already did: for them the Toggle stays, and letting
  // it go is the last thing that can happen to it. Only a control that was there needs a word when
  // it leaves, so whoever never followed this one keeps seeing nothing. The latch is set while
  // rendering, the way React adjusts state on a changed input: no effect, no second paint.
  const [wasFollowed, setWasFollowed] = useState(false);
  if (retired && following && !wasFollowed) setWasFollowed(true);

  if (!follows.known) return <ReservedBox />;

  if (retired && !following) {
    if (!wasFollowed) return null;
    return (
      <span role="status" className={`${PLACE} font-mono text-label leading-[1.6] text-text-muted`}>
        {t("stack.unfollowed")}
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

// The wait, in the shape and the place of the control that is coming.
function ReservedBox() {
  return <SkeletonBox className={RESERVED} />;
}
