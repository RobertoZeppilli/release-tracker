// The Free Plan follows at most ten Technologies, retired ones included (ADR 0004). The database is
// the authority, in the trigger of the `follow_limits` migration; the interface only anticipates
// the limit. What a paid Plan allows is not decided yet, so it is not written here.
export const FREE_FOLLOW_LIMIT = 10;
