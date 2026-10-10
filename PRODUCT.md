# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, TypeScript strict, Supabase (Postgres, RLS, Auth), Tailwind CSS, shadcn/ui,
Lucide Icons, TanStack Query v5, Zod; compatible with React Compiler. Deployed on Vercel (Hobby).
Full rationale in `docs/DECISIONI.md` and `docs/adr/`.

## Users

- **Developer**: a signed-in software developer who follows the Technologies in their stack. The
  typical visit is a short periodic check (2–5 minutes, start of day or week) to learn whether
  anything important shipped and whether it requires action.
- **Visitor**: anyone reading public Technology and Release pages without signing in, usually
  arriving from search while evaluating a specific upgrade.

## Product Purpose

Track releases of languages, frameworks and libraries in a curated Catalog and turn their release
notes into structured Summaries, so a Developer understands what changed — and whether they must
act — before upgrading. Success: a Developer's periodic check answers "is there anything I need to
deal with?" in minutes, without reading raw changelogs.

## Positioning

"Understand before you upgrade." GitHub Watch, Dependabot/Renovate and newsletters tell you that a
release exists; this product tells you what it changes for you: breaking changes with migration
steps and an explicit Action required / Safe to upgrade verdict, generated once per Release and
grounded only in the release notes.

## Operating Context

- Periodic dashboard check across followed Technologies, split into two questions: the Standing,
  where each followed Technology stands by Distance, and the Stream, what came out in date order.
  Significance is a glyph on the row, not a section.
- Deep reading of a single Release page before an upgrade, often from search.
- Summaries may be pending for a few hours after a Release is detected; Releases are visible in
  every Summary state.

## Capabilities and Constraints

- Domain vocabulary is binding: see `CONTEXT.md` (English UI names table).
- Curated Catalog only; Free plan follows at most 10 Technologies; Pro is post-MVP.
- Summaries: title, 3–5 key points, breaking changes (what changes, how to migrate), Action
  required. Never invented when release notes lack information.
- Summary states: pending, processing, ready, unavailable, skipped, failed.
- Retired Technologies stay readable.
- Sign-in: GitHub only. UI and Summaries in English.
- Product name: **Verdict** (decided 2026-10-08). `release-tracker` is only the repository name.

## Brand Commitments

- **Name: Verdict.** Capitalised, never translated, never preceded by an article. The product's one
  job is to deliver a verdict on a Release, and the name says that job. Rationale and the rejected
  alternative are in `docs/DECISIONI.md`.
- **Wordmark: `verdict:`** set lowercase in Fragment Mono, colon included. The colon is the
  product's own grammar (`ok:`, `warning:`, `breaking[n]:`), and the space after it is where the
  answer goes.
- **No brand colour.** Hue means severity and nothing else (`DESIGN.md`, Severity-Only Colour Rule),
  so the mark is drawn in `text` on `ground` and never in a severity ink.
- **Voice: diagnostic, not promotional.** The product states what changed and whether action is
  required; it never reassures beyond the release notes.
- Palette, type and every component live in `DESIGN.md` under "Compiler Diagnostic".

## Evidence on Hand

No users, testimonials, metrics or customer logos exist. Do not fabricate any. Real release data
(e.g. React, Vite, TypeScript) is public and may be used as realistic sample content.

## Product Principles

1. Tell developers what to do, not just what happened: the Action required verdict leads.
2. Silence is a feature: patches, canaries and noise stay out of the way.
3. Never claim more than the release notes say; show uncertainty and missing Summaries honestly.
4. A periodic check must be fast: the important thing is findable in seconds.
5. Public pages are the product's front door and must stand alone without sign-in.

## Accessibility & Inclusion

WCAG 2.2 AA: sufficient contrast in dark (default) and light themes, visible focus, full keyboard
navigation, correct ARIA labelling.
