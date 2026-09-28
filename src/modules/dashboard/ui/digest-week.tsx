"use client";

import { type ReactNode, useState } from "react";
import { WEEK_PARAM, withWeek } from "./week-param";

// The only piece of the Dashboard that lives in the browser: opening a week writes it in the URL
// with `replaceState`, so a reload or a shared link finds the same weeks open without adding a
// step to the back button.
export function DigestWeek({
  weekKey,
  open: initiallyOpen,
  summary,
  children,
}: {
  weekKey: string;
  open: boolean;
  summary: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initiallyOpen);

  function remember(next: boolean) {
    setOpen(next);
    const url = new URL(window.location.href);
    const value = withWeek(url.searchParams.getAll(WEEK_PARAM), weekKey, next);
    if (value === null) url.searchParams.delete(WEEK_PARAM);
    else url.searchParams.set(WEEK_PARAM, value);
    window.history.replaceState(null, "", url);
  }

  return (
    <details
      open={open}
      onToggle={(event) => {
        if (event.currentTarget.open !== open) remember(event.currentTarget.open);
      }}
      className="border-b border-rule"
    >
      <summary className="grid cursor-pointer list-none grid-cols-[14ch_minmax(0,1fr)_auto] items-center gap-x-4 py-2 font-mono text-diagnostic text-text-muted hover:text-text [&::-webkit-details-marker]:hidden max-[640px]:grid-cols-[auto_minmax(0,1fr)_auto]">
        {summary}
        <Chevron open={open} />
      </summary>
      {children}
    </details>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={`justify-self-end transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
