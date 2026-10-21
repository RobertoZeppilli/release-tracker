import type { MessageDictionary } from "../index";

// The Catalog, in French. `dernière` and not `dernière release`: it is a label beside the version,
// and the column it sits in already says what is being counted.
export const catalog = {
  "catalog.latest": "dernière",
  "catalog.sources": "Sources",
  "catalog.retired.withLatest":
    "{name} n’est plus suivie. Les releases jusqu’à {latest} restent consultables, mais les nouvelles versions ne sont plus détectées.",
  "catalog.retired.noLatest":
    "{name} n’est plus suivie. Ses releases restent consultables, mais les nouvelles versions ne sont plus détectées.",
} as const satisfies Partial<MessageDictionary>;
