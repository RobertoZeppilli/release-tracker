import type { MessageKey } from "@/modules/i18n";

// The destinations of the footer, in the two groups DESIGN.md gives them. It lives beside
// `site-nav.ts` and stays separate from it: the bar carries the two places a Developer works in,
// the foot carries the five pages that say what the product is and who answers for it, and nothing
// is in both lists. The order inside a group is the order they are read in, not alphabetical.
// The titles and the labels are message keys: the foot is interface, so it is translated, while the
// pages it points at are documents and keep their own language.
export const FOOT = [
  {
    title: "shell.foot.product",
    links: [{ message: "shell.foot.faq", href: "/faq" }, { message: "shell.foot.contact", href: "/contact" }],
  },
  {
    title: "shell.foot.legal",
    links: [
      { message: "shell.foot.terms", href: "/terms" },
      { message: "shell.foot.privacy", href: "/privacy" },
      { message: "shell.foot.attributions", href: "/attributions" },
    ],
  },
] as const satisfies readonly { title: MessageKey; links: readonly { message: MessageKey; href: string }[] }[];
