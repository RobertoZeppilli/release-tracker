// Release Notes that only point elsewhere cannot support a verdict (CONTEXT.md, Note giudicabili).
// The rule errs toward silence: a line that describes anything keeps the notes judgeable, so an
// unknown way of pointing reads as a description rather than muting an honest verdict.

// How much of the notes the rule ever needs. Longer notes describe something, so they are judgeable
// without being read, and the readers carry only this much instead of bodies up to 108k characters.
// The `release_notes.body_head` column stores `left(body, NOTES_HEAD_LENGTH + 1)`: one character
// over the cap is what tells a capped head from a whole one.
export const NOTES_HEAD_LENGTH = 400;

export type NotesHead = { head: string };

export function notesHead(body: string): NotesHead {
  return { head: body.slice(0, NOTES_HEAD_LENGTH + 1) };
}

// Read back from the stored `release_notes.body_head`, which the readers select instead of the body.
export function storedNotesHead(head: string | null | undefined): NotesHead | null {
  return head == null ? null : { head };
}

// A heading that names nothing: it carries no description even without a link under it.
const EMPTY_HEADING = [
  /^v?\d[\w.+-]*$/,
  /^release notes? for v?\d[\w.+-]*$/,
  /^(what's changed|commits?:?|changelog:?)$/,
];

// A line that points somewhere else. Each needs a link on the line: pointing requires a target, and
// that requirement is what keeps "see the new `--flag` option" a description.
const POINTER = [
  /^(diff|release note|announcement and changelog|full changelog:?|view changes on github)$/,
  /^(please )?(refer to|see|view|read)\b[a-z0-9 .,:;'’()/@+-]*$/,
];

const HASH = /^[0-9a-f]{7,40}( v?\d[\w.+-]*)?$/;

export function notesJudgeable(notes: NotesHead | null): boolean {
  if (notes === null) return false;
  if (notes.head.length > NOTES_HEAD_LENGTH) return true;
  return notes.head.split(/\r?\n/).some(describesSomething);
}

function describesSomething(line: string): boolean {
  const text = residue(line);
  if (text === "" || /^-{3,}$/.test(text) || HASH.test(text)) return false;
  if (EMPTY_HEADING.some((pattern) => pattern.test(text))) return false;
  return !(hasLink(line) && POINTER.some((pattern) => pattern.test(text)));
}

function hasLink(line: string): boolean {
  return /\]\([^)]*\)|https?:\/\//.test(line);
}

// What a line still says once its markup, its links and its decoration are gone. A markdown link
// keeps its text: the words a maintainer chose for the target are part of the sentence.
function residue(line: string): string {
  return line
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/^[\s>]*[-+*•]\s+/, "")
    .replace(/[*_`~#>|]/g, "")
    .replace(/[\p{Extended_Pictographic}️]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
