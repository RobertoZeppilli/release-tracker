# Surface: public Technology page

Scope: `/technologies/[slug]?from=<version>`, static design mock inside the established Compiler
Diagnostic world (DESIGN.md). Mode: **Read**.

Audience and job: a Developer or Visitor on version X who needs to know what separates X from the
latest stable release and how many of those releases need action. Data must be easy to grasp even
for a hurried reader. Content: technology header with Follow, the Upgrade path form, the range
verdict, releases grouped by major in chronological order with digest releases folded, upcoming
Previews, and the retired and invalid-version states.

## Direction contract

THESIS: A version range read like `git diff --stat`: one answer for the whole jump, then each major
as a group whose releases run oldest to newest, noise folded. Refuses a flat reverse-chronological
changelog.

OWN-WORLD: Inherits DESIGN.md unchanged: #0f1115 ground, severity colour only with glyph and label,
Fragment Mono for versions, counts and labels, Hanken Grotesk for summary titles. Significance uses
neutral shape glyphs, never severity colour. Counts are always written in words beside any bar.

STORY: The reader enters their version, reads how many releases and how many need action, opens
the release that needs action, and knows the digests can be ignored.

FIRST VIEWPORT: Header (Vite, latest stable, Follow). The "Upgrade from [5.2.0] to 6.0.3" form. The
verdict line at display scale ("warning: 1 release needs action") with the range sentence and a
labelled stat bar per major. The v6 group opens with 6.0.0 and its breaking titles above the fold.

FORM: Range diff-stat, rank 3 of the ordered structural list, chosen by the user; seed key
f5d3dea8.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance
