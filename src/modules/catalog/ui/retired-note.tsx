import { Info } from "lucide-react";

// A retired Technology keeps its pages online (ADR 0005); this note says why nothing new appears.
export function RetiredNote({ name, latest }: { name: string; latest: string | null }) {
  const readable = latest ? `Releases up to ${latest} stay readable` : "Its releases stay readable";
  return (
    <div role="note" className="mt-5 border-y border-rule py-3">
      <p className="text-text-muted">
        <span className="font-mono text-diagnostic">
          <Info aria-hidden className="mr-[0.35em] inline size-[0.95em] align-[-0.12em]" />
          note:
        </span>{" "}
        {name} is no longer tracked. {readable}, but new versions are not detected.
      </p>
    </div>
  );
}
