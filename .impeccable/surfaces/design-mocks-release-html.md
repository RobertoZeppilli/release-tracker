---
version: 1
slug: "design-mocks-release-html"
primary_target: "design/mocks/release.html"
related_targets: []
---

# Surface: public Release page

Scope: `/technologies/[slug]/[version]`, first surface of the product, built as a static design
mock before the Next.js app exists. Mode: **Read**.

Audience and job: a Developer or Visitor (often from search, e.g. "vite 6 breaking changes") who must
know in three seconds whether upgrading needs work, then read what changes and how to migrate.
Content: Summary (title, 3–5 key points, breaking changes with what changes and how to migrate,
Action required / Safe to upgrade), original release notes folded below, source link, and every
Summary state (pending, processing, ready, unavailable, skipped, failed).
Must feel wrong if: AI-tool styling, marketing/blog spaciousness, a GitHub Releases clone, or a flat
changelog with no hierarchy.

## Direction contract

THESIS: A release read like a compiler diagnostic: one verdict line, then numbered breaking changes
each pointing at its source line and ending in a `help:` migration. Refuses the category default of
a badge, a summary card and a bullet list.

OWN-WORLD: Terminal-dark ground (#0f1115) with one raised plane; diagnostic severities as the only
colour: breaking coral, action amber, help cyan, ok green, each always paired with its label word and
glyph. Fragment Mono for diagnostic grammar, versions, gutters and codes; Hanken Grotesk for prose.
Gutters, `-->` pointers, caret underlines and `= help:` lines are the component language. Release
notes render as a numbered source view, a different register from the Summary.

STORY: The reader sees the verdict and breaking count, scans key points, works through each
breaking change with its migration, and can verify any claim against the cited release-note lines.

FIRST VIEWPORT: Path breadcrumb and a compact header row (technology, version, date, significance).
Below, the verdict line at display scale ("warning: action required" + "3 breaking changes") across
the measure, the Summary title under it, key points as `note:` lines, and the first breaking
diagnostic starting above the fold. Primary action: "View release notes" in the header row.
Signature interaction: a `--> release-notes:42` pointer opens the folded notes, scrolls to the line
and draws the caret underline beneath the cited span.

FORM: Compiler Diagnostic, rank 1 of the ordered list (Impeccable's pick, chosen by the user);
seed key 141b1e36.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance
