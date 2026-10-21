import { Fragment, type ReactNode } from "react";
import { messageParts } from "../domain/message";

// A translated sentence with elements in it: a link, a `code`, an emphasis. The dictionary holds the
// whole sentence with named gaps in it (`Signing in accepts the {terms}.`) and the component says
// what goes in each gap, so a language is free to put the link where its own grammar wants it.
// This is the other half of the rule in `message.ts`, that a message never carries a node: the node
// is named there and built here.
// ⚠️ No hook and no `use client`: it is rendered on both sides of the boundary, so it must compile
// into both graphs.
export function Filled({ text, nodes }: { text: string; nodes: Readonly<Record<string, ReactNode>> }) {
  return (
    <>
      {messageParts(text).map((piece, index) =>
        typeof piece === "string" ? (
          piece
        ) : (
          // The name itself where the component forgot to fill it, braces included: the same choice
          // `interpolate` makes, for the same reason, which is that a hole must be visible.
          <Fragment key={index}>{nodes[piece.placeholder] ?? `{${piece.placeholder}}`}</Fragment>
        ),
      )}
    </>
  );
}
