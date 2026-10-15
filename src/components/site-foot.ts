// The destinations of the footer, in the two groups DESIGN.md gives them. It lives beside
// `site-nav.ts` and stays separate from it: the bar carries the two places a Developer works in,
// the foot carries the five pages that say what the product is and who answers for it, and nothing
// is in both lists. The order inside a group is the order they are read in, not alphabetical.
export const FOOT = [
  { title: "product", links: [{ label: "faq", href: "/faq" }, { label: "contact", href: "/contact" }] },
  {
    title: "legal",
    links: [
      { label: "terms", href: "/terms" },
      { label: "privacy", href: "/privacy" },
      { label: "attributions", href: "/attributions" },
    ],
  },
] as const;
