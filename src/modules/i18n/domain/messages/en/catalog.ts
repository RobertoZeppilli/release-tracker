// The strings of the Catalog: the Technology header and the note a retired Technology carries
// (ADR 0005). The sources of a Technology are not here: `npm react` and `github vitejs/vite` are
// the names of a package and of a repository, which are identifiers and stay as they are published.
export const catalog = {
  "catalog.latest": "latest",
  "catalog.sources": "Sources",
  // Two whole sentences rather than one sentence with a hole in the middle: the first draft built
  // this line out of a fragment that said "stay readable" and a stem that embedded it, and a
  // fragment is what a translation cannot move inside its own sentence.
  "catalog.retired.withLatest":
    "{name} is no longer tracked. Releases up to {latest} stay readable, but new versions are not detected.",
  "catalog.retired.noLatest":
    "{name} is no longer tracked. Its releases stay readable, but new versions are not detected.",
} as const;
