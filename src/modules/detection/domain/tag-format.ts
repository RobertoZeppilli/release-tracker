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
