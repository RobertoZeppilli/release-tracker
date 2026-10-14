---
name: verdict
description: Releases read like compiler diagnostics. One verdict, cited breaking changes, a help line for each migration.
colors:
  ground: "#0f1115"
  raised: "#161a20"
  sunken: "#0b0d10"
  rule: "#262b33"
  rule-strong: "#676d77"
  text: "#e7e9ec"
  text-muted: "#9aa3ad"
  text-faint: "#7b848f"
  breaking: "#ff7b6b"
  breaking-wash: "rgba(255, 123, 107, 0.10)"
  action: "#f2c14e"
  help: "#6cc4d8"
  help-wash: "rgba(108, 196, 216, 0.10)"
  ok: "#7bd88f"
  focus: "#4af262"
  link: "#4af262"
  selection: "rgba(108, 196, 216, 0.28)"
  light-ground: "#f6f6f3"
  light-raised: "#ffffff"
  light-sunken: "#eeeeea"
  light-rule: "#dcdcd6"
  light-rule-strong: "#82827b"
  light-text: "#16181c"
  light-text-muted: "#525a63"
  light-text-faint: "#636b74"
  light-breaking: "#b42a1f"
  light-breaking-wash: "rgba(180, 42, 31, 0.07)"
  light-action: "#8a5a00"
  light-help: "#0b6b80"
  light-help-wash: "rgba(11, 107, 128, 0.08)"
  light-ok: "#1d7a3a"
  light-focus: "#276d1a"
  light-link: "#276d1a"
  light-selection: "rgba(11, 107, 128, 0.18)"
typography:
  verdict:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(1.9rem, 5.2vw, 3.4rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  claim:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(2.2rem, 5.6vw, 4.2rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  band-title:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  status:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(1.5rem, 3.6vw, 2.3rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  column-verdict:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(1.15rem, 1.7vw, 1.45rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.03em"
    whiteSpace: "nowrap"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  summary-title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)"
    fontWeight: 500
    lineHeight: 1.4
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  diagnostic:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
    fontFeature: "tnum"
  source:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.75
    fontFeature: "tnum"
  label:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 400
  section-title:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.02em"
  meta:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  inline: "4px"
  md: "6px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "72px"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "34px"
  button-hover:
    backgroundColor: "{colors.raised}"
  button-icon:
    rounded: "{rounded.md}"
    size: "34px"
  cite-pointer:
    textColor: "{colors.help}"
    typography: "{typography.label}"
  inline-code:
    backgroundColor: "{colors.sunken}"
    rounded: "{rounded.inline}"
    padding: "1px 5px"
  quote-row:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.text-muted}"
    typography: "{typography.diagnostic}"
    rounded: "{rounded.inline}"
  fix-diff:
    backgroundColor: "{colors.sunken}"
    typography: "{typography.source}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  source-view:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text-muted}"
    typography: "{typography.source}"
    rounded: "{rounded.md}"
  cited-line-breaking:
    backgroundColor: "{colors.breaking-wash}"
    textColor: "{colors.text}"
  cited-line-note:
    backgroundColor: "{colors.help-wash}"
    textColor: "{colors.text}"
  range-input:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "38px"
    width: "11ch"
  field-error:
    textColor: "{colors.breaking}"
    typography: "{typography.diagnostic}"
  stat-row:
    padding: "8px 0"
  stat-bar:
    height: "8px"
  release-row:
    padding: "12px 0"
  release-version:
    textColor: "{colors.text}"
  release-date:
    textColor: "{colors.text-faint}"
  digest-row:
    textColor: "{colors.text-muted}"
    padding: "8px 0"
  help-pointer:
    textColor: "{colors.help}"
    typography: "{typography.label}"
  stack-row:
    padding: "12px 0"
  stack-row-compact:
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    padding: "8px 0"
  this-week-mark:
    textColor: "{colors.text-muted}"
    typography: "{typography.meta}"
  week-row:
    textColor: "{colors.text-muted}"
    padding: "8px 0"
  button-pressed:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    height: "34px"
  button-pressed-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.text-faint}"
    rounded: "{rounded.md}"
    height: "34px"
  filter-input:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "42px"
    width: "38ch"
  let-go:
    backgroundColor: "transparent"
    textColor: "{colors.text-faint}"
    typography: "{typography.label}"
    rounded: "{rounded.inline}"
    padding: "0 8px"
    height: "24px"
  category-chip:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "28px"
  category-chip-pressed:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
  view-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.text-faint}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "26px"
  view-toggle-pressed:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text}"
  sort-control:
    backgroundColor: "transparent"
    textColor: "{colors.text-faint}"
    typography: "{typography.label}"
    rounded: "{rounded.inline}"
    padding: "0 8px"
    height: "24px"
  catalog-row:
    padding: "12px 0"
  catalog-facts:
    textColor: "{colors.text-faint}"
    typography: "{typography.label}"
  row-error:
    textColor: "{colors.breaking}"
    typography: "{typography.diagnostic}"
  row-note:
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
  brand-mark:
    textColor: "{colors.text}"
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "16px"
    letterSpacing: "-0.02em"
  proof-panel:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.text-muted}"
    typography: "{typography.source}"
    rounded: "{rounded.md}"
  band:
    padding: "72px 0"
  band-number:
    textColor: "{colors.text-faint}"
    typography: "{typography.band-title}"
  stage-title:
    textColor: "{colors.text}"
    typography: "{typography.diagnostic}"
    fontWeight: 600
    letterSpacing: "0.02em"
    rounded: "{rounded.inline}"
    padding: "2px 8px"
  vocabulary-column:
    textColor: "{colors.text-muted}"
    padding: "12px 0 0"
  short-specimen:
    padding: "24px 0"
---

# Design System: Verdict

## Overview

**Creative North Star: "Compiler Diagnostic"**

A release reads like compiler output. One verdict line at display size, numbered `breaking[n]:` diagnostics that each point at their source lines with `-->`, quote the cited text over a caret row, and end in `= help:`. The release notes sit below as a numbered source view, clearly a separate part of the page from the Summary. Every claim can be checked against a highlighted line range.

The ground is terminal dark with one raised plane and one sunken well. Diagnostic severity is the only colour on the page. Fragment Mono carries the grammar: labels, versions, gutters, pointers, counts and metadata. Hanken Grotesk carries the prose that explains what changes. The page is dense and working-scale, not a marketing page. Width is set by a 72ch measure, and hierarchy comes from typography and gutters, not cards.

A light theme mirrors every role with darker severity inks on a warm off-white ground. Dark is the default.

**Key Characteristics:**
- Severity colour is always paired with a label word and a glyph.
- Monospace grammar (`note:`, `breaking[n]:`, `-->`, `|`, `=`, `help:`) is the component language.
- Flat surfaces: three tonal layers (ground, raised, sunken) and 1px rules. No shadows.
- One motion moment inside the app: the caret underline draws beneath cited spans. The landing adds one more, an arrival per section, and nothing else anywhere does (see Motion).
- The Summary and the source notes use different registers: grammar plus prose above, a numbered listing below.

**The Two Questions Rule.** A page that answers two different questions splits them, and does not interleave them. The Dashboard answers *where does my stack stand* and *what came out*, and for four versions it answered both at once, by cutting the Releases into sections by Significance: the result was the same Technology printed up to four times on one screen, and two counts built on two different sets that contradicted each other in plain sight. So the two questions now have a column each, and **nothing is printed in both**. The standing is per Technology and ordered by Distance; the stream is per Release and ordered by date. A fact that belongs to the standing (how far behind you are, how much is asking something of you) never appears in the stream, and a fact that belongs to the stream (what this Release changes, what it breaks) never appears in the standing. The counts in the two agree because they are the same count rendered twice, once per row and once in the verdict above them (CONTEXT.md, Verdetto della Dashboard), and not because someone checked.

**The same rule governs `/technologies`**, which asks *what is in my stack* and *what could go in it*. The stack is the left column and the Catalog the right one, and the quota, which is a fact about the stack, is counted in the left column only: the Catalog may name the wall but never recounts it. The page used to print that one number three times within 60px of the top, which is the Dashboard's contradiction in its smaller form, a fact repeated rather than a count disagreeing.

**The Address Rule.** What the page is showing goes in the address; how one reader is reading it stays in their browser. A filter query and a chosen Category are what is on the screen and are worth sending to someone, so they are `?filter=` and `?category=`, written with `replaceState` so a live count cannot fill the back button one character at a time, and deleted rather than written empty. A layout and an ordering are neither: they are how this one reader reads, so they live in `localStorage` and are remembered across visits without ever appearing in a link (issue #72). The address is read **once**, at the first paint, and written from then on: the page is what it renders and the URL is its mirror, never a second source of truth. Every read and write of `localStorage` is wrapped, because a private window is not a failure.

**The landing page is inside this register, not beside it.** "Dense and working-scale, not a marketing page" is a rule about the app, and the one page whose job is to persuade keeps it: the landing argues by putting the work on the screen, a real Release and its real notes, and it owns no furniture the app does not have. No cards, no metric row, no logo wall, no gradient, no testimonial. What it adds is the Brand Mark, the four significance words written out in prose, and two visible actions.

## Colors

The neutrals are cool graphite. The four diagnostic inks are the only hues that carry a verdict, and each has a fixed meaning. One hue says nothing about a Release: the **interactive green**, which is the focus ring and a link inside a sentence (see Interactive Green).

### Primary
- **Breaking Coral** (`breaking`; light `light-breaking`): `breaking[n]:` codes, caret rows, the `-` line in fix diffs, `error:` in the failed state, and the underline plus wash (`breaking-wash`) on source lines cited by a breaking change.

### Secondary
- **Action Amber** (`action`; light `light-action`): only the `warning: action required` verdict.
- **Help Cyan** (`help`; light `light-help`): `help:` labels, `-->` cite pointers and `-->` help pointer links (dashed underline), the note-citation wash (`help-wash`) and text selection (`selection`).
- **Interactive Green** (`focus`, with `link` as its second name; dark `#4af262`, light `#276d1a`): the focus ring **and** a link that is a word inside a sentence, which are the same thing seen twice, the one place on the page the keyboard and the pointer act on. It replaced Focus Red on 2026-10-14, the user's decision, and the ring lost its 3px offset with it: nothing is declared any more, so what is left is the browser's own 1px and the ring sits on the element's edge. Measured, dark: 12.75:1 on `ground`, 11.78 on `raised`, 13.13 on `sunken`. Light: 6.14:1, 6.65 and 5.72. It passes 1.4.11 as a ring and 1.4.3 as text in both themes, which the ring alone never had to.
  ⚠️ **The light theme cannot take the dark value.** The green that measures 12.75:1 on `ground` measures **1.24:1** on `light-ground`, failing both roles at once, which is why the two hexes are not the same colour at two lightnesses but two colours. In the light theme every usable green is dark, so the distance from the greens that *do* mean something has to come from the hue: `#276d1a` sits 28 degrees off `ok` (`#1d7a3a`) and 80 off `help` (`#0b6b80`), the two it would otherwise be read as.
  ⚠️ **Green now means two things, and the rule that it means one is the one being bent** (see The Severity-Only Colour Rule). They are kept apart by weight rather than by hue: the interactive green is neon and a verdict's green is pastel (`ok`), the interactive green is always underlined, dashed or solid, and no verdict is ever underlined. Keep it out of glyphs and washes, where a reader weighs a colour against a verdict instead of clicking it.

### Tertiary
- **Ok Green** (`ok`; light `light-ok`): the `ok: safe to upgrade` verdict and the `+` line in fix diffs.

### Neutral
- **Terminal Ground** (`ground`): the page background.
- **Raised Plane** (`raised`): the single raised surface. Used for the folded release-notes source view and button hover.
- **Sunken Well** (`sunken`): quote and caret rows, fix diffs and inline code.
- **Rule / Rule Strong** (`rule`, `rule-strong`): 1px dividers, key-point separators and panel borders. `rule-strong` is used for button borders, field borders, link underlines and the `digest` segment of the stat bar. Because a border is the only thing that identifies a button or a field, `rule-strong` clears 3:1 against all three planes in both themes (WCAG 2.2 SC 1.4.11). `rule` carries no such duty: it only divides.
- **Text / Muted / Faint** (`text`, `text-muted`, `text-faint`): primary copy, then secondary copy and source lines, then gutters, line numbers, provenance and footer.

### Named Rules
**The Severity Pairing Rule.** A severity colour never appears alone. It always comes with its label word and its glyph: warning (triangle) + `warning:`, ok (check circle) + `ok:`, breaking (octagon) + `breaking[n]:`, error (x circle) + `error:`, note (info circle) + `note:`, help (wrench) + `help:`, pending (clock) + `pending:`.

**The Severity-Only Colour Rule.** Hue means severity. There are no brand or decorative accents. `note:` and non-error status lines (`pending:`, unavailable, skipped) stay in `text-muted`. Only breaking, action, help and ok get an ink. ⚠️ **One exception, taken deliberately on 2026-10-14**: the interactive green, which is the focus ring and a link inside a sentence. Hue means severity *or* it means this is the thing you act on, and nothing else. What keeps the exception from eating the rule is that the interactive green never appears where a verdict can: not in a glyph, not in a wash, not on a `verdict:` line, and it is always underlined, which no verdict ever is (see Interactive Green).

**The Neutral Significance Rule.** Release significance (featured, notable, digest, preview) is a shape, never a hue. Featured is a filled diamond, notable an outlined diamond, digest a small dot, preview a dashed outlined diamond. They are always 12px SVG shapes (never a rotated CSS square), drawn in `text`, `text-muted`, `text-faint` or `rule-strong`, and never in a severity ink. Severity can sit beside a significance glyph, but always as its own glyph and label.

## Typography

**Display Font:** Fragment Mono (with ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)
**Body Font:** Hanken Grotesk (with system-ui, sans-serif)
**Label/Mono Font:** Fragment Mono, with tabular numerals

**Character:** A compiler's mono voice sets the verdict and structure. A plain, warm grotesk explains the consequences in human terms.

### Hierarchy
- **Verdict** (Mono 400, clamp(1.9rem, 5.2vw, 3.4rem), 1.08, -0.035em): the one verdict line (`warning: action required` / `ok: safe to upgrade` on a release, `warning: 2 need action` / `ok: nothing needs action` across the Dashboard). The glyph is set at 0.8em with stroke 1.75.
- **Status** (Mono 400, clamp(1.5rem, 3.6vw, 2.3rem), 1.15, -0.03em): the verdict line for non-ready Summary states, the Dashboard empty state and the Technologies follow status (`note: you follow 7 of your 10 free follows`).
- **Column verdict** (Mono 400, clamp(1.15rem, 1.7vw, 1.45rem), 1.15, -0.03em): the Dashboard verdict and the path verdict of a Technology page, the two that live inside a 360px column instead of across a page. ⚠️ **They wrap** (2026-10-14), where this scale used to forbid it: both are the title of a panel now, and a panel's 16px of padding on each side is width the one line no longer has (see The One-Line Verdict Rule).
- **Headline** (Grotesk 600, 22px, 1.2, -0.01em): the technology name in the release and technology headers. The version follows in muted Mono 400. In Dashboard rows a Technology name is Grotesk 600 16px/1.45, -0.01em.
- **Summary title** (Grotesk 500, clamp(1.15rem, 2.2vw, 1.4rem), 1.4, balanced wrap, max 72ch).
- **Title** (Grotesk 500, 18px, 1.45): the breaking-change heading, next to its Mono 16px `breaking[n]:` code.
- **Body** (Grotesk 400, 16px, 1.6): key points, diagnostic explanations (max 68ch) and help text.
- **Diagnostic** (Mono 400, 14px, 1.7): gutters, quote rows and `note:` / `help:` labels.
- **Source** (Mono 400, 13.5px, 1.75): the numbered release-notes view and fix diffs.
- **Label** (Mono 400, 13px): cite pointers, breadcrumb path and header facts. **Section title** (Mono 600, 13px, 0.02em, muted, lowercase, followed by a hairline rule, with a count where nothing else prints it: `framework (8)` in the Catalog, plain `breaking changes` on the release page).
- **Meta** (Mono 400, 12px, faint): provenance and footer. The `this week` mark uses the same size in `text-muted`.

**The line box of a one-line row.** A Label, Diagnostic or Meta line that is **one line inside a row** takes `line-height: normal` and not the page's 1.6: the column titles, the version in a Standing Row, the version in a Stream Row, a Help Pointer Link and the page foot. The ratio is for text that can wrap, where it is what keeps two lines apart; on a line that never wraps it only makes the row taller than the type in it, and the row's own padding stops being what sets its height. This is how the mocks set it, by writing the font in one shorthand, and the pages that computed 1.6 there sat a few pixels lower than the mock at every row.

### Named Rules
**The One-Line Verdict Rule.** The verdict keeps its token scale on every surface. The copy is shortened to fit, and the scale never shrinks. ⚠️ **The one line is a rule of the page's own container, not of a panel** (2026-10-14): a verdict that titles a panel wraps inside it, because 16px of padding on each side leave `ok: nothing needs action` 328px where it measures 365, and the three claims would have to come down to 21 characters to fit, which is a sentence the product cannot say. What gave way there is the line, not the scale, and the scale is the part of this rule that has never moved. At the page's own container, 1240px everywhere in the app, the whole verdict (glyph, label and claim) must fit on one line, so a range verdict reads `warning: 1 needs action`, not `warning: 1 release needs action`. ⚠️ The test is the page's container and not a viewport: below it the clamp lowers the scale with the width and a long claim wraps, which is the narrow-screen clause below and not a failure of the rule. The claim after the label is set inline-block, so when narrow screens force a wrap, it drops to the next line as a unit and never splits mid-phrase.

**The scale is set by the column, not shrunk to fit it.** The Dashboard verdict has a token of its own, Column verdict, and this is not the rule being bent: a scale is never reduced to rescue a line that is too long, but a verdict that moved into a 360px column is on a different surface and gets that surface's size. The rule it still obeys is the one that matters, one line and no wrap: `warning: 2 need action` holds at the column's narrowest, which is why the token carries `white-space: nowrap` and the copy stays as short as the page-wide verdict's. What is forbidden is the reverse move, keeping Verdict scale in the column and letting it wrap into three lines over a list it is supposed to summarise.

**The One Error Measure Rule.** Every error line is Diagnostic (Mono 14px/1.7) in `breaking`, whatever it sits under: the form message on the Upgrade Path, the refused follow under a Catalog row, the refused follow on a Technology page. An error is a diagnostic, and under a row of 13px facts the extra pixel is what makes it stand out instead of blending in.

**The Reserved Space Rule.** Nothing on a page waits behind a placeholder that imitates it. There are no skeletons: a pulsing grey block is a card by another name, and it says that something is coming without saying what, which is the opposite of a product whose states are words. What a wait owes the reader is two things instead. The space is **reserved**, so the control arrives where it was always going to be and the page under it never moves: an empty box of the control's own size, carrying nothing. And a value that is not known yet is **declared unknown**, never guessed: a control whose state depends on an answer that has not come is `aria-busy` and not pressable until it does, because the first state of a Follow is not "not followed", it is "not known". A picture is the one thing allowed to arrive into its own reserved frame with nothing said, since the frame is the border of the control that holds it and the alternative is a second shape for a wait of a few hundred milliseconds. The landing's entry action is the one thing allowed to answer the unknown with a guess, and the argument for it is where it lives (The Bench).

**The Two Registers Rule.** Anything a compiler would print (labels, codes, pointers, versions, counts, line numbers, dates) is set in Fragment Mono. Sentences a person reads are set in Hanken Grotesk. Don't mix them within one role.

## Layout

The container is **1240px on every page of the app**, with 24px side padding (16px at 640px and below). It was 1040px with three exceptions (the landing, the Dashboard, `/technologies`), and the exception list grew until it held every page: the Technology page took the split in #142 and the Release page followed it to the same width. A rule with no cases left is not a rule, so the width is one number for the whole app and what still varies is the **measure inside it**, never the container. **The top bar stays**: it is `position: sticky; top: 0` on every page, on `ground` with no shadow, under the 1px rule that already separated it, and above the content at a z-index of its own. A product whose pages are long lists of Releases should not make a reader scroll back to the top to reach the other destination, and a bar that is there at 10% of the page and gone at 60% is the kind of inconsistency a reader learns to distrust. What the bar may not do is grow, hide on scroll, change height or gain a shadow when the page moves under it: it is the same 56px row, always, and the rule under it is the only thing that says the content starts. Anything a link scrolls to carries `scroll-margin-top` of 72px (the bar plus 16px) so the bar never lands on top of its own target.

The top bar is **56px high at every width**, separated by a 1px rule, and the whole of it is sticky. It used to grow a second row below 640px, a 40px navigation strip under the 56px line, and the strip is gone: the sections it held are lines of the account sheet on a phone (see Navigation), which gives the one row enough width for the wordmark, the quota and the actions down to 320px. One row is a rule and not a result, so it is measured: at 320, 375, 390, 414, 429, 430 and 639px the header is at most 57px and the document never scrolls sideways. `scroll-margin-top` is 72px everywhere, since there is no second row to add. Prose is capped at a 72ch measure on every page, the Release page included, where it is the one thing that does **not** take the width of the column. Diagnostics no longer carry a 900px cap of their own: on the Release page the wells, the section rules and the Source View end at the column itself (see Release, the one structural edge). Spacing uses an 8-step scale (4, 8, 12, 16, 24, 32, 48, 72px). Sections are separated by 48px, diagnostics by 32px, and the verdict sits 32px below the header.

Diagnostic rows use a gutter grid: a 5ch right-aligned faint gutter holds `-->`, `|`, `=` or a line number, and content sits to its right. Key points use an 8.5ch label column. The source view uses a 6ch line-number column.

**The bar's container is the page's container.** The top bar lays its contents out at the width the page under it uses, so the wordmark sits over the first letter of the heading rather than 100px inside it. It is one rule and not a landing exception: a bar that kept its own width would be misaligned with any page that did not share it. For four versions the price was that the wordmark moved 100px between a 1240px page and a 1040px one, and that price is now paid off rather than accepted: with the Technology page and the Release page at 1240px (#142), every page of the app shares one container and the wordmark never moves. ⚠️ The order of the two decisions is the whole of it. The width comes from what the page has to hold, two questions side by side on three of them and one wide column of cited evidence on the Release page, and the bar follows. **A page is never widened to suit the bar.**

**Landing.** The landing was the first page to take the **1240px** container, back when the rest of the app was 1040px, and the extra 200px were not decoration: they are what lets the argument and the proof stand side by side on the first screen instead of one under the other. Everything inside it still obeys the measures, 72ch for prose and 68ch for explanations, so no line gets longer to fill the width. The first screen is two columns, `minmax(0, 1.05fr)` and `minmax(0, 0.95fr)`, 72px apart: the claim, the stake, the lede and the two actions on the left, the Proof Panel on the right. Below it the page is a stack of **bands**, each opened by a 1px `rule` that runs the full width of the container and holding 72px of padding above and below. A band's head is an 8ch margin column holding the band number (`01`, `02`, `03`) at **Band title scale** in `text-faint`, then the band title at the same scale in `text` and a muted Grotesk line under it at 64ch. The band body keeps the same 8ch indent, so every band reads off one vertical line and the numbers are the only thing in the margin. The number is set at the title's own scale and not smaller, because its job is the page's rhythm: at Meta size it read as a footnote to the margin and gave the eye nothing to count. It is `aria-hidden` and decorative, and no sentence anywhere refers to a band by its number.

Inside the bands: the four bench stages sit **two by two**, 48px apart; the Short Specimen rows use a 24ch first column and 24px of vertical padding; the Vocabulary Legend is four columns, 24px apart, each opened by a 1px `rule-strong` above its word. The closing band is two columns of equal width: the closing claim and its actions on the left, the Counter-Position Note on the right, so the page ends on the same split it opened on.

**Responsive, landing.** At 1040px and below the two columns of the first screen and of the closing band become one, in source order (argument, then proof), the stages become one column and the Vocabulary Legend two. At 640px and below the band head loses its 8ch margin column, the number sitting above the title, the Vocabulary Legend becomes one column and the Short Specimen rows stack to name over line. The arrivals do not change with the width: they are per section, and a phone gets exactly the ones a desktop gets.

**Technology, the split.** The page is two columns at 1240px, the shape the Dashboard and `/technologies` already use: *what do I have to do about this Technology* at `minmax(0, 360px)` on the left, *what has changed in it* at `minmax(0, 1fr)` on the right, 72px apart. It answered both down one 1040px column, and the audit of that column is why the split is here: the first Release stood at **646px** on the live page, the same partition was written three times inside 166px (`32 releases` printed twice 85px apart), and everything above the list used the left 650px while the right half stayed empty. The empty half is the list now, and the first Release is at **181px**. **The header is inside the left column**, not in a band over the split: the name, the sources and the Follow belong with the panel and the verdict, the right column names its own ordering, and so nothing up there was shared. Only the right column scrolls. ⚠️ **A sticky grid item does not stop at the end of its own row**: the left column printed itself 24px over the footer (measured at 1280x647), so the cell takes the row's height (`align-self: stretch`) and the sticky block sits inside it.

**Release, the one structural edge.** The page is one 1192px column inside the 1240px container, and everything that is structure ends at it: the section rules, the diagnostic wells, the fix diffs and the Source View. The audit found **four** right edges (the head and the Source View at 1116px, the summary title at 988, the key points at 772, the wells at 1024), and they were not four mistakes but one measure written in `ch` at four type sizes plus the 900px cap the wells carried; a single pixel width is the only way they coincide. **The prose does not take that width**: a 1192px line of Grotesk runs about 149 characters, so the paragraphs, the help lines and the key points keep the 72ch measure (648px) and the summary title its own (864px). Prose stopping short of the rule is typography and reads as one page; four structural elements stopping at four places was the bug. ⚠️ The order is the other half of the page: with `action required` the **breaking changes come before the key points**, because they are the work and the notes are the surround, and in the states that have none the section is absent and the key points follow the title, which is the same order read from the other end. The first breaking change is at **483px**, against 811px on the old page. Measured: horizontal overflow **0 on 112 combinations** (16 widths x 7 states).

**Technology page rows.** In the left column the Upgrade Panel opens 24px under the header and the verdict follows it: on this page the verdict is the second thing, not the first, because the counts it claims are built on what the panel declares. Release rows use a four-column grid (11ch significance, 14ch version, 11ch date, then the content), with a 16px column gap, 12px vertical padding and a 1px `rule` below. Folded digest rows share the 11ch significance column, so glyphs line up down the list. **The stat row is the title of its group**, and not a list of its own above the list: the two counted the same Releases 300px apart and the group title under them said the count a third time. The title is a 3ch major column, a 1ch `|` column, a bar track (80-120px), the counts in words and then the rule that runs out to the right edge, the way every section title in the app does. Major groups are separated by 48px.

**Dashboard, the split.** The page is two columns at 1240px: the Standing at `minmax(0, 360px)` and the Stream at `minmax(0, 1fr)`, 72px apart, aligned to the start and opened by 32px of padding above. It has no sections, and that is the layout: the four it had divided the Releases by Significance, so one Technology appeared in up to four of them and a reader had to recompose their own stack out of the pieces. **The two columns are two questions** (see The Two Questions Rule), and nothing may be printed in both.

**Dashboard, the Standing column.** It is `position: sticky` 72px under the bar (the bar plus 16px, the same offset every anchor uses) and no taller than `calc(100vh - 72px - 32px)`, because it is the thing a reader glances back at while reading the Stream. Inside it, three parts in fixed order: the verdict, the **Standing Panel** that names the column and counts the whole, and then the list, which **scrolls inside itself** so that the two above it never leave. The panel names what the bar is (`the bar is the distance from the version you declared, not a score`): a measure that is not explained where it is drawn gets read as a score.

**The hidden scrollbar and the fade, inside the Standing.** The list hides its scrollbar (`scrollbar-width: none`, and the WebKit pseudo-element at zero), because a second scrollbar 360px from the page's own asks the reader which one they are in. What replaces it is a **mask that fades the bottom edge**, and three things make it honest. It is a `mask-image`, not a shadow and not an animation: both are forbidden here (see Elevation & Depth, Motion). Its height is **exactly the list's bottom padding, 18px**, so at the end of the list it falls on empty space and no row is ever dimmed for nothing. And ⚠️ **the hidden scrollbar is measured, never assumed**: `offsetWidth - clientWidth` must be `0`, or the column silently loses width to a bar nobody can see. Tailwind does not hide it on its own. The rows are links, so the keyboard reaches and scrolls the list without a bar to drag, and the list is a group with an accessible name of its own (`Followed technologies, by distance`): the quota in the top bar already answers to `Followed technologies`, and two things on one page under one name is one name too many. ⚠️ Two things make the column behave, and both were found by rendering it, not by reading it. The scrolling list must be allowed to **shrink inside the column** (`min-height: 0`), or it keeps its full height, the column overflows its own maximum and paints over the line under the split. And the sticky column sits **inside a plain grid item stretched to the row's height**, because a sticky grid item is not clamped by its own grid area: on its own it slid past the end of the split and over the window line at the foot of the page.

**Dashboard, Standing rows.** One row per followed Technology, a link, with 12px of vertical padding, no left padding and a 1px `rule` below (none under the last; the list carries a top `rule-strong` instead). The row is two lines: the name at Grotesk 500 with the version pushed to the right edge in Mono 14px `text-muted`, then, 2px under, the state line in Meta, which is the bar and then the words. The bar is a 4px `sunken` track with a 2px radius, filled with `rule-strong`, or with `action` on a row that needs action, and it is `aria-hidden`: the words beside it are the content. On hover the whole row takes `raised`.

**Dashboard, the Stream.** One day per block, a two-column grid of `11ch` and `minmax(0, 1fr)` 24px apart, opened by a 1px `rule` (`rule-strong` on the first) with 24px of padding above and below. The date cell holds the ISO date in Meta with the This Week Mark stacked under it. Events inside one day are separated by 24px of padding and a 1px `rule`, never by a surface. A breaking list is a 2px `breaking` left border with 16px of padding inside it and no bullets. A quiet stretch of weeks is **one row, not a section**: the same two-column grid at 12px of padding, entirely in Meta (see Weekly Digest).

**Responsive, Dashboard.** At 1040px and below the two columns become one, in source order (the Standing, then the Stream), 48px apart; the Standing stops being sticky, gives up its max height and **drops the mask**, because a list that is no longer scrolling inside itself has no more below it. At 640px and below the day block and the quiet row lose their 11ch date column and stack, the week mark going inline after the date, the bar loses its sections to the account sheet and the quota reads `N followed`. ⚠️ **A phone layout is not inherited from anywhere**: a Dashboard built fresh had 144px of horizontal overflow at 390px, and it was found with a measurement, not by eye. Every width this page claims to hold is measured, 320px included.

**Technologies, the split.** The page is two columns at 1240px, the same shape as the Dashboard: the Stack at `minmax(0, 360px)` and the Catalog at `minmax(0, 1fr)`, 72px apart, aligned to the start, opened by 32px of padding above and closed by 72px below. It answers *what is in my stack* and *what could go in it*, and for four versions it answered both in one column (see The Two Questions Rule). The audit of that column, measured on the live page and not deduced, is why the split is here: the quota was printed **three times inside the first 60px** (the bar, a note at 36.8px and the section title), every row ran about **270px of empty width** between its description and its button (a facts cell of 674px holding about 400px of text), **fifteen** elements on the page had a number in them, a title arrived every three rows (10 group titles over 31 rows), the document was **3196px** long and **8 of 37 rows** were on the first screen. The width that was empty is the second column now.

**Technologies, the Stack column.** `position: sticky` 72px under the bar, the same offset every anchor uses, and no taller than `calc(100vh - 72px - 32px)`: it is what a reader glances back at while reading the Catalog. Inside it, two parts in fixed order: the **Stack Panel**, which names the column and counts the quota, and then the list, which **scrolls inside itself** so the panel never leaves. The hidden scrollbar and the 18px bottom mask are the Dashboard's, rule for rule (see Layout, the hidden scrollbar), and so are the two traps it found by being rendered: the scrolling list must be allowed to shrink inside the column (`min-height: 0`), and the sticky column sits inside a plain grid item stretched to the row's height. ⚠️ The hidden scrollbar is **measured, never assumed**: `offsetWidth - clientWidth` must be `0`.

**Technologies, the Catalog column.** Its head is one row, the column title left and the layout toggle right, wrapping at baseline; then one Meta intro line; then the filter, 24px under it; then the Category chips; then the ordering, 24px above the groups. Groups are 24px apart, each opened by its Section title. A Catalog row is a two-column grid, `minmax(0, 1fr)` and `auto`, with a 16px column gap, a 2px row gap, 12px of vertical padding and a 1px `rule` below (the first row of a group also gets a top rule): the name and the Follow on the first line, the facts on the second, the Follow spanning both rows at the right edge. In `grid` the same cells become `repeat(auto-fill, minmax(300px, 1fr))` with 16px gaps, and the row stops being a row: it is a panel, a 1px `rule` outline with a 6px radius and 16px of air inside, with no rule under it, the Follow alone on the first line and the facts taking the whole cell under it. Cells of one line are stretched to equal height (see Catalog Layout).

**Responsive, Technologies.** At 1040px and below the two columns become one, in source order (the Stack, then the Catalog), 48px apart; the Stack stops being sticky, gives up its max height and **drops the mask**, because a list that is no longer scrolling inside itself has nothing below it. At 640px and below the bar loses its sections to the account sheet, the filter input gives up its 38ch cap for the full width, and the keyboard hint goes with the keyboard it talks about. Nothing else changes, because the row is already two lines at every width: the reflow the old row needed on a phone was the fix the desktop row was missing. Verified in the browser in both views at 320, 360, 390, 414, 640, 641, 1040 and 1240px: **horizontal overflow 0**, the bar at 57px, and the hidden scrollbar taking **0px**.

**Responsive (640px and below):** the breadcrumb path stays at the top of the content, whole, and the source meta is hidden. Key-point labels and diagnostic headings stack to one column. Gutters narrow to 4.5ch. **Caret rows are hidden.** The quoted span gets a 2px `breaking` underline (offset 4px) inside the quote row instead. Fix diffs scroll horizontally. Quotes and inline code break inside a word rather than widening the page.

**Responsive, release page.** At 700px and below nothing special happens any more, now that the counts are a panel under the verdict rather than a row beside it. At 640px and below the gutters narrow to 4.5ch, caret rows go (see The caret row and its replacement), key-point labels and diagnostic headings stack, and fix diffs scroll inside themselves. ⚠️ The verdict wraps as a unit below **1046px** of viewport, where the clamp takes the scale under its cap: at 1240px the longest claim of the seven states (`note: not enough notes to judge`) is one line, and under that step it is two. That is the narrow-screen half of The One-Line Verdict Rule, not an exception to it.

**Responsive, technology page.** Above 1040px the split; at 1040px and below the two columns become one in source order and the header goes back to being a band over the stack. At 880px and below, release rows reflow to significance, version and a right-aligned date on the first line, with the title, verdict and breaking list across the full width below, and stat words may wrap. At 640px and below the header facts (the latest version and the sources) wrap as one group, so the Follow keeps a line of its own instead of trailing the sources, and the stat row keeps major, `|` and bar on one line while the words drop to a full-width second line. Digest rows drop the version range: the summary shows only the count, with `no action needed` on its own line. The expanded digest list loses its 11ch indent. The range verdict wraps the claim below the label as one unit.

**Responsive, the empty Dashboard (640px and below):** nothing, now that the catalog row is two lines at every width (see Catalog Row). The reflow this paragraph used to describe, the facts dropping under the name with the Follow spanning both lines, is the row itself.

### The caret row and its replacement

The caret row is `^` repeated once per cited character, so it only reads right while the quote stays on one line. Once the quote wraps, the carets sit under the wrong words, and being one run with no place to break they widen the whole page: the release notes are real text, and a cited line of 167 characters made a 1503px row inside a 900px column (issue #62).

So the caret row is shown **only where its own quote is certain to fit on one line**, and the coral underline inside the quote row takes over everywhere else, saying the same thing and staying right however the quote wraps. A quote fits on one line when its length in characters is no more than the diagnostic column allows at that width, and the budget is `floor((col - 70.5) / 9) - 1`, where `col` is `min(1192px, 100vw - 48px)`, 9px is the character advance and 70.5px is the 5ch gutter plus its 1.5ch padding plus the 12px on the right: 57 at 641px, 71 at 768px, 85 at 900px, 99 at 1024px and **123 at 1240px and above**, where the column reaches its cap. A quote longer than 123 characters never gets a caret row. ⚠️ The budgets rose with the page (the cap was 900px, then 880px) but **the thresholds in the mock did not**, and that is correct rather than an oversight: a cap above what the quote needs never binds, so what decides is `100vw - 48`, and an 88-character quote wants 871.5px of column either way. The budgets come from the character advance **measured on the live font**, 9px at 14px, not from a nominal 0.6em: the first attempt assumed 8.4px and left three production pages citing a line of exactly the length the 768px step claimed to hold. One character is kept back at every step, so a quote that lands on a step does not depend on sub-pixel luck. The lengths are computed in `caretWidth`, not guessed in CSS, and the page names the width its caret row survives down to. ⚠️ **The page switches on the five steps, the mock on each quote's own width**: the mock stamps a well with the viewport that quote survives down to (920, 866, 848), which Tailwind cannot compile from a number known only at render time, so the code rounds up to the next listed step. An 82-character quote therefore loses its caret row at 900px instead of 866: the switch is early, never late, and the underline says the same thing under it.

The mock stamps each well with the **viewport** its own quote survives down to: 920px for the two 88-character quotes, 866px for the 82 and 848px for the 80, so resizing it shows the switch happening at different widths on the same page. Below 640px caret rows are gone whatever the length, as they always were.

## Elevation & Depth

The system is flat with no shadows. Depth comes from three tonal layers: `sunken` wells for quotes, diffs and inline code, `ground` for the page, and one `raised` plane for the source view and hover states. Edges are 1px `rule` borders.

### Named Rules
**The One Raised Plane Rule.** Only the release-notes source view sits on `raised`, and the landing's Proof Panel is that same surface and not a second one: real numbered notes on `raised` inside a 1px `rule`, with the verdict they produced added under a hairline. A card would be a surface that holds a claim; this one holds the source, which is the only thing the system lets float. Quoted and code material sinks. One surface floats, and only one: the account panel under the top bar, on `raised` inside a 1px `rule`, with no shadow under it. It is what the viewer opened, it closes on Escape, on a click anywhere else and on following one of its own links, and nothing else on any page is allowed to hover over the text.

## Shapes

Corners are gently squared: 6px for buttons, the source panel and fix diffs, and 4px for inline code and quote/caret wells. A quote row and its caret row sit in one well, rounded 4px, with 6px of padding above and below. The focus outline is 2px `focus`, offset 3px, with a 3px radius. Pointer links use a dashed 1px underline that turns solid on hover; on a `-->` help pointer only the label carries it. The `-->` pointer and caret row are typographic shapes, not drawn graphics.

## Motion

**The One Motion Moment Rule, inside the app.** On every page a reader works in, the caret underline drawing beneath a cited span is the only motion, plus the digest chevron that rotates to say a row opened. Nothing else moves: no row slides, no section enters, no panel fades. A page that jiggles while demonstrating precision argues against itself, and a reader who comes back to the same page twenty times pays for a flourish twenty times.

**The Arrival Rule, on the landing and nowhere else.** The landing is read once, by someone deciding whether to trust the product, and a page that is read once can afford to be read in order. So each of its sections arrives a single time: 10px up and a fade, 460ms on the same exponential ease-out as the caret (`cubic-bezier(0.16, 1, 0.3, 1)`), fired when the section enters the viewport and then forgotten. What an arrival may not do is the whole of the rule, and it is the part that keeps this from becoming a marketing page: it never repeats, never runs on scroll position, never parallaxes, never moves anything sideways, and never delays what a reader can already see. The first screen does not arrive, it is simply there, because the thing it holds is the argument and the proof.

**A band that was passed over has arrived.** A reader who presses End, or follows an anchor, jumps over bands without any of them ever crossing the viewport, and one left waiting for an entrance it will never get would stay invisible for the rest of the visit. A band now above the viewport is therefore in, immediately: an arrival is a greeting, not a gate.

An arrival carries no information. Every section is in the DOM, in reading order, at full opacity for a crawler, for a reader with JavaScript off, and for anyone who never scrolls, which is why the hiding is applied by script (a `js` class on the root) and not by the stylesheet. Under `prefers-reduced-motion: reduce` there is no arrival and no caret draw: everything is simply in place, and this is not negotiable.

The two exist together because they say different things. The caret draw is **evidence**, it happens where a claim meets the line it rests on, and it happens in the app too. The arrival is **pace**, it belongs to a page that argues, and it stops at the app's door: no section of the Dashboard, a Technology page, a Release page or `/technologies` ever arrives.

## Brand Mark

The wordmark is the product's own grammar: **`verdict:`** in Fragment Mono 400, lowercase, `-0.02em`, in `text`, colon included and nothing after it. The colon is not decoration. Every line this product cares about opens with one (`ok:`, `warning:`, `breaking[n]:`, `note:`, `help:`), so the mark is the opening of a sentence the app finishes, and the space it leaves after the colon is where the answer goes.

It is Mono 16px in the site header, where it is also the home link, and that is the only place it is set: one step over the 14px it used to be, because it is the first thing read on every page and at the bar's scale it sat level with the links it is not one of; a second, larger mark over the landing's `h1` is a kicker, which this document forbids, and the header already carries it on that page. It appears once more in the page foot, at Meta size, as the line that names what read the notes. It carries no glyph beside it, no box around it, no second word and no tagline: a claim belongs to the landing's heading, which can be read and corrected, not to a mark that repeats on every page.

**The mark never takes a severity ink**, in either theme. Hue means severity (The Severity-Only Colour Rule), and a mark drawn in `ok` or `breaking` would deliver a verdict on every page it sits on, pages that have nothing to judge included. The mark is `text` on `ground`, and the only state it has is the focus ring it gets as a link.

**The icon is the caret row.** Where a wordmark cannot be read, at 16px and 32px in a tab or a bookmark, the mark becomes three carets, `^^^`, drawn as an SVG path (not text) in `text` on a `ground` square with a 6px radius, so it holds its contrast on light and dark browser chrome alike. The caret row is the system's own way of pointing at the exact text a claim rests on, and it is the one thing on the page that moves; three carets at 16px read as a shape rather than as letters, which is what an icon has to do.

Rejected, and for reasons that outlive the choice: the **octagon**, because in this system it already means a breaking change, and a mark that says "rupture" over every page breaks The Severity Pairing Rule by wearing a severity shape with no severity to report; the **`-->` pointer**, because it means "the cited line is over there" and a logo points nowhere; and any **coloured** or boxed treatment, which the colour rule forbids before taste gets a say.

## Components

### Buttons
- **Shape:** gently squared (6px), 34px high, 1px `rule-strong` border, transparent fill.
- **Default:** Grotesk 500 14px, 12px horizontal padding, with an optional 16px stroke icon (stroke 2) and an 8px gap.
- **Hover / Focus:** fill changes to `raised` and the border to `text-faint`. Focus uses the global 2px cyan ring, offset 3px, 3px radius.
- **Icon button:** a 34px square (theme toggle).
- **Toggle (Follow):** a `button` with `aria-pressed`. Off: plus icon + `Follow`. On: check icon + `Following`, the text drops to `text-muted` (back to `text` on hover) while the border stays `rule-strong`. The border is the only thing identifying this control, so every state keeps a border that passes SC 1.4.11, the limit state included: it stays focusable, so it is still a control. The quiet half of the pressed look is carried by the text alone. `rule` was the first answer and it measured 1.33:1 in the dark theme and 1.27:1 in the light one, the one control border in the system outside the rule. The accessible name switches between `Follow X` and `Unfollow X`.
- **Toggle at the limit (disabled):** when 10 of 10 are followed, every unpressed toggle gets `aria-disabled="true"` (never the `disabled` attribute), so it stays focusable and is described by the limit note (`aria-describedby`). The border drops to `rule`, the text to `text-faint`, the cursor is `not-allowed` and hover changes nothing. Clicks are ignored. Pressed toggles stay live so the user can unfollow.

### Navigation
There is one navigation, not two: a single top bar on every page, and the slot between the wordmark and the actions always holds the same two sections. The bar says where the viewer may go, and that is all it says. Where the page itself sits belongs to the page, so the breadcrumb is at the top of the content rather than in the bar. There is no sidebar: the app has two signed-in destinations, and the width a sidebar would take is the width the release page spends on its quote wells.

- **The bar stays on the screen.** It is sticky at the top of every page (see Layout): the two destinations are reachable from the bottom of a long list of Releases without scrolling back, which is the commonest shape a page here has. It is **one 56px row at every width**, phones included.
- Top bar: the Mono 14px `release-tracker` wordmark, then the slot, then right-aligned actions. The slot holds a Mono 13px muted nav (`dashboard`, `technologies`, 16px gap), with `aria-current` on the section being read, in `text`. It is the same on every page, public ones included, and no item is current where neither section is being read: a Technology page, a Release page, the home page, the 404, sign in.
- **The two sections are in the open for everyone, a visitor included.** Both sit behind sign-in and the links are there all the same: a visitor who follows one lands on sign-in and is returned to it afterwards. The header cannot branch on the viewer anyway, since the session arrives after the first paint and a header that changed shape when it arrived would remount the page. This is the rule the `technologies` breadcrumb step already followed, now applied to the slot.
- **Page breadcrumb:** on a Technology page, a Release page and sign in, a Mono 13px muted `technologies / vite / 6.0.0` at the top of the content, above the `h1`, with the current item in `text` and 24px of air under it. **Steps are links wherever they have a destination**, for everyone, and `technologies` always points at `/technologies`: the breadcrumb describes where the page sits, and `/technologies/vite/6.0.0` really does sit under `/technologies`, so the step tells the truth about the hierarchy rather than about the viewer's rights. It is in the content and not in the bar because the slot it used to take is what put the Dashboard out of sight from a public page (issue #119).
- **At 640px and below the slot is gone from the bar**, and the two sections are lines of the account sheet instead. The bar there holds the wordmark, the quota and the actions on **one 56px row**, which is what it had been given a second row of 40px to avoid: 96px of chrome on a 667px screen is a seventh of the screen, and the sections were the part of it a reader needs least often, since a destination is one scroll to the top away wherever the reader is. The quota stays in the bar at every width now, because with the sections out of the line there is room for it: it reads `N followed` under 640px, which is what made it fit.
- **Account panel:** the right-hand action is a 34px square button, 6px radius, with a 1px `rule-strong` border, holding the GitHub picture **filling it edge to edge**; without a picture the handle's initial stands in and without a handle a 16px neutral mark, both as glyphs inside the control rather than surfaces filling it. The picture carries no border of its own: a 1px rule around a 24px picture inside a 34px bordered button drew the same square twice, 4px apart, and left the picture floating in a control it never reached the edge of. The button's own border stays, because a border is what identifies a button (see Colors). It opens a panel under the bar, right-aligned to the page's own gutter, 180px at its narrowest, on `raised` inside a 1px `rule`: the handle in Mono 12px faint over a rule, then `sign out` under it, 24px high with a `sunken` hover. **The theme toggle stays in the bar**, outside the panel: the public pages are read signed out too, and a visitor has no panel to find it in. At 640px and below it is not a panel but a sheet over the whole screen: a 56px row with the handle and a square close button, then **the two sections as 44px rows**, each with a 1px `rule` under it and `aria-current` on the one being read, and `sign out` pushed to the bottom edge, under the thumb. The sections come first and the way out last: reaching the other section is what a reader opens this for, and signing out is what they do once. Following one closes the sheet. The sheet locks the page behind it and keeps the keyboard inside while it is open (WCAG 2.2 AA 2.4.11), Escape closes it and the picture takes the focus back.
- **One copy of each link, at every width.** The sections exist twice in the markup, as the bar's row and as the sheet's rows, and exactly one of the two is ever rendered: the row is `display: none` at 640px and below, the rows above it. So the page never carries two `dashboard` links and a screen reader never meets the same navigation twice, which is the objection that kept the sections out of the panel in issue #119, answered by the breakpoint rather than by leaving them in the bar on a phone.
- **Quota link:** before the actions, a Mono 13px muted link `N of 10 followed` with the number in `text`, turning `text` on hover. On mobile it shortens to `N followed`.
- **Except on `/technologies`, where the bar carries no quota at all.** The quota in the bar is a link to that page, and that page prints the same number in the panel at the head of its left column, 60px below it: a link to where the reader already is, counting what the page already counts, was the first of the three copies the audit found (see Stack Panel). The bar keeps it everywhere else, where it is the only copy there is.

**The No Dead End Rule.** From every page, every page the viewer has a right to reach is reachable without guessing, and **above 640px it is one visible action away**: the slot holds both sections, on every page, with nothing to open.

**On a phone the destinations are the account's, and this is the third answer, not a return to the first.** The history matters because the same ground was lost twice. At first the slot was simply hidden below 640px, and a phone reading a Release page had the wordmark and nothing else: a navigation that disappears is a dead end (issue #63). Then the sections moved into the account panel, and from a public page the Dashboard took one click to reveal and another to follow, with nothing saying the picture hid links (issue #119). Then the slot was given its own 40px strip on every page, in the open, which cost every phone reader 96px of chrome for two links they rarely press.

What makes the third answer different from the second is everything the page gained in between. **A public page is no longer navigated from the bar at all**: the breadcrumb sits at the top of the content, whole, and climbs to the Technology and on to the Catalog. The account is no longer a business card hanging off the bar but a full-screen sheet with 44px rows, so the sections are a thumb's reach apart rather than a 24px line in a 180px panel. And a viewer with no account loses nothing, because **both destinations are behind sign-in**: the strip showed a phone visitor two links that bounced off it, where `sign in` says the truth in one word and returns them afterwards. What a phone must still never have is a page with no way off it, and that is what the 404 and the error page spend their help pointer on.

**There is still no hamburger.** What opens is the account, which is the viewer's own menu and was already there: the sections are rows inside it, not a menu button added beside it.

### Verdict Line (signature)
A glyph plus severity label in the severity ink (`warning:` amber / `ok:` green), then the plain verdict in `text`, at Verdict scale. Below it, 16px down, the **Counts Panel** holds the two numbers the Summary claims.

**Page verdict (Dashboard).** The same line summarises all followed Technologies, at **Column verdict** scale and at the top of the Standing column: `warning: N need action` or `ok: nothing needs action`. It counts every Release the page shows as possible work, the window of the Stream and the Upgrade Path from the Version in use alike, each Release once (CONTEXT.md, Verdetto della Dashboard). When none of them carries a verdict the line is **muted info + `note: nothing judged yet`**, no ink, the same withdrawal the release page makes in its seventh state: with nothing to judge, `ok: nothing needs action` would be true of an empty set and read as reassurance. ⚠️ The claim is the **short form** of `nothing here can be judged yet`, and the shortening is the rule working, not an exception to it: measured in the live font at Column verdict scale, the long sentence is **516px inside a 360px column**, so it either wrapped over the list or ran across the Stream beside it. The copy gives way; the scale does not. ⚠️ **The line now wraps inside the panel it titles** (2026-10-14): 328px of panel against 365px of claim, and the copy had already given everything it had (see The One-Line Verdict Rule).

**Under it there is no counts row, and that is the point of the column.** The verdict used to be followed by two boxes of label-and-number pairs; what follows it now is the Standing itself, which is those same numbers written as the things they counted. `need action 3` in a box, over a list whose rows said `1 needs action` twice, is how the page came to contradict itself. The rows **are** the breakdown, the verdict is their sum, and the only counts still written as figures beside labels are the totals in the Standing Panel, which count something no row does: the whole.

**Page verdict (Upgrade Path).** `warning: N need action` first, then `note: N without a verdict`, then `ok: up to date` or `ok: safe to upgrade`. The muted count is an umbrella on purpose: it covers all of `missing`, while the Stat Row under it splits that same number into `N not summarized` and `N to check` (see Stat Row). **`to check` names the `unjudged` subset and nothing else, so the verdict may never print it**: with missing 4 and unjudged 1 the page reads `note: 4 without a verdict` over `3 not summarized · 1 to check`, numbers that add up instead of one number carried through three names. The Dashboard's `in use` line counts the same set and uses the same word.

### Note Lines
A key-points list separated by top and bottom 1px rules. Each row is a muted Mono `note[n]:` label with the info glyph in an 11.5ch column, followed by Grotesk prose that ends in a `release-notes:N` cite pointer.

**The index is not decoration.** A key point is numbered for the reason a breaking change is: a citation that leads into the notes has to be able to name the diagnostic it came from on the way back (see Source View), and `note[3]` is a name the reader can see on both ends. Each row is also the anchor that return lands on, so it carries an id and `tabindex="-1"`.

### Breaking Diagnostic (signature)
Rows in order:
1. Heading: coral octagon glyph with `breaking[n]:` (Mono 16px), then the Grotesk 18px title.
2. `-->` gutter + cite pointer with a line range (`release-notes:12-13`), in cyan Mono 13px with a dashed underline.
3. Quote row: the line number in the gutter, the muted Mono quote on `sunken`.
4. Caret row: `|` gutter, a hidden pad matching the quote text before the span, then coral `^^^` under the cited span. It is aria-hidden. **It is shown only while the quote stays on one line**: see "The caret row and its replacement".
5. `|` gutter + Grotesk explanation of what changes.
6. `=` gutter + cyan `help:` label with the wrench glyph, then the Grotesk migration text.
7. Optional fix diff: a `sunken` block with a 1px rule border, 6px radius and Mono 13.5px text. `-` lines are coral, `+` lines are green.

**The quote is cleaned, never rewritten.** The release notes are markdown, so a quoted line arrives with its list dash, its literal backticks and its links written out in full. The quote row drops the leading list marker, renders a backtick span with the Inline Code token and reduces `[#35290](url)` to a link reading `#35290`. Character-for-character fidelity lives in the Source View below, which is what its line numbers are for, and the stored quote is untouched: the verbatim check depends on it. Inside the well the Inline Code token keeps its mark and drops its geometry, with no 0.92em and no horizontal padding, because the well is a monospace grid that the caret row counts in characters; the span reads on `raised` against the `sunken` well and gets its air from a shadow, which takes no width. A link is marked with a dashed bottom border in cyan, for the same reason. The coral underline and the caret run both measure the cleaned line, so they mark the words and not the markdown punctuation.

### Counts Panel (Release)
The two counts a Summary claims, `4 breaking changes` and `4 key points`, in a mini-panel 16px under the verdict: the panel treatment the Source View, the fix diff and the Upgrade Path already carry (1px `rule` on `raised`, 6px radius, 8px/12px padding), set in Mono 14px `text-muted` with the numbers in `text`, 16px apart, each count linking to its section where that section exists. It is **as wide as its content** (312px at the full page) and never runs to the rule: a panel the width of the column reads as a section of the page rather than as the breakdown of the line above it. The numbers carry **no ink**, the breaking one included: the verdict directly above is already amber or green, and a second colour claiming the same fact would make the reader decide which of the two is the page's judgement.

It replaced two things, in this order. First a **closing tally line** after the diagnostics (`4 breaking changes, 4 with a suggested migration, all cited from the release notes`), which said at the end what the reader needed before starting. Then a **counts row beside the verdict**, which put a second thing on the display line and capped the Verdict scale at 2.8rem to keep both on it. Under the verdict they cost the line nothing, so the verdict keeps its token scale (see The One-Line Verdict Rule) and the numbers are read where the decision is made. Section titles do not repeat them: one number printed three times was the thing being fixed.

### Source View (signature)
A `<details>` panel on `raised` with a 1px rule border and 6px radius. The summary row shows a chevron (rotates 90deg, 200ms), `release-notes` and right-aligned muted meta (origin · line count). Lines are numbered by counter in a faint 6ch gutter. Headings are in `text`, body lines in `text-muted`. Following a cite pointer opens the panel, clears earlier highlights, applies `breaking-wash` or `help-wash` to the cited range (depending on the citing severity), centres the first line, and draws a 2px underline in that severity's ink beneath each cited span.

**Motion:** the underline reveals left to right (clip-path, 650ms, cubic-bezier(0.16, 1, 0.3, 1), 120ms delay). This is the app's only motion moment besides the chevron (see Motion; the landing adds an arrival per section, and nothing else does). Under `prefers-reduced-motion`, the underline appears immediately and smooth scrolling is off.

**The way back.** The interaction is a round trip, so the panel owes the reader the second leg: one `<-- back to breaking[1]` pointer, on a row of its own directly above the first line of the active range. The row keeps the line gutter but takes no line number of its own, so every number beside the lines being compared stays where it was; it carries the range's wash and the citing severity's ink, and the label is a Help Pointer Link turned around, with the arrow reversed and no `-->`. It **names its caller** (`breaking[1]`, `note[3]`), never a generic way up, so a reader with four breaking changes returns to the one they came from.

There is exactly **one** pointer, because exactly one citation is active: it moves with the citation instead of marking every range the reader has visited. Following it is a plain `#b1` link, which scrolls, focuses the diagnostic heading (`tabindex="-1"`, so the keyboard does not stay inside the panel) and leaves Back pointing at the cited line. It sits on the row above the focused line, which makes **Shift+Tab** the key that reaches it: the key that already means back. The return **draws nothing and animates nothing**: the underline on the way in stays the only motion moment.

### Summary States
Vocabulary: `ready` (verdict `action required`, `safe to upgrade`, or no verdict at all), `pending` / `processing`, `unavailable`, `skipped`, `failed`. Non-ready states replace the verdict with a Status-scale line and a muted explanation paragraph:
- pending: muted clock + `pending: summary queued`
- unavailable: muted info + `note: no release notes to summarize` (the source view is hidden and "View on GitHub" is offered)
- skipped: muted info + `note: no summary for this older release`
- failed: coral x-circle + `error: summary unavailable`

**The seventh state: a ready Summary with no verdict.** When the release notes only point somewhere else instead of describing what changed, the verdict line is **muted info + `note: not enough notes to judge`**, at the same Verdict scale the two verdicts use, and a muted paragraph at the measure follows it. The **Counts Panel comes after that paragraph**, the one place it does not follow the verdict line directly: `0 breaking changes` read before the sentence saying the zero is not a claim is exactly the misreading the paragraph exists to prevent, and in this state the verdict is the line plus the withdrawal under it, so the panel is still under the verdict. Everything else stays: the counts, the title, the key points and the provenance are all still what the Summary says. The state carries **no ink**, like 404: a judgement we cannot make is an absence, not a failure, and the paragraph says where the notes that could be judged are rather than apologising. It is the only state in which a verdict is withdrawn rather than missing, so the paragraph is the part that does the work: without it the reader is left with a claim taken back and no next move. `action required` is never withdrawn this way, because a listed breaking change is a fact the notes stated.

The release notes stay available below in every state except unavailable.

### Page States (404 and error)
The two pages that replace a page instead of a part of it use the same grammar at whole-page scale: the top bar with both sections in the slot (so neither page is a dead end), then a Status-scale severity line as the `h1`, then one muted Grotesk paragraph at the 72ch measure, then the ways out.
- **404**: muted info glyph + `note: no page at this address`. It carries **no ink**: an address that names nothing is the absence of a thing, not a failure, and the paragraph says so rather than apologising. It ends in a `-->` help pointer to the catalog.
- **Error**: coral x-circle + `error: this page could not be loaded`. The paragraph says what failed and that nothing changed, never what threw. A `Try again` button sits beside the same help pointer, and the error digest follows in Meta `text-faint` as `reference <digest>`: the only detail printed, because it is the one string that matches the failure to its server log.

### Significance Glyphs
12px SVG shapes on a 12-unit grid, paired with a Mono 13px lowercase label word in `text-muted` and a 6px gap: featured (filled diamond), notable (1.5px outlined diamond), digest (2-unit radius dot), preview (outlined diamond with a 2/1.6 dash). They are neutral (see The Neutral Significance Rule). They mark rank, not risk.

### Technology Mark
A Technology can carry its own mark beside its name: a 16px monochrome SVG glyph drawn in `currentColor`, `aria-hidden`, with 8px between it and the name. It appears in the Catalog row and in the Stack row of `/technologies`, in the Dashboard's own picker and Standing, and, at 24px, beside the headline of a Technology page. It is the brand's **shape** and never its colour: no brand tint, no two-tone logo, no tile or circle behind it (see The Severity-Only Colour Rule). It says which Technology the line is about, so it only appears where the subject is a Technology, and never on a Release row, where a glyph already means Significance (see The Neutral Significance Rule).

**A Technology without a mark keeps the space and shows nothing.** The glyph box is always in the row, so every name starts at the same x and no row changes height whether its mark exists or not (see The Reserved Space Rule). There is no invented placeholder and no initial letter: an initial is the name a second time, in a worse typeface. SvelteKit is deliberately left unmarked, because the only mark that exists for it is Svelte's own, and two rows of one list wearing one shape takes away exactly what the mark was added to give.

### Stat Row (signature)
A `git diff --stat` line for each major version, and it **is that major's group title** (Mono 14px, 12px gaps, 8px under it, a 1px `rule` closing the line to the right edge). It was a list of its own above the list until #142, which is how the page came to count the same Releases three times inside 166px. In order:
1. The major (`v6`) in `text`.
2. A faint `|` gutter.
3. A proportional bar, 8px high, whose width is the group's release count relative to the largest group (the largest is 100%, with a 28px minimum). Segments are separated by 2px and filled neutrally in significance order: featured `text`, notable `text-muted`, digest `rule-strong`. The bar is aria-hidden. **Under it, and only where the group has one, a 2px rule in `action`** spans the share of that group's own width that needs action. It is the single hue a bar carries, and it is a rule and not a fourth segment because it counts Releases the segments have already counted: amber means action required everywhere else in the app, so it keeps that meaning here instead of adding a tint for a significance level. Significance stays a shape, never a hue (see The Neutral Significance Rule).
4. The counts in words, in `text-muted` and using the list's own vocabulary (`4 releases · 1 featured · 3 digest`, `2 notable, 1 not summarized`, and `1 to check` for one whose notes could not be judged). When a group has a release that needs action, it appears inline as the warning glyph plus its own count in `action`: `1 needs action`, `2 need action`. **It carries a number because the row is made of numbers**, and a bare `needs action` would be the only mute part of a line where every other part counts something; it is also the second count of Releases the partition has already counted, and a count with no figure cannot be read as one. The label word `warning:` is not repeated here: it belongs to the verdict line, where it names the severity of the whole page, while in the row the glyph and the amber do that work beside a phrase that already says what is being asked. **The dot is the partition and the comma is what cuts across it**: the levels joined by dots add up to the count the row opens with, while `needs action` and the unsummarized counts count some of those same Releases a second time and come after a comma. A reader must never be left adding five numbers into four.

The bar never stands alone: every segment is also counted in words. **The bar needs two groups.** With one, its width is 100% of itself on every path, the same picture for every Technology, and the lane goes while the words stay: the gutter, the bar and the legend are all dropped together, and the row keeps the major and its counts. A legend (Mono 12px, `text-faint`), at the head of the column and before the bars it explains rather than below them, repeats each significance shape glyph next to a 10x8 swatch of its bar fill and the label word, and ends with the amber lane as `needs action`, with no number, when a bar draws it: the legend explains a fill, and the counts belong to the rows. It lists only the significance levels that appear in the bars, so it never explains a fill the reader cannot find. **It is read out as well as seen**: it is the one place where shape, fill and word are mapped to each other, so it is a list with the name `Bar fills` rather than a row of bare words arriving after the rows that just said them. The glyphs and swatches inside it are aria-hidden, because the word beside each one is the content.

### Release Row
One release per row: significance glyph and label, the version as a Mono 16px `text` link (underlined on hover), a Mono 13px `text-faint` ISO date, and a content column. The content column holds the Grotesk 500 16px/1.45 summary title, then a Mono 13px row verdict with its glyph at 0.95em: `warning: action required · 4 breaking changes` in `action`, or `ok: safe to upgrade` in `ok`. An action release also lists its breaking changes (coral octagon + `breaking[n]:` Mono 13px, then Grotesk 14px/1.6 titles) and ends with a `-->` help pointer to the release page (`--> migrate to vite 6.0.0`).

**Neutral row verdicts.** A release without a ready summary puts a neutral status in the verdict slot, with no ink: the info glyph + `note: no summary for this older release`, or the **clock glyph + `pending: summary queued`** for previews still waiting for a summary. Each is followed by **`read the release notes` on a line of its own**, a link in the **interactive green** with the Help Pointer's 1px dashed underline, and no arrow (see Help Pointer Link), **except where there are no notes to read**: ⚠️ **the link had a line to share and a `·` before it until 2026-10-14**, and on that shared line its four words broke wherever the column ran out, `read` on one line and `the release notes` on the next, in a different place at every width, so what the reader saw split was the link itself; a `·` separates facts on one line and never two lines, so it went with it. a release whose notes do not exist reads **info glyph + `note: no release notes to summarize`** and nothing follows it, because a row never names an action it cannot offer. A release whose notes could not be judged reads **info glyph + `note: not enough notes to judge`** in the same slot: the row says the Summary is there and the verdict is not, and the paragraph that explains it belongs to the release page, not to a row. One function answers this for every surface, the dashboard included, so a release reads the same way wherever its row is printed.

### Digest Row
Consecutive digest releases fold into one `<details>` row between rules: the digest glyph and label, then a Mono 13px muted summary (`14 digest releases · 5.2.1 to 5.2.14 · no action needed`), then a right-aligned chevron that rotates 90deg (200ms, same curve as the source view, no transition under reduced motion). On hover the summary text turns `text`. When open, the versions show as a Mono 13px auto-fill grid (22ch minimum per cell), with versions in `text` and dates in `text-faint`, indented to the content column. For mobile behaviour, see Layout.

### Upgrade Panel (signature)
Everything between the header and the verdict sits in one panel, and nothing between them sits outside it (the verdict under it is a panel of its own, see Path Panel): the panel treatment the Source View and the fix diff already carry (1px `rule` border on `raised`, 6px radius, 12px/16px padding, 24px below the header). **In the split it is the width of its column** and carries no cap of its own; the 72ch measure comes back only at 1040px and below, where the panel would otherwise run the width of the page, and goes again below 640px, a Mono 12px `text-faint` caption reading `upgrade path`, then rows of label and value, 8px apart. The panel is a region named by its caption.

The rows, in order: `in use` with the declaration control, the day it was declared under it, `from` with the Upgrade Path control, whatever that field has to say, and `latest`. The label column is **7ch in the 360px column of the split and 9ch where the panel has the width of the page**: 9ch is the width of the longest label, and in a column this narrow those two characters are air the field needs. The value column is left-aligned behind it rather than pushed to the right edge the way a list of numbers would push them: two of these values are a field and its buttons. Rows align on the baseline, so a cell that wraps on a phone keeps its label beside the field instead of beside the button under it. Below 640px the label takes a line of its own, because at that width a 7ch indent is a column 7ch too narrow for the value beside it. A line that belongs to the row above it keeps the value column only where the panel is wide: in the 360px column, and again on a phone, it gives that indent up and takes the width.

### Path Panel
The verdict of the path and the counts behind it, in a second panel under the Upgrade Panel and of the same chrome: 1px `rule` border on `raised`, 6px radius, 12px/16px padding, 24px below the panel above it. **It has no caption**: the verdict is the panel's title, at Column verdict scale, and a caption over it would name the box twice. The panel is a region named by that verdict.

⚠️ **The verdict wraps here**, where the same line was `whitespace-nowrap` while it stood free in the column: outside a box a long claim bled into the gutter beside the column and nobody saw it, and `note: 4 without a verdict` printed 16px past the panel's own border the moment it had one. A box is a measure, and the line gives way to it.

Under it the counts, **laid out exactly as the Standing Panel lays its totals out**: the name on the left, the figure right-aligned and tabular on the right, Meta in `text-faint` with the figures in `text`, as a description list. The two panels are read on two different pages, so a reader who learns one has to be able to read the other without learning it again. The rows, in the order the path is read: the total with the two Versions beside it (`releases, 15.5.27 to 16.3.8`), then `needs action`, `safe to upgrade`, `no summary yet`, `notes too thin to judge`, `digest fixes you can skip`, each only where its count is above zero. ⚠️ **No `·` anywhere in them**: a `·` separates facts on one line, and these facts are lines. A path with nothing in it has no counts to lay out and keeps its one sentence instead (`2.1.0 is already the latest stable release.`).

The way back to the whole recorded history is the **last row of the panel**, a Help Pointer Link (`--> show all 86 releases`), because it is the control that empties the `from` field and not a fact about the path.

**These counts were one sentence until 2026-10-14**, and it wrapped over four lines: a reader counting what they faced had to read prose to find the numbers again, and the numbers are the reason the box exists.

**The Upgrade Panel holds two different actions, and they are told apart by their rows, not by a box each.** Declaring the Version in use and reading an upgrade path are not the same act, and `Save` and `Check` must not look like two ways to do one thing. What separates them is that each control sits on the row of the fact it changes, under a label that names that fact: the version in use, and the version the path starts from. Two panels were the first direction and were given up on purpose: at 390px there is no width for a pair, and two boxes have to be levelled in height for no reason the reader can see.

**The fields.** Both are the same control, 38px `sunken` fields 14ch wide, set in Mono 16px `text`, with a 1px `rule-strong` border and 6px radius; the border turns `text-faint` on hover and `breaking` when `aria-invalid`. The buttons are the standard 34px. The `from` field suggests known versions through a datalist. Each field's visible label is its row's word, and its accessible name is the longer `Version in use` and `Upgrade from`, which contain the visible word as WCAG 2.5.3 asks: a name that still says what the field is wherever it is read out of the panel.

**Declared start.** When the path starts from a declared Version in use rather than a typed one, the `from` field arrives prefilled and **nothing says so in prose**: the `in use` row two lines above carries the same version and the day it was declared, and a note under the field repeating both was the same fact written twice 100px apart. The date is not decoration: the counts below are built on a declaration nothing ever checks, so what they rest on stays on the screen, in the row that owns it.

**Derived start.** With nothing typed and nothing declared, the field arrives prefilled with the start the page derived (CONTEXT.md, Cammino di upgrade) and a muted line under it, linked by `aria-describedby`, says which Release it is and why: the info glyph + `note:` label, then `starting from 7.1.9, the last release of the previous major, because no version was given.` The path below it is the page at rest, not an answer to a question: whatever the start, a Help Pointer Link under the last group reads `--> show all 53 releases` and leads back to the whole recorded history, which is the page with an empty `from`.

**The whole recorded history.** An emptied field asks for the history, and the view it asks for keeps the orientation a path gives and makes none of its claims. Under the form sits a Mono 14px `text-muted` line, the info glyph and a `note:` label, then `the whole recorded history, 57 releases in 4 majors.`, counting upcoming Previews apart when there are any. The Stat Row follows, newest major first, like the list under it and unlike a path, which is read in the direction the upgrade is performed. Then a Help Pointer Link turned around, `<-- back to the upgrade path`, with the arrow reversed and nothing else changed.

**There is no verdict here, and this is the rule, not an omission.** A verdict on this view would be computed on an upgrade from the oldest recorded Release, which nobody performs: correct, and worth nothing. The product's credibility rests on not claiming more than it knows, so the view that has no start says what is on the screen and stops. The link that leads here counts the Releases the list prints, not the ones recorded: a link that promises completeness promises the number the reader can count on arrival.

**Invalid version.** An error line under the field, linked by `aria-describedby`: the x-circle glyph + `error: 5.9.0 is not a Vite version. Did you mean 5.4.0 or 5.4.11? The path below is still from 5.2.0.` Everything is in Mono 14px `breaking`. The suggested versions are links that inherit the ink and keep the underline. The page keeps showing the last valid path.

### Version in Use
The first row of the Upgrade Panel, which is where a Developer who follows the Technology declares the version they are on: the Mono 14px `text-muted` label `in use`, the field, `Save`, and a `Clear` that appears only once something is declared.

One slot under it says whichever of three things is true, in Mono 14px: `declared 2026-09-12` or `not declared` in `text-faint`, or, after a refusal, the error line in `breaking` with the field `aria-invalid`. It is the field's accessible description in all three cases, so the state of the declaration is read out with the control and not left to the eye.

It is never inked: a declaration is a fact the Developer entered, not a verdict. It appears only for a followed Technology, a retired one included, and never for a Visitor. **Nothing is reserved for it** while the session and the follows are unknown, unlike the Follow in the header: for a Visitor the row never arrives, and holding a hole open for the commonest reader of a cached page is worse than the row landing once there is something true to say (see The Reserved Space Rule).

### Retired Note
When a technology is retired, a muted note sits between a top and a bottom 1px `rule` (12px vertical padding, 24px above): the info glyph + Mono 14px `note:` label in `text-muted`, then Grotesk prose in `text-muted`. It is a note, not an error: no ink. Follow and upcoming previews are hidden.

### Help Pointer Link
A navigational link in compiler grammar: Mono 13px, a faint `-->` arrow (aria-hidden), a 1ch gap, then the lowercase label in the **interactive green** with a 1px dashed underline in the same ink that turns solid on hover. Used for migration links on release rows and for `browse all 42 technologies`. It sits 12px below the content it follows.

⚠️ **The arrow used to say two things in one colour, and the green is what separates them** (2026-10-14). A pointer that leads to **another screen of the product** is interactive and green: `--> see them on your dashboard`, `--> show all 53 releases`, `<-- back to the upgrade path`. ⚠️ **`read the release notes` takes the label and not the arrow** (2026-10-14): it sits under the row verdict, on a line of its own, where an arrow would point at nothing, so it carries the green and the dashed underline alone (see Neutral row verdicts). Those two are also what tells it from the words beside it: `text-muted` next to the row's own `text` measures 2.1:1, and a link inside a sentence may not be distinguished by colour alone (WCAG 1.4.1). A pointer that leads **into the release notes** keeps `help` cyan: `--> release-notes:12-13` and the `<-- back to breaking[1]` leg, because that cyan is not the colour of a link there, it is the colour of the citation, shared with the wash on the cited source line and the `help:` remedy line it belongs to. The grammar is identical and the destination is not, which is the distinction one colour was hiding.

### Standing Column (signature)
The left half of the Dashboard, and the answer to *where does my stack stand*. It is headed by the **Standing Panel**, which is titled by the page verdict and carries the totals under it, then by the list. ⚠️ **The caption that used to title the panel is gone** (2026-10-14, `where your stack stands · by distance`): the verdict already names what the column is about, and the caption named it a second time, in words a reader had to pass before reaching the one that counted. The ordering is named by the list's own group name instead. The panel is the Path Panel of the Technology page with the same parts in the same places, and the two are kept that way on purpose. For the sticky behaviour, the self-scrolling list, the hidden scrollbar and the fade, see Layout.

**Standing Row.** One per followed Technology, always, and never more than one: this is the surface where a Technology is accounted for exactly once (see The Two Questions Rule). The row is a link to its Technology page and holds, on the first line, the name at Grotesk 500 16px and the version right-aligned in Mono 14px `text-muted`, and on the second, 2px below, the state line in Meta: the Distance bar, then the words. It opens with the **Technology Mark**, in the text's own ink and in the box that is there whether the shape exists or not, so every name in the list starts at the same x: the column is a list of Technologies, and the mark is what the eye finds a Technology by before it reads a word. It carries **no significance glyph**: a row is about a Technology, not about one of its Releases, and a glyph here would say which Release it meant while the line beside it said something else.

**The words, and they are the content.** One of: `N needs action` / `N need action` in `action` (the whole second line takes the ink, bar included); `N behind 15.0.0` naming the declared Version in use; `up to date`; or **`no version declared`**, with **no bar at all**. ⚠️ A Technology with no declaration has **no Distance** (CONTEXT.md), so there is nothing for a bar to be a share of: drawing one would be inventing the single number this product promises never to invent. Those rows also lose their place in the ordering, sitting after every row that has a Distance and before the ones that are up to date.

**The Distance bar.** A 4px track on `sunken`, 2px radius, filled from the left with `rule-strong`, or with `action` on a row that needs action, its width being that row's Distance as a share of the largest Distance in the list. It is `aria-hidden` and it is the only drawn measure in the whole system: it earns its place because the list's order *is* the distance and the bar is what makes that order readable down fourteen rows, and it stays honest because **the number is always written beside it in words**. It is not a hue carrying a verdict: amber appears on it only where the row's own words already say `needs action`, which is the meaning amber has everywhere else (see The Severity-Only Colour Rule). It follows the Stat Row's reasoning, and like the Stat Row it goes rather than lies: with fewer than two rows that have a Distance, every bar would be 100% of itself and the lane is dropped while the words stay.

**The Standing Panel.** The head of the column, and the one raised surface on the Dashboard: `raised`, a 1px `rule` border, a 6px radius and 16px of air inside, 24px above the list. It holds the column's title, then the totals as a definition list, one figure per row in Meta with the label left and the value right-aligned in `text` and `tabular-nums`: `releases behind in all 23`, `without a verdict 6` where there are any, and `oldest version declared 2026-09-12`, the oldest declaration named because a total is only as fresh as the stalest thing under it. They are **rows and not one sentence**: these numbers are what the column is read for, and the sentence that used to carry them wrapped over three lines at 360px and hid them in prose. Under them, in Meta `text-faint`, the line that says what the bar is (`the bar is the distance from the version you declared, not a score`), which is not a caption to be dropped when space is tight: the bar is the one thing on the page a reader could mistake for a score. Where nobody declared a Version in use there is no count to print, and the panel keeps its title alone.

⚠️ **It is a surface, and the direction says hierarchy comes from typography and gutters, not cards** (Creative North Star). It is allowed because it is the raised plane the North Star already grants, the same one the Proof Panel and the Source View stand on, and because what it holds is not a row of the list in a box: it is the one block on the page that counts the whole, and the totals it carries had no edge of their own under the list, where they read as a wrapped footnote. It is the only surface on the Dashboard, the figures inside it are the only ones written beside a label (see the counts row that was removed), and it draws no shadow.

### Section Title
The Section title (`breaking changes`, `framework (8)`) and its hairline rule. Every count in a section title counts the rows that belong to it, so the titles agree with each other and with anything that counts the same set elsewhere. **On the release page the title carries no count at all**: the Counts Panel under the verdict prints both numbers, and one number printed three times was the thing being fixed (see Counts Panel). What the title may carry instead is a faint aside naming what the section guarantees, `all cited, each with a fix`, and it says `each with a fix` alone where a change arrived without a quote: the schema requires the migration, never the citation.

**The Dashboard has no section titles**, and had the only legend there was: a significance glyph, its label word and a faint fact, under a title like `spotlight (3)`. It existed to say which one Significance a section listed. With no sections there is nothing for it to name, and the Significance glyphs in the Stream are explained where a reader meets them instead (see Stream Row).

### Stream Row (signature)
The right half of the Dashboard is one stream in date order, and the answer to *what came out*. Its title is in Meta and names its window and its size (`what happened · last 30 days, 32 releases`). Under it, one block per day: the ISO date in the date cell with the This Week Mark under it, and the day's events beside it.

An event is the Release Row's content, with the Technology named because the stream mixes Technologies: on the head line, the 12px significance glyph, the Technology name at Grotesk 500 1.1rem and the version in Mono 1rem `text-muted`; then the summary title at the 72ch measure; then the Mono 13px row verdict; then the breaking list; then the `-->` help pointer. One function produces the verdict for every surface, so a Release reads the same here as on its own page (see Release Row).

⚠️ **The significance glyph stays neutral here, whatever the verdict says.** It is drawn in `text`, `text-muted`, `text-faint` or `rule-strong` and never in `action`, `breaking` or `ok`, because Significance is a shape and severity is a glyph of its own (see The Neutral Significance Rule). The severity is already on the row, one line below, with its label word beside it: tinting the diamond amber says the same thing a second time in the one channel the system reserves for rank, and it is the mistake the first mock of this direction made.

**Nothing in the stream counts how far behind you are.** No `in use` line and no `N behind`: a Distance is a count over a set, the set is the Standing's, and a Release row that counted it again would be the old contradiction rebuilt one column to the right (see The Two Questions Rule). What a row **may** say is the one fact that is about this Release and not about a set: `· you are on 15.0.0`, in Meta after the verdict, which cites the declaration rather than counting from it, and only where the declared version is older than the Release the row is about. The first mock of this direction wrote `· you are on 15.0.0, 4 behind`, and the four was the Standing's number arriving in the wrong column.

### In Use Line
Where the Version in use shows up on the Dashboard. There used to be two of these, a line of totals in a box and a line per Technology in the section that opened the page, and between them they printed the same declaration three times on one screen. Now there is **one place**, the Standing Row's state line, which names the declared version in its words (`4 behind 15.0.0`) and says `no version declared` where there is nothing to name.

The day of the declaration is said **once for the whole page**, in the Standing Panel (`oldest version declared 2026-09-12`): the counts rest on a declaration nothing ever checks, so what they rest on stays on the screen, and the stalest one is the one that qualifies the lot. Releases with no ready summary count apart, on their own row (`without a verdict N`), the word the Upgrade Path verdict uses for the same set (see Verdict Line). Nothing here carries ink unless the row needs action, and nothing adds a link: the row is already one.

For a Developer who declared nothing anywhere, every row reads `no version declared`, the panel keeps its title and prints no totals at all, and the Standing is still a complete list of what is followed: the column answers *where does my stack stand* with *you have not told me*, which is an answer and not a hole.

### This Week Mark
Under the ISO date, a Mono 12px `text-muted` `this week` stacks in the Stream's date cell for a day in the current ISO week (UTC). It is neutral: no glyph, no ink, no badge. It marks the day, not each Release of it, because the date cell is the day's.

### Weekly Digest
Digest releases still fold per ISO week, and the fold is no longer a section: it is **the quiet end of the Stream**, where a stretch of time that asked nothing of the reader takes one row instead of a list.

The row keeps the Stream's own two-column grid, entirely in Meta: the span of weeks in the date column (`weeks 46 to 49`), then one line saying how much is folded in and that none of it is asking anything (`23 more releases, none asking anything`), then the way in, `open by week ›`. It is **one row for the whole quiet stretch**, not one per week: four rows each saying a different week was silent is four rows saying nothing, and the window's own title already counts every Release the page has.

Opened, the weeks are `<details>` rows between rules, closed by default, each a grid (14ch, content, chevron): the digest dot + `week 49` in `text`, then Mono 13px muted `9 digest releases · Dec 2 to 8 · no action needed`, then the chevron (same rotation and curve as the Digest Row). Inside, lines run newest first in a 28ch auto-fill grid: the Technology name in `text-muted`, the version link in `text` and a faint `MM-DD` date.

### Empty State (Dashboard)
**With no follows the page is one column, not the split**, and the page keeps its own 1240px container with the content capped at 1040px inside it, rather than centring a 1040px column: a centred column leaves the wordmark and the account panel 100px off the content they open, which is the one thing the bar's container rule exists to prevent (see Layout). It keeps Status scale rather than Column verdict: the split exists to separate two questions, and with nothing followed neither has an answer, so half the page would be an empty measure holding a sentence about its own emptiness. It is also the page a Developer sees first, which is the worst one to meet half empty. The split arrives with the first follow, and the only thing the two states share is the top bar.

With no follows, the verdict slot holds a Status-scale muted line: info glyph + `note: you follow no technologies yet`. Below it are a muted Grotesk intro paragraph (72ch) and a Mono 14px muted live count (`aria-live="polite"`) `N of 10 followed`, with the number in `text`. Once N is above 0 the claim reads `you follow N technologies` and an `Open dashboard` button appears beside the count. A catalog picker follows under a section title, the same rows as the Technologies page and in their new two-line shape (see Catalog Row): the Technology Mark and the name (Grotesk 600 16px) linking to its Technology page, with the Follow at the right edge, then the Mono 13px faint facts under them (`latest 19.0.0 · library for web and native UIs`, version in `text-muted`), ending with a `-->` help pointer to the full catalog.

### Dashboard States
The states the landing never had, and the reason this direction is written here before it is drawn. All four obey The Reserved Space Rule: no skeletons, no pulsing blocks, nothing that imitates the shape of what is coming.

**Loading.** The split is in place from the first paint, both columns at their widths, and **the Standing resolves first**: it is the column that answers the question the page was opened for, and it is also the smaller query. While a column has nothing yet, its title is there (it is a fact about the page, not about the data) and under it sits one Meta line in `text-faint`, the clock glyph + `pending:` and what is being waited for (`pending: reading where your stack stands`). The panel that carries the verdict is not there yet, and nothing stands in for it: a verdict is a claim, and a page that has not counted anything yet does not get to make one, not even a muted one. ⚠️ The reserved verdict slot above the panel went with the caption (2026-10-14): the verdict is the panel's title now, so what used to be held open is the panel itself.

**Error, in one column only.** The two columns fail apart, because they are two queries, and one that failed must not take down one that worked. The failed column keeps its title and its reserved space and holds the error at The One Error Measure (Mono 14px/1.7 in `breaking`): the x-circle glyph + `error:`, what failed, that nothing changed, and a `Try again` that reloads **that column alone**. ⚠️ **When the Standing is the one that failed, the verdict goes with it**, replaced by nothing: the verdict's number is the Standing's sum (see The Two Questions Rule), so a page that cannot read the Standing cannot honestly print a verdict over the Stream it did read. A whole-page failure is the Page State, unchanged.

**Quota.** The count of follows lives in the top bar on every page and the Dashboard adds nothing of its own, except at the wall: at 10 of 10, the Standing Panel takes one more Meta line, the info glyph + `note: 10 of 10 followed · unfollow one to follow another`, the same words as the Limit Note because it is the same fact, and `/technologies` is where the sentence leads. It has no ink: a Plan's limit is a boundary, not a failure. Below 10 the Dashboard says nothing about the quota, since a page about the stack is not the place to be reminded how much room is left in it.

**The row under the pointer.** A Standing Row takes `raised` across its whole width, with no other change: no shift, no border that was not there, no ink that arrives. A Stream event gets **no hover at all** and this is deliberate: it is not a link, it is a block of text with links inside it, and a surface appearing under a paragraph says the paragraph can be clicked. Inside it, the version link and the help pointer carry their own hover, which is the underline they already own. Both are states of the pointer and of focus alike: `:focus-visible` draws the focus ring and the hover surface at once, so the keyboard sees what the mouse sees.

### Stack Column (signature, Technologies)
The left half of `/technologies`, and the answer to *what is in my stack*. It is headed by the **Stack Panel**, which names the column and counts the quota, and then by the list, which scrolls inside itself so the panel never leaves. The title is in Meta and names the ordering, as every column title does: `what you follow, by name`.

**By name, and with no bar.** The Dashboard's Standing answers *where does my stack stand*, so it is ordered by Distance and draws it; this column answers *what is in it*, so the ordering is the alphabet. ⚠️ A Distance needs a declared Version in use, and this page declares none and reads none: a bar here would be a measure of nothing, which is the single number this product promises never to invent (see The Two Questions Rule).

**Stack Row.** One per followed Technology, always, and never more than one. Two lines, 12px of vertical padding, no left padding and a 1px `rule` below (none under the last; the list carries a top `rule-strong` instead). On the first line: the **Technology Mark** in the text's own ink, in the box that is there whether the shape exists or not, so every name starts at the same x; then the name at Grotesk 600 16px, linking to its Technology page; then the latest Version pushed to the right edge in Mono 14px `text-muted` with tabular numerals. On the second, 2px under, in Meta `text-faint`: the Category, which **ellipsises rather than wraps**, so a long one cannot turn a row into three lines, and then the way out of the follow at the right edge. No significance glyph: a row is about a Technology, not about one of its Releases.

**`unfollow` is a quiet text control, not a bordered button.** 24px high, 8px of padding, a 4px radius, no border and no surface: `text-faint`, going `text-muted` while the row is hovered and `text` on a `sunken` surface under its own pointer, with the focus ring every control has. Ten bordered buttons down a 360px column is a form to fill, and this column is a list to read. It is a real target all the same: 24px of height, reached by the keyboard in row order, with an `aria-label` naming its Technology, and the row's own hover band is what the thumb aims at (WCAG 2.2 AA 2.5.8).

For the sticky behaviour, the self-scrolling list, the hidden scrollbar and the fade, see Layout.

### Stack Panel (Technologies)
The head of the left column, and the one raised surface on the page: `raised`, a 1px `rule` border, a 6px radius, 16px of air inside and 24px above the list, exactly the Dashboard's Standing Panel (which is where the argument for allowing a surface at all is written). It holds the column's title, then the quota as a definition list, one figure per row in Meta with the label left and the value right-aligned in `text` and `tabular-nums` on a subgrid, so the figures line up on their last digit: `followed 6`, `left on your free plan 4`. Under them, over a 1px `rule`, the one line that says what the column is for, and it is a **Help Pointer**: the faint `-->` and the `help` label, `see them on your dashboard`. It used to be a plain faint sentence, `what you follow is what your dashboard shows`, which named a destination and gave no way to go there.

**It is also the only hue on the page, and it is not an accent.** The Dashboard carries `breaking` and `action` because Releases there are judged; `/technologies` judges nothing, so there is nothing for a severity ink to say, and inking a Category, a chip or a Mark to liven the column would spend the one channel this system reserves for severity on decoration (see The Severity-Only Colour Rule). What the page may carry is what it already means: the navigational `help` of a pointer, the `help` caret in the filter field, the `focus` ring, and `breaking` on a row the database refused. Nothing else is coloured, and that is why the red on the Dashboard still reads as a verdict.

**The quota is counted exactly once on this page, and this is where.** It used to be printed three times inside the first 60px: in the bar, in a Status-scale `note: you follow 7 of your 10 free follows` that was 36.8px tall, and again in the `following (7)` section title. So the bar drops its quota here (see Navigation), **the page has no verdict line at all**, and the Catalog names the wall without a number (see Limit Note). A page about what you follow does not need to be told four times how much room is left in it.

**The figures are a polite live region.** A press moves a row from one column to the other and the focus follows it, so the eye is told; the ear is told by the panel, whose figures sit in `aria-live="polite"` and read back as the count they are. The Status-scale line that used to carry the announcement is gone, and its job is not: this is where it moved.

**The empty Dashboard keeps its own `N of 10 followed`, and is right to.** Its intro paragraph says `The Free plan follows up to 10` two lines above, so the quota is named there in full, and it has no panel to put it in.

### Retired, Still Yours (Technologies)
The retired Technologies **close the left column**, 24px under the list, because being followed is the only reason they are shown at all: a retired Technology nobody follows is not in the Catalog, and it is in no sense something that could be added to a stack. Its own Meta title (`retired, still yours`) and, 8px under it, its own note in Mono 13px/1.6 `text-faint`: no longer in the catalog and getting no new releases, past Releases stay readable, they still count toward the free plan, and once let go they cannot be followed again. Then the rows, over a 1px `rule`, in the Stack Row's shape with the Version prefixed `last `.

Letting one go replaces the control with a Mono 13px `text-muted` `role="status"`, right-aligned, `let go, for good`. It is **the one row that does not move**: once unfollowed it belongs to no column at all, so there is nowhere to move it to, and it says its final thing where its control was.

### Catalog Column (Technologies)
The right half, and the answer to *what could go in my stack*. Its head is one line: the title in Meta, naming the ordering in force (`what you could add, by category`, or `by latest release`), with the layout toggle right-aligned on the same line. Under it one Meta `text-faint` intro, the mirror of the panel's one line: `each release here is summarized once, for everyone`. The two columns each explain themselves once, in the same voice and at the same size. ⚠️ It is **capped at 52ch and kept short on purpose**: the line sits under the head, so a sentence that runs the column's full width passes beneath the layout choice at the right edge and starts reading as its caption. The first copy ran 90ch and did exactly that.

Then the filter, the Category chips, the ordering, and the groups. **The Catalog is read by Category**, in the ten groups `CONTEXT.md` declares and in its order (`language`, `runtime`, `framework`, `server framework`, `database`, `build tool`, `testing`, `lint and formatting`, `library`, `platform`), none above eight rows, each a `<section>` with a Section title counting the rows that belong to it. A group loses a row the moment it is followed, because the row has gone to the other column: `framework (8)` reads `framework (7)` on the same tick the panel reads `followed 7`. While filtering, a group title reads `framework (2 of 8)` and a group with no match is hidden. **A followed Technology is in the Catalog's groups not at all**: it is in the stack, which is the column beside it, in full view.

**A press moves the row across the split, and the focus goes with it.** The lists are painted from the follows rather than patched where they sit, so the row leaves one column and arrives in the other on the same tick, and the Follow at its new place takes the focus: the keyboard lands where it was pressing. Nothing animates, so the caret draw stays the app's single motion moment. The reasoning is the one issue #86 and the Developer reports before it settled: a page that showed a row under `catalog` with a `Following` toggle contradicted itself, and making the counts alone live did not fix finding the row you had just followed.

### Catalog Filter
The field gets a line of its own. A Meta `text-faint` label above it (`find a technology`), then a 42px `sunken` input, full width to a 38ch cap, Mono 16px `text`, a 1px `rule-strong` border turning `text-faint` on hover and on focus, a 6px radius, a `text-faint` placeholder (`name or description`) and a `help` caret. Under it, 8px below: the match count in Mono 13px `text-muted` with the figure in `text`, then the hint in Meta `text-faint`, `press / to find, esc to clear`. It is a `role="search"` region and the input is 16px, which is what keeps iOS from zooming the page to read it.

**Why the label moved above the field.** The line used to be one sentence with four unrelated parts on it, a label, the field, the count and the hint, and the eye had to pick the field out of the row. The field is the thing, so it gets the line; everything about it goes above or below.

**The count says where it is counting.** Unfiltered `37 technologies`, filtered `3 of 37 match`, and with a Category chosen `5 of 8 match in framework`, so a small total never reads as a small Catalog. It counts **the Catalog only**, never the stack: the stack is beside it in full view, and a count covering both would print a total neither column holds.

**`/` and `Esc`.** `/` puts the focus in the field and selects what it holds, so the next keystroke replaces it, and it is only a shortcut while nothing else is listening: a `/` typed into a field, or with a modifier held, belongs to whoever has the focus. It is announced by `aria-keyshortcuts="/"` on the field, which is the half of the announcement a faint line cannot make. **`Esc` empties the field and keeps the focus in it**, which is why the hint names both keys and in the order they are pressed. The hint is a fact and not a control, so it has no border and nothing to press, and it goes at 640px and below with the keyboard it talks about.

### Category Chips
The ten Categories as chips, in `CONTEXT.md`'s order, with `all` first: 28px high, 12px of padding, a 1px `rule` border, a 6px radius, Mono 13px `text-muted`, turning `text` with a `text-faint` border on hover, and `aria-pressed` taking `raised`, a `rule-strong` border and `text`. They are a `role="group"` named `Category`. `all` is a chip and not an absence, so the way back out is where the way in was. Each chip belongs to its Category, so a choice changes which one is pressed without replacing any of them: the chip that was pressed is still the chip under the focus.

⚠️ **The chips carry no counts.** The group titles under them already count the same ten sets, and a number printed twice on this page is exactly the mistake the quota made three times. What the chips are for is reaching a Category without scrolling to it; what they are not for is being a second table of contents with its own arithmetic.

The chosen Category goes in the address (see The Address Rule), because it is what the page is showing.

### Catalog Ordering
`sorted by` and two quiet text controls, `name` and `latest release`: Mono 13px, 24px high, 8px of padding, a 4px radius, no border, `text-faint` going `text` on a `sunken` surface, and the pressed one in `text` under a `rule-strong` underline. The ordering is written where it is chosen **and named again in the column title**, because the ordering is the information: a list sorted by something invisible is a list a reader re-sorts by eye.

**By name the Catalog is read by Category; by latest release the Categories go**, replaced by one group titled `latest release first`, and each row prints its date (`latest 8.3.3 on 2026-10-06 · frontend build tool`). A list ordered by date and cut into Categories is ordered by neither, and the single title says the single ordering there is. The date is printed **only while the list is ordered by it**: a fact doing no work on the page is one more thing to read. Ties are broken by name, so the order is total and the list never shuffles between paints.

The ordering is remembered in `localStorage` and stays out of the address (see The Address Rule).

### Catalog Layout, Rows or Grid
Two buttons in one group, `rows` and `grid`, inside a 1px `rule` with a 6px radius and a 1px rule between them: 26px high, 12px of padding, Mono 13px `text-faint`, the pressed one on `raised` in `text`, with `aria-pressed` and a group named `Catalog layout`.

**It is the same cells, laid across instead of down**, in the same order for the keyboard. The measure is why it exists: a Catalog is browsed at least as often as it is searched, and with 31 Catalog rows on the page the grid is **3020px** of document against **3231px** of rows, measured in the browser at the 1240px container.

⚠️ **Across, the cell is closed by an outline, not opened by a rule.** A rule under a row works because the rows are a stack and each line is the next one's top edge; laid across, the same rule becomes a sawtooth of loose hairlines, one under each cell, floating in a grid with nothing to end them. So in `grid` the row gives up its rule and takes a 1px `rule` outline with a 6px radius and 16px of air inside. It is the same hairline, finished, and it is **not a card**: no fill, no `raised`, no shadow, no second border, no hover surface, nothing the row did not already have. The one raised plane on this page is still the Stack Panel. Cells of one line are **stretched to equal height**, or a panel beside a description that wraps ends two lines higher than its neighbour.

The choice is the reader's and is remembered in `localStorage`: a layout that resets every visit is not a choice. It is not in the address, because it is how one reader reads and not what the page shows (see The Address Rule).

### Catalog Row
Two lines. On the first, the Technology Mark, the name at Grotesk 600 16px/1.45 (-0.01em) linking to its Technology page and underlined on hover, and the Follow at the right edge, spanning both lines. On the second, under the name, the facts in Mono 13px/1.6 `text-faint` with tabular numerals and the version in `text-muted`: `latest 8.3.3 · frontend build tool`. See Layout for the grid and the `grid` view.

**The two lines are what the audit asked for.** The one-line row put the facts in a 674px cell holding about 400px of text and the button at the right edge: about **270px of empty run in every row**, 31 rows deep, which is the single widest thing on the old page. Two lines spend that width on the second column instead, and the button keeps the right edge, where every row's one action is.

**Across, the facts take a line each and the dot goes.** Down the page the version and the description share one line, where `·` is the only thing that can separate them; inside a panel there is a line to spare, so the description takes it and the separator has nothing left to do. The rule it follows is the page's rule for the dot: `·` earns its place between facts on one line, never between lines (see Pochi pallini, in the direction of this page).

The Follow is the standard button. Down the page it spans both lines at the right edge; across, it keeps the first line beside the name alone, because the facts under it run the whole width of the panel. At the wall it goes `aria-disabled`, stays focusable, and is described by the Limit Note.

### Limit Note
At the wall, one note line under the Catalog's head, where the next Follow would happen: the info glyph + Mono 14px/1.7 `text-muted`, `note: your free plan is full. let one go in what you follow to follow another.` It has no ink: a Plan's limit is a boundary, not a failure. Every disabled toggle is described by it.

⚠️ **It names the wall and does not recount it.** The copy used to be `note: 10 of 10 followed · unfollow one to follow another`, and on this page that was the quota's third appearance in one screen. The number is in the panel across the split, 360px to the left, and the sentence points at it in words (`what you follow`) rather than printing it again. On the Dashboard, which has no Catalog and no panel of this kind, the counted form stays (see Dashboard States).

### Row Error Line
What a row says about itself when the database refuses it: a third line spanning the whole row, 8px below the facts, in Mono 14px/1.7 inked in `breaking` with the x-circle glyph. When the server rejects a follow that was shown optimistically, the toggle reverts and the line reads `error: not followed. your free plan filled up in another session, so let one go to follow another.` The toggle is described by it, keeps the focus through the row's trip back, and the line clears on the next press in that row.

It had a second, uninked `note` variant, which a row used to say where a toggle was sending it (`note: following · moves to the following section on your next visit`). That line existed because the row stayed put; the row moves now, and showing where it went is the row's own job.

### No-Match State (Technologies)
When the filter matches nothing, every group of the Catalog is hidden and a polite live section takes their place, 48px below: a note line, the info glyph + Mono 14px `text-muted` `note: no technology matches “qwik”` with the query in `text`, then one muted Grotesk sentence at the 72ch measure (`The catalog is curated, and requests for new technologies aren't open yet.`). No form, no link, no ink.

**The left column stays.** The filter belongs to the Catalog and hides only the Catalog: a stack of six that vanished because a search for `qwik` found nothing would be the filter answering a question nobody asked it.

### Technologies States
The states the page is drawn in, and the selector at the foot of the mock is the list: `6 followed`, `nothing followed yet`, `free plan full`, `follow rejected by server`, `6 followed and 1 retired`, `filter with no match`. All of them obey The Reserved Space Rule: no skeletons, no pulsing blocks, nothing imitating the shape of what is coming.

**Nothing followed, and the split stays.** The left column keeps its panel, reading `followed 0` and `left on your free plan 10`, and its list is replaced by one Meta `text-faint` line: `nothing yet. follow something from the catalog and it lands here.` The list **gives up its own top rule** there, because a rule over nothing draws a list that is not there. No illustration and no empty-state art.

⚠️ **This is the opposite of the empty Dashboard, on purpose.** With nothing followed the Dashboard goes to one column, because *both* its questions are unanswerable and half the page would be an empty measure holding a sentence about its own emptiness. Here the second question is answered by the whole Catalog whatever the stack holds, and getting the first follow is the entire job of the page: the column that is empty is 360px wide and says in one line how to fill itself.

**The free plan full.** The panel reads `left on your free plan 0`, the Limit Note appears under the Catalog's head, and every Follow goes `aria-disabled` and describes itself by that note. Nothing is hidden and nothing is inked.

**Loading and error** follow the Dashboard, because the shape is the same: two columns are two queries, so they resolve and fail apart, each keeping its title and its reserved space, with a Meta `text-faint` `pending:` line while it waits (`pending: reading what you follow`) and, on failure, The One Error Measure with a `Try again` that reloads that column alone. The Stack failing does not take down the Catalog, which is the column a Developer can still act in. A whole-page failure is the Page State, unchanged.

### The Bench (signature, landing)

The landing is one real Release on a bench, examined in four stages that never leave the page: `source`, `cite`, `verdict`, `help`. The specimen is React 19.0.0, its notes are the ones GitHub serves, and the line the page cites is line 47 of them. Nothing on the landing is a mock-up of a Release: a page that argues for cited judgments cannot make its own claims uncheckable.

**The proof comes before the bench, and the bench explains it.** The first screen carries the Proof Panel, so the reader meets the real notes and the verdict they produced without scrolling; the bench below takes the same Release apart in four stages and says how that verdict was reached. The four stages sit **two by two** inside band `01`, each opened by its word as a **Stage Title** (`source`, `cite`, `verdict`, `help`) and holding what that word means: `source` says what the 271 lines are and which of them the Proof Panel showed, `cite` is the quote row and caret row that name line 47, `verdict` is the `breaking[1]:` diagnostic with its Grotesk explanation, `help` is the `= help:` line with the Help Pointer Link to the public Release page.

**There is no stage rail**, and that is a reversal: the four stages used to be a full column each with a Mono row of anchors above them, the current one in `text`. Two by two they fit a screen, so the rail pointed at what the reader could already see, which is furniture with a navigational excuse. The anchors go, the four words stay as the stage titles, and the content is unchanged: all four stages are in the DOM, in reading order, at every width.

**The motion is two things, and both are named in Motion.** The caret underline draws beneath the quoted span as the `cite` stage arrives, the same draw the Release page performs; and each band arrives once, 10px and a fade. Under `prefers-reduced-motion: reduce` neither happens and everything is simply in place.

The two actions of the page, the entry action and a Help Pointer Link, sit together in two places and nowhere else: the first screen and the closing band. The pointer names a different destination in the second one, the Catalog rather than the Release, because by then the reader has been shown the Release twice. The third pair, at the end of the bench, is gone with the long bench that needed it: on the new page the closing band is one screen away, and a page that offers the same button three times is asking rather than showing.

**The entry action has two faces, and it is the one element of the landing that depends on the reader.** To a Visitor it reads `Sign in with GitHub` and leads to the login, which returns to the Dashboard; with a session open it reads `Go to your dashboard` and leads there. It never disappears and it never asks for something already done: a reader who is signed in still needs one visible way to their work (The No Dead End Rule), and a button that vanished would leave a hole and move what sits beside it.

The landing is a static document, so the session lands after the first paint, and the two halves of The Reserved Space Rule are not kept the same way here. The **space is reserved**, strictly: both labels sit in the same grid cell, the one that is not the reader's at `visibility: hidden`, so the box is as wide as the wider of them from the first paint and the change of face moves nothing and is measured not to (issue #140). The **unknown is not declared**, and this is the one place in the product where it is answered with a guess instead: the visitor's face is what the prerendered document carries, it is what every crawler reads, and holding an empty box over the fold for as long as a cookie takes to be read costs the commonest reader more than a changed word costs the rarer one. Nothing else on the landing branches on the viewer, for the reason the top bar does not either: a provider that arrives with the session would remount the page.

### Stage Title (landing)

The four words of the bench, each **highlighted**: Mono 14px 600 at `0.02em` in `text`, inside a 4px-radius wash of the text's own ink at 10% (`color-mix(in srgb, var(--text) 10%, transparent)`), 2px above and below and 8px either side. It is the mark a reader makes on paper over the steps of an argument, and it is the same gesture in both themes, light ink over a dark ground and dark ink over a light one.

**The wash is neutral by construction, and that is the whole reason it may exist.** Hue means severity (The Severity-Only Colour Rule), so a highlighter in coral or cyan would deliver a verdict on a word that judges nothing. Drawn from `text` it carries no hue at all, and it cannot drift into one when a theme changes.

The words were a Section title before, Mono 13px muted, and at that weight they read as captions to the prose rather than as its joints: the four stages are the skeleton of the page's argument, and a reader skimming the band has to be able to count them. Neither an ordinal nor a rule above them survived the same question: the band already carries a number in its margin, and a second counter inside it counts something the reader was not asked to track.

### Proof Panel (signature, landing)

The right half of the landing's first screen: the one place in the product where the source and the verdict it produced are shown together, because a reader who has not scrolled yet has no other way to be told what this is.

It is the Source View surface (`raised`, 1px `rule`, 6px radius) and not a second raised plane. Its head is a Label row: the Technology Mark and `react 19.0.0` in `text`, the featured glyph, and `lines 45 to 50 of 271` right-aligned in `text-muted`, which is hidden at 640px and below. Its body is **four** real lines of the React 19.0.0 notes at Source scale in a 5ch line-number column, with line 47 carrying the `breaking-wash` and its text in `text`. Four is the cited line with one above and two below, which is what stands beside the claim without pushing the verdict under the fold on a laptop; the window is chosen in the domain (`panelWindow`) and tested there, so the head that names it (`lines 46 to 49 of 271`) and the bench sentence that repeats it cannot drift from what is on the screen. Under a 1px `rule`, the verdict those lines produced: the warning glyph and `warning: action required` at Mono `clamp(1.5rem, 2.4vw, 1.9rem)`, then the count row in Mono 13px `text-muted` with `13 breaking`, `8 notable` and `271 lines read`, the figures in `text`.

**The verdict in the panel is under Status scale, and this is the one exception to The One-Line Verdict Rule.** The display line of this page is the claim, which is the page's own sentence; the panel quotes a verdict that belongs to the Release page, and two display lines on one screen would leave the reader to work out which of them the page is making. Its clamp is its own because the rule it must keep is the one-line rule: the column is a fraction of the page rather than the page, so a scale set against the viewport wrapped `action required` onto a second row at every desktop width. `2.4vw` is the coefficient at which the line holds from the 1040px step up, and the cap keeps it under Status at the widest. Below 1040px the panel takes the full width and the claim wraps as a unit, exactly as a verdict does on a phone. The exception is bounded to this panel: on any page that judges a Release, the verdict keeps Verdict scale.

**The lines are never shortened and never reworded**, and the numbers are the true ones: the panel is the first thing a sceptical reader checks against GitHub, so what it cuts is the window, never the sentence. The bench no longer repeats them in a Source View of its own, since the panel is already that view: on the old page the notes were shown once, below the fold; now they are shown once, above it.

### Short Specimen (landing)

In band `02`, two more real Releases, one row each, a 24ch first column, 24px of vertical padding and a 1px `rule` between them: the Technology Mark and name, the version, and one Mono 13px line that names what the notes of that Release actually are. Vite 6.0.0 ships a changelog of 28 lines where the two breaking ones are marked by a single `!`; TypeScript 5.7.2 ships a release whose body is a link to a blog post.

They are the honest half of the argument and they are not decoration: they show the product meeting notes that are badly shaped and notes that are missing, which is the state the Summary calls `unavailable`. A landing that shows only its best case teaches a visitor to distrust the first ordinary Release they open.

### Vocabulary Legend (landing)

The four significance words, defined in words, with the id `significance` so the app can point here. In band `03` they are **four columns, not four rows**: each one opens with a 1px `rule-strong` above it, then the 12px glyph and the word in Mono 13px `text`, then a Grotesk 15px sentence in `text-muted` taken from CONTEXT.md. No boxes and no colour: significance is a shape (The Neutral Significance Rule), and the four rules above the four words are a reading order, not a frame. The axis is turned because four short definitions stacked as rows were the page's flattest stretch, 200px of left-aligned list in the middle of the argument; side by side they are one object the eye takes in at once, and they say by their shape that the four words are siblings.

It exists because the app shows these four words everywhere and defines them nowhere, which is why the help axis of the 2026-10-07 critique scores 1 out of 5. The definition lives on the landing by decision (`docs/DECISIONI.md`): inside the app the word stays paired with its glyph, which is what WCAG asks, and a definition in every section heading would repeat four sentences on every visit.

### Counter-Position Note (landing)

What the product is not, in the register the product already has: a `note:` line in `text-muted` with the info glyph, then Grotesk prose at the measure. **It has no band of its own**: it sits in the right half of the closing band, beside the closing claim and the entry action. A whole band saying what the product is not gave a counter-argument the same weight as the demonstration, and it was the fifth stop on a page whose reader had already decided by the fourth. Beside the closing claim it is read by whoever is still weighing the decision, which is exactly who it was written for. Dependabot and Renovate open a pull request when a version moves; a newsletter says a release was interesting; this product says whether this Release asks something of you, and cites the line it read. No comparison table, no competitor logo, and no claim about another tool's quality: naming what a neighbour does well is the only way the sentence stays true, and the only way it stays persuasive to someone who already uses one.

### Inline Code
Mono at 0.92em on `sunken`, 1px 5px padding, 4px radius.

## Do's and Don'ts

### Do:
- **Do** pair every severity ink with its glyph and label word (see The Severity Pairing Rule).
- **Do** cite every key point and breaking change with a `release-notes:N` or `N-M` pointer that highlights exactly those lines in the source view, and give the highlighted range a pointer back to the diagnostic that cited it: an authored round trip owes the reader both legs.
- **Do** set grammar, numbers and line references in Fragment Mono with tabular numerals, and explanations in Hanken Grotesk.
- **Do** replace a caret row with an in-quote 2px `breaking` underline wherever the quote would wrap, not only at 640px and below.
- **Do** keep the caret-draw as the app's single motion moment, with an immediate fallback under reduced motion (see Motion).
- **Do** let a landing band arrive once, 10px and a fade on the caret's own curve, applied by script so the page is whole without JavaScript, and never anywhere but the landing (see The Arrival Rule).
- **Do** keep the top bar sticky on every page, at its own 56px height, with no shadow and no change of shape while the page moves under it, and give anchor targets a 72px `scroll-margin-top`.
- **Do** define both themes for every colour role. Dark is the default.
- **Do** mark release significance with the neutral SVG shape glyphs (see The Neutral Significance Rule).
- **Do** give a Technology its mark where the subject is the Technology itself, in `currentColor`, and reserve the box empty where no mark exists (see Technology Mark).
- **Do** give navigational links their grammar: a faint `-->` arrow and a cyan dashed-underline label.
- **Do** keep neutral row verdicts (`note:`, `pending:`) and dashboard counts in `text-muted`, with no ink.
- **Do** write counts in words beside every bar, using the list's own vocabulary, with a legend that repeats the shape glyphs.
- **Do** shorten verdict copy until it fits on one line at the page's own container (1240px), and set the claim inline-block so it wraps as a unit (see The One-Line Verdict Rule).
- **Do** disable a Follow toggle at the limit with `aria-disabled`, keep it focusable, and describe it by the `note:` line that explains the limit.
- **Do** keep the top bar one 56px row at every width, and put the sections in the account sheet at 640px and below, as 44px rows above `sign out`, with only one copy of each link rendered at any width (see The No Dead End Rule).
- **Do** let the picture fill the control that holds it, and give a control one border, not two (see Account panel).
- **Don't** hide a destination behind something that has to be opened. The account panel held `dashboard` for a while, and from a public page that made the Dashboard two actions away and invisible until the first one (issue #119).
- **Do** keep the Brand Mark in `text`, colon included, and never in a severity ink (see Brand Mark).
- **Do** argue on the landing with a real Release, its real notes and the line number it cites, and show a Release whose notes are thin beside the one whose notes are rich.
- **Do** reserve the space a control will take while its state is still unknown, and declare the unknown with `aria-busy` rather than guessing a value (see The Reserved Space Rule).
- **Do** split a page that answers two different questions into one column each, order each column by what its question asks (the standing by Distance, the stream by date), and name the ordering in its title (see The Two Questions Rule).
- **Do** let the two columns of the Dashboard fail and load apart, and withhold the verdict whenever the column its number is summed from is not there (see Dashboard States).
- **Do** count a quota once per page, in the column whose question it answers, and let the other column name the wall in words instead of a number (see Stack Panel, Limit Note).
- **Do** put a row's facts under its name wherever the alternative is a run of empty width between them, and keep the one action at the right edge (see Catalog Row).
- **Do** name the ordering in force in the column's own title, and print a fact only while it is doing work there (see Catalog Ordering).
- **Do** put what the page is showing in the address with `replaceState`, and how one reader is reading it in `localStorage` (see The Address Rule).
- **Do** offer a long Catalog as rows or as a grid, remember the choice, and keep the same cells, order and rules in both (see Catalog Layout).
- **Do** move a row to the column it now belongs to on the press itself, and send the focus after it (see Catalog Column).

### Don't:
- **Don't** use hue for anything but severity. There are no brand accents or decorative colour. A Technology Mark is a shape in the text's own ink, never the brand's palette.
- **Don't** add shadows or extra raised surfaces. Depth is `sunken` / `ground` / one `raised`, and the account panel is the single surface allowed over the page (see The One Raised Plane Rule).
- **Don't** wrap diagnostics in cards or badges. Structure comes from gutters and grammar.
- **Don't** colour `note:` or non-error status lines. They stay `text-muted`.
- **Don't** give significance (featured, notable, digest, preview) a severity ink, and don't let a bar carry meaning without its counts in words.
- **Don't** shrink the verdict scale to fit longer copy. The two exceptions are both written down: the landing's Proof Panel (see Proof Panel) and the Dashboard verdict, which has a token of its own because it lives in a 360px column, not because its copy got longer (see The One-Line Verdict Rule).
- **Don't** print the same fact in both columns of the Dashboard. A Distance belongs to the Standing and what a Release changes belongs to the Stream, and a count that appears twice is how the page contradicted itself before (see The Two Questions Rule).
- **Don't** draw a Distance bar for a Technology with no declared Version in use. There is no Distance to be a share of, and the row says so in words instead (see Standing Column).
- **Don't** hide a scrollbar without measuring that it took no width (`offsetWidth - clientWidth` is `0`), and don't replace it with a shadow or an animation: the fade is a mask, as tall as the padding it falls on (see Layout).
- **Don't** animate anything inside the app, and don't let a landing arrival repeat, follow the scroll, parallax, move sideways or hold back something the reader could already read.
- **Don't** leave a viewer without a way off a page at any width. On a phone the destinations are rows of the account sheet, a public page is navigated by the breadcrumb in its content, and a whole-page state ends on a help pointer. There is no hamburger: what opens is the account, which was already there, and the sections are rows inside it rather than a menu button beside it.
- **Don't** fill a wait with a skeleton, a shimmer or a spinner. The space is reserved and empty, and what is not known is said (see The Reserved Space Rule).
- **Don't** persuade with furniture the app does not own: no cards, no metric row, no logo wall, no testimonial, no comparison table, no kicker above a heading. The landing persuades by showing the work.
- **Don't** invent a Release, a count, a customer or a number anywhere, the landing included. Every figure on it is countable in a public file.
- **Don't** make a breadcrumb step a link for some viewers and plain text for others. The step follows the hierarchy, and sign-in handles the rest.
- **Don't** print the same count twice on one page. The quota lives in the panel and the bar gives it up on `/technologies`, the Category chips carry no numbers because the group titles under them already count, and a note at the wall names the wall rather than recounting it.
- **Don't** give every row of a 360px column a bordered button. Ten borders down a list is a form to fill; the quiet text control is 24px high and reachable all the same (see Stack Column).
- **Don't** draw a Distance bar on `/technologies`. The page reads no declared Version in use, so there is no Distance for a bar to be a share of (see Stack Column).
- **Don't** put a layout or an ordering in the address, and don't leave a filter query or a chosen Category out of it (see The Address Rule).
- **Don't** let a filter that belongs to one column hide the other one. A search with no match empties the Catalog and leaves the stack where it is (see No-Match State).
