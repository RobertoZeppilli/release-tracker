import type { MessageDictionary } from "../index";

// The Catalog, in Spanish. `última` and not `última release`: it is a label beside the version, and
// the column it sits in already says what is being counted.
export const catalog = {
  "catalog.latest": "última",
  "catalog.sources": "Fuentes",
  "catalog.retired.withLatest":
    "{name} ya no se sigue. Las releases hasta la {latest} siguen consultables, pero las versiones nuevas ya no se detectan.",
  "catalog.retired.noLatest":
    "{name} ya no se sigue. Sus releases siguen consultables, pero las versiones nuevas ya no se detectan.",
} as const satisfies Partial<MessageDictionary>;
