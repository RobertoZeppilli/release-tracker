"use client";

import { useActionState } from "react";
import { useTranslator } from "@/modules/i18n/ui";
import { SeverityLabel } from "@/modules/releases/ui";
import type { NotificationChannel, NotificationEvent } from "../domain/events";
import type { SaveSwitch, SwitchSaved } from "../domain/saving";

// DESIGN.md, Select Many: the mark is typographic, `[ ]` and `[x]` in the page's own mono voice and
// not a checkbox the browser draws. Both states are two characters wide, so a press moves nothing
// beside it; the padding carries the 24px target (SC 2.5.8), not the glyph.
const MARK = "-m-1 shrink-0 rounded-[3px] p-1 font-mono text-body tabular-nums";

// One line of the Notifications section: what the event is, what happens when it is off, and the
// switch that saves it (issue #171). A row and not a bare switch, because the error has to appear
// next to the press it belongs to and a fragment inside the parent's flex would not lay out.
//
// ⚠️ A `form` around the mark, so the page works with JavaScript off: a Server Action posted by the
// browser is the same write, one page load slower. That is also why the state the press asks for
// travels in a hidden field instead of being "flip what you find" on the server.
export function PreferenceRow({
  event,
  channel,
  enabled,
  label,
  consequence,
  action,
}: {
  event: NotificationEvent;
  channel: NotificationChannel;
  // What the database holds for this pair, the declared starting point already applied.
  enabled: boolean;
  label: string;
  consequence: string;
  // The Server Action, handed down instead of imported (see `domain/saving`).
  action: SaveSwitch;
}) {
  const t = useTranslator();
  const [state, save, pending] = useActionState<SwitchSaved, FormData>(action, {
    status: "idle",
    enabled,
  });
  // Optimistic without `useOptimistic`: a press always asks for the other state, so while the write
  // is in flight the mark shows what the press asked for, and when it lands the mark shows what the
  // action returned. A refusal needs no revert, because the state never left the database's value.
  const shown = pending ? !state.enabled : state.enabled;
  const failed = state.status === "failed";
  const errorId = `${event}-${channel}-error`;

  return (
    <li className="border-t border-rule py-3 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        <form action={save}>
          <input type="hidden" name="event" value={event} />
          <input type="hidden" name="channel" value={channel} />
          <input type="hidden" name="enabled" value={shown ? "false" : "true"} />
          {/* The visible label is inside the accessible name (SC 2.5.3), and the state is not: it is
              `aria-checked`, and a name that said it too would have it read twice. */}
          <button
            type="submit"
            role="checkbox"
            aria-checked={shown}
            aria-label={t("settings.notifications.switch", { name: label })}
            aria-busy={pending || undefined}
            aria-describedby={failed ? errorId : undefined}
            className={`${MARK} ${shown ? "text-text" : "text-text-faint hover:text-text-muted"}`}
          >
            {shown ? "[x]" : "[ ]"}
          </button>
        </form>
        <div className="min-w-0">
          <p className="font-mono text-label text-text">{label}</p>
          <p className="mt-1 max-w-prose font-sans text-meta text-text-muted">{consequence}</p>
          {failed && (
            <p id={errorId} role="alert" className="mt-2 font-mono text-diagnostic text-breaking">
              <SeverityLabel tone="breaking" label="error:" />{" "}
              <span className="inline-block">{t("settings.notifications.error")}</span>
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
