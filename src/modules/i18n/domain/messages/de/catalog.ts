import type { MessageDictionary } from "../index";

// The Catalog, in German. `neueste` and not `neuestes Release`: it is a label beside the version,
// and the column it sits in already says what is being counted.
export const catalog = {
  "catalog.latest": "neueste",
  "catalog.sources": "Quellen",
  "catalog.retired.withLatest":
    "{name} wird nicht mehr verfolgt. Releases bis {latest} bleiben lesbar, neue Versionen werden aber nicht mehr erkannt.",
  "catalog.retired.noLatest":
    "{name} wird nicht mehr verfolgt. Die Releases bleiben lesbar, neue Versionen werden aber nicht mehr erkannt.",
} as const satisfies Partial<MessageDictionary>;
