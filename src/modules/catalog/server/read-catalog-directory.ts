import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CatalogEntry } from "../domain/catalog-entry";
import { parseCatalog } from "../domain/parse-catalog";

export const CATALOG_DIRECTORY = "catalog";

export async function readCatalogDirectory(directory = CATALOG_DIRECTORY): Promise<CatalogEntry[]> {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  const files = await Promise.all(
    names.map(async (name) => {
      const filePath = path.posix.join(directory, name);
      return { path: filePath, content: await readFile(filePath, "utf8") };
    }),
  );
  return parseCatalog(files);
}
