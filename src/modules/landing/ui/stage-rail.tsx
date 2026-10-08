"use client";

import { useEffect, useState } from "react";

// DESIGN.md, The Bench: the rail is anchors, not tabs. All four stages are in the DOM, in reading
// order, at every width, and the rail only moves the reader. Saying which one is being read is the
// one thing it needs the client for, so without JavaScript it stays four working links.
export function StageRail({ stages }: { stages: readonly string[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries.find((entry) => entry.isIntersecting);
        if (seen) setCurrent(seen.target.id.replace("stage-", ""));
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const stage of stages) {
      const node = document.getElementById(`stage-${stage}`);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [stages]);

  return (
    <ul className="my-4 mb-6 flex flex-wrap gap-5 border-y border-rule py-2 font-mono text-label text-text-faint">
      {stages.map((stage) => (
        <li key={stage}>
          <a
            href={`#stage-${stage}`}
            aria-current={stage === current ? "true" : undefined}
            className={`no-underline hover:text-text ${stage === current ? "text-text" : ""}`}
          >
            {stage}
          </a>
        </li>
      ))}
    </ul>
  );
}
