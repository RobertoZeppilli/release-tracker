import type { MessageDictionary } from "../index";

// The Catalog, in Italian. `ultima` and not `ultima release`: it is a label beside the version, and
// the column it sits in already says what is being counted.
export const catalog = {
  "catalog.latest": "ultima",
  "catalog.sources": "Fonti",
  "catalog.retired.withLatest":
    "{name} non è più tracciata. Le release fino alla {latest} restano consultabili, ma le nuove versioni non vengono più rilevate.",
  "catalog.retired.noLatest":
    "{name} non è più tracciata. Le sue release restano consultabili, ma le nuove versioni non vengono più rilevate.",
} as const satisfies Partial<MessageDictionary>;
