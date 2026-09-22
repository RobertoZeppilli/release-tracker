import { type CatalogEntry, CatalogFileSchema, SlugSchema } from "./catalog-entry";

export type CatalogFile = { path: string; content: string };

export class InvalidCatalogError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(["Invalid Catalog:", ...problems.map((problem) => `  - ${problem}`)].join("\n"));
    this.name = "InvalidCatalogError";
  }
}

// Validates every file before returning, so one run reports all the broken entries at once.
export function parseCatalog(files: readonly CatalogFile[]): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  const problems: string[] = [];

  for (const { path, content } of files) {
    const fileProblems = parseFile(path, content, entries);
    problems.push(...fileProblems.map((problem) => `${path}: ${problem}`));
  }

  if (problems.length > 0) throw new InvalidCatalogError(problems);
  return entries;
}

function parseFile(path: string, content: string, entries: CatalogEntry[]): string[] {
  const slug = SlugSchema.safeParse(path.match(/([^/\\]+)\.json$/)?.[1] ?? "");
  if (!slug.success) return [`file name: ${slug.error.issues[0].message}`];

  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch (error) {
    return [`not valid JSON: ${error instanceof Error ? error.message : String(error)}`];
  }

  const file = CatalogFileSchema.safeParse(json);
  if (!file.success) return file.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);

  entries.push({ slug: slug.data, ...file.data });
  return [];
}
