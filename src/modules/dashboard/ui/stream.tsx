import type { Stream as StreamData } from "../domain/stream";
import { streamCount, streamTitle } from "./dashboard-copy";
import { ColumnTitle } from "@/components/column-title";
import { StreamEvent } from "./stream-event";
import { WeeklyDigest } from "./weekly-digest";

// The right half of the Dashboard: one stream in date order, no sections, the date the only
// ordering (CONTEXT.md, Flusso). Nothing here counts how far behind the reader is: that is the
// Standing's question, one column to the left (DESIGN.md, The Two Questions Rule).
export function Stream({ stream, openWeeks }: { stream: StreamData; openWeeks: readonly string[] }) {
  return (
    <section aria-labelledby="stream-title">
      <ColumnTitle id="stream-title" className="mb-4">
        {streamTitle()}
        <span>{streamCount(stream.total)}</span>
      </ColumnTitle>

      {stream.days.map((day, index) => (
        <div
          key={day.date}
          className={`grid grid-cols-[11ch_minmax(0,1fr)] gap-5 border-t py-5 max-[640px]:grid-cols-[minmax(0,1fr)] max-[640px]:gap-2 ${index === 0 ? "border-rule-strong" : "border-rule"}`}
        >
          {/* The date cell is the day's, so the This Week Mark stacks in it and marks the day
              instead of each Release of it (DESIGN.md, This Week Mark). */}
          <p className="pt-[3px] font-mono text-label text-text-faint tabular-nums max-[640px]:pt-0">
            <time dateTime={day.date}>{day.date}</time>
            {day.thisWeek && (
              <span className="block text-meta text-text-muted max-[640px]:ml-[1ch] max-[640px]:inline">
                this week
              </span>
            )}
          </p>
          <div>
            {day.rows.map((row) => (
              <StreamEvent key={`${row.release.slug} ${row.release.version}`} {...row} />
            ))}
          </div>
        </div>
      ))}

      <WeeklyDigest weeks={stream.digest} open={openWeeks} />
    </section>
  );
}
