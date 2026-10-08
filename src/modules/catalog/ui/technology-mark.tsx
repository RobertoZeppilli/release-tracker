import { TECHNOLOGY_MARKS } from "./technology-marks";

// DESIGN.md, Technology Mark: the brand's shape in the text's own ink, never its colour, and
// `aria-hidden` because the name beside it is already the accessible name. The box is rendered
// whether the mark exists or not, so every name on a list starts at the same x (The Reserved Space
// Rule): a Technology we have no shape for shows nothing and takes the same room.
export function TechnologyMark({ slug, size = 4 }: { slug: string; size?: 4 | 5 }) {
  const path = TECHNOLOGY_MARKS[slug];
  const box = size === 4 ? "size-4" : "size-5";

  return (
    <svg viewBox="0 0 24 24" className={`${box} flex-none`} aria-hidden>
      {path && <path d={path} fill="currentColor" />}
    </svg>
  );
}
