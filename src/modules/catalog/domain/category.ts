import { z } from "zod";

// The ten Categories of the Catalog, in the order the picker shows them (CONTEXT.md, "Genere").
// Not alphabetical: it runs from the language to the platform, because the Catalog is read to put a
// stack together, not to find a name one already knows. A Category is curated by us in
// `catalog/<slug>.json`, never read from a Source, and the set is closed: there is no "other".
export const CATEGORIES = [
  "language",
  "runtime",
  "framework",
  "server framework",
  "database",
  "build tool",
  "testing",
  "lint and formatting",
  "library",
  "platform",
] as const;

export const CategorySchema = z.enum(CATEGORIES);

export type Category = (typeof CATEGORIES)[number];
