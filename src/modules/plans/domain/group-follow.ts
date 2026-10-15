import { freeFollowsLeft } from "./follow-limit";
import type { FollowRejection } from "./follow-rejection";

// A selection larger than the room left on the Free Plan (DESIGN.md, Selection Bar). The figure is
// named here and not only counted, because what the Developer has to act on is which rows to drop.
export type GroupWall = { room: number; selected: number };

// `null` when the selection fits. The database is still the authority (ADR 0004): this only lets
// the page name the wall before the write, the way the single Follow already does.
export function groupWallFor(selected: number, followed: number): GroupWall | null {
  const room = freeFollowsLeft(followed);
  return selected > room ? { room, selected } : null;
}

// What the bar says before the press: uninked, because a Plan's limit is a boundary and not a
// failure (DESIGN.md, Limit Note).
export function groupWallNote({ room, selected }: GroupWall): string {
  const verb = selected === 1 ? "is" : "are";
  // A full Plan has no figure to act on, so it is named as a wall instead of counted down to zero:
  // `room for 0 more` is an arithmetic result, not a sentence.
  return room === 0
    ? `your free plan is full, and ${selected} ${verb} selected.`
    : `your free plan has room for ${plural(room)}, and ${selected} ${verb} selected.`;
}

// What the bar says after the database refuses, whichever rule it refused on. The write is one
// statement, so every one of these opens with `none` rather than with some: there is no halfway
// state to describe. The remedy is the Developer's in all three, which is why each names one.
export function groupFollowError(rejection: FollowRejection, wall: GroupWall): string {
  if (rejection === "limit") return `none followed. ${groupWallNote(wall)}`;
  if (rejection === "retired") {
    return "none followed. one of them has left the catalog, so clear it from the selection.";
  }
  return "none followed. the change didn't reach the database, so try again.";
}

// The wall as it stands now, for a bar that has to say something after a refusal: the figure comes
// from the follows re-read from the database, not from what the page believed before the press.
export function wallNow(selected: number, followed: number): GroupWall {
  return { room: freeFollowsLeft(followed), selected };
}

function plural(room: number): string {
  return room === 1 ? "1 more" : `${room} more`;
}
