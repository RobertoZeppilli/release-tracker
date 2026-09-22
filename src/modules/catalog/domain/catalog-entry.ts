import { z } from "zod";
import { ClassificationStrategySchema } from "@/modules/releases";

const RepoSchema = z.string().regex(/^[\w.-]+\/[\w.-]+$/, "expected owner/name");

// How a Source spells a Version in its tags, e.g. `v{version}` or `vite@{version}`.
const TagFormatSchema = z.string().includes("{version}", { error: "must contain {version}" });

export const SourceSchema = z.discriminatedUnion("kind", [
  z.strictObject({ role: z.literal("detection"), kind: z.literal("npm"), package: z.string().min(1) }),
  z.strictObject({
    role: z.literal("notes"),
    kind: z.literal("github-releases"),
    repo: RepoSchema,
    tagFormat: TagFormatSchema,
  }),
]);

export type Source = z.infer<typeof SourceSchema>;

export const SlugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "expected lowercase words joined by -");

// One file per Technology in `catalog/<slug>.json`; the slug is the file name.
export const CatalogFileSchema = z.strictObject({
  name: z.string().min(1),
  description: z.string(),
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
