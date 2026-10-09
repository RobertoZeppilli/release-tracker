import { fillVersionTemplate, parseVersion } from "@/modules/releases";

// A `tagFormat` says how a Source spells a Version in its tags, e.g. `v{version}` or `bun-v{version}`.
// Writing a tag is a substitution; reading one back is not, so the format becomes an anchored regexp.
// Null when the format names a part the Version has not got (see `fillVersionTemplate`).
export function tagFor(tagFormat: string, version: string): string | null {
  return fillVersionTemplate(tagFormat, version);
}

// Some Technologies tag an Anteprima differently from a stable Release: TypeScript publishes
// `6.0.1-rc` on npm and tags it `v6.0-rc`, where the patch is gone. `prereleaseTagFormat` is that
// second spelling, and it is used only for the Versions that have a prerelease.
export function notesTagFor(
  source: { tagFormat: string; prereleaseTagFormat?: string },
  version: string,
): string | null {
  const preview = (parseVersion(version)?.prerelease.length ?? 0) > 0;
  return tagFor(preview && source.prereleaseTagFormat ? source.prereleaseTagFormat : source.tagFormat, version);
}

// Null when the tag belongs to something else: a monorepo tags its other packages in the same list,
// and `vsix-22.2.0` fits `v{version}` as well as `v22.2.0` does. What settles it is that the piece
// left over has to be a Version, so the format alone never decides.
export function versionFromTag(tagFormat: string, tag: string): string | null {
  const [before, after] = tagFormat.split("{version}");
  const pattern = new RegExp(`^${escape(before)}(.+)${escape(after)}$`);
  const version = pattern.exec(tag)?.[1];
  return version !== undefined && parseVersion(version) !== null ? version : null;
}

function escape(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A repository can change how it writes tags, and a `tagFormat` covers one era only: `angular`
// tagged `21.0.3` in 2025 and tags `v21.0.3` today, `drizzle-orm` did the opposite. The variant is
// the configured format with the `v` before the Version added or removed, so both eras are readable
// without the Catalog declaring a second format. The configured form comes first: it is the one that
// works for the majority, and turning it around would only move the gap.
export function notesTagCandidates(
  source: { tagFormat: string; prereleaseTagFormat?: string },
  version: string,
): string[] {
  const variant = {
    tagFormat: vVariant(source.tagFormat),
    prereleaseTagFormat: source.prereleaseTagFormat ? vVariant(source.prereleaseTagFormat) : undefined,
  };
  const tags = [notesTagFor(source, version), notesTagFor(variant, version)];
  return [...new Set(tags.filter((tag): tag is string => tag !== null))];
}

// The `v` sits right before the first placeholder, whichever it is: `v{version}` and
// `v{major}.{minor}-{prerelease}` both lose it, `svelte@{version}` gains it.
function vVariant(format: string): string {
  const placeholder = format.indexOf("{");
  if (placeholder < 0) return format;
  const before = format.slice(0, placeholder);
  const rest = format.slice(placeholder);
  return before.endsWith("v") ? `${before.slice(0, -1)}${rest}` : `${before}v${rest}`;
}
