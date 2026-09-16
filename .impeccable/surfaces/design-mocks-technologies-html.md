---
version: 1
slug: "design-mocks-technologies-html"
primary_target: "design/mocks/technologies.html"
related_targets: []
---

# Surface: Technologies

Scope: `/technologies`, static design mock inside the established Compiler Diagnostic world (DESIGN.md).
Mode: **Operate**. Signed-in Developer choosing which Catalog Technologies to follow; visited rarely
(first setup, then when the stack changes). Task: see what I follow, find and follow more, stay within
the Free limit.

Confirmed answers:
- Free limit (10, enforced by the database): at 10 of 10, Follow buttons on unfollowed rows are
  disabled (`aria-disabled`, still focusable, described by the note) and a `note:` line sits where the
  next Follow would happen. If the server still rejects an optimistic follow (e.g. another session),
  the toggle reverts and an `error:` line appears under that row. No Pro mention (post-MVP).
- Retired Technologies appear only when followed, in a closing `retired` group with a `note:`; they
  count toward the 10; they can be unfollowed, and once unfollowed cannot be followed again.
- A filter with no match shows an honest `note:` and one sentence: the Catalog is curated, requests are
  not open yet. No form, no external link.

Content: status line with the follow count; filter over the whole page; `following (N)` rows;
`catalog (N)` rows (alphabetical, 42 Technologies in total); `retired (N)` when present. Rows reuse the
Dashboard catalog picker (name linking to the Technology page, faint facts, Follow Toggle). A toggled
row stays in its section until the next visit, so nothing jumps under the pointer. States: 7 followed,
10 of 10, server-rejected follow, retired followed, no filter match.

Resolved: the page requires sign-in; Visitors do not see it.

## Direction contract

THESIS: A package manifest for your stack: what you follow is listed first and whole, the rest of the
Catalog follows in the same rows, so the limit and the next choice are read in one place. Refuses logo
card grids, category tiles and a marketplace feel.

OWN-WORLD: DESIGN.md unchanged: #0f1115 ground, flat rows between 1px rules, Fragment Mono for counts,
versions, labels and the filter, Hanken Grotesk for names and prose, neutral `note:` lines, `error:`
only with its glyph in `breaking`, no cards or badges.

STORY: The Developer reads `you follow 7 of 10`, checks the following list, filters or scans the
Catalog, follows what is missing, and understands the limit before hitting it.

FIRST VIEWPORT: Top bar with `7 of 10 followed`. Status-scale `note: you follow 7 of 10 technologies`,
a muted intro sentence, the Mono filter line with live match count, then `following (7)` rows; the
`catalog (35)` title reaches the fold at 1440.

FORM: Stack manifest, rank 2 of 7 on the ordered structural list, chosen by the user; seed key f97be3fe.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
