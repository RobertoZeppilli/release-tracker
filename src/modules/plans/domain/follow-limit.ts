// The Free Plan follows at most ten Technologies, retired ones included (ADR 0004). The database is
// the authority, in the trigger of the `follow_limits` migration; the interface only anticipates
// the limit. What a paid Plan allows is not decided yet, so it is not written here.
export const FREE_FOLLOW_LIMIT = 10;

// What the Stack Panel prints beside `left on your free plan`. It never goes below zero: a follow
// written in another session can put a Developer over the limit, and a negative figure would be the
// panel reporting a debt instead of a wall (DESIGN.md, Stack Panel).
export function freeFollowsLeft(followed: number): number {
  return Math.max(0, FREE_FOLLOW_LIMIT - followed);
}
