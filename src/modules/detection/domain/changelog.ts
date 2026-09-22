export type ChangelogSection = { heading: string; body: string };

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const FENCE = /^\s*(```|~~~)/;

// The section of `version` in a CHANGELOG.md: from its heading to the next heading of the same or a
// higher level. Headings like `19.2.0 (date)`, `v19.2.0` and `[19.2.0] - date` are recognised.
// A missing or empty section is null, so the Release has no notes.
export function extractChangelogSection(markdown: string, version: string): ChangelogSection | null {
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  let start: { index: number; level: number; heading: string } | null = null;
  let end = lines.length;

  for (const [index, line] of lines.entries()) {
    if (FENCE.test(line)) inFence = !inFence;
    const match = inFence ? null : HEADING.exec(line);
    if (!match) continue;
    const level = match[1].length;
    if (start) {
      if (level <= start.level) {
        end = index;
        break;
      }
    } else if (namesVersion(match[2], version)) {
      start = { index, level, heading: match[2] };
    }
  }

  if (!start) return null;
  const body = lines.slice(start.index + 1, end).join("\n").trim();
  return body === "" ? null : { heading: start.heading, body };
}

function namesVersion(heading: string, version: string): boolean {
  const text = heading.replace(/^\[?v?/, "");
  return text.startsWith(version) && !/^[0-9A-Za-z.-]/.test(text.slice(version.length));
}

// The id GitHub gives a Markdown heading, so a link can point to the section.
export function headingAnchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}
