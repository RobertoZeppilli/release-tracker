"use client";

import { useState } from "react";
import { compareVersions, parseVersion } from "@/modules/releases";
import {
  invalidMessage,
  isoDate,
  SeverityLabel,
  VERSION_BUTTON_CLASS,
  VERSION_INPUT_CLASS,
  VERSION_LABEL_CLASS,
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

// Where a Developer declares the Version they are on, right under the Follow that carries it. The
// day of the declaration is always on the line: the app never checks it, so a reader has to be able
// to see how old it is. Clearing it is one press, because a declaration nobody keeps up is worse
// than none (CONTEXT.md, Versione in uso).
export function CurrentVersionField({
  technologyId,
  name,
  latest,
  className,
}: {
  technologyId: string;
  name: string;
  latest: string | null;
  className?: string;
}) {
  const follows = useFollows();
  const declared = follows.currentVersionOf(technologyId);
  const busy = follows.isDeclaring(technologyId);
  // What the field holds once it has been touched; until then it shows the declaration itself, which
  // only arrives when the follows do.
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
      className={`flex flex-wrap items-center gap-3 font-mono text-diagnostic text-text-muted ${className ?? ""}`}
    >
      <label htmlFor={FIELD_ID} className={VERSION_LABEL_CLASS}>
        Version in use
      </label>
      <input
        id={FIELD_ID}
        name="current-version"
        value={value}
        onChange={(event) => {
          setTyped(event.target.value);
          setRefused(null);
        }}
        autoComplete="off"
        spellCheck={false}
        placeholder={latest ?? ""}
        aria-invalid={decline ? true : undefined}
        aria-describedby={decline || declared ? NOTE_ID : undefined}
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
      {decline ? (
        <p id={NOTE_ID} className="m-0 basis-full text-breaking">
          <SeverityLabel tone="breaking" label="error:" /> {message(decline, value.trim(), latest)}
        </p>
      ) : declared ? (
        <p id={NOTE_ID} className="m-0 basis-full">
          <SeverityLabel tone="muted" label="note:" /> declared on {isoDate(declared.declaredAt)}, and the upgrade path
          below starts from it.
        </p>
      ) : (
        <span className="text-text-faint">not declared</span>
      )}
    </form>
  );
}
