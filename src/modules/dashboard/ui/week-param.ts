import { isoWeekKey, parseIsoWeekKey } from "../domain/iso-week";

// The open weeks of the Weekly Digest live in the URL, so a reload and a shared link show the same
// page. One parameter, comma separated: `?week=2024-W49,2024-W48`.
export const WEEK_PARAM = "week";

// Only real week keys survive the trip, deduplicated and in a stable order: what comes back is
// always a URL someone else can open.
export function readOpenWeeks(value: string | string[] | undefined): string[] {
  const raw = (Array.isArray(value) ? value : [value ?? ""]).flatMap((part) => part.split(","));
  const weeks = raw.flatMap((key) => {
    const week = parseIsoWeekKey(key.trim());
    return week ? [isoWeekKey(week)] : [];
  });
  return [...new Set(weeks)].sort().reverse();
}

// The value the parameter takes after a week is opened or closed, or null when no week is left
// open and the parameter has to disappear instead of staying empty.
export function withWeek(value: string | string[] | undefined, key: string, open: boolean): string | null {
  const weeks = new Set(readOpenWeeks(value));
  if (open) weeks.add(key);
  else weeks.delete(key);
  const next = readOpenWeeks([...weeks].join(","));
  return next.length > 0 ? next.join(",") : null;
}
