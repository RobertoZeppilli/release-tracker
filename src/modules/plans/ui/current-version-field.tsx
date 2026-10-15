"use client";

import { useState } from "react";
import { SkeletonBox } from "@/components/waiting";
import { useSession } from "@/modules/auth/ui";
import { compareVersions, parseVersion } from "@/modules/releases";
import {
  invalidMessage,
  isoDate,
  PANEL_CELL_CLASS,
  PANEL_ROW_CLASS,
  PanelNoteRow,
  SeverityLabel,
  VERSION_BUTTON_CLASS,
  VERSION_INPUT_CLASS,
} from "@/modules/releases/ui";
import type { Decline } from "../domain/current-version";
import { useFollows } from "./follows-provider";

const FIELD_ID = "current-version";
const NOTE_ID = "current-version-note";

// The database is the authority on a declaration, as it is on a follow: these two checks only spare
// a round trip, and the same two rules are enforced there (see the `current_version` migration).
function problemWith(version: string, latest: string | null): Decline | null {
  const parsed = parseVersion(version);
  if (!parsed) return "malformed";
  if (!latest) return "noStable";
  const top = parseVersion(latest);
  return top && compareVersions(parsed, top) > 0 ? "notOlder" : null;
}

function message(decline: Decline, version: string, latest: string | null): string {
  if (decline === "denied") return "The version in use was not saved. Try again.";
  return invalidMessage(decline, version, latest);
}

// The row is there only for a Developer who follows this Technology, a retired one included, and
// only once the follows have answered: until then `isFollowing` is false for every Technology, which
// is not a first state but no state at all (see `TechnologyFollow`). **A Visitor still gets nothing
// reserved**, and that half of the old decision stands: for them the row never arrives, and a hole
// kept open for the commonest reader of the page is worse than the row landing when it is known.
// What changed on 2026-10-14 is the other half: a Developer whose follows have not answered now sees
// the wait rather than nothing, because for them the row is coming (DESIGN.md, The Reserved Space
// Rule, and The Waiting Rule).
export function CurrentVersionField({ technologyId, name, latest }: { technologyId: string; name: string; latest: string | null }) {
  const session = useSession();
  const follows = useFollows();
  if (session.state !== "developer") return null;
  if (!follows.known) {
    return (
      // The row is a grid the width of the panel, so the skeleton takes the width too and the
      // height of the field inside it. The day of a declaration is not reserved: it only exists once
      // there is a declaration to date.
      <SkeletonBox className="h-[34px] w-full rounded-md" />
    );
  }
  if (!follows.isFollowing(technologyId)) return null;
  return <DeclarationRow technologyId={technologyId} name={name} latest={latest} />;
}

// Where a Developer declares the Version they are on, the first row of the Upgrade Panel, right
// above the start of the path it feeds. The day of the declaration is always under it: the app never
// checks it, so a reader has to be able to see how old it is. Clearing it is one press, because a
// declaration nobody keeps up is worse than none (CONTEXT.md, Versione in uso).
function DeclarationRow({ technologyId, name, latest }: { technologyId: string; name: string; latest: string | null }) {
  const follows = useFollows();
  const declared = follows.currentVersionOf(technologyId);
  const busy = follows.isDeclaring(technologyId);
  // What the field holds once it has been touched; until then it shows the declaration itself.
  const [typed, setTyped] = useState<string | null>(null);
  const [refused, setRefused] = useState<Decline | null>(null);
  const value = typed ?? declared?.version ?? "";
  const decline = refused ?? follows.declineOn(technologyId);

  function save(): void {
    // A leading `v` is accepted here too, exactly as the Upgrade Path accepts it.
    const version = value.trim().replace(/^v(?=\d)/, "");
    const problem = problemWith(version, latest);
    setTyped(version);
    setRefused(problem);
    if (!problem) follows.declare(technologyId, version);
  }

  function clear(): void {
    setTyped("");
    setRefused(null);
    follows.declare(technologyId, null);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy) save();
      }}
      aria-label={`Version of ${name} in use`}
      className="flex flex-col gap-2"
    >
      <div className={PANEL_ROW_CLASS}>
        <label htmlFor={FIELD_ID}>in use</label>
        <span className={PANEL_CELL_CLASS}>
          <input
            id={FIELD_ID}
            name="current-version"
            aria-label="Version in use"
            value={value}
            onChange={(event) => {
              setTyped(event.target.value);
              setRefused(null);
            }}
            autoComplete="off"
            spellCheck={false}
            placeholder={latest ?? ""}
            aria-invalid={decline ? true : undefined}
            aria-describedby={NOTE_ID}
            className={VERSION_INPUT_CLASS}
          />
          <button type="submit" disabled={busy} className={VERSION_BUTTON_CLASS}>
            Save
          </button>
          {declared && (
            <button type="button" disabled={busy} onClick={clear} className={VERSION_BUTTON_CLASS}>
              Clear
            </button>
          )}
        </span>
      </div>
      {/* One slot under the field, whatever it has to say: the day of the declaration, that there is
          none, or why the last one was refused. The path starts from this version, and the `from`
          row below shows it, so nothing has to say so in prose. */}
      <PanelNoteRow>
        {decline ? (
          <span id={NOTE_ID} className="text-breaking">
            <SeverityLabel tone="breaking" label="error:" /> {message(decline, value.trim(), latest)}
          </span>
        ) : declared ? (
          <span id={NOTE_ID} className="text-text-faint">
            declared {isoDate(declared.declaredAt)}
          </span>
        ) : (
          <span id={NOTE_ID} className="text-text-faint">
            not declared
          </span>
        )}
      </PanelNoteRow>
    </form>
  );
}
