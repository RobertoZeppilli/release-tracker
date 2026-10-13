"use client";

import { ColumnTitle } from "@/components/column-title";
import { HelpPointer } from "@/components/help-pointer";
import { FREE_FOLLOW_LIMIT, freeFollowsLeft } from "../domain/follow-limit";
import type { PickerTechnology } from "../domain/picker";
import { useFollows } from "./follows-provider";
import { StackRow } from "./stack-row";

// DESIGN.md, Stack Column: the left half of `/technologies`, and the answer to *what is in my
// stack*. The panel names the column and counts the quota, then the list scrolls inside itself so
// the panel never leaves. The sticky column sits inside a plain grid item stretched to the row's
// height, because a sticky grid item is not clamped by its own grid area.
export function StackColumn({
  rows,
  retired,
}: {
  rows: PickerTechnology[];
  retired: PickerTechnology[];
}) {
  return (
    <div className="self-stretch">
      <section
        aria-labelledby="stack-title"
        className="flex flex-col min-[1041px]:sticky min-[1041px]:top-[72px] min-[1041px]:max-h-[calc(100vh-72px-var(--spacing-6))]"
      >
        <StackPanel />
        <div className="stack-scroll min-h-0 max-[1040px]:stack-scroll-off">
          {rows.length > 0 ? (
            // The list carries its own top rule, and gives it up when there is nothing under it:
            // a rule over nothing draws a list that is not there (DESIGN.md, Technologies States).
            <ul className="border-t border-rule-strong">
              {rows.map((technology) => (
                <StackRow key={technology.id} technology={technology} />
              ))}
            </ul>
          ) : (
            <p className="pt-3 font-mono text-label leading-[1.6] text-text-faint">
              nothing yet. follow something from the catalog and it lands here.
            </p>
          )}
          {retired.length > 0 && <RetiredGroup rows={retired} />}
        </div>
      </section>
    </div>
  );
}

// DESIGN.md, Stack Panel: the head of the column, on the one raised plane the system has, and the
// one place on this page the quota is counted. The bar gives its quota up here and the Catalog names
// the wall without a number, because this one figure used to be printed three times inside the first
// 60px of the page.
function StackPanel() {
  const { count } = useFollows();

  return (
    <div className="mb-5 rounded-md border border-rule bg-raised p-4">
      <ColumnTitle id="stack-title">what you follow, by name</ColumnTitle>
      {/* The figures are the announcement: a press moves a row and the focus follows it, which tells
          the eye, and this tells the ear. The Status-scale line that used to carry it is gone, and
          its job is not (DESIGN.md, Stack Panel). */}
      <dl
        aria-live="polite"
        className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 font-mono text-label leading-[1.6] text-text-faint"
      >
        <Figure label="followed" value={count} testId="follow-status" />
        <Figure label="left on your free plan" value={freeFollowsLeft(count)} />
      </dl>
      {/* The one hue this page may carry, and it is the system's own: the navigational `-->` and
          its `help` label, not an accent (DESIGN.md, The Severity-Only Colour Rule). The sentence
          that said the same thing had a destination in it and no way to go there. */}
      <p className="mt-3 border-t border-rule pt-3">
        <HelpPointer href="/dashboard">see them on your dashboard</HelpPointer>
      </p>
    </div>
  );
}

function Figure({ label, value, testId }: { label: string; value: number; testId?: string }) {
  return (
    <div className="col-span-2 grid grid-cols-subgrid">
      <dt>{label}</dt>
      {/* Right-aligned and tabular: the figures line up on their last digit, which is what makes a
          column of numbers readable without reading it. */}
      <dd className="m-0 text-right text-text tabular-nums" data-testid={testId}>
        {value}
      </dd>
    </div>
  );
}

// DESIGN.md, Retired, Still Yours: they close the left column, because being followed is the only
// reason they are shown at all. A retired Technology nobody follows is not in the Catalog, and it is
// in no sense something that could be added to a stack.
function RetiredGroup({ rows }: { rows: PickerTechnology[] }) {
  return (
    <section className="mt-5" aria-labelledby="retired-title">
      <ColumnTitle id="retired-title" className="mb-2">
        retired, still yours
      </ColumnTitle>
      <p className="mb-3 font-mono text-label leading-[1.6] text-text-faint">
        no longer in the catalog and getting no new releases. Past releases stay readable, they still
        count toward your {FREE_FOLLOW_LIMIT}, and once let go they can&apos;t be followed again.
      </p>
      <ul className="border-t border-rule">
        {rows.map((technology) => (
          <StackRow key={technology.id} technology={technology} retired />
        ))}
      </ul>
    </section>
  );
}
