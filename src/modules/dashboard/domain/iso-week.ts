// ISO 8601 weeks, always in UTC: a week runs Monday to Sunday and belongs to the year of its
// Thursday, which is why the first days of January can belong to the year before.
export type IsoWeek = { year: number; week: number };

const DAY = 24 * 60 * 60 * 1000;

function midnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Monday is 1 and Sunday is 7, the ISO numbering, not the 0-6 of getUTCDay.
function isoDay(date: Date): number {
  return date.getUTCDay() === 0 ? 7 : date.getUTCDay();
}

function thursdayOf(date: Date): Date {
  const day = midnight(date);
  return new Date(day.getTime() + (4 - isoDay(day)) * DAY);
}

export function isoWeekOf(date: Date): IsoWeek {
  const thursday = thursdayOf(date);
  const year = thursday.getUTCFullYear();
  const firstThursday = thursdayOf(new Date(Date.UTC(year, 0, 4)));
  return { year, week: Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * DAY)) + 1 };
}

export function isoWeekKey({ year, week }: IsoWeek): string {
  return `${year}-W${String(week).padStart(2, "0")}`;
}

const KEY = /^(\d{4})-W(\d{2})$/;

// A week can only arrive from the URL, where anything can be written: a key that is not a week is
// no week at all, so a shared link can never open something that does not exist.
export function parseIsoWeekKey(key: string): IsoWeek | null {
  const match = KEY.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  return week >= 1 && week <= 53 ? { year, week } : null;
}

// Monday to Sunday, both at midnight: the Sunday is the day the label names, not the instant the
// week ends.
export function isoWeekRange(week: IsoWeek): { start: Date; end: Date } {
  const firstThursday = thursdayOf(new Date(Date.UTC(week.year, 0, 4)));
  const monday = new Date(firstThursday.getTime() + (week.week - 1) * 7 * DAY - 3 * DAY);
  return { start: monday, end: new Date(monday.getTime() + 6 * DAY) };
}
