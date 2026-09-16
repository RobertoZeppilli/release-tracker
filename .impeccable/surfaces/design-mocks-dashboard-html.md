---
version: 1
slug: "design-mocks-dashboard-html"
primary_target: "design/mocks/dashboard.html"
related_targets: []
---

# Surface: Dashboard

Scope: `/dashboard`, static design mock inside the established Compiler Diagnostic world (DESIGN.md).
Mode: **Operate**. Signed-in Developer, periodic 2–5 minute check: "is there anything I need to deal
with?".

Confirmed answers: fixed 30-day window for Spotlight, Latest and Previews, every row dated, releases
in the current ISO week (UTC, as in the digest) carry a neutral `this week` mark (no Seen state); a page verdict across all
followed Technologies; with 0 followed, the empty state embeds a short Catalog picker with Follow and
the `0 of 10` count, plus a link to the full Catalog.

Content: page verdict and count row; Spotlight with exactly one row per followed Technology (featured
releases of the last 30 days, action first, then safe; Technologies without one get a compact
one-line "latest major" row); Latest (notable, newest first); Previews; Weekly Digest folded per ISO
week (UTC). States: needs action, nothing needs action, 0 followed. Resolve the mock drifts named in
docs/HANDOFF.md (640px breakpoint, `text-muted` neutral verdicts, 3px focus radius, h1 -0.01em,
SVG significance diamonds, links carrying a grammar label).

Unresolved: a Technology with two featured releases in 30 days stacks both under one Technology cell.

## Direction contract

THESIS: `git status` for your stack: every followed Technology is accounted for exactly once in
Spotlight, so silence is visible and action is findable in seconds. Refuses a mixed
reverse-chronological feed and card grids.

OWN-WORLD: DESIGN.md unchanged: #0f1115 ground, flat rows between 1px rules, Fragment Mono for
versions, dates, counts and labels, Hanken Grotesk for Technology names and summary titles, severity
ink only with glyph and label, neutral significance diamonds.

STORY: The Developer reads the verdict, scans Spotlight for warning rows and their breaking titles,
glances at Latest and Previews, ignores the folded digest, leaves knowing what to upgrade.

FIRST VIEWPORT: Top bar with `7 of 10 followed`. Verdict `warning: 2 need action` at Verdict scale,
count row linking to sections. Spotlight: React 19.0.0 and Vite 6.0.0 warning rows with breaking
titles, TypeScript 5.7 ok row; compact rows start at the fold.

FORM: Stack status, rank 2 of 7 on the ordered structural list, chosen by the user; seed key 4fd8ec7e.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
