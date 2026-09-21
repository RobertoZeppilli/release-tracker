import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge must know the DESIGN.md scales, otherwise it treats `text-label` and
// `text-text-muted` as the same utility and drops one of them.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "verdict",
        "status",
        "headline",
        "summary-title",
        "title",
        "body",
        "diagnostic",
        "source",
        "label",
        "section-title",
        "meta",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
