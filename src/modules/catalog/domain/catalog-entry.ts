import { z } from "zod";
import { ClassificationStrategySchema, unknownVersionPlaceholders, VERSION_PLACEHOLDERS } from "@/modules/releases";
import { CategorySchema } from "./category";

const RepoSchema = z.string().regex(/^[\w.-]+\/[\w.-]+$/, "expected owner/name");

const braced = (names: readonly string[]): string => names.map((name) => `{${name}}`).join(", ");

// A placeholder nobody substitutes would build a tag that cannot exist, and the Release Notes would
// go missing without a word, so a name that is not a part of a Version is refused here.
function tagFormatSchema(required: string) {
  return z
    .string()
    .includes(required, { error: `must contain ${required}` })
    .refine((format) => unknownVersionPlaceholders(format).length === 0, {
      error: (issue) =>
        `unknown placeholder ${braced(unknownVersionPlaceholders(String(issue.input)))}: expected one of ${braced(VERSION_PLACEHOLDERS)}`,
    });
}

// How a Source spells a Version in its tags, e.g. `v{version}` or `vite@{version}`. It keeps
// `{version}` whole, because detection reads a Version back out of a tag written this way.
const TagFormatSchema = tagFormatSchema("{version}");

// How a Source spells an Anteprima, when that is not how it spells a stable Release: TypeScript
// publishes `6.0.1-rc` and tags it `v6.0-rc`, so it declares `v{major}.{minor}-{prerelease}`. Only
// the Release Notes use it, which is why it may drop parts: nothing reads a Version back out of it.
const PrereleaseTagFormatSchema = tagFormatSchema("{prerelease}");

// A file path inside the repository, e.g. `CHANGELOG.md` or `packages/react/CHANGELOG.md`.
const RepoPathSchema = z
  .string()
  .regex(/^[\w.-]+(\/[\w.-]+)*$/, "expected a path inside the repository")
  .refine((path) => !path.split("/").includes(".."), { error: "must not leave the repository" });

// A Technology not published on a registry is detected from its GitHub Releases, where the tag is
// the only place the Version appears: `tagFormat` is how it is read back out.
const DetectionSourceSchema = z.discriminatedUnion("kind", [
  z.strictObject({ role: z.literal("detection"), kind: z.literal("npm"), package: z.string().min(1) }),
  z.strictObject({
    role: z.literal("detection"),
    kind: z.literal("github-releases"),
    repo: RepoSchema,
    tagFormat: TagFormatSchema,
  }),
]);

const NotesSourceSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    role: z.literal("notes"),
    kind: z.literal("github-releases"),
    repo: RepoSchema,
    tagFormat: TagFormatSchema,
    prereleaseTagFormat: PrereleaseTagFormatSchema.optional(),
  }),
  z.strictObject({ role: z.literal("notes"), kind: z.literal("changelog"), repo: RepoSchema, path: RepoPathSchema }),
]);

// Split by role first, because the same kind serves both: GitHub Releases carry the Versions and
// the Release Notes together.
export const SourceSchema = z.union([DetectionSourceSchema, NotesSourceSchema]);

// The GitHub repository a Technology lives in, if any of its Sources names one.
export function githubRepo(sources: readonly Source[]): string | null {
  for (const source of sources) if (source.kind === "github-releases" || source.kind === "changelog") return source.repo;
  return null;
}

export type Source = z.infer<typeof SourceSchema>;

export const SlugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "expected lowercase words joined by -");

// One file per Technology in `catalog/<slug>.json`; the slug is the file name.
export const CatalogFileSchema = z.strictObject({
  name: z.string().min(1),
  description: z.string(),
  category: CategorySchema,
  classificationStrategy: ClassificationStrategySchema,
  sources: z
    .array(SourceSchema)
    .refine((sources) => sources.some((source) => source.role === "detection"), {
      error: "needs at least one detection Source",
    })
    .superRefine((sources, ctx) => {
      const seen = new Set<string>();
      sources.forEach((source, index) => {
        const key = sourceKey(source);
        if (seen.has(key)) ctx.addIssue({ code: "custom", path: [index], message: `duplicate ${key} Source` });
        seen.add(key);
      });
    }),
});

export type CatalogEntry = z.infer<typeof CatalogFileSchema> & { slug: string };

// A Technology has at most one Source per role and kind: the pair identifies it across syncs.
export function sourceKey(source: Pick<Source, "role" | "kind">): string {
  return `${source.role}/${source.kind}`;
}
