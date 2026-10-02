---
name: release-tracker
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
  focus: "#6cc4d8"
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
  light-focus: "#0b6b80"
  light-selection: "rgba(11, 107, 128, 0.18)"
typography:
  verdict:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(1.9rem, 5.2vw, 3.4rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  status:
    fontFamily: "Fragment Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "clamp(1.5rem, 3.6vw, 2.3rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.03em"
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
    height: "38px"
    width: "26ch"
  picker-row:
    padding: "12px 0"
  picker-facts:
    textColor: "{colors.text-faint}"
    typography: "{typography.label}"
  row-error:
    textColor: "{colors.breaking}"
    typography: "{typography.diagnostic}"
  row-note:
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
---

# Design System: release-tracker

## Overview

**Creative North Star: "Compiler Diagnostic"**

A release reads like compiler output. One verdict line at display size, numbered `breaking[n]:` diagnostics that each point at their source lines with `-->`, quote the cited text over a caret row, and end in `= help:`. The release notes sit below as a numbered source view, clearly a separate part of the page from the Summary. Every claim can be checked against a highlighted line range.

The ground is terminal dark with one raised plane and one sunken well. Diagnostic severity is the only colour on the page. Fragment Mono carries the grammar: labels, versions, gutters, pointers, counts and metadata. Hanken Grotesk carries the prose that explains what changes. The page is dense and working-scale, not a marketing page. Width is set by a 72ch measure, and hierarchy comes from typography and gutters, not cards.

A light theme mirrors every role with darker severity inks on a warm off-white ground. Dark is the default.

**Key Characteristics:**
- Severity colour is always paired with a label word and a glyph.
- Monospace grammar (`note:`, `breaking[n]:`, `-->`, `|`, `=`, `help:`) is the component language.
- Flat surfaces: three tonal layers (ground, raised, sunken) and 1px rules. No shadows.
- One motion moment: the caret underline draws beneath cited spans.
- The Summary and the source notes use different registers: grammar plus prose above, a numbered listing below.

## Colors

The neutrals are cool graphite. The four diagnostic inks are the only hues, and each has a fixed meaning.

### Primary
- **Breaking Coral** (`breaking`; light `light-breaking`): `breaking[n]:` codes, caret rows, the `-` line in fix diffs, the breaking count in the tally, `error:` in the failed state, and the underline plus wash (`breaking-wash`) on source lines cited by a breaking change.

### Secondary
- **Action Amber** (`action`; light `light-action`): only the `warning: action required` verdict.
- **Help Cyan** (`help`; light `light-help`): `help:` labels, `-->` cite pointers and `-->` help pointer links (dashed underline), the note-citation wash (`help-wash`), the focus ring (`focus`) and text selection (`selection`).

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

**The Severity-Only Colour Rule.** Hue means severity. There are no brand or decorative accents. `note:` and non-error status lines (`pending:`, unavailable, skipped) stay in `text-muted`. Only breaking, action, help and ok get an ink.

**The Neutral Significance Rule.** Release significance (featured, notable, digest, preview) is a shape, never a hue. Featured is a filled diamond, notable an outlined diamond, digest a small dot, preview a dashed outlined diamond. They are always 12px SVG shapes (never a rotated CSS square), drawn in `text`, `text-muted`, `text-faint` or `rule-strong`, and never in a severity ink. Severity can sit beside a significance glyph, but always as its own glyph and label.

## Typography

**Display Font:** Fragment Mono (with ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)
**Body Font:** Hanken Grotesk (with system-ui, sans-serif)
**Label/Mono Font:** Fragment Mono, with tabular numerals

**Character:** A compiler's mono voice sets the verdict and structure. A plain, warm grotesk explains the consequences in human terms.

### Hierarchy
- **Verdict** (Mono 400, clamp(1.9rem, 5.2vw, 3.4rem), 1.08, -0.035em): the one verdict line (`warning: action required` / `ok: safe to upgrade` on a release, `warning: 2 need action` / `ok: nothing needs action` across the Dashboard). The glyph is set at 0.8em with stroke 1.75.
- **Status** (Mono 400, clamp(1.5rem, 3.6vw, 2.3rem), 1.15, -0.03em): the verdict line for non-ready Summary states, the Dashboard empty state and the Technologies follow status (`note: you follow 7 of 10 technologies`).
- **Headline** (Grotesk 600, 22px, 1.2, -0.01em): the technology name in the release and technology headers. The version follows in muted Mono 400. In Dashboard rows a Technology name is Grotesk 600 16px/1.45, -0.01em.
- **Summary title** (Grotesk 500, clamp(1.15rem, 2.2vw, 1.4rem), 1.4, balanced wrap, max 72ch).
- **Title** (Grotesk 500, 18px, 1.45): the breaking-change heading, next to its Mono 16px `breaking[n]:` code.
- **Body** (Grotesk 400, 16px, 1.6): key points, diagnostic explanations (max 68ch) and help text.
- **Diagnostic** (Mono 400, 14px, 1.7): gutters, quote rows and `note:` / `help:` labels.
- **Source** (Mono 400, 13.5px, 1.75): the numbered release-notes view and fix diffs.
- **Label** (Mono 400, 13px): cite pointers, breadcrumb path and header facts. **Section title** (Mono 600, 13px, 0.02em, muted, lowercase with a count, e.g. `breaking changes (4)`, followed by a hairline rule).
- **Meta** (Mono 400, 12px, faint): provenance and footer. The `this week` mark uses the same size in `text-muted`.

### Named Rules
**The One-Line Verdict Rule.** The verdict keeps its token scale on every surface. The copy is shortened to fit, and the scale never shrinks. At the 1040px container the whole verdict (glyph, label and claim) must fit on one line, so a range verdict reads `warning: 1 needs action`, not `warning: 1 release needs action`. The claim after the label is set inline-block, so when narrow screens force a wrap, it drops to the next line as a unit and never splits mid-phrase.

**The One Error Measure Rule.** Every error line is Diagnostic (Mono 14px/1.7) in `breaking`, whatever it sits under: the form message on the Upgrade Path, the refused follow under a picker row, the refused follow on a Technology page. An error is a diagnostic, and under a row of 13px facts the extra pixel is what makes it stand out instead of blending in.

**The Two Registers Rule.** Anything a compiler would print (labels, codes, pointers, versions, counts, line numbers, dates) is set in Fragment Mono. Sentences a person reads are set in Hanken Grotesk. Don't mix them within one role.

## Layout

The content column is 1040px max with 24px side padding (16px at 640px and below). The top bar is 56px high and separated by a 1px rule; at 640px and below it is two rows, 56px plus a 40px navigation strip, with a 1px rule between them and under them. Prose is capped at a 72ch measure, and diagnostics at 900px. Spacing uses an 8-step scale (4, 8, 12, 16, 24, 32, 48, 72px). Sections are separated by 48px, diagnostics by 32px, and the verdict sits 32px below the header.

Diagnostic rows use a gutter grid: a 5ch right-aligned faint gutter holds `-->`, `|`, `=` or a line number, and content sits to its right. Key points use an 8.5ch label column. The source view uses a 6ch line-number column.

**Technology page rows.** Release rows use a four-column grid (11ch significance, 14ch version, 11ch date, then the content), with a 16px column gap, 12px vertical padding and a 1px `rule` below. Folded digest rows share the 11ch significance column, so glyphs line up down the list. The stat list is capped at 820px and uses a 3ch major column, a 1ch `|` column, a bar track (min 120px) and an auto-width words column. Major groups are separated by 48px.

**Dashboard rows.** Stack rows use a four-column grid (14ch technology, 17ch version with its significance glyph, 11ch date, then the content), with the same 16px column gap, 12px vertical padding and 1px `rule` between rows (the first row also gets a top rule). Compact rows tighten to 8px vertical padding. Weekly Digest summaries share the 14ch first column; their expanded lines indent to the content column in a 28ch auto-fill grid. Sections sit 48px apart.

**Technologies page.** The Status-scale follow status opens the page 32px below the header, the muted intro sits 12px below it, and the filter sentence 24px below that. The `following`, `catalog` and `retired` sections follow, 48px apart. Picker rows use a three-column grid (16ch name, facts, auto toggle), with a 16px column gap, 12px vertical padding, centred alignment and a 1px `rule` between rows (the first row also gets a top rule). Note lines inside a section (the limit note, the retired note) sit between the section title and the rows, 12px above the rows, capped at 900px.

**Responsive (640px and below):** the breadcrumb path moves to the navigation strip under the bar, whole, and the source meta is hidden. Key-point labels and diagnostic headings stack to one column. Gutters narrow to 4.5ch. **Caret rows are hidden.** The quoted span gets a 2px `breaking` underline (offset 4px) inside the quote row instead. Fix diffs scroll horizontally. Quotes and inline code break inside a word rather than widening the page.

**Responsive, technology page.** At 880px and below, release rows reflow to significance, version and a right-aligned date on the first line, with the title, verdict and breaking list across the full width below, and stat words may wrap. At 640px and below the header facts (the latest version and the sources) wrap as one group, so the Follow keeps a line of its own instead of trailing the sources, and the stat row keeps major, `|` and bar on one line while the words drop to a full-width second line. Digest rows drop the version range: the summary shows only the count, with `no action needed` on its own line. The expanded digest list loses its 11ch indent. The range verdict wraps the claim below the label as one unit.

**Responsive, Dashboard (640px and below):** the top-bar nav moves to the navigation strip under the bar and the quota reads `N followed`. Stack rows reflow to technology, version and a right-aligned date on the first line, with the content full width below (compact rows too). A section title's significance legend wraps to its own line under the title and rule. Week summaries hide the date range and put `no action needed` on its own line. The expanded week list becomes one column with no indent. Catalog picker rows put the facts under the name, with the Follow button spanning both lines.

**Responsive, Technologies (640px and below):** the nav moves to the navigation strip under the bar and the quota reads `N followed`. The follow status shortens to `note: N of 10 followed` (the same one-line discipline as the verdict). The filter label and the match count share the first line, with the count right-aligned, and the input drops to a full-width second line. Picker rows become two columns: the name on the first line, the facts wrapping under it, and the toggle (or the `unfollowed` note, right-aligned and capped at 16ch) spanning both lines on the right. A row error drops to a full-width third line.

### The caret row and its replacement

The caret row is `^` repeated once per cited character, so it only reads right while the quote stays on one line. Once the quote wraps, the carets sit under the wrong words, and being one run with no place to break they widen the whole page: the release notes are real text, and a cited line of 167 characters made a 1503px row inside a 900px column (issue #62).

So the caret row is shown **only where its own quote is certain to fit on one line**, and the coral underline inside the quote row takes over everywhere else, saying the same thing and staying right however the quote wraps. A quote fits on one line when its length in characters is no more than the diagnostic column allows at that width: 58 at 641px, 72 at 768px, 87 at 900px, 92 at 1024px and above, where the column reaches its 900px cap. A quote longer than 92 characters never gets a caret row. The budgets come from the character advance **measured on the live font**, 9px at 14px, not from a nominal 0.6em: the first attempt assumed 8.4px and left three production pages citing a line of exactly the length the 768px step claimed to hold. One character is kept back at every step, so a quote that lands on a step does not depend on sub-pixel luck. The lengths are computed in `caretWidth`, not guessed in CSS, and the page names the width its caret row survives down to.

The mock stamps each well with the width its own quote needs: two at 1024px (88 characters) and two at 900px (80 and 82), so resizing it shows the switch happening at different widths on the same page. Below 640px caret rows are gone whatever the length, as they always were.

## Elevation & Depth

The system is flat with no shadows. Depth comes from three tonal layers: `sunken` wells for quotes, diffs and inline code, `ground` for the page, and one `raised` plane for the source view and hover states. Edges are 1px `rule` borders.

### Named Rules
**The One Raised Plane Rule.** Only the release-notes source view sits on `raised`. Quoted and code material sinks. Nothing floats.

## Shapes

Corners are gently squared: 6px for buttons, the source panel and fix diffs, and 4px for inline code and quote/caret wells. A quote row and its caret row sit in one well, rounded 4px, with 6px of padding above and below. The focus outline is 2px `focus`, offset 3px, with a 3px radius. Pointer links use a dashed 1px underline that turns solid on hover; on a `-->` help pointer only the label carries it. The `-->` pointer and caret row are typographic shapes, not drawn graphics.

## Components

### Buttons
- **Shape:** gently squared (6px), 34px high, 1px `rule-strong` border, transparent fill.
- **Default:** Grotesk 500 14px, 12px horizontal padding, with an optional 16px stroke icon (stroke 2) and an 8px gap.
- **Hover / Focus:** fill changes to `raised` and the border to `text-faint`. Focus uses the global 2px cyan ring, offset 3px, 3px radius.
- **Icon button:** a 34px square (theme toggle).
- **Toggle (Follow):** a `button` with `aria-pressed`. Off: plus icon + `Follow`. On: check icon + `Following`, the border drops to `rule` and the text to `text-muted` (back to `text` on hover). The accessible name switches between `Follow X` and `Unfollow X`.
- **Toggle at the limit (disabled):** when 10 of 10 are followed, every unpressed toggle gets `aria-disabled="true"` (never the `disabled` attribute), so it stays focusable and is described by the limit note (`aria-describedby`). The border drops to `rule`, the text to `text-faint`, the cursor is `not-allowed` and hover changes nothing. Clicks are ignored. Pressed toggles stay live so the user can unfollow.

### Navigation
There is one navigation, not two: a single top bar on every page, with one slot between the wordmark and the actions. What changes from page to page is what sits in that slot, never the bar. The home page uses the same bar, with both sections in the slot and none of them current, so the app is reachable from it. There is no sidebar: the app has two signed-in destinations, and the width a sidebar would take is the width the release page spends on its quote wells.

- Top bar: the Mono 14px `release-tracker` wordmark, then the slot, then right-aligned actions. The slot holds either a Mono 13px muted breadcrumb (`technologies / vite / 6.0.0`, current item in `text`) or, on signed-in pages, a Mono 13px muted nav (`dashboard`, `technologies`, 16px gap, `aria-current` item in `text`).
- **Breadcrumb steps are links wherever they have a destination**, for everyone, and `technologies` always points at `/technologies`. The breadcrumb describes where the page sits, and `/technologies/vite/6.0.0` really does sit under `/technologies`, so the step tells the truth about the hierarchy rather than about the viewer's rights. A visitor who follows it lands on sign-in and is returned to `/technologies` afterwards. The header cannot branch on it anyway: the session arrives after the first paint, and a header that changed shape when it arrived would remount the page.
- **At 640px and below the bar becomes two rows**: the 56px bar keeps the wordmark and the actions, and the slot drops to a 40px strip under it, separated by a 1px `rule` and aligned to the same gutter. The links are the same links, in the same scale, in the same order. There is no drawer, no toggle and no hidden state: nothing to open means nothing to discover, and the strip stays a plain list of links that the keyboard reaches in document order. It costs 40px of height on a page that already scrolls.
- **Quota link:** before the actions, a Mono 13px muted link `N of 10 followed` with the number in `text`, turning `text` on hover. On mobile it shortens to `N followed`.

**The No Dead End Rule.** From every page, every page the viewer has a right to reach is one or two links away, at every width, phone included. A navigation that disappears at a breakpoint is not a density choice, it is a dead end: before this rule the slot was hidden below 640px, and the only link out of a release page on a phone was the wordmark.

### Verdict Line (signature)
A glyph plus severity label in the severity ink (`warning:` amber / `ok:` green), then the plain verdict in `text`, at Verdict scale. Below it is a Mono 14px/1.7 muted count row, with numbers in `text` (`4 breaking changes`, `4 key points`). The breaking count links to the diagnostics.

**Page verdict (Dashboard).** The same line summarises all followed Technologies: `warning: N need action` or `ok: nothing needs action`. The count row below is a Mono 14px/1.7 muted sentence whose numbers are in `text` and whose counts (`3 featured`, `4 notable`, `2 previews`, `23 digest`) link to their sections. The counts carry no severity ink; the action count sits in plain words (`(2 need action)`).

### Note Lines
A key-points list separated by top and bottom 1px rules. Each row is a muted Mono `note:` label with the info glyph, followed by Grotesk prose that ends in a `release-notes:N` cite pointer.

### Breaking Diagnostic (signature)
Rows in order:
1. Heading: coral octagon glyph with `breaking[n]:` (Mono 16px), then the Grotesk 18px title.
2. `-->` gutter + cite pointer with a line range (`release-notes:12-13`), in cyan Mono 13px with a dashed underline.
3. Quote row: the line number in the gutter, the muted Mono quote on `sunken`.
4. Caret row: `|` gutter, a hidden pad matching the quote text before the span, then coral `^^^` under the cited span. It is aria-hidden. **It is shown only while the quote stays on one line**: see "The caret row and its replacement".
5. `|` gutter + Grotesk explanation of what changes.
6. `=` gutter + cyan `help:` label with the wrench glyph, then the Grotesk migration text.
7. Optional fix diff: a `sunken` block with a 1px rule border, 6px radius and Mono 13.5px text. `-` lines are coral, `+` lines are green.

### Tally
A Mono 14px muted closing line after the diagnostics. The breaking count is in coral, e.g. "4 breaking changes, 4 with a suggested migration, all cited from the release notes".

### Source View (signature)
A `<details>` panel on `raised` with a 1px rule border and 6px radius. The summary row shows a chevron (rotates 90deg, 200ms), `release-notes` and right-aligned muted meta (origin · line count). Lines are numbered by counter in a faint 6ch gutter. Headings are in `text`, body lines in `text-muted`. Following a cite pointer opens the panel, clears earlier highlights, applies `breaking-wash` or `help-wash` to the cited range (depending on the citing severity), centres the first line, and draws a 2px underline in that severity's ink beneath each cited span.

**Motion:** the underline reveals left to right (clip-path, 650ms, cubic-bezier(0.16, 1, 0.3, 1), 120ms delay). This is the system's only motion moment besides the chevron. Under `prefers-reduced-motion`, the underline appears immediately and smooth scrolling is off.

### Summary States
Vocabulary: `ready` (verdict `action required` or `safe to upgrade`), `pending` / `processing`, `unavailable`, `skipped`, `failed`. Non-ready states replace the verdict with a Status-scale line and a muted explanation paragraph:
- pending: muted clock + `pending: summary queued`
- unavailable: muted info + `note: no release notes to summarize` (the source view is hidden and "View on GitHub" is offered)
- skipped: muted info + `note: no summary for this older release`
- failed: coral x-circle + `error: summary unavailable`

The release notes stay available below in every state except unavailable.

### Page States (404 and error)
The two pages that replace a page instead of a part of it use the same grammar at whole-page scale: the top bar with both sections in the slot (so neither page is a dead end), then a Status-scale severity line as the `h1`, then one muted Grotesk paragraph at the 72ch measure, then the ways out.
- **404**: muted info glyph + `note: no page at this address`. It carries **no ink**: an address that names nothing is the absence of a thing, not a failure, and the paragraph says so rather than apologising. It ends in a `-->` help pointer to the catalog.
- **Error**: coral x-circle + `error: this page could not be loaded`. The paragraph says what failed and that nothing changed, never what threw. A `Try again` button sits beside the same help pointer, and the error digest follows in Meta `text-faint` as `reference <digest>`: the only detail printed, because it is the one string that matches the failure to its server log.

### Significance Glyphs
12px SVG shapes on a 12-unit grid, paired with a Mono 13px lowercase label word in `text-muted` and a 6px gap: featured (filled diamond), notable (1.5px outlined diamond), digest (2-unit radius dot), preview (outlined diamond with a 2/1.6 dash). They are neutral (see The Neutral Significance Rule). They mark rank, not risk.

### Stat Row (signature)
A `git diff --stat` line for each major version, inside a list with a top rule and a 1px `rule` under each row (8px vertical padding, 16px gaps, Mono 14px). In order:
1. The major (`v6`) in `text`.
2. A faint `|` gutter.
3. A proportional bar, 8px high, whose width is the group's release count relative to the largest group (the largest is 100%, with a 28px minimum). Segments are separated by 2px and filled neutrally in significance order: featured `text`, notable `text-muted`, digest `rule-strong`. The bar is aria-hidden.
4. The counts in words, in `text-muted` and using the list's own vocabulary (`4 releases · 1 featured · 3 digest`, `2 notable, 1 not summarized`). When a group has a release that needs action, it appears inline as the warning glyph plus `warning: needs action` in `action`.

The bar never stands alone: every segment is also counted in words. A legend below it (Mono 12px, `text-faint`) repeats each significance shape glyph next to a 10x8 swatch of its bar fill and the label word. It lists only the significance levels that appear in the bars.

### Release Row
One release per row: significance glyph and label, the version as a Mono 16px `text` link (underlined on hover), a Mono 13px `text-faint` ISO date, and a content column. The content column holds the Grotesk 500 16px/1.45 summary title, then a Mono 13px row verdict with its glyph at 0.95em: `warning: action required · 4 breaking changes` in `action`, or `ok: safe to upgrade` in `ok`. An action release also lists its breaking changes (coral octagon + `breaking[n]:` Mono 13px, then Grotesk 14px/1.6 titles) and ends with a `-->` help pointer to the release page (`--> migrate to vite 6.0.0`).

**Neutral row verdicts.** A release without a ready summary puts a neutral status in the verdict slot, with no ink: the info glyph + `note: no summary for this older release`, or the **clock glyph + `pending: summary queued`** for previews still waiting for a summary. Each is followed by `· read the release notes` as an underlined link.

### Digest Row
Consecutive digest releases fold into one `<details>` row between rules: the digest glyph and label, then a Mono 13px muted summary (`14 digest releases · 5.2.1 to 5.2.14 · no action needed`), then a right-aligned chevron that rotates 90deg (200ms, same curve as the source view, no transition under reduced motion). On hover the summary text turns `text`. When open, the versions show as a Mono 13px auto-fill grid (22ch minimum per cell), with versions in `text` and dates in `text-faint`, indented to the content column. For mobile behaviour, see Layout.

### Upgrade Path Form
One Mono 14px muted sentence: `Upgrade from [input] to 6.0.3 [Check]`. The input is a 38px `sunken` field, 11ch wide, set in Mono 16px `text`, with a 1px `rule-strong` border and 6px radius. The border turns `text-faint` on hover and `breaking` when `aria-invalid`. The target version is in `text`. It suggests known versions through a datalist.

**Declared start.** When the upgrade path starts from a declared Version in use rather than a typed one, the field arrives prefilled and a full-width muted note sits below it, linked by `aria-describedby`: the info glyph + `note:` label, then `starting from 6.0.0, the version you declared in use on 2026-09-12.` in Mono 14px `text-muted`. The date is not decoration: the counts under it are built on a declaration nothing ever checks, so the line that introduces them says how old it is.

**Invalid version.** A full-width error line below the form, linked by `aria-describedby`: the x-circle glyph + `error: 5.9.0 is not a Vite version. Did you mean 5.4.0 or 5.4.11? The path below is still from 5.2.0.` Everything is in Mono 14px `breaking`. The suggested versions are links that inherit the ink and keep the underline. The page keeps showing the last valid path.

### Version in Use
The control a Developer who follows the Technology gets, on a line of its own under the header facts (12px above, full width of the header group, 12px gaps): the Mono 14px `text-muted` label `Version in use`, the same field and button as the Upgrade Path Form, and a `Clear` button that appears only once something is declared. Nothing declared reads `not declared` in `text-faint` beside the button; something declared puts a full-width Mono 14px `text-muted` note under the line, with the info glyph and a `note:` label: `declared on 2026-09-12, and the upgrade path below starts from it.` A refusal replaces that note with the form's own error line, in `breaking`, with the field `aria-invalid`.

It is never inked: a declaration is a fact the Developer entered, not a verdict. It appears only for a followed Technology, a retired one included, and never for a Visitor.

### Retired Note
When a technology is retired, a muted note sits between a top and a bottom 1px `rule` (12px vertical padding, 24px above): the info glyph + Mono 14px `note:` label in `text-muted`, then Grotesk prose in `text-muted`. It is a note, not an error: no ink. Follow and upcoming previews are hidden.

### Help Pointer Link
A navigational link in compiler grammar: Mono 13px, a faint `-->` arrow (aria-hidden), a 1ch gap, then the lowercase label in `help` with a 1px dashed `help` underline that turns solid on hover. Used for migration links on release rows and for `browse all 42 technologies`. It sits 12px below the content it follows.

### Section Title with Legend
The Section title (`spotlight (7)`) and its hairline rule, followed by a significance legend: the 12px SVG glyph, the label word in `text-muted` (Mono 400, no tracking) and a faint fact (`· last 30 days`, `· newest first`, `· by ISO week, UTC`). It names the one significance level the section lists, so row glyphs carry no visible label word (each keeps a screen-reader label).

### Stack Status Row (signature)
Dashboard sections list releases one per row: the Technology name (Grotesk 600 16px, linking to its Technology page), the version cell (12px significance glyph + Mono 16px `text` version link, 6px gap), the date cell and the content column. The content repeats the Release Row: summary title, Mono 13px row verdict, breaking list and `-->` help pointer for action rows. Neutral verdicts stay in `text-muted`.

In Spotlight each followed Technology appears exactly once: action rows first, then ok rows, then **compact rows** for Technologies without a featured release in the window. A compact row keeps the grid but tightens to 8px vertical padding, sets the name at 500 in `text-muted` (`text` on hover), and puts one Mono 13px muted line in the content column: `latest major · none featured in 30 days`.

### In Use Line
Where the Version in use shows up on the Dashboard, in two places, both Mono 13px `text-muted` and both naming the day of the declaration:
1. Under the counts line, one sentence for the whole page (Mono 14px, tabular numbers, 8px below): `In use on 3 of 7: 16 releases behind · 3 need action · oldest declared 2026-09-12.` The oldest declaration is the one named, because a total is only as fresh as the stalest thing under it.
2. In Spotlight, one line at the end of a Technology's entry (8px above): `in use 5.4.11 since 2026-09-12 · 12 releases behind 6.0.3 · 2 need action`, or `· already on 6.0.3` when there is nothing after it. Releases with no ready summary count apart, as `· 2 to check`.

Both lines are absent for a Developer who declared nothing, and the page then reads exactly as it did before there was anything to declare. Neither carries ink, and neither adds a link: the Technology name of the row already leads to its upgrade path.

### This Week Mark
Under the ISO date, a Mono 12px `text-muted` `this week` stacks in the date cell for releases in the current ISO week (UTC). It is neutral: no glyph, no ink, no badge.

### Weekly Digest
Digest releases fold per ISO week into `<details>` rows between rules, closed by default. The summary is a grid (14ch, content, chevron): the digest dot + `week 49` in `text`, then Mono 13px muted `9 digest releases · Dec 2 to 8 · no action needed`, then the chevron (same rotation and curve as the Digest Row). When open, lines run newest first in a 28ch auto-fill grid: the Technology name in `text-muted`, the version link in `text` and a faint `MM-DD` date.

### Empty State (Dashboard)
With no follows, the verdict slot holds a Status-scale muted line: info glyph + `note: you follow no technologies yet`. Below it are a muted Grotesk intro paragraph (72ch) and a Mono 14px muted live count (`aria-live="polite"`) `N of 10 followed`, with the number in `text`. Once N is above 0 the claim reads `you follow N technologies` and an `Open dashboard` button appears beside the count. A catalog picker follows under a section title, the same rows as the Technologies page (16ch name column, the name linking to its Technology page): the Technology name (Grotesk 600 16px), Mono 13px faint facts (`latest 19.0.0 · library for web and native UIs`, version in `text-muted`) and a Follow toggle, ending with a `-->` help pointer to the full catalog.

### Follow Status and Filter (Technologies)
The page opens with no verdict: a Status-scale line in `text-muted`, the info glyph + `note:` + `you follow 7 of 10 technologies`, with the count in `text` and the claim inline-block in a polite live region. At 640px and below the claim reads `7 of 10 followed`. A muted Grotesk intro (72ch) follows.

The filter is one Mono 14px/1.7 muted sentence in a `role="search"` paragraph, like the Upgrade Path Form: a lowercase `filter` label, a 38px `sunken` search input (26ch, Mono 16px `text`, 1px `rule-strong` border turning `text-faint` on hover, 6px radius, `text-faint` placeholder `name or description`), then a live match count. Unfiltered it reads `42 technologies`, filtered `3 of 42 match`, with the first number in `text`. The filter matches name and description across every section at once.

### Picker Sections (Technologies)
Three sections in order, each with a Section title that counts its rows: `following (7)`, `catalog (35)`, and `retired (1)` only when a retired Technology is still followed. While filtering, the counts read `following (2 of 7)`, and a section with no matches is hidden. A toggled row stays in its section until the next visit, so nothing moves under the pointer.

### Catalog Picker Row (Technologies)
The Dashboard catalog picker row, as a full page list: the Technology name (Grotesk 600 16px/1.45, -0.01em) links to its Technology page (underlined on hover), then Mono 13px/1.6 `text-faint` facts (`latest 6.0.3 · frontend build tool`, version in `text-muted`), then the Follow Toggle. See Layout for the grid and the mobile reflow.

### Limit Note
At 10 of 10, a note line sits under the catalog title, where the next Follow would happen: the info glyph + Mono 14px/1.7 muted `note: 10 of 10 followed · unfollow one to follow another`, with the count in `text`. It has no ink. Every disabled toggle is described by it.

### Row Error Line
When the server rejects a follow that was shown optimistically, the toggle reverts and an error line appears under that row, spanning the facts and toggle columns (full width on mobile), 8px below: the x-circle glyph + `error: not followed · you already follow 10 (one was added in another session) · unfollow one to follow another`, all in Mono 14px/1.7 `breaking`. The toggle is described by it. It clears on the next click in that row.

### Retired Group (Technologies)
The closing `retired` section starts with a note line: the info glyph + Mono 14px muted `note:`, then Grotesk 16px/1.6 muted prose explaining that retired Technologies get no new releases, still count toward the 10, and can't be followed again once unfollowed. There are no rules around it; the row list's own top rule follows. Retired rows keep the picker grid, with facts that read `last 5.0.1 · React app setup · retired 2024-10`. Unfollowing replaces the toggle with a Mono 13px muted status (`role="status"`), `unfollowed · can't be followed again`, which doesn't wrap on desktop.

### No-Match State (Technologies)
When the filter matches nothing, all three sections are hidden and a polite live section takes their place, 48px below the filter: a Mono 14px muted note line `note: no technology matches "qwik"` (the query in `text`), then one muted Grotesk sentence (`The catalog is curated, and requests for new technologies aren't open yet.`). No form, no link, no ink.

### Inline Code
Mono at 0.92em on `sunken`, 1px 5px padding, 4px radius.

## Do's and Don'ts

### Do:
- **Do** pair every severity ink with its glyph and label word (see The Severity Pairing Rule).
- **Do** cite every key point and breaking change with a `release-notes:N` or `N-M` pointer that highlights exactly those lines in the source view.
- **Do** set grammar, numbers and line references in Fragment Mono with tabular numerals, and explanations in Hanken Grotesk.
- **Do** replace a caret row with an in-quote 2px `breaking` underline wherever the quote would wrap, not only at 640px and below.
- **Do** keep the caret-draw as the single motion moment, with an immediate fallback under reduced motion.
- **Do** define both themes for every colour role. Dark is the default.
- **Do** mark release significance with the neutral SVG shape glyphs (see The Neutral Significance Rule).
- **Do** give navigational links their grammar: a faint `-->` arrow and a cyan dashed-underline label.
- **Do** keep neutral row verdicts (`note:`, `pending:`) and dashboard counts in `text-muted`, with no ink.
- **Do** write counts in words beside every bar, using the list's own vocabulary, with a legend that repeats the shape glyphs.
- **Do** shorten verdict copy until it fits on one line at the 1040px container, and set the claim inline-block so it wraps as a unit (see The One-Line Verdict Rule).
- **Do** disable a Follow toggle at the limit with `aria-disabled`, keep it focusable, and describe it by the `note:` line that explains the limit.
- **Do** drop the top bar's slot to a 40px strip under the bar at 640px and below, with the same links in the same order (see The No Dead End Rule).

### Don't:
- **Don't** use hue for anything but severity. There are no brand accents or decorative colour.
- **Don't** add shadows or extra raised surfaces. Depth is `sunken` / `ground` / one `raised`.
- **Don't** wrap diagnostics in cards or badges. Structure comes from gutters and grammar.
- **Don't** colour `note:` or non-error status lines. They stay `text-muted`.
- **Don't** give significance (featured, notable, digest, preview) a severity ink, and don't let a bar carry meaning without its counts in words.
- **Don't** shrink the verdict scale to fit longer copy.
- **Don't** hide navigation at a breakpoint, and don't put it behind a drawer or a hamburger. Narrow screens get the same links, on a second row.
- **Don't** make a breadcrumb step a link for some viewers and plain text for others. The step follows the hierarchy, and sign-in handles the rest.
